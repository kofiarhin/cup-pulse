const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");

const { createApp } = require("../app");

function createTestApp() {
  return createApp({
    config: {
      clientUrl: "http://localhost:5173",
      allowMockData: true,
    },
    readiness: () => ({ database: "disconnected" }),
  });
}

const collectionRoutes = [
  "/api/v1/competitions",
  "/api/v1/teams",
  "/api/v1/players",
  "/api/v1/fixtures",
  "/api/v1/matches",
  "/api/v1/matches/live",
  "/api/v1/standings",
  "/api/v1/venues",
];

test("every required collection endpoint returns a normalized envelope", async () => {
  const app = createTestApp();

  for (const route of collectionRoutes) {
    const response = await request(app).get(route).expect(200);

    assert.ok(Array.isArray(response.body.data), route);
    assert.equal(response.body.meta.source, "mock", route);
    assert.equal(typeof response.body.meta.stale, "boolean", route);
    assert.equal(typeof response.body.meta.generatedAt, "string", route);
  }
});

test("public records omit provider and fallback implementation fields", async () => {
  const app = createTestApp();
  const response = await request(app).get("/api/v1/teams").expect(200);

  assert.equal("providerId" in response.body.data[0], false);
  assert.equal("isFallback" in response.body.data[0], false);
});

test("list endpoints support bounded pagination and search", async () => {
  const app = createTestApp();
  const response = await request(app)
    .get("/api/v1/teams?search=Canada&page=1&limit=1")
    .expect(200);

  assert.equal(response.body.data.length, 1);
  assert.equal(response.body.data[0].name, "Canada");
  assert.deepEqual(response.body.pagination, {
    page: 1,
    limit: 1,
    total: 1,
    pages: 1,
  });
});

test("match and fixture filters are applied to normalized fields", async () => {
  const app = createTestApp();

  const scheduled = await request(app)
    .get("/api/v1/matches?status=scheduled&teamId=canada")
    .expect(200);
  assert.equal(scheduled.body.data.length, 1);

  const finished = await request(app)
    .get("/api/v1/matches?status=finished")
    .expect(200);
  assert.equal(finished.body.data.length, 0);

  const otherTeam = await request(app)
    .get("/api/v1/fixtures?teamId=united-states")
    .expect(200);
  assert.equal(otherTeam.body.data.length, 0);
});

test("invalid pagination returns the consistent validation error", async () => {
  const app = createTestApp();
  const response = await request(app)
    .get("/api/v1/players?page=0&limit=500")
    .expect(400);

  assert.equal(response.body.error.code, "INVALID_QUERY");
});

test("detail endpoints return normalized records", async () => {
  const app = createTestApp();

  const team = await request(app).get("/api/v1/teams/canada").expect(200);
  assert.equal(team.body.data.id, "canada");

  const player = await request(app)
    .get("/api/v1/players/alphonso-davies")
    .expect(200);
  assert.equal(player.body.data.teamId, "canada");

  const match = await request(app)
    .get("/api/v1/matches/development-fallback-match")
    .expect(200);
  assert.equal(match.body.data.competitionId, "fifa-world-cup-2026");
});

test("missing detail records return ENTITY_NOT_FOUND", async () => {
  const app = createTestApp();
  const response = await request(app)
    .get("/api/v1/teams/not-a-team")
    .expect(404);

  assert.deepEqual(response.body, {
    error: {
      code: "ENTITY_NOT_FOUND",
      message: "Team not found",
    },
  });
});

test("prediction and summary routes expose unavailable states consistently", async () => {
  const app = createTestApp();

  const prediction = await request(app)
    .get("/api/v1/predictions/development-fallback-match")
    .expect(200);
  assert.equal(prediction.body.data.matchId, "development-fallback-match");

  const summary = await request(app)
    .get("/api/v1/summaries/development-fallback-match")
    .expect(200);
  assert.equal(
    summary.body.data.message,
    "Match summary will be available after full time.",
  );
});

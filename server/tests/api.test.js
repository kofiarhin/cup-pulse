const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");

const { createApp } = require("../app");
const { models } = require("../models");

function createTestApp() {
  return createApp({
    config: {
      clientUrl: "http://localhost:5173",
      allowMockData: true,
    },
    readiness: () => ({ database: "disconnected" }),
  });
}

function createConnectedTestApp() {
  return createApp({
    config: {
      clientUrl: "http://localhost:5173",
      allowMockData: false,
    },
    readiness: () => ({ database: "connected" }),
  });
}

function createListModel(records) {
  return {
    find() {
      return {
        sort() {
          return this;
        },
        skip() {
          return this;
        },
        limit() {
          return this;
        },
        async lean() {
          return records;
        },
      };
    },
    async countDocuments() {
      return records.length;
    },
  };
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

test("fixture API populates home and away team names from cached teams", async () => {
  const originalFixtures = models.fixtures;
  const originalTeams = models.teams;
  models.fixtures = createListModel([
    {
      id: "fixture-200",
      competitionId: "fifa-world-cup-2026",
      status: "scheduled",
      startsAt: new Date("2026-06-20T19:00:00.000Z"),
      homeTeamId: "team-2447",
      awayTeamId: "team-1789",
      syncedAt: new Date("2026-06-01T00:00:00.000Z"),
      providerId: 200,
    },
  ]);
  models.teams = {
    find(filter) {
      assert.deepEqual(filter.id.$in.sort(), ["team-1789", "team-2447"]);
      return {
        async lean() {
          return [
            {
              id: "team-2447",
              name: "FC Copenhagen",
              crestUrl: "https://cdn.example/fck.png",
              providerId: 2447,
            },
            {
              id: "team-1789",
              name: "Brondby",
              crestUrl: "https://cdn.example/brondby.png",
              providerId: 1789,
            },
          ];
        },
      };
    },
  };

  try {
    const app = createConnectedTestApp();
    const response = await request(app)
      .get("/api/v1/fixtures?limit=4")
      .expect(200);

    assert.deepEqual(response.body.data[0].homeTeam, {
      id: "team-2447",
      name: "FC Copenhagen",
      logo: "https://cdn.example/fck.png",
    });
    assert.deepEqual(response.body.data[0].awayTeam, {
      id: "team-1789",
      name: "Brondby",
      logo: "https://cdn.example/brondby.png",
    });
    assert.equal("providerId" in response.body.data[0].homeTeam, false);
  } finally {
    models.fixtures = originalFixtures;
    models.teams = originalTeams;
  }
});

test("match detail API falls back to persisted team display fields", async () => {
  const originalMatches = models.matches;
  const originalTeams = models.teams;
  models.matches = {
    findOne(filter) {
      assert.deepEqual(filter, { id: "fixture-201" });
      return {
        async lean() {
          return {
            id: "fixture-201",
            fixtureId: "fixture-201",
            competitionId: "fifa-world-cup-2026",
            status: "scheduled",
            homeTeamId: "team-2905",
            awayTeamId: "team-1789",
            homeTeamName: "Seattle Sounders",
            awayTeamName: "Brondby",
            homeTeamLogo: "https://cdn.example/seattle.png",
            awayTeamLogo: "https://cdn.example/brondby.png",
            providerId: 201,
            syncedAt: new Date("2026-06-01T00:00:00.000Z"),
          };
        },
      };
    },
  };
  models.teams = {
    find() {
      return {
        async lean() {
          return [];
        },
      };
    },
  };

  try {
    const app = createConnectedTestApp();
    const response = await request(app)
      .get("/api/v1/matches/fixture-201")
      .expect(200);

    assert.deepEqual(response.body.data.homeTeam, {
      id: "team-2905",
      name: "Seattle Sounders",
      logo: "https://cdn.example/seattle.png",
    });
    assert.deepEqual(response.body.data.awayTeam, {
      id: "team-1789",
      name: "Brondby",
      logo: "https://cdn.example/brondby.png",
    });
    assert.equal("providerId" in response.body.data, false);
  } finally {
    models.matches = originalMatches;
    models.teams = originalTeams;
  }
});

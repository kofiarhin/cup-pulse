const test = require("node:test");
const assert = require("node:assert/strict");

const { createSportmonksClient } = require("../providers/sportmonks/client");
const {
  normalizeFixture,
  normalizePlayer,
  normalizeTeam,
} = require("../providers/sportmonks/normalizers");
const { createLockService } = require("../sync/lockService");
const { createSyncService } = require("../sync/syncService");
const { buildSchedule, isActiveMatchWindow } = require("../jobs/schedule");

test("Sportmonks client authenticates and follows pagination", async () => {
  const calls = [];
  const pages = [
    {
      data: [{ id: 1 }],
      pagination: { has_more: true, current_page: 1 },
    },
    {
      data: [{ id: 2 }],
      pagination: { has_more: false, current_page: 2 },
    },
  ];
  const fetchImpl = async (url) => {
    calls.push(new URL(url));
    return {
      ok: true,
      json: async () => pages[calls.length - 1],
    };
  };
  const client = createSportmonksClient({
    token: "test-token",
    fetchImpl,
    timeoutMs: 1000,
  });

  const records = await client.fetchAll("/fixtures", {
    include: "participants;venue",
  });

  assert.deepEqual(records, [{ id: 1 }, { id: 2 }]);
  assert.equal(calls[0].searchParams.get("api_token"), "test-token");
  assert.equal(calls[0].searchParams.get("include"), "participants;venue");
  assert.equal(calls[1].searchParams.get("page"), "2");
});

test("normalizers keep stable CupPulse ids and omit raw payloads", () => {
  const team = normalizeTeam({
    id: 42,
    name: "Canada",
    short_code: "CAN",
    country: { name: "Canada" },
    image_path: "https://cdn.example/canada.png",
  });
  const player = normalizePlayer({
    id: 7,
    display_name: "Alphonso Davies",
    position: { name: "Defender" },
    image_path: "https://cdn.example/davies.png",
  }, "team-canada");
  const normalizedFixture = normalizeFixture({
    id: 99,
    name: "Canada vs Mexico",
    starting_at: "2026-06-20 19:00:00",
    state: { short_name: "NS" },
    participants: [
      { id: 42, meta: { location: "home" } },
      { id: 43, meta: { location: "away" } },
    ],
  });

  assert.equal(team.id, "team-42");
  assert.equal(player.teamId, "team-canada");
  assert.equal(normalizedFixture.fixture.homeTeamId, "team-42");
  assert.equal("raw" in team, false);
});

test("fixture normalizer maps provider states and ISO timestamps", () => {
  const normalized = normalizeFixture({
    id: 100,
    starting_at: "2026-06-20T19:00:00.000Z",
    state: { short_name: "LIVE" },
    participants: [],
  });

  assert.equal(normalized.fixture.status, "live");
  assert.equal(
    normalized.fixture.startsAt.toISOString(),
    "2026-06-20T19:00:00.000Z",
  );
});

test("fixture normalizer converts provider score arrays to home and away totals", () => {
  const normalized = normalizeFixture({
    id: 101,
    starting_at: "2026-06-20T19:00:00.000Z",
    state: { short_name: "FT" },
    participants: [],
    scores: [
      {
        description: "CURRENT",
        score: { participant: "home", goals: 2 },
      },
      {
        description: "CURRENT",
        score: { participant: "away", goals: 1 },
      },
    ],
  });

  assert.deepEqual(normalized.match.score, { home: 2, away: 1 });
});

test("MongoDB lock service prevents duplicate active job claims", async () => {
  const active = new Map();
  const lockModel = {
    async findOneAndUpdate(filter, update) {
      const current = active.get(filter.key);
      if (current && current.expiresAt > filter.$or[0].expiresAt.$lte) {
        return null;
      }
      const lock = {
        key: filter.key,
        owner: update.$set.owner,
        expiresAt: update.$set.expiresAt,
      };
      active.set(filter.key, lock);
      return lock;
    },
    async deleteOne(filter) {
      const current = active.get(filter.key);
      if (current?.owner === filter.owner) {
        active.delete(filter.key);
      }
    },
  };
  const locks = createLockService({ lockModel, owner: "worker-a" });

  assert.ok(await locks.acquire("fixtures", 60_000));
  assert.equal(await locks.acquire("fixtures", 60_000), null);
  await locks.release("fixtures");
  assert.ok(await locks.acquire("fixtures", 60_000));
});

test("lock acquisition treats duplicate-key races as an active lock", async () => {
  const locks = createLockService({
    lockModel: {
      async findOneAndUpdate() {
        const error = new Error("duplicate key");
        error.code = 11000;
        throw error;
      },
      async deleteOne() {},
    },
  });

  assert.equal(await locks.acquire("fixtures", 60_000), null);
});

test("worker schedule uses configurable refresh intervals", () => {
  const schedule = buildSchedule({
    STATIC_REFRESH_INTERVAL_MS: "86400000",
    CORE_REFRESH_INTERVAL_MS: "21600000",
    FIXTURE_REFRESH_INTERVAL_MS: "1800000",
    MATCH_STATS_REFRESH_INTERVAL_MS: "900000",
  });

  assert.deepEqual(
    schedule.map(({ name, intervalMs }) => ({ name, intervalMs })),
    [
      { name: "static", intervalMs: 86_400_000 },
      { name: "core", intervalMs: 21_600_000 },
      { name: "fixtures", intervalMs: 1_800_000 },
      { name: "match-stats", intervalMs: 900_000 },
    ],
  );
});

test("match statistics refresh only runs around active match windows", () => {
  const now = new Date("2026-06-14T18:00:00.000Z");

  assert.equal(
    isActiveMatchWindow(
      [{ status: "scheduled", startsAt: "2026-06-14T19:30:00.000Z" }],
      now,
    ),
    true,
  );
  assert.equal(
    isActiveMatchWindow(
      [{ status: "scheduled", startsAt: "2026-06-16T19:30:00.000Z" }],
      now,
    ),
    false,
  );
  assert.equal(isActiveMatchWindow([{ status: "live" }], now), true);
});

test("fixture synchronization refreshes derived data for changed matches", async () => {
  const refreshCalls = [];
  const records = [];
  const model = {
    async bulkWrite(operations) {
      records.push(...operations);
    },
  };
  const syncState = {
    async findOneAndUpdate() {},
  };
  const sync = createSyncService({
    client: {
      async fetchAll() {
        return [
          {
            id: 99,
            starting_at: "2026-06-20T19:00:00.000Z",
            state: { short_name: "NS" },
            participants: [],
          },
        ];
      },
    },
    config: { sportmonksSeasonId: 2026 },
    models: {
      Competition: model,
      Fixture: model,
      Match: model,
      Player: model,
      Standing: model,
      SyncState: syncState,
      Team: model,
      Venue: model,
    },
    async refreshDerived(matchIds) {
      refreshCalls.push(matchIds);
    },
  });

  await sync.syncFixtures();

  assert.deepEqual(refreshCalls, [["fixture-99"]]);
  assert.equal(records.length, 2);
});

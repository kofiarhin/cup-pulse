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

const silentLogger = {
  info() {},
  error() {},
};

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
    logger: silentLogger,
  });

  const records = await client.fetchAll("/fixtures", {
    include: "participants;venue",
  });

  assert.deepEqual(records, [{ id: 1 }, { id: 2 }]);
  assert.equal(calls[0].searchParams.get("api_token"), "test-token");
  assert.equal(calls[0].searchParams.get("include"), "participants;venue");
  assert.equal(calls[1].searchParams.get("page"), "2");
});

test("Sportmonks client serializes fixture season filter without plural filters", async () => {
  const calls = [];
  const fetchImpl = async (url) => {
    calls.push(new URL(url));
    return {
      ok: true,
      json: async () => ({ data: [], pagination: { has_more: false } }),
    };
  };
  const client = createSportmonksClient({
    token: "test-token",
    fetchImpl,
    timeoutMs: 1000,
    logger: silentLogger,
  });

  await client.fetchAll("/fixtures", {
    filter: "fixtureSeasons:27897",
  });

  assert.equal(calls[0].searchParams.get("filter"), "fixtureSeasons:27897");
  assert.equal(calls[0].searchParams.has("filters"), false);
});

test("Sportmonks client logs sanitized request parameters without token", async () => {
  const logs = [];
  const fetchImpl = async () => ({
    ok: true,
    json: async () => ({ data: [], pagination: { has_more: false } }),
  });
  const client = createSportmonksClient({
    token: "secret-token",
    fetchImpl,
    timeoutMs: 1000,
    logger: {
      info(message, details) {
        logs.push({ message, details });
      },
    },
  });

  await client.fetchAll("/fixtures", {
    include: "participants;venue",
    filter: "fixtureSeasons:27897",
  });

  assert.equal(logs[0].message, "Sportmonks request");
  assert.equal(logs[0].details.endpoint, "/fixtures");
  assert.equal(logs[0].details.params.filter, "fixtureSeasons:27897");
  assert.equal(logs[0].details.params.api_token, undefined);
  assert.equal(JSON.stringify(logs).includes("secret-token"), false);
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

test("fixture normalizer extracts participant team names and logos", () => {
  const normalized = normalizeFixture({
    id: 102,
    starting_at: "2026-06-20T19:00:00.000Z",
    state: { short_name: "NS" },
    participants: [
      {
        id: 2447,
        name: "FC Copenhagen",
        image_path: "https://cdn.example/fck.png",
        meta: { location: "home" },
      },
      {
        id: 1789,
        name: "Brondby",
        image_path: "https://cdn.example/brondby.png",
        meta: { location: "away" },
      },
    ],
  }, "fifa-world-cup-2026");

  assert.equal(normalized.fixture.homeTeamId, "team-2447");
  assert.equal(normalized.fixture.homeTeamName, "FC Copenhagen");
  assert.equal(normalized.fixture.homeTeamLogo, "https://cdn.example/fck.png");
  assert.equal(normalized.match.awayTeamName, "Brondby");
  assert.equal(normalized.match.awayTeamLogo, "https://cdn.example/brondby.png");
  assert.deepEqual(
    normalized.teams.map(({ id, name, crestUrl }) => ({ id, name, crestUrl })),
    [
      {
        id: "team-2447",
        name: "FC Copenhagen",
        crestUrl: "https://cdn.example/fck.png",
      },
      {
        id: "team-1789",
        name: "Brondby",
        crestUrl: "https://cdn.example/brondby.png",
      },
    ],
  );
});

test("MongoDB lock service prevents duplicate active job claims", async () => {
  const active = new Map();
  const lockModel = {
    async findOneAndUpdate(filter, update) {
      const current = active.get(filter.key);
      if (current && current.expiresAt > filter.$or[0].expiresAt.$lte) {
        return null;
      }
      assert.equal(update.$set.id, filter.key);
      const lock = {
        id: update.$set.id,
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
  const fetchCalls = [];
  const syncStateUpdates = [];
  const model = {
    async bulkWrite(operations) {
      records.push(...operations);
    },
  };
  const syncState = {
    async findOneAndUpdate(filter, update) {
      syncStateUpdates.push({ filter, update });
    },
  };
  const sync = createSyncService({
    client: {
      async fetchAll(path, parameters) {
        fetchCalls.push({ path, parameters });
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
    logger: silentLogger,
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

  assert.equal(fetchCalls[0].path, "/fixtures");
  assert.equal(fetchCalls[0].parameters.filter, "fixtureSeasons:2026");
  assert.equal("filters" in fetchCalls[0].parameters, false);
  assert.equal(syncStateUpdates[0].update.$set.id, "fixtures");
  assert.equal(syncStateUpdates[1].update.$set.id, "fixtures");
  assert.deepEqual(refreshCalls, [["fixture-99"]]);
  assert.equal(records.length, 2);
});

test("core synchronization hydrates players that only have ids and position data", async () => {
  const fetchCalls = [];
  const playerWrites = [];
  const teamWrites = [];
  const standingWrites = [];
  const sync = createSyncService({
    client: {
      async fetchAll(path, parameters) {
        fetchCalls.push({ path, parameters });
        if (path === "/teams/seasons/27897") {
          return [
            {
              id: 284,
              name: "Canada",
              players: [
                {
                  id: 77,
                  position: { name: "Forward" },
                  statistics: {},
                },
              ],
            },
          ];
        }
        if (path === "/standings/seasons/27897") {
          return [];
        }
        throw new Error(`Unexpected fetchAll path: ${path}`);
      },
      async fetchOne(path, parameters) {
        fetchCalls.push({ path, parameters });
        assert.equal(path, "/players/77");
        return {
          id: 77,
          display_name: "Hydrated Player",
          position: { name: "Forward" },
        };
      },
    },
    config: { sportmonksSeasonId: 27897 },
    logger: silentLogger,
    models: {
      Competition: {},
      Fixture: {},
      Match: {},
      Player: { async bulkWrite(operations) { playerWrites.push(...operations); } },
      Standing: { async bulkWrite(operations) { standingWrites.push(...operations); } },
      SyncState: { async findOneAndUpdate() {} },
      Team: { async bulkWrite(operations) { teamWrites.push(...operations); } },
      Venue: {},
    },
    async refreshDerived() {},
  });

  await sync.syncCore();

  assert.ok(fetchCalls.find((call) => call.path === "/players/77"));
  assert.equal(
    fetchCalls.find((call) => call.path === "/players/77").parameters.include,
    "position;detailedPosition",
  );
  assert.equal(playerWrites[0].updateOne.update.$set.name, "Hydrated Player");
  assert.equal(teamWrites[0].updateOne.update.$set.name, "Canada");
  assert.equal(standingWrites.length, 0);
});

test("fixture synchronization logs full failure messages", async () => {
  const logs = [];
  const sync = createSyncService({
    client: {
      async fetchAll() {
        throw new Error("Sportmonks fixture request failed with status 400");
      },
    },
    config: { sportmonksSeasonId: 27897 },
    logger: {
      info() {},
      error(message, details) {
        logs.push({ message, details });
      },
    },
    models: {
      Competition: {},
      Fixture: {},
      Match: {},
      Player: {},
      Standing: {},
      SyncState: { async findOneAndUpdate() {} },
      Team: {},
      Venue: {},
    },
  });

  await assert.rejects(() => sync.syncFixtures(), /status 400/);

  assert.deepEqual(logs, [
    {
      message: "Fixture sync failed",
      details: {
        job: "fixtures",
        error: "Sportmonks fixture request failed with status 400",
      },
    },
  ]);
});

test("fixture synchronization logs start, fetched count, and upsert counts", async () => {
  const logs = [];
  const model = {
    async bulkWrite(operations) {
      return { upsertedCount: operations.length };
    },
  };
  const sync = createSyncService({
    client: {
      async fetchAll() {
        return [
          {
            id: 100,
            starting_at: "2026-06-20T19:00:00.000Z",
            state: { short_name: "NS" },
            participants: [],
          },
          {
            id: 101,
            starting_at: "2026-06-21T19:00:00.000Z",
            state: { short_name: "NS" },
            participants: [],
          },
        ];
      },
    },
    config: { sportmonksSeasonId: 27897 },
    logger: {
      info(message, details) {
        logs.push({ level: "info", message, details });
      },
      error(message, details) {
        logs.push({ level: "error", message, details });
      },
    },
    models: {
      Competition: model,
      Fixture: model,
      Match: model,
      Player: model,
      Standing: model,
      SyncState: { async findOneAndUpdate() {} },
      Team: model,
      Venue: model,
    },
    async refreshDerived() {},
  });

  await sync.syncFixtures();

  assert.ok(logs.find((log) => log.message === "Fixture sync started"));
  assert.deepEqual(
    logs.find((log) => log.message === "Fixture sync fetched fixtures")
      .details,
    { job: "fixtures", count: 2 },
  );
  assert.deepEqual(
    logs.find((log) => log.message === "Fixture sync upserted records")
      .details,
    { job: "fixtures", fixtures: 2, matches: 2 },
  );
});

test("fixture synchronization upserts participant teams and logs team counts", async () => {
  const logs = [];
  const fixtureWrites = [];
  const matchWrites = [];
  const teamWrites = [];
  const sync = createSyncService({
    client: {
      async fetchAll() {
        return [
          {
            id: 200,
            starting_at: "2026-06-20T19:00:00.000Z",
            state: { short_name: "NS" },
            participants: [
              {
                id: 2447,
                name: "FC Copenhagen",
                image_path: "https://cdn.example/fck.png",
                meta: { location: "home" },
              },
              {
                id: 1789,
                name: "Brondby",
                image_path: "https://cdn.example/brondby.png",
                meta: { location: "away" },
              },
            ],
          },
        ];
      },
    },
    config: { sportmonksSeasonId: 27897 },
    logger: {
      info(message, details) {
        logs.push({ message, details });
      },
      error() {},
    },
    models: {
      Competition: {},
      Fixture: { async bulkWrite(operations) { fixtureWrites.push(...operations); } },
      Match: { async bulkWrite(operations) { matchWrites.push(...operations); } },
      Player: {},
      Standing: {},
      SyncState: { async findOneAndUpdate() {} },
      Team: { async bulkWrite(operations) { teamWrites.push(...operations); } },
      Venue: {},
    },
    async refreshDerived() {},
  });

  await sync.syncFixtures();

  assert.equal(fixtureWrites[0].updateOne.update.$set.homeTeamName, "FC Copenhagen");
  assert.equal(matchWrites[0].updateOne.update.$set.awayTeamLogo, "https://cdn.example/brondby.png");
  assert.deepEqual(
    teamWrites.map((operation) => operation.updateOne.update.$set.name),
    ["FC Copenhagen", "Brondby"],
  );
  assert.deepEqual(
    logs.find((log) => log.message === "Fixture sync extracted teams").details,
    { job: "fixtures", teams: 2 },
  );
  assert.deepEqual(
    logs.find((log) => log.message === "Fixture sync upserted teams").details,
    { job: "fixtures", teams: 2 },
  );
});

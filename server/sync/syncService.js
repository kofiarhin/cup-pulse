const defaultModels = require("../models");
const {
  normalizeFixture,
  normalizePlayer,
  normalizeStanding,
  normalizeTeam,
  normalizeVenue,
} = require("../providers/sportmonks/normalizers");

async function upsertMany(model, records) {
  if (records.length === 0) return 0;
  await model.bulkWrite(
    records.map((record) => ({
      updateOne: {
        filter: { id: record.id },
        update: { $set: record },
        upsert: true,
      },
    })),
    { ordered: false },
  );
  return records.length;
}

function createLogger(logger) {
  return {
    info:
      typeof logger.info === "function" ? logger.info.bind(logger) : () => {},
    error:
      typeof logger.error === "function" ? logger.error.bind(logger) : () => {},
  };
}

function syncStateUpdate(job, fields) {
  return {
    $set: {
      id: job,
      job,
      ...fields,
    },
  };
}

function fixtureInclude(detailed) {
  if (detailed) {
    return "participants;venue;state;stage;group;scores;events;statistics;lineups;sidelined;xGFixture";
  }
  return "participants;venue;state;stage;group;scores";
}

function createSyncService({
  client,
  config,
  refreshDerived = async () => {},
  logger = console,
  models = defaultModels,
}) {
  const {
    Competition,
    Fixture,
    Match,
    Player,
    Standing,
    SyncState,
    Team,
    Venue,
  } = models;
  const competitionId = "fifa-world-cup-2026";
  const log = createLogger(logger);

  function logFixtureFailure(job, error) {
    if (job === "fixtures" || job === "match-stats") {
      log.error("Fixture sync failed", {
        job,
        error: error.message,
      });
    }
  }

  async function track(job, operation) {
    await SyncState.findOneAndUpdate(
      { job },
      syncStateUpdate(job, {
        status: "running",
        lastStartedAt: new Date(),
      }),
      { upsert: true },
    );
    try {
      const result = await operation();
      await SyncState.findOneAndUpdate(
        { job },
        syncStateUpdate(job, {
          status: "succeeded",
          lastSucceededAt: new Date(),
          lastError: null,
        }),
      );
      return result;
    } catch (error) {
      logFixtureFailure(job, error);
      await SyncState.findOneAndUpdate(
        { job },
        syncStateUpdate(job, {
          status: "failed",
          lastFailedAt: new Date(),
          lastError: error.message,
        }),
      );
      throw error;
    }
  }

  async function fetchFixtures(job, detailed) {
    log.info("Fixture sync started", {
      job,
      seasonId: config.sportmonksSeasonId,
    });
    const fixtures = await client.fetchAll("/fixtures", {
      include: fixtureInclude(detailed),
      filter: `fixtureSeasons:${config.sportmonksSeasonId}`,
    });
    log.info("Fixture sync fetched fixtures", {
      job,
      count: fixtures.length,
    });
    return fixtures;
  }

  async function upsertFixturesAndMatches(job, normalized) {
    const fixturesUpserted = await upsertMany(
      Fixture,
      normalized.map((item) => item.fixture),
    );
    const matchesUpserted = await upsertMany(
      Match,
      normalized.map((item) => item.match),
    );
    log.info("Fixture sync upserted records", {
      job,
      fixtures: fixturesUpserted,
      matches: matchesUpserted,
    });
  }

  async function syncStatic() {
    return track("static", async () => {
      const league = await client.fetchOne(
        `/leagues/${config.sportmonksLeagueId}`,
        { include: "seasons" },
      );
      await Competition.findOneAndUpdate(
        { id: competitionId },
        {
          $set: {
            id: competitionId,
            providerId: league.id,
            name: league.name || "FIFA World Cup 2026",
            season: "2026",
            status: "scheduled",
            stages: [],
            source: "cached",
            providerUpdatedAt: league.updated_at,
            syncedAt: new Date(),
          },
        },
        { upsert: true },
      );
      const venues = await client.fetchAll("/venues");
      await upsertMany(Venue, venues.map(normalizeVenue));
    });
  }

  async function syncCore() {
    return track("core", async () => {
      const teams = await client.fetchAll(
        `/teams/seasons/${config.sportmonksSeasonId}`,
        { include: "country;venue;players;sidelined;statistics" },
      );
      await upsertMany(
        Team,
        teams.map((team) => normalizeTeam(team, competitionId)),
      );
      await upsertMany(
        Player,
        teams.flatMap((team) =>
          (team.players || []).map((player) =>
            normalizePlayer(player, `team-${team.id}`),
          ),
        ),
      );
      const standings = await client.fetchAll(
        `/standings/seasons/${config.sportmonksSeasonId}`,
        { include: "participant;group;details" },
      );
      await upsertMany(
        Standing,
        standings.map((item) => normalizeStanding(item, competitionId)),
      );
      await refreshDerived();
    });
  }

  async function syncFixtures({ detailed = false } = {}) {
    const job = detailed ? "match-stats" : "fixtures";
    return track(job, async () => {
      const fixtures = await fetchFixtures(job, detailed);
      const normalized = fixtures.map((fixture) =>
        normalizeFixture(fixture, competitionId),
      );
      await upsertFixturesAndMatches(job, normalized);
      await refreshDerived(normalized.map((item) => item.match.id));
    });
  }

  return { syncCore, syncFixtures, syncStatic };
}

module.exports = { createSyncService };

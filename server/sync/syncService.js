const defaultModels = require("../models");
const {
  normalizeFixture,
  normalizePlayer,
  normalizeStanding,
  normalizeTeam,
  normalizeVenue,
} = require("../providers/sportmonks/normalizers");

async function upsertMany(model, records) {
  if (records.length === 0) return;
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
}

function createSyncService({
  client,
  config,
  refreshDerived = async () => {},
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

  async function track(job, operation) {
    await SyncState.findOneAndUpdate(
      { job },
      { $set: { job, status: "running", lastStartedAt: new Date() } },
      { upsert: true },
    );
    try {
      const result = await operation();
      await SyncState.findOneAndUpdate(
        { job },
        {
          $set: {
            status: "succeeded",
            lastSucceededAt: new Date(),
            lastError: null,
          },
        },
      );
      return result;
    } catch (error) {
      await SyncState.findOneAndUpdate(
        { job },
        {
          $set: {
            status: "failed",
            lastFailedAt: new Date(),
            lastError: error.message,
          },
        },
      );
      throw error;
    }
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
      const include = detailed
        ? "participants;venue;state;stage;group;scores;events;statistics;lineups;sidelined;xGFixture"
        : "participants;venue;state;stage;group;scores";
      const fixtures = await client.fetchAll("/fixtures", {
        include,
        filters: `fixtureSeasons:${config.sportmonksSeasonId}`,
      });
      const normalized = fixtures.map((fixture) =>
        normalizeFixture(fixture, competitionId),
      );
      await upsertMany(Fixture, normalized.map((item) => item.fixture));
      await upsertMany(Match, normalized.map((item) => item.match));
      await refreshDerived(normalized.map((item) => item.match.id));
    });
  }

  return { syncCore, syncFixtures, syncStatic };
}

module.exports = { createSyncService, upsertMany };

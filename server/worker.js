require("dotenv").config();

const { connectDatabase, disconnectDatabase } = require("./config/database");
const { loadConfig } = require("./config/env");
const {
  buildSchedule,
  isActiveMatchWindow,
  startSchedule,
} = require("./jobs/schedule");
const {
  JobLock,
  Match,
  Player,
  Prediction,
  Standing,
  Summary,
  Team,
} = require("./models");
const { createSportmonksClient } = require("./providers/sportmonks/client");
const {
  createMongoDerivedContextLoader,
} = require("./services/derived/mongoContextLoader");
const {
  createDerivedRefreshService,
} = require("./services/derived/refreshService");
const { createDerivedService } = require("./services/derived/service");
const { generatePrediction } = require("./services/predictions/engine");
const { generateMatchSummary } = require("./services/summaries/engine");
const { createLockService } = require("./sync/lockService");
const { createSyncService } = require("./sync/syncService");

async function startWorker() {
  const config = loadConfig();
  if (!config.mongodbUri) {
    throw new Error("MongoDB connection is required for the worker");
  }
  if (!config.hasSportmonksToken) {
    throw new Error("SPORTMONKS_API_TOKEN is required for the worker");
  }
  if (!config.sportmonksLeagueId || !config.sportmonksSeasonId) {
    throw new Error(
      "SPORTMONKS_LEAGUE_ID and SPORTMONKS_SEASON_ID are required for the worker",
    );
  }

  await connectDatabase(config.mongodbUri);
  const client = createSportmonksClient({
    token: config.sportmonksApiToken,
    baseUrl: config.sportmonksBaseUrl,
    timeoutMs: config.sportmonksTimeoutMs,
  });
  const contextLoader = createMongoDerivedContextLoader({
    matchModel: Match,
    teamModel: Team,
    playerModel: Player,
    standingModel: Standing,
  });
  const derivedService = createDerivedService({
    predictionModel: Prediction,
    summaryModel: Summary,
    predictionGenerator: generatePrediction,
    summaryGenerator: generateMatchSummary,
  });
  const refreshDerived = createDerivedRefreshService({
    ...contextLoader,
    derivedService,
  });
  const sync = createSyncService({ client, config, refreshDerived });
  const locks = createLockService({ lockModel: JobLock });
  const jobs = {
    static: () =>
      locks.withLock("static", config.jobLockTtlMs, sync.syncStatic),
    core: () => locks.withLock("core", config.jobLockTtlMs, sync.syncCore),
    fixtures: () =>
      locks.withLock("fixtures", config.jobLockTtlMs, () =>
        sync.syncFixtures(),
      ),
    "match-stats": async () => {
      const windowStart = new Date(Date.now() - 4 * 60 * 60 * 1000);
      const windowEnd = new Date(Date.now() + 3 * 60 * 60 * 1000);
      const matches = await Match.find({
        $or: [
          { status: { $in: ["live", "inplay", "ht", "et", "break"] } },
          { startsAt: { $gte: windowStart, $lte: windowEnd } },
        ],
      })
        .select({ status: 1, startsAt: 1 })
        .lean();
      if (!isActiveMatchWindow(matches)) {
        return { skipped: true, reason: "outside-active-match-window" };
      }
      return locks.withLock("match-stats", config.jobLockTtlMs, () =>
        sync.syncFixtures({ detailed: true }),
      );
    },
  };
  const stopSchedule = startSchedule({
    schedule: buildSchedule(process.env),
    jobs,
  });

  async function shutdown(signal) {
    console.log(`Worker received ${signal}; shutting down`);
    stopSchedule();
    await disconnectDatabase();
    process.exit(0);
  }
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));

  console.log("CupPulse Sportmonks worker started");
  return { jobs, stopSchedule };
}

if (require.main === module) {
  startWorker().catch((error) => {
    console.error("CupPulse worker failed to start:", error.message);
    process.exit(1);
  });
}

module.exports = { startWorker };

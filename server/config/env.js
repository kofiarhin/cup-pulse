const REQUIRED_PRODUCTION_VARIABLES = ["MONGODB_URI", "CLIENT_URL"];

function parseBoolean(value, fallback = false) {
  if (value === undefined) {
    return fallback;
  }

  return String(value).toLowerCase() === "true";
}

function parsePositiveInteger(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function loadConfig(environment = process.env) {
  const nodeEnv = environment.NODE_ENV || "development";
  const missing =
    nodeEnv === "production"
      ? REQUIRED_PRODUCTION_VARIABLES.filter(
          (name) => !environment[name] || !environment[name].trim(),
        )
      : [];

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`,
    );
  }

  const sportmonksApiToken = environment.SPORTMONKS_API_TOKEN || "";
  const config = {
    nodeEnv,
    isProduction: nodeEnv === "production",
    isTest: nodeEnv === "test",
    port: parsePositiveInteger(environment.PORT, 5000),
    clientUrl: environment.CLIENT_URL || "http://localhost:5173",
    mongodbUri: environment.MONGODB_URI || "",
    sportmonksApiToken,
    sportmonksBaseUrl:
      environment.SPORTMONKS_BASE_URL ||
      "https://api.sportmonks.com/v3/football",
    sportmonksLeagueId: environment.SPORTMONKS_LEAGUE_ID || "",
    sportmonksSeasonId: environment.SPORTMONKS_SEASON_ID || "",
    sportmonksTimeoutMs: parsePositiveInteger(
      environment.SPORTMONKS_TIMEOUT_MS,
      15_000,
    ),
    jobLockTtlMs: parsePositiveInteger(environment.JOB_LOCK_TTL_MS, 840_000),
    hasSportmonksToken: Boolean(sportmonksApiToken),
    allowMockData:
      nodeEnv !== "production"
        ? parseBoolean(environment.ALLOW_MOCK_DATA, true)
        : parseBoolean(environment.ALLOW_MOCK_DATA, false),
  };

  config.public = Object.freeze({
    nodeEnv: config.nodeEnv,
    hasSportmonksToken: config.hasSportmonksToken,
    allowMockData: config.allowMockData,
  });

  return Object.freeze(config);
}

module.exports = {
  loadConfig,
};

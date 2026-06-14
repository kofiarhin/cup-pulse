require("dotenv").config();
const { createApp } = require("./app");
const { loadConfig } = require("./config/env");
const {
  connectDatabase,
  disconnectDatabase,
  getDatabaseStatus,
} = require("./config/database");

async function startServer() {
  const config = loadConfig();

  if (config.mongodbUri) {
    await connectDatabase(config.mongodbUri);
  } else if (config.isProduction) {
    throw new Error("MongoDB connection is required in production");
  }

  const app = createApp({
    config,
    readiness: () => ({ database: getDatabaseStatus() }),
  });
  const server = app.listen(config.port, () => {
    console.log(`CupPulse API listening on port ${config.port}`);
  });

  async function shutdown(signal) {
    console.log(`Received ${signal}; shutting down`);
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
  }

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));

  return server;
}

if (require.main === module) {
  startServer().catch((error) => {
    console.error("CupPulse API failed to start:", error.message);
    process.exit(1);
  });
}

module.exports = {
  startServer,
};

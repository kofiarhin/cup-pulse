const express = require("express");
const cors = require("cors");
const { errorHandler, routeNotFound } = require("./middleware/errors");
const { createApiRouter } = require("./routes/api");
const { createDataService } = require("./services/dataService");
const { createAdminRouter, createPublicContentRouter } = require("./routes/admin");

function createApp({
  config = { clientUrl: "http://localhost:5173" },
  readiness = () => ({ database: "disconnected" }),
} = {}) {
  const app = express();

  app.disable("x-powered-by");
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || origin === config.clientUrl) {
          return callback(null, true);
        }

        const error = new Error("Origin is not allowed");
        error.status = 403;
        error.code = "ORIGIN_NOT_ALLOWED";
        return callback(error);
      },
    }),
  );
  app.use(express.json({ limit: "1mb" }));

  app.get("/", (req, res) => {
    return res.json({
      data: {
        name: "CupPulse API",
        version: "v1",
      },
      meta: {
        source: "live",
      },
    });
  });

  app.get("/health", (req, res) => {
    return res.status(200).json({
      data: {
        status: "ok",
        service: "cup-pulse-api",
      },
      meta: {
        source: "live",
      },
    });
  });

  app.get("/ready", (req, res) => {
    const details = readiness();
    const ready = details.database === "connected";

    if (!ready) {
      return res.status(503).json({
        error: {
          code: "SERVICE_NOT_READY",
          message: "Service is not ready",
          details,
        },
      });
    }

    return res.status(200).json({
      data: {
        status: "ready",
        ...details,
      },
      meta: {
        source: "live",
      },
    });
  });

  const dataService = createDataService({
    allowMockData: config.allowMockData,
    databaseStatus: () => readiness().database,
  });
  app.use("/api/v1", createPublicContentRouter({
    readiness,
    allowMockData: config.allowMockData,
  }));
  app.use("/api/v1/admin", createAdminRouter({ config, readiness }));
  app.use("/api/v1", createApiRouter(dataService));

  app.use(routeNotFound);
  app.use(errorHandler);

  return app;
}

module.exports = {
  createApp,
};

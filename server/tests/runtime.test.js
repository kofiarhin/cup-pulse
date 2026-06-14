const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");

const { createApp } = require("../app");
const { loadConfig } = require("../config/env");

test("GET /health returns a normalized liveness response", async () => {
  const app = createApp({
    config: { clientUrl: "http://localhost:5173" },
    readiness: () => ({ database: "connected" }),
  });

  const response = await request(app).get("/health").expect(200);

  assert.deepEqual(response.body, {
    data: {
      status: "ok",
      service: "cup-pulse-api",
    },
    meta: {
      source: "live",
    },
  });
});

test("GET /ready reports database readiness", async () => {
  const app = createApp({
    config: { clientUrl: "http://localhost:5173" },
    readiness: () => ({ database: "disconnected" }),
  });

  const response = await request(app).get("/ready").expect(503);

  assert.equal(response.body.error.code, "SERVICE_NOT_READY");
  assert.equal(response.body.error.details.database, "disconnected");
});

test("unknown routes use the consistent API error shape", async () => {
  const app = createApp({
    config: { clientUrl: "http://localhost:5173" },
    readiness: () => ({ database: "connected" }),
  });

  const response = await request(app).get("/missing").expect(404);

  assert.deepEqual(response.body, {
    error: {
      code: "ROUTE_NOT_FOUND",
      message: "Route not found",
    },
  });
});

test("malformed JSON returns a client-safe validation error", async () => {
  const app = createApp({
    config: { clientUrl: "http://localhost:5173" },
    readiness: () => ({ database: "connected" }),
  });

  const response = await request(app)
    .post("/api/v1/anything")
    .set("Content-Type", "application/json")
    .send('{"broken":')
    .expect(400);

  assert.deepEqual(response.body, {
    error: {
      code: "INVALID_JSON",
      message: "Request body contains invalid JSON",
    },
  });
});

test("CORS allows the configured frontend origin", async () => {
  const app = createApp({
    config: { clientUrl: "https://cup-pulse.vercel.app" },
    readiness: () => ({ database: "connected" }),
  });

  const response = await request(app)
    .get("/health")
    .set("Origin", "https://cup-pulse.vercel.app")
    .expect(200);

  assert.equal(
    response.headers["access-control-allow-origin"],
    "https://cup-pulse.vercel.app",
  );
});

test("CORS rejects an untrusted browser origin", async () => {
  const app = createApp({
    config: { clientUrl: "https://cup-pulse.vercel.app" },
    readiness: () => ({ database: "connected" }),
  });

  const response = await request(app)
    .get("/health")
    .set("Origin", "https://malicious.example")
    .expect(403);

  assert.equal(response.body.error.code, "ORIGIN_NOT_ALLOWED");
});

test("production configuration requires MongoDB and client URL", () => {
  assert.throws(
    () =>
      loadConfig({
        NODE_ENV: "production",
        SPORTMONKS_API_TOKEN: "secret-token",
      }),
    /MONGODB_URI, CLIENT_URL/,
  );
});

test("configuration never exposes the Sportmonks token in public metadata", () => {
  const config = loadConfig({
    NODE_ENV: "test",
    SPORTMONKS_API_TOKEN: "secret-token",
    MONGODB_URI: "mongodb://localhost:27017/cup-pulse-test",
    CLIENT_URL: "http://localhost:5173",
    PORT: "5050",
  });

  assert.equal(config.port, 5050);
  assert.equal(config.hasSportmonksToken, true);
  assert.equal("sportmonksApiToken" in config.public, false);
});

test("production mock fallback is disabled unless explicitly enabled", () => {
  const base = {
    NODE_ENV: "production",
    MONGODB_URI: "mongodb://example.invalid/cup-pulse",
    CLIENT_URL: "https://cup-pulse.vercel.app",
  };

  assert.equal(loadConfig(base).allowMockData, false);
  assert.equal(
    loadConfig({ ...base, ALLOW_MOCK_DATA: "true" }).allowMockData,
    true,
  );
});

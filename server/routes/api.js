const express = require("express");

function asyncRoute(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

function createApiRouter(dataService) {
  const router = express.Router();

  const collections = [
    "competitions",
    "teams",
    "players",
    "fixtures",
    "matches",
    "standings",
    "venues",
  ];

  for (const collection of collections) {
    router.get(
      `/${collection}`,
      asyncRoute(async (req, res) => {
        const result = await dataService.list(collection, req.query);
        return res.json(result);
      }),
    );
  }

  router.get(
    "/matches/live",
    asyncRoute(async (req, res) => {
      const result = await dataService.list("matches", req.query, {
        status: "live",
      });
      return res.json(result);
    }),
  );

  const details = [
    ["teams", "Team"],
    ["players", "Player"],
    ["matches", "Match"],
  ];

  for (const [collection, label] of details) {
    router.get(
      `/${collection}/:id`,
      asyncRoute(async (req, res) => {
        const result = await dataService.detail(collection, req.params.id, label);
        return res.json(result);
      }),
    );
  }

  router.get(
    "/predictions/:matchId",
    asyncRoute(async (req, res) => {
      const result = await dataService.detail(
        "predictions",
        req.params.matchId,
        "Prediction",
        "matchId",
      );
      return res.json(result);
    }),
  );

  router.get(
    "/summaries/:matchId",
    asyncRoute(async (req, res) => {
      const result = await dataService.detail(
        "summaries",
        req.params.matchId,
        "Summary",
        "matchId",
      );
      return res.json(result);
    }),
  );

  return router;
}

module.exports = {
  createApiRouter,
};

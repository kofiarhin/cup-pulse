const express = require("express");
const packageJson = require("../../package.json");
const { Announcement, FeaturedContent, SyncState } = require("../models");
const { mockData } = require("../data/mockData");
const { createAdminAuth } = require("../middleware/adminAuth");

function asyncRoute(handler) { return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next); }
function clean(record) { const value = record?.toObject ? record.toObject() : record; if (!value) return value; const { _id, __v, providerId, ...rest } = value; return rest; }
function validateBody(body, featured = false) {
  if (!body.title || (!featured && !body.message) || (featured && !body.type)) {
    const error = new Error(featured ? "title and type are required" : "title and message are required");
    error.status = 400; error.code = "INVALID_ADMIN_CONTENT"; throw error;
  }
}
function activeWindow(now = new Date()) { return { active: true, $and: [{ $or: [{ startsAt: null }, { startsAt: { $exists: false } }, { startsAt: { $lte: now } }] }, { $or: [{ endsAt: null }, { endsAt: { $exists: false } }, { endsAt: { $gte: now } }] }] }; }
function createPublicContentRouter({ readiness = () => ({ database: "disconnected" }), allowMockData = false } = {}) {
  const router = express.Router();
  router.get("/announcements", asyncRoute(async (_req, res) => {
    const data = readiness().database === "connected"
      ? (await Announcement.find(activeWindow()).sort({ severity: -1, startsAt: -1 }).lean()).map(clean)
      : (allowMockData ? mockData.announcements || [] : []);
    res.json({ data, meta: { source: readiness().database === "connected" ? "cached" : "mock" } });
  }));
  router.get("/featured-content", asyncRoute(async (_req, res) => {
    const data = readiness().database === "connected"
      ? (await FeaturedContent.find(activeWindow()).sort({ priority: -1, startsAt: -1 }).lean()).map(clean)
      : (allowMockData ? mockData["featured-content"] || [] : []);
    res.json({ data, meta: { source: readiness().database === "connected" ? "cached" : "mock" } });
  }));
  return router;
}
function createAdminRouter({ config, readiness }) {
  const router = express.Router(); router.use(createAdminAuth(config));
  router.get("/health", asyncRoute(async (_req, res) => { const latestSync = await SyncState.findOne().sort({ updatedAt: -1 }).lean(); res.json({ data: { api: "ok", database: readiness().database, serverTime: new Date().toISOString(), version: packageJson.version, latestSync: clean(latestSync) } }); }));
  router.get("/sync", asyncRoute(async (_req, res) => res.json({ data: (await SyncState.find().sort({ job: 1 }).lean()).map(clean) })));
  for (const [path, Model, featured] of [["announcements", Announcement, false], ["featured-content", FeaturedContent, true]]) {
    router.get(`/${path}`, asyncRoute(async (_req, res) => res.json({ data: (await Model.find().sort(featured ? { priority: -1 } : { createdAt: -1 }).lean()).map(clean) })));
    router.post(`/${path}`, asyncRoute(async (req, res) => { validateBody(req.body, featured); const id = req.body.id || `${featured ? "featured" : "announcement"}-${Date.now()}`; const record = await Model.create({ ...req.body, id }); res.status(201).json({ data: clean(record) }); }));
    router.patch(`/${path}/:id`, asyncRoute(async (req, res) => { const record = await Model.findOneAndUpdate({ id: req.params.id }, { $set: req.body }, { new: true, runValidators: true }); if (!record) { const e = new Error("Admin content not found"); e.status=404; e.code="ENTITY_NOT_FOUND"; throw e; } res.json({ data: clean(record) }); }));
    router.delete(`/${path}/:id`, asyncRoute(async (req, res) => { const record = await Model.findOneAndDelete({ id: req.params.id }); if (!record) { const e = new Error("Admin content not found"); e.status=404; e.code="ENTITY_NOT_FOUND"; throw e; } res.status(204).end(); }));
  }
  return router;
}
module.exports = { activeWindow, createAdminRouter, createPublicContentRouter };

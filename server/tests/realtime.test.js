const test = require("node:test");
const assert = require("node:assert/strict");
const { createEventPayload } = require("../realtime/events");

test("realtime payloads are compact and invalidation friendly", () => {
  const payload = createEventPayload("matches:updated", {
    collection: "matches",
    ids: ["match-1"],
    scope: "live",
    emittedAt: "2026-06-14T00:00:00.000Z",
  });
  assert.deepEqual(payload, {
    type: "matches:updated",
    collection: "matches",
    ids: ["match-1"],
    scope: "live",
    emittedAt: "2026-06-14T00:00:00.000Z",
  });
});

test("unsupported realtime events are rejected", () => {
  assert.throws(() => createEventPayload("unknown:event"), /Unsupported/);
});

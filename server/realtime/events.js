const EVENT_NAMES = Object.freeze(["matches:updated", "match:updated", "standings:updated", "sync:updated"]);
function createEventPayload(eventName, payload = {}) { if (!EVENT_NAMES.includes(eventName)) throw new Error(`Unsupported realtime event: ${eventName}`); return { type: eventName, collection: payload.collection || eventName.split(":")[0], ids: Array.isArray(payload.ids) ? payload.ids : [], ...(payload.scope ? { scope: payload.scope } : {}), emittedAt: payload.emittedAt || new Date().toISOString() }; }
module.exports = { EVENT_NAMES, createEventPayload };

const { Server } = require("socket.io");
const { createEventPayload } = require("./events");
let io = null;
function createRealtimeServer(httpServer, config = {}) { io = new Server(httpServer, { cors: { origin: config.clientUrl, methods: ["GET", "POST"] } }); return io; }
function getRealtimeBus() { return io; }
function emitRealtimeEvent(eventName, payload) { const event = createEventPayload(eventName, payload); if (io) io.emit(eventName, event); return event; }
function resetRealtimeBus() { io = null; }
module.exports = { createRealtimeServer, emitRealtimeEvent, getRealtimeBus, resetRealtimeBus };

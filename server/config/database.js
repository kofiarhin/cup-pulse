const mongoose = require("mongoose");

async function connectDatabase(uri) {
  if (!uri) {
    return false;
  }

  await mongoose.connect(uri);
  return true;
}

async function disconnectDatabase() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}

function getDatabaseStatus() {
  const states = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };

  return states[mongoose.connection.readyState] || "unknown";
}

module.exports = {
  connectDatabase,
  disconnectDatabase,
  getDatabaseStatus,
};

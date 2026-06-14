const express = require("express");

const app = express();

app.get("/", async (req, res, next) => {
  return res.json({ message: "welcome to cup pulse" });
});

app.get("/health", (req, res) => {
  return res.status(200).json({
    status: "success",
    message: "server is healthy",
  });
});

app.use((req, res) => {
  return res.status(404).json({
    status: "fail",
    message: "route not found",
  });
});

module.exports = app;

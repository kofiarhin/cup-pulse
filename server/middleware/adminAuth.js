const crypto = require("crypto");

function safeEqual(left, right) {
  const a = Buffer.from(left || "");
  const b = Buffer.from(right || "");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function createAdminAuth(config = {}) {
  return (req, res, next) => {
    const configured = String(config.adminApiToken || "");
    const header = String(req.get("authorization") || "");
    const supplied = header.startsWith("Bearer ") ? header.slice(7) : "";
    if (!configured || !supplied || !safeEqual(configured, supplied)) {
      return res.status(401).json({ error: { code: "ADMIN_UNAUTHORIZED", message: "Valid admin authorization is required" } });
    }
    return next();
  };
}
module.exports = { createAdminAuth };

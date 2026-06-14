const crypto = require("node:crypto");

function createLockService({
  lockModel,
  owner = `${process.pid}-${crypto.randomUUID()}`,
  now = () => new Date(),
} = {}) {
  async function acquire(key, ttlMs) {
    const acquiredAt = now();
    const expiresAt = new Date(acquiredAt.getTime() + ttlMs);

    try {
      return await lockModel.findOneAndUpdate(
        {
          key,
          $or: [
            { expiresAt: { $lte: acquiredAt } },
            { expiresAt: { $exists: false } },
          ],
        },
        { $set: { key, owner, expiresAt } },
        { new: true, upsert: true },
      );
    } catch (error) {
      if (error.code === 11000) {
        return null;
      }
      throw error;
    }
  }

  async function release(key) {
    await lockModel.deleteOne({ key, owner });
  }

  async function withLock(key, ttlMs, operation) {
    const lock = await acquire(key, ttlMs);
    if (!lock) {
      return { skipped: true, reason: "lock-active" };
    }
    try {
      return await operation();
    } finally {
      await release(key);
    }
  }

  return { acquire, release, withLock };
}

module.exports = { createLockService };

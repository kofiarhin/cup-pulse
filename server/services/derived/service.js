const { fingerprint } = require("./fingerprint");

function createDerivedService({
  predictionModel,
  summaryModel,
  predictionGenerator,
  summaryGenerator,
}) {
  async function persist({
    model,
    matchId,
    source,
    generator,
    recordType,
  }) {
    const sourceFingerprint = fingerprint(source);
    const existing = await model.findOne({ matchId });
    if (existing?.sourceFingerprint === sourceFingerprint) {
      return { regenerated: false, record: existing };
    }

    const generated = generator(source);
    const record = {
      id: matchId,
      matchId,
      ...generated,
      sourceFingerprint,
      generatedAt: new Date(),
      source: "cached",
      syncedAt: new Date(),
      recordType,
    };
    const saved = await model.findOneAndUpdate(
      { matchId },
      { $set: record },
      { upsert: true, new: true },
    );
    return { regenerated: true, record: saved };
  }

  function persistPrediction(matchId, source) {
    return persist({
      model: predictionModel,
      matchId,
      source,
      generator: predictionGenerator,
      recordType: "prediction",
    });
  }

  function persistSummary(matchId, source) {
    return persist({
      model: summaryModel,
      matchId,
      source,
      generator: summaryGenerator,
      recordType: "summary",
    });
  }

  return {
    persistPrediction,
    persistSummary,
  };
}

module.exports = { createDerivedService };

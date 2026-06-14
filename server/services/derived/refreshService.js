function createDerivedRefreshService({
  loadMatchIds,
  loadMatchContext,
  derivedService,
}) {
  return async function refreshDerived(matchIds) {
    const ids = matchIds?.length ? [...new Set(matchIds)] : await loadMatchIds();
    let processed = 0;
    let skipped = 0;

    for (const matchId of ids) {
      const context = await loadMatchContext(matchId);
      if (!context) {
        skipped += 1;
        continue;
      }

      await derivedService.persistPrediction(matchId, context.prediction);
      await derivedService.persistSummary(matchId, context.summary);
      processed += 1;
    }

    return { processed, skipped };
  };
}

module.exports = { createDerivedRefreshService };

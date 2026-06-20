# Active Request: Player Hydration During Sync

Investigate and fix why player hydration is not occurring during sync.

Context:
- Core sync completes successfully.
- `/api/v1/players?teamId=team-284&limit=5` returns players with valid IDs, `name: null`, `position: null`, and empty statistics.
- Direct SportMonks sync logs show `/teams/seasons/27897` and `/standings/seasons/27897`.
- No `/players/{id}` requests appear in logs.
- `hydratePlayerProfile()` exists in `server/sync/syncService.js`.
- The sync loop calls `const hydrated = await hydratePlayerProfile(player);`
- Current behavior suggests hydration is being skipped because the code incorrectly believes players already contain display data.

Tasks:
1. Inspect `server/sync/syncService.js`.
2. Locate `playerHasDisplayData()`, `hydratePlayerProfile()`, and the sync loop that decides whether hydration should occur.
3. Determine why players that only contain IDs are being treated as already hydrated.
4. Update the hydration guard so a player is considered hydrated ONLY if a real display name exists.

Desired logic:

```js
function playerHasDisplayData(player) {
  return Boolean(
    player?.player?.display_name ||
    player?.player?.common_name ||
    player?.player?.name ||
    player?.display_name ||
    player?.common_name ||
    player?.name
  );
}
```

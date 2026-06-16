# Active Workflow Request

## Raw User Request

Fix CupPulse Sportmonks fixture sync.

Context:
- Sportmonks returns fixtures successfully with:
  GET https://api.sportmonks.com/v3/football/fixtures?filter=fixtureSeasons:27897&api_token=...
- The app API returns empty cached fixtures from MongoDB.
- Worker runs, MongoDB connects, but fixtures are not written.
- The correct Sportmonks query parameter is `filter`, singular, not `filters`.

Tasks:
1. Inspect `server/providers/sportmonks/client.js` and all sync code.
2. Fix the Sportmonks client so query params use `filter=fixtureSeasons:<seasonId>` when syncing fixtures.
3. Ensure `/fixtures` sync uses:
   filter: `fixtureSeasons:${config.sportmonksSeasonId}`
4. Add useful worker logs:
   - when fixture sync starts
   - Sportmonks endpoint/params used, excluding token
   - number of fixtures fetched
   - number of fixtures/matches upserted
   - sync failures with full error message
5. Ensure pagination still works with Sportmonks `next_page`/cursor if implemented.
6. Add or update tests for the client query serialization so `filter` is emitted and `filters` is not.
7. Do not commit `.env` or expose tokens.
8. After the fix, verify:
   npm test
   npm run worker
   curl http://localhost:5000/api/v1/fixtures?limit=4

Acceptance criteria:
- Worker fetches fixtures from Sportmonks using `filter=fixtureSeasons:27897`.
- MongoDB `fixtures` and `matches` collections are populated.
- `curl http://localhost:5000/api/v1/fixtures?limit=4` returns non-empty `data`.
- Frontend homepage shows upcoming fixtures.

## Normalized Workflow Request

Fix the backend Sportmonks fixture synchronization bug by changing fixture sync from the plural `filters` query parameter to the singular `filter` parameter, preserving pagination, adding token-safe worker/provider logs, and adding tests that prove fixture sync serializes `filter=fixtureSeasons:<seasonId>` without emitting `filters`. Verify with automated tests and, where credentials/services are available, run the worker and fixtures API smoke check.

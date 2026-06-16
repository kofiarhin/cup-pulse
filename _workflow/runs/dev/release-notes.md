# Release Notes

## Request

Fix Sportmonks fixture sync.

## User-Facing Changes

- Upcoming fixtures now populate from Sportmonks-backed MongoDB cache after worker sync.
- `/api/v1/fixtures?limit=4` returns non-empty fixture data after sync.

## Developer Changes

- Fixture sync now sends Sportmonks `filter=fixtureSeasons:<seasonId>` instead of `filters`.
- Sportmonks request logs show endpoint and sanitized params without `api_token`.
- Fixture sync logs start, fetched count, upsert counts, and full failure messages.
- Job locks and sync states now set stable `id` values to satisfy the shared model schema and avoid duplicate `id: null` failures.
- Tests cover query serialization, sync parameter usage, diagnostics, failure logging, and lock/sync-state IDs.

## New Routes/APIs

None.

## New Env Vars

None.

## Database/Schema Changes

No schema migration. Worker writes now include required `id` values for `joblocks` and `syncstates`.

## Dependencies Added/Removed

None.

## Test Commands Run

- `npm test`
- `npm test --prefix client`
- `node --check server/providers/sportmonks/client.js`
- `node --check server/sync/syncService.js`
- `node --check server/sync/lockService.js`
- `node --check server/tests/worker.test.js`
- `git diff --check`
- `npx fallow audit --format json --quiet --explain`

## Known Limitations

- Direct foreground `npm run worker` is a long-running worker process and hit the tool timeout; redirected logs verified the worker entrypoint and fixture sync.
- Inherited Sportmonks client request complexity remains for a future cleanup.

## Follow-Up Work

- Consider a dedicated one-shot worker command for operational smoke tests.
- Consider refactoring `server/providers/sportmonks/client.js` request internals separately.

## Suggested Commit Message

`fix: sync Sportmonks fixtures with singular filter`

# Release Notes: Player Hydration Guard Fix

## Request

Fix player hydration during core sync so unnamed roster player entries call `/players/{id}` before normalization.

## User-Facing Changes

- Player records populated by future core syncs can now receive real names from Sportmonks player detail profiles instead of remaining `name: null` when roster data only includes IDs and position metadata.

## Developer Changes

- `playerHasDisplayData()` now treats only `display_name`, `common_name`, and `name` as display data.
- Added backend sync regression coverage for ID-plus-position player hydration.

## New Routes/APIs

None.

## New Env Vars

None.

## Database/Schema Changes

None.

## Dependencies Added/Removed

None.

## Test Commands Run

- `npm test`
- `node --check server/sync/syncService.js`
- `node --check server/tests/worker.test.js`
- `git diff --check`
- Fallow audit command via `cmd` fallback.

## Known Limitations

- Existing cached player rows need a future core sync to be updated.
- Live Sportmonks credentialed sync was not run in this workflow.

## Follow-Up Work

- Consider batching or rate-limit-aware player hydration if provider volume becomes a sync-duration concern.

## Suggested Commit Message

`fix: hydrate unnamed players during core sync`

# Handoff: Player Hydration Guard Fix

Date: 2026-06-19
Run: `dev`
Status: Complete

## Request

Investigate and fix why player hydration is skipped during core sync when team roster player records contain IDs but no real display names.

## Completed Work

- Inspected `server/sync/syncService.js`.
- Located `playerHasDisplayData()`, `hydratePlayerProfile()`, and the `normalizeTeamPlayers()` sync loop.
- Confirmed the root cause: `playerHasDisplayData()` treated position metadata as display data.
- Added a backend regression test proving an ID-plus-position player triggers `/players/{id}` hydration.
- Updated the guard so only real name fields count as display data.
- Verified hydrated profile data is upserted with a real name.

## Source Files Changed

- `server/sync/syncService.js`
- `server/tests/worker.test.js`

## Workflow Artifacts

- `_workflow/runs/dev/request.md`
- `_workflow/runs/dev/spec.md`
- `_workflow/runs/dev/tasks.md`
- `_workflow/runs/dev/progress.md`
- `_workflow/runs/dev/review.md`
- `_workflow/runs/dev/verification.md`
- `_workflow/runs/dev/release-notes.md`
- `_workflow/runs/dev/summary.md`
- `.workflow/fallow-audit.md`

## Verification Status

- `npm test`: passed with 46 backend tests.
- `node --check server/sync/syncService.js`: passed.
- `node --check server/tests/worker.test.js`: passed.
- `git diff --check`: passed with line-ending warnings only.
- Fallow audit: PASSED.

## Acceptance Status

- [x] `playerHasDisplayData()` returns true only for display-name fields.
- [x] ID-plus-position roster player entries trigger `/players/{id}` hydration.
- [x] Hydrated profile data is merged before normalization and upsert.
- [x] Existing backend tests pass.

## Remaining Issues

- Existing cached player rows need the next core sync to refresh.
- Live Sportmonks credentialed sync was not run.

## Token / Resume State

- current phase: complete
- current task: none
- current iteration: none
- last completed safe checkpoint: workflow complete
- files already changed: source files and workflow artifacts listed above
- files planned next: none
- tests already run: `npm test`, syntax checks, `git diff --check`, Fallow audit
- exact next command/action: optional live worker core sync in configured environment
- safe to continue automatically: no further workflow work remains

## Suggested Commit

`fix: hydrate unnamed players during core sync`

# Review: Player Hydration Guard Fix

## Request

Fix skipped player hydration during core sync by treating players as hydrated only when a real display name exists.

## Spec And Task Plan

- Spec file used: `_workflow/runs/dev/spec.md`
- Task plan used: `_workflow/runs/dev/tasks.md`
- Tasks reviewed: TASK-001

## Findings

- No blocking bugs found.
- The root cause was confirmed: `playerHasDisplayData()` counted position fields as display data, so unnamed roster player wrappers could bypass `hydratePlayerProfile()`.
- The fix removes position and detailed-position fields from the display-data guard.
- The new regression test proves core sync calls `/players/77` for an ID-plus-position player and upserts the hydrated profile name.

## Iteration Evidence Reviewed

- Iteration 1 Build: Red test failed before implementation; Green backend tests passed after the guard fix.
- Iteration 2 Refine: Passing regression assertions cover provider path, include parameter, and upserted name.
- Iteration 3 Polish: Syntax checks, diff check, Fallow audit, and final diff audit completed.

## TDD Evidence

- Red: `npm test` failed because `/players/77` was not requested.
- Green: `npm test` passed with 46 tests after the guard update.
- Refactor: No source refactor required; syntax checks passed.

## Final Diff Audit

- `git diff --stat`: source changes are limited to `server/sync/syncService.js` and `server/tests/worker.test.js`, plus run workflow artifacts.
- `git diff`: matches the saved spec.
- Unrelated files touched: none in source.
- Tests added or updated: yes, backend sync regression added.
- Scope creep: none.
- Generated junk/temporary files: none.
- Sensitive values/secrets: none.
- `git diff --check`: passed with line-ending warnings only.

## Missing Tests

None blocking for this scope. A future enhancement could add isolated unit exports for `playerHasDisplayData()`, but the current behavior is proven through the public sync service path.

## Security And Architecture

- No credentials or raw Sportmonks payloads were exposed.
- No database schema, API route, frontend, or dependency changes were introduced.
- Fallow audit verdict: pass, with inherited non-blocking complexity findings in `server/sync/syncService.js`.

## Final Review Verdict

Passed.

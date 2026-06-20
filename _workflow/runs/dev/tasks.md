# Task Plan: Player Hydration Guard Fix

- Spec file used: `_workflow/runs/dev/spec.md`
- Planning date: 2026-06-19
- Approval: user explicitly approved spec with "approve spec"
- Progress and summary files read: `_workflow/runs/dev/progress.md`, `_workflow/runs/dev/handoff.md`, `_workflow/runs/dev/summary.md`
- Detailed spec sections used: 5 Current State Analysis, 6 Desired End State, 11 Affected Surfaces, 12 Dependency And Integration Map, 15 Execution Strategy, 16 Verification Strategy, 17 Acceptance Criteria, 18 Edge Cases And Failure Modes, 19 Risks And Mitigations, 22 Task Extraction Notes.

## TASK-001: Hydrate unnamed team roster players during core sync

- Task ID: TASK-001
- Status: Done
- Objective: Make core sync hydrate player entries that have provider IDs but no real display name, even when they include position metadata.
- Files affected:
  - `server/sync/syncService.js`
  - `server/tests/worker.test.js`
- Checklist:
  - [x] Add a failing backend sync test for an ID-plus-position player with no name.
  - [x] Update `playerHasDisplayData()` to check only display-name fields.
  - [x] Verify hydrated profile data is upserted.
  - [x] Run backend tests and syntax checks.
  - [x] Record all iteration evidence and acceptance.
- Test plan:
  - Red: `npm test` fails before the guard change because `/players/{id}` is not called.
  - Green: `npm test` passes after removing position fields from the display-data guard.
  - Refactor: Run syntax and diff checks for changed backend files.
- Verification commands:
  - `npm test`
  - `node --check server/sync/syncService.js`
  - `node --check server/tests/worker.test.js`
  - `git diff --check`
- Stop condition: Stop with Needs Human Review if the regression cannot be proven, backend tests fail for in-scope reasons that cannot be fixed safely, or verification cannot run.
- Out-of-scope items: API route changes, frontend changes, schema changes, live Sportmonks credentialed sync.

### Iteration 1 Build

- Goal: Prove the current guard skips hydration for ID-plus-position players, then make the smallest passing guard change.
- Changes made: Added `core synchronization hydrates players that only have ids and position data` in `server/tests/worker.test.js`; removed position-field checks from `playerHasDisplayData()`.
- Test plan: Add focused core-sync regression in `server/tests/worker.test.js`.
- Red phase evidence: `npm test` failed with `assert.ok(fetchCalls.find((call) => call.path === "/players/77"))`, proving `/players/77` was not requested.
- Green phase evidence: `npm test` passed with 46 backend tests after the guard became name-only.
- Refactor phase evidence: No behavior-preserving source refactor was needed; the predicate now matches the requested explicit logic.
- Test commands run: `npm test` before and after implementation.
- Verification command/result: `npm test` passed.
- Review findings: The change is scoped to the guard and does not alter API routes, schema, or provider authentication.
- Acceptance status: Complete.
- Remaining issues: None for build.
- Next action: Refinement verification.

### Iteration 2 Refine

- Goal: Confirm existing sync behavior remains stable and the new test proves hydrated upsert output.
- Changes made: No additional source changes; reviewed test assertions for provider path, include parameters, and upserted name.
- Test plan: Re-run backend tests and inspect regression coverage for over-scoped behavior.
- Red phase evidence: Covered by Iteration 1 Red; no additional failing test was needed because the refinement did not change behavior.
- Green phase evidence: The passing regression asserts `/players/77`, `include: "position;detailedPosition"`, and player upsert `name: "Hydrated Player"`.
- Refactor phase evidence: No further refactor required.
- Test commands run: `npm test`.
- Verification command/result: `npm test` passed with 46 tests.
- Review findings: Named-player skip behavior remains represented by the name-only predicate; no unnecessary hydration logic was added.
- Acceptance status: Complete.
- Remaining issues: None.
- Next action: Polish verification.

### Iteration 3 Polish

- Goal: Run syntax/diff checks and final task review.
- Changes made: Ran targeted syntax checks, diff check, final diff audit, and Fallow audit.
- Test plan: Syntax checks, backend tests, diff check, Fallow audit.
- Red phase evidence: Not applicable for syntax-only polish; behavior Red was captured in Iteration 1.
- Green phase evidence: Syntax checks passed; `git diff --check` passed with line-ending warnings only; Fallow verdict was `pass`.
- Refactor phase evidence: No further refactor required after review.
- Test commands run: `node --check server/sync/syncService.js`; `node --check server/tests/worker.test.js`; `git diff --check`; `npx fallow audit --format json --quiet --explain`.
- Verification command/result: Passed.
- Review findings: Final diff matches the saved spec; no token, `.env`, schema, route, or frontend changes were introduced.
- Acceptance status: Complete.
- Remaining issues: None blocking.
- Next action: Final artifacts.

## Acceptance Criteria

- [x] `playerHasDisplayData()` considers only `display_name`, `common_name`, and `name` on `player.player` or the wrapper.
- [x] Core sync calls `/players/{id}` for a player entry that has an ID and position metadata but no real name.
- [x] Hydrated profile data is merged before `normalizePlayer()` and the resulting upsert contains a real player name.
- [x] Existing backend tests pass.

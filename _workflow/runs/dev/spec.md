# Detailed Spec: Player Hydration Guard Fix

## 1. Metadata
- Spec filename: `_workflow/runs/dev/spec.md`
- Date: 2026-06-19
- Request ID / slug: player-hydration-guard-fix
- Request source: latest direct user prompt
- Execution mode: complete-workflow
- Request classification: backend sync bug fix
- Scope level: narrow
- Risk level: low to medium

## 2. Original Request
- Raw user request: Investigate and fix why player hydration is not occurring during sync; update the hydration guard so a player is considered hydrated only if a real display name exists.
- Normalized request: Change player sync hydration so roster entries with provider IDs but no display-name fields call `/players/{id}` before normalization, and prove the behavior with backend tests.
- Source prompt / `<artifact-root>/request.md` reference: `_workflow/runs/dev/request.md`

## 3. Questions And Answers
- Questions asked: none
- Answers received: Not applicable
- Questions skipped: local inspection answered the bug location and intended behavior
- Remaining open questions: none blocking

## 4. Problem Definition
- Problem being solved: Core sync stores players with valid IDs but missing names/statistics because profile hydration is skipped.
- Why it matters: Public player endpoints need real cached player names when Sportmonks exposes them through player detail records.
- Current pain point: `/api/v1/players?teamId=team-284&limit=5` returns null names and no `/players/{id}` requests appear in sync logs.
- Expected value: Core sync fetches profile data for player records that lack names, improving player API data after sync.

## 5. Current State Analysis
- Existing behavior: `hydratePlayerProfile()` returns the original player when `playerHasDisplayData(player)` is true.
- Existing architecture/components: `createSyncService()` fetches teams, normalizes teams, normalizes team players, and upserts players through Mongoose models.
- Existing files/modules likely involved: `server/sync/syncService.js`, `server/tests/worker.test.js`.
- Existing data flow: `/teams/seasons/{seasonId}` returns teams with `players`; `normalizeTeamPlayers()` hydrates each player when needed; `normalizePlayer()` maps profile/wrapper fields to cached player records.
- Existing API/UI/CLI/workflow behavior: API reads cached `Player` records; the worker writes them during sync.
- Existing tests or verification coverage: Backend sync tests exist in `server/tests/worker.test.js`; normalizer tests exist separately.

## 6. Desired End State
- Expected final behavior: `playerHasDisplayData()` only returns true for actual name fields on the profile or wrapper.
- User-facing outcome: Player API responses can contain names after a core sync when Sportmonks detail profiles provide them.
- Developer-facing outcome: A regression test catches future guard changes that treat position metadata as display data.
- System/workflow outcome: Core sync may emit `/players/{id}` provider requests for player entries without names.
- Backward compatibility expectations: Existing players that already contain names are not refetched unnecessarily; players without IDs remain unchanged.

## 7. Scope
- In scope: Backend sync guard update, focused backend regression test, relevant verification, workflow documentation.
- Out of scope: Database schema changes, API contract changes, frontend changes, provider credential setup, deployment.
- Non-goals: Optimizing hydration batching or adding caching/rate limiting.
- Explicit boundaries: Do not alter player normalization beyond what is necessary for the guard behavior.

## 8. Users And Use Cases
- Primary users: CupPulse readers browsing player lists and player detail pages.
- Secondary users: Developers/operators running the worker sync.
- Main use cases: Run core sync and populate cached player records with real names when roster data is sparse.
- Edge use cases: Player entry has ID but no name; player entry has position but no name; player entry has wrapper-level name; player entry has no ID.

## 9. Functional Requirements
- Required behaviors: Hydrate player profiles only when no real display name is present; preserve early return when a real display name exists; skip hydration when no provider ID exists.
- Inputs: Sportmonks team player wrapper objects and player profile objects.
- Outputs: Normalized player records with hydrated names when available.
- State changes: Cached `Player` documents may receive non-null names after sync.
- Error states: Failed profile fetch logs `Player profile hydration failed` and returns the original player.
- Permissions/auth expectations: Existing Sportmonks client authentication behavior is unchanged.

## 10. Non-Functional Requirements
- Performance expectations: Narrow change only; no new unbounded loops beyond existing per-player hydration loop.
- Reliability expectations: Profile fetch failures remain non-fatal for core sync.
- Security/privacy expectations: Do not log tokens or raw provider payloads.
- Accessibility expectations: Not applicable.
- Maintainability expectations: Keep predicate simple and aligned with the desired explicit logic.
- DX expectations: Regression test should clearly describe the ID-plus-position case.

## 11. Affected Surfaces
- Files likely affected: `server/sync/syncService.js`, `server/tests/worker.test.js`.
- Directories likely affected: `server/sync/`, `server/tests/`, `_workflow/runs/dev/`.
- UI surfaces: Not applicable.
- API routes: No route code changes; `/api/v1/players` output improves after sync.
- Components: Not applicable.
- Services: Sync service only.
- Database/schema: No schema change.
- Config/env vars: None.
- Tests: Backend worker/sync tests.
- Docs: Workflow artifacts only.
- Workflow artifacts: request, spec, tasks after approval, progress, handoff, review, verification, release notes, summary.

## 12. Dependency And Integration Map
- Internal dependencies: `normalizePlayer()` reads profile/wrapper name and position fields; `upsertMany()` persists normalized players.
- External packages/services: Sportmonks Football API v3 via existing client.
- Integration points: `client.fetchOne("/players/{id}", { include: "position;detailedPosition" })`.
- Ordering constraints: Write failing test first, update predicate, rerun backend tests.
- Migration/setup requirements: None.

## 13. Data And State Impact
- Data models: Existing `Player` model is unchanged.
- Database changes: No schema migration; subsequent sync updates cached records.
- State management changes: None.
- Cache/session/local storage impact: None.
- Backward compatibility impact: Existing API shape remains the same.

## 14. UX / API / Workflow Expectations
- UX expectations: Not applicable directly.
- API contract expectations: Same fields; `name` should be populated when source data exists after sync.
- CLI/workflow behavior: Worker core sync should request player details for unnamed player entries.
- Error handling expectations: Hydration errors stay logged and non-fatal.
- Empty/loading/success/failure states: Not applicable.

## 15. Execution Strategy
- Recommended implementation approach: Add a test that sets up `syncCore()` with a team player containing an ID and position metadata but no name, assert `/players/{id}` is fetched, and assert the upserted player name comes from the profile. Then remove position fields from `playerHasDisplayData()`.
- Suggested sequencing: Test Red, guard update Green, syntax/test verification, final review.
- Safe rollout/migration approach: Deploy code and rerun core sync.
- Files to inspect before editing: `server/sync/syncService.js`, `server/tests/worker.test.js`, `server/providers/sportmonks/normalizers.js`.
- Decisions to avoid until more evidence exists: Do not add batching/rate-limit logic as part of this narrow fix.

## 16. Verification Strategy
- Required automated checks: Targeted backend test command and full backend test command if feasible.
- Required manual checks: Inspect logged provider paths in test calls; no live credentialed Sportmonks call required.
- Test types needed: Unit/integration-style sync service test with mocked client/models.
- Build/lint/typecheck expectations: Node syntax check for changed backend files.
- Acceptance evidence required: Red failure before guard change when possible; Green pass after update; refactor pass.
- Proof of completion: Test output plus diff showing name-only guard.

## 17. Acceptance Criteria
- [ ] `playerHasDisplayData()` considers only `display_name`, `common_name`, and `name` on `player.player` or the wrapper.
- [ ] Core sync calls `/players/{id}` for a player entry that has an ID and position metadata but no real name.
- [ ] Hydrated profile data is merged before `normalizePlayer()` and the resulting upsert contains a real player name.
- [ ] Existing backend tests pass.

## 18. Edge Cases And Failure Modes
- Edge cases: Nested `player.player.name` exists; wrapper `name` exists; only `position.name` exists; no provider ID exists.
- Failure modes: Sportmonks profile endpoint fails; test model mocks miss required methods; increased live sync request volume.
- Regression risks: Accidentally hydrating already named players; accidentally losing position normalization.
- Recovery expectations: Keep existing catch/log/return-original hydration behavior.

## 19. Risks And Mitigations
- Technical risks: Additional player-detail calls may increase sync duration. Mitigation: restrict hydration only to unnamed players.
- Product/UX risks: No direct UI risk.
- Security risks: None expected; do not log secrets.
- Scope risks: Temptation to rework hydration batching. Mitigation: keep this as a guard-only fix.
- Mitigation plan: Focused test and no schema/API changes.

## 20. Assumptions
- Explicit assumptions: Position fields are not display data; Sportmonks detail profile has one of the recognized name fields when available.
- Confidence level: high
- What to revisit if assumptions are wrong: If detail profiles also omit names, player API null names may be provider-data availability rather than sync guard behavior.

## 21. Open Questions
- Blocking questions: none
- Non-blocking questions: Whether to add future batching/rate-limit protection for player hydration.
- Execution impact: None for this narrow fix.

## 22. Task Extraction Notes
- Suggested vertical task boundaries: One task: fix the player hydration display-data guard and prove sync hydration occurs.
- Suggested first task: `TASK-001: Hydrate unnamed team roster players during core sync`.
- Suggested task ordering: Single backend task, then final review/artifacts.
- Areas that should not become separate tasks: Frontend display, API route changes, schema changes.
- How the 3-pass Build -> Refine -> Polish loop should apply: Build adds failing regression and minimal guard fix; Refine covers named-player/no-ID behavior if needed; Polish runs syntax/full backend verification and review.

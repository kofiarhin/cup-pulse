# Detailed Spec: Fix Sportmonks Fixture Sync

## 1. Metadata
- Spec filename: `_workflow/runs/dev/spec.md`
- Date: 2026-06-16
- Request ID / slug: `fix-sportmonks-fixture-sync`
- Request source: latest direct user prompt
- Execution mode: `complete-workflow`
- Request classification: backend bug fix with worker/provider integration and tests
- Scope level: narrow
- Risk level: medium, because it touches production ingestion and may perform credentialed provider/database verification

## 2. Original Request
- Raw user request: fix CupPulse Sportmonks fixture sync where Sportmonks succeeds with `/fixtures?filter=fixtureSeasons:27897` but the app API returns empty cached fixtures because worker sync is not writing records.
- Normalized request: change fixture sync to use singular `filter`, preserve pagination, add token-safe logs, and prove query serialization in tests.
- Source prompt / `<artifact-root>/request.md` reference: `_workflow/runs/dev/request.md`

## 3. Questions And Answers
- Questions asked: none.
- Answers received: none.
- Questions skipped: blocking questions skipped because the prompt and repository inspection identify the exact bug, expected query parameter, affected files, verification commands, and acceptance criteria.
- Remaining open questions: whether local `.env` contains live Sportmonks and MongoDB credentials needed for `npm run worker` and non-empty API smoke verification.

## 4. Problem Definition
- Problem being solved: fixture sync sends an incorrect Sportmonks query parameter, so the worker can run against MongoDB without persisting expected fixtures.
- Why it matters: CupPulse depends on cached MongoDB fixtures for `/api/v1/fixtures` and the homepage upcoming-fixtures experience.
- Current pain point: Sportmonks has valid fixture data for season `27897`, but CupPulse cache reads are empty.
- Expected value: worker sync fetches the correct season fixtures, upserts fixtures and matches, and the API/frontend can show upcoming fixtures.

## 5. Current State Analysis
- Existing behavior: `server/sync/syncService.js` calls `client.fetchAll("/fixtures", { include, filters: "fixtureSeasons:<seasonId>" })`.
- Existing architecture/components: `server/providers/sportmonks/client.js` serializes arbitrary query params and handles page-number pagination through `pagination.has_more`; `server/sync/syncService.js` normalizes fixtures and upserts `Fixture` and `Match`.
- Existing files/modules likely involved: `server/providers/sportmonks/client.js`, `server/sync/syncService.js`, `server/worker.js`, `server/tests/worker.test.js`.
- Existing data flow: worker starts, creates Sportmonks client, schedules/locks fixture sync, fetches fixtures, normalizes fixtures into paired fixture/match records, bulk upserts both collections, and refreshes derived records.
- Existing API/UI/CLI/workflow behavior: public API reads cached MongoDB records and falls back only when configured; frontend homepage reads `/api/v1/fixtures`.
- Existing tests or verification coverage: backend tests already cover client authentication/page pagination and fixture sync upserts/derived refresh, but they do not assert singular `filter` query serialization or token-safe logging.

## 6. Desired End State
- Expected final behavior: fixture sync calls Sportmonks `/fixtures` with `filter=fixtureSeasons:${config.sportmonksSeasonId}` and does not emit `filters`.
- User-facing outcome: `/api/v1/fixtures?limit=4` returns fixture data after a successful credentialed worker sync, and the homepage can render upcoming fixtures.
- Developer-facing outcome: tests fail if fixture sync regresses to `filters`; logs show sync progress without exposing `api_token`.
- System/workflow outcome: MongoDB `fixtures` and `matches` collections are populated by the worker when provider credentials and DB are configured.
- Backward compatibility expectations: existing includes, normalizers, upsert shape, derived refresh behavior, lock behavior, and pagination behavior remain compatible.

## 7. Scope
- In scope: fixture sync query parameter fix, token-safe logging, focused tests, preservation or targeted extension of pagination behavior, and documented verification.
- Out of scope: changing public API contracts, frontend redesign, new Sportmonks endpoints, schema migrations, deployment, committing files, editing `.env`, or exposing tokens.
- Non-goals: refactor the ingestion architecture or replace the scheduler/lock system.
- Explicit boundaries: do not add credentials to source, logs, workflow artifacts, or tests.

## 8. Users And Use Cases
- Primary users: CupPulse visitors viewing upcoming World Cup fixtures.
- Secondary users: operators/developers running the worker and checking sync health.
- Main use cases: run worker sync, populate cached fixtures/matches, read fixtures from `/api/v1/fixtures`, and render homepage upcoming fixtures.
- Edge use cases: provider returns multiple pages, provider request fails, MongoDB write fails, worker starts without credentials, or local credentials are unavailable for smoke checks.

## 9. Functional Requirements
- Required behaviors:
  - Fixture sync must send `filter=fixtureSeasons:${config.sportmonksSeasonId}`.
  - Fixture sync must not send `filters`.
  - Logs must show fixture sync start, endpoint/params excluding token, fetched fixture count, upserted fixture/match counts, and full sync failure message.
  - Existing pagination must continue to fetch all pages.
  - Tests must assert query serialization for singular `filter`.
- Inputs: `SPORTMONKS_SEASON_ID`, existing includes, Sportmonks `/fixtures` payloads, MongoDB connection.
- Outputs: normalized fixture and match documents, safe console logs, passing tests.
- State changes: MongoDB `fixtures`, `matches`, `syncstates`, and derived records may update during worker verification.
- Error states: provider or database failures should update sync state as failed and log the full error message without token exposure.
- Permissions/auth expectations: Sportmonks token remains private; no `.env` commit.

## 10. Non-Functional Requirements
- Performance expectations: no extra provider calls beyond existing pagination and no unbounded logging.
- Reliability expectations: preserve retry behavior and sync-state tracking.
- Security/privacy expectations: exclude `api_token` and secrets from logs, tests, docs, and commits.
- Accessibility expectations: no direct frontend UI changes expected.
- Maintainability expectations: keep changes small and consistent with existing CommonJS backend style.
- DX expectations: logs should make fixture-sync diagnosis straightforward.

## 11. Affected Surfaces
- Files likely affected:
  - `server/sync/syncService.js`
  - `server/providers/sportmonks/client.js`
  - `server/tests/worker.test.js`
  - Workflow artifacts under `_workflow/runs/dev/`
- Directories likely affected: `server/sync`, `server/providers/sportmonks`, `server/tests`, `_workflow/runs/dev`.
- UI surfaces: homepage fixture display only through resulting cached data; no UI code expected.
- API routes: `/api/v1/fixtures` verification only; no route contract changes expected.
- Components: not applicable.
- Services: sync service and Sportmonks client.
- Database/schema: no schema changes; data population only.
- Config/env vars: existing `SPORTMONKS_SEASON_ID`; no new env vars expected.
- Tests: backend worker/provider tests.
- Docs: workflow artifacts; durable docs only if implementation reveals a lasting operational fact.
- Workflow artifacts: request, spec, tasks, progress, handoff, review, verification, release notes, summary, Fallow audit.

## 12. Dependency And Integration Map
- Internal dependencies: sync service depends on Sportmonks client, normalizers, Mongoose models, sync state, and derived refresh.
- External packages/services: Sportmonks Football API v3, MongoDB Atlas/local MongoDB, Node fetch, npm test runner.
- Integration points: worker scheduler/locks call `sync.syncFixtures()`, public API reads `Fixture` data, frontend uses API fixtures.
- Ordering constraints: add/adjust tests first, implement query/logging changes, run tests, then run credentialed worker/API smoke if environment permits.
- Migration/setup requirements: none.

## 13. Data And State Impact
- Data models: existing `Fixture` and `Match` models only.
- Database changes: upserted records may appear or update after worker verification.
- State management changes: sync state may record running/succeeded/failed with updated timestamps and errors.
- Cache/session/local storage impact: none.
- Backward compatibility impact: existing cached data remains valid.

## 14. UX / API / Workflow Expectations
- UX expectations: homepage upcoming fixtures should become non-empty after successful sync; no layout changes.
- API contract expectations: `/api/v1/fixtures?limit=4` returns the same normalized envelope with non-empty `data` when MongoDB has synced fixtures.
- CLI/workflow behavior: `npm test` should pass; `npm run worker` should log useful fixture-sync details when the fixture job runs.
- Error handling expectations: failures log full error message and update sync state; token remains hidden.
- Empty/loading/success/failure states: existing frontend/API states remain unchanged.

## 15. Execution Strategy
- Recommended implementation approach:
  - Add or update tests in `server/tests/worker.test.js` to prove fixture sync passes `filter`, not `filters`, to the client and/or serialized URL.
  - Change `syncFixtures` to use `filter`.
  - Add a token-safe request log hook or client-side request log that reports endpoint and non-token params.
  - Add fixture sync logs around start, fetched count, upsert counts, and failure messages.
  - Preserve current page-number pagination; if Sportmonks cursor/`next_page` support already exists or is easy to detect, keep it compatible without broad rewrites.
- Suggested sequencing: test red, implementation green, small refactor/polish, full verification.
- Safe rollout/migration approach: no migration; deploy worker change and run sync.
- Files to inspect before editing: `server/providers/sportmonks/client.js`, `server/sync/syncService.js`, `server/worker.js`, `server/tests/worker.test.js`, `server/config/env.js`.
- Decisions to avoid until more evidence exists: do not change API serializers, public frontend behavior, or env var names.

## 16. Verification Strategy
- Required automated checks: `npm test`.
- Required manual/check commands:
  - `npm run worker` if live environment variables and MongoDB are available.
  - `curl http://localhost:5000/api/v1/fixtures?limit=4` when the server is running against the synced database.
- Test types needed: unit tests for query serialization and sync-service parameter usage; existing integration-style sync upsert test retained.
- Build/lint/typecheck expectations: no dedicated lint/typecheck required unless available in the task plan; run targeted syntax checks if useful.
- Acceptance evidence required: test output, worker/API smoke result or documented credential/service blocker, and logs that exclude tokens.
- Proof of completion: test proves `filter` emitted and `filters` absent; code review confirms token-safe logging; smoke shows non-empty fixture data if credentials/services allow.

## 17. Acceptance Criteria
- [ ] Worker fetches fixtures from Sportmonks using `filter=fixtureSeasons:27897` when `SPORTMONKS_SEASON_ID=27897`.
- [ ] Worker does not emit `filters` for fixture sync.
- [ ] MongoDB `fixtures` and `matches` collections are populated after successful live sync.
- [ ] `curl http://localhost:5000/api/v1/fixtures?limit=4` returns non-empty `data` after live sync.
- [ ] Frontend homepage shows upcoming fixtures from the populated API data.
- [ ] Logs include fixture sync start, token-safe endpoint/params, fetched count, upsert counts, and full failure messages.
- [ ] `npm test` passes.
- [ ] No `.env` or token value is committed or exposed.

## 18. Edge Cases And Failure Modes
- Edge cases: empty provider page, multiple provider pages, missing season ID, detailed match-stats sync path, retryable 429/5xx provider errors, non-retryable provider errors, MongoDB bulk write errors.
- Failure modes: request uses wrong query key, token leaked in logs, pagination stops early, sync-state failure hides the true error, API remains empty because worker was not run long enough or locks skip the job.
- Regression risks: changing generic client serialization could affect other Sportmonks endpoints; adding logs could leak token if URL is logged raw.
- Recovery expectations: targeted fixes only; if live credentials or DB are unavailable, document smoke verification as blocked rather than claiming acceptance.

## 19. Risks And Mitigations
- Technical risks: Sportmonks pagination may use page-number metadata or cursor metadata depending on endpoint/account. Mitigation: preserve existing `pagination.has_more` and only extend cursor handling if supported by observed code/tests.
- Product/UX risks: homepage can still be empty if Sportmonks subscription does not expose fixtures or worker cannot run. Mitigation: separate code verification from credentialed smoke acceptance.
- Security risks: accidental token logging. Mitigation: log path and sanitized params only.
- Scope risks: broad ingestion refactor. Mitigation: keep the task focused on fixture query, logs, and tests.
- Mitigation plan: TDD-first changes, focused review, final diff audit, no `.env` changes.

## 20. Assumptions
- Explicit assumptions:
  - `config.sportmonksSeasonId` is `27897` in the target live environment.
  - The existing `/fixtures` endpoint and include string are otherwise valid.
  - Local verification may not have live credentials or a long-running web server unless already configured.
- Confidence level: high for code fix; medium for live smoke availability.
- What to revisit if assumptions are wrong: provider endpoint shape, season ID configuration, worker schedule timing, lock state, or MongoDB connection target.

## 21. Open Questions
- Blocking questions: none before implementation.
- Non-blocking questions: should fixture sync run immediately on worker startup for easier smoke verification, or is the existing scheduler interval acceptable?
- Execution impact: if `npm run worker` does not trigger fixture sync promptly, smoke verification may require invoking the job path directly or documenting schedule timing.

## 22. Task Extraction Notes
- Suggested vertical task boundaries:
  - `TASK-001: Prove and fix fixture season filter serialization`
  - `TASK-002: Add token-safe fixture sync diagnostics`
  - `TASK-003: Verify worker/API fixture population or document live-service blocker`
- Suggested first task: add failing test for `filter` query serialization and sync parameter usage.
- Suggested task ordering: tests and parameter fix first, logging second, smoke/final quality gates third.
- Areas that should not become separate tasks: frontend UI changes, schema changes, deployment.
- How the 3-pass Build -> Refine -> Polish loop should apply: each task should include Red -> Green -> Refactor evidence where code changes occur, with focused tests before implementation and verification after each pass.

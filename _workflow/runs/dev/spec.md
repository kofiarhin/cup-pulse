# Detailed Spec: Fix Fixture Team Name Resolution

## 1. Metadata
- Spec filename: `_workflow/runs/dev/spec.md`
- Date: 2026-06-16
- Request ID / slug: `fix-fixture-team-name-resolution`
- Request source: latest user prompt synced to `_workflow/runs/dev/request.md`
- Execution mode: `complete-workflow`
- Request classification: backend ingestion/API fix with small frontend UI display update
- Scope level: focused cross-layer bug fix
- Risk level: medium

## 2. Original Request
- Raw user request: Fix team name resolution in CupPulse so fixture cards stop showing fallback IDs like `team-2447` and display real Sportmonks team names/logos.
- Normalized request: Fix Sportmonks fixture ingestion, normalization, persistence, API serialization, and fixture-card presentation so upcoming fixtures expose and display real home/away team names and logos when participant data is available. Preserve fallback behavior only when no name is available.
- Source prompt / `<artifact-root>/request.md` reference: `_workflow/runs/dev/request.md`

## 3. Questions And Answers
- Questions asked: none
- Answers received: not applicable
- Questions skipped: repo inspection answered the blocking questions
- Remaining open questions: none blocking

## 4. Problem Definition
- Problem being solved: Fixture records have team IDs but not real team display data, so the UI renders fallback IDs.
- Why it matters: Public fixture pages look broken and do not identify the clubs.
- Current pain point: `/api/v1/fixtures` returns `homeTeamId` / `awayTeamId` but not populated team objects or names.
- Expected value: Users see recognizable club names and logos in upcoming fixtures.

## 5. Current State Analysis
- Existing behavior: `syncFixtures()` fetches fixtures with `include=participants;venue;state;stage;group;scores`; `normalizeFixture()` maps participant IDs only through `participantId()`.
- Existing architecture/components: Sportmonks client -> sync service -> normalizers -> Mongoose models -> data service -> `/api/v1` routes -> React match list.
- Existing files/modules likely involved: `server/providers/sportmonks/normalizers.js`, `server/sync/syncService.js`, `server/models/index.js`, `server/services/dataService.js`, `server/tests/worker.test.js`, `server/tests/api.test.js`, `client/src/components/MatchList.jsx`, `client/src/App.test.jsx`.
- Existing data flow: worker writes normalized fixtures/matches; web API reads MongoDB documents and strips internal fields; frontend uses `homeTeam?.name`, `homeTeamName`, then `homeTeamId`.
- Existing API/UI/CLI/workflow behavior: fixture API returns normalized envelopes but no team population; UI fallback exposes IDs.
- Existing tests or verification coverage: worker tests cover fixture include/filter and upsert counts; API tests cover generic envelopes; client tests cover route rendering and fixture search.

## 6. Desired End State
- Expected final behavior: fixture and match records store and/or return real `homeTeam` and `awayTeam` names and logos when Sportmonks provides them.
- User-facing outcome: upcoming fixtures render real team names and available crests/logos.
- Developer-facing outcome: participant extraction and API enrichment are covered by tests and logs.
- System/workflow outcome: next worker sync backfills fixture/match display fields and Team records.
- Backward compatibility expectations: existing ID fields remain; fallback behavior remains for missing names.

## 7. Scope
- In scope: Sportmonks participant extraction, team upsert from fixture sync, fixture/match model fields for names/logos or equivalent API enrichment, serializers, fixture card logo display, tests, logs.
- Out of scope: credentials, deployment, provider contract redesign, broad UI redesign, authentication/admin tooling.
- Non-goals: fabricate missing data, expose raw Sportmonks payloads, migrate existing production data manually.
- Explicit boundaries: no `.env` edits; no unrelated refactors; no new dependencies unless proven necessary.

## 8. Users And Use Cases
- Primary users: public CupPulse visitors browsing fixtures.
- Secondary users: maintainers checking `/api/v1/fixtures` and worker logs.
- Main use cases: view upcoming fixtures; confirm which clubs are playing; inspect API output.
- Edge use cases: participants missing names/logos; cached fixtures before the next sync; Team collection missing a participant.

## 9. Functional Requirements
- Required behaviors: fetch fixtures with participant/team relationship included; extract home/away participant ID, name, and logo; upsert extracted teams; return populated team data from fixture endpoints; show names/logos in fixture cards; preserve fallback.
- Inputs: Sportmonks fixture participant payloads; MongoDB fixture/match/team records; API query parameters.
- Outputs: normalized fixture/match records, Team records, API `homeTeam` / `awayTeam` objects, UI display.
- State changes: Fixture/Match may gain name/logo fields; Team records may be upserted during fixture sync.
- Error states: missing names/logos fall back without throwing; API remains available if Team lookup misses.
- Permissions/auth expectations: public read-only API unchanged.

## 10. Non-Functional Requirements
- Performance expectations: list enrichment must avoid per-record database queries when possible.
- Reliability expectations: sync succeeds with partial participant data.
- Security/privacy expectations: no token logging; provider IDs remain private in API output.
- Accessibility expectations: logos need empty decorative alt text or accessible text that does not duplicate nearby names.
- Maintainability expectations: keep provider shape handling in normalizer/sync boundary; keep API serializer focused.
- DX expectations: tests clearly document expected Sportmonks participant behavior.

## 11. Affected Surfaces
- Files likely affected: `server/providers/sportmonks/normalizers.js`, `server/sync/syncService.js`, `server/models/index.js`, `server/services/dataService.js`, `server/tests/worker.test.js`, `server/tests/api.test.js`, `client/src/components/MatchList.jsx`, `client/src/App.test.jsx`.
- Directories likely affected: `server/providers/sportmonks`, `server/sync`, `server/services`, `server/tests`, `client/src/components`, `client/src`.
- UI surfaces: home upcoming fixtures, fixtures page, live/results/match lists if backed by the shared `MatchList`.
- API routes: `/api/v1/fixtures`, `/api/v1/matches`, `/api/v1/matches/live`, `/api/v1/matches/:id`.
- Components: `MatchList`, match detail score section if needed.
- Services: `createDataService()`, sync service.
- Database/schema: Fixture and Match may add `homeTeamName`, `awayTeamName`, `homeTeamLogo`, `awayTeamLogo`; Team already exists.
- Config/env vars: none.
- Tests: backend worker/API tests and frontend route/component tests.
- Docs: workflow artifacts only unless durable architecture facts change.

## 12. Dependency And Integration Map
- Internal dependencies: normalizer output feeds Fixture/Match/Team models; data service serializes API responses; frontend reads API shape.
- External packages/services: Sportmonks Football API v3, MongoDB/Mongoose.
- Integration points: `/fixtures` Sportmonks include, Team upserts, API list/detail serialization.
- Ordering constraints: update tests first, then normalizer/sync, then API serializer, then frontend logo display.
- Migration/setup requirements: next worker sync backfills cached records; no manual migration planned.

## 13. Data And State Impact
- Data models: add optional name/logo fields to Fixture/Match or derive them from Team records and participant data.
- Database changes: optional schema fields only; existing documents remain valid.
- State management changes: none in frontend state.
- Cache/session/local storage impact: none.
- Backward compatibility impact: API gains fields/objects but keeps existing IDs.

## 14. UX / API / Workflow Expectations
- UX expectations: fixture cards show real names first, logo images only when available, and fallback IDs only as last resort.
- API contract expectations: records include `homeTeam: { id, name, logo }` and `awayTeam: { id, name, logo }` or equivalent structure; `homeTeamName` and `awayTeamName` may also be present for compatibility.
- CLI/workflow behavior: worker logs include fixtures fetched, teams extracted, teams upserted.
- Error handling expectations: missing participant data does not fail sync or API reads.
- Empty/loading/success/failure states: existing frontend states remain.

## 15. Execution Strategy
- Recommended implementation approach: add failing tests for participant name/logo extraction and API enrichment; extend normalizer to produce team display fields and extracted team records; upsert teams inside fixture sync; batch-enrich list/detail API records; update `MatchList` to render logos without layout shift.
- Suggested sequencing: backend tests/normalization first, sync logging/upsert second, API serialization third, frontend display fourth.
- Safe rollout/migration approach: optional fields and additive API response keep old documents readable.
- Files to inspect before editing: affected files listed in section 11 plus `server/data/mockData.js` if API serializer tests use mock fallback.
- Decisions to avoid until more evidence exists: no provider endpoint changes beyond `include=participants` unless tests/live response prove it insufficient.

## 16. Verification Strategy
- Required automated checks: `npm test`, `npm test --prefix client`, `npm run lint --prefix client`, `npm run build --prefix client`, `git diff --check`.
- Required manual checks: if local env is available, `curl http://localhost:5000/api/v1/fixtures?limit=4` and confirm real team names.
- Test types needed: normalizer unit tests, sync service tests, API serializer tests, frontend component/route tests.
- Build/lint/typecheck expectations: full repository verification should pass via `npm run verify` where feasible.
- Acceptance evidence required: sample API output with `homeTeam.name` and `awayTeam.name`, logs proving extracted/upserted teams, test output.
- Proof of completion: task progress records all three Build/Refine/Polish iterations with TDD evidence.

## 17. Acceptance Criteria
- [ ] Upcoming fixtures show real club names when Sportmonks participant/team names are available.
- [ ] No fixture card displays `team-XXXX` when an actual team name exists in synced data.
- [ ] Team logos appear in fixture cards when available.
- [ ] `/api/v1/fixtures?limit=4` returns populated `homeTeam` and `awayTeam` names.
- [ ] Fixture sync logs fixture count, extracted team count, and upserted team count.
- [ ] Fallback `team-${id}` remains only when a team name is unavailable.

## 18. Edge Cases And Failure Modes
- Edge cases: participant order varies; meta location missing; name present but logo missing; Team collection stale; fixture contains neutral/TBD participants.
- Failure modes: Sportmonks include does not provide names; API enrichment returns provider/internal fields; frontend image breaks; list enrichment becomes inefficient.
- Regression risks: existing mock fallback tests may need fixtures updated; match detail may still show IDs if only list serializer changes.
- Recovery expectations: keep fallback IDs and no broken images; log counts without failing the sync for partial data.

## 19. Risks And Mitigations
- Technical risks: Sportmonks participant shape differs from assumptions. Mitigation: mapper supports common `name`, `display_name`, `image_path`, and falls back safely.
- Product/UX risks: logos absent for some clubs. Mitigation: render names cleanly without logos.
- Security risks: provider token exposure in logs. Mitigation: preserve sanitized logging pattern.
- Scope risks: frontend polish expanding beyond fixture cards. Mitigation: touch only shared match list display needed for logos.
- Mitigation plan: test each boundary and avoid broad refactors.

## 20. Assumptions
- Explicit assumptions: `include=participants` is the correct Sportmonks relationship for fixture teams; participant objects can upsert Teams; current schema can accept optional fields without migration.
- Confidence level: medium-high based on code inspection and prior successful fixture sync.
- What to revisit if assumptions are wrong: Sportmonks include relationship or separate team lookup strategy.

## 21. Open Questions
- Blocking questions: none.
- Non-blocking questions: whether Sportmonks uses a richer relationship than `participants` for club logos in fixture responses.
- Execution impact: if `participants` lacks logos, names still ship and logos remain optional.

## 22. Task Extraction Notes
- Suggested vertical task boundaries: one task for ingestion/persistence, one for API serialization, one for frontend display and verification.
- Suggested first task: extract and persist fixture participant team display data.
- Suggested task ordering: ingestion -> API -> frontend/verification.
- Areas that should not become separate tasks: broad design refresh, deployment, auth, unrelated docs.
- How the 3-pass Build -> Refine -> Polish loop should apply: each task gets tests first, smallest implementation, cleanup, verification, review, and documented acceptance.

## Spec Approval Gate

This spec is saved at `_workflow/runs/dev/spec.md`.

Approve this spec explicitly before task planning or implementation begins.

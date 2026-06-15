# CupPulse PRD Completion Detailed Spec

## 1. Metadata
- Spec filename: `_workflow/runs/work/spec.md`
- Date: 2026-06-14
- Request ID / slug: `cup-pulse-prd-completion`
- Request source: direct user prompt, normalized in `_workflow/runs/work/request.md`
- Execution mode: `complete-workflow`
- Request classification: full-stack feature completion, integration, hardening, and coverage
- Scope level: large
- Risk level: high

## 2. Original Request
- Raw user request: Bring CupPulse to full alignment with `CupPulse_PRD.md`, including Socket.IO, admin functionality, groups, prediction/summary collection routes, complete sync and derived generation, responsive polish, and PRD coverage tests.
- Normalized request: Implement the active request saved in `_workflow/runs/work/request.md` while preserving all current public behavior and passing `npm run verify`.
- Source prompt / request reference: `_workflow/runs/work/request.md`

## 3. Questions And Answers
- Questions asked: None; the supplied completion specification was detailed and repo inspection resolved implementation conventions.
- Answers received: Not applicable.
- Questions skipped: No blocking questions remained.
- Remaining open questions: None blocking.

## 4. Problem Definition
- Problem being solved: The current production-shaped public MVP omits PRD-required realtime behavior, admin operations, groups, some collection endpoints, complete sync/derived coverage, and comprehensive responsive/test coverage.
- Why it matters: These gaps prevent the implementation from satisfying the committed PRD and operational needs.
- Current pain point: Public data is pull-only; operators lack health/content controls; groups are implicit; collection and synchronization coverage is incomplete.
- Expected value: A resilient, observable, mobile-first PRD-complete application with automated cache invalidation and operator controls.

## 5. Current State Analysis
- Existing behavior: Public React routes and normalized Express list/detail routes exist; Mongo/mock data service, Sportmonks worker, deterministic predictions, and summaries are implemented.
- Existing architecture/components: React Router + TanStack Query frontend; Express 5 API; separate Heroku worker; Mongoose normalized collections.
- Existing files/modules likely involved: `server/server.js`, `server/app.js`, `server/routes/api.js`, `server/models/index.js`, `server/services/dataService.js`, `server/sync/syncService.js`, provider normalizers/client, worker/jobs, mock data, client app/routes/pages/hooks/lib/styles, tests, package manifests, and env/docs.
- Existing data flow: Worker fetches Sportmonks, normalizes/upserts Mongo, refreshes derived records; API reads Mongo or configured mocks; frontend fetches `/api/v1` through TanStack Query.
- Existing API/UI/CLI/workflow behavior: Public API is unauthenticated; specialized prediction/summary details use `matchId`; no socket or admin surface exists.
- Existing tests or verification coverage: Node test runner/Supertest backend tests and Vitest/RTL frontend tests; root verify runs tests, lint, and build.

## 6. Desired End State
- Expected final behavior: All requested PRD features are implemented, automatically refreshed, protected where appropriate, and verified.
- User-facing outcome: Public users see current announcements/featured content and automatically refreshed matches/standings; group standings and all routes remain usable on mobile.
- Developer-facing outcome: Reusable realtime, admin API, sync, image normalization, and derived refresh modules have focused tests.
- System/workflow outcome: Worker completion persists compact events; web process emits them over Socket.IO; admin token protects operational APIs.
- Backward compatibility expectations: Existing URLs, API envelopes, mock fallback, route specificity, and public unauthenticated behavior remain intact.

## 7. Scope
- In scope: All eight required work areas, relevant dependencies, env sample/docs, models/migrations-by-upsert, tests, workflow evidence, and verification fixes.
- Out of scope: Paid AI APIs, Redis, user accounts, unnecessary Redux, unrelated redesign, and credential provisioning.
- Non-goals: Replacing TanStack Query, changing hosting topology, or exposing provider-private raw data.
- Explicit boundaries: Changes must remain PRD-focused and preserve current API contracts unless adding specified fields/routes.

## 8. Users And Use Cases
- Primary users: Public World Cup followers on mobile and desktop.
- Secondary users: CupPulse operators using the admin area.
- Main use cases: Follow live data, browse tournament information, view derived predictions/summaries, monitor sync health, and manage public notices/features.
- Edge use cases: Socket unavailable, Mongo unavailable with allowed mocks, expired scheduled content, provider partial failure, missing admin token, and pre-full-time summary requests.

## 9. Functional Requirements
- Required behaviors: Implement specified socket events, admin auth/CRUD/health/sync, public active content, groups, collection list/detail, complete sync, image fallback, fingerprint regeneration, and responsive UI.
- Inputs: API query/path/body data, bearer token, Sportmonks payloads, environment configuration, and socket events.
- Outputs: Existing normalized envelopes, compact realtime payloads, protected admin responses, persisted normalized/derived records, responsive pages.
- State changes: CRUD for announcements/features; upserts for groups/realtime events/sync states/derived records; query invalidations in frontend.
- Error states: 401/403 admin denial, validation errors, unavailable cache/provider/socket, not-found entities, and pre-full-time summary unavailable response.
- Permissions/auth expectations: Only `/api/v1/admin/**` requires the exact bearer token; public routes remain open.

## 10. Non-Functional Requirements
- Performance expectations: Compact events, bounded polling, paginated lists, indexed event/group/content fields, no full-data socket payloads.
- Reliability expectations: Socket failure is non-fatal; provider job failures are isolated; Mongo event delivery is deduplicated; Express startup/routes remain stable.
- Security/privacy expectations: Constant-time token comparison where practical, fail closed on missing token, no token logging, session-only browser storage, strict configured CORS.
- Accessibility expectations: Labeled controls, keyboard-operable navigation/forms, sufficient touch targets, semantic status/error content.
- Maintainability expectations: API/socket logic outside components, thin routes, reusable services, existing conventions.
- DX expectations: Document env variables and keep `npm run verify` authoritative.

## 11. Affected Surfaces
- Files likely affected: Root/client manifests and lockfiles; server config/startup/app/models/routes/middleware/services/sync/provider/mock/tests; client app/API/realtime/admin/pages/components/styles/tests; `.env.example`; durable docs if facts change.
- Directories likely affected: `server/`, `client/src/`, `client/`, `docs/`, workflow artifacts.
- UI surfaces: Home, standings/tournament display, app root/providers, all admin routes, navigation and responsive layouts.
- API routes: New public content/groups/list routes and `/api/v1/admin/**`; existing details preserved.
- Components: Admin layout/forms/tables, home content sections, group standings, responsive wrappers.
- Services: Data service, admin API service, socket client/hook, realtime persistence/poller, sync/derived refresh.
- Database/schema: `groups`, `announcements`, `featuredcontent` (or explicit stable collection name), `realtimeevents`; indexes and exports.
- Config/env vars: `ADMIN_API_TOKEN` plus any documented realtime polling/retention tuning with safe defaults.
- Tests: Backend API/admin/realtime/sync/derived tests and frontend route/admin/realtime/responsive smoke tests.
- Docs: Project context/architecture/verification/env documentation where durable behavior changes.
- Workflow artifacts: Active run files and Fallow audit.

## 12. Dependency And Integration Map
- Internal dependencies: Models -> services -> routes/app; HTTP server -> Socket.IO; worker -> persisted realtime event; API poller -> socket bus; socket client -> QueryClient invalidation; admin API -> admin pages.
- External packages/services: Add `socket.io` at root and `socket.io-client` under client; retain MongoDB/Sportmonks.
- Integration points: Express HTTP server, Mongoose connection/status, TanStack Query keys, worker job completion, sessionStorage.
- Ordering constraints: Data/routes first; admin backend before UI; socket backend/client before worker wiring; sync/derived hardening before final broad tests.
- Migration/setup requirements: No destructive migration; Mongoose creates collections/indexes as records are used. New env token must be documented.

## 13. Data And State Impact
- Data models: Add Group, Announcement, FeaturedContent, and RealtimeEvent with timestamps, validation, indexes, and model registry entries.
- Database changes: New collections and event retention/delivery metadata; stable group IDs based on competition and provider group code.
- State management changes: TanStack Query invalidation only; admin token is client-owned session state without Redux.
- Cache/session/local storage impact: Token in `sessionStorage`; no persistent credential storage.
- Backward compatibility impact: Additive schemas/routes; serialization continues stripping provider/internal fields.

## 14. UX / API / Workflow Expectations
- UX expectations: Minimal responsive admin, clear login/logout/unauthorized states, home notices/features, scroll-safe tables/bracket, tappable primary actions.
- API contract expectations: Existing envelope conventions and pagination; active/current public content filtering; admin CRUD returns useful normalized records/statuses.
- CLI/workflow behavior: Worker logs each job result and continues unrelated jobs after provider failures; startup config errors remain fatal.
- Error handling expectations: Query errors render existing data states; socket disconnect is silent/non-blocking; admin auth errors return structured API errors.
- Empty/loading/success/failure states: Required for admin lists/forms and public content without layout breakage.

## 15. Execution Strategy
- Recommended implementation approach: Small vertical tasks in the requested order, each with tests first and three hardening passes.
- Suggested sequencing: Collections/routes -> admin backend -> admin/public UI -> realtime -> worker bridge -> sync/derived completion -> responsive/coverage -> full verify.
- Safe rollout/migration approach: Additive models and routes; retain fallback paths; event poller starts only after DB setup and shuts down cleanly.
- Files to inspect before editing: Current tests, query keys/hooks, mock shapes, sync jobs, normalizers, derived fingerprints, package/env/deployment docs.
- Decisions to avoid until more evidence exists: Do not invent provider group/image fields; inspect normalizers/fixtures first. Do not introduce Redis or global state.

## 16. Verification Strategy
- Required automated checks: Narrow backend/frontend tests per task, syntax checks, lint/build, `git diff --check`, and final `npm run verify`.
- Required manual checks: Route ordering/contracts, token storage behavior, responsive code-surface review at 375/768/1024/desktop; browser screenshots if runnable.
- Test types needed: Unit/service, Supertest route/auth/CRUD, socket event integration where practical, hook event mocking, route rendering, responsive class smoke checks.
- Build/lint/typecheck expectations: Existing frontend lint/build pass; no separate typecheck script currently exists.
- Acceptance evidence required: Red/Green/Refactor logs for each iteration/task and final full-suite output.
- Proof of completion: All acceptance boxes checked, review/Fallow/health artifacts complete, committed changes, PR record created.

## 17. Acceptance Criteria
- [ ] Socket.IO server/client and Mongo-backed worker-to-web notification path deliver compact match, match-detail, standings, and sync invalidation events without breaking Express or offline behavior.
- [ ] Token-protected admin APIs/UI provide health, sync, announcement, and featured-content operations; public active content appears on Home.
- [ ] Groups, predictions, and summaries have working paginated list and required detail routes from Mongo or mock fallback with tests.
- [ ] Sportmonks synchronization covers all PRD collections, stable groups, image fallback, isolated failures, job sync state, and derived refresh triggers.
- [ ] Predictions and summaries persist and obey source fingerprints, including unchanged skips, changed regeneration, and pre-full-time summary unavailability.
- [ ] Public/admin pages are mobile-safe at required widths with no page-level horizontal overflow and usable scroll/stacks/actions.
- [ ] PRD route/admin/realtime/sync/derived coverage is present and all existing behavior remains compatible.
- [ ] `npm run verify`, `git diff --check`, and relevant syntax checks pass.

## 18. Edge Cases And Failure Modes
- Edge cases: Empty IDs arrays, duplicate event polling, worker/web clock differences, event retention, content time boundaries, invalid CRUD bodies, empty token, unknown group codes, partial provider includes, unchanged fingerprints.
- Failure modes: Mongo disconnect, socket CORS mismatch, provider timeout, unauthorized admin, malformed data, generic route shadowing, responsive overflow.
- Regression risks: Existing `/matches/live`, prediction/summary detail, mock fallback, public route rendering, and worker scheduling.
- Recovery expectations: Keep cached data serving, reconnect sockets automatically, retry/poll safely, isolate failed jobs, return structured errors, and avoid partial destructive updates.

## 19. Risks And Mitigations
- Technical risks: Large cross-cutting scope and cross-process event delivery. Mitigate with narrow interfaces, persisted event IDs, bounded polling, and staged tests.
- Product/UX risks: Admin complexity or unrelated redesign. Mitigate with minimal forms and reuse of existing visual language.
- Security risks: Bearer token leakage or permissive fallback. Mitigate with sessionStorage, no logging, exact validation, and unconditional fail-closed missing config.
- Scope risks: Provider variability and responsive audit breadth. Mitigate by preserving nullability, inspecting fixtures, and prioritizing acceptance surfaces.
- Mitigation plan: TDD-first tasks, exact failure recovery, final diff/security audit, and full verification.

## 20. Assumptions
- Explicit assumptions: Current project conventions supersede generic Jest wording; MongoDB is the realtime bridge; env token is supplied externally; no destructive migration is needed.
- Confidence level: High.
- What to revisit if assumptions are wrong: Provider payload mapping, deployment CORS origins, event polling interval/retention, and desired admin editorial fields.

## 21. Open Questions
- Blocking questions: None.
- Non-blocking questions: Exact production polling interval and event retention can use documented conservative defaults.
- Execution impact: None before planning.

## 22. Task Extraction Notes
- Suggested vertical task boundaries: (1) groups/prediction/summary API; (2) admin API/content models; (3) admin/public UI; (4) realtime server/client; (5) worker event bridge; (6) sync/image/group coverage; (7) derived hardening; (8) responsive/coverage/final verification.
- Suggested first task: Add failing list/detail tests, Group model/mock data, and additive collection routes while preserving specialized route ordering.
- Suggested task ordering: Follow the user-provided implementation order, splitting only where independently verifiable.
- Areas that should not become separate tasks: Package installation alone, docs alone, or styling disconnected from a user-visible slice.
- How the 3-pass Build -> Refine -> Polish loop should apply: Every task starts with the narrow failing behavior test, then adds core behavior, edge/failure hardening, and final compatibility/cleanup while rerunning proof after each refactor.

Applied skill: design-taste-frontend (required for later frontend UI implementation and final UI review; implementation skill audit will occur after approval and planning).

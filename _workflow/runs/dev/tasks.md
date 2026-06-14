# CupPulse Production MVP Task Plan

- Spec file used: `_workflow/runs/dev/spec.md`
- Planning date: 2026-06-14
- Progress read: `_workflow/runs/dev/progress.md`
- Summary read: none exists
- Handoff read: `_workflow/runs/dev/handoff.md`
- Spec sections used: 11-22, especially affected surfaces, dependencies, data impact, API/UX expectations, execution and verification strategies, acceptance criteria, risks, assumptions, and extraction notes.
- Applied skill: design-taste-frontend

## Task List

### TASK-001: Establish the tested API runtime

- Status: Done
- Objective: Add validated runtime configuration, MongoDB lifecycle, health/readiness routes, API envelopes, CORS, and centralized errors.
- Files likely affected: `package.json`, `server/app.js`, `server/server.js`, `server/config/**`, `server/middleware/**`, `server/tests/**`, `.env.example`
- Checklist: config validation; database connector; success/error helpers; `/health`; `/ready`; 404/error middleware; backend test command.
- Iteration 1 Build: Red health/config tests; Green minimum runtime; Refactor config/error boundaries.
- Iteration 2 Refine: Red production/missing-env and CORS tests; Green strict behavior; Refactor startup composition.
- Iteration 3 Polish: Red metadata/security regression tests; Green response polish; Refactor naming/docs.
- Test plan: Node test runner and Supertest.
- Red/Green/Refactor evidence: Record in progress after each iteration.
- Test commands: `npm test`
- Acceptance criteria: Production requires MongoDB; consistent errors; health/readiness are testable; secrets are not returned.
- Acceptance result: [x] Production configuration validation, normalized health/readiness/errors, strict CORS, safe JSON errors, and secret-safe public config verified.
- Verification commands: `npm test`, server syntax/startup smoke.
- Stop condition: Runtime contracts pass without requiring live Atlas during tests.
- Out of scope: Domain models and Sportmonks calls.

### TASK-002: Serve normalized World Cup records

- Status: Done
- Objective: Add normalized Mongoose models, query services, mock fallback repository, and every required read-only `/api/v1` endpoint.
- Files likely affected: `server/models/**`, `server/services/**`, `server/controllers/**`, `server/routes/**`, `server/data/**`, `server/tests/**`
- Checklist: required collections; indexes; pagination/filter validation; freshness/source metadata; detail/not-found behavior; mock fallback policy.
- Iteration plan: Build schemas/contracts; Refine filters and stale metadata; Polish edge cases and indexes. Every iteration uses Red -> Green -> Refactor.
- Test plan: Model/service units and Supertest API contracts with mocked repositories.
- Acceptance criteria: All required endpoints exist and return normalized envelopes without raw provider payloads.
- Acceptance result: [x] Required endpoints, schemas, filtering, pagination, freshness/source metadata, fallback policy, and private provider fields verified.
- Verification commands: `npm test`
- Stop condition: API contract suite passes.
- Out of scope: Provider writes and UI.

### TASK-003: Synchronize Sportmonks data from a worker

- Status: Done
- Objective: Add the Sportmonks v3 client, normalizers, idempotent sync services, MongoDB locks, configurable schedules, and separate worker process.
- Files likely affected: `server/providers/**`, `server/sync/**`, `server/jobs/**`, `server/worker.js`, `Procfile`, `package.json`, `server/tests/**`
- Checklist: authenticated client; pagination; timeout/retry/429 handling; selective includes; upserts; locks; schedules; sync-state records; web/worker separation.
- Iteration plan: Build client/normalizers; Refine locking/idempotency; Polish retry, logging, and schedule controls. Every iteration uses Red -> Green -> Refactor.
- Test plan: Mocked fetch/provider pages, normalizer fixtures, lock and scheduler units.
- Acceptance criteria: Only worker syncs; schedules match requirements and are configurable; cached records survive failed sync.
- Acceptance result: [x] Separate worker, authenticated pagination, normalization, idempotent upserts, sync state, locks, schedules, and active-match gating verified.
- Verification commands: `npm test`, worker startup smoke without credentials in test mode.
- Stop condition: Provider and job tests pass without a live API token.
- Out of scope: Socket.IO.

### TASK-004: Generate predictions and match summaries

- Status: Done
- Objective: Add deterministic player/team form prediction and structured narrative summary engines with source fingerprints and persistence.
- Files likely affected: `server/services/predictions/**`, `server/services/summaries/**`, models, jobs, routes, tests.
- Checklist: required weights/inputs; probability normalization; predicted score; confidence/rationale; article sections; unfinished message; fingerprint-based regeneration.
- Iteration plan: Build pure engines; Refine missing-data behavior; Polish persistence/regeneration and rationale quality. Every iteration uses Red -> Green -> Refactor.
- Test plan: Deterministic fixtures, invariants, missing-data cases, and API route tests.
- Acceptance criteria: Required prediction fields and exact unfinished summary message are returned.
- Acceptance result: [x] Weighted player/team prediction, required output, structured summary, exact unfinished state, and fingerprint-controlled persistence verified.
- Verification commands: `npm test`
- Stop condition: Derived-data tests and routes pass.
- Out of scope: Paid AI and provider prediction products.

### TASK-005: Build the public match experience

- Status: Done
- Objective: Add the frontend foundation and Home, Live Matches, Fixtures, Results, Match Details, Predictions, and Summaries pages using `/api/v1`.
- Files likely affected: `client/package.json`, `client/src/app/**`, `client/src/components/**`, `client/src/pages/**`, `client/src/services/**`, `client/src/styles/**`, tests.
- Checklist: React Router; TanStack Query; Tailwind; app shell; search/filter/pagination; freshness badges; responsive pages; skeleton/empty/error states.
- Iteration plan: Build routed data views; Refine accessibility/responsiveness; Polish editorial hierarchy and motion. Every iteration uses Red -> Green -> Refactor.
- Test plan: Vitest/RTL route and component tests plus browser smoke.
- Acceptance criteria: Match-facing pages are responsive and API-backed.
- Acceptance result: [x] Home, live, fixtures, results, match detail, prediction, and summary routes are responsive, API-backed, searchable/paginated where applicable, and include full UI states.
- Verification commands: `npm test --prefix client`, `npm run lint --prefix client`, `npm run build --prefix client`
- Stop condition: Tests/build pass and browser review shows no blocking layout defects.
- Out of scope: Team/player/bracket pages.
- Applied skill: design-taste-frontend

### TASK-006: Build tournament, team, and player exploration

- Status: Done
- Objective: Add Standings, Knockout Bracket, Teams, Team Details, Players, and Player Details with data-driven 48-team behavior.
- Files likely affected: `client/src/components/**`, `client/src/pages/**`, `client/src/services/**`, tests.
- Checklist: responsive standings; horizontally navigable bracket; team/player search and pagination; detail profiles; unavailable-stat handling.
- Iteration plan: Build pages; Refine responsive/accessibility behavior; Polish density, states, and transitions. Every iteration uses Red -> Green -> Refactor.
- Test plan: Component/route tests and browser checks at mobile/desktop widths.
- Acceptance criteria: Remaining public pages work and never fabricate unavailable data.
- Acceptance result: [x] Standings, bracket, team/player directories, detail profiles, explicit unavailable values, responsive navigation, and accessibility semantics verified.
- Verification commands: client tests, lint, build, browser smoke.
- Stop condition: Public route matrix passes.
- Out of scope: Admin and personalized features.
- Applied skill: design-taste-frontend

### TASK-007: Harden deployment and production resilience

- Status: Done
- Objective: Finalize environment/deployment docs, production fallback enforcement, full verification, browser review, and durable architecture docs.
- Files likely affected: `.env.example`, `Procfile`, docs, package scripts, tests, workflow artifacts.
- Checklist: web/worker commands; env catalog; Atlas/Sportmonks setup; production mock guard; final test/lint/build; diff audit; review; Fallow; release notes; summary.
- Iteration plan: Build deployment config; Refine operational failure behavior; Polish docs and final quality evidence. Every code-changing iteration uses Red -> Green -> Refactor.
- Test plan: Full repository verification and production-config tests.
- Acceptance criteria: Deployment configuration is explicit, secrets remain ignored, and all workflow gates are complete.
- Acceptance result: [x] Derived refresh wiring, normalized score ingestion, deployment configuration, production fallback enforcement, durable docs, and full verification are complete.
- Verification commands: full backend/client suite, lint/build, browser smoke, Fallow audit.
- Stop condition: Workflow health can be assessed with all required artifacts.
- Out of scope: Actual cloud deployment and credentials provisioning.

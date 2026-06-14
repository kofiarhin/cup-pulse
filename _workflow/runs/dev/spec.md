# CupPulse Production MVP Foundation Specification

## 1. Metadata

- Spec filename: `_workflow/runs/dev/spec.md`
- Date: 2026-06-14
- Request ID / slug: `cup-pulse-production-mvp`
- Request source: Direct user request and `CupPulse_PRD.md`
- Execution mode: `complete-workflow`
- Request classification: Full-stack product implementation
- Scope level: Large
- Risk level: High

## 2. Original Request

- Raw user request: Implement `CupPulse_PRD.md`.
- Normalized request: Build a public 2026 FIFA Men's World Cup companion using a React frontend, normalized Express API, Sportmonks ingestion worker, MongoDB Atlas cache, deterministic predictions, and structured match summaries.
- Source prompt / request reference: `_workflow/runs/dev/request.md`

## 3. Questions And Answers

- Questions asked: Delivery boundary, prediction behavior, data authority, ingestion scope, competition, environment configuration, worker scheduling, summary generation, API boundary, and account scope.
- Answers received: Implement all public MVP pages; use real Sportmonks data; include ingestion/cache/jobs now; target the 2026 men's finals; use environment variables; use a separate locked worker; generate deterministic predictions and summaries; expose read-only `/api/v1`; exclude accounts and personalization.
- Questions skipped: None.
- Remaining open questions: No blocking questions.

## 4. Problem Definition

- Problem being solved: The repository is only a minimal Vite and Express scaffold and does not implement the PRD.
- Why it matters: Users need one mobile-first source for World Cup fixtures, results, standings, teams, players, predictions, and summaries.
- Current pain point: No domain model, provider integration, public API, data cache, prediction logic, summary logic, or usable interface exists.
- Expected value: A production-shaped MVP that can ingest and present real 2026 World Cup data while degrading safely during provider outages.

## 5. Current State Analysis

- Existing behavior: The client renders “Welcome to cup pulse”; the server exposes `/` and `/health`.
- Existing architecture/components: React 19/Vite client and Express 5 server with Mongoose installed.
- Existing files/modules likely involved: Root and client package manifests, `client/src`, `server`, deployment configuration, tests, and documentation.
- Existing data flow: None.
- Existing API/UI/CLI/workflow behavior: Minimal health routes and static placeholder UI.
- Existing tests or verification coverage: No tests; client has lint/build scripts.

## 6. Desired End State

- Expected final behavior: Public pages query CupPulse API endpoints that read normalized MongoDB data populated by the Sportmonks worker.
- User-facing outcome: Responsive World Cup browsing with freshness/source indicators and complete loading, empty, error, stale, and mock states.
- Developer-facing outcome: Clear provider, normalization, persistence, service, API, UI, test, and worker boundaries.
- System/workflow outcome: Web and worker processes deploy independently and share MongoDB state.
- Backward compatibility expectations: Preserve `/health`; placeholder routes may be replaced without compatibility guarantees.

## 7. Scope

- In scope: All specified public pages, REST API, MongoDB models, Sportmonks integration, worker jobs, locks, prediction engine, summary engine, tests, environment templates, Procfile, and deployment documentation.
- Out of scope: Socket.IO delivery, admin features, auth, accounts, profiles, OAuth, personalization, favorites, notifications, comments, saved predictions, betting odds, and paid AI/prediction APIs.
- Non-goals: Pixel replication of FIFA or Sportmonks products; fabricating unavailable tournament data.
- Explicit boundaries: Only the worker writes provider-derived normalized records. Public API routes are read-only.

## 8. Users And Use Cases

- Primary users: Football supporters following the 2026 World Cup on mobile or desktop.
- Secondary users: Editors/operators monitoring deployments through logs and health endpoints, without an admin UI.
- Main use cases: Check live/upcoming/completed matches, inspect match details, browse standings/bracket, research teams/players, view predictions, and read summaries.
- Edge use cases: Provider outage, empty pre-tournament fields, stale cache, incomplete lineups/statistics, postponed/cancelled matches, and knockout extra time/penalties.

## 9. Functional Requirements

- Required behaviors:
  - Serve every required public route.
  - Ingest Sportmonks API v3 data with pagination, includes, retries, timeout, and rate-limit-aware errors.
  - Normalize competitions, teams, players, fixtures, matches, standings, venues, predictions, and summaries.
  - Schedule static, six-hour, fixture, active-match-stat, and prediction refreshes in the worker only.
  - Return cache metadata and `live`, `cached`, or `mock` source status.
  - Generate deterministic predictions and summaries.
- Inputs: Environment variables, Sportmonks responses, MongoDB records, route params, filters, and pagination.
- Outputs: Normalized JSON API responses and responsive public UI.
- State changes: Worker upserts normalized records, updates sync metadata, acquires locks, and regenerates derived records when source fingerprints change.
- Error states: Invalid filters/IDs, not found, provider unavailable, database unavailable, stale cache, no cache, lock contention, and malformed provider data.
- Permissions/auth expectations: Public read access; no authentication.

## 10. Non-Functional Requirements

- Performance expectations: Paginated APIs, indexed query fields, lean reads, bounded provider pages, selective includes, and query caching.
- Reliability expectations: Idempotent upserts, expiring locks, cached fallback, source fingerprints, graceful worker retries, and startup validation.
- Security/privacy expectations: Secrets only in environment variables; provider token never reaches clients/logs; CORS restricted by `CLIENT_URL`; no raw provider payload exposure.
- Accessibility expectations: Semantic landmarks, keyboard navigation, visible focus, sufficient contrast, reduced-motion support, and non-color-only status cues.
- Maintainability expectations: Thin routes, service boundaries, pure prediction/summary modules, reusable frontend components, and deterministic tests.
- DX expectations: `.env.example`, documented scripts, local mock mode, seed/fallback fixtures isolated from production paths, and clear process commands.

## 11. Affected Surfaces

- Files likely affected: Root/client package manifests, `server/**`, `client/src/**`, `.gitignore`, `.env.example`, `Procfile`, and docs.
- Directories likely affected: New backend config/models/services/controllers/routes/jobs/workers/tests and frontend app/components/features/hooks/pages/services/test directories.
- UI surfaces: All public pages and shared navigation/status/search/filter/pagination components.
- API routes: All endpoints listed in the active request under `/api/v1`.
- Components: App shell, match rows, score/status displays, standings table, bracket, team/player profiles, prediction visualization, summary article, skeletons, and state notices.
- Services: Sportmonks client, normalizers, sync orchestration, cache reads, predictions, summaries, locks, and freshness.
- Database/schema: Nine required domain collections plus sync-state/lock support collections.
- Config/env vars: Required backend values and configurable refresh/fallback/provider settings.
- Tests: Backend unit/integration tests and frontend unit/component tests.
- Docs: Project context, architecture, verification, environment/deployment, and decisions where durable.
- Workflow artifacts: Run-scoped evidence and Fallow audit.

## 12. Dependency And Integration Map

- Internal dependencies: Routes -> controllers -> query services -> Mongoose; worker scheduler -> sync services -> Sportmonks client/normalizers -> Mongoose; predictions/summaries -> normalized records.
- External packages/services: Sportmonks Football API v3, MongoDB Atlas, Heroku, Vercel, React Router, TanStack Query, Tailwind CSS, test libraries, scheduler, and HTTP client/native fetch.
- Integration points: Sportmonks API token, MongoDB URI, frontend API base URL, CORS client URL, Heroku web/worker commands.
- Ordering constraints: Config/database/models before API and jobs; normalized data contracts before UI; source datasets before predictions/summaries.
- Migration/setup requirements: Create indexes through Mongoose, configure Atlas access, set Heroku/Vercel env vars, and identify/discover Sportmonks competition/season IDs.

## 13. Data And State Impact

- Data models:
  - Competition: provider IDs, season, stage/group metadata, status.
  - Team: identity, country, crest, group, rankings/form aggregates.
  - Player: identity, team, position, image, availability, season/recent aggregates.
  - Fixture/Match: schedule/status/participants/scores/events/statistics/lineups.
  - Standing: group/team rank and tournament tiebreak fields.
  - Venue: identity, location, capacity, image.
  - Prediction: probabilities, score, confidence, rationale, input snapshot/fingerprint.
  - Summary: sections, article text, source fingerprint, generated timestamp.
- Database changes: Add schemas, indexes, timestamps, unique provider keys, and sync metadata.
- State management changes: TanStack Query owns server state; local React state owns filters/navigation controls.
- Cache/session/local storage impact: Browser query cache only; no auth/session persistence.
- Backward compatibility impact: New API is additive under `/api/v1`.

## 14. UX / API / Workflow Expectations

- UX expectations: Mobile-first sports editorial interface, asymmetric but legible desktop composition, compact numerical treatment, one restrained accent, and clear match hierarchy.
- API contract expectations:
  - Success envelope: `data`, `meta`, and optional pagination.
  - Error envelope: `{ error: { code, message, details? } }`.
  - Freshness metadata: source, fetched/synced timestamps, age, stale flag, and fallback reason when applicable.
  - Filters: competition/season/stage/group/team/status/date/search and page/limit where relevant.
- CLI/workflow behavior: `npm run start` for web, explicit worker script for jobs, test/lint/build scripts, and a Heroku `Procfile`.
- Error handling expectations: Cached content remains usable with visible stale indicators; unrecoverable states give retry/context without blank screens.
- Empty/loading/success/failure states: Dedicated layout-matched skeletons, contextual empty states, data views, and inline/full-page failures.

## 15. Execution Strategy

- Recommended implementation approach:
  1. Establish config, errors, DB lifecycle, models, and API envelopes.
  2. Add Sportmonks client, normalizers, sync state, locks, and worker schedules.
  3. Add read services/controllers/routes and fallback policy.
  4. Add prediction and summary engines with source fingerprints.
  5. Build frontend data layer/app shell and public pages in vertical slices.
  6. Add deployment configuration, docs, full verification, review, and Fallow audit.
- Suggested sequencing: Data contract first, then ingestion, then derived data, then UI routes sharing those contracts.
- Safe rollout/migration approach: Worker can run an initial full sync before public traffic; API serves explicit empty/unavailable states until data exists.
- Files to inspect before editing: Current package manifests, server bootstrap, Vite config, frontend entry/styles, and durable docs.
- Decisions to avoid until more evidence exists: Hard-coding Sportmonks IDs/includes not verified against the subscription; inventing missing 2026 data; adding Socket.IO.

## 16. Verification Strategy

- Required automated checks: Backend unit/integration tests, frontend component tests, lint, client build, API contract tests, prediction probability invariants, summary fingerprint tests, and worker lock/idempotency tests.
- Required manual checks: Responsive routes, keyboard navigation, stale/mock badges, bracket overflow behavior, and representative loading/error/empty screens.
- Test types needed: Pure unit tests, mocked provider tests, database-backed service tests where feasible, Supertest routes, React Testing Library components, and browser smoke checks.
- Build/lint/typecheck expectations: Client lint/build pass; backend syntax/tests pass. No TypeScript typecheck unless TypeScript is introduced.
- Acceptance evidence required: Commands and results recorded in each Build/Refine/Polish iteration.
- Proof of completion: Required routes and APIs work against normalized cache, production fallback policy is enforced, and all acceptance checks are recorded.

## 17. Acceptance Criteria

- [ ] All required public pages are implemented with responsive navigation and complete UI states.
- [ ] All required `/api/v1` endpoints return normalized data, filtering/pagination as applicable, consistent errors, freshness metadata, and source status.
- [ ] Sportmonks ingestion writes normalized real data through a separate worker with configurable schedules and MongoDB locks.
- [ ] Production requires MongoDB and never uses mock fallback unless explicitly enabled.
- [ ] Provider downtime serves cached data; development can use mock fallback only when cache is absent.
- [ ] Prediction output includes home/draw/away probabilities, predicted score, confidence, and rationale using specified team/player inputs and weights.
- [ ] Summary output is persisted, article-style, source-fingerprint controlled, and unavailable before full time with the exact required message.
- [ ] Secrets and raw provider response shapes remain private.
- [ ] Automated tests, lint, build, manual browser review, final diff audit, and Fallow audit are completed or documented.
- [ ] Applied skill: design-taste-frontend is recorded through required downstream artifacts.

## 18. Edge Cases And Failure Modes

- Edge cases: 48-team tournament format, best third-place qualification, placeholder fixtures, timezone conversion, unknown kickoff times, lineups arriving shortly before kickoff, extra time, penalties, abandoned/postponed matches, player transfers, duplicate provider pages, and missing advanced stats.
- Failure modes: Atlas unavailable, Sportmonks timeout/429/401, malformed pages, partial sync, expired worker lock, stale records, source fingerprint collision, and frontend network failure.
- Regression risks: Provider coupling leaking into API/UI, duplicate jobs, invalid probability totals, stale derived records, inaccessible wide tables/brackets, and mock data leaking into production.
- Recovery expectations: Retry bounded transient failures, preserve prior cache, record sync errors, expire locks safely, expose freshness/fallback metadata, and never delete good cache because one sync fails.

## 19. Risks And Mitigations

- Technical risks: Large breadth and external API uncertainty. Mitigate with vertical tasks, provider adapters, deterministic fixtures, and selective includes.
- Product/UX risks: Pre-tournament data gaps and dense mobile tables. Mitigate with explicit unavailable states and responsive alternate presentations.
- Security risks: Token leakage and permissive CORS. Mitigate with server-only config, redacted logging, env validation, and allowlisted origin.
- Scope risks: Admin/realtime/auth expansion. Mitigate by enforcing explicit exclusions.
- Mitigation plan: Keep provider integration isolated, derived engines pure, API stable, and tasks independently verifiable.

## 20. Assumptions

- Explicit assumptions: Sportmonks subscription access is supplied later through `SPORTMONKS_API_TOKEN`; Atlas access through `MONGODB_URI`; unavailable provider fields are nullable; 2026 competition identifiers are configurable/discoverable.
- Confidence level: High for architecture and contracts; medium for exact provider field availability until credentials/subscription are exercised.
- What to revisit if assumptions are wrong: Includes, refresh cadence, model optionality, and provider ID discovery.

## 21. Open Questions

- Blocking questions: None.
- Non-blocking questions: Exact Sportmonks plan limits and 2026 season/league IDs; branding assets beyond provider media.
- Execution impact: Implement configuration and discovery seams so these do not block local tests or contract development.

## 22. Task Extraction Notes

- Suggested vertical task boundaries:
  - Runtime/config/database/API foundations.
  - Core schemas and normalized read API.
  - Sportmonks ingestion and worker scheduling.
  - Prediction and summary engines.
  - Frontend shell and match discovery pages.
  - Standings/bracket/team/player detail experiences.
  - Deployment, resilience, and final verification.
- Suggested first task: Add tested runtime configuration, MongoDB lifecycle, API envelopes, and health/readiness behavior.
- Suggested task ordering: Backend foundations -> ingestion -> derived data -> frontend vertical pages -> deployment/hardening.
- Areas that should not become separate tasks: Generic “frontend,” “backend,” or styling-only layers; each task must deliver independently verifiable behavior.
- How the 3-pass loop should apply: Each vertical slice gets failing tests first, minimal passing behavior, then resilience/accessibility/performance polish with repeated verification.

## 23. Frontend Taste Application

- Applicable: Yes.
- Detection result and reason: The request requires substantial React JSX, Tailwind styling, responsive page design, and UI state work.
- Required propagation points: Spec, tasks, implementation evidence, review, verification, release notes, summary, and workflow health.
- Required evidence line: `Applied skill: design-taste-frontend`
- Design direction: Mobile-first sports editorial/data interface using a neutral palette with one restrained accent, strong sans-serif typography, asymmetric desktop layouts, compact numeric hierarchy, minimal card overuse, responsive tables/bracket, skeletal loading, and accessible motion.


# Task Plan

Spec: `_workflow/runs/work/spec.md` (approved by user on 2026-06-14)
Planning date: 2026-06-14
Inputs read: handoff, progress, summary, spec sections 11-22.

## TASK-001: Expose complete core collections
Status: Done
Objective: Add groups plus prediction/summary list/detail coverage with Mongo/mock compatibility.
Files: models, mock data, API router, API tests.
Iterations: Build added failing route expectations and models; Refine preserved specialized detail ordering; Polish added stable group normalization and checks.
Verification: `npm test` passed.
Acceptance: [x] list/detail and pagination; [x] mock fallback; [x] tests.

## TASK-002: Add protected admin operations
Status: Done
Objective: Add fail-closed bearer auth, health/sync and editorial CRUD/public APIs.
Files: middleware, admin routes, models, config, tests.
Iterations: Build added auth/models/routes; Refine added current-window filtering and validation; Polish added safe comparison and public fallback.
Verification: `npm test` passed.
Acceptance: [x] unauthorized rejection; [x] health/sync; [x] CRUD routes; [x] public content.

## TASK-003: Add admin and editorial UI
Status: Done
Objective: Provide session-token admin routes and Home editorial content.
Files: client admin/API/routes/pages/tests.
Iterations: Build added login/layout/pages; Refine separated API state into TanStack Query; Polish added mobile overflow, labels, touch targets, and route tests.
Verification: client tests, lint, build passed.
Acceptance: [x] admin routes; [x] session token; [x] responsive forms; [x] Home content.
Applied skill: design-taste-frontend

## TASK-004: Add realtime invalidation
Status: Done
Objective: Add Socket.IO server/client and Mongo cross-process event bridge.
Files: realtime modules, server startup, worker, client provider/hook, tests, dependencies.
Iterations: Build added socket server/client; Refine added compact validated payloads and persisted event polling; Polish added cleanup/reconnect behavior and event tests.
Verification: backend tests, client tests, lint, build passed.
Acceptance: [x] four events; [x] query invalidation; [x] worker bridge; [x] socket-optional app.

## TASK-005: Complete sync and responsive hardening
Status: Done
Objective: Persist groups, emit sync outcomes, preserve fingerprint generation, and prevent mobile overflow.
Files: sync service, normalizers, worker, public/admin responsive surfaces, docs.
Iterations: Build added group derivation/upserts; Refine deduplicated team membership and isolated jobs; Polish audited tables/bracket/forms and updated durable architecture docs.
Verification: `npm run verify`, syntax checks, and diff checks passed.
Acceptance: [x] core sync coverage; [x] derived refresh retained; [x] responsive scroll/stacks; [x] docs.

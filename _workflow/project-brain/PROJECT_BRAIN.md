# Project Brain

> Generated human-readable projection of `_workflow/project-brain/project.json`.
> JSON is the source of truth. Do not edit this projection as the authoritative memory record.

- Version: `1.0.0`
- Updated at: 2026-06-16T06:33:30+01:00

## Workflow

- Current stage: complete
- Completed stages: intake, spec, planning, TASK-001, TASK-002, TASK-003, review, fallow-quality, release-notes, summary, health-check
- Next stage: none
- Status: complete

## Goals

- Build CupPulse as a public 2026 FIFA Men's World Cup companion powered by Sportmonks and MongoDB Atlas.

## Requirements

- The production MVP uses real Sportmonks World Cup data cached in normalized MongoDB collections and exposes it through CupPulse /api/v1 endpoints.
- CupPulse fixture API responses and fixture cards must display real Sportmonks participant team names and logos when available, preserving team-ID fallback only for unavailable names.

## Constraints

- Mock data is only a development or explicitly enabled outage fallback; paid AI/prediction APIs and user account features are excluded.

## Architecture Decisions

- Deploy separate Heroku web and worker processes; only the worker performs Sportmonks synchronization and MongoDB locks guard refresh jobs.

## Technical Decisions

- Use deterministic team/player-form predictions and template-based structured match summaries with source fingerprints.
- Fixture sync extracts Sportmonks participant team names/logos, stores optional fixture/match display fields, and upserts Team records from named participants.
- Fixture and match API responses enrich homeTeam and awayTeam from cached Team records or persisted fixture display fields while keeping provider fields private.
- Shared match cards render API-provided team logos in fixed-size decorative slots and keep name fallback order as team object, persisted name, team ID, then to-be-confirmed.

## Domain Knowledge

- CupPulse targets the 2026 FIFA Men's World Cup finals and must represent provider-unavailable data explicitly rather than inventing it.

## Open Questions

- None

## Risks

- Sportmonks subscription coverage and pre-tournament field availability may require nullable fields and adaptive includes.
- Fixture participant team data from Sportmonks may be partial before tournament data is final, requiring nullable logos and explicit fallbacks.

## Artifacts

- Active production MVP specification: _workflow/runs/dev/spec.md
- Completed production MVP workflow summary: _workflow/runs/dev/summary.md
- Fixture team-name resolution specification saved at _workflow/runs/dev/spec.md.

## Custom Categories

None registered.

## Recent Changes

- 2026-06-16T05:57:51+01:00: Captured the fixture team-name resolution scope and saved the approval-gated spec.
- 2026-06-16T06:08:00+01:00: User approved the spec and the vertical task plan was saved.
- 2026-06-16T06:18:00+01:00: Completed fixture participant extraction, Team upsert, and sync logging.
- 2026-06-16T06:28:00+01:00: Completed fixture/match API team enrichment.
- 2026-06-16T06:38:00+01:00: Completed fixture-card team name and logo display.
- 2026-06-16T06:33:30+01:00: Completed final review, Fallow Quality, release notes, summary, and health check.

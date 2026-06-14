# Project Brain

> Generated human-readable projection of `_workflow/project-brain/project.json`.
> JSON is the source of truth. Do not edit this projection as the authoritative memory record.

- Version: `1.0.0`
- Updated at: 2026-06-14T05:27:03+01:00

## Workflow

- Current stage: complete
- Completed stages: intake, spec, planning, implementation, verification, review, fallow-quality, release-notes, summary
- Next stage: deployment-smoke
- Status: complete

## Goals

- Build CupPulse as a public 2026 FIFA Men's World Cup companion powered by Sportmonks and MongoDB Atlas.

## Requirements

- The production MVP uses real Sportmonks World Cup data cached in normalized MongoDB collections and exposed through CupPulse `/api/v1` endpoints.

## Constraints

- Mock data is only a development or explicitly enabled outage fallback.
- Paid AI/prediction APIs and user account features are excluded.

## Architecture Decisions

- Deploy separate Heroku web and worker processes.
- Only the worker performs Sportmonks synchronization.
- MongoDB locks guard refresh jobs.

## Technical Decisions

- Use deterministic team/player-form predictions.
- Use template-based structured match summaries with source fingerprints.

## Domain Knowledge

- CupPulse targets the 2026 FIFA Men's World Cup finals.
- Provider-unavailable data must remain explicit rather than fabricated.

## Open Questions

None blocking. Credentialed Sportmonks and Atlas smoke verification remains a deployment activity.

## Risks

- Sportmonks subscription coverage and pre-tournament field availability may require nullable fields and adaptive includes.

## Artifacts

- 2026-06-14: Initialized durable product memory and saved the dev-run specification.
- 2026-06-14: Completed the production MVP workflow; see `_workflow/runs/dev/summary.md`.

## Custom Categories

None registered.

## Recent Changes

- 2026-06-14: All seven approved tasks completed with passing test, lint, and build verification.

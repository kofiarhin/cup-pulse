# Decision Log

Use this file for architecture decision records (ADRs). Record decisions that affect structure, dependencies, deployment, data models, security, or long-term maintenance.

## ADR Template

### ADR-000: `<Decision title>`

Date: `<YYYY-MM-DD>`

Status: `<Proposed / Accepted / Superseded>`

#### Context

`<What problem, constraint, or tradeoff led to this decision?>`

#### Decision

`<What did we decide?>`

#### Alternatives Considered

1. `<Alternative>`
   - Pros: `<Pros>`
   - Cons: `<Cons>`

2. `<Alternative>`
   - Pros: `<Pros>`
   - Cons: `<Cons>`

#### Consequences

Positive:

- `<Positive consequence>`

Negative:

- `<Negative consequence or tradeoff>`

#### Implementation Notes

- `<Files, conventions, migration steps, or follow-up tasks>`

## Decisions

### ADR-001: Separate web and ingestion worker processes

Date: 2026-06-14

Status: Accepted

#### Context

Provider synchronization must not duplicate across horizontally scaled API processes or delay public reads.

#### Decision

Run Express as a read-only Heroku web process and Sportmonks synchronization as a separate worker. Use expiring MongoDB locks for every scheduled job.

#### Alternatives Considered

1. Run timers inside Express.
   - Pros: Fewer process types.
   - Cons: Duplicate jobs, coupled failures, and unpredictable dyno restarts.

#### Consequences

Positive:

- API scaling is independent from provider ingestion.
- Cached reads continue when Sportmonks is unavailable.

Negative:

- Production requires a continuously running worker dyno.

#### Implementation Notes

- Process commands are defined in `Procfile`.
- Refresh intervals and lock TTL are environment-configurable.

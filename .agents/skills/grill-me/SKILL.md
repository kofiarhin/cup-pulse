---
name: grill-me
description: Use as the workflow intake skill before implementation. Stress-test a user request through focused questioning, create shared understanding, then hand off to the normal workflow.
---

# Grill-Me Skill

You are the intake engine for the workflow.

Your job is to turn a rough request into shared understanding before the normal workflow creates `WORK_REQUEST.md`, `_spec/`, or `_task/`.

## When To Use

Use this skill when a user starts a normal workflow request that needs intake.

Do not use this skill when:
- the user says `skip questions`
- the user says `continue workflow`
- the workflow is already in progress and should resume from `_workflow/runs/<run-id>/handoff.md`

## Core Behavior

1. Read the user request.
2. Inspect the repo when an answer can be discovered from code, docs, or workflow files.
3. Ask one focused question at a time.
4. Include a recommended answer with every question.
5. Walk decision branches one-by-one.
6. Resolve dependencies between decisions.
7. Identify scope, risks, edge cases, UX/API/data expectations, and acceptance criteria.
8. Continue until shared understanding is strong enough for the normal workflow.

## Question Format

Use this format:

### Question N

<Question>

### Recommended answer

<Recommended answer>

### Why this matters

<Short reason>

## Do Not

- Do not implement code.
- Do not create `_spec/` or `_task/`.
- Do not sync `WORK_REQUEST.md`.
- Do not ask huge questionnaires.
- Do not ask questions the repo can answer.
- Do not proceed to workflow until shared understanding exists.

## Completion Criteria

Stop grilling when:
- the goal is clear
- scope is clear
- out-of-scope work is clear
- user-facing behavior is clear
- affected surfaces are understood
- acceptance criteria are clear
- remaining unknowns can be documented as assumptions

## Final Output

When complete, output:

# Shared Understanding Handoff

## Original Request
...

## Confirmed Understanding
...

## Decisions Made
- ...

## Assumptions
- ...

## In Scope
- ...

## Out Of Scope
- ...

## Acceptance Criteria
- ...

## Risks And Edge Cases
- ...

## Remaining Open Questions
- ...

## Normalized Workflow Request
workflow ...

## Handoff Rule

After producing the handoff, the normal workflow continues from `Normalized Workflow Request`.

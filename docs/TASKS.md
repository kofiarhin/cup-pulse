# Legacy Task Notes

This is a legacy compatibility document. The main workflow stores authoritative vertical task plans in `_task/`.

Use this file only for durable backlog notes if your team wants a compatibility document. Do not treat this file as the active task plan. Active task plans in `_task/` are authoritative.

Active task plans must be saved as timestamped or slugged files such as:

```txt
_task/2026-05-10-add-dark-theme.md
```

## Task Requirements

Each active task in `_task/` must include:

- Task ID.
- Status.
- Priority: `P0`, `P1`, or `P2`.
- Parallel safe: `yes` or `no`.
- Depends on.
- Blocks.
- File locks.
- Claim status.
- Claimed by.
- Agent role.
- Merge risk.
- Objective.
- Detailed spec sections used or referenced.
- Files likely affected.
- Checklist.
- Iteration plan for Iteration 1 Build, Iteration 2 Refine, and Iteration 3 Polish.
- Test plan.
- Red phase evidence.
- Green phase evidence.
- Refactor phase evidence.
- Test commands run.
- Missing-test exception.
- Acceptance criteria.
- Acceptance result.
- Verification commands.
- Stop condition.
- Out-of-scope items.

For code-changing tasks, each Build, Refine, and Polish iteration must use TDD-first Red -> Green -> Refactor evidence:

- Red phase evidence: relevant tests were added or updated before implementation and the expected failure was observed when possible.
- Green phase evidence: the smallest implementation change was made and passing verification was recorded.
- Refactor phase evidence: cleanup happened without behavior changes and post-cleanup verification was recorded.
- Missing-test exception: any inability to write or observe a failing test first is explicitly justified with the best available verification.

Tasks must be vertical slices and should use Ralph Wiggum-style phrasing: small, literal, concrete, sequential, and easy to verify.

## Durable Backlog Notes

- `<Optional long-lived backlog note>`

# Parallel File Locks

This file tracks file locks for one run. Copy it into `<artifact-root>/parallel/locks.md` when parallel execution is used.

Workers must only update the locks file inside their own run directory.

| File Path | Lock Owner | Worker ID | Task ID | Run ID | Reason | Lock Status | Acquired At | Released At | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `<path>` | `<agent/orchestrator>` | `<worker-id>` | `<TASK-000>` | `<run-id>` | `<why this file is needed>` | `<active / released / blocked / needs-review>` | `<YYYY-MM-DD HH:MM>` | `<YYYY-MM-DD HH:MM or pending>` | `<notes>` |

## Rules

- File locks must be declared before edits.
- No two active workers may hold overlapping file locks.
- Release locks only after final task status, changed files, and verification status are recorded.
- Unexpected overlap must be marked `needs-review` and escalated to the orchestrator.

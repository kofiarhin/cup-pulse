# Parallel Agent Status

This file tracks worker state for one run. Copy it into `<artifact-root>/parallel/agent-status.md` when parallel execution is used.

Workers must only update status inside their own run directory.

| Worker ID | Role | Branch | Worktree Path | Run ID | Current Task | Changed Files | Verification Result | Blocker | Final Status | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `<worker-id>` | `<orchestrator / worker>` | `<branch>` | `<absolute-path>` | `<run-id>` | `<TASK-000 or none>` | `<paths or none>` | `<pending / passed / failed / unable-to-run>` | `<none or details>` | `<pending / done / blocked / needs-review>` | `<notes>` |

## Rules

- Record worker status before editing, after verification, and before stopping.
- Workers stop after one claimed task unless explicitly acting as orchestrator.
- The orchestrator reviews all worker statuses before final verification, review, release notes, and summary.

# Parallel Task Claims

This file tracks task ownership for one run. Copy it into `<artifact-root>/parallel/claims.md` when parallel execution is used.

Workers must only update the claims file inside their own run directory.

| Task ID | Worker ID | Branch | Worktree Path | Run ID | Claim Status | Start Time | End Time | Files Expected | Files Changed | Verification Status | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `<TASK-000>` | `<worker-id>` | `<branch>` | `<absolute-path>` | `<run-id>` | `<unclaimed / claimed / in-progress / done / blocked / needs-review>` | `<YYYY-MM-DD HH:MM>` | `<YYYY-MM-DD HH:MM or pending>` | `<paths>` | `<paths or pending>` | `<pending / passed / failed / unable-to-run>` | `<notes>` |

## Rules

- Claim exactly one eligible task before editing files.
- Record expected files before editing.
- Record changed files and verification status before releasing related locks.
- Do not edit claim rows for another active worker except during orchestrator review.

# Workflow Run Index

This file is optional. Prefer updating it after branches merge.

If an agent updates this file during a workflow run, the update must be append-only and must not rewrite entries from other branches or worktrees.

Active workflow state belongs in:

```txt
_workflow/runs/<run-id>/
```

Active request state belongs in `_workflow/runs/<run-id>/request.md`. Root `WORK_REQUEST.md` is optional/manual compatibility input only.

Do not store active requests, specs, task plans, progress, reviews, verification notes, release notes, summaries, or handoff state directly in this shared index.

Never merge generated workflow reports line by line manually. Preserve each run folder and regenerate aggregate/index state after branches merge.

## Project Brain

Project Brain stores durable JSON memory under `_workflow/project-brain/`. JSON is authoritative; `PROJECT_BRAIN.md` is its generated projection. Each active run also owns `_workflow/runs/<run-id>/brain.json`, `activity.md`, and `checkpoints.md`. Do not place run-local memory in this shared index, and do not destructively merge or replace project memory.

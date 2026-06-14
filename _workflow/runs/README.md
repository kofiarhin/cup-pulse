# Workflow Runs

Each branch or worktree writes generated workflow artifacts to its own run directory:

```txt
_workflow/runs/<branch-or-worktree-id>/
  request.md
  brain.json
  activity.md
  checkpoints.md
  spec.md
  tasks.md
  progress.md
  review.md
  verification.md
  summary.md
  handoff.md
  release-notes.md
  parallel/
    claims.md
    locks.md
    agent-status.md
```

Run id rules:

- Use `CODEX_WORKFLOW_RUN_ID` when it is set.
- Otherwise use the current branch from `git branch --show-current`.
- If the branch is empty, use the current worktree directory name.
- Sanitize `/` and `\` into `__`; replace other unsafe path characters with `-`.

Agents must only update their own run directory. For example, an agent in `dev` writes `_workflow/runs/dev/`; an agent in `redesign` writes `_workflow/runs/redesign/`.

Active request state lives in `<artifact-root>/request.md`. Root `WORK_REQUEST.md` is optional/manual compatibility input only and must not be auto-updated during normal worktree-safe workflow runs.

Parallel coordination files live under `<artifact-root>/parallel/` during a run. In codex-workflow-kit, the committed source templates live under `templates/_workflow/runs/parallel/`; after installation, `_workflow/runs/parallel/` contains static starting points for `claims.md`, `locks.md`, and `agent-status.md`.

Never merge generated workflow reports line by line manually. If `_workflow` conflicts during a merge, preserve each run directory, regenerate any aggregate/index state after branches merge, treat run folders as branch/worktree-local memory, and perform final orchestration after branch merge.

## Project Brain

Project Brain uses `_workflow/project-brain/project.json` for durable project memory and creates `brain.json`, `activity.md`, and `checkpoints.md` inside every active run directory. JSON is the source of truth; activity and checkpoints are append-only. Generic seeds are installed under `_workflow/templates/run/`. Preserve existing memory and reconcile completed execution evidence from `progress.md` instead of overwriting it.

# Work Request

This file is optional/manual compatibility input. It is no longer auto-managed during normal worktree-safe workflow runs.

Active request state belongs in `_workflow/runs/<run-id>/request.md`, where `<run-id>` is derived from the current branch/worktree or `CODEX_WORKFLOW_RUN_ID`.

Users do not need to edit this file manually. You may edit it when you want to stage a request for an older workflow or for a new run before the agent has created `_workflow/runs/<run-id>/request.md`.

The workflow will invoke the grill-me skill at `.agents/skills/grill-me/SKILL.md` to build shared understanding, sync the active request to `_workflow/runs/<run-id>/request.md`, run dirty worktree protection, generate a saved spec in `_workflow/runs/<run-id>/spec.md`, stop for explicit user approval, create a vertical task plan in `_workflow/runs/<run-id>/tasks.md` only after approval, execute tasks one by one until the request is complete or stopped, record acceptance results, update run-scoped progress and handoff after each task, run a final diff audit, write a workflow review, create release notes, and write a final summary in the same run directory.

## Request

`<Optional manually staged request, e.g. Add dark theme to the app.>`

## Question Preference

Choose one:

- `grill-me intake`: default. Use the grill-me skill at `.agents/skills/grill-me/SKILL.md` to create shared understanding before writing the spec.
- `skip questions`: do not ask questions; generate a best-effort spec and record assumptions.

Default: `grill-me intake`

## Optional Execution Preference

Choose one:

- `plan-only`: run grill-me intake, write spec, wait for approval, write task plan, then stop.
- `single-task`: run grill-me intake, write spec, wait for approval, write task plan, execute only the next ready task, verify and review it, update artifacts, then stop.
- `complete-workflow`: run grill-me intake, write spec, wait for approval, write task plan, then execute all generated tasks sequentially until the request/spec is complete or a stop condition is reached.

Default: `complete-workflow`

## Optional Context

- User or business goal: `<Why this matters>`
- Target users: `<Who uses this>`
- Expected behavior: `<What should happen>`
- UI expectations: `<Screens, components, states, accessibility, responsive behavior>`
- API expectations: `<Endpoints, payloads, errors, auth, permissions>`
- Data model expectations: `<Fields, relationships, migrations, defaults>`
- Edge cases: `<Failure states, empty states, permissions, limits>`
- Constraints: `<Do not change X / must use Y / no new dependencies>`
- Success criteria: `<How we know this is done>`
- Preferred verification: `<Test command, manual check, build command>`
- Dirty worktree notes: `<Existing dirty files, planned files, overlap risk>`
- Release notes expectations: `<User-facing changes, developer changes, known limitations>`

## Out Of Scope

- `<File, feature, API, behavior, or area that should stay untouched>`

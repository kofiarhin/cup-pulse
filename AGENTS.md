# Agent Operating Guide

This file defines how AI coding agents should work in this repository. It is intended for OpenAI Codex, Claude Code, Cursor, and similar tools.

Customize placeholders before using this in a production project. MERN is the default example stack, but these rules apply to any stack.

## Project Context

- Project name: `<PROJECT_NAME>`
- Product summary: `<ONE_SENTENCE_PRODUCT_SUMMARY>`
- Primary stack: MERN by default unless changed
  - Frontend: React, Vite, Tailwind CSS
  - Backend: Node.js, Express, MongoDB, Mongoose
  - Testing: Vitest/React Testing Library for frontend, Jest/Supertest for backend
- Deployment: `<DEPLOYMENT_TARGETS>`
- Workflow entrypoints:
  - `<artifact-root>/request.md` (active run-scoped request state)
  - `WORK_REQUEST.md` (optional/manual compatibility input)
  - `RUN_WORKFLOW.md`
  - `.agents/skills/grill-me/SKILL.md`
  - `.skills/design-taste-frontend/SKILL.md`
- Workflow artifact scope:
  - First detect current branch with `git branch --show-current`.
  - First detect current worktree path with `git rev-parse --show-toplevel`.
  - Run id defaults to current branch and may be overridden with `CODEX_WORKFLOW_RUN_ID`.
  - Sanitize `/` and `\` in run ids to `__`.
  - Active artifact root is `_workflow/runs/<run-id>/`.
  - Agents must update only their own run directory.
  - Shared `_workflow/index.md` and `_workflow/runs/README.md` are optional index/guidance files only.
- Main workflow memory:
  - `<artifact-root>/request.md`
  - `<artifact-root>/handoff.md`
  - `<artifact-root>/spec.md`
  - `<artifact-root>/tasks.md`
  - `<artifact-root>/progress.md`
  - `<artifact-root>/review.md`
  - `<artifact-root>/summary.md`
  - `<artifact-root>/release-notes.md`
  - `.workflow/fallow-audit.md`
  - `_decisions/`
- Reusable `polish-ui` workflow artifacts:
  - Use `.workflow/artifacts/polish-ui/` for polish-specific evidence and artifacts.
  - Activate `polish-ui` only for UI redesign, UI polish, and frontend interface refinement tasks such as `polish ui`, `redesign ui`, `improve this interface`, `make this screen production-ready`, `visual polish pass`, and `refine this frontend`.
  - Keep the default workflow intact and keep existing conditional frontend taste routing for frontend UI code generation, JSX/TSX markup, and CSS/Tailwind styling.
  - Reuse `.skills/design-taste-frontend/SKILL.md` before implementation for audit and after implementation for final UI review.
  - Record `Applied skill: design-taste-frontend` whenever the taste skill is applied.
  - Do not force screenshots when browser automation is unavailable; use code-surface review as the fallback.
- Fallow Quality layer:
  - Store the official Fallow skill locally at `layers/fallow-quality/SKILL.md` with references in `layers/fallow-quality/references/`.
  - Apply Fallow as a mandatory JavaScript/TypeScript codebase intelligence layer after tests/lint/typecheck/build and review, but before handoff, release notes, and final health check.
  - Use Fallow for cleanup opportunities, unused files/exports/types/dependencies, unlisted dependencies, duplicates, circular dependencies, re-export cycles, complexity hotspots, architecture boundary violations, feature flag patterns, opt-in security candidates, changed-code PR risk, refactoring targets, and health scores.
  - Do not use Fallow as a TypeScript replacement, ESLint replacement, formatter, verified SAST/security scanner, or bundle size analyzer.
  - Always run Fallow with machine-readable JSON, `--quiet`, `--explain`, `2>/dev/null`, and `|| true`; never use `2>&1`; treat exit code 2 as real failure.
  - Create or refresh `.workflow/fallow-audit.md` with the required Fallow Audit sections and a `PASSED`, `PARTIAL`, or `FAILED` verdict.
- Supporting docs:
  - `docs/PROJECT_CONTEXT.md`
  - `docs/ARCHITECTURE.md`
  - `docs/VERIFY.md`
  - `docs/DECISIONS.md`
  - `docs/PROMPTS.md`

## Operating Rules

1. If the latest user prompt looks like project work, treat it as the active work request and route it through `RUN_WORKFLOW.md`.
2. Project work includes requests such as `implement`, `fix`, `create`, `generate`, `audit`, `refactor`, `test`, `document`, `deploy`, `review`, or similar software changes.
3. Automatically sync the active user prompt into `<artifact-root>/request.md` only after grill-me has produced the Shared Understanding Handoff, unless `skip questions` is set (in which case sync immediately). Do not auto-update root `WORK_REQUEST.md`; it is optional/manual compatibility input only. Do not ask the user to manually edit workflow docs first.
4. Default execution mode is `complete-workflow`.
5. Execution modes:
   - `plan-only`: run grill-me intake, write spec, stop for spec approval, write task plan only after approval, then stop.
   - `single-task`: run grill-me intake, write spec, stop for spec approval, write task plan only after approval, execute only the next ready task through the full 3-pass hardening loop, update artifacts, then stop.
   - `complete-workflow`: run grill-me intake, write spec, stop for spec approval, write task plan only after approval, then execute all generated tasks sequentially until the request/spec is complete or a stop condition is reached; each executable task must complete the full 3-pass hardening loop before the next task starts.
6. Agents must not stop after `TASK-001` unless execution mode is explicitly `single-task` or a stop condition is reached.
7. Agents must continue through `TASK-002`, `TASK-003`, and later tasks automatically when the current task is `Done` and safe to continue.
8. Workflow requests must use the grill-me skill at `.agents/skills/grill-me/SKILL.md` as the default intake engine before any spec, task plan, or implementation work.

9. Preserve the existing workflow sequence. Conditional frontend taste routing does not create a new default workflow or bypass intake, spec approval, task planning, task execution, verification, review, release notes, summary, or health check.
9A. Keep the workflow order as Intake -> Spec -> Plan -> Implementation -> Verification -> Review -> Fallow Quality -> Handoff -> Release Notes -> Final Health Check. Fallow Quality runs after tests/lint/typecheck/build and review, but before handoff, release notes, and final health check.
10. Load/apply `.skills/design-taste-frontend/SKILL.md` only when a task or work surface involves frontend UI code generation, JSX/TSX markup, CSS/Tailwind styling, UI redesign, or UI polish.
11. Do not apply `.skills/design-taste-frontend/SKILL.md` for backend-only, API-only, database-only, auth-only, test-only, or docs-only tasks.
12. For mixed frontend/backend tasks, apply `.skills/design-taste-frontend/SKILL.md` only to the frontend UI work. Backend, API, database, auth, test-only, and docs-only work proceeds without the taste skill.
13. When the skill is applied, record this exact line in task evidence and downstream workflow artifacts: `Applied skill: design-taste-frontend`.
14. Do not create a separate taste skill.
15. If frontend UI scope is discovered after spec generation, pause before frontend UI edits, read the taste skill, update spec/task acceptance criteria for the frontend UI work, record `Applied skill: design-taste-frontend`, then continue.
16. Grill-me asks one focused question at a time and includes a recommended answer with every question.
17. Grill-me inspects the repo (code, docs, workflow files) instead of asking when an answer can be discovered locally.
18. The normal workflow starts only after grill-me has produced the Shared Understanding Handoff and the normalized request has been synced into `<artifact-root>/request.md`.
19. Do not touch code, create `<artifact-root>/spec.md`, or create `<artifact-root>/tasks.md` during the grill-me intake phase.
20. If the user says `skip questions`, bypass grill-me, generate a best-effort spec, and clearly record assumptions.
21. If the user says `continue workflow`, do not invoke grill-me; resume from `<artifact-root>/handoff.md`.
22. No implementation is allowed without a saved spec in `<artifact-root>/spec.md`.
23. No task plan may be generated until the saved spec has explicit user approval.
24. No implementation is allowed without a saved task plan in `<artifact-root>/tasks.md`.
25. Before planning, read `<artifact-root>/handoff.md` if it exists, `<artifact-root>/progress.md`, and the latest relevant file in `<artifact-root>/summary.md`.
26. Before touching code for any task, read `<artifact-root>/handoff.md`, `<artifact-root>/progress.md`, and the latest relevant file in `<artifact-root>/summary.md`.
27. Read `RUN_WORKFLOW.md` before planning or editing.
28. Read `docs/PROJECT_CONTEXT.md` and relevant supporting docs before implementation, updating them only when durable project facts change.
29. Generate the active spec at `<artifact-root>/spec.md`.
30. Display the spec summary and path, then stop for explicit approval using the approval gate in `RUN_WORKFLOW.md`.
31. Generate a vertical task plan in `<artifact-root>/tasks.md` from the approved saved spec.
32. Tasks must be vertical slices of user-visible or independently verifiable value, not vague frontend/backend/database layers.
33. Break work into Ralph Wiggum-style tasks: small, literal, safe, sequential steps that are easy to follow and hard to misinterpret.
34. Implement tasks sequentially, one task at a time.
35. Keep changes scoped to the active task.
36. Never implement unrelated work.
37. Every task must move through `Planned -> Ready -> In Progress -> Verified -> Reviewed -> Done`.
38. Every executable task must run through Iteration 1 Build, Iteration 2 Refine, and Iteration 3 Polish before it can be marked `Done`.
39. For every code-changing task, each Build, Refine, and Polish iteration must embed TDD-first Red -> Green -> Refactor: write or update the failing test first, verify the expected failure, implement the smallest passing change, verify tests pass, refactor without changing behavior, and verify tests still pass.
40. Each iteration must include documented goal, changes made, test plan, Red phase evidence, Green phase evidence, Refactor phase evidence, test commands run, verification command/result, review findings, acceptance status, remaining issues, and next action.
41. Allowed terminal task states are `Done`, `Blocked`, and `Needs Human Review`.
42. A task cannot be `Done` unless all three iterations are complete, verification was attempted in each iteration, the task was reviewed in each iteration, and final acceptance is complete.
43. A code-changing task cannot be `Done` unless relevant tests were added or updated first, the failing test was observed before implementation when possible, passing verification was recorded after implementation and after refactor, and any missing-test exception is explicitly justified.
44. A task cannot move to `Reviewed` unless verification was attempted.
45. If verification cannot run, the task can be `Needs Human Review`, not `Done`.
46. Never skip verification. If verification cannot run, document the reason and the best available manual check.
47. Record acceptance results for every task. A task cannot be `Done` unless every required acceptance criterion is checked `[x]`; `[ ]` or `[~]` means `Blocked` or `Needs Human Review`.
48. If verification fails during any iteration, follow the failure recovery protocol inside that iteration: identify the failing command, capture the error, classify the failure, fix only in-scope issues, rerun the exact failing command, and stop with `Needs Human Review` if targeted recovery does not prove the task.
49. After each task, append progress to `<artifact-root>/progress.md`, including separate iteration evidence, TDD-first evidence for code-changing tasks, acceptance results, and any failure recovery notes.
50. After each task, update `<artifact-root>/handoff.md` so it reflects the latest completed task, current task, current iteration, current phase, blockers, dirty worktree status, verification status, acceptance status, iteration evidence status, and next step.
51. Always keep `<artifact-root>/handoff.md` current; do not leave handoff stale after task execution.
52. The handoff file should allow another agent/session to resume without rereading the entire conversation.
53. `continue workflow` must start from `<artifact-root>/handoff.md`.
54. If `<artifact-root>/handoff.md` conflicts with `<artifact-root>/progress.md`, trust `<artifact-root>/progress.md` for completed task history and update handoff accordingly.
55. Before final review and summary, run or document the final diff audit with `git diff --stat` and `git diff` when available.
56. After all executable tasks are complete or a stop condition is reached, create a review file in `<artifact-root>/review.md`.
56A. After review, run the Fallow Quality layer and create `.workflow/fallow-audit.md` before handoff, release notes, summary, and final health check.
57. After review and the Fallow Quality layer, create release notes in `<artifact-root>/release-notes.md`.
58. After release notes are complete, create or append a summary in `<artifact-root>/summary.md` and update `<artifact-root>/handoff.md`.
59. Record meaningful architecture or product decisions in `_decisions/`; do not create decision files for routine edits.
60. Before the final response, run the workflow health check.
61. Continue to the next task only when the current task completed Build -> Refine -> Polish, is verified, reviewed, documented, all required TDD evidence for code-changing tasks is documented or explicitly excepted, all required acceptance criteria are met, and safe to continue.
62. Stop if scope is unclear, risky, destructive, unverified, blocked, or requires unavailable access.
63. Final review, release notes, and summary must represent the full completed request or documented stop state, not only the first task.

## Project Brain Rules

Project Brain is mandatory backend workflow memory; it is not a separate UI. Users stay in CLI chat while agents maintain structured memory and provide compact live activity.

### Required Memory Files

Project-level JSON and projection:

- `_workflow/project-brain/project.json`
- `_workflow/project-brain/PROJECT_BRAIN.md`
- `_workflow/project-brain/history.json`
- `_workflow/project-brain/conflicts.json`
- `_workflow/project-brain/categories.json`

Run-scoped memory under the active artifact root:

- `<artifact-root>/brain.json`
- `<artifact-root>/activity.md`
- `<artifact-root>/checkpoints.md`

After artifact-root detection, initialize missing files from installed seeds without replacing existing memory. Before planning or implementation, read `_workflow/project-brain/project.json`, `_workflow/project-brain/categories.json`, `_workflow/project-brain/conflicts.json`, `<artifact-root>/brain.json`, `<artifact-root>/handoff.md`, and `<artifact-root>/progress.md`.

### Authority And Context

JSON is the source of truth. `PROJECT_BRAIN.md` is a generated human-readable projection. Project Brain is authoritative for current workflow state and durable memory; completed task execution evidence in `progress.md` remains authoritative for completed task history and must be reconciled into Project Brain without erasure.

Always inject relevant active goals, constraints, architecture decisions, technical decisions, and current workflow state. Conditionally inject related requirements, artifacts, domain knowledge, and similar previous decisions. Never inject the entire chat history, stale run data, superseded decisions except for conflict context, or low-confidence assumptions unless marked as assumptions.

### Update And Conflict Rules

- Automatically extract memory after intake, after spec creation, after task planning, after task completion, after review, after release notes, and after summary.
- Never destructively overwrite memory. Preserve old values using stable IDs, statuses, `supersedes`, item history, `changeLog`, and `_workflow/project-brain/history.json`.
- Every item supports `id`, `text`, `status`, `confidence`, source metadata, timestamps, `supersedes`, and `history`.
- AI-created categories may exist only in the governed `custom.<category>` custom namespace registered in `categories.json`; do not add arbitrary top-level categories.
- Detect contradictions before promotion. Keep both items and create/update `conflicts.json`. Explicit high-confidence user corrections become active; replaced items become superseded. Unclear conflicts remain open and may require human review.
- Record conflict detection/resolution in project and run change logs, history, activity, and a conflict-resolved checkpoint.
- Refresh `PROJECT_BRAIN.md` after project-memory changes.
- In parallel workflows, only the orchestrator writes shared project memory; workers record run-local/proposed changes for reconciliation.

### Activity And Checkpoints

After meaningful grouped changes, append to `<artifact-root>/activity.md` and show this compact block in chat:

```txt
Activity
- Stage: <from> → <to>
- Memory: <added/updated/conflict/resolved>
- Artifact: <created/updated path>
- Checkpoint: <saved/not saved>
- Next: <next action>
```

Append a non-destructive checkpoint to `<artifact-root>/checkpoints.md` at intake complete, spec saved, task plan saved, each task done, workflow complete, and conflict resolved. Include timestamp, stage, memory summary, artifacts changed, open questions, and next action.

## Required Workflow

For a work request:

1. Resolve branch, worktree, run id, and artifact root; initialize/read Project Brain before request resolution or planning.
2. Use the latest direct user prompt as the active request when it looks like project work; otherwise read `<artifact-root>/request.md`, falling back to root `WORK_REQUEST.md` only as manual legacy input.
3. Invoke the grill-me skill at `.agents/skills/grill-me/SKILL.md` to produce a Shared Understanding Handoff, unless the prompt explicitly says `skip questions` or `continue workflow`.
4. Sync the normalized active request into `<artifact-root>/request.md`; do not auto-update root `WORK_REQUEST.md`.
5. Read `RUN_WORKFLOW.md`.
6. If questions are skipped, bypass grill-me and write assumptions into the spec. If the prompt is `continue workflow`, skip grill-me and resume from `<artifact-root>/handoff.md`.
7. Check repository status for dirty worktree protection:

   ```bash
   git status --short
   ```

   Document existing dirty files, files planned for this workflow, and overlap risk. If dirty files overlap with planned files, stop and ask before editing. If dirty files are unrelated, continue but document them. Never overwrite user changes and never clean/reset files unless explicitly instructed.
8. Read `<artifact-root>/handoff.md` if it exists, `<artifact-root>/progress.md`, the latest relevant `<artifact-root>/summary.md` entry, and durable supporting docs.
9. Generate a detailed spec in `<artifact-root>/spec.md` using the required detailed spec template.
10. Display the spec summary and path, then stop for explicit approval using the approval gate in `RUN_WORKFLOW.md`.
11. Generate a vertical task plan in `<artifact-root>/tasks.md` from the approved saved detailed spec only after approval.
12. If execution mode is `plan-only`, stop after saving the approved spec-derived task plan.
13. If execution mode is `single-task`, execute only the next ready task through the full 3-pass hardening loop, update artifacts, then stop.
14. If execution mode is omitted, use `complete-workflow`.
15. In `complete-workflow`, execute every task in order until all tasks are complete or a stop condition is reached; each executable task must complete Build -> Refine -> Polish before the next task starts.
16. For each task:
    - read latest `<artifact-root>/progress.md`
    - read relevant `<artifact-root>/summary.md`
    - inspect the codebase for the current task
    - implement only the current task through Iteration 1 Build, using Red -> Green -> Refactor for code-changing work
    - refine only in-scope issues through Iteration 2 Refine, using Red -> Green -> Refactor for code-changing work
    - polish and harden through Iteration 3 Polish, using Red -> Green -> Refactor for code-changing work
    - verify, critique, and record evidence inside each iteration
    - append progress to `<artifact-root>/progress.md`
    - update `<artifact-root>/handoff.md`
    - continue to the next task automatically only when the current task is `Done` and safe
17. Before final review/summary, run the final diff audit:

    ```bash
    git diff --stat
    git diff
    ```

    Document whether the diff matches the saved spec, unrelated files were touched, workflow artifacts were updated correctly, tests were added or updated for changed behavior, scope creep occurred, generated junk or temporary files appeared, and sensitive values or secrets were accidentally added. If either command cannot run, document why.
18. After all allowed tasks are complete or the workflow stops, create a review file in `<artifact-root>/review.md`.
19. After the review, run the Fallow Quality layer and create `.workflow/fallow-audit.md`.
20. After the Fallow Quality layer, create release notes in `<artifact-root>/release-notes.md`.
21. After release notes, create or append a summary in `<artifact-root>/summary.md`.
22. Run the workflow health check and mark the result as `Passed`, `Partial`, or `Failed`.
23. Check repository status again:

    ```bash
    git status --short
    ```

24. Summarize results, include the final artifact checklist, and suggest a commit message.

## Continue Workflow Command

If the user says `continue workflow`:

1. Resolve the artifact root, initialize/read Project Brain first, and reconcile current workflow state against completed evidence in `<artifact-root>/progress.md`.
2. Read `<artifact-root>/handoff.md` first and use it as the primary resume source.
3. Read `<artifact-root>/progress.md` to verify completed task history.
4. If `<artifact-root>/handoff.md` conflicts with `<artifact-root>/progress.md`, trust `<artifact-root>/progress.md` for completed task history and update handoff.
5. Read the latest relevant file in `<artifact-root>/summary.md`, if any.
6. If a spec exists but no task plan exists for the active request, resume at the spec approval gate, show the spec summary and path again, and wait for approval. Do not auto-generate tasks.
7. If a task plan exists, read the task plan referenced by `<artifact-root>/handoff.md`, or the latest file in `<artifact-root>/tasks.md` if handoff has no task plan.
8. Read the spec referenced by that task plan.
9. Find the next task whose status is not `Done` and the current iteration recorded in `<artifact-root>/handoff.md`.
10. Continue from that task and iteration without asking the original intake questions again unless the request, scope, or acceptance criteria are unclear.
11. Continue executing remaining tasks sequentially until all tasks are complete or a stop condition is reached; each executable task must complete the full 3-pass hardening loop before the next task starts.
12. Do not regenerate the entire spec unless the request changed.
13. If every task is `Done`, continue with any missing `<artifact-root>/review.md`, `<artifact-root>/summary.md`, handoff update, workflow health check, or final response steps.

## Questioning Rules

Use the grill-me skill at `.agents/skills/grill-me/SKILL.md` as the default intake engine for every workflow request. Grill-me asks one focused question at a time, includes a recommended answer with every question, and inspects the repo instead of asking when an answer can be discovered from code, docs, or workflow files. The normal workflow only starts after grill-me has produced the Shared Understanding Handoff.

Grill-me must cover:

- Goal and business/user value.
- Primary users and roles.
- Exact behavior and expected workflow.
- UI, API, data model, and state expectations.
- Edge cases and failure states.
- Constraints, dependencies, and compatibility requirements.
- Success criteria and verification.
- Explicitly out-of-scope work.

Stop grilling when the goal, scope, out-of-scope work, user-facing behavior, affected surfaces, and acceptance criteria are clear, or when the remaining unknowns can be documented as assumptions.

`skip questions` bypasses grill-me and proceeds with a best-effort spec that records assumptions. `continue workflow` bypasses grill-me and resumes from `<artifact-root>/handoff.md`.

## Spec Rules

Each spec in `<artifact-root>/spec.md` must be a detailed, implementation-aware execution blueprint. Use `Not applicable` for irrelevant sections. Do not delete required sections.

# Detailed Spec Template

## 1. Metadata
- Spec filename:
- Date:
- Request ID / slug:
- Request source:
- Execution mode:
- Request classification:
- Scope level:
- Risk level:

## 2. Original Request
- Raw user request:
- Normalized request:
- Source prompt / `<artifact-root>/request.md` reference:

## 3. Questions And Answers
- Questions asked:
- Answers received:
- Questions skipped:
- Remaining open questions:

## 4. Problem Definition
- Problem being solved:
- Why it matters:
- Current pain point:
- Expected value:

## 5. Current State Analysis
- Existing behavior:
- Existing architecture/components:
- Existing files/modules likely involved:
- Existing data flow:
- Existing API/UI/CLI/workflow behavior:
- Existing tests or verification coverage:

## 6. Desired End State
- Expected final behavior:
- User-facing outcome:
- Developer-facing outcome:
- System/workflow outcome:
- Backward compatibility expectations:

## 7. Scope
- In scope:
- Out of scope:
- Non-goals:
- Explicit boundaries:

## 8. Users And Use Cases
- Primary users:
- Secondary users:
- Main use cases:
- Edge use cases:

## 9. Functional Requirements
- Required behaviors:
- Inputs:
- Outputs:
- State changes:
- Error states:
- Permissions/auth expectations:

## 10. Non-Functional Requirements
- Performance expectations:
- Reliability expectations:
- Security/privacy expectations:
- Accessibility expectations:
- Maintainability expectations:
- DX expectations:

## 11. Affected Surfaces
- Files likely affected:
- Directories likely affected:
- UI surfaces:
- API routes:
- Components:
- Services:
- Database/schema:
- Config/env vars:
- Tests:
- Docs:
- Workflow artifacts:

## 12. Dependency And Integration Map
- Internal dependencies:
- External packages/services:
- Integration points:
- Ordering constraints:
- Migration/setup requirements:

## 13. Data And State Impact
- Data models:
- Database changes:
- State management changes:
- Cache/session/local storage impact:
- Backward compatibility impact:

## 14. UX / API / Workflow Expectations
- UX expectations:
- API contract expectations:
- CLI/workflow behavior:
- Error handling expectations:
- Empty/loading/success/failure states:

## 15. Execution Strategy
- Recommended implementation approach:
- Suggested sequencing:
- Safe rollout/migration approach:
- Files to inspect before editing:
- Decisions to avoid until more evidence exists:

## 16. Verification Strategy
- Required automated checks:
- Required manual checks:
- Test types needed:
- Build/lint/typecheck expectations:
- Acceptance evidence required:
- Proof of completion:

## 17. Acceptance Criteria
- [ ] Concrete measurable criterion 1
- [ ] Concrete measurable criterion 2
- [ ] Concrete measurable criterion 3

## 18. Edge Cases And Failure Modes
- Edge cases:
- Failure modes:
- Regression risks:
- Recovery expectations:

## 19. Risks And Mitigations
- Technical risks:
- Product/UX risks:
- Security risks:
- Scope risks:
- Mitigation plan:

## 20. Assumptions
- Explicit assumptions:
- Confidence level:
- What to revisit if assumptions are wrong:

## 21. Open Questions
- Blocking questions:
- Non-blocking questions:
- Execution impact:

## 22. Task Extraction Notes
- Suggested vertical task boundaries:
- Suggested first task:
- Suggested task ordering:
- Areas that should not become separate tasks:
- How the 3-pass Build -> Refine -> Polish loop should apply:

Use timestamped or slugged filenames, such as:

```txt
<artifact-root>/spec.md
```

## Task Planning Rules

Each task plan in `<artifact-root>/tasks.md` must include:

- Spec file used.
- Planning date.
- Progress and summary files read.
- Detailed spec sections used to derive or justify the task plan.
- Task list.

Task planning must be derived from the saved detailed spec, not from the raw request alone. The plan must cite or reference the detailed spec sections it used, especially affected surfaces, dependency and integration map, data and state impact, UX/API/workflow expectations, execution strategy, verification strategy, acceptance criteria, edge cases, risks and mitigations, assumptions, open questions, and task extraction notes.

Each task must include:

- Task ID.
- Status.
- Objective.
- Files likely affected.
- Checklist.
- Iteration plan for Iteration 1 Build, Iteration 2 Refine, and Iteration 3 Polish.
- Test plan.
- Red phase evidence.
- Green phase evidence.
- Refactor phase evidence.
- Test commands run.
- Acceptance criteria.
- Acceptance result.
- Verification commands.
- Stop condition.
- Out-of-scope items.

Each iteration plan must include:

- Goal.
- Changes made.
- Test plan.
- Red phase evidence.
- Green phase evidence.
- Refactor phase evidence.
- Test commands run.
- Verification command/result.
- Review findings.
- Acceptance status.
- Remaining issues.
- Next action.

Task statuses must follow this lifecycle:

```txt
Planned -> Ready -> In Progress -> Verified -> Reviewed -> Done
```

Allowed terminal states:

- `Done`
- `Blocked`
- `Needs Human Review`

Rules:

- A task cannot be `Done` unless all three iterations are complete, verification was attempted in each iteration, the task was reviewed in each iteration, and final acceptance is complete.
- A code-changing task cannot be `Done` unless relevant tests were added or updated first, the failing test was observed before implementation when possible, passing verification was recorded after implementation and after refactor, and any missing-test exception is explicitly justified.
- A task cannot move to `Reviewed` unless verification was attempted.
- If verification cannot run, the task can be `Needs Human Review`, not `Done`.
- A task cannot be `Done` unless every required acceptance criterion is checked `[x]`.
- If any acceptance result is `[ ]` or `[~]`, the task must be `Blocked` or `Needs Human Review`.
- If required iteration evidence is missing, the task cannot be `Done` and workflow health must be `Partial` or `Failed`.

Acceptance results use:

- `[x] Criterion met`
- `[ ] Criterion not met`
- `[~] Partially met with notes`

Tasks must be vertical slices. Prefer tasks like `TASK-001: Add theme toggle through settings and persist preference` over tasks like `TASK-001: Update frontend`.

## Ralph Wiggum Task Style

Tasks should be small enough that the agent can say exactly what it is doing without interpretation.

Good task shape:

- One concrete outcome.
- One narrow set of files.
- Plain verbs.
- No bundled refactors.
- Clear stop condition.
- Clear verification.

Example:

```md
### TASK-001: Add dark theme toggle in settings

Objective:
Add one visible settings toggle that switches the app between light and dark themes.
```

## Progress Tracking

Maintain `<artifact-root>/progress.md`.

`<artifact-root>/progress.md` is append-only task history. It records what happened over time and is authoritative for completed task history.

`<artifact-root>/handoff.md` is the live resume state. Keep it updated with the current phase, active files, last completed task, current task, next task, blockers, verification status, and workflow health status.

After each task, append:

- Task ID.
- Status.
- Lifecycle transition reached.
- Files changed.
- Iteration evidence for Iteration 1 Build, Iteration 2 Refine, and Iteration 3 Polish.
- Test plan, Red phase evidence, Green phase evidence, Refactor phase evidence, and test commands run for each code-changing iteration, or an explicit missing-test exception.
- Acceptance result.
- Verification result.
- Failure recovery notes, if verification failed.
- Review result.
- Blockers.
- Next step.

Do not replace previous progress entries.

## Summary Rules

After implementation and before the final summary, create a review file in `<artifact-root>/review.md`.

The review must include:

- Request.
- Spec file used.
- Task plan used.
- Tasks reviewed.
- Bugs found.
- Scope creep check.
- Final diff audit.
- Failure recovery notes.
- Missing tests.
- Security concerns.
- Architecture concerns.
- Follow-up tasks.
- Final review verdict.

After the review is complete, create release notes in `<artifact-root>/release-notes.md`, then create or append a summary in `<artifact-root>/summary.md`.

The release note must include:

- Request.
- User-facing changes.
- Developer changes.
- New routes/APIs.
- New env vars.
- Database/schema changes.
- Dependencies added/removed.
- Test commands run.
- Known limitations.
- Follow-up work.
- Suggested commit message.

If there are no user-facing changes, say so. If there are no new APIs, env vars, dependencies, or schema changes, say `none`.

`<artifact-root>/summary.md` is completed workflow history. It records finished workflow runs and should not replace the live state in `<artifact-root>/handoff.md`.

The summary must include:

- Request.
- Spec file used.
- Whether the detailed spec was complete or had gaps, including any missing required sections and whether they were repaired before planning.
- Task plan used.
- Review file used.
- Tasks completed.
- Iteration evidence summary.
- Files changed.
- Verification run.
- Acceptance results.
- Failure recovery notes.
- Final diff audit.
- Release notes file used.
- Unresolved issues.
- Next recommended work.

## Workflow Health Check

Project Brain health is mandatory. Missing or invalid required brain JSON, destructive memory loss, ungoverned custom categories, or unreconciled workflow-state conflicts make health `Failed`; missing projection, activity, checkpoint, or extraction evidence makes health `Partial` or `Failed` according to severity.

Before the final response, check:

- Did project and run Project Brain JSON exist and parse?
- Did `_workflow/project-brain/PROJECT_BRAIN.md` match active JSON memory?
- Were memory extraction, activity, checkpoints, conflicts, and category governance completed non-destructively?

- Did `<artifact-root>/request.md` sync?
- Did `<artifact-root>/handoff.md` exist and reflect the latest workflow state?
- Did the spec file exist?
- Did the spec include every required detailed spec section, or was any missing section repaired before planning?
- Was the spec approval gate shown after saving the spec and before task planning?
- Was explicit user approval recorded before `<artifact-root>/tasks.md` generation?
- Did the task plan exist?
- Was progress updated?
- Was the review created?
- Was the summary created?
- Were release notes created?
- Did `.workflow/fallow-audit.md` exist?
- Did the final health check verify `.workflow/spec.md`, `.workflow/task-plan.md`, `.workflow/handoff.md`, `.workflow/release-notes.md`, and `.workflow/fallow-audit.md`?
- Were tests/lint/typecheck/build statuses recorded?
- Was the Fallow verdict recorded?
- Was required iteration evidence recorded for every executable task?
- Was TDD-first evidence recorded for every code-changing task, including first-test Red evidence, expected failure when possible, Green verification, Refactor verification, and any justified missing-test exception?
- Was the final diff audit completed or documented?
- Was the dirty worktree checked?
- Were acceptance results completed?
- Were verification commands run or documented?
- Was scope respected?
- Were decisions recorded if needed?

Final health status must be one of:

- `Passed`
- `Partial`
- `Failed`

`Passed` requires a synced `<artifact-root>/request.md`, root `WORK_REQUEST.md` left manual/compatibility-only, a detailed spec with every required section, explicit spec approval before task planning, a task plan derived from and citing or referencing the approved detailed spec, progress, handoff, review, summary, release notes, `.workflow/fallow-audit.md` with a recorded Fallow verdict, recorded tests/lint/typecheck/build status, required iteration evidence for every executable task, required TDD-first evidence for every code-changing task or justified missing-test exceptions, final diff audit completed or documented, dirty worktree checked, acceptance results completed, verification run or documented, scope respected, and decisions recorded if needed.

If release notes, `.workflow/fallow-audit.md`, a Fallow verdict, tests/lint/typecheck/build status, final diff audit, dirty worktree check, required detailed spec sections, explicit spec approval before task planning, iteration evidence, TDD-first evidence for code-changing tasks, or acceptance results are missing, health must be `Partial` or `Failed` depending on severity. If `<artifact-root>/tasks.md` was generated before explicit approval or workflow execution continued without user confirmation, health must be `Partial` or `Failed` depending on severity. If any required artifact is missing, mark workflow health as `Failed`.

## Implementation Boundaries

Agents must not:

- Touch implementation code before questions, spec, spec approval, and task plan are complete.
- Implement without a saved spec in `<artifact-root>/spec.md`.
- Generate `<artifact-root>/tasks.md` before explicit user approval of the saved spec.
- Implement without a saved task plan in `<artifact-root>/tasks.md`.
- Implement more than one active task at a time.
- Expand scope beyond the request and active task.
- Rewrite large parts of the application without explicit approval.
- Introduce new dependencies unless the active task requires them and the reason is documented.
- Change deployment configuration unless the active task requires it.
- Hard-code secrets, API keys, tokens, credentials, or environment-specific URLs.
- Duplicate server state into client global state.
- Expose sensitive fields such as `passwordHash`, tokens, or private user data.
- Remove tests or weaken validation to make a task pass.
- Create fake application code to satisfy the workflow.
- Run destructive commands such as `git reset --hard`, `git clean -fd`, or force pushes unless explicitly instructed.

## Architecture Guidance

Default MERN structure:

```txt
client/
  src/
    components/
    hooks/
      queries/
      mutations/
    lib/
    pages/
    redux/
    routes/
    services/
    styles/
    utils/
  test/

server/
  config/
  controllers/
  middleware/
  models/
  routes/
  tests/
  utils/
```

Guidelines:

- Prefer existing project conventions over new patterns.
- Keep UI components focused on rendering and interaction.
- Put frontend API calls in service files or query/mutation hooks.
- Use a shared frontend API client when the stack supports it.
- Use a server-state library for fetched data when the project already has one.
- Use global client state only for client-owned state.
- Keep backend route handlers thin; move business logic into services or utilities when it grows.
- Validate input at API boundaries.
- Keep persistence models authoritative for data rules.
- Document meaningful architecture or product decisions in `_decisions/`. Keep `docs/DECISIONS.md` for durable project-level decision guidance when useful.

## Testing Expectations

Use the narrowest validation that proves the active task works, then broaden when risk is higher.

Common commands:

```bash
# Frontend
cd client && npm test
cd client && npm run lint
cd client && npm run build

# Backend
cd server && npm test
cd server && npm run lint

# Full project, if configured
npm test
npm run lint
npm run build
npm run typecheck
```

If tests or scripts are missing:

- State that they are missing.
- Recommend the command that should exist.
- Use available manual verification.
- Record the gap in `<artifact-root>/progress.md` and the final `<artifact-root>/summary.md` entry.

## Git Workflow Guidance

- Check `git status --short` before and after edits.
- Do not overwrite user changes.
- Keep commits task-sized.
- Use clear commit messages:

  ```txt
  <type>: <short task summary>
  ```

- Do not commit unless explicitly instructed.
- Before preparing a commit, summarize files changed, validation run, risks, and follow-up work.

## Stop Conditions

Stop and ask for direction when:

- The work request is ambiguous enough that implementation could go in multiple incompatible directions.
- Acceptance criteria conflict with the specification.
- The implementation requires credentials or access that is unavailable.
- A destructive migration or data loss is possible.
- The task requires changing public API contracts beyond the stated scope.
- The task requires introducing a new paid service or dependency.
- Existing uncommitted changes overlap with the files needed and intent is unclear.
- Tests fail for reasons unrelated to the current task and the fix would be out of scope.
- The request is broad but no safe first vertical task can be identified.

## Final Response Format

At the end of a workflow run, report:

- Request classification.
- Spec file used.
- Whether the detailed spec was complete or had gaps.
- Task plan used.
- Tasks completed.
- Iteration evidence summary.
- Files changed.
- Verification commands and results.
- Progress updated in `<artifact-root>/progress.md`.
- Handoff updated in `<artifact-root>/handoff.md`.
- Review updated in `<artifact-root>/review.md`.
- Release notes updated in `<artifact-root>/release-notes.md`.
- Summary updated in `<artifact-root>/summary.md`.
- Decisions updated in `_decisions/<file>.md` or `none`.
- Workflow health status: `Passed`, `Partial`, or `Failed`.
- Final artifact checklist with exact paths:
  - Work request: `<artifact-root>/request.md`
  - Handoff: `<artifact-root>/handoff.md`
  - Spec: `<artifact-root>/spec.md`
  - Task plan: `<artifact-root>/tasks.md`
  - Progress: `<artifact-root>/progress.md`
  - Review: `<artifact-root>/review.md`
  - Release notes: `<artifact-root>/release-notes.md`
  - Summary: `<artifact-root>/summary.md`
  - Decisions: `_decisions/<file>.md` or `none`
- Unresolved issues or recommended next task.
- Suggested commit message.

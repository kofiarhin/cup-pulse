# Project Context

This file captures durable repository facts discovered during workflow runs. Keep it concise and update it when repo conventions become clear.

## Project Summary

- Project name: `<PROJECT_NAME>`
- Purpose: `<ONE_SENTENCE_PURPOSE>`
- Current maturity: `<prototype / MVP / production / unknown>`

## Stack

- Frontend: `<Framework or none>`
- Backend: `<Framework or none>`
- Database: `<Database or none>`
- Runtime: `<Node/Python/Ruby/etc.>`
- Languages: `<Languages>`
- Styling: `<Tailwind/CSS/SCSS/etc.>`
- Deployment: `<Platform(s)>`

## Package Manager

- Detected package manager: `<npm / pnpm / yarn / pip / poetry / etc.>`
- Lockfiles: `<package-lock.json / pnpm-lock.yaml / yarn.lock / etc.>`
- Install command: `<command>`

## Common Commands

```bash
# Test
<command>

# Lint
<command>

# Build
<command>

# Typecheck
<command>
```

## Testing Tools

- Unit tests: `<Tool>`
- Integration tests: `<Tool>`
- End-to-end tests: `<Tool>`
- Manual verification notes: `<Notes>`

## Repo Conventions

- Folder conventions: `<Notes>`
- Naming conventions: `<Notes>`
- API conventions: `<Notes>`
- State management conventions: `<Notes>`
- Error handling conventions: `<Notes>`

## Architecture Rules

- Project Brain JSON under `_workflow/project-brain/` is the source of truth for durable memory and current workflow state; run-scoped `progress.md` remains authoritative for completed task evidence.
- Project Brain is CLI-native backend workflow memory. Do not add a separate memory UI unless a future request explicitly requires one.
- `<Rule discovered from repo or agreed by team>`
- `<Rule discovered from repo or agreed by team>`

## Known Constraints

- `<Constraint>`
- `<Constraint>`

## Open Questions

- `<Question>`

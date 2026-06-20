# Fallow Audit

## Command Run

- Initial required command attempt: `npx fallow audit --format json --quiet --explain 2>/dev/null || true`
- Initial result: PowerShell parser rejected `||`, so the command did not execute.
- Executed fallback: `cmd /c "npx fallow audit --format json --quiet --explain 2>NUL || exit /b 0"`

## Summary

- Parsed root kind: `audit`
- Verdict: `pass`
- Changed files count: 8
- Dead-code issues: 0
- Duplication clone groups: 0
- Complexity findings: 3 inherited, 0 introduced

## Findings

- No new dead-code findings.
- No new duplication findings.
- Inherited complexity findings remain in `server/sync/syncService.js` for `playerHasDisplayData`, `playerProviderId`, and `mergeHydratedPlayer`.
- The inherited findings are non-blocking for this narrow fix because the changed-code gate passed and backend regression coverage was added for the affected behavior.

## Fixes Applied

None from Fallow.

## Remaining Exceptions

- Inherited sync-service complexity remains documented for future cleanup.
- No auto-fixes were applied.

## Verification

- Backend tests passed before Fallow.
- Fallow JSON parsed successfully through the fallback command.
- Final verdict is consistent with Fallow `verdict: pass`.

## Verdict

PASSED

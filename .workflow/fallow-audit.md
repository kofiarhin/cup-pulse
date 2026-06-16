# Fallow Audit

## Command Run

`npx fallow audit --format json --quiet --explain`

Stderr was discarded using the Windows equivalent of `/dev/null` (`NUL`), and the command was run with non-failing shell handling.

## Summary

- Root kind: `audit`
- Verdict: `pass`
- Changed files analyzed: 11
- Dead code issues: 0
- Introduced dead code: 0
- Complexity findings: 1 inherited, 0 introduced
- Duplication clone groups: 0

## Findings

- Non-blocking inherited hotspot: `server/providers/sportmonks/client.js` function `request`.
- No introduced Fallow findings remain after refactoring `server/sync/syncService.js`.

## Fixes Applied

- Removed unused `upsertMany` export.
- Refactored sync-service logging, sync-state update, fixture include, fetch, and upsert helpers to reduce introduced complexity.

## Remaining Exceptions

- Inherited Sportmonks client request complexity remains outside this request's scope.

## Verification

- `npm test`: passed.
- `node --check server/sync/syncService.js`: passed.
- Fallow rerun: verdict `pass`.

## Verdict

PASSED

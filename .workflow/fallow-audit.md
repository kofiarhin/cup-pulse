# Fallow Audit

Date: 2026-06-16

## Command Run

```bash
cmd /c "npx fallow audit --format json --quiet --explain 2>NUL || exit /b 0"
```

## Summary

- Verdict: `pass`
- Gate: `new-only`
- Dead code issues: 0
- Introduced dead code: 0
- Introduced complexity findings: 0
- Introduced duplication groups: 0
- Inherited complexity findings: 12
- Inherited duplication groups: 1

## Findings

Fallow originally flagged introduced dead-code exports, introduced duplication, and one introduced complexity finding. The implementation was refined until the new-code gate passed.

Remaining findings are inherited and outside the approved scope.

## Fixes Applied

- Removed unused exports from changed modules.
- Extracted shared test helper data to remove introduced duplication.
- Split API team serialization into smaller helpers to remove introduced complexity.
- Kept fixture and match API behavior unchanged while reducing helper complexity.

## Remaining Exceptions

Inherited complexity and one inherited duplication group remain. They are not introduced by this request and are not blocking this fix.

## Verification

- `npm test`: passed.
- `npm run verify`: passed.
- Fallow rerun after cleanup: passed.

## Verdict

PASSED

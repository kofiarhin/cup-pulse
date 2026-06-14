# Fallow Audit

## Command Run

- `npx fallow audit --format json --quiet --explain 2>/dev/null || true`
- `npx fallow health --format json --quiet --explain 2>/dev/null || true`
- `npx fallow flags --format json --quiet --explain 2>/dev/null || true`
- `npx fallow security --format json --quiet --explain 2>/dev/null || true`

Machine-readable outputs were parsed during the audit; temporary JSON captures were removed after the report was written.

## Summary

- Audit root kind: `audit`
- Audit gate: `fail`
- Changed files analyzed: 63
- Dead-code issues: 7
- Complexity findings: 34
- Duplication groups: 1
- Health root kind: `health`
- Health score: 83.4 / B
- Average maintainability: 90.4
- Feature flags: 0
- Security candidates: 3

## Findings

- `client/src/test/setup.js` is reported unused but is referenced by Vitest `setupFiles`.
- Six CommonJS exports are reported unused despite runtime/test consumers.
- One 20-line fetch-mock clone exists in `client/src/App.test.jsx`; total duplication is 0.53%.
- Complexity is concentrated in the summary generator, Sportmonks retry loop, prediction aggregation, and data-driven pages. These branches are covered by focused tests.
- Three SSRF candidates use dynamic URLs. The client origin is build-time configuration, and the worker origin is deployment-controlled Sportmonks configuration; neither is request-controlled.
- No unused dependencies, unlisted dependencies, unresolved imports, circular dependencies, re-export cycles, architecture boundary violations, or feature flags were reported.

## Fixes Applied

No automatic Fallow fixes were applied. The dead-code items are false positives for configured test setup and CommonJS exports, while the small test duplication and complexity findings do not justify scope-expanding refactors.

## Remaining Exceptions

- Reviewed non-blocking complexity findings remain.
- The test setup/CommonJS false positives remain unsuppressed so future Fallow improvements can reassess them.
- Security results are static candidates, not verified vulnerabilities; outbound destinations are controlled configuration.

## Verification

- Fallow JSON outputs parsed successfully with schema version 7.
- `npm run verify` passed with 34 backend tests, 15 frontend tests, ESLint, and production build.
- `git diff --check`, server syntax checks, and credential-pattern scan passed.

## Verdict

PARTIAL

Fallow ran successfully and all findings were reviewed. Non-blocking maintainability findings remain and are documented above.

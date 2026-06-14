# Verification Guide

Run the complete local verification suite from the repository root:

```bash
npm run verify
```

This executes:

- Backend Node/Supertest tests
- Frontend Vitest/React Testing Library tests
- Frontend ESLint
- Frontend production build

Additional checks:

```bash
node --check server/worker.js
git diff --check
```

Production smoke checks require configured MongoDB Atlas and Sportmonks credentials. Verify `/health`, `/ready`, one collection endpoint, worker lock acquisition, and a completed sync state without logging credentials.

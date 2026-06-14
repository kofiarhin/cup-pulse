# Project Context

## Project Summary

- Project name: CupPulse
- Purpose: Public, read-only companion for the 2026 FIFA Men's World Cup.
- Current maturity: Production-shaped MVP foundation.

## Stack

- Frontend: React 19, Vite, React Router, TanStack Query
- Backend: Node.js, Express 5
- Database: MongoDB Atlas with Mongoose
- Styling: Tailwind CSS 4
- Deployment: Heroku web and worker processes
- External data: Sportmonks Football API v3

## Package Manager And Commands

- Package manager: npm
- Lockfiles: root and `client/package-lock.json`
- Install: `npm install && npm install --prefix client`
- Full verification: `npm run verify`
- API development: `npm run server`
- Frontend development: `npm run client`
- Worker: `npm run worker`

## Testing

- Backend: Node test runner and Supertest
- Frontend: Vitest and React Testing Library
- Browser automation: Optional smoke verification when the in-app browser is available

## Conventions

- The frontend calls only `/api/v1`; it never calls Sportmonks.
- Only the worker writes provider-derived normalized records.
- Public responses use normalized envelopes with freshness and source metadata.
- Provider IDs and raw response shapes stay private.
- Mock fallback is controlled by environment and disabled by default in production.
- Project Brain JSON under `_workflow/project-brain/` is durable workflow memory.

## Known Constraints

- Sportmonks subscription coverage controls advanced data availability.
- Missing lineups, injuries, xG, and advanced player metrics must remain explicit.
- Socket.IO, admin tools, authentication, and personalization are out of scope.

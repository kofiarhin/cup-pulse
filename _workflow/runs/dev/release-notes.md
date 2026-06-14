# Release Notes

## Request

Implement the approved CupPulse production MVP foundation for a public 2026 FIFA Men's World Cup companion powered by Sportmonks and MongoDB Atlas.

Applied skill: design-taste-frontend

## User-Facing Changes

- Added Home, Live Matches, Fixtures, Results, Standings, Knockout Bracket, Teams, Team Details, Players, Player Details, Match Details, Predictions, and Summaries.
- Added responsive navigation, search, pagination, loading, empty, error, stale, cached, and mock indicators.
- Added deterministic team/player-form predictions and article-style match summaries.

## Developer Changes

- Added the normalized Express API, Mongoose models, Sportmonks client/normalizers, worker schedules, MongoDB locks, derived refresh, env validation, and deployment docs.
- Added root `verify`, test, lint, build, web, and worker commands.

## New Routes And APIs

- Public frontend routes for every approved page.
- Read-only `/api/v1` endpoints for competitions, teams, players, fixtures, matches, live matches, standings, venues, predictions, and summaries.

## Environment Variables

- Required: `SPORTMONKS_API_TOKEN`, `MONGODB_URI`, `CLIENT_URL`, `NODE_ENV`, `PORT`
- Provider IDs: `SPORTMONKS_LEAGUE_ID`, `SPORTMONKS_SEASON_ID`
- Optional tuning: `ALLOW_MOCK_DATA`, `SPORTMONKS_BASE_URL`, `SPORTMONKS_TIMEOUT_MS`, `JOB_LOCK_TTL_MS`, and all refresh interval variables
- Frontend: `VITE_API_BASE_URL`

## Database And Schema

Added normalized competitions, teams, players, fixtures, matches, standings, venues, predictions, summaries, sync states, and job locks.

## Dependencies

- Frontend: React Router, TanStack Query, Phosphor icons, Tailwind Vite, Vitest, Testing Library, jsdom
- Backend test tooling: Supertest
- Removed dependencies: none

## Verification

- `npm run verify`: passed
- 34 backend tests and 15 frontend tests passed
- ESLint and production build passed
- Fallow verdict: `PARTIAL` with reviewed non-blocking findings and health score 83.4/B

## Known Limitations

- Browser smoke could not run because no in-app browser connection was available.
- Live Sportmonks/Atlas smoke requires production credentials.
- Socket.IO, admin, authentication, and personalization remain deferred.

## Follow-Up Work

- Credentialed Heroku/Atlas/Sportmonks deployment smoke
- Socket.IO and admin workflow after the core cache layer is operating

## Suggested Commit Message

`feat: implement CupPulse production MVP foundation`

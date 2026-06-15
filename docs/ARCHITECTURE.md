# CupPulse Architecture

Last updated: 2026-06-14

## System Overview

CupPulse has three runtime boundaries:

1. The React frontend reads only the versioned CupPulse API.
2. The Express web process reads normalized MongoDB records and never schedules sync work.
3. The Heroku worker reads Sportmonks, normalizes and upserts records, then refreshes derived predictions and summaries.

The web process also exposes Socket.IO. Worker processes persist compact realtime events in MongoDB; the web process polls those events and broadcasts cache-invalidation messages to connected clients.

MongoDB Atlas is the durable cache and continuity layer. Sportmonks outages do not remove previously synchronized records.

## Frontend

- Routes cover home, live matches, fixtures, results, standings, bracket, teams, players, match details, predictions, and summaries.
- `client/src/lib/api.js` owns the backend base URL.
- TanStack Query owns server state.
- Shared components expose loading, empty, error, stale, cached, and mock states.
- Accessibility includes semantic regions, labeled search, responsive tables, and skip navigation.

## Backend

- `/api/v1` is public and read-only.
- Routes use centralized pagination, filtering, serialization, errors, and freshness metadata.
- Mongoose collections: competitions, groups, teams, players, fixtures, matches, standings, venues, predictions, summaries, announcements, featured content, realtime events, sync states, and job locks.
- `/api/v1/admin` uses a configured bearer token for health, synchronization, announcements, and featured-content operations.
- Public serialization strips provider and internal fallback fields.

## Ingestion And Derived Data

- Sportmonks calls use token authentication, pagination, timeout/retry behavior, and selective includes.
- Static metadata refreshes daily.
- Teams, squads, venues, and standings refresh every six hours.
- Fixtures refresh every 30 minutes.
- Detailed match/player statistics refresh every 15 minutes only around active match windows.
- All intervals and lock TTLs are environment-configurable.
- MongoDB locks prevent overlapping job execution.
- Core or match changes invoke derived refresh. Stable source fingerprints skip unchanged prediction and summary writes.

## Failure Behavior

- Production startup requires `MONGODB_URI`.
- Sportmonks failure leaves cached MongoDB data available.
- Development may use mock fallback when no cache exists.
- Production mock fallback requires explicit `ALLOW_MOCK_DATA=true`.
- Missing provider fields remain unavailable and are never fabricated.

## Deployment

Heroku process types:

```txt
web: npm start
worker: npm run worker
```

Required production configuration:

- `SPORTMONKS_API_TOKEN`
- `SPORTMONKS_LEAGUE_ID`
- `SPORTMONKS_SEASON_ID`
- `MONGODB_URI`
- `CLIENT_URL`
- `NODE_ENV=production`
- `PORT` supplied by Heroku

Optional tuning variables are documented in `.env.example`.

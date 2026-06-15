# Release Notes

## User-facing changes
- Live match and standings data now refresh through Socket.IO invalidation.
- Home displays current announcements and featured content.
- Responsive admin pages support health, sync, announcement, and featured-content operations.
- Group data is available as a first-class API collection.

## Developer changes
- Added Mongo-backed realtime event delivery for separate web/worker processes.
- Added fail-closed `ADMIN_API_TOKEN` auth and admin/public editorial APIs.
- Added Socket.IO dependencies, group normalization, tests, and updated architecture docs.

## New routes/APIs
`/api/v1/groups`, prediction/summary lists, `/api/v1/announcements`, `/api/v1/featured-content`, `/api/v1/admin/**`, and frontend `/admin/**`.

## Environment
`ADMIN_API_TOKEN`, optional `REALTIME_POLL_INTERVAL_MS`.

## Verification
`npm run verify` passed.

## Known limitations
Credentialed Atlas/Sportmonks smoke tests and browser screenshots require deployed/runtime access.

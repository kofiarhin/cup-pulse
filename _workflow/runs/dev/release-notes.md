# Release Notes: Fixture Team Name Resolution

Date: 2026-06-16

## User-Facing Changes

- Fixture cards now show real club names from Sportmonks participants instead of fallback IDs such as `team-2447`.
- Fixture cards show team logos when Sportmonks provides image URLs.
- The fixture API returns populated `homeTeam` and `awayTeam` objects with `id`, `name`, and `logo`.

## Technical Changes

- Fixture normalization extracts home and away participant teams from Sportmonks fixture payloads.
- Fixture and match documents now store home/away team display names and logos.
- Fixture sync upserts participant teams into the Team collection.
- Fixture sync logs fixtures fetched, teams extracted, and teams upserted.
- API serializers enrich fixture and match responses from stored fixture fields and cached Team records.
- Fallback behavior remains in place when a team name is unavailable.

## Database Impact

Adds optional display fields to Fixture and Match records:

- `homeTeamName`
- `awayTeamName`
- `homeTeamLogo`
- `awayTeamLogo`

Team upserts are additive and use existing provider IDs.

## Verification

- `npm run verify`: passed.
- Fallow new-code gate: passed.
- Local API smoke for `GET /api/v1/fixtures?limit=4`: passed with real names and logos.

## Suggested Commit

`fix: resolve fixture team names from Sportmonks participants`

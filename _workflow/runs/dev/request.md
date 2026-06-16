Fix team name resolution in CupPulse.

Current state:
- Sportmonks fixture sync works.
- Fixtures are stored in MongoDB.
- API `/api/v1/fixtures` returns records.
- Frontend displays fixtures.
- Team names are rendering as fallback values like `team-2447`, `team-1789`, and `team-2905` instead of real club names.

Goal:
Display actual team names from Sportmonks.

Normalized workflow request:
Fix the Sportmonks fixture ingestion, normalization, persistence, API serialization, and fixture-card presentation so upcoming fixtures expose and display real home/away team names and logos when Sportmonks provides participant data. Preserve `team-${id}` fallback behavior only when no real name is available. Add tests and token-safe sync logs for fetched fixture count, extracted teams, and upserted teams.

Execution mode:
complete-workflow

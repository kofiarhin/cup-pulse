# Active Work Request

Implement a production-shaped CupPulse MVP for the 2026 FIFA Men's World Cup.

Build a public, read-only, mobile-first React application covering Home, Live Matches, Match Details, Fixtures, Results, Standings, Knockout Bracket, Teams, Team Details, Players, Player Details, Match Predictions, and Match Summaries.

Use the Express backend as the only frontend data source through normalized read-only REST endpoints under `/api/v1`. Integrate Sportmonks Football API v3 in a separate Heroku worker process, normalize and cache real World Cup data in MongoDB Atlas, schedule configurable refresh jobs, and use MongoDB locks to prevent duplicate work. Serve cached data during provider downtime. Permit mock fallback only in development when no cache exists, or in production when explicitly enabled.

Implement a deterministic prediction engine using team form and aggregated player form, and a structured narrative engine for article-style post-match summaries. Do not use paid AI or prediction APIs.

Defer Socket.IO real-time transport and admin UI. Do not implement authentication, accounts, profiles, favorites, notifications, comments, saved predictions, or OAuth.


const generatedAt = "2026-06-14T00:00:00.000Z";

const mockData = Object.freeze({
  competitions: [
    {
      id: "fifa-world-cup-2026",
      providerId: null,
      name: "FIFA World Cup 2026",
      season: "2026",
      status: "scheduled",
      isFallback: true,
    },
  ],
  teams: [
    {
      id: "canada",
      providerId: null,
      competitionId: "fifa-world-cup-2026",
      name: "Canada",
      code: "CAN",
      country: "Canada",
      group: null,
      crestUrl: null,
      isFallback: true,
    },
    {
      id: "mexico",
      providerId: null,
      competitionId: "fifa-world-cup-2026",
      name: "Mexico",
      code: "MEX",
      country: "Mexico",
      group: null,
      crestUrl: null,
      isFallback: true,
    },
    {
      id: "united-states",
      providerId: null,
      competitionId: "fifa-world-cup-2026",
      name: "United States",
      code: "USA",
      country: "United States",
      group: null,
      crestUrl: null,
      isFallback: true,
    },
  ],
  players: [
    {
      id: "alphonso-davies",
      providerId: null,
      teamId: "canada",
      name: "Alphonso Davies",
      position: "Defender",
      imageUrl: null,
      availability: "unknown",
      isFallback: true,
    },
  ],
  fixtures: [
    {
      id: "development-fallback-match",
      providerId: null,
      competitionId: "fifa-world-cup-2026",
      stage: "Development fallback",
      status: "scheduled",
      startsAt: null,
      homeTeamId: "mexico",
      awayTeamId: "canada",
      venueId: "estadio-azteca",
      isFallback: true,
    },
  ],
  matches: [
    {
      id: "development-fallback-match",
      providerId: null,
      competitionId: "fifa-world-cup-2026",
      status: "scheduled",
      startsAt: null,
      homeTeamId: "mexico",
      awayTeamId: "canada",
      score: { home: null, away: null },
      events: [],
      statistics: {},
      isFallback: true,
    },
  ],
  standings: [],
  venues: [
    {
      id: "estadio-azteca",
      providerId: null,
      name: "Estadio Azteca",
      city: "Mexico City",
      country: "Mexico",
      capacity: null,
      imageUrl: null,
      isFallback: true,
    },
  ],
  predictions: [
    {
      id: "development-fallback-match",
      matchId: "development-fallback-match",
      homeWinProbability: 0.36,
      drawProbability: 0.31,
      awayWinProbability: 0.33,
      predictedScore: "1-1",
      confidence: "low",
      rationale: [
        "Development fallback only; real prediction inputs have not been synchronized.",
      ],
      isFallback: true,
    },
  ],
  summaries: [
    {
      id: "development-fallback-match",
      matchId: "development-fallback-match",
      message: "Match summary will be available after full time.",
      sections: [],
      isFallback: true,
    },
  ],
});

module.exports = {
  generatedAt,
  mockData,
};

const test = require("node:test");
const assert = require("node:assert/strict");

const {
  aggregatePlayerForm,
  generatePrediction,
} = require("../services/predictions/engine");
const {
  generateMatchSummary,
} = require("../services/summaries/engine");
const { fingerprint } = require("../services/derived/fingerprint");
const { createDerivedService } = require("../services/derived/service");
const {
  createDerivedRefreshService,
} = require("../services/derived/refreshService");

const homeTeam = {
  id: "team-home",
  name: "Home",
  recentMatches: [
    { result: "win", goalsFor: 2, goalsAgainst: 0, cleanSheet: true },
    { result: "win", goalsFor: 3, goalsAgainst: 1 },
    { result: "draw", goalsFor: 1, goalsAgainst: 1 },
    { result: "loss", goalsFor: 0, goalsAgainst: 1 },
    { result: "win", goalsFor: 2, goalsAgainst: 1 },
  ],
  groupPosition: 1,
};

const awayTeam = {
  id: "team-away",
  name: "Away",
  recentMatches: [
    { result: "loss", goalsFor: 0, goalsAgainst: 2 },
    { result: "draw", goalsFor: 1, goalsAgainst: 1 },
    { result: "loss", goalsFor: 1, goalsAgainst: 3 },
    { result: "win", goalsFor: 2, goalsAgainst: 1 },
    { result: "draw", goalsFor: 0, goalsAgainst: 0, cleanSheet: true },
  ],
  groupPosition: 3,
};

const strongPlayers = [
  { expectedStarter: true, position: "Attacker", goals: 3, assists: 2, minutes: 420 },
  { expectedStarter: true, position: "Goalkeeper", saves: 18, cleanSheets: 3, minutes: 450 },
  { expectedStarter: true, position: "Defender", defensiveContribution: 8, minutes: 430 },
];

test("player form aggregates role-specific contribution and availability", () => {
  const score = aggregatePlayerForm([
    ...strongPlayers,
    { expectedStarter: true, position: "Attacker", goals: 4, injured: true },
  ]);

  assert.ok(score > 0.5 && score <= 1);
});

test("prediction returns normalized probabilities and required output", () => {
  const prediction = generatePrediction({
    homeTeam,
    awayTeam,
    homePlayers: strongPlayers,
    awayPlayers: [],
    headToHead: { homeWins: 3, draws: 1, awayWins: 1 },
    venueFactor: 1,
  });

  const total =
    prediction.homeWinProbability +
    prediction.drawProbability +
    prediction.awayWinProbability;

  assert.ok(Math.abs(total - 1) < 0.000001);
  assert.ok(prediction.homeWinProbability > prediction.awayWinProbability);
  assert.match(prediction.predictedScore, /^\d+-\d+$/);
  assert.ok(["low", "medium", "high"].includes(prediction.confidence));
  assert.ok(prediction.rationale.length >= 3);
});

test("stronger player form materially increases team probability", () => {
  const weak = generatePrediction({
    homeTeam,
    awayTeam,
    homePlayers: [],
    awayPlayers: strongPlayers,
    headToHead: {},
    venueFactor: 0,
  });
  const strong = generatePrediction({
    homeTeam,
    awayTeam,
    homePlayers: strongPlayers,
    awayPlayers: [],
    headToHead: {},
    venueFactor: 0,
  });

  assert.ok(strong.homeWinProbability > weak.homeWinProbability);
});

test("unfinished matches return the exact summary availability message", () => {
  assert.deepEqual(generateMatchSummary({ status: "live" }), {
    message: "Match summary will be available after full time.",
    sections: [],
    article: null,
  });
});

test("finished matches produce all structured narrative sections", () => {
  const summary = generateMatchSummary({
    status: "finished",
    homeTeam: { name: "Canada" },
    awayTeam: { name: "Mexico" },
    score: { home: 2, away: 1 },
    events: [
      {
        type: "goal",
        minute: 18,
        playerName: "Player One",
        assistName: "Player Three",
        teamName: "Canada",
      },
      { type: "card", minute: 64, playerName: "Player Two", card: "yellow" },
      {
        type: "substitution",
        minute: 70,
        playerInName: "Player Four",
        playerOutName: "Player Five",
        teamName: "Mexico",
      },
    ],
    statistics: {
      possession: { home: 47, away: 53 },
      shots: { home: 12, away: 9 },
      shotsOnTarget: { home: 6, away: 4 },
      expectedGoals: { home: 1.8, away: 1.1 },
    },
    standoutPlayers: [{ name: "Player One", goals: 1, assists: 1 }],
    tournamentImpact: "Canada move into a qualifying position.",
  });

  assert.deepEqual(
    summary.sections.map((section) => section.id),
    ["overview", "key-moments", "performers", "statistics", "impact"],
  );
  assert.match(summary.article, /Canada/);
  assert.match(summary.article, /assisted by Player Three/);
  assert.match(summary.article, /Player Four replaced Player Five/);
});

test("source fingerprints are stable and change with source data", () => {
  assert.equal(fingerprint({ b: 2, a: 1 }), fingerprint({ a: 1, b: 2 }));
  assert.notEqual(fingerprint({ a: 1 }), fingerprint({ a: 2 }));
});

test("derived persistence skips regeneration when source data is unchanged", async () => {
  const stored = new Map();
  const repository = {
    async findOne({ matchId }) {
      return stored.get(matchId) || null;
    },
    async findOneAndUpdate({ matchId }, { $set }) {
      stored.set(matchId, $set);
      return $set;
    },
  };
  let predictionRuns = 0;
  const service = createDerivedService({
    predictionModel: repository,
    summaryModel: repository,
    predictionGenerator(input) {
      predictionRuns += 1;
      return { predictedScore: input.score };
    },
    summaryGenerator: generateMatchSummary,
  });

  const first = await service.persistPrediction("match-1", { score: "2-1" });
  const second = await service.persistPrediction("match-1", { score: "2-1" });
  const third = await service.persistPrediction("match-1", { score: "3-1" });

  assert.equal(first.regenerated, true);
  assert.equal(second.regenerated, false);
  assert.equal(third.regenerated, true);
  assert.equal(predictionRuns, 2);
});

test("derived refresh persists prediction and summary for changed match ids", async () => {
  const calls = [];
  const refresh = createDerivedRefreshService({
    async loadMatchIds() {
      return ["match-1"];
    },
    async loadMatchContext(matchId) {
      return {
        prediction: { homeTeam: { name: "Canada" } },
        summary: { status: "scheduled" },
        matchId,
      };
    },
    derivedService: {
      async persistPrediction(matchId, source) {
        calls.push(["prediction", matchId, source]);
      },
      async persistSummary(matchId, source) {
        calls.push(["summary", matchId, source]);
      },
    },
  });

  const result = await refresh();

  assert.deepEqual(
    calls.map(([type, matchId]) => [type, matchId]),
    [
      ["prediction", "match-1"],
      ["summary", "match-1"],
    ],
  );
  assert.deepEqual(result, { processed: 1, skipped: 0 });
});

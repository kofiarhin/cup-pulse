const WEIGHTS = Object.freeze({
  teamForm: 0.35,
  playerForm: 0.3,
  goalsTrend: 0.2,
  headToHead: 0.1,
  venue: 0.05,
});

function clamp(value, minimum = 0, maximum = 1) {
  return Math.min(maximum, Math.max(minimum, value));
}

function average(values) {
  return values.length
    ? values.reduce((sum, value) => sum + value, 0) / values.length
    : 0;
}

function aggregatePlayerForm(players = []) {
  if (players.length === 0) return 0.5;

  const selected = players.filter(
    (player) => player.expectedStarter !== false || player.minutes > 0,
  );
  if (selected.length === 0) return 0.5;

  const scores = selected.map((player) => {
    const minutesFactor = clamp((player.minutes || 0) / 450);
    const availabilityPenalty =
      player.injured || player.suspended ? 0.35 : player.cards >= 3 ? 0.08 : 0;
    let contribution = 0;

    if (player.position === "Goalkeeper") {
      contribution =
        (player.cleanSheets || 0) * 0.14 + (player.saves || 0) * 0.012;
    } else if (player.position === "Defender") {
      contribution =
        (player.defensiveContribution || 0) * 0.055 +
        (player.cleanSheets || 0) * 0.08 +
        (player.goals || 0) * 0.08 +
        (player.assists || 0) * 0.06;
    } else {
      contribution =
        (player.goals || 0) * 0.13 + (player.assists || 0) * 0.09;
    }

    return clamp(0.35 + minutesFactor * 0.25 + contribution - availabilityPenalty);
  });

  return clamp(average(scores));
}

function teamFormScore(team = {}) {
  const matches = (team.recentMatches || []).slice(-5);
  if (matches.length === 0) return 0.5;
  const points = matches.reduce((total, match) => {
    if (match.result === "win") return total + 3;
    if (match.result === "draw") return total + 1;
    return total;
  }, 0);
  const cleanSheetBonus =
    matches.filter((match) => match.cleanSheet).length / matches.length;
  const groupBonus = team.groupPosition
    ? clamp((5 - team.groupPosition) / 4)
    : 0.5;
  return clamp(
    (points / (matches.length * 3)) * 0.72 +
      cleanSheetBonus * 0.13 +
      groupBonus * 0.15,
  );
}

function goalsTrendScore(team = {}) {
  const matches = (team.recentMatches || []).slice(-5);
  if (matches.length === 0) return 0.5;
  const scored = average(matches.map((match) => match.goalsFor || 0));
  const conceded = average(matches.map((match) => match.goalsAgainst || 0));
  return clamp(0.5 + (scored - conceded) / 6);
}

function headToHeadScore(headToHead = {}, side) {
  const homeWins = headToHead.homeWins || 0;
  const awayWins = headToHead.awayWins || 0;
  const draws = headToHead.draws || 0;
  const total = homeWins + awayWins + draws;
  if (total === 0) return 0.5;
  const wins = side === "home" ? homeWins : awayWins;
  return clamp((wins + draws * 0.5) / total);
}

function strength({
  team,
  players,
  headToHead,
  side,
  venueFactor,
}) {
  return (
    teamFormScore(team) * WEIGHTS.teamForm +
    aggregatePlayerForm(players) * WEIGHTS.playerForm +
    goalsTrendScore(team) * WEIGHTS.goalsTrend +
    headToHeadScore(headToHead, side) * WEIGHTS.headToHead +
    clamp(side === "home" ? venueFactor : 1 - venueFactor) * WEIGHTS.venue
  );
}

function generatePrediction({
  homeTeam = {},
  awayTeam = {},
  homePlayers = [],
  awayPlayers = [],
  headToHead = {},
  venueFactor = 0.6,
} = {}) {
  const homeStrength = strength({
    team: homeTeam,
    players: homePlayers,
    headToHead,
    side: "home",
    venueFactor,
  });
  const awayStrength = strength({
    team: awayTeam,
    players: awayPlayers,
    headToHead,
    side: "away",
    venueFactor,
  });
  const difference = homeStrength - awayStrength;
  const drawProbability = clamp(0.3 - Math.abs(difference) * 0.22, 0.18, 0.32);
  const decisiveProbability = 1 - drawProbability;
  const homeShare = 1 / (1 + Math.exp(-difference * 5));
  const homeWinProbability = decisiveProbability * homeShare;
  const awayWinProbability = decisiveProbability - homeWinProbability;

  const homeRecent = homeTeam.recentMatches || [];
  const awayRecent = awayTeam.recentMatches || [];
  const homeGoals = clamp(
    Math.round(
      average(homeRecent.map((match) => match.goalsFor || 0)) +
        difference * 1.5,
    ),
    0,
    5,
  );
  const awayGoals = clamp(
    Math.round(
      average(awayRecent.map((match) => match.goalsFor || 0)) -
        difference * 1.5,
    ),
    0,
    5,
  );
  const inputCoverage = [
    homeRecent.length >= 3,
    awayRecent.length >= 3,
    homePlayers.length >= 3,
    awayPlayers.length >= 3,
    Object.keys(headToHead).length > 0,
  ].filter(Boolean).length;
  const confidence =
    inputCoverage >= 5 && Math.abs(difference) > 0.16
      ? "high"
      : inputCoverage >= 3
        ? "medium"
        : "low";

  return {
    homeWinProbability,
    drawProbability,
    awayWinProbability,
    predictedScore: `${homeGoals}-${awayGoals}`,
    confidence,
    rationale: [
      `${homeTeam.name || "Home"} recent team form contributes 35% of the model.`,
      `Expected player availability and role-specific form contribute 30%.`,
      `Scoring trends, head-to-head history, group position, and venue complete the model.`,
      confidence === "low"
        ? "Confidence is limited because some real-data inputs are unavailable."
        : `${homeTeam.name || "Home"} and ${awayTeam.name || "Away"} have sufficient recent data for a ${confidence}-confidence estimate.`,
    ],
    inputSnapshot: {
      weights: WEIGHTS,
      homeStrength,
      awayStrength,
      playerForm: {
        home: aggregatePlayerForm(homePlayers),
        away: aggregatePlayerForm(awayPlayers),
      },
    },
  };
}

module.exports = {
  WEIGHTS,
  aggregatePlayerForm,
  generatePrediction,
};

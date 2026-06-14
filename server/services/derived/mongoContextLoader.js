function leanOne(query) {
  return query.lean();
}

function leanMany(query) {
  return query.lean();
}

function scoreFor(match, side) {
  if (Number.isFinite(match.score?.[side])) return match.score[side];
  const score = Array.isArray(match.score)
    ? match.score.find(
        (entry) =>
          entry.description === "CURRENT" &&
          entry.score?.participant === side,
      )
    : null;
  return Number(score?.score?.goals || 0);
}

function recentResult(match, teamId) {
  const isHome = match.homeTeamId === teamId;
  const goalsFor = scoreFor(match, isHome ? "home" : "away");
  const goalsAgainst = scoreFor(match, isHome ? "away" : "home");
  return {
    result:
      goalsFor === goalsAgainst ? "draw" : goalsFor > goalsAgainst ? "win" : "loss",
    goalsFor,
    goalsAgainst,
    cleanSheet: goalsAgainst === 0,
  };
}

function playerInput(player) {
  const stats = player.recentForm || player.statistics || {};
  return {
    expectedStarter: stats.expectedStarter,
    position: player.position,
    goals: stats.goals,
    assists: stats.assists,
    minutes: stats.minutes,
    cards: stats.cards,
    suspended: player.availability === "suspended" || stats.suspended,
    injured: player.availability === "injured" || stats.injured,
    cleanSheets: stats.cleanSheets,
    saves: stats.saves,
    defensiveContribution: stats.defensiveContribution,
  };
}

function createMongoDerivedContextLoader({
  matchModel,
  teamModel,
  playerModel,
  standingModel,
}) {
  async function loadMatchIds() {
    const matches = await leanMany(
      matchModel
        .find({ status: { $nin: ["cancelled"] } })
        .select({ id: 1 })
        .sort({ startsAt: 1 }),
    );
    return matches.map((match) => match.id);
  }

  async function loadTeam(teamId, startsAt) {
    const [team, players, standing, history] = await Promise.all([
      leanOne(teamModel.findOne({ id: teamId })),
      leanMany(playerModel.find({ teamId })),
      leanOne(standingModel.findOne({ teamId }).sort({ syncedAt: -1 })),
      leanMany(
        matchModel
          .find({
            status: "finished",
            startsAt: { $lt: startsAt },
            $or: [{ homeTeamId: teamId }, { awayTeamId: teamId }],
          })
          .sort({ startsAt: -1 })
          .limit(5),
      ),
    ]);

    return {
      team: {
        id: teamId,
        name: team?.name,
        recentMatches: history.map((match) => recentResult(match, teamId)),
        groupPosition: standing?.position,
      },
      players: players.map(playerInput),
    };
  }

  async function loadHeadToHead(match) {
    const history = await leanMany(
      matchModel
        .find({
          status: "finished",
          startsAt: { $lt: match.startsAt },
          $or: [
            {
              homeTeamId: match.homeTeamId,
              awayTeamId: match.awayTeamId,
            },
            {
              homeTeamId: match.awayTeamId,
              awayTeamId: match.homeTeamId,
            },
          ],
        })
        .sort({ startsAt: -1 })
        .limit(10),
    );

    return history.reduce(
      (record, historicalMatch) => {
        const homeGoals = scoreFor(historicalMatch, "home");
        const awayGoals = scoreFor(historicalMatch, "away");
        if (homeGoals === awayGoals) {
          record.draws += 1;
        } else {
          const winnerId =
            homeGoals > awayGoals
              ? historicalMatch.homeTeamId
              : historicalMatch.awayTeamId;
          if (winnerId === match.homeTeamId) record.homeWins += 1;
          if (winnerId === match.awayTeamId) record.awayWins += 1;
        }
        return record;
      },
      { homeWins: 0, draws: 0, awayWins: 0 },
    );
  }

  async function loadMatchContext(matchId) {
    const match = await leanOne(matchModel.findOne({ id: matchId }));
    if (!match?.homeTeamId || !match?.awayTeamId) return null;

    const [home, away, headToHead] = await Promise.all([
      loadTeam(match.homeTeamId, match.startsAt),
      loadTeam(match.awayTeamId, match.startsAt),
      loadHeadToHead(match),
    ]);

    const summary = {
      status: match.status,
      score: {
        home: scoreFor(match, "home"),
        away: scoreFor(match, "away"),
      },
      homeTeam: { name: home.team.name },
      awayTeam: { name: away.team.name },
      events: match.events || [],
      statistics: match.statistics || {},
      standoutPlayers: match.standoutPlayers || [],
      tournamentImpact: match.tournamentImpact || null,
    };

    return {
      matchId,
      prediction: {
        homeTeam: home.team,
        awayTeam: away.team,
        homePlayers: home.players,
        awayPlayers: away.players,
        headToHead,
        venueFactor: 0.55,
      },
      summary,
    };
  }

  return { loadMatchContext, loadMatchIds };
}

module.exports = { createMongoDerivedContextLoader };

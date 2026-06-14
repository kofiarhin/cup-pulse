const UNAVAILABLE_MESSAGE = "Match summary will be available after full time.";

function sentenceList(items) {
  if (items.length === 0) return "No major incidents were recorded.";
  return items.join(" ");
}

function generateMatchSummary(match = {}) {
  if (match.status !== "finished") {
    return {
      message: UNAVAILABLE_MESSAGE,
      sections: [],
      article: null,
    };
  }

  const home = match.homeTeam?.name || "The home side";
  const away = match.awayTeam?.name || "The away side";
  const homeScore = match.score?.home ?? 0;
  const awayScore = match.score?.away ?? 0;
  const winner =
    homeScore === awayScore ? "The teams shared the result" : `${homeScore > awayScore ? home : away} won`;
  const goals = (match.events || [])
    .filter((event) => event.type === "goal")
    .map(
      (event) =>
        `${event.playerName || "A scorer"} struck for ${event.teamName || "their team"} in the ${event.minute || "unknown"}th minute${event.assistName ? `, assisted by ${event.assistName}` : ""}.`,
    );
  const cards = (match.events || [])
    .filter((event) => event.type === "card")
    .map(
      (event) =>
        `${event.playerName || "A player"} received a ${event.card || ""} card in the ${event.minute || "unknown"}th minute.`,
    );
  const substitutions = (match.events || [])
    .filter((event) => event.type === "substitution")
    .map(
      (event) =>
        `${event.playerInName || "A substitute"} replaced ${event.playerOutName || "a teammate"} for ${event.teamName || "their team"} in the ${event.minute || "unknown"}th minute.`,
    );
  const performers = (match.standoutPlayers || []).map((player) => {
    const contributions = [
      player.goals ? `${player.goals} goal${player.goals === 1 ? "" : "s"}` : null,
      player.assists
        ? `${player.assists} assist${player.assists === 1 ? "" : "s"}`
        : null,
      player.saves ? `${player.saves} saves` : null,
    ].filter(Boolean);
    return `${player.name} stood out with ${contributions.join(" and ") || "an influential display"}.`;
  });
  const stats = match.statistics || {};
  const statisticalSentences = [
    stats.possession
      ? `Possession finished ${stats.possession.home}% to ${stats.possession.away}%.`
      : null,
    stats.shots
      ? `The sides attempted ${stats.shots.home} and ${stats.shots.away} shots, with ${stats.shotsOnTarget?.home ?? "unknown"} and ${stats.shotsOnTarget?.away ?? "unknown"} on target.`
      : null,
    stats.expectedGoals
      ? `Expected goals were ${stats.expectedGoals.home} to ${stats.expectedGoals.away}.`
      : null,
  ].filter(Boolean);

  const sections = [
    {
      id: "overview",
      title: "Match overview",
      body: `${winner} as ${home} finished ${homeScore}-${awayScore} against ${away}.`,
    },
    {
      id: "key-moments",
      title: "Key moments",
      body: sentenceList([...goals, ...cards, ...substitutions]),
    },
    {
      id: "performers",
      title: "Standout performers",
      body: sentenceList(performers),
    },
    {
      id: "statistics",
      title: "Statistical highlights",
      body: sentenceList(statisticalSentences),
    },
    {
      id: "impact",
      title: "Tournament impact",
      body:
        match.tournamentImpact ||
        "The tournament implications will be confirmed when the updated standings are available.",
    },
  ];

  return {
    message: null,
    title: `${home} ${homeScore}-${awayScore} ${away}`,
    sections,
    article: sections.map((section) => `${section.title}\n${section.body}`).join("\n\n"),
  };
}

module.exports = {
  UNAVAILABLE_MESSAGE,
  generateMatchSummary,
};

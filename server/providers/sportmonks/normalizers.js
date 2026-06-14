function providerId(prefix, id) {
  return id === undefined || id === null ? null : `${prefix}-${id}`;
}

function normalizeTeam(team, competitionId) {
  return {
    id: providerId("team", team.id),
    providerId: team.id,
    competitionId,
    name: team.name,
    code: team.short_code || team.code || null,
    country: team.country?.name || null,
    crestUrl: team.image_path || null,
    source: "cached",
    providerUpdatedAt: team.updated_at ? new Date(team.updated_at) : null,
    syncedAt: new Date(),
  };
}

function normalizePlayer(player, teamId) {
  return {
    id: providerId("player", player.id),
    providerId: player.id,
    teamId,
    name: player.display_name || player.common_name || player.name,
    position: player.position?.name || player.position_name || null,
    imageUrl: player.image_path || null,
    availability: player.sidelined ? "unavailable" : "unknown",
    statistics: player.statistics || {},
    source: "cached",
    providerUpdatedAt: player.updated_at ? new Date(player.updated_at) : null,
    syncedAt: new Date(),
  };
}

function participantId(fixture, location) {
  const participant = fixture.participants?.find(
    (item) => item.meta?.location === location,
  );
  return providerId("team", participant?.id);
}

function normalizeDate(value) {
  if (!value) return null;
  const normalized = value.includes("T") ? value : `${value.replace(" ", "T")}Z`;
  return new Date(normalized);
}

function normalizeStatus(state) {
  const value = String(state?.short_name || state?.state || "unknown").toLowerCase();
  if (["live", "inplay", "in-play", "1h", "2h", "ht", "et", "break"].includes(value)) {
    return "live";
  }
  if (["ft", "aet", "pen", "finished"].includes(value)) {
    return "finished";
  }
  if (["ns", "scheduled", "tba"].includes(value)) {
    return "scheduled";
  }
  if (["postp", "postponed"].includes(value)) {
    return "postponed";
  }
  if (["canc", "cancelled"].includes(value)) {
    return "cancelled";
  }
  return value;
}

function normalizeScore(scores) {
  if (!Array.isArray(scores)) {
    return {
      home: Number.isFinite(scores?.home) ? scores.home : null,
      away: Number.isFinite(scores?.away) ? scores.away : null,
    };
  }

  const current = scores.filter(
    (entry) => String(entry.description).toUpperCase() === "CURRENT",
  );
  const total = current.length ? current : scores;
  const goals = (side) => {
    const entry = total.find((item) => item.score?.participant === side);
    return Number.isFinite(entry?.score?.goals) ? entry.score.goals : null;
  };
  return { home: goals("home"), away: goals("away") };
}

function normalizeFixture(fixture, competitionId) {
  const startsAt = normalizeDate(fixture.starting_at);
  const base = {
    id: providerId("fixture", fixture.id),
    providerId: fixture.id,
    competitionId:
      competitionId || providerId("competition", fixture.league_id),
    stage: fixture.stage?.name || null,
    group: fixture.group?.name || null,
    status: normalizeStatus(fixture.state),
    startsAt,
    homeTeamId: participantId(fixture, "home"),
    awayTeamId: participantId(fixture, "away"),
    venueId: providerId("venue", fixture.venue_id || fixture.venue?.id),
    source: "cached",
    providerUpdatedAt: fixture.updated_at
      ? new Date(fixture.updated_at)
      : null,
    syncedAt: new Date(),
  };

  return {
    fixture: base,
    match: {
      ...base,
      fixtureId: base.id,
      score: normalizeScore(fixture.scores),
      events: fixture.events || [],
      statistics: fixture.statistics || {},
      lineups: fixture.lineups || {},
    },
  };
}

function normalizeStanding(standing, competitionId) {
  return {
    id: `standing-${standing.id || `${standing.group_id}-${standing.participant_id}`}`,
    providerId: standing.id,
    competitionId,
    group: standing.group?.name || String(standing.group_id || ""),
    teamId: providerId("team", standing.participant_id),
    position: standing.position,
    points: standing.points || 0,
    source: "cached",
    syncedAt: new Date(),
  };
}

function normalizeVenue(venue) {
  return {
    id: providerId("venue", venue.id),
    providerId: venue.id,
    name: venue.name,
    city: venue.city_name || venue.city?.name || null,
    country: venue.country?.name || null,
    capacity: venue.capacity || null,
    imageUrl: venue.image_path || null,
    coordinates:
      venue.latitude && venue.longitude
        ? { latitude: venue.latitude, longitude: venue.longitude }
        : null,
    source: "cached",
    providerUpdatedAt: venue.updated_at ? new Date(venue.updated_at) : null,
    syncedAt: new Date(),
  };
}

module.exports = {
  normalizeFixture,
  normalizePlayer,
  normalizeScore,
  normalizeStanding,
  normalizeTeam,
  normalizeVenue,
};

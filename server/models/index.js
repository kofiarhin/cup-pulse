const mongoose = require("mongoose");

const options = {
  timestamps: true,
  minimize: false,
  versionKey: false,
  suppressReservedKeysWarning: true,
};

const sourceFields = {
  providerId: { type: Number, index: true, sparse: true },
  source: {
    type: String,
    enum: ["live", "cached", "mock"],
    default: "cached",
    index: true,
  },
  providerUpdatedAt: Date,
  syncedAt: { type: Date, index: true },
};

function createModel(name, collection, fields, indexes = []) {
  const schema = new mongoose.Schema(
    {
      id: { type: String, required: true, unique: true, index: true },
      ...sourceFields,
      ...fields,
    },
    options,
  );

  for (const [definition, indexOptions] of indexes) {
    schema.index(definition, indexOptions);
  }

  return mongoose.models[name] || mongoose.model(name, schema, collection);
}

const Competition = createModel("Competition", "competitions", {
  name: { type: String, required: true, index: true },
  season: { type: String, required: true, index: true },
  status: String,
  stages: [mongoose.Schema.Types.Mixed],
});

const Group = createModel("Group", "groups", {
  competitionId: { type: String, index: true },
  name: { type: String, required: true },
  code: { type: String, index: true },
  stage: String,
  teamIds: [{ type: String }],
  standings: [mongoose.Schema.Types.Mixed],
});

const Announcement = createModel("Announcement", "announcements", {
  title: { type: String, required: true },
  message: { type: String, required: true },
  severity: { type: String, enum: ["info", "warning", "critical"], default: "info" },
  active: { type: Boolean, default: true, index: true },
  startsAt: { type: Date, index: true },
  endsAt: { type: Date, index: true },
  createdBy: String,
});

const FeaturedContent = createModel("FeaturedContent", "featuredcontent", {
  title: { type: String, required: true },
  description: String,
  type: { type: String, enum: ["match", "team", "player", "article", "external"], required: true },
  targetId: String,
  href: String,
  imageUrl: String,
  priority: { type: Number, default: 0, index: true },
  active: { type: Boolean, default: true, index: true },
  startsAt: { type: Date, index: true },
  endsAt: { type: Date, index: true },
});

const RealtimeEvent = createModel("RealtimeEvent", "realtimeevents", {
  type: { type: String, required: true, index: true },
  collection: { type: String, required: true },
  ids: [{ type: String }],
  scope: String,
  emittedAt: { type: Date, required: true, index: true },
}, [[{ emittedAt: 1 }, { expireAfterSeconds: 86400 }]]);

const Team = createModel(
  "Team",
  "teams",
  {
    competitionId: { type: String, index: true },
    name: { type: String, required: true, index: true },
    code: { type: String, index: true },
    country: String,
    group: { type: String, index: true },
    crestUrl: String,
    form: mongoose.Schema.Types.Mixed,
  },
  [[{ competitionId: 1, name: 1 }, {}]],
);

const Player = createModel(
  "Player",
  "players",
  {
    teamId: { type: String, index: true },
    name: { type: String, required: true, index: true },
    position: { type: String, index: true },
    imageUrl: String,
    availability: String,
    statistics: mongoose.Schema.Types.Mixed,
    recentForm: mongoose.Schema.Types.Mixed,
  },
  [[{ teamId: 1, name: 1 }, {}]],
);

const Fixture = createModel("Fixture", "fixtures", {
  competitionId: { type: String, index: true },
  stage: { type: String, index: true },
  group: { type: String, index: true },
  status: { type: String, index: true },
  startsAt: { type: Date, index: true },
  homeTeamId: { type: String, index: true },
  awayTeamId: { type: String, index: true },
  venueId: { type: String, index: true },
});

const Match = createModel("Match", "matches", {
  competitionId: { type: String, index: true },
  fixtureId: { type: String, index: true },
  stage: { type: String, index: true },
  group: { type: String, index: true },
  status: { type: String, index: true },
  startsAt: { type: Date, index: true },
  homeTeamId: { type: String, index: true },
  awayTeamId: { type: String, index: true },
  venueId: { type: String, index: true },
  score: mongoose.Schema.Types.Mixed,
  events: [mongoose.Schema.Types.Mixed],
  statistics: mongoose.Schema.Types.Mixed,
  lineups: mongoose.Schema.Types.Mixed,
});

const Standing = createModel(
  "Standing",
  "standings",
  {
    competitionId: { type: String, index: true },
    group: { type: String, index: true },
    teamId: { type: String, index: true },
    position: Number,
    played: Number,
    won: Number,
    drawn: Number,
    lost: Number,
    goalsFor: Number,
    goalsAgainst: Number,
    goalDifference: Number,
    points: Number,
    qualificationStatus: String,
  },
  [[{ competitionId: 1, group: 1, position: 1 }, {}]],
);

const Venue = createModel("Venue", "venues", {
  name: { type: String, required: true, index: true },
  city: String,
  country: String,
  capacity: Number,
  imageUrl: String,
  coordinates: mongoose.Schema.Types.Mixed,
});

const Prediction = createModel("Prediction", "predictions", {
  matchId: { type: String, required: true, unique: true, index: true },
  homeWinProbability: Number,
  drawProbability: Number,
  awayWinProbability: Number,
  predictedScore: String,
  confidence: String,
  rationale: [String],
  inputSnapshot: mongoose.Schema.Types.Mixed,
  sourceFingerprint: { type: String, index: true },
  generatedAt: Date,
});

const Summary = createModel("Summary", "summaries", {
  matchId: { type: String, required: true, unique: true, index: true },
  message: String,
  title: String,
  sections: [mongoose.Schema.Types.Mixed],
  article: String,
  sourceFingerprint: { type: String, index: true },
  generatedAt: Date,
});

const SyncState = createModel("SyncState", "syncstates", {
  job: { type: String, required: true, unique: true, index: true },
  status: String,
  lastStartedAt: Date,
  lastSucceededAt: Date,
  lastFailedAt: Date,
  lastError: String,
  metadata: mongoose.Schema.Types.Mixed,
});

const JobLock = createModel("JobLock", "joblocks", {
  key: { type: String, required: true, unique: true, index: true },
  owner: String,
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
});

const models = {
  competitions: Competition,
  groups: Group,
  teams: Team,
  players: Player,
  fixtures: Fixture,
  matches: Match,
  standings: Standing,
  venues: Venue,
  predictions: Prediction,
  summaries: Summary,
  announcements: Announcement,
  "featured-content": FeaturedContent,
};

module.exports = {
  Announcement,
  Competition,
  FeaturedContent,
  Fixture,
  Group,
  JobLock,
  Match,
  Player,
  Prediction,
  RealtimeEvent,
  Standing,
  Summary,
  SyncState,
  Team,
  Venue,
  models,
};

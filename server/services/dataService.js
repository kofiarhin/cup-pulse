const { generatedAt, mockData } = require("../data/mockData");
const { models } = require("../models");

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

function parsePagination(query) {
  const page = Number.parseInt(query.page || "1", 10);
  const limit = Number.parseInt(query.limit || String(DEFAULT_LIMIT), 10);

  if (page < 1 || limit < 1 || limit > MAX_LIMIT) {
    const error = new Error("Pagination values are invalid");
    error.status = 400;
    error.code = "INVALID_QUERY";
    throw error;
  }

  return { page, limit };
}

function toPlain(record) {
  if (!record) {
    return null;
  }

  const plain = typeof record.toObject === "function" ? record.toObject() : record;
  const {
    _id,
    createdAt,
    updatedAt,
    providerId,
    providerUpdatedAt,
    source,
    syncedAt,
    isFallback,
    ...normalized
  } = plain;
  return normalized;
}

function sideField(side, field) {
  return `${side}Team${field}`;
}

function fallbackValue(...values) {
  return values.find(Boolean) || null;
}

function teamDisplay(record, side, teamMap) {
  const id = record[sideField(side, "Id")];
  const team = teamMap.get(id) || {};

  return {
    id: fallbackValue(id),
    name: fallbackValue(record[sideField(side, "Name")], team.name, id),
    logo: fallbackValue(record[sideField(side, "Logo")], team.crestUrl),
  };
}

function teamIdsFor(records) {
  const ids = new Set();
  for (const record of records) {
    if (record.homeTeamId) ids.add(record.homeTeamId);
    if (record.awayTeamId) ids.add(record.awayTeamId);
  }
  return [...ids];
}

async function teamMapFor(records) {
  const ids = teamIdsFor(records);
  if (ids.length === 0) {
    return new Map();
  }

  const teams = await models.teams.find({ id: { $in: ids } }).lean();
  return new Map(teams.map((team) => [team.id, team]));
}

function supportsTeamEnrichment(collection) {
  return ["fixtures", "matches"].includes(collection);
}

async function serializeRecords(collection, records) {
  if (!supportsTeamEnrichment(collection)) {
    return records.map(toPlain);
  }

  const teamMap = await teamMapFor(records);
  return records.map((record) => {
    const plain = toPlain(record);
    return {
      ...plain,
      homeTeam: teamDisplay(record, "home", teamMap),
      awayTeam: teamDisplay(record, "away", teamMap),
    };
  });
}

async function serializeRecord(collection, record) {
  const [serialized] = await serializeRecords(collection, [record]);
  return serialized;
}

function buildMeta({ source, syncedAt, fallbackReason }) {
  const reference = syncedAt ? new Date(syncedAt) : new Date(generatedAt);
  const ageSeconds = Math.max(
    0,
    Math.floor((Date.now() - reference.getTime()) / 1000),
  );

  return {
    source,
    generatedAt: reference.toISOString(),
    ageSeconds,
    stale: source !== "live",
    ...(fallbackReason ? { fallbackReason } : {}),
  };
}

function buildFilter(query, extraFilter) {
  const filter = { ...extraFilter };
  const directFields = [
    "competitionId",
    "group",
    "stage",
    "status",
    "position",
  ];

  for (const field of directFields) {
    if (query[field] !== undefined && query[field] !== "") {
      filter[field] = query[field];
    }
  }

  if (query.teamId) {
    filter.$teamId = query.teamId;
  }

  if (query.date) {
    const start = new Date(`${query.date}T00:00:00.000Z`);
    if (Number.isNaN(start.getTime())) {
      const error = new Error("Date filter is invalid");
      error.status = 400;
      error.code = "INVALID_QUERY";
      throw error;
    }
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 1);
    filter.$date = { start, end };
  }

  return filter;
}

function toMongoFilter(filter) {
  const mongoFilter = {};
  for (const [key, value] of Object.entries(filter)) {
    if (key === "$teamId") {
      mongoFilter.$or = [{ teamId: value }, { homeTeamId: value }, { awayTeamId: value }];
    } else if (key === "$date") {
      mongoFilter.startsAt = { $gte: value.start, $lt: value.end };
    } else {
      mongoFilter[key] = value;
    }
  }
  return mongoFilter;
}

function matchesFilter(record, filter) {
  return Object.entries(filter).every(([key, value]) => {
    if (key === "$teamId") {
      return [record.teamId, record.homeTeamId, record.awayTeamId].includes(value);
    }
    if (key === "$date") {
      if (!record.startsAt) {
        return false;
      }
      const startsAt = new Date(record.startsAt);
      return startsAt >= value.start && startsAt < value.end;
    }
    return String(record[key]) === String(value);
  });
}

function createDataService({
  allowMockData = false,
  databaseStatus = () => "disconnected",
} = {}) {
  async function list(collection, query = {}, extraFilter = {}) {
    const { page, limit } = parsePagination(query);
    const search = String(query.search || "").trim();
    const normalizedFilter = buildFilter(query, extraFilter);

    if (databaseStatus() === "connected") {
      const filter = toMongoFilter(normalizedFilter);
      if (search) {
        filter.name = { $regex: search, $options: "i" };
      }

      const model = models[collection];
      const [records, total] = await Promise.all([
        model
          .find(filter)
          .sort({ startsAt: 1, position: 1, name: 1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .lean(),
        model.countDocuments(filter),
      ]);
      const latestSync = records.reduce(
        (latest, record) =>
          record.syncedAt && (!latest || record.syncedAt > latest)
            ? record.syncedAt
            : latest,
        null,
      );

      return {
        data: await serializeRecords(collection, records),
        pagination: {
          page,
          limit,
          total,
          pages: total === 0 ? 0 : Math.ceil(total / limit),
        },
        meta: buildMeta({
          source: latestSync ? "cached" : "cached",
          syncedAt: latestSync,
        }),
      };
    }

    if (!allowMockData) {
      const error = new Error("Cached data is unavailable");
      error.status = 503;
      error.code = "DATA_UNAVAILABLE";
      throw error;
    }

    let records = [...(mockData[collection] || [])];
    if (Object.keys(normalizedFilter).length > 0) {
      records = records.filter((record) =>
        matchesFilter(record, normalizedFilter),
      );
    }
    if (search) {
      const lowered = search.toLowerCase();
      records = records.filter((record) =>
        String(record.name || "").toLowerCase().includes(lowered),
      );
    }
    const total = records.length;
    const data = records
      .slice((page - 1) * limit, page * limit)
      .map(toPlain);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        pages: total === 0 ? 0 : Math.ceil(total / limit),
      },
      meta: buildMeta({
        source: "mock",
        fallbackReason: "MongoDB cache is unavailable in development",
      }),
    };
  }

  async function detail(collection, id, label, key = "id") {
    let record;
    if (databaseStatus() === "connected") {
      record = await models[collection].findOne({ [key]: id }).lean();
    } else if (allowMockData) {
      record = (mockData[collection] || []).find((item) => item[key] === id);
    } else {
      const error = new Error("Cached data is unavailable");
      error.status = 503;
      error.code = "DATA_UNAVAILABLE";
      throw error;
    }

    if (!record) {
      const error = new Error(`${label} not found`);
      error.status = 404;
      error.code = "ENTITY_NOT_FOUND";
      throw error;
    }

    return {
      data:
        databaseStatus() === "connected"
          ? await serializeRecord(collection, record)
          : toPlain(record),
      meta: buildMeta({
        source: databaseStatus() === "connected" ? "cached" : "mock",
        syncedAt: record.syncedAt,
        fallbackReason:
          databaseStatus() === "connected"
            ? undefined
            : "MongoDB cache is unavailable in development",
      }),
    };
  }

  return {
    detail,
    list,
  };
}

module.exports = {
  createDataService,
};

function interval(environment, name, fallback) {
  const value = Number.parseInt(environment[name] || String(fallback), 10);
  if (!Number.isInteger(value) || value < 60_000) {
    throw new Error(`${name} must be an integer of at least 60000 milliseconds`);
  }
  return value;
}

function buildSchedule(environment = process.env) {
  return [
    {
      name: "static",
      intervalMs: interval(environment, "STATIC_REFRESH_INTERVAL_MS", 86_400_000),
    },
    {
      name: "core",
      intervalMs: interval(environment, "CORE_REFRESH_INTERVAL_MS", 21_600_000),
    },
    {
      name: "fixtures",
      intervalMs: interval(environment, "FIXTURE_REFRESH_INTERVAL_MS", 1_800_000),
    },
    {
      name: "match-stats",
      intervalMs: interval(
        environment,
        "MATCH_STATS_REFRESH_INTERVAL_MS",
        900_000,
      ),
    },
  ];
}

function isActiveMatchWindow(matches, now = new Date()) {
  const beforeMs = 3 * 60 * 60 * 1000;
  const afterMs = 4 * 60 * 60 * 1000;

  return matches.some((match) => {
    if (["live", "inplay", "ht", "et", "break"].includes(match.status)) {
      return true;
    }
    if (!match.startsAt) {
      return false;
    }
    const kickoff = new Date(match.startsAt).getTime();
    const current = now.getTime();
    return kickoff - beforeMs <= current && current <= kickoff + afterMs;
  });
}

function startSchedule({ schedule, jobs, runImmediately = true }) {
  const timers = [];
  for (const entry of schedule) {
    const job = jobs[entry.name];
    if (!job) continue;
    if (runImmediately) {
      Promise.resolve(job()).catch((error) => {
        console.error(`Initial ${entry.name} sync failed:`, error.message);
      });
    }
    const timer = setInterval(() => {
      Promise.resolve(job()).catch((error) => {
        console.error(`${entry.name} sync failed:`, error.message);
      });
    }, entry.intervalMs);
    timer.unref?.();
    timers.push(timer);
  }
  return () => timers.forEach(clearInterval);
}

module.exports = { buildSchedule, isActiveMatchWindow, startSchedule };

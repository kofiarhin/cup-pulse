const DEFAULT_BASE_URL = "https://api.sportmonks.com/v3/football";

function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function createSportmonksClient({
  token,
  fetchImpl = global.fetch,
  baseUrl = DEFAULT_BASE_URL,
  timeoutMs = 15_000,
  maxRetries = 2,
} = {}) {
  if (!token) {
    throw new Error("SPORTMONKS_API_TOKEN is required for synchronization");
  }
  if (typeof fetchImpl !== "function") {
    throw new Error("A fetch implementation is required");
  }

  async function request(path, parameters = {}) {
    const url = new URL(`${baseUrl}${path}`);
    url.searchParams.set("api_token", token);
    for (const [key, value] of Object.entries(parameters)) {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }

    for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const response = await fetchImpl(url, { signal: controller.signal });
        if (response.ok) {
          return response.json();
        }

        const retryable = response.status === 429 || response.status >= 500;
        if (!retryable || attempt === maxRetries) {
          const error = new Error(
            `Sportmonks request failed with status ${response.status}`,
          );
          error.code = "SPORTMONKS_REQUEST_FAILED";
          error.status = response.status;
          throw error;
        }

        const retryAfter = Number(response.headers?.get?.("retry-after") || 0);
        await sleep(retryAfter > 0 ? retryAfter * 1000 : 250 * 2 ** attempt);
      } catch (error) {
        if (attempt === maxRetries || error.code === "SPORTMONKS_REQUEST_FAILED") {
          throw error;
        }
        await sleep(250 * 2 ** attempt);
      } finally {
        clearTimeout(timeout);
      }
    }

    throw new Error("Sportmonks request failed");
  }

  async function fetchAll(path, parameters = {}) {
    const records = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const payload = await request(path, { ...parameters, page });
      records.push(...(Array.isArray(payload.data) ? payload.data : []));
      hasMore = Boolean(payload.pagination?.has_more);
      page += 1;
    }

    return records;
  }

  async function fetchOne(path, parameters = {}) {
    const payload = await request(path, parameters);
    return payload.data;
  }

  return { fetchAll, fetchOne, request };
}

module.exports = { createSportmonksClient };

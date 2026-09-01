/**
 * Production-grade Application Cache & Stale-While-Revalidate (SWR) Manager.
 * 
 * Provides instant 0ms responses from memory/storage like ClickUp & Jira,
 * followed by background revalidation.
 */

const memoryCache = new Map();
const inFlightRequests = new Map();

const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes default

export const getCacheKey = (prefix, id = "") => {
  const userId = localStorage.getItem("userid") || "anon";
  return `${prefix}:${userId}:${id}`;
};

/**
 * Reads data synchronously from memory cache or localStorage.
 */
export const getCached = (key) => {
  // 1. Check memory cache first
  const mem = memoryCache.get(key);
  if (mem) {
    if (Date.now() < mem.expiresAt) {
      return mem.data;
    }
  }

  // 2. Fallback to localStorage for cold page opens
  try {
    const raw = localStorage.getItem(`swr_${key}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Date.now() < parsed.expiresAt) {
        memoryCache.set(key, parsed);
        return parsed.data;
      }
    }
  } catch (e) {
    // Ignore parse errors
  }

  return null;
};

/**
 * Stores data into memory and localStorage.
 */
export const setCached = (key, data, ttl = DEFAULT_TTL) => {
  const item = {
    data,
    savedAt: Date.now(),
    expiresAt: Date.now() + ttl,
  };

  memoryCache.set(key, item);

  try {
    localStorage.setItem(`swr_${key}`, JSON.stringify(item));
  } catch (e) {
    // LocalStorage quota might be full, safe to ignore
  }
};

/**
 * Removes cached keys matching a prefix or specific key.
 */
export const invalidateCache = (pattern) => {
  // Clear memory cache keys
  for (const key of memoryCache.keys()) {
    if (key.includes(pattern)) {
      memoryCache.delete(key);
    }
  }

  // Clear localStorage keys
  try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const storageKey = localStorage.key(i);
      if (storageKey && storageKey.startsWith("swr_") && storageKey.includes(pattern)) {
        localStorage.removeItem(storageKey);
      }
    }
  } catch (e) {
    // Ignore
  }
};

/**
 * Executes a request with SWR semantics:
 * - If cache exists, immediately calls onData(cachedData, isInitialFromCache = true).
 * - Always runs fetchFn() in the background (deduplicating concurrent requests).
 * - When fresh data arrives, saves to cache and calls onData(freshData, isInitialFromCache = false).
 */
export const swrFetch = async (key, fetchFn, { ttl = DEFAULT_TTL, onData, forceRefetch = false } = {}) => {
  const cachedData = !forceRefetch ? getCached(key) : null;

  if (cachedData && typeof onData === "function") {
    onData(cachedData, true);
  }

  // Deduplicate inflight network requests for the same key
  if (inFlightRequests.has(key)) {
    try {
      const result = await inFlightRequests.get(key);
      if (typeof onData === "function") {
        onData(result, false);
      }
      return result;
    } catch (err) {
      if (cachedData) return cachedData;
      throw err;
    }
  }

  const promise = (async () => {
    try {
      const freshData = await fetchFn();
      setCached(key, freshData, ttl);
      if (typeof onData === "function") {
        onData(freshData, false);
      }
      return freshData;
    } finally {
      inFlightRequests.delete(key);
    }
  })();

  inFlightRequests.set(key, promise);

  if (cachedData) {
    // Fire and forget background revalidation
    promise.catch((err) => {
      console.warn(`[swrFetch] Background revalidation failed for ${key}:`, err);
    });
    return cachedData;
  }

  return promise;
};

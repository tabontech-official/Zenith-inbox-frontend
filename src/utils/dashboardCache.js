import { apiFetch } from "./apiClient";
const BACKEND_URL = "https://email-syncing-backend.vercel.app";

let summaryCache = null;
let cacheTime = 0;
let pendingPromise = null;
const CACHE_TTL = 3 * 60 * 1000; // 3 minutes cache lifetime

/**
 * Fetches dashboard summary with deduplication and in-memory caching.
 */
export async function getDashboardSummaryCached(userId, forceRefetch = false) {
  if (!userId) return null;

  const now = Date.now();
  if (!forceRefetch && summaryCache && (now - cacheTime < CACHE_TTL)) {
    return summaryCache;
  }

  if (pendingPromise) {
    return pendingPromise;
  }

  const token = localStorage.getItem("usertoken");

  pendingPromise = apiFetch(`${BACKEND_URL}/auth/dashboard-summary/${userId}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: Endpoint not available on remote server`);
      }
      return res.json();
    })
    .then((data) => {
      pendingPromise = null;
      if (data.success) {
        summaryCache = data;
        cacheTime = Date.now();
        return data;
      }
      throw new Error(data.message || "Failed to fetch dashboard summary");
    })
    .catch((err) => {
      pendingPromise = null;
      throw err;
    });

  return pendingPromise;
}

/**
 * Invalidates the dashboard cache to force a fresh fetch on next access.
 */
export function invalidateDashboardCache() {
  summaryCache = null;
  cacheTime = 0;
}

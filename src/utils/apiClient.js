/*
|--------------------------------------------------------------------------
| Central API client — auth headers, base URL, 401 handling
|--------------------------------------------------------------------------
|
| WHY THIS EXISTS
|
| On 2026-08-17 the backend added authMiddleware to ~155 routes without
| updating the callers. An audit found 100 frontend calls hitting
| auth-required routes with no Authorization header — every one of them
| silently 401s. Fixing 100 call sites by hand would leave the same class
| of bug possible the next time a route is guarded.
|
| Instead, the token is attached in ONE place:
|
|   - axios: a global request interceptor on the default axios instance.
|     Every `import axios from "axios"` in the app shares that instance,
|     so all 27 importing files are covered without touching them.
|
|   - fetch: apiFetch() below, since fetch has no interceptor concept.
|
| Import this module once (src/index.js) to install the interceptors.
|
*/

import axios from 'axios';

/* Default preserves current production behaviour; override for local dev. */
export const API_BASE_URL = (
  process.env.REACT_APP_API_BASE_URL || 'https://email-syncing-backend.vercel.app'
).replace(/\/$/, '');

/*
 * The hardcoded host that call sites still contain. Requests to it are
 * rewritten to API_BASE_URL so the env override works everywhere without
 * editing every URL string.
 */
const LEGACY_HOST = 'https://email-syncing-backend.vercel.app';

export const TOKEN_KEY = 'usertoken';

export const getToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY) || null;
  } catch {
    return null;
  }
};

/*
 * Endpoints that legitimately run without a token. A 401 from these is a
 * real answer (bad credentials), not an expired session, so it must not
 * trigger the session-expired redirect.
 */
const PUBLIC_PATHS = [
  '/auth/login',
  '/auth/signUp',
  '/auth/google-login',
  '/auth/request-login',
  '/auth/verify-login',
  '/auth/forgot-password',
  '/auth/set-password',
  '/api/landing-page',
  '/api/product-page',
  '/talk',
];

const pathOf = (url = '') => {
  try {
    return new URL(url, API_BASE_URL).pathname;
  } catch {
    return String(url);
  }
};

export const isPublicPath = (url) => {
  const p = pathOf(url);
  return PUBLIC_PATHS.some((pub) => p === pub || p.startsWith(`${pub}/`));
};

/* Only rewrite/attach for our own backend, never third-party URLs. */
const isBackendUrl = (url = '') => {
  const u = String(url);
  if (u.startsWith(LEGACY_HOST) || u.startsWith(API_BASE_URL)) return true;
  return u.startsWith('/');
};

export const resolveUrl = (url = '') => {
  const u = String(url);
  if (u.startsWith(LEGACY_HOST)) return API_BASE_URL + u.slice(LEGACY_HOST.length);
  if (u.startsWith('/')) return API_BASE_URL + u;
  return u;
};

/*
|--------------------------------------------------------------------------
| Session handling
|--------------------------------------------------------------------------
|
| Centralised so a missing or rejected token produces one clear message
| and one redirect, instead of each call site silently swallowing a 401.
| Guarded so a burst of parallel failures does not fire repeatedly.
*/
let sessionExpiredHandled = false;

export const handleSessionExpired = (reason = 'Your session has expired. Please log in again.') => {
  if (sessionExpiredHandled) return;
  sessionExpiredHandled = true;

  try {
    window.dispatchEvent(new CustomEvent('auth:session-expired', { detail: { reason } }));
  } catch {
    /* non-browser context */
  }

  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }

  const onLogin = window.location?.pathname === '/login';
  if (!onLogin) {
    /* Let the current call stack unwind before navigating. */
    setTimeout(() => {
      window.location.href = '/login?session=expired';
    }, 50);
  }
};

/*
|--------------------------------------------------------------------------
| axios interceptors
|--------------------------------------------------------------------------
*/
export const installAxiosInterceptors = () => {
  axios.interceptors.request.use(
    (config) => {
      const url = config.url || '';
      if (!isBackendUrl(url)) return config;

      config.url = resolveUrl(url);

      const token = getToken();

      if (token) {
        config.headers = config.headers || {};
        /* Never clobber an explicitly-set header. */
        if (!config.headers.Authorization && !config.headers.authorization) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } else if (!isPublicPath(config.url)) {
        /*
         * No token for a route that needs one. Fail fast with a clear
         * message rather than sending a request that will 401.
         */
        handleSessionExpired('You are not signed in. Please log in again.');
        return Promise.reject(
          new Error('No auth token available — request cancelled.')
        );
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error?.response?.status;
      const url = error?.config?.url || '';

      if (status === 401 && !isPublicPath(url)) {
        handleSessionExpired();
      }

      return Promise.reject(error);
    }
  );
};

/*
|--------------------------------------------------------------------------
| apiFetch — the fetch equivalent
|--------------------------------------------------------------------------
|
| Drop-in replacement for fetch() against our backend. Same signature and
| same return value (a Response), so call sites only change their name.
*/
export const apiFetch = async (url, options = {}) => {
  const target = isBackendUrl(url) ? resolveUrl(url) : String(url);

  /* Third-party URL — behave exactly like fetch. */
  if (!isBackendUrl(url)) return fetch(target, options);

  const token = getToken();
  const headers = new Headers(options.headers || {});

  if (token) {
    if (!headers.has('Authorization')) headers.set('Authorization', `Bearer ${token}`);
  } else if (!isPublicPath(target)) {
    handleSessionExpired('You are not signed in. Please log in again.');
    throw new Error('No auth token available — request cancelled.');
  }

  const response = await fetch(target, { ...options, headers });

  if (response.status === 401 && !isPublicPath(target)) {
    handleSessionExpired();
  }

  return response;
};

export default apiFetch;

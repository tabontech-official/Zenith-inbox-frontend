import toast from "react-hot-toast";
import { API_BASE_URL } from "./apiClient";

/*
|--------------------------------------------------------------------------
| Microsoft sign-in — one implementation
|--------------------------------------------------------------------------
|
| Exchange Online rejects basic auth, so a Microsoft mailbox can only be
| connected through the MSAL OAuth flow on the backend. The app-password
| modal that still exists for Gmail/SMTP cannot produce a working Microsoft
| connection.
|
| The connections page redirected to OAuth, but the scenario builders and
| the sidebar opened the app-password modal instead — same account type,
| two different flows, and only one of them worked. This module is the
| single entry point so they cannot drift again.
|
| The flow leaves the app entirely: the browser goes to Microsoft, then to
| the backend callback, which returns to `redirectPath` with the outcome in
| the query string. consumeMicrosoftOAuthResult() reads that on the way
| back.
*/

export const MICROSOFT_OAUTH_PARAMS = [
  "outlook-auth-success",
  "reason",
  "email",
];

/*
 * Sends the browser to Microsoft.
 *
 * `redirectPath` is where the callback returns to — pass the page the user
 * started from, including its query string, so they land back where they
 * were rather than on a generic page.
 */
export const startMicrosoftOAuth = ({ userId, redirectPath } = {}) => {
  const resolvedUserId = userId || localStorage.getItem("userid");

  if (!resolvedUserId) {
    toast.error("User not found. Please log in again.");
    return false;
  }

  const target =
    redirectPath ||
    `${window.location.pathname}${window.location.search}` ||
    "/connection";

  const authURL = `${API_BASE_URL}/auth/outlook/connect?userId=${encodeURIComponent(
    resolvedUserId,
  )}&redirect=${encodeURIComponent(target)}`;

  window.location.href = authURL;
  return true;
};

const REASON_TEXT = {
  missing_code: "Microsoft did not return an authorization code.",
  token_exchange_failed:
    "Could not exchange the Microsoft authorization code for tokens.",
  access_denied: "Access was denied on the Microsoft consent screen.",
};

/*
 * Reports the outcome of a completed sign-in and strips the parameters so
 * a refresh does not replay the toast.
 *
 * Returns true when this page load WAS an OAuth return, so the caller can
 * refresh its connection list only when something actually changed.
 */
export const consumeMicrosoftOAuthResult = ({ onSuccess } = {}) => {
  const params = new URLSearchParams(window.location.search);
  const outcome = params.get("outlook-auth-success");

  if (!outcome) return false;

  if (outcome === "true") {
    const email = params.get("email");

    toast.success(
      email
        ? `Microsoft account connected: ${email}`
        : "Microsoft account connected successfully.",
    );

    onSuccess?.(email);
  } else {
    const reason = params.get("reason");

    toast.error(
      REASON_TEXT[reason] ||
        `Microsoft connection failed${reason ? `: ${reason}` : "."}`,
      { duration: 8000 },
    );
  }

  MICROSOFT_OAUTH_PARAMS.forEach((key) => params.delete(key));

  const query = params.toString();
  window.history.replaceState(
    {},
    "",
    window.location.pathname + (query ? `?${query}` : ""),
  );

  return true;
};

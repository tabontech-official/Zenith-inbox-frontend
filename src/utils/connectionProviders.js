/*
|--------------------------------------------------------------------------
| Connection providers — app type ↔ stored provider value
|--------------------------------------------------------------------------
|
| The provider stored on a Connection is not the same string as the app
| type the UI offers, and Microsoft has TWO stored values:
|
|   microsoft         app-password connections (legacy)
|   microsoft-oauth   OAuth connections — what every new one is
|
| Every dropdown filtered on `provider === "microsoft"`, so a mailbox
| connected through OAuth appeared on the connections page but was missing
| from every scenario's Connection list. Same bug, four places.
|
| The mapping lives here so a new provider value is added once.
*/

export const PROVIDERS_BY_APP_TYPE = {
  Gmail: ["gmail"],
  Microsoft: ["microsoft", "microsoft-oauth"],
  /* "Other Email" — customer-configured SMTP, plus legacy values. */
  Email: ["outlook", "smtp", "other"],
};

/* Does this connection belong under the given app type? */
export const matchesAppType = (connection, appType) => {
  const allowed = PROVIDERS_BY_APP_TYPE[appType];

  /*
   * An unknown app type matches nothing rather than everything. Returning
   * true here is what listed Gmail accounts under Microsoft.
   */
  if (!allowed) return false;

  return allowed.includes(String(connection?.provider || "").toLowerCase());
};

export const connectionsForAppType = (connections = [], appType) =>
  connections.filter((c) => matchesAppType(c, appType));

/* The app type a stored connection belongs to, or null. */
export const appTypeForConnection = (connection) => {
  const provider = String(connection?.provider || "").toLowerCase();

  return (
    Object.keys(PROVIDERS_BY_APP_TYPE).find((appType) =>
      PROVIDERS_BY_APP_TYPE[appType].includes(provider),
    ) || null
  );
};

/*
 * Display label. Raw values read badly in a dropdown — "MICROSOFT-OAUTH"
 * is an implementation detail, and a user picking a mailbox does not care
 * how it authenticates.
 */
const LABELS = {
  gmail: "GMAIL",
  microsoft: "MICROSOFT",
  "microsoft-oauth": "MICROSOFT",
  outlook: "OUTLOOK",
  smtp: "SMTP",
  other: "OTHER",
};

export const providerLabel = (provider) =>
  LABELS[String(provider || "").toLowerCase()] ||
  String(provider || "").toUpperCase();

/* OAuth connections cannot be edited with an app-password form. */
export const isOAuthConnection = (connection) =>
  String(connection?.provider || "").toLowerCase() === "microsoft-oauth" ||
  String(connection?.connectionType || "").toLowerCase() === "oauth";

/*
|--------------------------------------------------------------------------
| Connection health — one rule, shared by every surface
|--------------------------------------------------------------------------
|
| A connection row carries TWO different ideas of "working", and they are
| not interchangeable:
|
|   verified — this account was successfully connected once. Set when the
|              link is first established and never revisited.
|   status   — whether it works NOW. "active", "disconnected", or
|              "reauth_required" (the OAuth refresh token was rejected:
|              revoked, expired, or consent withdrawn).
|
| Reading `verified` to decide whether mail can be sent is what produced a
| store showing a green "Verified" badge, a green trigger card and a
| complete setup checklist over a mailbox whose Microsoft grant had been
| revoked — while the server refused to activate the scenario, because the
| server checks `status`.
|
| The server accepts `status: "active"` and nothing else (a row predating
| the field counts as active, which is the schema default). Everything the
| user sees should reach that same verdict, so the rule lives here rather
| than being retyped per page.
*/

/* Mirrors the server's activation rule in controller/Scenario.js. */
export const isConnectionUsable = (connection) =>
  Boolean(connection) &&
  (!connection.status || connection.status === "active");

export const findConnection = (connections, connectionId) =>
  Array.isArray(connections)
    ? connections.find((c) => c._id === connectionId)
    : undefined;

export const isConnectionUsableById = (connections, connectionId) =>
  isConnectionUsable(findConnection(connections, connectionId));

/*
 * Phrased to complete "<account> cannot be used — <problem>", so it states
 * the fault only. The call to action belongs to whichever surface shows
 * it — each already offers a Reconnect control — and folding one in here
 * produced a second dash mid-sentence everywhere this is used.
 */
export const connectionProblem = (connection) => {
  if (!connection) return "the account is no longer available";
  if (connection.status === "reauth_required")
    return "its sign-in has expired";
  if (connection.status === "disconnected") return "it is disconnected";
  return "it is not active";
};

export const connectionLabel = (connection, fallback = "This account") =>
  connection?.email || fallback;

/* The connection ids a scenario needs in order to run. */
export const scenarioConnectionIds = (scenario) => {
  const ids = [];

  const incoming = scenario?.incomingLead;
  const isMailhook = (incoming?.app?.name || "").toLowerCase() === "mailhook";

  if (!isMailhook && incoming?.connectionId) {
    ids.push({ id: String(incoming.connectionId), role: "trigger inbox" });
  }

  (scenario?.routerBranches || []).forEach((branch) =>
    (branch?.modules || []).forEach((m) => {
      const isDelay =
        m.type === "Delay" ||
        (m.app?.name || "").toLowerCase() === "delay" ||
        Boolean(m.delayValue);

      if (isDelay) return;

      ids.push({
        id: m.connectionId ? String(m.connectionId) : "",
        role: m.app?.name || m.type || "an email step",
      });
    }),
  );

  return ids;
};

/*
 * Why a paused scenario cannot run, in one line — or null when nothing is
 * wrong with it and it is simply switched off.
 *
 * Mirrors the server's activation check (controller/Scenario.js) so the
 * list agrees with what actually happens on activation. Returns null when
 * connections have not loaded yet: an unknown state must not be reported
 * as a fault.
 */
export const scenarioBlockReason = (scenario, connections) => {
  if (!Array.isArray(connections) || connections.length === 0) return null;

  const required = scenarioConnectionIds(scenario);
  if (required.length === 0) return null;

  const missing = required.find((entry) => !entry.id);
  if (missing) return `${missing.role} has no sending account selected`;

  const broken = required.find(
    (entry) => !isConnectionUsableById(connections, entry.id),
  );

  if (!broken) return null;

  const connection = findConnection(connections, broken.id);
  return `${connectionLabel(connection)} — ${connectionProblem(connection)}`;
};

/*
 * What the status badge should say. A connection that was verified once
 * and has since lost its grant is NOT "Verified" — that reading is the
 * whole reason a dead mailbox looked healthy.
 */
export const connectionBadge = (connection) => {
  if (connection?.verifying) return { tone: "busy", label: "Verifying" };

  if (connection?.status === "reauth_required")
    return {
      tone: "error",
      label: "Reconnect needed",
      detail: "Sign-in expired",
    };

  if (connection?.status === "disconnected")
    return { tone: "error", label: "Disconnected" };

  if (connection?.verified) return { tone: "ok", label: "Verified" };

  return { tone: "warn", label: "Unverified" };
};

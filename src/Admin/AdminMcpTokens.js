import { apiFetch, API_BASE_URL } from "../utils/apiClient";
import React, { useCallback, useEffect, useState } from "react";
import {
  FiKey,
  FiPlus,
  FiTrash2,
  FiCopy,
  FiShield,
  FiAlertTriangle,
  FiRefreshCw,
  FiSlash,
  FiExternalLink,
} from "react-icons/fi";
import PlatformAdminLayout from "./PlatformAdminLayout";
import toast from "react-hot-toast";

/*
|--------------------------------------------------------------------------
| MCP connector tokens
|--------------------------------------------------------------------------
|
| Issue, review and revoke the credentials an MCP client (Claude, ChatGPT,
| Cursor) presents to reach this account through /mcp.
|
| THE ONE-TIME SECRET IS THE WHOLE DESIGN PROBLEM
|
| The plaintext token exists in exactly one response and is never
| recoverable — the server stores only a SHA-256. So the reveal cannot be a
| toast, an inline row, or anything a stray click or a re-render can take
| away: losing it means the token is dead weight and the user has to issue
| another. It gets a modal that ignores backdrop clicks and closes only on
| an explicit acknowledgement, with the ready-to-paste client config built
| around it while it is still on screen.
|
| Revoking is immediate and cannot be undone, so it is confirmed against
| the token's label rather than a bare "are you sure".
*/

const TOKENS_URL = "/mcp/tokens";
const MCP_ENDPOINT = `${API_BASE_URL}/mcp`;

/*
 * Deep link that opens Claude with the "add custom connector" dialog
 * already up — connectors live under Customize, not Settings, and this
 * skips the navigation. Claude exposes no parameter for pre-filling the
 * server URL, so the best available is to put it on the clipboard in the
 * same click and let the user paste: one keystroke instead of a hunt
 * through menus.
 */
const CLAUDE_ADD_CONNECTOR_URL =
  "https://claude.ai/new?modal=add-custom-connector#customize/connectors";

const EXPIRY_CHOICES = [
  { value: "", label: "Never expires" },
  { value: "30", label: "30 days" },
  { value: "90", label: "90 days" },
  { value: "365", label: "1 year" },
];

const SCOPE_CHOICES = [
  {
    value: "read",
    label: "Read only",
    hint: "The client can look at scenarios, leads, connections and run history. Write tools are not advertised to it at all, so the model never plans around a capability it does not have.",
  },
  {
    value: "read_write",
    label: "Read and write",
    hint: "Additionally lets the client switch scenarios on and off. Activation still obeys the same rules as the web app — it refuses, with reasons, when a scenario is not ready.",
  },
];

const formatDate = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatDateTime = (value) => {
  if (!value) return "Never used";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "Never used";
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

/*
 * The API returns a single `active` boolean, but "revoked" and "expired"
 * are different stories for the person reading the table: one was a
 * decision, the other just happened. Worth telling apart.
 */
const statusOf = (token) => {
  if (token.revokedAt) {
    return { label: "Revoked", className: "bg-red-50 text-red-700 border-red-200" };
  }
  if (token.expiresAt && new Date(token.expiresAt) <= new Date()) {
    return { label: "Expired", className: "bg-slate-100 text-slate-500 border-slate-200" };
  }
  return { label: "Active", className: "bg-emerald-50 text-emerald-700 border-emerald-200" };
};

/*
 * navigator.clipboard needs a secure context and a permission that can be
 * refused. The fallback matters here more than usual: this is sometimes
 * the only moment the token is readable.
 */
const copyText = async (text, what) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`${what} copied.`);
    return;
  } catch {
    /* fall through to the shim */
  }

  try {
    const el = document.createElement("textarea");
    el.value = text;
    el.setAttribute("readonly", "");
    el.style.position = "fixed";
    el.style.opacity = "0";
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
    toast.success(`${what} copied.`);
  } catch {
    toast.error("Could not copy automatically — select the text and copy it manually.");
  }
};

// ── Small building blocks ─────────────────────────────────────────────────────

const CopyBlock = ({ title, value }) => (
  <div>
    <div className="flex items-center justify-between mb-1.5">
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
        {title}
      </p>
      <button
        type="button"
        onClick={() => copyText(value, title)}
        className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-slate-500 hover:text-slate-900 transition"
      >
        <FiCopy size={11} />
        Copy
      </button>
    </div>
    <pre className="bg-slate-900 text-slate-100 rounded-lg p-3 text-[11px] leading-relaxed overflow-x-auto whitespace-pre">
      {value}
    </pre>
  </div>
);

const ScopeBadge = ({ scope }) =>
  scope === "read_write" ? (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
      Read &amp; write
    </span>
  ) : (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
      Read only
    </span>
  );

// ── One-time token reveal ─────────────────────────────────────────────────────

const IssuedTokenModal = ({ issued, onClose }) => {
  const token = issued.token;

  const claudeCodeCommand =
    `claude mcp add --transport http replex ${MCP_ENDPOINT} \\\n` +
    `  --header "Authorization: Bearer ${token}"`;

  const stdioConfig = JSON.stringify(
    {
      mcpServers: {
        "replex-engine": {
          command: "node",
          args: ["<path to>/Email-syncing-backend/mcp/stdio.js"],
          env: {
            DB_URL: "<mongodb connection string>",
            REPLEX_MCP_TOKEN: token,
          },
        },
      },
    },
    null,
    2
  );

  return (
    /*
     * No onClick on the backdrop: a misplaced click here costs the user
     * the only copy of the token.
     */
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl my-8">
        <div className="p-5 border-b border-slate-200">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FiKey className="text-amber-500" />
            Token issued — copy it now
          </h2>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            This is the only time it can be shown. The server keeps just a
            hash, so there is no way to look it up again — if you lose it,
            revoke it and issue another.
          </p>
        </div>

        <div className="p-5 space-y-5">
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 flex gap-2.5">
            <FiAlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={14} />
            <p className="text-[11px] text-amber-900 leading-relaxed">
              Anyone holding this token can read this account through the
              connector
              {issued.tokenRecord?.scope === "read_write"
                ? " and switch scenarios on and off"
                : ""}
              . Store it the way you would a password, and revoke it here the
              moment a machine holding it is lost.
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                {issued.tokenRecord?.label || "Access token"}
              </p>
              <button
                type="button"
                onClick={() => copyText(token, "Token")}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 text-white text-[10px] font-semibold hover:bg-slate-800 transition"
              >
                <FiCopy size={11} />
                Copy token
              </button>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 font-mono text-[11px] text-slate-900 break-all select-all">
              {token}
            </div>
          </div>

          <div className="space-y-4 pt-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Connect a client
            </p>
            <CopyBlock title="Claude Code" value={claudeCodeCommand} />
            <p className="text-[11px] text-slate-500 leading-relaxed">
              For a Claude or ChatGPT <strong>custom connector</strong>, point
              it at{" "}
              <code className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">
                {MCP_ENDPOINT}
              </code>{" "}
              and add the header{" "}
              <code className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">
                Authorization: Bearer &lt;token&gt;
              </code>
              .
            </p>
            <CopyBlock title="Local process (stdio) clients" value={stdioConfig} />
          </div>
        </div>

        <div className="p-5 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition"
          >
            I&apos;ve stored it safely
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Revoke confirmation ───────────────────────────────────────────────────────

const RevokeModal = ({ token, busy, onCancel, onConfirm }) => (
  <div
    className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
    onClick={onCancel}
  >
    <div
      className="bg-white rounded-xl shadow-2xl w-full max-w-md"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="p-5">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <FiAlertTriangle className="text-red-500" />
          Revoke &ldquo;{token.label}&rdquo;?
        </h2>
        <p className="text-xs text-slate-500 mt-2 leading-relaxed">
          Any client still using this token stops working immediately, on both
          transports. This cannot be undone — a replacement has to be issued
          and pasted into the client again.
        </p>
      </div>
      <div className="p-5 pt-0 flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition disabled:opacity-50"
        >
          Keep it
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={busy}
          className="px-4 py-2 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition disabled:opacity-50"
        >
          {busy ? "Revoking…" : "Revoke token"}
        </button>
      </div>
    </div>
  </div>
);

// ── Page ──────────────────────────────────────────────────────────────────────

const AdminMcpTokens = () => {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [revoking, setRevoking] = useState(false);

  const [label, setLabel] = useState("");
  const [scope, setScope] = useState("read");
  const [expiresInDays, setExpiresInDays] = useState("");

  const [issued, setIssued] = useState(null);
  const [pendingRevoke, setPendingRevoke] = useState(null);

  const loadTokens = useCallback(async () => {
    try {
      const res = await apiFetch(TOKENS_URL);
      const result = await res.json();

      if (!result.success) throw new Error(result.message);

      setTokens(Array.isArray(result.tokens) ? result.tokens : []);
    } catch (err) {
      console.error("Error loading MCP tokens:", err);
      toast.error(err.message || "Could not load MCP tokens.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTokens();
  }, [loadTokens]);

  /*
   * Order matters: window.open goes FIRST, while the click is still the
   * browser's idea of a user gesture. Awaiting the clipboard write before
   * opening loses that gesture in some browsers and the tab gets blocked
   * as a popup — the copy is the part that can safely happen after.
   */
  const connectToClaude = () => {
    const opened = window.open(CLAUDE_ADD_CONNECTOR_URL, "_blank", "noopener,noreferrer");

    copyText(MCP_ENDPOINT, "Connector URL");

    if (!opened) {
      toast.error("Your browser blocked the popup — allow popups, or open claude.ai and add the connector manually.");
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();

    const trimmed = label.trim();

    /*
     * The server defaults an empty label to "MCP client", but two entries
     * both called that are indistinguishable in the table — and telling
     * them apart is the only reason the field exists.
     */
    if (!trimmed) {
      toast.error("Give the token a label, so you can tell it apart later.");
      return;
    }

    setCreating(true);

    try {
      const res = await apiFetch(TOKENS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: trimmed,
          scope,
          ...(expiresInDays ? { expiresInDays: Number(expiresInDays) } : {}),
        }),
      });

      const result = await res.json();

      if (!result.success || !result.token) {
        throw new Error(result.message || "Could not create the token.");
      }

      setIssued({ token: result.token, tokenRecord: result.tokenRecord });
      setLabel("");
      setScope("read");
      setExpiresInDays("");
      loadTokens();
    } catch (err) {
      console.error("Error creating MCP token:", err);
      toast.error(err.message || "Could not create the token.");
    } finally {
      setCreating(false);
    }
  };

  const handleRevoke = async () => {
    if (!pendingRevoke) return;

    setRevoking(true);

    try {
      const res = await apiFetch(`${TOKENS_URL}/${pendingRevoke.id}`, {
        method: "DELETE",
      });

      const result = await res.json();

      if (!result.success) throw new Error(result.message);

      toast.success(result.message || "Token revoked.");
      setPendingRevoke(null);
      loadTokens();
    } catch (err) {
      console.error("Error revoking MCP token:", err);
      toast.error(err.message || "Could not revoke the token.");
    } finally {
      setRevoking(false);
    }
  };

  const activeCount = tokens.filter((t) => statusOf(t).label === "Active").length;

  if (loading) {
    return (
      <PlatformAdminLayout pageTitle="MCP Connector">
        <div className="flex items-center justify-center py-24 text-slate-500 font-medium">
          <div className="animate-pulse flex items-center gap-2">
            <FiKey className="w-5 h-5 text-slate-700" />
            <span className="text-sm">Loading MCP tokens...</span>
          </div>
        </div>
      </PlatformAdminLayout>
    );
  }

  return (
    <PlatformAdminLayout pageTitle="MCP Connector">
      <div className="max-w-4xl space-y-6">
        {/* Heading */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <FiKey className="text-slate-700" />
              MCP Connector
            </h1>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed max-w-2xl">
              Credentials that let an AI client — Claude, ChatGPT, Cursor —
              read this account through the Model Context Protocol. Each token
              is shown once, stored only as a hash, and can be revoked on its
              own without disturbing the others.
            </p>
          </div>
          <button
            type="button"
            onClick={loadTokens}
            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition"
          >
            <FiRefreshCw size={12} />
            Refresh
          </button>
        </div>

        {/* Endpoint + access note */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                Endpoint
              </p>
              <div className="flex items-center gap-2">
                <code className="text-[11px] font-mono text-slate-800 bg-slate-50 border border-slate-200 rounded px-2 py-1 truncate">
                  {MCP_ENDPOINT}
                </code>
                <button
                  type="button"
                  onClick={() => copyText(MCP_ENDPOINT, "Endpoint")}
                  className="text-slate-400 hover:text-slate-900 transition shrink-0"
                  title="Copy endpoint"
                >
                  <FiCopy size={12} />
                </button>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                Active tokens
              </p>
              <p className="text-sm font-bold text-slate-900">{activeCount}</p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex gap-2.5">
            <FiShield className="text-slate-400 shrink-0 mt-0.5" size={13} />
            <p className="text-[11px] text-slate-500 leading-relaxed">
              The connector is currently limited to the master admin account,
              and that is checked on every call rather than only when a token
              is issued — so removing admin from an account disables its
              existing tokens at once.
            </p>
          </div>
        </div>

        {/* Connect to Claude */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900">Connect Claude</h2>
          <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
            Claude&apos;s connector setup asks only for a URL — it then walks
            the OAuth flow itself and brings you back here to approve. You do
            not need to issue a token by hand for this.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={connectToClaude}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition"
            >
              <FiExternalLink size={13} />
              Connect to Claude
            </button>
            <button
              type="button"
              onClick={() => copyText(MCP_ENDPOINT, "Connector URL")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition"
            >
              <FiCopy size={13} />
              Copy URL only
            </button>
          </div>

          <ol className="mt-4 space-y-2.5">
            {[
              <>
                Press <strong>Connect to Claude</strong>. The URL is copied to
                your clipboard and Claude opens with the{" "}
                <strong>Add custom connector</strong> dialog already showing.
              </>,
              <>
                Paste into <strong>Remote MCP server URL</strong> and press{" "}
                <strong>Add</strong>. Leave the OAuth client ID and secret
                blank — this server registers Claude on its own.
              </>,
              <>
                Claude sends you to a Replex Engine approval page. Choose read
                or read &amp; write and press <strong>Approve</strong>.
              </>,
              <>
                Claude returns to its own settings with the connector live. It
                appears in the table below, and revoking it there disconnects
                Claude at once.
              </>,
            ].map((step, i) => (
              <li key={i} className="flex gap-2.5">
                <span className="shrink-0 h-4 w-4 rounded-full bg-slate-900 text-white text-[9px] font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <span className="text-[11px] text-slate-600 leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>

          <p className="text-[11px] text-slate-400 mt-4 pt-3 border-t border-slate-100 leading-relaxed">
            Claude Code can skip all of this — it accepts a token directly:{" "}
            <code className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">
              claude mcp add --transport http replex {MCP_ENDPOINT} --header
              &quot;Authorization: Bearer …&quot;
            </code>
          </p>
        </div>

        {/* Issue a token */}
        <form
          onSubmit={handleCreate}
          className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4"
        >
          <h2 className="text-sm font-bold text-slate-900">Issue a token</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="mcp-token-label"
                className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5"
              >
                Label
              </label>
              <input
                id="mcp-token-label"
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                maxLength={60}
                placeholder="Claude Desktop — work laptop"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Which client holds it. Name the machine too — it is what you
                will look for when revoking.
              </p>
            </div>

            <div>
              <label
                htmlFor="mcp-token-expiry"
                className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5"
              >
                Expiry
              </label>
              <select
                id="mcp-token-expiry"
                value={expiresInDays}
                onChange={(e) => setExpiresInDays(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition"
              >
                {EXPIRY_CHOICES.map((choice) => (
                  <option key={choice.value} value={choice.value}>
                    {choice.label}
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-slate-400 mt-1">
                An expired token stops working on its own — useful for a
                machine you only need connected for a while.
              </p>
            </div>
          </div>

          <div>
            <p className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
              Permissions
            </p>
            <div className="space-y-2">
              {SCOPE_CHOICES.map((choice) => (
                <label
                  key={choice.value}
                  className={`flex gap-3 p-3 rounded-lg border cursor-pointer transition ${
                    scope === choice.value
                      ? "border-slate-900 bg-slate-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="mcp-scope"
                    value={choice.value}
                    checked={scope === choice.value}
                    onChange={(e) => setScope(e.target.value)}
                    className="mt-0.5 accent-slate-900"
                  />
                  <span className="min-w-0">
                    <span className="block text-xs font-semibold text-slate-900">
                      {choice.label}
                    </span>
                    <span className="block text-[11px] text-slate-500 leading-relaxed mt-0.5">
                      {choice.hint}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={creating}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition disabled:opacity-50"
            >
              <FiPlus size={13} />
              {creating ? "Issuing…" : "Issue token"}
            </button>
          </div>
        </form>

        {/* Existing tokens */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 pb-3">
            <h2 className="text-sm font-bold text-slate-900">Tokens</h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Revoked tokens are kept so the history stays readable.
            </p>
          </div>

          {tokens.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <FiKey className="mx-auto text-slate-300" size={22} />
              <p className="text-xs text-slate-500 mt-2">
                No tokens yet. Issue one above to connect a client.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-y border-slate-100 bg-slate-50/60">
                    {["Label", "Token", "Permissions", "Status", "Created", "Last used", ""].map(
                      (heading) => (
                        <th
                          key={heading}
                          className="px-4 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap"
                        >
                          {heading}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {tokens.map((token) => {
                    const status = statusOf(token);
                    const isActive = status.label === "Active";

                    return (
                      <tr
                        key={token.id}
                        className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition"
                      >
                        <td className="px-4 py-3">
                          <span
                            className={`text-xs font-semibold ${
                              isActive ? "text-slate-900" : "text-slate-400"
                            }`}
                          >
                            {token.label}
                          </span>
                          {token.expiresAt && (
                            <span className="block text-[10px] text-slate-400 mt-0.5">
                              Expires {formatDate(token.expiresAt)}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <code className="text-[10px] font-mono text-slate-500 whitespace-nowrap">
                            rxe_mcp_…{token.hint}
                          </code>
                        </td>
                        <td className="px-4 py-3">
                          <ScopeBadge scope={token.scope} />
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${status.className}`}
                          >
                            {status.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[11px] text-slate-500 whitespace-nowrap">
                          {formatDate(token.createdAt)}
                        </td>
                        <td className="px-4 py-3 text-[11px] text-slate-500 whitespace-nowrap">
                          {formatDateTime(token.lastUsedAt)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {isActive ? (
                            <button
                              type="button"
                              onClick={() => setPendingRevoke(token)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-semibold text-slate-500 hover:text-red-600 hover:bg-red-50 transition"
                            >
                              <FiTrash2 size={12} />
                              Revoke
                            </button>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium text-slate-300">
                              <FiSlash size={12} />
                              Inactive
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {issued && (
        <IssuedTokenModal issued={issued} onClose={() => setIssued(null)} />
      )}

      {pendingRevoke && (
        <RevokeModal
          token={pendingRevoke}
          busy={revoking}
          onCancel={() => (revoking ? null : setPendingRevoke(null))}
          onConfirm={handleRevoke}
        />
      )}
    </PlatformAdminLayout>
  );
};

export default AdminMcpTokens;

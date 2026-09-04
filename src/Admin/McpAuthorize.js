import { apiFetch, getToken } from "../utils/apiClient";
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  FiKey,
  FiShield,
  FiAlertTriangle,
  FiCheck,
  FiX,
  FiExternalLink,
} from "react-icons/fi";
import toast from "react-hot-toast";

/*
|--------------------------------------------------------------------------
| MCP connector consent screen
|--------------------------------------------------------------------------
|
| Where Claude sends the browser during "add a custom connector", and the
| only place in the whole OAuth flow that actually grants anything. The
| backend's /authorize endpoint parks the request and redirects here; a
| code is minted only when the master admin presses Approve.
|
| NOT WRAPPED IN ProtectedRoute, on purpose.
|
| That guard bounces an unauthenticated visitor to /login with no memory of
| where they were going — which would silently drop the pending
| authorization and leave Claude waiting on a callback that never comes.
| The page handles the signed-out case itself: it stores the return path
| and Login sends the user back here afterwards, so the flow survives
| having to sign in halfway through.
|
| It also re-checks admin locally. The server enforces it too — approval
| runs behind adminMiddleware — but a non-admin should be told before
| reading a page whose only button they cannot press.
*/

export const MCP_RETURN_KEY = "mcpOAuthReturn";

const Shell = ({ children }) => (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
    <div className="w-full max-w-md">
      <div className="flex items-center gap-2 justify-center mb-4">
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
          Replex Engine
        </span>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">{children}</div>
    </div>
  </div>
);

const McpAuthorize = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const requestId = params.get("request") || "";

  const [state, setState] = useState("loading");
  const [request, setRequest] = useState(null);
  const [error, setError] = useState("");
  const [scope, setScope] = useState("read");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!requestId) {
      setError("This link is missing its authorization request. Start again from your MCP client.");
      setState("error");
      return;
    }

    if (!getToken()) {
      setState("signed-out");
      return;
    }

    try {
      const res = await apiFetch(`/mcp/oauth/request/${encodeURIComponent(requestId)}`);
      const result = await res.json();

      if (!result.success) {
        setError(result.message || "This authorization request is no longer valid.");
        setState("error");
        return;
      }

      setRequest(result.request);
      setScope(result.request.scope === "read_write" ? "read_write" : "read");
      setState("ready");
    } catch (err) {
      console.error("Error loading authorization request:", err);
      setError("Could not reach the server to check this request.");
      setState("error");
    }
  }, [requestId]);

  useEffect(() => {
    load();
  }, [load]);

  /*
   * Both answers end the same way: the server hands back a URL on the
   * client's own domain, and we hand the browser over. window.location
   * rather than navigate() — this is a deliberate exit from the app.
   */
  const respond = async (action) => {
    setBusy(true);

    try {
      const res = await apiFetch(`/mcp/oauth/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ request: requestId, scope }),
      });

      const result = await res.json();

      if (!result.success || !result.redirectTo) {
        throw new Error(result.message || "The request could not be completed.");
      }

      window.location.href = result.redirectTo;
    } catch (err) {
      console.error(`Error on ${action}:`, err);
      toast.error(err.message || "Something went wrong.");
      setBusy(false);
    }
  };

  const goSignIn = () => {
    try {
      sessionStorage.setItem(MCP_RETURN_KEY, `/admin/mcp-connector/authorize?request=${encodeURIComponent(requestId)}`);
    } catch {
      /* private mode — the user can still navigate back manually */
    }
    navigate("/login");
  };

  if (state === "loading") {
    return (
      <Shell>
        <div className="p-8 text-center">
          <div className="animate-pulse text-xs text-slate-500">Checking the request…</div>
        </div>
      </Shell>
    );
  }

  if (state === "signed-out") {
    return (
      <Shell>
        <div className="p-6 text-center">
          <FiShield className="mx-auto text-slate-300" size={26} />
          <h1 className="text-base font-bold text-slate-900 mt-3">Sign in to continue</h1>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            An application is asking to connect to your Replex Engine account.
            Sign in as the master admin to review it — you&apos;ll come straight
            back here.
          </p>
          <button
            type="button"
            onClick={goSignIn}
            className="mt-5 w-full px-4 py-2.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition"
          >
            Sign in
          </button>
        </div>
      </Shell>
    );
  }

  if (state === "error") {
    return (
      <Shell>
        <div className="p-6 text-center">
          <FiAlertTriangle className="mx-auto text-amber-500" size={26} />
          <h1 className="text-base font-bold text-slate-900 mt-3">Request unavailable</h1>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">{error}</p>
          <p className="text-[11px] text-slate-400 mt-3 leading-relaxed">
            Authorization requests expire after 15 minutes. Removing and
            re-adding the connector will start a fresh one.
          </p>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="p-6">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0">
            <FiKey size={16} />
          </div>
          <div className="min-w-0">
            <h1 className="text-base font-bold text-slate-900 leading-tight">
              {request.clientName}
            </h1>
            <p className="text-[11px] text-slate-400 flex items-center gap-1">
              <FiExternalLink size={9} />
              {request.redirectHost}
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-600 mt-4 leading-relaxed">
          This application wants to connect to your Replex Engine account
          through the MCP connector. Approve only if you started this yourself.
        </p>

        <div className="mt-5">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
            What it may do
          </p>

          <div className="space-y-2">
            <label
              className={`flex gap-2.5 p-3 rounded-lg border cursor-pointer transition ${
                scope === "read" ? "border-slate-900 bg-slate-50" : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <input
                type="radio"
                name="scope"
                value="read"
                checked={scope === "read"}
                onChange={() => setScope("read")}
                className="mt-0.5 accent-slate-900"
              />
              <span>
                <span className="block text-xs font-semibold text-slate-900">Read only</span>
                <span className="block text-[11px] text-slate-500 leading-relaxed mt-0.5">
                  See scenarios, leads, mailbox connections, templates and run
                  history. It cannot change anything.
                </span>
              </span>
            </label>

            <label
              className={`flex gap-2.5 p-3 rounded-lg border cursor-pointer transition ${
                scope === "read_write" ? "border-slate-900 bg-slate-50" : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <input
                type="radio"
                name="scope"
                value="read_write"
                checked={scope === "read_write"}
                onChange={() => setScope("read_write")}
                className="mt-0.5 accent-slate-900"
              />
              <span>
                <span className="block text-xs font-semibold text-slate-900">
                  Read and switch scenarios on or off
                </span>
                <span className="block text-[11px] text-slate-500 leading-relaxed mt-0.5">
                  Everything above, plus activating and pausing scenarios.
                </span>
              </span>
            </label>
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 flex gap-2.5">
          <FiShield className="text-slate-400 shrink-0 mt-0.5" size={13} />
          <p className="text-[11px] text-slate-500 leading-relaxed">
            You can withdraw this at any time from{" "}
            <strong className="text-slate-700">MCP Connector</strong> in the
            admin panel — revoking it there disconnects this application
            immediately.
          </p>
        </div>

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={() => respond("deny")}
            disabled={busy}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition disabled:opacity-50"
          >
            <FiX size={13} />
            Refuse
          </button>
          <button
            type="button"
            onClick={() => respond("approve")}
            disabled={busy}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition disabled:opacity-50"
          >
            <FiCheck size={13} />
            {busy ? "Connecting…" : "Approve"}
          </button>
        </div>
      </div>
    </Shell>
  );
};

export default McpAuthorize;

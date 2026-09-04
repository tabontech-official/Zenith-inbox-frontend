import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import { apiFetch } from "../utils/apiClient";
import {
  isConnectionUsable,
  connectionProblem,
  connectionLabel,
} from "../utils/connectionHealth";

/*
|--------------------------------------------------------------------------
| ConnectionHealthBanner
|--------------------------------------------------------------------------
|
| A mailbox whose OAuth grant has been revoked stops every scenario using
| it, and does so silently — the failure happens inside a background poll.
| The owner's next visit should not be the first they hear of it, and the
| page they land on is the dashboard.
|
| DELIBERATELY NOT DISMISSIBLE
|
| The condition is not informational, it is broken automation: replies are
| not going out for as long as it stands. A dismissed banner would let that
| state hide again, which is the failure mode this exists to end. It
| disappears when the connection is fixed, and only then.
*/
const ConnectionHealthBanner = () => {
  const [broken, setBroken] = useState([]);

  useEffect(() => {
    let cancelled = false;

    const loadConnections = async () => {
      const userId = localStorage.getItem("userid");
      if (!userId) return;

      try {
        const res = await apiFetch(`/auth/getConnection/${userId}`);
        const data = await res.json();
        const list = Array.isArray(data) ? data : data?.data || [];

        if (cancelled) return;

        setBroken(list.filter((c) => !isConnectionUsable(c)));
      } catch (err) {
        /*
         * A dashboard must still render when this lookup fails. Staying
         * quiet is the safe direction: a banner invented from a failed
         * request would be worse than none.
         */
        console.error("Could not check connection health:", err);
      }
    };

    loadConnections();

    /* Catch a reconnect made in another tab without a manual refresh. */
    const onFocus = () => loadConnections();
    window.addEventListener("focus", onFocus);

    return () => {
      cancelled = true;
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  if (broken.length === 0) return null;

  return (
    <div
      role="alert"
      className="rounded-xl border border-red-300 bg-red-50 p-4 shadow-xs"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle size={18} className="mt-0.5 shrink-0 text-red-600" />

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-red-900">
            {broken.length === 1
              ? "A connected mailbox needs attention"
              : `${broken.length} connected mailboxes need attention`}
          </p>

          <ul className="mt-1.5 space-y-1">
            {broken.map((conn) => (
              <li key={conn._id} className="text-sm text-red-800">
                <span className="font-medium">{connectionLabel(conn)}</span>{" "}
                cannot be used — {connectionProblem(conn)}.
              </li>
            ))}
          </ul>

          <p className="mt-2 text-xs text-red-700/80">
            Scenarios using {broken.length === 1 ? "it" : "them"} will not send
            replies and cannot be switched on until this is fixed. Incoming
            leads are still being captured.
          </p>

          <Link
            to="/connection"
            className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-red-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-red-700 transition"
          >
            Reconnect now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ConnectionHealthBanner;

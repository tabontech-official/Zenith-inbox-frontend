import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import {
  appTypeForConnection,
  connectionsForAppType,
  providerLabel,
} from "../utils/connectionProviders";

const EmailModal = ({
  node,
  connections = [],
  mailhooks = [],
  onSave,
  onClose,
  openGmailModal,
  openOutlookModal,
  openMicrosoftModal,
  openMailhookModal,
}) => {
  const config = node?.data?.config || {};

  const [appType, setAppType] = useState(
    config.appType || config.emailType || "Gmail"
  );

  const [connectionId, setConnectionId] = useState(config.connectionId ?? "");
  const [mailhookId, setMailhookId] = useState(config.mailhookId ?? "");
  const [subject, setSubject] = useState(config.subject || "");

  /*
   * A mailhook trigger has no Connection behind it — leads arrive by
   * forwarding to the mailhook address — so it selects from the user's
   * verified mailhooks instead, and saves under its own field.
   */
  const isMailhook = appType === "Mailhook";
  const verifiedMailhooks = mailhooks.filter((m) => m.connectionVerified);

  useEffect(() => {
    if (config.connectionId && connections.length > 0) {
      const exists = connections.some((c) => c._id === config.connectionId);
      if (exists) {
        setConnectionId(config.connectionId);
      }
    }
  }, [connections, config.connectionId]);

  useEffect(() => {
    if (config.appType === "Mailhook") return;
    if (!config.connectionId || connections.length === 0) return;

    const conn = connections.find((c) => c._id === config.connectionId);
    if (!conn) return;

    /*
     * Derived from the stored provider. The old two-way branch put every
     * non-Gmail connection under "Other Email", so reopening a Microsoft
     * module showed the wrong app type and an empty connection list.
     */
    const derived = appTypeForConnection(conn);
    if (derived) setAppType(derived);
  }, [connections, config.connectionId, config.appType]);

  /*
   * Was `return true` for anything that was not Gmail or Other Email, so
   * picking Microsoft listed every connection the user had, Gmail included.
   */
  const filteredConnections = connectionsForAppType(connections, appType);

  return (
    <div className="fixed inset-0  flex items-center justify-center z-50 p-4">
      <div className="bg-white w-[520px] rounded-[8px]   border overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between bg-[#111110] text-white px-6 py-4">
          <div>
            <h2 className="text-base font-bold text-white">Incoming Leads</h2>
            <p className="text-xs text-slate-300 mt-0.5 font-normal">
              Configure incoming email trigger & connection
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition p-1 rounded-full cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body - Only 3 Fields */}
        <div className="p-6 space-y-5">
          {/* Field 1: Select Application */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Select Application <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <select
                value={appType}
                onChange={(e) => setAppType(e.target.value)}
                className="flex-1 border border-slate-300 rounded-[8px] px-3.5 py-2 text-xs font-medium text-slate-900 bg-white outline-none focus:border-slate-800 transition"
              >
                <option value="Gmail">Gmail / Google Workspace</option>
                <option value="Microsoft">Outlook / Live / Microsoft 365</option>
                <option value="Email">Other Email</option>
                <option value="Mailhook">Mailhook (Forwarded Email)</option>
              </select>

              <button
                type="button"
                onClick={() =>
                  appType === "Gmail"
                    ? openGmailModal()
                    : appType === "Microsoft"
                    ? openMicrosoftModal?.()
                    : appType === "Mailhook"
                    ? openMailhookModal?.()
                    : openOutlookModal()
                }
                className="px-5 py-2 bg-[#111110] hover:bg-black text-white text-xs font-bold rounded-[8px] transition cursor-pointer"
              >
                Add
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5 font-normal">
              Choose the application type and click <b>Add</b> to connect a new account.
            </p>
          </div>

          {/* Field 2: Connection */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Connection <span className="text-red-500">*</span>
            </label>
            {isMailhook ? (
              <>
                <select
                  value={mailhookId}
                  onChange={(e) => setMailhookId(e.target.value)}
                  className="w-full border border-slate-300 rounded-[8px] px-3.5 py-2 text-xs font-medium text-slate-900 bg-white outline-none focus:border-slate-800 transition"
                >
                  <option value="">Select Mailhook</option>
                  {verifiedMailhooks.map((m) => (
                    <option key={m._id} value={m._id}>
                      MAILHOOK - {m.forwardingEmail || m.mailhook}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1.5 font-normal">
                  {verifiedMailhooks.length === 0
                    ? "No verified mailhook yet — click Add to set one up and confirm forwarding."
                    : "Leads forwarded to this mailhook address will trigger the scenario."}
                </p>
              </>
            ) : (
              <select
                value={connectionId}
                onChange={(e) => setConnectionId(e.target.value)}
                className="w-full border border-slate-300 rounded-[8px] px-3.5 py-2 text-xs font-medium text-slate-900 bg-white outline-none focus:border-slate-800 transition"
              >
                <option value="">Select Connection</option>
                {filteredConnections.map((c) => (
                  <option key={c._id} value={c._id}>
                    {providerLabel(c.provider)} - {c.email}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Field 3: Subject Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Subject Filter
            </label>
            <input
              type="text"
              className="w-full border border-slate-200 bg-white rounded-[8px] px-3.5 py-2 text-xs font-medium text-slate-900 outline-none focus:border-slate-800 transition"
              value={subject}
              placeholder="e.g. Product Inquiry / New Lead Inquiry"
              onChange={(e) => setSubject(e.target.value)}
            />
            <p className="text-[11px] text-amber-700 mt-1.5 font-medium flex items-center gap-1">
              {/* <span>💡</span> Do not add "Re:", "Fw:", or any prefix at the start of the subject. */}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 border border-slate-300 rounded-[8px] text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              const selectedConn = connections.find((c) => c._id === connectionId);
              const selectedHook = mailhooks.find((m) => m._id === mailhookId);

              onSave({
                appType,
                /* Only one of these is meaningful, and the other is cleared
                   so switching trigger type never leaves a stale id behind. */
                connectionId: isMailhook ? "" : connectionId,
                mailhookId: isMailhook ? mailhookId : "",
                connectionEmail: isMailhook
                  ? selectedHook?.forwardingEmail || selectedHook?.mailhook || ""
                  : selectedConn?.email || "",
                subject,
                emailType: appType,
              });
            }}
            className="px-5 py-2 bg-[#111110] hover:bg-black text-white text-xs font-bold rounded-[8px] transition cursor-pointer"
          >
            Save Module
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailModal;

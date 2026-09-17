import React, { useState, useEffect, useCallback } from "react";
import {
  FiX,
  FiMail,
  FiSend,
  FiRefreshCw,
  FiClock,
  FiAlertCircle,
  FiCheckCircle,
  FiCheck,
  FiInbox,
  FiUser,
} from "react-icons/fi";
import toast from "react-hot-toast";
import { apiFetch, API_BASE_URL } from "../utils/apiClient";
import useModalDismiss from "../hooks/useModalDismiss";

const PendingLeadsModal = ({ isOpen, onClose, onRepliesProcessed }) => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [batchLoading, setBatchLoading] = useState(false);

  const userId = typeof window !== "undefined" ? localStorage.getItem("userid") : null;
  const modalRef = useModalDismiss(isOpen, onClose);

  const fetchPendingLeads = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await apiFetch(`${API_BASE_URL}/mailhook/pending-leads/${userId}`);
      if (res && res.success) {
        setLeads(res.data || []);
      } else {
        setLeads([]);
      }
    } catch (err) {
      console.error("Failed to fetch pending leads:", err);
      toast.error(err.message || "Could not load pending leads");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (isOpen) {
      setSelectedIds(new Set());
      fetchPendingLeads();
    }
  }, [isOpen, fetchPendingLeads]);

  const handleProcessSingle = async (emailId) => {
    setProcessingId(emailId);
    try {
      const res = await apiFetch(`${API_BASE_URL}/mailhook/lead-process-scenario/${emailId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ forceRun: true }),
      });

      if (res && res.success) {
        toast.success(res.message || "Auto-reply sent successfully!");
        setLeads((prev) => prev.filter((item) => item._id !== emailId));
        setSelectedIds((prev) => {
          const next = new Set(prev);
          next.delete(emailId);
          return next;
        });
        if (onRepliesProcessed) {
          onRepliesProcessed();
        }
      } else {
        toast.error(res?.message || "Failed to send auto-reply");
      }
    } catch (err) {
      console.error("Error processing pending lead:", err);
      toast.error(err.message || "Could not process lead");
    } finally {
      setProcessingId(null);
    }
  };

  const handleBatchProcess = async () => {
    const idsToProcess = selectedIds.size > 0 ? Array.from(selectedIds) : leads.map((l) => l._id);
    if (idsToProcess.length === 0) return;

    setBatchLoading(true);
    try {
      const res = await apiFetch(`${API_BASE_URL}/mailhook/batch-process-pending`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailIds: idsToProcess, userId }),
      });

      if (res && res.success) {
        toast.success(`Processed ${res.sent || idsToProcess.length} email(s) successfully!`);
        await fetchPendingLeads();
        setSelectedIds(new Set());
        if (onRepliesProcessed) {
          onRepliesProcessed();
        }
      } else {
        toast.error(res?.message || "Failed to process batch");
      }
    } catch (err) {
      console.error("Batch processing error:", err);
      toast.error(err.message || "Batch process failed");
    } finally {
      setBatchLoading(false);
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === leads.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(leads.map((l) => l._id)));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div
        ref={modalRef}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 dark:bg-amber-400/10 dark:text-amber-400 flex items-center justify-center">
              <FiClock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Pending & Unprocessed Leads
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300">
                  {leads.length} Waiting
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Inbound emails held back (e.g. while scenario was paused or offline). Trigger replies on demand.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchPendingLeads}
              disabled={loading}
              title="Refresh list"
              className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <FiRefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar / Actions */}
        {leads.length > 0 && (
          <div className="flex items-center justify-between px-6 py-2.5 bg-slate-100/60 dark:bg-slate-800/20 border-b border-slate-200 dark:border-slate-800 text-xs">
            <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-300 font-medium">
              <input
                type="checkbox"
                checked={leads.length > 0 && selectedIds.size === leads.length}
                onChange={toggleSelectAll}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
              />
              Select All ({selectedIds.size > 0 ? `${selectedIds.size}/` : ""}{leads.length})
            </label>

            <button
              onClick={handleBatchProcess}
              disabled={batchLoading || leads.length === 0}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs shadow-sm transition disabled:opacity-50"
            >
              <FiSend className={`w-3.5 h-3.5 ${batchLoading ? "animate-pulse" : ""}`} />
              {batchLoading
                ? "Sending Replies..."
                : selectedIds.size > 0
                ? `Send Auto-Replies to Selected (${selectedIds.size})`
                : `Send Auto-Replies to All (${leads.length})`}
            </button>
          </div>
        )}

        {/* List Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {loading && leads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <FiRefreshCw className="w-8 h-8 animate-spin text-indigo-500 mb-3" />
              <p className="text-sm">Fetching pending emails...</p>
            </div>
          ) : leads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
                <FiCheckCircle className="w-7 h-7" />
              </div>
              <h4 className="text-base font-semibold text-slate-800 dark:text-slate-200">
                All Caught Up!
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1">
                There are no pending or unprocessed leads waiting for automated replies.
              </p>
            </div>
          ) : (
            leads.map((lead) => {
              const isSelected = selectedIds.has(lead._id);
              const isProcessing = processingId === lead._id;

              return (
                <div
                  key={lead._id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border transition ${
                    isSelected
                      ? "bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-800"
                      : "bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(lead._id)}
                      className="mt-1 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                    />

                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">
                          {lead.name || lead.from || "Unknown Lead"}
                        </span>
                        {lead.from && (
                          <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            &lt;{lead.from}&gt;
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50">
                          <FiAlertCircle className="w-3 h-3" />
                          {lead.reason}
                        </span>
                      </div>

                      <div className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">
                        {lead.subject}
                      </div>

                      {lead.preview && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                          {lead.preview}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-[11px] text-slate-400 dark:text-slate-500 pt-0.5">
                        <span>
                          Received: {lead.date ? new Date(lead.date).toLocaleString() : "Recently"}
                        </span>
                        {lead.scenarioName && (
                          <span>Scenario: <b className="text-slate-600 dark:text-slate-300">{lead.scenarioName}</b></span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      onClick={() => handleProcessSingle(lead._id)}
                      disabled={isProcessing || batchLoading}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs shadow-sm transition disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <>
                          <FiRefreshCw className="w-3.5 h-3.5 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <FiSend className="w-3.5 h-3.5" />
                          Send Auto Reply
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-xs text-slate-500 dark:text-slate-400">
          <div>
            Showing {leads.length} pending lead{leads.length === 1 ? "" : "s"}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PendingLeadsModal;

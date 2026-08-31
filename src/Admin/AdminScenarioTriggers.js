import { apiFetch } from "../utils/apiClient";
import React, { useEffect, useState } from "react";
import {
  FiFilter,
  FiSave,
  FiPlus,
  FiTrash2,
  FiAlertTriangle,
  FiInfo,
  FiCornerUpLeft,
  FiInbox,
  FiGitBranch,
} from "react-icons/fi";
import PlatformAdminLayout from "./PlatformAdminLayout";
import toast from "react-hot-toast";

const API_BASE_URL =
  "https://email-syncing-backend.vercel.app/admin/scenario-triggers";

/*
 * Platform-wide trigger subjects for the built-in scenarios.
 *
 * Every account is created with a Shopify scenario, and the subject that
 * identifies a Partner Directory lead used to be hardcoded in the backend.
 * This page owns that value: it decides which incoming mail counts as a
 * lead, which is what the automation replies to and what the Lead Inbox
 * shows.
 */
const MATCH_MODES = [
  {
    value: "contains",
    label: "Subject contains",
    hint: "Matches anywhere in the subject — survives gateway prefixes.",
  },
  {
    value: "startsWith",
    label: "Subject starts with",
    hint: "Stricter. Only matches subjects that open with this text.",
  },
];

/*
 * Comma-separated in the UI, arrays on the wire. These lists are short and
 * flat (prefixes, domains, subjects), so a tag editor would be more
 * chrome than the content needs.
 */
const toList = (value) =>
  String(value || "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);

const toText = (list) => (Array.isArray(list) ? list.join(", ") : "");

/*
 * The service list is newline-separated rather than comma-separated: it is
 * long, its order is meaningful, and entries such as "Store build or
 * redesign" read badly in a single comma-run.
 */
const toLines = (value) =>
  String(value || "")
    .split("\n")
    .map((v) => v.trim())
    .filter(Boolean);

const AdminScenarioTriggers = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [triggers, setTriggers] = useState([]);
  const [reply, setReply] = useState(null);
  const [inbox, setInbox] = useState(null);
  const [services, setServices] = useState(null);
  const [updatedAt, setUpdatedAt] = useState(null);

  useEffect(() => {
    const fetchConfig = async () => {
      setLoading(true);
      try {
        const res = await apiFetch(API_BASE_URL);
        const result = await res.json();

        if (result.success && result.config) {
          setTriggers(result.config.triggers || []);

          const r = result.config.reply || {};
          setReply({
            ...r,
            subjectPrefixesText: toText(r.subjectPrefixes),
          });

          const i = result.config.inbox || {};
          setInbox({
            ...i,
            excludedSubjectsText: toText(i.excludedSubjects),
            excludedSendersText: toText(i.excludedSenders),
            internalDomainsText: toText(i.internalDomains),
          });
          const sv = result.config.services || {};
          setServices({
            fallback: sv.fallback || "General",
            listText: (sv.list || []).join("\n"),
          });

          setUpdatedAt(result.config.updatedAt || null);
        } else {
          throw new Error(result.message || "Could not load triggers");
        }
      } catch (err) {
        console.error("Error loading scenario triggers:", err);
        toast.error("Failed to load scenario triggers.");
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  const updateTrigger = (index, patch) => {
    setTriggers((prev) =>
      prev.map((t, i) => (i === index ? { ...t, ...patch } : t)),
    );
  };

  const addTrigger = () => {
    setTriggers((prev) => [
      ...prev,
      {
        scenarioType: "",
        label: "",
        subjectFilter: "",
        matchMode: "contains",
        enabled: true,
        isCustomised: false,
      },
    ]);
  };

  const removeTrigger = (index) => {
    setTriggers((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    /*
     * Mirrors the server's rules so the admin gets the message next to the
     * field rather than as a failed request.
     */
    const seen = new Set();

    for (const trigger of triggers) {
      const type = (trigger.scenarioType || "").trim().toLowerCase();

      if (!type) {
        toast.error("Every trigger needs a scenario type.");
        return;
      }

      if (seen.has(type)) {
        toast.error(`Duplicate trigger for scenario type "${type}".`);
        return;
      }

      seen.add(type);

      if (trigger.enabled !== false && !(trigger.subjectFilter || "").trim()) {
        toast.error(
          `"${type}" is enabled but has no subject. Add one, or switch it off.`,
        );
        return;
      }
    }

    /*
     * Mirrors the two server-side refusals. Both lists are load-bearing
     * for threading: without prefixes nothing is recognised as a reply,
     * and without internal domains our own replies look like new leads.
     */
    if (reply && toList(reply.subjectPrefixesText).length === 0) {
      toast.error("Add at least one reply prefix — otherwise every reply starts a new thread.");
      return;
    }

    if (inbox && toList(inbox.internalDomainsText).length === 0) {
      toast.error("Add at least one internal domain — it identifies your own replies inside a thread.");
      return;
    }

    if (services) {
      const serviceList = toLines(services.listText);
      const fallback = (services.fallback || "").trim();

      if (serviceList.length === 0) {
        toast.error("Add at least one service — an empty list sends every lead to the fallback template.");
        return;
      }

      if (!fallback) {
        toast.error("A fallback service is required.");
        return;
      }

      /* Templates are keyed by service name, so the fallback needs one. */
      if (
        !serviceList.some((s2) => s2.toLowerCase() === fallback.toLowerCase())
      ) {
        toast.error(`The fallback "${fallback}" must also appear in the service list.`);
        return;
      }
    }

    setSaving(true);

    try {
      const res = await apiFetch(API_BASE_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          triggers: triggers.map((t) => ({
            scenarioType: (t.scenarioType || "").trim().toLowerCase(),
            label: (t.label || "").trim(),
            subjectFilter: (t.subjectFilter || "").trim(),
            matchMode: t.matchMode === "startsWith" ? "startsWith" : "contains",
            enabled: t.enabled !== false,
          })),
          ...(reply
            ? {
                reply: {
                  subjectPrefixes: toList(reply.subjectPrefixesText),
                  stripBracketTags: reply.stripBracketTags !== false,
                  requireReplyMarkerForSubjectMatch:
                    reply.requireReplyMarkerForSubjectMatch !== false,
                  duplicateWindowSeconds: Number(
                    reply.duplicateWindowSeconds ?? 10,
                  ),
                },
              }
            : {}),
          ...(inbox
            ? {
                inbox: {
                  excludedSubjects: toList(inbox.excludedSubjectsText),
                  excludedSenders: toList(inbox.excludedSendersText),
                  internalDomains: toList(inbox.internalDomainsText),
                },
              }
            : {}),
          ...(services
            ? {
                services: {
                  list: toLines(services.listText),
                  fallback: (services.fallback || "").trim(),
                },
              }
            : {}),
        }),
      });

      const result = await res.json();

      if (!result.success) throw new Error(result.message);

      toast.success(result.message || "Scenario triggers updated.");
      setUpdatedAt(result.config?.updatedAt || new Date().toISOString());
      setTriggers((prev) => prev.map((t) => ({ ...t, isCustomised: true })));
    } catch (err) {
      console.error("Error saving scenario triggers:", err);
      toast.error(err.message || "Failed to save scenario triggers.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PlatformAdminLayout>
        <div className="flex items-center justify-center py-24 text-slate-500 font-medium">
          <div className="animate-pulse flex items-center gap-2">
            <FiFilter className="w-5 h-5 text-slate-700" />
            <span className="text-sm">Loading scenario triggers...</span>
          </div>
        </div>
      </PlatformAdminLayout>
    );
  }

  return (
    <PlatformAdminLayout>
      <div className="max-w-4xl space-y-6">
        {/* Heading */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <FiFilter className="text-slate-700" />
              Scenario Triggers
            </h1>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed max-w-2xl">
              The subject that identifies an incoming lead for each built-in
              scenario. This decides what the automation replies to and what
              appears in every user's Lead Inbox.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className={`shrink-0 inline-flex items-center gap-2 rounded-[8px] px-5 py-2.5 text-xs font-bold text-white transition ${
              saving
                ? "bg-slate-400 cursor-wait"
                : "bg-[#111110] hover:bg-black cursor-pointer"
            }`}
          >
            <FiSave />
            {saving ? "Saving..." : "Save Triggers"}
          </button>
        </div>

        {/* How matching works */}
        <div className="rounded-[10px] border border-slate-200 bg-slate-50 p-4 flex gap-3">
          <FiInfo className="text-slate-500 shrink-0 mt-0.5" />
          <div className="text-[11px] text-slate-600 leading-relaxed space-y-1">
            <p>
              Matching ignores case and strips <strong>Re:</strong>,{" "}
              <strong>Fwd:</strong> and <strong>[tag]</strong> prefixes first,
              so replies and forwarded leads still qualify.
            </p>
            <p>
              A user who types their own subject filter on a scenario overrides
              this default. Changing a subject here also releases scenarios
              still pinned to the previous one, so they follow this setting
              again.
            </p>
          </div>
        </div>

        {/* Trigger list */}
        <div className="space-y-4">
          {triggers.length === 0 && (
            <div className="rounded-[10px] border border-dashed border-slate-300 bg-white p-8 text-center">
              <p className="text-xs font-semibold text-slate-700">
                No triggers configured
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                With no trigger for a scenario type, its scenarios match only on
                a subject filter their own owner set.
              </p>
            </div>
          )}

          {triggers.map((trigger, index) => (
            <div
              key={`${trigger.scenarioType}-${index}`}
              className="rounded-[12px] border border-slate-200 bg-white p-5 space-y-4 shadow-2xs"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="rounded-md bg-slate-900 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                    {trigger.scenarioType || "new"}
                  </span>
                  {!trigger.isCustomised && (
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                      Built-in default
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <label className="flex items-center gap-2 text-[11px] font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={trigger.enabled !== false}
                      onChange={(e) =>
                        updateTrigger(index, { enabled: e.target.checked })
                      }
                      className="h-4 w-4 rounded border-slate-300 cursor-pointer"
                    />
                    Enabled
                  </label>

                  <button
                    type="button"
                    onClick={() => removeTrigger(index)}
                    title="Remove this trigger"
                    className="rounded-[6px] border border-red-200 bg-red-50 p-1.5 text-red-600 hover:bg-red-100 transition cursor-pointer"
                  >
                    <FiTrash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                    Scenario type
                  </label>
                  <input
                    type="text"
                    value={trigger.scenarioType || ""}
                    onChange={(e) =>
                      updateTrigger(index, { scenarioType: e.target.value })
                    }
                    placeholder="shopify"
                    className="w-full rounded-[8px] border border-slate-300 px-3 py-2 text-xs font-medium text-slate-900 outline-none focus:border-slate-800 transition"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Must match the scenario's type exactly (e.g. shopify).
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                    Display name
                  </label>
                  <input
                    type="text"
                    value={trigger.label || ""}
                    onChange={(e) =>
                      updateTrigger(index, { label: e.target.value })
                    }
                    placeholder="Shopify Partner Directory"
                    className="w-full rounded-[8px] border border-slate-300 px-3 py-2 text-xs font-medium text-slate-900 outline-none focus:border-slate-800 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                  Trigger subject
                </label>
                <input
                  type="text"
                  value={trigger.subjectFilter || ""}
                  onChange={(e) =>
                    updateTrigger(index, { subjectFilter: e.target.value })
                  }
                  placeholder="Shopify Partner Directory: New service inquiry from"
                  className="w-full rounded-[8px] border border-slate-300 px-3 py-2 font-mono text-xs text-slate-900 outline-none focus:border-slate-800 transition"
                />

                {trigger.enabled !== false &&
                  !(trigger.subjectFilter || "").trim() && (
                    <p className="mt-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-amber-700">
                      <FiAlertTriangle className="h-3.5 w-3.5" />
                      An enabled trigger needs a subject — an empty one would
                      match every email.
                    </p>
                  )}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                  Match mode
                </label>
                <div className="flex flex-wrap gap-2">
                  {MATCH_MODES.map((mode) => (
                    <label
                      key={mode.value}
                      className={`flex-1 min-w-[200px] cursor-pointer rounded-[8px] border p-3 transition ${
                        (trigger.matchMode || "contains") === mode.value
                          ? "border-slate-800 bg-slate-50"
                          : "border-slate-200 bg-white hover:border-slate-400"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`matchMode-${index}`}
                          checked={
                            (trigger.matchMode || "contains") === mode.value
                          }
                          onChange={() =>
                            updateTrigger(index, { matchMode: mode.value })
                          }
                          className="h-3.5 w-3.5 cursor-pointer"
                        />
                        <span className="text-[11px] font-bold text-slate-800">
                          {mode.label}
                        </span>
                      </div>
                      <p className="mt-1 text-[10px] text-slate-500 leading-relaxed">
                        {mode.hint}
                      </p>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Service routing — the router's second condition */}
        {services && (
          <div className="rounded-[12px] border border-slate-200 bg-white p-5 space-y-4 shadow-2xs">
            <div className="flex items-center gap-2">
              <FiGitBranch className="text-slate-700" />
              <h2 className="text-sm font-bold text-slate-900">
                Service Routing
              </h2>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed -mt-1">
              The router's second condition. The trigger subject decides
              whether a message is a lead; this decides which reply it gets —
              the matched service picks the template, so "Troubleshooting"
              routes to <span className="font-mono">Troubleshooting - Initial Email</span>.
            </p>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                Services, in priority order
              </label>
              <textarea
                rows={12}
                value={services.listText || ""}
                onChange={(e) =>
                  setServices({ ...services, listText: e.target.value })
                }
                placeholder={"General\nTroubleshooting\nSEO"}
                className="w-full rounded-[8px] border border-slate-300 px-3 py-2 font-mono text-xs text-slate-900 outline-none focus:border-slate-800 transition resize-y"
              />
              <p className="mt-1.5 flex items-start gap-1.5 text-[10px] text-amber-700 font-medium">
                <FiAlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />
                One per line. <strong>Order decides ties</strong> — the lead's
                subject and body are searched top to bottom and the first
                match wins, so a broad term above a specific one shadows it.
                "General" at the top means a lead saying "general question
                about SEO" routes to General, never SEO.
              </p>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                Fallback service
              </label>
              <input
                type="text"
                value={services.fallback || ""}
                onChange={(e) =>
                  setServices({ ...services, fallback: e.target.value })
                }
                placeholder="General"
                className="w-full max-w-xs rounded-[8px] border border-slate-300 px-3 py-2 font-mono text-xs text-slate-900 outline-none focus:border-slate-800 transition"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Used when a lead names no service. Must also appear in the
                list above — templates are looked up by service name.
              </p>
            </div>
          </div>
        )}

        {/* Reply rules */}
        {reply && (
          <div className="rounded-[12px] border border-slate-200 bg-white p-5 space-y-4 shadow-2xs">
            <div className="flex items-center gap-2">
              <FiCornerUpLeft className="text-slate-700" />
              <h2 className="text-sm font-bold text-slate-900">Reply Rules</h2>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed -mt-1">
              How an incoming message is recognised as a reply to an existing
              lead rather than a new one. Header matching (In-Reply-To,
              References, thread id) always runs first — these are the
              heuristics applied when headers are missing.
            </p>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                Reply subject prefixes
              </label>
              <input
                type="text"
                value={reply.subjectPrefixesText || ""}
                onChange={(e) =>
                  setReply({ ...reply, subjectPrefixesText: e.target.value })
                }
                placeholder="re, fwd, fw, aw, wg"
                className="w-full rounded-[8px] border border-slate-300 px-3 py-2 font-mono text-xs text-slate-900 outline-none focus:border-slate-800 transition"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Comma separated, no colon. Stripped before comparing subjects
                and used to spot a reply. Add localised prefixes here.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                  Duplicate window (seconds)
                </label>
                <input
                  type="number"
                  min="0"
                  max="600"
                  value={reply.duplicateWindowSeconds ?? 10}
                  onChange={(e) =>
                    setReply({
                      ...reply,
                      duplicateWindowSeconds: e.target.value,
                    })
                  }
                  className="w-full rounded-[8px] border border-slate-300 px-3 py-2 text-xs font-medium text-slate-900 outline-none focus:border-slate-800 transition"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Two messages from one sender with identical opening text
                  inside this window count as one delivery.
                </p>
              </div>

              <div className="space-y-2.5 pt-6">
                <label className="flex items-start gap-2 text-[11px] font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reply.stripBracketTags !== false}
                    onChange={(e) =>
                      setReply({ ...reply, stripBracketTags: e.target.checked })
                    }
                    className="h-4 w-4 mt-0.5 rounded border-slate-300 cursor-pointer"
                  />
                  <span>
                    Ignore bracketed tags
                    <span className="block text-[10px] font-normal text-slate-400">
                      Strips gateway tags like [External] before comparing.
                    </span>
                  </span>
                </label>

                <label className="flex items-start gap-2 text-[11px] font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reply.requireReplyMarkerForSubjectMatch !== false}
                    onChange={(e) =>
                      setReply({
                        ...reply,
                        requireReplyMarkerForSubjectMatch: e.target.checked,
                      })
                    }
                    className="h-4 w-4 mt-0.5 rounded border-slate-300 cursor-pointer"
                  />
                  <span>
                    Require a reply marker for subject matching
                    <span className="block text-[10px] font-normal text-slate-400">
                      Recommended. Off, a shared subject alone can attach a
                      message to the wrong conversation.
                    </span>
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Inbox rules */}
        {inbox && (
          <div className="rounded-[12px] border border-slate-200 bg-white p-5 space-y-4 shadow-2xs">
            <div className="flex items-center gap-2">
              <FiInbox className="text-slate-700" />
              <h2 className="text-sm font-bold text-slate-900">Inbox Rules</h2>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed -mt-1">
              Applied to every user's Lead Inbox on top of their scenario
              criteria.
            </p>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                Hidden subjects
              </label>
              <input
                type="text"
                value={inbox.excludedSubjectsText || ""}
                onChange={(e) =>
                  setInbox({ ...inbox, excludedSubjectsText: e.target.value })
                }
                placeholder="Welcome to Replex Engine"
                className="w-full rounded-[8px] border border-slate-300 px-3 py-2 font-mono text-xs text-slate-900 outline-none focus:border-slate-800 transition"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Comma separated. Threads whose subject starts with one of these
                never reach the Lead Inbox — the onboarding mail lives here.
              </p>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                Hidden senders
              </label>
              <input
                type="text"
                value={inbox.excludedSendersText || ""}
                onChange={(e) =>
                  setInbox({ ...inbox, excludedSendersText: e.target.value })
                }
                placeholder="noreply@example.com, billing@"
                className="w-full rounded-[8px] border border-slate-300 px-3 py-2 font-mono text-xs text-slate-900 outline-none focus:border-slate-800 transition"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Comma separated, matched anywhere in the sender address.
              </p>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                Internal domains
              </label>
              <input
                type="text"
                value={inbox.internalDomainsText || ""}
                onChange={(e) =>
                  setInbox({ ...inbox, internalDomainsText: e.target.value })
                }
                placeholder="replexengine.com, mail.replexengine.com"
                className="w-full rounded-[8px] border border-slate-300 px-3 py-2 font-mono text-xs text-slate-900 outline-none focus:border-slate-800 transition"
              />
              <p className="mt-1 flex items-start gap-1.5 text-[10px] text-amber-700 font-medium">
                <FiAlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />
                Your own sending domains. Mail from these is treated as your
                side of the conversation — an incomplete list makes your
                replies look like new leads and splits threads.
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-4 pt-1">
          <button
            type="button"
            onClick={addTrigger}
            className="inline-flex items-center gap-2 rounded-[8px] border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <FiPlus />
            Add trigger
          </button>

          {updatedAt && (
            <p className="text-[11px] text-slate-400 font-medium">
              Last updated {new Date(updatedAt).toLocaleString()}
            </p>
          )}
        </div>
      </div>
    </PlatformAdminLayout>
  );
};

export default AdminScenarioTriggers;

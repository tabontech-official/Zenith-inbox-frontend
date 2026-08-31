import { apiFetch } from "../utils/apiClient";
import React, { useEffect, useState } from "react";
import {
  FiMail,
  FiSave,
  FiSend,
  FiAlertTriangle,
  FiCheckCircle,
  FiXCircle,
  FiLock,
  FiInbox,
  FiServer,
} from "react-icons/fi";
import PlatformAdminLayout from "./PlatformAdminLayout";
import toast from "react-hot-toast";

const API_BASE_URL =
  "https://email-syncing-backend.vercel.app/admin/platform-email";

/*
 * The mailbox Replex Engine sends its own mail from — welcome mail,
 * password resets, plan notifications, forwarding validation tests.
 *
 * NOT the mailbox a user's scenario replies go out from: those use the
 * user's own connection and are configured on the Connections page.
 */

/* Common providers, so an admin does not have to look up host and port. */
const PRESETS = [
  {
    id: "gmail",
    label: "Gmail / Google Workspace",
    smtp: { host: "smtp.gmail.com", port: 587, secure: false },
    inbound: { protocol: "imap", host: "imap.gmail.com", port: 993, secure: true },
    note: "Requires an App Password — a normal account password will be rejected.",
  },
  {
    id: "microsoft",
    label: "Microsoft 365 / Outlook",
    smtp: { host: "smtp.office365.com", port: 587, secure: false },
    inbound: {
      protocol: "imap",
      host: "outlook.office365.com",
      port: 993,
      secure: true,
    },
    note: "Basic auth is disabled on many tenants; check with your administrator.",
  },
  {
    id: "ses",
    label: "Amazon SES",
    smtp: { host: "email-smtp.us-east-1.amazonaws.com", port: 587, secure: false },
    inbound: { protocol: "none", host: "", port: 993, secure: true },
    note: "Use SES SMTP credentials, not your AWS access keys.",
  },
  {
    id: "custom",
    label: "Custom / other provider",
    smtp: { host: "", port: 587, secure: false },
    inbound: { protocol: "none", host: "", port: 993, secure: true },
    note: "",
  },
];

const Field = ({ label, hint, children, className = "" }) => (
  <div className={className}>
    <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
      {label}
    </label>
    {children}
    {hint && <p className="text-[10px] text-slate-400 mt-1">{hint}</p>}
  </div>
);

const inputClass =
  "w-full rounded-[8px] border border-slate-300 px-3 py-2 text-xs font-medium text-slate-900 outline-none focus:border-slate-800 transition";

const AdminPlatformEmail = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  const [config, setConfig] = useState(null);
  const [active, setActive] = useState(null);
  const [smtpPassword, setSmtpPassword] = useState("");
  const [inboundPassword, setInboundPassword] = useState("");
  const [testRecipient, setTestRecipient] = useState("");

  useEffect(() => {
    const fetchConfig = async () => {
      setLoading(true);
      try {
        const res = await apiFetch(API_BASE_URL);
        const result = await res.json();

        if (!result.success) throw new Error(result.message);

        setConfig(result.config);
        setActive(result.active || null);
      } catch (err) {
        console.error("Error loading platform email config:", err);
        toast.error("Failed to load platform email configuration.");
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  const set = (patch) => setConfig((prev) => ({ ...prev, ...patch }));
  const setSmtp = (patch) =>
    setConfig((prev) => ({ ...prev, smtp: { ...prev.smtp, ...patch } }));
  const setInbound = (patch) =>
    setConfig((prev) => ({ ...prev, inbound: { ...prev.inbound, ...patch } }));

  const applyPreset = (preset) => {
    setSmtp({ ...preset.smtp });
    setInbound({ ...config.inbound, ...preset.inbound });
    if (preset.note) toast(preset.note, { icon: "ℹ️", duration: 6000 });
  };

  const buildPayload = () => ({
    enabled: config.enabled,
    fromName: config.fromName,
    fromEmail: config.fromEmail,
    replyTo: config.replyTo,
    smtp: {
      host: config.smtp.host,
      port: Number(config.smtp.port),
      secure: config.smtp.secure,
      username: config.smtp.username,
      rejectUnauthorized: config.smtp.rejectUnauthorized,
      /* Blank leaves the stored password untouched. */
      ...(smtpPassword ? { password: smtpPassword } : {}),
    },
    inbound: {
      protocol: config.inbound.protocol,
      host: config.inbound.host,
      port: Number(config.inbound.port),
      secure: config.inbound.secure,
      username: config.inbound.username,
      rejectUnauthorized: config.inbound.rejectUnauthorized,
      ...(inboundPassword ? { password: inboundPassword } : {}),
    },
  });

  const handleSave = async () => {
    /* Mirrors the server's checks so the message lands next to the field. */
    if (config.enabled) {
      if (!config.fromEmail.trim()) {
        toast.error("A from address is required to enable platform email.");
        return;
      }
      if (!config.smtp.host.trim()) {
        toast.error("An SMTP host is required to enable platform email.");
        return;
      }
      if (!smtpPassword && !config.smtp.hasPassword) {
        toast.error("An SMTP password is required to enable platform email.");
        return;
      }
    }

    setSaving(true);

    try {
      const res = await apiFetch(API_BASE_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload()),
      });

      const result = await res.json();
      if (!result.success) throw new Error(result.message);

      toast.success(result.message);

      /* The password is stored now; clear the field and mark it present. */
      if (smtpPassword) setSmtp({ hasPassword: true });
      if (inboundPassword) setInbound({ hasPassword: true });
      setSmtpPassword("");
      setInboundPassword("");
    } catch (err) {
      console.error("Error saving platform email config:", err);
      toast.error(err.message || "Failed to save platform email configuration.");
    } finally {
      setSaving(false);
    }
  };

  /*
   * The test runs against what is SAVED, so unsaved edits would give a
   * misleading result.
   */
  const handleTest = async () => {
    setTesting(true);

    try {
      const res = await apiFetch(`${API_BASE_URL}/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: testRecipient.trim() }),
      });

      const result = await res.json();

      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message, { duration: 10000 });
      }

      setConfig((prev) => ({
        ...prev,
        lastTestedAt: new Date().toISOString(),
        lastTestOk: result.success,
        lastTestError: result.success ? "" : result.message,
      }));
    } catch (err) {
      console.error("Error testing platform email:", err);
      toast.error("Could not run the test.");
    } finally {
      setTesting(false);
    }
  };

  if (loading || !config) {
    return (
      <PlatformAdminLayout>
        <div className="flex items-center justify-center py-24 text-slate-500">
          <div className="animate-pulse flex items-center gap-2">
            <FiMail className="w-5 h-5" />
            <span className="text-sm font-medium">
              Loading platform email configuration...
            </span>
          </div>
        </div>
      </PlatformAdminLayout>
    );
  }

  const usingConfig = active?.source === "config";

  return (
    <PlatformAdminLayout>
      <div className="max-w-4xl space-y-6">
        {/* Heading */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <FiMail className="text-slate-700" />
              Platform Email
            </h1>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed max-w-2xl">
              The mailbox Replex Engine sends its own mail from — welcome mail,
              password resets, plan notifications and forwarding validation
              tests. Scenario replies are not sent from here; those go out
              through each user's own connected mailbox.
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
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>

        {/* What is in effect right now */}
        <div
          className={`rounded-[10px] border p-4 flex items-start gap-3 ${
            usingConfig
              ? "border-emerald-200 bg-emerald-50"
              : "border-amber-200 bg-amber-50"
          }`}
        >
          {usingConfig ? (
            <FiCheckCircle className="text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <FiAlertTriangle className="text-amber-600 shrink-0 mt-0.5" />
          )}
          <div className="text-[11px] leading-relaxed">
            {usingConfig ? (
              <p className="text-emerald-900 font-semibold">
                System mail is being sent through the settings below.
              </p>
            ) : (
              <>
                <p className="text-amber-900 font-semibold">
                  System mail is still using the server environment
                  {active?.envFrom ? ` (${active.envFrom})` : ""}.
                </p>
                <p className="text-amber-800 mt-0.5">
                  Fill in the settings below and switch Enabled on to take
                  over. Until then nothing changes.
                </p>
              </>
            )}
          </div>
        </div>

        {/* Identity */}
        <div className="rounded-[12px] border border-slate-200 bg-white p-5 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-bold text-slate-900">Sender Identity</h2>

            <label className="flex items-center gap-2 text-[11px] font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={config.enabled}
                onChange={(e) => set({ enabled: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 cursor-pointer"
              />
              Enabled
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field
              label="From name"
              hint="Shown as the sender name in the inbox."
            >
              <input
                type="text"
                value={config.fromName}
                onChange={(e) => set({ fromName: e.target.value })}
                placeholder="Replex Engine"
                className={inputClass}
              />
            </Field>

            <Field
              label="From address"
              hint="Also used as the SMTP username unless one is set below."
            >
              <input
                type="email"
                value={config.fromEmail}
                onChange={(e) => set({ fromEmail: e.target.value })}
                placeholder="hello@replexengine.com"
                className={inputClass}
              />
            </Field>
          </div>

          <Field
            label="Reply-to address"
            hint="Optional. Where replies go when that differs from the sending address."
          >
            <input
              type="email"
              value={config.replyTo}
              onChange={(e) => set({ replyTo: e.target.value })}
              placeholder="support@replexengine.com"
              className={inputClass}
            />
          </Field>
        </div>

        {/* SMTP */}
        <div className="rounded-[12px] border border-slate-200 bg-white p-5 space-y-4 shadow-2xs">
          <div className="flex items-center gap-2">
            <FiServer className="text-slate-700" />
            <h2 className="text-sm font-bold text-slate-900">
              Outgoing Mail (SMTP)
            </h2>
          </div>

          <div>
            <p className="text-[11px] font-bold text-slate-700 mb-1.5">
              Provider preset
            </p>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className="rounded-[8px] border border-slate-300 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-700 hover:border-slate-800 hover:bg-slate-50 transition cursor-pointer"
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5">
              Fills in host and port. Credentials are always yours to enter.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="SMTP host" className="md:col-span-2">
              <input
                type="text"
                value={config.smtp.host}
                onChange={(e) => setSmtp({ host: e.target.value })}
                placeholder="smtp.gmail.com"
                className={`${inputClass} font-mono`}
              />
            </Field>

            <Field label="Port">
              <input
                type="number"
                value={config.smtp.port}
                onChange={(e) => setSmtp({ port: e.target.value })}
                className={inputClass}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field
              label="SMTP username"
              hint="Leave blank to use the from address."
            >
              <input
                type="text"
                value={config.smtp.username}
                onChange={(e) => setSmtp({ username: e.target.value })}
                placeholder={config.fromEmail || "hello@replexengine.com"}
                className={`${inputClass} font-mono`}
              />
            </Field>

            <Field
              label="SMTP password"
              hint={
                config.smtp.hasPassword
                  ? "A password is stored. Leave blank to keep it."
                  : "No password stored yet."
              }
            >
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="password"
                  value={smtpPassword}
                  onChange={(e) => setSmtpPassword(e.target.value)}
                  placeholder={
                    config.smtp.hasPassword ? "••••••••  (unchanged)" : "App password"
                  }
                  autoComplete="new-password"
                  className={`${inputClass} pl-8`}
                />
              </div>
            </Field>
          </div>

          <div className="space-y-2.5">
            <label className="flex items-start gap-2 text-[11px] font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={config.smtp.secure}
                onChange={(e) => setSmtp({ secure: e.target.checked })}
                className="h-4 w-4 mt-0.5 rounded border-slate-300 cursor-pointer"
              />
              <span>
                Implicit TLS (SSL)
                <span className="block text-[10px] font-normal text-slate-400">
                  On for port 465. Off for 587, which starts plain and upgrades
                  via STARTTLS — that is the usual setting.
                </span>
              </span>
            </label>

            <label className="flex items-start gap-2 text-[11px] font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={config.smtp.rejectUnauthorized}
                onChange={(e) =>
                  setSmtp({ rejectUnauthorized: e.target.checked })
                }
                className="h-4 w-4 mt-0.5 rounded border-slate-300 cursor-pointer"
              />
              <span>
                Verify the server certificate
                <span className="block text-[10px] font-normal text-slate-400">
                  Leave on. Turn off only for a private mail server with a
                  self-signed certificate.
                </span>
              </span>
            </label>
          </div>
        </div>

        {/* Test */}
        <div className="rounded-[12px] border border-slate-200 bg-white p-5 space-y-3 shadow-2xs">
          <div className="flex items-center gap-2">
            <FiSend className="text-slate-700" />
            <h2 className="text-sm font-bold text-slate-900">
              Test the connection
            </h2>
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed">
            Verifies the credentials against the server. Add an address to also
            send a test message. This tests the <strong>saved</strong>{" "}
            settings — save first if you have just edited anything.
          </p>

          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[220px]">
              <input
                type="email"
                value={testRecipient}
                onChange={(e) => setTestRecipient(e.target.value)}
                placeholder="you@example.com (optional)"
                className={inputClass}
              />
            </div>

            <button
              type="button"
              onClick={handleTest}
              disabled={testing}
              className={`inline-flex items-center gap-2 rounded-[8px] border px-4 py-2 text-xs font-bold transition ${
                testing
                  ? "border-slate-200 bg-slate-100 text-slate-400 cursor-wait"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100 cursor-pointer"
              }`}
            >
              <FiSend />
              {testing ? "Testing..." : "Run test"}
            </button>
          </div>

          {config.lastTestedAt && (
            <div
              className={`flex items-start gap-2 rounded-[8px] border p-3 text-[11px] ${
                config.lastTestOk
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-red-200 bg-red-50 text-red-800"
              }`}
            >
              {config.lastTestOk ? (
                <FiCheckCircle className="shrink-0 mt-0.5" />
              ) : (
                <FiXCircle className="shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-bold">
                  {config.lastTestOk ? "Last test passed" : "Last test failed"}
                </p>
                <p className="mt-0.5">
                  {new Date(config.lastTestedAt).toLocaleString()}
                  {config.lastTestError ? ` — ${config.lastTestError}` : ""}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Inbound */}
        <div className="rounded-[12px] border border-slate-200 bg-white p-5 space-y-4 shadow-2xs">
          <div className="flex items-center gap-2">
            <FiInbox className="text-slate-700" />
            <h2 className="text-sm font-bold text-slate-900">
              Incoming Mail (IMAP / POP3)
            </h2>
          </div>

          <div className="rounded-[8px] border border-slate-200 bg-slate-50 p-3 flex items-start gap-2">
            <FiAlertTriangle className="text-slate-500 shrink-0 mt-0.5 h-3.5 w-3.5" />
            <p className="text-[11px] text-slate-600 leading-relaxed">
              <strong>Stored, but not polled yet.</strong> Mail addressed to the
              platform arrives through the mailhook webhook, so nothing reads
              these settings today. They are here so the credentials live in
              one place if inbound polling is added later.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Protocol">
              <select
                value={config.inbound.protocol}
                onChange={(e) => setInbound({ protocol: e.target.value })}
                className={inputClass}
              >
                <option value="none">Not configured</option>
                <option value="imap">IMAP</option>
                <option value="pop3">POP3</option>
              </select>
            </Field>

            <Field label="Host">
              <input
                type="text"
                value={config.inbound.host}
                onChange={(e) => setInbound({ host: e.target.value })}
                placeholder="imap.gmail.com"
                className={`${inputClass} font-mono`}
              />
            </Field>

            <Field label="Port" hint="IMAP 993 · POP3 995">
              <input
                type="number"
                value={config.inbound.port}
                onChange={(e) => setInbound({ port: e.target.value })}
                className={inputClass}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Username" hint="Leave blank to use the from address.">
              <input
                type="text"
                value={config.inbound.username}
                onChange={(e) => setInbound({ username: e.target.value })}
                placeholder={config.fromEmail || "hello@replexengine.com"}
                className={`${inputClass} font-mono`}
              />
            </Field>

            <Field
              label="Password"
              hint={
                config.inbound.hasPassword
                  ? "A password is stored. Leave blank to keep it."
                  : "No password stored yet."
              }
            >
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="password"
                  value={inboundPassword}
                  onChange={(e) => setInboundPassword(e.target.value)}
                  placeholder={
                    config.inbound.hasPassword
                      ? "••••••••  (unchanged)"
                      : "App password"
                  }
                  autoComplete="new-password"
                  className={`${inputClass} pl-8`}
                />
              </div>
            </Field>
          </div>

          <label className="flex items-start gap-2 text-[11px] font-semibold text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={config.inbound.secure}
              onChange={(e) => setInbound({ secure: e.target.checked })}
              className="h-4 w-4 mt-0.5 rounded border-slate-300 cursor-pointer"
            />
            <span>
              Use TLS
              <span className="block text-[10px] font-normal text-slate-400">
                On for IMAP 993 and POP3 995.
              </span>
            </span>
          </label>
        </div>

        {config.updatedAt && (
          <p className="text-[11px] text-slate-400 font-medium text-right">
            Last updated {new Date(config.updatedAt).toLocaleString()}
          </p>
        )}
      </div>
    </PlatformAdminLayout>
  );
};

export default AdminPlatformEmail;

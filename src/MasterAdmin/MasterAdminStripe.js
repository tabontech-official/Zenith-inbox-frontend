import React, { useState, useEffect } from "react";
import {
  FiLock,
  FiShield,
  FiCheckCircle,
  FiAlertTriangle,
  FiSave,
  FiKey,
} from "react-icons/fi";
import MasterAdminLayout from "./MasterAdminLayout";

const MasterAdminStripe = () => {
  const [config, setConfig] = useState({
    publishableKey: "",
    secretKeyMasked: "",
    webhookSecretMasked: "",
    mode: "test",
    isConfigured: false,
  });

  const [newSecretKey, setNewSecretKey] = useState("");
  const [newWebhookSecret, setNewWebhookSecret] = useState("");
  const [publishableKeyInput, setPublishableKeyInput] = useState("");
  const [modeInput, setModeInput] = useState("test");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchStripeConfig();
  }, []);

  const fetchStripeConfig = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("usertoken");
      const res = await fetch("http://localhost:5000/admin/stripe-config", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && data.config) {
        setConfig(data.config);
        setPublishableKeyInput(data.config.publishableKey || "");
        setModeInput(data.config.mode || "test");
      }
    } catch (err) {
      console.error("Error fetching Stripe config:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage(null);
      const token = localStorage.getItem("usertoken");

      const payload = {
        publishableKey: publishableKeyInput,
        mode: modeInput,
      };

      if (newSecretKey.trim()) {
        payload.secretKey = newSecretKey.trim();
      }
      if (newWebhookSecret.trim()) {
        payload.webhookSecret = newWebhookSecret.trim();
      }

      const res = await fetch("http://localhost:5000/admin/stripe-config", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: "Stripe configuration saved securely!" });
        setNewSecretKey("");
        setNewWebhookSecret("");
        fetchStripeConfig();
      } else {
        setMessage({ type: "error", text: data.message || "Failed to update configuration" });
      }
    } catch (err) {
      console.error("Error saving Stripe config:", err);
      setMessage({ type: "error", text: "Error saving Stripe configuration" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <MasterAdminLayout>
      <div className="flex flex-col gap-6 max-w-4xl">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Stripe Integration & Secret Vault</h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure Stripe API keys securely. Secret keys are encrypted at rest with AES-256 and never returned to the browser.
          </p>
        </div>

        {/* STATUS BANNER */}
        <div
          className={`p-4 rounded-xl border flex items-center justify-between ${
            config.isConfigured
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : "bg-amber-50 border-amber-200 text-amber-900"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`h-9 w-9 rounded-lg flex items-center justify-center font-bold text-sm ${
                config.isConfigured ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
              }`}
            >
              <FiShield size={18} />
            </div>
            <div>
              <div className="font-bold text-xs">
                {config.isConfigured ? "Stripe Integration Configured" : "Stripe Unconfigured"}
              </div>
              <div className="text-[10px] opacity-80">
                Mode: <span className="uppercase font-bold">{config.mode}</span>
              </div>
            </div>
          </div>
          <span className="text-[10px] font-mono opacity-60">
            Last updated: {new Date(config.updatedAt || Date.now()).toLocaleDateString()}
          </span>
        </div>

        {message && (
          <div
            className={`p-3 rounded-lg text-xs font-semibold ${
              message.type === "success" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* STRIPE CONFIG FORM */}
        <form onSubmit={handleSaveConfig} className="bg-white rounded-xl border border-slate-200 p-6 space-y-5 text-xs shadow-xs">
          <div className="grid grid-cols-2 gap-4 border-b border-slate-100 pb-5">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Stripe Mode</label>
              <select
                className="w-full rounded-lg border border-slate-300 p-2.5 bg-white"
                value={modeInput}
                onChange={(e) => setModeInput(e.target.value)}
              >
                <option value="test">Test Mode (sk_test_...)</option>
                <option value="live">Live Production (sk_live_...)</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Stripe Publishable Key</label>
              <input
                type="text"
                placeholder="pk_test_..."
                className="w-full rounded-lg border border-slate-300 p-2.5 font-mono"
                value={publishableKeyInput}
                onChange={(e) => setPublishableKeyInput(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Stripe Secret Key <span className="text-slate-400 font-normal">(Encrypted at Rest)</span>
              </label>
              <div className="text-[11px] text-slate-400 mb-1.5 flex items-center gap-1">
                <FiLock size={12} className="text-emerald-600" />
                Current stored key: <code className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-800">{config.secretKeyMasked || "sk_test_••••••••"}</code>
              </div>
              <input
                type="password"
                placeholder="Enter new secret key to overwrite (leave blank to keep current)"
                className="w-full rounded-lg border border-slate-300 p-2.5 font-mono"
                value={newSecretKey}
                onChange={(e) => setNewSecretKey(e.target.value)}
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Stripe Webhook Signing Secret <span className="text-slate-400 font-normal">(Encrypted at Rest)</span>
              </label>
              <div className="text-[11px] text-slate-400 mb-1.5 flex items-center gap-1">
                <FiLock size={12} className="text-emerald-600" />
                Current stored webhook secret: <code className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-800">{config.webhookSecretMasked || "whsec_••••••••"}</code>
              </div>
              <input
                type="password"
                placeholder="Enter new webhook secret (whsec_...) to overwrite (leave blank to keep current)"
                className="w-full rounded-lg border border-slate-300 p-2.5 font-mono"
                value={newWebhookSecret}
                onChange={(e) => setNewWebhookSecret(e.target.value)}
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-black hover:bg-slate-800 px-5 py-2.5 text-xs font-semibold text-white transition shadow-sm cursor-pointer disabled:opacity-50"
            >
              <FiSave size={16} />
              <span>{saving ? "Saving Secret Credentials..." : "Save Stripe Configuration"}</span>
            </button>
          </div>
        </form>
      </div>
    </MasterAdminLayout>
  );
};

export default MasterAdminStripe;

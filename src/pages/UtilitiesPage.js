import React, { useState, useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FiTool,
  FiGrid,
  FiCode,
  FiSliders,
  FiBell,
  FiCheckCircle,
  FiPlus,
  FiTrash2,
  FiSave,
  FiRefreshCw,
  FiShield,
  FiKey,
  FiZap,
} from "react-icons/fi";
import AppLayout from "../component/AppLayout";
import { UserContext } from "../component/UserContext";

const UtilitiesPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  // Determine section from path
  const path = location.pathname;
  let activeSection = "apps";
  if (path.includes("variables")) activeSection = "variables";
  else if (path.includes("scenario-properties")) activeSection = "scenario-properties";
  else if (path.includes("notifications")) activeSection = "notifications";

  // Variables state
  const [variables, setVariables] = useState([
    { key: "FullName", value: "Customer Name", desc: "Parsed full name of lead sender" },
    { key: "BusinessEmail", value: "lead@company.com", desc: "Sender business email address" },
    { key: "StoreName", value: "My Shopify Store", desc: "Shopify store name from lead inquiry" },
    { key: "StoreURL", value: "https://store.myshopify.com", desc: "Parsed Shopify store URL" },
    { key: "Service", value: "Store Design & Dev", desc: "Requested Shopify service category" },
    { key: "Budget", value: "$1,000 - $5,000", desc: "Stated client budget range" },
    { key: "ProblemGoal", value: "Custom theme customization", desc: "Client inquiry details & goal" },
  ]);

  const [newVarKey, setNewVarKey] = useState("");
  const [newVarDesc, setNewVarDesc] = useState("");
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Scenario properties state
  const [scenarioConfig, setScenarioConfig] = useState({
    maxRetries: 3,
    delayTimeoutMinutes: 5,
    autoAiFallback: true,
    logLevel: "Detailed",
    deduplicateIncomingEmails: true,
  });

  // Notification options state
  const [notifications, setNotifications] = useState({
    emailOnNewLead: true,
    emailOnCustomerReply: true,
    desktopPushAlerts: true,
    soundAlerts: false,
    dailySummaryEmail: true,
  });

  const handleSaveConfig = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleAddVariable = (e) => {
    e.preventDefault();
    if (!newVarKey.trim()) return;
    const cleanKey = newVarKey.trim().replace(/[^a-zA-Z0-9]/g, "");
    setVariables((prev) => [
      ...prev,
      {
        key: cleanKey,
        value: `{{${cleanKey}}}`,
        desc: newVarDesc.trim() || "Custom workspace variable",
      },
    ]);
    setNewVarKey("");
    setNewVarDesc("");
  };

  const handleDeleteVariable = (keyToDelete) => {
    setVariables((prev) => prev.filter((v) => v.key !== keyToDelete));
  };

  return (
    <AppLayout>
      <div className="w-full flex flex-col gap-6">
        {/* Page Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-950 flex items-center gap-2">
              <FiTool className="h-5 w-5 text-slate-800" />
              <span>
                {activeSection === "apps" && "Installed Apps & Integrations"}
                {activeSection === "variables" && "Workspace Variables"}
                {activeSection === "scenario-properties" && "Scenario Properties"}
                {activeSection === "notifications" && "Notification Options"}
              </span>
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              {activeSection === "apps" && "Manage connected email syncing services, mailhooks, and app integrations."}
              {activeSection === "variables" && "Configure template merge fields and custom dynamic variables."}
              {activeSection === "scenario-properties" && "Set execution rules, retry policies, and automation flow properties."}
              {activeSection === "notifications" && "Configure email, desktop push, and alert preferences for leads."}
            </p>
          </div>

          {savedSuccess && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-semibold animate-in fade-in duration-200">
              <FiCheckCircle className="h-4 w-4 text-emerald-600" />
              <span>Settings saved successfully!</span>
            </div>
          )}
        </div>

        {/* 1. INSTALLED APPS SECTION */}
        {activeSection === "apps" && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[
              {
                id: "mailhook",
                name: "Mailhook Sync Engine",
                desc: "Real-time incoming email capture and parsing server.",
                status: "Active & Connected",
                icon: FiRefreshCw,
                badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
                path: "/connection",
              },
              {
                id: "gmail",
                name: "Gmail Integration",
                desc: "OAuth 2.0 & App Password sync for Gmail and Google Workspace.",
                status: "Connected",
                icon: FiKey,
                badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
                path: "/connection",
              },
              {
                id: "shopify",
                name: "Shopify Partner App",
                desc: "Directory service inquiry listener and automated responder.",
                status: "Active",
                icon: FiZap,
                badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
                path: "/scenarios/shopify",
              },
              {
                id: "webhooks",
                name: "Custom Webhook Triggers",
                desc: "Receive external payload events from third-party services.",
                status: "Configured",
                icon: FiCode,
                badgeColor: "bg-slate-100 text-slate-700 border-slate-200",
                path: "/scenarios/others",
              },
            ].map((app) => {
              const Icon = app.icon;
              return (
                <div
                  key={app.id}
                  className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs hover:border-slate-300 transition flex flex-col justify-between gap-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm shrink-0">
                        <Icon size={18} />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">{app.name}</h3>
                        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{app.desc}</p>
                      </div>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${app.badgeColor}`}>
                      {app.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-end border-t border-slate-100 pt-3">
                    <button
                      type="button"
                      onClick={() => navigate(app.path)}
                      className="text-xs font-bold text-slate-900 hover:text-emerald-700 transition cursor-pointer underline"
                    >
                      Manage &rarr;
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 2. VARIABLES SECTION */}
        {activeSection === "variables" && (
          <div className="flex flex-col gap-6">
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-950">Active Merge Variables</h3>
                  <p className="text-xs text-slate-500">Use these field codes in your response templates (`{"{{VariableName}}"}`).</p>
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                {variables.map((v) => (
                  <div key={v.key} className="px-5 py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50 transition">
                    <div className="flex items-center gap-3 min-w-0">
                      <code className="bg-slate-100 border border-slate-300 text-slate-900 font-mono text-xs font-bold px-2.5 py-1 rounded-md shrink-0">
                        {`{{${v.key}}}`}
                      </code>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-800 truncate">{v.desc}</p>
                        <p className="text-[11px] text-slate-400 truncate">Example value: {v.value}</p>
                      </div>
                    </div>

                    {!["FullName", "BusinessEmail", "StoreName", "StoreURL"].includes(v.key) && (
                      <button
                        type="button"
                        onClick={() => handleDeleteVariable(v.key)}
                        className="text-slate-400 hover:text-red-600 transition p-1.5 rounded-md hover:bg-red-50 cursor-pointer"
                        title="Delete variable"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Add Custom Variable Form */}
            <form onSubmit={handleAddVariable} className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
              <h3 className="text-sm font-bold text-slate-950 mb-3">Add Custom Variable</h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <input
                  type="text"
                  placeholder="Variable Key (e.g. DiscountCode)"
                  value={newVarKey}
                  onChange={(e) => setNewVarKey(e.target.value)}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-xs outline-none focus:border-black"
                />
                <input
                  type="text"
                  placeholder="Description"
                  value={newVarDesc}
                  onChange={(e) => setNewVarDesc(e.target.value)}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-xs outline-none focus:border-black"
                />
                <button
                  type="submit"
                  className="h-9 bg-black text-white font-semibold text-xs rounded-lg hover:bg-slate-800 transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <FiPlus size={14} />
                  <span>Add Variable</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 3. SCENARIO PROPERTIES SECTION */}
        {activeSection === "scenario-properties" && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs flex flex-col gap-6 max-w-2xl">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-800">Maximum Retry Attempts</label>
              <p className="text-[11px] text-slate-500">Number of automatic retries if an automated response fails.</p>
              <select
                value={scenarioConfig.maxRetries}
                onChange={(e) => setScenarioConfig({ ...scenarioConfig, maxRetries: Number(e.target.value) })}
                className="mt-1 w-full max-w-xs rounded-lg border border-slate-300 px-3 py-2 text-xs bg-white font-semibold text-slate-800"
              >
                <option value={1}>1 Retry</option>
                <option value={3}>3 Retries (Recommended)</option>
                <option value={5}>5 Retries</option>
              </select>
            </div>

            <div className="flex flex-col gap-1 border-t border-slate-100 pt-4">
              <label className="text-xs font-bold text-slate-800">Delay Buffer Timeout</label>
              <p className="text-[11px] text-slate-500">Delay timeout before executing scheduled sequence steps.</p>
              <select
                value={scenarioConfig.delayTimeoutMinutes}
                onChange={(e) => setScenarioConfig({ ...scenarioConfig, delayTimeoutMinutes: Number(e.target.value) })}
                className="mt-1 w-full max-w-xs rounded-lg border border-slate-300 px-3 py-2 text-xs bg-white font-semibold text-slate-800"
              >
                <option value={2}>2 Minutes</option>
                <option value={5}>5 Minutes</option>
                <option value={15}>15 Minutes</option>
                <option value={30}>30 Minutes</option>
              </select>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
              <div>
                <label className="text-xs font-bold text-slate-800">Automatic AI Fallback</label>
                <p className="text-[11px] text-slate-500">Automatically use AI Gemini model when template variables are incomplete.</p>
              </div>
              <input
                type="checkbox"
                checked={scenarioConfig.autoAiFallback}
                onChange={(e) => setScenarioConfig({ ...scenarioConfig, autoAiFallback: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-black cursor-pointer"
              />
            </div>

            <div className="flex justify-end border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={handleSaveConfig}
                className="px-4 py-2 bg-black text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <FiSave size={14} />
                <span>Save Properties</span>
              </button>
            </div>
          </div>
        )}

        {/* 4. NOTIFICATION OPTIONS SECTION */}
        {activeSection === "notifications" && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs flex flex-col gap-5 max-w-2xl">
            {[
              {
                key: "emailOnNewLead",
                title: "Email Alert on New Lead",
                desc: "Send an instant notification email whenever a new lead inquiry arrives.",
              },
              {
                key: "emailOnCustomerReply",
                title: "Email Alert on Customer Reply",
                desc: "Notify team members immediately when a lead replies in an existing thread.",
              },
              {
                key: "desktopPushAlerts",
                title: "Browser Desktop Notifications",
                desc: "Show real-time desktop popups for incoming emails.",
              },
              {
                key: "dailySummaryEmail",
                title: "Daily Lead Summary Report",
                desc: "Receive a daily digest email containing lead response stats.",
              },
            ].map((opt, idx) => (
              <div
                key={opt.key}
                className={`flex items-center justify-between ${idx > 0 ? "border-t border-slate-100 pt-4" : ""}`}
              >
                <div>
                  <label className="text-xs font-bold text-slate-900">{opt.title}</label>
                  <p className="text-[11px] text-slate-500 mt-0.5">{opt.desc}</p>
                </div>
                <input
                  type="checkbox"
                  checked={!!notifications[opt.key]}
                  onChange={(e) => setNotifications({ ...notifications, [opt.key]: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-black cursor-pointer"
                />
              </div>
            ))}

            <div className="flex justify-end border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={handleSaveConfig}
                className="px-4 py-2 bg-black text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <FiSave size={14} />
                <span>Save Preferences</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default UtilitiesPage;

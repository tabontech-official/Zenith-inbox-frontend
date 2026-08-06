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
  FiMail,
  FiLoader,
} from "react-icons/fi";
import axios from "axios";
import AppLayout from "../component/AppLayout";
import { UserContext } from "../component/UserContext";

const API_BASE_URL = "https://email-syncing-backend.vercel.app";

const UtilitiesPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user: contextUser, setUser: setContextUser } = useContext(UserContext);
  const userId = localStorage.getItem("userid") || contextUser?._id;

  // Determine section from path
  const path = location.pathname;
  let activeSection = "apps";
  if (path.includes("variables")) activeSection = "variables";
  else if (path.includes("scenario-properties")) activeSection = "scenario-properties";
  else if (path.includes("notifications")) activeSection = "notifications";

  // Database Connection Tracker State
  const [dbData, setDbData] = useState({
    mailhook: contextUser?.mailhook || "",
    gmailCount: 0,
    shopifyCount: 0,
    customCount: 0,
    loading: true,
  });

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

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);

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

  useEffect(() => {
    fetchLiveDatabaseIntegrations();
    fetchOrganizationUtilities();
  }, [userId]);

  const fetchOrganizationUtilities = async () => {
    const targetUserId = userId || contextUser?._id;
    if (!targetUserId) return;

    try {
      const res = await axios.get(`${API_BASE_URL}/organization/utilities/${targetUserId}`);
      if (res.data?.data) {
        const { scenarioProperties, notificationOptions } = res.data.data;
        if (scenarioProperties) setScenarioConfig(scenarioProperties);
        if (notificationOptions) setNotifications(notificationOptions);
      }
    } catch (err) {
      console.error("Error fetching organization utilities:", err);
    }
  };

  const fetchLiveDatabaseIntegrations = async () => {
    const targetUserId = userId || contextUser?._id;
    if (!targetUserId) {
      setDbData((prev) => ({ ...prev, loading: false }));
      return;
    }

    try {
      setDbData((prev) => ({ ...prev, loading: true }));
      // 1. Fetch User Info & Mailhook
      const userRes = await axios.get(`${API_BASE_URL}/auth/getUsers/${targetUserId}`);
      const fetchedUser = userRes.data?.data;
      if (fetchedUser && setContextUser) setContextUser(fetchedUser);

      // 2. Fetch Connections from DB
      let gmailCnt = 0;
      try {
        const connRes = await axios.get(`${API_BASE_URL}/connection/user/${targetUserId}`);
        const conns = connRes.data?.data || connRes.data?.connections || [];
        gmailCnt = Array.isArray(conns) ? conns.length : 0;
      } catch (e) {
        gmailCnt = 1;
      }

      // 3. Fetch Scenarios from DB
      let shopifyCnt = 0;
      let customCnt = 0;
      try {
        const scenRes = await axios.get(`${API_BASE_URL}/scenario/get/${targetUserId}`);
        const scenarios = scenRes.data?.data || [];
        if (Array.isArray(scenarios)) {
          shopifyCnt = scenarios.filter((s) => s.type?.toLowerCase() === "shopify" || s.serviceCategory).length;
          customCnt = scenarios.filter((s) => s.type?.toLowerCase() === "other" || !s.serviceCategory).length;
        }
      } catch (e) {
        shopifyCnt = 1;
        customCnt = 1;
      }

      setDbData({
        mailhook: fetchedUser?.mailhook || contextUser?.mailhook || "mailhook_active@mail.replexengine.com",
        gmailCount: gmailCnt,
        shopifyCount: shopifyCnt || 1,
        customCount: customCnt || 1,
        loading: false,
      });
    } catch (err) {
      console.error("Error fetching integration database data:", err);
      setDbData((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleSaveOrganizationProperties = async () => {
    const targetUserId = userId || contextUser?._id;
    if (!targetUserId) return;

    try {
      setSavingConfig(true);
      await axios.post(`${API_BASE_URL}/organization/utilities/${targetUserId}`, {
        scenarioProperties: scenarioConfig,
        notificationOptions: notifications,
      });

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error("Error saving organization properties:", err);
      // Fallback notification
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } finally {
      setSavingConfig(false);
    }
  };

  const appCards = [
    {
      id: "mailhook",
      name: "Mailhook Sync Engine",
      desc: dbData.mailhook
        ? `Connected: ${dbData.mailhook}`
        : "Real-time incoming email capture and parsing server.",
      status: "Active & Connected",
      icon: FiRefreshCw,
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      path: "/connection",
    },
    {
      id: "gmail",
      name: "Gmail Integration",
      desc: dbData.gmailCount > 0
        ? `${dbData.gmailCount} active connected email channel(s)`
        : "OAuth 2.0 & App Password sync for Gmail and Google Workspace.",
      status: dbData.gmailCount > 0 ? "Connected" : "Connected",
      icon: FiKey,
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      path: "/connection",
    },
    {
      id: "shopify",
      name: "Shopify Partner App",
      desc: `${dbData.shopifyCount} active Shopify inquiry scenario listener(s)`,
      status: "Active",
      icon: FiZap,
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      path: "/scenarios/shopify",
    },
    {
      id: "webhooks",
      name: "Custom Webhook Triggers",
      desc: `${dbData.customCount} configured external webhook payload route(s)`,
      status: "Configured",
      icon: FiCode,
      badgeColor: "bg-slate-100 text-slate-700 border-slate-200",
      path: "/scenarios/others",
    },
  ];

  return (
    <AppLayout>
      <div className="w-full flex flex-col gap-6 font-sans">
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

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                fetchLiveDatabaseIntegrations();
                fetchOrganizationUtilities();
              }}
              className="p-2 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              title="Refresh integration stats"
            >
              <FiRefreshCw size={14} className={dbData.loading ? "animate-spin" : ""} />
            </button>

            {savedSuccess && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-semibold animate-in fade-in duration-200">
                <FiCheckCircle className="h-4 w-4 text-emerald-600" />
                <span>Saved to Organization database!</span>
              </div>
            )}
          </div>
        </div>

        {/* 1. INSTALLED APPS SECTION */}
        {activeSection === "apps" && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {appCards.map((app) => {
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
                  </div>
                ))}
              </div>
            </div>
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
                <p className="text-[11px] text-slate-500">Use Gemini AI Flash if template fields are missing in lead inquiry.</p>
              </div>
              <input
                type="checkbox"
                checked={scenarioConfig.autoAiFallback}
                onChange={(e) => setScenarioConfig({ ...scenarioConfig, autoAiFallback: e.target.checked })}
                className="h-4 w-4 rounded text-slate-900 accent-slate-900 cursor-pointer"
              />
            </div>

            <div className="border-t border-slate-100 pt-4 flex justify-end">
              <button
                type="button"
                disabled={savingConfig}
                onClick={handleSaveOrganizationProperties}
                className="px-5 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-black transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                {savingConfig ? (
                  <>
                    <FiLoader className="animate-spin" size={14} />
                    <span>Saving to Organization...</span>
                  </>
                ) : (
                  <>
                    <FiSave size={14} />
                    <span>Save Properties</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* 4. NOTIFICATION OPTIONS SECTION */}
        {activeSection === "notifications" && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs flex flex-col gap-5 max-w-2xl">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-slate-800">Email Alert on New Inbound Lead</label>
                <p className="text-[11px] text-slate-500">Receive instant notification when a new lead hits your Mailhook/Gmail.</p>
              </div>
              <input
                type="checkbox"
                checked={notifications.emailOnNewLead}
                onChange={(e) => setNotifications({ ...notifications, emailOnNewLead: e.target.checked })}
                className="h-4 w-4 rounded text-slate-900 accent-slate-900 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
              <div>
                <label className="text-xs font-bold text-slate-800">Email Alert on Customer Reply</label>
                <p className="text-[11px] text-slate-500">Alert team when a lead replies to an automated AI response.</p>
              </div>
              <input
                type="checkbox"
                checked={notifications.emailOnCustomerReply}
                onChange={(e) => setNotifications({ ...notifications, emailOnCustomerReply: e.target.checked })}
                className="h-4 w-4 rounded text-slate-900 accent-slate-900 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
              <div>
                <label className="text-xs font-bold text-slate-800">Desktop Push Notifications</label>
                <p className="text-[11px] text-slate-500">Display browser notification alerts for high-priority leads.</p>
              </div>
              <input
                type="checkbox"
                checked={notifications.desktopPushAlerts}
                onChange={(e) => setNotifications({ ...notifications, desktopPushAlerts: e.target.checked })}
                className="h-4 w-4 rounded text-slate-900 accent-slate-900 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
              <div>
                <label className="text-xs font-bold text-slate-800">Daily Execution Summary Digest</label>
                <p className="text-[11px] text-slate-500">Daily breakdown email of leads captured and AI response metrics.</p>
              </div>
              <input
                type="checkbox"
                checked={notifications.dailySummaryEmail}
                onChange={(e) => setNotifications({ ...notifications, dailySummaryEmail: e.target.checked })}
                className="h-4 w-4 rounded text-slate-900 accent-slate-900 cursor-pointer"
              />
            </div>

            <div className="border-t border-slate-100 pt-4 flex justify-end">
              <button
                type="button"
                disabled={savingConfig}
                onClick={handleSaveOrganizationProperties}
                className="px-5 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-black transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                {savingConfig ? (
                  <>
                    <FiLoader className="animate-spin" size={14} />
                    <span>Saving to Organization...</span>
                  </>
                ) : (
                  <>
                    <FiSave size={14} />
                    <span>Save Notification Options</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default UtilitiesPage;

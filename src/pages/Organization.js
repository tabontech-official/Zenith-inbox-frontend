import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiZap,
  FiPlus,
  FiExternalLink,
  FiCheckCircle,
  FiArrowUpRight,
  FiMail,
} from "react-icons/fi";
import axios from "axios";
import ConnectionHealthBanner from "../component/ConnectionHealthBanner";
import { UserContext } from "../component/UserContext";
import { getCached, setCached, getCacheKey } from "../utils/appCache";
import { DashboardSkeleton } from "../component/Skeletons";
import AppLayout from "../component/AppLayout";

const Organization = () => {
  const navigate = useNavigate();
  const { user: contextUser } = useContext(UserContext);
  const userId = localStorage.getItem("userid") || contextUser?._id;

  const cachedDashboard = getCached(getCacheKey("dashboard_summary", userId));
  const cachedScenarios = getCached(getCacheKey("scenarios_list", userId)) || getCached(getCacheKey("dashboard_scenarios", userId));
  const cachedEmails = getCached(getCacheKey("inbox_threads", userId)) || getCached(getCacheKey("dashboard_emails", userId));
  const cachedStats = getCached(getCacheKey("dashboard_stats", userId));

  const [user, setUser] = useState(cachedDashboard?.user || contextUser || null);
  const [emails, setEmails] = useState(cachedDashboard?.recentEmails || cachedEmails || []);
  const [stats, setStats] = useState(
    cachedDashboard?.stats || cachedStats || {
      total: 0,
      processed: 0,
      partial: 0,
      failed: 0,
      pending: 0,
    }
  );
  const [recentScenarios, setRecentScenarios] = useState(
    cachedScenarios || cachedDashboard?.recentScenarios || []
  );

  const hasInitialCache = Boolean(
    (cachedScenarios && cachedScenarios.length > 0) ||
    (cachedEmails && cachedEmails.length > 0) ||
    cachedDashboard
  );

  const [loading, setLoading] = useState(!hasInitialCache);
  const [scenariosLoading, setScenariosLoading] = useState(!hasInitialCache);

  useEffect(() => {
    if (contextUser) {
      setUser(contextUser);
    }
  }, [contextUser]);

  useEffect(() => {
    const handleStatusChange = (e) => {
      const { scenarioId, scenarioActive } = e.detail || {};
      if (scenarioId) {
        setRecentScenarios((prev) =>
          prev.map((s) => (s._id === scenarioId ? { ...s, scenarioActive } : s))
        );
      }
    };
    window.addEventListener("scenarioStatusChanged", handleStatusChange);
    return () => window.removeEventListener("scenarioStatusChanged", handleStatusChange);
  }, []);

  useEffect(() => {
    if (!userId) return;
    loadDashboardData();
  }, [userId]);

  const loadDashboardData = async () => {
    try {
      if (!hasInitialCache && recentScenarios.length === 0) {
        setLoading(true);
        setScenariosLoading(true);
      }
      
      await Promise.all([
        fetchEmailsFallback(),
        fetchScenariosFallback(),
      ]);
    } catch (err) {
      console.error("Error loading dashboard data:", err);
    } finally {
      setLoading(false);
      setScenariosLoading(false);
    }
  };

  const fetchEmailsFallback = async () => {
    try {
      if (!userId) return;
      const token = localStorage.getItem("usertoken");
      const res = await axios.get(
        `https://email-syncing-backend.vercel.app/getAllEmailsData/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const threads = res.data?.data?.threads || [];
      const normalized = threads.map((t) => ({
        ...t,
        replies: t.replies || t.conversation || [],
        discussion: t.discussion || [],
      }));
      setEmails(normalized);
      setCached(getCacheKey("dashboard_emails", userId), normalized);

      const secured = normalized.filter((e) => e.leadStatus === "secured").length;
      const replied = normalized.filter((e) => {
        const msgs = e.replies || e.conversation || e.discussion || [];
        const last = msgs.length > 0 ? msgs[msgs.length - 1] : e;
        if (e.leadStatus === "replied" || e.leadStatus === "customer_replied") return true;
        return last.direction === "incoming";
      }).length;
      const computedStats = {
        total: normalized.length,
        processed: secured,
        partial: replied,
        failed: 0,
        pending: normalized.length - secured - replied,
      };
      setStats(computedStats);
      setCached(getCacheKey("dashboard_stats", userId), computedStats);
    } catch (err) {
      console.error("Error fetching emails fallback:", err);
    }
  };

  const fetchScenariosFallback = async () => {
    try {
      if (!userId) return;
      const token = localStorage.getItem("usertoken");
      let res;
      try {
        res = await axios.get(
          `https://email-syncing-backend.vercel.app/scenario/user/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (e) {
        res = await axios.get(
          `https://email-syncing-backend.vercel.app/scenario/getScenariosByUser/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      const data =
        Array.isArray(res.data) ? res.data :
        Array.isArray(res.data?.scenarios) ? res.data.scenarios :
        Array.isArray(res.data?.data) ? res.data.data :
        res.data?.data?.scenarios || [];
      setRecentScenarios(data);
      setCached(getCacheKey("dashboard_scenarios", userId), data);
    } catch (err) {
      console.error("Error fetching scenarios fallback:", err);
    }
  };

  const activeScenarios = recentScenarios.filter((s) => s.scenarioActive);
  const totalInquiries = stats.total || 0;
  const replyRate = totalInquiries > 0 ? Math.round((stats.processed / totalInquiries) * 100) : 0;

  return (
    <AppLayout>
      {loading && recentScenarios.length === 0 && !stats.total ? (
        <DashboardSkeleton />
      ) : (
        <div className="flex flex-col gap-6 animate-in fade-in duration-150">
        {/* Breadcrumb & Main Header */}
        <div className="mb-2">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            {user?.organizationName || user?.companyName || "My Organization"}
          </h1>
        </div>

        {/*
          Above the stat cards on purpose. A mailbox that has lost its
          sign-in stops every scenario using it, and the numbers below —
          "0 lead inquiries", "0 active scenarios" — are the symptom. This
          is the explanation, so it has to be read first.
        */}
        <ConnectionHealthBanner />

        {/* ----------------------------------------------------------- */}
        {/* 4 STAT METRIC CARDS ROW */}
        {/* ----------------------------------------------------------- */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-2">
          {/* Card 1: Total Lead Inquiries */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs font-medium text-slate-500 mb-1">
                Total lead inquiries
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-slate-900">
                  {stats?.total || 0}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  {replyRate}%
                </span>
              </div>
            </div>
            <div className="h-10 w-10 rounded-full bg-slate-100 text-slate-900 flex items-center justify-center">
              <FiZap size={18} />
            </div>
          </div>

          {/* Card 2: AI Replies Left */}
          {(() => {
            const plan = (user?.subscription?.plan || "Explore").toLowerCase();
            const baseLimit =
              plan === "elevate" ? 500 :
              plan === "unite" ? 1000 :
              50; // Explore free
            const extra = user?.subscription?.extraAiReplies || 0;
            const totalLimit = baseLimit + extra;
            const used = user?.subscription?.aiRepliesUsed || 0;
            const left = Math.max(0, totalLimit - used);
            const pct = Math.min(100, Math.round((used / (totalLimit || 1)) * 100));
            return (
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs flex items-center justify-between">
                <div className="flex flex-col">
                  <Link
                    to="/pricing"
                    className="text-xs font-medium text-slate-500 mb-1 flex items-center gap-1 hover:text-slate-700 transition"
                  >
                    AI replies left <FiExternalLink size={11} className="text-slate-400" />
                  </Link>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold text-slate-900">
                      {left.toLocaleString()}
                    </span>
                    <span className="text-xs font-medium text-slate-400">
                      / {totalLimit.toLocaleString()}
                    </span>
                  </div>
                  <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden" style={{ minWidth: 100 }}>
                    <div
                      className={`h-1.5 rounded-full transition-all ${pct >= 90 ? "bg-red-500" : pct >= 60 ? "bg-amber-400" : "bg-emerald-500"}`}
                      style={{ width: `${100 - pct}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-0.5">{pct}% used</span>
                </div>
                <div className="h-10 w-10 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center flex-shrink-0">
                  <FiZap size={16} />
                </div>
              </div>
            );
          })()}

          {/* Card 3: Total Secured Leads */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs font-medium text-slate-500 mb-1">
                Total secured leads
              </span>
              <span className="text-xl font-bold text-slate-900">
                {emails.filter((e) => e.leadStatus === "secured").length}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5">
                Secured & processed
              </span>
            </div>
            <div className="h-10 w-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
              <FiCheckCircle size={18} />
            </div>
          </div>

          {/* Card 4: Total Active Scenario */}
          {(() => {
            const plan = (user?.subscription?.plan || "Explore").toLowerCase();
            const activeLimit =
              plan === "elevate" ? 5 :
              plan === "unite" ? 15 :
              plan === "enterprise" ? 999 :
              1; // Explore free
            const activeCount = activeScenarios.length;
            const pct = activeLimit === 999 ? 0 : Math.min(100, Math.round((activeCount / activeLimit) * 100));
            return (
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs flex items-center justify-between">
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-xs font-medium text-slate-500 mb-1">
                    Active scenarios
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold text-slate-900">
                      {activeCount}
                    </span>
                    <span className="text-xs font-medium text-slate-400">
                      / {activeLimit === 999 ? "∞" : activeLimit}
                    </span>
                  </div>
                  <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden" style={{ minWidth: 100 }}>
                    <div
                      className={`h-1.5 rounded-full transition-all ${pct >= 100 ? "bg-red-500" : pct >= 60 ? "bg-amber-400" : "bg-emerald-500"}`}
                      style={{ width: activeLimit === 999 ? "20%" : `${pct}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-0.5 capitalize">{user?.subscription?.plan || "Explore"} plan</span>
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/pricing")}
                  className="ml-3 flex-shrink-0 rounded-[8px] bg-black hover:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white transition cursor-pointer"
                >
                  Upgrade
                </button>
              </div>
            );
          })()}
        </div>

        {/* ----------------------------------------------------------- */}
        {/* HERO BANNER & ACTION AREA */}
        {/* ----------------------------------------------------------- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Action Box (2 Columns) */}
          {recentScenarios.length === 0 ? (
            <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-8 flex flex-col items-center justify-center text-center shadow-xs">
              <div className="h-12 w-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center mb-4">
                <FiPlus size={24} />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">
                Create scenario from scratch
              </h2>
              <p className="text-xs text-slate-500 max-w-md mb-6 leading-relaxed">
                Connect your email account, build automated lead response flows, and turn raw directory inquiries into qualified clients.
              </p>
              <button
                type="button"
                onClick={() => navigate("/scenarios/others")}
                className="rounded-[8px] bg-black hover:bg-slate-800 px-5 py-2.5 text-xs font-semibold text-white transition cursor-pointer shadow-sm flex items-center gap-2"
              >
                <FiPlus size={16} />
                <span>Create Scenario</span>
              </button>
            </div>
          ) : (
            <div className="lg:col-span-2 flex flex-col gap-4">
              <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs transition hover:border-slate-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      S
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-slate-900 leading-tight">
                        Configured Scenarios
                      </h2>
                      <p className="text-xs text-slate-500 font-normal mt-0.5">
                        Active workflow automations
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate("/scenarios/others")}
                    className="rounded-[8px] bg-black hover:bg-slate-800 px-3.5 py-1.5 text-xs font-semibold text-white transition cursor-pointer shadow-2xs flex items-center gap-1.5"
                  >
                    <FiPlus size={14} />
                    <span>Create scenario</span>
                  </button>
                </div>

                <div className="flex flex-col gap-3">
                  {recentScenarios.map((sc) => (
                    <div
                      key={sc._id}
                      onClick={() =>
                        navigate(
                          sc.type === "shopify"
                            ? `/scenarios/shopify/${sc._id}`
                            : `/scenarios/others/${sc._id}`
                        )
                      }
                      className="group rounded-2xl border border-slate-200/80 bg-white p-4 transition-all duration-200 hover:border-slate-300 hover:shadow-xs cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="h-10 w-10 rounded-xl bg-slate-100 border border-slate-200/60 text-slate-700 flex items-center justify-center shrink-0">
                          <FiMail size={18} />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-bold text-slate-900 truncate group-hover:text-black transition">
                            {sc.name || "Unnamed Scenario"}
                          </span>
                          <span className="text-xs text-slate-400 mt-0.5 font-medium truncate">
                            {sc.description ? sc.description.substring(0, 60) + (sc.description.length > 60 ? "..." : "") : (sc.type === "shopify" ? "Shopify automation" : "Custom automation")}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-5 shrink-0 self-end sm:self-auto">
                        <div className="flex items-end gap-1 h-6 px-1 py-0.5">
                          <div className="w-1 bg-slate-200 rounded-full h-2 group-hover:bg-slate-400 transition" />
                          <div className="w-1 bg-slate-300 rounded-full h-4 group-hover:bg-slate-500 transition" />
                          <div className="w-1 bg-slate-200 rounded-full h-3 group-hover:bg-slate-400 transition" />
                          <div className="w-1 bg-slate-400 rounded-full h-5 group-hover:bg-slate-700 transition" />
                          <div className="w-1 bg-slate-200 rounded-full h-3 group-hover:bg-slate-400 transition" />
                        </div>

                        {sc.scenarioActive === true ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 px-3 py-1 text-xs font-semibold text-emerald-700">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                            </span>
                            Live
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500">
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                            Paused
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Right Educational Hero Box */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 text-white p-6 flex flex-col justify-between shadow-xs relative overflow-hidden group">
            <div className="z-10">
              <div className="h-10 w-10 rounded-[8px] bg-black text-white border border-slate-700 flex items-center justify-center mb-4 shadow-sm">
                <FiZap size={20} />
              </div>
              <h3 className="text-base font-bold text-white mb-1">
                Intelligent Email Automation
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Route incoming lead inquiries, match active templates, and generate Gemini AI replies automatically.
              </p>
            </div>

            <Link
              to="/scenarios/others"
              className="z-10 inline-flex items-center gap-1.5 text-xs font-bold text-white hover:text-slate-200 transition mt-6"
            >
              <span>Learn about types of scenarios</span>
              <FiArrowUpRight size={14} />
            </Link>
          </div>
        </div>

        {/* ----------------------------------------------------------- */}
        {/* RECENT SCENARIOS & SYSTEM ACTIVITY */}
        {/* ----------------------------------------------------------- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Scenarios Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900">
                Recent Scenarios
              </h3>
              <Link
                to="/scenarios/others"
                className="text-xs font-bold text-slate-900 hover:underline"
              >
                View all
              </Link>
            </div>

            {scenariosLoading ? (
              <div className="py-8 text-center text-xs text-slate-400 animate-pulse">
                Loading scenarios...
              </div>
            ) : recentScenarios.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                No scenarios created yet.
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-slate-100">
                {recentScenarios.map((sc) => (
                  <div
                    key={sc._id}
                    onClick={() =>
                      navigate(
                        sc.type === "shopify"
                          ? `/scenarios/shopify/${sc._id}`
                          : `/scenarios/others/${sc._id}`
                      )
                    }
                    className="py-3 flex items-center justify-between cursor-pointer hover:bg-slate-50 px-2 rounded-lg transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-slate-100 text-slate-900 flex items-center justify-center font-bold text-xs">
                        {sc.type === "shopify" ? "S" : "C"}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-slate-800">
                          {sc.name || "Unnamed Scenario"}
                        </span>
                        <span className="text-[10px] text-slate-400 capitalize">
                          {sc.type === "shopify" ? "Shopify" : "Custom"} Scenario
                        </span>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 text-[10px] rounded-full font-semibold ${
                        sc.scenarioActive === true
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {sc.scenarioActive === true ? "Active" : "Paused"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Email Activity Log Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900">
                Live Lead Ingestion Activity
              </h3>
              <Link
                to="/inbox"
                className="text-xs font-bold text-slate-900 hover:underline"
              >
                Go to Inbox
              </Link>
            </div>

            {loading ? (
              <div className="py-8 text-center text-xs text-slate-400 animate-pulse">
                Fetching activity...
              </div>
            ) : emails.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                No email leads processed yet.
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-slate-100">
                {emails.slice(0, 5).map((em) => (
                  <div
                    key={em._id}
                    onClick={() => navigate("/inbox")}
                    className="py-3 flex items-center justify-between cursor-pointer hover:bg-slate-50 px-2 rounded-lg transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-8 w-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                        {(em.latestSenderAddress || em.senderAddress || em.forwardedMeta?.from || "C")
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-semibold text-slate-800 truncate">
                          {em.subject || em.latestSubject || "No Subject"}
                        </span>
                        <span className="text-[10px] text-slate-400 truncate">
                          From: {em.latestSenderAddress || em.senderAddress || em.forwardedMeta?.from || "Unknown"}
                        </span>
                      </div>
                    </div>

                    <span className={`px-2.5 py-0.5 text-[10px] rounded-full font-semibold shrink-0 ${
                      em.leadStatus === "secured"
                        ? "bg-green-100 text-green-700"
                        : em.leadStatus === "closed"
                        ? "bg-red-100 text-red-700"
                        : "bg-slate-100 text-slate-900"
                    }`}>
                      {em.leadStatus === "secured" ? "Secured" : em.leadStatus === "closed" ? "Closed" : "Active"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      )}
    </AppLayout>
  );
};

export default Organization;

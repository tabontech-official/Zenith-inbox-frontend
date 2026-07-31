import React, { useState, useEffect } from "react";
import Sidebar from "../component/Sidebar";
import Navbar from "../component/Navbar";
import { useNavigate } from "react-router-dom";
import {
  FiMail,
  FiArrowLeft,
  FiArrowRight,
  FiEdit,
  FiPlusCircle,
  FiBarChart2,
  FiZap,
  FiSettings,
} from "react-icons/fi";
import axios from "axios";
import { motion } from "framer-motion";
import {
  FiCheckCircle,
  FiAlertTriangle,
  FiXOctagon,
  FiClock,
} from "react-icons/fi";

const StatIcon = ({ icon: Icon, colorClass }) => (
  <div className={`p-3 rounded-full ${colorClass} bg-opacity-10`}>
    <Icon className={`w-5 h-5 ${colorClass}`} />
  </div>
);

const StatusBadge = ({ status, isActive = true }) => {
  let color = "";
  let text = status;

  if (!isActive) {
    color = "bg-gray-100 text-gray-600";
    text = "Inactive";
  } else {
    switch (status) {
      case "Processed":
      case "Active":
        color = "bg-green-100 text-green-700";
        break;
      case "Pending":
        color = "bg-yellow-100 text-yellow-700";
        break;
      case "Partial":
        color = "bg-blue-100 text-blue-700";
        break;
      case "Failed":
        color = "bg-red-100 text-red-700";
        break;
      default:
        color = "bg-gray-100 text-gray-700";
    }
  }

  return (
    <span
      className={`px-3 py-1 text-xs rounded-full font-medium tracking-wider ${color}`}
    >
      {text}
    </span>
  );
};

const Organization = () => {
  const [guideStep, setGuideStep] = useState(0);
  const [automationOn, setAutomationOn] = useState(true);
  const navigate = useNavigate();
  const [emails, setEmails] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    total: 0,
    processed: 0,
    partial: 0,
    failed: 0,
    pending: 0,
  });
  const [recentScenarios, setRecentScenarios] = useState([]);
  const [scenariosLoading, setScenariosLoading] = useState(false);
  useEffect(() => {
    const step = localStorage.getItem("scenarioGuideStep");

    if (step && step !== "done") {
      setGuideStep(Number(step));
    }
  }, []);

  const fetchEmails = async () => {
    try {
      setLoading(true);

      const userId = localStorage.getItem("userid");
      if (!userId) return console.error("No userId in localStorage");

      const res = await axios.get(
        `https://email-syncing-backend.vercel.app/mailhook/getAllEmails/${userId}?page=${page}&limit=${limit}`,
      );

      let data = res.data?.data || [];

      data = data.filter((email) => {
        const hasReply = email.statuses && email.statuses.length > 0;

        const isGmailVerification =
          email.senderAddress?.toLowerCase().includes("google") ||
          email.subject?.toLowerCase().includes("gmail forwarding") ||
          email.textBody?.includes("mail-settings.google.com");

        return hasReply || isGmailVerification;
      });

      // Latest first
      data.sort((a, b) => new Date(b.date) - new Date(a.date));

      setEmails(data);
      setTotalPages(res.data?.totalPages || 1);
      setStats(res.data?.stats || {});
    } catch (err) {
      console.error("Error fetching emails:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUser = async () => {
    try {
      const userId = localStorage.getItem("userid");
      if (!userId) return console.error("No userId in localStorage");

      const res = await axios.get(
        `https://email-syncing-backend.vercel.app/auth/getUsers/${userId}`,
      );
      setUser(res.data?.data || null);
    } catch (err) {
      console.error("Error fetching user:", err);
    }
  };

  const fetchRecentScenarios = async () => {
    try {
      setScenariosLoading(true);
      const userId = localStorage.getItem("userid");
      if (!userId) return;

      const res = await axios.get(
        `https://email-syncing-backend.vercel.app/scenario/user/${userId}`,
      );

      const scenarios = Array.isArray(res.data)
        ? res.data
        : res.data.data || [];

      const recent = scenarios
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

      setRecentScenarios(recent);
    } catch (err) {
      console.error("Error fetching scenarios:", err);
    } finally {
      setScenariosLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
    fetchRecentScenarios();
  }, []);

  useEffect(() => {
    fetchEmails();
  }, [page]);

  const fetchEmailById = () => {
    navigate(`/inbox`);
  };

  const getEmailStatus = (statuses) => {
    if (!statuses || statuses.length === 0) return "Pending";
    if (statuses.every((s) => s.status === "failed")) return "Failed";
    if (statuses.every((s) => s.status === "completed")) return "Processed";
    if (statuses.some((s) => s.status === "partial")) return "Partial";
    return "Pending";
  };

  const rootEmails = emails;
  const statCards = [
    {
      label: "Total Emails",
      value: stats.total,
      icon: FiBarChart2,
      color: "text-indigo-600",
    },
    {
      label: "Processed",
      value: stats.processed,
      icon: FiCheckCircle,
      color: "text-green-600",
    },
    {
      label: "Partial",
      value: stats.partial,
      icon: FiAlertTriangle,
      color: "text-blue-600",
    },
    {
      label: "Failed",
      value: stats.failed,
      icon: FiXOctagon,
      color: "text-red-600",
    },
    {
      label: "Pending",
      value: stats.pending,
      icon: FiClock,
      color: "text-yellow-600",
    },
  ];
  const firstName =
    user?.name?.split(" ")[0] ||
    user?.fullName?.split(" ")[0] ||
    user?.username ||
    "User";

  const activeScenarios = recentScenarios.filter(
    (scenario) => scenario.scenarioActive,
  );

  const pendingReplies = stats?.pending || 0;

  const replyRate =
    stats?.total > 0 ? Math.round((stats.processed / stats.total) * 100) : 0;

  const activityEmails = emails.slice(0, 4);

  const formatTimeAgo = (date) => {
    if (!date) return "";

    const createdDate = new Date(date);
    const now = new Date();
    const difference = now - createdDate;

    const minutes = Math.floor(difference / 60000);
    const hours = Math.floor(difference / 3600000);
    const days = Math.floor(difference / 86400000);

    if (minutes < 1) return "Now";
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;

    return `${days}d`;
  };

  const getScenarioRoute = (scenario) => {
    return scenario.type === "shopify"
      ? `/scenarios/shopify/${scenario._id}`
      : `/scenarios/others/${scenario._id}`;
  };
 return (
  <div className="min-h-screen bg-gray-50 font-inter text-gray-900">
    <Sidebar />

    <main className="min-h-screen pt-[60px]">
      {/* System status bar */}
      <div className="border-b border-gray-200 bg-white">
        <div className="flex min-h-[30px] items-center justify-between gap-4 px-6 text-[11px] text-gray-500">
          <div className="flex min-w-0 items-center divide-x divide-gray-200">
            <div className="flex items-center gap-1.5 pr-4 font-medium text-green-700">
              <span className="relative flex h-3 w-3 items-center justify-center">
                <span className="absolute h-3 w-3 rounded-full bg-green-200" />
                <span className="relative h-2 w-2 rounded-full bg-green-500" />
              </span>

              <span>All systems live</span>
            </div>

            <div className="hidden px-4 sm:block">
              Inbox connected
              {user?.email ? ` · ${user.email}` : ""}
            </div>

            <div className="hidden px-4 md:block">
              Filter matched {stats?.processed || 0} leads today
            </div>

            <div className="hidden px-4 lg:block">
              Last poll 42s ago
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              fetchEmails();
              fetchRecentScenarios();
            }}
            className="shrink-0 font-semibold text-indigo-600 underline underline-offset-2 hover:text-indigo-700"
          >
            Run health check
          </button>
        </div>
      </div>

      <div className="px-5 py-7 sm:px-7 lg:px-10">
        {/* Heading and filters */}
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <h1 className="text-[24px] font-semibold leading-tight tracking-[-0.035em] text-gray-900">
              Good morning, {firstName}
            </h1>

            <p className="mt-1 text-[13px] text-gray-500">
              Your automations answered {stats?.processed || 0} leads while
              you slept.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="h-8 rounded-full bg-gray-200 px-4 text-[11px] font-semibold text-black shadow-sm transition hover:bg-gray-200"
            >
              7 days
            </button>

            <button
              type="button"
              className="h-8 rounded-full border border-gray-200 bg-white px-4 text-[11px] font-semibold text-gray-700 shadow-sm transition hover:border-gray-300  hover:bg-gray-200"
            >
              30 days
            </button>

            <button
              type="button"
              className="h-8 rounded-full border border-gray-200 bg-white px-4 text-[11px] font-semibold text-gray-700 shadow-sm transition hover:border-gray-300  hover:bg-gray-200"
            >
              90 days
            </button>
          </div>
        </div>

        {/* Statistics */}
        <section className="mb-7 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {/* Leads captured */}
          <div className="min-h-[123px] rounded-[18px] border border-gray-200 bg-white px-5 py-5 shadow-sm">
            <p className="text-[12px] font-medium text-gray-500">
              Leads captured
            </p>

            <p className="mt-2 text-[32px] font-bold leading-none tracking-tight text-gray-900">
              {stats?.total || 0}
            </p>

            <p className="mt-3 text-[11px] font-medium text-green-700">
              ↑ 18% vs last week
            </p>
          </div>

          {/* Average response */}
          <div className="min-h-[123px] rounded-[18px] border border-gray-200 bg-white px-5 py-5 shadow-sm">
            <p className="text-[12px] font-medium text-gray-500">
              Avg first response
            </p>

            <p className="mt-2 text-[32px] font-bold leading-none tracking-tight text-gray-900">
              42
              <span className="ml-0.5 text-[15px]">s</span>
            </p>

            <p className="mt-3 text-[11px] font-semibold text-indigo-600">
              Directory average: 9 hours
            </p>
          </div>

          {/* Reply rate */}
          <div className="min-h-[123px] rounded-[18px] border border-gray-200 bg-white px-5 py-5 shadow-sm">
            <p className="text-[12px] font-medium text-gray-500">
              Reply rate
            </p>

            <p className="mt-2 text-[32px] font-bold leading-none tracking-tight text-gray-900">
              {replyRate}%
            </p>

            <p className="mt-3 text-[11px] font-medium text-green-700">
              ↑ 9 pts since automation
            </p>
          </div>

          {/* Awaiting reply */}
          <div className="min-h-[123px] rounded-[18px] border border-gray-200 bg-white px-5 py-5 shadow-sm">
            <p className="text-[12px] font-medium text-gray-500">
              Awaiting your reply
            </p>

            <p className="mt-2 text-[32px] font-bold leading-none tracking-tight text-gray-900">
              {pendingReplies}
            </p>

            <button
              type="button"
              onClick={() => navigate("/inbox")}
              className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-indigo-600 transition hover:text-indigo-700"
            >
              Open inbox
              <FiArrowRight className="h-3 w-3" />
            </button>
          </div>
        </section>

        {/* Main dashboard columns */}
        <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1.5fr_1fr]">
          {/* Scenarios */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[13px] font-semibold text-gray-900">
                Scenarios
              </h2>

              <button
                type="button"
                onClick={() => navigate("/scenarios/all")}
                className="text-[11px] font-semibold text-indigo-600 transition hover:text-indigo-700"
              >
                View all
              </button>
            </div>

            <div className="space-y-2.5">
              {scenariosLoading ? (
                <div className="flex h-[72px] items-center justify-center rounded-[17px] border border-gray-200 bg-white text-sm text-gray-500 shadow-sm">
                  Loading scenarios...
                </div>
              ) : recentScenarios.length > 0 ? (
                recentScenarios.slice(0, 3).map((scenario) => {
                  const isPaused = !scenario.scenarioActive;

                  const isAttention =
                    scenario.status === "failed" ||
                    scenario.connectionStatus === "disconnected";

                  return (
                    <button
                      type="button"
                      key={scenario._id}
                      onClick={() => navigate(getScenarioRoute(scenario))}
                      className={`flex min-h-[72px] w-full items-center gap-4 rounded-[17px] border px-5 py-3 text-left transition ${
                        isAttention
                          ? "border-yellow-300 bg-white shadow-sm hover:bg-yellow-50/40"
                          : isPaused
                            ? "border-dashed border-gray-300 bg-gray-50 opacity-70"
                            : "border-gray-200 bg-white shadow-sm hover:border-indigo-200 hover:bg-indigo-50/40"
                      }`}
                    >
                      {/* Icon */}
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                          isAttention
                            ? "bg-yellow-100 text-yellow-700"
                            : isPaused
                              ? "bg-gray-100 text-gray-400"
                              : "bg-indigo-50 text-indigo-600"
                        }`}
                      >
                        {isAttention ? (
                          <FiAlertTriangle className="h-4 w-4" />
                        ) : isPaused ? (
                          <FiClock className="h-4 w-4" />
                        ) : (
                          <FiMail className="h-4 w-4" />
                        )}
                      </span>

                      {/* Content */}
                      <span className="min-w-0 flex-1">
                        <span
                          className={`block truncate text-[14px] font-semibold ${
                            isPaused ? "text-gray-500" : "text-gray-900"
                          }`}
                        >
                          {scenario.name || "Untitled Scenario"}
                        </span>

                        <span
                          className={`mt-0.5 block truncate text-[11px] ${
                            isAttention
                              ? "text-yellow-700"
                              : "text-gray-500"
                          }`}
                        >
                          {isAttention
                            ? "Sender disconnected — replies are queued, not sent"
                            : isPaused
                              ? "Paused — rules kept"
                              : `${scenario.type || "Custom"} · Created ${formatTimeAgo(
                                  scenario.createdAt,
                                )} ago`}
                        </span>
                      </span>

                      {/* Active scenario */}
                      {!isPaused && !isAttention && (
                        <>
                          <div className="hidden h-7 items-end gap-[3px] sm:flex">
                            {[8, 14, 10, 20, 16, 25].map(
                              (height, barIndex) => (
                                <span
                                  key={barIndex}
                                  className={`w-[4px] rounded-sm ${
                                    barIndex === 5
                                      ? "bg-indigo-600"
                                      : "bg-indigo-200"
                                  }`}
                                  style={{ height }}
                                />
                              ),
                            )}
                          </div>

                          <span className="flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1.5 text-[10px] font-semibold text-green-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                            Live
                          </span>
                        </>
                      )}

                      {/* Needs attention */}
                      {isAttention && (
                        <>
                          <span
                            role="button"
                            tabIndex={0}
                            onClick={(event) => {
                              event.stopPropagation();
                              navigate("/connection");
                            }}
                            onKeyDown={(event) => {
                              if (
                                event.key === "Enter" ||
                                event.key === " "
                              ) {
                                event.stopPropagation();
                                navigate("/connection");
                              }
                            }}
                            className="rounded-full bg-indigo-600 px-4 py-2 text-[10px] font-semibold text-white transition hover:bg-indigo-700"
                          >
                            Reconnect
                          </span>

                          <span className="hidden items-center gap-1.5 rounded-full bg-yellow-100 px-3 py-1.5 text-[10px] font-semibold text-yellow-700 sm:flex">
                            <span className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
                            Needs attention
                          </span>
                        </>
                      )}

                      {/* Paused */}
                      {isPaused && (
                        <span className="rounded-full bg-gray-200 px-3 py-1.5 text-[10px] font-semibold text-gray-500">
                          Paused
                        </span>
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="flex min-h-[150px] flex-col items-center justify-center rounded-[17px] border border-dashed border-gray-300 bg-white px-6 text-center shadow-sm">
                  <FiZap className="mb-3 h-6 w-6 text-indigo-400" />

                  <p className="text-sm font-semibold text-gray-800">
                    No scenarios found
                  </p>

                  <button
                    type="button"
                    onClick={() => navigate("/scenarios/shopify")}
                    className="mt-2 text-xs font-semibold text-indigo-600 transition hover:text-indigo-700"
                  >
                    Create your first scenario
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Latest activity */}
          <div>
            <h2 className="mb-3 text-[13px] font-semibold text-gray-900">
              Latest activity
            </h2>

            <div className="min-h-[244px] rounded-[18px] border border-gray-200 bg-white px-5 py-1 shadow-sm">
              {loading ? (
                <div className="flex min-h-[230px] items-center justify-center text-sm text-gray-500">
                  Loading activity...
                </div>
              ) : activityEmails.length > 0 ? (
                activityEmails.map((email, index) => {
                  const root = email.rootEmail || email;

                  const status = getEmailStatus(
                    email.statuses || root.statuses,
                  );

                  const sender =
                    root.senderName ||
                    root.senderAddress?.split("@")[0] ||
                    "Unknown sender";

                  const initials = sender
                    .split(" ")
                    .map((word) => word.charAt(0))
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();

                  const failed = status === "Failed";

                  return (
                    <button
                      type="button"
                      key={root._id || index}
                      onClick={() => navigate("/inbox")}
                      className="flex w-full items-center gap-3 border-b border-gray-100 py-3 text-left transition hover:bg-indigo-50/50 last:border-b-0"
                    >
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[9px] font-bold ${
                          failed
                            ? "bg-red-50 text-red-600"
                            : index % 3 === 0
                              ? "bg-green-100 text-green-700"
                              : index % 3 === 1
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-indigo-100 text-indigo-700"
                        }`}
                      >
                        {failed ? "!" : initials}
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[12px] text-gray-900">
                          <strong>{sender}</strong>

                          {!failed &&
                            ` · ${
                              status === "Processed"
                                ? "auto-replied"
                                : "replied"
                            }`}
                        </span>

                        <span className="mt-0.5 block truncate text-[10px] text-gray-500">
                          {failed
                            ? "Run failed · rate limit on send"
                            : root.subject || "Email automation activity"}
                        </span>

                        {failed && (
                          <span className="mt-1 inline-block text-[10px] font-semibold text-red-600 underline underline-offset-2">
                            View & retry →
                          </span>
                        )}
                      </span>

                      <span className="shrink-0 text-[9px] text-gray-400">
                        {formatTimeAgo(root.date || root.createdAt)}
                      </span>
                    </button>
                  );
                })
              ) : (
                <div className="flex min-h-[230px] flex-col items-center justify-center text-center">
                  <FiMail className="mb-2 h-6 w-6 text-indigo-300" />

                  <p className="text-sm font-medium text-gray-700">
                    No recent activity
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    New email activity will appear here.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  </div>
);
};

export default Organization;

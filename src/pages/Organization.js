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
  FiBarChart2, // Changed FiInbox for a more dashboard/stat feel
  FiZap, // Added for quick actions
  FiSettings, // Added for automation switch
} from "react-icons/fi";
import axios from "axios";
import { motion } from "framer-motion";
import { FiCheckCircle, FiAlertTriangle, FiXOctagon, FiClock } from "react-icons/fi";

// Helper component for Stat Card Icons
const StatIcon = ({ icon: Icon, colorClass }) => (
  <div className={`p-3 rounded-full ${colorClass} bg-opacity-10`}>
    <Icon className={`w-5 h-5 ${colorClass}`} />
  </div>
);

// Helper component for Status Badge
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

  // --- API Calls (kept the same logic) ---

  const fetchEmails = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem("userid");
      if (!userId) return console.error("No userId in localStorage");

      const res = await axios.get(
        `http://localhost:5000/mailhook/getAllEmails/${userId}?page=${page}&limit=${limit}`
      );

      setEmails(res.data?.data || []);
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
        `http://localhost:5000/auth/getUsers/${userId}`
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
        `http://localhost:5000/scenario/user/${userId}`
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const fetchEmailById = () => {
    // Navigating to general inbox for now as _id is not used directly here
    navigate(`/inbox`);
  };

  const getEmailStatus = (statuses) => {
    if (!statuses || statuses.length === 0) return "Pending";
    if (statuses.every((s) => s.status === "failed")) return "Failed";
    if (statuses.every((s) => s.status === "completed")) return "Processed";
    if (statuses.some((s) => s.status === "partial")) return "Partial";
    return "Pending";
  };

  const rootEmails = emails.filter((e) => !e.isForwarded && !e.parentEmailId);

  // Enhanced Stat Cards with Icons and colors
  const statCards = [
    { label: "Total Emails", value: stats.total, icon: FiBarChart2, color: "text-indigo-600" },
    { label: "Processed", value: stats.processed, icon: FiCheckCircle, color: "text-green-600" },
    { label: "Partial", value: stats.partial, icon: FiAlertTriangle, color: "text-blue-600" },
    { label: "Failed", value: stats.failed, icon: FiXOctagon, color: "text-red-600" },
    { label: "Pending", value: stats.pending, icon: FiClock, color: "text-yellow-600" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 font-inter">
      <Sidebar />

      <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300">
        <div className="hidden sm:block">
          <Navbar />
        </div>

        <main className="flex-1 p-6 sm:p-10 overflow-auto">
          <motion.div
            className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 sm:mb-10"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div>
              <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
                Dashboard
              </h1>
              <p className="text-gray-500 mt-1 text-base">
                Comprehensive overview of your email automation workflow.
              </p>
            </div>
          
          </motion.div>

          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
            {statCards.map((item, i) => (
              <motion.div
                key={i}
                className="p-6 rounded-2xl shadow-lg transition-all transform hover:-translate-y-1 hover:shadow-xl bg-white border border-gray-200"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i, duration: 0.4 }}
              >
                <div className="flex justify-between items-start">
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                    {item.label}
                  </p>
                  <StatIcon icon={item.icon} colorClass={item.color} />
                </div>
                <h2 className="text-4xl font-bold mt-3 text-gray-900 leading-none">
                  {item.value}
                </h2>
              </motion.div>
            ))}
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Scenarios and Recent Emails on a single large panel */}
            <motion.div
              className="lg:col-span-2 space-y-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {/* Recent Scenarios Table */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <div className="flex justify-between items-center pb-4 border-b border-gray-100 mb-4">
                  <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                    <FiZap className="text-indigo-600 w-5 h-5" /> Recent Scenarios
                  </h3>
                  <button
                    onClick={() => navigate("/scenarios/all")}
                    className="text-sm text-indigo-600 font-semibold hover:text-indigo-500 transition flex items-center gap-1"
                  >
                    View All <FiArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-xs font-semibold uppercase text-gray-500 border-b border-gray-100">
                      <tr>
                        <th className="py-3 px-3 text-left">Scenario Name</th>
                        <th className="py-3 px-3 text-left">Type</th>
                        <th className="py-3 px-3 text-left">Status</th>
                        <th className="py-3 px-3 text-left">Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scenariosLoading ? (
                        <tr>
                          <td
                            colSpan={4}
                            className="py-8 text-center text-gray-500"
                          >
                            Loading scenarios...
                          </td>
                        </tr>
                      ) : recentScenarios.length > 0 ? (
                        recentScenarios.map((s, i) => (
                          <motion.tr
                            key={s._id}
                            className="border-b border-gray-100 last:border-none hover:bg-indigo-50 transition duration-150 cursor-pointer"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.05 * i, duration: 0.3 }}
                            onClick={() =>
                              navigate(
                                s.type === "shopify"
                                  ? `/scenarios/shopify/${s._id}`
                                  : `/scenarios/others/${s._id}`
                              )
                            }
                          >
                            <td className="py-4 px-3 font-medium text-gray-900">
                              {s.name || "Untitled Scenario"}
                            </td>
                            <td className="py-4 px-3 capitalize text-gray-600">
                              {s.type || "N/A"}
                            </td>
                            <td className="py-4 px-3">
                              <StatusBadge
                                status="Active"
                                isActive={s.scenarioActive}
                              />
                            </td>
                            <td className="py-4 px-3 text-gray-500 whitespace-nowrap">
                              {new Date(s.createdAt).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </td>
                          </motion.tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={4}
                            className="py-8 text-center text-gray-400 italic"
                          >
                            No recent scenarios found. Create one to get started!
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800 pb-4 border-b border-gray-100">
                  <FiMail className="text-indigo-600 w-5 h-5" /> Recent Emails
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-xs font-semibold uppercase text-gray-500 border-b border-gray-100">
                      <tr>
                        <th className="py-3 px-3 text-left w-1/4">From</th>
                        <th className="py-3 px-3 text-left w-2/4">Subject</th>
                        <th className="py-3 px-3 text-left w-1/4">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td
                            colSpan={3}
                            className="py-8 text-center text-gray-500"
                          >
                            Loading emails...
                          </td>
                        </tr>
                      ) : rootEmails.length > 0 ? (
                        rootEmails.map((email, i) => {
                          const root = email.rootEmail || email;
                          const status = getEmailStatus(
                            email.statuses || root.statuses
                          );

                          return (
                            <motion.tr
                              key={i}
                              onClick={() => fetchEmailById(root._id)}
                              className="border-b border-gray-100 last:border-none hover:bg-indigo-50 transition duration-150 cursor-pointer"
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.1 * i, duration: 0.5 }}
                            >
                              <td className="py-4 px-3 font-medium text-gray-900">
                                {root.senderAddress || "N/A"}
                              </td>
                              <td className="py-4 px-3 text-gray-600 truncate max-w-xs">
                                {root.subject || "No Subject"}
                              </td>
                              <td className="py-4 px-3">
                                <StatusBadge status={status} isActive={true} />
                              </td>
                            </motion.tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td
                            colSpan={3}
                            className="py-8 text-center text-gray-400 italic"
                          >
                            No recent emails found in your inbox.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                    className={`flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm ${
                      page === 1
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                    }`}
                  >
                    <FiArrowLeft className="w-4 h-4" /> Previous
                  </button>

                  <span className="text-gray-600 text-sm font-medium">
                    Page {page} of {totalPages}
                  </span>

                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                    className={`flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm ${
                      page === totalPages
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                    }`}
                  >
                    Next <FiArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Quick Actions Panel */}
            <motion.div
              className="lg:col-span-1 bg-white rounded-2xl shadow-lg border border-gray-200 p-6 h-fit sticky top-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h3 className="text-xl font-semibold mb-5 text-gray-800 flex items-center gap-2 border-b pb-4 border-gray-100">
                <FiZap className="text-indigo-600 w-5 h-5" /> Quick Actions
              </h3>
              <div className="flex flex-col space-y-4">
                <button
                  onClick={() => navigate("/connection")}
                  className="flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition transform hover:-translate-y-px shadow-md shadow-indigo-200"
                >
                  <FiMail className="w-5 h-5" /> Connect New Inbox
                </button>
                <button
                  onClick={() => navigate("/templates")}
                  className="flex items-center justify-center gap-2 bg-white text-gray-700 py-3 rounded-xl font-medium border border-gray-300 hover:bg-gray-50 transition"
                >
                  <FiEdit className="w-5 h-5" /> Manage Templates
                </button>
                <button
                  onClick={() => navigate("/scenarios/others")}
                  className="flex items-center justify-center gap-2 bg-white text-gray-700 py-3 rounded-xl font-medium border border-gray-300 hover:bg-gray-50 transition"
                >
                  <FiPlusCircle className="w-5 h-5" /> Create New Scenario
                </button>
              </div>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
};

// Add helper icons needed for the stat cards (must be imported or defined)

export default Organization;
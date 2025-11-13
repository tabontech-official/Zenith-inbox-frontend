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
  FiInbox,
} from "react-icons/fi";
import axios from "axios";
import { motion } from "framer-motion";

const Organization = () => {
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

  const fetchEmails = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem("userid");
      if (!userId) return console.error("No userId in localStorage");

      const res = await axios.get(
        `https://email-syncing-backend.vercel.app/mailhook/getAllEmails/${userId}?page=${page}&limit=${limit}`
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
        `https://email-syncing-backend.vercel.app/auth/getUsers/${userId}`
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
        `https://email-syncing-backend.vercel.app/scenario/user/${userId}`
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

  const fetchEmailById = (id) => {
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

  const statCards = [
    { label: "Total Emails", value: stats.total },
    { label: "Processed", value: stats.processed },
    { label: "Partial", value: stats.partial },
    { label: "Failed", value: stats.failed },
    { label: "Pending", value: stats.pending },
  ];

 return (
  <div className="relative min-h-screen w-full font-inter">

    {/* 🌟 Background Video */}
    <video
      className="fixed inset-0 w-full h-full object-cover z-[-2]"
      src="https://cdn.shopify.com/videos/c/o/v/df08c454451b4622be7ffeb6d0eed475.mp4"
      autoPlay
      loop
      muted
      playsInline
    />

    {/* 🌑 Soft Overlay */}
    {/* <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[-1]" /> */}

    {/* MAIN PAGE LAYOUT */}
    <div className="flex min-h-screen">

      {/* SIDEBAR */}
      <Sidebar />

      {/* CONTENT AREA */}
      <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300">

        {/* NAVBAR */}
        <div className="hidden sm:block">
          <Navbar />
        </div>

        {/* MAIN BODY */}
      <main className="flex-1 p-6 sm:p-8 overflow-auto">

  {/* HEADER */}
  <motion.div
    className="flex flex-col sm:flex-row justify-between sm:items-center mb-10"
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <div>
      <h1 className="text-4xl font-semibold text-gray-900 tracking-tight">
        Dashboard
      </h1>
      <p className="text-gray-600 mt-1 text-sm">
        Overview of your email automation and performance
      </p>
    </div>
  </motion.div>

  {/* ⭐ STAT CARDS */}
  <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
    {statCards.map((item, i) => (
      <motion.div
        key={i}
        className="
          p-6 rounded-2xl
          bg-white/40 backdrop-blur-xl
          border border-white/60
          shadow-[0_8px_32px_rgba(0,0,0,0.25)]
          hover:bg-white/60
          transition transform hover:-translate-y-1
        "
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 * i, duration: 0.4 }}
      >
        <p className="text-sm font-medium text-gray-700">{item.label}</p>
        <h2 className="text-4xl font-semibold mt-2 text-gray-900">{item.value}</h2>
      </motion.div>
    ))}
  </section>

  {/* ⭐ RECENT SCENARIOS */}
  <motion.div
    className="
      rounded-2xl p-6 mb-10
      bg-white/40 backdrop-blur-xl
      border border-white/60
      shadow-[0_8px_32px_rgba(0,0,0,0.25)]
    "
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
  >
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
        <FiInbox className="text-indigo-600" /> Recent Scenarios
      </h3>

      <button
        onClick={() => navigate("/scenarios/all")}
        className="text-sm text-indigo-600 font-medium hover:underline"
      >
        View More →
      </button>
    </div>

    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-white/30 text-gray-700 border-b border-white/50">
          <tr>
            <th className="py-2 px-3 text-left">Scenario Name</th>
            <th className="py-2 px-3 text-left">Type</th>
            <th className="py-2 px-3 text-left">Status</th>
            <th className="py-2 px-3 text-left">Created</th>
          </tr>
        </thead>

        <tbody>
          {scenariosLoading ? (
            <tr>
              <td colSpan={4} className="py-8 text-center text-gray-600">
                Loading scenarios...
              </td>
            </tr>
          ) : recentScenarios.length > 0 ? (
            recentScenarios.map((s, i) => (
              <motion.tr
                key={s._id}
                className="
                  border-b border-white/40 
                  hover:bg-white/40 transition cursor-pointer
                "
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.05 * i, duration: 0.4 }}
                onClick={() =>
                  navigate(
                    s.type === "shopify"
                      ? `/scenarios/shopify/${s._id}`
                      : `/scenarios/others/${s._id}`
                  )
                }
              >
                <td className="py-3 px-3 font-semibold text-gray-900">{s.name}</td>
                <td className="py-3 px-3 capitalize text-gray-700">{s.type}</td>

                <td className="py-3 px-3">
                  {s.scenarioActive ? (
                    <span className="bg-green-100 text-green-700 px-3 py-1 text-xs rounded-full font-medium">
                      Active
                    </span>
                  ) : (
                    <span className="bg-red-100 text-red-700 px-3 py-1 text-xs rounded-full font-medium">
                      Inactive
                    </span>
                  )}
                </td>

                <td className="py-3 px-3 text-gray-600">
                  {new Date(s.createdAt).toLocaleDateString()}
                </td>
              </motion.tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} className="py-8 text-center text-gray-600 italic">
                No scenarios found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </motion.div>

  {/* ⭐ TWO COLUMN AREA */}
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

    {/* ⭐ RECENT EMAILS */}
    <motion.div
      className="
        lg:col-span-2 rounded-2xl p-6
        bg-white/40 backdrop-blur-xl
        border border-white/60
        shadow-[0_8px_32px_rgba(0,0,0,0.25)]
      "
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900">
        <FiInbox className="text-indigo-600" /> Recent Emails
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-white/30 text-gray-700 border-b border-white/50">
            <tr>
              <th className="py-2 px-3 text-left">From</th>
              <th className="py-2 px-3 text-left">Subject</th>
              <th className="py-2 px-3 text-left">Status</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={3} className="py-8 text-center text-gray-600">
                  Loading emails...
                </td>
              </tr>
            ) : rootEmails.length > 0 ? (
              rootEmails.map((email, i) => {
                const root = email.rootEmail || email;
                const status = getEmailStatus(email.statuses || root.statuses);

                const color =
                  status === "Processed"
                    ? "bg-green-100 text-green-700"
                    : status === "Pending"
                    ? "bg-yellow-100 text-yellow-700"
                    : status === "Partial"
                    ? "bg-blue-100 text-blue-700"
                    : status === "Failed"
                    ? "bg-red-100 text-red-700"
                    : "bg-gray-100 text-gray-700";

                return (
                  <motion.tr
                    key={i}
                    onClick={() => fetchEmailById(root._id)}
                    className="
                      border-b border-white/40 
                      hover:bg-white/40 transition cursor-pointer
                    "
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 * i, duration: 0.5 }}
                  >
                    <td className="py-3 px-3 font-semibold text-gray-900">
                      {root.senderAddress || "N/A"}
                    </td>

                    <td className="py-3 px-3 text-gray-700 truncate max-w-xs">
                      {root.subject || "No Subject"}
                    </td>

                    <td className="py-3 px-3">
                      <span className={`px-3 py-1 text-xs rounded-full font-medium ${color}`}>
                        {status}
                      </span>
                    </td>
                  </motion.tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={3} className="py-8 text-center text-gray-600 italic">
                  No recent emails found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="flex justify-between items-center mt-6 pt-4 border-t border-white/40">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          className={`
            flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium
            ${
              page === 1
                ? "bg-white/20 text-gray-400 cursor-not-allowed"
                : "bg-indigo-600 text-white hover:bg-indigo-700"
            }
          `}
        >
          <FiArrowLeft /> Prev
        </button>

        <span className="text-gray-700 text-sm">
          Page {page} of {totalPages}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          className={`
            flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium
            ${
              page === totalPages
                ? "bg-white/20 text-gray-400 cursor-not-allowed"
                : "bg-indigo-600 text-white hover:bg-indigo-700"
            }
          `}
        >
          Next <FiArrowRight />
        </button>
      </div>
    </motion.div>

    {/* ⭐ QUICK ACTIONS */}
    <motion.div
  className="
    rounded-2xl p-6
    bg-white/30 backdrop-blur-[20px]
    border border-white/60
    shadow-[0_8px_32px_rgba(0,0,0,0.15)]
  "
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.5 }}
>
  <h3 className="text-lg font-semibold mb-4 text-gray-900">
    Quick Actions
  </h3>

  <div className="flex flex-col space-y-3">

    {/* ⭐ Glass Button 1 */}
    <button
      onClick={() => navigate("/connection")}
      className="
        flex items-center justify-center gap-2
        px-4 py-2.5 rounded-full text-sm font-semibold
        text-gray-900
        bg-white/30
        border border-white/50
        backdrop-blur-xl
        shadow-[0_6px_20px_rgba(0,0,0,0.12)]
        transition-all duration-300
        hover:bg-white/40 hover:shadow-[0_8px_30px_rgba(0,0,0,0.18)]
      "
      style={{ WebkitBackdropFilter: "blur(12px)" }}
    >
      <FiMail className="text-indigo-600" />
      Connect Inbox
    </button>

    {/* ⭐ Glass Button 2 */}
    <button
      onClick={() => navigate("/templates")}
      className="
        flex items-center justify-center gap-2
        px-4 py-2.5 rounded-full text-sm font-semibold
        text-gray-900
        bg-white/30
        border border-white/50
        backdrop-blur-xl
        shadow-[0_6px_20px_rgba(0,0,0,0.12)]
        transition-all duration-300
        hover:bg-white/40 hover:shadow-[0_8px_30px_rgba(0,0,0,0.18)]
      "
      style={{ WebkitBackdropFilter: "blur(12px)" }}
    >
      <FiEdit className="text-indigo-600" />
      Edit Templates
    </button>

    {/* ⭐ Glass Button 3 */}
    <button
      onClick={() => navigate("/scenarios/others")}
      className="
        flex items-center justify-center gap-2
        px-4 py-2.5 rounded-full text-sm font-semibold
        text-gray-900
        bg-white/30
        border border-white/50
        backdrop-blur-xl
        shadow-[0_6px_20px_rgba(0,0,0,0.12)]
        transition-all duration-300
        hover:bg-white/40 hover:shadow-[0_8px_30px_rgba(0,0,0,0.18)]
      "
      style={{ WebkitBackdropFilter: "blur(12px)" }}
    >
      <FiPlusCircle className="text-indigo-600" />
      Create Scenario
    </button>

  </div>
</motion.div>


  </div>

</main>

      </div>

    </div>
  </div>
);


};

export default Organization;

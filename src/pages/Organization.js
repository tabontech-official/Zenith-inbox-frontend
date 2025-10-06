import React, { useState, useEffect } from "react";
import Sidebar from "../component/Sidebar";
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

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    fetchEmails();
  }, [page]);

  const fetchEmailById = async (id) => {
    navigate(`/organization/email/${id}`);
  };

  const getEmailStatus = (statuses) => {
    if (!statuses || statuses.length === 0) return "Pending";
    if (statuses.every((s) => s.status === "failed")) return "Failed";
    if (statuses.every((s) => s.status === "completed")) return "Processed";
    if (statuses.some((s) => s.status === "partial")) return "Partial";
    return "Pending";
  };

  const rootEmails = emails.filter((e) => !e.isForwarded && !e.parentEmailId);

  return (
    <div className="flex bg-gray-50 min-h-screen font-inter antialiased">
      <Sidebar />

      <main className="flex-1 md:ml-64 p-8 overflow-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>

          {/* Automation Toggle */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">
              Automation
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={automationOn}
                onChange={() => setAutomationOn(!automationOn)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 peer-checked:bg-[#4F46E5] rounded-full transition-all"></div>
              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-5 transition-transform"></div>
            </label>
            <span
              className={`text-sm font-semibold ${
                automationOn ? "text-green-600" : "text-gray-400"
              }`}
            >
              {automationOn ? "ON" : "OFF"}
            </span>
          </div>
        </div>

        {/* Stats Section */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
          {[
            { label: "New", value: stats.pending || 12 },
            { label: "Sent", value: stats.processed || 84 },
            { label: "Pending", value: stats.partial || 8 },
            { label: "Needs Review", value: stats.total || 3 },
            { label: "Failed", value: stats.failed || 1 },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-white shadow rounded-lg p-6 text-center hover:shadow-md transition"
            >
              <p className="text-gray-500 text-sm mb-1">{item.label}</p>
              <h2 className="text-3xl font-bold text-gray-900">{item.value}</h2>
            </div>
          ))}
        </section>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Emails Table */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FiInbox className="text-[#4F46E5]" /> Recent Emails
            </h3>

            <table className="w-full text-sm">
              <thead className="text-left border-b text-gray-500">
                <tr>
                  <th className="pb-2">From</th>
                  <th className="pb-2">Subject</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-gray-500">
                      Loading emails...
                    </td>
                  </tr>
                ) : rootEmails.length > 0 ? (
                  rootEmails.map((email, i) => {
                    const root = email.rootEmail || email;
                    const status = getEmailStatus(email.statuses || root.statuses);
                    const color =
                      status === "Processed"
                        ? "bg-indigo-100 text-indigo-700"
                        : status === "Pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : status === "Partial"
                        ? "bg-blue-100 text-blue-700"
                        : status === "Failed"
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-700";

                    return (
                      <tr
                        key={i}
                        className="border-b last:border-none hover:bg-gray-50 transition cursor-pointer"
                        onClick={() => fetchEmailById(root._id)}
                      >
                        <td className="py-3 font-semibold text-gray-800">
                          {root.senderAddress || "N/A"}
                        </td>
                        <td className="py-3 text-gray-600">
                          {root.subject || "No Subject"}
                        </td>
                        <td className="py-3">
                          <span
                            className={`px-3 py-1 text-xs rounded-full font-medium ${color}`}
                          >
                            {status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={3}
                      className="text-center py-8 text-gray-500 italic"
                    >
                      No recent emails found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
              <button
                disabled={page === 1}
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition ${
                  page === 1
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-[#4F46E5] text-white hover:bg-[#4338CA]"
                }`}
              >
                <FiArrowLeft /> Prev
              </button>

              <span className="text-gray-600 text-sm">
                Page {page} of {totalPages}
              </span>

              <button
                disabled={page === totalPages}
                onClick={() =>
                  setPage((prev) => Math.min(prev + 1, totalPages))
                }
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition ${
                  page === totalPages
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-[#4F46E5] text-white hover:bg-[#4338CA]"
                }`}
              >
                Next <FiArrowRight />
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="flex flex-col space-y-3">
              <button className="flex items-center justify-center gap-2 bg-[#4F46E5] text-white py-2 rounded-lg font-medium hover:bg-[#4338CA] transition">
                <FiMail /> Connect another inbox
              </button>
              <button className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-200 transition">
                <FiEdit /> Edit templates
              </button>
              <button className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-200 transition">
                <FiPlusCircle /> Create scenario
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Organization;

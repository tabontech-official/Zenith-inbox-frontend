import React, { useState, useContext, useEffect } from "react";
import Sidebar from "../component/Sidebar";
import { Link, useNavigate } from "react-router-dom";
import { FiMail, FiCheckCircle, FiAlertCircle, FiZap } from "react-icons/fi";
import { MdOutlineEmail } from "react-icons/md";
import axios from "axios";

const Organization = () => {
  const [automationOn, setAutomationOn] = useState(true);
  const [activeTab, setActiveTab] = useState("emails");
  const navigate = useNavigate();
  const [emails, setEmails] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchEmails = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem("userid");
      if (!userId) {
        console.error("No userId in localStorage");
        return;
      }

      const res = await axios.get(
        `https://email-syncing-backend.vercel.app/mailhook/getAllEmails/${userId}`
      );
      setEmails(res.data?.data || []);
      setUser(res.data?.user || null);
    } catch (err) {
      console.error("Error fetching emails:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, []);
  const fetchEmailById = async (id) => {
    navigate(`/organization/email/${id}`);
  };

  const Loader = () => (
    <tr>
      <td colSpan="5">
        <div className="flex flex-col justify-center items-center py-10">
          <svg
            className="animate-spin h-8 w-8 text-purple-600 mb-2"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="text-sm text-purple-600 font-medium">Loading data...</p>
        </div>
      </td>
    </tr>
  );

  const getEmailStatus = (statuses) => {
    if (!statuses || statuses.length === 0) return "Pending";
    if (statuses.every((s) => s.status === "failed")) return "Failed";
    if (statuses.every((s) => s.status === "completed")) return "Processed";
    if (statuses.some((s) => s.status === "partial")) return "Partial";
    if (
      statuses.some((s) => s.status === "completed") &&
      statuses.some((s) => s.status === "pending")
    ) {
      return "Partial";
    }
    if (statuses.every((s) => s.status === "pending")) return "Pending";
    return "Pending";
  };

  const rootEmails = emails.filter((e) => !e.isForwarded && !e.parentEmailId);

  const renderStatCard = (icon, label, value, color) => (
    <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
      <div className="flex items-center gap-3">
        <div
          className={`p-3 rounded-full ${color} text-white shadow-md text-lg`}
        >
          {icon}
        </div>
        <div>
          <h2 className="text-gray-500 text-sm">{label}</h2>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex bg-gray-100 min-h-screen font-inter antialiased">
      <Sidebar />
      <main className="flex-1 md:ml-64 p-6 overflow-auto">
        <div className="mb-6 bg-white p-4 rounded-lg shadow">
          {loading ? (
            <p className="text-gray-500">Loading user data...</p>
          ) : user ? (
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm text-gray-600">Your Mailhook</h2>
                <p className="text-lg font-semibold text-purple-600">
                  {user.mailhook}
                </p>
              </div>

              {user.isVerified ? (
                <span className="flex items-center gap-1 text-green-600 font-medium">
                  <FiCheckCircle /> Verified
                </span>
              ) : (
                <button
                  onClick={() =>
                    user.verificationUrl
                      ? window.open(user.verificationUrl, "_blank")
                      : alert("No verification link found.")
                  }
                  className="bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600 transition"
                >
                  Verify
                </button>
              )}
            </div>
          ) : (
            <p className="text-red-500">Failed to load user</p>
          )}
        </div>

        <header className="flex flex-col md:flex-row md:items-center md:justify-between pb-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-800">
            Automation Dashboard
          </h1>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <Link to="/templates">
              <button className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition">
                Manage Templates
              </button>
            </Link>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={automationOn}
                onChange={() => setAutomationOn(!automationOn)}
                className="sr-only peer"
              />
              <div className="w-12 h-6 bg-gray-300 rounded-full peer peer-checked:bg-green-500 transition-colors"></div>
              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-6 transition-transform"></div>
              <span className="ml-3 text-sm font-medium text-gray-700">
                {automationOn ? "Automation: ON" : "Automation: OFF"}
              </span>
            </label>
          </div>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
          {renderStatCard(
            <MdOutlineEmail />,
            "Total Emails",
            rootEmails.length,
            "bg-indigo-500"
          )}
          {renderStatCard(
            <FiCheckCircle />,
            "Processed",
            rootEmails.filter((e) => getEmailStatus(e.statuses) === "Processed")
              .length,
            "bg-green-500"
          )}
          {renderStatCard(
            <FiZap />,
            "Partial",
            rootEmails.filter((e) => getEmailStatus(e.statuses) === "Partial")
              .length,
            "bg-blue-500"
          )}
          {renderStatCard(
            <FiAlertCircle />,
            "Failed",
            rootEmails.filter((e) => getEmailStatus(e.statuses) === "Failed")
              .length,
            "bg-red-500"
          )}
        </section>

        <section className="mt-10">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="flex border-b bg-gray-50">
              <button
                onClick={() => setActiveTab("emails")}
                className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-all ${
                  activeTab === "emails"
                    ? "border-b-2 border-purple-600 text-purple-600 bg-white"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <FiMail /> Recent Emails
              </button>
              <button
                onClick={() => setActiveTab("automations")}
                className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-all ${
                  activeTab === "automations"
                    ? "border-b-2 border-purple-600 text-purple-600 bg-white"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <FiZap /> Recent Automations
              </button>
            </div>

            <div className="p-4 overflow-x-auto">
              {activeTab === "emails" ? (
                <table className="w-full border-collapse text-sm">
                  <thead className="bg-gray-100 text-gray-700 text-xs uppercase tracking-wide">
                    <tr>
                      <th className="px-4 py-3 text-left">From</th>
                      <th className="px-4 py-3 text-left">Subject</th>
                      <th className="px-4 py-3 text-left">Date</th>
                      <th className="px-4 py-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {loading ? (
                      <Loader />
                    ) : rootEmails.length > 0 ? (
                      rootEmails.map((email) => {
                        const root = email.rootEmail || email;
                        const status = getEmailStatus(
                          email.statuses || root.statuses
                        );

                        return (
                          <tr
                            key={root._id}
                            className="hover:bg-gray-50 transition duration-150 cursor-pointer"
                            onClick={() => fetchEmailById(root._id)}
                          >
                            <td className="px-4 py-3 font-medium text-gray-800">
                              {root.senderAddress || "N/A"}
                            </td>
                            <td className="px-4 py-3 text-gray-600">
                              {root.subject || "No Subject"}
                            </td>
                            <td className="px-4 py-3 text-gray-500">
                              {root.date
                                ? new Date(root.date).toLocaleString()
                                : "N/A"}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                  status === "Processed"
                                    ? "bg-green-100 text-green-700"
                                    : status === "Pending"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : status === "Partial"
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-red-100 text-red-700"
                                }`}
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
                          colSpan="4"
                          className="px-4 py-6 text-center text-gray-500 italic"
                        >
                          No recent emails found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              ) : (
                <table className="w-full border-collapse text-sm">
                  <thead className="bg-gray-100 text-gray-700 text-xs uppercase tracking-wide">
                    <tr>
                      <th className="px-4 py-3 text-left">Scenario</th>
                      <th className="px-4 py-3 text-center">Status</th>
                      <th className="px-4 py-3 text-center">Completed</th>
                      <th className="px-4 py-3 text-center">Pending</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {loading ? (
                      <Loader />
                    ) : rootEmails.length > 0 ? (
                      rootEmails.flatMap((email) =>
                        email.statuses.map((s, i) => (
                          <tr
                            key={`${email._id}-${i}`}
                            className="hover:bg-gray-50 transition duration-150"
                          >
                            <td className="px-4 py-3 font-medium text-gray-800">
                              {s.scenarioId?.name || "N/A"}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                  s.status === "completed"
                                    ? "bg-green-100 text-green-700"
                                    : s.status === "pending"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : s.status === "partial"
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                {s.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center text-gray-600">
                              {s.completedModules?.length || 0}
                            </td>
                            <td className="px-4 py-3 text-center text-gray-600">
                              {s.pendingModules?.length || 0}
                            </td>
                          </tr>
                        ))
                      )
                    ) : (
                      <tr>
                        <td
                          colSpan="4"
                          className="px-4 py-6 text-center text-gray-500 italic"
                        >
                          No recent automations found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Organization;

import React, { useState, useEffect } from "react";
import Sidebar from "../component/Sidebar";
import { Link } from "react-router-dom";
import {
  FiMail,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiZap,
} from "react-icons/fi";
import { MdOutlineEmail } from "react-icons/md";
import axios from "axios";

const Organization = () => {
  const [automationOn, setAutomationOn] = useState(true);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [emails, setEmails] = useState([]);
  const [activeTab, setActiveTab] = useState("emails");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userId = localStorage.getItem("userid");
        const res = await axios.get(
          `https://email-syncing-backend.vercel.app/auth/getUsers/${userId}`
        );
        setUser(res.data.data);
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchEmails = async () => {
      try {
        const userId = localStorage.getItem("userid");
        const res = await axios.get(
          `https://email-syncing-backend.vercel.app/mailhook/getAllEmails/${userId}`
        );
        if (res.data.success) {
          setEmails(res.data.data);
        }
      } catch (error) {
        console.error("Error fetching emails:", error);
      }
    };
    fetchEmails();
  }, []);

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

  const getEmailStatus = (email) => {
    if (!email.statuses || email.statuses.length === 0) return "Pending";

    if (email.statuses.every((s) => s.status === "failed")) return "Failed";

    if (email.statuses.every((s) => s.status === "completed"))
      return "Processed";

    if (email.statuses.some((s) => s.status === "partial")) return "Partial";

    if (
      email.statuses.some((s) => s.status === "completed") &&
      email.statuses.some((s) => s.status === "pending")
    ) {
      return "Partial";
    }

    if (email.statuses.every((s) => s.status === "pending")) return "Pending";

    return "Pending";
  };

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
                  onClick={() => {
                    if (user.verificationUrl) {
                      window.open(user.verificationUrl, "_blank");
                    } else {
                      alert("No verification link found.");
                    }
                  }}
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
            emails.length,
            "bg-indigo-500"
          )}
          {renderStatCard(
            <FiCheckCircle />,
            "Processed",
            emails.filter((e) => getEmailStatus(e) === "Processed").length,
            "bg-green-500"
          )}
          {/* {renderStatCard(
            <FiClock />,
            "Pending",
            emails.filter((e) => getEmailStatus(e) === "Pending").length,
            "bg-yellow-500"
          )} */}
          {renderStatCard(
            <FiZap />,
            "Partial",
            emails.filter((e) => getEmailStatus(e) === "Partial").length,
            "bg-blue-500"
          )}

          {renderStatCard(
            <FiAlertCircle />,
            "Failed",
            emails.filter((e) => getEmailStatus(e) === "Failed").length,
            "bg-red-500"
          )}
        </section>

        {/* <section className="mt-10">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FiMail className="text-purple-600" /> Recent Emails
          </h2>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b text-gray-600">
                <tr>
                  <th className="p-3">From</th>
                  <th className="p-3">Subject</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {emails.length > 0 ? (
                  emails.map((email, idx) => {
                    const status = getEmailStatus(email);
                    return (
                      <tr key={idx} className="border-b hover:bg-gray-50">
                        <td className="p-3">{email.senderAddress}</td>
                        <td className="p-3">{email.subject}</td>
                        <td className="p-3">
                          {new Date(email.date).toLocaleString()}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
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
                    <td colSpan="4" className="p-3 text-center text-gray-500">
                      No recent emails found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FiZap className="text-yellow-500" /> Recent Automations
          </h2>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b text-gray-600">
                <tr>
                  <th className="p-3">Scenario</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Completed</th>
                  <th className="p-3">Pending</th>
                </tr>
              </thead>
              <tbody>
                {emails.flatMap((email) =>
                  email.statuses.map((s, i) => (
                    <tr
                      key={`${email._id}-${i}`}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="p-3">{s.scenarioId?.name || "N/A"}</td>
                      <td className="p-3">{s.status}</td>
                      <td className="p-3">{s.completedModules?.length || 0}</td>
                      <td className="p-3">{s.pendingModules?.length || 0}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section> */}
        <section className="mt-10">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {/* Tabs Header */}
            <div className="flex border-b">
              <button
                onClick={() => setActiveTab("emails")}
                className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition ${
                  activeTab === "emails"
                    ? "border-b-2 border-purple-600 text-purple-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <FiMail /> Recent Emails
              </button>
              <button
                onClick={() => setActiveTab("automations")}
                className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition ${
                  activeTab === "automations"
                    ? "border-b-2 border-purple-600 text-purple-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <FiZap /> Recent Automations
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-4">
              {activeTab === "emails" ? (
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 border-b text-gray-600">
                    <tr>
                      <th className="p-3">From</th>
                      <th className="p-3">Subject</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {emails.length > 0 ? (
                      emails.map((email, idx) => {
                        const status = getEmailStatus(email);
                        return (
                          <tr key={idx} className="border-b hover:bg-gray-50">
                            <td className="p-3">{email.senderAddress}</td>
                            <td className="p-3">{email.subject}</td>
                            <td className="p-3">
                              {new Date(email.date).toLocaleString()}
                            </td>
                            <td className="p-3">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
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
                          className="p-3 text-center text-gray-500"
                        >
                          No recent emails found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 border-b text-gray-600">
                    <tr>
                      <th className="p-3">Scenario</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Completed</th>
                      <th className="p-3">Pending</th>
                    </tr>
                  </thead>
                  <tbody>
                    {emails.flatMap((email) =>
                      email.statuses.map((s, i) => (
                        <tr
                          key={`${email._id}-${i}`}
                          className="border-b hover:bg-gray-50"
                        >
                          <td className="p-3">{s.scenarioId?.name || "N/A"}</td>
                          <td className="p-3">{s.status}</td>
                          <td className="p-3">
                            {s.completedModules?.length || 0}
                          </td>
                          <td className="p-3">
                            {s.pendingModules?.length || 0}
                          </td>
                        </tr>
                      ))
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

import React, { useState } from "react";
import Sidebar from "../component/Sidebar";
import { Link } from "react-router-dom";
import { FiMail, FiCheckCircle, FiClock, FiAlertCircle } from "react-icons/fi";
import { MdOutlineEmail } from "react-icons/md";

const Organization = () => {
  const [automationOn, setAutomationOn] = useState(true);

  // Dummy Stats
  const stats = {
    totalEmails: 124,
    processed: 98,
    pending: 20,
    failed: 6,
    templates: 12,
  };

  const recentEmails = [
    {
      id: 1,
      from: "malikrehan@tabontech.com",
      subject: "Shopify Partner Directory: Custom domain setup",
      date: "Sep 20, 2025, 10:32 AM",
      status: "Processed",
    },
    {
      id: 2,
      from: "john@brandstore.com",
      subject: "Shopify Partner Directory: SEO Optimization",
      date: "Sep 19, 2025, 02:18 PM",
      status: "Pending",
    },
  ];

  const recentAutomation = [
    {
      id: 1,
      template: "Custom Domain Setup",
      customer: "Malik Rehan",
      sentAt: "Sep 20, 2025, 10:35 AM",
    },
    {
      id: 2,
      template: "SEO Optimization",
      customer: "John Doe",
      sentAt: "Sep 19, 2025, 02:20 PM",
    },
  ];

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

      {/* Main */}
      <main className="flex-1 md:ml-64 p-6 overflow-auto">
        {/* Header */}
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

            {/* Toggle Button */}
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

        {/* Stats */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
          {renderStatCard(<MdOutlineEmail />, "Total Emails", stats.totalEmails, "bg-indigo-500")}
          {renderStatCard(<FiCheckCircle />, "Processed", stats.processed, "bg-green-500")}
          {renderStatCard(<FiClock />, "Pending", stats.pending, "bg-yellow-500")}
          {renderStatCard(<FiAlertCircle />, "Failed", stats.failed, "bg-red-500")}
        </section>

        {/* Recent Emails */}
        <section className="mt-10">
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
                {recentEmails.map((email) => (
                  <tr key={email.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{email.from}</td>
                    <td className="p-3">{email.subject}</td>
                    <td className="p-3">{email.date}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          email.status === "Processed"
                            ? "bg-green-100 text-green-700"
                            : email.status === "Pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {email.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Recent Automation */}
        <section className="mt-10">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            ⚡ Recent Automations
          </h2>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b text-gray-600">
                <tr>
                  <th className="p-3">Template Used</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Sent At</th>
                </tr>
              </thead>
              <tbody>
                {recentAutomation.map((auto) => (
                  <tr key={auto.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{auto.template}</td>
                    <td className="p-3">{auto.customer}</td>
                    <td className="p-3">{auto.sentAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Organization;

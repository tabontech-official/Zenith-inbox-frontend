import React, { useEffect, useState } from "react";
import Sidebar from "../component/Sidebar";
import {
  FiChevronDown,
  FiChevronUp,
  FiMail,
  FiLayers,
  FiFileText,
  FiDatabase,
} from "react-icons/fi";

const AdminEmailTracking = () => {
  const [summary, setSummary] = useState([]);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("https://email-syncing-backend.vercel.app/auth/email-tracking");
        const data = await res.json();
        setSummary(data.data || []);
      } catch (err) {
        console.error("Error loading summary:", err);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 md:ml-64 flex">
      <Sidebar />

      <div className="flex-1 p-6">
        <h1 className="text-2xl font-semibold mb-6 text-gray-800">
          Email Tracking Overview
        </h1>

        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <table className="min-w-full text-sm text-left text-gray-600">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3 text-center">Emails</th>
                <th className="px-4 py-3 text-center">Connections</th>
                <th className="px-4 py-3 text-center">Active Templates</th>
                <th className="px-4 py-3 text-center">Active Scenarios</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {summary.map((item) => (
                <React.Fragment key={item.user._id}>
                  <tr className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-medium">{item.user.fullName}</td>
                    <td className="px-4 py-3 text-center">{item.totalEmails}</td>
                    <td className="px-4 py-3 text-center">{item.totalConnections}</td>
                    <td className="px-4 py-3 text-center text-indigo-600 font-semibold">
                      {item.activeTemplates}
                    </td>
                    <td className="px-4 py-3 text-center text-green-600 font-semibold">
                      {item.activeScenarios}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() =>
                          setExpanded(expanded === item.user._id ? null : item.user._id)
                        }
                        className="text-indigo-600 text-xs font-semibold flex items-center justify-center gap-1"
                      >
                        {expanded === item.user._id ? (
                          <>
                            Hide <FiChevronUp />
                          </>
                        ) : (
                          <>
                            View <FiChevronDown />
                          </>
                        )}
                      </button>
                    </td>
                  </tr>

                  {/* Expand Row */}
                  {expanded === item.user._id && (
                    <tr className="bg-indigo-50/50">
                      <td colSpan="6" className="p-4">
                        <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                          <FiFileText className="text-indigo-500" /> Template Trigger Details
                        </h4>
                        {item.emailTemplateMap.length === 0 ? (
                          <p className="text-sm text-gray-500">No template-triggered emails found.</p>
                        ) : (
                          <table className="min-w-full text-xs text-gray-700 border border-gray-200 rounded-md">
                            <thead className="bg-gray-100 text-gray-500 uppercase">
                              <tr>
                                <th className="px-3 py-2">Email Subject</th>
                                <th className="px-3 py-2">Template Used</th>
                                <th className="px-3 py-2 text-right">Date</th>
                              </tr>
                            </thead>
                            <tbody>
                              {item.emailTemplateMap.map((e, idx) => (
                                <tr key={idx} className="border-t">
                                  <td className="px-3 py-2 flex items-center gap-2">
                                    <FiMail className="text-indigo-400" />
                                    {e.emailSubject}
                                  </td>
                                  <td className="px-3 py-2 flex items-center gap-2">
                                    <FiLayers className="text-green-500" />
                                    {e.templateUsed}
                                  </td>
                                  <td className="px-3 py-2 text-right text-gray-500">
                                    {new Date(e.date).toLocaleString()}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminEmailTracking;

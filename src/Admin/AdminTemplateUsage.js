import React, { useEffect, useState, useMemo } from "react";
import Sidebar from "../component/Sidebar";
import {
  FiMail,
  FiFileText,
  FiFilter,
  FiChevronDown,
  FiChevronUp,
  FiUser,
  FiClock,
  FiActivity,
  FiLayers,
  FiRefreshCcw,
  FiCheckCircle,
  FiXCircle,
  FiTrendingUp,
  FiTag,
  FiGrid,
  FiDatabase,
  FiAward,
} from "react-icons/fi";

const AdminTemplateUsage = () => {
  const [usageData, setUsageData] = useState([]);
  const [globalStats, setGlobalStats] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [serviceFilter, setServiceFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const res = await fetch("http://localhost:5000/auth/template-usage");
        const data = await res.json();
        setUsageData(data.data || []);
        setGlobalStats(data.globalStats || null);
      } catch (err) {
        console.error("Error fetching template usage:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsage();
  }, []);

  // Extract unique services/types for filters
  const allServices = useMemo(() => {
    const set = new Set();
    usageData.forEach((u) =>
      u.templatesData.forEach((t) => set.add(t.service))
    );
    return Array.from(set);
  }, [usageData]);

  const allTypes = ["initial", "first", "second"];

  // Filter data
  const filteredData = useMemo(() => {
    return usageData.map((u) => {
      let filteredTemplates = u.templatesData;

      if (serviceFilter)
        filteredTemplates = filteredTemplates.filter(
          (t) => t.service === serviceFilter
        );
      if (typeFilter)
        filteredTemplates = filteredTemplates.filter(
          (t) => t.type === typeFilter
        );

      return { ...u, templatesData: filteredTemplates };
    });
  }, [usageData, serviceFilter, typeFilter]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <FiMail className="text-indigo-500 text-4xl mb-3 animate-bounce" />
        <p className="text-gray-600 font-medium">Loading template usage...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 md:ml-64 flex">
      <Sidebar />

      <main className="flex-1 p-6">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
          <h1 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
            <FiFileText className="text-indigo-600" /> Template Usage Analytics
          </h1>
        </div>

        {/* 🌍 Global Stats Section */}
        {globalStats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white shadow-sm border rounded-lg p-4 flex items-center gap-3">
              <FiDatabase className="text-indigo-500 text-2xl" />
              <div>
                <p className="text-xs uppercase text-gray-500">Total Templates</p>
                <p className="text-lg font-semibold text-gray-800">
                  {globalStats.totalTemplates}
                </p>
              </div>
            </div>

            <div className="bg-white shadow-sm border rounded-lg p-4 flex items-center gap-3">
              <FiCheckCircle className="text-green-600 text-2xl" />
              <div>
                <p className="text-xs uppercase text-gray-500">Used Templates</p>
                <p className="text-lg font-semibold text-green-700">
                  {globalStats.totalUsedTemplates}
                </p>
              </div>
            </div>

            <div className="bg-white shadow-sm border rounded-lg p-4 flex items-center gap-3">
              <FiMail className="text-indigo-600 text-2xl" />
              <div>
                <p className="text-xs uppercase text-gray-500">Emails Processed</p>
                <p className="text-lg font-semibold text-indigo-700">
                  {globalStats.totalEmails}
                </p>
              </div>
            </div>

            <div className="bg-white shadow-sm border rounded-lg p-4 flex items-center gap-3">
              <FiAward className="text-yellow-500 text-2xl" />
              <div>
                <p className="text-xs uppercase text-gray-500">Most Used Template</p>
                <p className="text-sm font-semibold text-gray-800">
                  {globalStats.mostUsedTemplate?.name || "—"}
                </p>
                <p className="text-xs text-gray-500">
                  {globalStats.mostUsedTemplate
                    ? `${globalStats.mostUsedTemplate.usageCount} uses (${globalStats.mostUsedTemplate.usagePercentage}%)`
                    : ""}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white shadow-md border border-gray-100 rounded-xl p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <FiFilter className="text-indigo-600" />
              <span>Filters</span>
            </div>

            <div className="flex items-center gap-2">
              <FiLayers className="text-indigo-500" />
              <select
                className="border border-gray-300 rounded-md text-sm px-3 py-1 focus:ring-2 focus:ring-indigo-500 outline-none"
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
              >
                <option value="">All Services</option>
                {allServices.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <FiTag className="text-indigo-500" />
              <select
                className="border border-gray-300 rounded-md text-sm px-3 py-1 focus:ring-2 focus:ring-indigo-500 outline-none"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="">All Template Types</option>
                {allTypes.map((t) => (
                  <option key={t} value={t}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => {
                setServiceFilter("");
                setTypeFilter("");
              }}
              className="flex items-center gap-1 text-gray-600 hover:text-indigo-600 text-sm font-medium transition"
            >
              <FiRefreshCcw /> Reset
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          {filteredData.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-sm">
              No template usage found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left text-gray-700">
                <thead className="bg-gray-100 text-gray-500 text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <FiUser /> User
                      </div>
                    </th>
                    <th className="px-4 py-3 text-center">
                      <FiGrid /> Templates
                    </th>
                    <th className="px-4 py-3 text-center text-green-600">
                      <FiCheckCircle /> Used
                    </th>
                    <th className="px-4 py-3 text-center text-indigo-600">
                      <FiTrendingUp /> Total Usage
                    </th>
                    <th className="px-4 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((item) => (
                    <React.Fragment key={item.user._id}>
                      <tr className="hover:bg-gray-50 transition">
                        <td className="px-4 py-3 flex items-center gap-2 font-medium text-gray-800">
                          <FiUser className="text-indigo-500" />
                          {item.user.fullName}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {item.totalTemplates}
                        </td>
                        <td className="px-4 py-3 text-center text-green-600 font-semibold">
                          {item.totalUsedTemplates}
                        </td>
                        <td className="px-4 py-3 text-center text-indigo-600 font-semibold">
                          {item.totalUsageCount}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() =>
                              setExpanded(
                                expanded === item.user._id
                                  ? null
                                  : item.user._id
                              )
                            }
                            className="text-indigo-600 text-xs font-semibold flex items-center justify-center gap-1 hover:text-indigo-800 transition"
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

                      {expanded === item.user._id && (
                        <tr className="bg-gray-50/70">
                          <td colSpan="5" className="p-5">
                            <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                              <FiActivity className="text-indigo-500" />
                              Template Usage Details
                            </h4>

                            <div className="overflow-x-auto border border-gray-200 rounded-md">
                              <table className="min-w-full text-xs text-gray-700">
                                <thead className="bg-gray-100 text-gray-500 uppercase">
                                  <tr>
                                    <th className="px-3 py-2">
                                      <FiFileText /> Template
                                    </th>
                                    <th className="px-3 py-2">
                                      <FiLayers /> Service
                                    </th>
                                    <th className="px-3 py-2">
                                      <FiTag /> Type
                                    </th>
                                    <th className="px-3 py-2">Platform</th>
                                    <th className="px-3 py-2 text-center">
                                      <FiActivity /> Active
                                    </th>
                                    <th className="px-3 py-2 text-center">
                                      <FiTrendingUp /> Usage
                                    </th>
                                    <th className="px-3 py-2 text-right">
                                      <FiClock /> Last Used
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {item.templatesData.map((t, idx) => (
                                    <tr
                                      key={idx}
                                      className="border-t hover:bg-gray-50 transition"
                                    >
                                      <td className="px-3 py-2 flex items-center gap-2 font-medium">
                                        <FiFileText className="text-indigo-400" />
                                        {t.name}
                                      </td>
                                      <td className="px-3 py-2">{t.service}</td>
                                      <td className="px-3 py-2 capitalize">
                                        {t.type}
                                      </td>
                                      <td className="px-3 py-2">{t.platform}</td>
                                      <td className="px-3 py-2 text-center">
                                        {t.active ? (
                                          <FiCheckCircle className="text-green-600 inline-block" />
                                        ) : (
                                          <FiXCircle className="text-gray-400 inline-block" />
                                        )}
                                      </td>
                                      <td className="px-3 py-2 text-center text-indigo-600 font-semibold">
                                        {t.usageCount}
                                      </td>
                                      <td className="px-3 py-2 text-right text-gray-500">
                                        {t.lastUsed
                                          ? new Date(t.lastUsed).toLocaleString()
                                          : "—"}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminTemplateUsage;

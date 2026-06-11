import React, { useEffect, useState } from "react";
import Sidebar from "../component/Sidebar";
import {
  FiChevronDown,
  FiChevronUp,
  FiLayers,
  FiCpu,
  FiClock,
  FiFilter,
  FiActivity,
  FiDatabase,
  FiUser,
} from "react-icons/fi";

const AdminScenarioStats = () => {
  const [stats, setStats] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("https://email-syncing-backend.vercel.app/scenario/scenario-stats");
        const data = await res.json();
        setStats(data.data || []);
      } catch (err) {
        console.error("Error loading scenario stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <FiLayers className="text-indigo-500 text-4xl mb-3 animate-bounce" />
        <p className="text-gray-600 font-medium">Loading scenario stats...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 md:ml-64 flex">
      <Sidebar />

      <main className="flex-1 p-6">
        <h1 className="text-2xl font-semibold mb-6 text-gray-800 flex items-center gap-2">
          <FiLayers className="text-indigo-600" /> Scenario Statistics Overview
        </h1>

        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          {stats.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-sm">
              No scenarios found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left text-gray-700">
                <thead className="bg-gray-100 text-gray-500 text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3">User</th>
                    <th className="px-4 py-3 text-center">Scenarios</th>
                    <th className="px-4 py-3 text-center">Active</th>
                    <th className="px-4 py-3 text-center">Modules</th>
                    <th className="px-4 py-3 text-center">Delays</th>
                    <th className="px-4 py-3 text-center">Filters</th>
                    <th className="px-4 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.map((user) => (
                    <React.Fragment key={user.user._id}>
                      <tr className="hover:bg-gray-50 transition">
                        <td className="px-4 py-3 flex items-center gap-2 font-medium text-gray-800">
                          <FiUser className="text-indigo-500" />
                          {user.user.fullName}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {user.totalScenarios}
                        </td>
                        <td className="px-4 py-3 text-center text-green-600 font-semibold">
                          {user.activeScenarios}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {user.totalModules}
                        </td>
                        <td className="px-4 py-3 text-center text-indigo-600">
                          {user.totalDelays}
                        </td>
                        <td className="px-4 py-3 text-center text-gray-500">
                          {user.totalFilters}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() =>
                              setExpanded(
                                expanded === user.user._id
                                  ? null
                                  : user.user._id
                              )
                            }
                            className="text-indigo-600 text-xs font-semibold flex items-center justify-center gap-1 hover:text-indigo-800 transition"
                          >
                            {expanded === user.user._id ? (
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

                      {expanded === user.user._id && (
                        <tr className="bg-gray-50/70">
                          <td colSpan="7" className="p-5">
                            <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                              <FiActivity className="text-indigo-500" />
                              Scenario Details
                            </h4>

                            {user.scenarios.length === 0 ? (
                              <p className="text-sm text-gray-500">
                                No scenarios available.
                              </p>
                            ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {user.scenarios.map((s, i) => (
                                  <div
                                    key={i}
                                    className="bg-white border border-gray-200 rounded-md shadow-sm p-4"
                                  >
                                    <div className="flex justify-between items-center mb-2">
                                      <h5 className="font-medium text-gray-800">
                                        {s.name}
                                      </h5>
                                      {s.active ? (
                                        <span className="text-green-600 text-xs font-semibold">
                                          ● Active
                                        </span>
                                      ) : (
                                        <span className="text-gray-400 text-xs font-semibold">
                                          ● Inactive
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-xs text-gray-500 mb-1">
                                      Type: {s.type}
                                    </p>
                                    <div className="flex items-center text-xs text-gray-600 gap-2 mt-2">
                                      <FiCpu className="text-indigo-500" />
                                      Modules: {s.totalModules}
                                    </div>
                                    <div className="flex items-center text-xs text-gray-600 gap-2 mt-1">
                                      <FiClock className="text-blue-500" />
                                      Branches: {s.totalBranches}
                                    </div>
                                    <div className="flex items-center text-xs text-gray-600 gap-2 mt-1">
                                      <FiDatabase className="text-yellow-500" />
                                      Created:{" "}
                                      {new Date(s.createdAt).toLocaleDateString()}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
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

export default AdminScenarioStats;

import React, { useEffect, useState } from "react";
import Sidebar from "../component/Sidebar";
import {
  FiSearch,
  FiClock,
  FiUser,
  FiMail,
  FiLogIn,
  FiLogOut,
  FiChevronLeft,
  FiChevronRight,
  FiFilter,
  FiChevronDown,
  FiChevronUp,
  FiFileText,
  FiActivity,
} from "react-icons/fi";

const AdminUserActivity = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedUser, setExpandedUser] = useState(null); 
  const perPage = 10;

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/auth/user-activity", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setActivities(data.activities || []);
      } catch (err) {
        console.error("Error fetching user activity:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchActivity();
  }, []);

  const filtered = activities
    .filter((act) => {
      if (filter === "admin") return act.role === "admin";
      if (filter === "user") return act.role === "user";
      return true;
    })
    .filter(
      (act) =>
        act.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        act.email?.toLowerCase().includes(search.toLowerCase())
    );

  const totalPages = Math.ceil(filtered.length / perPage);
  const start = (currentPage - 1) * perPage;
  const current = filtered.slice(start, start + perPage);

  const toggleExpand = (id) => {
    setExpandedUser((prev) => (prev === id ? null : id));
  };

  return (
    <div className="min-h-screen bg-gray-50  flex">
      <Sidebar />

      <div className="flex-1 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">
              User Activity
            </h1>
            <p className="text-gray-500 text-sm">
              Track user logins, logouts, and template usage
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row items-center gap-3 mt-4 md:mt-0">
            <div className="relative">
              <FiFilter className="absolute left-3 top-3 text-gray-400" />
              <select
                value={filter}
                onChange={(e) => {
                  setFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                <option value="all">All Users</option>
                <option value="admin">Admins</option>
                <option value="user">Regular Users</option>
              </select>
            </div>

            <div className="relative w-full sm:w-auto">
              <FiSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 w-full sm:w-64"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>
        </div>

        <div className="bg-white shadow-md border border-gray-100 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left text-gray-600 border-collapse">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <tr className="border-b border-gray-200">
                  <th className="px-5 py-3 w-1/5">User</th>
                  <th className="px-5 py-3 w-1/5">Email</th>
                  <th className="px-5 py-3 w-1/10">Role</th>
                  <th className="px-5 py-3 w-1/10 text-center">Last Login</th>
                  <th className="px-5 py-3 w-1/10 text-center">Last Logout</th>
                  <th className="px-5 py-3 w-1/10 text-right">Joined</th>
                  {/* <th className="px-5 py-3 text-right">Templates</th> */}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-8 text-gray-500">
                      Loading activity...
                    </td>
                  </tr>
                ) : current.length > 0 ? (
                  current.map((u, idx) => (
                    <React.Fragment key={u._id}>
                      <tr
                        className={`transition-colors hover:bg-indigo-50 ${
                          idx % 2 === 0 ? "bg-white" : "bg-gray-50/70"
                        }`}
                      >
                        <td className="px-5 py-3 font-medium text-gray-800 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <FiUser className="text-indigo-500" />
                            {u.fullName || "—"}
                          </div>
                        </td>

                        <td className="px-5 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-gray-600">
                            <FiMail className="text-gray-400" />
                            {u.email}
                          </div>
                        </td>

                        <td className="px-5 py-3 capitalize text-gray-700">
                          {u.role}
                        </td>

                        <td className="px-5 py-3 text-center whitespace-nowrap">
                          {u.lastLogin ? (
                            <div className="flex items-center justify-center text-gray-600 gap-1">
                              <FiLogIn className="text-green-500" />
                              {new Date(u.lastLogin).toLocaleString()}
                            </div>
                          ) : (
                            <span className="text-gray-400 text-xs">Never</span>
                          )}
                        </td>

                        <td className="px-5 py-3 text-center whitespace-nowrap">
                          {u.lastLogout ? (
                            <div className="flex items-center justify-center text-gray-600 gap-1">
                              <FiLogOut className="text-red-500" />
                              {new Date(u.lastLogout).toLocaleString()}
                            </div>
                          ) : (
                            <span className="text-gray-400 text-xs">—</span>
                          )}
                        </td>

                        <td className="px-5 py-3 text-right text-gray-500 whitespace-nowrap">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>

                        {/* <td className="px-5 py-3 text-right">
                          {u.templatesUsed?.length > 0 ? (
                            <button
                              onClick={() => toggleExpand(u._id)}
                              className="text-indigo-600 text-xs font-semibold hover:text-indigo-800 flex items-center justify-end gap-1"
                            >
                              {expandedUser === u._id ? (
                                <>
                                  Hide <FiChevronUp />
                                </>
                              ) : (
                                <>
                                  View <FiChevronDown />
                                </>
                              )}
                            </button>
                          ) : (
                            <span className="text-gray-400 text-xs">No Templates</span>
                          )}
                        </td> */}
                      </tr>

                      {/* Expanded Template Section */}
                      {expandedUser === u._id && u.templatesUsed?.length > 0 && (
                        <tr className="bg-indigo-50/30">
                          <td colSpan="7" className="p-5">
                            <div className="border border-gray-200 rounded-lg bg-white shadow-sm p-4">
                              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                <FiActivity className="text-indigo-600" /> Template Activity
                              </h3>
                              <div className="overflow-x-auto">
                                <table className="min-w-full text-xs text-left text-gray-700">
                                  <thead className="bg-gray-100 text-gray-500 uppercase">
                                    <tr>
                                      <th className="px-3 py-2">Template</th>
                                      <th className="px-3 py-2">Last Used</th>
                                      <th className="px-3 py-2">Triggered In</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {u.templatesUsed.map((t) => (
                                      <tr key={t._id} className="border-t">
                                        <td className="px-3 py-2 font-medium flex items-center gap-2">
                                          <FiFileText className="text-indigo-500" />
                                          {t.name}
                                        </td>
                                        <td className="px-3 py-2 text-gray-600">
                                          {t.lastUsed
                                            ? new Date(t.lastUsed).toLocaleString()
                                            : "—"}
                                        </td>
                                        <td className="px-3 py-2 text-gray-600">
                                          {t.triggeredIn?.length > 0
                                            ? t.triggeredIn.join(", ")
                                            : "—"}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="7"
                      className="text-center py-8 text-gray-500 text-sm"
                    >
                      No user activity found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filtered.length > perPage && (
            <div className="flex items-center justify-center py-4 bg-gray-50 border-t border-gray-100 gap-3">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium border transition ${
                  currentPage === 1
                    ? "text-gray-400 border-gray-200 cursor-not-allowed"
                    : "text-indigo-600 border-indigo-300 hover:bg-indigo-50"
                }`}
              >
                <FiChevronLeft className="mr-1" /> Prev
              </button>

              <span className="text-sm text-gray-600">
                Page <strong>{currentPage}</strong> of {totalPages}
              </span>

              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium border transition ${
                  currentPage === totalPages
                    ? "text-gray-400 border-gray-200 cursor-not-allowed"
                    : "text-indigo-600 border-indigo-300 hover:bg-indigo-50"
                }`}
              >
                Next <FiChevronRight className="ml-1" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUserActivity;

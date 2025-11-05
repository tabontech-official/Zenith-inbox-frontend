import React, { useEffect, useState } from "react";
import {
  FiUsers,
  FiMail,
  FiLayers,
  FiCheckCircle,
  FiClock,
  FiChevronLeft,
  FiChevronRight,
  FiFileText,
} from "react-icons/fi";
import Sidebar from "../component/Sidebar";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    verifiedUsers: 0,
    totalEmails: 0,
    activeScenarios: 0,
    totalConnections: 0,
    templates: { total: 0, active: 0, inactive: 0 },
  });

  const [recentUsers, setRecentUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("https://email-syncing-backend.vercel.app/auth/summary");
        const data = await res.json();
        setStats(data);
        setRecentUsers(data.recentUsers || []);
      } catch (err) {
        console.error("Error loading dashboard:", err);
      }
    };

    fetchData();
  }, []);

  // Pagination calculations
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = recentUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(recentUsers.length / usersPerPage);

  return (
    <div className="min-h-screen bg-gray-50 md:ml-64 flex">
      <Sidebar />

      <div className="flex-1 p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
            Admin Dashboard
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            System overview and performance metrics
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-10">
          <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100 flex items-center space-x-4 hover:shadow-lg transition-shadow">
            <FiUsers className="text-indigo-500 w-8 h-8" />
            <div>
              <p className="text-gray-500 text-sm">Total Users</p>
              <p className="text-2xl font-bold text-gray-800">
                {stats.totalUsers}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100 flex items-center space-x-4 hover:shadow-lg transition-shadow">
            <FiCheckCircle className="text-green-500 w-8 h-8" />
            <div>
              <p className="text-gray-500 text-sm">Verified Users</p>
              <p className="text-2xl font-bold text-gray-800">
                {stats.verifiedUsers}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100 flex items-center space-x-4 hover:shadow-lg transition-shadow">
            <FiMail className="text-blue-500 w-8 h-8" />
            <div>
              <p className="text-gray-500 text-sm">Emails Sent</p>
              <p className="text-2xl font-bold text-gray-800">
                {stats.totalEmails}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100 flex items-center space-x-4 hover:shadow-lg transition-shadow">
            <FiLayers className="text-yellow-500 w-8 h-8" />
            <div>
              <p className="text-gray-500 text-sm">Active Scenarios</p>
              <p className="text-2xl font-bold text-gray-800">
                {stats.activeScenarios}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100 flex items-center space-x-4 hover:shadow-lg transition-shadow">
            <FiClock className="text-purple-500 w-8 h-8" />
            <div>
              <p className="text-gray-500 text-sm">Connections</p>
              <p className="text-2xl font-bold text-gray-800">
                {stats.totalConnections}
              </p>
            </div>
          </div>

          
        </div>

        {/* Recent Users */}
       <div className="bg-white border border-gray-100 shadow-md rounded-xl p-6">
  <div className="flex items-center justify-between mb-6">
    <div>
      <h2 className="text-lg font-semibold text-gray-800">Recent Users</h2>
      <p className="text-xs text-gray-500">
        Showing {currentUsers.length} of {recentUsers.length} users
      </p>
    </div>
    <span className="text-sm text-gray-400">Last 10 registered users</span>
  </div>

  <div className="overflow-x-auto rounded-lg border border-gray-100">
    <table className="min-w-full text-sm text-left text-gray-600">
      <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
        <tr>
          <th className="px-4 py-3">User</th>
          <th className="px-4 py-3">Email</th>
          <th className="px-4 py-3">Role</th>
          <th className="px-4 py-3 text-center">Templates</th>
          <th className="px-4 py-3">Registered</th>
          <th className="px-4 py-3">Status</th>
          <th className="px-4 py-3 text-center">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {currentUsers.length > 0 ? (
          currentUsers.map((user) => (
            <tr key={user._id} className="hover:bg-gray-50 transition-all">
              <td className="px-4 py-3 font-medium text-gray-800">
                {user.fullName || "—"}
              </td>
              <td className="px-4 py-3">{user.email}</td>
              <td className="px-4 py-3 capitalize">{user.role}</td>

              {/* Templates */}
              <td className="px-4 py-3 text-center">
                <div className="inline-flex flex-col text-xs text-gray-700">
                  <span className="font-semibold text-gray-800">
                    {user.templates?.total || 0} Total
                  </span>
                  <span className="text-green-600">
                    {user.templates?.active || 0} Active
                  </span>
                  <span className="text-red-500">
                    {user.templates?.inactive || 0} Inactive
                  </span>
                </div>
              </td>

              <td className="px-4 py-3 text-gray-500">
                {new Date(user.createdAt).toLocaleDateString()}
              </td>

              {/* Verified Status */}
              <td className="px-4 py-3">
                {user.verified ? (
                  <span className="flex items-center text-green-600 text-xs font-semibold bg-green-100 px-2 py-1 rounded-full">
                    <FiCheckCircle className="mr-1" /> Verified
                  </span>
                ) : (
                  <span className="flex items-center text-yellow-600 text-xs font-semibold bg-yellow-100 px-2 py-1 rounded-full">
                    Pending
                  </span>
                )}
              </td>

              {/* Action: View Templates */}
              <td className="px-4 py-3 text-center">
                <button
                  onClick={() =>
                    window.open(`/admin/templates/${user._id}`, "_blank")
                  }
                  className="text-indigo-600 text-xs font-semibold hover:text-indigo-800 underline"
                >
                  View Templates
                </button>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td
              colSpan="7"
              className="text-center py-6 text-gray-500 text-sm"
            >
              No users found
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>

  {/* Pagination */}
  {recentUsers.length > usersPerPage && (
    <div className="flex items-center justify-center mt-6 space-x-2">
      <button
        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
        disabled={currentPage === 1}
        className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium border ${
          currentPage === 1
            ? "text-gray-400 border-gray-200 cursor-not-allowed"
            : "text-indigo-600 border-indigo-300 hover:bg-indigo-50"
        }`}
      >
        <FiChevronLeft className="mr-1" /> Prev
      </button>

      <span className="text-sm text-gray-600">
        Page {currentPage} of {totalPages}
      </span>

      <button
        onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
        disabled={currentPage === totalPages}
        className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium border ${
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

export default AdminDashboard;

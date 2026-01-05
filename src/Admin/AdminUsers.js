import React, { useEffect, useState } from "react";
import Sidebar from "../component/Sidebar";
import {
  FiSearch,
  FiCheckCircle,
  FiXCircle,
  FiUser,
  FiMail,
  FiChevronLeft,
  FiChevronRight,
  FiFilter,
} from "react-icons/fi";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("https://email-syncing-backend.vercel.app/auth/users", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        setUsers(data.users || []);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // 🔍 Filter by search & dropdown selection
  const filteredUsers = users
    .filter((user) => {
      if (filter === "verified") return user.verified;
      if (filter === "pending") return !user.verified;
      if (filter === "admin") return user.role === "admin";
      if (filter === "user") return user.role === "user";
      return true;
    })
    .filter(
      (user) =>
        user.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        user.email?.toLowerCase().includes(search.toLowerCase())
    );

  // 🧮 Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const currentUsers = filteredUsers.slice(
    startIndex,
    startIndex + usersPerPage
  );

  return (
    <div className="min-h-screen bg-gray-50 md:ml-64 flex">
      <Sidebar />

      <div className="flex-1 p-6">
        {/* 🔹 Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">All Users</h1>
            <p className="text-gray-500 text-sm">Manage all registered users</p>
          </div>

          {/* 🔹 Controls: Search + Filter */}
          <div className="flex flex-col sm:flex-row items-center gap-3 mt-4 md:mt-0">
            {/* Filter Dropdown */}
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
                <option value="verified">Verified Users</option>
                <option value="pending">Pending Users</option>
                <option value="admin">Admins</option>
                <option value="user">Regular Users</option>
              </select>
            </div>

            {/* Search */}
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

        {/* 🔹 Table */}
        <div className="bg-white shadow-md border border-gray-100 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left text-gray-600 border-collapse">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <tr className="border-b border-gray-200">
                  <th className="px-5 py-3 w-1/5">User</th>
                  <th className="px-5 py-3 w-1/5">Email</th>
                  <th className="px-5 py-3 w-1/10">Role</th>
                  <th className="px-5 py-3 w-1/10 text-center">Verified</th>
                  <th className="px-5 py-3 w-1/10 text-center">Wizard</th>
                  <th className="px-5 py-3 w-1/10 text-right">Created At</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-gray-500">
                      Loading users...
                    </td>
                  </tr>
                ) : currentUsers.length > 0 ? (
                  currentUsers.map((user, idx) => (
                    <tr
                      key={user._id}
                      className={`transition-colors hover:bg-indigo-50 ${
                        idx % 2 === 0 ? "bg-white" : "bg-gray-50/70"
                      }`}
                    >
                      {/* 👤 User */}
                      <td className="px-5 py-3 font-medium text-gray-800 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <FiUser className="text-indigo-500" />
                          {user.fullName || "—"}
                        </div>
                      </td>

                      {/* ✉️ Email */}
                      <td className="px-5 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-gray-600">
                          <FiMail className="text-gray-400" />
                          {user.email}
                        </div>
                      </td>

                      {/* 🧩 Role */}
                      <td className="px-5 py-3 capitalize text-gray-700 whitespace-nowrap">
                        {user.role}
                      </td>

                      {/* ✅ Verified */}
                      <td className="px-5 py-3 text-center whitespace-nowrap">
                        {user.verified ? (
                          <span className="inline-flex items-center text-green-600 text-xs font-semibold bg-green-100 px-2 py-1 rounded-full">
                            <FiCheckCircle className="mr-1" /> Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-yellow-600 text-xs font-semibold bg-yellow-100 px-2 py-1 rounded-full">
                            <FiXCircle className="mr-1" /> Pending
                          </span>
                        )}
                      </td>

                      {/* 🧭 Wizard */}
                      <td className="px-5 py-3 text-center whitespace-nowrap">
                        {user.setup?.completed ? (
                          <span className="text-green-600 font-medium">
                            Completed
                          </span>
                        ) : (
                          <span className="text-gray-500 font-medium">
                            Step {user.setup?.stepCompleted || 0}
                          </span>
                        )}
                      </td>

                      {/* ⏰ Created */}
                      <td className="px-5 py-3 text-right text-gray-500 whitespace-nowrap">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="text-center py-8 text-gray-500 text-sm"
                    >
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* 🔹 Pagination */}
          {filteredUsers.length > usersPerPage && (
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

export default AdminUsers;

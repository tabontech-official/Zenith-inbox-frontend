import React, { useEffect, useState } from "react";
import Sidebar from "../component/Sidebar";
import {
  FiMail,
  FiCheckCircle,
  FiXCircle,
  FiDatabase,
  FiUser,
  FiCloud,
  FiFilter,
} from "react-icons/fi";

const AdminConnections = () => {
  const [connections, setConnections] = useState([]);
  const [filteredConnections, setFilteredConnections] = useState([]);
  const [users, setUsers] = useState([]); // distinct users list for filter
  const [selectedUser, setSelectedUser] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("https://email-syncing-backend.vercel.app/auth/connections", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        const allConnections = data.connections || [];

        setConnections(allConnections);
        setFilteredConnections(allConnections);

        // extract unique user names for dropdown
        const uniqueUsers = [
          ...new Map(
            allConnections.map((item) => [item.user?._id, item.user])
          ).values(),
        ];
        setUsers(uniqueUsers);
      } catch (error) {
        console.error("Error fetching connections:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchConnections();
  }, []);

  // 🔍 Filter by search and user
  useEffect(() => {
    let filtered = connections;

    if (selectedUser !== "All") {
      filtered = filtered.filter(
        (c) => c.user?._id === selectedUser || c.user?.fullName === selectedUser
      );
    }

    if (search.trim()) {
      filtered = filtered.filter(
        (c) =>
          c.email?.toLowerCase().includes(search.toLowerCase()) ||
          c.provider?.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFilteredConnections(filtered);
  }, [search, selectedUser, connections]);

  return (
    <div className="min-h-screen bg-gray-50 md:ml-64 flex">
      <Sidebar />

      <div className="flex-1 p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">
              All Connections
            </h1>
            <p className="text-gray-500 text-sm">
              View and filter all user email connections (Gmail, Outlook, SMTP)
            </p>
          </div>
        </div>

        {/* Filters Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          {/* 🔍 Search */}
          <input
            type="text"
            placeholder="Search by email or provider..."
            className="flex-1 pl-3 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* 👤 User Filter */}
          <div className="flex items-center space-x-2">
            <FiFilter className="text-gray-500" />
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="border border-gray-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <option value="All">All Users</option>
              {users.map(
                (u) =>
                  u && (
                    <option key={u._id} value={u._id}>
                      {u.fullName || u.email}
                    </option>
                  )
              )}
            </select>
          </div>
        </div>

        {/* Cards Grid */}
        {loading ? (
          <p className="text-center text-gray-500 py-10">Loading connections...</p>
        ) : filteredConnections.length > 0 ? (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredConnections.map((c) => (
              <div
                key={c._id}
                className="bg-white border border-gray-100 shadow-sm rounded-xl p-5 hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <FiCloud className="text-blue-400 w-5 h-5" />
                    <span className="capitalize font-medium text-gray-800">
                      {c.provider}
                    </span>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      c.status === "active"
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {c.status}
                  </span>
                </div>

                {/* Email */}
                <div className="flex items-center space-x-2 mb-2">
                  <FiMail className="text-gray-400" />
                  <span className="text-gray-700 break-all">{c.email}</span>
                </div>

                {/* Owner */}
                <div className="flex items-center space-x-2 mb-2">
                  <FiUser className="text-indigo-500" />
                  <span className="text-gray-700 text-sm font-medium">
                    {c.user?.fullName || "—"}
                  </span>
                </div>

                <div className="text-xs text-gray-500 ml-6 -mt-1">
                  {c.user?.email}
                </div>

                {/* Verified */}
                <div className="mt-4 flex items-center justify-between">
                  {c.verified ? (
                    <span className="flex items-center text-green-600 text-xs font-semibold bg-green-100 px-2 py-1 rounded-full">
                      <FiCheckCircle className="mr-1" /> Verified
                    </span>
                  ) : (
                    <span className="flex items-center text-yellow-600 text-xs font-semibold bg-yellow-100 px-2 py-1 rounded-full">
                      <FiXCircle className="mr-1" /> Pending
                    </span>
                  )}

                  <span className="text-gray-400 text-xs">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-10">No connections found</p>
        )}
      </div>
    </div>
  );
};

export default AdminConnections;

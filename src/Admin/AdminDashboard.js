import React, { useEffect, useState } from "react";
import {
  FiUsers,
  FiMail,
  FiLayers,
  FiCheckCircle,
  FiClock,
  FiChevronLeft,
  FiChevronRight,
  FiDollarSign,
  FiZap,
  FiHome,
  FiAlertCircle,
} from "react-icons/fi";
import PlatformAdminLayout from "./PlatformAdminLayout";

const AdminDashboard = () => {
  // Operational stats (from /auth/summary)
  const [stats, setStats] = useState({
    totalUsers: 0,
    verifiedUsers: 0,
    totalEmails: 0,
    activeScenarios: 0,
    totalConnections: 0,
    templates: { total: 0, active: 0, inactive: 0 },
  });
  const [recentUsers, setRecentUsers] = useState([]);

  // SaaS platform metrics (from /admin/dashboard)
  const [platformMetrics, setPlatformMetrics] = useState({
    totalOrganizations: 0,
    activeSubscriptions: 0,
    trialUsers: 0,
    proUsers: 0,
    mrr: 0,
    activePlans: 0,
    failedPayments: 0,
  });
  const [recentRegistrations, setRecentRegistrations] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const usersPerPage = 8;

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    const token = localStorage.getItem("usertoken");

    await Promise.allSettled([
      // Operational summary
      fetch("https://email-syncing-backend.vercel.app/auth/summary", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((data) => {
          setStats({
            totalUsers: data.totalUsers || 0,
            verifiedUsers: data.verifiedUsers || 0,
            totalEmails: data.totalEmails || 0,
            activeScenarios: data.activeScenarios || 0,
            totalConnections: data.totalConnections || 0,
            templates: data.templates || { total: 0, active: 0, inactive: 0 },
          });
          setRecentUsers(data.recentUsers || []);
        })
        .catch(() => {}),

      // Platform metrics
      fetch("https://email-syncing-backend.vercel.app/admin/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.success) {
            setPlatformMetrics(data.metrics || {});
            setRecentRegistrations(data.recentRegistrations || []);
            setRecentPayments(data.recentPayments || []);
          }
        })
        .catch(() => {}),
    ]);

    setLoading(false);
  };

  // Pagination
  const indexOfLast = currentPage * usersPerPage;
  const indexOfFirst = indexOfLast - usersPerPage;
  const currentUsers = recentUsers.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(recentUsers.length / usersPerPage);

  return (
    <PlatformAdminLayout pageTitle="Overview">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Platform Overview</h1>
          <p className="text-xs text-slate-500 mt-1">
            Operational metrics, SaaS subscriptions, and recent user activity.
          </p>
        </div>

        {/* ── ROW 1: SaaS Platform Metrics ───────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-500">Total Users</span>
              <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <FiUsers size={15} />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{stats.totalUsers}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">{stats.verifiedUsers} verified</div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-500">MRR</span>
              <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <FiDollarSign size={15} />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">${platformMetrics.mrr}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Est. monthly recurring</div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-500">Pro Subscribers</span>
              <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <FiZap size={15} />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{platformMetrics.proUsers}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">{platformMetrics.trialUsers} on free tier</div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-500">Organizations</span>
              <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <FiHome size={15} />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{platformMetrics.totalOrganizations}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Registered orgs</div>
          </div>
        </div>

        {/* ── ROW 2: Operational Stats ────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-500">Emails Sent</span>
              <div className="h-8 w-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                <FiMail size={15} />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{stats.totalEmails}</div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-500">Active Scenarios</span>
              <div className="h-8 w-8 rounded-lg bg-yellow-50 text-yellow-600 flex items-center justify-center">
                <FiLayers size={15} />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{stats.activeScenarios}</div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-500">Connections</span>
              <div className="h-8 w-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                <FiClock size={15} />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{stats.totalConnections}</div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-500">Failed Payments</span>
              <div className="h-8 w-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center">
                <FiAlertCircle size={15} />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{platformMetrics.failedPayments}</div>
          </div>
        </div>

        {/* ── ROW 3: Tables ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Recent Users — 3 cols */}
          <div className="lg:col-span-3 rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-900">Recent Registered Users</h2>
              <span className="text-[10px] text-slate-400">
                {recentUsers.length} total
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                  <tr>
                    <th className="p-2.5 font-semibold">User</th>
                    <th className="p-2.5 font-semibold">Role</th>
                    <th className="p-2.5 font-semibold text-center">Templates</th>
                    <th className="p-2.5 font-semibold">Registered</th>
                    <th className="p-2.5 font-semibold">Status</th>
                    <th className="p-2.5 font-semibold text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentUsers.length > 0 ? (
                    currentUsers.map((user) => (
                      <tr key={user._id} className="hover:bg-slate-50/50 transition">
                        <td className="p-2.5">
                          <div className="font-semibold text-slate-900">{user.fullName || "—"}</div>
                          <div className="text-[10px] text-slate-400">{user.email}</div>
                        </td>
                        <td className="p-2.5 capitalize text-slate-600">{user.role}</td>
                        <td className="p-2.5 text-center">
                          <div className="flex flex-col text-[10px] text-slate-600">
                            <span className="font-semibold text-slate-800">{user.templates?.total || 0} total</span>
                            <span className="text-emerald-600">{user.templates?.active || 0} active</span>
                          </div>
                        </td>
                        <td className="p-2.5 text-slate-500">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-2.5">
                          {user.verified ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 text-[10px] font-semibold">
                              <FiCheckCircle size={9} /> Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-yellow-50 text-yellow-700 border border-yellow-200 px-2 py-0.5 text-[10px] font-semibold">
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="p-2.5 text-center">
                          <button
                            onClick={() => window.open(`/admin/templates/${user._id}`, "_blank")}
                            className="text-indigo-600 text-[10px] font-semibold hover:underline"
                          >
                            Templates
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="p-6 text-center text-slate-400">
                        {loading ? "Loading..." : "No users found"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {recentUsers.length > usersPerPage && (
              <div className="flex items-center justify-center mt-4 gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                    currentPage === 1
                      ? "text-slate-300 border-slate-200 cursor-not-allowed"
                      : "text-slate-700 border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <FiChevronLeft size={12} /> Prev
                </button>
                <span className="text-xs text-slate-500">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                    currentPage === totalPages
                      ? "text-slate-300 border-slate-200 cursor-not-allowed"
                      : "text-slate-700 border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  Next <FiChevronRight size={12} />
                </button>
              </div>
            )}
          </div>

          {/* Recent Payments — 2 cols */}
          <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <FiDollarSign className="text-slate-400" size={14} />
              Recent Stripe Payments
            </h2>
            <div className="flex flex-col divide-y divide-slate-100">
              {recentPayments.length === 0 ? (
                <p className="py-6 text-center text-xs text-slate-400">
                  No payment history yet.
                </p>
              ) : (
                recentPayments.slice(0, 8).map((p) => (
                  <div key={p._id} className="py-3 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-800 truncate">
                        {p.description || "Payment"}
                      </div>
                      <div className="text-[10px] text-slate-400">{p.invoiceId}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs font-bold text-slate-900">
                        ${p.amount} {p.currency}
                      </div>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                        p.status === "Failed"
                          ? "bg-red-50 text-red-600"
                          : "bg-emerald-50 text-emerald-700"
                      }`}>
                        {p.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </PlatformAdminLayout>
  );
};

export default AdminDashboard;

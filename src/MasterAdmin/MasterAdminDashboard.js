import React, { useState, useEffect } from "react";
import {
  FiUsers,
  FiHome,
  FiZap,
  FiTrendingUp,
  FiLayers,
  FiAlertCircle,
  FiDollarSign,
  FiCheckCircle,
  FiClock,
} from "react-icons/fi";
import MasterAdminLayout from "./MasterAdminLayout";

const MasterAdminDashboard = () => {
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("usertoken");
      const res = await fetch("http://localhost:5000/admin/dashboard", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setMetrics(data.metrics || {});
        setRecentRegistrations(data.recentRegistrations || []);
        setRecentPayments(data.recentPayments || []);
      }
    } catch (err) {
      console.error("Error fetching master admin metrics:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MasterAdminLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">SaaS Overview & Platform Metrics</h1>
          <p className="text-xs text-slate-500 mt-1">
            Global monitoring for users, subscriptions, recurring revenue, and payments.
          </p>
        </div>

        {/* METRIC CARDS ROW 1 */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Total Users</span>
              <div className="h-9 w-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <FiUsers size={18} />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">{metrics.totalUsers}</span>
              <span className="text-xs text-slate-500">Registered</span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Total Organizations</span>
              <div className="h-9 w-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <FiHome size={18} />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">{metrics.totalOrganizations}</span>
              <span className="text-xs text-slate-500">Clinics & Teams</span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Monthly Recurring Revenue</span>
              <div className="h-9 w-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <FiDollarSign size={18} />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">${metrics.mrr}</span>
              <span className="text-xs text-emerald-600 font-medium">Est. MRR</span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Pro Subscriptions</span>
              <div className="h-9 w-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <FiZap size={18} />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">{metrics.proUsers}</span>
              <span className="text-xs text-slate-500">/ {metrics.trialUsers} Free Tier</span>
            </div>
          </div>
        </div>

        {/* RECENT REGISTRATIONS & PAYMENTS TABLES */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Signups */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <FiUsers className="text-slate-400" />
              Recent User Registrations
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="p-2.5 font-semibold">User</th>
                    <th className="p-2.5 font-semibold">Plan</th>
                    <th className="p-2.5 font-semibold">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentRegistrations.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="p-4 text-center text-slate-400">
                        No registrations yet.
                      </td>
                    </tr>
                  ) : (
                    recentRegistrations.map((u) => (
                      <tr key={u._id} className="hover:bg-slate-50/50">
                        <td className="p-2.5">
                          <div className="font-semibold text-slate-900">{u.fullName || "User"}</div>
                          <div className="text-[10px] text-slate-400">{u.email}</div>
                        </td>
                        <td className="p-2.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 capitalize">
                            {u.subscription?.plan || "Explore"}
                          </span>
                        </td>
                        <td className="p-2.5 text-slate-500">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Payments */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <FiDollarSign className="text-slate-400" />
              Recent Stripe Payments
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="p-2.5 font-semibold">Invoice / Description</th>
                    <th className="p-2.5 font-semibold">Amount</th>
                    <th className="p-2.5 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentPayments.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="p-4 text-center text-slate-400">
                        No payment history recorded yet.
                      </td>
                    </tr>
                  ) : (
                    recentPayments.map((p) => (
                      <tr key={p._id} className="hover:bg-slate-50/50">
                        <td className="p-2.5">
                          <div className="font-semibold text-slate-900">{p.description}</div>
                          <div className="text-[10px] text-slate-400">{p.invoiceId}</div>
                        </td>
                        <td className="p-2.5 font-bold text-slate-900">
                          ${p.amount} {p.currency}
                        </td>
                        <td className="p-2.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </MasterAdminLayout>
  );
};

export default MasterAdminDashboard;

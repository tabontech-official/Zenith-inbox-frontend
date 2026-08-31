import { apiFetch } from "../utils/apiClient";
import React, { useState, useEffect } from "react";
import {
  FiUsers,
  FiSearch,
  FiLock,
  FiUnlock,
  FiEdit,
  FiCheckCircle,
  FiX,
  FiSliders,
} from "react-icons/fi";
import PlatformAdminLayout from "../Admin/PlatformAdminLayout";

const MasterAdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedPlanFilter, setSelectedPlanFilter] = useState("all");

  const [selectedUser, setSelectedUser] = useState(null);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [planForm, setPlanForm] = useState({ planName: "Explore", extraAiReplies: 0 });

  useEffect(() => {
    fetchUsers();
  }, [search, selectedPlanFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("usertoken");
      let url = `https://email-syncing-backend.vercel.app/admin/users?search=${encodeURIComponent(search)}`;
      if (selectedPlanFilter !== "all") {
        url += `&plan=${selectedPlanFilter}`;
      }
      const res = await apiFetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setUsers(data.data || []);
      }
    } catch (err) {
      console.error("Error fetching admin users:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleLock = async (userItem) => {
    try {
      const token = localStorage.getItem("usertoken");
      const res = await apiFetch(`https://email-syncing-backend.vercel.app/admin/users/${userItem._id}/lock`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        fetchUsers();
      }
    } catch (err) {
      console.error("Error toggling user lock:", err);
    }
  };

  const handleOpenPlanModal = (userItem) => {
    setSelectedUser(userItem);
    setPlanForm({
      planName: userItem.subscription?.plan || "Explore",
      extraAiReplies: userItem.subscription?.extraAiReplies || 0,
    });
    setShowPlanModal(true);
  };

  const handleSavePlan = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    try {
      const token = localStorage.getItem("usertoken");
      const res = await apiFetch(`https://email-syncing-backend.vercel.app/admin/users/${selectedUser._id}/plan`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(planForm),
      });
      const data = await res.json();
      if (data.success) {
        setShowPlanModal(false);
        fetchUsers();
      }
    } catch (err) {
      console.error("Error updating user plan:", err);
    }
  };

  return (
    <PlatformAdminLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">User Account Management</h1>
            <p className="text-xs text-slate-500 mt-1">
              Global control over user accounts, subscription tiers, and access locks.
            </p>
          </div>
        </div>

        {/* SEARCH & FILTERS */}
        <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-3 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search users by name, email, or organization..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-400"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">Plan Filter:</span>
            <select
              className="text-xs rounded-lg border border-slate-200 p-2 bg-white"
              value={selectedPlanFilter}
              onChange={(e) => setSelectedPlanFilter(e.target.value)}
            >
              <option value="all">All Plans</option>
              <option value="Explore">Explore (Free)</option>
              <option value="Elevate">Elevate ($9.99)</option>
              <option value="Unite">Unite ($14.99)</option>
            </select>
          </div>
        </div>

        {/* USERS TABLE */}
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="p-3.5 font-semibold">User Details</th>
                <th className="p-3.5 font-semibold">Role</th>
                <th className="p-3.5 font-semibold">Current Plan</th>
                <th className="p-3.5 font-semibold">Status</th>
                <th className="p-3.5 font-semibold">Joined</th>
                <th className="p-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-6 text-center text-slate-400">
                    No matching users found.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/50">
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900">{u.fullName || "User"}</div>
                      <div className="text-[11px] text-slate-400">{u.email}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{u.organizationName || "My Organization"}</div>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          u.role === "admin"
                            ? "bg-amber-100 text-amber-800 border border-amber-300"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {u.role || "user"}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <div className="font-semibold text-slate-900 capitalize">
                        {u.subscription?.plan || "Explore"}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {u.subscription?.extraAiReplies || 0} extra credits
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          u.locked
                            ? "bg-red-50 text-red-700 border border-red-200"
                            : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        }`}
                      >
                        {u.locked ? "Locked" : "Active"}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3.5 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => handleOpenPlanModal(u)}
                        className="px-2.5 py-1 rounded-md border border-slate-200 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Change Plan
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleLock(u)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-semibold ${
                          u.locked
                            ? "bg-emerald-600 text-white hover:bg-emerald-700"
                            : "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
                        }`}
                      >
                        {u.locked ? "Unlock Account" : "Lock Account"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* CHANGE PLAN MODAL */}
        {showPlanModal && selectedUser && (
          <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md p-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <h2 className="text-sm font-bold text-slate-900">
                  Update Subscription Plan: {selectedUser.email}
                </h2>
                <button
                  type="button"
                  onClick={() => setShowPlanModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <FiX size={18} />
                </button>
              </div>

              <form onSubmit={handleSavePlan} className="space-y-4 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Target Plan</label>
                  <select
                    className="w-full rounded-lg border border-slate-300 p-2.5 bg-white"
                    value={planForm.planName}
                    onChange={(e) => setPlanForm({ ...planForm, planName: e.target.value })}
                  >
                    <option value="Explore">Explore (Free - 50 replies/mo)</option>
                    <option value="Elevate">Elevate ($9.99/mo - 500 replies/mo)</option>
                    <option value="Unite">Unite ($14.99/mo - 1,000 replies/mo)</option>
                    <option value="Enterprise">Enterprise (Unlimited)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Bonus / Extra AI Replies Credits
                  </label>
                  <input
                    type="number"
                    className="w-full rounded-lg border border-slate-300 p-2.5"
                    value={planForm.extraAiReplies}
                    onChange={(e) => setPlanForm({ ...planForm, extraAiReplies: e.target.value })}
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowPlanModal(false)}
                    className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-black text-white font-semibold hover:bg-slate-800"
                  >
                    Update User Plan
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </PlatformAdminLayout>
  );
};

export default MasterAdminUsers;

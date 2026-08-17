import React, { useState, useEffect } from "react";
import {
  FiHome,
  FiUsers,
  FiGlobe,
  FiLayers,
  FiTrash2,
  FiEdit,
  FiCheck,
  FiX,
  FiAlertTriangle,
  FiZap,
  FiShield,
  FiLock,
  FiActivity,
} from "react-icons/fi";
import PlatformAdminLayout from "../Admin/PlatformAdminLayout";

const MasterAdminOrganizations = () => {
  const [organizations, setOrganizations] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  // Plan Assignment Modal State
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [selectedPlanName, setSelectedPlanName] = useState("Explore");
  const [extraAiReplies, setExtraAiReplies] = useState(0);
  const [scenariosLimit, setScenariosLimit] = useState(1);
  const [extraScenariosLimit, setExtraScenariosLimit] = useState(0);
  const [updatingPlan, setUpdatingPlan] = useState(false);

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [orgToDelete, setOrgToDelete] = useState(null);
  const [deleteUsersOption, setDeleteUsersOption] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("usertoken");

      const [orgsRes, plansRes] = await Promise.allSettled([
        fetch("https://email-syncing-backend.vercel.app/admin/organizations", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("https://email-syncing-backend.vercel.app/admin/plans", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (orgsRes.status === "fulfilled") {
        const orgsData = await orgsRes.value.json();
        if (orgsData.success) {
          setOrganizations(orgsData.data || []);
        }
      }

      if (plansRes.status === "fulfilled") {
        const plansData = await plansRes.value.json();
        if (plansData.success) {
          setPlans(plansData.data || []);
        }
      }
    } catch (err) {
      console.error("Error fetching organizations:", err);
    } finally {
      setLoading(false);
    }
  };

  // Helper to get base AI replies limit from plan
  const getBasePlanAiLimit = (planName) => {
    const p = (planName || "").toLowerCase();
    if (p === "unite") return 1000;
    if (p === "elevate") return 500;
    if (p === "enterprise") return 10000;
    const custom = plans.find((item) => item.name?.toLowerCase() === p);
    if (custom?.aiRepliesLimit) return custom.aiRepliesLimit;
    return 50;
  };

  // Helper to get base scenario limit from plan
  const getBasePlanScenarioLimit = (planName) => {
    const p = (planName || "").toLowerCase();
    if (p === "unite") return 15;
    if (p === "elevate") return 5;
    if (p === "enterprise") return 999;
    const custom = plans.find((item) => item.name?.toLowerCase() === p);
    if (custom?.scenariosLimit) return custom.scenariosLimit;
    return 1;
  };

  // Open Change Plan Modal
  const openChangePlanModal = (org) => {
    setSelectedOrg(org);
    const planName = org.plan || "Explore";
    setSelectedPlanName(planName);
    setExtraAiReplies(org.extraAiReplies !== undefined ? org.extraAiReplies : 0);
    setScenariosLimit(org.scenariosLimit || getBasePlanScenarioLimit(planName));
    setExtraScenariosLimit(org.extraScenariosLimit || 0);
    setPlanModalOpen(true);
  };

  // Handle plan tier select change
  const handlePlanSelectChange = (newPlan) => {
    setSelectedPlanName(newPlan);
    setScenariosLimit(getBasePlanScenarioLimit(newPlan));
  };

  // Handle Save Plan
  const handleSavePlan = async (e) => {
    e.preventDefault();
    if (!selectedOrg) return;

    try {
      setUpdatingPlan(true);
      const token = localStorage.getItem("usertoken");

      const res = await fetch("https://email-syncing-backend.vercel.app/admin/organizations/plan", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          orgName: selectedOrg.name,
          ownerId: selectedOrg.ownerId,
          planName: selectedPlanName,
          extraAiReplies: Number(extraAiReplies) || 0,
          scenariosLimit: Number(scenariosLimit) || 1,
          extraScenariosLimit: Number(extraScenariosLimit) || 0,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setOrganizations((prev) =>
          prev.map((o) =>
            o.name === selectedOrg.name
              ? {
                  ...o,
                  plan: selectedPlanName,
                  extraAiReplies: Number(extraAiReplies) || 0,
                  scenariosLimit: Number(scenariosLimit) || 1,
                  extraScenariosLimit: Number(extraScenariosLimit) || 0,
                }
              : o
          )
        );
        setPlanModalOpen(false);
        setSelectedOrg(null);
      } else {
        alert(data.message || "Failed to update organization plan");
      }
    } catch (err) {
      console.error("Error updating plan:", err);
      alert("Error updating plan");
    } finally {
      setUpdatingPlan(false);
    }
  };

  // Open Delete Modal
  const openDeleteModal = (org) => {
    if (org.isAdminOrg) {
      alert("Admin / SaaS Owner organization is protected and cannot be deleted.");
      return;
    }
    setOrgToDelete(org);
    setDeleteUsersOption(false);
    setDeleteModalOpen(true);
  };

  // Handle Delete Organization
  const handleConfirmDelete = async () => {
    if (!orgToDelete) return;
    if (orgToDelete.isAdminOrg) {
      alert("Admin / SaaS Owner organization is protected and cannot be deleted.");
      return;
    }

    try {
      setDeleting(true);
      const token = localStorage.getItem("usertoken");

      const res = await fetch("https://email-syncing-backend.vercel.app/admin/organizations", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          orgName: orgToDelete.name,
          ownerId: orgToDelete.ownerId,
          deleteUsers: deleteUsersOption,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setOrganizations((prev) =>
          prev.filter((o) => o.name !== orgToDelete.name)
        );
        setDeleteModalOpen(false);
        setOrgToDelete(null);
      } else {
        alert(data.message || "Failed to delete organization");
      }
    } catch (err) {
      console.error("Error deleting organization:", err);
      alert("Error deleting organization");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <PlatformAdminLayout pageTitle="Organizations">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Organizations & Workspaces
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Manage tenant organizations, assign subscription pricing tiers, and configure resource limits.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-xs">
              {organizations.length} Total Organizations
            </span>
          </div>
        </div>

        {/* Organizations Table */}
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[900px]">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-3.5 font-bold whitespace-nowrap">Organization Name</th>
                  <th className="px-4 py-3.5 font-bold whitespace-nowrap">Account Owner</th>
                  <th className="px-4 py-3.5 font-bold whitespace-nowrap">Account Type</th>
                  <th className="px-4 py-3.5 font-bold whitespace-nowrap text-center">Members</th>
                  <th className="px-4 py-3.5 font-bold whitespace-nowrap">Pricing Plan</th>
                  <th className="px-4 py-3.5 font-bold whitespace-nowrap">Resource Limits</th>
                  <th className="px-4 py-3.5 font-bold whitespace-nowrap text-center">Region</th>
                  <th className="px-4 py-3.5 font-bold whitespace-nowrap text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="p-8 text-center text-slate-400">
                      Loading organizations...
                    </td>
                  </tr>
                ) : organizations.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="p-8 text-center text-slate-400">
                      No organizations found.
                    </td>
                  </tr>
                ) : (
                  organizations.map((org, index) => {
                    const baseAi = getBasePlanAiLimit(org.plan);
                    const totalAi = baseAi + (org.extraAiReplies || 0);
                    const totalScenarios = (org.scenariosLimit || getBasePlanScenarioLimit(org.plan)) + (org.extraScenariosLimit || 0);

                    return (
                      <tr
                        key={index}
                        className={`transition ${
                          org.isAdminOrg ? "bg-amber-50/30" : "hover:bg-slate-50/60"
                        }`}
                      >
                        {/* Organization Name */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                                org.isAdminOrg
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-indigo-50 text-indigo-600"
                              }`}
                            >
                              {org.isAdminOrg ? <FiShield size={15} /> : <FiHome size={15} />}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 text-xs">{org.name}</div>
                              {org.isAdminOrg && (
                                <span className="text-[9px] text-amber-600 font-bold uppercase tracking-wider">
                                  Platform Admin
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Account Owner */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <div className="flex flex-col">
                            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                              <span>{org.ownerName}</span>
                              {org.isAdminOrg && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-amber-500 text-slate-950">
                                  ADMIN
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-400">{org.ownerEmail}</span>
                          </div>
                        </td>

                        {/* Account Type */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          {org.isAdminOrg ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                              <FiShield size={11} />
                              <span>Admin Organization</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700">
                              <FiUsers size={11} className="text-slate-400" />
                              <span>Customer Tenant</span>
                            </span>
                          )}
                        </td>

                        {/* Members */}
                        <td className="px-4 py-3.5 whitespace-nowrap text-center">
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold">
                            {org.membersCount} Member{org.membersCount > 1 ? "s" : ""}
                          </span>
                        </td>

                        {/* Pricing Plan */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                              org.isAdminOrg
                                ? "bg-amber-100 text-amber-900 border border-amber-300"
                                : org.plan?.toLowerCase() === "unite"
                                ? "bg-purple-50 text-purple-700 border border-purple-200"
                                : org.plan?.toLowerCase() === "elevate"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-blue-50 text-blue-700 border border-blue-200"
                            }`}
                          >
                            {org.plan}
                          </span>
                        </td>

                        {/* Resource Limits (AI & Scenarios) */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 font-semibold text-[11px]">
                              <FiZap size={12} className="text-amber-500 shrink-0" />
                              <span>{totalAi.toLocaleString()} AI</span>
                              {org.extraAiReplies > 0 && (
                                <span className="text-[9px] text-amber-600 font-bold">(+{org.extraAiReplies})</span>
                              )}
                            </span>
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-semibold text-[11px]">
                              <FiLayers size={11} className="text-slate-400 shrink-0" />
                              <span>{totalScenarios} Scenarios</span>
                            </span>
                          </div>
                        </td>

                        {/* Country / Region */}
                        <td className="px-4 py-3.5 whitespace-nowrap text-center font-semibold text-slate-600">
                          {org.country}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3.5 whitespace-nowrap text-center">
                          {org.isAdminOrg ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 px-3 py-1 rounded-lg bg-slate-100">
                              <FiLock size={11} /> Protected
                            </span>
                          ) : (
                            <div className="flex items-center justify-center gap-2">
                              {/* Change Plan Button */}
                              <button
                                type="button"
                                onClick={() => openChangePlanModal(org)}
                                className="flex items-center gap-1 px-3 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-[11px] transition shadow-2xs cursor-pointer"
                                title="Assign or Change Pricing Plan"
                              >
                                <FiEdit size={12} className="text-slate-500" />
                                <span>Plan</span>
                              </button>

                              {/* Delete Org Button */}
                              <button
                                type="button"
                                onClick={() => openDeleteModal(org)}
                                className="flex items-center gap-1 px-3 py-1 rounded-lg border border-red-200 bg-white hover:bg-red-50 text-red-600 font-semibold text-[11px] transition shadow-2xs cursor-pointer"
                                title="Delete Organization"
                              >
                                <FiTrash2 size={12} className="text-red-500" />
                                <span>Delete</span>
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── CHANGE PLAN & LIMITS MODAL ───────────────────────────────────── */}
        {planModalOpen && selectedOrg && (
          <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                    <FiZap size={16} />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">
                      Configure Plan & Resource Limits
                    </h2>
                    <p className="text-[10px] text-slate-500">
                      {selectedOrg.name} ({selectedOrg.ownerEmail})
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setPlanModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                >
                  <FiX size={18} />
                </button>
              </div>

              {/* Existing Credits Summary Card */}
              <div className="p-3.5 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-xl shadow-xs mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                    <FiActivity size={11} /> Existing Account Status
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-400 text-slate-950 uppercase">
                    {selectedOrg.plan || "Explore"}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-slate-700/60">
                  <div className="bg-white/5 rounded-lg p-2">
                    <div className="text-[9px] text-slate-400 uppercase">Base AI Limit</div>
                    <div className="text-xs font-bold text-white mt-0.5">
                      {getBasePlanAiLimit(selectedOrg.plan).toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-2">
                    <div className="text-[9px] text-slate-400 uppercase">Bonus AI Credits</div>
                    <div className="text-xs font-bold text-amber-400 mt-0.5">
                      +{(selectedOrg.extraAiReplies || 0).toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-2">
                    <div className="text-[9px] text-slate-400 uppercase">Total AI Capacity</div>
                    <div className="text-xs font-bold text-emerald-400 mt-0.5">
                      {(getBasePlanAiLimit(selectedOrg.plan) + (selectedOrg.extraAiReplies || 0)).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between px-1">
                  <span>AI Replies Used: <strong className="text-white">{selectedOrg.aiRepliesUsed || 0}</strong></span>
                  <span>Active Scenarios: <strong className="text-white">{selectedOrg.scenariosLimit || getBasePlanScenarioLimit(selectedOrg.plan)} max</strong></span>
                </div>
              </div>

              <form onSubmit={handleSavePlan} className="space-y-4 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1.5">
                    Select Plan Tier
                  </label>
                  <select
                    className="w-full rounded-lg border border-slate-300 p-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    value={selectedPlanName}
                    onChange={(e) => handlePlanSelectChange(e.target.value)}
                  >
                    {/* Standard Plans */}
                    <option value="Explore">Explore (Free Tier - 50 AI replies/mo, 1 Scenario)</option>
                    <option value="Elevate">Elevate ($9.99/mo - 500 AI replies/mo, 5 Scenarios)</option>
                    <option value="Unite">Unite ($14.99/mo - 1,000 AI replies/mo, 15 Scenarios)</option>

                    {/* Custom database plans if any */}
                    {plans
                      .filter((p) => !["explore", "elevate", "unite"].includes(p.name?.toLowerCase()))
                      .map((p) => (
                        <option key={p._id} value={p.name}>
                          {p.name} (${p.monthlyPrice}/mo - {p.aiRepliesLimit} AI replies, {p.scenariosLimit} Scenarios)
                        </option>
                      ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Bonus AI Replies */}
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1.5 flex items-center justify-between">
                      <span>Bonus / Extra AI Replies</span>
                      <span className="text-[10px] text-amber-600 font-bold">Permanent</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="50"
                      placeholder="0"
                      className="w-full rounded-lg border border-slate-300 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 font-semibold"
                      value={extraAiReplies}
                      onChange={(e) => setExtraAiReplies(e.target.value)}
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Adds extra AI replies capacity to the base plan.
                    </p>
                  </div>

                  {/* Max Active Scenarios Limit */}
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1.5 flex items-center justify-between">
                      <span>Max Active Scenarios Limit</span>
                      <span className="text-[10px] text-indigo-600 font-bold">Automation</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      placeholder="1"
                      className="w-full rounded-lg border border-slate-300 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 font-semibold"
                      value={scenariosLimit}
                      onChange={(e) => setScenariosLimit(e.target.value)}
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Maximum active workflows allowed concurrently.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setPlanModalOpen(false)}
                    disabled={updatingPlan}
                    className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updatingPlan}
                    className="px-4 py-2 rounded-lg bg-black hover:bg-slate-800 text-white font-semibold flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    {updatingPlan ? "Saving..." : "Apply Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── DELETE ORGANIZATION MODAL ────────────────────────────────────── */}
        {deleteModalOpen && orgToDelete && (
          <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                  <FiAlertTriangle size={20} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Delete Organization
                  </h2>
                  <p className="text-xs text-slate-500">
                    {orgToDelete.name}
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Are you sure you want to delete <strong className="text-slate-900">{orgToDelete.name}</strong>? This action removes organization associations.
              </p>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 mb-4">
                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={deleteUsersOption}
                    onChange={(e) => setDeleteUsersOption(e.target.checked)}
                    className="rounded border-slate-300 text-red-600 focus:ring-red-500"
                  />
                  <span>Also delete user accounts associated with this organization</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteModalOpen(false)}
                  disabled={deleting}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={deleting}
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
                >
                  <FiTrash2 size={13} />
                  <span>{deleting ? "Deleting..." : "Delete Organization"}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PlatformAdminLayout>
  );
};

export default MasterAdminOrganizations;

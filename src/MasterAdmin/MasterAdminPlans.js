import React, { useState, useEffect } from "react";
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiCheck,
  FiX,
  FiZap,
  FiCheckCircle,
  FiLayers,
} from "react-icons/fi";
import PlatformAdminLayout from "../Admin/PlatformAdminLayout";

const MasterAdminPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    monthlyPrice: 0,
    yearlyPrice: 0,
    currency: "USD",
    aiRepliesLimit: 500,
    scenariosLimit: 5,
    connectionsLimit: 3,
    teamMembersLimit: 5,
    trialDays: 14,
    featuresStr: "",
    stripeProductId: "",
    stripeMonthlyPriceId: "",
    stripeYearlyPriceId: "",
    active: true,
    public: true,
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("usertoken");
      const res = await fetch("https://email-syncing-backend.vercel.app/admin/plans", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setPlans(data.data || []);
      }
    } catch (err) {
      console.error("Error fetching plans:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingPlan(null);
    setForm({
      name: "",
      description: "",
      monthlyPrice: 9.99,
      yearlyPrice: 8.5,
      currency: "USD",
      aiRepliesLimit: 500,
      scenariosLimit: 5,
      connectionsLimit: 3,
      teamMembersLimit: 5,
      trialDays: 14,
      featuresStr: "500 AI replies/month\n5 Active Scenarios\n3 Email Connections",
      stripeProductId: "",
      stripeMonthlyPriceId: "",
      stripeYearlyPriceId: "",
      active: true,
      public: true,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (plan) => {
    setEditingPlan(plan);
    setForm({
      name: plan.name || "",
      description: plan.description || "",
      monthlyPrice: plan.monthlyPrice || 0,
      yearlyPrice: plan.yearlyPrice || 0,
      currency: plan.currency || "USD",
      aiRepliesLimit: plan.aiRepliesLimit || 50,
      scenariosLimit: plan.scenariosLimit || 1,
      connectionsLimit: plan.connectionsLimit || 1,
      teamMembersLimit: plan.teamMembersLimit || 1,
      trialDays: plan.trialDays || 0,
      featuresStr: (plan.features || []).join("\n"),
      stripeProductId: plan.stripeProductId || "",
      stripeMonthlyPriceId: plan.stripeMonthlyPriceId || "",
      stripeYearlyPriceId: plan.stripeYearlyPriceId || "",
      active: plan.active ?? true,
      public: plan.public ?? true,
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("usertoken");
      const features = form.featuresStr
        .split("\n")
        .map((f) => f.trim())
        .filter(Boolean);

      const payload = {
        ...form,
        features,
        monthlyPrice: Number(form.monthlyPrice),
        yearlyPrice: Number(form.yearlyPrice),
        aiRepliesLimit: Number(form.aiRepliesLimit),
        scenariosLimit: Number(form.scenariosLimit),
        connectionsLimit: Number(form.connectionsLimit),
        teamMembersLimit: Number(form.teamMembersLimit),
        trialDays: Number(form.trialDays),
      };

      const url = editingPlan
        ? `https://email-syncing-backend.vercel.app/admin/plans/${editingPlan._id}`
        : "https://email-syncing-backend.vercel.app/admin/plans";
      const method = editingPlan ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        fetchPlans();
      } else {
        alert(data.message || "Failed to save plan");
      }
    } catch (err) {
      console.error("Save plan error:", err);
      alert("Error saving plan");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this plan?")) return;
    try {
      const token = localStorage.getItem("usertoken");
      const res = await fetch(`https://email-syncing-backend.vercel.app/admin/plans/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        fetchPlans();
      }
    } catch (err) {
      console.error("Delete plan error:", err);
    }
  };

  return (
    <PlatformAdminLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Database Pricing Plans</h1>
            <p className="text-xs text-slate-500 mt-1">
              Manage SaaS tiers, usage limits, features, and Stripe Price IDs dynamically.
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="flex items-center gap-2 rounded-lg bg-black hover:bg-slate-800 px-4 py-2 text-xs font-semibold text-white transition shadow-sm cursor-pointer"
          >
            <FiPlus size={16} />
            <span>Create New Plan</span>
          </button>
        </div>

        {/* PLAN CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan._id}
              className={`rounded-2xl border bg-white p-6 shadow-xs flex flex-col justify-between relative ${
                plan.active ? "border-slate-200" : "border-slate-200 opacity-60 bg-slate-50"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      plan.active ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {plan.active ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-4">{plan.description}</p>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-3xl font-extrabold text-slate-900">
                    ${plan.monthlyPrice}
                  </span>
                  <span className="text-xs text-slate-400">/ mo</span>
                </div>

                <div className="space-y-2 border-t border-slate-100 pt-4 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>AI Replies / Mo:</span>
                    <span className="font-semibold text-slate-900">{plan.aiRepliesLimit}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Active Scenarios:</span>
                    <span className="font-semibold text-slate-900">{plan.scenariosLimit}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Email Connections:</span>
                    <span className="font-semibold text-slate-900">{plan.connectionsLimit}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 border-t border-slate-100 pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(plan)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  <FiEdit size={14} />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(plan._id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-xs font-semibold text-red-600 hover:bg-red-50 transition cursor-pointer"
                >
                  <FiTrash2 size={14} />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* CREATE / EDIT PLAN MODAL */}
        {showModal && (
          <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                <h2 className="text-base font-bold text-slate-900">
                  {editingPlan ? "Edit Pricing Plan" : "Create Pricing Plan"}
                </h2>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <FiX size={18} />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Plan Name</label>
                    <input
                      type="text"
                      required
                      className="w-full rounded-lg border border-slate-300 p-2.5"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Currency</label>
                    <input
                      type="text"
                      className="w-full rounded-lg border border-slate-300 p-2.5"
                      value={form.currency}
                      onChange={(e) => setForm({ ...form, currency: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Description</label>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-slate-300 p-2.5"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Monthly Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="w-full rounded-lg border border-slate-300 p-2.5"
                      value={form.monthlyPrice}
                      onChange={(e) => setForm({ ...form, monthlyPrice: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Yearly Price ($/mo)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="w-full rounded-lg border border-slate-300 p-2.5"
                      value={form.yearlyPrice}
                      onChange={(e) => setForm({ ...form, yearlyPrice: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">AI Replies Limit</label>
                    <input
                      type="number"
                      className="w-full rounded-lg border border-slate-300 p-2.5"
                      value={form.aiRepliesLimit}
                      onChange={(e) => setForm({ ...form, aiRepliesLimit: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Scenarios Limit</label>
                    <input
                      type="number"
                      className="w-full rounded-lg border border-slate-300 p-2.5"
                      value={form.scenariosLimit}
                      onChange={(e) => setForm({ ...form, scenariosLimit: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Connections Limit</label>
                    <input
                      type="number"
                      className="w-full rounded-lg border border-slate-300 p-2.5"
                      value={form.connectionsLimit}
                      onChange={(e) => setForm({ ...form, connectionsLimit: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Features (One per line)</label>
                  <textarea
                    rows={3}
                    className="w-full rounded-lg border border-slate-300 p-2.5 font-mono"
                    value={form.featuresStr}
                    onChange={(e) => setForm({ ...form, featuresStr: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Stripe Product ID</label>
                    <input
                      type="text"
                      placeholder="prod_..."
                      className="w-full rounded-lg border border-slate-300 p-2.5 font-mono"
                      value={form.stripeProductId}
                      onChange={(e) => setForm({ ...form, stripeProductId: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Stripe Price ID</label>
                    <input
                      type="text"
                      placeholder="price_..."
                      className="w-full rounded-lg border border-slate-300 p-2.5 font-mono"
                      value={form.stripeMonthlyPriceId}
                      onChange={(e) => setForm({ ...form, stripeMonthlyPriceId: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={form.active}
                      onChange={(e) => setForm({ ...form, active: e.target.checked })}
                    />
                    <span>Active Plan</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={form.public}
                      onChange={(e) => setForm({ ...form, public: e.target.checked })}
                    />
                    <span>Publicly Visible</span>
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-black text-white font-semibold hover:bg-slate-800"
                  >
                    Save Plan
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

export default MasterAdminPlans;

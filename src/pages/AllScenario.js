import React, { useEffect, useState } from "react";
import { Mail, Clock, Server, Layers, Trash2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../component/Sidebar";
import ScenarioSelectModal from "../component/ScenarioSelectModal"; // ✅ Import modal

const getScenarioName = (scenario) => {
  if (scenario.name && scenario.name.trim() !== "") return scenario.name;
  const modules = scenario.routerBranches?.[0]?.modules || [];
  if (modules.some((m) => m.type === "Send an Email" && m.app?.name === "Gmail"))
    return "Gmail Scenario";
  if (modules.some((m) => m.type === "Custom Email")) return "Outlook/SMTP Scenario";
  if (modules.some((m) => m.type === "Delay")) return "Delay Scenario";
  if (modules.length > 1) return "Mixed Scenario";
  return "Untitled Scenario";
};

const getScenarioDescription = (scenario) => {
  if (scenario.description && scenario.description.trim() !== "")
    return scenario.description;
  const modules = scenario.routerBranches?.[0]?.modules || [];
  if (modules.length > 0) return modules.map((m) => m.description).join(", ");
  return "No description available";
};

const getScenarioIcon = (scenario) => {
  const modules = scenario.routerBranches?.[0]?.modules || [];
  if (modules.some((m) => m.app?.name === "Gmail"))
    return <Mail className="w-5 h-5 text-red-500" />;
  if (modules.some((m) => m.type === "Custom Email"))
    return <Server className="w-5 h-5 text-blue-500" />;
  if (modules.some((m) => m.type === "Delay"))
    return <Clock className="w-5 h-5 text-yellow-500" />;
  return <Layers className="w-5 h-5 text-purple-500" />;
};

const Loader = () => (
  <tr>
    <td colSpan="5">
      <div className="flex flex-col justify-center items-center py-10">
        <svg
          className="animate-spin h-8 w-8 text-purple-600 mb-2"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <p className="text-sm text-purple-600 font-medium">Loading data...</p>
      </div>
    </td>
  </tr>
);

const AllScenariosPage = () => {
  const [scenarios, setScenarios] = useState([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [loading, setLoading] = useState(false);
  const [openScenarioModal, setOpenScenarioModal] = useState(false); // ✅ Modal state

  const navigate = useNavigate();

  useEffect(() => {
    fetchScenarios();
  }, []);

  const fetchScenarios = async () => {
    const userId = localStorage.getItem("userid");
    try {
      setLoading(true);
      const res = await fetch(
        `https://email-syncing-backend.vercel.app/scenario/user/${userId}`
      );
      const data = await res.json();
      setScenarios(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      console.error("Error fetching scenarios:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (scenario) => {
    if (scenario.type === "shopify") {
      navigate(`/scenarios/shopify/${scenario._id}`);
    } else {
      navigate(`/scenarios/others/${scenario._id}`);
    }
  };

  const handleDelete = async () => {
    if (!selectedScenario) return;
    try {
      await fetch(
        `https://email-syncing-backend.vercel.app/scenario/detail/${selectedScenario._id}`,
        { method: "DELETE" }
      );
      setDeleteModalOpen(false);
      setSelectedScenario(null);
      fetchScenarios();
    } catch (err) {
      console.error("Error deleting scenario:", err);
    }
  };

  const handleSelectScenario = (type) => {
    setOpenScenarioModal(false);
    if (type === "shopify") navigate("/scenarios/shopify");
    else navigate("/scenarios/others");
  };

  return (
    <div className="flex bg-gradient-to-br from-gray-50 to-indigo-50 min-h-screen font-inter">
      <Sidebar />

      <main className="flex-1 md:ml-64 flex flex-col">
        <header className="bg-white shadow-sm border-b px-8 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              All Scenarios
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage, edit, and organize all your automation workflows.
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-sm text-gray-600 font-medium">
              Shopify Scenario:{" "}
              <span className="font-semibold text-indigo-600">
                {scenarios.filter((s) => s.type === "shopify").length}/1
              </span>
            </div>

            <div className="text-sm text-gray-600 font-medium">
              Custom Scenarios:{" "}
              <span className="font-semibold text-indigo-600">
                {scenarios.filter((s) => s.type !== "shopify").length}/2
              </span>
            </div>

            {/* ✅ Open scenario selection modal instead of direct navigation */}
            <button
              onClick={() => {
                const shopifyCount = scenarios.filter(
                  (s) => s.type === "shopify"
                ).length;
                const customCount = scenarios.filter(
                  (s) => s.type !== "shopify"
                ).length;

                if (shopifyCount >= 1 && customCount >= 2) {
                  alert("You’ve reached the limit: 1 Shopify + 2 Custom Scenarios.");
                  return;
                }

                setOpenScenarioModal(true);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition ${
                scenarios.filter((s) => s.type === "shopify").length >= 1 &&
                scenarios.filter((s) => s.type !== "shopify").length >= 2
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-500 text-white"
              }`}
            >
              + New Scenario
            </button>
          </div>
        </header>

        <section className="flex-1 p-8 overflow-x-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-sm text-left text-gray-600">
              <thead className="bg-gray-100 text-gray-700 uppercase tracking-wide text-xs">
                <tr>
                  <th className="px-6 py-3">Scenario</th>
                  <th className="px-6 py-3">Description</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Created At</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <Loader />
                ) : scenarios.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="text-center py-10 text-gray-400 text-base"
                    >
                      No scenarios found.
                    </td>
                  </tr>
                ) : (
                  scenarios.map((scenario, idx) => (
                    <tr
                      key={scenario._id}
                      className={`transition-all duration-200 ${
                        idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                      } hover:bg-indigo-50 cursor-pointer`}
                      onClick={() => handleRowClick(scenario)}
                    >
                      <td className="px-6 py-4 flex items-center gap-3 font-semibold text-gray-800">
                        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-indigo-100 text-indigo-600">
                          {getScenarioIcon(scenario)}
                        </div>
                        {getScenarioName(scenario)}
                      </td>

                      <td className="px-6 py-4 text-gray-600 max-w-sm truncate">
                        {getScenarioDescription(scenario)}
                      </td>

                      <td className="px-6 py-4 capitalize text-gray-700">
                        {scenario.type}
                      </td>

                      <td className="px-6 py-4 text-gray-500">
                        {new Date(scenario.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedScenario(scenario);
                            setDeleteModalOpen(true);
                          }}
                          className="text-gray-400 hover:text-red-500 transition"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* 🗑️ Delete Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-96 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Confirm Delete
              </h2>
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-gray-600 mb-6 leading-relaxed">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-gray-800">
                {selectedScenario?.name || "this scenario"}
              </span>
              ?
            </p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white shadow transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Scenario Select Modal (Same as Organization page) */}
      <ScenarioSelectModal
        open={openScenarioModal}
        onClose={() => setOpenScenarioModal(false)}
        onSelect={handleSelectScenario}
      />
    </div>
  );
};

export default AllScenariosPage;

import React, { useEffect, useState } from "react";
import { Plus, Layers, Mail, Clock, Server, X, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../component/Sidebar";

const getScenarioName = (scenario) => {
  if (scenario.name && scenario.name.trim() !== "") return scenario.name;

  const modules = scenario.routerBranches?.[0]?.modules || [];
  if (
    modules.some((m) => m.type === "Send an Email" && m.app?.name === "Gmail")
  )
    return "Gmail Scenario";
  if (modules.some((m) => m.type === "Custom Email"))
    return "Outlook/SMTP Scenario";
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
    return <Mail className="w-6 h-6 text-red-500" />;
  if (modules.some((m) => m.type === "Custom Email"))
    return <Server className="w-6 h-6 text-blue-500" />;
  if (modules.some((m) => m.type === "Delay"))
    return <Clock className="w-6 h-6 text-yellow-500" />;
  return <Layers className="w-6 h-6 text-purple-500" />;
};

const AllScenariosPage = () => {
  const [activeTab, setActiveTab] = useState("others");
  const [shopifyScenarios, setShopifyScenarios] = useState([]);
  const [otherScenarios, setOtherScenarios] = useState([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchScenarios();
  }, []);

  const fetchScenarios = async () => {
    const userId = localStorage.getItem("userid");

    try {
      const res = await fetch(`https://email-syncing-backend.vercel.app/scenario/user/${userId}`);
      const data = await res.json();
      setShopifyScenarios(data.filter((s) => s.type === "shopify"));
      setOtherScenarios(data.filter((s) => s.type === "other"));
    } catch (err) {
      console.error(" Error fetching scenarios:", err);
    }
  };

  const handleCardClick = (scenario) => {
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

  const renderCards = (scenarios) => {
    if (scenarios.length === 0) {
      return (
        <div className="text-center py-16 text-gray-400 text-lg">
          No custom scenarios found.
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {scenarios.map((scenario) => (
          <div
            key={scenario._id}
            className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-5 flex flex-col justify-between border border-gray-100 relative hover:border-purple-400"
          >
            {/* Delete Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedScenario(scenario);
                setDeleteModalOpen(true);
              }}
              className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition"
            >
              <Trash2 className="w-5 h-5" />
            </button>

            {/* Icon + Name */}
            <div
              onClick={() => handleCardClick(scenario)}
              className="flex items-center space-x-3 mb-3 cursor-pointer"
            >
              <div className="p-2 bg-gray-50 rounded-lg">
                {getScenarioIcon(scenario)}
              </div>
              <h3 className="font-semibold text-gray-800 text-lg">
                {getScenarioName(scenario)}
              </h3>
            </div>

            {/* Description */}
            <p
              onClick={() => handleCardClick(scenario)}
              className="text-sm text-gray-600 mb-4 line-clamp-2 cursor-pointer"
            >
              {getScenarioDescription(scenario)}
            </p>

            {/* Meta Info */}
            <div
              onClick={() => handleCardClick(scenario)}
              className="flex items-center justify-between text-xs text-gray-500 cursor-pointer"
            >
              <span className="capitalize px-2 py-0.5 bg-gray-100 rounded-full">
                {scenario.type}
              </span>
              <span>
                {new Date(scenario.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex min-h-screen">
      <div className="w-64 border-r bg-gradient-to-b from-purple-600 to-purple-800">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col bg-gray-50">
        <div className="flex justify-between items-center p-6 border-b bg-white shadow-sm">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">
              All Scenarios
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage, edit, and organize all your automation workflows in one
              place.
            </p>
          </div>
          {/* <button
            onClick={() => navigate("/scenarios/add")}
            className="flex items-center bg-purple-600 text-white px-4 py-2 rounded-lg shadow hover:bg-purple-700 transition"
          >
            <Plus className="w-4 h-4 mr-2" /> New Scenario
          </button> */}
        </div>

        <div className="flex-1 p-6 space-y-8">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Shopify
            </h2>
            {renderCards(shopifyScenarios)}
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Custom</h2>
            {renderCards(otherScenarios)}
          </div>
        </div>
      </div>

      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-96 transform transition-all scale-95 animate-fadeIn">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                Confirm Delete
              </h2>
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete{" "}
              <span className="font-semibold">
                {selectedScenario?.name || "this scenario"}
              </span>
              ?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white shadow"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllScenariosPage;

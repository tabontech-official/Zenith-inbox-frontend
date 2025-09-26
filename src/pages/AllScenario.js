import React, { useEffect, useState } from "react";
import { Plus, Layers, Mail, Clock, Server } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../component/Sidebar";

// ✅ Fallback Name Generator
const getScenarioName = (scenario) => {
  if (scenario.name && scenario.name.trim() !== "") return scenario.name;

  const modules = scenario.routerBranches?.[0]?.modules || [];
  if (modules.some((m) => m.type === "Send an Email" && m.app?.name === "Gmail"))
    return "Gmail Scenario";
  if (modules.some((m) => m.type === "Custom Email"))
    return "Outlook/SMTP Scenario";
  if (modules.some((m) => m.type === "Delay")) return "Delay Scenario";
  if (modules.length > 1) return "Mixed Scenario";

  return "Untitled Scenario";
};

// ✅ Fallback Description Generator
const getScenarioDescription = (scenario) => {
  if (scenario.description && scenario.description.trim() !== "")
    return scenario.description;

  const modules = scenario.routerBranches?.[0]?.modules || [];
  if (modules.length > 0) return modules.map((m) => m.description).join(", ");

  return "No description available";
};

// ✅ Icon by Module
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
  const [activeTab, setActiveTab] = useState("shopify");
  const [shopifyScenarios, setShopifyScenarios] = useState([]);
  const [otherScenarios, setOtherScenarios] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const userId = localStorage.getItem("userid");

    const fetchScenarios = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/scenario/user/${userId}`
        );
        const data = await res.json();
        setShopifyScenarios(data.filter((s) => s.type === "shopify"));
        setOtherScenarios(data.filter((s) => s.type === "other"));
      } catch (err) {
        console.error("❌ Error fetching scenarios:", err);
      }
    };

    fetchScenarios();
  }, []);

  const handleCardClick = (scenario) => {
    if (scenario.type === "shopify") {
      navigate(`/scenarios/shopify/${scenario._id}`);
    } else {
      navigate(`/scenarios/others/${scenario._id}`);
    }
  };

  const renderCards = (scenarios) => {
    if (scenarios.length === 0) {
      return (
        <div className="text-center py-16 text-gray-400 text-lg">
          No scenarios found.
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {scenarios.map((scenario) => (
          <div
            key={scenario._id}
            onClick={() => handleCardClick(scenario)}
            className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-5 flex flex-col justify-between border border-gray-100 cursor-pointer hover:border-purple-400"
          >
            {/* Icon + Name */}
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-gray-50 rounded-lg">
                {getScenarioIcon(scenario)}
              </div>
              <h3 className="font-semibold text-gray-800 text-lg">
                {getScenarioName(scenario)}
              </h3>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
              {getScenarioDescription(scenario)}
            </p>

            {/* Meta Info */}
            <div className="flex items-center justify-between text-xs text-gray-500">
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
      {/* Sidebar */}
      <div className="w-64 border-r bg-gradient-to-b from-purple-600 to-purple-800">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b bg-white shadow-sm">
          <h1 className="text-2xl font-bold text-gray-800">All Scenarios</h1>
          <button
            onClick={() => navigate("/scenarios/add")}
            className="flex items-center bg-purple-600 text-white px-4 py-2 rounded-lg shadow hover:bg-purple-700 transition"
          >
            <Plus className="w-4 h-4 mr-2" /> New Scenario
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 pt-4">
          <div className="flex space-x-8 border-b">
            <button
              onClick={() => setActiveTab("shopify")}
              className={`pb-3 font-medium transition relative ${
                activeTab === "shopify"
                  ? "text-purple-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Shopify
              {activeTab === "shopify" && (
                <span className="absolute left-0 right-0 bottom-0 h-0.5 bg-purple-600 rounded"></span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("others")}
              className={`pb-3 font-medium transition relative ${
                activeTab === "others"
                  ? "text-purple-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Others
              {activeTab === "others" && (
                <span className="absolute left-0 right-0 bottom-0 h-0.5 bg-purple-600 rounded"></span>
              )}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6">
          {activeTab === "shopify"
            ? renderCards(shopifyScenarios)
            : renderCards(otherScenarios)}
        </div>
      </div>
    </div>
  );
};

export default AllScenariosPage;

import React, { useEffect, useState } from "react";
import { Mail, Clock, Server, Layers, Trash2, X } from "lucide-react";
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

  const navigate = useNavigate();

  useEffect(() => {
    fetchScenarios();
  }, []);

  const fetchScenarios = async () => {
    const userId = localStorage.getItem("userid");
    try {
      setLoading(true);
      const res = await fetch(
        `http://localhost:5000/scenario/user/${userId}`
      );
      const data = await res.json();
      setScenarios(data);
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
        `http://localhost:5000/scenario/detail/${selectedScenario._id}`,
        { method: "DELETE" }
      );
      setDeleteModalOpen(false);
      setSelectedScenario(null);
      fetchScenarios();
    } catch (err) {
      console.error("Error deleting scenario:", err);
    }
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
        </div>

        <div className="flex-1 p-6">
          {scenarios.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-lg">
              No scenarios found.
            </div>
          ) : (
            <div className="overflow-x-auto border rounded-lg bg-white shadow">
              <table className="w-full text-sm text-left text-gray-600">
                <thead className="bg-gray-100 text-gray-700 text-sm uppercase">
                  <tr>
                    <th className="px-6 py-3">Scenario</th>
                    <th className="px-6 py-3">Description</th>
                    <th className="px-6 py-3">Type</th>
                    <th className="px-6 py-3">Created At</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <Loader />
                  ) : scenarios.length > 0 ? (
                    scenarios.map((scenario) => (
                      <tr
                        key={scenario._id}
                        className="border-b hover:bg-gray-50 cursor-pointer"
                      >
                        <td
                          onClick={() => handleRowClick(scenario)}
                          className="px-6 py-4 flex items-center gap-2 font-medium text-gray-800"
                        >
                          {getScenarioIcon(scenario)}
                          {getScenarioName(scenario)}
                        </td>

                        <td
                          onClick={() => handleRowClick(scenario)}
                          className="px-6 py-4 text-gray-600 max-w-xs truncate"
                        >
                          {getScenarioDescription(scenario)}
                        </td>

                        <td
                          onClick={() => handleRowClick(scenario)}
                          className="px-6 py-4 capitalize"
                        >
                          {scenario.type}
                        </td>

                        <td
                          onClick={() => handleRowClick(scenario)}
                          className="px-6 py-4"
                        >
                          {new Date(scenario.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </td>

                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedScenario(scenario);
                              setDeleteModalOpen(true);
                            }}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        className="text-center py-10 text-gray-400 text-lg"
                      >
                        No scenarios found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-96">
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

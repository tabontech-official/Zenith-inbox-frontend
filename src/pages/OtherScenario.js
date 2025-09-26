import React, { useEffect, useRef, useState } from "react";
import {
  Plus,
  Search,
  ArrowLeft,
  Settings,
  Mail,
  Cloud,
  GitBranch,
  X,
  Clock,
  Trash,
  Pencil,
  Funnel,
} from "lucide-react";
import Sidebar from "../component/Sidebar";
import { TfiEmail } from "react-icons/tfi";
import { FaEnvelope, FaGoogle, FaMicrosoft } from "react-icons/fa";
import ConnectionModal from "../component/ConnectionModal";
import ReactQuill from "react-quill";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";

import "react-quill/dist/quill.snow.css";
const OthersScenariosPage = () => {
  const { id } = useParams();
  const [open, setOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const [connections, setConnections] = useState([]);

  const [selectedApp, setSelectedApp] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);
  const [savedModule, setSavedModule] = useState(null);
  const [savedSecondModule, setSavedSecondModule] = useState(null);
  const [savedThirdModule, setSavedThirdModule] = useState(null);
  const [showRouterBranches, setShowRouterBranches] = useState(false);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [showDataPanel, setShowDataPanel] = useState(false);
  const [selectedModuleIndex, setSelectedModuleIndex] = useState(null);
  const [editorContent, setEditorContent] = useState("");
  const [selectedConnection, setSelectedConnection] = useState(null);
  const [connectionTemplates, setConnectionTemplates] = useState({});
  const [selectedConnections, setSelectedConnections] = useState([]);

  const [routerBranches, setRouterBranches] = useState([
    { id: 2, hasModule: false, condition: null, modules: [], filter: null },
  ]);
  const [scenarioName, setScenarioName] = useState("");
  const [scenarioDescription, setScenarioDescription] = useState("");
  const [scenarioId, setScenarioId] = useState(null);
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [smtpConnection, setSmtpConnection] = useState(null);

  const [dataPanelFor, setDataPanelFor] = useState(null);
  const quillRef = useRef(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const [selectedBranchIndex, setSelectedBranchIndex] = useState(null);
  const [routerHovered, setRouterHovered] = useState(false);
  const [branchModules, setBranchModules] = useState({});
  const [editingBranch, setEditingBranch] = useState(null);
  const modalRef = useRef(null);
  const [chips, setChips] = useState([]);
  const [filters, setFilters] = useState({});
  const [filterLabel, setFilterLabel] = useState("");
  const [connectionSubjects, setConnectionSubjects] = useState({});

  const [conditions, setConditions] = useState([
    { field: "", operator: "Equal to", value: "", join: null },
  ]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get("status");
    const connectionId = params.get("connectionId");

    if (status === "success" && connectionId) {
      console.log("🔗 Gmail connection created:", connectionId);

      // store in localStorage so modules can use it
      localStorage.setItem("gmailConnectionId", connectionId);

      // clear query params from URL
      window.history.replaceState({}, document.title, "/scenarios/others");
    }
  }, []);

  useEffect(() => {
    if (id) {
      const fetchScenario = async () => {
        try {
          const res = await fetch(
            `https://email-syncing-backend.vercel.app/scenario/detail/${id}`
          );
          const data = await res.json();

          if (data) {
            setScenarioId(data._id);
            setScenarioName(data.name || "");
            setScenarioDescription(data.description || "");
            setRouterBranches(data.routerBranches || []);
          }
        } catch (err) {
          console.error(" Error fetching scenario:", err);
        }
      };
      fetchScenario();
    }
  }, [id]);
  const handleAddCondition = (joinType) => {
    setConditions((prev) => [
      ...prev,
      { field: "", operator: "Equal to", value: "", join: joinType },
    ]);
  };

  const handleSaveFilter = () => {
    const key = `${selectedBranchIndex}-${selectedModuleIndex ?? "branch"}`;

    // Save filter in local filters state
    setFilters((prev) => ({
      ...prev,
      [key]: { label: filterLabel, conditions, template: editorContent },
    }));

    // Save filter in routerBranches
    const updatedBranches = [...routerBranches];
    if (selectedModuleIndex === null) {
      updatedBranches[selectedBranchIndex].filter = {
        label: filterLabel,
        conditions, // ✅ structured objects
        template: editorContent,
      };
    } else {
      updatedBranches[selectedBranchIndex].modules[selectedModuleIndex].filter =
        {
          label: filterLabel,
          conditions, // ✅ structured objects
          template: editorContent,
        };
    }

    setRouterBranches(updatedBranches);
    setShowFilterDialog(false);
  };

  const handleUpdateCondition = (index, key, value) => {
    setConditions((prev) => {
      const updated = [...prev];
      updated[index][key] = value;
      return updated;
    });
  };

  // const openFilterModal = (branchIndex, moduleIndex = null) => {
  //   setSelectedBranchIndex(branchIndex);
  //   setSelectedModuleIndex(moduleIndex);

  //   const key = `${branchIndex}-${moduleIndex ?? "branch"}-${
  //     selectedConnection || "none"
  //   }`;

  //   const existing = filters[key] || {
  //     label: "",
  //     conditions: [],
  //     template: "",
  //   };

  //   setFilterLabel(existing.label || "");
  //   setConditions(
  //     existing.conditions && existing.conditions.length > 0
  //       ? existing.conditions
  //       : [{ field: "", operator: "Equal to", value: "", join: null }]
  //   );
  //   setEditorContent(existing.template || "");

  //   setShowFilterDialog(true);
  // };

  const openFilterModal = (branchIndex, moduleIndex = null) => {
    setSelectedBranchIndex(branchIndex);
    setSelectedModuleIndex(moduleIndex);

    const key = `${branchIndex}-${moduleIndex ?? "branch"}-${
      selectedConnection || "none"
    }`;

    let existing =
      filters[key] ||
      (moduleIndex === null
        ? routerBranches[branchIndex].filter
        : routerBranches[branchIndex].modules[moduleIndex].filter);

    if (!existing) {
      existing = { label: "", conditions: [], template: "" };
    }

    setFilterLabel(existing.label || "");
    setConditions(
      existing.conditions && existing.conditions.length > 0
        ? existing.conditions
        : [{ field: "", operator: "Equal to", value: "", join: null }]
    );
    setEditorContent(existing.template || "");

    setShowFilterDialog(true);
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setOpen(false);
        setShowFilterDialog(false);
        setShowDataPanel(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const userId = localStorage.getItem("userid");

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const res = await fetch(
          `https://email-syncing-backend.vercel.app/auth/getConnection/${userId}`
        );
        const data = await res.json();
        setConnections(data);
      } catch (err) {
        console.error(" Error fetching connections:", err);
      }
    };
    fetchConnections();
  }, [userId]);
  const apps = [
    { name: "Gmail", color: "bg-red-500", icon: <Mail /> },
    { name: "Email", color: "bg-red-500", icon: <TfiEmail /> },
    { name: "Delay", color: "bg-blue-500", icon: <Clock /> },
  ];

  const availableData = [
    {
      module: "Gmail",
      type: "Send an Email",
      fields: [
        { name: "From", type: "text" },
        { name: "To", type: "text" },
        { name: "Subject", type: "text" },
        { name: "Body", type: "html" },
        { name: "Date", type: "date" },
      ],
    },
  ];

  useState(() => {
    setSavedModule({
      app: { name: "Webhooks", color: "bg-red-500", icon: <Cloud /> },
      type: "Custom mailhook",
      description: "Custom mailhook",
    });
    setSavedSecondModule({
      app: { name: "Router", color: "bg-green-400", icon: <GitBranch /> },
      type: "Router",
      description: "Route to different paths",
    });
    setSavedThirdModule({
      app: { name: "Gmail", color: "bg-red-500", icon: <Mail /> },
      type: "Send an Email",
      description: "Send an email",
    });
    setShowRouterBranches(true);
    setRouterBranches([
      { id: 2, hasModule: false, condition: null, modules: [] },
    ]);
  }, []);

  const [delayValue, setDelayValue] = useState(5);
  const [delayUnit, setDelayUnit] = useState("seconds");

  const handleSave = () => {
    if (editingBranch !== null) {
      const updated = [...routerBranches];
      const modules = updated[editingBranch].modules || [];

      let type = "";
      let description = "";
      let extra = {};

      if (selectedModule === "delay") {
        type = "Delay";
        description = `Delay execution for ${delayValue} ${delayUnit}`;
        extra = { delayValue, delayUnit };

        modules.push({
          id: Date.now(),
          app: {
            name: selectedApp.name,
            color: selectedApp.color,
            icon: selectedApp.name,
          },
          type,
          description,
          ...extra,
        });
      } else if (selectedModule === "customEmail") {
        type = "Custom Email";
        description = "Send an email using custom SMTP";

        // Multiple Outlook connections handle karein
        selectedConnections.forEach((connId) => {
          modules.push({
            id: Date.now() + Math.random(),
            app: {
              name: selectedApp.name,
              color: selectedApp.color,
              icon: selectedApp.name,
            },
            type,
            description,
            connectionId: connId,
            template: connectionTemplates[connId] || "",
            subject: connectionSubjects[connId] || "",
          });
        });
      } else {
        type = "Send an Email";
        description = "Send an email via Gmail";

        selectedConnections.forEach((connId) => {
          modules.push({
            id: Date.now() + Math.random(),
            app: {
              name: selectedApp.name,
              color: selectedApp.color,
              icon: selectedApp.name,
            },
            type,
            description,
            connectionId: connId,
            template: connectionTemplates[connId] || "",
            subject: connectionSubjects[connId] || "",
          });
        });
      }

      updated[editingBranch].modules = modules;
      setRouterBranches(updated);

      // Reset states
      setEditingBranch(null);
      setSelectedModuleIndex(null);
      setOpen(false);
      setSelectedModule(null);
      setSelectedApp(null);
      setSelectedConnections([]);
    }
  };

  const quillRefs = useRef({});

  const handleRouterHover = () => {
    setRouterHovered(true);
  };

  const handleRouterLeave = () => {
    setRouterHovered(false);
  };

  const addRouterBranch = () => {
    const newBranch = {
      id: routerBranches.length + 1,
      hasModule: false,
      condition: null,
      modules: [],
      filter: { label: "", conditions: [], template: "" }, // ✅ fix
    };

    setRouterBranches([...routerBranches, newBranch]);
  };

  const handleBranchPlusClick = (branchIndex) => {
    setSelectedBranchIndex(branchIndex);
    setEditingBranch(branchIndex);
    setOpen(true);
  };

  const handleConditionClick = () => {
    setDataPanelFor("condition");
    setShowDataPanel(true);
  };

  const handleTemplateClick = () => {
    setDataPanelFor("template");
    setShowDataPanel(true);
  };
  const addModuleToBranch = (branchIndex) => {
    setEditingBranch(branchIndex);
    setOpen(true);
  };

  const LOCAL_KEY = "scenario_draft";

  const saveDraft = (data) => {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(data));
  };

  const getDraft = () => {
    const data = localStorage.getItem(LOCAL_KEY);
    return data ? JSON.parse(data) : null;
  };

  const clearDraft = () => {
    localStorage.removeItem(LOCAL_KEY);
  };
  useEffect(() => {
    const draft = {
      name: scenarioName,
      description: scenarioDescription,
      routerBranches,
    };
    saveDraft(draft);
  }, [routerBranches, scenarioName, scenarioDescription]);
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      const draft = getDraft();
      if (draft) {
        e.preventDefault();
        e.returnValue = "";
        setShowDraftModal(true);
        return "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);
  return (
    <div className="flex">
      <div className="w-64 min-h-screen bg-gray-100">
        <Sidebar />
      </div>

      <div className="flex-1 min-h-screen bg-gray-50 font-sans text-gray-800 flex flex-col">
        <div className="p-6">
          <button
            onClick={async () => {
              const payload = {
                userId: localStorage.getItem("userid"),
                name: scenarioName,
                description: scenarioDescription,
                type: "other",
                routerBranches,
              };

              console.log(" Final payload:", JSON.stringify(payload, null, 2));

              const url = scenarioId
                ? `https://email-syncing-backend.vercel.app/scenario/detail/${scenarioId}`
                : `https://email-syncing-backend.vercel.app/scenario`;

              await fetch(url, {
                method: scenarioId ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
              });

              clearDraft();
              toast.success("Scenario saved successfully!");
            }}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            {scenarioId ? "Update Scenario" : "Save Scenario"}
          </button>
        </div>
        {/* <input
          type="text"
          value={scenarioName}
          onChange={(e) => setScenarioName(e.target.value)}
          placeholder="Enter scenario name"
          className="border rounded px-3 py-2 text-sm mb-4"
        /> */}

        <div className="flex-1 flex items-center justify-center relative">
          <div className="flex items-center justify-center w-full">
            <div className="relative">
              <div className="w-48 h-48 hover:border-red-600 cursor-pointer flex flex-col items-center justify-center rounded-full bg-red-500 text-white shadow-lg border-4 border-red-300 relative">
                <Cloud className="w-16 h-16 mb-1" />
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold border-2 border-white">
                  1
                </div>
              </div>

              <div className="absolute -bottom-3 -left-3 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-red-200">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">⚡</span>
                </div>
              </div>

              <div className="mt-4 text-center">
                <h3 className="font-semibold text-gray-800">Webhooks</h3>
                <p className="text-sm text-gray-600">Custom mailhook</p>
                <div className="inline-block mt-1 px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded">
                  1
                </div>
              </div>
            </div>

            {/* Connection Line */}
            <div className="flex items-center mx-8">
              <div className="w-4 h-4 rounded-full bg-pink-400"></div>
              <div className="w-4 h-4 rounded-full bg-pink-300 ml-2"></div>
              <div className="w-4 h-4 rounded-full bg-pink-200 ml-2"></div>
              <div className="w-4 h-4 rounded-full bg-pink-100 ml-2"></div>
              <div className="ml-4"></div>
            </div>

            <div className="relative">
              <div
                className="w-44 h-44 flex flex-col items-center justify-center rounded-full bg-green-400 text-white shadow-lg border-4 border-green-200 relative cursor-pointer hover:bg-green-500 transition-colors"
                onMouseEnter={handleRouterHover}
                onMouseLeave={handleRouterLeave}
              >
                <GitBranch className="w-12 h-12" />
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold border-2 border-white">
                  2
                </div>

                {routerHovered && (
                  <button
                    onClick={addRouterBranch}
                    className="absolute -right-6 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-green-300 hover:bg-gray-100 transition-all"
                  >
                    <Plus className="w-4 h-4 text-green-600" />
                  </button>
                )}
              </div>

              <div className="mt-4 text-center">
                <h3 className="font-semibold text-gray-800">Router</h3>
                <p className="text-sm text-gray-600">
                  Route to different paths
                </p>
                <div className="inline-block mt-1 px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded">
                  2
                </div>
              </div>
            </div>

            {showRouterBranches && (
              <div className="relative ml-12 flex flex-col space-y-12">
                {routerBranches.map((branch, branchIndex) => (
                  <div key={branch.id} className="flex items-center relative">
                    <div className="absolute -left-16 top-1/2 transform -translate-y-1/2 flex items-center">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="ml-2">
                          {i === 3 && branch.modules[0]?.type !== "Delay" ? (
                            branch.filter ? (
                              <button
                                onClick={() => openFilterModal(branchIndex)}
                                className="w-5 h-5 flex items-center justify-center bg-blue-500 text-white rounded-full hover:bg-blue-600"
                              >
                                <Funnel className="w-3 h-3" />
                              </button>
                            ) : (
                              <div
                                onClick={() => openFilterModal(branchIndex)}
                                className="w-5 h-5 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full cursor-pointer hover:bg-blue-200"
                              >
                                <Plus className="w-3 h-3" />
                              </div>
                            )
                          ) : (
                            <div
                              className={`w-3 h-3 rounded-full ${
                                i === 0
                                  ? "bg-green-500"
                                  : i === 1
                                  ? "bg-green-400"
                                  : i === 2
                                  ? "bg-green-300"
                                  : i === 4
                                  ? "bg-green-200"
                                  : "bg-green-100"
                              }`}
                            ></div>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center space-x-6 ml-12">
                      {branch.modules && branch.modules.length > 0 ? (
                        branch.modules.map((module, moduleIndex) => (
                          <React.Fragment key={module.id}>
                            <div className="relative">
                              <div
                                className={`w-20 h-20 flex flex-col items-center justify-center rounded-full ${module.app.color} text-white shadow-lg border-2 border-opacity-50`}
                              >
                                {module.app.icon}
                                <div className="absolute -top-1 -right-1 w-6 h-6 bg-black bg-opacity-80 text-white rounded-full flex items-center justify-center text-xs font-bold border border-white">
                                  {3 + moduleIndex}
                                </div>
                                <button
                                  onClick={() => {
                                    setEditingBranch(branchIndex);
                                    setSelectedModuleIndex(moduleIndex);

                                    const module =
                                      routerBranches[branchIndex].modules[
                                        moduleIndex
                                      ];

                                    if (module.type === "Delay") {
                                      setSelectedModule("delay");
                                    } else if (module.type === "Custom Email") {
                                      setSelectedModule("customEmail");
                                    } else {
                                      setSelectedModule("sendEmail");
                                    }

                                    setSelectedApp(module.app);

                                    // ✅ Restore multiple connections
                                    const connectionsToRestore = Array.isArray(
                                      module.connectionId
                                    )
                                      ? module.connectionId
                                      : [module.connectionId];

                                    setSelectedConnections(
                                      connectionsToRestore
                                    );

                                    connectionsToRestore.forEach((connId) => {
                                      setConnectionSubjects((prev) => ({
                                        ...prev,
                                        [connId]: module.subject || "",
                                      }));
                                      setConnectionTemplates((prev) => ({
                                        ...prev,
                                        [connId]: module.template || "",
                                      }));
                                    });
                                  }}
                                  className="absolute -top-2 -left-2 w-6 h-6 bg-yellow-400 text-white rounded-full flex items-center justify-center hover:bg-yellow-500"
                                >
                                  <Pencil className="w-3 h-3" />
                                </button>

                                <button
                                  onClick={() => {
                                    const updatedBranches = [...routerBranches];
                                    updatedBranches[branchIndex].modules =
                                      updatedBranches[
                                        branchIndex
                                      ].modules.filter(
                                        (_, i) => i !== moduleIndex
                                      );
                                    setRouterBranches(updatedBranches);
                                  }}
                                  className="absolute -bottom-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                                >
                                  <Trash className="w-3 h-3" />
                                </button>
                              </div>
                              <div className="mt-2 text-center">
                                <p className="text-xs font-medium text-gray-800">
                                  {module.app.name}
                                </p>
                                <div className="inline-block px-1 py-0.5 bg-gray-200 text-gray-600 text-xs rounded">
                                  {3 + moduleIndex}
                                </div>
                              </div>

                              <button
                                onClick={() => addModuleToBranch(branchIndex)}
                                className="absolute -right-3 top-6 w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center hover:bg-gray-400 transition-colors"
                              >
                                <Plus className="w-3 h-3 text-gray-600" />
                              </button>
                            </div>

                            {/* Connection dots between modules */}

                            {moduleIndex < branch.modules.length - 1 && (
                              <div className="flex items-center ml-4 space-x-2">
                                {Array.from({ length: 4 }).map((_, i) => (
                                  <div key={i}>
                                    {i === 1 ? (
                                      module.filter ? (
                                        <button
                                          onClick={() =>
                                            openFilterModal(
                                              branchIndex,
                                              moduleIndex
                                            )
                                          }
                                          className="w-6 h-6 flex items-center justify-center bg-blue-500 text-white rounded-full hover:bg-blue-600"
                                        >
                                          <Funnel className="w-3 h-3" />
                                        </button>
                                      ) : (
                                        <div
                                          onClick={() =>
                                            openFilterModal(
                                              branchIndex,
                                              moduleIndex
                                            )
                                          }
                                          className="w-3 h-3 rounded-full bg-blue-400 cursor-pointer hover:bg-blue-500"
                                        ></div>
                                      )
                                    ) : (
                                      <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </React.Fragment>
                        ))
                      ) : (
                        <button
                          onClick={() => handleBranchPlusClick(branchIndex)}
                          className="w-20 h-20 flex items-center justify-center rounded-full bg-gray-300 text-gray-600 shadow-lg border-2 border-gray-200 hover:bg-gray-400 hover:text-white transition-colors"
                        >
                          <Plus className="w-6 h-6" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {open && (
            <div
              ref={modalRef}
              className="absolute left-1/2 translate-x-36 bg-white rounded-lg shadow-lg w-96 z-10"
            >
              {!selectedApp ? (
                <>
                  <div className="p-4 border-b">
                    <h2 className="text-xs font-semibold text-gray-500">
                      ALL APPS
                    </h2>
                  </div>
                  <ul className="max-h-80 overflow-y-auto">
                    {apps.map((app, idx) => (
                      <li
                        key={idx}
                        onClick={() => setSelectedApp(app)}
                        className="flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer"
                      >
                        <div
                          className={`w-8 h-8 flex items-center justify-center rounded-full text-white ${app.color}`}
                        >
                          {app.icon}
                        </div>
                        <span className="ml-3 text-sm text-gray-700">
                          {app.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className="p-3 border-t">
                    <div className="flex items-center px-2 py-2 border rounded-md text-gray-500 text-sm">
                      <Search className="mr-2 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search apps or modules"
                        className="flex-1 outline-none text-gray-600 text-sm"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div
                    className="flex items-center px-4 py-3 text-sm text-purple-600 cursor-pointer hover:underline"
                    onClick={() => setSelectedApp(null)}
                  >
                    <ArrowLeft className="mr-2 w-4 h-4" /> BACK
                  </div>

                  <div className="flex flex-col items-center text-center p-6 bg-red-50">
                    <div
                      className={`w-12 h-12 flex items-center justify-center rounded-full text-white mb-3 ${selectedApp.color}`}
                    >
                      {selectedApp.icon}
                    </div>
                    <h2 className="text-lg font-semibold">
                      {selectedApp.name}
                    </h2>
                    <span className="text-xs text-purple-600 mt-1 px-2 py-0.5 rounded bg-purple-100">
                      Built-in
                    </span>
                  </div>

                  <div className="p-4 border-b">
                    <h3 className="text-xs font-semibold text-gray-500 mb-2">
                      ACTIONS
                    </h3>

                    <div
                      className="flex items-start cursor-pointer hover:bg-gray-50 p-2 rounded"
                      onClick={() => {
                        if (selectedApp.name === "Delay") {
                          setSelectedModule("delay");
                        } else if (selectedApp.name === "Email") {
                          setSelectedModule("customEmail");
                        } else {
                          setSelectedModule("sendEmail");
                        }
                      }}
                    >
                      <div
                        className={`w-8 h-8 flex items-center justify-center rounded-full text-white mr-3 ${selectedApp.color}`}
                      >
                        {selectedApp.icon}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-700">
                          {selectedApp.name === "Delay"
                            ? "Sleep"
                            : "Send an email"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {selectedApp.name === "Delay"
                            ? "Suspend the execution of a scenario."
                            : "Send an email via Gmail."}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* {showFilterDialog && (
            <div
              ref={modalRef}
              className="absolute top-10 right-10 bg-white rounded-lg shadow-xl w-[700px] border z-20"
            >
              <div className="flex justify-between items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-400 text-white rounded-t-lg">
                <h3 className="font-semibold">Set up a filter</h3>
                <div className="flex items-center space-x-2 text-sm">
                  <button>⋮</button>
                  <button>⚙</button>
                  <button>?</button>
                  <button onClick={() => setShowFilterDialog(false)}>✕</button>
                </div>
              </div>

              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Label
                  </label>
                  <input
                    type="text"
                    className="w-full border rounded px-3 py-2 text-sm"
                    placeholder="Enter label"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Condition
                  </label>
                  <div className="border rounded p-3 bg-blue-50 border-l-4 border-l-blue-500">
                    <div
                      className="w-full border rounded px-3 py-2 text-sm mb-2 flex flex-wrap items-center gap-2 min-h-[40px] cursor-text"
                      onClick={handleConditionClick}
                    >
                      {chips.map((chip, index) => (
                        <span
                          key={index}
                          className="bg-red-500 text-white text-xs px-2 py-1 rounded flex items-center"
                        >
                          {chip}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setChips((prev) =>
                                prev.filter((_, i) => i !== index)
                              );
                            }}
                            className="ml-2 text-white hover:text-gray-200"
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                      <input
                        type="text"
                        className="flex-1 outline-none text-sm"
                        placeholder="Type or select..."
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <select className="border rounded px-3 py-1 text-sm">
                        <option>Text operators: Equal to</option>
                        <option>Text operators: Contains</option>
                        <option>Text operators: Does not contain</option>
                      </select>
                      <button className="text-gray-400 hover:text-gray-600">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <input
                      type="text"
                      className="w-full border rounded px-3 py-2 text-sm mt-2"
                      placeholder="Enter value"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 px-4 py-3 border-t bg-gray-50">
                <button
                  onClick={() => {
                    const key = `${selectedBranchIndex}-${
                      selectedModuleIndex ?? "branch"
                    }`;
                    setFilters((prev) => ({
                      ...prev,
                      [key]: { conditions: chips, template: editorContent },
                    }));

                    const updatedBranches = [...routerBranches];
                    if (selectedModuleIndex === null) {
                      updatedBranches[selectedBranchIndex].filter = {
                        conditions: chips,
                        template: editorContent,
                      };
                    } else {
                      updatedBranches[selectedBranchIndex].modules[
                        selectedModuleIndex
                      ].filter = {
                        conditions: chips,
                        template: editorContent,
                      };
                    }
                    setRouterBranches(updatedBranches);

                    setShowFilterDialog(false);
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          )} */}
          {showFilterDialog && (
            <div
              ref={modalRef}
              className="absolute top-10 right-10 bg-white rounded-lg shadow-xl w-[700px] border z-20"
            >
              {/* Header */}
              <div className="flex justify-between items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-400 text-white rounded-t-lg">
                <h3 className="font-semibold">Set up a filter</h3>
                <div className="flex items-center space-x-2 text-sm">
                  <button>⋮</button>
                  <button>⚙</button>
                  <button>?</button>
                  <button onClick={() => setShowFilterDialog(false)}>✕</button>
                </div>
              </div>

              <div className="p-4 space-y-4">
                {/* Label Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Label
                  </label>
                  <input
                    type="text"
                    value={filterLabel}
                    onChange={(e) => setFilterLabel(e.target.value)}
                    className="w-full border rounded px-3 py-2 text-sm"
                    placeholder="Enter label"
                  />
                </div>

                {/* Conditions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Conditions
                  </label>

                  {conditions.map((cond, index) => (
                    <div
                      key={index}
                      className="border rounded p-3 bg-blue-50 border-l-4 border-l-blue-500 mb-3"
                    >
                      {/* Join (AND/OR) */}
                      {cond.join && (
                        <div className="text-xs font-bold text-gray-600 mb-2">
                          {cond.join}
                        </div>
                      )}

                      {/* Field */}
                      <select
                        value={cond.field}
                        onChange={(e) =>
                          handleUpdateCondition(index, "field", e.target.value)
                        }
                        className="border rounded px-3 py-1 text-sm w-full mb-2"
                      >
                        <option value="">-- Select Field --</option>
                        <option value="From">From</option>
                        <option value="To">To</option>
                        <option value="Subject">Subject</option>
                        <option value="Body">Body</option>
                      </select>

                      {/* Operator */}
                      <select
                        value={cond.operator}
                        onChange={(e) =>
                          handleUpdateCondition(
                            index,
                            "operator",
                            e.target.value
                          )
                        }
                        className="border rounded px-3 py-1 text-sm w-full mb-2"
                      >
                        <option>Equal to</option>
                        <option>Contains</option>
                        <option>Does not contain</option>
                      </select>

                      {/* Value */}
                      <input
                        type="text"
                        value={cond.value}
                        onChange={(e) =>
                          handleUpdateCondition(index, "value", e.target.value)
                        }
                        className="w-full border rounded px-3 py-2 text-sm"
                        placeholder="Enter value"
                      />

                      {/* Remove Button */}
                      <button
                        onClick={() =>
                          setConditions((prev) =>
                            prev.filter((_, i) => i !== index)
                          )
                        }
                        className="text-red-500 text-xs mt-2"
                      >
                        Remove
                      </button>
                    </div>
                  ))}

                  {/* Add Condition Buttons */}
                  <div className="flex space-x-2 mt-4">
                    <button
                      onClick={() => handleAddCondition("AND")}
                      className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                    >
                      + Add AND Condition
                    </button>
                    <button
                      onClick={() => handleAddCondition("OR")}
                      className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                    >
                      + Add OR Condition
                    </button>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end space-x-2 px-4 py-3 border-t bg-gray-50">
                <button
                  onClick={handleSaveFilter} // ✅ just call the function
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                >
                  Save
                </button>
              </div>
            </div>
          )}

          {showDataPanel && (
            <div
              ref={modalRef}
              className="absolute top-10 left-10 bg-white rounded-lg shadow-xl w-80 border z-30"
            >
              <div className="p-3 border-b bg-gray-50">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm">Search items</h4>
                  <button onClick={() => setShowDataPanel(false)}>
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <input
                  type="text"
                  className="w-full border rounded px-2 py-1 text-sm mt-2"
                  placeholder="Search..."
                />
              </div>

              <div className="max-h-96 overflow-y-auto">
                <div className="p-2">
                  <button className="text-xs text-gray-500 hover:text-gray-700 mb-2">
                    ▼ Collapse all
                  </button>

                  {availableData.map((module, moduleIndex) => (
                    <div key={moduleIndex} className="mb-4">
                      ...
                      <div className="ml-8 space-y-1">
                        {module.fields.map((field, fieldIndex) => (
                          <div key={fieldIndex}>
                            <div
                              className="text-xs bg-pink-600 text-white px-2 py-1 rounded cursor-pointer hover:bg-pink-700 inline-block"
                              onClick={() => {
                                if (dataPanelFor === "condition") {
                                  setChips((prev) => [...prev, field.name]);
                                } else if (
                                  dataPanelFor?.startsWith("module:")
                                ) {
                                  const [_, bIndex, mIndex] =
                                    dataPanelFor.split(":");
                                  const quill =
                                    quillRefs.current[
                                      `${bIndex}-${mIndex}`
                                    ]?.getEditor();
                                  if (quill) {
                                    const range = quill.getSelection(true);
                                    quill.insertText(
                                      range.index,
                                      `{{${field.name}}}`,
                                      "user"
                                    );
                                    quill.setSelection(
                                      range.index + field.name.length + 4
                                    );
                                  }
                                }
                                setShowDataPanel(false);
                              }}
                            >
                              {field.name}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          {(selectedModule === "delay" ||
            selectedModule === "sendEmail" ||
            selectedModule === "customEmail") && (
            <div className="absolute top-10 right-10 bg-white rounded-lg shadow-xl w-[500px] border z-20">
              <div className="flex justify-between items-center px-4 py-2 bg-gradient-to-r from-[#e45341] to-[#f46654] text-white rounded-t-lg">
                <h3 className="font-semibold">
                  {selectedApp?.name || "Module"}
                </h3>
                <div className="space-x-2 text-sm">
                  <button>⋮</button>
                  <button>?</button>
                  <button onClick={() => setSelectedModule(null)}>✕</button>
                </div>
              </div>

              <div className="p-4">
                {selectedModule === "delay" && (
                  <>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Delay <span className="text-red-500">*</span>
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        className="w-20 border rounded px-2 py-1 text-sm"
                        value={delayValue}
                        onChange={(e) => setDelayValue(e.target.value)}
                      />
                      <select
                        className="border rounded px-2 py-1 text-sm"
                        value={delayUnit}
                        onChange={(e) => setDelayUnit(e.target.value)}
                      >
                        <option value="seconds">Seconds</option>
                        <option value="minutes">Minutes</option>
                        <option value="hours">Hours</option>
                      </select>
                    </div>
                  </>
                )}

                {selectedModule === "customEmail" && (
                  <>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Outlook Connection <span className="text-red-500">*</span>
                    </label>

                    {/* Multi-select dropdown with Outlook icons */}
                    <div className="relative w-full mb-4">
                      <button
                        type="button"
                        onClick={() => setShowDropdown(!showDropdown)}
                        className="w-full flex justify-between items-center border rounded px-3 py-2 text-sm bg-white shadow-sm"
                      >
                        {selectedConnections.length > 0 ? (
                          <span className="flex flex-wrap gap-2">
                            {selectedConnections.map((id) => {
                              const conn = connections.find(
                                (c) => c._id === id && c.provider === "outlook"
                              );
                              if (!conn) return null;
                              return (
                                <span
                                  key={id}
                                  className="flex items-center px-2 py-1 bg-purple-100 rounded text-xs"
                                >
                                  <FaMicrosoft className="text-blue-600 mr-1" />
                                  Outlook: {conn.email}
                                </span>
                              );
                            })}
                          </span>
                        ) : (
                          "Select Outlook Connections"
                        )}
                        <span>▾</span>
                      </button>

                      {showDropdown && (
                        <ul className="absolute z-10 mt-1 w-full border rounded bg-white shadow-lg max-h-60 overflow-y-auto">
                          {connections
                            .filter((conn) => conn.provider === "outlook") // ✅ sirf Outlook connections dikhayega
                            .map((conn) => {
                              const isSelected = selectedConnections.includes(
                                conn._id
                              );
                              return (
                                <li
                                  key={conn._id}
                                  onClick={() => {
                                    setSelectedConnections((prev) =>
                                      isSelected
                                        ? prev.filter((id) => id !== conn._id)
                                        : [...prev, conn._id]
                                    );
                                  }}
                                  className={`flex items-center px-3 py-2 cursor-pointer hover:bg-gray-100 text-sm ${
                                    isSelected ? "bg-purple-100" : ""
                                  }`}
                                >
                                  <FaMicrosoft className="text-blue-600 mr-2" />
                                  Outlook: {conn.email}
                                </li>
                              );
                            })}
                        </ul>
                      )}
                    </div>

                    {/* Multiple editors - one per selected Outlook connection */}
                    {selectedConnections.map((connId) => {
                      const conn = connections.find(
                        (c) => c._id === connId && c.provider === "outlook"
                      );
                      if (!conn) return null;

                      return (
                        <div
                          key={connId}
                          className="mb-6 border rounded p-3 bg-gray-50"
                        >
                          <h4 className="flex items-center mb-2 text-sm font-semibold text-gray-700">
                            <FaMicrosoft className="text-blue-600 mr-2" />
                            Outlook: {conn.email}
                          </h4>

                          {/* Subject field */}
                          <input
                            type="text"
                            value={connectionSubjects[connId] || ""}
                            onChange={(e) =>
                              setConnectionSubjects((prev) => ({
                                ...prev,
                                [connId]: e.target.value,
                              }))
                            }
                            className="w-full border rounded px-2 py-1 text-sm mb-3"
                            placeholder="Email subject"
                          />

                          {/* Rich Text Template editor */}
                          <ReactQuill
                            theme="snow"
                            value={connectionTemplates[connId] || ""}
                            onChange={(value) =>
                              setConnectionTemplates((prev) => ({
                                ...prev,
                                [connId]: value,
                              }))
                            }
                            className="h-40 mb-2"
                          />

                          <p className="text-xs text-gray-500 mt-1">
                            Example: <code>Hello {"{customer.name}"}</code>
                            <br />
                            You can use dynamic variables like{" "}
                            <code>{"{order.id}"}</code> or{" "}
                            <code>{"{email}"}</code>.
                          </p>
                        </div>
                      );
                    })}

                    {/* Recipient field (shared) */}
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        To <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        className="w-full border rounded px-2 py-1 text-sm"
                        placeholder="recipient@example.com"
                      />
                    </div>
                  </>
                )}

                {selectedModule === "sendEmail" && (
                  <>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Connection <span className="text-red-500">*</span>
                    </label>

                    {/* Multi-select dropdown with icons */}
                    <div className="relative w-full mb-4">
                      <button
                        type="button"
                        onClick={() => setShowDropdown(!showDropdown)}
                        className="w-full flex justify-between items-center border rounded px-3 py-2 text-sm bg-white shadow-sm"
                      >
                        {selectedConnections.length > 0 ? (
                          <span className="flex flex-wrap gap-2">
                            {selectedConnections.map((id) => {
                              const conn = connections.find(
                                (c) => c._id === id
                              );
                              if (!conn) return null;
                              return (
                                <span
                                  key={id}
                                  className="flex items-center px-2 py-1 bg-purple-100 rounded text-xs"
                                >
                                  {conn.provider === "gmail" ? (
                                    <FaGoogle className="text-red-500 mr-1" />
                                  ) : (
                                    <FaEnvelope className="text-blue-500 mr-1" />
                                  )}
                                  {conn.provider === "gmail"
                                    ? `Gmail: ${conn.email}`
                                    : `SMTP: ${conn.name || conn.email}`}
                                </span>
                              );
                            })}
                          </span>
                        ) : (
                          "Select Connections"
                        )}
                        <span>▾</span>
                      </button>

                      {showDropdown && (
                        <ul className="absolute z-10 mt-1 w-full border rounded bg-white shadow-lg max-h-60 overflow-y-auto">
                          {connections
                            .filter((conn) => conn.provider === "gmail") // ✅ sirf Gmail dikhayega
                            .map((conn) => {
                              const isSelected = selectedConnections.includes(
                                conn._id
                              );
                              return (
                                <li
                                  key={conn._id}
                                  // onClick={() => {
                                  //   setSelectedConnections((prev) =>
                                  //     isSelected
                                  //       ? prev.filter((id) => id !== conn._id)
                                  //       : [...prev, conn._id]
                                  //   );
                                  // }}
                                  onClick={() => {
                                    setSelectedConnections([conn._id]); // ✅ ek hi connection allow
                                    setShowDropdown(false); // ✅ select karte hi dropdown band
                                  }}
                                  className={`flex items-center px-3 py-2 cursor-pointer hover:bg-gray-100 text-sm ${
                                    selectedConnections.includes(conn._id)
                                      ? "bg-purple-100"
                                      : ""
                                  }`}
                                >
                                  <FaGoogle className="text-red-500 mr-2" />
                                  Gmail: {conn.email}
                                </li>
                              );
                            })}
                        </ul>
                      )}
                    </div>

                    {/* Multiple editors - one for each selected connection */}
                    {selectedConnections.map((connId) => {
                      const conn = connections.find((c) => c._id === connId);
                      if (!conn) return null;

                      return (
                        <div
                          key={connId}
                          className="mb-6 border rounded p-3 bg-gray-50"
                        >
                          <h4 className="flex items-center mb-2 text-sm font-semibold text-gray-700">
                            {conn.provider === "gmail" ? (
                              <FaGoogle className="text-red-500 mr-2" />
                            ) : (
                              <FaEnvelope className="text-blue-500 mr-2" />
                            )}
                            {conn.provider === "gmail"
                              ? `Gmail: ${conn.email}`
                              : `SMTP: ${conn.name || conn.email}`}
                          </h4>

                          {/* Subject field */}
                          <input
                            type="text"
                            value={connectionSubjects[connId] || ""}
                            onChange={(e) =>
                              setConnectionSubjects((prev) => ({
                                ...prev,
                                [connId]: e.target.value,
                              }))
                            }
                            className="w-full border rounded px-2 py-1 text-sm mb-3"
                            placeholder="Email subject"
                          />

                          {/* Template editor */}
                          <ReactQuill
                            theme="snow"
                            value={connectionTemplates[connId] || ""}
                            onChange={(value) =>
                              setConnectionTemplates((prev) => ({
                                ...prev,
                                [connId]: value,
                              }))
                            }
                            className="h-40 mb-2"
                          />

                          <p className="text-xs text-gray-500 mt-1">
                            Example: <code>Hello {"{customer.name}"}</code>
                            <br />
                            You can use dynamic variables like{" "}
                            <code>{"{order.id}"}</code> or{" "}
                            <code>{"{email}"}</code>.
                          </p>
                        </div>
                      );
                    })}

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        To <span className="text-red-500">*</span>
                      </label>

                      <div className="flex items-center flex-wrap gap-2 border rounded px-2 py-2 bg-gray-50 cursor-not-allowed">
                        <span className="flex items-center bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-medium">
                          Sender Email Address
                        </span>

                        <input
                          type="text"
                          disabled
                          className="flex-1 bg-transparent outline-none text-sm text-gray-400 "
                          placeholder=""
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="mt-4">
                  <label className="flex items-center text-sm text-gray-600">
                    <input type="checkbox" className="mr-2" /> Advanced settings
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-2 px-4 py-2 border-t">
                <button
                  className="px-4 py-2 text-sm border rounded"
                  onClick={() => setSelectedModule(null)}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 text-sm bg-purple-600 text-white rounded hover:bg-purple-700"
                >
                  Save
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      {showDraftModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h3 className="text-lg font-semibold mb-4">Unsaved Changes</h3>
            <p className="mb-6">
              You have unsaved scenario changes. Do you want to restore or
              discard?
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  clearDraft();
                  setShowDraftModal(false);
                }}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Discard
              </button>
              <button
                onClick={() => {
                  const draft = getDraft();
                  if (draft) {
                    setRouterBranches(draft.routerBranches || []);
                    setScenarioName(draft.name || "");
                    setScenarioDescription(draft.description || "");
                  }
                  setShowDraftModal(false);
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                Restore
              </button>
            </div>
          </div>
        </div>
      )}
      <ConnectionModal isOpen={isModalOpen} onClose={closeModal} />
    </div>
  );
};

export default OthersScenariosPage;

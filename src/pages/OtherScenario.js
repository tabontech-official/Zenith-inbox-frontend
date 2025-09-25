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
import { FaGoogle } from "react-icons/fa";
import ConnectionModal from "../component/ConnectionModal";

const AllScenariosPage = () => {
  const [open, setOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);
  const [savedModule, setSavedModule] = useState(null);
  const [savedSecondModule, setSavedSecondModule] = useState(null);
  const [savedThirdModule, setSavedThirdModule] = useState(null);
  const [showRouterBranches, setShowRouterBranches] = useState(false);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [showDataPanel, setShowDataPanel] = useState(false);
  // const [routerBranches, setRouterBranches] = useState([]);
  const [routerBranches, setRouterBranches] = useState([
    { id: 2, hasModule: false, condition: null, modules: [], filter: null },
  ]);
  const [selectedBranchIndex, setSelectedBranchIndex] = useState(null);
  const [routerHovered, setRouterHovered] = useState(false);
  const [branchModules, setBranchModules] = useState({});
  const [editingBranch, setEditingBranch] = useState(null);
  const modalRef = useRef(null);
  const [chips, setChips] = useState([]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setOpen(false);
        setShowFilterDialog(false);
        setShowDataPanel(false);
        // setSelectedModule(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
        { name: "Message ID", type: "text" },
        { name: "Subject", type: "text" },
        { name: "Date", type: "date" },
        { name: "HTML content", type: "html" },
        {
          name: "Sender",
          type: "object",
          subFields: ["Name", "Email address"],
        },
        { name: "Recipients[]", type: "array" },
        { name: "Copy Recipients[]", type: "array" },
        { name: "Blind copy recipients[]", type: "array" },
        { name: "Attachments[]", type: "array" },
        { name: "Headers", type: "object" },
      ],
    },
    {
      module: "Webhooks",
      type: "Custom mailhook",
      fields: [
        { name: "Date", type: "date" },
        { name: "Subject", type: "text" },
        { name: "Text", type: "text" },
        { name: "HTML content", type: "html" },
        {
          name: "Sender",
          type: "object",
          subFields: ["Name", "Email address"],
        },
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
      // { id: 1, hasModule: false, condition: null, modules: [] },
      { id: 2, hasModule: false, condition: null, modules: [] },
    ]);
  }, []);

  const handleSave = () => {
    if (editingBranch !== null) {
      const updatedBranches = [...routerBranches];
      if (!updatedBranches[editingBranch].modules) {
        updatedBranches[editingBranch].modules = [];
      }

      let type = "";
      let description = "";

      if (selectedModule === "delay") {
        type = "Delay";
        description = "Delay execution";
      } else if (selectedApp?.name === "Email") {
        type = "Custom Email";
        description = "Send an email using custom SMTP";
      } else {
        type = "Send an Email";
        description = "Send an email via Gmail";
      }

      updatedBranches[editingBranch].modules.push({
        app: selectedApp,
        type,
        description,
        id: Date.now(),
      });

      setRouterBranches(updatedBranches);
      setEditingBranch(null);
    }

    setSelectedModule(null);
    setOpen(false);
    setSelectedApp(null);
  };

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
      filter: null, // initially no filter
    };

    setRouterBranches([...routerBranches, newBranch]);
  };

  const handleBranchPlusClick = (branchIndex) => {
    setSelectedBranchIndex(branchIndex);
    setEditingBranch(branchIndex);
    setOpen(true);
  };

  const handleConditionClick = () => {
    setShowDataPanel(true);
  };

  const addModuleToBranch = (branchIndex) => {
    setEditingBranch(branchIndex);
    setOpen(true);
  };
  const renderConnectionLine = (startX, startY, endX, endY) => {
    return (
      <svg
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <line
          x1={startX}
          y1={startY}
          x2={endX}
          y2={endY}
          stroke="gray"
          strokeWidth="2"
          strokeDasharray="5,5"
        />
      </svg>
    );
  };

  return (
    <div className="flex">
      <div className="w-64 min-h-screen bg-gray-100">
        <Sidebar />
      </div>

      <div className="flex-1 min-h-screen bg-gray-50 font-sans text-gray-800 flex flex-col">
        <div className="p-6">
          <button className="flex items-center px-4 py-2 text-sm text-gray-700 bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-100">
            <ArrowLeft className="mr-2 w-4 h-4" />
            New scenario
            <Settings className="ml-2 w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center relative">
          <div className="flex items-center justify-center w-full">
            {/* Webhook Module */}
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
                    {/* Dotted Connection from Router to Branch */}
                    <div className="absolute -left-16 top-1/2 transform -translate-y-1/2 flex items-center">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="ml-2">
                          {i === 3 ? ( // middle dot for filter
                            branch.filter ? (
                              <button
                                onClick={() => {
                                  setSelectedBranchIndex(branchIndex);
                                  setShowFilterDialog(true);
                                }}
                                className="w-5 h-5 flex items-center justify-center bg-blue-500 text-white rounded-full hover:bg-blue-600"
                              >
                                <Funnel className="w-3 h-3" />
                              </button>
                            ) : (
                              <div
                                onClick={() => {
                                  setSelectedBranchIndex(branchIndex);
                                  setShowFilterDialog(true);
                                }}
                                className="w-3 h-3 rounded-full bg-blue-400 cursor-pointer hover:bg-blue-500"
                              ></div>
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
                                {/* Edit button */}
                        <button
  onClick={() => {
    setEditingBranch(branchIndex);

    if (module.type === "Delay") {
      setSelectedModule("delay");
    } else if (module.type === "Custom Email") {
      setSelectedModule("customEmail");  // ✅ correctly map custom email
    } else {
      setSelectedModule("sendEmail");
    }

    setSelectedApp(module.app);
  }}
  className="absolute -top-2 -left-2 w-6 h-6 bg-yellow-400 text-white rounded-full flex items-center justify-center hover:bg-yellow-500"
>
  <Pencil className="w-3 h-3" />
</button>

                                {/* Delete button */}
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
                              <div className="flex items-center ml-4">
                                <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                                <div className="w-2 h-2 rounded-full bg-gray-300 ml-2"></div>
                                <div className="w-2 h-2 rounded-full bg-gray-200 ml-2"></div>
                              </div>
                            )}
                          </React.Fragment>
                        ))
                      ) : (
                        // Default Plus button if no module in branch
                        <button
                          onClick={() => handleBranchPlusClick(branchIndex)}
                          className="w-20 h-20 flex items-center justify-center rounded-full bg-gray-300 text-gray-600 shadow-lg border-2 border-gray-200 hover:bg-gray-400 hover:text-white transition-colors"
                        >
                          <Plus className="w-6 h-6" />
                        </button>
                      )}

                      {/* Filter Button */}
                      {/* <button
                        onClick={() => {
                          setSelectedBranchIndex(branchIndex);
                          setShowFilterDialog(true);
                        }}
                        className="ml-2 px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded hover:bg-blue-200 transition-colors border border-blue-300"
                      >
                        + Filter
                      </button> */}
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
                      onClick={() =>
                        setSelectedModule(
                          selectedApp.name === "Delay" ? "delay" : "sendEmail"
                        )
                      }
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

          {showFilterDialog && (
            <div
              ref={modalRef}
              className="absolute top-10 right-10 bg-white rounded-lg shadow-xl w-[500px] border z-20"
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
                  <div className="flex space-x-2 mt-2">
                    <button className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700">
                      Add AND rule
                    </button>
                    <button className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700">
                      Add OR rule
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 px-4 py-3 border-t bg-gray-50">
               <button
  className="px-4 py-2 text-sm bg-purple-600 text-white rounded hover:bg-purple-700"
  onClick={() => {
    const updatedBranches = [...routerBranches];
    updatedBranches[selectedBranchIndex].filter = {
      label: "My Filter", 
      conditions: chips,   
    };
    setRouterBranches(updatedBranches);
    setShowFilterDialog(false);
  }}
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
                      <div className="flex items-center mb-2">
                        <div
                          className={`w-6 h-6 flex items-center justify-center rounded-full text-white text-xs mr-2 ${
                            module.module === "Gmail"
                              ? "bg-red-500"
                              : "bg-pink-500"
                          }`}
                        >
                          {module.module === "Gmail" ? (
                            <Mail className="w-3 h-3" />
                          ) : (
                            "🔗"
                          )}
                        </div>
                        <span className="text-sm font-medium">
                          {module.module}
                        </span>
                        <span className="text-xs text-gray-500 ml-1">
                          {moduleIndex + 1}
                        </span>
                        <span className="text-xs text-gray-600 ml-2">
                          - {module.type}
                        </span>
                      </div>

                      <div className="ml-8 space-y-1">
                        {module.fields.map((field, fieldIndex) => (
                          <div key={fieldIndex}>
                            <div
                              className="text-xs bg-pink-600 text-white px-2 py-1 rounded cursor-pointer hover:bg-pink-700 inline-block"
                              onClick={() => {
                                setChips((prev) => [...prev, field.name]);
                                setShowDataPanel(false);
                              }}
                            >
                              {field.name}
                            </div>
                            {field.subFields && (
                              <div className="ml-4 mt-1 space-y-1">
                                {field.subFields.map((subField, subIndex) => (
                                  <div
                                    key={subIndex}
                                    onClick={() => {
                                      setChips((prev) => [...prev, subField]);
                                      setShowDataPanel(false);
                                    }}
                                    className="text-xs bg-pink-500 text-white px-2 py-1 rounded cursor-pointer hover:bg-pink-600 inline-block mr-1"
                                  >
                                    {subField}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {(selectedModule === "delay" || selectedModule === "sendEmail") && (
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
                {selectedModule === "delay" ? (
                  <>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Delay <span className="text-red-500">*</span>
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        className="w-20 border rounded px-2 py-1 text-sm"
                        placeholder="5"
                        defaultValue="5"
                      />
                      <select className="border rounded px-2 py-1 text-sm">
                        <option value="seconds">Seconds</option>
                        <option value="minutes">Minutes</option>
                        <option value="hours">Hours</option>
                      </select>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Suspend the execution of the scenario for the specified
                      duration.
                    </p>
                  </>
                ) : selectedApp?.name === "Email" ? (
                  <>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SMTP Server <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className="w-full border rounded px-2 py-1 text-sm"
                      placeholder="smtp.example.com"
                    />

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

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Subject <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        className="w-full border rounded px-2 py-1 text-sm"
                        placeholder="Email subject"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Connection <span className="text-red-500">*</span>
                    </label>
                    <button
                      onClick={openModal}
                      className="flex mb-4 items-center px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-[#f55641] to-[#f0614e] rounded-lg shadow hover:from-[#e45341] hover:to-[#f04f3a] focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                    >
                      <FaGoogle className="h-5 w-5 mr-2" />
                      Create Connection
                    </button>
                    <select className="w-full border rounded px-2 py-1 text-sm">
                      <option value="gmail-connection">
                        My Gmail Connection
                      </option>
                    </select>

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

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Subject <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        className="w-full border rounded px-2 py-1 text-sm"
                        placeholder="Email subject"
                      />
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
      <ConnectionModal isOpen={isModalOpen} onClose={closeModal} />
    </div>
  );
};

export default AllScenariosPage;

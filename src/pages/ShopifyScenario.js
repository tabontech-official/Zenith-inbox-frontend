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
} from "lucide-react";
import { CiLink } from "react-icons/ci";

import Sidebar from "../component/Sidebar";
import {
  FiAlertCircle,
  FiCode,
  FiHome,
  FiShuffle,
  FiFileText,
  FiSearch,
  FiTrendingUp,
  FiCpu,
  FiSettings,
  FiBox,
  FiShare2,
  FiType,
  FiGlobe,
  FiCreditCard,
  FiLink,
  FiBarChart2,
  FiActivity,
  FiImage,
  FiBriefcase,
  FiClipboard,
  FiPercent,
  FiCamera,
  FiMail,
  FiBox as FiBox3D,
  FiMonitor,
  FiVideo,
  FiBookOpen,
  FiPackage,
  FiUsers,
  FiUserX,
} from "react-icons/fi";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const ShopifyScenariosPage = () => {
  const [open, setOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);
  const [savedModule, setSavedModule] = useState(null);
  const [savedSecondModule, setSavedSecondModule] = useState(null);
  const [savedThirdModule, setSavedThirdModule] = useState(null);
  const [showRouterBranches, setShowRouterBranches] = useState(false);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [showDataPanel, setShowDataPanel] = useState(false);
  const [routerBranches, setRouterBranches] = useState([]);
  const [selectedBranchIndex, setSelectedBranchIndex] = useState(null);
  const [routerHovered, setRouterHovered] = useState(false);
  const [branchModules, setBranchModules] = useState({});
  const [editingBranch, setEditingBranch] = useState(null);
  const [editorValue, setEditorValue] = useState("");
  const [activeConditionTarget, setActiveConditionTarget] = useState(null);
  const [connections, setConnections] = useState([]); // fetched connections
  const [selectedConnection, setSelectedConnection] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [cc, setCc] = useState("");
  const [bcc, setBcc] = useState("");
  const modalRef = useRef(null);
  const [ccList, setCcList] = useState([]);
  const [bccList, setBccList] = useState([]);
  const [ccInput, setCcInput] = useState("");
  const [bccInput, setBccInput] = useState("");
  const handleAddEmail = (e, type) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const value = type === "cc" ? ccInput.trim() : bccInput.trim();

      if (value && /\S+@\S+\.\S+/.test(value)) {
        if (type === "cc") {
          setCcList([...ccList, value]);
          setCcInput("");
        } else {
          setBccList([...bccList, value]);
          setBccInput("");
        }
      }
    }
  };

  const handleRemoveEmail = (type, index) => {
    if (type === "cc") {
      setCcList(ccList.filter((_, i) => i !== index));
    } else {
      setBccList(bccList.filter((_, i) => i !== index));
    }
  };

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/auth/getConnection/${localStorage.getItem(
            "userid"
          )}`
        );
        const data = await res.json();
        setConnections(data);
      } catch (err) {
        console.error("Error fetching connections:", err);
      }
    };
    fetchConnections();
  }, []);

  useEffect(() => {
    if (selectedApp?.name) {
      const fetchTemplates = async () => {
        try {
          const res = await fetch(
            `http://localhost:5000/template/all?userId=${localStorage.getItem(
              "userid"
            )}&platform=shopify&service=${selectedApp.name}`
          );
          const data = await res.json();
          setTemplates(data);
        } catch (err) {
          console.error("Error fetching templates:", err);
        }
      };
      fetchTemplates();
    }
  }, [selectedApp]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        // Close all open boxes if clicked outside
        setOpen(false);
        setShowFilterDialog(false);
        setShowDataPanel(false);
        setSelectedModule(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const apps = [
    {
      name: "Troubleshooting",
      color: "bg-purple-500",
      icon: <FiAlertCircle />,
    },
    { name: "Delay", color: "bg-blue-500", icon: <Clock /> },

    { name: "Theme customization", color: "bg-indigo-500", icon: <FiCode /> },
    { name: "Store build or redesign", color: "bg-blue-500", icon: <FiHome /> },
    { name: "Store migration", color: "bg-teal-500", icon: <FiShuffle /> },
    {
      name: "Website and marketing content",
      color: "bg-pink-500",
      icon: <FiFileText />,
    },
    { name: "SEO", color: "bg-green-500", icon: <FiSearch /> },
    {
      name: "Site performance and speed",
      color: "bg-yellow-500",
      icon: <FiTrendingUp />,
    },
    {
      name: "Custom apps and integrations",
      color: "bg-red-500",
      icon: <FiCpu />,
    },
    {
      name: "Store settings configuration",
      color: "bg-orange-500",
      icon: <FiSettings />,
    },
    {
      name: "Product and collection setup",
      color: "bg-lime-500",
      icon: <FiBox />,
    },
    {
      name: "Social media marketing",
      color: "bg-cyan-500",
      icon: <FiShare2 />,
    },
    { name: "Product descriptions", color: "bg-violet-500", icon: <FiType /> },
    {
      name: "Search engine advertising",
      color: "bg-emerald-500",
      icon: <FiGlobe />,
    },
    {
      name: "POS setup and migration",
      color: "bg-fuchsia-500",
      icon: <FiCreditCard />,
    },
    { name: "Custom domain setup", color: "bg-rose-500", icon: <FiLink /> },
    {
      name: "Conversion rate optimization",
      color: "bg-sky-500",
      icon: <FiBarChart2 />,
    },
    {
      name: "Analytics and tracking",
      color: "bg-slate-500",
      icon: <FiActivity />,
    },
    { name: "Sales channel setup", color: "bg-amber-500", icon: <FiGlobe /> },
    {
      name: "Logo and visual branding",
      color: "bg-purple-400",
      icon: <FiImage />,
    },
    {
      name: "Business strategy guidance",
      color: "bg-green-400",
      icon: <FiBriefcase />,
    },
    {
      name: "Website audit and optimization strategy",
      color: "bg-indigo-400",
      icon: <FiClipboard />,
    },
    { name: "Sales tax guidance", color: "bg-orange-400", icon: <FiPercent /> },
    { name: "Product photography", color: "bg-pink-400", icon: <FiCamera /> },
    { name: "Email marketing", color: "bg-blue-400", icon: <FiMail /> },
    { name: "3D modelling", color: "bg-teal-400", icon: <FiBox3D /> },
    { name: "Banner ads", color: "bg-yellow-400", icon: <FiMonitor /> },
    { name: "Video and illustrations", color: "bg-red-400", icon: <FiVideo /> },
    { name: "Content marketing", color: "bg-lime-400", icon: <FiBookOpen /> },
    {
      name: "Product sourcing guidance",
      color: "bg-fuchsia-400",
      icon: <FiPackage />,
    },
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
  ];

  const handleInsertField = (fieldName) => {
    if (activeConditionTarget === "input") {
      const inputEl = document.getElementById("condition-input");
      if (inputEl) {
        inputEl.value = inputEl.value + ` {{${fieldName}}} `;
      }
    } else if (activeConditionTarget === "quill") {
      setEditorValue((prev) => prev + ` {{${fieldName}}} `);
    }
    setShowDataPanel(false);
  };

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
                        <div
                          key={i}
                          className={`w-3 h-3 rounded-full ml-2 ${
                            i === 0
                              ? "bg-green-500"
                              : i === 1
                              ? "bg-green-400"
                              : i === 2
                              ? "bg-green-300"
                              : i === 3
                              ? "bg-green-200"
                              : "bg-green-100"
                          }`}
                        ></div>
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

                    <span className="text-xs text-white mt-1 px-2 py-0.5 rounded bg-purple-600">
                      Customize Template
                    </span>
                  </div>

                  {/* Actions */}
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
                          {"Customize template"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {`Use this template for ${selectedApp.name}.`}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {selectedApp && (
            <div className="absolute top-10 right-10 bg-white rounded-lg shadow-xl w-[600px] border z-20">
              <div className="flex justify-between items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-400 text-white rounded-t-lg">
                <h3 className="font-semibold">{selectedApp.name}</h3>
                <div className="space-x-2 text-sm">
                  <button>⋮</button>
                  <button>?</button>
                  <button onClick={() => setSelectedApp(null)}>✕</button>
                </div>
              </div>

              <div className="p-4 space-y-4">
                {selectedApp.name === "Delay" ? (
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
                ) : (
                  <>
  {/* Select Connection */}
  <div className="mb-4">
    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
      <FiMail className="mr-2 text-gray-500" /> Select Connection
    </label>
    <div className="flex items-center border rounded-lg px-2 py-1 focus-within:ring-2 focus-within:ring-purple-500">
      {selectedConnection ? (
        <span className="flex items-center bg-purple-100 text-purple-700 text-sm px-2 py-1 rounded-full mr-2">
          <FiMail className="mr-1" />
          {connections.find((c) => c._id === selectedConnection)?.provider.toUpperCase()} -{" "}
          {connections.find((c) => c._id === selectedConnection)?.email ||
            connections.find((c) => c._id === selectedConnection)?.name}
          <button
            type="button"
            onClick={() => setSelectedConnection("")}
            className="ml-2 text-xs text-red-500 hover:text-red-700"
          >
            <FiUserX />
          </button>
        </span>
      ) : (
        <select
          value={selectedConnection}
          onChange={(e) => setSelectedConnection(e.target.value)}
          className="flex-1 border-none outline-none text-sm py-1 px-2 bg-transparent"
        >
          <option value="">-- Select Connection --</option>
          {connections
            .filter(
              (c) =>
                c.provider === "gmail" ||
                c.provider === "outlook" ||
                c.provider === "smtp"
            )
            .map((c) => (
              <option key={c._id} value={c._id}>
                {c.provider.toUpperCase()} - {c.email || c.name}
              </option>
            ))}
        </select>
      )}
    </div>
  </div>

  {/* Select Template */}
  <div className="mb-4">
    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
      <FiFileText className="mr-2 text-gray-500" /> Select Template
    </label>
    <div className="flex items-center border rounded-lg px-2 py-1 focus-within:ring-2 focus-within:ring-purple-500">
      {selectedTemplate ? (
        <span className="flex items-center bg-blue-100 text-blue-700 text-sm px-2 py-1 rounded-full mr-2">
          <FiFileText className="mr-1" />
          {templates.find((t) => t._id === selectedTemplate)?.name}
          <button
            type="button"
            onClick={() => setSelectedTemplate("")}
            className="ml-2 text-xs text-red-500 hover:text-red-700"
          >
            <FiUserX />
          </button>
        </span>
      ) : (
        <select
          value={selectedTemplate}
          onChange={(e) => setSelectedTemplate(e.target.value)}
          className="flex-1 border-none outline-none text-sm py-1 px-2 bg-transparent"
        >
          <option value="">-- Select Template --</option>
          {templates
            .filter((t) => t.service === selectedApp?.name)
            .map((t) => (
              <option key={t._id} value={t._id}>
                {t.name}
              </option>
            ))}
        </select>
      )}
    </div>
  </div>

  {/* Subject */}
  <div className="mb-4">
    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
      <FiFileText className="mr-2 text-gray-500" /> Subject
    </label>
    <input
      type="text"
      value={subject}
      onChange={(e) => setSubject(e.target.value)}
      className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
      placeholder="Enter subject"
    />
  </div>

  {/* CC */}
  <div className="mb-4">
    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
      <FiUsers className="mr-2 text-gray-500" /> CC
    </label>
    <div className="flex flex-wrap items-center border rounded-lg px-2 py-1 focus-within:ring-2 focus-within:ring-purple-500">
      {ccList.map((email, index) => (
        <span
          key={index}
          className="flex items-center bg-blue-100 text-blue-700 text-sm px-2 py-1 rounded-full mr-2 mb-1"
        >
          <FiMail className="mr-1" />
          {email}
          <button
            type="button"
            onClick={() => handleRemoveEmail("cc", index)}
            className="ml-1 text-xs text-red-500 hover:text-red-700"
          >
            <FiUserX />
          </button>
        </span>
      ))}
      <input
        type="text"
        value={ccInput}
        onChange={(e) => setCcInput(e.target.value)}
        onKeyDown={(e) => handleAddEmail(e, "cc")}
        className="flex-1 outline-none text-sm py-1 px-2"
        placeholder="Type and press Enter"
      />
    </div>
  </div>

  {/* BCC */}
  <div>
    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
      <FiUsers className="mr-2 text-gray-500" /> BCC
    </label>
    <div className="flex flex-wrap items-center border rounded-lg px-2 py-1 focus-within:ring-2 focus-within:ring-purple-500">
      {bccList.map((email, index) => (
        <span
          key={index}
          className="flex items-center bg-green-100 text-green-700 text-sm px-2 py-1 rounded-full mr-2 mb-1"
        >
          <FiMail className="mr-1" />
          {email}
          <button
            type="button"
            onClick={() => handleRemoveEmail("bcc", index)}
            className="ml-1 text-xs text-red-500 hover:text-red-700"
          >
            <FiUserX />
          </button>
        </span>
      ))}
      <input
        type="text"
        value={bccInput}
        onChange={(e) => setBccInput(e.target.value)}
        onKeyDown={(e) => handleAddEmail(e, "bcc")}
        className="flex-1 outline-none text-sm py-1 px-2"
        placeholder="Type and press Enter"
      />
    </div>
  </div>
</>
                )}
              </div>

              <div className="flex justify-end space-x-2 px-4 py-2 border-t bg-gray-50">
                <button
                  className="px-4 py-2 text-sm border rounded hover:bg-gray-100"
                  onClick={() => setSelectedApp(null)}
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
    </div>
  );
};

export default ShopifyScenariosPage;

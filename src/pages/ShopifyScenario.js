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
  FiTrash2,
  FiEdit,
} from "react-icons/fi";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

const ShopifyScenariosPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
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
  const [connections, setConnections] = useState([]);
  const [selectedConnection, setSelectedConnection] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [delayValue, setDelayValue] = useState("5");
  const [delayUnit, setDelayUnit] = useState("seconds");

  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [cc, setCc] = useState("");
  const [bcc, setBcc] = useState("");
  const modalRef = useRef(null);
  const [ccList, setCcList] = useState([]);
  const [bccList, setBccList] = useState([]);
  const [ccInput, setCcInput] = useState("");
  const [bccInput, setBccInput] = useState("");
  const [showWebhookInfo, setShowWebhookInfo] = useState(false);
  const [scenarioId, setScenarioId] = useState(null);
  const [scenarioName, setScenarioName] = useState("");
  const [scenarioDescription, setScenarioDescription] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userId = localStorage.getItem("userid");
        const res = await axios.get(
          `http://localhost:5000/auth/getUsers/${userId}`
        );
        setUser(res.data.data);
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };

    if (showWebhookInfo) fetchUser();
  }, [showWebhookInfo]);

  const webhookUrl = user?.mailhook || "https://yourdomain.com/webhook/12345";

  const handleCopy = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
    { name: "Delay", color: "bg-blue-500", icon: "Delay" },
    { name: "Email", color: "bg-purple-500", icon: "Email" },
    { name: "Gmail", color: "bg-red-500", icon: "Gmail" },
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

  const handleSaveScenario = async () => {
    const payload = {
      userId: localStorage.getItem("userid"),
      name: scenarioName,
      description: scenarioDescription,
      type: "shopify",
      routerBranches,
    };

    const url = scenarioId
      ? `http://localhost:5000/scenario/detail/${scenarioId}`
      : `http://localhost:5000/scenario`;

    await fetch(url, {
      method: scenarioId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    toast.success("Shopify scenario saved successfully!");
    navigate("/scenarios/all");
  };
  const iconMap = {
    Delay: <Clock />,
    Email: <FiMail />,
    Gmail: <Mail />,
    Webhooks: <Cloud />,
    Router: <GitBranch />,
  };

  useState(() => {
    setSavedModule({
      app: { name: "Webhooks", color: "bg-red-500", icon: "Webhooks" },
      type: "Custom mailhook",
      description: "Custom mailhook",
    });
    setSavedSecondModule({
      app: { name: "Router", color: "bg-green-400", icon: "Router" },
      type: "Router",
      description: "Route to different paths",
    });
    setSavedThirdModule({
      app: { name: "Gmail", color: "bg-red-500", icon: "Gmail" },
      type: "Send an Email",
      description: "Send an email",
    });
    setShowRouterBranches(true);
    setRouterBranches([
      { id: 2, hasModule: false, condition: null, modules: [] },
    ]);
  }, []);
  useEffect(() => {
    if (id) {
      const fetchScenario = async () => {
        try {
          const res = await fetch(
            `http://localhost:5000/scenario/detail/${id}`
          );
          const data = await res.json();
          if (data) {
            setScenarioId(data._id);
            setScenarioName(data.name || "");
            setScenarioDescription(data.description || "");
            setRouterBranches(data.routerBranches || []);
          }
        } catch (err) {
          console.error("Error fetching scenario:", err);
        }
      };
      fetchScenario();
    }
  }, [id]);
  const handleSave = () => {
    if (editingBranch !== null) {
      const updatedBranches = [...routerBranches];

      let type = "";
      let description = "";

      if (selectedModule === "delay") {
        type = "Delay";
        description = `Wait ${delayValue} ${delayUnit}`;
      } else if (selectedApp?.name === "Email") {
        type = "Custom Email";
        description = "Send an email using custom SMTP/Outlook";
      } else if (selectedApp?.name === "Gmail") {
        type = "Send an Email";
        description = "Send an email via Gmail";
      }

      if (editingModuleId) {
        const moduleIndex = updatedBranches[editingBranch].modules.findIndex(
          (m) => m.id === editingModuleId
        );
        if (moduleIndex >= 0) {
          updatedBranches[editingBranch].modules[moduleIndex] = {
            ...updatedBranches[editingBranch].modules[moduleIndex],
            app: {
              name: selectedApp.name,
              color: selectedApp.color,
              icon: selectedApp.name,
            },
            type,
            description,
            connectionId: selectedConnection,
            template: selectedTemplate,
            subject,
            cc: ccList,
            bcc: bccList,
            delayValue,
            delayUnit,
          };
        }
      } else {
        // ➕ Add new module
        updatedBranches[editingBranch].modules.push({
          id: Date.now(),
          app: {
            name: selectedApp.name,
            color: selectedApp.color,
            icon: selectedApp.name,
          },
          type,
          description,
          connectionId: selectedConnection,
          template: selectedTemplate,
          subject,
          cc: ccList,
          bcc: bccList,
          delayValue,
          delayUnit,
        });
      }

      setRouterBranches(updatedBranches);
      setEditingBranch(null);
      setEditingModuleId(null);
    }

    setSelectedModule(null);
    setOpen(false);
    setSelectedApp(null);
    setSelectedConnection("");
    setSelectedTemplate("");
    setSubject("");
    setCcList([]);
    setBccList([]);
    setDelayValue("5");
    setDelayUnit("seconds");
  };

  const handleCancel = () => {
    setSelectedApp(null);
    setEditingBranch(null);
    setEditingModuleId(null);

    setSelectedConnection("");
    setSelectedTemplate("");
    setSubject("");
    setCcList([]);
    setBccList([]);
    setCcInput("");
    setBccInput("");
    setDelayValue("5");
    setDelayUnit("seconds");
    setOpen(false);
  };

  const handleRemoveModule = (branchIndex, moduleId) => {
    const updatedBranches = [...routerBranches];
    updatedBranches[branchIndex].modules = updatedBranches[
      branchIndex
    ].modules.filter((m) => m.id !== moduleId);
    setRouterBranches(updatedBranches);

    // 🔄 Reset form states when module removed
    setSelectedConnection("");
    setSelectedTemplate("");
    setSubject("");
    setCcList([]);
    setBccList([]);
    setCcInput("");
    setBccInput("");
  };

  const [editingModuleId, setEditingModuleId] = useState(null);

  const handleEditModule = (branchIndex, module) => {
    setSelectedBranchIndex(branchIndex);
    setEditingBranch(branchIndex);
    setEditingModuleId(module.id);
    setOpen(true);

    // load saved values
    setSelectedApp(module.app);
    setSelectedConnection(module.connectionId || "");
    setSelectedTemplate(module.template || "");
    setSubject(module.subject || "");
    setCcList(module.cc || []);
    setBccList(module.bcc || []);
    setDelayValue(module.delayValue || "5");
    setDelayUnit(module.delayUnit || "seconds");
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
        <div className="border-b bg-white shadow-sm">
          <div className="p-6 flex items-center justify-between">
            <div className="flex flex-col w-2/3">
              <h1 className="text-xl font-medium text-gray-800 mb-2">
                {scenarioId ? "Edit Scenario" : "Create New Scenario"}
              </h1>
              <p className="text-sm text-gray-500 mb-4">
                Give your scenario a clear name so you can identify it later.
              </p>

              <input
                type="text"
                value={scenarioName}
                onChange={(e) => setScenarioName(e.target.value)}
                placeholder="Enter scenario name"
                className="px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 w-full"
              />
            </div>

            <div className="flex flex-col space-y-2 items-end">
              <button
                className="flex items-center px-4 py-2 text-sm text-gray-700 bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-100 w-full"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="mr-2 w-4 h-4" />
                Back
              </button>

              <button
                onClick={handleSaveScenario}
                className="flex items-center justify-center px-4 py-2 text-sm bg-green-600 text-white rounded-md shadow hover:bg-green-700 w-full"
              >
                {scenarioId ? "Update Scenario" : "Save Scenario"}
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center relative">
          <div className="flex items-center justify-center w-full">
            <div className="relative">
              <div
                onClick={() => setShowWebhookInfo(true)}
                className="w-48 h-48 hover:border-red-600 cursor-pointer flex flex-col items-center justify-center rounded-full bg-red-500 text-white shadow-lg border-4 border-red-300 relative"
              >
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

                {/* {routerHovered && (
                  <button
                    onClick={addRouterBranch}
                    className="absolute -right-6 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-green-300 hover:bg-gray-100 transition-all"
                  >
                    <Plus className="w-4 h-4 text-green-600" />
                  </button>
                )} */}
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
                                className={`w-24 h-24 flex flex-col items-center justify-center rounded-full ${module.app.color} text-white shadow-lg border-2 border-opacity-50`}
                              >
                                {React.cloneElement(iconMap[module.app.icon], {
                                  className: "w-8 h-8",
                                })}
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
                                <div className="absolute -top-3 -left-3 flex space-x-2">
                                  <button
                                    onClick={() =>
                                      handleEditModule(branchIndex, module)
                                    }
                                    className="text-blue-500  p-1 rounded-full hover:text-blue-800"
                                    title="Edit"
                                  >
                                    <FiEdit className="w-4 h-4" />
                                  </button>
                                </div>
                                <button
                                  onClick={() =>
                                    handleRemoveModule(branchIndex, module.id)
                                  }
                                  className="text-red-500 p-1 rounded-full hover:text-red-600"
                                  title="Remove"
                                >
                                  <FiTrash2 className="w-4 h-4" />
                                </button>
                              </div>

                              <button
                                onClick={() => addModuleToBranch(branchIndex)}
                                className="absolute -right-3 top-6 w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center hover:bg-gray-400 transition-colors"
                              >
                                <Plus className="w-3 h-3 text-gray-600" />
                              </button>
                            </div>

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
                          {iconMap[app.icon]}
                        </div>
                        <span className="ml-3 text-sm text-gray-700">
                          {app.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <>
                  <div className="flex justify-between items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-400 text-white rounded-t-lg">
                    <h3 className="font-semibold">{selectedApp.name}</h3>
                    <button onClick={handleCancel}>✕</button>
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
                            value={delayValue}
                            onChange={(e) => setDelayValue(e.target.value)}
                            className="w-20 border rounded px-2 py-1 text-sm"
                          />
                          <select
                            value={delayUnit}
                            onChange={(e) => setDelayUnit(e.target.value)}
                            className="border rounded px-2 py-1 text-sm"
                          >
                            <option value="seconds">Seconds</option>
                            <option value="minutes">Minutes</option>
                            <option value="hours">Hours</option>
                          </select>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Suspend the execution of the scenario for the
                          specified duration.
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="mb-4 w-full">
                          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                            <FiMail className="mr-2 text-gray-500" /> Select
                            Connection
                          </label>
                          <div className="flex items-center border rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-purple-500 w-full">
                            {selectedConnection ? (
                              <span className="flex items-center bg-purple-100 text-purple-700 text-sm px-3 py-2 rounded-full w-full">
                                <FiMail className="mr-2" />
                                {connections
                                  .find((c) => c._id === selectedConnection)
                                  ?.provider.toUpperCase()}{" "}
                                -{" "}
                                {connections.find(
                                  (c) => c._id === selectedConnection
                                )?.email ||
                                  connections.find(
                                    (c) => c._id === selectedConnection
                                  )?.name}
                                <button
                                  type="button"
                                  onClick={() => setSelectedConnection("")}
                                  className="ml-auto text-xs text-red-500 hover:text-red-700"
                                >
                                  <FiUserX />
                                </button>
                              </span>
                            ) : (
                              <select
                                value={selectedConnection}
                                onChange={(e) =>
                                  setSelectedConnection(e.target.value)
                                }
                                className="w-full border-none outline-none text-sm py-2 px-3 bg-transparent"
                              >
                                <option value="">
                                  -- Select Connection --
                                </option>
                                {connections
                                  .filter((c) => {
                                    if (selectedApp?.name === "Email") {
                                      return (
                                        c.provider === "smtp" ||
                                        c.provider === "outlook"
                                      );
                                    }
                                    if (selectedApp?.name === "Gmail") {
                                      return c.provider === "gmail";
                                    }
                                    return false;
                                  })
                                  .map((c) => (
                                    <option key={c._id} value={c._id}>
                                      {c.provider.toUpperCase()} -{" "}
                                      {c.email || c.name}
                                    </option>
                                  ))}
                              </select>
                            )}
                          </div>
                        </div>

                        <div className="mb-4 w-full">
                          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                            <FiFileText className="mr-2 text-gray-500" /> Select
                            Template
                          </label>
                          <div className="flex items-center border rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-purple-500 w-full">
                            {selectedTemplate ? (
                              <span className="flex items-center bg-blue-100 text-blue-700 text-sm px-3 py-2 rounded-full w-full">
                                <FiFileText className="mr-2" />
                                {templates.find(
                                  (tpl) => tpl._id === selectedTemplate
                                )?.name || "Unknown"}

                                <button
                                  type="button"
                                  onClick={() => setSelectedTemplate("")}
                                  className="ml-auto text-xs text-red-500 hover:text-red-700"
                                >
                                  <FiUserX />
                                </button>
                              </span>
                            ) : (
                              <select
                                value={selectedTemplate}
                                onChange={(e) =>
                                  setSelectedTemplate(e.target.value)
                                }
                              >
                                <option value="">-- Select Template --</option>
                                {templates.slice(0, 3).map((tpl) => (
                                  <option key={tpl._id} value={tpl._id}>
                                    {tpl.name.split(" - ").pop()}
                                  </option>
                                ))}
                              </select>
                            )}
                          </div>
                        </div>

                        <div className="mb-4 w-full">
                          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                            <FiUsers className="mr-2 text-gray-500" /> CC
                          </label>
                          <div className="flex flex-wrap items-center border rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-purple-500 w-full">
                            {ccList.map((email, index) => (
                              <span
                                key={index}
                                className="flex items-center bg-blue-100 text-blue-700 text-sm px-3 py-1 rounded-full mr-2 mb-1"
                              >
                                <FiMail className="mr-2" />
                                {email}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveEmail("cc", index)}
                                  className="ml-2 text-xs text-red-500 hover:text-red-700"
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
                              className="w-full outline-none text-sm py-2 px-3"
                              placeholder="Type and press Enter"
                            />
                          </div>
                        </div>

                        {/* BCC */}
                        <div className="w-full">
                          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                            <FiUsers className="mr-2 text-gray-500" /> BCC
                          </label>
                          <div className="flex flex-wrap items-center border rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-purple-500 w-full">
                            {bccList.map((email, index) => (
                              <span
                                key={index}
                                className="flex items-center bg-green-100 text-green-700 text-sm px-3 py-1 rounded-full mr-2 mb-1"
                              >
                                <FiMail className="mr-2" />
                                {email}
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRemoveEmail("bcc", index)
                                  }
                                  className="ml-2 text-xs text-red-500 hover:text-red-700"
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
                              className="w-full outline-none text-sm py-2 px-3"
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
                      onClick={handleCancel}
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
                </>
              )}
            </div>
          )}

          {showWebhookInfo && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn"
              onClick={() => setShowWebhookInfo(false)}
            >
              <div
                className="bg-white rounded-lg shadow-lg w-[500px] p-6 relative transform animate-slideUp"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setShowWebhookInfo(false)}
                  className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Webhook Mailhook Instructions
                </h2>

                <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                  This is your <strong>email forwarding mailhook</strong>.{" "}
                  <br />
                  Please copy the URL below and paste it into your{" "}
                  <strong>mail forwarding settings</strong> in your email
                  provider. <br />
                  All forwarded emails will be delivered here.
                </p>

                {loading ? (
                  <p className="text-gray-500 text-sm">Loading webhook...</p>
                ) : (
                  <div className="flex items-center bg-gray-100 border rounded px-3 py-2 mb-4">
                    <CiLink className="mr-2 text-gray-600" />
                    <span className="text-sm text-gray-800 font-mono break-all select-all">
                      {webhookUrl}
                    </span>
                  </div>
                )}

                <button
                  onClick={handleCopy}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm"
                >
                  {copied ? "Copied!" : "Copy Webhook URL"}
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

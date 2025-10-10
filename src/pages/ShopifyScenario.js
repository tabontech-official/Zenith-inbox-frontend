import React, { useContext, useEffect, useRef, useState } from "react";
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
  Zap,
  Eye,
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
import { UserContext } from "../component/UserContext";
import WebhookModal from "../component/WebhookModal";
import ConnectionModal from "../component/ConnectionModal";
import OutlookConnectionModal from "../component/OutlookConnectionModal";
import EmailInspector from "./EmailInspector";

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
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const { user } = useContext(UserContext);
  const [showOutlookModal, setShowOutlookModal] = useState(false);
  const [showGmailModal, setShowGmailModal] = useState(false);

  const handleAddClick = () => {
    if (selectedApp?.name === "Email") {
      setShowOutlookModal(true);
    } else if (selectedApp?.name === "Gmail") {
      setShowGmailModal(true);
    }
  };
  useEffect(() => {
    if (user) {
      setLoading(false);
    }
  }, [user]);

  const webhookUrl = user?.mailhook || "";
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
  const fetchConnections = async () => {
    try {
      const res = await fetch(
        `https://email-syncing-backend.vercel.app/auth/getConnection/${localStorage.getItem(
          "userid"
        )}`
      );
      const data = await res.json();
      setConnections(data);
    } catch (err) {
      console.error("Error fetching connections:", err);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  useEffect(() => {
    if (selectedApp?.name) {
      const fetchTemplates = async () => {
        try {
          const res = await fetch(
            `https://email-syncing-backend.vercel.app/template/all?userId=${localStorage.getItem(
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
    try {
      const payload = {
        userId: localStorage.getItem("userid"),
        name: scenarioName,
        description: scenarioDescription,
        type: "shopify",
        routerBranches,
      };

      // ✅ Always update (PUT)
      const res = await fetch(
        `https://email-syncing-backend.vercel.app/scenario/detail/${scenarioId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        throw new Error("Failed to update scenario");
      }

      toast.success("Shopify scenario updated successfully!");
    } catch (err) {
      console.error("Error updating scenario:", err);
      toast.error("Failed to update scenario.");
    }
  };

  const iconMap = {
    Delay: Clock,
    Email: FiMail,
    Gmail: Mail,
    Webhooks: Cloud,
    Router: GitBranch,
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
    const fetchScenario = async () => {
      try {
        const userId = localStorage.getItem("userid"); // localStorage se lo
        if (!userId) {
          console.error("No userId found in localStorage");
          return;
        }

        const res = await fetch(
          "https://email-syncing-backend.vercel.app/scenario/details",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ userId }), // ✅ body me userId send
          }
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
  }, []);

  const handleSave = () => {
    if (editingBranch !== null) {
      const updatedBranches = [...routerBranches];

      let type = "";
      let description = "";

      if (selectedApp?.name === "Delay") {
        type = "Delay";
        description = `Wait ${delayValue} ${delayUnit}`;
      } else if (
        selectedApp?.name === "Email" ||
        selectedApp?.name === "Gmail"
      ) {
        type = selectedApp.name === "Email" ? "Custom Email" : "Send an Email";
        description = `Send email via ${selectedApp.name}`;
      }

      if (editingModuleId) {
        const moduleIndex = updatedBranches[editingBranch].modules.findIndex(
          (m) => m.id === editingModuleId
        );
        if (moduleIndex >= 0) {
          updatedBranches[editingBranch].modules[moduleIndex] = {
            ...updatedBranches[editingBranch].modules[moduleIndex],
            app: selectedApp,
            type,
            description,
            connectionId: selectedConnection,
            template: selectedTemplate,
            cc: ccList,
            bcc: bccList,
            delayValue,
            delayUnit,
          };
        }
      } else {
        updatedBranches[editingBranch].modules.push({
          id: Date.now(),
          app: selectedApp,
          type,
          description,
          connectionId: selectedConnection,
          template: selectedTemplate,
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

    resetForm();
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

  // Flowwise-style Node Component
  const FlowNode = ({
    icon: Icon,
    title,
    subtitle,
    color,
    number,
    onEdit,
    onDelete,
    isFirst,
    isLast,
    isRouter,
  }) => (
    <div className="relative group">
      <div
        className={`bg-white rounded-xl shadow-lg border-2 ${color} p-6 w-64 hover:shadow-xl transition-all duration-200`}
      >
        {/* Number Badge */}
        <div
          className={`absolute -top-3 -left-3 w-8 h-8 ${color.replace(
            "border-",
            "bg-"
          )} rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md`}
        >
          {number}
        </div>

        {/* Icon and Title */}
        <div className="flex items-center space-x-3 mb-3">
          <div
            className={`${color
              .replace("border-", "bg-")
              .replace("-500", "-100")} p-3 rounded-lg`}
          >
            <Icon className={`w-6 h-6 ${color.replace("border-", "text-")}`} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-800 text-sm">{title}</h3>
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          </div>
        </div>

        {/* Action Buttons (on hover) */}
        {!isFirst && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
            {onEdit && (
              <button
                onClick={onEdit}
                className="p-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Settings className="w-3 h-3" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        )}

        {/* Connection Point - Bottom */}
        {!isLast && (
          <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-gray-400 rounded-full border-2 border-white"></div>
        )}

        {/* Connection Point - Top */}
        {!isFirst && (
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-gray-400 rounded-full border-2 border-white"></div>
        )}
        {isRouter && (
          <button
            onClick={handleViewEmailData}
            className="p-1.5  border rounded-lg border-green-500 text-green-500 transition-colors"
            title="View Test Email"
          >
            <Eye className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );

  // Add Module Button Component
  const AddModuleButton = ({ onClick }) => (
    <button
      onClick={onClick}
      className="w-64 h-24 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center hover:border-purple-500 hover:bg-purple-50 transition-all group"
    >
      <Plus className="w-6 h-6 text-gray-400 group-hover:text-purple-500" />
      <span className="ml-2 text-gray-500 group-hover:text-purple-600 font-medium">
        Add Module
      </span>
    </button>
  );
  const resetForm = () => {
    setSelectedApp(null);
    setSelectedConnection("");
    setSelectedTemplate("");
    setCcList([]);
    setBccList([]);
    setCcInput("");
    setBccInput("");
    setDelayValue("5");
    setDelayUnit("seconds");
    setOpen(false);
  };

  // const handleRunTest = async () => {
  //   try {
  //     toast.loading("Running test scenario...", { id: "test" });

  //     const res = await fetch(
  //       `https://email-syncing-backend.vercel.app/scenario/run-test/${scenarioId}`,
  //       {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify({
  //           userId: localStorage.getItem("userid"),
  //         }),
  //       }
  //     );

  //     const data = await res.json();

  //     if (res.ok) {
  //       toast.success("Scenario test executed successfully!", { id: "test" });
  //       console.log("Test result:", data);
  //     } else {
  //       toast.error(data.message || "Test failed.", { id: "test" });
  //     }
  //   } catch (err) {
  //     console.error("Error running test:", err);
  //     toast.error("Failed to run test.", { id: "test" });
  //   }
  // };

  const handleRunTest = async () => {
    try {
      toast.loading("Running test scenario...", { id: "test" });

      const res = await fetch(`https://email-syncing-backend.vercel.app/mailhook/Run-test-mode`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: localStorage.getItem("userid"),
        }),
      });

      const data = await res.json();

      if (!data.success) {
        toast.error("Test failed", { id: "test" });
        return;
      }

      toast.success(" Test email sent successfully!", { id: "test" });

      console.log("Test email sent:", data.testEmail);
    } catch (err) {
      console.error("❌ Run Test Error:", err);
      toast.error("Run Test failed", { id: "test" });
    }
  };
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const [emailFields, setEmailFields] = useState({});
  const [selectedField, setSelectedField] = useState(null);
  const handleViewEmailData = async () => {
    try {
      const userId = localStorage.getItem("userid");
      toast.loading("Fetching test email...", { id: "email" });

      const res = await fetch(
        `https://email-syncing-backend.vercel.app/mailhook/get-test-email/${userId}`
      );
      const data = await res.json();

      if (!data.success || !data.email) {
        toast.error("No test email found.", { id: "email" });
        return;
      }

      toast.success("Test email fetched successfully!", { id: "email" });

      setEmailFields(data.email);
      setShowEmailPreview(true);
    } catch (err) {
      console.error(" Error fetching test email:", err);
      toast.error("Failed to fetch email.", { id: "email" });
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-64">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white border-b px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <input
                type="text"
                value={scenarioName}
                onChange={(e) => setScenarioName(e.target.value)}
                className="text-xl font-semibold text-gray-800 border-none outline-none focus:ring-0 w-full"
                placeholder="Scenario Name"
              />
              <p className="text-sm text-gray-500 mt-1">
                Configure your automation workflow
              </p>
            </div>
            <div className="flex space-x-3">
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center text-sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </button>
              <button
                onClick={handleSaveScenario}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center text-sm"
              >
                Update Scenario
              </button>
              <button
                onClick={handleRunTest}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center text-sm"
              >
                <Zap className="w-4 h-4 mr-2" />
                Run Test
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col items-center mb-8">
              <FlowNode
                icon={Cloud}
                title="Webhooks"
                subtitle="Custom mailhook"
                color="border-red-500"
                number={1}
                isFirst={true}
                onClick={() => setShowWebhookInfo(true)}
              />

              <div className="w-0.5 h-12 bg-gray-300 relative">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <Zap className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center mb-8">
              <FlowNode
                icon={GitBranch}
                title="Router"
                subtitle="Route to different paths"
                color="border-green-500"
                number={2}
                isRouter={true}
              />

              <div className="w-0.5 h-12 bg-gray-300"></div>
            </div>

            <div className="space-y-16">
              {routerBranches.map((branch, branchIndex) => (
                <div
                  key={branch.id}
                  className="flex flex-col items-center space-y-8"
                >
                  {branch.modules.length > 0
                    ? branch.modules.map((module, moduleIndex) => {
                        const Icon = iconMap[module.app.icon];
                        return (
                          <React.Fragment key={module.id}>
                            <FlowNode
                              icon={Icon}
                              title={module.app.name}
                              subtitle={module.description}
                              color={`border-${module.app.color.replace(
                                "bg-",
                                ""
                              )}`}
                              number={3 + moduleIndex}
                              onEdit={() =>
                                handleEditModule(branchIndex, module)
                              }
                              onDelete={() =>
                                handleRemoveModule(branchIndex, module.id)
                              }
                              isLast={moduleIndex === branch.modules.length - 1}
                            />

                            {moduleIndex < branch.modules.length - 1 && (
                              <div className="w-0.5 h-12 bg-gray-300"></div>
                            )}
                          </React.Fragment>
                        );
                      })
                    : null}

                  {branch.modules.length === 0 || branch.modules.length > 0 ? (
                    <>
                      {branch.modules.length > 0 && (
                        <div className="w-0.5 h-8 bg-gray-300"></div>
                      )}
                      <AddModuleButton
                        onClick={() => {
                          setEditingBranch(branchIndex);
                          setOpen(true);
                        }}
                      />
                    </>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </div>

        {open && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div
              ref={modalRef}
              className="bg-white rounded-xl shadow-2xl w-[500px] max-h-[80vh] overflow-hidden"
            >
              {!selectedApp ? (
                <>
                  <div className="p-6 border-b bg-gradient-to-r from-purple-600 to-purple-500 text-white">
                    <h2 className="text-lg font-semibold">
                      Select Application
                    </h2>
                    <p className="text-sm text-purple-100 mt-1">
                      Choose an app to add to your workflow
                    </p>
                  </div>
                  <div className="p-4 max-h-96 overflow-y-auto">
                    {apps.map((app, idx) => {
                      const Icon = iconMap[app.icon];
                      return (
                        <div
                          key={idx}
                          onClick={() => setSelectedApp(app)}
                          className="flex items-center p-4 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors border border-transparent hover:border-purple-200"
                        >
                          <div
                            className={`w-12 h-12 ${app.color} rounded-lg flex items-center justify-center text-white`}
                          >
                            <Icon className="w-6 h-6" />
                          </div>
                          <span className="ml-4 font-medium text-gray-800">
                            {app.name}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <>
                  <div className="p-6 border-b bg-gradient-to-r from-purple-600 to-purple-500 text-white flex justify-between items-center">
                    <h3 className="font-semibold text-lg">
                      {selectedApp.name}
                    </h3>
                    <button
                      onClick={resetForm}
                      className="hover:bg-white hover:bg-opacity-20 p-1 rounded"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                    {selectedApp.name === "Delay" ? (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Delay Duration <span className="text-red-500">*</span>
                        </label>
                        <div className="flex space-x-3">
                          <input
                            type="number"
                            value={delayValue}
                            onChange={(e) => setDelayValue(e.target.value)}
                            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                          <select
                            value={delayUnit}
                            onChange={(e) => setDelayUnit(e.target.value)}
                            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          >
                            <option value="seconds">Seconds</option>
                            <option value="minutes">Minutes</option>
                            <option value="hours">Hours</option>
                          </select>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Connection <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={selectedConnection}
                            onChange={(e) =>
                              setSelectedConnection(e.target.value)
                            }
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          >
                            <option value="">-- Select Connection --</option>
                            {connections
                              .filter((c) => {
                                if (selectedApp?.name === "Email")
                                  return (
                                    c.provider === "smtp" ||
                                    c.provider === "outlook"
                                  );
                                if (selectedApp?.name === "Gmail")
                                  return c.provider === "gmail";
                                return false;
                              })
                              .map((c) => (
                                <option key={c._id} value={c._id}>
                                  {c.provider.toUpperCase()} - {c.email}
                                </option>
                              ))}
                          </select>
                        </div> */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Connection <span className="text-red-500">*</span>
                          </label>

                          <div className="flex items-center border border-gray-300 rounded-lg px-2 py-2 focus-within:ring-2 focus-within:ring-purple-500">
                            <select
                              value={selectedConnection}
                              onChange={(e) =>
                                setSelectedConnection(e.target.value)
                              }
                              className="flex-1 border-none outline-none text-sm bg-transparent"
                            >
                              <option value="">-- Select Connection --</option>
                              {connections
                                .filter((c) => {
                                  if (selectedApp?.name === "Email")
                                    return (
                                      c.provider === "smtp" ||
                                      c.provider === "outlook"
                                    );
                                  if (selectedApp?.name === "Gmail")
                                    return c.provider === "gmail";
                                  return false;
                                })
                                .map((c) => (
                                  <option key={c._id} value={c._id}>
                                    {c.provider.toUpperCase()} - {c.email}
                                  </option>
                                ))}
                            </select>

                            <button
                              onClick={() => {
                                if (selectedApp?.name === "Email") {
                                  setShowOutlookModal(true);
                                } else if (selectedApp?.name === "Gmail") {
                                  setShowGmailModal(true);
                                }
                              }}
                              className="ml-2 border border-purple-500 text-purple-600 hover:bg-purple-50 rounded-md px-3 py-1 text-sm font-medium"
                            >
                              Add
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Template <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={selectedTemplate}
                            onChange={(e) =>
                              setSelectedTemplate(e.target.value)
                            }
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          >
                            <option value="">-- Select Template --</option>
                            {templates
                              .filter(
                                (tpl) =>
                                  tpl.service === "General" &&
                                  (tpl.name.includes("Initial Email") ||
                                    tpl.name.includes("First Email") ||
                                    tpl.name.includes("Second Email"))
                              )
                              .sort((a, b) => {
                                const order = [
                                  "Initial Email",
                                  "First Email",
                                  "Second Email",
                                ];
                                const aIndex = order.findIndex((t) =>
                                  a.name.includes(t)
                                );
                                const bIndex = order.findIndex((t) =>
                                  b.name.includes(t)
                                );
                                return aIndex - bIndex;
                              })
                              .map((tpl) => {
                                const shortName =
                                  tpl.name.split(" - ")[1] || tpl.name;
                                return (
                                  <option key={tpl._id} value={tpl.name}>
                                    {shortName}
                                  </option>
                                );
                              })}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            To
                          </label>
                          <div className="border border-gray-300 rounded-lg px-3 py-2 bg-gray-50">
                            <div className="flex flex-wrap gap-2">
                              <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm flex items-center">
                                Sender Email Address
                                <span className="ml-2 text-gray-400 text-xs">
                                  (Sender)
                                </span>
                              </span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            CC{" "}
                            <span className="text-xs text-gray-500">
                              (Optional)
                            </span>
                          </label>
                          <div className="border border-gray-300 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-purple-500">
                            <div className="flex flex-wrap gap-2 mb-2">
                              {ccList.map((email, index) => (
                                <span
                                  key={index}
                                  className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center"
                                >
                                  {email}
                                  <button
                                    onClick={() =>
                                      handleRemoveEmail("cc", index)
                                    }
                                    className="ml-2 text-red-500 hover:text-red-700"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </span>
                              ))}
                            </div>
                            <input
                              type="text"
                              value={ccInput}
                              onChange={(e) => setCcInput(e.target.value)}
                              onKeyDown={(e) => handleAddEmail(e, "cc")}
                              placeholder="Type email and press Enter"
                              className="w-full outline-none text-sm"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            BCC{" "}
                            <span className="text-xs text-gray-500">
                              (Optional)
                            </span>
                          </label>
                          <div className="border border-gray-300 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-purple-500">
                            <div className="flex flex-wrap gap-2 mb-2">
                              {bccList.map((email, index) => (
                                <span
                                  key={index}
                                  className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm flex items-center"
                                >
                                  {email}
                                  <button
                                    onClick={() =>
                                      handleRemoveEmail("bcc", index)
                                    }
                                    className="ml-2 text-red-500 hover:text-red-700"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </span>
                              ))}
                            </div>
                            <input
                              type="text"
                              value={bccInput}
                              onChange={(e) => setBccInput(e.target.value)}
                              onKeyDown={(e) => handleAddEmail(e, "bcc")}
                              placeholder="Type email and press Enter"
                              className="w-full outline-none text-sm"
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="p-6 border-t bg-gray-50 flex justify-end space-x-3">
                    <button
                      onClick={resetForm}
                      className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Save Module
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
        <OutlookConnectionModal
          isOpen={showOutlookModal}
          onClose={() => setShowOutlookModal(false)}
          onSuccess={(data) => {
            setShowOutlookModal(false);
            fetchConnections();
          }}
        />
        <WebhookModal
          showWebhookInfo={showWebhookInfo}
          setShowWebhookInfo={setShowWebhookInfo}
          webhookUrl={webhookUrl}
          loading={loading}
        />
        <ConnectionModal
          isOpen={showGmailModal}
          onClose={() => {
            setShowGmailModal(false);
            setShowOutlookModal(false);
          }}
          onSuccess={() => {
            setShowGmailModal(false);
            setShowOutlookModal(false);
            fetchConnections();
          }}
        />
      </div>
      {showEmailPreview && (
        <EmailInspector
          email={emailFields}
          onClose={() => setShowEmailPreview(false)}
        />
      )}
    </div>
  );
};

export default ShopifyScenariosPage;

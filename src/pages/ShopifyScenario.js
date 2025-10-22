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
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templateList, setTemplateList] = useState([]);
  const [selectedServiceForTemplates, setSelectedServiceForTemplates] =
    useState("");
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
  const [showValidation, setShowValidation] = useState(false);
  const [isScenarioUpdated, setIsScenarioUpdated] = useState(true);
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


  useEffect(() => {
    if (user) {
      setLoading(false);
    }
  }, [user]);

  const webhookUrl = user?.mailhook || "";
 
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

  useEffect(() => {
    fetchConnections();
  }, []);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const userId = localStorage.getItem("userid");
        const res = await fetch(
          `http://localhost:5000/template/all?userId=${userId}`
        );
        const data = await res.json();

        const filtered = data.filter(
          (t) => !t.service || !t.service.toLowerCase().startsWith("general")
        );

        const grouped = {};
        filtered.forEach((t) => {
          if (!grouped[t.service]) grouped[t.service] = [];
          if (grouped[t.service].length < 3) grouped[t.service].push(t);
        });

        const firstTwoServices = Object.keys(grouped).slice(0, 2);
        const limited = firstTwoServices.flatMap((key) => grouped[key]);
        setTemplateList(limited);

        const areAllActive = limited.every((t) => t.active === true);
        setAllActive(areAllActive);
      } catch (err) {
        console.error("❌ Error fetching templates:", err);
      }
    };

    if (showTemplateModal && !showValidation) {
      fetchTemplates();
    }
  }, [showTemplateModal, showValidation]);

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

  const handleSaveScenario = async () => {
    try {
      const payload = {
        userId: localStorage.getItem("userid"),
        name: scenarioName,
        description: scenarioDescription,
        type: "shopify",
        routerBranches,
        scenarioActive: localStorage.getItem("scenarioActive") === "true",
      };

      const res = await fetch(
        `http://localhost:5000/scenario/detail/${scenarioId}`,
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
      setIsScenarioUpdated(true);
    } catch (err) {
      console.error("Error updating scenario:", err);
      toast.error("Failed to update scenario.");
    }
  };
  const handleToggleTemplate = async (templateId, newStatus) => {
    try {
      const res = await fetch(
        `http://localhost:5000/template/status/${templateId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ active: newStatus }),
        }
      );

      const data = await res.json();
      if (data.success) {
        toast.success(`Template ${newStatus ? "activated" : "deactivated"}!`);
      } else {
        toast.error(data.message || "Failed to update template status.");
      }
    } catch (err) {
      console.error("Error updating template:", err);
      toast.error("Error updating template status.");
    }
  };

  const handleToggleAllTemplates = async (newStatus) => {
    try {
      const res = await fetch(
        `http://localhost:5000/template/templatestatus/all`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: localStorage.getItem("userid"),
            active: newStatus,
          }),
        }
      );

      const data = await res.json();
      if (data.success) {
        toast.success(
          `All templates ${newStatus ? "activated" : "deactivated"}!`
        );
      } else {
        toast.error(data.message || "Failed to update templates.");
      }
    } catch (err) {
      console.error(" Error updating all templates:", err);
      toast.error("Error updating all templates.");
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

        const res = await fetch("http://localhost:5000/scenario/details", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId }), // ✅ body me userId send
        });

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
  const [allActive, setAllActive] = useState(false);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const userId = localStorage.getItem("userid");
        const res = await fetch(
          `http://localhost:5000/template/all?userId=${userId}`
        );
        const data = await res.json();

        const grouped = {};
        data.forEach((t) => {
          if (!grouped[t.service]) grouped[t.service] = [];
          if (grouped[t.service].length < 3) grouped[t.service].push(t);
        });

        const firstTwoServices = Object.keys(grouped).slice(0, 2);
        const limited = firstTwoServices.flatMap((key) => grouped[key]);
        setTemplateList(limited);
      } catch (err) {
        console.error("❌ Error fetching templates:", err);
      }
    };

    if (showTemplateModal && !showValidation) {
      fetchTemplates();
    }
  }, [showTemplateModal, showValidation]);
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
        description = `Send email via ${selectedAppType || selectedApp.name}`;
      }

      const moduleData = {
        id: editingModuleId || Date.now(),
        app: {
          ...selectedApp,
          name:
            selectedApp.displayName ||
            selectedTemplate ||
            selectedApp.defaultTemplate ||
            "Unnamed Module",
          color: selectedApp.color,
          icon: selectedApp.icon,
        },
        type,
        description,
        connectionId: selectedConnection,
        template: selectedTemplate,
        cc: ccList,
        bcc: bccList,
        delayValue,
        delayUnit,
        emailType: selectedAppType || selectedApp?.name || "",
      };

      if (editingModuleId) {
        const moduleIndex = updatedBranches[editingBranch].modules.findIndex(
          (m) => m.id === editingModuleId
        );
        if (moduleIndex >= 0) {
          updatedBranches[editingBranch].modules[moduleIndex] = {
            ...updatedBranches[editingBranch].modules[moduleIndex],
            ...moduleData,
          };
        }
      } else {
        updatedBranches[editingBranch].modules.push(moduleData);
      }

      setRouterBranches(updatedBranches);
      setEditingBranch(null);
      setEditingModuleId(null);
    }

    resetForm();
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

    // Detect type (Delay vs Email/Gmail)
    const isDelayModule =
      module.app?.name?.toLowerCase() === "delay" ||
      module.type?.toLowerCase() === "delay";

    if (isDelayModule) {
      setSelectedApp({
        name: "Delay",
        color: "bg-blue-500",
        icon: "Delay",
        type: "Delay",
      });
      setDelayValue(module.delayValue || "5");
      setDelayUnit(module.delayUnit || "seconds");
      setSelectedAppType("Delay");
    } else {
      setSelectedApp(module.app || {});
      setSelectedAppType(module.emailType || module.app?.name || ""); // ✅ add this
      setSelectedConnection(module.connectionId || "");
      setSelectedTemplate(module.template || "");
      setSubject(module.subject || "");
      setCcList(module.cc || []);
      setBccList(module.bcc || []);
      setDelayValue(module.delayValue || "5");
      setDelayUnit(module.delayUnit || "seconds");
    }

    setOpen(true); // keep this at the end
  };

  const [completedSteps, setCompletedSteps] = useState([]);

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
    isWebhook,
    completed,
    module,
  }) => (
    <div className="relative group">
      <div
        onClick={() => {
          const appName =
            module?.app?.name?.toString().trim().toLowerCase?.() || "";

          if (
            appName.includes("webhook") ||
            title.toLowerCase().includes("webhook")
          ) {
            setShowWebhookInfo(true);
            return;
          }

          if (
            appName.includes("router") ||
            title.toLowerCase().includes("router")
          ) {
            handleViewEmailData();
            return;
          }
          const hasConnection =
            module && module.connectionId && module.connectionId.trim() !== "";
          const isDelayModule =
            module?.app?.name?.toLowerCase() === "delay" ||
            module?.type?.toLowerCase() === "delay";

          if (isDelayModule) {
            onEdit && onEdit();
            return;
          }
          if (
            title.toLowerCase().includes("template") ||
            module?.app?.name?.toLowerCase() === "template"
          ) {
            onEdit && onEdit();
            return;
          }
          if (!completed && !hasConnection) {
            toast.error("Please select a connection in this module.", {
              duration: 5000,
              style: {
                background: "#fff0f0",
                color: "#b91c1c",
                border: "1px solid #fca5a5",
              },
            });

            return;
          } else {
            onEdit && onEdit();
          }
        }}
        className={`bg-white rounded-xl shadow-lg border-2 ${color} p-6 w-64 hover:shadow-xl transition-all duration-200 relative cursor-pointer ${
          completed
            ? "ring-2 ring-green-400 border-green-500"
            : "ring-2 ring-red-200"
        }`}
      >
        {completed !== null && (
          <div
            className={`absolute -top-3 -left-3 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md transition-all duration-300 ${
              completed ? "bg-green-500" : "bg-red-500"
            }`}
          >
            {completed ? "✓" : "✗"}
          </div>
        )}

        {(isRouter || isWebhook) && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (isWebhook) {
                // 🟢 Open Webhook Modal
                setShowWebhookInfo(true);
              } else {
                // 🟢 Router still shows email data
                handleViewEmailData();
              }
            }}
            title={isWebhook ? "View Webhook Info" : "View Test Email"}
            className={`absolute top-2 right-2 p-1.5 border ${
              isWebhook
                ? "border-red-500 text-red-600 hover:bg-red-50"
                : "border-green-500 text-green-600 hover:bg-green-50"
            } rounded-lg transition-colors shadow-sm`}
          >
            <Eye className="w-4 h-4" />
          </button>
        )}

        <div className="flex items-center space-x-3 mb-3">
          <div
            className={`${color
              .replace("border-", "bg-")
              .replace("-500", "-100")} p-3 rounded-lg`}
          >
            <Icon
              className={`w-6 h-6 ${
                completed ? "text-green-500" : color.replace("border-", "text-")
              }`}
            />
          </div>
          <div className="flex-1">
            <h3
              className={`font-semibold text-sm ${
                completed ? "text-green-600" : "text-gray-800"
              }`}
            >
              {title}
            </h3>
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          </div>
        </div>

        {!isFirst && (
          <div className="absolute top-2 right-10 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="p-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Settings className="w-3 h-3" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        )}

        {!isLast && (
          <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-gray-400 rounded-full border-2 border-white"></div>
        )}
        {!isFirst && (
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-gray-400 rounded-full border-2 border-white"></div>
        )}
      </div>
    </div>
  );

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

  const [showRunTestModal, setShowRunTestModal] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "Dummy Customer",
    businessEmail: "",
    storeName: "Motion Pine",
    country: "Pakistan",
    service: "",
    budget: "100",
  });
  const handleRunTest = async () => {
    if (!isScenarioUpdated) {
      toast.error("Please update the scenario before running the test.", {
        duration: 5000,
        style: {
          background: "#fff0f0",
          color: "#b91c1c",
          border: "1px solid #fca5a5",
        },
      });
      return;
    }

    toast.loading("Generating test email...", { id: "test" });

    try {
      const res = await fetch("http://localhost:5000/mailhook/Run-test-mode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: localStorage.getItem("userid"),
          ...formData,
        }),
      });

      const data = await res.json();
      toast.dismiss("test");

      if (data.success) {
        toast.success("Test completed successfully!");
        setShowValidation(true);
        setSelectedServiceForTemplates(formData.service);
        // setShowTemplateModal(true);
        const userId = localStorage.getItem("userid");
        const res = await fetch(
          `http://localhost:5000/template/alltemplates?userId=${userId}&service=${encodeURIComponent(
            formData.service
          )}`
        );
        const templates = await res.json();
        setTemplateList(Array.isArray(templates.data) ? templates.data : []);

        const updatedValidation = [];
        let previousPassed = true;

        updatedValidation.push({ id: "webhook", passed: true });
        updatedValidation.push({ id: "router", passed: true });
        updatedValidation.push({ id: "template", passed: true });

        for (
          let branchIndex = 0;
          branchIndex < routerBranches.length;
          branchIndex++
        ) {
          const branch = routerBranches[branchIndex];

          for (
            let moduleIndex = 0;
            moduleIndex < branch.modules.length;
            moduleIndex++
          ) {
            const m = branch.modules[moduleIndex];
            let passed = true;

            if (m.app.name === "Webhooks" || m.app.name === "Router") {
              passed = true;
            } else if (m.app.name === "Delay") {
              passed = previousPassed;
            } else if (m.app.name === "Gmail" || m.app.name === "Email") {
              passed = !!m.connectionId && previousPassed;
            }

            updatedValidation.push({ id: m.id, passed });
            previousPassed = passed;
          }
        }

        const failedModules = updatedValidation.filter((v) => !v.passed);
        if (failedModules.length > 0) {
          toast.error(
            "Some modules have missing connections. Please select connections in those modules and then run the test again.",
            {
              duration: 5000,
              style: {
                background: "#fff0f0",
                color: "#b91c1c",
                border: "1px solid #fca5a5",
              },
            }
          );
        }
        setCompletedSteps(updatedValidation);
      } else {
        toast.error(data.message || "Test failed.");
      }
    } catch (err) {
      toast.dismiss("test");
      console.error("Run Test Error:", err);
      toast.error("Run Test failed.");
    }
  };

  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const [emailFields, setEmailFields] = useState({});
  const [selectedField, setSelectedField] = useState(null);
  const [automationOn, setAutomationOn] = useState(false);

  const handleViewEmailData = async () => {
    try {
      const userId = localStorage.getItem("userid");
      toast.loading("Fetching test email...", { id: "email" });

      const res = await fetch(
        `http://localhost:5000/mailhook/get-test-email/${userId}`
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
  const [selectedAppType, setSelectedAppType] = useState("");

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
            <div className="flex items-center flex-wrap gap-3">
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
                onClick={() => setShowRunTestModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center text-sm"
              >
                <Zap className="w-4 h-4 mr-2" />
                Run Test
              </button>

              <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full shadow-sm border ml-2">
                <span className="text-sm font-medium text-gray-700">
                  Activate Scenario
                </span>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={automationOn}
                    onChange={async () => {
                      const newState = !automationOn;
                      console.log("🟡 Toggle:", newState ? "ON" : "OFF");

                      if (newState) {
                        const missingModules = [];

                        const missingConnections = routerBranches.some(
                          (branch, i) =>
                            branch.modules.some((m, j) => {
                              const appName =
                                m.app?.name?.toLowerCase?.() || "";
                              const isEmailModule =
                                appName.includes("email") ||
                                appName.includes("gmail");

                              const missing =
                                isEmailModule &&
                                (!m.connectionId ||
                                  m.connectionId.trim() === "");

                              if (missing) {
                                missingModules.push({
                                  branchIndex: i + 1,
                                  moduleIndex: j + 1,
                                  moduleName: m.app.name,
                                  connectionId: m.connectionId,
                                });
                              }

                              return missing;
                            })
                        );

                        console.log("🚨 Missing modules:", missingModules);

                        if (missingConnections) {
                          const missingNames = missingModules
                            .map(
                              (m) =>
                                `• Branch ${m.branchIndex} → ${m.moduleName} (no connection)`
                            )
                            .join("\n");

                          toast.error(
                            `⚠️ Automation cannot be activated.\n\nMissing connections in:\n${missingNames}`,
                            {
                              duration: 7000,
                              style: {
                                background: "#fff0f0",
                                color: "#b91c1c",
                                border: "1px solid #fca5a5",
                                whiteSpace: "pre-line",
                              },
                            }
                          );

                          setAutomationOn(false);
                          console.log(
                            "❌ Automation blocked due to missing connections"
                          );
                          return;
                        }
                      }

                      setAutomationOn(newState);

                      if (newState) {
                        localStorage.setItem("scenarioActive", "true");
                      } else {
                        localStorage.removeItem("scenarioActive");
                      }

                      // 💾 Step 2: Update scenario in DB
                      try {
                        const userId = localStorage.getItem("userid");
                        const scenarioId = localStorage.getItem("scenarioId"); // or use from state

                        const payload = {
                          userId,
                          automationActive: newState, // <-- new field
                        };

                        const res = await fetch(
                          `http://localhost:5000/scenario/updateAutomation/${scenarioId}`,
                          {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(payload),
                          }
                        );

                        const data = await res.json();
                        if (data.success) {
                          console.log(
                            "✅ Scenario automation state updated in DB"
                          );
                        } else {
                          console.error(
                            "❌ Failed to update automation state in DB:",
                            data.message
                          );
                        }
                      } catch (err) {
                        console.error(
                          "🔥 Error updating automation state in DB:",
                          err
                        );
                      }

                      toast.success(
                        `Automation ${
                          newState ? "activated" : "deactivated"
                        } successfully!`
                      );
                    }}
                    className="sr-only peer"
                  />

                  <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-indigo-300 rounded-full peer-checked:bg-indigo-600 transition-all"></div>
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm peer-checked:translate-x-5 transition-transform"></div>
                </label>

                <span
                  className={`text-xs font-semibold ${
                    automationOn ? "text-green-600" : "text-gray-400"
                  }`}
                >
                  {automationOn ? "ON" : "OFF"}
                </span>
              </div>
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
                completed={
                  showValidation
                    ? completedSteps.find((v) => v.id === "webhook")?.passed ??
                      null
                    : null
                }
                isWebhook={true}
                onEdit={() => setShowWebhookInfo(true)}
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
                completed={
                  showValidation
                    ? completedSteps.find((v) => v.id === "router")?.passed ??
                      null
                    : null
                }
              />

              <div className="w-0.5 h-12 bg-gray-300"></div>
              <FlowNode
                icon={FiFileText}
                title="Template"
                subtitle="Define message structure and content"
                color="border-blue-500"
                number={3}
                completed={
                  showValidation
                    ? completedSteps.find((v) => v.id === "template")?.passed ??
                      null
                    : null
                }
                module={{ app: { name: "Template" } }}
                onEdit={() => {
                  if (showTemplateModal) return;
                  setShowTemplateModal(true);
                }}
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
                        const shouldShowState = showValidation;

                        let validationState = null;
                        if (showValidation) {
                          const match = completedSteps.find(
                            (v) => v.id === module.id
                          );
                          validationState = match ? match.passed : null;
                        }

                        return (
                          <React.Fragment key={module.id}>
                            <FlowNode
                              icon={Icon}
                              title={
                                module.app.name === "First Email"
                                  ? "First Follow-up"
                                  : module.app.name === "Second Email"
                                  ? "Second Follow-up"
                                  : module.app.name
                              }
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
                              completed={
                                shouldShowState ? validationState : null
                              }
                              module={module}
                            />
                            {showValidation &&
                              validationState === false &&
                              (module.app.name === "Delay" ? (
                                <p className="text-sm text-orange-500 mt-2 text-center max-w-xs">
                                  This delay was skipped because the previous
                                  step failed.
                                </p>
                              ) : (
                                <p className="text-sm text-red-500 mt-2 text-center max-w-xs">
                                  This module failed due to missing connection
                                </p>
                              ))}

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
                  <div className="p-4 max-h-96 overflow-y-auto space-y-3">
                    {[
                      {
                        name: "Initial Email",
                        base: "Gmail",
                        color: "bg-red-500",
                        icon: "Gmail",
                      },
                      {
                        name: "First Follow-up",
                        base: "Gmail",
                        color: "bg-red-500",
                        icon: "Gmail",
                      },
                      {
                        name: "Second Follow-up",
                        base: "Gmail",
                        color: "bg-red-500",
                        icon: "Gmail",
                      },
                      {
                        name: "Delay Step",
                        base: "Delay",
                        color: "bg-blue-500",
                        icon: "Delay",
                      },
                    ].map((item, idx) => {
                      const Icon = iconMap[item.icon];
                      return (
                        <div
                          key={idx}
                          onClick={() => {
                            // Map friendly names to consistent internal names
                            let templateName = "";
                            if (item.name === "Initial Email")
                              templateName = "Initial Email";
                            else if (item.name === "First Follow-up")
                              templateName = "First Follow-up";
                            else if (item.name === "Second Follow-up")
                              templateName = "Second Follow-up";

                            setSelectedApp({
                              name: item.base,
                              displayName: item.name, // show Follow-up names in modal + FlowNode
                              color: item.color,
                              icon: item.icon,
                              defaultTemplate: templateName,
                            });

                            setSelectedTemplate(templateName);
                          }}
                          className="flex items-center p-4 rounded-lg border border-gray-200 hover:border-purple-500 hover:bg-purple-50 cursor-pointer transition-colors"
                        >
                          <div
                            className={`w-12 h-12 ${item.color} rounded-lg flex items-center justify-center text-white`}
                          >
                            <Icon className="w-6 h-6" />
                          </div>
                          <div className="ml-4">
                            <p className="font-medium text-gray-800 text-sm">
                              {item.name}
                            </p>
                            <p className="text-xs text-gray-500">{item.base}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <>
                  <div className="p-6 border-b bg-gradient-to-r from-purple-600 to-purple-500 text-white flex justify-between items-center">
                    <h3 className="font-semibold text-lg">
                      {selectedApp.displayName || selectedApp.name}
                    </h3>

                    <button
                      onClick={resetForm}
                      className="hover:bg-white hover:bg-opacity-20 p-1 rounded"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                    {selectedApp?.name === "Delay" ||
                    selectedApp?.type === "Delay" ? (
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
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Application{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={selectedAppType}
                            onChange={(e) => setSelectedAppType(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          >
                            <option value="">-- Choose App Type --</option>
                            <option value="Gmail">Gmail</option>
                            <option value="Email">Email (SMTP/Outlook)</option>
                          </select>
                        </div>

                        {selectedAppType && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Connection <span className="text-red-500">*</span>
                            </label>

                            <div className="flex items-center border border-gray-300 rounded-lg px-2 py-2 focus-within:ring-2 focus-within:ring-purple-500">
                              <select
                                value={selectedConnection}
                                onChange={(e) => {
                                  setSelectedConnection(e.target.value);
                                  setIsScenarioUpdated(false);
                                }}
                                className="flex-1 border-none outline-none text-sm bg-transparent"
                              >
                                <option value="">
                                  -- Select Connection --
                                </option>
                                {connections
                                  .filter((c) => {
                                    if (selectedAppType === "Email")
                                      return (
                                        c.provider === "smtp" ||
                                        c.provider === "outlook"
                                      );
                                    if (selectedAppType === "Gmail")
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
                                  if (selectedAppType === "Email") {
                                    setShowOutlookModal(true);
                                  } else if (selectedAppType === "Gmail") {
                                    setShowGmailModal(true);
                                  }
                                }}
                                className="ml-2 border border-purple-500 text-purple-600 hover:bg-purple-50 rounded-md px-3 py-1 text-sm font-medium"
                              >
                                Add
                              </button>
                            </div>
                          </div>
                        )}

                        <div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Template
                            </label>
                            <input
                              type="text"
                              value={
                                selectedApp?.defaultTemplate ||
                                selectedTemplate ||
                                "N/A"
                              }
                              readOnly
                              className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 text-gray-700"
                            />
                          </div>
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

      {showRunTestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            {/* Header */}
            <div className="flex justify-between items-start border-b px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  Contact {user?.fullName || "Support Team"}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Share a few details to help us understand your needs. We’ll
                  follow up with you directly.
                </p>
              </div>
              <button
                onClick={() => setShowRunTestModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 
          1 0 111.414 1.414L11.414 10l4.293 
          4.293a1 1 0 01-1.414 1.414L10 
          11.414l-4.293 4.293a1 1 0 
          01-1.414-1.414L8.586 10 4.293 
          5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-4 overflow-y-auto max-h-[70vh]">
              {/* Business Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business email
                </label>
                <input
                  type="email"
                  value={formData.businessEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, businessEmail: e.target.value })
                  }
                  placeholder="Enter your business email"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
              </div>

              {/* Store Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Store name
                </label>
                <input
                  type="text"
                  value={formData.storeName}
                  disabled
                  className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100 text-gray-600 cursor-not-allowed"
                />
              </div>

              {/* Country */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country
                </label>
                <input
                  value={formData.country}
                  disabled
                  onChange={(e) =>
                    setFormData({ ...formData, country: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
              </div>

              {/* Service */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select a service offered by {user?.name || "the team"}
                </label>
                <select
                  value={formData.service}
                  onChange={(e) =>
                    setFormData({ ...formData, service: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
                >
                  <option value="">Select service</option>
                  <option>Troubleshooting</option>
                  <option>Theme customization</option>
                  <option>Store build or redesign</option>
                  <option>Store migration</option>
                  <option>Website and marketing content</option>
                  <option>SEO</option>
                  <option>Site performance and speed</option>
                  <option>Custom apps and integrations</option>
                  <option>Store settings configuration</option>
                  <option>Product and collection setup</option>
                  <option>Social media marketing</option>
                  <option>Product descriptions</option>
                  <option>Search engine advertising</option>
                  <option>POS setup and migration</option>
                  <option>Custom domain setup</option>
                  <option>Conversion rate optimization</option>
                  <option>Analytics and tracking</option>
                  <option>Sales channel setup</option>
                  <option>Logo and visual branding</option>
                  <option>Business strategy guidance</option>
                  <option>Website audit and optimization strategy</option>
                  <option>Sales tax guidance</option>
                  <option>Product photography</option>
                  <option>Email marketing</option>
                  <option>3D modelling</option>
                  <option>Banner ads</option>
                  <option>Video and illustrations</option>
                  <option>Content marketing</option>
                  <option>Product sourcing guidance</option>
                </select>
              </div>

              {/* Budget */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Budget (USD)
                </label>
                <input
                  type="number"
                  value={formData.budget}
                  disabled
                  onChange={(e) =>
                    setFormData({ ...formData, budget: e.target.value })
                  }
                  placeholder="Enter your budget"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
              </div>

              {/* Help Description */}
            </div>

            {/* Footer */}
            <div className="border-t px-6 py-4 flex justify-end space-x-3">
              <button
                onClick={() => setShowRunTestModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowRunTestModal(false);
                  handleRunTest(); // uses formData automatically
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
              >
                Generate Test Email
              </button>
            </div>
          </div>
        </div>
      )}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden transition-all">
            <div className="flex justify-between items-center p-5 border-b bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
              <div>
                <h2 className="text-lg font-semibold">Templates Overview</h2>
                <p className="text-xs text-purple-100">
                  Showing 3 templates per service
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium">
                  {allActive ? "Deactivate All" : "Activate All"}
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allActive}
                    onChange={async () => {
                      const newStatus = !allActive;
                      setAllActive(newStatus);
                      setTemplateList((prev) =>
                        prev.map((t) => ({ ...t, active: newStatus }))
                      );
                      await handleToggleAllTemplates(newStatus);
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 rounded-full peer-checked:bg-green-500 transition-colors"></div>
                  <div className="absolute left-[2px] top-[2px] w-5 h-5 bg-white rounded-full shadow-md transition-transform peer-checked:translate-x-5"></div>
                </label>
              </div>
              <button
                onClick={() => setShowTemplateModal(false)}
                className="text-white hover:text-gray-100 hover:bg-white/10 rounded-full p-1 transition"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 bg-gray-50">
              {templateList.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-purple-500 mb-3"></div>
                  <p>Loading templates...</p>
                </div>
              ) : (
                <table className="w-full border-collapse text-sm bg-white rounded-lg shadow-sm overflow-hidden">
                  <thead className="sticky top-0 bg-gray-100">
                    <tr className="text-gray-700 text-left border-b">
                      <th className="p-3">Service</th>
                      <th className="p-3">Template</th>
                      <th className="p-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {templateList.map((t, i) => (
                      <React.Fragment key={t._id || i}>
                        {i === 0 ||
                        templateList[i - 1]?.service !== t.service ? (
                          <tr className="bg-gray-50 border-t-4 border-gray-200">
                            <td
                              colSpan={3}
                              className="p-3 text-gray-900 font-semibold text-sm uppercase tracking-wide"
                            >
                              {t.service || "General Service"}
                            </td>
                          </tr>
                        ) : null}
                        <tr className="border-b hover:bg-purple-50 transition-colors">
                          <td className="p-3 font-medium text-gray-800">
                            {t.name}
                          </td>
                          <td className="p-3 text-gray-600 truncate max-w-[300px]">
                            {t.content.replace(/<[^>]+>/g, "").slice(0, 100)}...
                          </td>
                          <td className="p-3 text-center">
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={t.active}
                                onChange={async () => {
                                  const newStatus = !t.active;
                                  setTemplateList((prev) =>
                                    prev.map((tpl) =>
                                      tpl._id === t._id
                                        ? { ...tpl, active: newStatus }
                                        : tpl
                                    )
                                  );
                                  await handleToggleTemplate(t._id, newStatus);
                                  setAllActive((prevList) => {
                                    const updatedList = templateList.map(
                                      (tpl) =>
                                        tpl._id === t._id
                                          ? { ...tpl, active: newStatus }
                                          : tpl
                                    );
                                    return updatedList.every(
                                      (tpl) => tpl.active
                                    );
                                  });
                                }}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-300 rounded-full peer-checked:bg-green-500 transition-colors"></div>
                              <div className="absolute left-[2px] top-[2px] w-5 h-5 bg-white rounded-full shadow-md transition-transform peer-checked:translate-x-5"></div>
                            </label>
                          </td>
                        </tr>
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="flex-shrink-0 px-6 py-4 border-t bg-white flex justify-end">
              <button
                onClick={() => window.open("/templates", "_blank")}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-md transition-transform hover:scale-[1.02]"
              >
                View More Templates
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopifyScenariosPage;

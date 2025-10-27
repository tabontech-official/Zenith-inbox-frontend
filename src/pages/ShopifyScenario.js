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
  const [showEditTemplateModal, setShowEditTemplateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [editContent, setEditContent] = useState("");

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
    if (open) {
      fetchConnections();
    }
  }, [open]);
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const userId = localStorage.getItem("userid");
        const res = await fetch(
          `https://email-syncing-backend.vercel.app/template/all?userId=${userId}`
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
        console.error("Error fetching templates:", err);
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

  // const handleSaveScenario = async () => {
  //   try {
  //     const payload = {
  //       userId: localStorage.getItem("userid"),
  //       name: scenarioName,
  //       description: scenarioDescription,
  //       type: "shopify",
  //       routerBranches,
  //       scenarioActive: localStorage.getItem("scenarioActive") === "true",
  //     };

  //     const res = await fetch(
  //       `https://email-syncing-backend.vercel.app/scenario/detail/${scenarioId}`,
  //       {
  //         method: "PUT",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify(payload),
  //       }
  //     );

  //     if (!res.ok) {
  //       throw new Error("Failed to update scenario");
  //     }

  //     toast.success("Shopify scenario updated successfully!");
  //     setIsScenarioUpdated(true);
  //   } catch (err) {
  //     console.error("Error updating scenario:", err);
  //     toast.error("Failed to update scenario.");
  //   }
  // };

  const handleSaveScenario = async () => {
    const payload = {
      userId: localStorage.getItem("userid"),
      name: scenarioName || "Untitled Scenario",
      description: scenarioDescription || "",
      type: "shopify",
      routerBranches,
      scenarioActive: localStorage.getItem("scenarioActive") === "true",
    };

    try {
      let res;

      if (scenarioId) {
        res = await fetch(
          `https://email-syncing-backend.vercel.app/scenario/detail/${scenarioId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );
      }

      if (!res || !res.ok) {
        console.warn(
          "Scenario not found or update failed — creating new one..."
        );
        res = await fetch(`https://email-syncing-backend.vercel.app/scenario`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to save scenario");

      setScenarioId(data._id);
      localStorage.setItem("scenarioId", data._id);
      setScenarioName(data.name || scenarioName);
      setScenarioDescription(data.description || scenarioDescription);

      setRouterBranches(
        data.routerBranches?.length > 0
          ? data.routerBranches
          : [{ id: Date.now(), hasModule: false, condition: null, modules: [] }]
      );

      if (data.scenarioActive) {
        setAutomationOn(true);
        localStorage.setItem("scenarioActive", "true");
      } else {
        setAutomationOn(false);
        localStorage.removeItem("scenarioActive");
      }

      toast.success(
        scenarioId
          ? "Shopify scenario updated successfully!"
          : "Shopify scenario created successfully!"
      );
      setShowValidation(false);
      setCompletedSteps([]);
      setIsScenarioUpdated(true);

      const refresh = await fetch("https://email-syncing-backend.vercel.app/scenario/details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: localStorage.getItem("userid") }),
      });
      const freshData = await refresh.json();

      if (freshData) {
        setScenarioId(freshData._id);
        setRouterBranches(
          freshData.routerBranches?.length > 0
            ? freshData.routerBranches
            : [
                {
                  id: Date.now(),
                  hasModule: false,
                  condition: null,
                  modules: [],
                },
              ]
        );
        setScenarioName(freshData.name || scenarioName);
        setScenarioDescription(freshData.description || scenarioDescription);
      }
    } catch (err) {
      console.error("Error saving scenario:", err);
      toast.error("Failed to save scenario.");
    }
  };

  const handleToggleTemplate = async (templateId, newStatus) => {
    try {
      const res = await fetch(
        `https://email-syncing-backend.vercel.app/template/status/${templateId}`,
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
        `https://email-syncing-backend.vercel.app/template/templatestatus/all`,
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

  // useState(() => {
  //   setSavedModule({
  //     app: { name: "Webhooks", color: "bg-red-500", icon: "Webhooks" },
  //     type: "Custom mailhook",
  //     description: "Custom mailhook",
  //   });
  //   setSavedSecondModule({
  //     app: { name: "Router", color: "bg-green-400", icon: "Router" },
  //     type: "Router",
  //     description: "Route to different paths",
  //   });
  //   setSavedThirdModule({
  //     app: { name: "Gmail", color: "bg-red-500", icon: "Gmail" },
  //     type: "Send an Email",
  //     description: "Send an email",
  //   });
  //   setShowRouterBranches(true);
  //   setRouterBranches([
  //     { id: 2, hasModule: false, condition: null, modules: [] },
  //   ]);
  // }, []);
  useEffect(() => {
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

    setRouterBranches((prev) =>
      prev.length > 0
        ? prev
        : [{ id: Date.now(), hasModule: false, condition: null, modules: [] }]
    );
  }, []);

  // useEffect(() => {
  //   const fetchScenario = async () => {
  //     try {
  //       const userId = localStorage.getItem("userid");
  //       if (!userId) {
  //         console.error("No userId found in localStorage");
  //         return;
  //       }

  //       const res = await fetch("https://email-syncing-backend.vercel.app/scenario/details", {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify({ userId }),
  //       });

  //       const data = await res.json();

  //       if (data) {
  //         setScenarioId(data._id);
  //         setScenarioName(data.name || "");
  //         setScenarioDescription(data.description || "");
  //         setRouterBranches(data.routerBranches || []);

  //         // ✅ NEW: handle activation state
  //         if (data.scenarioActive === true) {
  //           setAutomationOn(true);
  //           localStorage.setItem("scenarioActive", "true");
  //         } else {
  //           setAutomationOn(false);
  //           localStorage.removeItem("scenarioActive");
  //         }

  //         console.log("📊 Scenario Active:", data.scenarioActive);
  //       }
  //     } catch (err) {
  //       console.error("Error fetching scenario:", err);
  //     }
  //   };

  //   fetchScenario();
  // }, []);
  useEffect(() => {
    const fetchScenario = async () => {
      try {
        const userId = localStorage.getItem("userid");
        if (!userId) {
          console.error("No userId found in localStorage");
          return;
        }

        const res = await fetch("https://email-syncing-backend.vercel.app/scenario/details", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        });

        const data = await res.json();

        if (data) {
          setScenarioId(data._id);
          setScenarioName(data.name || "");
          setScenarioDescription(data.description || "");

          setRouterBranches(
            data.routerBranches?.length > 0
              ? data.routerBranches
              : [
                  {
                    id: Date.now(),
                    hasModule: false,
                    condition: null,
                    modules: [],
                  },
                ]
          );

          if (data.scenarioActive === true) {
            setAutomationOn(true);
            localStorage.setItem("scenarioActive", "true");
          } else {
            setAutomationOn(false);
            localStorage.removeItem("scenarioActive");
          }

          console.log("📊 Scenario Active:", data.scenarioActive);
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
          `https://email-syncing-backend.vercel.app/template/all?userId=${userId}`
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
        console.error("Error fetching templates:", err);
      }
    };

    if (showTemplateModal && !showValidation) {
      fetchTemplates();
    }
  }, [showTemplateModal, showValidation]);
  // const handleSave = () => {
  //   if (editingBranch !== null) {
  //     const updatedBranches = [...routerBranches];

  //     let type = "";
  //     let description = "";

  //     if (selectedApp?.name === "Delay") {
  //       type = "Delay";
  //       description = `Wait ${delayValue} ${delayUnit}`;
  //     } else if (
  //       selectedApp?.name === "Email" ||
  //       selectedApp?.name === "Gmail"
  //     ) {
  //       type = selectedApp.name === "Email" ? "Custom Email" : "Send an Email";
  //       description = `Send email via ${selectedAppType || selectedApp.name}`;
  //     }

  //     const moduleData = {
  //       id: editingModuleId || Date.now(),
  //       app: {
  //         ...selectedApp,
  //         name:
  //           selectedApp.displayName ||
  //           selectedTemplate ||
  //           selectedApp.defaultTemplate ||
  //           "Unnamed Module",
  //         color: selectedApp.color,
  //         icon: selectedApp.icon,
  //       },
  //       type,
  //       description,
  //       connectionId: selectedConnection,
  //       template: selectedTemplate,
  //       cc: ccList,
  //       bcc: bccList,
  //       delayValue,
  //       delayUnit,
  //       emailType: selectedAppType || selectedApp?.name || "",
  //     };

  //     if (editingModuleId) {
  //       const moduleIndex = updatedBranches[editingBranch].modules.findIndex(
  //         (m) => m.id === editingModuleId
  //       );
  //       if (moduleIndex >= 0) {
  //         updatedBranches[editingBranch].modules[moduleIndex] = {
  //           ...updatedBranches[editingBranch].modules[moduleIndex],
  //           ...moduleData,
  //         };
  //       }
  //     } else {
  //       updatedBranches[editingBranch].modules.push(moduleData);
  //     }

  //     setRouterBranches(updatedBranches);
  //     setEditingBranch(null);
  //     setEditingModuleId(null);
  //   }

  //   resetForm();
  // };


  const handleSave = () => {
  if (editingBranch !== null) {
    const updatedBranches = [...routerBranches];

    let type = "";
    let description = "";

    const isDelay = selectedApp?.name === "Delay";

    if (isDelay) {
      type = "Delay";
      if (delayValue && delayUnit) {
        description = `Wait ${delayValue} ${delayUnit}`;
      } else {
        description = "Delay (no duration set)";
      }
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
      emailType: selectedAppType || selectedApp?.name || "",
      ...(isDelay
        ? { delayValue: delayValue || "", delayUnit: delayUnit || "" } // ✅ include only if Delay
        : {}), // ✅ remove delay fields from non-delay modules
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
      setSelectedAppType(module.emailType || module.app?.name || "");
      setSelectedConnection(module.connectionId || "");
      setSelectedTemplate(module.template || "");
      setSubject(module.subject || "");
      setCcList(module.cc || []);
      setBccList(module.bcc || []);
      setDelayValue(module.delayValue || "5");
      setDelayUnit(module.delayUnit || "seconds");
    }

    setOpen(true);
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
    storeName: "Dummy Store",
    country: "USA",
    service: "",
    budget: "10000",
  });
  useEffect(() => {
    const fetchTestEmailData = async () => {
      try {
        const userId = localStorage.getItem("userid");
        if (!userId || !showRunTestModal) return;

        const res = await fetch(
          `https://email-syncing-backend.vercel.app/mailhook/get-test-data/${userId}`
        );
        const data = await res.json();

        if (data.success && data.data) {
          console.log("✅ Test data loaded:", data.data);

          setFormData({
            fullName: data.data.fullName || "Dummy Customer",
            businessEmail: data.data.businessEmail || "",
            storeName: data.data.storeName || "",
            country: data.data.country || "",
            service: data.data.service || "",
            budget: data.data.budget || "",
            description: data.data.helpDescription || "", // 🟢 show in description box
          });
        } else {
          console.log("ℹ️ No previous test data found for this user.");
        }
      } catch (err) {
        console.error("❌ Error fetching test data:", err);
      }
    };

    if (showRunTestModal) {
      fetchTestEmailData();
    }
  }, [showRunTestModal]);

  // const handleRunTest = async () => {
  //   if (!isScenarioUpdated) {
  //     toast.error("Please update the scenario before running the test.", {
  //       duration: 5000,
  //       style: {
  //         background: "#fff0f0",
  //         color: "#b91c1c",
  //         border: "1px solid #fca5a5",
  //       },
  //     });
  //     return;
  //   }

  //   toast.loading("Generating test email...", { id: "test" });

  //   try {
  //     const res = await fetch("https://email-syncing-backend.vercel.app/mailhook/Run-test-mode", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         userId: localStorage.getItem("userid"),
  //         fullName: formData.fullName,
  //         businessEmail: formData.businessEmail,
  //         storeName: formData.storeName,
  //         country: formData.country,
  //         service: formData.service,
  //         budget: formData.budget,
  //         helpDescription: formData.description,
  //       }),
  //     });

  //     const data = await res.json();
  //     toast.dismiss("test");

  //     if (data.success) {
  //       toast.success("Test completed successfully!");
  //       setShowValidation(true);
  //       setSelectedServiceForTemplates(formData.service);
  //       // setShowTemplateModal(true);
  //       const userId = localStorage.getItem("userid");
  //       const res = await fetch(
  //         `https://email-syncing-backend.vercel.app/template/alltemplates?userId=${userId}&service=${encodeURIComponent(
  //           formData.service
  //         )}`
  //       );
  //       const templates = await res.json();
  //       setTemplateList(Array.isArray(templates.data) ? templates.data : []);

  //       const updatedValidation = [];
  //       let previousPassed = true;

  //       updatedValidation.push({ id: "webhook", passed: true });
  //       updatedValidation.push({ id: "router", passed: true });
  //       updatedValidation.push({ id: "template", passed: true });

  //       for (
  //         let branchIndex = 0;
  //         branchIndex < routerBranches.length;
  //         branchIndex++
  //       ) {
  //         const branch = routerBranches[branchIndex];

  //         for (
  //           let moduleIndex = 0;
  //           moduleIndex < branch.modules.length;
  //           moduleIndex++
  //         ) {
  //           const m = branch.modules[moduleIndex];
  //           let passed = true;

  //           if (m.app.name === "Webhooks" || m.app.name === "Router") {
  //             passed = true;
  //           } else if (m.app.name === "Delay") {
  //             passed = previousPassed;
  //           } else if (m.app.name === "Gmail" || m.app.name === "Email") {
  //             passed = !!m.connectionId && previousPassed;
  //           }

  //           updatedValidation.push({ id: m.id, passed });
  //           previousPassed = passed;
  //         }
  //       }

  //       const failedModules = updatedValidation.filter((v) => !v.passed);
  //       if (failedModules.length > 0) {
  //         toast.error(
  //           "Some modules have missing connections. Please select connections in those modules and then run the test again.",
  //           {
  //             duration: 5000,
  //             style: {
  //               background: "#fff0f0",
  //               color: "#b91c1c",
  //               border: "1px solid #fca5a5",
  //             },
  //           }
  //         );
  //       }
  //       setCompletedSteps(updatedValidation);
  //     } else {
  //       toast.error(data.message || "Test failed.");
  //     }
  //   } catch (err) {
  //     toast.dismiss("test");
  //     console.error("Run Test Error:", err);
  //     toast.error("Run Test failed.");
  //   }
  // };
  const handleRunTest = async () => {
    const { businessEmail, service, description } = formData;

    if (!businessEmail?.trim() || !service?.trim() || !description?.trim()) {
      toast.error("Please fill all required fields before running the test.", {
        duration: 4000,
        style: {
          background: "#fff0f0",
          color: "#b91c1c",
          border: "1px solid #fca5a5",
        },
      });
      return; // ❌ Stop execution if validation fails
    }
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
      const res = await fetch("https://email-syncing-backend.vercel.app/mailhook/Run-test-mode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: localStorage.getItem("userid"),
          fullName: formData.fullName,
          businessEmail: formData.businessEmail,
          storeName: formData.storeName,
          country: formData.country,
          service: formData.service,
          budget: formData.budget,
          helpDescription: formData.description,
        }),
      });

      const data = await res.json();
      toast.dismiss("test");

      if (data.success) {
        toast.success("Test completed successfully!");
        setShowValidation(true);
        setSelectedServiceForTemplates(formData.service);

        // ✅ Fetch templates
        const userId = localStorage.getItem("userid");
        const res = await fetch(
          `https://email-syncing-backend.vercel.app/template/alltemplates?userId=${userId}&service=${encodeURIComponent(
            formData.service
          )}`
        );
        const templates = await res.json();
        setTemplateList(Array.isArray(templates.data) ? templates.data : []);

        // ✅ VALIDATION LOGIC
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

            const appName = (m.app?.name || "").toLowerCase();
            const conn = m.connectionId ? m.connectionId.toString().trim() : "";

            if (appName.includes("webhook") || appName.includes("router")) {
              passed = true;
            } else if (appName.includes("delay")) {
              passed = previousPassed;
            } else if (
              appName.includes("gmail") ||
              appName.includes("email") ||
              appName.includes("follow") ||
              appName.includes("initial")
            ) {
              // 🚫 Treat empty, "(empty)", "null", or "undefined" as invalid
              const hasValidConnection =
                conn !== "" &&
                conn !== "(empty)" &&
                conn !== "null" &&
                conn !== "undefined";

              passed = hasValidConnection && previousPassed;

              if (!hasValidConnection) {
                console.warn(
                  `⚠️ Module "${m.app.name}" in Branch ${
                    branchIndex + 1
                  } is missing connectionId`
                );
              }
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

          console.warn(
            "❌ Test failed — Missing module connections detected:",
            failedModules
          );
        } else {
          console.log("✅ All modules passed validation.");
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
              {/* <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center text-sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </button> */}

              <button
                onClick={handleSaveScenario}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center text-sm"
              >
                {scenarioId ? "Update Scenario" : "Add Scenario"}
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
                      console.clear();
                      console.groupCollapsed(
                        `🟣 SCENARIO TOGGLE → ${
                          newState ? "Activating" : "Deactivating"
                        }`
                      );

                      routerBranches.forEach((branch, i) => {
                        branch.modules.forEach((m, j) => {
                          console.log(`   ↳ Module ${j + 1}:`, {
                            moduleName: m.app?.name,
                            connectionId: m.connectionId || "(empty)",
                            emailType: m.emailType || "(none)",
                            description: m.description || "",
                          });
                        });
                        console.groupEnd();
                      });

                      if (newState) {
                        const missingModules = [];

                        routerBranches.forEach((branch, i) => {
                          branch.modules.forEach((m, j) => {
                            const rawName = m.app?.name || "";
                            const appName = rawName.toLowerCase();

                            const isEmailModule =
                              appName.includes("gmail") ||
                              appName.includes("email") ||
                              appName.includes("follow") ||
                              appName.includes("initial");

                            const connection =
                              m.connectionId &&
                              typeof m.connectionId === "string"
                                ? m.connectionId.trim()
                                : (m.connectionId ?? "").toString().trim();

                            const missing =
                              isEmailModule &&
                              (connection === "" ||
                                connection === "(empty)" ||
                                connection === "undefined" ||
                                connection === "null");

                            if (missing) {
                              missingModules.push({
                                branchIndex: i + 1,
                                moduleIndex: j + 1,
                                moduleName: rawName,
                                connectionId: connection || "(empty)",
                              });
                            }
                          });
                        });

                        if (missingModules.length > 0) {
                          console.warn(
                            "Activation Blocked — Missing Connections:"
                          );
                          missingModules.forEach((m) =>
                            console.warn(
                              `   → Branch ${m.branchIndex}, Module ${m.moduleIndex}: ${m.moduleName} (no connection)`
                            )
                          );

                          toast.error(
                            `Scenario cannot be activated.\n\nMissing connections in:\n${missingModules
                              .map((m) => `• ${m.moduleName} (no connection)`)
                              .join("\n")}`,
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
                            "Automation blocked — missing Email/Gmail connections"
                          );
                          console.groupEnd();
                          console.groupEnd();
                          return;
                        }

                        console.log(
                          "Validation passed — all modules connected."
                        );
                        console.groupEnd();
                      }

                      setAutomationOn(newState);
                      if (newState) {
                        localStorage.setItem("scenarioActive", "true");
                      } else {
                        localStorage.removeItem("scenarioActive");
                      }
                      console.groupEnd();

                      try {
                        const userId = localStorage.getItem("userid");
                        const scenarioIdValue =
                          scenarioId || localStorage.getItem("scenarioId");

                        const res = await fetch(
                          `https://email-syncing-backend.vercel.app/scenario/updateAutomation/${scenarioIdValue}`,
                          {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              userId,
                              automationActive: newState,
                            }),
                          }
                        );

                        const data = await res.json();
                        if (data.success) {
                        } else {
                        }
                      } catch (err) {}
                      console.groupEnd();

                      toast.success(
                        `Automation ${
                          newState ? "activated" : "deactivated"
                        } successfully!`
                      );

                      console.groupEnd();
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
                        name: "Delay",
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
                  <thead className="sticky top-0 bg-gray-100 z-10">
                    <tr className="text-gray-700 text-left border-b">
                      <th className="p-3 w-[15%]">Service</th>
                      <th className="p-3 w-[45%]">Template</th>
                      <th className="p-3 text-center w-[15%]">Status</th>
                      <th className="p-3 text-center w-[15%]">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {templateList.map((t, i) => (
                      <React.Fragment key={t._id || i}>
                        {i === 0 ||
                        templateList[i - 1]?.service !== t.service ? (
                          <tr className="bg-gray-50 border-t-4 border-gray-200">
                            <td
                              colSpan={4}
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

                          <td className="p-3 text-center">
                            <button
                              onClick={() => {
                                setEditingTemplate(t);
                                setEditContent(t.content || "");
                                setShowEditTemplateModal(true);
                              }}
                              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs rounded-md font-medium transition-colors"
                            >
                              Edit
                            </button>
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
                  Fill out the details below to run a test scenario.
                </p>
              </div>
              <button
                onClick={() => setShowRunTestModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-4 overflow-y-auto max-h-[70vh]">
              {/* Business Email (editable) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Email <span className="text-red-500">*</span>
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

              {/* Store Name (disabled, prefilled) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Store Name
                </label>
                <input
                  type="text"
                  value={formData.storeName || "Dummy Store"}
                  disabled
                  className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100 text-gray-600 cursor-not-allowed"
                />
              </div>

              {/* Country (disabled, prefilled) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country
                </label>
                <input
                  type="text"
                  value={formData.country || "USA"}
                  disabled
                  className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100 text-gray-600 cursor-not-allowed"
                />
              </div>

              {/* Service (editable) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select a Service Offered by {user?.name || "the team"}
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

              {/* Budget (disabled, prefilled) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Budget (USD)
                </label>
                <input
                  type="number"
                  value={formData.budget || 10000}
                  disabled
                  className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100 text-gray-600 cursor-not-allowed"
                />
              </div>

              {/* Description (editable) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  rows="4"
                  value={formData.description || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Describe your project, problem, or goal..."
                  className="w-full border border-gray-300 rounded-md px-3 py-2 resize-none focus:ring-2 focus:ring-green-500 focus:outline-none"
                ></textarea>
              </div>
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
                  // Validate before closing
                  const { businessEmail, service, description } = formData;

                  if (
                    !businessEmail?.trim() ||
                    !service?.trim() ||
                    !description?.trim()
                  ) {
                    toast.error(
                      "Please fill all required fields before continuing.",
                      {
                        duration: 4000,
                        style: {
                          background: "#fff0f0",
                          color: "#b91c1c",
                          border: "1px solid #fca5a5",
                        },
                      }
                    );
                    return; // ❌ Stop here — modal stays open
                  }

                  // ✅ All fields valid, now run the test and close
                  handleRunTest();
                  setShowRunTestModal(false);
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
              >
                Generate Test Email
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
              <h2 className="text-lg font-semibold">
                Edit Template — {editingTemplate?.name}
              </h2>
              <button
                onClick={() => setShowEditTemplateModal(false)}
                className="text-white hover:text-gray-200 hover:bg-white/10 p-1 rounded-full transition"
              >
                ✕
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1 space-y-4 bg-gray-50">
              <label className="block text-sm font-semibold text-gray-700">
                Template Content
              </label>

              <ReactQuill
                theme="snow"
                value={editContent}
                onChange={setEditContent}
                className=" rounded-lg shadow-sm"
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: "0.5rem",
                }}
                modules={{
                  toolbar: [
                    [{ header: [1, 2, false] }],
                    ["bold", "italic", "underline", "strike"],
                    [{ list: "ordered" }, { list: "bullet" }],
                    ["link"],
                    ["clean"],
                  ],
                }}
              />

              {/* Insert Fields */}
              <div className="border rounded-lg bg-white p-3 mt-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">
                  Insert Fields
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Full name",
                    "Business email",
                    "Store name",
                    "Store URL",
                    "Country",
                    "Service",
                    "Budget",
                    "Problem & Goal",
                  ].map((field) => (
                    <button
                      key={field}
                      onClick={() => {
                        const placeholder = `{{${field}}}`;
                        // ✅ Insert exactly at cursor position, without line break
                        const quill = document.querySelector(".ql-editor");
                        if (quill) {
                          const sel = window.getSelection();
                          const range = sel.getRangeAt(0);
                          const textNode = document.createTextNode(placeholder);
                          range.insertNode(textNode);
                          // Move cursor to end of inserted text
                          range.setStartAfter(textNode);
                          range.setEndAfter(textNode);
                          sel.removeAllRanges();
                          sel.addRange(range);
                        }
                      }}
                      className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium hover:bg-purple-200 transition"
                    >
                      {field}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t p-4 bg-white flex justify-end space-x-3">
              <button
                onClick={() => setShowEditTemplateModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    const res = await fetch(
                      `https://email-syncing-backend.vercel.app/template/update/${editingTemplate._id}`,
                      {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ content: editContent }),
                      }
                    );
                    const data = await res.json();
                    if (data.success) {
                      toast.success("Template updated successfully!");
                      setShowEditTemplateModal(false);
                      setTemplateList((prev) =>
                        prev.map((tpl) =>
                          tpl._id === editingTemplate._id
                            ? { ...tpl, content: editContent }
                            : tpl
                        )
                      );
                    } else {
                      toast.error(data.message || "Failed to update template.");
                    }
                  } catch (err) {
                    console.error("Error updating template:", err);
                    toast.error("Error updating template.");
                  }
                }}
                className="px-5 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopifyScenariosPage;

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
  const quillRef = useRef(null);

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

  const savedShopifyState = localStorage.getItem("shopifyScenarioState");
  const existingScenarioId = localStorage.getItem("scenarioId");
  let initialEditingMode = "add";

  if (existingScenarioId) {
    initialEditingMode = "update";
    console.log("🟢 Editing existing scenario:", existingScenarioId);
  } else {
    console.log("🆕 No scenario found — Add mode");
  }

  if (savedShopifyState && routerBranches.length === 0) {
    try {
      const parsed = JSON.parse(savedShopifyState);
      if (parsed.routerBranches?.length > 0) {
        console.log(
          "♻️ Pre-restoring routerBranches before React mounts:",
          parsed.routerBranches
        );

        routerBranches.push(...parsed.routerBranches);
        localStorage.setItem("skipScenarioFetch", "true");
      }
    } catch (err) {
      console.error("❌ Failed pre-restore routerBranches:", err);
    }
  }
  const [editingMode, setEditingMode] = useState(initialEditingMode);

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
    if (open) {
      fetchConnections();
    }
  }, [open]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (showOutlookModal || showGmailModal) return;

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
  }, [showOutlookModal, showGmailModal]);

  useEffect(() => {
    const savedScenarioId = localStorage.getItem("scenarioId");

    if (savedScenarioId) {
      console.log("🟢 Restoring scenario ID:", savedScenarioId);
      setScenarioId(savedScenarioId);
      setEditingMode("update");
    } else {
      console.log("🆕 No saved scenario — Add mode");
      setEditingMode("add");
    }
  }, []);

 
  const handleSaveScenario = async () => {
    const payload = {
      userId: localStorage.getItem("userid"),
      name: scenarioName || "Untitled Scenario",
      description: scenarioDescription || "",
      type: "shopify",
      routerBranches,
      scenarioActive: automationOn,
    };

    try {
      let res;
      let data;

      let activeScenarioId = scenarioId || null;

      const storedId = localStorage.getItem("scenarioId");
      if (storedId && storedId !== activeScenarioId) {
        console.warn("⚠️ Mismatch detected between localStorage and state ID");
        console.log("🧩 Fixing ID:", storedId, "→", activeScenarioId);
        if (activeScenarioId) {
          localStorage.setItem("scenarioId", activeScenarioId);
        } else {
          localStorage.removeItem("scenarioId");
        }
      }

      if (!activeScenarioId) {
        const userId = localStorage.getItem("userid");
        const checkRes = await fetch(
          "http://localhost:5000/scenario/details",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId }),
          }
        );

        const existing = await checkRes.json();

        if (
          existing &&
          existing._id &&
          existing.userId &&
          existing.userId.toString() === userId.toString()
        ) {
          activeScenarioId = existing._id;

          setScenarioId(existing._id);
          setEditingMode("update");
          localStorage.setItem("scenarioId", existing._id);
        } else {
          localStorage.removeItem("scenarioId");
          activeScenarioId = null;
        }
      }

      if (activeScenarioId && editingMode !== "update") {
        console.log("🔁 Switching to update mode...");
        setScenarioId(activeScenarioId);
        setEditingMode("update");
      }

      if (activeScenarioId) {
        console.log("✏️ Updating existing scenario:", activeScenarioId);
        res = await fetch(
          `http://localhost:5000/scenario/detail/${activeScenarioId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );
        data = await res.json();

        if (!res.ok)
          throw new Error(data.message || "Failed to update scenario");

        toast.success("Scenario updated successfully!");
      } else {
        console.log("🆕 Creating a new scenario...");
        res = await fetch(`http://localhost:5000/scenario`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        data = await res.json();

        if (!res.ok)
          throw new Error(data.message || "Failed to create scenario");

        toast.success("🎉 New scenario created successfully!");
        setScenarioId(data._id);
        localStorage.setItem("scenarioId", data._id);
        setEditingMode("update");
      }

      setScenarioName(data.name || scenarioName);
      setScenarioDescription(data.description || scenarioDescription);
      setRouterBranches(
        data.routerBranches?.length > 0
          ? data.routerBranches
          : [{ id: Date.now(), hasModule: false, condition: null, modules: [] }]
      );

      if (typeof data.scenarioActive === "boolean") {
        setAutomationOn(data.scenarioActive);
        if (data.scenarioActive) {
          localStorage.setItem("scenarioActive", "true");
        } else {
          localStorage.removeItem("scenarioActive");
        }
      } else {
        console.log(
          "ℹ️ Backend didn't return scenarioActive — keeping current state:",
          automationOn
        );
        if (automationOn) {
          localStorage.setItem("scenarioActive", "true");
        } else {
          localStorage.removeItem("scenarioActive");
        }
      }

      const refresh = await fetch(
        "http://localhost:5000/scenario/details",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: localStorage.getItem("userid") }),
        }
      );
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

      setShowValidation(false);
      setCompletedSteps([]);
      setIsScenarioUpdated(true);
    } catch (err) {
      toast.error("Failed to save scenario.");
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


  useEffect(() => {
    if (localStorage.getItem("skipScenarioFetch") === "true") {
      console.log("🛑 Skipping fetchScenario — local restore already done");
      localStorage.removeItem("skipScenarioFetch");
      return;
    }

    const fetchScenario = async () => {
      try {
        const userId = localStorage.getItem("userid");
        if (!userId) {
          return;
        }

        console.log("🔄 Fetching existing Shopify scenario for user:", userId);

        const res = await fetch(
          "http://localhost:5000/scenario/details",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId }),
          }
        );

        const data = await res.json();

        if (data && data._id) {
          console.log("✅ Scenario fetched successfully:", data);

          localStorage.setItem("scenarioId", data._id);
          console.log("💾 Scenario ID saved to localStorage:", data._id);

          setScenarioId(data._id);
          setEditingMode("update");
          setScenarioName(data.name || "");
          setScenarioDescription(data.description || "");
          setRouterBranches(
            Array.isArray(data.routerBranches) && data.routerBranches.length > 0
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
            console.log("⚡ Scenario is active — toggle set to ON");
          } else {
            setAutomationOn(false);
            localStorage.removeItem("scenarioActive");
          }

          console.log("Loaded scenario from backend:", data.routerBranches);
        } else {
          console.log(
            "ℹ️ No existing scenario found for this user — Add mode."
          );
          setEditingMode("add");
          setAutomationOn(false);
          localStorage.removeItem("scenarioId");
          localStorage.removeItem("scenarioActive");
        }
      } catch (err) {}
    };

    fetchScenario();
  }, []);

  const [allActive, setAllActive] = useState(false);

  // const handleSave = () => {
  //   if (editingBranch !== null) {
  //     const updatedBranches = [...routerBranches];

  //     let type = "";
  //     let description = "";

  //     const isDelay = selectedApp?.name === "Delay";

  //     if (isDelay) {
  //       type = "Delay";
  //       if (delayValue && delayUnit) {
  //         description = `Wait ${delayValue} ${delayUnit}`;
  //       } else {
  //         description = "Delay (no duration set)";
  //       }
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
  //       emailType: selectedAppType || selectedApp?.name || "",
  //       ...(isDelay
  //         ? { delayValue: delayValue || "", delayUnit: delayUnit || "" }
  //         : {}),
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
        ? { delayValue: delayValue || "", delayUnit: delayUnit || "" }
        : {}),
    };

    // 🔥🔥 INSERT MODULE AT SPECIFIC INDEX
    if (insertAtIndex !== null) {
      updatedBranches[editingBranch].modules.splice(
        insertAtIndex,
        0,
        moduleData
      );
      setInsertAtIndex(null); // reset
    }

    // ✏ Edit existing module
    else if (editingModuleId) {
      const moduleIndex = updatedBranches[editingBranch].modules.findIndex(
        (m) => m.id === editingModuleId
      );
      if (moduleIndex >= 0) {
        updatedBranches[editingBranch].modules[moduleIndex] = {
          ...updatedBranches[editingBranch].modules[moduleIndex],
          ...moduleData,
        };
      }
    }

    // ➕ Normal Add to end
    else {
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
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const googleSuccess = params.get("google-auth-success");
    const microsoftSuccess = params.get("microsoft-auth-success");

    if (googleSuccess === "true" || microsoftSuccess === "true") {
      const provider = googleSuccess === "true" ? "Gmail" : "Outlook";
      toast.success(`${provider} connected successfully!`);

      const savedState = localStorage.getItem("shopifyScenarioState");
      if (savedState) {
        try {
          const parsed = JSON.parse(savedState);
          if (parsed.routerBranches?.length > 0) {
            setRouterBranches(parsed.routerBranches);
            localStorage.setItem("skipScenarioFetch", "true");
          } else {
          }
        } catch (err) {}
        localStorage.removeItem("shopifyScenarioState");
      }

      const lastModule = localStorage.getItem("activeShopifyModule");

      fetchConnections().then(() => {
        setOpen(true);

        if (lastModule) {
          const modules = {
            "Initial Email": "Initial Email",
            "First Follow-up": "First Follow-up",
            "Second Follow-up": "Second Follow-up",
          };
          const name = modules[lastModule];
          if (name) {
            setSelectedApp({
              name: "Gmail",
              displayName: name,
              color: "bg-red-500",
              icon: "Gmail",
              defaultTemplate: name,
            });
            setSelectedTemplate(name);
          }
        }
      });

      localStorage.removeItem("activeShopifyModule");
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

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
                setShowWebhookInfo(true);
              } else {
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
  const AddBetweenButton = ({ onClick }) => (
  <button
    onClick={onClick}
    className="
      w-7 h-7 rounded-full 
      bg-white border border-gray-300 
      flex items-center justify-center 
      shadow hover:bg-gray-100 transition 
      absolute left-1/2 transform -translate-x-1/2
      z-20
    "
  >
    <Plus size={16} className="text-gray-700" />
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
  const resetFormFields = () => {
    setSelectedConnection("");
    setSelectedTemplate("");
    setCcList([]);
    setBccList([]);
    setCcInput("");
    setBccInput("");
    setDelayValue("5");
    setDelayUnit("seconds");
    setSubject("");
    setBody("");
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
          `http://localhost:5000/mailhook/get-test-data/${userId}`
        );
        const data = await res.json();

        if (data.success && data.data) {
          setFormData({
            fullName: data.data.fullName || "Dummy Customer",
            businessEmail: data.data.businessEmail || "",
            storeName: data.data.storeName || "",
            country: data.data.country || "",
            service: data.data.service || "",
            budget: data.data.budget || "",
            description: data.data.helpDescription || "",
          });
        } else {
        }
      } catch (err) {}
    };

    if (showRunTestModal) {
      fetchTestEmailData();
    }
  }, [showRunTestModal]);

  useEffect(() => {
    const handleGoogleAuthSuccess = (event) => {
      if (event.data?.type === "google-auth-success") {
        console.log(
          " Gmail connection success detected in ShopifyScenariosPage!"
        );

        fetchConnections();

        setOpen(true);

        toast.success("Gmail connected successfully!");
      }
    };

    window.addEventListener("message", handleGoogleAuthSuccess);

    return () => window.removeEventListener("message", handleGoogleAuthSuccess);
  }, []);

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
      return;
    }

    try {
      const userId = localStorage.getItem("userid");
      const res = await fetch(
        `http://localhost:5000/template/alltemplates/query?userId=${userId}&service=${encodeURIComponent(
          service
        )}`
      );
      const data = await res.json();

      if (!data.success) {
        toast.error("Failed to fetch templates for this service.");
        return;
      }

      const allTemplates = data.data || [];
      const hasInactiveTemplates = allTemplates.some((t) => !t.active);

      if (hasInactiveTemplates) {
        setTemplateList(allTemplates);
        setShowTemplateModal(true);
        toast.error(
          "Please activate these templates before running the test.",
          {
            duration: 5000,
            style: {
              background: "#fff0f0",
              color: "#b91c1c",
              border: "1px solid #fca5a5",
            },
          }
        );
        return;
      }
    } catch (err) {
      console.error("Error checking template status:", err);
      toast.error("Error checking template status.");
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

    const missingModules = [];
    const unverifiedConnections = [];

    routerBranches.forEach((branch, i) => {
      branch.modules.forEach((m, j) => {
        const rawName = m.app?.name || "";
        const appName = rawName.toLowerCase();

        const isEmailModule =
          appName.includes("gmail") ||
          appName.includes("email") ||
          appName.includes("follow") ||
          appName.includes("initial");

        const connectionId =
          typeof m.connectionId === "string"
            ? m.connectionId.trim()
            : (m.connectionId ?? "").toString().trim();

        if (
          isEmailModule &&
          (connectionId === "" ||
            connectionId === "null" ||
            connectionId === "undefined" ||
            connectionId === "(empty)")
        ) {
          missingModules.push({
            branch: i + 1,
            module: j + 1,
            moduleName: rawName,
          });
        }

        if (isEmailModule && connectionId) {
          const connectionData = connections.find(
            (c) => c._id === connectionId
          );
          if (connectionData && !connectionData.verified) {
            unverifiedConnections.push(connectionData);
          }
        }
      });
    });

    if (missingModules.length > 0) {
      toast.error(
        `Cannot run test.\n\nMissing connections in:\n${missingModules
          .map((m) => `• ${m.moduleName}`)
          .join("\n")}`,
        {
          duration: 6000,
          style: {
            background: "#fff0f0",
            color: "#b91c1c",
            border: "1px solid #fca5a5",
            whiteSpace: "pre-line",
          },
        }
      );
      console.warn(" Missing module connections:", missingModules);
      return;
    }

    if (unverifiedConnections.length > 0) {
      console.warn(" Unverified connections detected:", unverifiedConnections);
      setShowVerifyModal(true);
      setUnverifiedConnections(unverifiedConnections);

      toast.error(
        "Some connections are not verified. Please verify them before running the test.",
        {
          duration: 6000,
          style: {
            background: "#fff0f0",
            color: "#b91c1c",
            border: "1px solid #fca5a5",
          },
        }
      );
      return;
    }

    toast.loading("Validating scenario...", { id: "test" });

    try {
      const res = await fetch(
        "http://localhost:5000/mailhook/Run-test-mode",
        {
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
        }
      );

      const data = await res.json();
      toast.dismiss("test");

      if (data.success) {
        toast.success("Test completed successfully!");
        setShowValidation(true);
        setSelectedServiceForTemplates(formData.service);

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
              const hasValidConnection =
                conn !== "" &&
                conn !== "(empty)" &&
                conn !== "null" &&
                conn !== "undefined";

              passed = hasValidConnection && previousPassed;
            }

            updatedValidation.push({ id: m.id, passed });
            previousPassed = passed;
          }
        }

        const failedModules = updatedValidation.filter((v) => !v.passed);
        if (failedModules.length > 0) {
          toast.error(
            "Some modules have missing connections. Please fix them and run the test again.",
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
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [loadingServices, setLoadingServices] = useState(false);
const [insertAtIndex, setInsertAtIndex] = useState(null);

  const handleEdit = async () => {
    if (!showValidation) {
      setShowServiceModal(true);
      setLoadingServices(true);
      const userId = localStorage.getItem("userid");
      try {
        const res = await fetch(
          `http://localhost:5000/template/all?userId=${userId}`
        );
        const data = await res.json();

        const grouped = data.reduce((acc, item) => {
          if (!acc[item.service]) acc[item.service] = [];
          acc[item.service].push(item);
          return acc;
        }, {});

        const top2 = Object.keys(grouped).slice(0, 2);

        const formatted = top2.map((srv) => ({
          service: srv,
          templates: grouped[srv].slice(0, 3),
        }));

        setServiceGroups(formatted);
      } catch (err) {
        console.error("Error fetching services:", err);
      } finally {
        setLoadingServices(false);
      }

      return;
    }

    if (showTemplateModal) return;
    setShowTemplateModal(true);
  };
  const [serviceGroups, setServiceGroups] = useState([]);

  useEffect(() => {
    if (showServiceModal) {
      (async () => {
        const userId = localStorage.getItem("userid");
        try {
          const { data } = await axios.get(
            `http://localhost:5000/template/all?userId=${userId}`
          );

          const grouped = data.reduce((acc, item) => {
            if (!acc[item.service]) acc[item.service] = [];
            acc[item.service].push(item);
            return acc;
          }, {});

          const top2Services = Object.keys(grouped).slice(0, 2);

          const result = top2Services.map((service) => ({
            service,
            templates: grouped[service],
          }));

          const allActive = data.every((t) => t.active === true);
          setAllTemplatesActive(allActive);

          setServiceGroups(result);
        } catch (err) {
          console.error("Failed to fetch templates:", err);
        }
      })();
    }
  }, [showServiceModal]);
  const [allTemplatesActive, setAllTemplatesActive] = useState(true);

  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [unverifiedConnections, setUnverifiedConnections] = useState([]);
  useEffect(() => {
    if (routerBranches.length > 0) {
      localStorage.setItem(
        "routerBranchesState",
        JSON.stringify(routerBranches)
      );
    }
  }, [routerBranches]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 font-inter">
      <Sidebar />

<div className="flex-1 flex flex-col overflow-hidden ml-64">
        <div className="bg-white border-b px-4 sm:px-6 py-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={scenarioName}
                onChange={(e) => setScenarioName(e.target.value)}
                className="text-lg sm:text-xl font-semibold text-gray-800 border-none outline-none focus:ring-0 w-full"
                placeholder="Scenario Name"
              />
              <p className="text-sm text-gray-500 mt-1">
                Configure your automation workflow
              </p>
            </div>
            <div className="flex flex-wrap justify-start gap-3">
              {/* <button
                onClick={handleSaveScenario}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center text-sm"
              >
                {scenarioId ? "Update Scenario" : "Add Scenario"}
              </button> */}
              <button
                onClick={handleSaveScenario}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                {editingMode === "update" || scenarioId
                  ? "Update Scenario"
                  : "Add Scenario"}
              </button>

              <button
                onClick={() => setShowRunTestModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center text-sm"
              >
                <Zap className="w-4 h-4 mr-2" />
                Run Test
              </button>

              <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-full shadow-sm border">
                <span className="text-xs sm:text-sm font-medium text-gray-700">
                  Activate Scenario
                </span>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={automationOn}
                    onChange={async () => {
                      const newState = !automationOn;
                      console.clear();

                      console.log("🧠 Current State:", {
                        automationOn,
                        newState,
                        routerBranchesCount: routerBranches?.length,
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
                          return;
                        }

                        const unverifiedConnections = [];

                        routerBranches.forEach((branch) => {
                          branch.modules.forEach((m) => {
                            const appName = (m.app?.name || "").toLowerCase();
                            const isEmailModule =
                              appName.includes("gmail") ||
                              appName.includes("email") ||
                              appName.includes("follow") ||
                              appName.includes("initial");

                            if (isEmailModule && m.connectionId) {
                              const data = connections.find(
                                (c) => c._id === m.connectionId
                              );

                              if (!data || data.verified === false) {
                                unverifiedConnections.push({
                                  _id: m.connectionId,
                                  email: data?.email,
                                  provider: data?.provider,
                                  verified: false,
                                });
                              }
                            }
                          });
                        });

                        if (unverifiedConnections.length > 0) {
                          setShowVerifyModal(true);
                          setUnverifiedConnections(unverifiedConnections);
                          setAutomationOn(false);

                          toast.error(
                            "Some connections are not verified. Please verify them before activating.",
                            {
                              duration: 6000,
                              style: {
                                background: "#fff0f0",
                                color: "#b91c1c",
                                border: "1px solid #fca5a5",
                              },
                            }
                          );

                          return;
                        }
                      }

                      setAutomationOn(newState);
                      if (newState) {
                        localStorage.setItem("scenarioActive", "true");
                        toast.success("Automation activated!");
                      } else {
                        localStorage.removeItem("scenarioActive");
                        toast.error("Automation deactivated!");
                      }
                    }}
                    className="sr-only peer"
                  />

                  <div className="w-10 h-5 bg-gray-200 peer-checked:bg-indigo-600 rounded-full transition-all"></div>
                  <div className="absolute left-1 top-1 w-3.5 h-3.5 bg-white rounded-full shadow-sm peer-checked:translate-x-5 transition-transform"></div>
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
                onEdit={handleEdit}
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
  <div className="relative flex flex-col items-center">
    
    {/* vertical line */}
    <div className="w-0.5 h-12 bg-gray-300"></div>
    
    {/* PLUS BUTTON BETWEEN NODES */}
    <AddBetweenButton
      onClick={() => {
        setEditingBranch(branchIndex);
        setEditingModuleId(null);

        // NEW: store position so module adds EXACT here
        setInsertAtIndex(moduleIndex + 1);

        setOpen(true);
      }}
      className="top-1/2"
    />

  </div>
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
                            let templateName = "";
                            if (item.name === "Initial Email")
                              templateName = "Initial Email";
                            else if (item.name === "First Follow-up")
                              templateName = "First Follow-up";
                            else if (item.name === "Second Follow-up")
                              templateName = "Second Follow-up";
                            localStorage.setItem(
                              "activeShopifyModule",
                              templateName
                            );

                            setSelectedApp({
                              name: item.base,
                              displayName: item.name,
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
                        <div className="relative">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Application{" "}
                            <span className="text-red-500">*</span>
                          </label>

                          <div className="relative">
                            <select
                              value={selectedAppType}
                              onChange={(e) => {
                                const value = e.target.value;
                                setSelectedAppType(value);
                                fetchConnections();
                              }}
                              className="w-full border border-gray-300 rounded-lg px-4 py-2 pr-20 focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none"
                            >
                              <option value="">-- Choose App Type --</option>
                              <option value="Gmail">Gmail</option>
                              <option value="Email">
                                Email (SMTP/Outlook)
                              </option>
                            </select>

                            {/* Add button INSIDE the select box (to the right) */}
                            <button
                              disabled={!selectedAppType}
                              onClick={() => {
                                if (selectedAppType === "Email") {
                                  setShowOutlookModal(true);
                                } else if (selectedAppType === "Gmail") {
                                  setShowGmailModal(true);
                                } else {
                                  toast.error(
                                    "Please select an application type first."
                                  );
                                }
                              }}
                              className={`absolute right-0 top-0 bottom-0 px-4 text-sm font-medium rounded-r-lg border-l transition-all duration-200 ${
                                selectedAppType
                                  ? "bg-purple-600 text-white border-l-gray-300 hover:bg-purple-700"
                                  : "bg-gray-200 text-gray-400 border-l-gray-300 cursor-not-allowed"
                              }`}
                            >
                              Add
                            </button>
                          </div>

                          <p className="text-xs text-gray-500 mt-2">
                            Choose the application type and click <b>Add</b> to
                            connect a new account.
                          </p>
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

                              {/* <button
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
                              </button> */}
                            </div>
                          </div>
                        )}

                        <div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Template
                            </label>

                            <div className="relative">
                              {/* Read-only Input */}
                              <input
                                type="text"
                                value={
                                  selectedApp?.defaultTemplate ||
                                  selectedTemplate ||
                                  "No template selected"
                                }
                                readOnly
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 pr-20 bg-gray-100 text-gray-700 focus:outline-none cursor-not-allowed"
                              />

                              {/* View Button inside the input box */}
                              <button
                                onClick={() => {
                                  const templateName =
                                    selectedTemplate ||
                                    selectedApp?.defaultTemplate;

                                  if (templateName) {
                                    const encodedName =
                                      encodeURIComponent(templateName);
                                    window.open(
                                      `/templates?view=${encodedName}`,
                                      "_blank"
                                    );
                                  } else {
                                    toast.info("No template selected to view.");
                                  }
                                }}
                                disabled={
                                  !selectedTemplate &&
                                  !selectedApp?.defaultTemplate
                                }
                                className={`absolute right-0 top-0 bottom-0 px-4 text-sm font-medium rounded-r-lg border-l transition-all duration-200 ${
                                  selectedTemplate ||
                                  selectedApp?.defaultTemplate
                                    ? "bg-indigo-600 text-white border-l-gray-300 hover:bg-indigo-700"
                                    : "bg-gray-200 text-gray-400 border-l-gray-300 cursor-not-allowed"
                                }`}
                              >
                                View
                              </button>
                            </div>

                            {/* Hint Text */}
                            <p className="text-xs text-gray-500 mt-2">
                              Click <b>View</b> to open and review the full
                              email template.
                            </p>
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
            resetFormFields();
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
          onSuccess={async () => {
            setShowGmailModal(false);
            setShowOutlookModal(false);

            await fetchConnections();

            toast.success(" Gmail connection added successfully!");

            if (selectedAppType === "Gmail") {
              setSelectedConnection("");
            }
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
      {(showTemplateModal || showEditTemplateModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="flex gap-4 w-full max-w-6xl max-h-[90vh] p-4">
            {showTemplateModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-all duration-300">
                <div
                  className={`flex w-full max-w-6xl max-h-[90vh] p-4 transition-all duration-500 ${
                    showEditTemplateModal ? "justify-between" : "justify-center"
                  }`}
                >
                  {/* 🟣 Templates Overview Modal */}
                  <div
                    className={`bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-500 ${
                      showEditTemplateModal ? "max-w-[55%]" : "max-w-3xl"
                    }`}
                  >
                    <div className="flex justify-between items-center p-5 border-b bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                      <div>
                        <h2 className="text-lg font-semibold">
                          Templates Overview
                        </h2>
                        <p className="text-xs text-purple-100">
                          Showing 3 templates per service
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-white font-medium">
                            {selectedServiceForTemplates || "Selected Service"}
                          </span>

                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={templateList.every((t) => t.active)}
                              onChange={async (e) => {
                                const newStatus = e.target.checked;

                                const updates = templateList.map((t) =>
                                  fetch(
                                    `http://localhost:5000/template/status/${t._id}`,
                                    {
                                      method: "PATCH",
                                      headers: {
                                        "Content-Type": "application/json",
                                      },
                                      body: JSON.stringify({
                                        active: newStatus,
                                      }),
                                    }
                                  )
                                );

                                await Promise.all(updates);
                                toast.success(
                                  `All ${selectedServiceForTemplates} templates ${
                                    newStatus ? "activated" : "deactivated"
                                  } successfully!`
                                );

                                setTemplateList((prev) =>
                                  prev.map((tpl) => ({
                                    ...tpl,
                                    active: newStatus,
                                  }))
                                );
                              }}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-green-500 transition-colors"></div>
                            <div className="absolute left-[2px] top-[2px] w-5 h-5 bg-white rounded-full shadow-md transition-transform peer-checked:translate-x-5"></div>
                          </label>

                          <span
                            className={`text-xs font-semibold ${
                              templateList.every((t) => t.active)
                                ? "text-green-300"
                                : "text-gray-300"
                            }`}
                          >
                            {templateList.every((t) => t.active) ? "ON" : "OFF"}
                          </span>
                        </div>

                        {/* Close Button */}
                        <button
                          onClick={() => setShowTemplateModal(false)}
                          className="text-white hover:text-gray-100 hover:bg-white/10 rounded-full p-1 transition"
                        >
                          ✕
                        </button>
                      </div>
                    </div>

                    {/* Body */}
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
                              <th className="p-3 w-[25%]">Service</th>
                              <th className="p-3 w-[45%]">Template</th>
                              <th className="p-3 text-center w-[15%]">
                                Status
                              </th>
                              <th className="p-3 text-center w-[15%]">
                                Action
                              </th>
                            </tr>
                          </thead>

                          <tbody>
                            {templateList.map((t, i) => (
                              <React.Fragment key={t._id || i}>
                                {/* Group by service */}
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

                                <tr
                                  className={`border-b transition-colors ${
                                    !t.active
                                      ? "bg-red-50"
                                      : "hover:bg-purple-50"
                                  }`}
                                >
                                  {/* 🟢 Service Name (clean) */}
                                  <td className="p-3 font-medium text-gray-800 flex items-center">
                                    {t.service || t.name.split(" - ")[0]}
                                    {!t.active && (
                                      <span className="ml-2 text-red-500 text-xs font-semibold">
                                        ✗ Inactive
                                      </span>
                                    )}
                                  </td>

                                  {/* 🟣 Template Name */}
                                  <td className="p-3 text-gray-700 font-medium">
                                    {t.name.includes("Initial")
                                      ? "Initial Email"
                                      : t.name.includes("First")
                                      ? "First Follow-up"
                                      : t.name.includes("Second")
                                      ? "Second Follow-up"
                                      : "Template"}
                                  </td>

                                  {/* 🟢 Status Toggle */}
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
                                          await handleToggleTemplate(
                                            t._id,
                                            newStatus
                                          );
                                        }}
                                        className="sr-only peer"
                                      />
                                      <div className="w-11 h-6 bg-gray-300 rounded-full peer-checked:bg-green-500 transition-colors"></div>
                                      <div className="absolute left-[2px] top-[2px] w-5 h-5 bg-white rounded-full shadow-md transition-transform peer-checked:translate-x-5"></div>
                                    </label>
                                  </td>

                                  {/* 🟣 Action */}
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
                    <div className="border-t bg-gray-50 p-3 text-center">
                      <button
                        onClick={() => {
                          if (!selectedServiceForTemplates) {
                            toast.error(
                              "No service selected to view templates.",
                              {
                                duration: 3000,
                                style: {
                                  background: "#fff0f0",
                                  color: "#b91c1c",
                                  border: "1px solid #fca5a5",
                                },
                              }
                            );
                            return;
                          }
                          window.open(
                            `/templates?service=${encodeURIComponent(
                              selectedServiceForTemplates
                            )}`,
                            "_blank"
                          );
                        }}
                        className="text-sm text-indigo-600 hover:underline transition"
                      >
                        View More Services Templates
                      </button>
                    </div>
                  </div>

                  {showEditTemplateModal && (
                    <div
                      className="bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden max-w-[45%] transition-all duration-500 transform translate-x-0 animate-slideIn"
                      style={{
                        animation: "slideIn 0.4s ease-out forwards",
                      }}
                    >
                      {/* Header */}
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

                      {/* Body */}
                      <div className="p-5 overflow-y-auto flex-1 space-y-4 bg-gray-50">
                        <label className="block text-sm font-semibold text-gray-700">
                          Template Content
                        </label>

                        <ReactQuill
                          ref={quillRef}
                          theme="snow"
                          value={editContent}
                          onChange={setEditContent}
                          className="rounded-lg shadow-sm"
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
                                  const editor = quillRef.current?.getEditor();
                                  if (editor) {
                                    const placeholder = `{{${field}}}`;
                                    const range = editor.getSelection(true);
                                    if (range) {
                                      editor.insertText(
                                        range.index,
                                        placeholder
                                      );
                                      editor.setSelection(
                                        range.index + placeholder.length
                                      );
                                    } else {
                                      // If cursor not in focus, add at the end
                                      editor.insertText(
                                        editor.getLength(),
                                        placeholder
                                      );
                                    }
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
                                `http://localhost:5000/template/update/${editingTemplate._id}`,
                                {
                                  method: "PUT",
                                  headers: {
                                    "Content-Type": "application/json",
                                  },
                                  body: JSON.stringify({
                                    content: editContent,
                                  }),
                                }
                              );
                              const data = await res.json();
                              if (data.success) {
                                toast.success("Template updated successfully!");
                                setTemplateList((prev) =>
                                  prev.map((tpl) =>
                                    tpl._id === editingTemplate._id
                                      ? { ...tpl, content: editContent }
                                      : tpl
                                  )
                                );
                              } else {
                                toast.error(
                                  data.message || "Failed to update template."
                                );
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
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {(showServiceModal || showEditTemplateModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="flex gap-4 w-full max-w-6xl max-h-[90vh] p-4">
            {showServiceModal && (
              <div
                className={`flex w-full max-w-[90rem] max-h-[90vh] p-6 transition-all duration-500 ${
                  showEditTemplateModal ? "justify-between" : "justify-center"
                }`}
              >
                <div
                  className={`bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-500 ${
                    showEditTemplateModal ? "max-w-[50%]" : "max-w-[70rem]"
                  }`}
                >
                  <div className="flex justify-between items-center p-5 border-b bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                    <div>
                      <h2 className="text-lg font-semibold">
                        Services Overview
                      </h2>
                      <p className="text-xs text-blue-100">
                        Showing 3 templates per service
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={allTemplatesActive}
                            onChange={async (e) => {
                              const userId = localStorage.getItem("userid");
                              const newStatus = e.target.checked;

                              const actionText = newStatus
                                ? "Please wait, templates are being activated..."
                                : "Please wait, templates are being deactivated...";

                              const toastId = toast.loading(actionText);

                              try {
                                const res = await fetch(
                                  `http://localhost:5000/template/templatestatus/all`,
                                  {
                                    method: "PATCH",
                                    headers: {
                                      "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify({ userId }),
                                  }
                                );

                                const data = await res.json();

                                if (data.success) {
                                  setServiceGroups((prev) =>
                                    prev.map((grp) => ({
                                      ...grp,
                                      templates: grp.templates.map((tpl) =>
                                        tpl.service.toLowerCase() === "general"
                                          ? { ...tpl, active: true }
                                          : { ...tpl, active: data.toggledTo }
                                      ),
                                    }))
                                  );

                                  setAllTemplatesActive(data.toggledTo);

                                  toast.success(
                                    data.toggledTo
                                      ? " All templates have been activated successfully!"
                                      : "All templates have been deactivated successfully!",
                                    { id: toastId }
                                  );
                                } else {
                                  toast.error(
                                    data.message ||
                                      "Failed to update templates.",
                                    { id: toastId }
                                  );
                                }
                              } catch (err) {
                                console.error("Error toggling templates:", err);
                                toast.error(
                                  "Something went wrong while updating templates.",
                                  { id: toastId }
                                );
                              }
                            }}
                            className="sr-only peer"
                          />

                          <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-green-500 transition-colors"></div>
                          <div className="absolute left-[2px] top-[2px] w-5 h-5 bg-white rounded-full shadow-md transition-transform peer-checked:translate-x-5"></div>
                        </label>

                        <span
                          className={`text-xs font-semibold ${
                            serviceGroups.every((grp) =>
                              grp.templates.every((t) => t.active)
                            )
                              ? "text-green-300"
                              : "text-gray-300"
                          }`}
                        >
                          {serviceGroups.every((grp) =>
                            grp.templates.every((t) => t.active)
                          )
                            ? "ON"
                            : "OFF"}
                        </span>
                      </div>

                      <button
                        onClick={() => setShowServiceModal(false)}
                        className="text-white hover:text-gray-100 hover:bg-white/10 rounded-full p-1 transition"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  <div className="p-6 overflow-y-auto flex-1 bg-gray-50">
                    {loadingServices ? (
                      <div className="flex flex-col items-center justify-center h-full text-gray-500">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500 mb-3"></div>
                        <p>Loading templates...</p>
                      </div>
                    ) : (
                      serviceGroups
                        .filter(
                          (group) => group.service.toLowerCase() === "general"
                        ) // ✅ Only show "General"
                        .map((group, i) => {
                          const shownTemplates = group.templates.slice(0, 3); // Only 3 templates
                          return (
                            <div
                              key={i}
                              className="mb-6 bg-white rounded-lg shadow border"
                            >
                              {/* Header */}
                              <div className="p-4 bg-blue-50 border-b flex justify-between items-center">
                                <h3 className="text-blue-700 font-bold text-lg">
                                  {group.service} Templates
                                </h3>
                                <p className="text-xs text-gray-500">
                                  Showing {shownTemplates.length} templates
                                </p>
                              </div>

                              {!allTemplatesActive && (
                                <div className="p-4 bg-yellow-50 border-b border-yellow-200 text-sm text-gray-700 leading-relaxed">
                                  <b>Note:</b> Activate your service-specific
                                  templates (e.g., SEO, Theme customization,
                                  etc.) to send personalized emails for that
                                  service.
                                  <br />
                                  If you don’t activate any service templates,
                                  the system will automatically use
                                  <b> General templates</b> for all
                                  communications.
                                  <br />
                                  <a
                                    href="/templates"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline font-medium inline-block mt-2"
                                  >
                                    Click here to view all your services
                                    templates
                                  </a>
                                </div>
                              )}

                              {/* Templates Table */}
                              <table className="w-full border-collapse text-sm">
                                <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                                  <tr>
                                    <th className="p-3 text-left w-[40%]">
                                      Template
                                    </th>
                                    <th className="p-3 text-center w-[20%]">
                                      Status
                                    </th>
                                    <th className="p-3 text-center w-[25%]">
                                      Updated At
                                    </th>
                                    <th className="p-3 text-center w-[15%]">
                                      Action
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {shownTemplates.map((t) => (
                                    <tr
                                      key={t._id}
                                      className={`border-b transition-colors ${
                                        t.active
                                          ? "hover:bg-blue-50"
                                          : "bg-red-50"
                                      }`}
                                    >
                                      <td className="p-3 font-medium text-gray-800">
                                        {t.name.includes("Initial")
                                          ? "Initial Email"
                                          : t.name.includes("First")
                                          ? "First Follow-up"
                                          : "Second Follow-up"}
                                      </td>

                                      {/* Toggle */}
                                      <td className="p-3 text-center">
                                        <label className="relative inline-flex items-center cursor-pointer">
                                          <input
                                            type="checkbox"
                                            checked={t.active}
                                            onChange={async () => {
                                              const newStatus = !t.active;
                                              setServiceGroups((prev) =>
                                                prev.map((grp) => ({
                                                  ...grp,
                                                  templates: grp.templates.map(
                                                    (tpl) =>
                                                      tpl._id === t._id
                                                        ? {
                                                            ...tpl,
                                                            active: newStatus,
                                                          }
                                                        : tpl
                                                  ),
                                                }))
                                              );

                                              await fetch(
                                                `http://localhost:5000/template/status/${t._id}`,
                                                {
                                                  method: "PATCH",
                                                  headers: {
                                                    "Content-Type":
                                                      "application/json",
                                                  },
                                                  body: JSON.stringify({
                                                    active: newStatus,
                                                  }),
                                                }
                                              );
                                            }}
                                            className="sr-only peer"
                                          />
                                          <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-green-500 transition-colors"></div>
                                          <div className="absolute left-[2px] top-[2px] w-5 h-5 bg-white rounded-full shadow-md transition-transform peer-checked:translate-x-5"></div>
                                        </label>
                                      </td>

                                      {/* Updated Date */}
                                      <td className="p-3 text-center text-gray-500">
                                        {new Date(t.updatedAt).toLocaleString(
                                          "en-US",
                                          {
                                            year: "numeric",
                                            month: "short",
                                            day: "2-digit",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            hour12: true,
                                          }
                                        )}
                                      </td>

                                      {/* Edit Button */}
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
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          );
                        })
                    )}
                  </div>

                  <div className="border-t bg-gray-50 p-3 text-center">
                    <button
                      onClick={() => {
                        window.open(`/templates`, "_blank");
                      }}
                      className="text-sm text-indigo-600 hover:underline transition"
                    >
                      View More Services Templates
                    </button>
                  </div>
                </div>

                {showEditTemplateModal && (
                  <div
                    className="bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden max-w-[45%] transition-all duration-500 transform translate-x-0 animate-slideIn"
                    style={{
                      animation: "slideIn 0.4s ease-out forwards",
                    }}
                  >
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
                        ref={quillRef}
                        theme="snow"
                        value={editContent}
                        onChange={setEditContent}
                        className="rounded-lg shadow-sm"
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
                                const editor = quillRef.current?.getEditor();
                                if (editor) {
                                  const placeholder = `{{${field}}}`;
                                  const range = editor.getSelection(true);
                                  if (range) {
                                    editor.insertText(range.index, placeholder);
                                    editor.setSelection(
                                      range.index + placeholder.length
                                    );
                                  } else {
                                    // If cursor not in focus, add at the end
                                    editor.insertText(
                                      editor.getLength(),
                                      placeholder
                                    );
                                  }
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
                              `http://localhost:5000/template/update/${editingTemplate._id}`,
                              {
                                method: "PUT",
                                headers: {
                                  "Content-Type": "application/json",
                                },
                                body: JSON.stringify({
                                  content: editContent,
                                }),
                              }
                            );
                            const data = await res.json();
                            if (data.success) {
                              toast.success("Template updated successfully!");
                              setTemplateList((prev) =>
                                prev.map((tpl) =>
                                  tpl._id === editingTemplate._id
                                    ? { ...tpl, content: editContent }
                                    : tpl
                                )
                              );
                            } else {
                              toast.error(
                                data.message || "Failed to update template."
                              );
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
                )}
              </div>
            )}
          </div>
        </div>
      )}
      {showVerifyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="flex w-full max-w-[60rem] max-h-[85vh] p-4">
            <div className="bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden w-full transition-all duration-500">
              <div className="flex justify-between items-center p-5 border-b bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
                <div>
                  <h2 className="text-lg font-semibold">
                    Verify Email Connections
                  </h2>
                  <p className="text-xs text-indigo-100">
                    Ensure all connections are verified before enabling
                    automation
                  </p>
                </div>

                <button
                  onClick={() => setShowVerifyModal(false)}
                  className="text-white hover:text-gray-100 hover:bg-white/10 rounded-full p-1 transition"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1 bg-gray-50">
                {unverifiedConnections.length > 0 ? (
                  <div className="space-y-4">
                    {[
                      ...new Map(
                        unverifiedConnections.map((c) => [c.email, c])
                      ),
                    ].map(([, conn]) => (
                      <div
                        key={conn._id}
                        className="flex justify-between items-center p-4 border rounded-lg bg-white hover:bg-gray-50 shadow-sm transition"
                      >
                        <div>
                          <p className="text-sm font-semibold text-gray-800">
                            {conn.email}
                          </p>
                          <p className="text-xs text-gray-500 capitalize">
                            {conn.provider}
                          </p>
                        </div>

                        {conn.verifying ? (
                          <div className="flex items-center gap-2 text-blue-600 font-medium text-sm">
                            <span className="animate-spin h-4 w-4 border-t-2 border-blue-600 rounded-full"></span>
                            Verifying...
                          </div>
                        ) : conn.verified ? (
                          <span className="text-green-600 text-sm font-semibold flex items-center gap-1">
                            Verified
                          </span>
                        ) : (
                          <button
                            onClick={async () => {
                              setUnverifiedConnections((prev) =>
                                prev.map((c) =>
                                  c._id === conn._id
                                    ? { ...c, verifying: true }
                                    : c
                                )
                              );

                              try {
                                const res = await fetch(
                                  `http://localhost:5000/mailhook/verify`,
                                  {
                                    method: "POST",
                                    headers: {
                                      "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify({
                                      connectionId: conn._id,
                                    }),
                                  }
                                );
                                const data = await res.json();

                                if (data.success) {
                                  toast.success(
                                    `${conn.email} verified successfully!`
                                  );

                                  setUnverifiedConnections((prev) =>
                                    prev.map((c) =>
                                      c._id === conn._id
                                        ? {
                                            ...c,
                                            verified: true,
                                            verifying: false,
                                          }
                                        : c
                                    )
                                  );

                                  await fetchConnections();

                                  const allVerified =
                                    unverifiedConnections.every(
                                      (c) =>
                                        c._id === conn._id ||
                                        c.verified === true
                                    );

                                  if (allVerified) {
                                    setShowVerifyModal(false);
                                  }
                                } else {
                                  toast.error(
                                    data.message ||
                                      `Failed to verify ${conn.email}`
                                  );
                                  setUnverifiedConnections((prev) =>
                                    prev.map((c) =>
                                      c._id === conn._id
                                        ? { ...c, verifying: false }
                                        : c
                                    )
                                  );
                                }
                              } catch (err) {
                                toast.error(
                                  "Verification error, please try again."
                                );
                                setUnverifiedConnections((prev) =>
                                  prev.map((c) =>
                                    c._id === conn._id
                                      ? { ...c, verifying: false }
                                      : c
                                  )
                                );
                              }
                            }}
                            className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                          >
                            Verify
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-gray-600">
                    <span className="text-3xl mb-2">🎉</span>
                    <p className="text-sm font-medium">
                      All connections are verified and ready!
                    </p>
                  </div>
                )}
              </div>

              <div className="border-t bg-gray-50 p-4 flex justify-center items-center">
                <button
                  onClick={() => window.open("/connection", "_blank")}
                  className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline transition"
                >
                  View all connections
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopifyScenariosPage;

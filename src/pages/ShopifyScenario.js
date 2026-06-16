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
  Settings2,
  RefreshCw,
  RotateCcw,
  Clock3,
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
  const [guideStep, setGuideStep] = useState(0);

  useEffect(() => {
    const step = localStorage.getItem("shopifyGuideStep");

    if (!step) {
      setGuideStep(1); // Start guide
    } else if (step !== "done") {
      setGuideStep(Number(step));
    }
  }, []);

  const skipGuide = () => {
    setGuideStep(0);
    localStorage.setItem("shopifyGuideStep", "done");
  };

  const nextGuide = () => {
    const next = guideStep + 1;
    if (next > 3) {
      skipGuide();
    } else {
      setGuideStep(next);
      localStorage.setItem("shopifyGuideStep", next);
    }
  };

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
  const [showInactiveTemplateConfirm, setShowInactiveTemplateConfirm] = useState(false);
  const [inactiveTemplateService, setInactiveTemplateService] = useState("");
  const savedShopifyState = localStorage.getItem("shopifyScenarioState");
  const [scenarioHistory, setScenarioHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selectedHistoryLog, setSelectedHistoryLog] = useState(null);
  const [historyViewMode, setHistoryViewMode] = useState("builder");
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
          parsed.routerBranches,
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
        `https://email-syncing-backend.vercel.app/auth/getConnection/${localStorage.getItem(
          "userid",
        )}`,
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


  const fetchScenarioHistory = async () => {
    try {
      const activeScenarioId = scenarioId || localStorage.getItem("scenarioId");

      if (!activeScenarioId) return;

      setHistoryLoading(true);

      const res = await fetch(
        `https://email-syncing-backend.vercel.app/scenario-run-log/history/${activeScenarioId}`
      );

      const data = await res.json();

      if (data.success) {
        setScenarioHistory(data.logs || []);
      }
    } catch (err) {
      console.error("Error fetching scenario history:", err);
    } finally {
      setHistoryLoading(false);
    }
  };
  useEffect(() => {
    fetchScenarioHistory();
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
          "https://email-syncing-backend.vercel.app/scenario/details",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId }),
          },
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
          `https://email-syncing-backend.vercel.app/scenario/detail/${activeScenarioId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          },
        );
        data = await res.json();

        if (!res.ok)
          throw new Error(data.message || "Failed to update scenario");

        toast.success("Scenario updated successfully!");
      } else {
        console.log("🆕 Creating a new scenario...");
        res = await fetch(`https://email-syncing-backend.vercel.app/scenario`, {
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
          : [
            {
              id: Date.now(),
              hasModule: false,
              condition: null,
              modules: [],
            },
          ],
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
          automationOn,
        );
        if (automationOn) {
          localStorage.setItem("scenarioActive", "true");
        } else {
          localStorage.removeItem("scenarioActive");
        }
      }

      const refresh = await fetch(
        "https://email-syncing-backend.vercel.app/scenario/details",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: localStorage.getItem("userid") }),
        },
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
            ],
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
        `https://email-syncing-backend.vercel.app/template/status/${templateId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ active: newStatus }),
        },
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
        },
      );

      const data = await res.json();
      if (data.success) {
        toast.success(
          `All templates ${newStatus ? "activated" : "deactivated"}!`,
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
        : [{ id: Date.now(), hasModule: false, condition: null, modules: [] }],
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
          "https://email-syncing-backend.vercel.app/scenario/details",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId }),
          },
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
              ],
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
            "ℹ️ No existing scenario found for this user — Add mode.",
          );
          setEditingMode("add");
          setAutomationOn(false);
          localStorage.removeItem("scenarioId");
          localStorage.removeItem("scenarioActive");
        }
      } catch (err) { }
    };

    fetchScenario();
  }, []);

  const [allActive, setAllActive] = useState(false);


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
      }

      const moduleName =
        selectedApp?.displayName ||
        selectedTemplate ||
        selectedApp?.defaultTemplate ||
        selectedApp?.name ||
        "Initial Email";

      const moduleDescription =
        selectedApp?.name === "Delay"
          ? description
          : `Send email via ${selectedAppType || selectedApp?.name || "Gmail"}`;

      const moduleData = {
        id: editingModuleId || Date.now(),
        app: {
          ...selectedApp,
          name: moduleName,
          color: selectedApp?.color || "bg-red-500",
          icon: selectedApp?.icon || "Gmail",
        },
        type,
        description: moduleDescription,
        connectionId: selectedConnection,
        template: selectedTemplate,
        cc: ccList,
        bcc: bccList,
        emailType: selectedAppType || selectedApp?.name || "",
        ...(isDelay
          ? { delayValue: delayValue || "", delayUnit: delayUnit || "" }
          : {}),
      };

      if (insertAtIndex !== null) {
        updatedBranches[editingBranch].modules.splice(
          insertAtIndex,
          0,
          moduleData,
        );
        setInsertAtIndex(null);
      } else if (editingModuleId) {
        const moduleIndex = updatedBranches[editingBranch].modules.findIndex(
          (m) => m.id === editingModuleId,
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
      const fixedTitle = getModuleTitle(module);
      const fixedEmailType =
        module.emailType ||
        (module.app?.name === "Email" ? "Email" : "") ||
        (module.app?.name === "Gmail" ? "Gmail" : "") ||
        "Gmail";

      setSelectedApp({
        ...(module.app || {}),
        name:
          fixedEmailType === "Email"
            ? "Email"
            : "Gmail",
        displayName: fixedTitle,
        defaultTemplate: module.template || fixedTitle,
        color: module.app?.color || "bg-red-500",
        icon: module.app?.icon || "Gmail",
      });

      setSelectedAppType(fixedEmailType);
      setSelectedConnection(module.connectionId || "");
      setSelectedTemplate(module.template || fixedTitle);
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
        } catch (err) { }
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
       className={`bg-white rounded-xl shadow-lg border-2 border-[#E0E7FF] p-6 w-64 hover:shadow-xl transition-all duration-200 relative cursor-pointer ${
  completed
    ? "ring-2 ring-[#C7D2FE] border-[#8A8CF4]"
    : "ring-2 ring-[#FEE2E2] border-[#FCA5A5]"
}`}
      >
        {completed !== null && (
          <div
          className={`absolute -top-3 -left-3 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md transition-all duration-300 ${
  completed ? "bg-[#8A8CF4]" : "bg-[#EF4444]"
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
           className="absolute top-2 right-2 rounded-lg border border-[#C7D2FE] bg-white p-1.5 text-[#7375E8] shadow-sm transition hover:bg-[#EEF2FF] hover:text-[#5B5FD6]"
          >
            <Eye className="w-4 h-4" />
          </button>
        )}

        <div className="flex items-center space-x-3 mb-3">
         <div className="bg-[#EEF2FF] p-3 rounded-lg">
  <Icon
    className={`w-6 h-6 ${
      completed ? "text-[#7375E8]" : "text-slate-500"
    }`}
  />
</div>
          <div className="flex-1">
            <h3
             className={`font-semibold text-sm ${
  completed ? "text-[#5B5FD6]" : "text-slate-800"
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
className="rounded-lg bg-[#EEF2FF] p-1.5 text-[#5B5FD6] transition hover:bg-[#E0E7FF]"              >
                <Settings className="w-3 h-3" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
className="rounded-lg bg-[#FEE2E2] p-1.5 text-[#DC2626] transition hover:bg-[#FECACA]"              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        )}

        {!isLast && (
          <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-[#C7D2FE] rounded-full border-2 border-white"></div>
        )}

        {!isFirst && (
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-[#C7D2FE] rounded-full border-2 border-white"></div>
        )}
      </div>
    </div>
  );

  const AddModuleButton = ({ onClick }) => (
    <button
      onClick={onClick}
    className="flex h-24 w-64 items-center justify-center rounded-xl border-2 border-dashed border-[#C7D2FE] bg-white transition-all hover:border-[#8A8CF4] hover:bg-[#F5F7FF] group"
    >
    <Plus className="h-6 w-6 text-[#8A8CF4]" />
    <span className="ml-2 font-medium text-[#5B5FD6]">
        Add Module
      </span>
    </button>
  );
  const AddBetweenButton = ({ onClick }) => (
    <button
      onClick={onClick}
         className="absolute left-1/2 z-20 flex h-7 w-7 -translate-x-1/2 items-center justify-center rounded-full border border-[#C7D2FE] bg-white shadow transition hover:bg-[#EEF2FF]"

    >
    <Plus size={16} className="text-[#5B5FD6]" />
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
          `https://email-syncing-backend.vercel.app/mailhook/get-test-data/${userId}`,
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
      } catch (err) { }
    };

    if (showRunTestModal) {
      fetchTestEmailData();
    }
  }, [showRunTestModal]);

  useEffect(() => {
    const handleGoogleAuthSuccess = (event) => {
      if (event.data?.type === "google-auth-success") {
        console.log(
          " Gmail connection success detected in ShopifyScenariosPage!",
        );

        fetchConnections();

        setOpen(true);

        toast.success("Gmail connected successfully!");
      }
    };

    window.addEventListener("message", handleGoogleAuthSuccess);

    return () => window.removeEventListener("message", handleGoogleAuthSuccess);
  }, []);

  const handleRunTest = async (skipInactiveTemplateCheck = false) => {
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
        `https://email-syncing-backend.vercel.app/template/alltemplates/query?userId=${userId}&service=${encodeURIComponent(
          service,
        )}`,
      );
      const data = await res.json();

      if (!data.success) {
        toast.error("Failed to fetch templates for this service.");
        return;
      }

      const allTemplates = data.data || [];
      const hasInactiveTemplates = allTemplates.some((t) => !t.active);

      if (hasInactiveTemplates && !skipInactiveTemplateCheck) {
        setTemplateList(allTemplates);
        setSelectedServiceForTemplates(service);
        setInactiveTemplateService(service);
        setShowInactiveTemplateConfirm(true);

        toast.error(
          `${service} templates are not active.`,
          {
            duration: 5000,
            style: {
              background: "#fff0f0",
              color: "#b91c1c",
              border: "1px solid #fca5a5",
            },
          },
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
            (c) => c._id === connectionId,
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
        },
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
        },
      );
      return;
    }

    toast.loading("Validating scenario...", { id: "test" });

    try {
      const res = await fetch(
        "https://email-syncing-backend.vercel.app/mailhook/Run-test-mode",
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
        },
      );

      const data = await res.json();
      toast.dismiss("test");

      if (data.success) {
        toast.success("Test completed successfully!");
        fetchScenarioHistory();
        setHighlightRunTest(false);
        setTestEmailGenerated(true);
        setShowValidation(true);
        setSelectedServiceForTemplates(formData.service);

        const userId = localStorage.getItem("userid");
        const res = await fetch(
          `https://email-syncing-backend.vercel.app/template/alltemplates?userId=${userId}&service=${encodeURIComponent(
            formData.service,
          )}`,
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
            },
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
  const handleRunTestWithGeneralTemplates = async () => {
    const originalService = formData.service;

    setFormData((prev) => ({
      ...prev,
      service: "General",
    }));

    setTimeout(() => {
      handleRunTest();
      setFormData((prev) => ({
        ...prev,
        service: originalService,
      }));
    }, 0);
  };
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const [emailFields, setEmailFields] = useState({});
  const [selectedField, setSelectedField] = useState(null);
  const [automationOn, setAutomationOn] = useState(false);
  const [highlightRunTest, setHighlightRunTest] = useState(false);
  const [testEmailGenerated, setTestEmailGenerated] = useState(false);
  const runTestButtonRef = useRef(null);
  const webhookNodeRef = useRef(null);
  const routerNodeRef = useRef(null);
  const saveScenarioButtonRef = useRef(null);
  const activateScenarioRef = useRef(null);

  const scrollToRef = (ref) => {
    ref.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  };

  const handleViewEmailData = async () => {
    try {
      const userId = localStorage.getItem("userid");
      toast.loading("Fetching test email...", { id: "email" });

      const res = await fetch(
        `https://email-syncing-backend.vercel.app/mailhook/get-test-email/${userId}`,
      );
      const data = await res.json();

      if (!data.success || !data.email) {
        toast.error("No test email found. Please generate a test email first.", { id: "email" });
        setHighlightRunTest(true);
        setTestEmailGenerated(false);
        return;
      }

      toast.success("Test email fetched successfully!", { id: "email" });
      setHighlightRunTest(false);
      setTestEmailGenerated(true);

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
          `https://email-syncing-backend.vercel.app/template/all?userId=${userId}`,
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

  // useEffect(() => {
  //   if (showServiceModal) {
  //     (async () => {
  //       const userId = localStorage.getItem("userid");
  //       try {
  //         const { data } = await axios.get(
  //           `https://email-syncing-backend.vercel.app/template/all?userId=${userId}`
  //         );

  //         const grouped = data.reduce((acc, item) => {
  //           if (!acc[item.service]) acc[item.service] = [];
  //           acc[item.service].push(item);
  //           return acc;
  //         }, {});

  //         const top2Services = Object.keys(grouped).slice(0, 2);

  //         const result = top2Services.map((service) => ({
  //           service,
  //           templates: grouped[service],
  //         }));

  //         const allActive = data.every((t) => t.active === true);
  //         setAllTemplatesActive(allActive);

  //         setServiceGroups(result);
  //       } catch (err) {
  //         console.error("Failed to fetch templates:", err);
  //       }
  //     })();
  //   }
  // }, [showServiceModal]);

  useEffect(() => {
    if (showServiceModal) {
      (async () => {
        const userId = localStorage.getItem("userid");
        try {
          const { data } = await axios.get(
            `https://email-syncing-backend.vercel.app/template/all?userId=${userId}`,
          );

          const grouped = data.reduce((acc, item) => {
            if (!acc[item.service]) acc[item.service] = [];
            acc[item.service].push(item);
            return acc;
          }, {});

          const result = Object.keys(grouped).map((service) => ({
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
        JSON.stringify(routerBranches),
      );
    }
  }, [routerBranches]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [savedGuideStep, setSavedGuideStep] = useState(null);

  useEffect(() => {
    const modalOpen =
      showServiceModal || showEditTemplateModal || showEmailPreview; // 👈 Added EmailInspector modal

    if (modalOpen) {
      if (guideStep > 0 && savedGuideStep === null) {
        setSavedGuideStep(guideStep); // Save current step
      }
      setGuideStep(0); // Hide guide
    } else {
      if (savedGuideStep !== null) {
        setGuideStep(savedGuideStep); // Restore step
        setSavedGuideStep(null);
      }
    }
  }, [showServiceModal, showEditTemplateModal, showEmailPreview]);

  const getEmailModules = () => {
    return routerBranches.flatMap((branch) =>
      (branch.modules || []).filter((m) => {
        const name = (m.app?.name || "").toLowerCase();

        return (
          name.includes("gmail") ||
          name.includes("email") ||
          name.includes("follow") ||
          name.includes("initial")
        );
      })
    );
  };

  const findFirstMissingEmailModule = () => {
    for (let branchIndex = 0; branchIndex < routerBranches.length; branchIndex++) {
      const branch = routerBranches[branchIndex];

      for (const module of branch.modules || []) {
        const name = (module.app?.name || "").toLowerCase();

        const isEmailModule =
          name.includes("gmail") ||
          name.includes("email") ||
          name.includes("follow") ||
          name.includes("initial");

        const connectionId = (module.connectionId || "").toString().trim();

        const missing =
          isEmailModule &&
          (!connectionId ||
            connectionId === "null" ||
            connectionId === "undefined" ||
            connectionId === "(empty)");

        if (missing) {
          return { branchIndex, module };
        }
      }
    }

    return null;
  };

  const isModuleCompleted = (module) => {
    const name = (module.app?.name || "").toLowerCase();
    const type = (module.type || "").toLowerCase();

    const isDelay = name.includes("delay") || type === "delay";

    if (isDelay) {
      return Boolean(module.delayValue && module.delayUnit);
    }

    const isEmailModule =
      name.includes("gmail") ||
      name.includes("email") ||
      name.includes("follow") ||
      name.includes("initial");

    if (isEmailModule) {
      const connectionId = (module.connectionId || "").toString().trim();

      return (
        connectionId &&
        connectionId !== "null" &&
        connectionId !== "undefined" &&
        connectionId !== "(empty)"
      );
    }

    return false;
  };

  const emailModules = getEmailModules();

  const allEmailModulesConfigured =
    emailModules.length > 0 &&
    emailModules.every((m) => {
      const connectionId = (m.connectionId || "").toString().trim();
      return (
        connectionId &&
        connectionId !== "null" &&
        connectionId !== "undefined" &&
        connectionId !== "(empty)"
      );
    });

  const selectedConnections = emailModules
    .map((m) => connections.find((c) => c._id === m.connectionId))
    .filter(Boolean);

  const allSelectedConnectionsVerified =
    selectedConnections.length > 0 &&
    selectedConnections.every((c) => c.verified === true);

  const hasTestEmail =
    Boolean(emailFields && Object.keys(emailFields).length > 0) ||
    showValidation ||
    testEmailGenerated;

  const setupSteps = [
    {
      key: "webhook",
      label: "Webhook ready",
      completed: Boolean(user?.mailhook),
    },
    {
      key: "router",
      label: "Router configured",
      completed: Array.isArray(routerBranches) && routerBranches.length > 0,
    },
    // {
    //   key: "testEmail",
    //   label: "Test email generated",
    //   completed: hasTestEmail,
    // },
    {
      key: "emailModules",
      label: "Email modules configured",
      completed: allEmailModulesConfigured,
    },
    // {
    //   key: "connections",
    //   label: "Connections verified",
    //   completed: allSelectedConnectionsVerified,
    // },
    {
      key: "templates",
      label: "Templates active",
      completed: showValidation || allTemplatesActive,
    },
    {
      key: "scenarioSaved",
      label: "Scenario saved",
      completed: Boolean(scenarioId) && isScenarioUpdated,
    },
    {
      key: "scenarioActivated",
      label: "Scenario activated",
      completed: automationOn,
    },
  ];

  const handleSetupStepClick = (stepKey) => {
    switch (stepKey) {
      case "webhook":
        scrollToRef(webhookNodeRef);
        setShowWebhookInfo(true);
        break;

      case "router":
        scrollToRef(routerNodeRef);
        handleViewEmailData();
        break;

      case "testEmail":
        scrollToRef(runTestButtonRef);
        setHighlightRunTest(true);
        break;

      case "emailModules": {
        const firstMissing = findFirstMissingEmailModule();

        if (firstMissing) {
          handleEditModule(firstMissing.branchIndex, firstMissing.module);
        } else {
          toast.success("All email modules are configured.");
        }

        break;
      }

      case "connections": {
        const unverified = selectedConnections.filter((c) => !c.verified);

        if (unverified.length > 0) {
          setUnverifiedConnections(unverified);
          setShowVerifyModal(true);
        } else {
          toast.success("All selected connections are verified.");
        }

        break;
      }

      case "templates":
        setShowServiceModal(true);
        break;

      case "scenarioSaved":
        scrollToRef(saveScenarioButtonRef);
        break;

      case "scenarioActivated":
        scrollToRef(activateScenarioRef);
        break;

      default:
        break;
    }
  };

  const getModuleTitle = (module) => {
    const rawName = module?.app?.name || "";
    const template = module?.template || module?.app?.defaultTemplate || "";
    const emailType = module?.emailType || "";

    if (rawName === "First Email") return "First Follow-up";
    if (rawName === "Second Email") return "Second Follow-up";

    if (
      !rawName ||
      rawName === "Unnamed Module" ||
      rawName.toLowerCase() === "gmail" ||
      rawName.toLowerCase() === "email"
    ) {
      if (template) return template;

      if (emailType === "Gmail" || emailType === "Email") {
        return "Initial Email";
      }

      return "Initial Email";
    }

    return rawName;
  };

  const SetupProgressCard = () => {
    const completedCount = setupSteps.filter((s) => s.completed).length;
    const progress = Math.round((completedCount / setupSteps.length) * 100);

    return (
      <div className="w-full lg:w-72 rounded-xl border border-[#E0E7FF] bg-white shadow-sm overflow-hidden">
        <div className="border-b border-[#E0E7FF] bg-[#F5F7FF] px-4 py-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-700">
              Setup Progress
            </h3>

            <span className="rounded-full border border-[#C7D2FE] bg-[#EEF2FF] px-2 py-0.5 text-xs font-semibold text-[#5B5FD6]">
              {completedCount}/{setupSteps.length}
            </span>
          </div>

          <div className="mt-3 h-1.5 w-full rounded-full bg-[#E0E7FF]">
            <div
              className="h-1.5 rounded-full bg-[#8A8CF4] transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="space-y-2 p-4">
          {setupSteps.map((step) => (
            <button
              key={step.key}
              type="button"
              onClick={() => handleSetupStepClick(step.key)}
              className={`w-full rounded-lg border px-3 py-2 text-left text-xs transition ${step.completed
                  ? "border-[#C7D2FE] bg-[#EEF2FF] hover:bg-[#E0E7FF]"
                  : "border-gray-200 bg-gray-50 hover:border-[#C7D2FE] hover:bg-[#F5F7FF]"
                }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`flex h-4 w-4 items-center justify-center rounded border text-[10px] ${step.completed
                        ? "border-[#8A8CF4] bg-[#8A8CF4] text-white"
                        : "border-gray-300 bg-white text-gray-400"
                      }`}
                  >
                    {step.completed ? "✓" : ""}
                  </span>

                  <span
                    className={`font-medium ${step.completed ? "text-[#5B5FD6]" : "text-gray-600"
                      }`}
                  >
                    {step.label}
                  </span>
                </div>

                <span
                  className={`font-semibold ${step.completed ? "text-[#5B5FD6]" : "text-gray-400"
                    }`}
                >
                  {step.completed ? "Done" : "Pending"}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  const ScenarioHistoryPanel = () => {
    return (
      <div className="h-full p-4 bg-gray-50/50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
              History
            </h3>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Recent scenario runs
            </p>
          </div>

          <button
            onClick={fetchScenarioHistory}
            className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition"
            title="Refresh history"
          >
            ↻
          </button>
        </div>

        <div className="space-y-3">
          {historyLoading ? (
            <p className="text-xs text-gray-500">Loading...</p>
          ) : scenarioHistory.length === 0 ? (
            <p className="text-xs text-gray-400">No history yet.</p>
          ) : (
            scenarioHistory.map((log) => {
              const duration =
                log.startedAt && log.completedAt
                  ? `${Math.max(
                    1,
                    Math.round(
                      (new Date(log.completedAt) - new Date(log.startedAt)) /
                      1000
                    )
                  )} sec`
                  : "< 1 sec";

              return (
                <div
                  key={log._id}
                  onClick={() => setHistoryViewMode("table")}
                  className="group bg-white border border-gray-200 rounded-xl px-4 py-3 cursor-pointer transition-all duration-200 hover:border-indigo-200 hover:shadow-md hover:-translate-y-0.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-xs font-semibold text-gray-900">
                        {new Date(log.createdAt).toLocaleString()}
                      </h4>

                      <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">
                        <RotateCcw size={10} />
                        Manual Run
                      </div>
                    </div>

                    <span
                      className={`text-[10px] px-2.5 py-1 rounded-full font-semibold border ${log.status === "success"
                        ? "bg-green-50 text-green-700 border-green-200"
                        : log.status === "failed"
                          ? "bg-red-50 text-red-700 border-red-200"
                          : "bg-yellow-50 text-yellow-700 border-yellow-200"
                        }`}
                    >
                      {log.status === "failed" ? "Error" : "Success"}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-4">
                    <div className="rounded-lg bg-blue-50 px-2 py-2 text-center">
                      <Clock3 size={13} className="mx-auto text-blue-600 mb-1" />
                      <p className="text-[10px] font-medium text-blue-700">
                        {duration}
                      </p>
                    </div>

                    <div className="rounded-lg bg-purple-50 px-2 py-2 text-center">
                      <Settings2
                        size={13}
                        className="mx-auto text-purple-600 mb-1"
                      />
                      <p className="text-[10px] font-medium text-purple-700">
                        {log.steps?.length || 0} ops
                      </p>
                    </div>

                    <div className="rounded-lg bg-gray-50 px-2 py-2 text-center">
                      <RefreshCw
                        size={13}
                        className="mx-auto text-gray-600 mb-1"
                      />
                      <p className="text-[10px] font-medium text-gray-700">
                        0 retries
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 font-inter">
      <Sidebar />

      <div className="flex-1 flex flex-col md:ml-64 ml-0 transition-all duration-300 h-screen overflow-y-auto">
        {historyViewMode === "table" ? (
          <div className="flex-1 bg-gray-50 flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="shrink-0 bg-white border-b border-gray-200 px-6 py-2.5 flex items-center gap-4 shadow-sm z-10">
              <button
                onClick={() => setHistoryViewMode("builder")}
                className="inline-flex items-center justify-center w-8 h-8 rounded-full text-gray-500 hover:bg-gray-50 border border-gray-200 transition-colors"
              >
                <ArrowLeft size={18} />
              </button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Scenario History</h1>
                <p className="text-sm text-gray-500">View all past executions and statuses</p>
              </div>
            </div>

            {/* Table Container */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="grid grid-cols-[1.5fr_1.5fr_1fr_1fr_1fr_1fr_auto] bg-gray-50/80 text-xs font-medium text-gray-500 uppercase tracking-wide border-b border-gray-200">
                  <div className="px-5 py-3">Started</div>
                  <div className="px-5 py-3">Run Name</div>
                  <div className="px-5 py-3">Trigger / Activity</div>
                  <div className="px-5 py-3">Status</div>
                  <div className="px-5 py-3">Duration</div>
                  <div className="px-5 py-3">Operations</div>
                  <div className="px-5 py-3 text-right">Action</div>
                </div>

                <div className="divide-y divide-gray-100">
                  {scenarioHistory.length === 0 ? (
                    <div className="px-5 py-8 text-center text-gray-500 text-sm">No history logs found.</div>
                  ) : (
                    scenarioHistory.map((log) => {
                      const duration = log.startedAt && log.completedAt
                        ? `${Math.max(1, Math.round((new Date(log.completedAt) - new Date(log.startedAt)) / 1000))}s`
                        : "< 1s";

                      return (
                        <div key={log._id} className="grid grid-cols-[1.5fr_1.5fr_1fr_1fr_1fr_1fr_auto] items-center text-sm text-gray-700 hover:bg-gray-50/50 transition-colors">
                          <div className="px-5 py-3 font-normal text-gray-700">
                            {new Date(log.createdAt).toLocaleString(undefined, {
                              month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'
                            })}
                          </div>
                          <div className="px-5 py-3 text-gray-700 truncate">
                            {log.scenarioName || "Shopify Scenario"}
                          </div>
                          <div className="px-5 py-3">
                            <span className="flex w-fit items-center gap-1.5 rounded-md border border-[#C7D2FE] bg-[#EEF2FF] px-2 py-1 text-xs font-medium text-[#5B5FD6]">
                              <Zap size={10} className="text-[#5B5FD6]" />
                              Instant
                            </span>
                          </div>
                          <div className="px-5 py-3">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-normal border ${log.status === "success" ? "bg-green-50 text-green-700 border-green-200" :
                              log.status === "failed" ? "bg-red-50 text-red-700 border-red-200" :
                                "bg-yellow-50 text-yellow-700 border-yellow-200"
                              }`}>
                              {log.status === "failed" ? "Error" : log.status === "partial" ? "Partial" : "Success"}
                            </span>
                          </div>
                          <div className="px-5 py-3 text-gray-500 text-sm text-gray-600">{duration}</div>
                          <div className="px-5 py-3 text-gray-500">{log.steps?.length || 0}</div>
                          <div className="px-5 py-3 text-right">
                            <button
                              onClick={() => {
                                setSelectedHistoryLog(log);
                                setHistoryViewMode("details");
                              }}
                              className="px-3 py-1.5 bg-white border border-gray-200 rounded-md text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                            >
                              Details
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : historyViewMode === "details" && selectedHistoryLog ? (() => {
          const emailBody = selectedHistoryLog.requestPayload?.body || "";

          const getLineValue = (label) => {
            const regex = new RegExp(`${label}\s*:\s*(.+)`, "i");
            const match = emailBody.match(regex);
            return match?.[1]?.trim() || "";
          };

          const getBusinessName = () => {
            const match = emailBody.match(/business,\s*(.+?)\./i);
            return match?.[1]?.trim() || "";
          };

          const getCustomerFromSignature = () => {
            const match = emailBody.match(/Best regards,\s*([\s\S]+)/i);
            return match?.[1]?.trim()?.split("\n")?.[0] || "";
          };

          const duration = selectedHistoryLog.startedAt && selectedHistoryLog.completedAt
            ? `${Math.max(1, Math.round((new Date(selectedHistoryLog.completedAt) - new Date(selectedHistoryLog.startedAt)) / 1000))} sec`
            : "Less than 1 sec";

          const leadDetails = {
            customerName: getCustomerFromSignature() || selectedHistoryLog.customerName || getLineValue("Name") || "N/A",
            businessName: getBusinessName() || getLineValue("Business") || "N/A",
            service: selectedHistoryLog.service || getLineValue("Service needed") || "N/A",
            budget: getLineValue("Budget") || "N/A",
            website: getLineValue("Website") || "N/A",
            country: getLineValue("Country") || "N/A",
          };
          const getStepColor = (status) => {
            if (status === "success") return "border-green-200 bg-green-50 text-green-700";
            if (status === "failed") return "border-red-200 bg-red-50 text-red-700";
            return "border-yellow-200 bg-yellow-50 text-yellow-700";
          };

          const getStepLabel = (step) => {
            if (step.stepKey === "reply-email-send") return "Initial Email";
            if (step.stepKey === "delay-job-create") return "Delay";
            if (step.stepKey === "delayed-email-send") {
              return step.meta?.moduleName || step.stepName || "Follow-up Email";
            }
            return step.stepName || "Step";
          };

          const getStepReason = (step) => {
            if (step.status === "success") {
              if (step.stepKey === "reply-email-send") return "Initial reply email was sent successfully.";
              if (step.stepKey === "delay-job-create") return "Delay job was created and scheduled successfully.";
              if (step.stepKey === "delayed-email-send") return "Follow-up email was sent successfully after delay.";
              return step.message || "Step completed successfully.";
            }

            return step.issue || step.message || "This step failed.";
          };
          const statusColors = selectedHistoryLog.status === "success"
            ? "bg-green-50 border-green-200 text-green-700"
            : selectedHistoryLog.status === "failed"
              ? "bg-red-50 border-red-200 text-red-700"
              : "bg-yellow-50 border-yellow-200 text-yellow-700";

          return (
            <div className="flex-1 bg-gray-50 flex flex-col h-full overflow-hidden">
              {/* Header - Fixed */}
              <div className="shrink-0 bg-white border-b border-gray-200 px-6 py-2.5 flex items-center justify-between shadow-sm z-10">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setHistoryViewMode("table")}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-full text-gray-500 hover:bg-gray-50 border border-gray-200 transition-colors"
                  >
                    <ArrowLeft size={18} />
                  </button>
                  <div>
                    <h1 className="text-lg font-semibold text-gray-900 flex items-center gap-3">
                      Run Details
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-normal border ${statusColors} uppercase tracking-wider`}>
                        {selectedHistoryLog.status}
                      </span>
                    </h1>
                    <p className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                      <Clock3 size={12} /> {new Date(selectedHistoryLog.createdAt).toLocaleString()}
                      <span className="text-gray-300">|</span>
                      <RefreshCw size={12} /> {duration} duration
                    </p>
                  </div>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-5xl mx-auto space-y-6">

                  {/* Lead Details Card */}
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50">
                      <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                        <FiUsers className="text-indigo-500" />
                        Extracted Lead Information
                      </h3>
                    </div>
                    <div className="p-5 grid grid-cols-2 sm:grid-cols-3 gap-y-6 gap-x-8">
                      <div>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Customer Name</p>
                        <p className="text-sm text-gray-900 font-medium">{leadDetails.customerName}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Business</p>
                        <p className="text-sm text-gray-900 font-medium">{leadDetails.businessName}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Service Needed</p>
                        <p className="text-sm text-gray-900 font-medium">{leadDetails.service}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Budget</p>
                        <p className="text-sm text-gray-900 font-medium">{leadDetails.budget}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Country</p>
                        <p className="text-sm text-gray-900 font-medium">{leadDetails.country}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Website</p>
                        {leadDetails.website !== "N/A" ? (
                          <a href={leadDetails.website.startsWith('http') ? leadDetails.website : `https://${leadDetails.website}`} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline font-medium flex items-center gap-1">
                            {leadDetails.website} <FiLink size={12} />
                          </a>
                        ) : <p className="text-sm text-gray-900 font-medium">N/A</p>}
                      </div>
                    </div>
                  </div>


                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50">
                      <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                        <RefreshCw className="text-indigo-500" size={15} />
                        Scenario Execution Thread
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        Complete step-by-step execution status for this scenario run.
                      </p>
                    </div>

                    <div className="p-5 space-y-4">
                      {(selectedHistoryLog.steps || []).map((step, index) => {
                        const isSuccess = step.status === "success";
                        const isFailed = step.status === "failed";

                        return (
                          <div key={index} className="relative pl-8">
                            {index < selectedHistoryLog.steps.length - 1 && (
                              <div className="absolute left-[11px] top-7 bottom-[-18px] w-0.5 bg-gray-200"></div>
                            )}

                            <div
                              className={`absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isSuccess
                                ? "bg-green-500 text-white"
                                : isFailed
                                  ? "bg-red-500 text-white"
                                  : "bg-yellow-500 text-white"
                                }`}
                            >
                              {isSuccess ? "✓" : isFailed ? "!" : "…"}
                            </div>

                            <div className="border border-gray-200 rounded-lg bg-white p-4 shadow-sm">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <h4 className="text-sm font-semibold text-gray-900">
                                    {index + 1}. {getStepLabel(step)}
                                  </h4>

                                  <p className="text-xs text-gray-500 mt-1">
                                    {step.completedAt
                                      ? new Date(step.completedAt).toLocaleString()
                                      : "Not completed yet"}
                                  </p>
                                </div>

                                <span
                                  className={`text-[10px] px-2.5 py-1 rounded-full font-semibold border ${getStepColor(
                                    step.status
                                  )}`}
                                >
                                  {step.status?.toUpperCase() || "PENDING"}
                                </span>
                              </div>

                              <div className="mt-3 text-sm text-gray-700">
                                <p>
                                  <span className="font-semibold">Reason:</span>{" "}
                                  {getStepReason(step)}
                                </p>

                                {step.suggestion && (
                                  <p className="mt-1 text-red-600">
                                    <span className="font-semibold">Suggestion:</span>{" "}
                                    {step.suggestion}
                                  </p>
                                )}
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-xs">
                                {step.meta?.templateName && (
                                  <div className="bg-gray-50 border rounded-md p-3">
                                    <p className="text-gray-400 uppercase font-semibold mb-1">
                                      Template
                                    </p>
                                    <p className="text-gray-800 font-medium">
                                      {step.meta.templateName}
                                    </p>
                                  </div>
                                )}

                                {step.meta?.service && (
                                  <div className="bg-gray-50 border rounded-md p-3">
                                    <p className="text-gray-400 uppercase font-semibold mb-1">
                                      Service
                                    </p>
                                    <p className="text-gray-800 font-medium">
                                      {step.meta.service}
                                    </p>
                                  </div>
                                )}

                                {step.meta?.stepType && (
                                  <div className="bg-gray-50 border rounded-md p-3">
                                    <p className="text-gray-400 uppercase font-semibold mb-1">
                                      Email Type
                                    </p>
                                    <p className="text-gray-800 font-medium capitalize">
                                      {step.meta.stepType}
                                    </p>
                                  </div>
                                )}

                                {step.meta?.replyEmailId && (
                                  <div className="bg-gray-50 border rounded-md p-3">
                                    <p className="text-gray-400 uppercase font-semibold mb-1">
                                      Reply Email ID
                                    </p>
                                    <p className="text-gray-800 font-medium break-all">
                                      {step.meta.replyEmailId}
                                    </p>
                                  </div>
                                )}

                                {step.meta?.delayValue && (
                                  <div className="bg-gray-50 border rounded-md p-3">
                                    <p className="text-gray-400 uppercase font-semibold mb-1">
                                      Delay
                                    </p>
                                    <p className="text-gray-800 font-medium">
                                      {step.meta.delayValue} {step.meta.delayUnit}
                                    </p>
                                  </div>
                                )}

                                {step.meta?.scheduledAt && (
                                  <div className="bg-gray-50 border rounded-md p-3">
                                    <p className="text-gray-400 uppercase font-semibold mb-1">
                                      Scheduled At
                                    </p>
                                    <p className="text-gray-800 font-medium">
                                      {new Date(step.meta.scheduledAt).toLocaleString()}
                                    </p>
                                  </div>
                                )}

                                {step.meta?.smtpErrorMessage && (
                                  <div className="bg-red-50 border border-red-200 rounded-md p-3 sm:col-span-2">
                                    <p className="text-red-500 uppercase font-semibold mb-1">
                                      SMTP Error
                                    </p>
                                    <p className="text-red-700 font-medium">
                                      {step.meta.smtpErrorMessage}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Reply Email */}

                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50">
                      <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                        <FiMail className="text-green-500" />
                        Reply Email
                      </h3>
                    </div>

                    {selectedHistoryLog.replyEmail ? (
                      <>
                        <div className="px-5 py-4 border-b border-gray-100 bg-white grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                              Reply Sent From
                            </p>
                            <p className="text-sm font-medium text-gray-900 break-all">
                              {selectedHistoryLog.replyEmail.senderAddress || "N/A"}
                            </p>
                          </div>

                          <div>
                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                              Reply Sent To
                            </p>
                            <p className="text-sm font-medium text-gray-900 break-all">
                              {selectedHistoryLog.replyEmail.recipientAddress || "N/A"}
                            </p>
                          </div>

                          <div>
                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                              Subject
                            </p>
                            <p className="text-sm font-medium text-gray-900 break-all">
                              {selectedHistoryLog.replyEmail.subject || "N/A"}
                            </p>
                          </div>

                          <div>
                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                              Template Used
                            </p>
                            <p className="text-sm font-medium text-gray-900">
                              {selectedHistoryLog.templateName ||
                                selectedHistoryLog.replyEmail.service ||
                                "N/A"}
                            </p>
                          </div>
                        </div>

                        <div className="p-0">
                          <pre className="text-[11px] font-mono text-gray-700 bg-[#f8f9fa] p-5 overflow-x-auto m-0 whitespace-pre-wrap">
                            {selectedHistoryLog.replyEmail.textBody ||
                              "No reply email body available."}
                          </pre>
                        </div>
                      </>
                    ) : (
                      <div className="p-5 bg-yellow-50 text-sm text-yellow-800">
                        No reply email was sent.
                      </div>
                    )}
                  </div>
                  {/* Raw Payload Detail */}
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                      <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                        <FiMail className="text-gray-500" />
                        Incoming Lead Email
                      </h3>
                    </div>
                    <div className="p-0">
                      <pre className="text-[11px] font-mono text-gray-700 bg-[#f8f9fa] p-5 overflow-x-auto m-0 whitespace-pre-wrap">
                        {emailBody || "No payload body available."}
                      </pre>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          );
        })() : (
          <>

            <div className="sticky top-0 z-30 bg-white border-b px-4 sm:px-6 py-1 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-0.5">
                <div className="flex-1">
                  <input
                    type="text"
                    value={scenarioName}
                    onChange={(e) => setScenarioName(e.target.value)}
                    className="text-xl sm:text-xl font-semibold text-gray-800 border-none outline-none focus:ring-0 w-full"
                    placeholder="Scenario Name"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Configure your automation workflow
                  </p>
                </div>
                <div className="flex flex-wrap justify-start gap-3">

                  <div ref={saveScenarioButtonRef} className="relative">
                    <button
                      onClick={handleSaveScenario}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                    >
                      {editingMode === "update" || scenarioId
                        ? "Update Scenario"
                        : "Add Scenario"}
                    </button>
                  </div>

                  <div ref={runTestButtonRef} className="relative">
                    <button
                      onClick={() => {
                        setHighlightRunTest(false);
                        setShowRunTestModal(true);
                      }}
                      className={`px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center text-sm ${highlightRunTest
                        ? "animate-pulse ring-4 ring-yellow-400 shadow-lg shadow-yellow-300"
                        : ""
                        }`}
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Run Test
                    </button>

                    {highlightRunTest && (
                      <div className="absolute right-0 top-full mt-3 w-72 bg-yellow-50 border border-yellow-300 text-yellow-900 text-sm rounded-lg shadow-xl p-3 z-50">
                        <div className="absolute -top-2 right-8 w-4 h-4 bg-yellow-50 border-l border-t border-yellow-300 rotate-45"></div>
                        Click this button to generate a test email. After that, the Router will show the email data.
                      </div>
                    )}
                  </div>

                  <div ref={activateScenarioRef} className="flex items-center gap-2 bg-white px-3 py-2 rounded-full shadow-sm border">
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
                                },
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
                                    (c) => c._id === m.connectionId,
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
                                },
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
                      className={`text-xs font-semibold ${automationOn ? "text-green-600" : "text-gray-400"
                        }`}
                    >
                      {automationOn ? "ON" : "OFF"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">         {guideStep > 0 && (
              <div
                className="
    fixed inset-0 
    bg-black bg-opacity-20 
    backdrop-blur-sm
    z-[40]
  "
              ></div>
            )}

              <div className="grid grid-cols-1 lg:grid-cols-[18rem_minmax(0,1fr)_20rem] h-full">
                <aside className="w-full lg:w-72 self-start p-4">
                  <SetupProgressCard />
                </aside>
                <div className="min-w-0 flex justify-center p-4 lg:p-8">
                  <div className="w-full max-w-5xl mx-auto flex flex-col items-center">
                    <div className="flex flex-col items-center mb-8">
                      <div ref={webhookNodeRef} className={guideStep === 1 ? "relative z-[70]" : "relative"}>
                        {/* GUIDE STEP 1 */}
                        {guideStep === 1 && (
                          <div
                            className="
          absolute top-1/2 left-full -translate-y-1/2 ml-4
          w-72 bg-white shadow-xl border border-gray-200 
          rounded-lg p-4 z-[80]
        "
                          >
                            {/* ARROW pointing left */}
                            <div
                              className="
          absolute top-1/2 -left-2 -translate-y-1/2
          w-4 h-4 bg-white rotate-45
          border-b border-r border-gray-200
        "
                            ></div>

                            <div className="flex justify-between items-center mb-2">
                              <h4 className="font-semibold text-gray-900">
                                Webhook Email
                              </h4>
                              <span className="text-xs text-gray-500">1/3</span>
                            </div>

                            <p className="text-sm text-gray-600 mb-3">
                              This webhook email is used to receive the forwarded Lead
                              emails from your email service provider.
                            </p>

                            <div className="flex justify-between">
                              <button
                                onClick={skipGuide}
                                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-100"
                              >
                                Skip
                              </button>

                              <button
                                onClick={nextGuide}
                                className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                              >
                                Next
                              </button>
                            </div>
                          </div>
                        )}

                        <FlowNode
                          icon={Cloud}
                          title="Webhooks"
                          subtitle="Custom mailhook"
                          color="border-[#8A8CF4]"
                          number={1}
                          isFirst={true}
                          completed={
                            showValidation
                              ? (completedSteps.find((v) => v.id === "webhook")
                                ?.passed ?? null)
                              : Boolean(user?.mailhook)
                          }
                          isWebhook={true}
                          onEdit={() => setShowWebhookInfo(true)}
                        />
                      </div>
                      <div className="w-0.5 h-12 bg-gray-300 relative">
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                          <Zap className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-center mb-8">
                      <div ref={routerNodeRef} className={guideStep === 2 ? "relative z-[70]" : "relative"}>
                        {/* GUIDE STEP 2 */}
                        {guideStep === 2 && (
                          <div
                            className="
        absolute top-1/2 left-full -translate-y-1/2 ml-4
        w-72 bg-white shadow-xl border border-gray-200
        rounded-lg p-4 z-[80]
      "
                          >
                            {/* ARROW pointing left */}
                            <div
                              className="
          absolute top-1/2 -left-2 -translate-y-1/2
          w-4 h-4 bg-white rotate-45
          border-b border-r border-gray-200
        "
                            ></div>

                            <div className="flex justify-between items-center mb-2">
                              <h4 className="font-semibold text-gray-900">Router</h4>
                              <span className="text-xs text-gray-500">2/3</span>
                            </div>

                            <p className="text-sm text-gray-600 mb-3">
                              Router is used to view the Lead email's content, common
                              use is while configuring the Leads email templates and
                              Conditional email flows.
                            </p>

                            <div className="flex justify-between">
                              <button
                                onClick={skipGuide}
                                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-100"
                              >
                                Skip
                              </button>

                              <button
                                onClick={nextGuide}
                                className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                              >
                                Next
                              </button>
                            </div>
                          </div>
                        )}

                        <FlowNode
                          icon={GitBranch}
                          title="Router"
                          subtitle="Route to different paths"
                          color="border-[#8A8CF4]"                          number={2}
                          isRouter={true}
                          completed={
                            showValidation
                              ? (completedSteps.find((v) => v.id === "router")
                                ?.passed ?? null)
                              : Array.isArray(routerBranches) && routerBranches.length > 0
                          }
                        />
                      </div>
                      <div className="w-0.5 h-12 bg-gray-300"></div>
                      <div className={guideStep === 3 ? "relative z-[70]" : "relative"}>
                        {/* GUIDE STEP 3 */}
                        {guideStep === 3 && (
                          <div
                            className="
        absolute top-1/2 left-full -translate-y-1/2 ml-4
        w-72 bg-white shadow-xl border border-gray-200
        rounded-lg p-4 z-[80]
      "
                          >
                            {/* ARROW pointing left */}
                            <div
                              className="
          absolute top-1/2 -left-2 -translate-y-1/2
          w-4 h-4 bg-white rotate-45
          border-b border-r border-gray-200
        "
                            ></div>

                            <div className="flex justify-between items-center mb-2">
                              <h4 className="font-semibold text-gray-900">
                                Shopify Email Templates
                              </h4>
                              <span className="text-xs text-gray-500">3/3</span>
                            </div>

                            <p className="text-sm text-gray-600 mb-3">
                              Shopify email Templates are specifically Designed to
                              manage the email templates based on the Service requested
                              by client
                            </p>

                            <div className="flex justify-between">
                              <button
                                onClick={skipGuide}
                                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-100"
                              >
                                Skip
                              </button>

                              <button
                                onClick={nextGuide}
                                className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                              >
                                Finish
                              </button>
                            </div>
                          </div>
                        )}
                        <FlowNode
                          icon={FiFileText}
                          title="Template"
                          subtitle="Define message structure and content"
                          color="border-[#8A8CF4]"
                          number={3}
                          completed={
                            showValidation
                              ? (completedSteps.find((v) => v.id === "template")
                                ?.passed ?? null)
                              : allTemplatesActive
                          }
                          module={{ app: { name: "Template" } }}
                          onEdit={handleEdit}
                        />
                      </div>

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
                                  (v) => v.id === module.id,
                                );
                                validationState = match ? match.passed : null;
                              }

                              return (
                                <React.Fragment key={module.id}>
                                  <FlowNode
                                    icon={Icon}
                                    title={getModuleTitle(module)}
                                    subtitle={module.description}
                                    color="border-[#8A8CF4]"
                                    number={3 + moduleIndex}
                                    onEdit={() =>
                                      handleEditModule(branchIndex, module)
                                    }
                                    onDelete={() =>
                                      handleRemoveModule(branchIndex, module.id)
                                    }
                                    isLast={moduleIndex === branch.modules.length - 1}
                                    completed={
                                      shouldShowState
                                        ? validationState
                                        : isModuleCompleted(module)
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

                <aside className="hidden lg:block border-l border-gray-200  h-full overflow-y-auto">
                  <ScenarioHistoryPanel />
                </aside>
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
                                      templateName,
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
                                    <p className="text-sm text-gray-500">{item.base}</p>
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
                                            "Please select an application type first.",
                                          );
                                        }
                                      }}
                                      className={`absolute right-0 top-0 bottom-0 px-4 text-sm font-medium rounded-r-lg border-l transition-all duration-200 ${selectedAppType
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
                                              "_blank",
                                            );
                                          } else {
                                            toast.info("No template selected to view.");
                                          }
                                        }}
                                        disabled={
                                          !selectedTemplate &&
                                          !selectedApp?.defaultTemplate
                                        }
                                        className={`absolute right-0 top-0 bottom-0 px-4 text-sm font-medium rounded-r-lg border-l transition-all duration-200 ${selectedTemplate ||
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
              </div>
            </div>
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
          </>
        )}
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

            <div className="px-6 py-5 space-y-4 overflow-y-auto max-h-[70vh]">
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
                      },
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
                  className={`flex w-full max-w-6xl max-h-[90vh] p-4 transition-all duration-500 ${showEditTemplateModal ? "justify-between" : "justify-center"
                    }`}
                >
                  {/* 🟣 Templates Overview Modal */}
                  <div
                    className={`bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-500 ${showEditTemplateModal ? "max-w-[55%]" : "max-w-3xl"
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
                                    `https://email-syncing-backend.vercel.app/template/status/${t._id}`,
                                    {
                                      method: "PATCH",
                                      headers: {
                                        "Content-Type": "application/json",
                                      },
                                      body: JSON.stringify({
                                        active: newStatus,
                                      }),
                                    },
                                  ),
                                );

                                await Promise.all(updates);
                                toast.success(
                                  `All ${selectedServiceForTemplates} templates ${newStatus ? "activated" : "deactivated"
                                  } successfully!`,
                                );

                                setTemplateList((prev) =>
                                  prev.map((tpl) => ({
                                    ...tpl,
                                    active: newStatus,
                                  })),
                                );
                              }}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-green-500 transition-colors"></div>
                            <div className="absolute left-[2px] top-[2px] w-5 h-5 bg-white rounded-full shadow-md transition-transform peer-checked:translate-x-5"></div>
                          </label>

                          <span
                            className={`text-xs font-semibold ${templateList.every((t) => t.active)
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
                                  className={`border-b transition-colors ${!t.active
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
                                                : tpl,
                                            ),
                                          );
                                          await handleToggleTemplate(
                                            t._id,
                                            newStatus,
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
                              },
                            );
                            return;
                          }
                          window.open(
                            `/templates?service=${encodeURIComponent(
                              selectedServiceForTemplates,
                            )}`,
                            "_blank",
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
                                        placeholder,
                                      );
                                      editor.setSelection(
                                        range.index + placeholder.length,
                                      );
                                    } else {
                                      // If cursor not in focus, add at the end
                                      editor.insertText(
                                        editor.getLength(),
                                        placeholder,
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
                                `https://email-syncing-backend.vercel.app/template/update/${editingTemplate._id}`,
                                {
                                  method: "PUT",
                                  headers: {
                                    "Content-Type": "application/json",
                                  },
                                  body: JSON.stringify({
                                    content: editContent,
                                  }),
                                },
                              );
                              const data = await res.json();
                              if (data.success) {
                                toast.success("Template updated successfully!");
                                setTemplateList((prev) =>
                                  prev.map((tpl) =>
                                    tpl._id === editingTemplate._id
                                      ? { ...tpl, content: editContent }
                                      : tpl,
                                  ),
                                );
                              } else {
                                toast.error(
                                  data.message || "Failed to update template.",
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
      {showServiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 px-4 backdrop-blur-sm">
          <div className="flex w-full max-w-6xl max-h-[90vh] gap-4 p-4">
            {showServiceModal && (
              <div
                className={`flex w-full max-w-[90rem] max-h-[90vh] p-6 transition-all duration-500 ${showEditTemplateModal ? "justify-between" : "justify-center"
                  }`}
              >
                <div
                  className={`flex flex-col overflow-hidden rounded-2xl border border-[#E0E7FF] bg-white shadow-2xl transition-all duration-500 ${showEditTemplateModal ? "max-w-[50%]" : "max-w-[70rem]"
                    }`}
                >
                  <div className="flex items-center justify-between border-b border-[#E0E7FF] bg-[#F5F7FF] p-5">
                    <div>
                      <h2 className="text-lg font-bold text-slate-800">
                        Services Overview
                      </h2>
                      <p className="text-xs text-slate-500">
                        Showing 3 templates per service
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <label className="relative inline-flex cursor-pointer items-center">
                          <input
                            type="checkbox"
                            checked={allTemplatesActive}
                            onChange={async (e) => {
                              const userId = localStorage.getItem("userid");
                              const newStatus = e.target.checked;

                              const toastId = toast.loading(
                                newStatus
                                  ? "Please wait, templates are being activated..."
                                  : "Please wait, templates are being deactivated..."
                              );

                              try {
                                const res = await fetch(
                                  `https://email-syncing-backend.vercel.app/template/templatestatus/all`,
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
                                      ? "All templates have been activated successfully!"
                                      : "All templates have been deactivated successfully!",
                                    { id: toastId }
                                  );
                                } else {
                                  toast.error(
                                    data.message || "Failed to update templates.",
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

                          <div className="h-6 w-11 rounded-full bg-[#E0E7FF] transition-colors peer-checked:bg-[#8A8CF4]" />
                          <div className="absolute left-[2px] top-[2px] h-5 w-5 rounded-full bg-white shadow-md transition-transform peer-checked:translate-x-5" />
                        </label>

                        <span
                          className={`text-xs font-semibold ${serviceGroups.every((grp) =>
                            grp.templates.every((t) => t.active)
                          )
                              ? "text-[#5B5FD6]"
                              : "text-slate-400"
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
                        onClick={() => {
                          setShowServiceModal(false);
                          setShowEditTemplateModal(false);
                          setEditingTemplate(null);
                        }}
                        className="rounded-full p-1 text-slate-500 transition hover:bg-[#E0E7FF] hover:text-[#5B5FD6]"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto bg-[#FAFBFF] p-6">
                    {loadingServices ? (
                      <div className="flex h-full flex-col items-center justify-center text-slate-500">
                        <div className="mb-3 h-8 w-8 animate-spin rounded-full border-2 border-[#E0E7FF] border-t-[#8A8CF4]" />
                        <p>Loading templates...</p>
                      </div>
                    ) : (
                      serviceGroups
                        .filter((group) => group.service.toLowerCase() === "general")
                        .map((group, i) => {
                          const shownTemplates = group.templates.slice(0, 3);

                          return (
                            <div
                              key={i}
                              className="mb-6 overflow-hidden rounded-xl border border-[#E0E7FF] bg-white shadow-sm"
                            >
                              <div className="flex items-center justify-between border-b border-[#E0E7FF] bg-[#F5F7FF] p-4">
                                <h3 className="text-lg font-bold text-slate-800">
                                  {group.service} Templates
                                </h3>
                                <p className="text-sm text-slate-500">
                                  Showing {shownTemplates.length} templates
                                </p>
                              </div>

                              {!allTemplatesActive && (
                                <div className="border-b border-[#E0E7FF] bg-[#FFFDF5] p-4 text-sm leading-relaxed text-slate-700">
                                  <b className="text-slate-900">Note:</b> Activate your
                                  service-specific templates to send personalized emails.
                                  Otherwise, the system will use{" "}
                                  <b className="text-[#5B5FD6]">General templates</b>.
                                  <br />
                                  <a
                                    href="/templates"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-2 inline-block font-semibold text-[#5B5FD6] hover:underline"
                                  >
                                    Click here to view all your services templates
                                  </a>
                                </div>
                              )}

                              <table className="w-full border-collapse text-sm">
                                <thead className="bg-[#F8FAFF] text-xs uppercase text-slate-500">
                                  <tr>
                                    <th className="p-3 text-left w-[40%]">Template</th>
                                    <th className="p-3 text-center w-[20%]">Status</th>
                                    <th className="p-3 text-center w-[25%]">
                                      Updated At
                                    </th>
                                    <th className="p-3 text-center w-[15%]">Action</th>
                                  </tr>
                                </thead>

                                <tbody>
                                  {shownTemplates.map((t) => (
                                    <tr
                                      key={t._id}
                                      className={`border-t border-[#EEF2FF] transition-colors ${t.active
                                          ? "hover:bg-[#F8FAFF]"
                                          : "bg-[#FFF7F7]"
                                        }`}
                                    >
                                      <td className="p-3 font-medium text-slate-700">
                                        {t.name.includes("Initial")
                                          ? "Initial Email"
                                          : t.name.includes("First")
                                            ? "First Follow-up"
                                            : "Second Follow-up"}
                                      </td>

                                      <td className="p-3 text-center">
                                        <label className="relative inline-flex cursor-pointer items-center">
                                          <input
                                            type="checkbox"
                                            checked={t.active}
                                            onChange={async () => {
                                              const newStatus = !t.active;

                                              setServiceGroups((prev) =>
                                                prev.map((grp) => ({
                                                  ...grp,
                                                  templates: grp.templates.map((tpl) =>
                                                    tpl._id === t._id
                                                      ? { ...tpl, active: newStatus }
                                                      : tpl
                                                  ),
                                                }))
                                              );

                                              await fetch(
                                                `https://email-syncing-backend.vercel.app/template/status/${t._id}`,
                                                {
                                                  method: "PATCH",
                                                  headers: {
                                                    "Content-Type": "application/json",
                                                  },
                                                  body: JSON.stringify({
                                                    active: newStatus,
                                                  }),
                                                }
                                              );
                                            }}
                                            className="sr-only peer"
                                          />
                                          <div className="h-6 w-11 rounded-full bg-[#E0E7FF] transition-colors peer-checked:bg-[#8A8CF4]" />
                                          <div className="absolute left-[2px] top-[2px] h-5 w-5 rounded-full bg-white shadow-md transition-transform peer-checked:translate-x-5" />
                                        </label>
                                      </td>

                                      <td className="p-3 text-center text-slate-500">
                                        {new Date(t.updatedAt).toLocaleString("en-US", {
                                          year: "numeric",
                                          month: "short",
                                          day: "2-digit",
                                          hour: "2-digit",
                                          minute: "2-digit",
                                          hour12: true,
                                        })}
                                      </td>

                                      <td className="p-3 text-center">
                                        <button
                                          onClick={() => {
                                            setEditingTemplate(t);
                                            setEditContent(t.content || "");
                                            setShowEditTemplateModal(true);
                                          }}
                                          className="rounded-md bg-[#7375E8] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#5B5FD6]"
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

                  <div className="border-t border-[#E0E7FF] bg-[#FAFBFF] p-3 text-center">
                    <button
                      onClick={() => {
                        window.open(`/templates`, "_blank");
                      }}
                      className="text-sm font-semibold text-[#5B5FD6] transition hover:underline"
                    >
                      View More Services Templates
                    </button>
                  </div>
                </div>

                {showEditTemplateModal && (
                  <div
                    className="flex max-w-[45%] flex-col overflow-hidden rounded-2xl border border-[#E0E7FF] bg-white shadow-2xl transition-all duration-500"
                    style={{
                      animation: "slideIn 0.4s ease-out forwards",
                    }}
                  >
                    <div className="flex items-center justify-between border-b border-[#E0E7FF] bg-[#F5F7FF] p-5">
                      <h2 className="text-lg font-bold text-slate-800">
                        Edit Template — {editingTemplate?.name}
                      </h2>

                      <button
                        onClick={() => setShowEditTemplateModal(false)}
                        className="rounded-full p-1 text-slate-500 transition hover:bg-[#E0E7FF] hover:text-[#5B5FD6]"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="flex-1 space-y-4 overflow-y-auto bg-[#FAFBFF] p-5">
                      <label className="block text-sm font-semibold text-slate-700">
                        Template Content
                      </label>

                      <ReactQuill
                        ref={quillRef}
                        theme="snow"
                        value={editContent}
                        onChange={setEditContent}
                        className="rounded-lg bg-white shadow-sm"
                        style={{
                          border: "1px solid #E0E7FF",
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

                      <div className="mt-4 rounded-xl border border-[#E0E7FF] bg-white p-3">
                        <p className="mb-2 text-sm font-semibold text-slate-700">
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
                                    editor.insertText(editor.getLength(), placeholder);
                                  }
                                }
                              }}
                              className="rounded-full border border-[#C7D2FE] bg-[#EEF2FF] px-3 py-1 text-xs font-semibold text-[#5B5FD6] transition hover:bg-[#E0E7FF]"
                            >
                              {field}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 border-t border-[#E0E7FF] bg-white p-4">
                      <button
                        onClick={() => setShowEditTemplateModal(false)}
                        className="rounded-md border border-[#C7D2FE] bg-white px-4 py-2 text-sm font-medium text-[#5B5FD6] transition hover:bg-[#EEF2FF]"
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
                              toast.error(data.message || "Failed to update template.");
                            }
                          } catch (err) {
                            console.error("Error updating template:", err);
                            toast.error("Error updating template.");
                          }
                        }}
                        className="rounded-md bg-[#7375E8] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#5B5FD6]"
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
                        unverifiedConnections.map((c) => [c.email, c]),
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
                                    : c,
                                ),
                              );

                              try {
                                const res = await fetch(
                                  `https://email-syncing-backend.vercel.app/mailhook/verify`,
                                  {
                                    method: "POST",
                                    headers: {
                                      "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify({
                                      connectionId: conn._id,
                                    }),
                                  },
                                );
                                const data = await res.json();

                                if (data.success) {
                                  toast.success(
                                    `${conn.email} verified successfully!`,
                                  );

                                  setUnverifiedConnections((prev) =>
                                    prev.map((c) =>
                                      c._id === conn._id
                                        ? {
                                          ...c,
                                          verified: true,
                                          verifying: false,
                                        }
                                        : c,
                                    ),
                                  );

                                  await fetchConnections();

                                  const allVerified =
                                    unverifiedConnections.every(
                                      (c) =>
                                        c._id === conn._id ||
                                        c.verified === true,
                                    );

                                  if (allVerified) {
                                    setShowVerifyModal(false);
                                  }
                                } else {
                                  toast.error(
                                    data.message ||
                                    `Failed to verify ${conn.email}`,
                                  );
                                  setUnverifiedConnections((prev) =>
                                    prev.map((c) =>
                                      c._id === conn._id
                                        ? { ...c, verifying: false }
                                        : c,
                                    ),
                                  );
                                }
                              } catch (err) {
                                toast.error(
                                  "Verification error, please try again.",
                                );
                                setUnverifiedConnections((prev) =>
                                  prev.map((c) =>
                                    c._id === conn._id
                                      ? { ...c, verifying: false }
                                      : c,
                                  ),
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
      {showInactiveTemplateConfirm && (
        <div
          onClick={() => setShowInactiveTemplateConfirm(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 px-4 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md overflow-hidden rounded-2xl border border-[#E0E7FF] bg-white shadow-2xl"
          >      <div className="border-b border-[#E0E7FF] bg-[#F5F7FF] px-5 py-4">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#E0E7FF] text-[#7375E8]">
                  !
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-800">
                    Templates are not active
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    This service does not have active templates yet.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4 px-6 py-5">
              <div className="rounded-xl border border-[#E0E7FF] bg-[#F8FAFF] p-4">
                <p className="text-sm leading-relaxed text-slate-700">
                  <b className="font-semibold text-slate-900">
                    {inactiveTemplateService}
                  </b>{" "}
                  templates are inactive. You can continue using your{" "}
                  <b className="font-semibold text-[#7375E8]">
                    General templates
                  </b>{" "}
                  instead.
                </p>
              </div>

              <p className="text-xs leading-relaxed text-slate-500">
                For service-specific replies, activate this service’s templates first.
                Otherwise, the test will run with General templates.
              </p>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-[#E0E7FF] bg-[#FAFBFF] p-4 sm:flex-row sm:justify-end">
              <button
                onClick={() => {
                  setShowInactiveTemplateConfirm(false);
                  window.open(
                    `/templates?service=${encodeURIComponent(inactiveTemplateService)}`,
                    "_blank"
                  );
                }}
                className="rounded-lg border border-[#C7D2FE] bg-white px-4 py-2 text-sm font-medium text-[#5B5FD6] transition hover:bg-[#EEF2FF]"
              >
                Activate Templates
              </button>

              <button
                onClick={() => {
                  setShowInactiveTemplateConfirm(false);
                  handleRunTest(true);
                }}
                className="rounded-lg bg-[#7375E8] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#5B5FD6]"
              >
                Continue with General Templates
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopifyScenariosPage;

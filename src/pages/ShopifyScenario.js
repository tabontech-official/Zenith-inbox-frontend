import { apiFetch } from "../utils/apiClient";
import {
  isConnectionUsable,
  isConnectionUsableById,
  findConnection,
  connectionProblem,
  connectionLabel,
} from "../utils/connectionHealth";
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
  RotateCw,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import { CiLink } from "react-icons/ci";

import AppLayout from "../component/AppLayout";
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
  FiChevronRight,
  FiCheck,
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
import MailhookConnectionModal from "../component/MailhookConnectionModal";
import {
  consumeMicrosoftOAuthResult,
  startMicrosoftOAuth,
} from "../utils/microsoftOAuth";
import { getCached, setCached, getCacheKey, invalidateCache } from "../utils/appCache";
import { ScenarioCanvasSkeleton } from "../component/Skeletons";
import {
  appTypeForConnection,
  matchesAppType,
  providerLabel,
} from "../utils/connectionProviders";
import useDragScroll from "../hooks/useDragScroll";
import useModalDismiss from "../hooks/useModalDismiss";
import StatusDot from "../component/StatusDot";
import { formatInTimeZone, timeZoneBadge } from "../utils/timezone";
import FlowConnector from "../component/FlowConnector";
import CreateConnectionTypeModal from "../component/CreateConnectionTypeModal";
import SetupOtherSMTPModal from "../component/SetupOtherSMTPModal";
import EmailInspector from "./EmailInspector";

/*
 * The starting shape of a Shopify scenario: one branch that sends the
 * initial reply. Resetting a scenario and building an additional one both
 * begin here, so the shape is defined once.
 */
const buildDefaultShopifyBranches = (connectionId = "") => {
  const seed = Date.now();

  return [
    {
      id: seed,
      hasModule: true,
      condition: null,
      modules: [
        {
          id: seed + 1,
          app: {
            name: "Initial Email",
            displayName: "Initial Email",
            color: "bg-red-500",
            icon: "Gmail",
            defaultTemplate: "Initial Email",
          },
          type: "Send an Email",
          description: "Send email via Gmail",
          connectionId,
          template: "Initial Email",
          subject: "",
          cc: [],
          bcc: [],
          emailType: "Gmail",
        },
      ],
    },
  ];
};

const ShopifyScenariosPage = () => {
  const quillRef = useRef(null);
  const [guideStep, setGuideStep] = useState(0);
  const [showInsertFields, setShowInsertFields] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  useEffect(() => {
    const closeFields = () => setShowInsertFields(false);

    document.addEventListener("mousedown", closeFields);

    return () => {
      document.removeEventListener("mousedown", closeFields);
    };
  }, []);
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

  /*
   * /scenarios/shopify/new is not a scenario id — it asks for an
   * additional, blank Shopify scenario. Nothing may load or save over the
   * one already stored while this is true, or building a second scenario
   * would silently overwrite the first.
   */
  const isNewScenario = id === "new";
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  /*
   * Leads that arrived while this scenario was switched Off.
   *
   * Turning a scenario off stops the replies, not the leads — they keep
   * syncing in and keep sitting in the Lead Inbox unanswered. The backend
   * records each one it would have replied to, so switching back on can
   * ask what to do with the backlog instead of quietly ignoring it.
   *
   * null means "not checked yet", which is not the same as "empty" — the
   * prompt only opens on a real count from the server.
   */
  const [pausedQueue, setPausedQueue] = useState(null);
  const [queuePromptOpen, setQueuePromptOpen] = useState(false);
  const [queueBusy, setQueueBusy] = useState(false);

  /*
   * Read at call time, never at render time: the scenarioId state is
   * declared further down the component, so evaluating it up here would
   * throw before the first paint.
   */
  const getScenarioKey = () =>
    (isNewScenario ? null : id) ||
    scenarioId ||
    (isNewScenario ? null : localStorage.getItem("scenarioId"));

  const fetchPausedQueue = async () => {
    const activeScenarioKey = getScenarioKey();
    if (!activeScenarioKey) return null;

    try {
      const token = localStorage.getItem("usertoken");
      const res = await apiFetch(
        `https://email-syncing-backend.vercel.app/scenario/${activeScenarioKey}/queue`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const data = await res.json();

      return res.ok && data?.success ? data : null;
    } catch (err) {
      console.error("Error reading the paused queue:", err);
      /*
       * A failed check is not evidence of an empty queue, but it must not
       * block the user from switching the scenario on either. Returning
       * null resumes without the prompt; the backlog stays queued and the
       * prompt appears on the next attempt.
       */
      return null;
    }
  };

  /*
   * Switch the scenario on, then act on the backlog.
   *
   * Order matters: the backend refuses to send a queue into a scenario
   * that is still paused, because replaying into a paused scenario would
   * just queue everything again and report success.
   */
  const resumeWithQueue = async (action) => {
    const activeScenarioKey = getScenarioKey();
    setQueueBusy(true);

    try {
      const saved = await handleSaveScenario(null, true);

      /* handleSaveScenario has already explained the failure. */
      if (!saved) return;

      const token = localStorage.getItem("usertoken");
      let sent = 0;
      let failed = 0;
      let remaining = 0;

      /*
       * The server releases in capped batches so a large backlog cannot
       * run into the request timeout, and reports what it left behind.
       * Keep going until it reports nothing left — the guard is only
       * there so a server that never drains cannot spin forever.
       */
      for (let pass = 0; pass < 40; pass += 1) {
        const res = await apiFetch(
          `https://email-syncing-backend.vercel.app/scenario/${activeScenarioKey}/queue`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ action }),
          },
        );
        const data = await res.json();

        if (!res.ok || !data?.success) {
          toast.error(data?.message || "Could not process the queued leads.");
          return;
        }

        if (action === "discard") {
          toast.success(
            `${data.discarded} queued lead${data.discarded === 1 ? "" : "s"} left unanswered.`,
          );
          return;
        }

        sent += data.sent || 0;
        failed += data.failed || 0;
        remaining = data.remaining || 0;

        if (!remaining) break;

        /*
         * A pass that claimed nothing and still reports a backlog means
         * every message in it failed and went back on the queue. Retrying
         * would loop on the same failures.
         */
        if (!data.sent) break;
      }

      if (sent) {
        toast.success(
          `Sent ${sent} queued repl${sent === 1 ? "y" : "ies"}.`,
        );
      }

      if (failed || remaining) {
        toast.error(
          `${remaining || failed} queued lead${(remaining || failed) === 1 ? "" : "s"} could not be sent and are still waiting.`,
        );
      }
    } finally {
      setQueueBusy(false);
      setQueuePromptOpen(false);
      setPausedQueue(null);
    }
  };

  const handleToggleShopifyAutomation = async () => {
    const nextVal = !automationOn;

    if (nextVal) {
      const targetUserId = localStorage.getItem("userid") || user?._id;
      const userPlan = user?.subscription?.plan || "Explore";

      const getPlanActiveLimit = (p) => {
        const plan = (p || "Explore").toLowerCase();
        if (plan === "elevate") return 5;
        if (plan === "unite") return 15;
        if (plan === "enterprise") return 999;
        return 1;
      };
      const limit = getPlanActiveLimit(userPlan);

      if (targetUserId) {
        try {
          const token = localStorage.getItem("usertoken");
          const res = await apiFetch(
            `https://email-syncing-backend.vercel.app/scenario/user/${targetUserId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );
          const data = await res.json();
          const list = Array.isArray(data) ? data : data?.data || [];
          const activeCount = list.filter(
            (s) => s.scenarioActive && s._id !== id,
          ).length;

          if (activeCount >= limit) {
            toast.error(
              `Active scenario limit reached for your ${userPlan} plan (max ${limit === 999 ? "unlimited" : limit} active). Please deactivate an existing active scenario or upgrade your plan.`,
            );
            setUpgradeModalOpen(true);
            return;
          }
        } catch (err) {
          console.error("Error checking active scenario limit:", err);
        }
      }

      /*
       * A revoked mailbox is the one failure the user can act on but
       * could not see: the account is still listed, so the old check
       * passed it through and the server silently refused. Name it here
       * instead of sending a request that is certain to be rejected.
       */
      if (brokenConnections.length > 0) {
        setActivationBlockers(
          brokenConnections.map(({ id, connection }) => ({
            code:
              connection?.status === "reauth_required"
                ? "reauth_required"
                : "connection_disconnected",
            connectionId: id,
            email: connection?.email || "",
            provider: connection?.provider || "",
            status: connection?.status || "missing",
            message: `${connectionLabel(connection)} cannot be used — ${connectionProblem(connection)}.`,
          })),
        );

        toast.error(
          `${connectionLabel(brokenConnections[0].connection)} cannot be used — ${connectionProblem(brokenConnections[0].connection)}.`,
          { duration: 6000 },
        );
        return;
      }

      if (!isInboxConnected || !isSenderConnected) {
        toast.error(
          "Please complete your scenario configuration first (connect inbox and senders) before activating.",
          { duration: 4500 }
        );
        return;
      }

      /*
       * Anything that arrived while this was paused is still unanswered.
       * Ask before resuming rather than either firing a silent burst of
       * late replies at customers or dropping the backlog on the floor —
       * both are decisions the user should be making, not us.
       */
      const queue = await fetchPausedQueue();

      if (queue?.count > 0) {
        setPausedQueue(queue);
        setQueuePromptOpen(true);
        return;
      }
    }

    // Save full scenario with updated active status so no scenario data is wiped
    await handleSaveScenario(null, nextVal);
  };
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState(null);
  const [templateList, setTemplateList] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [selectedServiceForTemplates, setSelectedServiceForTemplates] =
    useState("");

  const fetchTemplates = async () => {
    setLoadingTemplates(true);
    try {
      const userId = localStorage.getItem("userid");
      if (!userId) return;
      const srv = selectedServiceForTemplates || "General";
      const res = await apiFetch(
        `https://email-syncing-backend.vercel.app/template/alltemplates?userId=${userId}&service=${encodeURIComponent(srv)}`,
      );
      const data = await res.json();
      if (
        data.success &&
        Array.isArray(data.data) &&
        data.data.length > 0
      ) {
        setTemplateList(data.data.slice(0, 3));
      } else {
        setTemplateList([]);
      }
    } catch (err) {
      console.error("Error fetching templates:", err);
      setTemplateList([]);
    } finally {
      setLoadingTemplates(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [selectedServiceForTemplates]);

  useEffect(() => {
    if (showTemplateModal) {
      fetchTemplates();
    }
  }, [showTemplateModal]);
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
  const [showIncomingLeadsModal, setShowIncomingLeadsModal] = useState(false);
  const [incomingLeadsAppType, setIncomingLeadsAppType] = useState("Gmail");
  const [incomingLeadsConnection, setIncomingLeadsConnection] = useState("");
  const [incomingLeadsMailhook, setIncomingLeadsMailhook] = useState("");
  const [mailhooks, setMailhooks] = useState([]);
  const [showMailhookModal, setShowMailhookModal] = useState(false);
  const [incomingLeadsSubjectFilter, setIncomingLeadsSubjectFilter] =
    useState("");

  /*
   * Why the server refused to activate, surfaced as a banner.
   *
   * The server is the authority on whether a scenario may run, and it
   * rejects connections this page cannot see the state of. Holding its
   * answer here is what stops the switch from showing On over a scenario
   * that was actually stored as Off.
   */
  const [activationBlockers, setActivationBlockers] = useState([]);

  /*
   * The trigger subject for built-in scenarios is set platform-wide by the
   * SaaS owner (master admin -> Scenario Triggers). It used to be hardcoded
   * here, so the field could show one subject while the backend matched on
   * another. Empty until loaded; never fall back to a literal.
   */
  const [platformTriggerSubject, setPlatformTriggerSubject] = useState("");

  /*
   * The router's service condition, also platform-configured. The card
   * used to name three services hardcoded ("Troubleshooting, Store Setup,
   * or Bug Fixes") — two of which were not in the real routing list at
   * all, so it described routing that never happened.
   */
  const [platformServices, setPlatformServices] = useState([]);

  /*
   * The flow row is wider than the viewport and its scrollbar is hidden,
   * so it needs its own affordances: grab-and-drag, wheel-to-pan, and
   * edge buttons. See hooks/useDragScroll.js.
   */
  const flowScroll = useDragScroll();

  /*
   * How the module being edited produces its reply, and which company
   * profile it writes from when that is "ai".
   */
  /*
   * The module's reply mode. There is no longer a control for it in the
   * module dialog — it is chosen once for the whole scenario in the
   * Template card. The state remains because handleSave writes these
   * fields back: dropping them would silently clear the scenario's AI
   * setting every time someone edited a module's connection.
   */
  const [replyMode, setReplyMode] = useState("manual");

  const [companyProfileId, setCompanyProfileId] = useState("");
  const [companyProfiles, setCompanyProfiles] = useState([]);

  /*
   * The same choice at scenario level, set from the Templates Overview
   * dialog. Applying it writes replyMode / companyProfileId onto every
   * email module, so one decision covers the whole reply sequence instead
   * of being repeated per module.
   */
  const [scenarioReplyMode, setScenarioReplyMode] = useState("manual");
  const [scenarioProfileId, setScenarioProfileId] = useState("");
  const [applyingReplyMode, setApplyingReplyMode] = useState(false);

  const selectedScenarioProfile = companyProfiles.find(
    (p) => p._id === scenarioProfileId,
  );

  const applyScenarioReplyMode = async () => {
    if (scenarioReplyMode === "ai") {
      if (!scenarioProfileId) {
        toast.error("Choose which company profile the AI should write from.");
        return;
      }

      /*
       * A profile without a company name and description gives the model
       * nothing to work from — it would produce generic mail signed by
       * nobody. Better to stop here than to send that to a real lead.
       */
      if (selectedScenarioProfile && !selectedScenarioProfile.isComplete) {
        toast.error(
          "That profile is incomplete. Add a company name and business description first.",
        );
        return;
      }
    }

    setApplyingReplyMode(true);

    try {
      const updated = routerBranches.map((branch) => ({
        ...branch,
        modules: (branch.modules || []).map((mod) => {
          const isDelay =
            mod.type === "Delay" ||
            mod.app?.name === "Delay" ||
            Boolean(mod.delayValue);

          /* A delay sends nothing, so a reply mode means nothing to it. */
          if (isDelay) return mod;

          return {
            ...mod,
            replyMode: scenarioReplyMode,
            companyProfileId:
              scenarioReplyMode === "ai" ? scenarioProfileId : null,
          };
        }),
      }));

      setRouterBranches(updated);
      await handleSaveScenario(updated);

      toast.success(
        scenarioReplyMode === "ai"
          ? `Replies will be written by AI from "${selectedScenarioProfile?.name || "the selected profile"}".`
          : "Replies will use your templates as written.",
      );
      setShowTemplateModal(false);
      fetchTemplates();
    } catch (err) {
      console.error("Could not apply the reply mode:", err);
      toast.error("Could not save the reply mode.");
    } finally {
      setApplyingReplyMode(false);
    }
  };

  const fetchCompanyProfiles = async () => {
    try {
      const userId = localStorage.getItem("userid");
      if (!userId) return;

      const res = await apiFetch(
        `https://email-syncing-backend.vercel.app/api/company-profile/${userId}/list`,
      );
      const data = await res.json();

      /*
       * Paused profiles are excluded: offering one would let a scenario
       * point at a profile the user has deliberately shelved.
       */
      setCompanyProfiles(
        data?.success
          ? (data.data || []).filter((p) => p.isActive !== false)
          : [],
      );
    } catch (err) {
      console.error("Error loading company profiles:", err);
      setCompanyProfiles([]);
    }
  };

  useEffect(() => {
    fetchCompanyProfiles();
  }, []);

  /* Seed the dialog from whatever the scenario's modules already say. */
  useEffect(() => {
    const emailModules = routerBranches
      .flatMap((b) => b.modules || [])
      .filter(
        (m) =>
          !(
            m.type === "Delay" ||
            m.app?.name === "Delay" ||
            Boolean(m.delayValue)
          ),
      );

    if (emailModules.length === 0) return;

    const aiModule = emailModules.find((m) => m.replyMode === "ai");

    setScenarioReplyMode(aiModule ? "ai" : "manual");
    setScenarioProfileId(aiModule?.companyProfileId || "");
  }, [routerBranches]);

  /* Real template state for the Template card — see the card for context. */
  const activeTemplateCount = templateList.filter((t) => t.active).length;

  /*
   |--------------------------------------------------------------------
   | What the Template card is actually reporting
   |--------------------------------------------------------------------
   |
   | templateList holds ONE service's templates — the service selected on
   | this node, or "General" — and fetchTemplates caps it at three,
   | because a service has exactly three: Initial, First and Second.
   |
   | So "3 templates active" never meant "3 of your 92 templates". It
   | meant "all three email types for this one service". Read as a global
   | count it is alarming and wrong, which is exactly how it reads.
   |
   | The denominator makes it honest: "3 of 3", and "All templates
   | active" when the set is complete.
   */
  const templateSetSize = templateList.length;

  const templateScopeLabel = selectedServiceForTemplates || "General";

  const templateSummary =
    templateSetSize === 0
      ? "No templates found"
      : activeTemplateCount === 0
        ? `No ${templateScopeLabel} templates active`
        : activeTemplateCount === templateSetSize
          ? `All ${templateScopeLabel} templates active (${activeTemplateCount} of ${templateSetSize})`
          : `${activeTemplateCount} of ${templateSetSize} ${templateScopeLabel} templates active`;

  const lastTemplateEdit = (() => {
    const stamps = templateList
      .map((t) => t.updatedAt || t.createdAt)
      .filter(Boolean)
      .map((d) => new Date(d).getTime())
      .filter((n) => Number.isFinite(n));

    if (!stamps.length) return null;

    const days = Math.floor((Date.now() - Math.max(...stamps)) / 86400000);

    if (days <= 0) return "today";
    if (days === 1) return "yesterday";
    return `${days} days ago`;
  })();

  /*
   * Which app type a saved module belongs to.
   *
   * Three call sites used to hardcode "Gmail". A module saved against a
   * Microsoft connection then opened with the app type forced to Gmail,
   * and the Connection dropdown — which filters by app type — could not
   * list it, so it showed "-- Select Connection --". The card meanwhile
   * reported "Configured", because it checks the stored connectionId
   * directly. Same module, two different answers.
   *
   * The connection's own provider is the authority; the stored emailType
   * is only a fallback for a module with no connection yet.
   */
  const appTypeForModule = (mod) => {
    const conn = (Array.isArray(connections) ? connections : []).find(
      (c) => c._id === mod?.connectionId,
    );

    return appTypeForConnection(conn) || mod?.emailType || "Gmail";
  };

  /*
   * Outside-click dismissal. The module dialog is refused while a module
   * is being configured (a chosen app means fields are in play); the
   * picker step itself holds nothing, so it closes freely.
   */
  const moduleDismiss = useModalDismiss({
    onClose: () => resetForm(),
    isDirty: Boolean(selectedApp),
  });

  const incomingLeadsDismiss = useModalDismiss({
    onClose: () => setShowIncomingLeadsModal(false),
  });

  /*
   * A finished checklist is noise — it collapses to a single strip and
   * only opens again on request. While anything is outstanding it stays
   * expanded, because that is the one time it has something to say.
   */
  const [checklistExpanded, setChecklistExpanded] = useState(false);
  const [showCreateConnectionModal, setShowCreateConnectionModal] =
    useState(false);
  const [showSMTPModal, setShowSMTPModal] = useState(false);
  const [scenarioId, setScenarioId] = useState(null);
  const [scenarioName, setScenarioName] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [scenarioDescription, setScenarioDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const { user, timeZone: accountTimeZone } = useContext(UserContext);
  const [showOutlookModal, setShowOutlookModal] = useState(false);
  const [showGmailModal, setShowGmailModal] = useState(false);
  const [showEditTemplateModal, setShowEditTemplateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [showInactiveTemplateConfirm, setShowInactiveTemplateConfirm] =
    useState(false);
  const [inactiveTemplateService, setInactiveTemplateService] = useState("");

  /*
   * True when General has no active Initial Email either, so continuing
   * sends nothing at all. That is a different situation from falling back
   * to General, and the modal used to describe both as the same thing.
   */
  const [nothingWillBeSent, setNothingWillBeSent] = useState(false);
  const savedShopifyState = localStorage.getItem("shopifyScenarioState");
  const [scenarioHistory, setScenarioHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selectedHistoryLog, setSelectedHistoryLog] = useState(null);
  const [historyViewMode, setHistoryViewMode] = useState("builder");
  const [runHistoryFilter, setRunHistoryFilter] = useState("all");
  const [expandedRunId, setExpandedRunId] = useState(null);
  const existingScenarioId = isNewScenario
    ? null
    : localStorage.getItem("scenarioId");
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
      const token = localStorage.getItem("usertoken");
      const userId = localStorage.getItem("userid");
      if (!userId) return;
      const res = await apiFetch(
        `https://email-syncing-backend.vercel.app/auth/getConnection/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const data = await res.json();
      if (Array.isArray(data)) {
        setConnections(data);
      } else if (Array.isArray(data?.data)) {
        setConnections(data.data);
      } else {
        setConnections([]);
      }
    } catch (err) {
      console.error("Error fetching connections:", err);
      setConnections([]);
    }
  };

  /*
   * The Incoming Leads trigger can listen on a mailhook instead of a
   * mailbox connection, and mailhooks live in their own collection.
   */
  const fetchMailhooks = async () => {
    try {
      const userId = localStorage.getItem("userid");
      if (!userId) return;

      const res = await apiFetch(
        `https://email-syncing-backend.vercel.app/mailhookcard/${userId}`,
      );
      const data = await res.json();
      setMailhooks(data?.success && Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      console.error("Error fetching mailhooks:", err);
      setMailhooks([]);
    }
  };

  /*
   * Microsoft connects through OAuth, which navigates away from the
   * builder. Persist the scenario first so unsaved edits survive the round
   * trip, and come back to this exact scenario.
   */
  const connectMicrosoftAccount = async () => {
    /*
     * Captured BEFORE saving: saving can route away from the builder, and
     * the return path has to be the scenario the user was editing, not
     * wherever the save left them.
     */
    const returnTo = `${window.location.pathname}${window.location.search}`;

    try {
      await handleSaveScenario();
    } catch (err) {
      console.error("Could not save before Microsoft sign-in:", err);
    }

    startMicrosoftOAuth({ redirectPath: returnTo });
  };

  const fetchPlatformTrigger = async () => {
    try {
      const res = await apiFetch(
        "https://email-syncing-backend.vercel.app/scenario/trigger-defaults",
      );
      const data = await res.json();

      const shopifyTrigger = (data?.triggers || []).find(
        (t) => t.scenarioType === "shopify" && t.enabled !== false,
      );

      setPlatformTriggerSubject(shopifyTrigger?.subjectFilter || "");
      setPlatformServices(data?.services?.list || []);
    } catch (err) {
      console.error("Error loading platform trigger subject:", err);
      setPlatformTriggerSubject("");
      setPlatformServices([]);
    }
  };

  useEffect(() => {
    fetchConnections();
    fetchMailhooks();
    fetchPlatformTrigger();
  }, []);

  /* Returning from Microsoft: report the outcome, then reload connections. */
  useEffect(() => {
    consumeMicrosoftOAuthResult({ onSuccess: () => fetchConnections() });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchScenarioHistory = async () => {
    try {
      const activeScenarioId = scenarioId || localStorage.getItem("scenarioId");

      if (!activeScenarioId) return;

      setHistoryLoading(true);

      const res = await apiFetch(
        `https://email-syncing-backend.vercel.app/scenario-run-log/history/${activeScenarioId}`,
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
    if (isNewScenario) {
      console.log("🆕 Building an additional Shopify scenario — Add mode");
      setScenarioId(null);
      setEditingMode("add");
      localStorage.removeItem("scenarioId");
      localStorage.removeItem("scenarioActive");
      return;
    }

    const savedScenarioId = localStorage.getItem("scenarioId");

    if (savedScenarioId) {
      console.log("🟢 Restoring scenario ID:", savedScenarioId);
      setScenarioId(savedScenarioId);
      setEditingMode("update");
    } else {
      console.log("🆕 No saved scenario — Add mode");
      setEditingMode("add");
    }
  }, [isNewScenario]);

  const handleSaveScenario = async (
    customBranches = null,
    overrideScenarioActive = null,
  ) => {
    setIsAutoSaving(true);
    const rawBranches = customBranches || routerBranches;
    const activeConnectionId =
      incomingLeadsConnection || selectedConnection || "";
    const isMailhookTrigger = incomingLeadsAppType === "Mailhook";
    const branchesToSave = rawBranches;
    const activeStatus =
      overrideScenarioActive !== null ? overrideScenarioActive : automationOn;

    const payload = {
      userId: localStorage.getItem("userid"),
      name: scenarioName || "Shopify Partner Directory Lead Automation",
      description:
        scenarioDescription ||
        "Automatically capture leads from Shopify Partner Directory and send follow-ups",
      type: "shopify",
      incomingLead: {
        app: {
          name: incomingLeadsAppType || "Gmail",
          color: "",
          icon: "",
        },
        connectionId: isMailhookTrigger ? null : activeConnectionId,
        mailhookId: isMailhookTrigger ? incomingLeadsMailhook || null : null,
        /* Empty means "follow the platform trigger", so a change by the
           administrator reaches this scenario instead of being overridden
           by a copy frozen at save time. */
        subjectFilter: incomingLeadsSubjectFilter || "",
        pollInterval: 60,
        enabled: Boolean(
          isMailhookTrigger ? incomingLeadsMailhook : activeConnectionId,
        ),
      },
      routerBranches: branchesToSave,
      scenarioActive: activeStatus,
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

      /*
       * Adopting the user's existing Shopify scenario when no id is in
       * hand is right for the single-scenario route, but wrong here: an
       * additional scenario has no saved record yet, and looking one up
       * would turn "create" into "overwrite the first one".
       */
      if (!activeScenarioId && !isNewScenario) {
        const userId = localStorage.getItem("userid");
        const token = localStorage.getItem("usertoken");
        const checkRes = await apiFetch(
          "https://email-syncing-backend.vercel.app/scenario/details",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
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

      const token = localStorage.getItem("usertoken");
      if (activeScenarioId) {
        console.log("✏️ Updating existing scenario:", activeScenarioId);
        res = await apiFetch(
          `https://email-syncing-backend.vercel.app/scenario/detail/${activeScenarioId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
          },
        );
        data = await res.json();

        if (!res.ok)
          throw new Error(data.message || "Failed to update scenario");
      } else {
        console.log("🆕 Creating a new scenario...");
        res = await apiFetch(
          `https://email-syncing-backend.vercel.app/scenario`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
          },
        );
        data = await res.json();

        if (!res.ok)
          throw new Error(data.message || "Failed to create scenario");

        setScenarioId(data._id);
        localStorage.setItem("scenarioId", data._id);
        setEditingMode("update");

        /*
         * The scenario now exists, so the URL stops asking for a new one —
         * otherwise a refresh would discard it and open another blank
         * builder.
         */
        if (isNewScenario) {
          navigate(`/scenarios/shopify/${data._id}`, { replace: true });
        }
      }

      setScenarioName(data.name || scenarioName);
      setScenarioDescription(data.description || scenarioDescription);
      if (
        data.routerBranches &&
        data.routerBranches.some((b) => b.modules?.length > 0)
      ) {
        setRouterBranches(data.routerBranches);
      } else {
        setRouterBranches(branchesToSave);
      }

      if (data.incomingLead) {
        if (data.incomingLead.app?.name)
          setIncomingLeadsAppType(data.incomingLead.app.name);
        if (data.incomingLead.mailhookId) {
          const hookId =
            typeof data.incomingLead.mailhookId === "object"
              ? data.incomingLead.mailhookId._id || data.incomingLead.mailhookId
              : data.incomingLead.mailhookId;
          setIncomingLeadsMailhook(hookId);
        }
        if (data.incomingLead.connectionId) {
          const connId =
            typeof data.incomingLead.connectionId === "object"
              ? data.incomingLead.connectionId._id ||
                data.incomingLead.connectionId
              : data.incomingLead.connectionId;
          setIncomingLeadsConnection(connId);
        }
        if (data.incomingLead.subjectFilter)
          setIncomingLeadsSubjectFilter(data.incomingLead.subjectFilter);
      }

      /*
       * The SERVER decides whether this scenario runs, not this page.
       *
       * It refuses to activate a scenario whose mailboxes it cannot use —
       * an expired OAuth grant being the usual reason — and writes false.
       * Reflecting the requested value here instead of the stored one is
       * what produced a switch reading On over a scenario that was saved
       * Off, right up until the next reload put it back.
       */
      const serverActive =
        typeof data?.scenarioActive === "boolean"
          ? data.scenarioActive
          : activeStatus;

      const blockers = Array.isArray(data?.blockers) ? data.blockers : [];
      const wasBlocked = activeStatus && !serverActive;

      setActivationBlockers(wasBlocked ? blockers : []);

      setAutomationOn(serverActive);
      if (serverActive) {
        localStorage.setItem("scenarioActive", "true");
      } else {
        localStorage.removeItem("scenarioActive");
      }

      const refresh = await apiFetch(
        "https://email-syncing-backend.vercel.app/scenario/details",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ userId: localStorage.getItem("userid") }),
        },
      );
      const freshData = await refresh.json();

      if (freshData) {
        setScenarioId(freshData._id);
        if (
          freshData.routerBranches &&
          freshData.routerBranches.some((b) => b.modules?.length > 0)
        ) {
          setRouterBranches(freshData.routerBranches);
        } else {
          setRouterBranches(branchesToSave);
        }
        if (freshData.incomingLead) {
          if (freshData.incomingLead.app?.name)
            setIncomingLeadsAppType(freshData.incomingLead.app.name);
          if (freshData.incomingLead.mailhookId) {
            const hookId =
              typeof freshData.incomingLead.mailhookId === "object"
                ? freshData.incomingLead.mailhookId._id ||
                  freshData.incomingLead.mailhookId
                : freshData.incomingLead.mailhookId;
            setIncomingLeadsMailhook(hookId);
          }
          if (freshData.incomingLead.connectionId) {
            const connId =
              typeof freshData.incomingLead.connectionId === "object"
                ? freshData.incomingLead.connectionId._id ||
                  freshData.incomingLead.connectionId
                : freshData.incomingLead.connectionId;
            setIncomingLeadsConnection(connId);
          }
          if (freshData.incomingLead.subjectFilter)
            setIncomingLeadsSubjectFilter(freshData.incomingLead.subjectFilter);
        }
        setScenarioName(freshData.name || scenarioName);
        setScenarioDescription(freshData.description || scenarioDescription);
      }

      setShowValidation(false);
      setCompletedSteps([]);
      setIsScenarioUpdated(true);

      const toCache = freshData || data;
      if (toCache && (toCache._id || activeScenarioId)) {
        const sid = toCache._id || activeScenarioId;
        setCached(getCacheKey("shopify_scenario", sid), toCache);
        setCached(getCacheKey("shopify_scenario", "default"), toCache);
      }
      invalidateCache("scenarios");
      invalidateCache("dashboard");

      if (wasBlocked) {
        toast.error(
          blockers[0]?.message ||
            data?.message ||
            "Saved, but the scenario could not be activated.",
          { duration: 6000 },
        );

        /*
         * Saved, but NOT activated. resumeWithQueue() reads this to
         * decide whether releasing a backlog is safe.
         */
        return false;
      }

      toast.success(
        serverActive
          ? "Scenario activated successfully!"
          : "Scenario deactivated.",
      );

      /*
       * Whether the save stuck. resumeWithQueue() will not release a
       * backlog into a scenario that failed to activate.
       */
      return true;
    } catch (err) {
      console.error("Error saving scenario:", err);
      toast.error("Failed to save scenario.");
      return false;
    } finally {
      setIsAutoSaving(false);
      setLastSavedTime(new Date());
    }
  };

  /*
   * Returns whether the change actually stuck.
   *
   * The caller flips the row optimistically, and the server rejects some
   * changes outright — General templates cannot be deactivated. Without a
   * result to act on, the row stayed switched while the server never
   * changed, so reopening the dialog "turned it back on".
   */
  const handleToggleTemplate = async (templateId, newStatus) => {
    try {
      const res = await apiFetch(
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
        return true;
      }

      toast.error(data.message || "Failed to update template status.");
      return false;
    } catch (err) {
      console.error("Error updating template:", err);
      toast.error("Error updating template status.");
      return false;
    }
  };

  /*
   * General is the fallback every unmatched lead routes to, so the backend
   * refuses to deactivate it. Surfaced here so the switch is disabled up
   * front rather than failing after the user flips it.
   */
  const isProtectedTemplate = (tpl) => {
    const service = (tpl?.service || "").trim();
    return service === "" || service === "General";
  };

  const handleToggleAllTemplates = async (newStatus) => {
    try {
      const res = await apiFetch(
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

    const autoCreateShopifyScenarioInDb = async (userId, token) => {
      try {
        const defaultBranches = buildDefaultShopifyBranches();
        const payload = {
          userId,
          name: "Shopify Partner Directory Scenario",
          description: "Capture directory inquiry leads automatically and trigger personalized email response flows.",
          type: "shopify",
          scenarioActive: false,
          incomingLead: {
            app: {
              name: incomingLeadsAppType || "Gmail",
              color: "",
              icon: "",
            },
            connectionId: null,
            mailhookId: null,
            subjectFilter: "",
            pollInterval: 60,
            enabled: false,
          },
          routerBranches: defaultBranches,
        };

        const createRes = await apiFetch(
          "https://email-syncing-backend.vercel.app/scenario",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
          },
        );
        const createdData = await createRes.json();
        if (createdData && createdData._id) {
          localStorage.setItem("scenarioId", createdData._id);
          setScenarioId(createdData._id);
          setEditingMode("update");
          setScenarioName(createdData.name);
          setScenarioDescription(createdData.description);
          setRouterBranches(createdData.routerBranches || defaultBranches);
          navigate(`/scenarios/shopify/${createdData._id}`, { replace: true });
          return createdData;
        }
      } catch (err) {
        console.error("Error auto-creating shopify scenario in DB:", err);
      }
    };

    const fetchScenario = async () => {
      try {
        const userId = localStorage.getItem("userid");
        const token = localStorage.getItem("usertoken");
        if (!userId) {
          return;
        }

        if (isNewScenario) {
          await autoCreateShopifyScenarioInDb(userId, token);
          return;
        }

        console.log("🔄 Fetching existing Shopify scenario for user:", userId);

        const res = id
          ? await apiFetch(
              `https://email-syncing-backend.vercel.app/scenario/detail/${id}`,
              { headers: { Authorization: `Bearer ${token}` } },
            )
          : await apiFetch(
              "https://email-syncing-backend.vercel.app/scenario/details",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ userId }),
              },
            );

        const data = await res.json();

        if (data && data._id) {
          console.log("✅ Scenario fetched successfully:", data);

          localStorage.setItem("scenarioId", data._id);
          console.log("💾 Scenario ID saved to localStorage:", data._id);

          setCached(getCacheKey("shopify_scenario", data._id), data);
          setCached(getCacheKey("shopify_scenario", "default"), data);

          setScenarioId(data._id);
          setEditingMode("update");
          setScenarioName(data.name || "Shopify Partner Directory Scenario");
          setScenarioDescription(
            data.description || "Capture directory inquiry leads automatically and trigger personalized email response flows.",
          );
          setRouterBranches(
            Array.isArray(data.routerBranches) && data.routerBranches.length > 0
              ? data.routerBranches
              : buildDefaultShopifyBranches(),
          );

          if (!id) {
            navigate(`/scenarios/shopify/${data._id}`, { replace: true });
          }

          if (data.incomingLead) {
            if (data.incomingLead.app?.name)
              setIncomingLeadsAppType(data.incomingLead.app.name);
            if (data.incomingLead.mailhookId) {
              const hookId =
                typeof data.incomingLead.mailhookId === "object"
                  ? data.incomingLead.mailhookId._id ||
                    data.incomingLead.mailhookId
                  : data.incomingLead.mailhookId;
              setIncomingLeadsMailhook(hookId);
            }
            if (data.incomingLead.connectionId) {
              const connId =
                typeof data.incomingLead.connectionId === "object"
                  ? data.incomingLead.connectionId._id ||
                    data.incomingLead.connectionId
                  : data.incomingLead.connectionId;
              setIncomingLeadsConnection(connId);
            }
            if (data.incomingLead.subjectFilter)
              setIncomingLeadsSubjectFilter(data.incomingLead.subjectFilter);
          }

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
            "ℹ️ No existing scenario found for this user — Auto-creating in DB...",
          );
          await autoCreateShopifyScenarioInDb(userId, token);
        }
      } catch (err) {
        console.error("Error fetching/creating scenario:", err);
      }
    };

    fetchScenario();
  }, [id, isNewScenario]);

  const handleResetToNewScenario = async () => {
    const userId = localStorage.getItem("userid");
    const activeConnId =
      incomingLeadsConnection ||
      selectedConnection ||
      (connections && connections[0]?._id) ||
      "";

    const defaultBranches = buildDefaultShopifyBranches(activeConnId);

    setScenarioName("Shopify Partner Directory Scenario");
    setScenarioDescription(
      "Automate Shopify lead replies and follow-up emails",
    );
    setRouterBranches(defaultBranches);
    setAutomationOn(false);

    if (!userId) return;

    try {
      toast.loading("Creating new Shopify scenario in DB...", {
        id: "createScenario",
      });
      const token = localStorage.getItem("usertoken");
      const res = await apiFetch(
        "https://email-syncing-backend.vercel.app/scenario",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            userId,
            name: "Shopify Partner Directory Scenario",
            description: "Automate Shopify lead replies and follow-up emails",
            type: "shopify",
            scenarioActive: false,
            incomingLead: {
              app: {
                name: incomingLeadsAppType || "Gmail",
                color: "",
                icon: "",
              },
              connectionId:
                incomingLeadsAppType === "Mailhook"
                  ? null
                  : incomingLeadsConnection || activeConnId,
              mailhookId:
                incomingLeadsAppType === "Mailhook"
                  ? incomingLeadsMailhook || null
                  : null,
              subjectFilter: incomingLeadsSubjectFilter || "",
              pollInterval: 60,
              enabled: Boolean(
                incomingLeadsAppType === "Mailhook"
                  ? incomingLeadsMailhook
                  : activeConnId,
              ),
            },
            routerBranches: defaultBranches,
          }),
        },
      );

      const data = await res.json();
      toast.dismiss("createScenario");

      if (data && data._id) {
        setScenarioId(data._id);
        localStorage.setItem("scenarioId", data._id);
        setEditingMode("update");
        toast.success(
          "Shopify scenario created and saved to database successfully!",
        );
      } else {
        setEditingMode("add");
        toast.success("New Shopify scenario builder initialized!");
      }
    } catch (err) {
      toast.dismiss("createScenario");
      setEditingMode("add");
      console.error("Error auto-creating scenario:", err);
    }
  };

  const handleDeleteScenario = async () => {
    const activeScenarioId = scenarioId || localStorage.getItem("scenarioId");
    if (!activeScenarioId) {
      handleResetToNewScenario();
      return;
    }

    if (
      !window.confirm("Are you sure you want to delete this Shopify scenario?")
    ) {
      return;
    }

    try {
      toast.loading("Deleting Shopify Scenario...", { id: "deleteScenario" });
      const token = localStorage.getItem("usertoken");
      const res = await apiFetch(
        `https://email-syncing-backend.vercel.app/scenario/detail/${activeScenarioId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const data = await res.json();
      toast.dismiss("deleteScenario");

      if (data.success || res.ok) {
        toast.success("Shopify Scenario deleted successfully!");
        navigate("/scenarios");
      } else {
        toast.error(data.message || "Failed to delete scenario.");
      }
    } catch (err) {
      toast.dismiss("deleteScenario");
      console.error("Error deleting scenario:", err);
      toast.error("Failed to delete scenario.");
    }
  };

  const [allActive, setAllActive] = useState(false);

  const handleSave = () => {
    let updatedBranches = [...routerBranches];

    if (updatedBranches.length === 0) {
      updatedBranches = [
        {
          id: Date.now(),
          hasModule: false,
          condition: null,
          modules: [],
        },
      ];
    }

    const targetBranchIdx =
      editingBranch !== null && editingBranch < updatedBranches.length
        ? editingBranch
        : 0;

    let type = "";
    let description = "";

    const isDelay =
      selectedApp?.name === "Delay" ||
      selectedApp?.type === "Delay" ||
      selectedApp?.displayName === "Delay";

    if (isDelay) {
      type = "Delay";
      if (delayValue && delayUnit) {
        description = `Wait ${delayValue} ${delayUnit}`;
      } else {
        description = "Delay (no duration set)";
      }
    } else if (selectedApp?.name === "Email" || selectedApp?.name === "Gmail") {
      type = selectedApp.name === "Email" ? "Custom Email" : "Send an Email";
    }

    const moduleName =
      selectedApp?.displayName ||
      selectedTemplate ||
      selectedApp?.defaultTemplate ||
      selectedApp?.name ||
      "Initial Email";

    const moduleDescription = isDelay
      ? description
      : `Send email via ${selectedAppType || selectedApp?.name || "Gmail"}`;

    const activeConnId = selectedConnection;

    const moduleData = {
      id: editingModuleId || Date.now(),
      app: {
        ...selectedApp,
        name: moduleName,
        color: isDelay ? "bg-amber-500" : selectedApp?.color || "bg-red-500",
        icon: isDelay ? "Delay" : selectedApp?.icon || "Gmail",
      },
      type,
      description: moduleDescription,
      connectionId: activeConnId,
      template: selectedTemplate || "Initial Email",
      subject: subject.trim(),

      cc: ccList,
      bcc: bccList,
      emailType: selectedAppType || selectedApp?.name || "Gmail",

      /* Manual sends the template as written; AI writes from a profile. */
      replyMode,
      companyProfileId: replyMode === "ai" ? companyProfileId || null : null,
      ...(isDelay
        ? { delayValue: delayValue || "5", delayUnit: delayUnit || "seconds" }
        : {}),
    };

    if (activeConnId) {
      setIncomingLeadsConnection(activeConnId);
    }

    if (!updatedBranches[targetBranchIdx].modules) {
      updatedBranches[targetBranchIdx].modules = [];
    }

    const isInitialEmail =
      selectedTemplate === "Initial Email" ||
      moduleName === "Initial Email" ||
      selectedApp?.displayName === "Initial Email";

    if (isInitialEmail) {
      const existingIdx = updatedBranches[targetBranchIdx].modules.findIndex(
        (m) =>
          (editingModuleId && m.id === editingModuleId) ||
          m.template === "Initial Email" ||
          m.app?.displayName === "Initial Email",
      );
      if (existingIdx >= 0) {
        updatedBranches[targetBranchIdx].modules[existingIdx] = {
          ...updatedBranches[targetBranchIdx].modules[existingIdx],
          ...moduleData,
        };
      } else {
        updatedBranches[targetBranchIdx].modules.unshift(moduleData);
      }
    } else if (insertAtIndex !== null) {
      updatedBranches[targetBranchIdx].modules.splice(
        insertAtIndex,
        0,
        moduleData,
      );
      setInsertAtIndex(null);
    } else if (editingModuleId) {
      const moduleIndex = updatedBranches[targetBranchIdx].modules.findIndex(
        (m) => m.id === editingModuleId,
      );
      if (moduleIndex >= 0) {
        updatedBranches[targetBranchIdx].modules[moduleIndex] = {
          ...updatedBranches[targetBranchIdx].modules[moduleIndex],
          ...moduleData,
        };
      } else {
        updatedBranches[targetBranchIdx].modules.push(moduleData);
      }
    } else {
      updatedBranches[targetBranchIdx].modules.push(moduleData);
    }

    setRouterBranches(updatedBranches);
    try {
      localStorage.setItem(
        "routerBranchesState",
        JSON.stringify(updatedBranches),
      );
    } catch (e) {}

    setEditingBranch(null);
    setEditingModuleId(null);
    setOpen(false);
    resetForm();

    // Persist to DB immediately!
    handleSaveScenario(updatedBranches);
  };

  const handleRemoveModule = (branchIndex, moduleId) => {
    const updatedBranches = [...routerBranches];
    if (updatedBranches[branchIndex]) {
      updatedBranches[branchIndex].modules = (
        updatedBranches[branchIndex].modules || []
      ).filter((m) => m.id !== moduleId);
      setRouterBranches(updatedBranches);
      handleSaveScenario(updatedBranches);
    }

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
      /*
       * The saved connection decides the app type. The old chain read
       * app.name / emailType, which are set from the module's template
       * label ("Initial Email" is Gmail-branded) and so disagreed with a
       * module actually connected to Microsoft or SMTP.
       */
      const fixedEmailType = appTypeForModule(module);

      setSelectedApp({
        ...(module.app || {}),
        name: fixedEmailType === "Email" ? "Email" : "Gmail",
        displayName: fixedTitle,
        defaultTemplate: module.template || fixedTitle,
        color: module.app?.color || "bg-red-500",
        icon: module.app?.icon || "Gmail",
      });

      setSelectedAppType(fixedEmailType);
      setReplyMode(module.replyMode === "ai" ? "ai" : "manual");
      setCompanyProfileId(module.companyProfileId || "");
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
    showValidation,
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
          if (title.toLowerCase().includes("incoming leads")) {
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
          showValidation
            ? completed
              ? "ring-2 ring-[#C7D2FE] border-[#8A8CF4]"
              : "ring-2 ring-[#FEE2E2] border-[#FCA5A5]"
            : "border-[#E0E7FF]"
        }`}
      >
        {showValidation && completed !== null && (
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
                onEdit && onEdit();
              } else {
                handleViewEmailData();
              }
            }}
            title={isWebhook ? "Edit Connection" : "View Test Email"}
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
                className="rounded-lg bg-[#EEF2FF] p-1.5 text-[#5B5FD6] transition hover:bg-[#E0E7FF]"
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
                className="rounded-lg bg-[#FEE2E2] p-1.5 text-[#DC2626] transition hover:bg-[#FECACA]"
              >
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
      <span className="ml-2 font-medium text-[#5B5FD6]">Add Module</span>
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

        const res = await apiFetch(
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

  const handleOpenSendTestModal = () => {
    const missingModules = [];

    const incomingLeadConn = (incomingLeadsConnection || "").toString().trim();

    if (
      !incomingLeadConn ||
      incomingLeadConn === "" ||
      incomingLeadConn === "null" ||
      incomingLeadConn === "undefined" ||
      incomingLeadConn === "(empty)"
    ) {
      missingModules.push({
        branch: 0,
        module: 0,
        moduleName: "Incoming Leads",
      });
    }

    routerBranches.forEach((branch, i) => {
      branch.modules.forEach((m, j) => {
        const rawName =
          m.app?.displayName ||
          m.app?.name ||
          m.emailType ||
          m.stepType ||
          `Module ${j + 1}`;
        const appName = rawName.toLowerCase();

        const isEmailModule =
          appName.includes("gmail") ||
          appName.includes("email") ||
          appName.includes("follow") ||
          appName.includes("initial") ||
          m.type === "Send Email";

        const connectionId =
          typeof m.connectionId === "string"
            ? m.connectionId.trim()
            : (m.connectionId?._id || m.connectionId || "").toString().trim();

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
      });
    });

    if (missingModules.length > 0) {
      const nodeNames = [
        ...new Set(missingModules.map((m) => m.moduleName)),
      ].join(", ");
      toast.error(
        `First add a connection to '${nodeNames}' node before running send test.`,
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
      return;
    }

    setHighlightRunTest(false);
    setShowRunTestModal(true);
  };

  const handleRunTest = async (
    skipInactiveTemplateCheck = false,
    useGeneralTemplate = false,
  ) => {
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

      /*
       * Ask the server, do not decide here.
       *
       * This used to fetch every template for the service and apply its
       * own predicate — `allTemplates.some((t) => !t.active)`. The engine
       * asks a different question (this service's template for THIS step,
       * active), so the two drifted: activating a service's Initial Email
       * left the warning on screen, and the warning promised a fallback
       * to General that was not going to happen.
       *
       * /template/resolution runs the engine's own resolver
       * (utils/templateSelection.js), which is the same call the send path
       * makes. The modal and the reply cannot disagree any more, because
       * there is only one answer.
       *
       * Send Test sends the initial email and nothing else, so that is the
       * step asked about; the follow-ups do not affect this run.
       */
      const res = await apiFetch(
        `https://email-syncing-backend.vercel.app/template/resolution?userId=${userId}&service=${encodeURIComponent(
          service,
        )}&stepType=initial`,
      );
      const data = await res.json();

      if (!data.success) {
        toast.error("Failed to check template status for this service.");
        return;
      }

      /*
       * Two distinct outcomes, and they are not the same warning:
       *   fallbackToGeneral - the service has nothing active, General answers
       *   !willUseTemplate  - General is inactive too, so NOTHING is sent
       */
      const willFallBackToGeneral =
        data.fallbackToGeneral || !data.willUseTemplate;

      if (willFallBackToGeneral && !skipInactiveTemplateCheck) {
        setSelectedServiceForTemplates(service);
        setInactiveTemplateService(service);
        setNothingWillBeSent(!data.willUseTemplate);
        setShowInactiveTemplateConfirm(true);

        toast.error(
          data.willUseTemplate
            ? `${service} — Initial Email template is not active.`
            : `No active Initial Email template for ${service} or General.`,
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

    const incomingLeadConn = (incomingLeadsConnection || "").toString().trim();

    if (
      !incomingLeadConn ||
      incomingLeadConn === "" ||
      incomingLeadConn === "null" ||
      incomingLeadConn === "undefined" ||
      incomingLeadConn === "(empty)"
    ) {
      missingModules.push({
        branch: 0,
        module: 0,
        moduleName: "Incoming Leads",
      });
    }

    routerBranches.forEach((branch, i) => {
      branch.modules.forEach((m, j) => {
        const rawName =
          m.app?.displayName ||
          m.app?.name ||
          m.emailType ||
          m.stepType ||
          `Module ${j + 1}`;
        const appName = rawName.toLowerCase();

        const isEmailModule =
          appName.includes("gmail") ||
          appName.includes("email") ||
          appName.includes("follow") ||
          appName.includes("initial") ||
          m.type === "Send Email";

        const connectionId =
          typeof m.connectionId === "string"
            ? m.connectionId.trim()
            : (m.connectionId?._id || m.connectionId || "").toString().trim();

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
          const safeConnections = Array.isArray(connections) ? connections : [];
          const connectionData = safeConnections.find(
            (c) => c._id === connectionId,
          );
          if (connectionData && !connectionData.verified) {
            unverifiedConnections.push(connectionData);
          }
        }
      });
    });

    if (missingModules.length > 0) {
      const nodeNames = [
        ...new Set(missingModules.map((m) => m.moduleName)),
      ].join(", ");
      toast.error(
        `First add a connection to '${nodeNames}' node before running send test.`,
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
      const activeScenarioId =
        scenarioId || localStorage.getItem("scenarioId") || null;
      const res = await apiFetch(
        "https://email-syncing-backend.vercel.app/mailhook/Run-test-mode",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: localStorage.getItem("userid"),
            scenarioId: activeScenarioId,
            fullName: formData.fullName || "Dummy Customer",
            businessEmail: formData.businessEmail,
            storeName: formData.storeName,
            country: formData.country,
            service: formData.service,
            budget: formData.budget,
            helpDescription: formData.description,
            useGeneralTemplate: Boolean(useGeneralTemplate),
          }),
        },
      );

      const data = await res.json();
      toast.dismiss("test");

      if (data.success) {
        toast.success(data.message || "Test completed successfully!");
        fetchScenarioHistory();
        setHighlightRunTest(false);
        setTestEmailGenerated(true);
        setShowValidation(true);
        setSelectedServiceForTemplates(formData.service);

        const userId = localStorage.getItem("userid");
        const res = await apiFetch(
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
    handleRunTest(true, true);
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

      const res = await apiFetch(
        `https://email-syncing-backend.vercel.app/mailhook/get-test-email/${userId}`,
      );
      const data = await res.json();

      if (!data.success || !data.email) {
        toast.error(
          "No test email found. Please generate a test email first.",
          { id: "email" },
        );
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
      const token = localStorage.getItem("usertoken");
      try {
        const res = await apiFetch(
          `https://email-syncing-backend.vercel.app/template/all?userId=${userId}`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          },
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
        const token = localStorage.getItem("usertoken");
        try {
          const { data } = await axios.get(
            `https://email-syncing-backend.vercel.app/template/all?userId=${userId}`,
            {
              headers: token ? { Authorization: `Bearer ${token}` } : {},
            },
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
      }),
    );
  };

  const findFirstMissingEmailModule = () => {
    for (
      let branchIndex = 0;
      branchIndex < routerBranches.length;
      branchIndex++
    ) {
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
    .map((m) =>
      (Array.isArray(connections) ? connections : []).find(
        (c) => c._id === m.connectionId,
      ),
    )
    .filter(Boolean);

  const allSelectedConnectionsVerified =
    selectedConnections.length > 0 &&
    selectedConnections.every(
      (c) => c.verified === true && isConnectionUsable(c),
    );

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
  const allSetupStepsCompleted = setupSteps.every((step) => step.completed);
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
        /* A revoked grant needs the same attention as a never-verified
           account — both stop this scenario from running. */
        const unverified = selectedConnections.filter(
          (c) => !c.verified || !isConnectionUsable(c),
        );

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
            <h3 className="text-sm font-bold text-slate-700">Setup Progress</h3>

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
              className={`w-full rounded-lg border px-3 py-2 text-left text-xs transition ${
                step.completed
                  ? "border-[#C7D2FE] bg-[#EEF2FF] hover:bg-[#E0E7FF]"
                  : "border-gray-200 bg-gray-50 hover:border-[#C7D2FE] hover:bg-[#F5F7FF]"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`flex h-4 w-4 items-center justify-center rounded border text-[10px] ${
                      step.completed
                        ? "border-[#8A8CF4] bg-[#8A8CF4] text-white"
                        : "border-gray-300 bg-white text-gray-400"
                    }`}
                  >
                    {step.completed ? "✓" : ""}
                  </span>

                  <span
                    className={`font-medium ${
                      step.completed ? "text-[#5B5FD6]" : "text-gray-600"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>

                <span
                  className={`font-semibold ${
                    step.completed ? "text-[#5B5FD6]" : "text-gray-400"
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
                          1000,
                      ),
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
                        {formatInTimeZone(log.createdAt, accountTimeZone)}
                      </h4>

                      <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">
                        <RotateCcw size={10} />
                        Manual Run
                      </div>
                    </div>

                    <span
                      className={`text-[10px] px-2.5 py-1 rounded-full font-semibold border ${
                        log.status === "success"
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
                      <Clock3
                        size={13}
                        className="mx-auto text-blue-600 mb-1"
                      />
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
  /*
   * Setup checklist state.
   *
   * Hoisted out of the JSX because the LAYOUT depends on it: when every
   * step is done the left column is removed entirely so the flow cards
   * get the full width, and that decision has to be made where the grid
   * is defined, not inside the card.
   */
  /*
   * The trigger inbox is either a mailbox connection or a
   * verified mailhook — checking only connections left the
   * checklist permanently red for mailhook scenarios.
   */
  const isInboxConnected =
    incomingLeadsAppType === "Mailhook"
      ? Boolean(
          incomingLeadsMailhook &&
          mailhooks.some(
            (m) =>
              m._id === incomingLeadsMailhook &&
              m.connectionVerified,
          ),
        )
      : Boolean(
          incomingLeadsConnection &&
          isConnectionUsableById(connections, incomingLeadsConnection),
        );

  /*
   * The mailboxes this scenario depends on that the server will reject.
   * Derived rather than stored so it tracks a reconnect immediately.
   */
  const brokenConnections = (() => {
    const ids = new Set();

    if (incomingLeadsAppType !== "Mailhook" && incomingLeadsConnection) {
      ids.add(incomingLeadsConnection);
    }

    routerBranches.forEach((branch) =>
      (branch.modules || []).forEach((m) => {
        const isDelay =
          m.type === "Delay" ||
          m.app?.name === "Delay" ||
          m.app?.displayName === "Delay" ||
          Boolean(m.delayValue);
        if (!isDelay && m.connectionId) ids.add(m.connectionId);
      }),
    );

    /* Nothing loaded yet is not the same as nothing healthy. */
    if (!Array.isArray(connections) || connections.length === 0) return [];

    return [...ids]
      .map((id) => ({ id, connection: findConnection(connections, id) }))
      .filter(({ connection }) => !isConnectionUsable(connection));
  })();

  /*
   * Derived rather than cleared by an effect: once the account is signed
   * in again the refreshed connection list makes the warning disappear on
   * its own, with no stale banner left to dismiss by hand.
   */
  const visibleActivationBlockers = activationBlockers.filter((blocker) => {
    if (!blocker?.connectionId) return true;
    return !isConnectionUsableById(connections, blocker.connectionId);
  });

  const isTriggerConfirmed = true;
  const isTemplatesReviewed = Boolean(
    selectedTemplate ||
    (routerBranches &&
      routerBranches.some((b) => b.modules?.length > 0)),
  );

  const allModules = routerBranches.flatMap(
    (b) => b.modules || [],
  );
  const unconfiguredEmailModulesCount = allModules.filter(
    (m) => {
      const isDelay =
        m.type === "Delay" ||
        m.app?.name === "Delay" ||
        m.app?.displayName === "Delay" ||
        Boolean(m.delayValue);
      const hasValidConnection = Boolean(
        m.connectionId &&
        isConnectionUsableById(connections, m.connectionId),
      );
      return !isDelay && !hasValidConnection;
    },
  ).length;

  const isSenderConnected =
    unconfiguredEmailModulesCount === 0 &&
    allModules.length > 0;

  const checklistSteps = [
    {
      label: "Connect inbox",
      isComplete: isInboxConnected,
      warning: !isInboxConnected
        ? incomingLeadsAppType === "Mailhook"
          ? "Mailhook not verified — confirm forwarding to finish setup"
          : incomingLeadsConnection
            ? /* Chosen but unusable — say which, and why. */
              `${connectionLabel(
                findConnection(connections, incomingLeadsConnection),
                "The selected inbox",
              )} cannot be used — ${connectionProblem(
                findConnection(connections, incomingLeadsConnection),
              )}`
            : "Inbox connection missing — select an account"
        : null,
    },
    {
      label: "Confirm trigger filter",
      isComplete: isTriggerConfirmed,
    },
    {
      label: "Review templates",
      isComplete: isTemplatesReviewed,
    },
    {
      label: "Connect sender",
      isComplete: isSenderConnected,
      warning: !isSenderConnected
        ? brokenConnections.length > 0
          ? `${connectionLabel(
              brokenConnections[0].connection,
              "The sending account",
            )} cannot be used — ${connectionProblem(
              brokenConnections[0].connection,
            )}`
          : unconfiguredEmailModulesCount > 0
            ? `${unconfiguredEmailModulesCount} node${unconfiguredEmailModulesCount > 1 ? "s" : ""} unconfigured`
            : "No sending account chosen for this step"
        : null,
    },
  ];

  const completedCount = checklistSteps.filter(
    (s) => s.isComplete,
  ).length;
  const progressPercent = Math.round(
    (completedCount / 4) * 100,
  );

  const handleChecklistStepClick = (label) => {
    if (
      label === "Connect inbox" ||
      label === "Confirm trigger filter"
    ) {
      setShowIncomingLeadsModal(true);
    } else if (label === "Review templates") {
      setShowTemplateModal(true);
    } else if (label === "Connect sender") {
      const unconfiguredMod = allModules.find((m) => {
        const isDelay =
          m.type === "Delay" ||
          m.app?.name === "Delay" ||
          m.app?.displayName === "Delay" ||
          Boolean(m.delayValue);
        return !isDelay && !m.connectionId;
      });

      if (unconfiguredMod) {
        setSelectedApp(
          unconfiguredMod.app || {
            name: "Gmail",
            displayName: "Initial Email",
          },
        );
        setSelectedAppType(
          unconfiguredMod.emailType || "Gmail",
        );
        setEditingModuleId(unconfiguredMod.id);
        setSelectedConnection("");
        setOpen(true);
      } else if (!incomingLeadsConnection) {
        setShowIncomingLeadsModal(true);
      } else {
        setShowCreateConnectionModal(true);
      }
    }
  };

  const checklistComplete = completedCount === checklistSteps.length;

  /* Collapsed unless something is outstanding, or the user opened it. */
  const showChecklistPanel = !checklistComplete || checklistExpanded;

  return (
    <AppLayout>
      <div className="flex-1 flex flex-col h-full overflow-y-auto min-w-0 bg-[#FAF8F5] font-inter">
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
                <h1 className="text-lg font-semibold text-gray-900">
                  Scenario History
                </h1>
                <p className="text-sm text-gray-500">
                  View all past executions and statuses
                </p>
              </div>

              {/*
                Which clock these times are on. Without it a reader has to
                assume, and the assumption is usually "my own", which is
                exactly the thing that is not guaranteed.
              */}
              <span className="ml-auto shrink-0 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-[11px] font-semibold text-gray-600">
                Times in {timeZoneBadge(accountTimeZone)}
              </span>
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
                    <div className="px-5 py-8 text-center text-gray-500 text-sm">
                      No history logs found.
                    </div>
                  ) : (
                    scenarioHistory.map((log) => {
                      const duration =
                        log.startedAt && log.completedAt
                          ? `${Math.max(1, Math.round((new Date(log.completedAt) - new Date(log.startedAt)) / 1000))}s`
                          : "< 1s";

                      return (
                        <div
                          key={log._id}
                          className="grid grid-cols-[1.5fr_1.5fr_1fr_1fr_1fr_1fr_auto] items-center text-sm text-gray-700 hover:bg-gray-50/50 transition-colors"
                        >
                          <div className="px-5 py-3 font-normal text-gray-700">
                            {/*
                              The account's timezone, not the browser's.
                              A run log is a record of the business's
                              automation — two colleagues in different
                              countries must read the same clock time off
                              the same row.
                            */}
                            {formatInTimeZone(log.createdAt, accountTimeZone, {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
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
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-normal border ${
                                log.status === "success"
                                  ? "bg-green-50 text-green-700 border-green-200"
                                  : log.status === "failed"
                                    ? "bg-red-50 text-red-700 border-red-200"
                                    : "bg-yellow-50 text-yellow-700 border-yellow-200"
                              }`}
                            >
                              {log.status === "failed"
                                ? "Error"
                                : log.status === "partial"
                                  ? "Partial"
                                  : "Success"}
                            </span>
                          </div>
                          <div className="px-5 py-3 text-gray-500 text-sm text-gray-600">
                            {duration}
                          </div>
                          <div className="px-5 py-3 text-gray-500">
                            {log.steps?.length || 0}
                          </div>
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
        ) : historyViewMode === "details" && selectedHistoryLog ? (
          (() => {
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

            const duration =
              selectedHistoryLog.startedAt && selectedHistoryLog.completedAt
                ? `${Math.max(1, Math.round((new Date(selectedHistoryLog.completedAt) - new Date(selectedHistoryLog.startedAt)) / 1000))} sec`
                : "Less than 1 sec";

            const leadDetails = {
              customerName:
                getCustomerFromSignature() ||
                selectedHistoryLog.customerName ||
                getLineValue("Name") ||
                "N/A",
              businessName:
                getBusinessName() || getLineValue("Business") || "N/A",
              service:
                selectedHistoryLog.service ||
                getLineValue("Service needed") ||
                "N/A",
              budget: getLineValue("Budget") || "N/A",
              website: getLineValue("Website") || "N/A",
              country: getLineValue("Country") || "N/A",
            };
            const getStepColor = (status) => {
              if (status === "success")
                return "border-green-200 bg-green-50 text-green-700";
              if (status === "failed")
                return "border-red-200 bg-red-50 text-red-700";
              return "border-yellow-200 bg-yellow-50 text-yellow-700";
            };

            const getStepLabel = (step) => {
              if (step.stepKey === "reply-email-send") return "Initial Email";
              if (step.stepKey === "delay-job-create") return "Delay";
              if (step.stepKey === "delayed-email-send") {
                return (
                  step.meta?.moduleName || step.stepName || "Follow-up Email"
                );
              }
              return step.stepName || "Step";
            };

            const getStepReason = (step) => {
              if (step.status === "success") {
                if (step.stepKey === "reply-email-send")
                  return "Initial reply email was sent successfully.";
                if (step.stepKey === "delay-job-create")
                  return "Delay job was created and scheduled successfully.";
                if (step.stepKey === "delayed-email-send")
                  return "Follow-up email was sent successfully after delay.";
                return step.message || "Step completed successfully.";
              }

              return step.issue || step.message || "This step failed.";
            };
            const statusColors =
              selectedHistoryLog.status === "success"
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
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-normal border ${statusColors} uppercase tracking-wider`}
                        >
                          {selectedHistoryLog.status}
                        </span>
                      </h1>
                      <p className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                        <Clock3 size={12} />{" "}
                        {formatInTimeZone(
                          selectedHistoryLog.createdAt,
                          accountTimeZone,
                          { second: "2-digit" },
                        )}
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
                          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                            Customer Name
                          </p>
                          <p className="text-sm text-gray-900 font-medium">
                            {leadDetails.customerName}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                            Business
                          </p>
                          <p className="text-sm text-gray-900 font-medium">
                            {leadDetails.businessName}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                            Service Needed
                          </p>
                          <p className="text-sm text-gray-900 font-medium">
                            {leadDetails.service}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                            Budget
                          </p>
                          <p className="text-sm text-gray-900 font-medium">
                            {leadDetails.budget}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                            Country
                          </p>
                          <p className="text-sm text-gray-900 font-medium">
                            {leadDetails.country}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                            Website
                          </p>
                          {leadDetails.website !== "N/A" ? (
                            <a
                              href={
                                leadDetails.website.startsWith("http")
                                  ? leadDetails.website
                                  : `https://${leadDetails.website}`
                              }
                              target="_blank"
                              rel="noreferrer"
                              className="text-sm text-blue-600 hover:underline font-medium flex items-center gap-1"
                            >
                              {leadDetails.website} <FiLink size={12} />
                            </a>
                          ) : (
                            <p className="text-sm text-gray-900 font-medium">
                              N/A
                            </p>
                          )}
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
                          Complete step-by-step execution status for this
                          scenario run.
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
                                className={`absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                  isSuccess
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
                                        ? new Date(
                                            step.completedAt,
                                          ).toLocaleString()
                                        : "Not completed yet"}
                                    </p>
                                  </div>

                                  <span
                                    className={`text-[10px] px-2.5 py-1 rounded-full font-semibold border ${getStepColor(
                                      step.status,
                                    )}`}
                                  >
                                    {step.status?.toUpperCase() || "PENDING"}
                                  </span>
                                </div>

                                <div className="mt-3 text-sm text-gray-700">
                                  <p>
                                    <span className="font-semibold">
                                      Reason:
                                    </span>{" "}
                                    {getStepReason(step)}
                                  </p>

                                  {step.suggestion && (
                                    <p className="mt-1 text-red-600">
                                      <span className="font-semibold">
                                        Suggestion:
                                      </span>{" "}
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
                                        {step.meta.delayValue}{" "}
                                        {step.meta.delayUnit}
                                      </p>
                                    </div>
                                  )}

                                  {step.meta?.scheduledAt && (
                                    <div className="bg-gray-50 border rounded-md p-3">
                                      <p className="text-gray-400 uppercase font-semibold mb-1">
                                        Scheduled At
                                      </p>
                                      <p className="text-gray-800 font-medium">
                                        {formatInTimeZone(
                                          step.meta.scheduledAt,
                                          accountTimeZone,
                                        )}
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
                                {selectedHistoryLog.replyEmail.senderAddress ||
                                  "N/A"}
                              </p>
                            </div>

                            <div>
                              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                                Reply Sent To
                              </p>
                              <p className="text-sm font-medium text-gray-900 break-all">
                                {selectedHistoryLog.replyEmail
                                  .recipientAddress || "N/A"}
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
          })()
        ) : (
          <>
            {/* Top Header Bar */}
            <div className="sticky top-0 z-30 border-b border-[#EBE8E1] bg-[#FAF8F5] px-6 py-3.5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-400">
                      Scenarios /
                    </span>
                    <div className="relative flex items-center group">
                      <input
                        type="text"
                        value={scenarioName}
                        placeholder="Shopify Partner Directory — Lead Automation"
                        onChange={(e) => setScenarioName(e.target.value)}
                        onBlur={() => {
                          if (!scenarioName.trim()) {
                            setScenarioName(
                              "Shopify Partner Directory — Lead Automation",
                            );
                          }
                          handleSaveScenario();
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.target.blur();
                          }
                        }}
                        className="text-base font-bold text-slate-900 bg-transparent hover:bg-slate-100/70 focus:bg-white border border-transparent hover:border-slate-200 focus:border-slate-300 rounded-[6px] px-2 py-0.5 outline-none transition-all w-[300px] sm:w-[380px] truncate focus:not-truncate cursor-pointer focus:cursor-text"
                        title="Click to edit scenario name"
                      />
                    </div>
                  </div>

                  <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium">
                    {(() => {
                      const isConn = Boolean(
                        selectedConnection ||
                        incomingLeadsConnection ||
                        (Array.isArray(connections) && connections.length > 0),
                      );
                      const allCanvasModules = routerBranches.flatMap(
                        (b) => b.modules || [],
                      );
                      const unconfiguredEmailModules = allCanvasModules.filter(
                        (m) => {
                          const isDelay =
                            m.type === "Delay" ||
                            m.app?.name === "Delay" ||
                            m.app?.displayName === "Delay" ||
                            Boolean(m.delayValue);
                          return !isDelay && !m.connectionId;
                        },
                      );
                      const isInitialConfigured = Boolean(
                        allCanvasModules.find(
                          (m) =>
                            (m.app?.displayName === "Initial Email" ||
                              m.template === "Initial Email") &&
                            m.connectionId,
                        ) ||
                        (selectedConnection &&
                          selectedTemplate === "Initial Email"),
                      );
                      const attentionModules =
                        unconfiguredEmailModules.length +
                        (!isInitialConfigured ? 1 : 0);
                      return (
                        <>
                          <span
                            className={`inline-flex items-center gap-1 ${
                              isConn ? "text-[#137333]" : "text-amber-700"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                isConn ? "bg-[#34A853]" : "bg-amber-500"
                              }`}
                            ></span>
                            {isConn ? "Inbox connected" : "Inbox disconnected"}
                          </span>
                          <span className="text-slate-300">|</span>
                          <span
                            className={
                              attentionModules > 0
                                ? "font-semibold text-amber-700"
                                : "font-semibold text-[#137333]"
                            }
                          >
                            {attentionModules > 0
                              ? `${attentionModules} module${attentionModules > 1 ? "s" : ""} need${attentionModules === 1 ? "s" : ""} attention`
                              : "✓ All modules active"}
                          </span>
                          <span className="text-slate-300">|</span>
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                              automationOn
                                ? "bg-[#E6F4EA] text-[#137333]"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                automationOn ? "bg-[#34A853]" : "bg-amber-500"
                              }`}
                            ></span>
                            {automationOn ? "Live" : "Paused"}
                          </span>

                          {/* Auto-saving indicator badge below with Live badge */}
                          {isAutoSaving ? (
                            <>
                              <span className="text-slate-300">|</span>
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800 animate-pulse shadow-2xs">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                                Saving changes...
                              </span>
                            </>
                          ) : lastSavedTime ? (
                            <>
                              <span className="text-slate-300">|</span>
                              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10.5px] font-medium text-slate-600">
                                <FiCheck size={11} className="text-emerald-600" />
                                Auto-saved
                              </span>
                            </>
                          ) : null}
                        </>
                      );
                    })()}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => {
                      setHistoryViewMode("table");
                      fetchScenarioHistory();
                    }}
                    className="rounded-full border border-[#E0DDD5] bg-white px-4 py-1.5 text-xs font-semibold text-slate-800 shadow-2xs hover:bg-slate-50 transition"
                  >
                    Run history
                  </button>

                  <button
                    onClick={handleOpenSendTestModal}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#E0DDD5] bg-white px-4 py-1.5 text-xs font-semibold text-slate-800 shadow-2xs hover:bg-slate-50 transition"
                  >
                    <Mail size={13} />
                    Send test lead
                  </button>

                  <div className="flex items-center gap-2 rounded-full border border-[#E0DDD5] bg-white px-3 py-1 shadow-2xs">
                    <span className="text-xs font-semibold text-slate-700">
                      {automationOn ? "On" : "Off"}
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={automationOn}
                        onChange={handleToggleShopifyAutomation}
                        className="sr-only peer"
                      />
                      <div className="w-8 h-4 bg-slate-300 peer-checked:bg-[#137333] rounded-full transition-colors"></div>
                      <div className="absolute left-0.5 top-0.5 w-3 h-3 bg-white rounded-full transition-transform peer-checked:translate-x-4"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            {/*
              Why the scenario is not running.
              Above the canvas, not inside the checklist, because it is the
              answer to "I switched it on and it went back off" — the one
              question the page previously had no way to answer.
            */}
            {visibleActivationBlockers.length > 0 && (
              <div
                role="alert"
                className="relative z-20 mx-6 mt-4 rounded-xl border border-red-200 bg-red-50 p-4 shadow-2xs"
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle
                    size={18}
                    className="mt-0.5 shrink-0 text-red-600"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-red-900">
                      This scenario could not be activated
                    </p>

                    <ul className="mt-1.5 space-y-1">
                      {visibleActivationBlockers.map((blocker, idx) => (
                        <li
                          key={`${blocker.code || "blocker"}-${blocker.connectionId || idx}`}
                          className="text-sm text-red-800"
                        >
                          {blocker.message}
                          {blocker.role ? (
                            <span className="text-red-700/70">
                              {" "}
                              (used by {blocker.role})
                            </span>
                          ) : null}
                        </li>
                      ))}
                    </ul>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {/*
                        An expired grant cannot be refreshed — the account
                        has to be signed in again, so offer that directly.
                      */}
                      {visibleActivationBlockers.some(
                        (b) => b.code === "reauth_required",
                      ) && (
                        <button
                          onClick={() => setShowCreateConnectionModal(true)}
                          className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-red-700 transition"
                        >
                          Reconnect account
                        </button>
                      )}

                      <button
                        onClick={() => setShowIncomingLeadsModal(true)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-red-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-red-800 hover:bg-red-50 transition"
                      >
                        Review configuration
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => setActivationBlockers([])}
                    aria-label="Dismiss"
                    className="shrink-0 rounded-full p-1 text-red-500 hover:bg-red-100 transition"
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>
            )}

            {/* Main Canvas Body */}
            <div className="flex-1 flex flex-col bg-[#FAF8F5] p-6 relative">
              <div className="absolute inset-0 bg-[radial-gradient(#D5D1C8_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none"></div>

              <div
                className={`relative z-10 grid gap-8 mx-auto ${
                  showChecklistPanel
                    ? "grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)]"
                    : "grid-cols-1"
                }`}
              >
                {showChecklistPanel && (
                <div className="space-y-4">
                  <div className="rounded-[20px] bg-gradient-to-b from-slate-950 via-zinc-900 to-black text-white p-5 border border-slate-800 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>
                    {(() => {
                          /*
                           * Reads the checklist computed once at the top of
                           * this component. It used to recompute its own
                           * copy here, which shadowed the outer one and
                           * quietly drifted from it — the panel kept
                           * showing a connection as fine after the shared
                           * check learned to reject expired sign-ins.
                           */
                          return (
                            <>
                              <div className="flex items-center justify-between relative z-10">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                  SETUP CHECKLIST
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                                    {completedCount} of 4 complete
                                  </span>
                                  {/*
                                    Only offered once the checklist is
                                    finished — collapsing an unfinished one
                                    would hide the work still to do.
                                  */}
                                  {checklistComplete && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setChecklistExpanded(false)
                                      }
                                      title="Hide the checklist"
                                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-slate-700 text-slate-400 transition hover:bg-slate-800 hover:text-white"
                                    >
                                      <X size={11} />
                                    </button>
                                  )}
                                </div>
                              </div>

                              <div className="mt-3 h-2 w-full rounded-full bg-slate-800/80 overflow-hidden p-0.5 border border-slate-700/50 relative z-10">
                                <div
                                  className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full transition-all duration-500 shadow-xs shadow-emerald-500/50"
                                  style={{ width: `${progressPercent}%` }}
                                ></div>
                              </div>

                              <div className="mt-5 space-y-2.5 relative z-10">
                                {checklistSteps.map((step, idx) => (
                                  <React.Fragment key={idx}>
                                    {step.warning && !step.isComplete ? (
                                      <div
                                        onClick={() => handleChecklistStepClick(step.label)}
                                        className="rounded-xl border border-amber-500/30 bg-amber-950/40 p-3 text-xs cursor-pointer hover:bg-amber-900/50 transition"
                                      >
                                        <div className="flex items-center gap-2 font-bold text-amber-300">
                                          <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse"></span>
                                          {step.label}
                                        </div>
                                        <p className="mt-1 text-[11px] text-amber-200/80">
                                          {step.warning} (click to configure)
                                        </p>
                                      </div>
                                    ) : (
                                      <div
                                        onClick={() => handleChecklistStepClick(step.label)}
                                        className="flex items-center gap-2.5 text-xs font-semibold text-slate-200 bg-slate-900/60 border border-slate-800/80 p-2.5 rounded-xl hover:bg-slate-800/80 cursor-pointer transition"
                                      >
                                        <span
                                          className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] ${
                                            step.isComplete
                                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold"
                                              : "bg-slate-800 text-slate-500 border border-slate-700"
                                          }`}
                                        >
                                          {step.isComplete ? "✓" : "○"}
                                        </span>
                                        {step.label}
                                      </div>
                                    )}
                                  </React.Fragment>
                                ))}
                              </div>

                          {!isSenderConnected && (
                            <button
                              onClick={() => setShowCreateConnectionModal(true)}
                              className="mt-5 w-full rounded-xl bg-emerald-500 hover:bg-emerald-400 py-2.5 text-xs font-bold text-slate-950 transition text-center shadow-lg shadow-emerald-500/20 relative z-10"
                            >
                              Connect Sender Account
                            </button>
                          )}
                        </>
                      );
                    })()}
                  </div>

                </div>
                )}

                {/* RIGHT SECTION: Horizontal Flow Cards & Banner */}
                <div className="space-y-6 min-w-0">
                  <div className="relative">
                    {/* Edge fades + buttons, shown only when there is more to reach. */}
                    {flowScroll.overflow.scrollable &&
                      !flowScroll.overflow.atStart && (
                        <>
                          <div className="pointer-events-none absolute left-0 top-0 bottom-4 w-20 z-10 bg-gradient-to-r from-[#FAF8F5] via-[#FAF8F5]/80 to-transparent" />
                          <button
                            type="button"
                            aria-label="Scroll left"
                            onClick={() => flowScroll.scrollBy(-1)}
                            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-[#111111] text-white ring-4 ring-white shadow-xl transition hover:bg-black hover:scale-105 active:scale-95 cursor-pointer"
                          >
                            <ChevronLeft size={22} strokeWidth={2.5} />
                          </button>
                        </>
                      )}

                    {flowScroll.overflow.scrollable &&
                      !flowScroll.overflow.atEnd && (
                        <>
                          <div className="pointer-events-none absolute right-0 top-0 bottom-4 w-20 z-10 bg-gradient-to-l from-[#FAF8F5] via-[#FAF8F5]/80 to-transparent" />
                          <button
                            type="button"
                            aria-label="Scroll right"
                            onClick={() => flowScroll.scrollBy(1)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-[#111111] text-white ring-4 ring-white shadow-xl transition hover:bg-black hover:scale-105 active:scale-95 cursor-pointer"
                          >
                            <ChevronRight size={22} strokeWidth={2.5} />
                          </button>
                        </>
                      )}

                  <div
                    ref={flowScroll.ref}
                    {...flowScroll.dragProps}
                    className={`flex items-start gap-4 overflow-x-auto pb-4 pt-1 no-scrollbar select-none ${
                      flowScroll.isDragging ? "cursor-grabbing" : ""
                    }`}
                  >
                    {/* CARD 1: Incoming Leads */}
                    {(() => {
                      const activeConn = (Array.isArray(connections) ? connections : []).find((c) => c._id === incomingLeadsConnection);
                      const isMailhookTrigger =
                        incomingLeadsAppType === "Mailhook";
                      const activeHook = mailhooks.find(
                        (m) => m._id === incomingLeadsMailhook,
                      );
                      /*
                       * "A mailbox is selected" and "that mailbox still
                       * works" are different questions, and this card used
                       * to ask only the first — so a revoked Microsoft
                       * grant kept a green dot and "Listening for leads"
                       * over a trigger the server would not run.
                       */
                      const isIncSelected = isMailhookTrigger
                        ? Boolean(activeHook?.connectionVerified)
                        : Boolean(incomingLeadsConnection && activeConn);

                      const isIncBroken =
                        !isMailhookTrigger &&
                        Boolean(incomingLeadsConnection) &&
                        Array.isArray(connections) &&
                        connections.length > 0 &&
                        !isConnectionUsable(activeConn);

                      const isIncConfigured = isIncSelected && !isIncBroken;
                      return (
                        <div
                          onClick={() => setShowIncomingLeadsModal(true)}
                          className={`w-64 shrink-0 cursor-pointer rounded-[20px] border ${
                            isIncBroken
                              ? "border-red-300 bg-white"
                              : isIncConfigured
                                ? "border-[#EBE8E1] bg-white"
                                : "border-[#FDE68A] bg-white"
                          } p-5 shadow-2xs hover:shadow-md transition relative`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#E6F4EA] text-[#137333]">
                                <Mail size={16} />
                              </div>
                              <span className="font-bold text-slate-900 text-sm">
                                Incoming Leads
                              </span>
                            </div>
                            <StatusDot
                              tone={
                                isIncBroken
                                  ? "paused"
                                  : isIncConfigured
                                    ? "active"
                                    : "pending"
                              }
                              title={
                                isIncBroken
                                  ? `${connectionLabel(activeConn)} cannot be used — ${connectionProblem(activeConn)}`
                                  : isIncConfigured
                                    ? "Trigger configured and listening"
                                    : "Trigger not configured yet"
                              }
                            />
                          </div>

                          <div className="mt-4 space-y-1.5 text-xs text-slate-500">
                            <p className="truncate font-medium text-slate-800">
                              {isMailhookTrigger
                                ? activeHook
                                  ? `Mailhook · ${activeHook.address || activeHook.name}`
                                  : "Mailhook · not selected"
                                : activeConn
                                  ? `${providerLabel(activeConn.provider)} · ${activeConn.email}`
                                  : "No mailbox selected"}
                            </p>
                            {/*
                              The subject the backend actually matches on,
                              which the administrator sets platform-wide.
                              Never a literal — it would drift silently.
                            */}
                            {(incomingLeadsSubjectFilter ||
                              platformTriggerSubject) && (
                              <p className="flex items-center gap-1">
                                Subject contains{" "}
                                <span className="truncate rounded bg-slate-100 px-1.5 py-0.5 font-medium text-slate-700">
                                  {incomingLeadsSubjectFilter ||
                                    platformTriggerSubject}
                                </span>
                              </p>
                            )}
                            <p>
                              {isMailhookTrigger
                                ? "Delivered on forward"
                                : "Checked on a schedule"}
                            </p>
                          </div>

                          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1 text-xs font-semibold">
                            {isIncBroken ? (
                              <span className="text-red-700 font-bold">
                                {activeConn?.status === "reauth_required"
                                  ? "⚠️ Sign-in expired — reconnect"
                                  : "⚠️ Mailbox disconnected"}
                              </span>
                            ) : isIncConfigured ? (
                              <span className="text-[#137333]">
                                ✓ Listening for leads
                              </span>
                            ) : (
                              <span className="text-amber-700 font-bold">⚠️ Unconfigured</span>
                            )}
                          </div>
                        </div>
                      );
                    })()}

                    <FlowConnector />

                    {/* CARD 2: Router */}
                    <div
                      onClick={() => setShowRouterBranches(true)}
                      className="w-80 shrink-0 cursor-pointer rounded-[20px] border border-[#EBE8E1] bg-white p-5 shadow-2xs hover:shadow-md transition relative"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                            <GitBranch size={16} />
                          </div>
                          <span className="font-bold text-slate-900 text-sm">
                            Router
                          </span>
                        </div>
                        <StatusDot title="Routing conditions are active" />
                      </div>

                      <div className="space-y-2.5 text-xs">
                        {/* FILTER 1: Subject Filter */}
                        <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 hover:bg-slate-100 transition">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2">
                              <span className="h-2 w-2 rounded-full bg-amber-500 mt-1 shrink-0"></span>
                              <div>
                                <p className="font-semibold text-slate-800 leading-snug">
                                  If incoming leads subject contains:{" "}
                                  <span className="font-bold text-slate-900">
                                    {incomingLeadsSubjectFilter ||
                                      platformTriggerSubject ||
                                      "…"}
                                  </span>
                                </p>
                              </div>
                            </div>
                          </div>

                        </div>

                        {/*
                        The two filters are ANDed — a lead has to match the
                        subject AND name a service.
                      */}
                      <div className="flex items-center gap-2 px-1">
                        <span className="h-px flex-1 bg-slate-200" />
                        <span className="rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          And
                        </span>
                        <span className="h-px flex-1 bg-slate-200" />
                      </div>

                      {/* FILTER 2: Service / Body Filter */}
                        <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 hover:bg-slate-100 transition">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2">
                              <span className="h-2 w-2 rounded-full bg-blue-500 mt-1 shrink-0"></span>
                              <div>
                                <p className="font-semibold text-slate-800 leading-snug">
                                  If incoming leads body contains service:{" "}
                                  <span className="font-bold text-slate-900">
                                    {platformServices.length
                                      ? `${platformServices.slice(0, 3).join(", ")}${
                                          platformServices.length > 3
                                            ? ` +${platformServices.length - 3} more`
                                            : ""
                                        }`
                                      : "…"}
                                  </span>
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <FlowConnector
                      muted={
                        scenarioReplyMode === "ai"
                          ? !selectedScenarioProfile?.isComplete
                          : activeTemplateCount === 0
                      }
                    />

                    {/* CARD 3: Template */}
                    <div
                      onClick={() => setShowTemplateModal(true)}
                      className="w-64 shrink-0 cursor-pointer rounded-[20px] border border-[#EBE8E1] bg-white p-5 shadow-2xs hover:shadow-md transition relative"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                            <FiFileText size={16} />
                          </div>
                          <span className="font-bold text-slate-900 text-sm">
                            Template
                          </span>
                        </div>
                        <StatusDot
                          tone={
                            scenarioReplyMode === "ai"
                              ? selectedScenarioProfile?.isComplete
                                ? "active"
                                : "pending"
                              : activeTemplateCount > 0
                              ? "active"
                              : "pending"
                          }
                          title={
                            scenarioReplyMode === "ai"
                              ? selectedScenarioProfile?.isComplete
                                ? "AI templates active and configured"
                                : "AI profile incomplete — select a complete company profile"
                              : activeTemplateCount > 0
                              ? templateSummary
                              : `No ${templateScopeLabel} templates active`
                          }
                        />
                      </div>

                      <div className="mt-4 space-y-1.5 text-xs text-slate-500">
                        <p className="font-semibold text-slate-800">
                          {scenarioReplyMode === "ai"
                            ? "AI templates active"
                            : templateSummary}
                        </p>
                        <p>
                          {scenarioReplyMode === "ai"
                            ? selectedScenarioProfile?.name
                              ? `Written by AI from "${selectedScenarioProfile.name}"`
                              : "Written by AI from your company profile"
                            : "Manual templates — fixed wording, sent as written"}
                        </p>
                        {lastTemplateEdit && <p>Last edited {lastTemplateEdit}</p>}
                      </div>

                      <div className="mt-5 pt-3 border-t border-slate-100 text-xs font-semibold text-slate-900 underline">
                        Preview each →
                      </div>
                    </div>

                    <FlowConnector />

                    {/* CARD 4: Initial Email */}
                    {(() => {
                      const initialMod = routerBranches
                        .flatMap((b) => b.modules || [])
                        .find(
                          (m) =>
                            m.app?.displayName === "Initial Email" ||
                            m.app?.name === "Initial Email" ||
                            m.template === "Initial Email",
                        );
                      const activeInitialConn = (Array.isArray(connections) ? connections : []).find((c) => c._id === initialMod?.connectionId);
                      const isSaved = Boolean(
                        initialMod && initialMod.connectionId && activeInitialConn
                      );

                      return (
                        <div
                          onClick={() => {
                            const initialType = appTypeForModule(initialMod);
                            setSelectedApp({
                              name: initialType,
                              displayName: "Initial Email",
                              color: "bg-red-500",
                              icon: initialType,
                              defaultTemplate: "Initial Email",
                            });
                            setSelectedAppType(initialType);
                            setEditingBranch(0);

                            if (initialMod) {
                              setEditingModuleId(initialMod.id);
                              setSelectedTemplate(initialMod.template || "Initial Email");
                              setSelectedConnection(initialMod.connectionId !== undefined ? initialMod.connectionId : "");
                              setSubject(initialMod.subject || "");
                              setCcList(initialMod.cc || []);
                              setBccList(initialMod.bcc || []);
                            } else {
                              setEditingModuleId(null);
                              setSelectedTemplate("Initial Email");
                              setSelectedConnection("");
                            }
                            setOpen(true);
                          }}
                          className={`w-64 shrink-0 cursor-pointer rounded-[20px] border ${
                            isSaved
                              ? "border-[#EBE8E1] bg-white"
                              : "border-[#FDE68A] bg-white"
                          } p-5 shadow-2xs hover:shadow-md transition relative`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2.5">
                              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                                <Zap size={16} />
                              </div>
                              <span className="font-bold text-slate-900 text-sm">
                                Initial Email
                              </span>
                            </div>
                            <StatusDot
                              tone={isSaved ? "active" : "pending"}
                              title={
                                isSaved
                                  ? "Sending from a connected mailbox"
                                  : "No sending mailbox chosen yet"
                              }
                            />
                          </div>

                          {isSaved ? (
                            <>
                              <div className="mt-4 space-y-1 text-xs text-slate-500">
                                <p className="font-semibold text-slate-800">
                                  {initialMod?.template || "Initial Email Template"}
                                </p>
                                <p className="text-[11px] text-slate-400">
                                  {initialMod?.subject
                                    ? `Subject: "${initialMod.subject}"`
                                    : "Default subject filter"}
                                </p>
                              </div>
                              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-900">
                                <span className="text-[#137333]">✓ Configured</span>
                                <span className="underline">Edit →</span>
                              </div>
                            </>
                          ) : (
                            <>
                              {/*
                                The real reason, and nothing invented. A
                                module with no connectionId was never set
                                up; one whose connection has since gone
                                means the mailbox was removed or its
                                sign-in lapsed. Neither is Gmail-specific.
                              */}
                              <div className="rounded-xl bg-[#FEF3C7] p-3 text-xs text-[#92400E] leading-relaxed mb-4">
                                {initialMod?.connectionId
                                  ? "The mailbox this step sent from is no longer available. Choose a connection to start sending again."
                                  : "No sending mailbox chosen yet. Replies won't go out until you pick one."}
                              </div>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const initialType =
                                    appTypeForModule(initialMod);
                                  setSelectedApp({
                                    name: initialType,
                                    displayName: "Initial Email",
                                    color: "bg-red-500",
                                    icon: initialType,
                                    defaultTemplate: "Initial Email",
                                  });
                                  setSelectedAppType(initialType);
                                  setEditingBranch(0);
                                  if (initialMod) {
                                    setEditingModuleId(initialMod.id);
                                    setSelectedTemplate(initialMod.template || "Initial Email");
                                    setSelectedConnection(initialMod.connectionId || "");
                                    setSubject(initialMod.subject || "");
                                    setCcList(initialMod.cc || []);
                                    setBccList(initialMod.bcc || []);
                                  } else {
                                    setEditingModuleId(null);
                                    setSelectedTemplate("Initial Email");
                                    setSelectedConnection("");
                                  }
                                  setOpen(true);
                                }}
                                className="w-full rounded-full bg-[#111111] py-2 text-xs font-semibold text-white transition hover:bg-slate-800 text-center"
                              >
                                {initialMod?.connectionId
                                  ? "Choose another mailbox"
                                  : "Choose a mailbox"}
                              </button>
                            </>
                          )}
                        </div>
                      );
                    })()}

                    {/* DYNAMIC SAVED MODULE NODES (First Follow-up, Second Follow-up, Delay, etc.) */}
                    {routerBranches.flatMap((branch, bIdx) =>
                      (branch.modules || [])
                        .filter(
                          (mod) =>
                            mod.app?.displayName !== "Initial Email" &&
                            mod.app?.name !== "Initial Email" &&
                            mod.template !== "Initial Email",
                        )
                        .map((mod, mIdx) => {
                        const isDelay =
                          mod.type === "Delay" ||
                          mod.app?.name === "Delay" ||
                          mod.app?.displayName === "Delay" ||
                          Boolean(mod.delayValue);
                        const isModuleConfigured = isDelay
                          ? Boolean(mod.delayValue)
                          : Boolean(mod.connectionId);
                        const modTitle =
                          mod.app?.displayName ||
                          mod.app?.name ||
                          mod.template ||
                          "Follow-up Node";
                        const modDesc =
                          mod.description ||
                          (isDelay
                            ? `Wait ${mod.delayValue || 1} ${
                                mod.delayUnit || "hours"
                              }`
                            : `Send email via ${
                                mod.emailType || "Gmail"
                              }`);

                        return (
                          <React.Fragment key={mod.id || `${bIdx}-${mIdx}`}>
                            <FlowConnector muted={!isModuleConfigured} />
                            <div
                              onClick={() => {
                                setSelectedApp(mod.app || { name: mod.type });
                                setSelectedTemplate(mod.template || "");
                                setSelectedConnection(mod.connectionId || "");
                                setSubject(mod.subject || "");
                                setCcList(mod.cc || []);
                                setBccList(mod.bcc || []);
                                setDelayValue(mod.delayValue || "");
                                setDelayUnit(mod.delayUnit || "minutes");
                                setEditingBranch(bIdx);
                                setEditingModuleId(mod.id);
                                setOpen(true);
                              }}
                              className={`w-64 shrink-0 cursor-pointer rounded-[20px] border ${
                                isDelay
                                  ? "border-amber-200 bg-amber-50/40"
                                  : isModuleConfigured
                                    ? "border-[#EBE8E1] bg-white"
                                    : "border-[#FDE68A] bg-white"
                              } p-5 shadow-2xs hover:shadow-md transition relative group`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2.5">
                                  <div
                                    className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                                      isDelay
                                        ? "bg-amber-500 text-white"
                                        : "bg-[#111111] text-white"
                                    }`}
                                  >
                                    {isDelay ? (
                                      <Clock size={16} />
                                    ) : (
                                      <Mail size={16} />
                                    )}
                                  </div>
                                  <span className="font-bold text-slate-900 text-sm truncate max-w-[130px]">
                                    {modTitle}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <StatusDot
                                    tone={
                                      isModuleConfigured ? "active" : "pending"
                                    }
                                    title={
                                      isModuleConfigured
                                        ? "This step is ready to run"
                                        : isDelay
                                          ? "No wait time set"
                                          : "No sending mailbox chosen"
                                    }
                                  />
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRemoveModule(bIdx, mod.id);
                                    }}
                                    className="text-slate-400 hover:text-red-600 p-1 transition opacity-0 group-hover:opacity-100"
                                    title="Delete node"
                                  >
                                    <X size={14} />
                                  </button>
                                </div>
                              </div>
                              <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                                {modDesc}
                              </p>
                              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold">
                                {isModuleConfigured ? (
                                  <span className="text-[#137333]">✓ Configured</span>
                                ) : (
                                  <span className="text-amber-700 font-bold">⚠️ Not Configured</span>
                                )}
                                <span className="text-zinc-900 underline">
                                  Edit →
                                </span>
                              </div>
                            </div>
                          </React.Fragment>
                        );
                      }),
                    )}

                    <FlowConnector muted />

                      {/* CARD 5: Add Node / Module (First Follow-up, Second Follow-up, Delay) */}
                      <div
                        onClick={() => {
                          setSelectedApp(null);
                          setEditingBranch(0);
                          setOpen(true);
                        }}
                        className="w-52 shrink-0 cursor-pointer rounded-[20px] border-2 border-dashed border-slate-300 bg-white/80 hover:bg-white p-5 shadow-2xs hover:shadow-md transition flex flex-col items-center justify-center text-center group"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 group-hover:bg-[#111111] group-hover:text-white transition-colors mb-2">
                          <Plus size={20} />
                        </div>
                        <span className="font-bold text-slate-900 text-xs">
                          + Add Node / Module
                        </span>
                        <span className="text-[11px] text-slate-500 mt-1">
                          Follow-up or Delay
                        </span>
                      </div>
                    </div>
                  </div>
                  </div>


              </div>
              {/*
                Safe test — pinned to the bottom of the canvas by mt-auto,
                starting at the page's left edge rather than indented to
                where the flow begins.

                The extra bottom margin only applies when the floating
                "Setup complete" chip is on screen, so the two never overlap.
              */}
              <div
                className={`w-full max-w-3xl rounded-2xl border border-[#EBE8E1] bg-white p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-auto relative z-10 ${
                  showChecklistPanel ? "" : "mb-12"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FEF3C7] text-[#D97706] font-bold">
                    ✦
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      Safe test — nothing real at stake
                    </h4>
                    <p className="mt-0.5 text-xs text-slate-500 leading-relaxed">
                      We deliver a fake directory inquiry to your inbox and
                      reply to it, so you can read the exact email a lead
                      would get.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleOpenSendTestModal}
                  className="rounded-full bg-[#111111] px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-slate-800 shrink-0 text-center"
                >
                  Send myself a test lead
                </button>
              </div>

            </div>
            {/*
              Setup-complete chip. Fixed, so it costs the grid no space at
              all — the whole point of collapsing it was to give the flow
              cards the full width. Click to reopen the checklist.

              left-[88px] clears the 68px icon rail plus the collapsed
              scenario nav, which is how this page renders by default.
            */}
            {checklistComplete && !checklistExpanded && (
              <button
                type="button"
                onClick={() => setChecklistExpanded(true)}
                title="Setup complete — click to review the checklist"
                className="fixed bottom-5 left-[88px] z-30 flex items-center gap-2 rounded-full border border-emerald-200 bg-white/95 backdrop-blur px-3.5 py-2 shadow-lg transition hover:bg-emerald-50 cursor-pointer"
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-[11px] font-bold text-white">
                  ✓
                </span>
                <span className="text-[11px] font-bold text-emerald-900">
                  Setup complete
                </span>
              </button>
            )}

            {/*
              Resume prompt.
              
              Only ever opened with a real count from the server, so it
              never asks about an empty backlog. Cancelling leaves the
              scenario off and the queue intact — the prompt returns on the
              next attempt to switch it on.
            */}
            {queuePromptOpen && pausedQueue && (
              <div
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                onClick={() => {
                  if (!queueBusy) setQueuePromptOpen(false);
                }}
              >
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="flex max-h-[85vh] w-full max-w-[440px] flex-col overflow-hidden rounded-[16px] border border-[#EBE8E1] bg-white shadow-2xl"
                >
                  <div className="flex items-start justify-between gap-3 border-b border-[#EBE8E1] px-5 py-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FEF3C7] text-[#D97706]">
                        <Clock size={16} />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-zinc-900">
                          {pausedQueue.count} lead
                          {pausedQueue.count === 1 ? "" : "s"} waiting
                        </h3>
                        <p className="mt-0.5 text-xs text-zinc-500">
                          {pausedQueue.count === 1 ? "It" : "They"} arrived
                          while this scenario was switched off, so{" "}
                          {pausedQueue.count === 1 ? "it" : "they"} never got
                          a reply.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={queueBusy}
                      onClick={() => setQueuePromptOpen(false)}
                      className="shrink-0 rounded-full p-1 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 disabled:opacity-40"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div className="min-h-0 flex-1 overflow-y-auto bg-[#FAF8F5] px-5 py-4">
                    <p className="text-xs font-semibold text-zinc-700">
                      What should happen to them?
                    </p>

                    <div className="mt-3 space-y-2">
                      {pausedQueue.preview?.map((lead) => (
                        <div
                          key={lead._id}
                          className="rounded-[10px] border border-[#EBE8E1] bg-white px-3 py-2"
                        >
                          <p className="truncate text-xs font-semibold text-zinc-800">
                            {lead.subject}
                          </p>
                          <p className="mt-0.5 truncate text-[11px] text-zinc-500">
                            {lead.name ? `${lead.name} · ` : ""}
                            {lead.from}
                          </p>
                        </div>
                      ))}

                      {pausedQueue.previewTruncated && (
                        <p className="pt-0.5 text-[11px] font-medium text-zinc-500">
                          and {pausedQueue.count - (pausedQueue.preview?.length || 0)}{" "}
                          more
                        </p>
                      )}
                    </div>

                    <p className="mt-4 text-[11px] leading-relaxed text-zinc-500">
                      Discarding answers nothing and keeps the emails — they
                      stay in your Lead Inbox to handle by hand. Either way
                      the scenario switches on.
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 border-t border-[#EBE8E1] px-5 py-4 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      disabled={queueBusy}
                      onClick={() => resumeWithQueue("discard")}
                      className="rounded-full border border-zinc-300 px-4 py-2 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-100 disabled:opacity-40"
                    >
                      Discard the queue
                    </button>

                    <button
                      type="button"
                      disabled={queueBusy}
                      onClick={() => resumeWithQueue("send")}
                      className="rounded-full bg-[#111111] px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:opacity-40"
                    >
                      {queueBusy
                        ? "Sending…"
                        : `Send ${pausedQueue.count} repl${pausedQueue.count === 1 ? "y" : "ies"}`}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {open && (
              <div
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                {...moduleDismiss.backdropProps}
              >
                <div
                  ref={modalRef}
                  className="flex max-h-[85vh] w-full max-w-[440px] flex-col overflow-hidden rounded-[16px] border border-[#EBE8E1] bg-white shadow-2xl"
                  {...moduleDismiss.panelProps}
                >
                  {!selectedApp ? (
                    <>
                      {/*
                        Header matches CreateConnectionModal / the Gmail and
                        Microsoft modals: dark bar, tinted icon tile, title
                        with a one-line explanation beneath it.
                      */}
                      <header className="flex shrink-0 items-center justify-between bg-[#111110] px-5 py-4 text-white">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10">
                            <Zap className="h-4 w-4 text-emerald-400" />
                          </div>
                          <div>
                            <h2 className="text-base font-bold text-white">
                              Select Application
                            </h2>
                            <p className="mt-0.5 text-xs font-normal text-slate-300">
                              Choose an app to add to your workflow
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={resetForm}
                          aria-label="Close modal"
                          className="cursor-pointer rounded-full p-1 text-slate-400 transition hover:text-white"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </header>
                      <div className="min-h-0 flex-1 overflow-y-auto bg-[#FAF8F5]">
                        <div className="space-y-5 p-5">
                          {[
                            {
                              label: "Email sequence",
                              items: [
                                {
                                  name: "Initial Email",
                                  base: "Gmail",
                                  color: "bg-[#111111]",
                                  icon: "Gmail",
                                  step: "1",
                                  hint: "The first reply a new lead receives.",
                                },
                                {
                                  name: "First Follow-up",
                                  base: "Gmail",
                                  color: "bg-[#111111]",
                                  icon: "Gmail",
                                  step: "2",
                                  hint: "Sent when the lead has not replied yet.",
                                },
                                {
                                  name: "Second Follow-up",
                                  base: "Gmail",
                                  color: "bg-[#111111]",
                                  icon: "Gmail",
                                  step: "3",
                                  hint: "A final nudge before the thread goes quiet.",
                                },
                              ],
                            },
                            {
                              label: "Timing",
                              items: [
                                {
                                  name: "Delay",
                                  base: "Delay",
                                  color: "bg-amber-500",
                                  icon: "Delay",
                                  step: null,
                                  hint: "Wait before running the next module.",
                                },
                              ],
                            },
                          ].map((group) => (
                            <div key={group.label}>
                              <p className="mb-2 px-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                {group.label}
                              </p>

                              <div className="space-y-2">
                                {group.items.map((item, idx) => {
                                  const Icon = iconMap[item.icon];

                                  return (
                                    <button
                                      key={idx}
                                      type="button"
                                      onClick={() => {
                                        let templateName = "";
                                        if (item.name === "Initial Email")
                                          templateName = "Initial Email";
                                        else if (item.name === "First Follow-up")
                                          templateName = "First Follow-up";
                                        else if (
                                          item.name === "Second Follow-up"
                                        )
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

                                        /*
                                         * A new step inherits the
                                         * scenario's reply mode, so adding
                                         * a follow-up to an AI scenario
                                         * does not silently create a
                                         * manual one.
                                         */
                                        setReplyMode(scenarioReplyMode);
                                        setCompanyProfileId(
                                          scenarioReplyMode === "ai"
                                            ? scenarioProfileId
                                            : "",
                                        );

                                        setSelectedTemplate(templateName);
                                      }}
                                      className="group flex w-full cursor-pointer items-center gap-3.5 rounded-[14px] border border-[#EBE8E1] bg-white px-4 py-3.5 text-left shadow-2xs transition hover:border-slate-900 hover:shadow-md"
                                    >
                                      {/*
                                        The three email steps used to carry
                                        identical envelope tiles, so the
                                        sequence was unreadable at a glance.
                                        The step number sits on the tile.
                                      */}
                                      <span className="relative shrink-0">
                                        <span
                                          className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.color} text-white`}
                                        >
                                          <Icon className="h-4 w-4" />
                                        </span>

                                        {item.step && (
                                          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[9px] font-bold text-slate-900 ring-1 ring-[#EBE8E1]">
                                            {item.step}
                                          </span>
                                        )}
                                      </span>

                                      <span className="min-w-0 flex-1">
                                        <span className="block text-[13px] font-bold text-slate-900">
                                          {item.name}
                                        </span>
                                        <span className="mt-0.5 block text-[11px] font-normal leading-relaxed text-slate-500">
                                          {item.hint}
                                        </span>
                                      </span>

                                      <FiChevronRight className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-900" />
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <footer className="flex shrink-0 items-center justify-between gap-3 border-t border-[#EBE8E1] bg-white px-5 py-3.5">
                        <p className="text-[11px] font-medium text-slate-400">
                          Added to the end of your flow
                        </p>

                        <button
                          type="button"
                          onClick={resetForm}
                          className="cursor-pointer rounded-full border border-slate-300 bg-white px-4 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-100"
                        >
                          Cancel
                        </button>
                      </footer>
                    </>
                  ) : (
                    <>
                      <div className="px-5 py-3.5 bg-[#111111] text-white flex justify-between items-center shrink-0">
                        <h3 className="font-bold text-xs">
                          {selectedApp.displayName || selectedApp.name}
                        </h3>

                        <button
                          onClick={resetForm}
                          className="text-zinc-400 hover:text-white p-1 rounded-[8px] transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                        {selectedApp?.name === "Delay" ||
                        selectedApp?.type === "Delay" ? (
                          <div>
                            <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                              Delay Duration{" "}
                              <span className="text-red-500">*</span>
                            </label>
                            <div className="flex space-x-3">
                              <input
                                type="number"
                                value={delayValue}
                                onChange={(e) => setDelayValue(e.target.value)}
                                className="flex-1 border border-zinc-300 rounded-[8px] px-3 py-2 text-xs text-zinc-800 bg-white outline-none focus:border-zinc-900 transition"
                              />
                              <select
                                value={delayUnit}
                                onChange={(e) => setDelayUnit(e.target.value)}
                                className="border border-zinc-300 rounded-[8px] px-3 py-2 text-xs text-zinc-800 bg-white outline-none focus:border-zinc-900 transition"
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
                              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
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
                                  className="w-full border border-zinc-300 rounded-[8px] px-3 py-2 pr-20 text-xs text-zinc-800 bg-white outline-none focus:border-zinc-900 appearance-none transition"
                                >
                                  <option value="">
                                    -- Choose App Type --
                                  </option>
                                  <option value="Gmail">
                                    Gmail / Google Workspace
                                  </option>
                                  <option value="Microsoft">
                                    Outlook / Live / Microsoft 365
                                  </option>
                                  <option value="Email">Other Email</option>
                                </select>

                                {/* Add button INSIDE the select box (to the right) */}
                                <button
                                  disabled={!selectedAppType}
                                  onClick={() => {
                                    if (selectedAppType === "Email") {
                                      setShowOutlookModal(true);
                                    } else if (
                                      selectedAppType === "Microsoft"
                                    ) {
                                      connectMicrosoftAccount();
                                    } else if (selectedAppType === "Gmail") {
                                      setShowGmailModal(true);
                                    } else {
                                      toast.error(
                                        "Please select an application type first.",
                                      );
                                    }
                                  }}
                                  className={`absolute right-0 top-0 bottom-0 px-4 text-xs font-semibold rounded-r-[8px] border-l transition-all duration-200 ${
                                    selectedAppType
                                      ? "bg-[#111111] text-white border-l-zinc-300 hover:bg-zinc-800"
                                      : "bg-zinc-200 text-zinc-400 border-l-zinc-300 cursor-not-allowed"
                                  }`}
                                >
                                  Add
                                </button>
                              </div>

                              <p className="text-xs text-gray-500 mt-2">
                                Choose the application type and click <b>Add</b>{" "}
                                to connect a new account.
                              </p>
                            </div>

                            {selectedAppType && (
                              <div>
                                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                                  Connection{" "}
                                  <span className="text-red-500">*</span>
                                </label>

                                <div className="flex items-center border border-zinc-300 rounded-[8px] px-2 py-1.5 bg-white focus-within:border-zinc-900 transition">
                                  <select
                                    value={selectedConnection}
                                    onChange={(e) => {
                                      setSelectedConnection(e.target.value);
                                      setIsScenarioUpdated(false);
                                    }}
                                    className="flex-1 border-none outline-none text-xs bg-transparent"
                                  >
                                    <option value="">
                                      -- Select Connection --
                                    </option>
                                    {connections
                                      .filter((c) =>
                                        matchesAppType(c, selectedAppType),
                                      )
                                      .map((c) => (
                                        <option key={c._id} value={c._id}>
                                          {providerLabel(c.provider)} -{" "}
                                          {c.email}
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
                                className="ml-2 border border-zinc-300 text-zinc-700 hover:bg-zinc-100 rounded-[6px] px-2.5 py-1 text-[11px] font-semibold transition"
                              >
                                Add
                              </button> */}
                                </div>
                              </div>
                            )}

                            <div>
                              <div>
                                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
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
                                    className="w-full border border-zinc-200 rounded-[8px] px-3 py-2 pr-20 text-xs text-zinc-700 bg-zinc-100/80 outline-none cursor-not-allowed"
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
                                        toast.info(
                                          "No template selected to view.",
                                        );
                                      }
                                    }}
                                    disabled={
                                      !selectedTemplate &&
                                      !selectedApp?.defaultTemplate
                                    }
                                    className={`absolute right-0 top-0 bottom-0 px-4 text-xs font-semibold rounded-r-[8px] border-l transition-all duration-200 ${
                                      selectedTemplate ||
                                      selectedApp?.defaultTemplate
                                        ? "bg-[#111111] text-white border-l-zinc-300 hover:bg-zinc-800"
                                        : "bg-zinc-200 text-zinc-400 border-l-zinc-300 cursor-not-allowed"
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
                              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                                To
                              </label>
                              <div className="border border-zinc-200 rounded-[8px] px-3 py-2 text-xs text-zinc-700 bg-zinc-100/80">
                                <div className="flex flex-wrap gap-2">
                                  <span className="bg-zinc-100 text-zinc-700 border border-zinc-200 px-2.5 py-0.5 rounded-full text-[11px] font-medium flex items-center">
                                    Sender Email Address
                                    <span className="ml-2 text-gray-400 text-xs">
                                      (Sender)
                                    </span>
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                                Subject{" "}
                                <span className="text-xs text-gray-500">
                                  (Optional)
                                </span>
                              </label>

                              <input
                                type="text"
                                value={subject}
                                onChange={(e) => {
                                  setSubject(e.target.value);
                                  setIsScenarioUpdated(false);
                                }}
                                placeholder="Enter custom subject"
                                className="w-full border border-zinc-300 rounded-[8px] px-3 py-2 text-xs text-zinc-800 bg-white outline-none focus:border-zinc-900 transition"
                              />

                              <p className="text-xs text-gray-500 mt-2">
                                Add a subject only if you want to send the email
                                with a custom subject. Leave it empty to use the
                                same subject from the incoming lead email.
                              </p>
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                                CC{" "}
                                <span className="text-xs text-gray-500">
                                  (Optional)
                                </span>
                              </label>
                              <div className="border border-zinc-300 rounded-[8px] px-3 py-2 bg-white focus-within:border-zinc-900 transition">
                                <div className="flex flex-wrap gap-2 mb-2">
                                  {ccList.map((email, index) => (
                                    <span
                                      key={index}
                                      className="bg-zinc-100 text-zinc-700 border border-zinc-200 px-2.5 py-0.5 rounded-full text-[11px] font-medium flex items-center"
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
                                  className="w-full outline-none text-xs bg-transparent"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                                BCC{" "}
                                <span className="text-xs text-gray-500">
                                  (Optional)
                                </span>
                              </label>
                              <div className="border border-zinc-300 rounded-[8px] px-3 py-2 bg-white focus-within:border-zinc-900 transition">
                                <div className="flex flex-wrap gap-2 mb-2">
                                  {bccList.map((email, index) => (
                                    <span
                                      key={index}
                                      className="bg-zinc-100 text-zinc-700 border border-zinc-200 px-2.5 py-0.5 rounded-full text-[11px] font-medium flex items-center"
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
                                  className="w-full outline-none text-xs bg-transparent"
                                />
                              </div>
                            </div>
                          </>
                        )}
                      </div>

                      <div className="px-5 py-3 border-t border-zinc-200 bg-zinc-50 flex justify-end space-x-2.5 shrink-0">
                        <button
                          onClick={resetForm}
                          className="px-4 py-2 border border-zinc-300 text-zinc-700 rounded-[8px] hover:bg-zinc-100 text-xs font-semibold transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSave}
                          className="px-5 py-2 bg-[#111111] text-white rounded-[8px] hover:bg-zinc-800 text-xs font-semibold transition-colors"
                        >
                          Save Module
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {showIncomingLeadsModal && (
              <div
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                {...incomingLeadsDismiss.backdropProps}
              >
                <div
                  className="bg-white rounded-[8px] w-full max-w-[460px] max-h-[85vh] overflow-hidden border flex flex-col"
                  {...incomingLeadsDismiss.panelProps}
                >
                  <div className="px-5 py-3.5 bg-[#111111] text-white flex justify-between items-center shrink-0">
                    <div>
                      <h3 className="font-bold text-sm">Incoming Leads</h3>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        Configure incoming email trigger & connection
                      </p>
                    </div>
                    <button
                      onClick={() => setShowIncomingLeadsModal(false)}
                      className="text-zinc-400 hover:text-white p-1 rounded-[8px] transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto no-scrollbar">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                        Select Application{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          value={incomingLeadsAppType}
                          onChange={(e) => {
                            setIncomingLeadsAppType(e.target.value);
                            fetchConnections();
                            fetchMailhooks();
                          }}
                          className="w-full border border-zinc-300 rounded-[8px] px-3 py-2 pr-20 text-xs text-zinc-800 focus:ring-2 focus:ring-zinc-900 focus:border-transparent bg-white outline-none appearance-none"
                        >
                          <option value="Gmail">
                            Gmail / Google Workspace
                          </option>
                          <option value="Microsoft">
                            Outlook / Live / Microsoft 365
                          </option>
                          <option value="Email">Other Email</option>
                          <option value="Mailhook">
                            Mailhook (Forwarded Email)
                          </option>
                        </select>
                        <button
                          onClick={() => {
                            if (incomingLeadsAppType === "Email") {
                              setShowOutlookModal(true);
                            } else if (incomingLeadsAppType === "Microsoft") {
                              connectMicrosoftAccount();
                            } else if (incomingLeadsAppType === "Mailhook") {
                              setShowMailhookModal(true);
                            } else {
                              setShowGmailModal(true);
                            }
                          }}
                          className="absolute right-0 top-0 bottom-0 px-4 text-xs font-semibold rounded-r-[8px] border-l bg-[#111111] text-white border-l-zinc-300 hover:bg-zinc-800 transition-all duration-200"
                        >
                          Add
                        </button>
                      </div>
                      <p className="text-[11px] text-zinc-500 mt-1.5">
                        Choose the application type and click <b>Add</b> to
                        connect a new account.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                        Connection <span className="text-red-500">*</span>
                      </label>
                      {incomingLeadsAppType === "Mailhook" ? (
                        <>
                          <select
                            value={incomingLeadsMailhook}
                            onChange={(e) =>
                              setIncomingLeadsMailhook(e.target.value)
                            }
                            className="w-full border border-zinc-300 rounded-[8px] px-3 py-2 text-xs text-zinc-800 focus:ring-2 focus:ring-zinc-900 focus:border-transparent bg-white outline-none"
                          >
                            <option value="">-- Select Mailhook --</option>
                            {mailhooks
                              .filter((m) => m.connectionVerified)
                              .map((m) => (
                                <option key={m._id} value={m._id}>
                                  MAILHOOK - {m.forwardingEmail || m.mailhook}
                                </option>
                              ))}
                          </select>
                          <p className="text-[11px] text-zinc-500 mt-1.5">
                            {mailhooks.filter((m) => m.connectionVerified)
                              .length === 0
                              ? "No verified mailhook yet — click Add to set one up and confirm forwarding."
                              : "Leads forwarded to this mailhook address will trigger the scenario."}
                          </p>
                        </>
                      ) : (
                        <select
                          value={
                            incomingLeadsConnection || selectedConnection || ""
                          }
                          onChange={(e) => {
                            setIncomingLeadsConnection(e.target.value);
                            setSelectedConnection(e.target.value);
                          }}
                          className="w-full border border-zinc-300 rounded-[8px] px-3 py-2 text-xs text-zinc-800 focus:ring-2 focus:ring-zinc-900 focus:border-transparent bg-white outline-none"
                        >
                          <option value="">-- Select Connection --</option>
                          {connections
                            .filter((c) =>
                              matchesAppType(c, incomingLeadsAppType),
                            )
                            .map((c) => (
                              <option key={c._id} value={c._id}>
                                {providerLabel(c.provider)} - {c.email}
                              </option>
                            ))}
                        </select>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                        Subject Filter
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={
                          incomingLeadsSubjectFilter ||
                          platformTriggerSubject ||
                          "Loading trigger subject..."
                        }
                        className="w-full border border-zinc-200 rounded-[8px] px-3 py-2 bg-zinc-100 text-zinc-700 text-xs font-medium outline-none cursor-not-allowed"
                      />
                      {!incomingLeadsSubjectFilter &&
                        platformTriggerSubject && (
                          <p className="text-[11px] text-zinc-500 mt-1.5">
                            Set platform-wide by your administrator.
                          </p>
                        )}
                      <p className="text-[11px] text-amber-700 font-medium mt-1.5 flex items-center gap-1">
                        <span>💡</span>
                        <span>
                          Do not add "Re:", "Fw:", or any prefix at the start of
                          the subject.
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="px-5 py-3 border-t border-zinc-200 bg-zinc-50 flex justify-end space-x-2.5 shrink-0">
                    <button
                      onClick={() => setShowIncomingLeadsModal(false)}
                      className="px-4 py-2 border border-zinc-300 text-zinc-700 rounded-[8px] hover:bg-zinc-100 text-xs font-semibold transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        const chosenConn =
                          incomingLeadsConnection || selectedConnection;
                        if (chosenConn) {
                          setIncomingLeadsConnection(chosenConn);
                          setSelectedConnection(chosenConn);
                        }
                        setShowIncomingLeadsModal(false);
                        handleSaveScenario();
                      }}
                      className="px-5 py-2 bg-[#111111] text-white rounded-[8px] hover:bg-zinc-800 text-xs font-semibold transition-colors"
                    >
                      Save Module
                    </button>
                  </div>
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
            <MailhookConnectionModal
              isOpen={showMailhookModal}
              onClose={() => {
                setShowMailhookModal(false);
                fetchMailhooks();
              }}
              user={{
                _id: localStorage.getItem("userid"),
                mailhook: user?.mailhook,
              }}
              onMailhookUpdated={fetchMailhooks}
            />
            <WebhookModal
              showWebhookInfo={showWebhookInfo}
              setShowWebhookInfo={setShowWebhookInfo}
              webhookUrl={webhookUrl}
              loading={loading}
            />
            <SetupOtherSMTPModal
              isOpen={showSMTPModal}
              onClose={() => setShowSMTPModal(false)}
              onSuccess={(data) => {
                setShowSMTPModal(false);
                fetchConnections();
              }}
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
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
          onClick={() => setShowRunTestModal(false)}
        >
          <div
            className="bg-white rounded-[12px] shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden flex flex-col transform animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Dark Top Header Bar */}
            <div className="flex justify-between items-center bg-[#111110] text-white px-6 py-4">
              <div>
                <h2 className="text-base font-bold text-white">
                  Contact {user?.fullName || "Support Team"}
                </h2>
                <p className="text-xs text-slate-300 mt-0.5 font-normal">
                  Fill out the details below to run a test scenario.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowRunTestModal(false)}
                className="text-slate-400 hover:text-white transition cursor-pointer p-1"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Business Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.businessEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, businessEmail: e.target.value })
                  }
                  placeholder="Enter your business email"
                  className="w-full border border-slate-300 rounded-[8px] px-3.5 py-2 text-xs font-medium text-slate-900 focus:border-slate-800 focus:ring-0 outline-none shadow-2xs transition"
                />
              </div>

              {/* Store Name (disabled, prefilled) */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Store Name
                </label>
                <input
                  type="text"
                  value={formData.storeName || "Dummy Store"}
                  disabled
                  className="w-full border border-slate-200 rounded-[8px] px-3.5 py-2 bg-slate-100/80 text-xs font-medium text-slate-500 cursor-not-allowed"
                />
              </div>

              {/* Country (disabled, prefilled) */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Country
                </label>
                <input
                  type="text"
                  value={formData.country || "USA"}
                  disabled
                  className="w-full border border-slate-200 rounded-[8px] px-3.5 py-2 bg-slate-100/80 text-xs font-medium text-slate-500 cursor-not-allowed"
                />
              </div>

              {/* Service (editable) */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Select a Service Offered by {user?.name || "the team"}
                </label>
                <select
                  value={formData.service}
                  onChange={(e) =>
                    setFormData({ ...formData, service: e.target.value })
                  }
                  className="w-full border border-slate-300 rounded-[8px] px-3.5 py-2 text-xs font-medium text-slate-900 focus:border-slate-800 focus:ring-0 outline-none shadow-2xs transition"
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
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Budget (USD)
                </label>
                <input
                  type="number"
                  value={formData.budget || 10000}
                  disabled
                  className="w-full border border-slate-200 rounded-[8px] px-3.5 py-2 bg-slate-100/80 text-xs font-medium text-slate-500 cursor-not-allowed"
                />
              </div>

              {/* Description (editable) */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Description
                </label>
                <textarea
                  rows="4"
                  value={formData.description || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Describe your project, problem, or goal..."
                  className="w-full border border-slate-300 rounded-[8px] px-3.5 py-2 text-xs font-medium text-slate-900 resize-none focus:border-slate-800 focus:ring-0 outline-none shadow-2xs transition"
                ></textarea>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-200 px-6 py-4 bg-slate-50 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowRunTestModal(false)}
                className="px-5 py-2.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-[8px] hover:bg-slate-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
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
                className="px-5 py-2.5 text-xs font-bold text-white bg-[#111110] hover:bg-black rounded-[8px] transition cursor-pointer shadow-xs"
              >
                Generate Test Email
              </button>
            </div>
          </div>
        </div>
      )}
      {showTemplateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[8px]  flex flex-col overflow-hidden border  max-w-3xl w-full max-h-[85vh]">
            <div className="flex justify-between items-center px-5 py-4 bg-[#111111] text-white">
              <div>
                <h2 className="text-sm font-bold">Templates Overview</h2>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Showing active templates for General
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={
                        templateList.length > 0 &&
                        templateList.every((t) => t.active)
                      }
                      onChange={async (e) => {
                        const newStatus = e.target.checked;
                        const updates = templateList.map((t) =>
                          apiFetch(
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

                        /*
                         * Only mark locally what the server accepted. This
                         * used to set every row regardless, so protected
                         * templates appeared to switch off and reverted on
                         * the next open.
                         */
                        const results = await Promise.all(
                          updates.map((req) =>
                            req
                              .then((r) => r.json())
                              .catch(() => ({ success: false })),
                          ),
                        );

                        const rejected = results.filter(
                          (r) => !r?.success,
                        ).length;

                        setTemplateList((prev) =>
                          prev.map((tpl) =>
                            !newStatus && isProtectedTemplate(tpl)
                              ? tpl
                              : { ...tpl, active: newStatus },
                          ),
                        );

                        if (rejected > 0) {
                          toast(
                            `${rejected} template${rejected > 1 ? "s" : ""} kept on — General templates are the fallback and cannot be switched off.`,
                            { icon: "ℹ️", duration: 6000 },
                          );
                        }
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-zinc-600 rounded-full peer peer-checked:bg-[#34A853] transition-colors"></div>
                    <div className="absolute left-[2px] top-[2px] w-4 h-4 bg-white rounded-full shadow-md transition-transform peer-checked:translate-x-4"></div>
                  </label>

                  <span
                    className={`text-xs font-semibold ${
                      templateList.length > 0 &&
                      templateList.every((t) => t.active)
                        ? "text-emerald-400"
                        : "text-zinc-400"
                    }`}
                  >
                    {templateList.length > 0 &&
                    templateList.every((t) => t.active)
                      ? "ON"
                      : "OFF"}
                  </span>
                </div>

                {/* Close Button */}
                <button
                  onClick={() => setShowTemplateModal(false)}
                  className="text-zinc-400 hover:text-white p-1 rounded-[8px] transition"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-5 overflow-y-auto flex-1 bg-zinc-50 min-h-[250px]">
              {/*
                How this scenario writes its replies. Sits above the list
                because it decides whether the templates below are sent as
                written or used as background for the AI.
              */}
              <div className="mb-4 rounded-[10px] border border-zinc-200 bg-white p-4">
                <h3 className="text-xs font-bold text-zinc-900">
                  How replies are written
                </h3>

                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {[
                    {
                      id: "manual",
                      label: "Normal templates",
                      hint: "Sends the templates below exactly as written.",
                    },
                    {
                      id: "ai",
                      label: "AI templates",
                      hint: "The AI writes each reply from a company profile.",
                    },
                  ].map((opt) => (
                    <label
                      key={opt.id}
                      className={`cursor-pointer rounded-[8px] border p-3 transition ${
                        scenarioReplyMode === opt.id
                          ? "border-zinc-900 bg-zinc-50"
                          : "border-zinc-200 bg-white hover:border-zinc-400"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="scenarioReplyMode"
                          checked={scenarioReplyMode === opt.id}
                          onChange={() => setScenarioReplyMode(opt.id)}
                          className="h-3.5 w-3.5 cursor-pointer"
                        />
                        <span className="text-xs font-bold text-zinc-800">
                          {opt.label}
                        </span>
                      </span>
                      <span className="mt-1 block text-[10px] leading-relaxed text-zinc-500">
                        {opt.hint}
                      </span>
                    </label>
                  ))}
                </div>

                {scenarioReplyMode === "ai" && (
                  <div className="mt-3">
                    <label className="block text-[11px] font-bold text-zinc-700 mb-1.5">
                      Company profile <span className="text-red-500">*</span>
                    </label>

                    <select
                      value={scenarioProfileId}
                      onChange={(e) => setScenarioProfileId(e.target.value)}
                      className="w-full rounded-[8px] border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-800 outline-none focus:border-zinc-900 transition"
                    >
                      <option value="">-- Choose a profile --</option>
                      {companyProfiles.map((profile) => (
                        <option key={profile._id} value={profile._id}>
                          {profile.name}
                          {profile.isDefault ? " (default)" : ""}
                          {profile.isComplete ? "" : " — incomplete"}
                        </option>
                      ))}
                    </select>

                    {companyProfiles.length === 0 && (
                      <div className="mt-2 rounded-[8px] border border-amber-200 bg-amber-50 p-3">
                        <p className="text-[11px] font-semibold text-amber-800">
                          No company profiles yet
                        </p>
                        <p className="mt-0.5 text-[11px] text-amber-700">
                          The AI needs one to know what your business does.
                        </p>
                        <button
                          type="button"
                          onClick={() =>
                            window.open("/company-profile", "_blank")
                          }
                          className="mt-2 rounded-full bg-[#111111] px-3 py-1.5 text-[11px] font-bold text-white transition hover:bg-zinc-800"
                        >
                          Create a profile
                        </button>
                      </div>
                    )}

                    {/*
                      An incomplete profile is the failure the user would
                      otherwise discover from a lead receiving an empty,
                      generic reply.
                    */}
                    {selectedScenarioProfile &&
                      !selectedScenarioProfile.isComplete && (
                        <div className="mt-2 rounded-[8px] border border-amber-200 bg-amber-50 p-3">
                          <p className="text-[11px] font-semibold text-amber-800">
                            "{selectedScenarioProfile.name}" is incomplete
                          </p>
                          <p className="mt-0.5 text-[11px] text-amber-700">
                            It needs a company name and business description
                            before the AI can write from it.
                          </p>
                          <button
                            type="button"
                            onClick={() =>
                              window.open(
                                `/company-profile?profile=${selectedScenarioProfile._id}`,
                                "_blank",
                              )
                            }
                            className="mt-2 rounded-full bg-[#111111] px-3 py-1.5 text-[11px] font-bold text-white transition hover:bg-zinc-800"
                          >
                            Complete this profile
                          </button>
                        </div>
                      )}

                    {selectedScenarioProfile?.isComplete &&
                      !selectedScenarioProfile.hasContext && (
                        <p className="mt-2 text-[11px] text-zinc-500">
                          Tip: adding services, FAQs or a knowledge base to
                          this profile gives the AI more to work with.
                        </p>
                      )}
                  </div>
                )}

                <button
                  type="button"
                  onClick={applyScenarioReplyMode}
                  disabled={applyingReplyMode}
                  className={`mt-3 w-full rounded-[8px] px-4 py-2 text-xs font-bold text-white transition ${
                    applyingReplyMode
                      ? "bg-zinc-400 cursor-wait"
                      : "bg-[#111111] hover:bg-black"
                  }`}
                >
                  {applyingReplyMode ? "Saving..." : "Apply to this scenario"}
                </button>
              </div>

              {/*
                The template list is only meaningful in Normal mode. Under
                AI the reply is written from the company profile, so the
                templates below would not be sent and showing them implies
                otherwise.
              */}
              {scenarioReplyMode === "ai" ? null : loadingTemplates ? (
                <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
                  <div className="animate-spin rounded-full h-7 w-7 border-2 border-zinc-900 border-t-transparent mb-3"></div>
                  <p className="text-xs font-medium">Loading templates...</p>
                </div>
              ) : templateList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
                  <p className="text-xs font-medium text-zinc-600">
                    No templates found for this service.
                  </p>
                </div>
              ) : (
                <table className="w-full border-collapse text-xs bg-white rounded-[8px] border border-zinc-200 overflow-hidden shadow-2xs">
                  <thead className="sticky top-0 bg-zinc-100 border-b border-zinc-200 z-10">
                    <tr className="text-zinc-700 text-left">
                      <th className="p-3 w-[25%] font-bold">Service</th>
                      <th className="p-3 w-[45%] font-bold">Template</th>
                      <th className="p-3 text-center w-[15%] font-bold">
                        Status
                      </th>
                      <th className="p-3 text-center w-[15%] font-bold">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-zinc-100">
                    {templateList.map((t, i) => (
                      <React.Fragment key={t._id || i}>
                        {i === 0 ||
                        templateList[i - 1]?.service !== t.service ? (
                          <tr className="bg-zinc-100/70 border-t border-zinc-200">
                            <td
                              colSpan={4}
                              className="p-2.5 text-zinc-900 font-bold text-[11px] uppercase tracking-wider"
                            >
                              {t.service || "General Service"}
                            </td>
                          </tr>
                        ) : null}

                        <tr
                          className={`transition-colors ${
                            !t.active ? "bg-red-50/50" : "hover:bg-zinc-50"
                          }`}
                        >
                          <td className="p-3 font-medium text-zinc-800">
                            {t.service || "General"}
                            {!t.active && (
                              <span className="ml-2 text-red-600 text-[10px] font-bold">
                                ✗ Inactive
                              </span>
                            )}
                            {isProtectedTemplate(t) && t.active && (
                              <span
                                title="Every lead that matches no other service falls back to General, so it stays on."
                                className="ml-2 rounded-full border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-zinc-500"
                              >
                                Required
                              </span>
                            )}
                          </td>

                          <td className="p-3 text-zinc-700 font-medium">
                            {t.name || "Template"}
                          </td>

                          <td className="p-3 text-center">
                            <label className="relative inline-flex items-center justify-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={Boolean(t.active)}
                                disabled={isProtectedTemplate(t) && t.active}
                                onChange={async () => {
                                  const newStatus = !t.active;

                                  setTemplateList((prev) =>
                                    prev.map((tpl) =>
                                      tpl._id === t._id
                                        ? { ...tpl, active: newStatus }
                                        : tpl,
                                    ),
                                  );

                                  const ok = await handleToggleTemplate(
                                    t._id,
                                    newStatus,
                                  );

                                  /* Put the row back if the server said no. */
                                  if (!ok) {
                                    setTemplateList((prev) =>
                                      prev.map((tpl) =>
                                        tpl._id === t._id
                                          ? { ...tpl, active: t.active }
                                          : tpl,
                                      ),
                                    );
                                  }
                                }}
                                className="sr-only peer disabled:cursor-not-allowed"
                              />
                              <div className="w-9 h-5 bg-zinc-300 rounded-full peer peer-checked:bg-[#34A853] peer-disabled:opacity-50 transition-colors"></div>
                              <div className="absolute left-[2px] top-[2px] w-4 h-4 bg-white rounded-full shadow-md transition-transform peer-checked:translate-x-4"></div>
                            </label>
                          </td>

                          <td className="p-3 text-center">
                            <button
                              onClick={() => {
                                setEditingTemplate(t);
                                setEditContent(t.body || t.content || "");
                                setShowTemplateModal(false);
                                setShowEditTemplateModal(true);
                              }}
                              className="px-3 py-1 bg-[#111111] hover:bg-zinc-800 text-white text-[11px] rounded-[8px] font-semibold transition-colors"
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
            {scenarioReplyMode !== "ai" && (
            <div className="border-t border-zinc-200 bg-white p-3 text-center">
              <button
                onClick={() => {
                  /*
                   * "Shopify Partner Directory" used to be the fallback
                   * here, but that is a trigger subject, not a service —
                   * no template carries it, so the templates page filtered
                   * to nothing and reported no matches. And since
                   * selectedServiceForTemplates is never set, the fallback
                   * ran every time.
                   *
                   * "View more services" means widen, so with no specific
                   * service in play the unfiltered page is the right target.
                   */
                  const srv = (selectedServiceForTemplates || "").trim();

                  window.open(
                    srv
                      ? `/templates?service=${encodeURIComponent(srv)}`
                      : "/templates",
                    "_blank",
                  );
                }}
                className="text-xs text-zinc-900 font-semibold underline hover:text-zinc-700 transition"
              >
                View More Services Templates
              </button>
            </div>
            )}
          </div>
        </div>
      )}

      {/* SINGLE CLEAN EDIT TEMPLATE MODAL */}
      {showEditTemplateModal && editingTemplate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
          onMouseDown={() => setShowInsertFields(false)}
        >
          <div
            onMouseDown={(e) => e.stopPropagation()}
            className="relative flex w-full max-w-2xl max-h-[85vh] flex-col overflow-hidden rounded-[8px] border  bg-white "
          >
            <div className="flex shrink-0 items-center justify-between bg-[#111111] px-5 py-3.5 text-white">
              <div>
                <h2 className="text-sm font-bold">
                  Edit Template —{" "}
                  {editingTemplate?.name || "Initial Email Response"}
                </h2>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Customize your email template content and dynamic fields
                </p>
              </div>

              <button
                onClick={() => {
                  setShowEditTemplateModal(false);
                  setEditingTemplate(null);
                  setShowInsertFields(false);
                  setShowTemplateModal(true);
                }}
                className="text-zinc-400 hover:text-white p-1 rounded-[8px] transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="relative flex-1 overflow-y-auto bg-zinc-50 p-5 no-scrollbar">
              <label className="mb-2 block text-xs font-semibold text-zinc-700">
                Template Content
              </label>

              <div className="rounded-[8px] bg-white border border-zinc-200 overflow-hidden shadow-2xs">
                <ReactQuill
                  ref={quillRef}
                  theme="snow"
                  value={editContent}
                  onChange={setEditContent}
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
              </div>

              <div className="mt-4 rounded-[8px] border border-zinc-200 bg-white p-3.5 shadow-2xs">
                <p className="text-xs font-bold text-zinc-800 mb-2">
                  Insert Field Placeholders
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "first_name",
                    "business_email",
                    "store_name",
                    "store_url",
                    "country",
                    "service",
                    "budget",
                  ].map((field) => (
                    <button
                      key={field}
                      type="button"
                      onClick={() => {
                        const editor = quillRef.current?.getEditor();
                        if (!editor) return;
                        const placeholder = `{{${field}}}`;
                        const range = editor.getSelection(true);
                        const index = range ? range.index : editor.getLength();
                        editor.insertText(index, placeholder);
                        editor.setSelection(index + placeholder.length);
                      }}
                      className="rounded-full bg-zinc-100 px-3 py-1 text-[11px] font-semibold text-zinc-800 hover:bg-zinc-900 hover:text-white transition-colors"
                    >
                      +{field}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="shrink-0 flex justify-end gap-2.5 border-t border-zinc-200 bg-zinc-50 px-5 py-3">
              <button
                onClick={() => {
                  setShowEditTemplateModal(false);
                  setEditingTemplate(null);
                  setShowInsertFields(false);
                  setShowTemplateModal(true);
                }}
                className="rounded-[8px] border border-zinc-300 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={async () => {
                  try {
                    const userId = localStorage.getItem("userid");
                    setTemplateList((prev) =>
                      prev.map((tpl) =>
                        tpl._id === editingTemplate._id
                          ? { ...tpl, body: editContent, content: editContent }
                          : tpl,
                      ),
                    );

                    await apiFetch(
                      `https://email-syncing-backend.vercel.app/template/update/${editingTemplate._id}`,
                      {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          userId,
                          service: "General",
                          name: editingTemplate?.name,
                          subject: editingTemplate?.subject,
                          body: editContent,
                          content: editContent,
                        }),
                      },
                    );

                    toast.success("Template updated in database successfully!");
                  } catch (err) {
                    console.error("Error updating template in DB:", err);
                    toast.success("Template updated successfully!");
                  } finally {
                    setShowEditTemplateModal(false);
                    setEditingTemplate(null);
                    setShowInsertFields(false);
                    setShowTemplateModal(true);
                  }
                }}
                className="rounded-[8px] bg-[#111111] px-5 py-2 text-xs font-semibold text-white hover:bg-zinc-800 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {showServiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4 backdrop-blur-sm">
          <div className="flex w-full max-w-6xl max-h-[90vh] gap-4 p-4">
            <div
              className={`flex w-full max-w-[90rem] max-h-[90vh] p-6 transition-all duration-500`}
            >
              <div
                className={`flex flex-col overflow-hidden rounded-2xl border border-[#E0E7FF] bg-white shadow-2xl transition-all duration-500 max-w-[70rem]`}
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
                                : "Please wait, templates are being deactivated...",
                            );

                            try {
                              const res = await apiFetch(
                                `https://email-syncing-backend.vercel.app/template/templatestatus/all`,
                                {
                                  method: "PATCH",
                                  headers: {
                                    "Content-Type": "application/json",
                                  },
                                  body: JSON.stringify({ userId }),
                                },
                              );

                              const data = await res.json();

                              if (data.success) {
                                setServiceGroups((prev) =>
                                  prev.map((grp) => ({
                                    ...grp,
                                    templates: grp.templates.map((tpl) =>
                                      tpl.service.toLowerCase() === "general"
                                        ? { ...tpl, active: true }
                                        : { ...tpl, active: data.toggledTo },
                                    ),
                                  })),
                                );

                                setAllTemplatesActive(data.toggledTo);

                                toast.success(
                                  data.toggledTo
                                    ? "All templates have been activated successfully!"
                                    : "All templates have been deactivated successfully!",
                                  { id: toastId },
                                );
                              } else {
                                toast.error(
                                  data.message || "Failed to update templates.",
                                  { id: toastId },
                                );
                              }
                            } catch (err) {
                              console.error("Error toggling templates:", err);
                              toast.error(
                                "Something went wrong while updating templates.",
                                { id: toastId },
                              );
                            }
                          }}
                          className="sr-only peer"
                        />

                        <div className="h-6 w-11 rounded-full bg-[#E0E7FF] transition-colors peer-checked:bg-[#8A8CF4]" />
                        <div className="absolute left-[2px] top-[2px] h-5 w-5 rounded-full bg-white shadow-md transition-transform peer-checked:translate-x-5" />
                      </label>

                      <span
                        className={`text-xs font-semibold ${
                          serviceGroups.every((grp) =>
                            grp.templates.every((t) => t.active),
                          )
                            ? "text-[#5B5FD6]"
                            : "text-slate-400"
                        }`}
                      >
                        {serviceGroups.every((grp) =>
                          grp.templates.every((t) => t.active),
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
                      .filter(
                        (group) => group.service.toLowerCase() === "general",
                      )
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
                                <b className="text-slate-900">Note:</b> Activate
                                your service-specific templates to send
                                personalized emails. Otherwise, the system will
                                use{" "}
                                <b className="text-[#5B5FD6]">
                                  General templates
                                </b>
                                .
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
                                    className={`border-t border-[#EEF2FF] transition-colors ${
                                      t.active
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
                                                templates: grp.templates.map(
                                                  (tpl) =>
                                                    tpl._id === t._id
                                                      ? {
                                                          ...tpl,
                                                          active: newStatus,
                                                        }
                                                      : tpl,
                                                ),
                                              })),
                                            );

                                            await apiFetch(
                                              `https://email-syncing-backend.vercel.app/template/status/${t._id}`,
                                              {
                                                method: "PATCH",
                                                headers: {
                                                  "Content-Type":
                                                    "application/json",
                                                },
                                                body: JSON.stringify({
                                                  active: newStatus,
                                                }),
                                              },
                                            );
                                          }}
                                          className="sr-only peer"
                                        />
                                        <div className="h-6 w-11 rounded-full bg-[#E0E7FF] transition-colors peer-checked:bg-[#8A8CF4]" />
                                        <div className="absolute left-[2px] top-[2px] h-5 w-5 rounded-full bg-white shadow-md transition-transform peer-checked:translate-x-5" />
                                      </label>
                                    </td>

                                    <td className="p-3 text-center text-slate-500">
                                      {new Date(t.updatedAt).toLocaleString(
                                        "en-US",
                                        {
                                          year: "numeric",
                                          month: "short",
                                          day: "2-digit",
                                          hour: "2-digit",
                                          minute: "2-digit",
                                          hour12: true,
                                        },
                                      )}
                                    </td>

                                    <td className="p-3 text-center">
                                      <button
                                        onClick={() => {
                                          setEditingTemplate(t);
                                          setEditContent(t.content || "");
                                          setShowServiceModal(false);
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
            </div>
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
                        ) : !isConnectionUsable(conn) ? (
                          /* Connected once, but the grant is gone now. */
                          <span
                            title={connectionProblem(conn)}
                            className="text-red-600 text-sm font-semibold flex items-center gap-1"
                          >
                            {conn.status === "reauth_required"
                              ? "Sign-in expired"
                              : "Disconnected"}
                          </span>
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
                                const res = await apiFetch(
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl overflow-hidden rounded-2xl border border-[#E0E7FF] bg-white shadow-2xl"
          >
            <div className="border-b border-[#E0E7FF] bg-[#F5F7FF] px-5 py-4">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#E0E7FF] text-lg font-bold text-[#7375E8]">
                  !
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-800">
                    {nothingWillBeSent
                      ? "No active Initial Email template"
                      : "Initial Email template is inactive"}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {nothingWillBeSent
                      ? "This test sends the Initial Email, and neither this service nor General has an active one."
                      : "This test sends the Initial Email, and this service does not have an active one."}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4 px-6 py-5">
              <div className="rounded-xl border border-[#E0E7FF] bg-[#F8FAFF] p-4">
                {nothingWillBeSent ? (
                  <p className="text-sm leading-relaxed text-slate-700">
                    Neither{" "}
                    <b className="font-semibold text-slate-900">
                      {inactiveTemplateService}
                    </b>{" "}
                    nor{" "}
                    <b className="font-semibold text-[#7375E8]">General</b> has
                    an active{" "}
                    <b className="font-semibold text-slate-900">Initial Email</b>{" "}
                    template, so continuing sends{" "}
                    <b className="font-semibold text-slate-900">no reply at all</b>.
                  </p>
                ) : (
                  <p className="text-sm leading-relaxed text-slate-700">
                    The{" "}
                    <b className="font-semibold text-slate-900">
                      Initial Email
                    </b>{" "}
                    template for{" "}
                    <b className="font-semibold text-slate-900">
                      {inactiveTemplateService}
                    </b>{" "}
                    is inactive, so this test will use your{" "}
                    <b className="font-semibold text-[#7375E8]">
                      General Initial Email
                    </b>{" "}
                    instead.
                  </p>
                )}
              </div>

              <p className="text-xs leading-relaxed text-slate-500">
                Activate this service&apos;s Initial Email template if you want
                the test customised for it. Each email type is activated
                separately — the follow-up templates do not affect this test,
                which only sends the initial reply.
              </p>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-[#E0E7FF] bg-[#FAFBFF] p-4 sm:flex-row sm:justify-end">
              <button
                onClick={() => {
                  setShowInactiveTemplateConfirm(false);
                  window.open(
                    `/templates?service=${encodeURIComponent(inactiveTemplateService)}`,
                    "_blank",
                  );
                }}
                className="rounded-lg border border-[#C7D2FE] bg-white px-4 py-2 text-sm font-medium text-[#5B5FD6] transition hover:bg-[#EEF2FF]"
              >
                Activate Service Templates
              </button>

              <button
                onClick={() => {
                  setShowInactiveTemplateConfirm(false);
                  /*
                   * Both flags, not just the first.
                   *
                   * handleRunTest(skipInactiveTemplateCheck, useGeneralTemplate)
                   * — this called handleRunTest(true), which only silenced the
                   * warning it had just been shown and left useGeneralTemplate
                   * false. The run then went back to normal service resolution,
                   * so the button did not do what it says: with the service's
                   * Initial Email inactive the engine fell through to General
                   * anyway and it looked right, but with it ACTIVE the button
                   * sent the service template.
                   *
                   * handleRunTestWithGeneralTemplates has passed both since it
                   * was written; it was simply never wired to anything.
                   */
                  handleRunTestWithGeneralTemplates();
                }}
                className="rounded-lg bg-[#7375E8] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#5B5FD6]"
              >
                {nothingWillBeSent
                  ? "Continue anyway"
                  : "Continue with General Templates"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Upgrade Active Scenario Modal */}
      {upgradeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-[12px] border border-slate-200 bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <button
              type="button"
              onClick={() => setUpgradeModalOpen(false)}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-[8px] text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 border border-amber-200 text-amber-700">
              <Zap className="h-5 w-5" />
            </div>

            <h2 className="mt-4 text-lg font-bold text-slate-950">
              Active Scenario Limit Reached
            </h2>

            <p className="mt-2 text-xs leading-relaxed text-slate-600">
              Your account is currently on the{" "}
              <strong className="text-slate-900">
                {user?.subscription?.plan || "Explore"}
              </strong>{" "}
              plan, which allows up to{" "}
              <strong className="text-slate-900">
                {(user?.subscription?.plan || "Explore").toLowerCase() ===
                "elevate"
                  ? 5
                  : (user?.subscription?.plan || "Explore").toLowerCase() ===
                      "unite"
                    ? 15
                    : 1}{" "}
                active scenario
              </strong>{" "}
              at a time.
            </p>

            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/60 p-4">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-950">
                <Zap className="h-4 w-4 text-amber-600" />
                Why activation is blocked
              </div>
              <p className="mt-1 text-xs leading-relaxed text-amber-900">
                To activate this scenario, please deactivate an existing active
                scenario or upgrade your plan.
              </p>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setUpgradeModalOpen(false)}
                className="h-9 rounded-lg border border-slate-300 bg-white px-4 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                Keep Current Scenarios
              </button>
              <button
                type="button"
                onClick={() => {
                  setUpgradeModalOpen(false);
                  navigate("/pricing");
                }}
                className="h-9 rounded-lg bg-slate-900 px-4 text-xs font-bold text-white transition hover:bg-black shadow-xs cursor-pointer"
              >
                Upgrade Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default ShopifyScenariosPage;

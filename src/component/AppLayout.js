import { apiFetch } from "../utils/apiClient";
import React, { useState, useEffect, useContext, useRef, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FiGrid,
  FiInbox,
  FiZap,
  FiKey,
  FiFileText,
  FiShield,
  FiBell,
  FiPlus,
  FiSettings,
  FiX,
  FiLogOut,
  FiLoader,
  FiUsers,
  FiHome,
  FiCreditCard,
  FiTool,
  FiShoppingBag,
  FiSliders,
  FiClock,
  FiCheckCircle,
  FiTrendingUp,
  FiLink,
  FiLayers,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import axios from "axios";
import { providerLabel } from "../utils/connectionProviders";
import {
  emailMatchesScenario,
  emailMatchesConnection,
} from "../utils/leadFilters";
import {
  normalizeTimeZone,
  systemTimeZone,
  timeZoneOptions,
} from "../utils/timezone";
import { UserContext } from "./UserContext";
import useModalDismiss from "../hooks/useModalDismiss";
import StatusDot from "./StatusDot";

const AppLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    user: contextUser,
    setUser: setContextUser,
    emails: contextEmails,
    setEmails: setContextEmails,
  } = useContext(UserContext);

  const [user, setUser] = useState(contextUser || null);
  const [emails, setEmails] = useState(contextEmails || []);
  const [showCreateScenarioModal, setShowCreateScenarioModal] = useState(false);
  const [showOrgSettingsModal, setShowOrgSettingsModal] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotificationsDropdown, setShowNotificationsDropdown] =
    useState(false);
  const [isSavingOrg, setIsSavingOrg] = useState(false);
  const headerRightRef = useRef(null);

  // Close header dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        headerRightRef.current &&
        !headerRightRef.current.contains(event.target)
      ) {
        setShowNotificationsDropdown(false);
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const [orgForm, setOrgForm] = useState({
    organizationName:
      contextUser?.organizationName || contextUser?.companyName || "",
    region: contextUser?.Region || contextUser?.region || "US",
    timezone:
      contextUser?.TimeZone ||
      contextUser?.timezone ||
      "(GMT-05:00) America/Toronto",
    country: contextUser?.country || "Canada",
    partnerLink: contextUser?.PartnerLink || contextUser?.partnerLink || "",
  });

  const userId = localStorage.getItem("userid") || contextUser?._id;

  // Sync with contextUser whenever context updates
  useEffect(() => {
    if (contextUser) {
      setUser(contextUser);
      if (contextUser.organizationName || contextUser.companyName) {
        setOrgForm((prev) => ({
          ...prev,
          organizationName:
            contextUser.organizationName ||
            contextUser.companyName ||
            prev.organizationName,
          region: contextUser.Region || contextUser.region || prev.region,
          timezone:
            contextUser.TimeZone || contextUser.timezone || prev.timezone,
          country: contextUser.country || prev.country,
          partnerLink:
            contextUser.PartnerLink ||
            contextUser.partnerLink ||
            prev.partnerLink,
        }));
      }
    }
  }, [contextUser]);

  const [aiActive, setAiActive] = useState(() => {
    return contextUser?.Ai ?? contextUser?.subscription?.aiRepliesActive ?? true;
  });
  const [togglingAi, setTogglingAi] = useState(false);

  useEffect(() => {
    if (contextUser) {
      const activeState = contextUser.Ai ?? contextUser.subscription?.aiRepliesActive ?? true;
      setAiActive(activeState);
    }
  }, [contextUser]);

  const handleToggleAiReplies = async () => {
    const targetUserId = userId || contextUser?._id;
    if (!targetUserId) return;

    const nextStatus = !aiActive;
    setAiActive(nextStatus);

    try {
      setTogglingAi(true);
      const res = await axios.post(`https://email-syncing-backend.vercel.app/auth/toggle-ai-replies/${targetUserId}`, {
        enabled: nextStatus,
        userId: targetUserId,
      });

      if (res.data?.user && setContextUser) {
        setContextUser(res.data.user);
      }
    } catch (err) {
      console.error("Error toggling AI replies:", err);
      try {
        await axios.patch(`https://email-syncing-backend.vercel.app/auth/user/ai`, {
          userId: targetUserId,
          enabled: nextStatus,
        });
      } catch (e) {
        console.error("Patch AI error:", e);
      }
    } finally {
      setTogglingAi(false);
    }
  };

  useEffect(() => {
    if (contextEmails && contextEmails.length > 0) {
      setEmails(contextEmails);
    }
  }, [contextEmails]);

  useEffect(() => {
    // Only fetch user if not available in UserContext
    if (!contextUser && userId) {
      fetchUser();
    }
  }, [userId, contextUser]);

  const fetchUser = async () => {
    try {
      if (!userId) return;
      const token = localStorage.getItem("usertoken");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get(
        `https://email-syncing-backend.vercel.app/auth/getUsers/${userId}`,
        { headers }
      );
      const fetchedUser = res.data?.data || contextUser || null;
      if (fetchedUser) {
        setUser(fetchedUser);
        if (setContextUser) setContextUser(fetchedUser);
        setOrgForm({
          organizationName:
            fetchedUser.organizationName ||
            fetchedUser.companyName ||
            "Organization",
          region: fetchedUser.Region || fetchedUser.region || "US",
          timezone:
            fetchedUser.TimeZone ||
            fetchedUser.timezone ||
            "(GMT-05:00) America/Toronto",
          country: fetchedUser.country || "Canada",
          partnerLink: fetchedUser.PartnerLink || fetchedUser.partnerLink || "",
        });
      }
    } catch (err) {
      console.error("Error fetching user in Layout:", err);
    }
  };

  /*
   * Organisation details and the lead list are fetched INDEPENDENTLY.
   *
   * They used to share one try block, in that order, so a failing
   * organisation request — a 404 for an account with no organisation row
   * — threw before the emails were ever requested. The sidebar then
   * rendered every count as 0 while the inbox page, which fetches the
   * same endpoint itself, showed the leads. Two unrelated failures must
   * not be able to take each other down.
   */
  const authHeaders = () => {
    const token = localStorage.getItem("usertoken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchOrganization = async () => {
    if (!userId) return;

    try {
      const res = await axios.get(
        `https://email-syncing-backend.vercel.app/auth/organization/get/${userId}`,
        { headers: authHeaders() }
      );
      const orgData = res.data?.data;
      if (orgData) {
        setOrgForm((prev) => ({
          ...prev,
          organizationName: orgData.organizationName || prev.organizationName,
          region: orgData.Region || prev.region,
          timezone: orgData.TimeZone || prev.timezone,
          country: orgData.country || prev.country,
          partnerLink: orgData.PartnerLink || prev.partnerLink,
        }));
      }
    } catch (err) {
      console.error("Error fetching organization in Layout:", err);
    }
  };

  /* One request at a time — see the note on the inbox page's guard. */
  const recentEmailsInFlight = useRef(false);

  const fetchRecentEmails = async () => {
    if (!userId || recentEmailsInFlight.current) return;

    recentEmailsInFlight.current = true;

    try {
      /*
       * stubs=1 — ids and metadata, no bodies and no thread messages.
       * The sidebar only ever counts and matches, and it was
       * re-downloading the entire inbox to do it.
       */
      const emailsRes = await axios.get(
        `https://email-syncing-backend.vercel.app/mailhook/getAllEmailsData/${userId}`,
        { headers: authHeaders(), params: { stubs: 1 } }
      );
      const threads = emailsRes.data?.data?.threads || [];
      // Normalize: flatten thread root emails
      const normalized = threads.map((t) => ({
        ...t,
        replies: t.replies || t.conversation || [],
        discussion: t.discussion || [],
      }));
      setEmails(normalized);
      if (setContextEmails) setContextEmails(normalized);
    } catch (err) {
      console.error("Error fetching recent emails in Layout:", err);
    } finally {
      recentEmailsInFlight.current = false;
    }
  };

  const [unreadCount, setUnreadCount] = useState(0);

  const computeUnreadCount = (emailsList = emails) => {
    try {
      const readIds = new Set(JSON.parse(localStorage.getItem("readEmailIds") || "[]"));
      const unread = (emailsList || []).filter((e) => {
        if (!e || e.isDeleted || e.isArchived) return false;
        const eId = String(e._id || "");
        return !readIds.has(eId);
      }).length;
      setUnreadCount(unread);
    } catch (err) {
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    computeUnreadCount(emails);
  }, [emails]);

  useEffect(() => {
    const handleReadUpdate = () => {
      computeUnreadCount(emails);
    };
    window.addEventListener("readEmailUpdated", handleReadUpdate);
    window.addEventListener("storage", handleReadUpdate);
    return () => {
      window.removeEventListener("readEmailUpdated", handleReadUpdate);
      window.removeEventListener("storage", handleReadUpdate);
    };
  }, [emails]);

  useEffect(() => {
    if (!userId) return;

    /* Once, and not on the 6s poll — organisation details do not change. */
    fetchOrganization();

    fetchRecentEmails();

    /*
     * The sidebar only needs counts, and it polls the same endpoint the
     * inbox page does — so on /inbox this was a second full fetch every
     * 6 seconds, doubling the load for numbers that change rarely.
     * Slower cadence, skipped while the tab is hidden, refreshed on
     * return.
     */
    const tick = () => {
      if (document.hidden) return;
      fetchRecentEmails();
    };

    const interval = setInterval(tick, 60000);

    const onVisible = () => {
      if (!document.hidden) fetchRecentEmails();
    };

    document.addEventListener("visibilitychange", onVisible);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [userId]);

  const [userScenarios, setUserScenarios] = useState([]);
  const [userConnections, setUserConnections] = useState([]);

  /* Company profiles, listed individually under AI Replies. */
  const [companyProfiles, setCompanyProfiles] = useState([]);

  useEffect(() => {
    if (!userId) return;
    const fetchSidebarData = async () => {
      try {
        const [scenRes, connRes, profRes] = await Promise.all([
          axios.get(`https://email-syncing-backend.vercel.app/scenario/user/${userId}`).catch(() => null),
          axios.get(`https://email-syncing-backend.vercel.app/auth/getConnection/${userId}`).catch(() => null),
          axios
            .get(
              `https://email-syncing-backend.vercel.app/api/company-profile/${userId}/list`,
            )
            .catch(() => null),
        ]);

        setCompanyProfiles(
          Array.isArray(profRes?.data?.data) ? profRes.data.data : [],
        );

        let scens = Array.isArray(scenRes?.data)
          ? scenRes.data
          : Array.isArray(scenRes?.data?.data)
          ? scenRes.data.data
          : [];
        setUserScenarios(scens);

        let conns = Array.isArray(connRes?.data)
          ? connRes.data
          : Array.isArray(connRes?.data?.data)
          ? connRes.data.data
          : [];
        setUserConnections(conns);
      } catch (err) {
        console.error("Error fetching scenarios/connections for sidebar:", err);
      }
    };

    fetchSidebarData();
  }, [userId]);

  const searchParams = new URLSearchParams(location.search);
  const inboxActiveFilter = searchParams.get("filter") || "all";
  const activeScenarioId = searchParams.get("scenarioId");
  const activeScenarioName = searchParams.get("scenario");
  const activeConnectionId = searchParams.get("connectionId");
  const activeConnectionName = searchParams.get("connection");

  /*
   * Scenario and connection matching live in utils/leadFilters.js so the
   * sidebar counts and the inbox list use one definition. They used to be
   * duplicated here, and this copy's connection matcher ended in
   * `return true` — every connection reported the same total.
   */
  const isEmailInScenario = emailMatchesScenario;
  const isEmailInConnection = emailMatchesConnection;

  // Process Scenarios lists
  const shopifyScenariosList = userScenarios.filter(
    (s) => s.type === "shopify" || (s.name || "").toLowerCase().includes("shopify")
  );

  const customScenariosList = userScenarios.filter(
    (s) => s.type !== "shopify" && !(s.name || "").toLowerCase().includes("shopify")
  );

  // Process Connections list
  /*
   * Only connections that can actually send or receive.
   *
   * An inactive connection in this list is a filter that can only ever
   * return nothing, and it reads as a working mailbox.
   */
  const connectionsList = userConnections.filter(
    (conn) => String(conn?.status || "").toLowerCase() === "active"
  );

  /*
   * What to call a connection.
   *
   * `name` is a default assigned at creation ("My Gmail Connection") and
   * never revised, so a mailbox connected through Microsoft can sit here
   * calling itself Gmail. The address is the part that is always true,
   * and the provider comes from the connection's own provider field, so
   * the row describes the mailbox rather than whatever it was called on
   * the day it was made.
   */
  const connectionLabel = (conn) => {
    const address = conn?.userEmail || conn?.email || "";
    if (address) return address;
    return conn?.name || "Connection";
  };

  // isReplied: matches Inbox.js isThreadReplied logic exactly
  const isReplied = (e) => {
    if (!e) return false;

    /*
     * The server decides this from the newest message in the thread, and
     * the stubs endpoint sends it. Everything below is the old local
     * guess, kept only for data that arrives without the field.
     */
    if (e.newestDirection) return e.newestDirection === "outgoing";

    const msgs = e.replies || e.conversation || e.discussion || [];

    if (!msgs || msgs.length === 0) {
      if (e.leadStatus === "replied" || e.leadStatus === "customer_replied") return true;
      if (e.leadStatus === "awaiting" || e.awaitingReply === true) return false;
      return (e.direction || "incoming") === "outgoing";
    }

    const latestMsg = msgs[msgs.length - 1];
    const isOutgoing =
      latestMsg.direction === "outgoing" ||
      latestMsg.stepType === "Auto Reply" ||
      latestMsg.stepType === "Manual Reply" ||
      latestMsg.role === "assistant";

    /*
     * A hardcoded "or the sender is 2014tabontech@gmail.com" used to sit
     * here — one developer's mailbox deciding, for every account on the
     * platform, whether a lead counted as replied to. direction and
     * stepType already carry that, and they carry it for everyone.
     */
    return isOutgoing;
  };
  /*
   * Archived leads are filed away and are not part of the live counts —
   * a badge that keeps counting mail the user has already dealt with is
   * the reason people stop trusting badges.
   */
  /* ~400 entries — built once, not on every keystroke in the form. */
  const tzOptions = useMemo(() => timeZoneOptions(), []);

  const liveEmails = emails.filter((e) => !e?.isArchived);

  const inboxRepliedCount = liveEmails.filter(isReplied).length;

  const inboxAwaitingCount = liveEmails.filter(
    (e) =>
      e.leadStatus !== "secured" && e.leadStatus !== "closed" && !isReplied(e),
  ).length;
  const inboxSecuredCount = liveEmails.filter(
    (e) => e.leadStatus === "secured",
  ).length;
  const inboxArchivedCount = emails.filter((e) => e?.isArchived).length;

  /*
   * Needs a reply from us: nobody has answered yet, or the customer has
   * written back since we did. Mirrors the server's `view=new`, so the
   * badge and the list it opens agree.
   */
  const inboxNewCount = liveEmails.filter(
    (e) =>
      e?.newestDirection === "incoming" &&
      e?.leadStatus !== "secured" &&
      e?.leadStatus !== "closed",
  ).length;

  const inboxViewParam = (searchParams.get("view") || "new").toLowerCase();

  const handleSaveOrgSettings = async () => {
    try {
      setIsSavingOrg(true);
      const chosenTimeZone = normalizeTimeZone(orgForm.timezone);
      const currentUserId = userId || user?._id;
      if (currentUserId) {
        await axios.put(
          `https://email-syncing-backend.vercel.app/auth/updateUserAndOrganization/${currentUserId}`,
          {
            organizationName: orgForm.organizationName,
            Region: orgForm.region,
            /*
             * The identifier, never the decorated label — and
             * TimeZoneAuto false, because saving this form IS the
             * deliberate choice that stops auto-detection overriding it.
             */
            TimeZone: chosenTimeZone,
            TimeZoneAuto: false,
            country: orgForm.country,
            PartnerLink: orgForm.partnerLink,
          },
        );
      }
      const updatedUserObj = {
        ...(user || {}),
        organizationName: orgForm.organizationName,
        companyName: orgForm.organizationName,
        Region: orgForm.region,
        TimeZone: chosenTimeZone,
        TimeZoneAuto: false,
        country: orgForm.country,
        PartnerLink: orgForm.partnerLink,
      };
      setUser(updatedUserObj);
      if (setContextUser) setContextUser(updatedUserObj);
      setShowOrgSettingsModal(false);
    } catch (err) {
      console.error("Error updating org settings:", err);
      setShowOrgSettingsModal(false);
    } finally {
      setIsSavingOrg(false);
    }
  };

  const handleLogout = async () => {
    try {
      const currentUserId = localStorage.getItem("userid") || user?._id;
      if (currentUserId) {
        await apiFetch(
          `https://email-syncing-backend.vercel.app/auth/logout/${currentUserId}`,
          {
            method: "POST",
          },
        ).catch(() => {});
      }
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = "/login";
    }
  };

  const userName = user?.fullName || user?.email?.split("@")[0] || "User";
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // Primary navigation items (Removed Company & Setup, Added Connection)
  const primaryNav = [
    { id: "org", label: "Org", icon: FiGrid, path: "/dashboard" },
    { id: "inbox", label: "Inbox", icon: FiInbox, path: "/inbox" },
    {
      id: "scenarios",
      label: "Scenarios",
      icon: FiZap,
      path: "/scenarios/all",
    },
    { id: "connection", label: "Connection", icon: FiKey, path: "/connection" },
    {
      id: "templates",
      label: "Templates",
      icon: FiFileText,
      path: "/templates",
    },
  ];
  const organizationRoutes = [
    "/dashboard",
    "/teams",
    "/security",
    "/pricing",
    "/organization",
  ];

  const isOrganizationActive =
    organizationRoutes.some(
      (route) =>
        location.pathname === route ||
        location.pathname.startsWith(`${route}/`),
    ) || location.pathname.startsWith("/organization/");

  /*
   * The plan badge beside "Subscription" must name the plan the account is
   * actually on — it read "Free" for everyone, so upgrading on /pricing left
   * the nav contradicting the page. Explore is the free tier, so it keeps
   * reading "Free" rather than showing its internal name.
   */
  const subscriptionPlan =
    user?.subscription?.plan || contextUser?.subscription?.plan || "Explore";
  const subscriptionBadge =
    subscriptionPlan.toLowerCase() === "explore" ? "Free" : subscriptionPlan;

  /*
   * Explore is capped at the single prebuilt Shopify scenario, so its card
   * in the create modal reopens the one that already exists. Every paid
   * plan may run more than one, so there the card starts a fresh blank
   * Shopify scenario — reopening the prebuilt would leave a paid account
   * with no way to build its second one.
   */
  const canBuildExtraShopifyScenarios =
    subscriptionPlan.toLowerCase() !== "explore";

  // Dynamic Secondary Sub-Nav Definitions based on current route
  const getSecondaryNav = () => {
    const path = location.pathname;

    if (path.startsWith("/inbox")) {
      return { type: "inbox" };
    }

    /*
     * Scenarios render no secondary sidebar. The scenario builder is a
     * wide horizontal canvas and the list added nothing that the page
     * itself does not already offer, so the space goes to the canvas.
     */
    if (path.startsWith("/scenarios")) {
      return { type: "none" };
    }

    if (path.startsWith("/templates") || path.startsWith("/company-profile")) {
      /*
       * Two different things sat in one flat list, with Company profile at
       * the top reading like a third kind of template. They are separated:
       * the templates you write, and the business details the AI writes
       * from.
       */
      return {
        type: "grouped",
        title: "Templates",
        groups: [
          {
            id: "templates",
            title: "Templates",
            icon: FiFileText,
            items: [
              {
                id: "shopify",
                label: "Shopify templates",
                path: "/templates",
              },
              {
                id: "custom",
                label: "Custom templates",
                path: "/templates/general",
              },
            ],
          },
          {
            id: "ai",
            /*
             * The items under this heading ARE the company profiles, so
             * the heading names them. "AI Replies" described what they are
             * for, which read as a separate section rather than a label
             * for the list beneath it.
             */
            title: "Company Profiles",
            subtitle: "Used for AI replies",
            icon: FiZap,
            /*
             * One entry per company profile, each showing whether it is
             * active. A single "Company profile" link gave no sense of how
             * many there were or which were in use.
             */
            items:
              companyProfiles.length > 0
                ? companyProfiles.map((profile) => ({
                    id: profile._id,
                    label: profile.name,
                    hint: profile.isDefault ? "Default profile" : undefined,
                    isActive: profile.isActive !== false,
                    showStatus: true,
                    path: `/company-profile?profile=${profile._id}`,
                  }))
                : [
                    {
                      id: "company-profile",
                      label: "Company profile",
                      hint: "Business details the AI writes replies from",
                      path: "/company-profile",
                    },
                  ],
          },
        ],
      };
    }

    /*
     * Connections render no secondary sidebar either — All / Verified are
     * filters on the page itself, where the list they filter actually is.
     */
    if (path.startsWith("/connection")) {
      return { type: "none" };
    }

    return {
      type: "organization",
      title: "Organization",
      groups: [
        {
          id: "organization",
          title: "Organization",
          icon: FiHome,
          items: [
            {
              id: "dashboard",
              label: "Dashboard",
              path: "/dashboard",
            },
          ],
        },
        {
          id: "plan",
          title: "My Plan",
          icon: FiCreditCard,
          items: [
            {
              id: "subscription",
              label: "Subscription",
              path: "/pricing",
              badge: subscriptionBadge,
            },
            {
              id: "credit-usage",
              label: "AI replies usage",
              path: "/organization/credit-usage",
            },
            {
              id: "payments",
              label: "Payments",
              path: "/organization/payments",
            },
          ],
        },
        {
          id: "utilities",
          title: "Utilities",
          icon: FiTool,
          items: [
            {
              id: "installed-apps",
              label: "Installed apps",
              path: "/organization/apps",
            },
            {
              id: "variables",
              label: "Variables",
              path: "/organization/variables",
            },
            {
              id: "scenario-properties",
              label: "Scenario properties",
              path: "/organization/scenario-properties",
            },
            {
              id: "notification-options",
              label: "Notification options",
              path: "/organization/notifications",
            },
          ],
        },
      ],
    };
  };

  const secondaryNav = getSecondaryNav();

  /*
   * Manual collapse for the sections that still have a secondary nav
   * (Templates, Connections, Organization). Scenarios render none at all.
   */
  const [secondaryNavCollapsed, setSecondaryNavCollapsed] = useState(false);

  /*
   * The scenario picker holds no input, so an outside click always closes
   * it. Organisation settings is a form, so it closes only while nothing
   * has been edited — see hooks/useModalDismiss.js.
   */
  const createScenarioDismiss = useModalDismiss({
    onClose: () => setShowCreateScenarioModal(false),
  });

  const orgSettingsDismiss = useModalDismiss({
    onClose: () => setShowOrgSettingsModal(false),
    isDirty:
      orgForm.organizationName !==
        (contextUser?.organizationName || contextUser?.companyName || "") ||
      orgForm.region !== (contextUser?.Region || contextUser?.region || "US") ||
      orgForm.country !== (contextUser?.country || "Canada") ||
      orgForm.partnerLink !==
        (contextUser?.PartnerLink || contextUser?.partnerLink || ""),
  });

  const isSecondaryItemActive = (item) => {
    const [itemPath, itemQuery = ""] = item.path.split("?");

    if (location.pathname !== itemPath) {
      return false;
    }

    if (!itemQuery) {
      return location.search === "" || item.id === "dashboard";
    }

    return location.search === `?${itemQuery}`;
  };
  return (
    <div className="flex h-screen bg-[#F7F7FA] font-sans text-slate-900 overflow-hidden">
      {/* ------------------------------------------------------------- */}
      {/* 1. PRIMARY MAIN SIDEBAR (gray-200 Theme Strip with Upgrade & Security) */}
      {/* ------------------------------------------------------------- */}
      <aside className="w-[68px] bg-gray-200 border-r border-gray-300 flex flex-col items-center py-4 shrink-0 shadow-sm z-20 justify-between">
        <div className="flex flex-col items-center w-full">
          {/* App Logo */}
          <Link
            to="/dashboard"
            className="flex h-10 w-10 items-center justify-center rounded-full  border  mb-6  transition shadow-2xs"
            title="Replex Engine Platform"
          >
            <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 ring-1 ring-slate-300">
              <span className="absolute h-3.5 w-3.5 rounded-full border-[3px] border-slate-950 border-r-transparent" />
              <span className="absolute right-[5px] top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-slate-950" />
            </span>
          </Link>

          {/* Main Navigation */}
          <nav className="flex flex-col gap-2.5 w-full px-2">
            {primaryNav.map((item) => {
              const Icon = item.icon;
              const isActive =
                (item.id === "org" && isOrganizationActive) ||
                (item.id === "inbox" &&
                  location.pathname.startsWith("/inbox")) ||
                (item.id === "scenarios" &&
                  location.pathname.startsWith("/scenarios")) ||
                (item.id === "connection" &&
                  location.pathname.startsWith("/connection")) ||
                (item.id === "templates" &&
                  location.pathname.startsWith("/templates"));
              return (
                <button
                  key={item.id}
                  type="button"
                  /*
                   * replace:false on purpose. Inbox must land on the
                   * plain list every time — including from a filtered
                   * view or an open thread — so it pushes a fresh entry
                   * even when the path already matches.
                   */
                  onClick={() => navigate(item.path, { replace: false })}
                  className="group flex flex-col items-center justify-center w-full py-1 cursor-pointer"
                  title={item.label}
                >
                  <div className="relative">
                    <div
                      className={`flex items-center justify-center h-10 w-10 rounded-xl transition ${
                        isActive
                          ? "bg-gray-300 border border-gray-400/60 text-slate-950 shadow-2xs"
                          : "bg-transparent group-hover:bg-gray-300/50 text-slate-700"
                      }`}
                    >
                      <Icon size={20} className={isActive ? "text-slate-950" : "text-slate-700 group-hover:text-slate-950"} />
                    </div>
                    {item.id === "inbox" && unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[9px] font-extrabold text-white shadow-xs animate-in zoom-in-50">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-[10px] mt-1 tracking-tight ${
                      isActive ? "font-bold text-slate-950" : "font-medium text-slate-700"
                    }`}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Sidebar Footer: Security & Upgrade */}
        <div className="flex flex-col items-center gap-3 w-full px-2 mb-2">
          {/* Security */}
          <button
            type="button"
            onClick={() => navigate("/security")}
            className="group flex flex-col items-center justify-center w-full py-1 cursor-pointer"
            title="Security"
          >
            <div
              className={`flex items-center justify-center h-9 w-9 rounded-xl transition ${
                location.pathname === "/security"
                  ? "bg-gray-300 border border-gray-400/60 text-slate-950 shadow-2xs"
                  : "bg-transparent group-hover:bg-gray-300/50 text-slate-700"
              }`}
            >
              <FiShield size={18} className={location.pathname === "/security" ? "text-slate-950" : "text-slate-700 group-hover:text-slate-950"} />
            </div>
            <span
              className={`text-[9px] mt-0.5 tracking-tight ${
                location.pathname === "/security" ? "font-bold text-slate-950" : "font-medium text-slate-700"
              }`}
            >
              Security
            </span>
          </button>

          {/* Upgrade Button */}
          <button
            type="button"
            onClick={() => navigate("/pricing")}
            className="group flex flex-col items-center justify-center w-full py-1 cursor-pointer"
            title="Upgrade Plan"
          >
            <div
              className={`flex items-center justify-center h-9 w-9 rounded-xl transition ${
                location.pathname === "/pricing"
                  ? "bg-gray-300 border border-gray-400/60 text-slate-950 shadow-2xs"
                  : "bg-transparent group-hover:bg-gray-300/50 text-slate-700"
              }`}
            >
              <FiTrendingUp size={18} className={location.pathname === "/pricing" ? "text-slate-950" : "text-slate-700 group-hover:text-slate-950"} />
            </div>
            <span
              className={`text-[9px] mt-0.5 tracking-tight ${
                location.pathname === "/pricing" ? "font-bold text-slate-950" : "font-medium text-slate-700"
              }`}
            >
              Upgrade
            </span>
          </button>
        </div>
      </aside>

      {/* ------------------------------------------------------------- */}
      {/* 2. SECONDARY SUB-NAVIGATION SIDEBAR (Gray Theme) */}
      {/* ------------------------------------------------------------- */}
      {/* ------------------------------------------------------------- */}
      {/* 2. SECONDARY SUB-NAVIGATION SIDEBAR */}
      {/* ------------------------------------------------------------- */}

      {secondaryNav.type === "none" ? null : secondaryNav.type === "inbox" ? (
        <aside className="w-[230px] shrink-0 border-r border-slate-200 bg-white flex flex-col h-full overflow-y-auto">
          <div className="px-3 py-4 space-y-4">
            {/* ---- LEAD INBOX group ---- */}
            <div>
              <div className="mb-2 flex items-center gap-2 border-b border-slate-200 px-2 pb-2.5">
                <FiInbox className="h-4 w-4 text-slate-900" />
                <h2 className="text-[13px] font-bold text-slate-900">Lead Inbox</h2>
              </div>
              {/*
                New Emails first, and the landing view.

                "All" fetches the entire history, which is the slow one.
                What a user opens the inbox to do is answer what is
                waiting, and that set is small — so it loads fast and it
                is what they see first.
              */}
              <button
                type="button"
                onClick={() => navigate("/inbox")}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-left text-[12px] transition ${
                  inboxViewParam !== "all" && !activeScenarioId && !activeScenarioName && !activeConnectionId && !activeConnectionName
                    ? "bg-slate-200 font-semibold text-slate-950"
                    : "font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-950"
                }`}
              >
                <span>New Emails</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold text-white ${
                    inboxNewCount > 0 ? "bg-red-600" : "bg-slate-700"
                  }`}
                >
                  {inboxNewCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => navigate("/inbox?view=all")}
                className={`mt-0.5 flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-left text-[12px] transition ${
                  inboxViewParam === "all" && !activeScenarioId && !activeScenarioName && !activeConnectionId && !activeConnectionName
                    ? "bg-slate-200 font-semibold text-slate-950"
                    : "font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-950"
                }`}
              >
                <span>All</span>
                <span className="rounded-full bg-slate-700 px-2 py-0.5 text-[10px] font-semibold text-white">
                  {liveEmails.length}
                </span>
              </button>
            </div>

            {/* ---- ALL SCENARIOS group ---- */}
            {userScenarios.length > 0 && (
              <div>
                <div className="mb-2 flex items-center gap-1.5 border-b border-slate-200 px-2 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <FiLayers className="h-3.5 w-3.5 text-slate-700" />
                  <span>Scenarios</span>
                </div>
                <nav className="flex flex-col gap-0.5">
                  {userScenarios.map((scen) => {
                    /* Archived leads are filed away — see liveEmails. */
                    const count = liveEmails.filter((e) => isEmailInScenario(e, scen)).length;
                    const isActive =
                      (activeScenarioId && String(activeScenarioId) === String(scen._id)) ||
                      (activeScenarioName && activeScenarioName.toLowerCase() === (scen.name || "").toLowerCase());
                    return (
                      <button
                        key={scen._id || scen.name}
                        type="button"
                        onClick={() => navigate(`/inbox?scenarioId=${scen._id}&scenario=${encodeURIComponent(scen.name)}`)}
                        className={`flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-left text-[12px] transition ${
                          isActive
                            ? "bg-slate-200 font-semibold text-slate-950"
                            : "font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-950"
                        }`}
                      >
                        <span className="truncate pr-1" title={scen.name}>{scen.name}</span>
                        <span className="rounded-full bg-slate-100 border border-slate-200 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            )}

            {/* ---- CONNECTIONS group ---- */}
            {connectionsList.length > 0 && (
              <div>
                <div className="mb-2 flex items-center gap-1.5 border-b border-slate-200 px-2 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <FiLink className="h-3.5 w-3.5 text-slate-700" />
                  <span>Connections</span>
                </div>
                <nav className="flex flex-col gap-0.5">
                  {connectionsList.map((conn) => {
                    const connLabel = connectionLabel(conn);
                    const count = liveEmails.filter((e) => isEmailInConnection(e, conn)).length;
                    const isActive =
                      (activeConnectionId && String(activeConnectionId) === String(conn._id)) ||
                      (activeConnectionName && activeConnectionName.toLowerCase() === connLabel.toLowerCase());
                    return (
                      <button
                        key={conn._id || connLabel}
                        type="button"
                        onClick={() => navigate(`/inbox?connectionId=${conn._id}&connection=${encodeURIComponent(connLabel)}&connEmail=${encodeURIComponent(conn.userEmail || conn.email || "")}`)}
                        className={`flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-left text-[12px] transition ${
                          isActive
                            ? "bg-slate-200 font-semibold text-slate-950"
                            : "font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-950"
                        }`}
                      >
                        <span
                          className="truncate pr-1"
                          title={`${connLabel}${conn.provider ? ` · ${providerLabel(conn.provider)}` : ""}`}
                        >
                          {connLabel}
                        </span>
                        <span className="rounded-full bg-slate-100 border border-slate-200 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            )}

            {/* ---- STATUS FILTERS group ---- */}
            <div>
              <div className="mb-2 flex items-center gap-1.5 border-b border-slate-200 px-2 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <FiSliders className="h-3.5 w-3.5 text-slate-700" />
                <span>Status Filters</span>
              </div>
              <nav className="flex flex-col gap-0.5">
                {[
                  {
                    id: "awaiting",
                    label: "Awaiting reply",
                    count: inboxAwaitingCount,
                    path: "/inbox?filter=awaiting",
                  },
                  {
                    id: "replied",
                    label: "Replied",
                    count: inboxRepliedCount,
                    path: "/inbox?filter=replied",
                  },
                  {
                    id: "secured",
                    label: "Secured",
                    count: inboxSecuredCount,
                    path: "/inbox?filter=secured",
                  },
                  {
                    id: "archived",
                    label: "Archived",
                    count: inboxArchivedCount,
                    path: "/inbox?filter=archived",
                  },
                ].map((item) => {
                  const isActive = inboxActiveFilter === item.id && !activeScenarioId && !activeConnectionId;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => navigate(item.path)}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-left text-[12px] transition ${
                        isActive
                          ? "bg-slate-200 font-semibold text-slate-950"
                          : "font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-950"
                      }`}
                    >
                      <span>{item.label}</span>
                      <span className="rounded-full bg-slate-700 px-2 py-0.5 text-[10px] font-semibold text-white">
                        {item.count}
                      </span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        </aside>
      ) : secondaryNavCollapsed ? (
        /* Collapsed rail — click anywhere on it to bring the list back. */
        <aside className="w-9 shrink-0 border-r border-slate-200 bg-white">
          <button
            type="button"
            onClick={() => setSecondaryNavCollapsed(false)}
            title={`Show ${secondaryNav.title}`}
            aria-label={`Show ${secondaryNav.title}`}
            className="group flex h-full w-full flex-col items-center gap-3 pt-4 text-slate-400 transition hover:bg-slate-50 hover:text-slate-900 cursor-pointer"
          >
            <FiChevronRight className="h-4 w-4" />
            <span
              className="text-[11px] font-bold uppercase tracking-wider whitespace-nowrap"
              style={{ writingMode: "vertical-rl" }}
            >
              {secondaryNav.title}
            </span>
          </button>
        </aside>
      ) : secondaryNav.groups ? (
        <aside className="w-[230px] shrink-0 border-r border-slate-200 bg-white overflow-y-auto">
          <div className="px-3 py-4">
            {/*
              The grouped nav had no collapse control, so once the flat
              renderer stopped being used there was no way to reclaim the
              230px on these screens.
            */}
            <div className="mb-3 flex items-center justify-between gap-2 px-2">
              <h2 className="text-[13px] font-bold text-slate-900">
                {secondaryNav.title}
              </h2>
              <button
                type="button"
                onClick={() => setSecondaryNavCollapsed(true)}
                title="Hide this list"
                aria-label="Hide this list"
                className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
              >
                <FiChevronLeft className="h-4 w-4" />
              </button>
            </div>

            {secondaryNav.groups.map((group, groupIndex) => {
              const GroupIcon = group.icon;

              return (
                <div key={group.id} className={groupIndex > 0 ? "mt-5" : ""}>
                  <div className="mb-3 flex items-center gap-2 border-b border-slate-200 px-2 pb-3">
                    <GroupIcon className="h-4 w-4 text-slate-900" />

                    <div className="min-w-0">
                      <h2 className="text-[13px] font-bold text-slate-900">
                        {group.title}
                      </h2>
                      {group.subtitle && (
                        <p className="text-[10px] font-medium text-slate-400">
                          {group.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  <nav className="flex flex-col gap-0.5">
                    {group.items.map((item) => {
                      const isActive = isSecondaryItemActive(item);

                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => navigate(item.path)}
                          className={`flex w-full items-start gap-2 rounded-lg px-3 py-2 text-left text-[13px] transition ${
                            isActive
                              ? "bg-slate-200 font-semibold text-slate-950"
                              : "font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-950"
                          }`}
                        >
                          {item.showStatus && (
                            <StatusDot
                              tone={item.isActive ? "active" : "paused"}
                              size="sm"
                              title={
                                item.isActive
                                  ? "Active — scenarios can write from this profile"
                                  : "Paused — not offered to scenarios"
                              }
                              className="mt-1.5"
                            />
                          )}

                          <span className="min-w-0 flex-1">
                            <span className="block">{item.label}</span>

                            {/*
                              Says what an entry is for when its name does
                              not — "Company profile" gives no clue that it
                              feeds the AI's replies.
                            */}
                            {item.hint && (
                              <span className="mt-0.5 block text-[10px] font-normal leading-snug text-slate-500">
                                {item.hint}
                              </span>
                            )}
                          </span>

                          {item.badge && (
                            <span className="shrink-0 rounded-full bg-slate-700 px-2 py-0.5 text-[10px] font-semibold text-white">
                              {item.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </nav>
                </div>
              );
            })}
          </div>
        </aside>
      ) : (
        <aside className="w-[230px] shrink-0 border-r border-slate-200 bg-white">
          <div className="px-3 py-4">
            {/* Section header — same style as Organization groups */}
            <div className="mb-3 flex items-center justify-between gap-2 border-b border-slate-200 px-2 pb-3">
              <h2 className="text-[13px] font-bold text-slate-900">
                {secondaryNav.title}
              </h2>
              <button
                type="button"
                onClick={() => setSecondaryNavCollapsed(true)}
                title="Hide this list"
                aria-label="Hide this list"
                className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
              >
                <FiChevronLeft className="h-4 w-4" />
              </button>
            </div>
            <nav className="flex flex-col gap-0.5">
              {secondaryNav.items.map((sub) => {
                const isSubActive = isSecondaryItemActive(sub);
                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => navigate(sub.path)}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-[13px] transition ${
                      isSubActive
                        ? "bg-slate-200 font-semibold text-slate-950"
                        : "font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-950"
                    }`}
                  >
                    <span>{sub.label}</span>
                    {sub.badge && (
                      <span className="rounded-full bg-slate-700 px-2 py-0.5 text-[10px] font-semibold text-white">
                        {sub.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. MAIN CONTENT CANVAS WRAPPER WITH TOP HEADER */}
      {/* ------------------------------------------------------------- */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/*
          Top Header Bar

          z-40 is deliberate: this is page chrome, so it must sit above the
          page content (which tops out at z-30) but BELOW every dialog. At
          z-[100] it shared the modal tier and painted over the z-50 overlays
          used across the app, clipping the top of any modal opened from a
          page — the mailhook setup modal on /connection was cut in half by
          this bar. Anything that must cover the header belongs at z-50+.
        */}
        <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 relative z-40">
          {/* Left: Organization Badge */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-8 w-8 rounded-[8px] bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
              {userInitials || "MO"}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-slate-900 truncate">
                {user?.organizationName ||
                  user?.companyName ||
                  "My Organization"}
              </span>
              <span className="text-[10px] text-slate-500 truncate">
                {user?.email || "My Team"}
              </span>
            </div>
          </div>

          {/* Right Header Controls */}
          <div ref={headerRightRef} className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowOrgSettingsModal(true)}
              className="h-8 border border-slate-300 rounded-[8px] bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer flex items-center gap-1.5"
            >
              <FiSettings size={13} className="text-slate-500" />
              <span>Organization settings</span>
            </button>

            <div className="h-4 w-px bg-slate-300 my-auto" />

            <button
              type="button"
              onClick={() => setShowCreateScenarioModal(true)}
              className="h-8 rounded-[8px] bg-black hover:bg-slate-800 text-white px-3 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <FiPlus size={14} />
              <span>Create scenario</span>
            </button>

            {/* Notifications Bell Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowProfileDropdown(false);
                  setShowNotificationsDropdown((prev) => !prev);
                }}
                className="h-8 w-8 rounded-[8px] border border-slate-300 bg-white flex items-center justify-center text-slate-600 hover:bg-slate-50 transition cursor-pointer relative"
                title="Notifications"
              >
                <FiBell size={15} />
                {emails.length > 0 && (
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
                )}
              </button>

              {showNotificationsDropdown && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">
                      Notifications
                    </span>
                    <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full font-semibold text-slate-600">
                      {emails.length} New
                    </span>
                  </div>
                  <div className="max-h-60 overflow-y-auto divide-y divide-slate-100">
                    {emails.length === 0 ? (
                      <div className="px-4 py-3 text-xs text-slate-400 text-center">
                        No new notifications
                      </div>
                    ) : (
                      emails.slice(0, 5).map((em) => (
                        <div
                          key={em._id}
                          onClick={() => {
                            setShowNotificationsDropdown(false);
                            navigate("/inbox");
                          }}
                          className="px-4 py-2.5 hover:bg-slate-50 cursor-pointer transition flex flex-col gap-0.5"
                        >
                          <span className="text-xs font-semibold text-slate-800 truncate">
                            {em.subject || "Lead inquiry received"}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            From {em.senderAddress || em.from || "Customer"}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Avatar Dropdown */}
            <div className="relative">
              <div
                onClick={() => {
                  setShowNotificationsDropdown(false);
                  setShowProfileDropdown((prev) => !prev);
                }}
                className="h-8 w-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs shadow-sm cursor-pointer hover:ring-2 hover:ring-slate-400 transition select-none"
                title={userName}
              >
                {userInitials}
              </div>

              {showProfileDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-[200] animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {userName}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {user?.email}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowProfileDropdown(false);
                      navigate("/company-profile");
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition text-left cursor-pointer"
                  >
                    <span>Company Profile</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowProfileDropdown(false);
                      navigate("/connection");
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition text-left cursor-pointer"
                  >
                    <span>Connection</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowProfileDropdown(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition text-left cursor-pointer"
                  >
                    <FiLogOut size={14} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Body Canvas */}
        <main
          className={`flex-1 overflow-hidden ${location.pathname.startsWith("/inbox") || location.pathname.startsWith("/scenarios") || location.pathname.startsWith("/connection") || location.pathname.startsWith("/templates") || location.pathname.startsWith("/company-profile") ? "" : "overflow-y-auto p-4 md:p-6"}`}
        >
          {children}
        </main>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MODAL 1: CREATE NEW SCENARIO MODAL */}
      {/* ------------------------------------------------------------- */}
      {showCreateScenarioModal && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          {...createScenarioDismiss.backdropProps}
        >
          <div
            className="bg-white rounded-[8px] max-w-[620px] w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200"
            {...createScenarioDismiss.panelProps}
          >
            <div className="bg-black text-white p-6 flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <span className="text-slate-300 font-normal">+</span> Create
                  New Scenario
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Select a scenario type to build for your workspace
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateScenarioModal(false)}
                className="text-slate-400 hover:text-white transition p-1 cursor-pointer"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="p-6 flex flex-col gap-4 bg-slate-50">
              <div
                onClick={() => {
                  setShowCreateScenarioModal(false);
                  navigate(
                    canBuildExtraShopifyScenarios
                      ? "/scenarios/shopify/new"
                      : "/scenarios/shopify",
                  );
                }}
                className="p-5 rounded-[8px] bg-white border border-slate-200 hover:border-black transition cursor-pointer shadow-2xs group flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-[8px] bg-slate-100 text-slate-900 flex items-center justify-center shrink-0">
                      <FiZap size={20} />
                    </div>
                    <span className="text-sm font-bold text-slate-900 group-hover:text-black transition">
                      Shopify Partner Directory Scenario
                    </span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-[10px] font-bold text-amber-800 shrink-0">
                    Prebuilt Template
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed pl-13">
                  Capture directory inquiry leads automatically and trigger
                  personalized email response flows.
                </p>
                <div className="text-[11px] text-slate-400 font-medium pl-13">
                  Template Type:{" "}
                  <span className="font-bold text-slate-700">
                    Prebuilt Lead Capture Flow
                  </span>
                </div>
              </div>

              <div
                onClick={() => {
                  setShowCreateScenarioModal(false);
                  navigate("/scenarios/others");
                }}
                className="p-5 rounded-[8px] bg-white border border-slate-200 hover:border-black transition cursor-pointer shadow-2xs group flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-[8px] bg-slate-100 text-slate-900 flex items-center justify-center shrink-0">
                      <FiSettings size={20} />
                    </div>
                    <span className="text-sm font-bold text-slate-900 group-hover:text-black transition">
                      Custom Workflow Scenario
                    </span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-bold text-emerald-800 shrink-0">
                    Unlimited Creation
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed pl-13">
                  Build custom multi-branch triggers, delay filters, and custom
                  webhook connections.
                </p>
                <div className="text-[11px] text-slate-400 font-medium pl-13">
                  Creation Limit:{" "}
                  <span className="font-bold text-slate-700">
                    Unlimited Scenarios (Active limits apply per plan)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 2: ORGANIZATION SETTINGS MODAL */}
      {/* ------------------------------------------------------------- */}
      {showOrgSettingsModal && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          {...orgSettingsDismiss.backdropProps}
        >
          <div
            className="bg-white rounded-[8px] max-w-[560px] w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200"
            {...orgSettingsDismiss.panelProps}
          >
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-white">
              <h3 className="text-base font-bold text-slate-900">
                Organization settings
              </h3>
              <button
                type="button"
                onClick={() => setShowOrgSettingsModal(false)}
                className="text-slate-400 hover:text-slate-700 transition cursor-pointer"
              >
                <FiX size={18} />
              </button>
            </div>

            <div className="p-6 flex flex-col gap-4 max-h-[50vh] overflow-y-auto pr-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  Organization name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={orgForm.organizationName}
                  onChange={(e) =>
                    setOrgForm({ ...orgForm, organizationName: e.target.value })
                  }
                  placeholder="Enter organization name"
                  className="w-full px-3 py-2 rounded-[8px] border border-slate-400 focus:outline-none focus:ring-2 focus:ring-black text-xs text-slate-900 font-medium"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-600">
                  Region
                </label>
                <select
                  value={orgForm.region}
                  onChange={(e) =>
                    setOrgForm({ ...orgForm, region: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-[8px] border border-slate-300 bg-slate-100 text-xs text-slate-800"
                >
                  <option value="US">US</option>
                  <option value="EU">EU</option>
                  <option value="CA">CA</option>
                  <option value="ASIA">ASIA</option>
                </select>
              </div>

              {/*
                Every zone the browser knows, ordered west to east.

                This offered three hardcoded options, and stored a
                decorated label ("(GMT-05:00) America/Toronto") rather
                than an identifier — a string no date API can use, and
                one whose baked-in offset is an hour wrong for half the
                year. The value saved now is the identifier itself.
              */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-xs font-bold text-slate-700">
                    Timezone <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setOrgForm({ ...orgForm, timezone: systemTimeZone() })
                    }
                    className="text-[11px] font-semibold text-slate-500 underline transition hover:text-slate-900"
                  >
                    Use my system timezone
                  </button>
                </div>
                <select
                  value={normalizeTimeZone(orgForm.timezone)}
                  onChange={(e) =>
                    setOrgForm({ ...orgForm, timezone: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-[8px] border border-slate-300 bg-white text-xs text-slate-800"
                >
                  {tzOptions.map((tz) => (
                    <option key={tz.value} value={tz.value}>
                      {tz.label}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500">
                  Run history and lead timestamps are shown in this zone.
                  Detected: {systemTimeZone()}.
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Country <span className="text-red-500">*</span>
                </label>
                <select
                  value={orgForm.country}
                  onChange={(e) =>
                    setOrgForm({ ...orgForm, country: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-[8px] border border-slate-300 bg-white text-xs text-slate-800"
                >
                  <option value="Canada">Canada</option>
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Pakistan">Pakistan</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Partner link
                </label>
                <input
                  type="text"
                  value={orgForm.partnerLink}
                  onChange={(e) =>
                    setOrgForm({ ...orgForm, partnerLink: e.target.value })
                  }
                  placeholder="Optional partner link"
                  className="w-full px-3 py-2 rounded-[8px] border border-slate-300 bg-white text-xs text-slate-800"
                />
              </div>
            </div>

            <div className="px-6 py-3 border-t border-slate-200 flex items-center justify-end gap-2 bg-slate-50">
              <button
                type="button"
                disabled={isSavingOrg}
                onClick={() => setShowOrgSettingsModal(false)}
                className="px-4 py-2 rounded-[8px] border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer disabled:opacity-50"
              >
                Close
              </button>
              <button
                type="button"
                disabled={isSavingOrg}
                onClick={handleSaveOrgSettings}
                className="px-4 py-2 rounded-[8px] bg-black hover:bg-slate-800 text-white text-xs font-semibold transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5 min-w-[70px] justify-center"
              >
                {isSavingOrg ? (
                  <>
                    <FiLoader className="animate-spin" size={14} />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppLayout;

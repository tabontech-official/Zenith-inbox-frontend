import React, { useState, useEffect, useContext } from "react";
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
} from "react-icons/fi";
import axios from "axios";
import { UserContext } from "./UserContext";

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
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [isSavingOrg, setIsSavingOrg] = useState(false);

  const [orgForm, setOrgForm] = useState({
    organizationName: contextUser?.organizationName || contextUser?.companyName || "",
    region: contextUser?.Region || contextUser?.region || "US",
    timezone: contextUser?.TimeZone || contextUser?.timezone || "(GMT-05:00) America/Toronto",
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
          organizationName: contextUser.organizationName || contextUser.companyName || prev.organizationName,
          region: contextUser.Region || contextUser.region || prev.region,
          timezone: contextUser.TimeZone || contextUser.timezone || prev.timezone,
          country: contextUser.country || prev.country,
          partnerLink: contextUser.PartnerLink || contextUser.partnerLink || prev.partnerLink,
        }));
      }
    }
  }, [contextUser]);

  useEffect(() => {
    if (contextEmails && contextEmails.length > 0) {
      setEmails(contextEmails);
    }
  }, [contextEmails]);

  useEffect(() => {
    // Only fetch if data is not present in context yet
    if (!contextUser) {
      fetchUser();
    }
    if (!contextEmails || contextEmails.length === 0) {
      fetchRecentEmails();
    }
  }, [userId]);

  const fetchUser = async () => {
    try {
      if (!userId) return;
      const res = await axios.get(
        `https://email-syncing-backend.vercel.app/auth/getUsers/${userId}`
      );
      const fetchedUser = res.data?.data || contextUser || null;
      if (fetchedUser) {
        setUser(fetchedUser);
        if (setContextUser) setContextUser(fetchedUser);
        setOrgForm({
          organizationName: fetchedUser.organizationName || fetchedUser.companyName || "Organization",
          region: fetchedUser.Region || fetchedUser.region || "US",
          timezone: fetchedUser.TimeZone || fetchedUser.timezone || "(GMT-05:00) America/Toronto",
          country: fetchedUser.country || "Canada",
          partnerLink: fetchedUser.PartnerLink || fetchedUser.partnerLink || "",
        });
      }
    } catch (err) {
      console.error("Error fetching user in Layout:", err);
    }
  };

  const fetchRecentEmails = async () => {
    try {
      if (!userId) return;
      const res = await axios.get(
        `https://email-syncing-backend.vercel.app/auth/organization/get/${userId}`
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

      const emailsRes = await axios.get(
        `https://email-syncing-backend.vercel.app/mailhook/getAllEmailsData/${userId}`
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
    }
  };

  // ---- Inbox filter counts (used by secondary sidebar) ----
  const inboxAllCount = emails.length;
  const inboxShopifyCount = emails.filter(
    (e) =>
      (e.service || "").toLowerCase().includes("shopify") ||
      (e.subject || "").toLowerCase().includes("shopify") ||
      e.stepType === "shopify-test-parent" ||
      !!e.extraFields?.storeName
  ).length;
  const inboxCustomCount = emails.filter(
    (e) =>
      !(
        (e.service || "").toLowerCase().includes("shopify") ||
        (e.subject || "").toLowerCase().includes("shopify") ||
        e.stepType === "shopify-test-parent" ||
        !!e.extraFields?.storeName
      )
  ).length;
  // isReplied: matches Inbox.js isThreadReplied logic exactly
  const isReplied = (e) => {
    if (!e) return false;
    const msgs = e.replies || e.conversation || e.discussion || [];
    const latestMsg = msgs.length > 0 ? msgs[msgs.length - 1] : e;
    if (e.leadStatus === "replied" || e.leadStatus === "customer_replied") return true;
    if (e.leadStatus === "awaiting" || e.awaitingReply === true) return false;
    return latestMsg.direction === "incoming";
  };
  const inboxRepliedCount = emails.filter(isReplied).length;

  const inboxAwaitingCount = emails.filter(
    (e) =>
      e.leadStatus !== "secured" &&
      e.leadStatus !== "closed" &&
      !isReplied(e)
  ).length;
  const inboxSecuredCount = emails.filter((e) => e.leadStatus === "secured").length;

  const inboxActiveFilter = new URLSearchParams(location.search).get("filter") || "all";

  const handleSaveOrgSettings = async () => {
    try {
      setIsSavingOrg(true);
      const currentUserId = userId || user?._id;
      if (currentUserId) {
        await axios.put(
          `https://email-syncing-backend.vercel.app/auth/updateUserAndOrganization/${currentUserId}`,
          {
            organizationName: orgForm.organizationName,
            Region: orgForm.region,
            TimeZone: orgForm.timezone,
            country: orgForm.country,
            PartnerLink: orgForm.partnerLink,
          }
        );
      }
      const updatedUserObj = {
        ...(user || {}),
        organizationName: orgForm.organizationName,
        companyName: orgForm.organizationName,
        Region: orgForm.region,
        TimeZone: orgForm.timezone,
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
        await fetch(`https://email-syncing-backend.vercel.app/auth/logout/${currentUserId}`, {
          method: "POST",
        }).catch(() => {});
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
    { id: "scenarios", label: "Scenarios", icon: FiZap, path: "/scenarios/all" },
    { id: "connection", label: "Connection", icon: FiKey, path: "/connection" },
    { id: "templates", label: "Templates", icon: FiFileText, path: "/templates" },
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
      location.pathname.startsWith(`${route}/`)
  ) || location.pathname.startsWith("/organization/");
  // Dynamic Secondary Sub-Nav Definitions based on current route
  const getSecondaryNav = () => {
  const path = location.pathname;

  if (path.startsWith("/inbox")) {
    return { type: "inbox" };
  }

  if (path.startsWith("/scenarios")) {
    return {
      type: "standard",
      title: "Scenarios",
      items: [
        {
          id: "all",
          label: "All scenarios",
          path: "/scenarios/all",
        },
        {
          id: "shopify",
          label: "Shopify scenarios",
          path: "/scenarios/shopify",
        },
        {
          id: "custom",
          label: "Custom scenarios",
          path: "/scenarios/others",
        },
      ],
    };
  }

  if (path.startsWith("/templates")) {
    return {
      type: "standard",
      title: "Templates",
      items: [
        {
          id: "shopify",
          label: "Shopify template",
          path: "/templates",
        },
        {
          id: "custom",
          label: "Custom template",
          path: "/templates/general",
        },
      ],
    };
  }

  if (path.startsWith("/connection")) {
    return {
      type: "standard",
      title: "Connections",
      items: [
        {
          id: "all",
          label: "All connections",
          path: "/connection",
        },
        {
          id: "verified",
          label: "Verified connections",
          path: "/connection?status=verified",
        },
      ],
    };
  }

  return {
    type: "organization",
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
          {
            id: "teams",
            label: "Teams",
            path: "/teams",
          },
          {
            id: "users",
            label: "Users",
            path: "/organization/users",
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
            badge: "Free",
          },
          {
            id: "credit-usage",
            label: "Credit usage",
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
    <div className="flex h-screen bg-[#F7F7FA] font-inter text-slate-900 overflow-hidden">
      {/* ------------------------------------------------------------- */}
      {/* 1. PRIMARY MAIN SIDEBAR (Black Vertical Strip with Upgrade & Security) */}
      {/* ------------------------------------------------------------- */}
      <aside className="w-[68px] bg-black flex flex-col items-center py-4 shrink-0 shadow-lg z-20 justify-between">
        <div className="flex flex-col items-center w-full">
          {/* App Logo */}
          <Link
            to="/dashboard"
            className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-white/10 text-white font-bold text-lg mb-6 hover:bg-white/20 transition"
            title="Zenith Platform"
          >
            <span className="bg-gradient-to-tr from-purple-200 to-white bg-clip-text text-transparent">
              Z
            </span>
          </Link>

          {/* Main Navigation */}
          <nav className="flex flex-col gap-3 w-full px-2">
            {primaryNav.map((item) => {
              const Icon = item.icon;
              const isActive =
  (item.id === "org" && isOrganizationActive) ||
  (item.id === "inbox" && location.pathname.startsWith("/inbox")) ||
  (item.id === "scenarios" && location.pathname.startsWith("/scenarios")) ||
  (item.id === "connection" && location.pathname.startsWith("/connection")) ||
  (item.id === "templates" && location.pathname.startsWith("/templates"));
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => navigate(item.path)}
                  className={`group relative flex flex-col items-center justify-center w-full py-2.5 rounded-[8px] transition cursor-pointer ${
                    isActive
                      ? "bg-white/20 text-white font-semibold shadow-inner"
                      : "text-slate-400 hover:bg-white/10 hover:text-white"
                  }`}
                  title={item.label}
                >
                  <Icon size={20} />
                  <span className="text-[10px] font-medium mt-1 tracking-tight">
                    {item.label}
                  </span>
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full" />
                  )}
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
            className={`group relative flex flex-col items-center justify-center w-full py-2 rounded-[8px] transition cursor-pointer ${
              location.pathname === "/security"
                ? "bg-white/20 text-white font-semibold"
                : "text-slate-400 hover:bg-white/10 hover:text-white"
            }`}
            title="Security"
          >
            <FiShield size={18} />
            <span className="text-[9px] font-medium mt-0.5 tracking-tight">
              Security
            </span>
          </button>

          {/* Upgrade Button */}
          <button
            type="button"
            onClick={() => navigate("/pricing")}
            className="w-full py-1.5 rounded-[8px] bg-white text-black hover:bg-slate-200 font-bold text-[10px] transition cursor-pointer shadow-sm text-center"
            title="Upgrade Plan"
          >
            Upgrade
          </button>
        </div>
      </aside>

      {/* ------------------------------------------------------------- */}
      {/* 2. SECONDARY SUB-NAVIGATION SIDEBAR (Gray Theme) */}
      {/* ------------------------------------------------------------- */}
     {/* ------------------------------------------------------------- */}
{/* 2. SECONDARY SUB-NAVIGATION SIDEBAR */}
{/* ------------------------------------------------------------- */}

{secondaryNav.type === "inbox" ? (
  <aside className="w-[230px] shrink-0 border-r border-slate-200 bg-white">
    <div className="px-3 py-4">

      {/* ---- LEAD INBOX group ---- */}
      <div className="mb-3 flex items-center gap-2 border-b border-slate-200 px-2 pb-3">
        <FiInbox className="h-4 w-4 text-slate-900" />
        <h2 className="text-[13px] font-bold text-slate-900">Lead Inbox</h2>
      </div>
      <nav className="flex flex-col gap-0.5">
        {[
          { id: "all",     label: "All",     icon: FiInbox,       count: inboxAllCount,      path: "/inbox" },
          { id: "shopify", label: "Shopify", icon: FiShoppingBag, count: inboxShopifyCount, path: "/inbox?filter=shopify" },
          { id: "custom",  label: "Custom",  icon: FiSliders,     count: inboxCustomCount,  path: "/inbox?filter=custom" },
        ].map((item) => {
          const isActive = inboxActiveFilter === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => navigate(item.path)}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-[13px] transition ${
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

      {/* ---- STATUS FILTERS group ---- */}
      <div className="mt-5 mb-3 flex items-center gap-2 border-b border-slate-200 px-2 pb-3">
        <FiSliders className="h-4 w-4 text-slate-900" />
        <h2 className="text-[13px] font-bold text-slate-900">Status Filters</h2>
      </div>
      <nav className="flex flex-col gap-0.5">
        {[
          { id: "awaiting", label: "Awaiting reply", count: inboxAwaitingCount, path: "/inbox?filter=awaiting" },
          { id: "replied",  label: "Replied",        count: inboxRepliedCount,  path: "/inbox?filter=replied"  },
          { id: "secured",  label: "Secured",        count: inboxSecuredCount,  path: "/inbox?filter=secured"  },
        ].map((item) => {
          const isActive = inboxActiveFilter === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => navigate(item.path)}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-[13px] transition ${
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
  </aside>
) : secondaryNav.type === "organization" ? (
  <aside className="w-[230px] shrink-0 border-r border-slate-200 bg-white">
    <div className="px-3 py-4">
      {secondaryNav.groups.map((group, groupIndex) => {
        const GroupIcon = group.icon;

        return (
          <div
  key={group.id}
  className={groupIndex > 0 ? "mt-5" : ""}
>
           <div className="mb-3 flex items-center gap-2 border-b border-slate-200 px-2 pb-3">
  <GroupIcon className="h-4 w-4 text-slate-900" />

  <h2 className="text-[13px] font-bold text-slate-900">
    {group.title}
  </h2>
</div>

            <nav className="flex flex-col gap-0.5">
              {group.items.map((item) => {
                const isActive = isSecondaryItemActive(item);

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => navigate(item.path)}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-[13px] transition ${
                      isActive
                        ? "bg-slate-200 font-semibold text-slate-950"
                        : "font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-950"
                    }`}
                  >
                    <span>{item.label}</span>

                    {item.badge && (
                      <span className="rounded-full bg-slate-700 px-2 py-0.5 text-[10px] font-semibold text-white">
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
      <div className="mb-3 flex items-center gap-2 border-b border-slate-200 px-2 pb-3">
        <h2 className="text-[13px] font-bold text-slate-900">{secondaryNav.title}</h2>
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
        {/* Top Header Bar */}
        <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 relative z-[100]">
          {/* Left: Organization Badge */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-8 w-8 rounded-[8px] bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
              {userInitials || "MO"}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-slate-900 truncate">
                {user?.organizationName || user?.companyName || "My Organization"}
              </span>
              <span className="text-[10px] text-slate-500 truncate">
                {user?.email || "My Team"}
              </span>
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-3">
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
                onClick={() => setShowNotificationsDropdown((prev) => !prev)}
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
                    <span className="text-xs font-bold text-slate-900">Notifications</span>
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
                onClick={() => setShowProfileDropdown((prev) => !prev)}
                className="h-8 w-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs shadow-sm cursor-pointer hover:ring-2 hover:ring-slate-400 transition select-none"
                title={userName}
              >
                {userInitials}
              </div>

              {showProfileDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-[200] animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900 truncate">{userName}</p>
                    <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
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
        <main className={`flex-1 overflow-hidden ${location.pathname.startsWith("/inbox") || location.pathname.startsWith("/scenarios") || location.pathname.startsWith("/connection") || location.pathname.startsWith("/templates") ? "" : "overflow-y-auto p-4 md:p-6"}`}>
          {children}
        </main>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MODAL 1: CREATE NEW SCENARIO MODAL */}
      {/* ------------------------------------------------------------- */}
      {showCreateScenarioModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[8px] max-w-[620px] w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200">
            <div className="bg-black text-white p-6 flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <span className="text-slate-300 font-normal">+</span> Create New Scenario
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
                  navigate("/scenarios/shopify");
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
                    1 of 1 Used (Limit)
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed pl-13">
                  Capture directory inquiry leads automatically and trigger personalized email response flows.
                </p>
                <div className="text-[11px] text-slate-400 font-medium pl-13">
                  Plan Limit: <span className="font-bold text-slate-700">Max 1 scenario</span>
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
                    0 of 2 Used
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed pl-13">
                  Build custom multi-branch triggers, delay filters, and custom webhook connections.
                </p>
                <div className="text-[11px] text-slate-400 font-medium pl-13">
                  Plan Limit: <span className="font-bold text-slate-700">Max 2 scenarios</span>
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[8px] max-w-[560px] w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200">
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
                  onChange={(e) => setOrgForm({ ...orgForm, region: e.target.value })}
                  className="w-full px-3 py-2 rounded-[8px] border border-slate-300 bg-slate-100 text-xs text-slate-800"
                >
                  <option value="US">US</option>
                  <option value="EU">EU</option>
                  <option value="CA">CA</option>
                  <option value="ASIA">ASIA</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Timezone <span className="text-red-500">*</span>
                </label>
                <select
                  value={orgForm.timezone}
                  onChange={(e) => setOrgForm({ ...orgForm, timezone: e.target.value })}
                  className="w-full px-3 py-2 rounded-[8px] border border-slate-300 bg-white text-xs text-slate-800"
                >
                  <option value="(GMT-05:00) America/Toronto">(GMT-05:00) America/Toronto</option>
                  <option value="(GMT+00:00) UTC">(GMT+00:00) UTC</option>
                  <option value="(GMT+05:00) Asia/Karachi">(GMT+05:00) Asia/Karachi</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Country <span className="text-red-500">*</span>
                </label>
                <select
                  value={orgForm.country}
                  onChange={(e) => setOrgForm({ ...orgForm, country: e.target.value })}
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
                  onChange={(e) => setOrgForm({ ...orgForm, partnerLink: e.target.value })}
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

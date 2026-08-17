import React, { useContext, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FiGrid,
  FiUsers,
  FiHome,
  FiLink,
  FiLayers,
  FiFileText,
  FiActivity,
  FiCreditCard,
  FiList,
  FiArrowLeft,
  FiLogOut,
  FiZap,
  FiShield,
  FiChevronDown,
  FiChevronRight,
  FiPackage,
  FiCpu,
} from "react-icons/fi";
import { UserContext } from "../component/UserContext";

// ── Navigation Structure ──────────────────────────────────────────────────────

const NAV_MAIN = [
  { label: "Overview", path: "/admin/dashboard", icon: FiGrid },
  { label: "Users", path: "/admin/users", icon: FiUsers },
  { label: "Organizations", path: "/admin/organizations", icon: FiHome },
  { label: "Connections", path: "/admin/connections", icon: FiLink },
];

const NAV_REPORTS = [
  { label: "Scenarios", path: "/admin/reports/scenarios", icon: FiLayers },
  { label: "Templates", path: "/admin/reports/templates", icon: FiFileText },
  { label: "Activity", path: "/admin/reports/user-activity", icon: FiActivity },
];

const NAV_CMS = [
  { label: "CMS Products", path: "/admin/product-page", icon: FiPackage },
  { label: "Master AI Module", path: "/admin/ai-config", icon: FiCpu },
];

const NAV_SAAS = [
  { label: "Plans & Pricing", path: "/admin/plans", icon: FiLayers },
  { label: "Stripe Vault", path: "/admin/stripe", icon: FiCreditCard },
  { label: "Audit Logs", path: "/admin/audit-logs", icon: FiList },
];

// ── NavItem Component ─────────────────────────────────────────────────────────

const NavItem = ({ item, collapsed }) => {
  const location = useLocation();
  const Icon = item.icon;
  const isActive =
    location.pathname === item.path ||
    (item.path !== "/admin/dashboard" && location.pathname.startsWith(item.path));

  return (
    <Link
      to={item.path}
      title={collapsed ? item.label : undefined}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-150 group ${
        isActive
          ? "bg-white/10 text-amber-400 font-semibold"
          : "text-slate-400 hover:text-white hover:bg-white/8"
      }`}
    >
      <Icon
        size={15}
        className={`shrink-0 ${isActive ? "text-amber-400" : "text-slate-500 group-hover:text-slate-300"}`}
      />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </Link>
  );
};

// ── NavSection Component ──────────────────────────────────────────────────────

const NavSection = ({ label, items, collapsed }) => (
  <div className="mb-1">
    {!collapsed && (
      <p className="px-3 mb-1 text-[9px] font-bold text-slate-600 uppercase tracking-widest">
        {label}
      </p>
    )}
    <div className="space-y-0.5">
      {items.map((item) => (
        <NavItem key={item.path} item={item} collapsed={collapsed} />
      ))}
    </div>
  </div>
);

// ── Main Layout ───────────────────────────────────────────────────────────────

const PlatformAdminLayout = ({ children, pageTitle, pageSubtitle }) => {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    if (setUser) setUser(null);
    navigate("/login");
  };

  // Derive current page name from path for breadcrumb
  const allNavItems = [...NAV_MAIN, ...NAV_REPORTS, ...NAV_CMS, ...NAV_SAAS];
  const currentPage = allNavItems.find((n) => location.pathname.startsWith(n.path) && n.path !== "/admin/dashboard")
    || allNavItems.find((n) => location.pathname === n.path)
    || { label: "Admin" };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* ── SIDEBAR ──────────────────────────────────────────────────────── */}
      <aside
        className={`${
          collapsed ? "w-16" : "w-60"
        } bg-slate-900 text-white flex flex-col flex-shrink-0 min-h-screen transition-all duration-200`}
      >
        {/* Brand */}
        <div
          className={`p-4 border-b border-slate-800 flex items-center ${collapsed ? "justify-center" : "justify-between"} gap-2`}
        >
          {!collapsed && (
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-8 w-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-black text-xs shrink-0 shadow">
                PA
              </div>
              <div className="min-w-0">
                <h1 className="font-bold text-sm text-white tracking-wide leading-tight">
                  Platform Admin
                </h1>
                <span className="text-[9px] text-amber-400 font-semibold uppercase tracking-widest">
                  SaaS Owner
                </span>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="h-8 w-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-black text-xs shadow">
              PA
            </div>
          )}
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="ml-auto text-slate-500 hover:text-slate-300 transition p-1 rounded"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <FiChevronRight size={14} /> : <FiChevronDown size={14} className="rotate-90" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
          <NavSection label="Management" items={NAV_MAIN} collapsed={collapsed} />
          <div className="border-t border-slate-800/80 pt-3">
            <NavSection label="Reports" items={NAV_REPORTS} collapsed={collapsed} />
          </div>
          <div className="border-t border-slate-800/80 pt-3">
            <NavSection label="CMS & AI" items={NAV_CMS} collapsed={collapsed} />
          </div>
          <div className="border-t border-slate-800/80 pt-3">
            <NavSection label="SaaS Owner" items={NAV_SAAS} collapsed={collapsed} />
          </div>
        </nav>

        {/* Bottom Links */}
        <div className="p-3 border-t border-slate-800 space-y-0.5">
          <Link
            to="/dashboard"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-white/8 transition"
          >
            <FiArrowLeft size={14} className="shrink-0" />
            {!collapsed && <span>Return to User App</span>}
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition"
          >
            <FiLogOut size={14} className="shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 h-14 px-6 flex items-center justify-between flex-shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
              Replex Engine
            </span>
            <span className="h-3.5 w-px bg-slate-200" />
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
              <FiShield size={10} />
              SaaS Owner Controls
            </span>
            {pageTitle && (
              <>
                <span className="h-3.5 w-px bg-slate-200" />
                <span className="text-xs font-semibold text-slate-700">{pageTitle}</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-[10px] border border-amber-200">
                {user?.fullName ? user.fullName[0].toUpperCase() : user?.email?.[0]?.toUpperCase() || "A"}
              </div>
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-[11px] font-semibold text-slate-800 leading-tight">
                  {user?.fullName || "Admin"}
                </span>
                <span className="text-[10px] text-slate-400 leading-tight">{user?.email}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Body */}
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};

export default PlatformAdminLayout;

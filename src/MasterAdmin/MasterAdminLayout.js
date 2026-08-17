import React, { useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FiGrid,
  FiLayers,
  FiCreditCard,
  FiUsers,
  FiHome,
  FiShield,
  FiList,
  FiArrowLeft,
} from "react-icons/fi";
import { UserContext } from "../component/UserContext";

const MasterAdminLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  const navItems = [
    { label: "Overview", path: "/admin/master-dashboard", icon: FiGrid },
    { label: "Plans & Pricing", path: "/admin/plans", icon: FiLayers },
    { label: "Stripe Vault", path: "/admin/stripe", icon: FiCreditCard },
    { label: "User Management", path: "/admin/users", icon: FiUsers },
    { label: "Organizations", path: "/admin/organizations", icon: FiHome },
    { label: "Audit Logs", path: "/admin/audit-logs", icon: FiList },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* SAAS OWNER / PLATFORM ADMIN SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col flex-shrink-0 min-h-screen">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-sm">
              SA
            </div>
            <div>
              <h1 className="font-bold text-sm text-white tracking-wide">Platform Admin</h1>
              <span className="text-[10px] text-amber-400 font-medium uppercase tracking-wider">
                SaaS Owner
              </span>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition ${
                  active
                    ? "bg-slate-800 text-amber-400 font-semibold shadow-xs"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition px-3 py-2 rounded-lg hover:bg-slate-800"
          >
            <FiArrowLeft size={14} />
            <span>Return to User App</span>
          </Link>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOP HEADER */}
        <header className="bg-white border-b border-slate-200 h-16 px-6 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Replex SaaS Engine
            </span>
            <span className="h-4 w-px bg-slate-200" />
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
              <FiShield size={12} />
              SaaS Owner Controls
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
                {user?.fullName ? user.fullName[0].toUpperCase() : "A"}
              </div>
              <div className="flex flex-col text-right">
                <span className="text-xs font-semibold text-slate-900">
                  {user?.fullName || "Admin / SaaS Owner"}
                </span>
                <span className="text-[10px] text-slate-400">{user?.email}</span>
              </div>
            </div>
          </div>
        </header>

        {/* BODY CONTENT */}
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};

export default MasterAdminLayout;

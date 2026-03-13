import React, { useState, useEffect, useRef, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FiGrid,
  FiLayers,
  FiFileText,
  FiChevronDown,
  FiChevronRight,
  FiZap,
  FiSettings,
  FiGitBranch,
  FiMail,
  FiMenu,
  FiX,
  FiLogOut,
  FiUser,
} from "react-icons/fi";
import { jwtDecode } from "jwt-decode";
import SidebarTooltip from "./SidebarTooltip";
import { UserContext } from "./UserContext";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading } = useContext(UserContext);

  const plan = user?.subscription?.plan || "free";

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isScenariosOpen, setIsScenariosOpen] = useState(true);
  const [role, setRole] = useState("user");

  const [guideStep, setGuideStep] = useState(0);
  const token = localStorage.getItem("usertoken");
  const userId = localStorage.getItem("userid");

  const UpgradeBadge = () => (
    <Link
      to="/pricing"
      className="group flex items-center justify-between px-3 py-2 rounded-lg
      border border-indigo-200 bg-indigo-50
      text-indigo-700 text-sm font-semibold
      hover:bg-indigo-100 transition
      focus:outline-none focus:ring-2 focus:ring-indigo-300"
    >
      <span>Upgrade Plan</span>
      <span
        className="text-[11px] font-bold tracking-wide
      bg-indigo-600 text-white
      px-2 py-0.5 rounded-full"
      >
        PRO
      </span>
    </Link>
  );

  useEffect(() => {
    const fetchGuide = async () => {
      try {
        const res = await fetch(
          `https://email-syncing-backend.vercel.app/auth/guide/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await res.json();

        if (data.sidebar.completed) {
          setGuideStep(0);
          return;
        }

        setGuideStep(data.sidebar.step || 1);
      } catch (err) {
        console.error("Guide fetch error", err);
      }
    };

    if (token) fetchGuide();
  }, []);

  const handleLogout = async () => {
    await fetch(
      `https://email-syncing-backend.vercel.app/auth/logout/${userId}`,
      {
        method: "POST",
      },
    );
    localStorage.clear();
    navigate("/login", { replace: true });
    window.location.reload();
  };

  const isActive = (path) => location.pathname === path;

  const leadRef = useRef(null);
  const allScenarioRef = useRef(null);
  const shopifyScenarioRef = useRef(null);
  const customScenarioRef = useRef(null);

  const LAST_STEP = 4;

  const nextGuide = async () => {
    const next = guideStep + 1;

    if (next > LAST_STEP) {
      setGuideStep(0);

      await fetch(
        `https://email-syncing-backend.vercel.app/auth/guide/${userId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            type: "sidebar",
            completed: true,
            step: LAST_STEP + 1,
          }),
        },
      );
      window.dispatchEvent(new Event("sidebarGuideCompleted"));
      return;
    }

    setGuideStep(next);

    await fetch(
      `https://email-syncing-backend.vercel.app/auth/guide/${userId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: "sidebar",
          step: next,
        }),
      },
    );
  };

  const skipGuide = async () => {
    setGuideStep(0);

    await fetch(
      `https://email-syncing-backend.vercel.app/auth/guide/${userId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: "sidebar",
          completed: true,
        }),
      },
    );
    window.dispatchEvent(new Event("sidebarGuideCompleted"));
  };

  useEffect(() => {
    const token = localStorage.getItem("usertoken");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded?.payLoad?.role) setRole(decoded.payLoad.role);
      } catch (_) {}
    }
  }, []);

  const renderNavLink = (label, Icon, to, ref = null, stepMatch = null) => (
    <Link
      to={to}
      replace
      ref={ref}
      onClick={() => window.innerWidth < 768 && setIsSidebarOpen(false)}
      className={`flex items-center space-x-3 px-3 py-2 rounded-lg 
        text-sm font-medium transition
        ${
          isActive(to)
            ? "bg-indigo-100 text-indigo-700 font-semibold"
            : "text-gray-700 hover:bg-gray-100 hover:text-indigo-600"
        }
        ${guideStep === stepMatch ? "sidebar-highlight" : ""}
      `}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </Link>
  );

  const renderUserSidebar = () => (
    <>
      <div className="flex items-center justify-between px-8 py-4 border-b bg-white">
        <Link to="/organization" className="flex items-center space-x-2">
          <FiMail className="text-indigo-500 text-3xl" />
          <span className="font-semibold text-lg">Replex Engine</span>
        </Link>
        <button
          onClick={() => setIsSidebarOpen(false)}
          className="md:hidden text-gray-500 hover:text-indigo-600"
        >
          <FiX className="w-6 h-6" />
        </button>
      </div>

      <nav className="px-4 py-6 space-y-6 overflow-y-auto">
        {/* MAIN */}
        <div>
          <p className="text-xs text-gray-400 uppercase mb-2">Main</p>
          {renderNavLink("Organization", FiGrid, "/organization")}
          {renderNavLink("Lead Conversation", FiMail, "/inbox", leadRef, 1)}
        </div>

        <div>
          <p className="text-xs text-gray-400 uppercase mb-2">Automations</p>

          <button
            onClick={() => setIsScenariosOpen(!isScenariosOpen)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm 
              ${
                location.pathname.startsWith("/scenarios")
                  ? "bg-indigo-100 text-indigo-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
          >
            <div className="flex items-center space-x-3">
              <FiLayers className="w-5 h-5" />
              <span>Scenarios</span>
            </div>

            {isScenariosOpen ? <FiChevronDown /> : <FiChevronRight />}
          </button>

          <div
            className={`ml-8 mt-2 space-y-1 overflow-hidden transition-all duration-300 
            ${isScenariosOpen ? "max-h-[200px]" : "max-h-0"}`}
          >
            {renderNavLink(
              "All Scenarios",
              FiZap,
              "/scenarios/all",
              allScenarioRef,
              2,
            )}
            {renderNavLink(
              "Shopify Scenario",
              FiGitBranch,
              "/scenarios/shopify",
              shopifyScenarioRef,
              3,
            )}
            {renderNavLink(
              "Custom",
              FiSettings,
              "/scenarios/others",
              customScenarioRef,
              4,
            )}
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-400 uppercase mb-2">Resources</p>
          {renderNavLink("Shopify Templates", FiFileText, "/templates")}
          {renderNavLink("General Templates", FiFileText, "/templates/general")}
          {renderNavLink("Connection", FiZap, "/connection")}
        </div>
      </nav>
      <div className="mt-auto border-t px-4 py-4 bg-white space-y-2">
        {!loading && plan !== "pro" && <UpgradeBadge />}
        {!loading && plan === "pro" && (
          <div
            className="flex items-center justify-center gap-2 px-3 py-2 
    rounded-lg text-xs font-semibold
    bg-gradient-to-r from-emerald-500/10 to-teal-500/10
    text-emerald-700 border border-emerald-200"
          >
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500"></span>
            PRO plan active
          </div>
        )}

        <Link
          to="/profile"
          className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium
      ${
        isActive("/profile")
          ? "bg-indigo-100 text-indigo-700"
          : "text-gray-700 hover:bg-gray-100 hover:text-indigo-600"
      }`}
        >
          <FiUser className="w-5 h-5" />
          <span>Profile</span>
        </Link>

        <button
          onClick={handleLogout}
          className="mt-2 w-full flex items-center space-x-3 px-3 py-2 rounded-lg
      text-sm font-medium text-red-600 hover:bg-red-50"
        >
          <FiLogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </>
  );
  const renderAdminSidebar = () => (
    <>
      <div className="flex items-center justify-between py-5 px-6 border-b bg-white">
        <Link to="/admin/dashboard" className="flex items-center space-x-2">
          <FiGrid className="text-indigo-500 text-2xl" />
          <span className="font-semibold text-lg">Admin Panel</span>
        </Link>

        <button
          onClick={() => setIsSidebarOpen(false)}
          className="md:hidden text-gray-500 hover:text-indigo-600"
        >
          <FiX className="w-6 h-6" />
        </button>
      </div>

      <nav className="px-4 py-6 space-y-6 overflow-y-auto flex-1">
        <div>
          <p className="text-xs text-gray-400 uppercase mb-2">Admin</p>
          {renderNavLink("Dashboard", FiGrid, "/admin/dashboard")}
          {renderNavLink("Users", FiUser, "/admin/users")}
          {renderNavLink("Connections", FiZap, "/admin/connections")}
        </div>

        <div>
          <p className="text-xs text-gray-400 uppercase mb-2">Reports</p>
          {renderNavLink(
            "User Activity",
            FiFileText,
            "/admin/reports/user-activity",
          )}
          {renderNavLink(
            "Email Tracking",
            FiMail,
            "/admin/reports/email-tracking",
          )}
          {renderNavLink("Scenarios", FiLayers, "/admin/reports/scenarios")}
          {renderNavLink("Templates", FiFileText, "/admin/reports/templates")}
        </div>
      </nav>

      <div className="border-t px-4 py-4 bg-white">
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg
        text-sm font-medium text-red-600 hover:bg-red-50"
        >
          <FiLogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      <button
        onClick={() => setIsSidebarOpen(true)}
        className="fixed top-4 right-4 z-50 md:hidden p-2 bg-white shadow-lg rounded-full text-indigo-600"
      >
        <FiMenu className="w-6 h-6" />
      </button>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-40 h-full w-64 bg-white border-r 
    shadow-xl transition-transform flex flex-col
    ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
  `}
      >
        {/* {renderUserSidebar()} */}
        {role === "admin" ? renderAdminSidebar() : renderUserSidebar()}
      </aside>

      {guideStep > 0 && guideStep <= 4 && (
        <SidebarTooltip
          step={guideStep}
          refs={{
            leadRef,
            allScenarioRef,
            shopifyScenarioRef,
            customScenarioRef,
          }}
          onNext={nextGuide}
          onSkip={skipGuide}
        />
      )}
    </>
  );
};

export default Sidebar;

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

  const leadRef = useRef(null);
  const allScenarioRef = useRef(null);
  const shopifyScenarioRef = useRef(null);
  const customScenarioRef = useRef(null);

  const LAST_STEP = 4;

  const isActive = (path) => location.pathname === path;
  const isScenarioActive = location.pathname.startsWith("/scenarios");
  const isProfileActive = isActive("/profile");

  const UpgradeBadge = () => (
    <Link
      to="/pricing"
      className="group flex items-center justify-between rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-700 transition-colors hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-300"
    >
      <span>Upgrade Plan</span>

      <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-[11px] font-bold tracking-wide text-white">
        PRO
      </span>
    </Link>
  );

  useEffect(() => {
    const fetchGuide = async () => {
      try {
        const res = await fetch(`https://email-syncing-backend.vercel.app/auth/guide/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

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
  }, [token, userId]);

  useEffect(() => {
    const storedToken = localStorage.getItem("usertoken");

    if (storedToken) {
      try {
        const decoded = jwtDecode(storedToken);
        if (decoded?.payLoad?.role) setRole(decoded.payLoad.role);
      } catch (_) {
        // Keep default user role if token decode fails
      }
    }
  }, []);

  const handleLogout = async () => {
    await fetch(`https://email-syncing-backend.vercel.app/auth/logout/${userId}`, {
      method: "POST",
    });

    localStorage.clear();
    navigate("/login", { replace: true });
    window.location.reload();
  };

  const nextGuide = async () => {
    const next = guideStep + 1;

    if (next > LAST_STEP) {
      setGuideStep(0);

      await fetch(`https://email-syncing-backend.vercel.app/auth/guide/${userId}`, {
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
      });

      window.dispatchEvent(new Event("sidebarGuideCompleted"));
      return;
    }

    setGuideStep(next);

    await fetch(`https://email-syncing-backend.vercel.app/auth/guide/${userId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        type: "sidebar",
        step: next,
      }),
    });
  };

  const skipGuide = async () => {
    setGuideStep(0);

    await fetch(`https://email-syncing-backend.vercel.app/auth/guide/${userId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        type: "sidebar",
        completed: true,
      }),
    });

    window.dispatchEvent(new Event("sidebarGuideCompleted"));
  };

  const renderNavLink = (label, Icon, to, ref = null, stepMatch = null) => {
    const active = isActive(to);

    return (
      <Link
        to={to}
        replace
        ref={ref}
        onClick={() => window.innerWidth < 768 && setIsSidebarOpen(false)}
        className={`flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors
          ${
            active
              ? "bg-indigo-100 text-indigo-700 font-semibold"
              : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
          }
          ${guideStep === stepMatch ? "sidebar-highlight" : ""}
        `}
      >
        <Icon
          className={`h-5 w-5 shrink-0 ${
            active ? "text-indigo-700" : "text-gray-500"
          }`}
        />
        <span>{label}</span>
      </Link>
    );
  };

  const renderUserSidebar = () => (
    <>
      <div className="flex items-center justify-between border-b bg-white px-8 py-4">
        <Link
          to="/dashboard"
          className="flex items-center space-x-2 text-gray-900"
        >
          <BrandLogo />
        </Link>

        <button
          type="button"
          onClick={() => setIsSidebarOpen(false)}
          className="text-gray-500 transition-colors hover:text-gray-900 md:hidden"
        >
          <FiX className="h-6 w-6" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-6">
        <div className="space-y-6">
          <div>
            <p className="mb-2 text-xs uppercase text-gray-400">Main</p>

            <div className="space-y-1">
              {renderNavLink("Dashboard", FiGrid, "/dashboard")}
              {renderNavLink("Lead Conversation", FiMail, "/inbox", leadRef, 1)}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs uppercase text-gray-400">Automations</p>

            <button
              type="button"
              onClick={() => setIsScenariosOpen(!isScenariosOpen)}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors
                ${
                  isScenarioActive
                    ? "bg-indigo-100 text-indigo-700 font-semibold"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                }
              `}
            >
              <div className="flex items-center space-x-3">
                <FiLayers
                  className={`h-5 w-5 shrink-0 ${
                    isScenarioActive ? "text-indigo-700" : "text-gray-500"
                  }`}
                />
                <span>Scenarios</span>
              </div>

              {isScenariosOpen ? (
                <FiChevronDown
                  className={`h-4 w-4 ${
                    isScenarioActive ? "text-indigo-700" : "text-gray-500"
                  }`}
                />
              ) : (
                <FiChevronRight
                  className={`h-4 w-4 ${
                    isScenarioActive ? "text-indigo-700" : "text-gray-500"
                  }`}
                />
              )}
            </button>

            <div
              className={`ml-8 mt-2 space-y-1 overflow-hidden transition-all duration-300 ${
                isScenariosOpen ? "max-h-[200px]" : "max-h-0"
              }`}
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
            <p className="mb-2 text-xs uppercase text-gray-400">Resources</p>

            <div className="space-y-1">
              {renderNavLink("Shopify Templates", FiFileText, "/templates")}
              {renderNavLink(
                "General Templates",
                FiFileText,
                "/templates/general",
              )}
              {renderNavLink("Connections", FiZap, "/connection")}
            </div>
          </div>
        </div>
      </nav>

      {/* <div className="mt-auto space-y-2 border-t bg-white px-4 py-4">
        {!loading && plan !== "pro" && <UpgradeBadge />}

        {!loading && plan === "pro" && (
          <div className="flex items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 px-3 py-2 text-xs font-semibold text-emerald-700">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
            PRO plan active
          </div>
        )}

        <Link
          to="/profile"
          className={`flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors
            ${
              isProfileActive
                ? "bg-indigo-100 text-indigo-700 font-semibold"
                : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            }
          `}
        >
          <FiUser
            className={`h-5 w-5 shrink-0 ${
              isProfileActive ? "text-indigo-700" : "text-gray-500"
            }`}
          />
          <span>Profile</span>
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-2 flex w-full items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
        >
          <FiLogOut className="h-5 w-5 shrink-0 text-red-600" />
          <span>Logout</span>
        </button>
      </div> */}
    </>
  );

  const renderAdminSidebar = () => (
    <>
      <div className="flex items-center justify-between border-b bg-white px-6 py-5">
        <Link
          to="/admin/dashboard"
          className="flex items-center space-x-2 text-gray-900"
        >
          <FiGrid className="text-2xl text-indigo-500" />
          <span className="text-lg font-semibold">Admin Panel</span>
        </Link>

        <button
          type="button"
          onClick={() => setIsSidebarOpen(false)}
          className="text-gray-500 transition-colors hover:text-gray-900 md:hidden"
        >
          <FiX className="h-6 w-6" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-6">
        <div className="space-y-6">
          <div>
            <p className="mb-2 text-xs uppercase text-gray-400">Admin</p>

            <div className="space-y-1">
              {renderNavLink("Dashboard", FiGrid, "/admin/dashboard")}
              {renderNavLink("Users", FiUser, "/admin/users")}
              {renderNavLink("Connections", FiZap, "/admin/connections")}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs uppercase text-gray-400">Reports</p>

            <div className="space-y-1">
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
              {renderNavLink(
                "Templates",
                FiFileText,
                "/admin/reports/templates",
              )}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs uppercase text-gray-400">Pages</p>
            <div className="space-y-1">
              {renderNavLink(
                "Landing Page",
                FiFileText,
                "/admin/pages/landing-page",
              )}
              {renderNavLink("Product Page", FiFileText, "/admin/product-page")}

              {renderNavLink("Scripts", FiFileText, "/admin/pages/scripts")}
            </div>
          </div>
        </div>
      </nav>

      <div className="border-t bg-white px-4 py-4">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
        >
          <FiLogOut className="h-5 w-5 shrink-0 text-red-600" />
          <span>Logout</span>
        </button>
      </div>
    </>
  );
  const BrandLogo = ({ label = "Replex Engine" }) => (
    <>
      <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-zinc-100 ring-1 ring-zinc-200">
        <span className="absolute h-3.5 w-3.5 rounded-full border-[3px] border-zinc-900 border-r-transparent" />
        <span className="absolute right-[5px] top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-zinc-900" />
      </span>

      <span className="text-lg font-semibold tracking-[-0.035em] text-zinc-950">
        {label}
      </span>
    </>
  );
  return (
    <>
      <button
        type="button"
        onClick={() => setIsSidebarOpen(true)}
        className="fixed right-4 top-4 z-50 rounded-full bg-white p-2 text-indigo-600 shadow-lg md:hidden"
      >
        <FiMenu className="h-6 w-6" />
      </button>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      <aside
        className={`sidebar fixed left-0 top-0 z-40 flex h-screen w-64 shrink-0 flex-col border-r bg-white shadow-xl transition-transform duration-300 md:shadow-none
    ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
  `}
      >
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

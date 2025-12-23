import React, { useState, useEffect, useRef } from "react";
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
} from "react-icons/fi";
import { jwtDecode } from "jwt-decode";
import SidebarTooltip from "./SidebarTooltip";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isScenariosOpen, setIsScenariosOpen] = useState(true);
  const [role, setRole] = useState("user");

  // const [guideStep, setGuideStep] = useState(() => {
  //   const saved = localStorage.getItem("sidebarGuideStep");
  //   return saved ? Number(saved) : 1;
  // });

  const [guideStep, setGuideStep] = useState(0);
  const token = localStorage.getItem("usertoken");
const userId=localStorage.getItem("userid")
  useEffect(() => {
    const fetchGuide = async () => {
      try {
        const res = await fetch(`https://email-syncing-backend.vercel.app/auth/guide/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        // ❌ Already completed → don't show
        if (data.sidebar.completed) {
          setGuideStep(0);
          return;
        }

        // ✅ First time / ongoing
        setGuideStep(data.sidebar.step || 1);
      } catch (err) {
        console.error("Guide fetch error", err);
      }
    };

    if (token) fetchGuide();
  }, []);

  const isActive = (path) => location.pathname === path;

  // Tooltip refs
  const leadRef = useRef(null);
  const allScenarioRef = useRef(null);
  const shopifyScenarioRef = useRef(null);
  const customScenarioRef = useRef(null);

 const LAST_STEP = 4; // tumhare sidebar steps (1–4)

const nextGuide = async () => {
  const next = guideStep + 1;

  // 🟢 LAST STEP COMPLETE
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
        completed: true,   // 🔥 THIS WAS MISSING
        step: LAST_STEP + 1, // optional (5)
      }),
    });
window.dispatchEvent(new Event("sidebarGuideCompleted"));
    return;
  }

  // normal step
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

  // ROLE CHECK
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

  // USER SIDEBAR
  const renderUserSidebar = () => (
    <>
      <div className="flex items-center justify-between py-5 px-6 border-b bg-white">
        <Link to="/organization" className="flex items-center space-x-2">
  <FiMail className="text-indigo-500 text-2xl" />
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

        {/* AUTOMATIONS */}
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
              2
            )}
            {renderNavLink(
              "Shopify Scenario",
              FiGitBranch,
              "/scenarios/shopify",
              shopifyScenarioRef,
              3
            )}
            {renderNavLink(
              "Custom",
              FiSettings,
              "/scenarios/others",
              customScenarioRef,
              4
            )}
          </div>
        </div>

        {/* RESOURCES */}
        <div>
          <p className="text-xs text-gray-400 uppercase mb-2">Resources</p>
          {renderNavLink("Shopify Templates", FiFileText, "/templates")}
          {renderNavLink("General Templates", FiFileText, "/templates/general")}
          {renderNavLink("Connection", FiZap, "/connection")}
        </div>
      </nav>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsSidebarOpen(true)}
        className="fixed top-4 right-4 z-50 md:hidden p-2 bg-white shadow-lg rounded-full text-indigo-600"
      >
        <FiMenu className="w-6 h-6" />
      </button>

      {/* Dark Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-full w-64 bg-white border-r 
          shadow-xl transition-transform 
          ${
            isSidebarOpen
              ? "translate-x-0"
              : "-translate-x-full md:translate-x-0"
          }`}
      >
        {renderUserSidebar()}

        {/* Removed Logout Button */}
      </aside>

      {/* TOOLTIP GUIDE */}
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

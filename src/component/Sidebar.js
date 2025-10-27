import React, { useState, useEffect, useContext, useRef } from "react";
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
  FiLogOut,
  FiMail,
} from "react-icons/fi";
import { UserContext } from "./UserContext";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isScenariosOpen, setIsScenariosOpen] = useState(false);
  const scenariosRef = useRef(null);

  const isActive = (path) => location.pathname === path;

  const renderNavLink = (label, Icon, to) => (
    <Link
      to={to}
      replace
      className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
        isActive(to)
          ? "bg-indigo-100 text-indigo-700 font-semibold shadow-sm"
          : "text-gray-700 hover:bg-gray-100 hover:text-indigo-600"
      }`}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </Link>
  );

  useEffect(() => {
    if (location.pathname.startsWith("/scenarios")) {
      setIsScenariosOpen(true);
    }
  }, [location.pathname]);

  const handleLogout = async () => {
    const userId = localStorage.getItem("userid");
    try {
      await fetch(
        `https://email-syncing-backend.vercel.app/auth/logout/${userId}`,
        { method: "POST" }
      );
      localStorage.clear();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <aside
      className={`fixed z-40 top-0 left-0 h-full w-64 bg-gradient-to-b from-gray-50 via-white to-gray-100 text-gray-800 flex flex-col border-r border-gray-200 shadow-sm transition-transform duration-300 md:translate-x-0 ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex items-center space-x-2 py-5 px-6 border-b border-gray-200 bg-white shadow-sm">
        <FiMail className="text-indigo-500 text-2xl" />
        <span className="font-semibold text-lg text-gray-800">Zenith Inbox</span>
      </div>

    
      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
        <div>
          <p className="text-xs text-gray-400 uppercase font-semibold mb-2 tracking-wide">
            Main
          </p>
          {renderNavLink("Organization", FiGrid, "/organization")}
          {renderNavLink("Lead Conversation", FiMail, "/inbox")}
        </div>

        <div>
          <p className="text-xs text-gray-400 uppercase font-semibold mb-2 tracking-wide">
            Automations
          </p>
          <div>
            <button
              onClick={() => setIsScenariosOpen(!isScenariosOpen)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                location.pathname.startsWith("/scenarios")
                  ? "bg-indigo-100 text-indigo-700 font-semibold shadow-sm"
                  : "text-gray-700 hover:bg-gray-100 hover:text-indigo-600"
              }`}
            >
              <div className="flex items-center space-x-3">
                <FiLayers className="w-5 h-5" />
                <span>Scenarios</span>
              </div>
              {isScenariosOpen ? (
                <FiChevronDown className="w-4 h-4" />
              ) : (
                <FiChevronRight className="w-4 h-4" />
              )}
            </button>

            <div
              ref={scenariosRef}
              style={{
                maxHeight: isScenariosOpen
                  ? scenariosRef.current?.scrollHeight + "px"
                  : "0px",
              }}
              className="ml-8 mt-2 space-y-1 overflow-hidden transition-all duration-300"
            >
              {renderNavLink("All Scenarios", FiZap, "/scenarios/all")}
              {renderNavLink(
                "Shopify Scenario",
                FiGitBranch,
                "/scenarios/shopify"
              )}
              {renderNavLink("Custom", FiSettings, "/scenarios/others")}
            </div>
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-400 uppercase font-semibold mb-2 tracking-wide">
            Resources
          </p>
          {renderNavLink("Shopify Templates", FiFileText, "/templates")}
          {renderNavLink("Connection", FiZap, "/connection")}
        </div>
      </nav>

      {/* Logout Button */}
      <div className="px-4 pb-4">
        <button
          onClick={handleLogout}
          className="flex items-center w-full space-x-3 px-3 py-2 rounded-md text-sm text-gray-600 hover:bg-gray-100 hover:text-indigo-600 transition-colors duration-200"
        >
          <FiLogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>

      {/* Footer */}
      <div className="text-xs text-gray-400 border-t border-gray-200 py-3 text-center bg-gray-50">
        © 2025 MailMatrix
      </div>
    </aside>
  );
};

export default Sidebar;

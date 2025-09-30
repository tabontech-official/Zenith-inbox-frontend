import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FiGrid,
  FiLayers,
  FiFileText,
  FiChevronDown,
  FiChevronRight,
  FiZap,      
  FiSettings,  
  FiGitBranch, 
} from "react-icons/fi";

const Sidebar = () => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isScenariosOpen, setIsScenariosOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const renderNavLink = (label, Icon, to) => (
    <Link
      to={to}
      className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors duration-200 ${
        isActive(to)
          ? "bg-white text-purple-700 font-semibold shadow"
          : "text-gray-200 hover:bg-purple-700 hover:text-white"
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

  return (
    <aside
      className={`fixed z-40 top-0 left-0 h-full w-64 bg-gradient-to-b from-purple-600 via-purple-500 to-purple-800 text-white flex flex-col p-6 transition-transform duration-300 md:translate-x-0 ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex items-center space-x-2 mb-10">
        <img
          src="https://placehold.co/40x40/5B21B6/white?text=A"
          alt="Logo"
          className="rounded-full"
        />
        <h1 className="text-lg font-bold">My Organization</h1>
      </div>

      <div className="flex-1 space-y-2 text-sm">
        <div className="text-xs text-gray-200 uppercase font-medium mb-2">
          Main
        </div>
        {renderNavLink("Organization", FiGrid, "/organization")}

        <div className="text-xs text-gray-200 uppercase font-medium mt-6 mb-2">
          Automations
        </div>

        <div>
          <button
            onClick={() => setIsScenariosOpen(!isScenariosOpen)}
            className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors duration-200 ${
              location.pathname.startsWith("/scenarios")
                ? "bg-white text-purple-700 font-semibold shadow"
                : "text-gray-200 hover:bg-purple-700 hover:text-white"
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

          {isScenariosOpen && (
            <div className="ml-8 mt-1 space-y-1">
              {renderNavLink("All Scenarios", FiZap, "/scenarios/all")}
              {renderNavLink("Shopify Scenario", FiGitBranch, "/scenarios/shopify")}
              {renderNavLink("Custom", FiSettings, "/scenarios/others")}
            </div>
          )}
        </div>

        {renderNavLink("Shopify-Templates", FiFileText, "/templates")}
        {renderNavLink("Connection", FiZap, "/connection")}
      </div>

      <div className="mt-auto text-xs text-gray-300 border-t border-purple-500 pt-4">
        © 2025 MailHook
      </div>
    </aside>
  );
};

export default Sidebar;

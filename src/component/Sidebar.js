import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FiGrid,
  FiLayers,
  FiFileText,
  FiLink,
} from "react-icons/fi"; // Icons

const Sidebar = () => {
  const [activeLink, setActiveLink] = useState("organization");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const renderNavLink = (name, label, Icon, to) => (
    <Link
      to={to}
      onClick={() => setActiveLink(name)}
      className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors duration-200 ${
        activeLink === name
          ? "bg-white text-purple-700 font-semibold shadow"
          : "text-gray-200 hover:bg-purple-700 hover:text-white"
      }`}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </Link>
  );

  return (
    <aside
      className={`fixed z-40 top-0 left-0 h-full w-64 bg-gradient-to-b from-purple-600 via-purple-500 to-purple-800 text-white flex flex-col p-6 transition-transform duration-300 md:translate-x-0 ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* Logo */}
      <div className="flex items-center space-x-2 mb-10">
        <img
          src="https://placehold.co/40x40/5B21B6/white?text=A"
          alt="Logo"
          className="rounded-full"
        />
        <h1 className="text-lg font-bold">My Organization</h1>
      </div>

      {/* Navigation */}
      <div className="flex-1 space-y-2 text-sm">
        <div className="text-xs text-gray-200 uppercase font-medium mb-2">
          Main
        </div>
        {renderNavLink("organization", "Organization", FiGrid, "/organization")}

        <div className="text-xs text-gray-200 uppercase font-medium mt-6 mb-2">
          Automations
        </div>
        {renderNavLink("scenarios", "Scenarios", FiLayers, "/scenarios")}
        {renderNavLink("templates", "Templates", FiFileText, "/templates")}
        {renderNavLink("connections", "Connections", FiLink, "/connection")}
      </div>

      {/* Footer */}
      <div className="mt-auto text-xs text-gray-300 border-t border-purple-500 pt-4">
        © 2025 MailHook
      </div>
    </aside>
  );
};

export default Sidebar;

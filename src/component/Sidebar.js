// import React, { useState, useEffect, useRef } from "react";
// import { Link, useLocation, useNavigate } from "react-router-dom";
// import {
//   FiGrid,
//   FiLayers,
//   FiFileText,
//   FiChevronDown,
//   FiChevronRight,
//   FiZap,
//   FiSettings,
//   FiGitBranch,
//   FiLogOut,
//   FiMail,
//   FiMenu,
//   FiX,
//   FiUser,
//   FiUsers,
//   FiBarChart2,
//   FiDatabase,
// } from "react-icons/fi";
// import {jwtDecode} from "jwt-decode";

// const Sidebar = () => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//   const [isScenariosOpen, setIsScenariosOpen] = useState(false);
//   const [isReportsOpen, setIsReportsOpen] = useState(false);
//   const [role, setRole] = useState("user");
//   const scenariosRef = useRef(null);
//   const reportsRef = useRef(null);

//   const isActive = (path) => location.pathname === path;

//   const renderNavLink = (label, Icon, to) => (
//     <Link
//       to={to}
//       replace
//       onClick={() => {
//         if (window.innerWidth < 768) setIsSidebarOpen(false);
//       }}
//       className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
//         isActive(to)
//           ? "bg-indigo-100 text-indigo-700 font-semibold shadow-sm"
//           : "text-gray-700 hover:bg-gray-100 hover:text-indigo-600"
//       }`}
//     >
//       <Icon className="w-5 h-5" />
//       <span>{label}</span>
//     </Link>
//   );

//   useEffect(() => {
//   const token = localStorage.getItem("usertoken");
//   if (token) {
//     try {
//       const decoded = jwtDecode(token);
//       console.log("Decoded Token:", decoded);
//       if (decoded?.payLoad?.role) {
//         setRole(decoded.payLoad.role);
//       }
//     } catch (error) {
//       console.error("Invalid token:", error);
//     }
//   }
// }, []);


//   useEffect(() => {
//     if (location.pathname.startsWith("/scenarios")) {
//       setIsScenariosOpen(true);
//     }
//     if (location.pathname.startsWith("/admin/reports")) {
//       setIsReportsOpen(true);
//     }
//   }, [location.pathname]);

//   const handleLogout = async () => {
//     const userId = localStorage.getItem("userid");
//     try {
//       if (userId) {
//         await fetch(
//           `https://email-syncing-backend.vercel.app/auth/logout/${userId}`,
//           { method: "POST" }
//         );
//       }
//       localStorage.clear();
//       setIsSidebarOpen(false);
//       navigate("/login", { replace: true });
//     } catch (error) {
//       console.error("Logout failed:", error);
//     }
//   };

//   const SidebarHeader = ({ title, Icon }) => (
//     <div className="flex items-center justify-between py-5 px-6 border-b border-gray-200 bg-white shadow-sm">
//       <div className="flex items-center space-x-2">
//         <Icon className="text-indigo-500 text-2xl" />
//         <span className="font-semibold text-lg text-gray-800">{title}</span>
//       </div>
//       <button
//         onClick={() => setIsSidebarOpen(false)}
//         className="md:hidden text-gray-500 hover:text-indigo-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
//         aria-label="Close sidebar"
//       >
//         <FiX className="w-6 h-6" />
//       </button>
//     </div>
//   );

//   const renderUserSidebar = () => (
//     <>
//       <SidebarHeader title="Zenith Inbox" Icon={FiMail} />
//       <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
//         <div>
//           <p className="text-xs text-gray-400 uppercase font-semibold mb-2 tracking-wide">
//             Main
//           </p>
//           {renderNavLink("Organization", FiGrid, "/organization")}
//           {renderNavLink("Lead Conversation", FiMail, "/inbox")}
//         </div>

//         <div>
//           <p className="text-xs text-gray-400 uppercase font-semibold mb-2 tracking-wide">
//             Automations
//           </p>
//           <button
//             onClick={() => setIsScenariosOpen(!isScenariosOpen)}
//             className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
//               location.pathname.startsWith("/scenarios")
//                 ? "bg-indigo-100 text-indigo-700 font-semibold shadow-sm"
//                 : "text-gray-700 hover:bg-gray-100 hover:text-indigo-600"
//             }`}
//           >
//             <div className="flex items-center space-x-3">
//               <FiLayers className="w-5 h-5" />
//               <span>Scenarios</span>
//             </div>
//             {isScenariosOpen ? (
//               <FiChevronDown className="w-4 h-4" />
//             ) : (
//               <FiChevronRight className="w-4 h-4" />
//             )}
//           </button>

//           <div
//             ref={scenariosRef}
//             style={{
//               maxHeight: isScenariosOpen
//                 ? scenariosRef.current?.scrollHeight + "px"
//                 : "0px",
//             }}
//             className="ml-8 mt-2 space-y-1 overflow-hidden transition-all duration-300"
//           >
//             {renderNavLink("All Scenarios", FiZap, "/scenarios/all")}
//             {renderNavLink("Shopify Scenario", FiGitBranch, "/scenarios/shopify")}
//             {renderNavLink("Custom", FiSettings, "/scenarios/others")}
//           </div>
//         </div>

//         <div>
//           <p className="text-xs text-gray-400 uppercase font-semibold mb-2 tracking-wide">
//             Resources
//           </p>
//           {renderNavLink("Shopify Templates", FiFileText, "/templates")}
//           {renderNavLink("Connection", FiZap, "/connection")}
//         </div>
//       </nav>
//     </>
//   );

//   const renderAdminSidebar = () => (
//     <>
//       <SidebarHeader title="Admin Panel" Icon={FiGrid} />
//       <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
//         <div>
//           <p className="text-xs text-gray-400 uppercase font-semibold mb-2 tracking-wide">
//             Overview
//           </p>
//           {renderNavLink("Dashboard", FiBarChart2, "/admin/dashboard")}
//           {renderNavLink("All Users", FiUsers, "/admin/users")}
//           {renderNavLink("Connections", FiDatabase, "/admin/connections")}
//         </div>

//         <div>
//           <p className="text-xs text-gray-400 uppercase font-semibold mb-2 tracking-wide">
//             Reports & Tracking
//           </p>
//           <button
//             onClick={() => setIsReportsOpen(!isReportsOpen)}
//             className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
//               location.pathname.startsWith("/admin/reports")
//                 ? "bg-indigo-100 text-indigo-700 font-semibold shadow-sm"
//                 : "text-gray-700 hover:bg-gray-100 hover:text-indigo-600"
//             }`}
//           >
//             <div className="flex items-center space-x-3">
//               <FiLayers className="w-5 h-5" />
//               <span>Reports</span>
//             </div>
//             {isReportsOpen ? (
//               <FiChevronDown className="w-4 h-4" />
//             ) : (
//               <FiChevronRight className="w-4 h-4" />
//             )}
//           </button>

//           <div
//             ref={reportsRef}
//             style={{
//               maxHeight: isReportsOpen
//                 ? reportsRef.current?.scrollHeight + "px"
//                 : "0px",
//             }}
//             className="ml-8 mt-2 space-y-1 overflow-hidden transition-all duration-300"
//           >
//             {renderNavLink("User Activity", FiUser, "/admin/reports/user-activity")}
//             {renderNavLink("Email Tracking", FiMail, "/admin/reports/email-tracking")}
//             {renderNavLink("Scenario Stats", FiLayers, "/admin/reports/scenarios")}
//             {renderNavLink("Template Usage", FiFileText, "/admin/reports/templates")}
//           </div>
//         </div>

//         {/* <div>
//           <p className="text-xs text-gray-400 uppercase font-semibold mb-2 tracking-wide">
//             Configuration
//           </p>
//           {renderNavLink("System Settings", FiSettings, "/admin/settings")}
//         </div> */}
//       </nav>
//     </>
//   );

//   return (
//     <>
//       <button
//         onClick={() => setIsSidebarOpen(true)}
//         className={`fixed top-4 right-4 z-50 p-2 rounded-full bg-white shadow-lg text-indigo-600 md:hidden transition-opacity duration-300 ${
//           isSidebarOpen ? "opacity-0 pointer-events-none" : "opacity-100"
//         }`}
//       >
//         <FiMenu className="w-6 h-6" />
//       </button>

//       <div
//         className={`fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden transition-opacity duration-300 ${
//           isSidebarOpen ? "opacity-100 visible" : "opacity-0 invisible"
//         }`}
//         onClick={() => setIsSidebarOpen(false)}
//       />

//       <aside
//         className={`fixed z-40 top-0 left-0 h-full w-64 bg-gradient-to-b from-gray-50 via-white to-gray-100 text-gray-800 flex flex-col border-r border-gray-200 shadow-xl transition-transform duration-300 md:translate-x-0 ${
//           isSidebarOpen ? "translate-x-0" : "-translate-x-full"
//         }`}
//       >
//         {role === "admin" ? renderAdminSidebar() : renderUserSidebar()}

//         <div className="px-4 pb-4 border-t border-gray-200">
//           <button
//             onClick={handleLogout}
//             className="flex items-center w-full space-x-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 hover:text-indigo-600 transition-colors duration-200"
//           >
//             <FiLogOut className="w-5 h-5" />
//             <span>Logout</span>
//           </button>
//         </div>

//         <div className="text-xs text-gray-400 border-t border-gray-200 py-3 text-center bg-gray-50">
//           © 2025 MailMatrix
//         </div>
//       </aside>
//     </>
//   );
// };

// export default Sidebar;
import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FiGrid,
  FiLayers,
  FiFileText,
  FiZap,
  FiSettings,
  FiGitBranch,
  FiLogOut,
  FiMail,
  FiMenu,
  FiX,
  FiUser,
  FiUsers,
  FiBarChart2,
  FiDatabase,
  FiChevronDown,
  FiChevronRight
} from "react-icons/fi";
import { jwtDecode } from "jwt-decode";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isScenariosOpen, setIsScenariosOpen] = useState(false);
  const [isReportsOpen, setIsReportsOpen] = useState(false);
  const [role, setRole] = useState("user");

  const scenariosRef = useRef(null);
  const reportsRef = useRef(null);

  const isActive = (path) => location.pathname === path;

  const renderNavLink = (label, Icon, to) => (
    <Link
      to={to}
      replace
      onClick={() => window.innerWidth < 768 && setIsSidebarOpen(false)}
      className={`flex items-center gap-3 px-3 py-2 rounded-md text-[14px] font-medium transition-all
        ${isActive(to)
          ? "bg-gray-100 text-gray-900"
          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
        }`}
    >
      <Icon size={18} />
      {label}
    </Link>
  );

  useEffect(() => {
    const token = localStorage.getItem("usertoken");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded?.payLoad?.role) setRole(decoded.payLoad.role);
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (location.pathname.startsWith("/scenarios")) setIsScenariosOpen(true);
    if (location.pathname.startsWith("/admin/reports")) setIsReportsOpen(true);
  }, [location.pathname]);

  const handleLogout = async () => {
    const userId = localStorage.getItem("userid");
    try {
      if (userId) {
        await fetch(
          `https://email-syncing-backend.vercel.app/auth/logout/${userId}`,
          { method: "POST" }
        );
      }
      localStorage.clear();
      setIsSidebarOpen(false);
      navigate("/login", { replace: true });
    } catch {}
  };

  const SectionHeader = ({ title }) => (
    <p className="px-3 text-[11px] uppercase tracking-wide font-semibold text-gray-400 mt-4 mb-2">
      {title}
    </p>
  );

  const SidebarHeader = ({ title, Icon }) => (
    <div className="flex items-center justify-between py-4 px-4 bg-white">
      <div className="flex items-center gap-2">
        <Icon size={20} className="text-indigo-600" />
        <span className="font-semibold text-[17px] text-gray-800">{title}</span>
      </div>

      {/* Mobile close */}
      <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-1">
        <FiX size={22} className="text-gray-600" />
      </button>
    </div>
  );

  const renderUserSidebar = () => (
    <>
      <SidebarHeader title="Zenith Inbox" Icon={FiMail} />

      {/* NAVIGATION */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">

        <SectionHeader title="Main" />
        {renderNavLink("Organization", FiGrid, "/organization")}
        {renderNavLink("Lead Conversation", FiMail, "/inbox")}

        <SectionHeader title="Automations" />

        <button
          onClick={() => setIsScenariosOpen(!isScenariosOpen)}
          className={`flex items-center justify-between w-full px-3 py-2 rounded-md text-[14px] transition-all
          ${location.pathname.startsWith("/scenarios")
              ? "bg-gray-100 text-gray-900"
              : "text-gray-700 hover:bg-gray-100"
            }`}
        >
          <div className="flex items-center gap-3">
            <FiLayers size={18} />
            Scenarios
          </div>
          {isScenariosOpen ? <FiChevronDown /> : <FiChevronRight />}
        </button>

        <div
          ref={scenariosRef}
          style={{
            maxHeight: isScenariosOpen
              ? scenariosRef.current?.scrollHeight + "px"
              : "0px",
          }}
          className="ml-6 overflow-hidden transition-all duration-300"
        >
          <div className="mt-2 space-y-1">
            {renderNavLink("All Scenarios", FiZap, "/scenarios/all")}
            {renderNavLink("Shopify Scenario", FiGitBranch, "/scenarios/shopify")}
            {renderNavLink("Custom", FiSettings, "/scenarios/others")}
          </div>
        </div>

        <SectionHeader title="Resources" />
        {renderNavLink("Shopify Templates", FiFileText, "/templates")}
        {renderNavLink("Connection", FiZap, "/connection")}
      </nav>
    </>
  );

  const renderAdminSidebar = () => (
    <>
      <SidebarHeader title="Admin Panel" Icon={FiGrid} />

      <nav className="flex-1 px-3 py-4 overflow-y-auto">

        <SectionHeader title="Overview" />
        {renderNavLink("Dashboard", FiBarChart2, "/admin/dashboard")}
        {renderNavLink("All Users", FiUsers, "/admin/users")}
        {renderNavLink("Connections", FiDatabase, "/admin/connections")}

        <SectionHeader title="Reports" />

        <button
          onClick={() => setIsReportsOpen(!isReportsOpen)}
          className={`flex items-center justify-between w-full px-3 py-2 rounded-md text-[14px] transition-all
          ${location.pathname.startsWith("/admin/reports")
              ? "bg-gray-100 text-gray-900"
              : "text-gray-700 hover:bg-gray-100"
            }`}
        >
          <div className="flex items-center gap-3">
            <FiLayers size={18} />
            Reports
          </div>
          {isReportsOpen ? <FiChevronDown /> : <FiChevronRight />}
        </button>

        <div
          ref={reportsRef}
          style={{
            maxHeight: isReportsOpen
              ? reportsRef.current?.scrollHeight + "px"
              : "0px",
          }}
          className="ml-6 overflow-hidden transition-all duration-300"
        >
          <div className="mt-2 space-y-1">
            {renderNavLink("User Activity", FiUser, "/admin/reports/user-activity")}
            {renderNavLink("Email Tracking", FiMail, "/admin/reports/email-tracking")}
            {renderNavLink("Scenario Stats", FiLayers, "/admin/reports/scenarios")}
            {renderNavLink("Template Usage", FiFileText, "/admin/reports/templates")}
          </div>
        </div>
      </nav>
    </>
  );

  return (
    <>
      {/* Mobile Open Button */}
      <button
        onClick={() => setIsSidebarOpen(true)}
        className={`fixed top-4 left-4 z-50 p-2 rounded-md bg-white text-gray-700 md:hidden ${
          isSidebarOpen ? "hidden" : ""
        }`}
      >
        <FiMenu size={22} />
      </button>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white text-gray-800 flex flex-col z-40 transition-transform duration-300 md:translate-x-0
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        {role === "admin" ? renderAdminSidebar() : renderUserSidebar()}

        {/* Logout */}
        <div className="px-3 py-3 mt-auto">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 w-full rounded-md text-[14px] text-gray-700 hover:bg-gray-100 transition"
          >
            <FiLogOut size={18} />
            Logout
          </button>
        </div>

        <p className="text-[11px] text-gray-400 py-3 text-center">
          © 2025 MailMatrix
        </p>
      </aside>
    </>
  );
};

export default Sidebar;

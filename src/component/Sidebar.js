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
  FiChevronDown,
  FiChevronRight,
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
      onClick={() => {
        if (window.innerWidth < 768) setIsSidebarOpen(false);
      }}
      className={`
        flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium
        transition-all duration-200
        ${
          isActive(to)
            ? "bg-white/40 text-indigo-700 border border-white/60 backdrop-blur-xl shadow-md"
            : "text-gray-900 hover:bg-white/20 hover:border-white/40 hover:shadow-sm"
        }
      `}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </Link>
  );

  useEffect(() => {
    const token = localStorage.getItem("usertoken");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded?.payLoad?.role) {
          setRole(decoded.payLoad.role);
        }
      } catch (error) {
        console.error("Invalid token:", error);
      }
    }
  }, []);

  useEffect(() => {
    if (location.pathname.startsWith("/scenarios")) {
      setIsScenariosOpen(true);
    }
    if (location.pathname.startsWith("/admin/reports")) {
      setIsReportsOpen(true);
    }
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
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // -------------------------------------------------------------
  // GLASSY HEADER
  // -------------------------------------------------------------
  const SidebarHeader = ({ title, Icon }) => (
    <div
      className="
      flex items-center justify-between 
      py-5 px-6 
      bg-white/20 backdrop-blur-2xl 
      border-b border-white/30 
      shadow-[0_4px_20px_rgba(0,0,0,0.1)]
    "
    >
      <div className="flex items-center space-x-2">
        <Icon className="text-indigo-600 text-2xl" />
        <span className="font-semibold text-lg text-gray-900">{title}</span>
      </div>
      <button
        onClick={() => setIsSidebarOpen(false)}
        className="md:hidden text-gray-800 hover:text-indigo-600 p-1 rounded-full 
        hover:bg-white/40 transition"
      >
        <FiX className="w-6 h-6" />
      </button>
    </div>
  );

  // -------------------------------------------------------------
  // USER SIDEBAR
  // -------------------------------------------------------------
  const renderUserSidebar = () => (
    <>
      <SidebarHeader title="Zenith Inbox" Icon={FiMail} />

      <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">

        {/* SECTION TITLE */}
        <p className="text-xs text-gray-700 uppercase font-semibold tracking-wide mb-1">
          Main
        </p>

        <div className="space-y-1">
          {renderNavLink("Organization", FiGrid, "/organization")}
          {renderNavLink("Lead Conversation", FiMail, "/inbox")}
        </div>

        <p className="text-xs text-gray-700 uppercase font-semibold tracking-wide mb-1">
          Automations
        </p>

        {/* Accordion */}
        <button
          onClick={() => setIsScenariosOpen(!isScenariosOpen)}
          className={`
            w-full flex items-center justify-between px-3 py-2 rounded-lg
            text-sm font-medium transition-all
            ${
              location.pathname.startsWith("/scenarios")
                ? "bg-white/40 text-indigo-700 border border-white/50 backdrop-blur-xl shadow"
                : "text-gray-900 hover:bg-white/20 hover:border-white/40"
            }
          `}
        >
          <div className="flex items-center space-x-3">
            <FiLayers className="w-5 h-5" />
            <span>Scenarios</span>
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
          className="ml-8 mt-2 space-y-1 overflow-hidden transition-all duration-300"
        >
          {renderNavLink("All Scenarios", FiZap, "/scenarios/all")}
          {renderNavLink("Shopify Scenario", FiGitBranch, "/scenarios/shopify")}
          {renderNavLink("Custom", FiSettings, "/scenarios/others")}
        </div>

        <p className="text-xs text-gray-700 uppercase font-semibold tracking-wide mt-4">
          Resources
        </p>

        <div className="space-y-1">
          {renderNavLink("Shopify Templates", FiFileText, "/templates")}
          {renderNavLink("Connection", FiZap, "/connection")}
        </div>
      </nav>
    </>
  );

  // -------------------------------------------------------------
  // ADMIN SIDEBAR
  // -------------------------------------------------------------
  const renderAdminSidebar = () => (
    <>
      <SidebarHeader title="Admin Panel" Icon={FiGrid} />

      <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">

        <p className="text-xs text-gray-700 uppercase font-semibold tracking-wide mb-1">
          Overview
        </p>

        {renderNavLink("Dashboard", FiBarChart2, "/admin/dashboard")}
        {renderNavLink("All Users", FiUsers, "/admin/users")}
        {renderNavLink("Connections", FiDatabase, "/admin/connections")}

        <p className="text-xs text-gray-700 uppercase font-semibold tracking-wide mb-1 mt-4">
          Reports & Tracking
        </p>

        <button
          onClick={() => setIsReportsOpen(!isReportsOpen)}
          className={`
            w-full flex items-center justify-between px-3 py-2 rounded-lg
            text-sm font-medium transition-all
            ${
              location.pathname.startsWith("/admin/reports")
                ? "bg-white/40 text-indigo-700 border border-white/50 backdrop-blur-xl shadow"
                : "text-gray-900 hover:bg-white/20 hover:border-white/40"
            }
          `}
        >
          <div className="flex items-center space-x-3">
            <FiLayers className="w-5 h-5" />
            <span>Reports</span>
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
          className="ml-8 mt-2 space-y-1 overflow-hidden transition-all duration-300"
        >
          {renderNavLink("User Activity", FiUser, "/admin/reports/user-activity")}
          {renderNavLink("Email Tracking", FiMail, "/admin/reports/email-tracking")}
          {renderNavLink("Scenario Stats", FiLayers, "/admin/reports/scenarios")}
          {renderNavLink("Template Usage", FiFileText, "/admin/reports/templates")}
        </div>
      </nav>
    </>
  );

  // -------------------------------------------------------------
  // RETURN (FINAL GLASS SIDEBAR)
  // -------------------------------------------------------------
  return (
  <>
    {/* Floating Mobile Menu Button */}
    <button
      onClick={() => setIsSidebarOpen(true)}
      className={`
        fixed top-4 right-4 z-50 p-2 rounded-full
        bg-white/40 backdrop-blur-xl border border-white/60
        shadow-[0_4px_20px_rgba(0,0,0,0.20)]
        text-indigo-700 md:hidden transition-opacity duration-300
        ${isSidebarOpen ? "opacity-0 pointer-events-none" : "opacity-100"}
      `}
    >
      <FiMenu className="w-6 h-6" />
    </button>

    {/* Dark Blur Overlay (Mobile) */}
    <div
      className={`
        fixed inset-0 z-30 bg-black/40 backdrop-blur-sm md:hidden
        transition-opacity duration-300
        ${isSidebarOpen ? "opacity-100 visible" : "opacity-0 invisible"}
      `}
      onClick={() => setIsSidebarOpen(false)}
    />

    {/* SIDEBAR PANEL */}
    <aside
      className={`
        fixed top-0 left-0 h-full w-64 z-40
        bg-white/25 backdrop-blur-2xl
        border-r border-white/40
        shadow-[0_8px_40px_rgba(0,0,0,0.25)]
        text-gray-900 flex flex-col
        transition-transform duration-300 md:translate-x-0
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      style={{ WebkitBackdropFilter: "blur(22px)" }}
    >

      {/* HEADER (Glass) */}
      <div className="
        flex items-center justify-between py-5 px-6
        bg-white/30 backdrop-blur-2xl
        border-b border-white/40
        shadow-[0_4px_18px_rgba(0,0,0,0.12)]
      ">
        <div className="flex items-center space-x-2">
          <FiMail className="text-indigo-600 text-2xl" />
          <span className="font-semibold text-lg text-gray-900">
            {role === "admin" ? "Admin Panel" : "Zenith Inbox"}
          </span>
        </div>

        {/* Close (Mobile Only) */}
        <button
          onClick={() => setIsSidebarOpen(false)}
          className="md:hidden text-gray-800 hover:text-indigo-600 
            p-1 rounded-full hover:bg-white/50 transition"
        >
          <FiX className="w-6 h-6" />
        </button>
      </div>

      {/* MAIN SCROLL SECTION */}
      <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">

        {/* SECTION TITLE */}
        <p className="text-xs text-gray-700 uppercase font-semibold tracking-wide mb-1">
          {role === "admin" ? "Overview" : "Main"}
        </p>

        {/* LINKS */}
        <div className="space-y-1">
          {role !== "admin" &&
            <>
              {renderNavLink("Organization", FiGrid, "/organization")}
              {renderNavLink("Lead Conversation", FiMail, "/inbox")}
            </>
          }

          {role === "admin" &&
            <>
              {renderNavLink("Dashboard", FiBarChart2, "/admin/dashboard")}
              {renderNavLink("All Users", FiUsers, "/admin/users")}
              {renderNavLink("Connections", FiDatabase, "/admin/connections")}
            </>
          }
        </div>


        {/* AUTOMATIONS SECTION */}
        {role !== "admin" && (
          <>
            <p className="text-xs text-gray-700 uppercase font-semibold tracking-wide mt-4 mb-1">
              Automations
            </p>

            {/* ACCORDION BUTTON */}
            <button
              onClick={() => setIsScenariosOpen(!isScenariosOpen)}
              className={`
                w-full flex items-center justify-between px-3 py-2
                rounded-lg text-sm font-medium transition-all
                ${
                  location.pathname.startsWith("/scenarios")
                    ? "bg-white/40 text-indigo-700 border border-white/60 backdrop-blur-xl shadow"
                    : "text-gray-900 hover:bg-white/30 hover:border-white/50"
                }
              `}
            >
              <div className="flex items-center space-x-3">
                <FiLayers className="w-5 h-5" />
                <span>Scenarios</span>
              </div>
              {isScenariosOpen ? <FiChevronDown /> : <FiChevronRight />}
            </button>

            {/* ACCORDION CONTENT */}
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
              {renderNavLink("Shopify Scenario", FiGitBranch, "/scenarios/shopify")}
              {renderNavLink("Custom", FiSettings, "/scenarios/others")}
            </div>
          </>
        )}

        {/* Admin Reports Section */}
        {role === "admin" && (
          <>
            <p className="text-xs text-gray-700 uppercase font-semibold tracking-wide mt-4 mb-1">
              Reports & Tracking
            </p>

            <button
              onClick={() => setIsReportsOpen(!isReportsOpen)}
              className={`
                w-full flex items-center justify-between px-3 py-2 rounded-lg
                text-sm font-medium transition-all
                ${
                  location.pathname.startsWith("/admin/reports")
                    ? "bg-white/40 text-indigo-700 border border-white/60 backdrop-blur-xl shadow"
                    : "text-gray-900 hover:bg-white/30 hover:border-white/50"
                }
              `}
            >
              <div className="flex items-center space-x-3">
                <FiLayers className="w-5 h-5" />
                <span>Reports</span>
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
              className="ml-8 mt-2 space-y-1 overflow-hidden transition-all duration-300"
            >
              {renderNavLink("User Activity", FiUser, "/admin/reports/user-activity")}
              {renderNavLink("Email Tracking", FiMail, "/admin/reports/email-tracking")}
              {renderNavLink("Scenario Stats", FiLayers, "/admin/reports/scenarios")}
              {renderNavLink("Template Usage", FiFileText, "/admin/reports/templates")}
            </div>
          </>
        )}

        {/* Resources */}
        {role !== "admin" && (
          <>
            <p className="text-xs text-gray-700 uppercase font-semibold tracking-wide mt-4">
              Resources
            </p>

            <div className="space-y-1">
              {renderNavLink("Shopify Templates", FiFileText, "/templates")}
              {renderNavLink("Connection", FiZap, "/connection")}
            </div>
          </>
        )}
      </nav>

      {/* LOGOUT BUTTON */}
      <div className="px-4 pb-4 border-t border-white/30 bg-white/20 backdrop-blur-xl">
        <button
          onClick={handleLogout}
          className="
            flex items-center w-full px-3 py-2 rounded-lg text-sm
            text-gray-900 hover:bg-white/40 hover:text-indigo-600
            transition-all
          "
        >
          <FiLogOut className="w-5 h-5 mr-2" /> Logout
        </button>
      </div>

      {/* FOOTER */}
      <div className="
        text-xs text-gray-700 py-3 text-center
        border-t border-white/30 bg-white/20 backdrop-blur-xl
      ">
        © 2025 MailMatrix
      </div>
    </aside>
  </>
);

};

export default Sidebar;

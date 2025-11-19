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
//   const userId = localStorage.getItem("userid");

//   try {
//     if (userId) {
//       await fetch(
//         `https://email-syncing-backend.vercel.app/auth/logout/${userId}`,
//         { method: "POST" }
//       );
//     }

//     localStorage.clear();
//     setIsSidebarOpen(false);

//     // 🔥 This prevents auto redirect to setup
//     navigate("/login", { replace: true });
//     window.location.reload(); 

//   } catch (error) {
//     console.error("Logout failed:", error);
//   }
// };


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

  const renderNavLink = (label, Icon, to, tooltip) => (
    <Link
      to={to}
      replace
      title={tooltip}                      // 🔥 Tooltip added
      onClick={() => {
        if (window.innerWidth < 768) setIsSidebarOpen(false);
      }}
      className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
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
    const token = localStorage.getItem("usertoken");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded?.payLoad?.role) {
          setRole(decoded.payLoad.role);
        }
      } catch (error) {
        console.error("Invalid token");
      }
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
      window.location.reload();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const SidebarHeader = ({ title, Icon }) => (
    <div className="flex items-center justify-between py-5 px-6 border-b border-gray-200 bg-white shadow-sm">
      <div className="flex items-center space-x-2">
        <Icon className="text-indigo-500 text-2xl" />
        <span className="font-semibold text-lg text-gray-800">{title}</span>
      </div>
      <button
        onClick={() => setIsSidebarOpen(false)}
        className="md:hidden text-gray-500 hover:text-indigo-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
      >
        <FiX className="w-6 h-6" />
      </button>
    </div>
  );

  // ================================
  // 👇 USER SIDEBAR WITH TOOLTIP
  // ================================
  const renderUserSidebar = () => (
    <>
      <SidebarHeader title="Zenith Inbox" Icon={FiMail} />

      <nav className="flex-1 px-4 py-6 space-y-6">
        {/* MAIN */}
        <div>
          <p className="text-xs text-gray-400 uppercase font-semibold mb-2 tracking-wide">
            Main
          </p>

          {renderNavLink("Organization", FiGrid, "/organization", "Manage your organization settings")}
          {renderNavLink("Lead Conversation", FiMail, "/inbox", "View and manage incoming leads")}
        </div>

        {/* AUTOMATIONS */}
        <div>
          <p className="text-xs text-gray-400 uppercase font-semibold mb-2 tracking-wide">
            Automations
          </p>

          <button
            title="Manage all your automation scenarios"      // 🔥 Tooltip
            onClick={() => setIsScenariosOpen(!isScenariosOpen)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              location.pathname.startsWith("/scenarios")
                ? "bg-indigo-100 text-indigo-700 shadow-sm font-semibold"
                : "text-gray-700 hover:bg-gray-100 hover:text-indigo-600"
            }`}
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
            {renderNavLink("All Scenarios", FiZap, "/scenarios/all", "View all automation workflows")}
            {renderNavLink("Shopify Scenario", FiGitBranch, "/scenarios/shopify", "Pre-built Shopify automation")}
            {renderNavLink("Custom", FiSettings, "/scenarios/others", "Create a custom scenario")}
          </div>
        </div>

        {/* RESOURCES */}
        <div>
          <p className="text-xs text-gray-400 uppercase font-semibold mb-2 tracking-wide">
            Resources
          </p>

          {renderNavLink("Shopify Templates", FiFileText, "/templates", "Ready-made email templates for Shopify")}
          {renderNavLink("Connection", FiZap, "/connection", "Connect Gmail, Outlook, SMTP accounts")}
        </div>
      </nav>
    </>
  );

  // ================================
  // 👇 ADMIN SIDEBAR (with tooltips)
  // ================================
  const renderAdminSidebar = () => (
    <>
      <SidebarHeader title="Admin Panel" Icon={FiGrid} />

      <nav className="flex-1 px-4 py-6 space-y-6">
        {/* Overview */}
        <div>
          <p className="text-xs text-gray-400 uppercase font-semibold mb-2 tracking-wide">
            Overview
          </p>

          {renderNavLink("Dashboard", FiBarChart2, "/admin/dashboard", "Admin dashboard overview")}
          {renderNavLink("All Users", FiUsers, "/admin/users", "Manage registered users")}
          {renderNavLink("Connections", FiDatabase, "/admin/connections", "View all email connections")}
        </div>

        {/* Reports */}
        <div>
          <p className="text-xs text-gray-400 uppercase font-semibold mb-2 tracking-wide">
            Reports & Tracking
          </p>

          <button
            title="View various tracking reports"
            onClick={() => setIsReportsOpen(!isReportsOpen)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              location.pathname.startsWith("/admin/reports")
                ? "bg-indigo-100 text-indigo-700 font-semibold shadow-sm"
                : "text-gray-700 hover:bg-gray-100 hover:text-indigo-600"
            }`}
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
            {renderNavLink(
              "User Activity",
              FiUser,
              "/admin/reports/user-activity",
              "Monitor user activity"
            )}
            {renderNavLink(
              "Email Tracking",
              FiMail,
              "/admin/reports/email-tracking",
              "Track email events and logs"
            )}
            {renderNavLink(
              "Scenario Stats",
              FiLayers,
              "/admin/reports/scenarios",
              "View stats for all scenarios"
            )}
            {renderNavLink(
              "Template Usage",
              FiFileText,
              "/admin/reports/templates",
              "View template usage statistics"
            )}
          </div>
        </div>
      </nav>
    </>
  );

  return (
    <>
      {/* MOBILE BUTTON */}
      <button
        onClick={() => setIsSidebarOpen(true)}
        className={`fixed top-4 right-4 z-50 p-2 rounded-full bg-white shadow-lg text-indigo-600 md:hidden transition-opacity duration-300 ${
          isSidebarOpen ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        <FiMenu className="w-6 h-6" />
      </button>

      {/* BACKDROP */}
      <div
        className={`fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden transition-opacity duration-300 ${
          isSidebarOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* SIDEBAR */}
      <aside
        className={`fixed z-40 top-0 left-0 h-full w-64 bg-gradient-to-b from-gray-50 via-white to-gray-100 text-gray-800 flex flex-col border-r border-gray-200 shadow-xl transition-transform duration-300 md:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {role === "admin" ? renderAdminSidebar() : renderUserSidebar()}

        {/* LOGOUT */}
        <div className="px-4 pb-4 border-t border-gray-200">
          <button
            title="Logout from your account"
            onClick={handleLogout}
            className="flex items-center w-full space-x-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 hover:text-indigo-600 transition-colors duration-200"
          >
            <FiLogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>

        <div className="text-xs text-gray-400 border-t border-gray-200 py-3 text-center bg-gray-50">
          © 2025 MailMatrix
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

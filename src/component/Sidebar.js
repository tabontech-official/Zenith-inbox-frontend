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
// import { jwtDecode } from "jwt-decode";
// import SidebarTooltip from "./SidebarTooltip"; // <--- ADD THIS

// const Sidebar = () => {
//   const location = useLocation();
//   const navigate = useNavigate();

//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//   const [isScenariosOpen, setIsScenariosOpen] = useState(false);
//   const [isReportsOpen, setIsReportsOpen] = useState(false);
//   const [role, setRole] = useState("user");

//   const [guideStep, setGuideStep] = useState(() => {
//     const saved = localStorage.getItem("sidebarGuideStep");
//     return saved ? Number(saved) : 1; // Start from step 1
//   });

//   const isActive = (path) => location.pathname === path;

//   // ------------------ Tooltip Target Refs ------------------
//   const leadRef = useRef(null);
//   const allScenarioRef = useRef(null);
//   const shopifyScenarioRef = useRef(null);
//   const customScenarioRef = useRef(null);

//   // ---------------------------------------------------------
//   const nextGuide = () => {
//     const next = guideStep + 1;
//     setGuideStep(next);
//     localStorage.setItem("sidebarGuideStep", next);
//   };

//   const skipGuide = () => {
//     setGuideStep(0);
//     localStorage.setItem("sidebarGuideStep", "done");
//   };

//   // -------------------- ROLE CHECK --------------------
//   useEffect(() => {
//     const token = localStorage.getItem("usertoken");
//     if (token) {
//       try {
//         const decoded = jwtDecode(token);
//         if (decoded?.payLoad?.role) setRole(decoded.payLoad.role);
//       } catch (_) {}
//     }
//   }, []);

//   // ----------------------------------------------------
//   const renderNavLink = (label, Icon, to, ref = null, stepMatch = null) => (
//     <Link
//       to={to}
//       replace
//       ref={ref}
//       onClick={() => window.innerWidth < 768 && setIsSidebarOpen(false)}
//       className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition
//       ${
//         isActive(to)
//           ? "bg-indigo-100 text-indigo-700 font-semibold"
//           : "text-gray-700 hover:bg-gray-100 hover:text-indigo-600"
//       }
//       ${guideStep === stepMatch ? "sidebar-highlight" : ""}
//     `}
//     >
//       <Icon className="w-5 h-5" />
//       <span>{label}</span>
//     </Link>
//   );

//   // ------------------- LOGOUT ------------------------
//   const handleLogout = async () => {
//     const userId = localStorage.getItem("userid");

//     try {
//       if (userId) {
//         await fetch(`https://email-syncing-backend.vercel.app/auth/logout/${userId}`, {
//           method: "POST",
//         });
//       }

//       localStorage.clear();
//       navigate("/login", { replace: true });
//       window.location.reload();
//     } catch (err) {
//       console.error("Logout failed:", err);
//     }
//   };

//   // -------------------- SIDEBAR LAYOUT --------------------
//   const renderUserSidebar = () => (
//     <>
//       <div className="flex items-center justify-between py-5 px-6 border-b bg-white">
//         <div className="flex items-center space-x-2">
//           <FiMail className="text-indigo-500 text-2xl" />
//           <span className="font-semibold text-lg">Zenith Inbox</span>
//         </div>
//         <button
//           onClick={() => setIsSidebarOpen(false)}
//           className="md:hidden text-gray-500 hover:text-indigo-600"
//         >
//           <FiX className="w-6 h-6" />
//         </button>
//       </div>

//       <nav className="px-4 py-6 space-y-6 overflow-y-auto">
//         {/* MAIN */}
//         <div>
//           <p className="text-xs text-gray-400 uppercase mb-2">Main</p>
//           {renderNavLink("Organization", FiGrid, "/organization")}
//           {renderNavLink("Lead Conversation", FiMail, "/inbox", leadRef, 1)}
//         </div>

//         {/* AUTOMATIONS */}
//         <div>
//           <p className="text-xs text-gray-400 uppercase mb-2">Automations</p>

//           <button
//             onClick={() => setIsScenariosOpen(!isScenariosOpen)}
//             className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm
//               ${
//                 location.pathname.startsWith("/scenarios")
//                   ? "bg-indigo-100 text-indigo-700"
//                   : "text-gray-700 hover:bg-gray-100"
//               }`}
//           >
//             <div className="flex items-center space-x-3">
//               <FiLayers className="w-5 h-5" />
//               <span>Scenarios</span>
//             </div>

//             {isScenariosOpen ? <FiChevronDown /> : <FiChevronRight />}
//           </button>

//           <div
//             className={`ml-8 mt-2 space-y-1 overflow-hidden transition-all duration-300
//             ${isScenariosOpen ? "max-h-[200px]" : "max-h-0"}`}
//           >
//             {renderNavLink(
//               "All Scenarios",
//               FiZap,
//               "/scenarios/all",
//               allScenarioRef,
//               2
//             )}
//             {renderNavLink(
//               "Shopify Scenario",
//               FiGitBranch,
//               "/scenarios/shopify",
//               shopifyScenarioRef,
//               3
//             )}
//             {renderNavLink(
//               "Custom",
//               FiSettings,
//               "/scenarios/others",
//               customScenarioRef,
//               4
//             )}
//           </div>
//         </div>

//         {/* RESOURCES */}
//         <div>
//           <p className="text-xs text-gray-400 uppercase mb-2">Resources</p>
//           {renderNavLink("Shopify Templates", FiFileText, "/templates")}
//           {renderNavLink("General Templates", FiFileText, "/templates/general")}
//           {renderNavLink("Connection", FiZap, "/connection")}
//         </div>
//       </nav>
//     </>
//   );

//   return (
//     <>
//       {/* Mobile Menu Button */}
//       <button
//         onClick={() => setIsSidebarOpen(true)}
//         className="fixed top-4 right-4 z-50 md:hidden p-2 bg-white shadow-lg rounded-full text-indigo-600"
//       >
//         <FiMenu className="w-6 h-6" />
//       </button>

//       {/* Overlay */}
//       {isSidebarOpen && (
//         <div
//           className="fixed inset-0 bg-black/40 md:hidden"
//           onClick={() => setIsSidebarOpen(false)}
//         />
//       )}

//       {/* Sidebar */}
//       <aside
//         className={`fixed top-0 left-0 z-40 h-full w-64 bg-white border-r shadow-xl transition-transform
//           ${
//             isSidebarOpen
//               ? "translate-x-0"
//               : "-translate-x-full md:translate-x-0"
//           }`}
//       >
//         {renderUserSidebar()}

//         <div className="px-4 pb-4 border-t">
//           <button
//             onClick={handleLogout}
//             className="flex items-center w-full px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100"
//           >
//             <FiLogOut />
//             <span>Logout</span>
//           </button>
//         </div>
//       </aside>

//       {/* TOOLTIP GUIDE */}
//       {guideStep > 0 && guideStep <= 4 && (
//         <SidebarTooltip
//           step={guideStep}
//           refs={{
//             leadRef,
//             allScenarioRef,
//             shopifyScenarioRef,
//             customScenarioRef,
//           }}
//           onNext={nextGuide}
//           onSkip={skipGuide}
//         />
//       )}
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

  const [guideStep, setGuideStep] = useState(() => {
    const saved = localStorage.getItem("sidebarGuideStep");
    return saved ? Number(saved) : 1;
  });

  const isActive = (path) => location.pathname === path;

  // Tooltip refs
  const leadRef = useRef(null);
  const allScenarioRef = useRef(null);
  const shopifyScenarioRef = useRef(null);
  const customScenarioRef = useRef(null);

  const nextGuide = () => {
    const next = guideStep + 1;
    setGuideStep(next);
    localStorage.setItem("sidebarGuideStep", next);
  };

  const skipGuide = () => {
    setGuideStep(0);
    localStorage.setItem("sidebarGuideStep", "done");
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
        <div className="flex items-center space-x-2">
          <FiMail className="text-indigo-500 text-2xl" />
          <span className="font-semibold text-lg">Replex Engine</span>
        </div>
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

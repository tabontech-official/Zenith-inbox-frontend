// import React, { useState, useEffect, useContext, useRef } from "react";
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
// } from "react-icons/fi";
// import { UserContext } from "./UserContext";

// const Sidebar = () => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const { user } = useContext(UserContext);
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//   const [isScenariosOpen, setIsScenariosOpen] = useState(false);
//   const scenariosRef = useRef(null);

//   const isActive = (path) => location.pathname === path;

//   const renderNavLink = (label, Icon, to) => (
//     <Link
//       to={to}
//       replace
//       className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
//         isActive(to)
//           ? "bg-white text-purple-700 font-semibold shadow-sm"
//           : "text-gray-200 hover:bg-purple-700 hover:text-white"
//       }`}
//     >
//       <Icon className="w-5 h-5" />
//       <span>{label}</span>
//     </Link>
//   );

//   useEffect(() => {
//     if (location.pathname.startsWith("/scenarios")) {
//       setIsScenariosOpen(true);
//     }
//   }, [location.pathname]);

//   const handleLogout = async () => {
//     const userId = localStorage.getItem("userid");
//     try {
//       await fetch(`https://email-syncing-backend.vercel.app/auth/logout/${userId}`, {
//         method: "POST",
//       });
//       localStorage.clear();
//       navigate("/login", { replace: true });
//     } catch (error) {
//       console.error("Logout failed:", error);
//     }
//   };

//   return (
//     <aside
//       className={`fixed z-40 top-0 left-0 h-full w-64 bg-gradient-to-b from-purple-700 via-purple-600 to-purple-800 text-white flex flex-col p-6 transition-transform duration-300 md:translate-x-0 ${
//         isSidebarOpen ? "translate-x-0" : "-translate-x-full"
//       }`}
//     >
//       <div className="flex items-center space-x-3 pb-5 mb-6 border-b border-purple-400/40">
//         <img
//           src="https://placehold.co/48x48/5B21B6/white?text=U"
//           alt="User Logo"
//           className="rounded-full border border-white shadow w-12 h-12"
//         />
//         <div>
//           <h1 className="text-base font-semibold leading-tight">
//             {user?.fullName || "Organization"}
//           </h1>
//           <p className="text-xs text-gray-300 truncate">
//             {user?.email || "user@email.com"}
//           </p>
//         </div>
//       </div>

//       <div className="flex-1 space-y-4 text-sm">
//         <div>
//           <p className="text-xs text-gray-300 uppercase font-semibold mb-2 tracking-wide">
//             Main
//           </p>
//           {renderNavLink("Organization", FiGrid, "/organization")}
//         </div>

//         <div>
//           <p className="text-xs text-gray-300 uppercase font-semibold mt-4 mb-2 tracking-wide">
//             Automations
//           </p>
//           <div>
//             <button
//               onClick={() => setIsScenariosOpen(!isScenariosOpen)}
//               className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
//                 location.pathname.startsWith("/scenarios")
//                   ? "bg-white text-purple-700 font-semibold shadow-sm"
//                   : "text-gray-200 hover:bg-purple-700 hover:text-white"
//               }`}
//             >
//               <div className="flex items-center space-x-3">
//                 <FiLayers className="w-5 h-5" />
//                 <span>Scenarios</span>
//               </div>
//               {isScenariosOpen ? (
//                 <FiChevronDown className="w-4 h-4" />
//               ) : (
//                 <FiChevronRight className="w-4 h-4" />
//               )}
//             </button>

//             <div
//               ref={scenariosRef}
//               style={{
//                 maxHeight: isScenariosOpen
//                   ? scenariosRef.current?.scrollHeight + "px"
//                   : "0px",
//               }}
//               className="ml-8 mt-2 space-y-1 overflow-hidden transition-all duration-300"
//             >
//               {renderNavLink("All Scenarios", FiZap, "/scenarios/all")}
//               {renderNavLink("Shopify Scenario", FiGitBranch, "/scenarios/shopify")}
//               {renderNavLink("Custom", FiSettings, "/scenarios/others")}
//             </div>
//           </div>
//         </div>

//         {renderNavLink("Shopify Templates", FiFileText, "/templates")}
//         {renderNavLink("Connection", FiZap, "/connection")}
//       </div>

//       <button
//         onClick={handleLogout}
//         className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm text-gray-200 hover:bg-purple-900 hover:text-white transition-colors duration-200 mt-6"
//       >
//         <FiLogOut className="w-5 h-5" />
//         <span>Logout</span>
//       </button>

//       <div className="mt-auto text-xs text-gray-400 border-t border-purple-500/40 pt-4">
//         © 2025 MailHook
//       </div>
//     </aside>
//   );
// };

// export default Sidebar;
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
          ? "bg-white text-purple-700 font-semibold shadow-sm"
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
      className={`fixed z-40 top-0 left-0 h-full w-64 bg-gradient-to-b from-purple-700 via-purple-600 to-purple-800 text-white flex flex-col transition-transform duration-300 md:translate-x-0 ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex items-center justify-center py-6 border-b border-purple-400/40">
        <h1 className="text-3xl font-extrabold tracking-wide bg-gradient-to-r from-purple-200 via-white to-purple-300 bg-clip-text text-transparent">
          MailMatrix
        </h1>
      </div>

      <div className="flex items-center space-x-3 py-5 px-6 border-b border-purple-400/40">
        <img
          src="https://placehold.co/48x48/5B21B6/white?text=U"
          alt="User Logo"
          className="rounded-full border border-white shadow w-12 h-12"
        />
        <div>
          <h1 className="text-base font-semibold leading-tight">
            {user?.fullName || "Organization"}
          </h1>
          <p className="text-xs text-gray-300 truncate">
            {user?.email || "user@email.com"}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
        <div>
          <p className="text-xs text-gray-300 uppercase font-semibold mb-2 tracking-wide">
            Main
          </p>
          {renderNavLink("Organization", FiGrid, "/organization")}
        </div>

        <div>
          <p className="text-xs text-gray-300 uppercase font-semibold mb-2 tracking-wide">
            Automations
          </p>
          <div>
            <button
              onClick={() => setIsScenariosOpen(!isScenariosOpen)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                location.pathname.startsWith("/scenarios")
                  ? "bg-white text-purple-700 font-semibold shadow-sm"
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
          <p className="text-xs text-gray-300 uppercase font-semibold mb-2 tracking-wide">
            Resources
          </p>
          {renderNavLink("Shopify Templates", FiFileText, "/templates")}
          {renderNavLink("Connection", FiZap, "/connection")}
        </div>
      </nav>

      {/* Logout */}
      <div className="px-4 pb-4">
        <button
          onClick={handleLogout}
          className="flex items-center w-full space-x-3 px-3 py-2 rounded-md text-sm text-gray-200 hover:bg-purple-900 hover:text-white transition-colors duration-200"
        >
          <FiLogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>

      {/* Footer */}
      <div className="text-xs text-gray-400 border-t border-purple-500/40 py-3 text-center">
        © 2025 MailMatrix
      </div>
    </aside>
  );
};

export default Sidebar;

// import React, { useContext, useEffect, useRef, useState } from "react";
// import { Link, useLocation, useNavigate } from "react-router-dom";
// import {
//   FiBarChart2,
//   FiChevronDown,
//   FiGrid,
//   FiInbox,
//   FiLogOut,
//   FiMenu,
//   FiPlus,
//   FiSettings,
//   FiUser,
//   FiX,
//   FiZap,
// } from "react-icons/fi";
// import { jwtDecode } from "jwt-decode";

// import SidebarTooltip from "./SidebarTooltip";
// import { UserContext } from "./UserContext";

// const Sidebar = () => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const { user } = useContext(UserContext);
// const [isNewScenarioMenuOpen, setIsNewScenarioMenuOpen] = useState(false);
// const newScenarioMenuRef = useRef(null);
//   const [role, setRole] = useState("user");
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
//   const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
//   const [isScenarioMenuOpen, setIsScenarioMenuOpen] = useState(false);
//   const [guideStep, setGuideStep] = useState(0);

//   const profileMenuRef = useRef(null);
//   const scenarioMenuRef = useRef(null);

//   const leadRef = useRef(null);
//   const allScenarioRef = useRef(null);
//   const shopifyScenarioRef = useRef(null);
//   const customScenarioRef = useRef(null);

//   const token = localStorage.getItem("usertoken");
//   const userId = localStorage.getItem("userid");

//   const LAST_STEP = 4;

//   const isActive = (path) => location.pathname === path;

//   const isSectionActive = (paths) =>
//     paths.some(
//       (path) =>
//         location.pathname === path || location.pathname.startsWith(`${path}/`),
//     );

//   const inboxCount = user?.unreadEmails || user?.unreadCount || 3;

//   const userName =
//     user?.name ||
//     user?.fullName ||
//     user?.username ||
//     user?.email?.split("@")?.[0] ||
//     "User";

//   const userInitials = userName
//     .split(" ")
//     .map((part) => part.charAt(0))
//     .join("")
//     .slice(0, 2)
//     .toUpperCase();

//   useEffect(() => {
//     const storedToken = localStorage.getItem("usertoken");

//     if (!storedToken) return;

//     try {
//       const decoded = jwtDecode(storedToken);

//       if (decoded?.payLoad?.role) {
//         setRole(decoded.payLoad.role);
//       }
//     } catch (error) {
//       console.error("Token decoding failed:", error);
//     }
//   }, []);

//   useEffect(() => {
//     const fetchGuide = async () => {
//       if (!token || !userId) return;

//       try {
//         const response = await fetch(
//           `https://email-syncing-backend.vercel.app/auth/guide/${userId}`,
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//             },
//           },
//         );

//         const data = await response.json();

//         if (data?.sidebar?.completed) {
//           setGuideStep(0);
//           return;
//         }

//         setGuideStep(data?.sidebar?.step || 1);
//       } catch (error) {
//         console.error("Guide fetch error:", error);
//       }
//     };

//     fetchGuide();
//   }, [token, userId]);
// useEffect(() => {
//   const handleOutsideClick = (event) => {
//     if (
//       newScenarioMenuRef.current &&
//       !newScenarioMenuRef.current.contains(event.target)
//     ) {
//       setIsNewScenarioMenuOpen(false);
//     }
//   };

//   document.addEventListener("mousedown", handleOutsideClick);

//   return () => {
//     document.removeEventListener("mousedown", handleOutsideClick);
//   };
// }, []);
//   useEffect(() => {
//     const closeDropdowns = (event) => {
//       if (
//         profileMenuRef.current &&
//         !profileMenuRef.current.contains(event.target)
//       ) {
//         setIsProfileMenuOpen(false);
//       }

//       if (
//         scenarioMenuRef.current &&
//         !scenarioMenuRef.current.contains(event.target)
//       ) {
//         setIsScenarioMenuOpen(false);
//       }
//     };

//     document.addEventListener("mousedown", closeDropdowns);

//     return () => {
//       document.removeEventListener("mousedown", closeDropdowns);
//     };
//   }, []);

//   useEffect(() => {
//     setIsMobileMenuOpen(false);
//     setIsProfileMenuOpen(false);
//     setIsScenarioMenuOpen(false);
//   }, [location.pathname]);

//   const handleLogout = async () => {
//     try {
//       if (userId) {
//         await fetch(
//           `https://email-syncing-backend.vercel.app/auth/logout/${userId}`,
//           {
//             method: "POST",
//           },
//         );
//       }
//     } catch (error) {
//       console.error("Logout request failed:", error);
//     } finally {
//       localStorage.clear();
//       navigate("/login", { replace: true });
//       window.location.reload();
//     }
//   };

//   const updateGuide = async (payload) => {
//     if (!token || !userId) return;

//     try {
//       await fetch(
//         `https://email-syncing-backend.vercel.app/auth/guide/${userId}`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//           body: JSON.stringify(payload),
//         },
//       );
//     } catch (error) {
//       console.error("Guide update error:", error);
//     }
//   };

//   const nextGuide = async () => {
//     const nextStep = guideStep + 1;

//     if (nextStep > LAST_STEP) {
//       setGuideStep(0);

//       await updateGuide({
//         type: "sidebar",
//         completed: true,
//         step: LAST_STEP + 1,
//       });

//       window.dispatchEvent(new Event("sidebarGuideCompleted"));
//       return;
//     }

//     setGuideStep(nextStep);

//     await updateGuide({
//       type: "sidebar",
//       step: nextStep,
//     });
//   };

//   const skipGuide = async () => {
//     setGuideStep(0);

//     await updateGuide({
//       type: "sidebar",
//       completed: true,
//     });

//     window.dispatchEvent(new Event("sidebarGuideCompleted"));
//   };

//   const BrandLogo = ({ label = "Replex Engine" }) => (
//     <>
//       <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-zinc-100 ring-1 ring-zinc-200">
//         <span className="absolute h-3.5 w-3.5 rounded-full border-[3px] border-zinc-900 border-r-transparent" />

//         <span className="absolute right-[5px] top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-zinc-900" />
//       </span>

//       <span className="text-lg font-semibold tracking-[-0.035em] text-zinc-950">
//         {label}
//       </span>
//     </>
//   );
//   const DesktopNavLink = ({ to, label, Icon, active, badge, linkRef }) => (
//     <Link
//       to={to}
//       ref={linkRef}
//       className={`flex h-9 items-center gap-2 rounded-[8px] px-4 text-[13px] font-medium transition-colors ${
//         active
//           ? "bg-gray-100 text-black"
//           : "text-zinc-600 hover:bg-gray-100 hover:text-black"
//       }`}
//     >
//       {Icon && <Icon className="h-4 w-4 lg:hidden" />}

//       <span>{label}</span>

//       {badge > 0 && (
//         <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#f5b83d] px-1 text-[10px] font-bold text-black">
//           {badge > 99 ? "99+" : badge}
//         </span>
//       )}
//     </Link>
//   );

//   const MobileNavLink = ({ to, label, Icon, active, badge }) => (
//     <Link
//       to={to}
//       className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium ${
//         active
//           ? "bg-gray-100 text-black"
//           : "text-zinc-600 hover:bg-zinc-100 hover:text-black"
//       }`}
//     >
//       <span className="flex items-center gap-3">
//         <Icon className="h-5 w-5" />
//         {label}
//       </span>

//       {badge > 0 && (
//         <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#f5b83d] px-1 text-[10px] font-bold text-black">
//           {badge > 99 ? "99+" : badge}
//         </span>
//       )}
//     </Link>
//   );

//   const renderUserNavbar = () => (
//     <>
//       <div className="flex h-[60px] items-center justify-between px-5 sm:px-7">
//         {/* Left section */}
//         <div className="flex min-w-0 items-center">
//           <Link
//             to="/dashboard"
//             className="flex items-center gap-2 text-gray-900"
//           >
//             <BrandLogo />
//           </Link>

//           {/* Desktop navigation */}
//           <nav className="ml-8 hidden items-center gap-1 md:flex">
//             <DesktopNavLink
//               to="/dashboard"
//               label="Dashboard"
//               Icon={FiGrid}
//               active={isActive("/dashboard")}
//             />

//             <div ref={scenarioMenuRef} className="relative">
//               <button
//                 type="button"
//                 ref={allScenarioRef}
//                 onClick={() =>
//                   setIsScenarioMenuOpen((previousValue) => !previousValue)
//                 }
//                 className={`flex h-9 items-center gap-1.5 rounded-[8px] px-4 text-[13px] font-medium transition-colors ${
//                   isSectionActive(["/scenarios"])
//                      ? "bg-gray-100 text-black"
//           : "text-zinc-600 hover:bg-gray-100 hover:text-black"
//                 }`}
//               >
//                 <span>Scenarios</span>

//                 <FiChevronDown
//                   className={`h-3.5 w-3.5 transition-transform ${
//                     isScenarioMenuOpen ? "rotate-180" : ""
//                   }`}
//                 />
//               </button>

//               {isScenarioMenuOpen && (
//                 <div className="absolute left-0 top-[46px] z-50 w-56 overflow-hidden rounded-2xl border border-zinc-200 bg-white p-2 shadow-xl">
//                   <Link
//                     to="/scenarios/all"
//                     className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-zinc-700 hover:bg-zinc-100 hover:text-black"
//                   >
//                     <FiZap className="h-4 w-4" />
//                     All Scenarios
//                   </Link>

//                   <Link
//                     to="/scenarios/shopify"
//                     ref={shopifyScenarioRef}
//                     className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-zinc-700 hover:bg-zinc-100 hover:text-black"
//                   >
//                     <FiGrid className="h-4 w-4" />
//                     Shopify Scenario
//                   </Link>

//                   <Link
//                     to="/scenarios/others"
//                     ref={customScenarioRef}
//                     className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-zinc-700 hover:bg-zinc-100 hover:text-black"
//                   >
//                     <FiSettings className="h-4 w-4" />
//                     Custom Scenario
//                   </Link>
//                 </div>
//               )}
//             </div>

//             <DesktopNavLink
//               to="/inbox"
//               label="Inbox"
//               Icon={FiInbox}
//               active={isSectionActive(["/inbox"])}
//               badge={inboxCount}
//               linkRef={leadRef}
//             />

//             <DesktopNavLink
//               to="/analytics"
//               label="Analytics"
//               Icon={FiBarChart2}
//               active={isSectionActive(["/analytics"])}
//             />
//           </nav>
//         </div>

//         {/* Right section */}
//         <div className="hidden items-center gap-3 md:flex">
//         <div ref={newScenarioMenuRef} className="relative flex">
//   {/* Main button: direct Shopify scenario */}
//   <Link
//     to="/scenarios/shopify"
//     className="flex h-9 items-center gap-2 rounded-l-[8px] bg-[#11110f] px-4 text-[12px] font-semibold text-white transition hover:bg-black"
//   >
//     <FiPlus className="h-4 w-4" />

//     <span>New scenario</span>
//   </Link>

//   {/* Dropdown toggle */}
//   <button
//     type="button"
//     onClick={() =>
//       setIsNewScenarioMenuOpen((previousValue) => !previousValue)
//     }
//     className="flex h-9 w-9 items-center justify-center rounded-r-[8px] border-l border-white/20 bg-[#11110f] text-white transition hover:bg-black"
//     aria-label="Open scenario menu"
//     aria-expanded={isNewScenarioMenuOpen}
//   >
//     <FiChevronDown
//       className={`h-4 w-4 transition-transform ${
//         isNewScenarioMenuOpen ? "rotate-180" : ""
//       }`}
//     />
//   </button>

//   {/* Dropdown */}
//   {isNewScenarioMenuOpen && (
//     <div className="absolute right-0 top-[44px] z-50 w-52 overflow-hidden rounded-[8px] border border-zinc-200 bg-white py-2 shadow-lg">
//       <Link
//         to="/scenarios/shopify"
//         onClick={() => setIsNewScenarioMenuOpen(false)}
//         className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 hover:text-black"
//       >
//         <FiZap className="h-4 w-4" />

//         <span>Shopify Scenario</span>
//       </Link>

//       <Link
//         to="/scenarios/others"
//         onClick={() => setIsNewScenarioMenuOpen(false)}
//         className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 hover:text-black"
//       >
//         <FiSettings className="h-4 w-4" />

//         <span>Custom Scenario</span>
//       </Link>
//     </div>
//   )}
// </div>

//           <div ref={profileMenuRef} className="relative">
//             <button
//               type="button"
//               onClick={() =>
//                 setIsProfileMenuOpen((previousValue) => !previousValue)
//               }
//               className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-200 text-[11px] font-semibold text-black transition hover:ring-2 hover:ring-[#d9c99f]"
//               aria-label="Open profile menu"
//             >
//               {userInitials}
//             </button>

//             {isProfileMenuOpen && (
//               <div className="absolute right-0 top-[46px] z-50 w-56 overflow-hidden rounded-[8px] border border-zinc-200 bg-white p-2 shadow-xl">
//                 <div className="border-b border-zinc-100 px-3 py-2.5">
//                   <p className="truncate text-sm font-semibold text-zinc-900">
//                     {userName}
//                   </p>

//                   {user?.email && (
//                     <p className="mt-0.5 truncate text-xs text-zinc-500">
//                       {user.email}
//                     </p>
//                   )}
//                 </div>

//                 <Link
//                   to="/profile"
//                   className="mt-1 flex items-center gap-3 rounded-[8px] px-3 py-2.5 text-sm text-zinc-700 hover:bg-zinc-100 hover:text-black"
//                 >
//                   <FiUser className="h-4 w-4" />
//                   Profile
//                 </Link>

//                 <Link
//                   to="/connection"
//                   className="flex items-center gap-3 rounded-[8px] px-3 py-2.5 text-sm text-zinc-700 hover:bg-zinc-100 hover:text-black"
//                 >
//                   <FiSettings className="h-4 w-4" />
//                   Connections
//                 </Link>

//                 <button
//                   type="button"
//                   onClick={handleLogout}
//                   className="flex w-full items-center gap-3 rounded-[8px] px-3 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
//                 >
//                   <FiLogOut className="h-4 w-4" />
//                   Logout
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Mobile menu button */}
//         <button
//           type="button"
//           onClick={() => setIsMobileMenuOpen((previousValue) => !previousValue)}
//           className="flex h-10 w-10 items-center justify-center rounded-full text-zinc-700 hover:bg-zinc-100 md:hidden"
//           aria-label="Toggle navigation menu"
//         >
//           {isMobileMenuOpen ? (
//             <FiX className="h-5 w-5" />
//           ) : (
//             <FiMenu className="h-5 w-5" />
//           )}
//         </button>
//       </div>

//       {/* Mobile navigation */}
//       {isMobileMenuOpen && (
//         <div className="border-t border-zinc-100 bg-white px-4 py-4 md:hidden">
//           <nav className="space-y-1">
//             <MobileNavLink
//               to="/dashboard"
//               label="Dashboard"
//               Icon={FiGrid}
//               active={isActive("/dashboard")}
//             />

//             <MobileNavLink
//               to="/scenarios/all"
//               label="Scenarios"
//               Icon={FiZap}
//               active={isSectionActive(["/scenarios"])}
//             />

//             <MobileNavLink
//               to="/inbox"
//               label="Inbox"
//               Icon={FiInbox}
//               active={isSectionActive(["/inbox"])}
//               badge={inboxCount}
//             />

//             <MobileNavLink
//               to="/analytics"
//               label="Analytics"
//               Icon={FiBarChart2}
//               active={isSectionActive(["/analytics"])}
//             />

//             <MobileNavLink
//               to="/profile"
//               label="Profile"
//               Icon={FiUser}
//               active={isActive("/profile")}
//             />
//           </nav>

//           <Link
//             to="/scenarios/new"
//             className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#11110f] text-sm font-semibold text-white"
//           >
//             New scenario
//             <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#f5b83d]">
//               <FiPlus className="h-3 w-3 stroke-[3] text-black" />
//             </span>
//           </Link>

//           <button
//             type="button"
//             onClick={handleLogout}
//             className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-full text-sm font-medium text-red-600 hover:bg-red-50"
//           >
//             <FiLogOut className="h-4 w-4" />
//             Logout
//           </button>
//         </div>
//       )}
//     </>
//   );

//   const renderAdminNavbar = () => (
//     <div className="flex h-[60px] items-center justify-between px-5 sm:px-7">
//       <div className="flex items-center">
//         <Link to="/admin/dashboard">
//           <BrandLogo label="Replex Admin" />
//         </Link>

//         <nav className="ml-8 hidden items-center gap-1 md:flex">
//           <DesktopNavLink
//             to="/admin/dashboard"
//             label="Dashboard"
//             active={isActive("/admin/dashboard")}
//           />

//           <DesktopNavLink
//             to="/admin/users"
//             label="Users"
//             active={isSectionActive(["/admin/users"])}
//           />

//           <DesktopNavLink
//             to="/admin/connections"
//             label="Connections"
//             active={isSectionActive(["/admin/connections"])}
//           />

//           <DesktopNavLink
//             to="/admin/reports/scenarios"
//             label="Reports"
//             active={isSectionActive(["/admin/reports"])}
//           />
//         </nav>
//       </div>

//       <button
//         type="button"
//         onClick={handleLogout}
//         className="flex h-9 items-center gap-2 rounded-full bg-[#11110f] px-5 text-xs font-semibold text-white"
//       >
//         <FiLogOut className="h-4 w-4" />
//         Logout
//       </button>
//     </div>
//   );

//   return (
//     <>
//       <header className="fixed left-0 right-0 top-0 z-50 border-b border-[#efede8] bg-white">
//         {role === "admin" ? renderAdminNavbar() : renderUserNavbar()}
//       </header>

//       {guideStep > 0 && guideStep <= LAST_STEP && (
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
import React, { useContext, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FiAlertTriangle,
  FiBarChart2,
  FiChevronDown,
  FiGrid,
  FiInbox,
  FiLink,
  FiLogOut,
  FiMenu,
  FiPlus,
  FiSettings,
  FiUser,
  FiX,
  FiZap,
} from "react-icons/fi";
import { jwtDecode } from "jwt-decode";

import SidebarTooltip from "./SidebarTooltip";
import { UserContext } from "./UserContext";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  const [isNewScenarioMenuOpen, setIsNewScenarioMenuOpen] = useState(false);
  const newScenarioMenuRef = useRef(null);
  const [role, setRole] = useState("user");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isScenarioMenuOpen, setIsScenarioMenuOpen] = useState(false);
  const [guideStep, setGuideStep] = useState(0);

  // Limit restriction state
  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);

  const profileMenuRef = useRef(null);
  const scenarioMenuRef = useRef(null);

  const leadRef = useRef(null);
  const allScenarioRef = useRef(null);
  const shopifyScenarioRef = useRef(null);
  const customScenarioRef = useRef(null);

  const token = localStorage.getItem("usertoken");
  const userId = localStorage.getItem("userid");

  const LAST_STEP = 4;

  const isActive = (path) => location.pathname === path;

  const isSectionActive = (paths) =>
    paths.some(
      (path) =>
        location.pathname === path || location.pathname.startsWith(`${path}/`),
    );

  const inboxCount =
    typeof user?.unreadEmails === "number"
      ? user.unreadEmails
      : typeof user?.unreadCount === "number"
        ? user.unreadCount
        : 0;

  const userName =
    user?.name ||
    user?.fullName ||
    user?.username ||
    user?.email?.split("@")?.[0] ||
    "User";

  const userInitials = userName
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // Scenario limit check helper
  const handleScenarioNavigation = (e, scenarioType) => {
    // Determine limits from user context or backend state (Fallback to mock check if user counts aren't present)
    const shopifyCount = user?.shopifyScenarioCount || 0;
    const customCount = user?.customScenarioCount || 0;

    const isShopifyLimitReached = scenarioType === "shopify" && shopifyCount >= 1;
    const isCustomLimitReached = scenarioType === "custom" && customCount >= 2;

    // Check overall or specific limit restriction
    if (isShopifyLimitReached || isCustomLimitReached || user?.hasReachedLimit) {
      e.preventDefault();
      setIsNewScenarioMenuOpen(false);
      setIsMobileMenuOpen(false);
      setIsLimitModalOpen(true);
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("usertoken");

    if (!storedToken) return;

    try {
      const decoded = jwtDecode(storedToken);

      if (decoded?.payLoad?.role) {
        setRole(decoded.payLoad.role);
      }
    } catch (error) {
      console.error("Token decoding failed:", error);
    }
  }, []);

  useEffect(() => {
    const fetchGuide = async () => {
      if (!token || !userId) return;

      try {
        const response = await fetch(
          `https://email-syncing-backend.vercel.app/auth/guide/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await response.json();

        if (data?.sidebar?.completed) {
          setGuideStep(0);
          return;
        }

        setGuideStep(data?.sidebar?.step || 1);
      } catch (error) {
        console.error("Guide fetch error:", error);
      }
    };

    fetchGuide();
  }, [token, userId]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        newScenarioMenuRef.current &&
        !newScenarioMenuRef.current.contains(event.target)
      ) {
        setIsNewScenarioMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  useEffect(() => {
    const closeDropdowns = (event) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setIsProfileMenuOpen(false);
      }

      if (
        scenarioMenuRef.current &&
        !scenarioMenuRef.current.contains(event.target)
      ) {
        setIsScenarioMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", closeDropdowns);

    return () => {
      document.removeEventListener("mousedown", closeDropdowns);
    };
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileMenuOpen(false);
    setIsScenarioMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      if (userId) {
        await fetch(
          `https://email-syncing-backend.vercel.app/auth/logout/${userId}`,
          {
            method: "POST",
          },
        );
      }
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      localStorage.clear();
      navigate("/login", { replace: true });
      window.location.reload();
    }
  };

  const updateGuide = async (payload) => {
    if (!token || !userId) return;

    try {
      await fetch(
        `https://email-syncing-backend.vercel.app/auth/guide/${userId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );
    } catch (error) {
      console.error("Guide update error:", error);
    }
  };

  const nextGuide = async () => {
    const nextStep = guideStep + 1;

    if (nextStep > LAST_STEP) {
      setGuideStep(0);

      await updateGuide({
        type: "sidebar",
        completed: true,
        step: LAST_STEP + 1,
      });

      window.dispatchEvent(new Event("sidebarGuideCompleted"));
      return;
    }

    setGuideStep(nextStep);

    await updateGuide({
      type: "sidebar",
      step: nextStep,
    });
  };

  const skipGuide = async () => {
    setGuideStep(0);

    await updateGuide({
      type: "sidebar",
      completed: true,
    });

    window.dispatchEvent(new Event("sidebarGuideCompleted"));
  };

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

  const DesktopNavLink = ({ to, label, Icon, active, badge, linkRef }) => (
    <Link
      to={to}
      ref={linkRef}
      className={`flex h-9 items-center gap-2 rounded-[8px] px-4 text-[13px] font-medium transition-colors ${
        active
          ? "bg-gray-100 text-black"
          : "text-zinc-600 hover:bg-gray-100 hover:text-black"
      }`}
    >
      {Icon && <Icon className="h-4 w-4 lg:hidden" />}

      <span>{label}</span>

      {badge > 0 && (
        <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#f5b83d] px-1 text-[10px] font-bold text-black">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </Link>
  );

  const MobileNavLink = ({ to, label, Icon, active, badge }) => (
    <Link
      to={to}
      className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium ${
        active
          ? "bg-gray-100 text-black"
          : "text-zinc-600 hover:bg-zinc-100 hover:text-black"
      }`}
    >
      <span className="flex items-center gap-3">
        <Icon className="h-5 w-5" />
        {label}
      </span>

      {badge > 0 && (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#f5b83d] px-1 text-[10px] font-bold text-black">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </Link>
  );

  const renderUserNavbar = () => (
    <>
      <div className="flex h-[60px] items-center justify-between px-5 sm:px-7">
        {/* Left section */}
        <div className="flex min-w-0 items-center">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 text-gray-900"
          >
            <BrandLogo />
          </Link>

          {/* Desktop navigation */}
          <nav className="ml-8 hidden items-center gap-1 md:flex">
            <DesktopNavLink
              to="/dashboard"
              label="Dashboard"
              Icon={FiGrid}
              active={isActive("/dashboard")}
            />

            <div ref={scenarioMenuRef} className="relative">
              <button
                type="button"
                ref={allScenarioRef}
                onClick={() =>
                  setIsScenarioMenuOpen((previousValue) => !previousValue)
                }
                className={`flex h-9 items-center gap-1.5 rounded-[8px] px-4 text-[13px] font-medium transition-colors ${
                  isSectionActive(["/scenarios"])
                    ? "bg-gray-100 text-black"
                    : "text-zinc-600 hover:bg-gray-100 hover:text-black"
                }`}
              >
                <span>Scenarios</span>

                <FiChevronDown
                  className={`h-3.5 w-3.5 transition-transform ${
                    isScenarioMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isScenarioMenuOpen && (
                <div className="absolute left-0 top-[46px] z-50 w-56 overflow-hidden rounded-2xl border border-zinc-200 bg-white p-2 shadow-xl">
                  <Link
                    to="/scenarios/all"
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-zinc-700 hover:bg-zinc-100 hover:text-black"
                  >
                    <FiZap className="h-4 w-4" />
                    All Scenarios
                  </Link>

                  <Link
                    to="/scenarios/shopify"
                    ref={shopifyScenarioRef}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-zinc-700 hover:bg-zinc-100 hover:text-black"
                  >
                    <FiGrid className="h-4 w-4" />
                    Shopify Scenario
                  </Link>

                  <Link
                    to="/scenarios/others"
                    ref={customScenarioRef}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-zinc-700 hover:bg-zinc-100 hover:text-black"
                  >
                    <FiSettings className="h-4 w-4" />
                    Custom Scenario
                  </Link>
                </div>
              )}
            </div>

            <DesktopNavLink
              to="/inbox"
              label="Inbox"
              Icon={FiInbox}
              active={isSectionActive(["/inbox"])}
              badge={inboxCount}
              linkRef={leadRef}
            />

            {/* <DesktopNavLink
              to="/analytics"
              label="Analytics"
              Icon={FiBarChart2}
              active={isSectionActive(["/analytics"])}
            /> */}

            <DesktopNavLink
              to="/connection"
              label="Connections"
              Icon={FiLink}
              active={isSectionActive(["/connection"])}
            />
          </nav>
        </div>

        {/* Right section */}
        <div className="hidden items-center gap-3 md:flex">
          <div ref={newScenarioMenuRef} className="relative flex">
            {/* Main button: direct Shopify scenario */}
            <Link
              to="/scenarios/shopify"
              onClick={(e) => handleScenarioNavigation(e, "shopify")}
              className="flex h-9 items-center gap-2 rounded-l-[8px] bg-[#11110f] px-4 text-[12px] font-semibold text-white transition hover:bg-black"
            >
              <FiPlus className="h-4 w-4" />
              <span>New scenario</span>
            </Link>

            {/* Dropdown toggle */}
            <button
              type="button"
              onClick={() =>
                setIsNewScenarioMenuOpen((previousValue) => !previousValue)
              }
              className="flex h-9 w-9 items-center justify-center rounded-r-[8px] border-l border-white/20 bg-[#11110f] text-white transition hover:bg-black"
              aria-label="Open scenario menu"
              aria-expanded={isNewScenarioMenuOpen}
            >
              <FiChevronDown
                className={`h-4 w-4 transition-transform ${
                  isNewScenarioMenuOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown */}
            {isNewScenarioMenuOpen && (
              <div className="absolute right-0 top-[44px] z-50 w-52 overflow-hidden rounded-[8px] border border-zinc-200 bg-white py-2 shadow-lg">
                <Link
                  to="/scenarios/shopify"
                  onClick={(e) => handleScenarioNavigation(e, "shopify")}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 hover:text-black"
                >
                  <FiZap className="h-4 w-4" />
                  <span>Shopify Scenario</span>
                </Link>

                <Link
                  to="/scenarios/others"
                  onClick={(e) => handleScenarioNavigation(e, "custom")}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 hover:text-black"
                >
                  <FiSettings className="h-4 w-4" />
                  <span>Custom Scenario</span>
                </Link>
              </div>
            )}
          </div>

          <div ref={profileMenuRef} className="relative">
            <button
              type="button"
              onClick={() =>
                setIsProfileMenuOpen((previousValue) => !previousValue)
              }
              className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-200 text-[11px] font-semibold text-black transition hover:ring-2 hover:ring-[#d9c99f]"
              aria-label="Open profile menu"
            >
              {userInitials}
            </button>

            {isProfileMenuOpen && (
              <div className="absolute right-0 top-[46px] z-50 w-56 overflow-hidden rounded-[8px] border border-zinc-200 bg-white p-2 shadow-xl">
                <div className="border-b border-zinc-100 px-3 py-2.5">
                  <p className="truncate text-sm font-semibold text-zinc-900">
                    {userName}
                  </p>

                  {user?.email && (
                    <p className="mt-0.5 truncate text-xs text-zinc-500">
                      {user.email}
                    </p>
                  )}
                </div>

                <Link
                  to="/profile"
                  className="mt-1 flex items-center gap-3 rounded-[8px] px-3 py-2.5 text-sm text-zinc-700 hover:bg-zinc-100 hover:text-black"
                >
                  <FiUser className="h-4 w-4" />
                  Profile
                </Link>

                <Link
                  to="/connection"
                  className="flex items-center gap-3 rounded-[8px] px-3 py-2.5 text-sm text-zinc-700 hover:bg-zinc-100 hover:text-black"
                >
                  <FiSettings className="h-4 w-4" />
                  Connections
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-[8px] px-3 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
                >
                  <FiLogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen((previousValue) => !previousValue)}
          className="flex h-10 w-10 items-center justify-center rounded-full text-zinc-700 hover:bg-zinc-100 md:hidden"
          aria-label="Toggle navigation menu"
        >
          {isMobileMenuOpen ? (
            <FiX className="h-5 w-5" />
          ) : (
            <FiMenu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Mobile navigation */}
      {isMobileMenuOpen && (
        <div className="border-t border-zinc-100 bg-white px-4 py-4 md:hidden">
          <nav className="space-y-1">
            <MobileNavLink
              to="/dashboard"
              label="Dashboard"
              Icon={FiGrid}
              active={isActive("/dashboard")}
            />

            <MobileNavLink
              to="/scenarios/all"
              label="Scenarios"
              Icon={FiZap}
              active={isSectionActive(["/scenarios"])}
            />

            <MobileNavLink
              to="/inbox"
              label="Inbox"
              Icon={FiInbox}
              active={isSectionActive(["/inbox"])}
              badge={inboxCount}
            />

            {/* <MobileNavLink
              to="/analytics"
              label="Analytics"
              Icon={FiBarChart2}
              active={isSectionActive(["/analytics"])}
            /> */}

            <MobileNavLink
              to="/connection"
              label="Connections"
              Icon={FiLink}
              active={isSectionActive(["/connection"])}
            />

            <MobileNavLink
              to="/profile"
              label="Profile"
              Icon={FiUser}
              active={isActive("/profile")}
            />
          </nav>

          <Link
            to="/scenarios/shopify"
            onClick={(e) => handleScenarioNavigation(e, "shopify")}
            className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#11110f] text-sm font-semibold text-white"
          >
            New scenario
            <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#f5b83d]">
              <FiPlus className="h-3 w-3 stroke-[3] text-black" />
            </span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-full text-sm font-medium text-red-600 hover:bg-red-50"
          >
            <FiLogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      )}
    </>
  );

  const renderAdminNavbar = () => (
    <div className="flex h-[60px] items-center justify-between px-5 sm:px-7">
      <div className="flex items-center">
        <Link to="/admin/dashboard">
          <BrandLogo label="Replex Admin" />
        </Link>

        <nav className="ml-8 hidden items-center gap-1 md:flex">
          <DesktopNavLink
            to="/admin/dashboard"
            label="Dashboard"
            active={isActive("/admin/dashboard")}
          />

          <DesktopNavLink
            to="/admin/users"
            label="Users"
            active={isSectionActive(["/admin/users"])}
          />

          <DesktopNavLink
            to="/admin/connections"
            label="Connections"
            active={isSectionActive(["/admin/connections"])}
          />

          <DesktopNavLink
            to="/admin/reports/scenarios"
            label="Reports"
            active={isSectionActive(["/admin/reports"])}
          />
        </nav>
      </div>

      <button
        type="button"
        onClick={handleLogout}
        className="flex h-9 items-center gap-2 rounded-full bg-[#11110f] px-5 text-xs font-semibold text-white"
      >
        <FiLogOut className="h-4 w-4" />
        Logout
      </button>
    </div>
  );

  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-50 border-b border-[#efede8] bg-white">
        {role === "admin" ? renderAdminNavbar() : renderUserNavbar()}
      </header>

      {guideStep > 0 && guideStep <= LAST_STEP && (
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

      {/* Scenario Limit Reached Modal */}
      {isLimitModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl transition-all">
            {/* Close Button */}
            <button
              onClick={() => setIsLimitModalOpen(false)}
              className="absolute right-4 top-4 rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
            >
              <FiX className="h-5 w-5" />
            </button>

            {/* Warning Icon Container */}
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 ring-1 ring-zinc-200">
              <FiAlertTriangle className="h-5 w-5 text-zinc-800" />
            </div>

            {/* Title & Description */}
            <h3 className="text-lg font-bold text-zinc-900">
              Scenario Limit Reached
            </h3>
            <p className="mt-2 text-sm text-zinc-600 leading-relaxed">
              You have reached the free tier limit of{" "}
              <strong className="font-semibold text-zinc-900">1 Shopify scenario</strong>{" "}
              and <strong className="font-semibold text-zinc-900">2 custom scenarios</strong>.
            </p>

            {/* Pro Plan Box */}
            <div className="mt-5 rounded-xl border border-zinc-200 bg-zinc-50/50 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
                <FiZap className="h-4 w-4 text-zinc-800" />
                Pro Plan Coming Soon
              </div>
              <p className="mt-1.5 text-xs text-zinc-500 leading-normal">
                Higher limits and advanced workflow automation features will be available with the Pro plan.
              </p>
            </div>

            {/* Footer Action */}
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setIsLimitModalOpen(false)}
                className="rounded-lg bg-zinc-950 px-5 py-2.5 text-xs font-medium text-white transition hover:bg-zinc-800"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
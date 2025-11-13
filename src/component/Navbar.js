// import React, { useState, useContext } from "react";
// import {
//   FiEdit3,
//   FiMoreVertical,
//   FiHelpCircle,
//   FiSend,
//   FiBell,
// } from "react-icons/fi";
// import { useNavigate } from "react-router-dom";
// import OrganizationSettingsModal from "./OrganizationSettingsModal";
// import ScenarioSelectModal from "./ScenarioSelectModal";
// import { UserContext } from "./UserContext";

// const Navbar = () => {
//   const [open, setOpen] = useState(false);
//   const [openScenario, setOpenScenario] = useState(false);
//   const navigate = useNavigate();

//   const { user, loading } = useContext(UserContext);

//   const handleSelect = (type) => {
//     console.log("Selected Scenario:", type);
//     setOpenScenario(false);
//   };

//   const setupCompleted = user?.setup?.completed === true;

//   return (
//     <header className="w-full bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-end sticky top-0 z-30 shadow-sm">
//       <div className="flex items-center gap-3">
//         {!loading && user && (
//           <button
//             onClick={() => navigate("/setup")}
//             className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition
//               ${
//                 setupCompleted
//                   ? "bg-green-100 text-green-700 hover:bg-green-200 border border-green-300"
//                   : "bg-purple-600 text-white hover:bg-purple-700"
//               }`}
//           >
//             {setupCompleted ? "Wizard Completed" : "Complete Wizard"}
//           </button>
//         )}

//         <button
//           onClick={() => setOpen(true)}
//           className="flex items-center gap-2 bg-white border border-gray-300 hover:border-gray-400 text-gray-700 px-3 py-1.5 rounded-md text-sm font-medium transition"
//         >
//           <FiEdit3 className="text-gray-500" />
//           Organization settings
//         </button>

//         <button className="p-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100 transition">
//           <FiMoreVertical className="w-4 h-4" />
//         </button>

//         <button
//           onClick={() => setOpenScenario(true)}
//           className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-1.5 rounded-md text-sm font-medium transition"
//         >
//           + Create scenario
//         </button>

//         <div className="w-px h-6 bg-gray-300 mx-2"></div>

//         <button className="p-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100 transition">
//           <FiHelpCircle className="w-5 h-5" />
//         </button>
//         <button className="p-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100 transition">
//           <FiSend className="w-5 h-5" />
//         </button>
//         <button className="p-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100 transition">
//           <FiBell className="w-5 h-5" />
//         </button>

//         <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm font-semibold cursor-pointer hover:bg-purple-700 transition">
//           {user?.name ? user.name.slice(0, 2).toUpperCase() : "U"}
//         </div>
//       </div>

//       {/* Modals */}
//       <OrganizationSettingsModal open={open} onClose={() => setOpen(false)} />
//       <ScenarioSelectModal
//         open={openScenario}
//         onClose={() => setOpenScenario(false)}
//         onSelect={handleSelect}
//       />
//     </header>
//   );
// };

// export default Navbar;
// import React, { useState, useContext, useRef, useEffect } from "react";
// import {
//   FiEdit3,
//   FiMoreVertical,
//   FiHelpCircle,
//   FiSend,
//   FiBell,
//   FiUser,
//   FiLogOut,
// } from "react-icons/fi";
// import { useNavigate } from "react-router-dom";
// import OrganizationSettingsModal from "./OrganizationSettingsModal";
// import ScenarioSelectModal from "./ScenarioSelectModal";
// import { UserContext } from "./UserContext";
// import axios from "axios";

// const Navbar = () => {
//   const [open, setOpen] = useState(false);
//   const [openScenario, setOpenScenario] = useState(false);
//   const [showProfileMenu, setShowProfileMenu] = useState(false);
//   const profileRef = useRef(null);
//   const navigate = useNavigate();

//   const { user, loading } = useContext(UserContext);

//   const handleSelect = (type) => {
//     console.log("Selected Scenario:", type);
//     setOpenScenario(false);
//   };

//   // Check if any step is skipped or incomplete
//   const hasSkippedStep = user?.setup?.steps?.some(
//     (step) => step.status === "skipped" || step.status === "incomplete"
//   );

//   const setupCompleted = !hasSkippedStep; // if none skipped, wizard completed
// const handleWizardClick = () => {
//   if (!user) return;
//   const skippedStep = user?.setup?.steps?.find((s) => s.status === "skipped");
//   if (skippedStep) {
//     navigate(`/setup?step=${skippedStep.step}`);
//   } else {
//     navigate("/setup");
//   }
// };


//   useEffect(() => {
//     const handleClickOutside = (e) => {
//       if (profileRef.current && !profileRef.current.contains(e.target)) {
//         setShowProfileMenu(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//  const handleLogout = async () => {
//     const userId = localStorage.getItem("userid");
//     try {
//       await fetch(
//         `https://email-syncing-backend.vercel.app/auth/logout/${userId}`,
//         { method: "POST" }
//       );
//       localStorage.clear();
//       navigate("/login", { replace: true });
//     } catch (error) {
//       console.error("Logout failed:", error);
//     }
//   };
// const handleSkipSetup = async () => {
//   const userId = localStorage.getItem("userid");
//   await axios.post(`https://email-syncing-backend.vercel.app/auth/skip-all/${userId}`);
//   alert("All setup steps skipped successfully!");
// };

//   return (
//     <header className="w-full bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-end sticky top-0 z-30 shadow-sm">
//       <div className="flex items-center gap-3">
//        {!loading && user && (
//   <button
//     onClick={handleWizardClick}
//     className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition
//       ${
//         setupCompleted
//           ? "bg-green-100 text-green-700 hover:bg-green-200 border border-green-300"
//           : "bg-purple-600 text-white hover:bg-purple-700"
//       }`}
//   >
//     {(() => {
//       const totalSteps = user?.setup?.steps?.length || 0;
//       const completedSteps = user?.setup?.steps?.filter(
//         (s) => s.status === "completed"
//       ).length;

//       if (setupCompleted) {
//         return (
//           <>
//             Wizard Completed <span className="text-xs">({completedSteps}/{totalSteps})</span>
//           </>
//         );
//       } else {
//         return (
//           <>
//             Complete Wizard{" "}
//             <span className="text-xs font-normal">
//               ({completedSteps}/{totalSteps})
//             </span>
//           </>
//         );
//       }
//     })()}
//   </button>
// )}


//         <button
//           onClick={() => setOpen(true)}
//           className="flex items-center gap-2 bg-white border border-gray-300 hover:border-gray-400 text-gray-700 px-3 py-1.5 rounded-md text-sm font-medium transition"
//         >
//           <FiEdit3 className="text-gray-500" />
//           Organization settings
//         </button>

//         {/* <button className="p-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100 transition">
//           <FiMoreVertical className="w-4 h-4" />
//         </button> */}

//         <button
//           onClick={() => setOpenScenario(true)}
//           className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-1.5 rounded-md text-sm font-medium transition"
//         >
//           + Create scenario
//         </button>

//         <div className="w-px h-6 bg-gray-300 mx-2"></div>
// {/* 
//         <button className="p-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100 transition">
//           <FiHelpCircle className="w-5 h-5" />
//         </button>
//         <button className="p-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100 transition">
//           <FiSend className="w-5 h-5" />
//         </button> */}
//         <button onClick={handleSkipSetup} className="p-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100 transition">
//           {/* <FiBell className="w-5 h-5" /> */}
//           reset
//         </button>

//         <div className="relative" ref={profileRef}>
//           <div
//             onClick={() => setShowProfileMenu(!showProfileMenu)}
//             className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm font-semibold cursor-pointer hover:bg-purple-700 transition"
//           >
//             {user?.fullName ? user.fullName.slice(0, 2).toUpperCase() : "U"}
//           </div>

//           {showProfileMenu && (
//             <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-50 animate-fade-in">
//               <button
//                 onClick={() => {
//                   setShowProfileMenu(false);
//                   navigate("/profile");
//                 }}
//                 className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
//               >
//                 <FiUser /> My Profile
//               </button>

//               <button
//                 onClick={handleLogout}
//                 className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
//               >
//                 <FiLogOut /> Logout
//               </button>
//             </div>
//           )}
//         </div>
//       </div>

//       <OrganizationSettingsModal open={open} onClose={() => setOpen(false)} />
//       <ScenarioSelectModal
//         open={openScenario}
//         onClose={() => setOpenScenario(false)}
//         onSelect={handleSelect}
//       />
//     </header>
//   );
// };

// export default Navbar;
// import React, { useState, useContext, useRef, useEffect } from "react";
// import {
//   FiEdit3,
//   FiLogOut,
//   FiUser,
// } from "react-icons/fi";
// import { useNavigate } from "react-router-dom";
// import OrganizationSettingsModal from "./OrganizationSettingsModal";
// import ScenarioSelectModal from "./ScenarioSelectModal";
// import { UserContext } from "./UserContext";
// import axios from "axios";

// const Navbar = () => {
//   const [open, setOpen] = useState(false);
//   const [openScenario, setOpenScenario] = useState(false);
//   const [showProfileMenu, setShowProfileMenu] = useState(false);
//   const profileRef = useRef(null);
//   const navigate = useNavigate();

//   const { user, loading } = useContext(UserContext);

//   const handleSelect = (type) => {
//     console.log("Selected Scenario:", type);
//     setOpenScenario(false);
//   };

//   const hasSkippedStep = user?.setup?.steps?.some(
//     (step) => step.status === "skipped" || step.status === "incomplete"
//   );
//   const setupCompleted = !hasSkippedStep;

//   const handleWizardClick = () => {
//     if (!user) return;
//     const skippedStep = user?.setup?.steps?.find((s) => s.status === "skipped");
//     if (skippedStep) {
//       navigate(`/setup?step=${skippedStep.step}`);
//     } else {
//       navigate("/setup");
//     }
//   };

//   useEffect(() => {
//     const handleClickOutside = (e) => {
//       if (profileRef.current && !profileRef.current.contains(e.target)) {
//         setShowProfileMenu(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   const handleLogout = async () => {
//     const userId = localStorage.getItem("userid");
//     try {
//       await fetch(
//         `https://email-syncing-backend.vercel.app/auth/logout/${userId}`,
//         { method: "POST" }
//       );
//       localStorage.clear();
//       navigate("/login", { replace: true });
//     } catch (error) {
//       console.error("Logout failed:", error);
//     }
//   };

//   const handleSkipSetup = async () => {
//     const userId = localStorage.getItem("userid");
//     await axios.post(
//       `https://email-syncing-backend.vercel.app/auth/skip-all/${userId}`
//     );
//     alert("All setup steps skipped successfully!");
//   };

//   return (
//   <header
//   className="
//     w-full px-6 py-3 flex items-center justify-end sticky top-0 z-30
//     bg-white/30 backdrop-blur-[16px]
//     border-b border-white/50
//     shadow-[0_4px_20px_rgba(0,0,0,0.15)]
//   "
//   style={{ WebkitBackdropFilter: "blur(16px)" }}
// >
//   <div className="flex items-center gap-3">

//     {/* ⭐ DESKTOP BUTTONS */}
//     <div className="hidden md:flex items-center gap-3">

//       {/* Wizard Button (Glass Style) */}
//       {!loading && user && (
//         <button
//           onClick={handleWizardClick}
//           className="
//             flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold
//             bg-white/40 text-gray-900
//             border border-white/60
//             shadow-[0_4px_15px_rgba(0,0,0,0.12)]
//             hover:bg-white/50 hover:shadow-[0_6px_25px_rgba(0,0,0,0.18)]
//             transition-all backdrop-blur-xl
//           "
//         >
//           {(() => {
//             const totalSteps = user?.setup?.steps?.length || 0;
//             const completedSteps = user?.setup?.steps?.filter(
//               (s) => s.status === "completed"
//             ).length;

//             return (
//               <>
//                 {!setupCompleted ? "Complete Wizard" : "Wizard Completed"}{" "}
//                 <span className="text-xs opacity-80">
//                   ({completedSteps}/{totalSteps})
//                 </span>
//               </>
//             );
//           })()}
//         </button>
//       )}

//       {/* Organization Settings Button */}
//       <button
//         onClick={() => setOpen(true)}
//         className="
//           flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold
//           bg-white/40 text-gray-900
//           border border-white/60
//           shadow-[0_4px_15px_rgba(0,0,0,0.12)]
//           hover:bg-white/50 hover:shadow-[0_6px_25px_rgba(0,0,0,0.18)]
//           transition-all backdrop-blur-xl
//         "
//       >
//         <FiEdit3 className="text-indigo-600" />
//         Organization Settings
//       </button>

//       {/* Create Scenario Button (Purple) */}
//       <button
//         onClick={() => setOpenScenario(true)}
//         className="
//           flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold
//           bg-indigo-600 text-white
//           shadow-[0_4px_20px_rgba(99,102,241,0.4)]
//           hover:bg-indigo-700 transition-all
//         "
//       >
//         + Create Scenario
//       </button>

//       {/* Reset Button */}
//       <button
//         onClick={handleSkipSetup}
//         className="
//           p-2 rounded-full text-gray-700 hover:text-gray-900 
//           hover:bg-white/40 border border-white/50 
//           backdrop-blur-xl transition
//         "
//       >
//         reset
//       </button>
//     </div>

//     {/* ⭐ PROFILE DROPDOWN */}
//     <div className="relative" ref={profileRef}>
//       <div
//         onClick={() => setShowProfileMenu(!showProfileMenu)}
//         className="
//           w-9 h-9 rounded-full bg-indigo-600 
//           flex items-center justify-center
//           text-white text-sm font-bold 
//           cursor-pointer hover:bg-indigo-700 transition
//           shadow-[0_3px_12px_rgba(0,0,0,0.25)]
//         "
//       >
//         {user?.fullName ? user.fullName.slice(0, 2).toUpperCase() : "U"}
//       </div>

//       {/* 🎉 Glass Dropdown Menu */}
//       {showProfileMenu && (
//         <div
//           className="
//             absolute right-0 mt-2 w-48
//             bg-white/40 backdrop-blur-xl
//             border border-white/60
//             rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.25)]
//             py-1 z-50 animate-fade-in
//           "
//         >
//           <button
//             onClick={() => {
//               setShowProfileMenu(false);
//               navigate("/profile");
//             }}
//             className="
//               w-full text-left px-4 py-2 text-sm text-gray-800 
//               hover:bg-white/60 
//               flex items-center gap-2 transition
//             "
//           >
//             <FiUser className="text-indigo-600" /> My Profile
//           </button>

//           <button
//             onClick={handleLogout}
//             className="
//               w-full text-left px-4 py-2 text-sm text-gray-800 
//               hover:bg-white/60 
//               flex items-center gap-2 transition
//             "
//           >
//             <FiLogOut className="text-indigo-600" /> Logout
//           </button>
//         </div>
//       )}
//     </div>
//   </div>

//   {/* MODALS */}
//   <OrganizationSettingsModal open={open} onClose={() => setOpen(false)} />
//   <ScenarioSelectModal
//     open={openScenario}
//     onClose={() => setOpenScenario(false)}
//     onSelect={handleSelect}
//   />
// </header>

//   );
// };

// export default Navbar;
import React, { useState, useContext, useRef, useEffect } from "react";
import {
  FiEdit3,
  FiLogOut,
  FiUser,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import OrganizationSettingsModal from "./OrganizationSettingsModal";
import ScenarioSelectModal from "./ScenarioSelectModal";
import { UserContext } from "./UserContext";
import axios from "axios";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [openScenario, setOpenScenario] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileRef = useRef(null);
  const navigate = useNavigate();

  const { user, loading } = useContext(UserContext);

  const handleSelect = (type) => {
    console.log("Selected Scenario:", type);
    setOpenScenario(false);
  };

  const hasSkippedStep = user?.setup?.steps?.some(
    (step) => step.status === "skipped" || step.status === "incomplete"
  );
  const setupCompleted = !hasSkippedStep;

  const handleWizardClick = () => {
    if (!user) return;
    const skippedStep = user?.setup?.steps?.find((s) => s.status === "skipped");
    if (skippedStep) {
      navigate(`/setup?step=${skippedStep.step}`);
    } else {
      navigate("/setup");
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const handleSkipSetup = async () => {
    const userId = localStorage.getItem("userid");
    await axios.post(
      `https://email-syncing-backend.vercel.app/auth/skip-all/${userId}`
    );
    alert("All setup steps skipped successfully!");
  };

  return (
  <header
  className="
    w-full px-6 py-3 flex items-center justify-end sticky top-0 z-30
    bg-white/20 backdrop-blur-xl
    border-b border-white/30
    shadow-[0_4px_20px_rgba(0,0,0,0.1)]
  "
>
  <div className="flex items-center gap-3">

    {/* Desktop Buttons */}
    <div className="hidden md:flex items-center gap-3">

      {/* Wizard Button */}
      {!loading && user && (
        <button
          onClick={handleWizardClick}
          className="
            flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold
            bg-white/40 backdrop-blur-md border border-white/50
            text-gray-900 hover:bg-white/60 transition-all
            shadow-[0_4px_15px_rgba(0,0,0,0.1)]
          "
        >
          {(() => {
            const totalSteps = user?.setup?.steps?.length || 0;
            const completedSteps = user?.setup?.steps?.filter(
              (s) => s.status === 'completed'
            ).length;

            return (
              <>
                {!setupCompleted ? 'Complete Wizard' : 'Wizard Completed'}
                <span className="text-xs opacity-70">
                  ({completedSteps}/{totalSteps})
                </span>
              </>
            );
          })()}
        </button>
      )}

      {/* Organization Settings */}
      <button
        onClick={() => setOpen(true)}
        className="
          flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold
          bg-white/40 backdrop-blur-md border border-white/50
          text-gray-900 hover:bg-white/60 transition-all
          shadow-[0_4px_15px_rgba(0,0,0,0.1)]
        "
      >
        <FiEdit3 className="text-indigo-600" />
        Organization Settings
      </button>

      {/* Create Scenario */}
      <button
        onClick={() => setOpenScenario(true)}
        className="
          flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold
          bg-indigo-600 text-white hover:bg-indigo-700 transition-all
          shadow-[0_4px_15px_rgba(0,0,0,0.2)]
        "
      >
        + Create Scenario
      </button>

      {/* Reset */}
      <button
        onClick={handleSkipSetup}
        className="
          p-2 rounded-full text-gray-700 hover:text-gray-900 
          hover:bg-white/50 backdrop-blur-md border border-white/40 transition
        "
      >
        reset
      </button>
    </div>

    {/* Profile Menu */}
    <div className="relative" ref={profileRef}>
      <div
        onClick={() => setShowProfileMenu(!showProfileMenu)}
        className="
          w-9 h-9 rounded-full bg-indigo-600 
          flex items-center justify-center
          text-white text-sm font-bold cursor-pointer
          hover:bg-indigo-700 transition shadow-md
        "
      >
        {user?.fullName ? user.fullName.slice(0, 2).toUpperCase() : 'U'}
      </div>

      {showProfileMenu && (
        <div
          className="
            absolute right-0 mt-2 w-48 rounded-xl py-1 z-50
            bg-white/40 backdrop-blur-xl border border-white/60
            shadow-[0_4px_20px_rgba(0,0,0,0.15)]
          "
        >
          <button
            onClick={() => {
              setShowProfileMenu(false);
              navigate('/profile');
            }}
            className="
              w-full text-left px-4 py-2 text-sm text-gray-800
              hover:bg-white/60 flex items-center gap-2 transition
            "
          >
            <FiUser className="text-indigo-600" /> My Profile
          </button>

          <button
            onClick={handleLogout}
            className="
              w-full text-left px-4 py-2 text-sm text-gray-800
              hover:bg-white/60 flex items-center gap-2 transition
            "
          >
            <FiLogOut className="text-indigo-600" /> Logout
          </button>
        </div>
      )}
    </div>
  </div>

  {/* Modals */}
  <OrganizationSettingsModal open={open} onClose={() => setOpen(false)} />
  <ScenarioSelectModal
    open={openScenario}
    onClose={() => setOpenScenario(false)}
    onSelect={handleSelect}
  />
</header>

  );
};

export default Navbar;

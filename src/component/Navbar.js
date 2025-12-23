// import React, { useState, useContext, useRef, useEffect } from "react";
// import { FiEdit3, FiLogOut, FiUser } from "react-icons/fi";
// import { useNavigate } from "react-router-dom";
// import OrganizationSettingsModal from "./OrganizationSettingsModal";
// import ScenarioSelectModal from "./ScenarioSelectModal";
// import { UserContext } from "./UserContext";
// import axios from "axios";

// const Navbar = () => {
//   const [open, setOpen] = useState(false);
//   const [openScenario, setOpenScenario] = useState(false);
//   const [showProfileMenu, setShowProfileMenu] = useState(false);
//   const [showScenarioGuide, setShowScenarioGuide] = useState(false);
//   const [guideStep, setGuideStep] = useState(0);
//   useEffect(() => {
//     const step = localStorage.getItem("scenarioGuideStep");

//     if (!step) {
//       setGuideStep(1); // Start at Settings tooltip
//     } else if (step !== "done") {
//       setGuideStep(Number(step));
//     }
//   }, []);

//   const handleCloseGuide = () => {
//     localStorage.setItem("scenarioGuideSeen", "true");
//     setShowScenarioGuide(false);
//   };

//   const navigate = useNavigate();
//   const profileRef = useRef(null);

//   const { user, loading } = useContext(UserContext);

//   const handleSelect = (type) => {
//     setOpenScenario(false);
//   };

//   const hasSkippedStep = user?.setup?.steps?.some(
//     (step) => step.status === "skipped" || step.status === "incomplete"
//   );

//   const setupCompleted = !hasSkippedStep;

//   const handleWizardClick = () => {
//     if (!user) return;
//     const skippedStep = user?.setup?.steps?.find((s) => s.status === "skipped");

//     navigate(skippedStep ? `/setup?step=${skippedStep.step}` : "/setup");
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
//       if (userId) {
//         await fetch(
//           `http://localhost:5000/auth/logout/${userId}`,
//           { method: "POST" }
//         );
//       }

//       localStorage.clear();

//       navigate("/login", { replace: true });
//       window.location.reload();
//     } catch (error) {
//       console.error("Logout failed:", error);
//     }
//   };

//   const nextGuide = () => {
//   const next = guideStep + 1;

//   if (next > 2) {  
//     localStorage.setItem("scenarioGuideStep", "done");
//     setGuideStep(0);
//     return;
//   }

//   setGuideStep(next);
//   localStorage.setItem("scenarioGuideStep", next);
// };

// const skipGuide = () => {
//   setGuideStep(0);
//   localStorage.setItem("scenarioGuideStep", "done");
// };

//   const handleSkipSetup = async () => {
//     const userId = localStorage.getItem("userid");
//     await axios.post(
//       `http://localhost:5000/auth/skip-all/${userId}`
//     );
//     alert("All setup steps skipped.");
//   };
//   const skipAll = () => {
//     localStorage.setItem("scenarioGuideSeen", "true");
//     setShowScenarioGuide(false);
//   };
// const scenarioStep = localStorage.getItem("scenarioGuideStep");
// const isBlurred =
//   open ||
//   openScenario ||
//   showProfileMenu ||
//   showScenarioGuide ||
//   scenarioStep !== "done";

// useEffect(() => {
//   const sidebarStep = Number(localStorage.getItem("sidebarGuideStep"));
//   const navbarStep = localStorage.getItem("scenarioGuideStep");

//   // Sidebar not finished (step < 5) → block Navbar guide
//   if (!sidebarStep || sidebarStep < 5) {
//     setGuideStep(0);
//     return;
//   }

//   // Sidebar finished (step >= 5) → now Navbar guide can start
//   if (!navbarStep || navbarStep === "0") {
//     setGuideStep(1); // start Navbar Step 1
//   } else if (navbarStep !== "done") {
//     setGuideStep(Number(navbarStep));
//   }
// }, []);

//   return (
//     <>
//     {isBlurred && (
//       <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-20"></div>
//     )}

    
//     <header className="w-full bg-white px-6 py-3 flex items-center justify-end sticky top-0 z-30 border-b border-gray-100">
  
  
//       {/* --- Right Section --- */}
//       <div className="flex items-center gap-4">
//         {/* WIZARD BUTTON */}
//         {!loading && user && (
//           <button
//             onClick={handleWizardClick}
//             className={`hidden md:flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition
//             ${
//               setupCompleted
//                 ? "bg-gray-100 text-gray-800 hover:bg-gray-200"
//                 : "bg-indigo-600 text-white hover:bg-indigo-700"
//             }`}
//           >
//             {(() => {
//               const total = user?.setup?.steps?.length || 0;
//               const done = user?.setup?.steps?.filter(
//                 (s) => s.status === "completed"
//               ).length;

//               return setupCompleted
//                 ? `Wizard Completed (${done}/${total})`
//                 : `Complete Wizard (${done}/${total})`;
//             })()}
//           </button>
//         )}

//         {/* ORG SETTINGS */}
//         <div className="relative inline-block">
//           <button
//             onClick={() => setOpen(true)}
//             className={`hidden md:flex items-center gap-2 bg-white border border-gray-300 hover:border-gray-400 text-gray-700 px-3 py-1.5 rounded-md text-sm transition 
//     ${
//       guideStep === 1
//         ? "ring-4 ring-blue-400 ring-offset-2 relative z-[60]"
//         : ""
//     }`}
//           >
//             <FiEdit3 className="text-gray-500" />
//             Settings
//           </button>

    //       {guideStep === 1 && (
    //         <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-white shadow-xl border border-gray-200 rounded-lg w-72 p-4 z-[70]">
    //           <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-t border-l border-gray-200"></div>

    //           <div className="flex justify-between items-center mb-2">
    //             <h4 className="font-semibold text-gray-900">Settings</h4>
    //             <span className="text-xs text-gray-500">1/2</span>
    //           </div>

    //           <p className="text-sm text-gray-600 mb-3">
    //             Update your organization settings here.
    //           </p>

    //           <div className="flex justify-between">
    //             {/* <button
    //               onClick={skipGuide}
    //               className="px-3 py-1 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
    //             >
    //               Skip
    //             </button> */}
    //             <button
    //               onClick={nextGuide}
    //               className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
    //             >
    //               Next
    //             </button>
    //           </div>
    //         </div>
    //       )}
    //     </div>

    //     {/* CREATE SCENARIO */}
    //     <div className="relative inline-block">
    //       <button
    //         onClick={() => {
    //           setOpenScenario(true);
    //           setGuideStep(0);
    //           localStorage.setItem("scenarioGuideStep", "done");
    //         }}
    //         className={`hidden md:flex items-center gap-2 bg-black text-white px-4 py-1.5 rounded-md text-sm font-medium transition
    //   ${
    //     guideStep === 2
    //       ? "ring-4 ring-blue-400 ring-offset-2 relative z-[60]"
    //       : ""
    //   }
    // `}
    //       >
    //         + Scenario
    //       </button>

    //       {guideStep === 2 && (
    //         <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-white shadow-xl border border-gray-200 rounded-lg w-72 p-4 z-[70]">
    //           <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-t border-l border-gray-200"></div>

    //           <div className="flex justify-between items-center mb-2">
    //             <h4 className="font-semibold text-gray-900">Create Scenario</h4>
    //             <span className="text-xs text-gray-500">2/2</span>
    //           </div>

    //           <p className="text-sm text-gray-600 mb-3">
    //             Create your first automation scenario here.
    //           </p>

    //           <div className="flex justify-between">
    //             {/* <button
    //               onClick={skipGuide}
    //               className="px-3 py-1 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
    //             >
    //               Skip
    //             </button> */}

    //             <button
    //               onClick={nextGuide}
    //               className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
    //             >
    //               Next
    //             </button>
    //           </div>
    //         </div>
//           )}
//         </div>

//         {/* RESET */}
//         <button
//           onClick={handleSkipSetup}
//           className="hidden md:flex p-2 text-gray-500 hover:bg-gray-100 rounded-md transition"
//         >
//           reset
//         </button>

//         {/* --- PROFILE AVATAR --- */}
//         <div className="relative" ref={profileRef}>
//           <div
//             onClick={() => setShowProfileMenu(!showProfileMenu)}
//             className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center text-white text-sm font-semibold cursor-pointer hover:bg-gray-700 transition"
//           >
//             {user?.fullName ? user.fullName.slice(0, 2).toUpperCase() : "U"}
//           </div>

//           {/* PROFILE DROPDOWN */}
//           {showProfileMenu && (
//             <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-md shadow-md py-1 z-50">
//               <button
//                 onClick={() => {
//                   setShowProfileMenu(false);
//                   navigate("/profile");
//                 }}
//                 className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
//               >
//                 <FiUser /> My Profile
//               </button>

//               <button
//                 onClick={handleLogout}
//                 className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
//               >
//                 <FiLogOut /> Logout
//               </button>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* MODALS */}
//       <OrganizationSettingsModal open={open} onClose={() => setOpen(false)} />
//       <ScenarioSelectModal
//         open={openScenario}
//         onClose={() => setOpenScenario(false)}
//         onSelect={handleSelect}
//       />
//     </header>
//     </>
//   );
// };

// export default Navbar;
import React, { useState, useContext, useRef, useEffect } from "react";
import { FiEdit3, FiLogOut, FiUser } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import OrganizationSettingsModal from "./OrganizationSettingsModal";
import ScenarioSelectModal from "./ScenarioSelectModal";
import { UserContext } from "./UserContext";
import axios from "axios";

const API = "http://localhost:5000/auth/guide";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [openScenario, setOpenScenario] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [guideStep, setGuideStep] = useState(0);

  const navigate = useNavigate();
  const profileRef = useRef(null);

  const { user, loading } = useContext(UserContext);
  const userId = localStorage.getItem("userid");

useEffect(() => {
  if (!userId) return;

  // first load
  fetchGuide();

  // 🔥 listen to sidebar completion
  const handleSidebarDone = () => {
    fetchGuide(); // re-fetch navbar guide
  };

  window.addEventListener("sidebarGuideCompleted", handleSidebarDone);

  return () => {
    window.removeEventListener("sidebarGuideCompleted", handleSidebarDone);
  };
}, [userId]);

  const fetchGuide = async () => {
    try {
      const res = await axios.get(`${API}/${userId}`);
      const { sidebar, navbar } = res.data;

      // 🛑 sidebar not completed
      if (!sidebar?.completed) {
        setGuideStep(0);
        return;
      }

      // 🛑 navbar already completed
      if (navbar?.completed) {
        setGuideStep(0);
        return;
      }

      // ✅ start navbar guide
      setGuideStep(navbar?.step ?? 1);
    } catch (err) {
      console.error("Navbar guide error:", err);
    }
  };

  // Initial + auto refresh
  useEffect(() => {
    if (userId) fetchGuide();
  }, [userId]);

  /* ----------------------------------
     GUIDE ACTIONS
  ---------------------------------- */
  const nextGuide = async () => {
    const next = guideStep + 1;

    // Navbar has only 2 steps
    if (next > 2) {
      await axios.post(`${API}/${userId}`, {
        type: "navbar",
        completed: true,
      });
      setGuideStep(0);
      return;
    }

    setGuideStep(next);

    await axios.post(`${API}/${userId}`, {
      type: "navbar",
      step: next,
    });
  };

  const skipGuide = async () => {
    await axios.post(`${API}/${userId}`, {
      type: "navbar",
      completed: true,
    });
    setGuideStep(0);
  };

  /* ----------------------------------
     CLICK OUTSIDE PROFILE
  ---------------------------------- */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ----------------------------------
     LOGOUT
  ---------------------------------- */
  const handleLogout = async () => {
    await fetch(`http://localhost:5000/auth/logout/${userId}`, {
      method: "POST",
    });
    localStorage.clear();
    navigate("/login", { replace: true });
    window.location.reload();
  };

  /* ----------------------------------
     BLUR WHEN GUIDE OPEN
  ---------------------------------- */
  const isBlurred =
    open || openScenario || showProfileMenu || guideStep > 0;

  /* ----------------------------------
     SETUP WIZARD STATUS
  ---------------------------------- */
  const hasSkippedStep = user?.setup?.steps?.some(
    (s) => s.status === "skipped" || s.status === "incomplete"
  );

  const setupCompleted = !hasSkippedStep;

  const handleWizardClick = () => {
    if (!user) return;
    const skipped = user?.setup?.steps?.find((s) => s.status === "skipped");
    navigate(skipped ? `/setup?step=${skipped.step}` : "/setup");
  };

  /* ----------------------------------
     RENDER
  ---------------------------------- */
  return (
    <>
      {isBlurred && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-20"></div>
      )}

      <header className="w-full bg-white px-6 py-3 flex justify-end sticky top-0 z-30 border-b">
        <div className="flex items-center gap-4">

          {/* WIZARD */}
          {!loading && user && (
            <button
              onClick={handleWizardClick}
              className={`hidden md:flex px-4 py-1.5 rounded-md text-sm font-medium
              ${
                setupCompleted
                  ? "bg-gray-100 text-gray-800"
                  : "bg-indigo-600 text-white"
              }`}
            >
              {setupCompleted ? "Wizard Completed" : "Complete Wizard"}
            </button>
          )}

          {/* SETTINGS */}
          <div className="relative">
            <button
              onClick={() => setOpen(true)}
              className={`hidden md:flex items-center gap-2 border px-3 py-1.5 rounded-md
              ${guideStep === 1 ? "ring-4 ring-blue-400 z-[60]" : ""}`}
            >
              <FiEdit3 /> Settings
            </button>

            {guideStep === 1 && (
              <Tooltip
                title="Settings"
                step="1/2"
                text="Update your organization settings here."
                onNext={nextGuide}
              />
            )}
          </div>

          {/* CREATE SCENARIO */}
          <div className="relative">
            <button
              onClick={() => {
                setOpenScenario(true);
                skipGuide();
              }}
              className={`hidden md:flex bg-black text-white px-4 py-1.5 rounded-md
              ${guideStep === 2 ? "ring-4 ring-blue-400 z-[60]" : ""}`}
            >
              + Scenario
            </button>

            {guideStep === 2 && (
              <Tooltip
                title="Create Scenario"
                step="2/2"
                text="Create your first automation scenario here."
                onNext={nextGuide}
              />
            )}
          </div>

          {/* PROFILE */}
          <div className="relative" ref={profileRef}>
            <div
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-9 h-9 bg-gray-800 text-white rounded-full flex items-center justify-center cursor-pointer"
            >
              {user?.fullName?.slice(0, 2).toUpperCase() || "U"}
            </div>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-44 bg-white border rounded shadow z-50">
                <button
                  onClick={() => navigate("/profile")}
                  className="w-full px-4 py-2 hover:bg-gray-100 text-left"
                >
                  <FiUser /> Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 hover:bg-gray-100 text-left"
                >
                  <FiLogOut /> Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* MODALS */}
        <OrganizationSettingsModal open={open} onClose={() => setOpen(false)} />
        <ScenarioSelectModal
          open={openScenario}
          onClose={() => setOpenScenario(false)}
        />
      </header>
    </>
  );
};


const Tooltip = ({ title, step, text, onNext }) => (
  <div className="absolute top-full mt-3 right-0 bg-white shadow-xl border rounded-lg w-72 p-4 z-[70]">
    <div className="flex justify-between mb-2">
      <h4 className="font-semibold">{title}</h4>
      <span className="text-xs text-gray-500">{step}</span>
    </div>

    <p className="text-sm text-gray-600 mb-3">{text}</p>

    <div className="flex justify-end">
      <button
        onClick={onNext}
        className="px-3 py-1 bg-blue-600 text-white rounded-md"
      >
        Next
      </button>
    </div>
  </div>
);


export default Navbar;

import React, { useState, useContext, useRef, useEffect } from "react";
import { FiEdit3, FiLogOut, FiUser } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import OrganizationSettingsModal from "./OrganizationSettingsModal";
import ScenarioSelectModal from "./ScenarioSelectModal";
import { UserContext } from "./UserContext";
import axios from "axios";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [openScenario, setOpenScenario] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
const [showScenarioGuide, setShowScenarioGuide] = useState(false);
useEffect(() => {
  const hasSeenGuide = localStorage.getItem("scenarioGuideSeen");

  if (!hasSeenGuide) {
    setShowScenarioGuide(true);
  }
}, []);
const handleCloseGuide = () => {
  localStorage.setItem("scenarioGuideSeen", "true");
  setShowScenarioGuide(false);
};

  const navigate = useNavigate();
  const profileRef = useRef(null);

  const { user, loading } = useContext(UserContext);

  const handleSelect = (type) => {
    setOpenScenario(false);
  };

  const hasSkippedStep = user?.setup?.steps?.some(
    (step) => step.status === "skipped" || step.status === "incomplete"
  );

  const setupCompleted = !hasSkippedStep;

  const handleWizardClick = () => {
    if (!user) return;
    const skippedStep = user?.setup?.steps?.find((s) => s.status === "skipped");

    navigate(skippedStep ? `/setup?step=${skippedStep.step}` : "/setup");
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
    } catch {}
  };

  const handleSkipSetup = async () => {
    const userId = localStorage.getItem("userid");
    await axios.post(
      `https://email-syncing-backend.vercel.app/auth/skip-all/${userId}`
    );
    alert("All setup steps skipped.");
  };
const skipAll = () => {
  localStorage.setItem("scenarioGuideSeen", "true");
  setShowScenarioGuide(false);
};

  return (
    <header className="w-full bg-white px-6 py-3 flex items-center justify-end sticky top-0 z-30 border-b border-gray-100">
      {/* --- Right Section --- */}
      <div className="flex items-center gap-4">

        {/* WIZARD BUTTON */}
        {!loading && user && (
          <button
            onClick={handleWizardClick}
            className={`hidden md:flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition
            ${
              setupCompleted
                ? "bg-gray-100 text-gray-800 hover:bg-gray-200"
                : "bg-indigo-600 text-white hover:bg-indigo-700"
            }`}
          >
            {(() => {
              const total = user?.setup?.steps?.length || 0;
              const done = user?.setup?.steps?.filter((s) => s.status === "completed").length;

              return setupCompleted
                ? `Wizard Completed (${done}/${total})`
                : `Complete Wizard (${done}/${total})`;
            })()}
          </button>
        )}

        {/* ORG SETTINGS */}
        <button
          onClick={() => setOpen(true)}
          className="hidden md:flex items-center gap-2 bg-white border border-gray-300 hover:border-gray-400 text-gray-700 px-3 py-1.5 rounded-md text-sm transition"
        >
          <FiEdit3 className="text-gray-500" />
          Settings
        </button>

        {/* CREATE SCENARIO */}
      <div className="relative">

<div className="relative pointer-events-none">

  {showScenarioGuide && (
    <div className="fixed inset-0 bg-black/10 backdrop-blur-sm z-40 pointer-events-auto"></div>
  )}

<button
  onClick={() => {
    setOpenScenario(true);     // open the scenario modal
    setShowScenarioGuide(false);  // hide tooltip
  }}
  className={`hidden md:flex items-center gap-2 bg-black text-white px-4 py-1.5 rounded-md text-sm font-medium transition pointer-events-auto
    ${showScenarioGuide ? "ring-4 ring-blue-400 ring-offset-2 relative z-[60]" : ""}
  `}
>
  + Scenario
</button>


  {/* TOOLTIP */}
  {showScenarioGuide && (
    <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-white shadow-xl border border-gray-200 rounded-lg w-64 p-4 z-[70]">

      {/* ARROW ON TOP */}
      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-t border-l border-gray-200"></div>

      <div className="flex justify-between items-center mb-2">
        <h4 className="font-semibold text-gray-900">Scenario</h4>
        <span className="text-xs text-gray-500">1/1</span>
      </div>

      <p className="text-sm text-gray-600 mb-3">
        Click here to create your first scenario and get started.
      </p>

      <div className="flex justify-between mt-3">
        <button
          onClick={skipAll}
          className="px-3 py-1 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 pointer-events-auto"
        >
          Skip all
        </button>

        <button
          onClick={skipAll}
          className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 pointer-events-auto"
        >
          Got it
        </button>
      </div>
    </div>
  )}
</div>

</div>


        {/* RESET */}
        <button
          onClick={handleSkipSetup}
          className="hidden md:flex p-2 text-gray-500 hover:bg-gray-100 rounded-md transition"
        >
          reset
        </button>

        {/* --- PROFILE AVATAR --- */}
        <div className="relative" ref={profileRef}>
          <div
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center text-white text-sm font-semibold cursor-pointer hover:bg-gray-700 transition"
          >
            {user?.fullName ? user.fullName.slice(0, 2).toUpperCase() : "U"}
          </div>

          {/* PROFILE DROPDOWN */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-md shadow-md py-1 z-50">
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  navigate("/profile");
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
              >
                <FiUser /> My Profile
              </button>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
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
        onSelect={handleSelect}
      />
    </header>
  );
};

export default Navbar;


import React, { useState, useContext, useRef, useEffect } from "react";
import { FiEdit3, FiLogOut, FiUser } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import OrganizationSettingsModal from "./OrganizationSettingsModal";
import ScenarioSelectModal from "./ScenarioSelectModal";
import { UserContext } from "./UserContext";
import axios from "axios";

const API = "https://email-syncing-backend.vercel.app/auth/guide";

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

  fetchGuide();

  const handleSidebarDone = () => {
    fetchGuide(); 
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

      if (!sidebar?.completed) {
        setGuideStep(0);
        return;
      }

      if (navbar?.completed) {
        setGuideStep(0);
        return;
      }

      setGuideStep(navbar?.step ?? 1);
    } catch (err) {
      console.error("Navbar guide error:", err);
    }
  };

  useEffect(() => {
    if (userId) fetchGuide();
  }, [userId]);

  const nextGuide = async () => {
    const next = guideStep + 1;

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

  const handleLogout = async () => {
    await fetch(`https://email-syncing-backend.vercel.app/auth/logout/${userId}`, {
      method: "POST",
    });
    localStorage.clear();
    navigate("/login", { replace: true });
    window.location.reload();
  };


  const isBlurred =
    open || openScenario || showProfileMenu || guideStep > 0;

  // const hasSkippedStep = user?.setup?.steps?.some(
  //   (s) => s.status === "skipped" || s.status === "incomplete"
  // );

  // const setupCompleted = !hasSkippedStep;

  const setupCompleted = user?.setup?.completed === true;

  const handleWizardClick = () => {
    if (!user) return;
    const skipped = user?.setup?.steps?.find((s) => s.status === "skipped");
    // navigate(skipped ? `/setup?step=${skipped.step}` : "/setup");
navigate(
  skipped
    ? `/setup?step=${skipped.step}&force=true`
    : "/setup?force=true"
);

  };


  return (
    <>
      {isBlurred && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-20"></div>
      )}

      <header className="w-full bg-white px-6 py-3 flex justify-end sticky top-0 z-30 border-b">
        <div className="flex items-center gap-4">

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
                {/* <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 hover:bg-gray-100 text-left"
                >
                  <FiLogOut /> Logout
                </button> */}
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

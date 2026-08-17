import React, { useState, useContext, useRef, useEffect } from "react";
import { FiEdit3, FiLogOut, FiUser, FiCpu } from "react-icons/fi";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import OrganizationSettingsModal from "./OrganizationSettingsModal";
import ScenarioSelectModal from "./ScenarioSelectModal";
import { UserContext } from "./UserContext";
import axios from "axios";
import { MdSecurity } from "react-icons/md";

const API = "https://email-syncing-backend.vercel.app/auth/guide";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [openScenario, setOpenScenario] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [guideStep, setGuideStep] = useState(0);
  const [role, setRole] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const isProfilePage = location.pathname === "/profile" || location.pathname === "/company-profile";
  const profileRef = useRef(null);

  const { user, loading } = useContext(UserContext);
  const plan = user?.subscription?.plan || "free";
  const userId = localStorage.getItem("userid");

  useEffect(() => {
    const storedToken = localStorage.getItem("usertoken");
    if (storedToken) {
      try {
        const decoded = jwtDecode(storedToken);
        if (decoded?.payLoad?.role) {
          setRole(decoded.payLoad.role);
        }
      } catch (err) {
        console.error("Token decode error:", err);
      }
    }
  }, []);

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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      if (userId) {
        await fetch(`https://email-syncing-backend.vercel.app/auth/logout/${userId}`, {
          method: "POST",
        }).catch(() => {});
      }
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = "/login";
    }
  };

  const isBlurred = !isProfilePage && (open || openScenario || showProfileMenu);

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
      skipped ? `/setup?step=${skipped.step}&force=true` : "/setup?force=true",
    );
  };

  return (
    <>
      {isBlurred && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-20"></div>
      )}

      <header className="w-full sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-6 py-3.5 backdrop-blur flex justify-end">
        <div className="flex items-center gap-4">
          {!loading && user && !setupCompleted && (
            <button
              onClick={handleWizardClick}
              className="hidden md:inline-flex h-10 items-center justify-center px-4 rounded-xl text-sm font-semibold shadow-sm transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-500"
            >
              Complete Wizard
            </button>
          )}

          {/* <div className="relative">
            <button
              onClick={() => setOpen(true)}
              className={`hidden md:inline-flex h-10 items-center justify-center gap-2 border border-slate-200 bg-white px-4 rounded-xl text-sm font-semibold text-slate-700 shadow-sm transition duration-200 hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-350
              ${guideStep === 1 ? "ring-4 ring-blue-400 z-[60]" : ""}`}
            >
              <FiEdit3 className="w-4 h-4 text-slate-500" />
              <span>Settings</span>
            </button>

            {guideStep === 1 && (
              <Tooltip
                title="Settings"
                step="1/2"
                text="Update your organization settings here."
                onNext={nextGuide}
              />
            )}
          </div> */}

          {(role === "admin" || user?.role === "admin") && (
            <Link
              to="/admin/ai-config"
              className="hidden md:inline-flex h-10 items-center justify-center gap-2 bg-[#111110] hover:bg-black text-white px-4 rounded-xl text-sm font-semibold shadow-sm transition duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <FiCpu className="w-4 h-4 text-purple-400" />
              <span>Master AI Module</span>
            </Link>
          )}

          <div className="relative">
            <button
              onClick={() => {
                setOpenScenario(true);
                skipGuide();
              }}
              className={`hidden md:inline-flex h-10 items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 rounded-xl text-sm font-semibold shadow-sm transition duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500
              ${guideStep === 2 ? "ring-4 ring-blue-400 z-[60]" : ""}`}
            >
              <span>+ Scenario</span>
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
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-9 h-9 bg-indigo-100 text-indigo-700 border border-indigo-200 hover:bg-indigo-200 rounded-full flex items-center justify-center cursor-pointer text-sm font-semibold select-none transition duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              {user?.fullName?.slice(0, 2).toUpperCase() || "U"}
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-52 bg-white border rounded-lg shadow-lg z-50 overflow-hidden">
                {!loading && plan !== "pro" && (
                  <Link
                    to="/pricing"
                    onClick={() => setShowProfileMenu(false)}
                    className="w-full px-4 py-3 text-sm text-indigo-700 hover:bg-indigo-50 flex items-center justify-between gap-2 transition font-semibold"
                  >
                    <span>Upgrade Plan</span>
                    <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-[10px] font-bold tracking-wide text-white">
                      PRO
                    </span>
                  </Link>
                )}
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    navigate("/security");
                  }}
                  className="w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 transition border-t"
                >
                  <MdSecurity className="text-gray-600" /> Security
                </button>
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    navigate("/company-profile");
                  }}
                  className="w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 transition border-t"
                >
                  <FiUser className="text-gray-600" /> Company Profile
                </button>

                {(role === "admin" || user?.role === "admin") && (
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      navigate("/admin/ai-config");
                    }}
                    className="w-full px-4 py-3 text-sm text-purple-700 hover:bg-purple-50 flex items-center gap-2 transition border-t font-semibold"
                  >
                    <FiCpu className="text-purple-600" /> Master AI Module
                  </button>
                )}

                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition border-t"
                >
                  <FiLogOut className="text-red-500" /> Logout
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

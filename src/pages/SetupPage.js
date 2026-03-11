import React, { useContext, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import {
  FiMail,
  FiArrowRight,
  FiArrowLeft,
  FiCopy,
  FiCheck,
  FiEyeOff,
  FiEye,
  FiAlertCircle,
  FiClock,
  FiRefreshCcw,
  FiCheckCircle,
  FiAlertTriangle,
  FiX,
  FiSend,
  FiInfo,
  FiServer,
  FiSettings,
  FiFolder,
  FiPlusCircle,
  FiArrowRightCircle,
  FiToggleRight,
  FiSave,
  FiKey,
  FiGlobe,
  FiLock,
  FiSearch,
  FiUser,
  FiSmile,
  FiPlayCircle,
  FiBarChart2,
} from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";
import { UserContext } from "../component/UserContext";
import { FaGoogle, FaMicrosoft, FaRegLightbulb } from "react-icons/fa";
import toast from "react-hot-toast";
import SetupOtherSMTPModal from "../component/SetupOtherSMTPModal";

const SetupFlow = () => {
  const navigate = useNavigate();
  const { user, loading, setUser, refreshUser } = useContext(UserContext);
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const stepFromURL = parseInt(query.get("step"), 10);
  const [step, setStep] = useState(stepFromURL || 1);
  const [showOtherSMTPModal, setShowOtherSMTPModal] = useState(false);
  const [testSent, setTestSent] = useState(false);
  const [sendingMode, setSendingMode] = useState("Auto-Send");
  const [followUp1, setFollowUp1] = useState(2);
  const [followUp2, setFollowUp2] = useState(5);
  const [safetyNet, setSafetyNet] = useState(true);
  const [followUp1Unit, setFollowUp1Unit] = useState("days");
  const [followUp2Unit, setFollowUp2Unit] = useState("days");
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [helpTab, setHelpTab] = useState("gmail");
  const progressWidth =
    step === 1
      ? "14%"
      : step === 2
        ? "28%"
        : step === 3
          ? "42%"
          : step === 4
            ? "56%"
            : step === 5
              ? "70%"
              : step === 6
                ? "84%"
                : "100%";

  const [selectedTone, setSelectedTone] = useState("Friendly");
  const [selectedServices, setSelectedServices] = useState(["Store Setup"]);
  const [activeTab, setActiveTab] = useState("gmail");
  const [alert, setAlert] = useState({ type: "", message: "" });
  useEffect(() => {
    if (alert.message) {
      const timer = setTimeout(() => setAlert({ type: "", message: "" }), 4000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  const toggleService = (service) => {
    setSelectedServices((prev) =>
      prev.includes(service)
        ? prev.filter((s) => s !== service)
        : [...prev, service],
    );
  };
  // useEffect(() => {
  //   //  If redirected after successful OAuth (Google/Microsoft)
  //   if (stepFromURL === 5 && user?._id) {
  //     console.log(" Detected OAuth redirect → marking Step 4 as completed.");

  //     // Mark step 4 as completed if not already
  //     saveSetupProgress({
  //       stepCompleted: 4,
  //       stepStatus: "completed",
  //     });
  //   }
  // }, [stepFromURL, user]);
  useEffect(() => {
    if (!user?._id) return;

    const fullQuery = window.location.search || "";

    const decoded = decodeURIComponent(fullQuery);

    const isStep5 =
      decoded.includes("step=5") || decoded.includes("setup?step=5");

    const isOAuthSuccess =
      decoded.includes("google-auth-success=true") ||
      decoded.includes("microsoft-auth-success=true");

    if (isStep5 && isOAuthSuccess) {
      saveSetupProgress({
        stepCompleted: 4,
        stepStatus: "completed",
      });
    }
  }, [user]);

  const handleGmailConnect = () => {
    const userId = localStorage.getItem("userid");

    if (!userId) {
      alert("User not found. Please log in again.");
      return;
    }

    const redirectURL = `/setup?step=5`;

    const authURL = `https://email-syncing-backend.vercel.app/auth/google?userId=${userId}&redirect=${encodeURIComponent(
      redirectURL,
    )}`;

    console.log("🔗 Redirecting to Gmail Auth:", authURL);

    window.location.href = authURL;
  };

  const handleMicrosoftConnect = () => {
    const userId = user?._id;

    if (!userId) {
      alert("User not found. Please log in again.");
      return;
    }

    const redirectURL = `/setup?step=5`;

    const authURL = `https://email-syncing-backend.vercel.app/auth/outlook?userId=${userId}&redirect=${encodeURIComponent(
      redirectURL,
    )}`;

    console.log("🔗 Redirecting to Microsoft Auth:", authURL);

    window.location.href = authURL;
  };

  const saveSetupProgress = async (data = {}) => {
    try {
      const res = await fetch(
        `https://email-syncing-backend.vercel.app/auth/setup/${user._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...data,
            updatedAt: new Date(),
          }),
        },
      );

      const result = await res.json();

      if (result.success) {
        console.log("Setup progress updated:", result.data);
      } else {
        console.error("❌ Failed to update setup progress:", result.message);
      }
    } catch (err) {
      console.error("Error saving setup progress:", err);
    }
  };

  const updateStep = async (nextStep, extra = {}) => {
    if (!user?._id) {
      console.warn("⚠️ User not loaded yet, retrying...");
      setTimeout(() => updateStep(nextStep, extra), 500);
      return;
    }

    const isSkipped = extra?.skipped === true;
    const status = isSkipped ? "skipped" : "completed";

    const stepToUpdate = isSkipped ? step : nextStep;

    try {
      const res = await fetch(
        `https://email-syncing-backend.vercel.app/auth/setup/${user._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            stepCompleted: stepToUpdate,
            stepStatus: status,
            ...extra,
          }),
        },
      );

      const result = await res.json();
      if (result.success) {
        setStep(nextStep);
      } else {
      }
    } catch (err) {
      console.error("Error saving setup progress:", err);
    }
  };

  const [showValidateButton, setShowValidateButton] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validated, setValidated] = useState(false);

  const [selectedTab, setSelectedTab] = useState("Gmail");
  const [showPassword, setShowPassword] = useState(false);
  const [smtpForm, setSmtpForm] = useState({
    name: "My SMTP Connection",
    email: "",
    fullName: "",
    username: "",
    password: "",
    host: "smtp.office365.com",
    port: 587,
  });

  const [verificationEmail, setVerificationEmail] = useState(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (step !== 3 || !user?._id) return;

    // reset all states
    setValidated(false);
    setValidating(false);
    setShowValidateButton(false);
    setValidationPhase(true);
    setVerificationEmail(null);

    let attempts = 0;
    const maxAttempts = 5;
    const loaderMinDuration = 10000;
    const loaderStartTime = Date.now();

    const fetchVerification = async () => {
      attempts++;
      console.log(`Checking verification attempt ${attempts}/${maxAttempts}`);

      try {
        const res = await fetch(
          `https://email-syncing-backend.vercel.app/mailhook/verification/${user._id}`,
        );
        const data = await res.json();

        if (data.success && data.data) {
          const email = data.data;
          let autoEmail = "";
          let isGmailVerification = false;
          let cleanedBody = email.textBody || "";

          if (
            email.sender
              ?.toLowerCase()
              .includes("forwarding-noreply@google.com") &&
            email.subject
              ?.toLowerCase()
              .includes("has requested to automatically forward")
          ) {
            isGmailVerification = true;
            const match =
              email.subject.match(/([\w._%+-]+@gmail\.com)/i) ||
              email.textBody.match(/([\w._%+-]+@gmail\.com)/i);
            if (match) autoEmail = match[1];

            cleanedBody =
              " Gmail forwarding request detected.<br/><br/>Please open Gmail and click the verification link in your inbox to confirm forwarding.<br/><br/>Once confirmed, return here to validate.";
          }

          cleanedBody = cleanedBody
            .replace(
              /(https?:\/\/[^\s<]+)/g,
              '<a href="$1" target="_blank" rel="noopener noreferrer" style="color:#2563eb;text-decoration:underline;">$1</a>',
            )
            .replace(/\n/g, "<br/>");

          setVerificationEmail({
            ...email,
            toEmail: autoEmail || email.toEmail || "",
            isGmailVerification,
            formattedBody: cleanedBody,
          });

          clearInterval(intervalId);

          const elapsed = Date.now() - loaderStartTime;
          const remaining = Math.max(loaderMinDuration - elapsed, 0);

          console.log(`⏱ Waiting ${remaining}ms before showing results...`);

          setTimeout(() => {
            setValidationPhase(false);
            setShowValidateButton(true);
          }, remaining);

          return;
        }

        if (attempts >= maxAttempts) {
          clearInterval(intervalId);
          setValidationPhase(false);
          setShowValidateButton(true);
          setVerificationEmail({
            toEmail: "",
            formattedBody: "",
            isGmailVerification: false,
            sender: "",
            subject: "",
            date: "",
          });
        }
      } catch (err) {
        console.error("Error fetching verification email:", err);
        if (attempts >= maxAttempts) {
          clearInterval(intervalId);
          setValidationPhase(false);
          setShowValidateButton(true);
        }
      }
    };

    const intervalId = setInterval(fetchVerification, 10000);
    fetchVerification();

    return () => clearInterval(intervalId);
  }, [step, user, retryKey]);

  const fetchValidateEmail = async () => {
    try {
      const res = await fetch(
        `https://email-syncing-backend.vercel.app/mailhook/validateTest/${user._id}`,
      );
      const data = await res.json();

      if (data.success) {
        console.log("✅ Validation email found:", data.data);

        setVerificationEmail(data.data);
        setValidated(true);
        setValidating(false);
        setValidationPhase(false);
        setShowValidateButton(false);

        // ✅ show success alert message
        setAlert({
          type: "success",
          message: data.message || "Mailhook connected successfully!",
        });

        return true; // ✅ very important!
      }

      return false;
    } catch (err) {
      console.error("Error fetching validation email:", err);
      return false;
    }
  };

  const handleValidateForwarding = async () => {
    try {
      // 🚫 Check if email field is empty
      if (!verificationEmail?.toEmail?.trim()) {
        setAlert({
          type: "error",
          message: "Please enter a valid email address.",
        });
        return;
      }

      // 🔄 Reset validation state
      setValidating(true);
      setValidated(false);
      setValidationFailed(false);
      setValidationPhase(true);

      // 📨 Send request to backend
      const res = await fetch(
        `https://email-syncing-backend.vercel.app/mailhook/validate-forwarding/${user._id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ toEmail: verificationEmail.toEmail }),
        },
      );

      const data = await res.json();

      // ✅ Success Case
      if (data.success) {
        setAlert({
          type: "success",
          message:
            data.message ||
            "Validation started — checking for forwarded email...",
        });

        let attempts = 0;
        const maxAttempts = 5;

        const checkLoop = async () => {
          attempts++;
          console.log(`🕒 Attempt ${attempts} of ${maxAttempts}`);

          // 🧠 Try to fetch validation status
          const found = await fetchValidateEmail();

          if (found) {
            console.log("✅ Mailhook verified — stopping loop.");
            setValidated(true);
            setValidating(false);
            setValidationPhase(false);
            setAlert({
              type: "success",
              message: data.message || "Mailhook connected successfully!",
            });
            return; // ✅ Stop loop
          }

          if (attempts < maxAttempts) {
            console.log("🔁 Not yet — retrying in 10s...");
            setTimeout(checkLoop, 10000);
          } else {
            console.log("❌ Validation failed after 5 attempts.");
            setValidating(false);
            setValidationPhase(false);
            setValidationFailed(true);
            setAlert({
              type: "error",
              message:
                "Validation failed — please ensure your forwarding is active.",
            });
          }
        };

        checkLoop();
      }

      // ❌ Error Case — backend says success: false
      else {
        setAlert({
          type: "error",
          message:
            data.message?.trim() ||
            "Failed to start validation. Please make sure your forwarding setup is correct.",
        });

        // stop validation immediately
        setValidating(false);
        setValidationPhase(false);
        setValidationFailed(true);
      }
    } catch (err) {
      console.error("❌ Error during validation process:", err);
      setAlert({
        type: "error",
        message:
          "Something went wrong while validating connection. Please try again.",
      });
      setValidating(false);
      setValidationPhase(false);
      setValidationFailed(true);
    }
  };

  useEffect(() => {
    if (!loading && user) {
      const hasSkippedStep = user?.setup?.steps?.some(
        (s) => s.status === "skipped" || s.status === "incomplete",
      );

      if (user?.setup?.completed && !hasSkippedStep) {
        navigate("/organization");
      }
    }
  }, [user, loading, navigate]);

  const [setupProgress, setSetupProgress] = useState(null);

  useEffect(() => {
    const fetchSetupProgress = async () => {
      try {
        if (!user?._id) return;
        const res = await fetch(
          `https://email-syncing-backend.vercel.app/auth/setup/${user._id}`,
        );
        const data = await res.json();
        if (data.success) setSetupProgress(data.data);
      } catch (err) {
        console.error("Error fetching setup progress:", err);
      }
    };

    if (step === 5) {
      fetchSetupProgress();
    }
  }, [step, user]);

  const MailhookWaitingTimer = () => {
    const [seconds, setSeconds] = useState(10);
    const [message, setMessage] = useState(
      "Waiting for email... please complete Gmail forwarding setup.",
    );
    const [showAlert, setShowAlert] = useState(false);

    useEffect(() => {
      const tick = setInterval(() => {
        setSeconds((s) => (s <= 1 ? 10 : s - 1));
      }, 1000);

      const toggleMessage = setInterval(() => {
        setShowAlert((prev) => !prev);
        setMessage((prev) =>
          prev.includes("Waiting")
            ? "No email received on mailhook. Please ensure your email forwarding is active."
            : "Waiting for forwarded email... please complete Gmail forwarding setup.",
        );
      }, 10000);

      return () => {
        clearInterval(tick);
        clearInterval(toggleMessage);
      };
    }, []);

    const progress = ((10 - seconds) / 10) * 100;
    const [validationPhase, setValidationPhase] = useState(false);

    return (
      <div className="text-center space-y-3 transition-all duration-300">
        <div className="flex justify-center items-center gap-2 text-gray-700">
          {showAlert ? (
            <FiAlertCircle className="text-red-500 text-lg animate-pulse" />
          ) : (
            <FiMail className="text-[#4F46E5] text-lg animate-pulse" />
          )}
          <p className="text-sm text-gray-600 transition-all duration-500">
            {showAlert ? (
              <span className="flex items-center justify-center gap-2 text-red-600 font-medium">
                No email received on mailhook.
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2 text-gray-700 font-medium">
                Waiting for email...
              </span>
            )}
          </p>
        </div>

        <p className="text-xs text-gray-500">
          {showAlert
            ? "Make sure you’ve forwarded emails to the correct mailhook address."
            : "Keep this tab open while we check your mailhook."}
        </p>

        <div className="h-2 bg-gray-200 rounded-full overflow-hidden mt-2">
          <div
            className={`h-full transition-all duration-1000 ${
              showAlert ? "bg-red-500" : "bg-[#4F46E5]"
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-center gap-1 text-xs text-gray-400 mt-1">
          <FiClock />
          <span>Checking again in {seconds}s…</span>
        </div>
      </div>
    );
  };
  const [validationPhase, setValidationPhase] = useState(false);
  const [validationFailed, setValidationFailed] = useState(false);

  const startValidationLoop = async () => {
    let attempts = 0;
    const maxAttempts = 5;
    let stopped = false;
    let timeoutId = null;

    setValidationFailed(false);
    setValidationPhase(true);
    setValidated(false);
    setShowValidateButton(false);

    const checkValidation = async () => {
      if (stopped) return;
      attempts++;
      console.log(`Validation check #${attempts}`);

      try {
        const res = await fetch(
          `https://email-syncing-backend.vercel.app/mailhook/validateTest/${user._id}`,
        );
        const data = await res.json();

        if (data.success) {
          console.log(" Test email found:", data.data);
          stopped = true;
          clearTimeout(timeoutId);
          setValidated(true);
          setValidating(false);
          setValidationPhase(false);
          setShowValidateButton(false);
          return;
        }

        if (attempts < maxAttempts && !stopped) {
          console.log("⏳ Not received yet — checking again in 10s...");
          timeoutId = setTimeout(checkValidation, 10000);
        } else if (!stopped) {
          stopped = true;
          clearTimeout(timeoutId);
          setValidating(false);
          setValidationPhase(false);
          setValidationFailed(true);
          setShowValidateButton(true);
          setAlert({
            type: "error",
            message:
              "Access Denied. Please check your forwarding setup or enter your email manually.",
          });
        }
      } catch (err) {
        console.error("Error checking validation:", err);
        if (attempts < maxAttempts && !stopped) {
          timeoutId = setTimeout(checkValidation, 10000);
        } else if (!stopped) {
          stopped = true;
          clearTimeout(timeoutId);
          setValidating(false);
          setValidationPhase(false);
          setValidationFailed(true);
          setShowValidateButton(true);
        }
      }
    };

    checkValidation();
  };

  const handleRetryValidation = () => {
    console.log("🔁 Retrying mailhook validation check...");

    setValidationFailed(false);
    setValidated(false);
    setValidating(false);
    setShowValidateButton(false);
    setValidationPhase(true);
    setVerificationEmail(null);

    setRetryKey((prev) => prev + 1);
  };
  const [isExpanded, setIsExpanded] = useState(false);
  const [showMobileInstructions, setShowMobileInstructions] = useState(false);
  const AlertMessage = () =>
    alert?.message ? (
      <div
        className={`
        px-4 py-3 rounded-xl text-sm font-medium text-center
        backdrop-blur-xl shadow-[0_4px_20px_rgba(0,0,0,0.1)]
        border
        transition-all
        ${
          alert.type === "success"
            ? "bg-[rgba(209,250,229,0.7)] text-green-800 border-green-300"
            : "bg-[rgba(254,226,226,0.7)] text-red-800 border-red-300"
        }
      `}
        style={{ WebkitBackdropFilter: "blur(10px)" }}
      >
        {alert.message}
      </div>
    ) : null;

  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setAnimate(true);
    const timer = setTimeout(() => setAnimate(false), 500); // stop animation after 0.5s
    return () => clearTimeout(timer);
  }, [step]);
  const [forwardingConfirmed, setForwardingConfirmed] = useState(false);
  const [confirmations, setConfirmations] = useState({
    forwardingEnabled: false,
    provider: null,
  });

  return (
    <div className="relative min-h-screen bg-[#F9FAFB] overflow-hidden">
      <button
        onClick={() => setShowMobileInstructions(true)}
        className="fixed top-6 right-6 z-40 bg-[#4F46E5] text-white p-3 rounded-full shadow-lg hover:bg-[#4338CA] transition lg:hidden"
      >
        <FiInfo className="text-xl" />
      </button>

      <div
        className={`relative flex flex-col items-center justify-center min-h-screen 
    bg-cover bg-center bg-no-repeat
    transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] transform
    ${
      isExpanded
        ? "lg:translate-x-[-350px] lg:scale-[0.97]"
        : "translate-x-0 scale-100"
    }`}
      >
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
        >
          <source
            src="https://cdn.shopify.com/videos/c/o/v/df08c454451b4622be7ffeb6d0eed475.mp4"
            type="video/mp4"
          />
        </video>
        <div className="flex flex-col items-center justify-center w-full max-w-3xl mx-auto ">
          <div className="w-full flex items-center justify-center mb-4">
            <div className="flex items-center gap-2 px-3 py-1.5">
              <FiMail className="text-indigo-600 text-2xl sm:text-3xl drop-shadow" />
              <span className="font-semibold text-lg sm:text-xl text-gray-900 drop-shadow">
                Replex Engine
              </span>
            </div>
          </div>

          {/* Step indicator */}

          {/* 🔹 Step Indicator (visible everywhere) */}
          <div className="flex justify-center">
            <div
              className="
      px-5 py-2 rounded-full text-sm sm:text-base font-semibold
      flex items-center justify-center gap-1

      text-[#111827]           
      bg-white/30
      backdrop-blur-[10px]
      border border-white/40

      shadow-[0_6px_20px_rgba(0,0,0,0.25)]
      hover:shadow-[0_8px_26px_rgba(0,0,0,0.35)]

      transition-all duration-300
    "
            >
              <FiCheckCircle className="text-indigo-600 text-xs sm:text-sm" />
              <span>Step {step} of 5</span>
            </div>
          </div>

          <div className="w-full flex justify-center overflow-hidden relative">
            <div
              key={step}
              className="
    slide-right
    relative z-10
    p-8 sm:p-10 max-w-2xl w-[90%] text-left 
    min-h-[600px] flex flex-col justify-between
  "
            >
              {step === 1 && (
                <div
                  className="
    flex flex-col items-center justify-between
    min-h-[600px] text-center
    p-8 sm:p-10
    rounded-2xl
    bg-white/30
    border border-white/60
    shadow-[0_4px_30px_rgba(0,0,0,0.1)]
    backdrop-blur-[20px]
    transition-all duration-500 relative
  "
                  style={{
                    WebkitBackdropFilter: "blur(19.9px)",
                  }}
                >
                  <div className="w-full min-h-[48px] flex items-center justify-center mb-2">
                    <AnimatePresence>
                      {alert?.message && (
                        <motion.div
                          key={alert.message}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.3 }}
                          className={`px-4 py-2 rounded-md text-sm font-medium shadow-sm ${
                            alert.type === "success"
                              ? "bg-green-100 text-green-700 border border-green-300"
                              : "bg-red-100 text-red-700 border border-red-300"
                          }`}
                        >
                          {alert.message}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-[#111827] mb-4 mt-4">
                      Never miss a lead again.
                    </h1>

                    <p className="text-[#4B5563] text-base mb-8 leading-relaxed max-w-md mx-auto">
                      We’ll create your mailhook and help you forward new leads
                      to it. Then we’ll set up how your replies are sent (SMTP).
                    </p>
                  </div>

                  {/* CTA */}
                  <div className="flex items-center justify-center mt-6">
                    <button
                      onClick={async () => {
                        await saveSetupProgress({
                          stepCompleted: 1,
                          stepStatus: "completed",
                        });
                        setStep(2);
                      }}
                      className="
      flex items-center justify-center gap-2
      px-8 py-3 rounded-full text-sm font-semibold
      text-[#111827] 
      bg-white/30
      border border-white/50
      backdrop-blur-xl
      shadow-[0_8px_25px_rgba(0,0,0,0.12)]
      hover:bg-white/40
      hover:shadow-[0_10px_30px_rgba(0,0,0,0.16)]
      transition-all duration-300 hover:scale-[1.04]
    "
                      style={{ WebkitBackdropFilter: "blur(12px)" }}
                    >
                      <span>Start 60-sec Setup</span>
                      <FiArrowRight className="text-indigo-600" />
                    </button>
                  </div>

                  <p className="text-xs text-gray-400 mt-6">
                    You can complete setup later from your Organization
                    Settings.
                  </p>

                  <span
                    onClick={async () => {
                      // 1️⃣ Backend update
                      await saveSetupProgress({
                        stepCompleted: 1,
                        stepStatus: "skipped",
                        skipped: true,
                        completed: true,
                      });

                      // 2️⃣ Optimistic local update (optional but fine)
                      setUser((prev) => ({
                        ...prev,
                        setup: {
                          ...prev.setup,
                          completed: true,
                          steps: prev.setup.steps.map((s) =>
                            s.step === 1 ? { ...s, status: "skipped" } : s,
                          ),
                        },
                      }));

                      // 3️⃣ 🔥 REAL FIX
                      await refreshUser();

                      // 4️⃣ Navigate
                      navigate("/organization", { replace: true });
                    }}
                    className="
    absolute bottom-4 left-4
    text-black
    text-xs sm:text-sm font-semibold cursor-pointer
    hover:text-black/80 hover:underline
    transition-colors
  "
                  >
                    Skip
                  </span>
                </div>
              )}

              {step === 2 && (
                <div
                  className="
      flex flex-col items-center justify-between
      min-h-[600px] text-center
      p-6 sm:p-10
      rounded-2xl
      bg-white/30
      border border-white/60
      shadow-[0_8px_30px_rgba(0,0,0,0.12)]
      backdrop-blur-[20px]
      transition-all duration-500 
      relative w-full
    "
                  style={{
                    WebkitBackdropFilter: "blur(19.9px)",
                  }}
                >
                  {/* ALERT - fixed height (no jump) */}
                  <div className="w-full min-h-[48px] flex items-center justify-center mb-2">
                    <AnimatePresence>
                      {alert?.message && (
                        <motion.div
                          key={alert.message}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.3 }}
                          className={`px-4 py-2 rounded-md text-sm font-medium shadow-sm ${
                            alert.type === "success"
                              ? "bg-green-100 text-green-700 border border-green-300"
                              : "bg-red-100 text-red-700 border border-red-300"
                          }`}
                        >
                          {alert.message}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* HEADER */}
                  <div className="w-full max-w-md mx-auto">
                    <h2 className="text-2xl sm:text-3xl font-bold text-[#111827] mb-3">
                      Your Mailhook is Ready
                    </h2>

                    <p className="text-[#4B5563] text-sm sm:text-base mb-8 leading-relaxed">
                      This is your private & unique address for receiving leads.
                    </p>
                  </div>

                  {/* MAILHOOK CARD */}
                  <div
                    className="
        w-full max-w-lg 
        rounded-xl p-5 sm:p-6 mb-6
        bg-white/40 
        border border-white/60
        shadow-[0_6px_30px_rgba(0,0,0,0.1)]
        backdrop-blur-[5px]
        hover:shadow-[0_8px_40px_rgba(0,0,0,0.15)]
        transition-all
      "
                    style={{ WebkitBackdropFilter: "blur(5px)" }}
                  >
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
                      <h3 className="font-semibold text-[#111827] text-base sm:text-lg">
                        Your Unique Mailhook
                      </h3>
                      <span className="text-green-700 bg-green-100 text-[11px] sm:text-xs px-2.5 py-0.5 rounded-full font-medium">
                        Private & Unique
                      </span>
                    </div>

                    <div
                      className="
          bg-white/50 
          text-[#4F46E5]
          px-4 py-3 rounded-lg
          flex justify-between items-center
          font-mono text-xs sm:text-sm
          border border-white/60
          backdrop-blur-md
          hover:bg-white/60
          transition-all
        "
                    >
                      <span className="truncate">
                        {user?.mailhook || "loading-mailhook@zenith-inbox.com"}
                      </span>

                      <button
                        onClick={() => {
                          if (user?.mailhook) {
                            navigator.clipboard.writeText(user.mailhook);
                            setAlert({
                              type: "success",
                              message: "Mailhook copied successfully!",
                            });
                          }
                        }}
                        className="ml-3 text-gray-600 hover:text-[#4F46E5] transition"
                      >
                        <FiCopy className="text-lg" />
                      </button>
                    </div>
                  </div>

                  {/* TIP CARD */}
                  <div
                    className="
        w-full max-w-lg 
        rounded-lg p-4 text-indigo-900 text-sm leading-relaxed
        bg-white/40
        border border-white/60
        shadow-[0_4px_25px_rgba(0,0,0,0.08)]
        backdrop-blur-[6px]
        transition-all duration-300
        hover:shadow-[0_6px_35px_rgba(0,0,0,0.12)]
      "
                  >
                    <strong className="text-indigo-700">💡 Tip: </strong>
                    Add this address as a forwarding destination in email
                    service provider settings (Gmail, outlook, hotmail etc...)
                  </div>

                  {/* NEXT BUTTON (GLASS BUTTON) */}
                  <div className="flex justify-center mt-12">
                    <button
                      onClick={async () => {
                        await saveSetupProgress({
                          stepCompleted: 2,
                          stepStatus: "completed",
                        });
                        setStep(3);
                      }}
                      className="
          flex items-center justify-center gap-2
          px-8 py-3 rounded-full
          text-sm font-semibold text-[#111827]
          bg-white/30
          border border-white/50
          backdrop-blur-xl
          shadow-[0_8px_25px_rgba(0,0,0,0.12)]
          hover:bg-white/40
          hover:shadow-[0_10px_30px_rgba(0,0,0,0.16)]
          transition-all duration-300 hover:scale-[1.04]
        "
                      style={{ WebkitBackdropFilter: "blur(12px)" }}
                    >
                      <span>Next</span>
                      <FiArrowRight className="text-indigo-600" />
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div
                  className="
      flex flex-col items-center justify-between
      min-h-[600px] text-center
      p-6 sm:p-10
      rounded-2xl
      bg-white/30
      border border-white/60
      shadow-[0_8px_30px_rgba(0,0,0,0.12)]
      backdrop-blur-[20px]
      transition-all duration-500 relative w-full
    "
                  style={{ WebkitBackdropFilter: "blur(19.9px)" }}
                >
                  <div className="w-full h-[48px] flex items-center justify-center mb-2 overflow-hidden">
                    <AlertMessage />
                  </div>

                  <div className="w-full max-w-xl mx-auto">
                    <h2 className="text-2xl sm:text-3xl font-bold text-[#111827] mb-5">
                      Set up Forwarding
                    </h2>

                    <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                      Set the following address as your{" "}
                      <strong>email forwarding destination</strong>. Once
                      forwarding is active, you will receive a verification
                      email like the example below.
                    </p>

                    <div
                      className="
    w-full bg-white/50 px-4 py-3 rounded-xl
    flex flex-col sm:flex-row sm:items-center sm:justify-between
    gap-2 sm:gap-4 font-mono text-xs sm:text-sm
    border border-white/70 backdrop-blur-xl
    shadow-[0_4px_20px_rgba(0,0,0,0.1)]
  "
                    >
                      <span className="text-[#1A1A1A] font-medium whitespace-nowrap">
                        Forward emails to:
                      </span>

                      <div className="flex items-center gap-2 flex-nowrap">
                        <span className="text-[#4F46E5] truncate max-w-[220px]">
                          {user?.mailhook || "loading..."}
                        </span>

                        <button
                          onClick={() => {
                            if (user?.mailhook) {
                              navigator.clipboard.writeText(user.mailhook);
                              setAlert({
                                type: "success",
                                message: "Mailhook copied successfully!",
                              });
                            }
                          }}
                          className="text-gray-600 hover:text-[#4F46E5] transition"
                        >
                          <FiCopy />
                        </button>
                      </div>
                    </div>
                  </div>
                  {/* FORWARDING CONFIRMATION */}
                  {!forwardingConfirmed && (
                    <div className="w-full max-w-xl mx-auto mt-6 bg-white/40 border border-white/60 rounded-xl p-6 backdrop-blur-xl shadow">
                      <h3 className="text-lg font-semibold text-[#111827] mb-4">
                        Before we continue
                      </h3>

                      <div className="space-y-3 text-sm text-gray-700 text-left">
                        {/* Forwarding enabled */}
                        <label className="flex items-start gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            className="mt-1"
                            onChange={(e) =>
                              setConfirmations((prev) => ({
                                ...prev,
                                forwardingEnabled: e.target.checked,
                              }))
                            }
                          />
                          <span>
                            I have enabled <strong>email forwarding</strong>
                          </span>
                        </label>

                        {/* Gmail */}
                        <label className="flex items-start gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="provider"
                            disabled={!confirmations.forwardingEnabled}
                            onChange={() =>
                              setConfirmations((prev) => ({
                                ...prev,
                                provider: "gmail",
                              }))
                            }
                          />
                          <span>
                            I set it up using <strong>Gmail / Google</strong>
                          </span>
                        </label>

                        {/* Other providers */}
                        <label className="flex items-start gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="provider"
                            disabled={!confirmations.forwardingEnabled}
                            onChange={() =>
                              setConfirmations((prev) => ({
                                ...prev,
                                provider: "other",
                              }))
                            }
                          />
                          <span>
                            I use{" "}
                            <strong>Outlook / Hotmail / Other provider</strong>
                          </span>
                        </label>
                      </div>

                      {/* CONTINUE BUTTON (ONLY FOR GMAIL) */}
                      {confirmations.forwardingEnabled &&
                        confirmations.provider === "gmail" && (
                          <button
                            onClick={() => setForwardingConfirmed(true)}
                            className="
            mt-6 w-full px-6 py-2 rounded-full text-sm font-semibold
            bg-white/30 border border-white/50 backdrop-blur-xl
            shadow hover:bg-white/40 transition
          "
                          >
                            Continue
                          </button>
                        )}
                    </div>
                  )}
                  {confirmations.forwardingEnabled &&
                    confirmations.provider === "other" &&
                    !forwardingConfirmed && (
                      <div className="w-full max-w-xl mx-auto mt-6 bg-white/40 border border-white/60 rounded-xl p-6 backdrop-blur-xl shadow">
                        <p className="text-sm text-gray-700 mb-3">
                          Enter the email address you configured forwarding
                          from:
                        </p>

                        <input
                          type="email"
                          placeholder="your@email.com"
                          className="
          w-full px-3 py-2 rounded-lg text-sm
          bg-white/70 border border-gray-300
          focus:ring-2 focus:ring-indigo-400 outline-none
        "
                          value={verificationEmail?.toEmail || ""}
                          onChange={(e) =>
                            setVerificationEmail({
                              ...verificationEmail,
                              toEmail: e.target.value,
                            })
                          }
                        />

                        <button
                          disabled={validating}
                          onClick={async () => {
                            if (!verificationEmail?.toEmail?.trim()) {
                              setAlert({
                                type: "error",
                                message: "Enter your email address!",
                              });
                              return;
                            }
                            setForwardingConfirmed(true);

                            setValidating(true);
                            setValidationFailed(false);
                            setShowValidateButton(false);
                            setValidationPhase(true);

                            await handleValidateForwarding();
                            startValidationLoop();
                          }}
                          className="
          mt-4 w-full px-6 py-2 rounded-full text-sm font-semibold
          bg-white/30 border border-white/50 backdrop-blur-xl
          shadow hover:bg-white/40 transition
        "
                        >
                          {validating ? "Validating..." : "Validate Forwarding"}
                        </button>
                      </div>
                    )}

                  {forwardingConfirmed && (
                    <>
                      <div
                        className="
        relative p-6 w-full max-w-xl mx-auto text-center
        rounded-2xl
        bg-white/40
        border border-white/70
        shadow-[0_6px_30px_rgba(0,0,0,0.1)]
        backdrop-blur-[8px]
        mt-8
      "
                      >
                        {!validationPhase &&
                          !validated &&
                          showValidateButton && (
                            <button
                              onClick={handleRetryValidation}
                              className="
            absolute top-4 right-4 
            flex items-center gap-1 
            text-xs font-semibold text-[#4F46E5]
            hover:text-[#3730A3] transition
          "
                            >
                              <FiRefreshCcw className="text-sm" /> Retry
                            </button>
                          )}

                        <h3 className="text-lg font-semibold text-[#111827] mb-4">
                          Email Receiving
                        </h3>

                        {/* FIXED HEIGHT INNER AREA */}
                        <div
                          className="
          relative min-h-[180px] rounded-lg p-4
          bg-white/50
          border border-white/60
          backdrop-blur-md
          shadow-inner text-gray-700
        "
                        >
                          {/* ERROR */}
                          {validationFailed ? (
                            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 text-center">
                              <p className="font-semibold mb-2">
                                Forwarding is not configured correctly.
                              </p>
                              <p className="text-sm">
                                Please check your forwarding configuration or
                                refer to our{" "}
                                <button
                                  onClick={() => {
                                    setIsExpanded(true);
                                    setShowMobileInstructions(true);
                                  }}
                                  className="text-red-700 font-semibold underline hover:text-red-900"
                                >
                                  Setup Guide
                                </button>{" "}
                                for step by step instructions.
                              </p>
                            </div>
                          ) : validationPhase ? (
                            showValidateButton ? (
                              <div className="text-center py-6 text-gray-500 text-sm">
                                <p>No email received.</p>
                                <p>Please enter your email below.</p>
                              </div>
                            ) : (
                              <MailhookWaitingTimer message="Waiting for validation email..." />
                            )
                          ) : validated ? (
                            <div className="flex flex-col items-center justify-center py-6">
                              <div className="bg-green-100 text-green-700 px-4 py-3 rounded-full flex items-center gap-2 shadow-sm border border-green-200">
                                <FiCheck className="text-green-600 text-2xl" />
                                <span className="font-semibold text-green-700">
                                  Mailhook Connected
                                </span>
                              </div>

                              <p className="text-sm text-gray-600 mt-3">
                                Forwarding verified successfully.
                              </p>
                            </div>
                          ) : verificationEmail?.sender ? (
                            <>
                              <div
                                className="pt-3 max-h-32 overflow-y-auto text-sm leading-relaxed text-gray-700"
                                dangerouslySetInnerHTML={{
                                  __html:
                                    verificationEmail.formattedBody ||
                                    verificationEmail.textBody,
                                }}
                              />

                              {/* Gmail Warning */}
                              {verificationEmail.isGmailVerification && (
                                <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-lg p-4 mt-4 text-center text-sm">
                                  Gmail confirmation detected — open Gmail and
                                  approve forwarding.
                                </div>
                              )}
                            </>
                          ) : showValidateButton ? (
                            <div className="text-center text-sm text-gray-600">
                              <p>No verfication email received yet.</p>
                              <div class="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm">
                                <p class="leading-relaxed">
                                  Please confirm that you have correctly set up
                                  email forwarding in your email provider. We
                                  recommend visiting our{" "}
                                  <strong>
                                    {" "}
                                    <button
                                      onClick={() => {
                                        setIsExpanded(true);
                                        setShowMobileInstructions(true);
                                      }}
                                      className="text-red-700 font-semibold underline hover:text-red-900"
                                    >
                                      Setup Guide
                                    </button>
                                  </strong>{" "}
                                  for a complete step-by-step walkthrough.
                                  <br />
                                  <br />
                                  If you have already configured forwarding and
                                  want to skip the verification process, please
                                  enter your email below to validate and
                                  finalize the setup.
                                </p>
                              </div>
                            </div>
                          ) : (
                            <MailhookWaitingTimer />
                          )}
                        </div>

                        {/* EMAIL INPUT (Glass) */}
                        <div
                          className={`space-y-3 mt-6 transition-all duration-300 ${
                            !validationPhase &&
                            !validated &&
                            (showValidateButton ||
                              verificationEmail?.isGmailVerification)
                              ? "opacity-100 max-h-[150px]"
                              : "opacity-0 max-h-0 overflow-hidden"
                          }`}
                        >
                          <p className="text-sm text-gray-700">
                            Enter the email address you configured forwarding
                            from:
                          </p>

                          <input
                            type="email"
                            placeholder="Enter your email"
                            className="
            w-full px-3 py-2 rounded-lg text-sm
            bg-white/70 border border-gray-300
            text-gray-700 placeholder-gray-400
            focus:ring-2 focus:ring-indigo-400 outline-none
            backdrop-blur-md
          "
                            value={verificationEmail?.toEmail || ""}
                            onChange={(e) =>
                              setVerificationEmail({
                                ...verificationEmail,
                                toEmail: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                    </>
                  )}
                  <div className="mt-10 pt-6 flex justify-center w-full max-w-xl  border-white/40">
                    {!validated &&
                    !validationPhase &&
                    (showValidateButton ||
                      forwardingConfirmed ||
                      verificationEmail?.isGmailVerification) ? (
                      <button
                        disabled={validating}
                        onClick={async () => {
                          if (!verificationEmail?.toEmail?.trim()) {
                            setAlert({
                              type: "error",
                              message: "Enter your email address!",
                            });
                            return;
                          }

                          setValidating(true);
                          setValidationFailed(false);
                          setShowValidateButton(false);
                          setValidationPhase(true);

                          await handleValidateForwarding();
                          startValidationLoop();
                        }}
                        className="
            flex items-center gap-2 px-6 py-2 rounded-full
            text-sm font-semibold text-[#111827]
            bg-white/30 border border-white/50
            backdrop-blur-xl
            shadow-[0_8px_25px_rgba(0,0,0,0.12)]
            hover:bg-white/40 hover:shadow-[0_10px_30px_rgba(0,0,0,0.16)]
            transition-all
            disabled:opacity-50 disabled:cursor-not-allowed
          "
                      >
                        {validating ? "Validating..." : "Validate Forwarding"}
                        <FiArrowRight className="text-indigo-600" />
                      </button>
                    ) : validated ? (
                      <button
                        onClick={async () => {
                          await saveSetupProgress({
                            stepCompleted: 3,
                            stepStatus: "completed",
                          });
                          setStep(4);
                        }}
                        className="
            flex items-center gap-2 px-6 py-2 rounded-full
            text-sm font-semibold text-[#111827]
            bg-white/30 border border-white/50
            backdrop-blur-xl
            shadow-[0_8px_25px_rgba(0,0,0,0.12)]
            hover:bg-white/40 hover:shadow-[0_10px_30px_rgba(0,0,0,0.16)]
            transition-all
            disabled:opacity-50 disabled:cursor-not-allowed
          "
                      >
                        Next <FiArrowRight />
                      </button>
                    ) : null}
                  </div>
                </div>
              )}

              {step === 4 && (
                <div
                  className="
      flex flex-col items-center justify-between
      min-h-[600px] text-center
      p-8 sm:p-10
      rounded-2xl
      bg-white/30
      border border-white/60
      shadow-[0_8px_30px_rgba(0,0,0,0.12)]
      backdrop-blur-[20px]
      transition-all duration-500 relative
    "
                  style={{ WebkitBackdropFilter: "blur(20px)" }}
                >
                  {/* Alert */}
                  <div className="w-full min-h-[48px] flex items-center justify-center mb-2">
                    <AlertMessage />
                  </div>

                  {/* Header */}
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-[#111827] mb-3">
                      Set up Sending (SMTP)
                    </h2>

                    <p className="text-gray-700 text-sm sm:text-base mb-8 max-w-md mx-auto">
                      Configure how{" "}
                      <span className="font-semibold text-indigo-600">
                        Replex Engine
                      </span>{" "}
                      will send replies from your email address.
                    </p>
                  </div>

                  {/* Tabs */}
                  <div
                    className="
        flex rounded-xl overflow-hidden mb-6 w-full sm:w-[26rem] mx-auto
        bg-white/30 border border-white/60 backdrop-blur-xl
        shadow-[0_4px_20px_rgba(0,0,0,0.12)]
      "
                  >
                    {["Gmail", "Microsoft", "Other"].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setSelectedTab(tab)}
                        className={`
            w-1/2 px-4 py-2 text-sm font-medium transition-all
            ${
              selectedTab === tab
                ? "bg-indigo-600 text-white shadow-[0_4px_20px_rgba(79,70,229,0.4)]"
                : "text-gray-700 bg-white/20 hover:bg-white/40"
            }
          `}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  {/* Gmail Panel */}
                  {selectedTab === "Gmail" && (
                    <div
                      className="
          bg-white/40 backdrop-blur-xl
          border border-white/60
          rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.1)]
          p-6 sm:p-8 text-center flex flex-col items-center
          space-y-4 max-w-sm mx-auto
        "
                    >
                      <p className="text-gray-800 text-sm sm:text-base leading-relaxed">
                        Connect your Gmail account securely using OAuth 2.0.
                      </p>

                      <button
                        onClick={handleGmailConnect}
                        className="
            flex items-center gap-2
            px-6 py-3 rounded-full text-sm font-semibold
            bg-[#EA4335] hover:bg-[#C33D2D] text-white
            shadow-[0_6px_20px_rgba(0,0,0,0.2)]
            transition-all hover:scale-[1.05]
          "
                      >
                        <FaGoogle className="text-lg" />
                        Connect with Gmail
                      </button>
                    </div>
                  )}

                  {/* Microsoft Panel */}
                  {selectedTab === "Microsoft" && (
                    <div
                      className="
          bg-white/40 backdrop-blur-xl
          border border-white/60
          rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.1)]
          p-6 sm:p-8 text-center flex flex-col items-center
          space-y-4 max-w-sm mx-auto
        "
                    >
                      <p className="text-gray-800 text-sm sm:text-base leading-relaxed">
                        Connect your Outlook or Microsoft 365 account securely
                        using OAuth 2.0.
                      </p>

                      <button
                        onClick={handleMicrosoftConnect}
                        className="
            flex items-center gap-2
            px-6 py-3 rounded-full text-sm font-semibold
            bg-[#0078D4] hover:bg-[#0063B1] text-white
            shadow-[0_6px_20px_rgba(0,0,0,0.2)]
            transition-all hover:scale-[1.05]
          "
                      >
                        <FaMicrosoft className="text-lg" />
                        Connect with Outlook
                      </button>
                    </div>
                  )}
                  {/* Other SMTP Panel */}
                  {selectedTab === "Other" && (
                    <div
                      className="
      bg-white/40 backdrop-blur-xl
      border border-white/60
      rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.1)]
      p-6 sm:p-8 text-center flex flex-col items-center
      space-y-4 max-w-sm mx-auto
    "
                    >
                      <p className="text-gray-800 text-sm sm:text-base leading-relaxed">
                        Connect any custom SMTP provider (Outlook, Zoho, Yahoo,
                        Private SMTP).
                      </p>

                      <button
                        onClick={() => setShowOtherSMTPModal(true)}
                        className="
        flex items-center gap-2
        px-6 py-3 rounded-full text-sm font-semibold
        bg-indigo-600 hover:bg-indigo-700 text-white
        shadow-[0_6px_20px_rgba(0,0,0,0.2)]
        transition-all hover:scale-[1.05]
      "
                      >
                        Connect Other SMTP
                      </button>
                    </div>
                  )}
                  {/* Footer Button */}
                  <div className="flex justify-center w-full max-w-md mt-10 border-t border-white/50 pt-6">
                    <button
                      onClick={async () => {
                        // await saveSetupProgress({
                        //   stepCompleted: 4,
                        //   stepStatus: "completed",
                        // });
                        setStep(5);
                      }}
                      className="
          flex items-center justify-center gap-2
          px-8 py-3 rounded-full text-sm font-semibold
          bg-white/30 border border-white/60
          text-[#111827]
          shadow-[0_6px_25px_rgba(0,0,0,0.15)]
          backdrop-blur-xl
          transition-all hover:bg-white/40 hover:scale-[1.05]
        "
                    >
                      <span>Next</span>
                      <FiArrowRight className="text-indigo-600" />
                    </button>
                  </div>
                </div>
              )}

              {step === 5 && (
                <div
                  className="
      flex flex-col items-center justify-between
      min-h-[600px] text-center
      p-8 sm:p-10
      rounded-2xl
      bg-white/30
      border border-white/60
      shadow-[0_8px_35px_rgba(0,0,0,0.15)]
      backdrop-blur-[20px]
      transition-all duration-500 relative
    "
                  style={{ WebkitBackdropFilter: "blur(20px)" }}
                >
                  {/* Alert */}
                  <div className="w-full min-h-[48px] flex items-center justify-center mb-2">
                    <AlertMessage />
                  </div>

                  {/* Header */}
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-[#111827] mb-3">
                      Review & Go Live
                    </h2>

                    <p className="text-gray-700 text-sm sm:text-base mb-8 max-w-md mx-auto">
                      Confirm your setup and enable automation.
                    </p>
                  </div>

                  {/* Checklist Card */}
                  <div
                    className="
        w-full max-w-xl text-left p-6 sm:p-8 space-y-5
        bg-white/35
        border border-white/60
        rounded-xl
        shadow-[0_6px_30px_rgba(0,0,0,0.12)]
        backdrop-blur-[14px]
        transition-all
      "
                    style={{ WebkitBackdropFilter: "blur(14px)" }}
                  >
                    <div>
                      <h3 className="font-semibold text-[#111827] mb-1">
                        Setup Checklist
                      </h3>
                      <p className="text-sm text-gray-600">
                        Here’s a summary of your setup progress:
                      </p>
                    </div>

                    {!setupProgress ? (
                      <p className="text-gray-600 text-center py-6">
                        Loading progress...
                      </p>
                    ) : (
                      <ul className="space-y-3 text-sm text-[#111827]">
                        {setupProgress.steps?.map((stepItem) => (
                          <li
                            key={stepItem.step}
                            className="
                flex items-center justify-between
                border-b border-white/40
                pb-2
              "
                          >
                            <div className="flex items-center space-x-2">
                              {stepItem.status === "completed" ? (
                                <FiCheckCircle className="text-green-600 text-lg" />
                              ) : (
                                <FiAlertTriangle className="text-yellow-500 text-lg" />
                              )}
                              <span>{stepItem.title}</span>
                            </div>

                            <span
                              className={`
                  text-xs px-2 py-1 rounded-full
                  ${
                    stepItem.status === "completed"
                      ? "bg-green-100 text-green-700 border border-green-300"
                      : "bg-yellow-100 text-yellow-700 border border-yellow-300"
                  }
                `}
                            >
                              {stepItem.status === "completed"
                                ? "Completed"
                                : "Skipped"}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Footer Button */}
                  <div className="flex justify-center mt-10">
                    <button
                      onClick={async () => {
                        await saveSetupProgress({
                          setupCompleted: true,
                          stepCompleted: 5,
                          completed: true,
                        });
                        await refreshUser();
                        navigate("/organization");
                      }}
                      className="
          flex items-center justify-center gap-2
          px-8 py-3 rounded-full text-sm font-semibold
          text-[#111827]
          bg-white/30
          border border-white/60
          shadow-[0_8px_25px_rgba(0,0,0,0.15)]
          backdrop-blur-xl
          hover:bg-white/40 hover:scale-[1.05]
          transition-all duration-300
        "
                      style={{ WebkitBackdropFilter: "blur(14px)" }}
                    >
                      <span>Start building scenarios...</span>
                      <FiArrowRight className="text-indigo-600" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          {!isExpanded && (
            <div className="fixed right-0 top-1/2 -translate-y-1/2 z-50">
              <button
                onClick={() => setIsExpanded(true)}
                className="
        font-sans
        bg-black/60
        backdrop-blur-xl
        border border-white/20
        text-white
        py-8 px-3
        rounded-l-[20px]
        shadow-[0_10px_30px_rgba(0,0,0,0.35)]
        transition-all duration-300
        hover:bg-black/70
        hover:shadow-[0_12px_35px_rgba(0,0,0,0.45)]
        active:scale-[0.97]
        group
      "
                style={{ WebkitBackdropFilter: "blur(14px)" }}
              >
                <span
                  className="
          [writing-mode:vertical-lr]
          rotate-180
          text-[11px]
          font-semibold
          tracking-[0.25em]
          uppercase
          flex items-center gap-2
        "
                >
                  <FiInfo className="text-indigo-400 text-sm" />
                  Setup Guide
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
      <div
        className={`transition-all duration-500 ease-in-out ${
          isExpanded ? "lg:mr-[700px]" : "lg:mr-0"
        } w-full`}
      ></div>

      <div className="hidden lg:block">
        <div
          className={`fixed top-0 right-0 h-full bg-white shadow-2xl border-l border-gray-200 transform transition-transform duration-500 ease-in-out z-40 ${
            isExpanded ? "translate-x-0" : "translate-x-full"
          }`}
          style={{ width: "700px" }}
        >
          <InstructionPanel
            step={step}
            isExpanded={isExpanded}
            setIsExpanded={setIsExpanded}
          />
        </div>
      </div>

      <motion.button
        onClick={() => setShowMobileInstructions(true)}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="fixed top-6 right-6 z-40 bg-[#4F46E5] text-white p-3 rounded-full shadow-lg hover:bg-[#4338CA] transition lg:hidden flex items-center justify-center"
      >
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{
            duration: 1.6,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
          }}
        >
          <FiInfo className="text-2xl" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {showMobileInstructions && (
          <motion.div
            className="fixed inset-0 z-50 flex lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              onClick={() => setShowMobileInstructions(false)}
              className="absolute inset-0 bg-black bg-opacity-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            />

            <motion.div
              className="relative ml-auto w-[90%] sm:w-[400px] h-full bg-white shadow-2xl border-l border-gray-200"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
            >
              <div className="flex justify-between items-center p-4 border-b bg-[#F9FAFB]">
                <h3 className="text-lg font-semibold text-[#111827] flex items-center gap-2">
                  <FiInfo className="text-[#4F46E5]" /> Setup Guidance
                </h3>
                <motion.button
                  onClick={() => setShowMobileInstructions(false)}
                  whileHover={{ rotate: 90 }}
                  transition={{ duration: 0.3 }}
                  className="text-gray-600 hover:text-gray-800"
                >
                  <FiX className="text-xl" />
                </motion.button>
              </div>

              <div className="overflow-y-auto h-[calc(100%-4rem)] p-4">
                <InstructionPanel
                  step={step}
                  isExpanded={true}
                  setIsExpanded={() => {}}
                  isMobile={true}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <SetupOtherSMTPModal
        isOpen={showOtherSMTPModal}
        onClose={() => setShowOtherSMTPModal(false)}
        onSuccess={async () => {
          await saveSetupProgress({
            stepCompleted: 4,
            stepStatus: "completed",
          });

          setStep(5);
        }}
      />
    </div>
  );
};

export default SetupFlow;

const InstructionPanel = ({
  step,
  isExpanded,
  setIsExpanded,
  isMobile = false,
}) => {
  const [activeTab, setActiveTab] = useState("gmail");
  const { user, loading } = useContext(UserContext);

  return (
    //   <div
    //     className={`${
    //       isMobile ? "flex" : "hidden lg:flex"
    //     } flex-col min-h-screen justify-start
    // backdrop-blur-[12px]
    // bg-white/20
    // border-l border-white/30
    // shadow-[0_8px_40px_rgba(0,0,0,0.10)]
    // transition-all duration-500 ease-in-out overflow-y-auto relative
    // ${
    //   isMobile
    //     ? "w-full h-full p-5 text-sm"
    //     : isExpanded
    //     ? "w-[700px] p-8"
    //     : "w-[450px] p-7"
    // }`}
    //     style={{ WebkitBackdropFilter: "blur(12px)" }}
    //   >
    <div
      className={`${isMobile ? "flex" : "hidden lg:flex"} flex-col 
  h-screen            /* 👈 FIXED HEIGHT */
  max-h-screen        /* 👈 ENSURE LIMIT */
  justify-start 
  backdrop-blur-[12px]
  bg-white/20
  border-l border-white/30
  shadow-[0_8px_40px_rgba(0,0,0,0.10)]
  transition-all duration-500 ease-in-out
  overflow-y-auto     /* 👈 SCROLL ENABLED */
  overflow-x-hidden
  relative
  ${
    isMobile
      ? "w-full p-5 text-sm"
      : isExpanded
        ? "w-[700px] p-8"
        : "w-[450px] p-7"
  }`}
      style={{ WebkitBackdropFilter: "blur(12px)" }}
    >
      {!isMobile && (
        <button
          onClick={() => setIsExpanded((prev) => !prev)}
          className={`fixed top-[46%] -translate-y-1/2 
      ${isExpanded ? "left-[-14px]" : "left-3"} 
      flex items-center justify-center w-11 h-11 rounded-full 
      bg-gradient-to-r from-indigo-500 to-purple-600
      shadow-[0_4px_12px_rgba(79,70,229,0.35)]
      hover:shadow-[0_6px_18px_rgba(79,70,229,0.45)]
      hover:scale-110 transition-all duration-300 ease-in-out z-50`}
          aria-label="Toggle sidebar"
        >
          {isExpanded ? <FiArrowRight size={18} /> : <FiArrowLeft size={18} />}
        </button>
      )}
      <div
        className="flex items-center gap-3 mb-5 
  border-b border-white/40 pb-3"
      >
        <div
          className="p-2.5 
    bg-white/30 backdrop-blur-sm 
    rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.08)]"
        >
          <FiInfo className="text-indigo-600 text-xl sm:text-2xl" />
        </div>

        <div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
            Setup Guidance
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
            Follow the steps below to complete your inbox setup
          </p>
        </div>
      </div>

      {/* Intro Text */}
      <p className="text-gray-500 text-xs sm:text-sm mb-4 sm:mb-6 leading-relaxed">
        Follow these quick instructions carefully — each step will guide you
        toward completing your setup successfully.
      </p>

      <div
        className="
    backdrop-blur-[14px]
    bg-white/25 
    border border-white/40
    rounded-2xl p-5 sm:p-6 
    shadow-[0_10px_35px_rgba(0,0,0,0.12)] 
    hover:shadow-[0_12px_40px_rgba(0,0,0,0.16)] 
    transition-all duration-300 ease-in-out
  "
      >
        {step === 1 && (
          <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-white rounded-2xl p-5 sm:p-6 border border-indigo-100 shadow-sm">
            <div className="mb-5 rounded-xl overflow-hidden shadow-md border border-indigo-100">
              <video
                className="w-full rounded-xl"
                controls
                poster="/videos/thumbnails/step1-thumb.jpg"
              >
                <source src="/videos/step1.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>{" "}
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center gap-2">
                <FiMail className="text-indigo-600" /> Step 1: Get Started
              </h4>
              <span
                className="text-[10px] sm:text-xs 
  bg-green-100 text-green-700 
  px-2 sm:px-3 py-0.5 rounded-full 
  font-medium shadow-sm 
  whitespace-nowrap 
  flex-shrink-0"
              >
                {" "}
                1 / 5
              </span>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed mb-4">
              Welcome! You’re about to set up your{" "}
              <strong className="text-indigo-700">Replex Engine</strong>. This
              process takes less than a minute.
            </p>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1.5 mb-5">
              <li>We’ll create your private mailhook.</li>
              <li>Then connect your email forwarding.</li>
              <li>Finally, configure how your replies are sent.</li>
            </ul>
            <div className="bg-gradient-to-r from-indigo-100 to-purple-100 border-l-4 border-indigo-500 rounded-lg p-4 text-indigo-900 text-sm shadow-sm">
              <strong className="text-indigo-700">💡 Tip:</strong> Click{" "}
              <span className="font-semibold text-indigo-700">
                “Start 60-sec Setup”
              </span>{" "}
              to begin the process.
            </div>
          </div>
        )}

        {step === 2 && (
          <div
            className="bg-gradient-to-br from-indigo-50/70 via-purple-50/60 to-indigo-100/40 
  backdrop-blur-md border border-indigo-100/60 
  rounded-2xl p-5 sm:p-6 shadow-[0_6px_18px_rgba(79,70,229,0.1)] 
  transition-all duration-300 ease-in-out"
          >
            <div className="mb-5 rounded-xl overflow-hidden shadow-md border border-indigo-100">
              <video
                className="w-full rounded-xl"
                controls
                poster="/videos/thumbnails/step1-thumb.jpg"
              >
                <source src="/videos/step1.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center gap-2">
                <FiCopy className="text-indigo-600" /> Step 2 – Connect Your
                Email
              </h4>
              <span
                className="text-[10px] sm:text-xs 
  bg-green-100 text-green-700 
  px-2 sm:px-3 py-0.5 rounded-full 
  font-medium shadow-sm 
  whitespace-nowrap 
  flex-shrink-0"
              >
                {" "}
                2 / 5
              </span>
            </div>

            {/* Intro */}
            <p className="text-sm text-gray-700 leading-relaxed mb-5">
              Choose your email provider below and follow the steps to forward
              your emails to your unique{" "}
              <strong className="text-indigo-700">Mailhook address</strong>.
            </p>

            {/* Provider Tabs */}
            <div
              className="bg-gradient-to-r from-indigo-100/60 via-purple-100/50 to-indigo-50/60 
    rounded-xl p-1 flex space-x-1 overflow-x-auto no-scrollbar mb-5 border border-indigo-100/50"
            >
              {[
                {
                  id: "gmail",
                  icon: <FiMail className="text-indigo-600" />,
                  label: "Gmail",
                },
                {
                  id: "outlook",
                  icon: <FiSend className="text-indigo-600" />,
                  label: "Outlook",
                },
                {
                  id: "smtp",
                  icon: <FiServer className="text-indigo-600" />,
                  label: "SMTP",
                },
              ].map(({ id, icon, label }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex-1 min-w-[90px] sm:min-w-0 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-200
            ${
              activeTab === id
                ? "bg-white/90 text-indigo-700 shadow-md border border-indigo-100"
                : "text-gray-600 hover:bg-white/50"
            }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    {icon}
                    {label}
                  </div>
                </button>
              ))}
            </div>

            {/* Gmail Instructions */}
            {activeTab === "gmail" && (
              <div className="text-gray-700 text-sm leading-relaxed space-y-4 animate-fadeIn">
                {[
                  {
                    icon: <FiSettings className="text-indigo-600 text-lg" />,
                    text: (
                      <>
                        Open <strong>Gmail Settings</strong> → click the gear
                        icon → <strong>“See all settings”</strong>.
                      </>
                    ),
                  },
                  {
                    icon: <FiFolder className="text-indigo-600 text-lg" />,
                    text: (
                      <>
                        Go to the <strong>Forwarding and POP/IMAP</strong> tab.
                      </>
                    ),
                  },
                  {
                    icon: <FiPlusCircle className="text-indigo-600 text-lg" />,
                    text: (
                      <>
                        Click <strong>“Add a forwarding address”</strong>.
                      </>
                    ),
                  },
                  {
                    icon: <FiMail className="text-indigo-600 text-lg" />,
                    text: (
                      <>
                        Enter your Mailhook address:
                        <code className="block bg-white/70 border border-indigo-200 text-indigo-700 px-3 py-1.5 rounded-lg text-xs font-mono mt-1 break-all select-all">
                          {user?.mailhook || "your-mailhook@zenith-inbox.com"}
                        </code>
                      </>
                    ),
                  },
                  {
                    icon: <FiCheckCircle className="text-green-600 text-lg" />,
                    text: (
                      <>
                        Gmail will send a <strong>confirmation email</strong> to
                        this address.
                      </>
                    ),
                  },
                ].map(({ icon, text }, i) => (
                  <div key={i} className="flex items-start gap-3">
                    {icon}
                    <p>{text}</p>
                  </div>
                ))}

                <div className="mt-5 p-3 bg-indigo-50 border-l-4 border-indigo-500 rounded-lg text-indigo-800 text-sm flex items-center gap-2">
                  <FiArrowRightCircle className="text-indigo-600" />
                  <p>
                    Click <strong>Next</strong> below to proceed and verify your
                    forwarding setup.
                  </p>
                </div>
              </div>
            )}

            {/* Outlook Instructions */}
            {activeTab === "outlook" && (
              <div className="text-gray-700 text-sm leading-relaxed space-y-4 animate-fadeIn">
                {[
                  {
                    icon: <FiSettings className="text-indigo-600 text-lg" />,
                    text: (
                      <>
                        Open <strong>Outlook Settings</strong> → click{" "}
                        <strong>“View all Outlook settings”</strong>.
                      </>
                    ),
                  },
                  {
                    icon: <FiSend className="text-indigo-600 text-lg" />,
                    text: (
                      <>
                        Navigate to <strong>Mail → Forwarding</strong>.
                      </>
                    ),
                  },
                  {
                    icon: <FiToggleRight className="text-indigo-600 text-lg" />,
                    text: (
                      <>
                        Enable <strong>Start forwarding</strong>.
                      </>
                    ),
                  },
                  {
                    icon: <FiMail className="text-indigo-600 text-lg" />,
                    text: (
                      <>
                        Enter your Mailhook address:
                        <code className="block bg-white/70 border border-indigo-200 text-indigo-700 px-3 py-1.5 rounded-lg text-xs font-mono mt-1 break-all select-all">
                          {user?.mailhook || "your-mailhook@zenith-inbox.com"}
                        </code>
                      </>
                    ),
                  },
                  {
                    icon: <FiSave className="text-green-600 text-lg" />,
                    text: (
                      <>
                        Click <strong>Save</strong> to apply your changes.
                      </>
                    ),
                  },
                ].map(({ icon, text }, i) => (
                  <div key={i} className="flex items-start gap-3">
                    {icon}
                    <p>{text}</p>
                  </div>
                ))}

                <div className="mt-5 p-3 bg-blue-50 border-l-4 border-blue-400 rounded-lg text-blue-800 text-sm flex items-center gap-2">
                  <FiArrowRightCircle className="text-indigo-600" />
                  <p>
                    Click <strong>Next</strong> below to verify your Outlook
                    forwarding connection.
                  </p>
                </div>
              </div>
            )}

            {/* SMTP Instructions */}
            {activeTab === "smtp" && (
              <div className="text-gray-700 text-sm leading-relaxed space-y-4 animate-fadeIn">
                {[
                  {
                    icon: <FiServer className="text-indigo-600 text-lg" />,
                    text: (
                      <>
                        Open your email provider’s{" "}
                        <strong>SMTP / Email Settings</strong>.
                      </>
                    ),
                  },
                  {
                    icon: <FiKey className="text-indigo-600 text-lg" />,
                    text: (
                      <>
                        Enter your <strong>username</strong> and{" "}
                        <strong>app password</strong>.
                      </>
                    ),
                  },
                  {
                    icon: <FiGlobe className="text-indigo-600 text-lg" />,
                    text: (
                      <>
                        Use your SMTP Host and Port (e.g.{" "}
                        <code className="bg-white/70 text-indigo-700 rounded px-1 py-0.5 text-xs">
                          smtp.yourdomain.com
                        </code>{" "}
                        Port{" "}
                        <code className="bg-white/70 text-indigo-700 rounded px-1 py-0.5 text-xs">
                          587
                        </code>
                        ).
                      </>
                    ),
                  },
                  {
                    icon: <FiLock className="text-green-600 text-lg" />,
                    text: (
                      <>
                        Enable <strong>STARTTLS</strong> or <strong>SSL</strong>
                        .
                      </>
                    ),
                  },
                  {
                    icon: <FiCheckCircle className="text-green-600 text-lg" />,
                    text: <>Test your configuration to confirm connection.</>,
                  },
                ].map(({ icon, text }, i) => (
                  <div key={i} className="flex items-start gap-3">
                    {icon}
                    <p>{text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div
            className="bg-gradient-to-br from-indigo-50/70 via-purple-50/60 to-indigo-100/40 
  backdrop-blur-md border border-indigo-100/60 rounded-2xl 
  p-5 sm:p-6 shadow-[0_6px_18px_rgba(79,70,229,0.1)] 
  transition-all duration-300 ease-in-out 
  h-full max-h-[80vh] overflow-y-auto custom-scrollbar"
          >
            <div className="mb-5 rounded-xl overflow-hidden shadow-md border border-indigo-100">
              <video
                className="w-full rounded-xl"
                controls
                poster="/videos/thumbnails/step1-thumb.jpg"
              >
                <source src="/videos/step1.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center gap-2">
                <FiAlertCircle className="text-indigo-600" /> Step 3 – Verify
                Forwarding
              </h4>
              <span
                className="text-[10px] sm:text-xs 
  bg-green-100 text-green-700 
  px-2 sm:px-3 py-0.5 rounded-full 
  font-medium shadow-sm 
  whitespace-nowrap 
  flex-shrink-0"
              >
                {" "}
                3 / 5
              </span>
            </div>

            {/* Intro */}
            <p className="text-sm text-gray-700 leading-relaxed mb-5">
              Great job — your Mailhook is now connected! Let’s verify that
              Gmail is forwarding messages correctly to your{" "}
              <strong className="text-indigo-700">Mailhook address</strong>.
            </p>

            {/* Instruction list */}
            <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
              {[
                {
                  icon: <FiMail className="text-indigo-600 text-lg mt-0.5" />,
                  text: (
                    <>
                      Go back to your <strong>Gmail Settings</strong> → open the{" "}
                      <strong>Forwarding and POP/IMAP</strong> tab again.
                    </>
                  ),
                },
                {
                  icon: (
                    <FiRefreshCcw className="text-indigo-600 text-lg mt-0.5" />
                  ),
                  text: (
                    <>
                      Refresh that page — you’ll now see your{" "}
                      <strong>Mailhook address</strong> in the forwarding
                      dropdown.
                    </>
                  ),
                },
                {
                  icon: (
                    <FiToggleRight className="text-indigo-600 text-lg mt-0.5" />
                  ),
                  text: (
                    <>
                      Select your Mailhook under{" "}
                      <strong>“Forward a copy of incoming mail to”</strong> and
                      choose what happens to the original (e.g., “Keep Gmail’s
                      copy in Inbox”).
                    </>
                  ),
                },
                {
                  icon: <FiSave className="text-green-600 text-lg mt-0.5" />,
                  text: (
                    <>
                      Scroll down and click <strong>Save Changes</strong> to
                      enable forwarding.
                    </>
                  ),
                },
                {
                  icon: <FiMail className="text-indigo-600 text-lg mt-0.5" />,
                  text: (
                    <>
                      Return to this screen. Replex Engine will automatically
                      check for Gmail’s confirmation email.
                    </>
                  ),
                },
                {
                  icon: <FiSearch className="text-indigo-600 text-lg mt-0.5" />,
                  text: (
                    <>
                      If the confirmation email hasn’t appeared yet, click{" "}
                      <strong>Retry Checking</strong> below. Once it arrives,
                      you’ll see it appear here.
                    </>
                  ),
                },
                {
                  icon: (
                    <FiCheckCircle className="text-green-600 text-lg mt-0.5" />
                  ),
                  text: (
                    <>
                      Open that email, click the{" "}
                      <strong>verification link</strong>, and your Gmail
                      forwarding will be active. Then click{" "}
                      <strong>Validate Forwarding</strong> to complete.
                    </>
                  ),
                },
              ].map(({ icon, text }, i) => (
                <div key={i} className="flex items-start gap-3">
                  {icon}
                  <p>{text}</p>
                </div>
              ))}
            </div>

            {/* Note Box */}
            <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-4 text-yellow-800 text-sm flex items-start gap-2 shadow-sm">
              <FiInfo className="text-yellow-600 text-lg mt-0.5" />
              <p>
                <strong>Note:</strong> If you don’t see the confirmation email
                after a few minutes, double-check that forwarding is enabled and
                your Mailhook address is selected in Gmail.
              </p>
            </div>

            {/* Pro Tip */}
            <div className="mt-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-l-4 border-indigo-500 rounded-lg p-4 text-indigo-900 text-sm flex items-start gap-2 shadow-sm">
              <FaRegLightbulb className="text-indigo-600 text-lg mt-0.5" />
              <p>
                <strong>Pro Tip:</strong> Keep Gmail open in another tab while
                verifying — the process completes faster and ensures you don’t
                miss the prompt.
              </p>
            </div>

            {/* Verification Input Card */}
            <div className="mt-6 border border-indigo-100 rounded-xl p-5 bg-white/70 backdrop-blur-sm shadow-[0_4px_12px_rgba(79,70,229,0.05)] transition hover:shadow-[0_6px_16px_rgba(79,70,229,0.08)]">
              <h5 className="text-sm sm:text-base font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <FiUser className="text-indigo-600" /> Add Your Email for
                Verification
              </h5>
              <p className="text-xs text-gray-600 mb-3">
                Enter the email address where you enabled forwarding. We’ll use
                it to confirm your Mailhook connection and validate your setup.
              </p>

              <div className="mt-3 text-xs text-gray-500 flex items-center gap-2">
                <FiArrowRight className="text-indigo-600" />
                <p>
                  Once validated successfully, click <strong>Next</strong> below
                  to continue to SMTP setup.
                </p>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div
            className="bg-gradient-to-br from-indigo-50/70 via-purple-50/60 to-indigo-100/40 
    backdrop-blur-md border border-indigo-100/60 rounded-2xl 
    p-5 sm:p-6 shadow-[0_6px_18px_rgba(79,70,229,0.1)] 
    transition-all duration-300 ease-in-out 
    h-full max-h-[80vh] overflow-y-auto custom-scrollbar"
          >
            <div className="mb-5 rounded-xl overflow-hidden shadow-md border border-indigo-100">
              <video
                className="w-full rounded-xl"
                controls
                poster="/videos/thumbnails/step1-thumb.jpg"
              >
                <source src="/videos/step1.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center gap-2">
                <FiSend className="text-indigo-600" /> Step 4 – Set Up SMTP
                Sending
              </h4>
              <span
                className="text-[10px] sm:text-xs 
  bg-green-100 text-green-700 
  px-2 sm:px-3 py-0.5 rounded-full 
  font-medium shadow-sm 
  whitespace-nowrap 
  flex-shrink-0"
              >
                {" "}
                4 / 5
              </span>
            </div>

            {/* Intro */}
            <p className="text-sm text-gray-700 leading-relaxed mb-5">
              Choose how{" "}
              <strong className="text-indigo-700">Replex Engine</strong> will
              send emails on your behalf.
            </p>

            {/* Main Points */}
            <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
              <div className="flex items-start gap-3">
                <FiMail className="text-indigo-600 text-lg mt-0.5" />
                <p>
                  Select your sending method — <strong>Gmail</strong>,{" "}
                  <strong>Microsoft</strong>, or <strong>Custom SMTP</strong>.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <FiKey className="text-indigo-600 text-lg mt-0.5" />
                <p>
                  Connect securely using <strong>OAuth</strong> (recommended) or
                  your credentials.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <FiLock className="text-green-600 text-lg mt-0.5" />
                <p>
                  Use only verified accounts for better deliverability and
                  security.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <FiCheckCircle className="text-green-600 text-lg mt-0.5" />
                <p>
                  Once connected successfully, you’ll be redirected to{" "}
                  <strong>Step 5</strong> automatically.
                </p>
              </div>
            </div>

            {/* Tip Box */}
            <div
              className="mt-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-l-4 border-indigo-500 rounded-lg 
      p-4 text-indigo-900 text-sm flex items-start gap-3 shadow-sm"
            >
              <FiInfo className="text-indigo-600 text-lg mt-0.5" />
              <p>
                <strong>Tip:</strong> Use your business-domain email instead of
                Gmail to improve trust and avoid spam filters.
              </p>
            </div>
          </div>
        )}

        {step === 5 && (
          <div
            className="bg-gradient-to-br from-indigo-50/70 via-purple-50/60 to-emerald-50/40 
    backdrop-blur-md border border-indigo-100/60 rounded-2xl 
    p-5 sm:p-6 shadow-[0_6px_18px_rgba(79,70,229,0.08)] 
    transition-all duration-300 ease-in-out 
    h-full max-h-[80vh] overflow-y-auto custom-scrollbar"
          >
            <div className="mb-5 rounded-xl overflow-hidden shadow-md border border-indigo-100">
              <video
                className="w-full rounded-xl"
                controls
                poster="/videos/thumbnails/step1-thumb.jpg"
              >
                <source src="/videos/step1.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <h4 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center gap-2">
                <FiCheckCircle className="text-green-600" /> Step 5 – Review &
                Go Live
              </h4>
              <span
                className="text-[10px] sm:text-xs 
  bg-green-100 text-green-700 
  px-2 sm:px-3 py-0.5 rounded-full 
  font-medium shadow-sm 
  whitespace-nowrap 
  flex-shrink-0"
              >
                5 / 5
              </span>
            </div>

            {/* Intro */}
            <p className="text-sm text-gray-700 leading-relaxed mb-5">
              You’re almost done! Review your setup before activating your
              automation.
            </p>

            {/* Progress Summary */}
            {user?.setup?.steps ? (
              <div
                className="bg-gradient-to-br from-indigo-50/70 via-purple-50/60 to-indigo-100/40 
  backdrop-blur-md border border-indigo-100/60 
  rounded-2xl p-4 sm:p-5 mb-6 
  shadow-[0_4px_14px_rgba(79,70,229,0.08)] 
  transition-all duration-300 ease-in-out"
              >
                <h5 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <FiBarChart2 className="text-indigo-600" /> Setup Progress
                  Summary
                </h5>

                <ul className="space-y-2 text-sm">
                  {user.setup.steps.map((s) => (
                    <li
                      key={s._id}
                      className="flex items-center justify-between border-b border-gray-100 pb-1.5"
                    >
                      <div className="flex items-center gap-2">
                        {s.status === "completed" ? (
                          <FiCheckCircle className="text-green-600" />
                        ) : (
                          <FiAlertTriangle className="text-yellow-500" />
                        )}
                        <span>{s.title}</span>
                      </div>
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          s.status === "completed"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-4 text-xs text-gray-600 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <FiCheckCircle className="text-green-600" />
                    <span>
                      Completed:{" "}
                      <strong>
                        {
                          user.setup.steps.filter(
                            (s) => s.status === "completed",
                          ).length
                        }
                      </strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FiAlertTriangle className="text-yellow-500" />
                    <span>
                      Skipped:{" "}
                      <strong>
                        {
                          user.setup.steps.filter((s) => s.status === "skipped")
                            .length
                        }
                      </strong>
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm italic mb-4">
                Loading setup progress…
              </p>
            )}

            {/* Review Checklist */}
            <div className="space-y-3 text-sm text-gray-800">
              <div className="flex items-start gap-3">
                <FiEye className="text-indigo-600 text-lg mt-0.5" />
                <p>
                  Review all your setup steps and confirm they’re completed.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <FiMail className="text-indigo-600 text-lg mt-0.5" />
                <p>Ensure your Mailhook and SMTP are properly connected.</p>
              </div>
              <div className="flex items-start gap-3">
                <FiPlayCircle className="text-green-600 text-lg mt-0.5" />
                <p>
                  Click <strong>“Start Building Scenarios”</strong> to activate
                  your workspace.
                </p>
              </div>
            </div>

            {/* Success Tip */}
            <div
              className="mt-6 bg-gradient-to-r from-green-50 to-indigo-50 
      border-l-4 border-green-500 rounded-lg 
      p-4 text-green-900 text-sm flex items-start gap-3 shadow-sm"
            >
              <FiSmile className="text-green-600 text-lg mt-0.5" />
              <p>
                <strong>Success Tip:</strong> You’re all set! Once activated,
                all leads will automatically flow into{" "}
                <strong className="text-indigo-700">Replex Engine</strong>.
              </p>
            </div>
          </div>
        )}
      </div>
      <div className="mt-8 text-center text-sm text-gray-500 border-t pt-4">
        Need help?{" "}
        <a
          href="/pages/mailhook/instruction"
          target="_blank"
          className="text-[#4F46E5] font-semibold hover:underline"
        >
          View detailed guide
        </a>
      </div>
    </div>
  );
};

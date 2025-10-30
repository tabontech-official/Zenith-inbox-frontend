import React, { useContext, useEffect, useState } from "react";
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
import { FaMicrosoft, FaRegLightbulb } from "react-icons/fa";
import toast from "react-hot-toast";

const SetupFlow = () => {
  const navigate = useNavigate();
  const { user, loading } = useContext(UserContext);
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const stepFromURL = parseInt(query.get("step"), 10);
  const [step, setStep] = useState(stepFromURL || 1);
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

  const toggleService = (service) => {
    setSelectedServices((prev) =>
      prev.includes(service)
        ? prev.filter((s) => s !== service)
        : [...prev, service]
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
      redirectURL
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
      redirectURL
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
        }
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
        }
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

  const handleSmtpChange = (e) => {
    setSmtpForm({ ...smtpForm, [e.target.name]: e.target.value });
  };

  const handleSmtpSave = async () => {
    try {
      const userId = localStorage.getItem("userid");
      const payload = { ...smtpForm, userId, provider: "outlook" };

      const res = await fetch(
        "https://email-syncing-backend.vercel.app/auth/saveSmtpConnection",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error("Failed to save SMTP connection");
      alert("SMTP connection saved successfully!");
      setStep(5);
    } catch (err) {
      console.error(err);
      alert(" Failed to save SMTP connection");
    }
  };

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
          `https://email-syncing-backend.vercel.app/mailhook/verification/${user._id}`
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
              '<a href="$1" target="_blank" rel="noopener noreferrer" style="color:#2563eb;text-decoration:underline;">$1</a>'
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
        `https://email-syncing-backend.vercel.app/mailhook/validateTest/${user._id}`
      );
      const data = await res.json();

      if (data.success) {
        console.log(" Validation email found:", data.data);
        setVerificationEmail(data.data);
        setValidated(true);
      } else {
        console.log(" Not yet validated:", data.message);
        setValidated(false);
      }
    } catch (err) {
      console.error("Error fetching validation email:", err);
    }
  };

  const handleValidateForwarding = async () => {
    try {
      if (!verificationEmail?.toEmail?.trim()) {
        toast.error("Please enter a valid email address.");
        return;
      }

      setValidating(true);
      setValidated(false);
      setValidationFailed(false);
      setValidationPhase(true);

      const res = await fetch(
        `https://email-syncing-backend.vercel.app/mailhook/validate-forwarding/${user._id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ toEmail: verificationEmail.toEmail }),
        }
      );

      const data = await res.json();

      if (data.success) {
        toast.success("Validation started. Checking for forwarded email...");

        let attempts = 0;
        const maxAttempts = 5;

        const checkLoop = async () => {
          attempts++;
          console.log(`🕒 Attempt ${attempts} of ${maxAttempts}`);

          const found = await fetchValidateEmail();
          if (found) {
            return;
          }

          if (attempts < maxAttempts) {
            console.log("🔁 Not yet — retrying in 10s...");
            setTimeout(checkLoop, 10000);
          } else {
            console.log("❌ Validation failed after 5 attempts.");
            setValidating(false);
            setValidationPhase(false);
            setValidationFailed(true);
          }
        };

        checkLoop();
      } else {
        toast.error(
          data.message ||
            "Failed to start validation. Please make sure your forwarding setup is correct."
        );
        setValidating(false);
        setValidationPhase(false);
        setValidationFailed(true);
      }
    } catch (err) {
      console.error(" Error during validation process:", err);
      toast.error("Something went wrong while validating connection.");
      setValidating(false);
      setValidationPhase(false);
      setValidationFailed(true);
    }
  };

  useEffect(() => {
    if (!loading && user) {
      const hasSkippedStep = user?.setup?.steps?.some(
        (s) => s.status === "skipped" || s.status === "incomplete"
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
          `https://email-syncing-backend.vercel.app/auth/setup/${user._id}`
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

  const CountdownTimer = () => {
    const [seconds, setSeconds] = useState(10);
    useEffect(() => {
      if (seconds <= 0) return;
      const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
      return () => clearTimeout(t);
    }, [seconds]);

    const progress = ((10 - seconds) / 10) * 100;

    return (
      <div className="text-center w-full">
        <p className="text-sm text-gray-600 mb-2">
          Preparing validation options in {seconds}s…
        </p>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#4F46E5] transition-all duration-1000"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    );
  };

  const LoopingTimer = ({ loop, message }) => {
    const [seconds, setSeconds] = useState(10);
    useEffect(() => {
      const i = setInterval(
        () => setSeconds((s) => (s <= 1 ? 10 : s - 1)),
        1000
      );
      return () => clearInterval(i);
    }, []);

    const progress = ((10 - seconds) / 10) * 100;
    const hints = [
      "Waiting for your forwarded email…",
      "Still checking — please confirm forwarding is active.",
      "If it’s taking long, re-check Gmail/Outlook forwarding rules.",
    ];
    const hint = hints[Math.min(loop, hints.length - 1)];

    return (
      <div className="text-center space-y-2">
        <p className="text-sm text-gray-600">{hint}</p>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#4F46E5] transition-all duration-1000"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-gray-400">Checking again in {seconds}s…</p>
        {message && <p className="text-xs text-gray-500">{message}</p>}
      </div>
    );
  };
  const MailhookWaitingTimer = () => {
    const [seconds, setSeconds] = useState(10);
    const [message, setMessage] = useState(
      "Waiting for email... please complete Gmail forwarding setup."
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
            : "Waiting for forwarded email... please complete Gmail forwarding setup."
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
          `https://email-syncing-backend.vercel.app/mailhook/validateTest/${user._id}`
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
          toast.success("Forwarding verified successfully!");
          return;
        }

        if (attempts < maxAttempts && !stopped) {
          console.log("⏳ Not received yet — checking again in 10s...");
          timeoutId = setTimeout(checkValidation, 10000);
        } else if (!stopped) {
          console.log("❌ Validation failed after 5 attempts.");
          stopped = true;
          clearTimeout(timeoutId);
          setValidating(false);
          setValidationPhase(false);
          setValidationFailed(true);
          setShowValidateButton(true);
          toast.error(
            "Access Denied. Please check your forwarding setup or enter your email manually."
          );
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

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#F9FAFB]">
      <div className="flex-1 flex flex-col items-center justify-center py-10 px-6">
        <div className="flex items-center space-x-2 mb-3">
          <FiMail className="text-[#4F46E5] text-2xl" />
          <span className="font-semibold text-lg text-[#111827]">
            Zenith Inbox
          </span>
        </div>

        <div className="w-72 sm:w-[28rem] h-[6px] bg-[#E0E7FF] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#4F46E5] rounded-full transition-all duration-500"
            style={{ width: progressWidth }}
          ></div>
        </div>
        <div className="w-full flex justify-center mt-10">
          {step === 1 && (
            <div className="bg-white shadow-md rounded-xl p-8 sm:p-10 max-w-lg w-[90%] text-center relative">
              <span
                onClick={async () => {
                  await saveSetupProgress({ skipped: true, stepCompleted: 1 });
                  navigate("/organization");
                }}
                className="absolute bottom-4 left-4 text-[#4F46E5] text-xs sm:text-sm font-semibold cursor-pointer hover:underline hover:text-[#3730A3] transition-colors"
              >
                Skip
              </span>

              <h1 className="text-2xl sm:text-3xl font-bold text-[#111827] mb-4 mt-4">
                Never miss a lead again.
              </h1>

              <p className="text-[#4B5563] text-base mb-8 leading-relaxed">
                We’ll create your mailhook and help you forward new leads to it.
                Then we’ll set up how your replies are sent (SMTP).
              </p>

              <div className="flex items-center justify-center mt-6">
                <button
                  onClick={async () => {
                    await saveSetupProgress({
                      stepCompleted: 1,
                      stepStatus: "completed",
                    });
                    setStep(2);
                  }}
                  className="bg-[#4F46E5] hover:bg-[#4338CA] text-white px-8 py-3 rounded-lg text-sm font-semibold flex items-center justify-center space-x-2 shadow-md transition"
                >
                  <span>Start 60-sec Setup</span>
                  <FiArrowRight />
                </button>
              </div>

              <p className="text-xs text-gray-400 mt-6">
                You can complete setup later from your Organization Settings.
              </p>
            </div>
          )}

          {step === 2 && (
            <div className="bg-white shadow-md rounded-xl p-8 sm:p-10 max-w-2xl w-[90%] text-left relative">
              <span
                onClick={async () => {
                  await updateStep(1, { skipped: true });
                }}
                className="absolute left-4 top-4 text-[#4F46E5] text-xs sm:text-sm font-semibold cursor-pointer hover:underline hover:text-[#3730A3] transition-colors"
              >
                ← Back
              </span>

              <span
                onClick={() =>
                  window.open("/pages/mailhook/instruction", "_blank")
                }
                className="absolute right-4 top-4 text-[#4F46E5] text-xs sm:text-sm font-semibold cursor-pointer hover:underline hover:text-[#3730A3] transition-colors"
              >
                Need help?
              </span>

              <h2 className="text-2xl font-bold text-[#111827] text-center mb-2 mt-8">
                Your Mailhook is Ready
              </h2>
              <p className="text-[#4B5563] text-center mb-8">
                This is a private, unique address just for your leads.
              </p>

              <div className="border border-[#E5E7EB] rounded-xl p-6 space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-[#111827]">
                      Your Unique Mailhook
                    </h3>
                    <span className="text-green-700 bg-green-100 text-xs px-3 py-1 rounded-full">
                      Private & Unique
                    </span>
                  </div>

                  <div className="bg-[#F3F4F6] text-[#4F46E5] px-4 py-3 rounded-lg flex justify-between items-center font-mono text-sm">
                    {user?.mailhook || "loading-mailhook@zenith-inbox.com"}
                    <FiCopy
                      className="text-gray-500 cursor-pointer"
                      onClick={() => {
                        if (user?.mailhook) {
                          navigator.clipboard.writeText(user.mailhook);
                          toast.success("Mailhook copied!");
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="bg-indigo-50 border-l-4 border-indigo-500 rounded p-3 text-indigo-800 text-sm mt-4 flex items-start gap-2">
                  <FiInfo className="text-[#4F46E5] text-lg mt-0.5" />
                  <p>
                    <strong>Tip:</strong> Copy this address and add it as a
                    forwarding destination in your email provider’s settings
                    (Gmail or Outlook).
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center mt-8">
                <span
                  onClick={async () => {
                    await updateStep(3, { skipped: true });
                  }}
                  className="text-[#4F46E5] text-sm font-semibold cursor-pointer hover:underline"
                >
                  Skip
                </span>

                <button
                  onClick={async () => {
                    await saveSetupProgress({
                      stepCompleted: 2,
                      stepStatus: "completed",
                    });
                    setStep(3);
                  }}
                  className="flex items-center space-x-2 px-6 py-2 rounded-lg text-sm font-semibold bg-[#4F46E5] text-white hover:bg-[#4338CA] transition"
                >
                  <span>Next</span>
                  <FiArrowRight />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="bg-white shadow-md rounded-xl p-8 sm:p-10 max-w-2xl w-[90%] text-left relative">
              <span
                onClick={() =>
                  window.open("/pages/mailhook/instruction", "_blank")
                }
                className="absolute right-4 top-4 text-[#4F46E5] text-xs sm:text-sm font-semibold cursor-pointer hover:underline hover:text-[#3730A3] transition-colors"
              >
                Need help?
              </span>
              <h2 className="text-2xl font-bold text-[#111827] text-center mb-2">
                Set up Forwarding
              </h2>
              <p className="text-[#4B5563] text-center mb-8">
                Automatically send your leads to Zenith Inbox.
              </p>

              <div className="bg-[#F3F4F6] text-[#4F46E5] px-4 py-3 rounded-lg flex justify-between items-center font-mono text-sm mb-6">
                Forward emails to: <span>{user?.mailhook || "loading..."}</span>
                <FiCopy
                  className="text-gray-500 cursor-pointer hover:text-[#4F46E5] transition"
                  onClick={() => {
                    if (user?.mailhook) {
                      navigator.clipboard.writeText(user.mailhook);
                      toast.success(" Mailhook copied to clipboard!");
                    }
                  }}
                />
              </div>

              <div className="relative border border-[#E5E7EB] rounded-2xl shadow-sm p-6 w-full max-w-md mx-auto text-center">
                {!validationPhase && !validated && showValidateButton && (
                  <button
                    onClick={handleRetryValidation}
                    className="absolute top-4 right-4 flex items-center gap-1 text-xs font-semibold text-[#4F46E5] hover:text-[#3730A3] transition-colors"
                  >
                    <FiRefreshCcw className="text-sm" />
                    Retry
                  </button>
                )}
                <h3 className="text-lg font-semibold text-[#111827] mb-4">
                  Email Receiving
                </h3>
                <div className="bg-[#F9FAFB] border border-gray-200 rounded-lg p-4 text-left text-sm text-gray-700 mb-6 shadow-inner">
                  {validationFailed ? (
                    <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 text-center">
                      <p className="font-semibold mb-2">
                        Your mailhook forwarding may not be set up correctly.
                      </p>
                      <p className="text-sm mb-3">
                        Please read instructions again and check your Email
                        forwarding settings.
                      </p>
                      {/* <p
                        onClick={() => setShowHelpModal(true)}
                        className="text-[#4F46E5] text-sm font-semibold cursor-pointer hover:underline"
                      >
                        Need help setting up Email forwarding? Click here to
                        view instructions.
                      </p> */}
                    </div>
                  ) : validationPhase ? (
                    showValidateButton ? (
                      <div className="text-center py-6 text-gray-500 text-sm">
                        <p>No email received after several checks.</p>
                        <p>Please enter your email below to continue.</p>
                      </div>
                    ) : (
                      <MailhookWaitingTimer message="Waiting for validation email..." />
                    )
                  ) : validated ? (
                    <div className="text-center py-6">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <FiCheck className="text-green-600 text-3xl" />
                        <h4 className="text-lg font-semibold text-green-700">
                          Mailhook connected successfully!
                        </h4>
                        <p className="text-sm text-gray-600">
                          Your Gmail forwarding setup is verified.
                        </p>
                      </div>
                    </div>
                  ) : verificationEmail && verificationEmail.sender ? (
                    <>
                      <p className="mb-2">
                        <strong>From:</strong>{" "}
                        <span className="text-[#4F46E5]">
                          {verificationEmail.sender}
                        </span>
                      </p>
                      <p className="mb-2">
                        <strong>Subject:</strong>{" "}
                        <span className="font-medium">
                          {verificationEmail.subject}
                        </span>
                      </p>
                      <p className="mb-2 text-gray-600">
                        <strong>Date:</strong>{" "}
                        {new Date(verificationEmail.date).toLocaleString()}
                      </p>

                      <div
                        className="border-t border-gray-200 mt-3 pt-3 max-h-48 overflow-y-auto text-sm leading-relaxed text-gray-700"
                        dangerouslySetInnerHTML={{
                          __html:
                            verificationEmail.formattedBody ||
                            verificationEmail.textBody,
                        }}
                      />

                      {verificationEmail.isGmailVerification && (
                        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-lg p-4 mt-4 text-center text-sm">
                          <p className="font-semibold mb-1">
                            Gmail forwarding confirmation detected!
                          </p>
                          <p>
                            Please open Gmail and click the verification link in
                            your inbox to approve forwarding.
                          </p>
                        </div>
                      )}
                    </>
                  ) : showValidateButton ? (
                    <div className="text-center text-sm text-gray-600">
                      <p>No email received.</p>
                      <p className="text-xs text-gray-500">
                        Please enter your email address below to validate
                        manually.
                      </p>
                    </div>
                  ) : (
                    <MailhookWaitingTimer />
                  )}
                </div>
                {/* {!validationPhase && !validated && showValidateButton && (
                  <button
                    onClick={handleRetryValidation}
                    className="mt-4 flex items-center justify-center mx-auto space-x-2 px-5 py-2 border border-[#4F46E5] text-[#4F46E5] rounded-lg text-sm font-semibold hover:bg-[#EEF2FF] transition"
                  >
                    <FiRefreshCcw className="text-[#4F46E5]" />
                    <span>Retry Checking</span>
                  </button>
                )} */}
                {!validationPhase &&
                  !validated &&
                  (showValidateButton ||
                    verificationEmail?.isGmailVerification) && (
                    //                   {!validationPhase &&
                    // !validated &&
                    // verificationEmail?.isGmailVerification && (

                    <div className="space-y-3 mt-6">
                      <p className="text-sm text-gray-600">
                        Enter the email address where you’ve set up forwarding
                        to verify your setup.
                      </p>
                      <input
                        type="email"
                        placeholder="Enter your email address"
                        className="border border-gray-300 rounded-lg px-3 py-2 w-full text-sm focus:ring-2 focus:ring-[#4F46E5] outline-none"
                        value={verificationEmail?.toEmail || ""}
                        onChange={(e) =>
                          setVerificationEmail({
                            ...verificationEmail,
                            toEmail: e.target.value,
                          })
                        }
                      />
                    </div>
                  )}
              </div>

              <div className="mt-10 border-t border-gray-200 pt-6 flex justify-between items-center">
                <span
                  onClick={() => setStep(2)}
                  className="text-[#4F46E5] text-sm font-semibold cursor-pointer hover:underline"
                >
                  Back
                </span>
                {!validated ? (
                  <button
                    disabled={
                      validating ||
                      !verificationEmail ||
                      !verificationEmail?.toEmail?.trim()
                    }
                    onClick={async () => {
                      setValidating(true);
                      setValidationFailed(false);
                      setShowValidateButton(false);
                      setValidationPhase(true);
                      await handleValidateForwarding();
                      startValidationLoop();
                    }}
                    className={`flex items-center space-x-2 px-6 py-2 rounded-lg text-sm font-semibold text-white transition ${
                      validating
                        ? "bg-gray-400 cursor-not-allowed"
                        : verificationEmail?.toEmail?.trim()
                        ? "bg-[#4F46E5] hover:bg-[#4338CA]"
                        : "bg-gray-300 cursor-not-allowed"
                    }`}
                  >
                    {validating ? "Validating..." : "Validate Forwarding"}
                    <FiArrowRight />
                  </button>
                ) : (
                  <button
                    onClick={async () => {
                      await saveSetupProgress({
                        stepCompleted: 3,
                        stepStatus: "completed",
                      });
                      setStep(4);
                    }}
                    className="flex items-center space-x-2 px-6 py-2 rounded-lg text-sm font-semibold bg-green-600 text-white hover:bg-green-700 transition"
                  >
                    <span>Next</span> <FiArrowRight />
                  </button>
                )}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="bg-white shadow-md rounded-xl p-8 sm:p-10 max-w-2xl w-[90%] text-left mx-auto">
              <h2 className="text-2xl font-bold text-[#111827] text-center mb-2">
                Set up Sending (SMTP)
              </h2>
              <p className="text-[#4B5563] text-center mb-8">
                Configure how Zenith Inbox will send replies from your own email
                address.
              </p>

              <div className="flex border border-gray-300 rounded-lg overflow-hidden mb-6 w-full sm:w-[26rem] mx-auto">
                {["Gmail", "Microsoft", "Other"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setSelectedTab(tab)}
                    className={`w-1/3 px-4 py-2 text-sm font-medium text-center transition-colors ${
                      selectedTab === tab
                        ? "border-b-2 border-[#4F46E5] text-[#4F46E5] bg-[#EEF2FF]"
                        : "text-gray-500 hover:text-[#4F46E5] bg-white"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {selectedTab === "Gmail" && (
                <div className="border border-[#E5E7EB] rounded-lg p-8 text-center space-y-4">
                  <p className="text-[#4B5563]">
                    Connect your Gmail account securely using OAuth 2.0.
                  </p>
                  <button
                    onClick={handleGmailConnect}
                    className="bg-[#EA4335] hover:bg-[#C33D2D] text-white px-6 py-3 rounded-lg text-sm font-semibold shadow-md"
                  >
                    Connect with Gmail
                  </button>
                </div>
              )}

              {selectedTab === "Microsoft" && (
                <div className="border border-[#E5E7EB] rounded-lg p-8 text-center space-y-4">
                  <p className="text-[#4B5563]">
                    Connect your Outlook or Microsoft 365 account securely using
                    OAuth 2.0.
                  </p>
                  <button
                    onClick={handleMicrosoftConnect}
                    className="bg-[#0078D4] hover:bg-[#0063B1] text-white px-6 py-3 rounded-lg text-sm font-semibold shadow-md flex items-center justify-center gap-2 mx-auto"
                  >
                    <FaMicrosoft className="text-lg" />
                    Connect with Outlook
                  </button>
                </div>
              )}

              {selectedTab === "Other" && (
                <div className="border border-[#E5E7EB] rounded-lg p-6 space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#111827] mb-1">
                        Connection Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={smtpForm.name}
                        onChange={handleSmtpChange}
                        className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-[#4F46E5] outline-none"
                        placeholder="My SMTP Connection"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#111827] mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={smtpForm.email}
                        onChange={handleSmtpChange}
                        className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-[#4F46E5] outline-none"
                        placeholder="yourname@outlook.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#111827] mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={smtpForm.fullName}
                      onChange={handleSmtpChange}
                      className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-[#4F46E5] outline-none"
                      placeholder="Your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#111827] mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={smtpForm.username}
                      onChange={handleSmtpChange}
                      className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-[#4F46E5] outline-none"
                      placeholder="Usually same as email"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#111827] mb-1">
                      Password / App Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={smtpForm.password}
                        onChange={handleSmtpChange}
                        className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-[#4F46E5] outline-none pr-10"
                        placeholder="Enter password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      If MFA is enabled, use an Outlook App Password.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#111827] mb-1">
                        SMTP Host
                      </label>
                      <input
                        type="text"
                        name="host"
                        value={smtpForm.host}
                        onChange={handleSmtpChange}
                        className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-[#4F46E5] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#111827] mb-1">
                        Port
                      </label>
                      <input
                        type="number"
                        name="port"
                        value={smtpForm.port}
                        onChange={handleSmtpChange}
                        className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-[#4F46E5] outline-none"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleSmtpSave}
                    className="w-full bg-[#4F46E5] hover:bg-[#4338CA] text-white py-2 rounded-md text-sm font-semibold transition"
                  >
                    Save Connection
                  </button>
                </div>
              )}

              <div className="flex justify-between mt-8">
                <span
                  onClick={async () => {
                    await saveSetupProgress({
                      stepCompleted: 4,
                      stepStatus: "skipped",
                      skipped: true,
                    });
                    setStep(5);
                  }}
                  className="text-[#4F46E5] text-sm font-semibold cursor-pointer hover:underline"
                >
                  <span>Skip</span>
                </span>

                <button
                  onClick={async () => {
                    await saveSetupProgress({
                      stepCompleted: 4,
                      stepStatus: "completed",
                    });
                    setStep(5);
                  }}
                  className="flex items-center space-x-2 px-6 py-2 rounded-lg text-sm font-semibold bg-[#4F46E5] text-white hover:bg-[#4338CA]"
                >
                  <span>Next</span> <FiArrowRight />
                </button>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="bg-white shadow-md rounded-xl p-8 sm:p-10 max-w-2xl w-[90%] text-left mx-auto">
              <h2 className="text-2xl font-bold text-[#111827] text-center mb-2">
                Review &amp; Go Live
              </h2>
              <p className="text-[#4B5563] text-center mb-8">
                Confirm your setup and enable automation.
              </p>

              <div className="border border-[#E5E7EB] rounded-lg p-6 space-y-4 mb-8">
                <div>
                  <h3 className="font-semibold text-[#111827] mb-1">
                    Setup Checklist
                  </h3>
                  <p className="text-sm text-[#6B7280]">
                    Here’s a summary of your setup progress:
                  </p>
                </div>

                {!setupProgress ? (
                  <p className="text-gray-500 text-center py-6">
                    Loading progress...
                  </p>
                ) : (
                  <ul className="space-y-3 text-sm text-[#111827]">
                    {setupProgress.steps?.map((step) => (
                      <li
                        key={step.step}
                        className="flex items-center justify-between border-b border-gray-100 pb-2"
                      >
                        <div className="flex items-center space-x-2">
                          {step.status === "completed" ? (
                            <FiCheckCircle className="text-green-600 text-lg" />
                          ) : (
                            <FiAlertTriangle className="text-yellow-500 text-lg" />
                          )}

                          <span>{step.title}</span>
                        </div>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            step.status === "completed"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {step.status === "completed"
                            ? "Completed"
                            : "Skipped"}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="bg-[#F3F4F6] p-4 rounded-lg mt-4 text-sm text-[#4B5563] space-y-1">
                  <p>
                    Your Mailhook:{" "}
                    <span className="text-[#4F46E5] font-mono">
                      {user?.mailhook || "loading..."}
                    </span>
                  </p>
                  {/* <p>
                Automation Mode:{" "}
                {setupProgress?.completed
                  ? "Enabled"
                  : setupProgress?.skipped
                  ? "Skipped"
                  : "Pending"}
              </p> */}
                </div>
              </div>

              <div className="flex justify-between mt-8">
                <button onClick={() => updateStep(step + 1)}></button>

                <button
                  onClick={async () => {
                    await saveSetupProgress({
                      setupCompleted: true,
                      stepCompleted: 5,
                    });
                    navigate("/organization");
                  }}
                  className="flex items-center space-x-2 px-6 py-3 rounded-lg text-sm font-semibold bg-[#4F46E5] text-white hover:bg-[#4338CA] shadow-md"
                >
                  <span>Start building scenarios...</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <InstructionPanel step={step} />
    </div>
  );
};

export default SetupFlow;

const InstructionPanel = ({ step }) => {
  const [activeTab, setActiveTab] = useState("gmail");
  const { user, loading } = useContext(UserContext);

  return (
    <div className="hidden lg:flex flex-col justify-start bg-gradient-to-b from-white to-[#F9FAFB] shadow-xl border-l border-gray-200 w-[450px] p-7 overflow-y-auto max-h-screen transition-all duration-300 ease-in-out">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-[#EEF2FF] rounded-lg">
          <FiInfo className="text-[#4F46E5] text-xl" />
        </div>
        <h3 className="text-xl font-bold text-[#111827]">Setup Coach</h3>
      </div>
      <p className="text-sm text-gray-500 mb-6">
        Follow these quick instructions carefully — each step will guide you
        toward completing your setup successfully.
      </p>

      <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
        {step === 1 && (
          <>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg font-semibold text-[#111827] flex items-center gap-2">
                <FiMail className="text-[#4F46E5]" /> Step 1: Get Started
              </h4>
              <span className="text-xs bg-[#E0E7FF] text-[#3730A3] px-2.5 py-0.5 rounded-full font-medium">
                1 / 5
              </span>
            </div>

            <p className="text-gray-600 text-sm leading-relaxed mb-3">
              Welcome! You’re about to set up your <strong>Zenith Inbox</strong>
              . This process takes less than a minute.
            </p>

            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 mb-4">
              <li>We’ll create your private mailhook.</li>
              <li>Then connect your email forwarding.</li>
              <li>Finally, configure how your replies are sent.</li>
            </ul>

            <div className="bg-indigo-50 border-l-4 border-indigo-500 rounded p-3 text-indigo-800 text-sm">
              <strong>Tip:</strong> Click{" "}
              <span className="font-semibold text-indigo-700">
                “Start 60-sec Setup”
              </span>{" "}
              to begin the process.
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-[#111827] flex items-center gap-2">
                <FiCopy className="text-[#4F46E5]" /> Step 2 – Connect Your
                Email
              </h4>
              <span className="text-xs bg-[#E0E7FF] text-[#3730A3] px-2.5 py-0.5 rounded-full font-medium">
                2 / 5
              </span>
            </div>

            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              Choose your email provider below and follow the steps to forward
              your emails to your unique <strong>Mailhook address</strong>.
            </p>

            <div className="bg-gray-100 rounded-lg p-1 flex space-x-1 mb-5">
              <button
                onClick={() => setActiveTab("gmail")}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                  activeTab === "gmail"
                    ? "bg-white text-indigo-700 shadow-md"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <FiMail className="text-indigo-600" /> Gmail
                </div>
              </button>

              <button
                onClick={() => setActiveTab("outlook")}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                  activeTab === "outlook"
                    ? "bg-white text-indigo-700 shadow-md"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <FiSend className="text-indigo-600" /> Outlook
                </div>
              </button>

              <button
                onClick={() => setActiveTab("smtp")}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                  activeTab === "smtp"
                    ? "bg-white text-indigo-700 shadow-md"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <FiServer className="text-indigo-600" /> SMTP
                </div>
              </button>
            </div>

            {activeTab === "gmail" && (
              <div className="text-sm text-gray-700 leading-relaxed space-y-4 animate-fadeIn">
                <div className="flex items-start gap-3">
                  <FiSettings className="text-[#4F46E5] text-lg mt-0.5" />
                  <p>
                    Open <strong>Gmail Settings</strong> → click the gear icon →{" "}
                    <strong>“See all settings”</strong>.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <FiFolder className="text-[#4F46E5] text-lg mt-0.5" />
                  <p>
                    Go to the <strong>Forwarding and POP/IMAP</strong> tab.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <FiPlusCircle className="text-[#4F46E5] text-lg mt-0.5" />
                  <p>
                    Click <strong>“Add a forwarding address”</strong>.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <FiMail className="text-[#4F46E5] text-lg mt-0.5" />
                  <p>
                    Enter your Mailhook address:
                    <code className="block bg-gray-50 border border-indigo-200 text-indigo-700 px-3 py-2 rounded-lg text-xs font-mono mt-1 break-all select-all">
                      {user?.mailhook || "your-mailhook@zenith-inbox.com"}
                    </code>
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <FiCheckCircle className="text-green-600 text-lg mt-0.5" />
                  <p>
                    Gmail will send a <strong>confirmation email</strong> to
                    this Mailhook address.
                  </p>
                </div>

                <div className="mt-5 p-3 bg-indigo-50 border-l-4 border-indigo-500 rounded text-indigo-800 text-xs flex items-center gap-2">
                  <FiArrowRightCircle className="text-[#4F46E5]" />
                  <p>
                    Click <strong>Next</strong> below to proceed and verify your
                    forwarding setup.
                  </p>
                </div>
              </div>
            )}

            {activeTab === "outlook" && (
              <div className="text-sm text-gray-700 leading-relaxed space-y-4 animate-fadeIn">
                <div className="flex items-start gap-3">
                  <FiSettings className="text-[#4F46E5] text-lg mt-0.5" />
                  <p>
                    Open <strong>Outlook Settings</strong> → click{" "}
                    <strong>“View all Outlook settings”</strong>.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <FiSend className="text-[#4F46E5] text-lg mt-0.5" />
                  <p>
                    Navigate to <strong>Mail → Forwarding</strong>.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <FiToggleRight className="text-[#4F46E5] text-lg mt-0.5" />
                  <p>
                    Enable <strong>Start forwarding</strong>.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <FiMail className="text-[#4F46E5] text-lg mt-0.5" />
                  <p>
                    Enter your Mailhook address:
                    <code className="block bg-gray-50 border border-indigo-200 text-indigo-700 px-3 py-2 rounded-lg text-xs font-mono mt-1 break-all select-all">
                      {user?.mailhook || "your-mailhook@zenith-inbox.com"}
                    </code>
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <FiSave className="text-green-600 text-lg mt-0.5" />
                  <p>
                    Click <strong>Save</strong> to apply your changes.
                  </p>
                </div>

                <div className="mt-5 p-3 bg-blue-50 border-l-4 border-blue-400 rounded text-blue-800 text-xs flex items-center gap-2">
                  <FiArrowRightCircle className="text-[#4F46E5]" />
                  <p>
                    Click <strong>Next</strong> below to verify your Outlook
                    forwarding connection.
                  </p>
                </div>
              </div>
            )}

            {activeTab === "smtp" && (
              <div className="text-sm text-gray-700 leading-relaxed space-y-4 animate-fadeIn">
                <div className="flex items-start gap-3">
                  <FiServer className="text-[#4F46E5] text-lg mt-0.5" />
                  <p>
                    Open your email provider or hosting control panel’s{" "}
                    <strong>SMTP / Email Settings</strong>.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <FiKey className="text-[#4F46E5] text-lg mt-0.5" />
                  <p>
                    Enter your <strong>username</strong> and{" "}
                    <strong>app password</strong> (if 2FA is enabled).
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <FiGlobe className="text-[#4F46E5] text-lg mt-0.5" />
                  <p>
                    Use your SMTP Host and Port settings (e.g.,{" "}
                    <code className="bg-gray-100 text-indigo-700 rounded px-1 py-0.5 text-xs">
                      smtp.yourdomain.com
                    </code>{" "}
                    , Port{" "}
                    <code className="bg-gray-100 text-indigo-700 rounded px-1 py-0.5 text-xs">
                      587
                    </code>
                    ).
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <FiLock className="text-green-600 text-lg mt-0.5" />
                  <p>
                    Enable <strong>STARTTLS</strong> or <strong>SSL</strong> for
                    secure connections.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <FiCheckCircle className="text-green-600 text-lg mt-0.5" />
                  <p>
                    Test your configuration to confirm successful SMTP
                    connection.
                  </p>
                </div>

                <div className="mt-5 p-3 bg-indigo-50 border-l-4 border-indigo-500 rounded text-indigo-800 text-xs flex items-center gap-2">
                  <FiArrowRightCircle className="text-[#4F46E5]" />
                  <p>
                    After entering your SMTP credentials in the app, click{" "}
                    <strong>Next</strong> to continue setup.
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        {step === 3 && (
          <>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg font-semibold text-[#111827] flex items-center gap-2">
                <FiAlertCircle className="text-[#4F46E5]" /> Step 3 – Verify
                Forwarding
              </h4>
              <span className="text-xs bg-[#E0E7FF] text-[#3730A3] px-2.5 py-0.5 rounded-full font-medium">
                3 / 5
              </span>
            </div>

            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              Great job — your Mailhook is now connected! Let’s verify that
              Gmail is forwarding messages correctly to your Mailhook address.
            </p>

            <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
              <div className="flex items-start gap-3">
                <FiMail className="text-[#4F46E5] text-lg mt-0.5" />
                <p>
                  Go back to your <strong>Gmail Settings</strong> → open the{" "}
                  <strong>Forwarding and POP/IMAP</strong> tab again.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <FiRefreshCcw className="text-[#4F46E5] text-lg mt-0.5" />
                <p>
                  Refresh that page — you’ll now see your{" "}
                  <strong>Mailhook address</strong> in the forwarding dropdown.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <FiToggleRight className="text-[#4F46E5] text-lg mt-0.5" />
                <p>
                  Select your Mailhook under{" "}
                  <strong>“Forward a copy of incoming mail to”</strong> and
                  choose what happens to the original email (e.g., “Keep Gmail’s
                  copy in Inbox”).
                </p>
              </div>

              <div className="flex items-start gap-3">
                <FiSave className="text-green-600 text-lg mt-0.5" />
                <p>
                  Scroll down and click <strong>Save Changes</strong> to enable
                  forwarding.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <FiMail className="text-[#4F46E5] text-lg mt-0.5" />
                <p>
                  Now return to this screen. Zenith Inbox will automatically
                  check for Gmail’s confirmation email.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <FiSearch className="text-[#4F46E5] text-lg mt-0.5" />
                <p>
                  If the confirmation email hasn’t appeared yet, click{" "}
                  <strong>Retry Checking</strong> below. Once it arrives, you’ll
                  see the Gmail verification message appear here.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <FiCheckCircle className="text-green-600 text-lg mt-0.5" />
                <p>
                  Open that email, click the <strong>verification link</strong>,
                  and your Gmail forwarding will be fully active. Then click{" "}
                  <strong>Validate Forwarding</strong> to complete the process.
                </p>
              </div>
            </div>

            <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 rounded p-3 text-yellow-700 text-sm flex items-start gap-2">
              <FiInfo className="text-yellow-600 text-lg mt-0.5" />
              <p>
                <strong>Note:</strong> If you don’t see the confirmation email
                after a few minutes, double-check that forwarding is enabled and
                that your Mailhook address is selected in Gmail.
              </p>
            </div>

            <div className="mt-4 bg-indigo-50 border-l-4 border-indigo-500 rounded p-3 text-indigo-800 text-xs flex items-start gap-2">
              <FaRegLightbulb className="text-[#4F46E5] text-lg mt-0.5" />
              <p>
                <strong>Pro Tip:</strong> Keep Gmail open in another tab while
                verifying — the process completes faster and ensures you don’t
                miss the prompt.
              </p>
            </div>

            <div className="mt-6 border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
              <h5 className="text-sm font-semibold text-[#111827] mb-2 flex items-center gap-2">
                <FiUser className="text-[#4F46E5]" /> Add Your Email for
                Verification
              </h5>
              <p className="text-xs text-gray-600 mb-3">
                Enter the email address where you enabled forwarding. We’ll use
                it to confirm your Mailhook connection and validate your setup.
              </p>

              <div className="mt-3 text-xs text-gray-500 flex items-center gap-2">
                <FiArrowRight className="text-[#4F46E5]" />
                <p>
                  Once your email is validated successfully, click{" "}
                  <strong>Next</strong> below to continue to SMTP setup.
                </p>
              </div>
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-[#111827] flex items-center gap-2">
                <FiSend className="text-[#4F46E5]" /> Step 4 – Set Up SMTP
                Sending
              </h4>
              <span className="text-xs bg-[#E0E7FF] text-[#3730A3] px-2.5 py-0.5 rounded-full font-medium">
                4 / 5
              </span>
            </div>

            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              Choose how <strong>Zenith Inbox</strong> will send emails on your
              behalf.
            </p>

            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex items-start gap-3">
                <FiMail className="text-[#4F46E5] text-lg mt-0.5" />
                <p>
                  Select your sending method — <strong>Gmail</strong>,{" "}
                  <strong>Microsoft</strong>, or <strong>Custom SMTP</strong>.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <FiKey className="text-[#4F46E5] text-lg mt-0.5" />
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

            <div className="mt-5 bg-indigo-50 border-l-4 border-indigo-500 rounded p-3 text-indigo-800 text-sm flex items-center gap-2">
              <FiInfo className="text-[#4F46E5]" />
              <p>
                <strong>Tip:</strong> Use your business domain email instead of
                Gmail to improve trust and avoid spam filters.
              </p>
            </div>
          </>
        )}

        {step === 5 && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-[#111827] flex items-center gap-2">
                <FiCheckCircle className="text-green-600" /> Step 5 – Review &
                Go Live
              </h4>
              <span className="text-xs bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full font-medium">
                5 / 5
              </span>
            </div>

            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              You’re almost done! Review your setup before activating your
              automation.
            </p>

            {user?.setup?.steps ? (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-5 shadow-inner">
                <h5 className="font-semibold text-[#111827] mb-2 flex items-center gap-2">
                  <FiBarChart2 className="text-[#4F46E5]" /> Setup Progress
                  Summary
                </h5>
                <ul className="space-y-2 text-sm">
                  {user.setup.steps.map((s) => (
                    <li
                      key={s._id}
                      className="flex items-center justify-between border-b border-gray-100 pb-1"
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
                            (s) => s.status === "completed"
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
                Loading setup progress...
              </p>
            )}

            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex items-start gap-3">
                <FiEye className="text-[#4F46E5] text-lg mt-0.5" />
                <p>
                  Review all your setup steps and confirm they’re completed.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <FiMail className="text-[#4F46E5] text-lg mt-0.5" />
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

            <div className="mt-5 bg-green-50 border-l-4 border-green-400 rounded p-3 text-green-800 text-sm flex items-start gap-2">
              <FiSmile className="text-green-600 text-lg mt-0.5" />
              <p>
                <strong>Success Tip:</strong> You’re all set! Once activated,
                all leads will automatically flow into{" "}
                <strong>Zenith Inbox</strong>.
              </p>
            </div>
          </>
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

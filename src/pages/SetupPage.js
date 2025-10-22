import React, { useContext, useEffect, useState } from "react";
import {
  FiMail,
  FiArrowRight,
  FiArrowLeft,
  FiCopy,
  FiCheck,
  FiEyeOff,
  FiEye,
} from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";
import { UserContext } from "../component/UserContext";
import { FaMicrosoft } from "react-icons/fa";

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

  const toggleService = (service) => {
    setSelectedServices((prev) =>
      prev.includes(service)
        ? prev.filter((s) => s !== service)
        : [...prev, service]
    );
  };

  const handleGmailConnect = () => {
    const userId = user?._id;

    const popup = window.open(
      `http://localhost:5000/auth/google?userId=${userId}`,
      "gmailConnect",
      "width=600,height=600"
    );

    const checkPopup = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkPopup);
        // When popup closes, check the URL query for success
        const params = new URLSearchParams(window.location.search);
        const status = params.get("status");
        if (status === "success") {
          console.log("✅ Gmail connected successfully!");
          setStep(5);
        } else if (status === "error") {
          alert("❌ Failed to connect Gmail. Please try again.");
        }
      }
    }, 1000);
  };

  const handleMicrosoftConnect = () => {
    const userId = user?._id;
    const popup = window.open(
      `http://localhost:5000/auth/microsoft?userId=${userId}`,
      "microsoftConnect",
      "width=600,height=600"
    );

    const handleMessage = (event) => {
      if (event.data?.type === "microsoft-auth-success") {
        console.log(" Microsoft account connected successfully!");
        setStep(5);
        window.removeEventListener("message", handleMessage);
        popup.close();
      }
    };

    window.addEventListener("message", handleMessage);
  };


  const saveSetupProgress = async (data = {}) => {
    try {
      const res = await fetch(`http://localhost:5000/auth/setup/${user._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (result.success) {
        console.log("✅ Setup progress updated:", result.data);
      } else {
        console.error("❌ Failed to update setup progress:", result.message);
      }
    } catch (err) {
      console.error("Error saving setup progress:", err);
    }
  };

  const updateStep = async (nextStep, extra = {}) => {
    setStep(nextStep);
    await saveSetupProgress({
      stepCompleted: nextStep,
      ...extra,
    });
  };

  const [showValidateButton, setShowValidateButton] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validated, setValidated] = useState(false);

  useEffect(() => {
    if (step === 3) {
      setValidated(false);
      setValidating(false);
      const timer = setTimeout(() => setShowValidateButton(true), 10000);
      return () => clearTimeout(timer);
    } else {
      setShowValidateButton(false);
    }
  }, [step]);
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

      const res = await fetch("http://localhost:5000/auth/saveSmtpConnection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save SMTP connection");
      alert("✅ SMTP connection saved successfully!");
      setStep(5); // Move to next step
    } catch (err) {
      console.error(err);
      alert("❌ Failed to save SMTP connection");
    }
  };

  const [verificationEmail, setVerificationEmail] = useState(null);

  useEffect(() => {
    if (step === 3 && user?._id) {
      const fetchVerification = async () => {
        try {
          const res = await fetch(
            `http://localhost:5000/mailhook/verification/${user._id}`
          );
          const data = await res.json();
          if (data.success) {
            setVerificationEmail(data.data);
          } else {
            setVerificationEmail(null);
          }
        } catch (err) {
          console.error("Error fetching verification email:", err);
        }
      };

      fetchVerification();
      const interval = setInterval(fetchVerification, 15000);
      return () => clearInterval(interval);
    }
  }, [step, user]);
  const fetchValidateEmail = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/mailhook/validateTest/${user._id}`
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
      setValidating(true);

      const res = await fetch(
        `http://localhost:5000/mailhook/validate-forwarding/${user._id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ toEmail: user?.mailhook }),
        }
      );

      const data = await res.json();

      if (data.success) {
        console.log(
          " Test email sent successfully. Checking for validation..."
        );

        setTimeout(async () => {
          await fetchValidateEmail();
          setValidating(false);
        }, 8000);
      } else {
        alert(" Failed to send validation email");
        setValidating(false);
      }
    } catch (err) {
      console.error("Error validating forwarding:", err);
      setValidating(false);
    }
  };
  useEffect(() => {
    if (!loading && user) {
      if (user?.setup?.completed || user?.setup?.skipped) {
        navigate("/organization");
      }
    }
  }, [user, loading, navigate]);
  const [setupProgress, setSetupProgress] = useState(null);

  useEffect(() => {
    const fetchSetupProgress = async () => {
      try {
        if (!user?._id) return;
        const res = await fetch(`http://localhost:5000/auth/setup/${user._id}`);
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F9FAFB] text-center">
      <div className="flex flex-col items-center mb-10">
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
      </div>

      {step === 1 && (
        <div className="bg-white shadow-md rounded-xl p-8 sm:p-10 max-w-lg w-[90%]">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#111827] mb-4">
            Never miss a lead again.
          </h1>

          <p className="text-[#4B5563] text-base mb-8 leading-relaxed">
            We’ll create your mailhook and help you forward new leads to it.
            Then we’ll set up how your replies are sent (SMTP).
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => setStep(2)}
              className="bg-[#4F46E5] hover:bg-[#4338CA] text-white px-8 py-3 rounded-lg text-sm font-semibold flex items-center justify-center space-x-2 shadow-md"
            >
              <span>Start 60-sec Setup</span>
              <FiArrowRight />
            </button>

            <button
              onClick={async () => {
                await saveSetupProgress({ skipped: true, stepCompleted: step });
                navigate("/organization");
              }}
              className="border border-gray-300 text-[#4B5563] hover:bg-gray-50 px-8 py-3 rounded-lg text-sm font-semibold flex items-center justify-center space-x-2"
            >
              <span>Skip Setup</span>
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="bg-white shadow-md rounded-xl p-8 sm:p-10 max-w-2xl w-[90%] text-left">
          <h2 className="text-2xl font-bold text-[#111827] text-center mb-2">
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
                    }
                  }}
                />
              </div>
            </div>

            <div className="mt-6">
              <h4 className="text-lg font-semibold text-[#111827] mb-2">
                Instructions:
              </h4>
              <p className="text-[#4B5563] text-sm leading-relaxed mb-4">
                You can forward your business emails to this mailhook.{" "}
                <span className="font-semibold text-[#111827]">
                  Click “Need help?” below
                </span>{" "}
                to see detailed instructions on how to properly set up email
                forwarding.
              </p>

              <p className="text-[#4F46E5] text-sm font-semibold cursor-pointer hover:underline">
                Need help?
              </p>
            </div>
          </div>

          <div className="flex justify-between mt-8">
            <button onClick={() => setStep(1)}></button>

            <button
              onClick={() => updateStep(3)}
              className="flex items-center space-x-2 px-6 py-2 rounded-lg text-sm font-semibold bg-[#4F46E5] text-white hover:bg-[#4338CA]"
            >
              <span>Next</span> <FiArrowRight />
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="bg-white shadow-md rounded-xl p-8 sm:p-10 max-w-2xl w-[90%] text-left">
          <h2 className="text-2xl font-bold text-[#111827] text-center mb-2">
            Set up Forwarding
          </h2>
          <p className="text-[#4B5563] text-center mb-8">
            Automatically send your leads to Zenith Inbox.
          </p>

          <div className="bg-[#F3F4F6] text-[#4F46E5] px-4 py-3 rounded-lg flex justify-between items-center font-mono text-sm mb-6">
            Forward emails to: <span>{user?.mailhook || "loading..."}</span>
            <FiCopy
              className="text-gray-500 cursor-pointer"
              onClick={() => {
                if (user?.mailhook)
                  navigator.clipboard.writeText(user.mailhook);
              }}
            />
          </div>

          <div className="border border-[#E5E7EB] rounded-lg p-6 bg-white text-center space-y-4">
            {!validated ? (
              <>
                {!validating ? (
                  <>
                    {!verificationEmail ? (
                      <>
                        <div className="w-8 h-8 border-4 border-[#E5E7EB] border-t-[#4F46E5] rounded-full animate-spin mx-auto"></div>
                        <p className="text-[#111827] font-medium text-sm">
                          Fetching Gmail verification link...
                        </p>
                        <p className="text-sm text-[#6B7280]">
                          Waiting for the Gmail verification email to arrive...
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm p-6 w-full max-w-md mx-auto space-y-4 text-center transition-all duration-300">
                          <div className="flex items-center justify-center space-x-2">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="w-6 h-6 text-[#4F46E5]"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 8l9 6 9-6m-9 6V4"
                              />
                            </svg>
                            <h2 className="text-lg font-semibold text-[#111827]">
                              Gmail Verification Email
                            </h2>
                          </div>

                          <div className="bg-[#F9FAFB] rounded-xl p-4 text-left space-y-2">
                            <p className="text-sm text-[#374151]">
                              <strong>From:</strong>{" "}
                              <span className="text-[#4F46E5]">
                                {verificationEmail.sender}
                              </span>
                            </p>
                            <p className="text-sm text-[#374151]">
                              <strong>Subject:</strong>{" "}
                              <span className="font-medium">
                                {verificationEmail.subject}
                              </span>
                            </p>
                            <p className="text-sm text-[#6B7280]">
                              <strong>Date:</strong>{" "}
                              {new Date(
                                verificationEmail.date
                              ).toLocaleString()}
                            </p>
                          </div>

                          {verificationEmail.verificationUrl ? (
                            <a
                              href={verificationEmail.verificationUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block w-full bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold py-2 rounded-lg transition-colors"
                            >
                              Verify Forwarding
                            </a>
                          ) : (
                            <p className="text-[#EF4444] text-sm font-medium">
                              Waiting for Gmail verification email... please
                              check again in a few seconds.
                            </p>
                          )}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <div className="w-8 h-8 border-4 border-[#E5E7EB] border-t-[#4F46E5] rounded-full animate-spin mx-auto"></div>
                    <p className="text-[#111827] font-medium text-sm">
                      Waiting for you to verify forwarding...
                    </p>
                  </>
                )}
              </>
            ) : (
              <>
                <div className="border border-blue-400 rounded-md p-3 text-sm text-[#111827] bg-blue-50 w-full text-center">
                  Congratulations — your mailhook is verified successfully!
                </div>
                <div className="bg-green-50 text-green-700 text-sm px-4 py-2 rounded-md w-full text-center border border-green-200">
                  ✓ Verification Complete ✓
                </div>
              </>
            )}
          </div>

          <div className="flex justify-between mt-8">
            <button onClick={() => setStep(2)}></button>

            {validated ? (
              <button
                onClick={() => updateStep(4)}
                className="flex items-center space-x-2 px-6 py-2 rounded-lg text-sm font-semibold bg-[#4F46E5] text-white hover:bg-[#4338CA]"
              >
                <span>Next</span> <FiArrowRight />
              </button>
            ) : verificationEmail ? (
              <button
                onClick={handleValidateForwarding}
                className="flex items-center space-x-2 px-6 py-2 rounded-lg text-sm font-semibold bg-green-600 text-white hover:bg-green-700"
              >
                <FiCheck />
                <span>Validate Forwarding</span>
              </button>
            ) : (
              <button
                disabled
                className="flex items-center space-x-2 px-6 py-2 rounded-lg text-sm font-semibold bg-gray-300 text-white cursor-not-allowed"
              >
                <span>Waiting...</span>
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
                // onClick={handleMicrosoftConnect}
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
            <button
              onClick={async () => {
                const nextStep = step + 1;
                await updateStep(nextStep, { skipped: true });
              }}
              className="flex items-center space-x-2 px-5 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
            >
              <span>Skip</span>
            </button>

            <button
              onClick={() => updateStep(5)}
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
                        <span className="text-green-600">✓</span>
                      ) : (
                        <span className="text-yellow-500">❌</span>
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
                      {step.status === "completed" ? "Completed" : "Skipped"}
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
              <p>
                Automation Mode:{" "}
                {setupProgress?.completed
                  ? "Enabled"
                  : setupProgress?.skipped
                  ? "Skipped"
                  : "Pending"}
              </p>
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
  );
};

export default SetupFlow;

import { apiFetch } from "../utils/apiClient";
import React, { useState, useEffect } from "react";
import {
  FiMail,
  FiCopy,
  FiInfo,
  FiArrowRight,
  FiCheck,
  FiX,
  FiRefreshCcw,
  FiAlertCircle,
  FiClock,
  FiCheckCircle,
} from "react-icons/fi";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import axios from "axios";
import { X, Check } from "lucide-react";
import useModalDismiss from "../hooks/useModalDismiss";

const MailhookWaitingTimer = ({ message }) => {
  const [seconds, setSeconds] = useState(10);
  const [alertMode, setAlertMode] = useState(false);

  useEffect(() => {
    const tick = setInterval(() => {
      setSeconds((s) => (s <= 1 ? 10 : s - 1));
    }, 1000);

    const toggle = setInterval(() => {
      setAlertMode((p) => !p);
    }, 10000);

    return () => {
      clearInterval(tick);
      clearInterval(toggle);
    };
  }, []);

  const progress = ((10 - seconds) / 10) * 100;

  return (
    <div className="text-center space-y-3 transition-all duration-300">
      <div className="flex justify-center items-center gap-2 text-slate-700">
        {alertMode ? (
          <FiAlertCircle className="text-red-500 text-lg animate-pulse" />
        ) : (
          <FiMail className="text-slate-900 text-lg animate-pulse" />
        )}
        <p className="text-xs text-slate-600 transition-all duration-500 font-medium">
          {alertMode ? (
            <span className="flex items-center justify-center gap-2 text-red-600 font-bold">
              No email received on mailhook.
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2 text-slate-800 font-bold">
              {message || "Waiting for forwarded email..."}
            </span>
          )}
        </p>
      </div>

      <p className="text-[11px] text-slate-500 font-normal">
        {alertMode
          ? "Make sure you’ve forwarded emails to the correct mailhook address."
          : "Keep this tab open while we check your mailhook."}
      </p>

      <div className="h-2 bg-slate-200 rounded-full overflow-hidden mt-2">
        <div
          className={`h-full transition-all duration-1000 ${
            alertMode ? "bg-red-500" : "bg-[#111110]"
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 font-semibold mt-1">
        <FiClock />
        <span>Checking again in {seconds}s…</span>
      </div>
    </div>
  );
};

const MailhookConnectionModal = ({
  isOpen,
  onClose,
  user,
  startAtStep3 = false,
  cardId,
  onMailhookUpdated,
}) => {
  const [step, setStep] = useState(1);
  const [validating, setValidating] = useState(false);
  const [validationFailed, setValidationFailed] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState(null);
  const [retryKey, setRetryKey] = useState(0);
  const [retrying, setRetrying] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });

  const [latestMailhookEmails, setLatestMailhookEmails] = useState([]);
  const [autoOpenedEmailId, setAutoOpenedEmailId] = useState(null);

  // States for Step 2 Forwarding Setup
  const [forwardingEnabled, setForwardingEnabled] = useState(false);
  const [provider, setProvider] = useState(null);

  // States for explicit step navigation
  const [verificationFound, setVerificationFound] = useState(false);
  const [validationSuccess, setValidationSuccess] = useState(false);

  /*
   * The card this run is setting up, and the address to forward to.
   * Both are seeded from props but re-taken from the create response:
   * an account that predates mailhook addresses has one generated
   * server-side at that moment, so `user.mailhook` here would still be
   * empty and step 2 would show a placeholder instead of a real address.
   */
  const [activeCardId, setActiveCardId] = useState(cardId || null);
  const [mailhookAddress, setMailhookAddress] = useState(user?.mailhook || "");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (alert.message) {
      const timer = setTimeout(() => setAlert({ type: "", message: "" }), 4000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  useEffect(() => {
    if (isOpen) {
      setStep(startAtStep3 ? 3 : 1);

      setValidating(false);
      setValidationFailed(false);
      setVerificationEmail(null);
      setRetryKey(0);
      setRetrying(false);
      setAlert({ type: "", message: "" });

      setLatestMailhookEmails([]);
      setAutoOpenedEmailId(null);

      setForwardingEnabled(false);
      setProvider(null);

      setVerificationFound(false);
      setValidationSuccess(false);

      setActiveCardId(cardId || null);
      setMailhookAddress(user?.mailhook || "");
      setCreating(false);
    }
  }, [isOpen, startAtStep3, cardId, user?.mailhook]);

  const fetchMailhookEmails = async ({ autoOpen = false } = {}) => {
    if (!user?._id) return;

    try {
      const res = await apiFetch(
        `https://email-syncing-backend.vercel.app/mailhook/verification/${user._id}`
      );
      const data = await res.json();

      if (data.success && data.data) {
        const emails = Array.isArray(data.data) ? data.data : [data.data];
        const latestEmail = emails[0];

        setLatestMailhookEmails(emails);

        if (latestEmail && latestEmail._id !== autoOpenedEmailId && autoOpen) {
          setAutoOpenedEmailId(latestEmail._id);
          setVerificationEmail(latestEmail);
          setVerificationFound(true);
          setAlert({
            type: "success",
            message: "Verification email detected automatically!",
          });
        }
      }
    } catch (err) {
      console.error("Error fetching mailhook emails:", err);
    }
  };

  useEffect(() => {
    let interval;
    if (isOpen && step === 3 && !verificationFound) {
      fetchMailhookEmails({ autoOpen: true });
      interval = setInterval(() => {
        fetchMailhookEmails({ autoOpen: true });
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isOpen, step, verificationFound, retryKey]);

  const handleValidateForwarding = async () => {
    if (!user?._id) {
      toast.error("User not found");
      return;
    }

    const forwardingEmail = (verificationEmail?.toEmail || "").trim();

    /*
     * The connections page lists the card by this address, and the backend
     * needs it to know which mailbox forwards in. Submitting the empty
     * input stored an empty address and produced a nameless connection.
     */
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forwardingEmail)) {
      toast.error("Enter the email address that forwards into your mailhook.");
      return;
    }

    try {
      setValidating(true);
      setValidationFailed(false);

      const res = await axios.post(
        "https://email-syncing-backend.vercel.app/mailhookcard/validate",
        {
          userId: user._id,
          forwardingEmail,
          cardId: activeCardId || undefined,
        }
      );

      if (res.data.success) {
        setValidationSuccess(true);
        setValidationFailed(false);

        toast.success("Forwarding verified successfully!");
        onMailhookUpdated?.();

        setAlert({
          type: "success",
          message: "Forwarding address verified successfully!",
        });
      } else {
        setValidationSuccess(false);
        setValidationFailed(true);
        toast.error(res.data.message || "Forwarding validation failed");
        setAlert({
          type: "error",
          message: res.data.message || "Forwarding validation failed",
        });
      }
    } catch (err) {
      console.error("Validation error:", err);
      setValidationSuccess(false);
      setValidationFailed(true);
      toast.error("Server error while validating forwarding email");
    } finally {
      setValidating(false);
    }
  };

  /*
   * This modal used to close on ANY outside click, throwing away a
   * half-finished multi-step setup. Past step 1 the mailhook card has been
   * created and the user is mid-flow, so dismissal is refused.
   */
  const dismiss = useModalDismiss({
    onClose,
    isDirty: step > 1 && !validationSuccess,
    dirtyMessage:
      "Mailhook setup is in progress — use the X or Cancel to leave it.",
  });

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
      {...dismiss.backdropProps}
    >
      <div
        className="bg-white rounded-[12px] shadow-2xl w-full max-w-[540px] border border-slate-200 overflow-hidden flex flex-col relative transform animate-slideUp"
        {...dismiss.panelProps}
      >
        {/* Dark Theme Top Header Bar */}
        <div className="flex items-center justify-between bg-[#111110] text-white px-6 py-4 shrink-0">
          <div className="flex items-center gap-3">
            {/* Same Logo as App Header / Sidebar */}
            <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-700/80 flex items-center justify-center text-white shadow-2xs">
              <FiMail className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Replex Engine
              </h2>
              <p className="text-xs text-slate-300 mt-0.5 font-normal">
                Mailhook Setup Guide
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition p-1 rounded-full cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Subheader Step Indicator */}
        <div className="flex items-center justify-between bg-slate-50 border-b border-slate-200 px-6 py-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-800">
              Your Mailhook Connection
            </span>
          </div>

          <div className="px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 text-slate-800 bg-white border border-slate-300 shadow-2xs">
            <FiCheckCircle className="text-emerald-600" />
            <span>Step {step} of 4</span>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 w-full p-6 flex flex-col justify-center relative min-h-[340px]">
          <AnimatePresence mode="wait">
            {alert.message && (
              <motion.div
                key={alert.message}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className={`absolute top-2 left-6 right-6 z-20 px-3.5 py-2 rounded-[8px] text-xs font-bold text-center shadow-xs border ${
                  alert.type === "success"
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : "bg-red-50 text-red-800 border-red-200"
                }`}
              >
                {alert.message}
              </motion.div>
            )}
          </AnimatePresence>

          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="w-full flex flex-col items-center text-center bg-slate-50/80 border border-slate-200/90 p-6 rounded-[12px] shadow-2xs"
            >
              <h2 className="text-lg font-bold text-slate-900 mb-2">
                Your Mailhook Connection
              </h2>
              <p className="text-slate-600 text-xs mb-6 leading-relaxed max-w-sm mx-auto font-normal">
                We’ll create your mailhook and help you forward new leads to it. This ensures you never miss an incoming email.
              </p>

              <div className="flex items-center justify-center gap-3 w-full">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-[8px] border border-slate-300 bg-white text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={creating}
                  onClick={async () => {
                    if (creating) return;

                    try {
                      setCreating(true);

                      const res = await axios.post(
                        "https://email-syncing-backend.vercel.app/mailhookcard/create",
                        {
                          userId: user._id,
                          forwardingEmail: "",
                        }
                      );
                      if (res.data.success) {
                        setActiveCardId(res.data.data?._id || null);
                        setMailhookAddress(
                          res.data.mailhook ||
                            res.data.data?.mailhook ||
                            user?.mailhook ||
                            ""
                        );
                        onMailhookUpdated?.();
                        toast.success("Mailhook connection initialized!");
                        setStep(2);
                      } else {
                        toast.error(
                          res.data.message ||
                            "Failed to initialize mailhook connection"
                        );
                      }
                    } catch (err) {
                      console.error("Error creating mailhook:", err);
                      toast.error("Server error while creating mailhook connection");
                    } finally {
                      setCreating(false);
                    }
                  }}
                  className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-[8px] text-xs font-bold text-white shadow-xs transition ${
                    creating
                      ? "bg-slate-400 cursor-wait"
                      : "bg-[#111110] hover:bg-black cursor-pointer"
                  }`}
                >
                  <span>{creating ? "Setting up..." : "Next Step"}</span>
                  <FiArrowRight />
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="w-full flex flex-col items-center text-center bg-slate-50/80 border border-slate-200/90 p-6 rounded-[12px] shadow-2xs"
            >
              <h2 className="text-lg font-bold text-slate-900 mb-1.5">
                Set Up Forwarding
              </h2>
              <p className="text-slate-600 text-xs mb-4 leading-relaxed max-w-sm mx-auto font-normal">
                Set this address as your forwarding destination. Once active, we'll verify it.
              </p>

              <div className="w-full max-w-sm rounded-[10px] p-3 mb-4 bg-white border border-slate-200 shadow-2xs">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-slate-800 text-xs">Forward To:</h3>
                  <span className="text-emerald-800 bg-emerald-100/70 border border-emerald-200 text-[10px] px-2 py-0.5 rounded-full font-bold">
                    Private & Unique
                  </span>
                </div>

                <div className="bg-slate-50 text-slate-900 px-3 py-2 rounded-[8px] flex justify-between items-center font-mono text-xs border border-slate-200">
                  <span className="truncate mr-2 font-medium">
                    {mailhookAddress || "Preparing your mailhook address..."}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (mailhookAddress) {
                        navigator.clipboard.writeText(mailhookAddress);
                        setAlert({ type: "success", message: "Mailhook copied successfully!" });
                      }
                    }}
                    className="shrink-0 text-slate-600 hover:text-slate-900 transition p-1.5 bg-white hover:bg-slate-100 rounded-[6px] border border-slate-200 cursor-pointer"
                  >
                    <FiCopy className="text-xs" />
                  </button>
                </div>
              </div>

              {/* Validation Checklist */}
              <div className="w-full max-w-sm bg-white rounded-[10px] p-4 border border-slate-200 shadow-2xs text-left mb-5">
                <h3 className="text-xs font-bold text-slate-900 mb-2.5">Checklist to continue</h3>

                <div className="space-y-2.5 text-xs text-slate-700 font-medium">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-slate-900 rounded border-slate-300 focus:ring-0 transition cursor-pointer"
                      checked={forwardingEnabled}
                      onChange={(e) => setForwardingEnabled(e.target.checked)}
                    />
                    <span className="group-hover:text-slate-900 transition-colors">I have enabled <strong>email forwarding</strong></span>
                  </label>

                  <label className={`flex items-center gap-2 ${forwardingEnabled ? "cursor-pointer group" : "cursor-not-allowed opacity-50"}`}>
                    <input
                      type="radio"
                      name="provider"
                      className="h-4 w-4 text-slate-900 border-slate-300 focus:ring-0 transition cursor-pointer"
                      disabled={!forwardingEnabled}
                      checked={provider === "gmail"}
                      onChange={() => setProvider("gmail")}
                    />
                    <span className={forwardingEnabled ? "group-hover:text-slate-900 transition-colors" : ""}>Setup using <strong>Gmail / Google</strong></span>
                  </label>

                  <label className={`flex items-center gap-2 ${forwardingEnabled ? "cursor-pointer group" : "cursor-not-allowed opacity-50"}`}>
                    <input
                      type="radio"
                      name="provider"
                      className="h-4 w-4 text-slate-900 border-slate-300 focus:ring-0 transition cursor-pointer"
                      disabled={!forwardingEnabled}
                      checked={provider === "other"}
                      onChange={() => setProvider("other")}
                    />
                    <span className={forwardingEnabled ? "group-hover:text-slate-900 transition-colors" : ""}>Setup using <strong>Other Provider</strong></span>
                  </label>
                </div>
              </div>

              <button
                type="button"
                disabled={!forwardingEnabled || !provider}
                onClick={() => setStep(3)}
                className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-[8px] text-xs font-bold transition w-full max-w-sm cursor-pointer ${
                  !forwardingEnabled || !provider
                    ? "bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed"
                    : "bg-[#111110] text-white hover:bg-black shadow-xs"
                }`}
              >
                <span>Continue</span>
                <FiArrowRight />
              </button>
            </motion.div>
          )}

          {(step === 3 || step === 4 || step === 5) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="w-full flex flex-col items-center bg-slate-50/80 border border-slate-200/90 p-6 rounded-[12px] shadow-2xs"
            >
              <h2 className="text-lg font-bold text-slate-900 mb-1">
                Forwarding Verification
              </h2>
              <p className="text-slate-600 text-xs mb-4 font-normal">
                Checking your mailhook for the forwarding verification email.
              </p>

              <div className="w-full max-w-sm bg-white border border-slate-200 rounded-[10px] p-5 shadow-2xs flex flex-col justify-center min-h-[160px]">
                {step === 4 ? (
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center w-full"
                  >
                    <div className="bg-emerald-50 text-emerald-800 p-4 rounded-[10px] flex flex-col items-center gap-2 shadow-2xs border border-emerald-200/80 w-full">
                      <div className="bg-emerald-100 p-2 rounded-full mb-1">
                        <FiCheck className="text-emerald-700 text-2xl" />
                      </div>
                      <h4 className="font-bold text-emerald-900 text-sm">
                        Verified successfully!
                      </h4>
                      <p className="text-xs text-emerald-700 mb-3 font-medium">
                        Your Mailhook connection is ready to go.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setValidationSuccess(false);
                          setVerificationFound(false);
                          setVerificationEmail(null);
                          setForwardingEnabled(false);
                          setProvider(null);
                          setStep(1);
                          onClose();
                        }}
                        className="w-full bg-[#111110] hover:bg-black text-white py-2.5 rounded-[8px] font-bold text-xs shadow-xs transition cursor-pointer"
                      >
                        Complete Connection
                      </button>
                    </div>
                  </motion.div>
                ) : step === 3 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-left w-full flex flex-col items-center"
                  >
                    {verificationEmail?.sender && (
                      <div className="w-full border border-slate-200 rounded-[8px] bg-slate-50 p-3 mb-4 text-xs shadow-2xs">
                        <div className="flex items-center justify-between mb-2">
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
                            New Email
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium">
                            {verificationEmail?.date
                              ? new Date(verificationEmail.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                              : ""}
                          </span>
                        </div>

                        <p className="mb-1 truncate text-slate-800">
                          <span className="font-bold text-slate-600">From:</span> {verificationEmail.sender}
                        </p>
                        <p className="mb-2 truncate text-slate-800">
                          <span className="font-bold text-slate-600">Subject:</span> {verificationEmail.subject}
                        </p>

                        <div
                          className="border-t border-slate-200 pt-2 text-slate-700 text-[11px] leading-relaxed max-h-[140px] overflow-y-auto overflow-x-hidden pr-2 break-words"
                          dangerouslySetInnerHTML={{
                            __html: verificationEmail.formattedBody || verificationEmail.textBody || "",
                          }}
                        />
                      </div>
                    )}

                    {!validationSuccess ? (
                      <div className="w-full">
                        <label className="block text-xs font-bold mb-1.5 text-slate-800">
                          Confirm forwarding email:
                        </label>
                        <input
                          type="email"
                          className="border border-slate-300 rounded-[8px] px-3 py-2 w-full text-xs mb-3 focus:border-slate-800 outline-none bg-white font-medium transition"
                          placeholder="your@email.com"
                          value={verificationEmail?.toEmail || ""}
                          onChange={(e) =>
                            setVerificationEmail({
                              ...(verificationEmail || {}),
                              toEmail: e.target.value,
                            })
                          }
                        />

                        <button
                          type="button"
                          disabled={validating}
                          onClick={handleValidateForwarding}
                          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-[8px] text-xs font-bold text-white transition cursor-pointer shadow-xs ${
                            validating
                              ? "bg-slate-400 cursor-wait"
                              : "bg-[#111110] hover:bg-black"
                          }`}
                        >
                          {validating ? "Checking forwarded email..." : "Validate Forwarding"}
                          {!validating && <FiCheckCircle />}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            window.open("mailto:support@replexengine.com?subject=Mailhook forwarding help", "_blank");
                          }}
                          className="mt-2 w-full flex items-center justify-center gap-2 py-2 rounded-[8px] text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 transition cursor-pointer"
                        >
                          <FiInfo className="text-sm" />
                          Need help?
                        </button>
                      </div>
                    ) : (
                      <div className="w-full text-center">
                        <div className="text-emerald-800 mb-4 text-xs font-bold bg-emerald-50 py-2 px-3 rounded-[8px] border border-emerald-200 shadow-2xs">
                          Forwarding verified successfully!
                        </div>
                        <button
                          type="button"
                          onClick={() => setStep(4)}
                          className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-[8px] text-xs font-bold text-white bg-[#111110] hover:bg-black shadow-xs transition mx-auto w-full cursor-pointer"
                        >
                          <span>Next Step</span>
                          <FiArrowRight />
                        </button>
                      </div>
                    )}
                  </motion.div>
                ) : validationFailed ? (
                  <div className="bg-red-50 text-red-800 border border-red-200 p-3 rounded-[8px] text-center shadow-2xs w-full">
                    <p className="font-bold text-xs mb-1">Validation failed</p>
                    <p className="text-[11px] text-red-700">
                      Please check your forwarding setup in your email provider.
                    </p>
                  </div>
                ) : null}

                {validationFailed && (
                  <div className="flex justify-center mt-4">
                    <button
                      type="button"
                      disabled={retrying}
                      onClick={() => {
                        setRetrying(true);
                        setRetryKey((prev) => prev + 1);
                        setValidationFailed(false);
                      }}
                      className="flex items-center gap-2 px-4 py-2 text-xs font-bold border border-slate-300 text-slate-800 bg-white rounded-[8px] hover:bg-slate-100 transition cursor-pointer shadow-2xs"
                    >
                      <FiRefreshCcw className={`${retrying ? "animate-spin text-slate-900" : ""}`} />
                      {retrying ? "Checking..." : "Refresh Status"}
                    </button>
                  </div>
                )}
              </div>

              {step === 5 && (
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-4 w-full bg-[#111110] hover:bg-black text-white py-2.5 rounded-[8px] font-bold text-xs shadow-xs transition max-w-sm cursor-pointer"
                >
                  Complete Connection
                </button>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MailhookConnectionModal;

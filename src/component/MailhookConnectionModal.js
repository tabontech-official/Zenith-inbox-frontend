import React, { useState, useEffect } from "react";
import {
  FiMail,
  FiCopy,
  FiInfo,
  FiArrowRight,
  FiCheck,
  FiX,
  FiRefreshCcw,
} from "react-icons/fi";
import toast from "react-hot-toast";
import axios from "axios";

const MailhookWaitingTimer = ({ message }) => {
  const [seconds, setSeconds] = useState(10);
  const [alertMode, setAlertMode] = useState(false);

  useEffect(() => {
    const tick = setInterval(
      () => setSeconds((s) => (s <= 1 ? 10 : s - 1)),
      1000
    );
    const toggle = setInterval(() => setAlertMode((p) => !p), 10000);
    return () => {
      clearInterval(tick);
      clearInterval(toggle);
    };
  }, []);

  const progress = ((10 - seconds) / 10) * 100;
  return (
    <div className="text-center space-y-3">
      <div className="flex justify-center items-center gap-2 text-gray-700">
        {alertMode ? (
          <FiInfo className="text-red-500 animate-pulse" />
        ) : (
          <FiMail className="text-[#4F46E5] animate-pulse" />
        )}
        <p className="text-sm text-gray-700">
          {alertMode
            ? "No email received yet. Check your forwarding setup."
            : message || "Waiting for forwarded email..."}
        </p>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden mt-1">
        <div
          className={`h-full transition-all duration-1000 ${
            alertMode ? "bg-red-500" : "bg-[#4F46E5]"
          }`}
          style={{ width: `${progress}%` }}
        />
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
  const [validated, setValidated] = useState(false);
  const [validationPhase, setValidationPhase] = useState(false);
  const [validationFailed, setValidationFailed] = useState(false);
  const [showValidateButton, setShowValidateButton] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState(null);
  const [retryKey, setRetryKey] = useState(0);
  const [retrying, setRetrying] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });
  useEffect(() => {
    if (alert.message) {
      const timer = setTimeout(() => setAlert({ type: "", message: "" }), 4000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  const AlertMessage = () =>
    alert.message ? (
      <div
        className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium text-center ${
          alert.type === "success"
            ? "bg-green-50 text-green-700 border border-green-300"
            : "bg-red-50 text-red-700 border border-red-300"
        }`}
      >
        {alert.message}
      </div>
    ) : null;
  useEffect(() => {
    if (isOpen) {
      setStep(startAtStep3 ? 3 : 1);
    }
  }, [isOpen, startAtStep3]);

  useEffect(() => {
    if (step !== 3 || !user?._id) return;

    setValidated(false);
    setValidating(false);
    setShowValidateButton(false);
    setValidationPhase(true);
    setValidationFailed(false);
    setVerificationEmail(null);

    let attempts = 0;
    const maxAttempts = 5;
    const loaderMinDuration = 10000;
    const loaderStartTime = Date.now();

    const fetchVerification = async () => {
      attempts++;
      console.log(
        `🔍 Checking verification attempt ${attempts}/${maxAttempts}`
      );

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

          setTimeout(() => {
            setValidationPhase(false);
            setShowValidateButton(true);
            setRetrying(false);
          }, remaining);

          return;
        }

        if (attempts >= maxAttempts) {
          clearInterval(intervalId);
          setValidationPhase(false);
          setShowValidateButton(false);
          setValidationFailed(true);
          setRetrying(false);
        }
      } catch (err) {
        console.error("Error fetching verification email:", err);
        if (attempts >= maxAttempts) {
          clearInterval(intervalId);
          setValidationPhase(false);
          setValidationFailed(true);
          setRetrying(false);
        }
      }
    };

    const intervalId = setInterval(fetchVerification, 10000);
    fetchVerification();

    return () => clearInterval(intervalId);
  }, [step, user, retryKey]);

  const handleValidateForwarding = async () => {
    try {
      if (!verificationEmail?.toEmail?.trim()) {
        setAlert({
          type: "error",
          message: "Please enter your forwarding email first.",
        });
        return;
      }

      setValidating(true);
      setValidated(false);
      setValidationFailed(false);
      setValidationPhase(true);
      setShowValidateButton(false);

      const res = await fetch(
        `https://email-syncing-backend.vercel.app/mailhook/validate-forwarding/${user._id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ toEmail: verificationEmail.toEmail }),
        }
      );

      const data = await res.json();

      if (!data.success) {
        setAlert({
          type: "error",
          message: data.message || "Forwarding setup failed.",
        });
        setValidating(false);
        setValidationPhase(false);
        setShowValidateButton(true);
        return;
      }

      setAlert({
        type: "success",
        message: "Validation started — checking for forwarded email…",
      });

      let attempts = 0;
      const loop = async () => {
        attempts++;

        const res = await fetch(
          `https://email-syncing-backend.vercel.app/mailhook/validateTest/${user._id}?cardId=${cardId}`,
          { 
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );

        const json = await res.json();

        if (json.success) {
          await axios.post(
            "https://email-syncing-backend.vercel.app/mailhookcard/create",
            {
              userId: user._id,
              forwardingEmail: verificationEmail.toEmail,
            }
          );

          if (onMailhookUpdated) onMailhookUpdated();

          setAlert({
            type: "success",
            message: "Mailhook verified successfully!",
          });
          setValidated(true);
          setValidating(false);
          setValidationPhase(false);
          onClose();

          return;
        }

        if (attempts < 5) {
          setTimeout(loop, 10000);
        } else {
          setValidationPhase(false);
          setValidating(false);
          setValidationFailed(true);
          setShowValidateButton(true);

          setAlert({
            type: "error",
            message:
              "Your email forwarding is not set up properly. Please check your Gmail forwarding settings and try again.",
          });
        }
      };

      loop();
    } catch (err) {
      console.error(err);
      setAlert({
        type: "error",
        message: "Error during validation process.",
      });
      setValidating(false);
      setValidationPhase(false);
      setValidationFailed(true);
      setShowValidateButton(true);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-2xl w-[90%] sm:w-[520px] max-h-[90vh] overflow-y-auto relative p-6">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          <FiX className="text-xl" />
        </button>

        {step === 1 && (
          <div>
            <h2 className="text-2xl font-bold text-center mb-2">
              Your Mailhook
            </h2>
            <div className="bg-gray-100 p-3 rounded-lg flex justify-between items-center font-mono text-sm border">
              <span>{user?.mailhook || "loading..."}</span>
              <FiCopy
                onClick={() => {
                  navigator.clipboard.writeText(user?.mailhook || "");
                  toast.success("Mailhook copied!");
                }}
                className="cursor-pointer text-gray-600 hover:text-[#4F46E5]"
              />
            </div>
            <div className="mt-5 flex justify-between items-center">
              <button onClick={onClose} className="text-[#4F46E5] text-sm">
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    const res = await axios.post(
                      "https://email-syncing-backend.vercel.app/mailhookcard/create",
                      {
                        userId: user._id,
                        forwardingEmail: "",
                      }
                    );

                    if (res.data.success) {
                      toast.success("Mailhook connection initialized!");
                      setStep(3);
                    } else {
                      toast.error("Failed to initialize mailhook connection");
                    }
                  } catch (err) {
                    console.error("Error creating mailhook:", err);
                    toast.error(
                      "Server error while creating mailhook connection"
                    );
                  }
                }}
                className="flex items-center gap-2 bg-[#4F46E5] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#4338CA] transition"
              >
                <span>Next</span> <FiArrowRight />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <AlertMessage />
            <h2 className="text-xl font-bold text-center text-[#111827] mb-2">
              Forwarding Verification
            </h2>
            <p className="text-sm text-gray-600 text-center mb-4">
              Checking your mailhook for Gmail’s verification email.
            </p>

            <div className="border border-gray-200 rounded-lg p-5 mb-4">
              {validationPhase ? (
                <MailhookWaitingTimer message="Waiting for Gmail verification..." />
              ) : validated ? (
                <div className="text-center py-6">
                  <FiCheck className="text-green-600 text-3xl mx-auto mb-2" />
                  <h4 className="font-semibold text-green-700 text-lg">
                    Verified successfully!
                  </h4>
                  <p className="text-sm text-gray-600">
                    Your Gmail forwarding setup is verified.
                  </p>
                </div>
              ) : showValidateButton || verificationEmail ? (
                <>
                  {verificationEmail?.sender && (
                    <div className="border rounded-md bg-gray-50 p-3 mb-4 text-sm">
                      <p className="mb-1">
                        <strong>From:</strong> {verificationEmail.sender}
                      </p>
                      <p className="mb-1">
                        <strong>Subject:</strong> {verificationEmail.subject}
                      </p>
                      <p className="mb-2 text-xs text-gray-500">
                        {new Date(verificationEmail.date).toLocaleString()}
                      </p>
                      <div
                        className="border-t pt-2 text-gray-700 max-h-32 overflow-y-auto text-sm"
                        dangerouslySetInnerHTML={{
                          __html:
                            verificationEmail.formattedBody ||
                            verificationEmail.textBody,
                        }}
                      />
                    </div>
                  )}

                  <p className="text-sm mb-2 text-gray-600">
                    Enter your forwarding email to finalize verification:
                  </p>
                  <input
                    type="email"
                    className="border border-gray-300 rounded-lg px-3 py-2 w-full text-sm mb-3 focus:ring-2 focus:ring-[#4F46E5] outline-none"
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
                    onClick={handleValidateForwarding}
                    className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold text-white transition ${
                      validating
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-[#4F46E5] hover:bg-[#4338CA]"
                    }`}
                  >
                    {validating ? "Validating..." : "Validate Forwarding"}
                    {!validating && <FiArrowRight />}
                  </button>
                </>
              ) : validationFailed ? (
                <div className="bg-red-50 text-red-700 border p-3 rounded-md text-center">
                  Validation failed. Please check forwarding setup.
                </div>
              ) : null}

              {/* 🔁 Always show Retry Option */}
              <div className="flex justify-center mt-5">
                <button
                  disabled={retrying}
                  onClick={() => {
                    setRetrying(true);
                    setRetryKey((prev) => prev + 1);
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold border border-[#4F46E5] text-[#4F46E5] rounded-lg hover:bg-[#EEF2FF] transition"
                >
                  <FiRefreshCcw
                    className={`${
                      retrying ? "animate-spin text-[#4F46E5]" : ""
                    }`}
                  />
                  {retrying ? "Retrying..." : "Retry Checking"}
                </button>
              </div>
            </div>

            {validated && (
              <button
                onClick={onClose}
                className="mt-3 w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold text-sm"
              >
                Done
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MailhookConnectionModal;

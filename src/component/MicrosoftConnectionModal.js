
import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  FaChevronDown,
  FaEye,
  FaEyeSlash,
  FaKey,
  FaLock,
  FaMicrosoft,
  FaTimes,
  FaUser,
} from "react-icons/fa";
import { FiExternalLink, FiMail, FiShield } from "react-icons/fi";

/*
 * Defaults to the deployed backend, so production behaviour is unchanged.
 * Set REACT_APP_API_BASE_URL (e.g. http://localhost:5000) to point the
 * Microsoft connection flow at a local backend while testing.
 */
const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  "https://email-syncing-backend.vercel.app";

/*
 * NOTE: there are deliberately no SMTP/IMAP host or port fields in this
 * modal. Microsoft's mail endpoints (outlook.office365.com:993 and
 * smtp.office365.com:587) are identical for every customer and are held
 * server-side in config/providerConfigs.js — exactly like the Gmail flow.
 * Please don't "improve" this by adding editable host/port inputs; the
 * separate "Other Email" custom-SMTP modal exists for that case.
 */

const Field = ({ label, hint, children }) => (
  <div>
    <div className="mb-1.5 flex items-center justify-between gap-3">
      <label className="text-[13px] font-medium text-slate-800">{label}</label>
      {hint ? <span className="text-[11px] text-slate-400">{hint}</span> : null}
    </div>
    {children}
  </div>
);

const MicrosoftConnectionModal = ({
  isOpen,
  onClose,
  onSuccess,
  editMode = false,
  connectionData = null,
  onUpdated,
}) => {
  const [connectionName, setConnectionName] = useState("My Microsoft Connection");
  const [status, setStatus] = useState("active");
  const [email, setEmail] = useState("");
  const [appPassword, setAppPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (editMode && connectionData) {
      setConnectionName(connectionData.name || "My Microsoft Connection");
      setStatus(connectionData.status || "active");
      setEmail(connectionData.email || "");
      setAppPassword("");
      setShowPassword(false);
      setShowHelp(false);
      return;
    }

    setConnectionName("My Microsoft Connection");
    setStatus("active");
    setEmail("");
    setAppPassword("");
    setShowPassword(false);
    setShowHelp(false);
  }, [isOpen, editMode, connectionData]);

  /*
   * Microsoft app passwords are not a fixed 16 characters like Google's,
   * so the value is only stripped of whitespace — never truncated or
   * re-grouped.
   */
  const normalizeAppPassword = (value) => value.replace(/\s/g, "");

  const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const validateCreateForm = () => {
    if (!connectionName.trim()) {
      toast.error("Connection name is required.");
      return false;
    }

    if (!email.trim()) {
      toast.error("Email address is required.");
      return false;
    }

    if (!isValidEmail(email.trim())) {
      toast.error("Please enter a valid email address.");
      return false;
    }

    if (!normalizeAppPassword(appPassword)) {
      toast.error("Microsoft app password is required.");
      return false;
    }

    return true;
  };

  const handleCreateConnection = async () => {
    if (!validateCreateForm()) return;

    const userId = localStorage.getItem("userid");
    const token = localStorage.getItem("usertoken");
    if (!userId || !token) {
      toast.error("User not found. Please log in again.");
      return;
    }

    try {
      setSubmitting(true);

      const response = await axios.post(
        `${API_BASE_URL}/auth/microsoft/app-password`,
        {
          userId,
          name: connectionName.trim(),
          email: email.trim().toLowerCase(),
          appPassword: normalizeAppPassword(appPassword),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!response.data?.success) {
        toast.error(
          response.data?.message || "Unable to connect Microsoft account."
        );
        return;
      }

      toast.success(
        response.data?.message || "Microsoft account connected successfully!"
      );
      onSuccess?.({ ...response.data, triggerRefresh: true });
      onClose?.();
    } catch (error) {
      console.error("Microsoft App Password connection error:", error);

      /*
       * The backend returns a distinct `reason` per failure mode. Admin
       * policy failures need a longer-lived toast because they describe
       * an action the customer has to take with their IT admin.
       */
      const data = error.response?.data;
      const message =
        data?.message ||
        data?.error ||
        "Unable to connect. Check your email address and app password.";

      const needsAdminAction =
        data?.reason === "smtp_auth_disabled" ||
        data?.reason === "app_password_blocked";

      toast.error(message, { duration: needsAdminAction ? 12000 : 5000 });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateConnection = async () => {
    if (!connectionName.trim()) {
      toast.error("Connection name is required.");
      return;
    }

    if (!connectionData?._id) {
      toast.error("Connection ID is missing.");
      return;
    }

    const token = localStorage.getItem("usertoken");
    if (!token) {
      toast.error("User not found. Please log in again.");
      return;
    }

    try {
      setSubmitting(true);

      const response = await axios.put(
        `${API_BASE_URL}/auth/connection/${connectionData._id}`,
        { name: connectionName.trim(), status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!response.data?.success) {
        toast.error(response.data?.message || "Failed to update connection.");
        return;
      }

      toast.success("Microsoft connection updated successfully!");
      onUpdated?.();
      onClose?.();
    } catch (error) {
      console.error("Error updating Microsoft connection:", error);
      toast.error(
        error.response?.data?.error ||
          error.response?.data?.message ||
          "Failed to update connection."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (editMode) await handleUpdateConnection();
    else await handleCreateConnection();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-xs p-4">
      <div className="flex max-h-[88vh] w-full max-w-[460px] flex-col overflow-hidden rounded-[8px] bg-white border  ">
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          {/* Dark Theme Header */}
          <header className="flex items-center justify-between bg-[#111110] text-white px-6 py-4 shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10">
                <FaMicrosoft className="h-5 w-5 text-[#4da3ff]" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">
                  {editMode
                    ? "Edit Microsoft Connection"
                    : "Connect Microsoft Email"}
                </h2>
                <p className="text-xs text-slate-300 mt-0.5 font-normal">
                  {editMode
                    ? "Update the connection name or status"
                    : "Use a Microsoft App Password to connect securely"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              aria-label="Close modal"
              className="text-slate-400 hover:text-white transition p-1 rounded-full cursor-pointer"
            >
              <FaTimes className="h-5 w-5" />
            </button>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="space-y-4 p-6">
              {!editMode && (
                <div className="flex items-start gap-3 rounded-[8px] border border-emerald-200 bg-emerald-50/70 p-3">
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
                    <FiShield className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-emerald-900">
                      Your normal Microsoft password is not required.
                    </p>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-slate-600 font-normal">
                      Enter only the app password generated by Microsoft.
                    </p>
                  </div>
                </div>
              )}

              <Field label="Connection Name">
                <div className="relative">
                  <FaUser className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={connectionName}
                    onChange={(event) => setConnectionName(event.target.value)}
                    disabled={submitting}
                    placeholder="Work Outlook"
                    className="h-10 w-full rounded-[8px] border border-slate-300 bg-white pl-9 pr-3 text-xs font-medium text-slate-900 outline-none focus:border-slate-800 transition placeholder:text-slate-400 disabled:bg-slate-100"
                  />
                </div>
              </Field>

              <Field label="Email Address">
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    disabled={editMode || submitting}
                    placeholder="you@outlook.com"
                    autoComplete="email"
                    className="h-10 w-full rounded-[8px] border border-slate-300 bg-white pl-9 pr-3 text-xs font-medium text-slate-900 outline-none focus:border-slate-800 transition placeholder:text-slate-400 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
                  />
                </div>
              </Field>

              {!editMode && (
                <>
                  <Field label="App Password">
                    <div className="relative">
                      <FaKey className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={appPassword}
                        onChange={(event) => setAppPassword(event.target.value)}
                        disabled={submitting}
                        placeholder="Paste the app password from Microsoft"
                        autoComplete="new-password"
                        className="h-10 w-full rounded-[8px] border border-slate-300 bg-white pl-9 pr-10 text-xs font-medium tracking-[0.08em] text-slate-900 outline-none focus:border-slate-800 transition placeholder:text-slate-400 disabled:bg-slate-100"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((current) => !current)}
                        disabled={submitting}
                        aria-label={
                          showPassword ? "Hide app password" : "Show app password"
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                      >
                        {showPassword ? (
                          <FaEyeSlash className="h-4 w-4" />
                        ) : (
                          <FaEye className="h-4 w-4" />
                        )}
                      </button>
                    </div>

                    <div className="mt-2 flex items-center justify-between gap-3">
                      <span className="text-[11px] text-slate-500">
                        This is not your regular Microsoft password.
                      </span>
                      <a
                        href="https://mysignins.microsoft.com/security-info"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex shrink-0 items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800"
                      >
                        Generate password
                        <FiExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </Field>

                  <div className="overflow-hidden rounded-[8px] border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setShowHelp((current) => !current)}
                      className="flex w-full items-center justify-between gap-3 bg-slate-50/70 px-3.5 py-2.5 text-left hover:bg-slate-100 transition cursor-pointer"
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-800">
                          How to generate an App Password
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-500 font-normal">
                          View four quick steps
                        </p>
                      </div>
                      <FaChevronDown
                        className={`h-3.5 w-3.5 text-slate-400 transition-transform ${
                          showHelp ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {showHelp && (
                      <div className="space-y-2 border-t border-slate-200 bg-white px-3.5 py-3 text-[11px] leading-relaxed text-slate-600 font-normal">
                        <p>
                          <strong className="text-slate-800 font-bold">1.</strong>{" "}
                          Go to{" "}
                          <a
                            href="https://mysignins.microsoft.com/security-info"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-bold text-indigo-600 hover:text-indigo-800"
                          >
                            mysignins.microsoft.com/security-info
                          </a>
                          .
                        </p>
                        <p>
                          <strong className="text-slate-800 font-bold">2.</strong>{" "}
                          Select <strong className="font-bold">Add sign-in method</strong>.
                        </p>
                        <p>
                          <strong className="text-slate-800 font-bold">3.</strong>{" "}
                          Choose <strong className="font-bold">App password</strong> and
                          give it a name.
                        </p>
                        <p>
                          <strong className="text-slate-800 font-bold">4.</strong>{" "}
                          Copy the password immediately — Microsoft shows it only
                          once — then paste it above.
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}

              {editMode && (
                <Field label="Status">
                  <select
                    value={status}
                    onChange={(event) => setStatus(event.target.value)}
                    disabled={submitting}
                    className="h-10 w-full rounded-[8px] border border-slate-300 bg-white px-3 text-xs font-medium text-slate-900 outline-none focus:border-slate-800 transition disabled:bg-slate-100"
                  >
                    <option value="active">Active</option>
                    <option value="disconnected">Disconnected</option>
                  </select>
                </Field>
              )}
            </div>
          </div>

          <footer className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/50 px-6 py-4 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-5 py-2 rounded-[8px] border border-slate-300 bg-white text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center justify-center gap-2 rounded-[8px] bg-[#111110] hover:bg-black px-5 py-2 text-xs font-bold text-white transition cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FaLock className="h-3 w-3 text-emerald-400" />
              {editMode
                ? submitting
                  ? "Saving..."
                  : "Save Changes"
                : submitting
                ? "Connecting..."
                : "Connect Microsoft"}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default MicrosoftConnectionModal;

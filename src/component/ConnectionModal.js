
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  FaChevronDown,
  FaEye,
  FaEyeSlash,
  FaKey,
  FaLock,
  FaTimes,
  FaUser,
} from "react-icons/fa";
import { FiExternalLink, FiMail, FiShield } from "react-icons/fi";
import { SiGmail } from "react-icons/si";

const API_BASE_URL = "https://email-syncing-backend.vercel.app";

const Field = ({ label, hint, children }) => (
  <div>
    <div className="mb-1.5 flex items-center justify-between gap-3">
      <label className="text-[13px] font-medium text-slate-800">{label}</label>
      {hint ? <span className="text-[11px] text-slate-400">{hint}</span> : null}
    </div>
    {children}
  </div>
);

const ConnectionModal = ({
  isOpen,
  onClose,
  onSuccess,
  editMode = false,
  connectionData = null,
  onUpdated,
}) => {
  const [connectionName, setConnectionName] = useState("My Gmail Connection");
  const [status, setStatus] = useState("active");
  const [email, setEmail] = useState("");
  const [appPassword, setAppPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (editMode && connectionData) {
      setConnectionName(connectionData.name || "My Gmail Connection");
      setStatus(connectionData.status || "active");
      setEmail(connectionData.email || "");
      setAppPassword("");
      setShowPassword(false);
      setShowHelp(false);
      return;
    }

    setConnectionName("My Gmail Connection");
    setStatus("active");
    setEmail("");
    setAppPassword("");
    setShowPassword(false);
    setShowHelp(false);
  }, [isOpen, editMode, connectionData]);

  const normalizeAppPassword = (value) => value.replace(/\s/g, "");

  const formatAppPassword = (value) => {
    const cleaned = value
      .replace(/\s/g, "")
      .replace(/[^a-zA-Z0-9]/g, "")
      .slice(0, 16);

    return cleaned.match(/.{1,4}/g)?.join(" ") || "";
  };

  const passwordLength = useMemo(
    () => normalizeAppPassword(appPassword).length,
    [appPassword]
  );

  const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const validateCreateForm = () => {
    if (!connectionName.trim()) {
      toast.error("Connection name is required.");
      return false;
    }

    if (!email.trim()) {
      toast.error("Gmail address is required.");
      return false;
    }

    if (!isValidEmail(email.trim())) {
      toast.error("Please enter a valid email address.");
      return false;
    }

    if (passwordLength !== 16) {
      toast.error("Google App Password must contain 16 characters.");
      return false;
    }

    return true;
  };

  const handleCreateConnection = async () => {
    if (!validateCreateForm()) return;

    const userId = localStorage.getItem("userid");
    if (!userId) {
      toast.error("User not found. Please log in again.");
      return;
    }

    try {
      setSubmitting(true);

      const response = await axios.post(
        `${API_BASE_URL}/auth/gmail/app-password`,
        {
          userId,
          name: connectionName.trim(),
          email: email.trim().toLowerCase(),
          appPassword: normalizeAppPassword(appPassword),
        }
      );

      if (!response.data?.success) {
        toast.error(response.data?.message || "Unable to connect Gmail account.");
        return;
      }

      toast.success(response.data?.message || "Gmail connected successfully!");
      onSuccess?.({ ...response.data, triggerRefresh: true });
      onClose?.();
    } catch (error) {
      console.error("Gmail App Password connection error:", error);
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Unable to connect. Check your Gmail address and App Password."
      );
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

    try {
      setSubmitting(true);

      const response = await axios.put(
        `${API_BASE_URL}/auth/connection/${connectionData._id}`,
        { name: connectionName.trim(), status }
      );

      if (!response.data?.success) {
        toast.error(response.data?.message || "Failed to update connection.");
        return;
      }

      toast.success("Gmail connection updated successfully!");
      onUpdated?.();
      onClose?.();
    } catch (error) {
      console.error("Error updating Gmail connection:", error);
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
                <SiGmail className="h-5 w-5 text-red-400" />
              </div>
              <div>
              <h2 className="text-base font-bold text-white">
                  {editMode ? "Edit Gmail Connection" : "Connect Gmail"}
                </h2>
                <p className="text-xs text-slate-300 mt-0.5 font-normal">
                  {editMode
                    ? "Update the connection name or status"
                    : "Use a Google App Password to connect securely"}
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
                      Your normal Gmail password is not required.
                    </p>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-slate-600 font-normal">
                      Enter only the 16-character App Password generated by Google.
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
                    placeholder="Work Gmail"
                    className="h-10 w-full rounded-[8px] border border-slate-300 bg-white pl-9 pr-3 text-xs font-medium text-slate-900 outline-none focus:border-slate-800 transition placeholder:text-slate-400 disabled:bg-slate-100"
                  />
                </div>
              </Field>

              <Field label="Gmail Address">
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    disabled={editMode || submitting}
                    placeholder="youremail@gmail.com"
                    autoComplete="email"
                    className="h-10 w-full rounded-[8px] border border-slate-300 bg-white pl-9 pr-3 text-xs font-medium text-slate-900 outline-none focus:border-slate-800 transition placeholder:text-slate-400 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
                  />
                </div>
              </Field>

              {!editMode && (
                <>
                  <Field label="Google App Password" hint={`${passwordLength}/16`}>
                    <div className="relative">
                      <FaKey className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={appPassword}
                        onChange={(event) =>
                          setAppPassword(formatAppPassword(event.target.value))
                        }
                        disabled={submitting}
                        placeholder="abcd efgh ijkl mnop"
                        autoComplete="new-password"
                        className="h-10 w-full rounded-[8px] border border-slate-300 bg-white pl-9 pr-10 text-xs font-medium tracking-[0.08em] text-slate-900 outline-none focus:border-slate-800 transition placeholder:text-slate-400 disabled:bg-slate-100"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((current) => !current)}
                        disabled={submitting}
                        aria-label={showPassword ? "Hide App Password" : "Show App Password"}
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
                        This is not your regular Gmail password.
                      </span>
                      <a
                        href="https://myaccount.google.com/apppasswords"
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
                        <p><strong className="text-slate-800 font-bold">1.</strong> Enable 2-Step Verification on your Google Account.</p>
                        <p><strong className="text-slate-800 font-bold">2.</strong> Open Google App Passwords.</p>
                        <p><strong className="text-slate-800 font-bold">3.</strong> Create a new App Password.</p>
                        <p><strong className="text-slate-800 font-bold">4.</strong> Copy the 16-character password and paste it above.</p>
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
                : "Connect Gmail"}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default ConnectionModal;

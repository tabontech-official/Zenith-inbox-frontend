import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiEye, FiEyeOff, FiMail, FiServer, FiX } from "react-icons/fi";

const API_BASE_URL = "https://email-syncing-backend.vercel.app";

const initialForm = {
  name: "My Email Connection",
  provider: "smtp",
  email: "",
  fullName: "",
  username: "",
  password: "",
  host: "",
  port: "587",
};

const OutlookConnectionModal = ({
  isOpen,
  onClose,
  onSuccess,
  editMode = false,
  connectionData = null,
  onUpdated,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState("active");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    if (!isOpen) return;

    if (editMode && connectionData) {
      setForm({
        name: connectionData.name || "",
        provider: "smtp",
        email: connectionData.email || "",
        fullName: connectionData.fullName || "",
        username: connectionData.smtp?.username || "",
        password: "",
        host: connectionData.smtp?.host || "",
        port: String(connectionData.smtp?.port || "587"),
      });
      setStatus(connectionData.status || "active");
    } else {
      setForm(initialForm);
      setStatus("active");
    }

    setShowPassword(false);
    setSubmitting(false);
  }, [isOpen, editMode, connectionData]);

  if (!isOpen) return null;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const validateForm = () => {
    if (!form.name.trim()) {
      toast.error("Connection name is required.");
      return false;
    }

    if (!form.email.trim()) {
      toast.error("Email address is required.");
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      toast.error("Please enter a valid email address.");
      return false;
    }

    if (!form.username.trim()) {
      toast.error("SMTP username is required.");
      return false;
    }

    if (!editMode && !form.password.trim()) {
      toast.error("Password or App Password is required.");
      return false;
    }

    if (!form.host.trim()) {
      toast.error("SMTP host is required.");
      return false;
    }

    const port = Number(form.port);
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      toast.error("Please enter a valid SMTP port.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    const userId = localStorage.getItem("userid");
    if (!userId) {
      toast.error("User not found. Please log in again.");
      return;
    }

    try {
      setSubmitting(true);

      if (editMode) {
        if (!connectionData?._id) {
          toast.error("Connection ID is missing.");
          return;
        }

        const payload = {
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          status,
          smtp: {
            host: form.host.trim(),
            port: Number(form.port),
            username: form.username.trim(),
          },
        };

        if (form.password.trim()) {
          payload.smtp.password = form.password.trim();
        }

        const response = await fetch(
          `${API_BASE_URL}/auth/connection/${connectionData._id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );

        const data = await response.json().catch(() => ({}));
        if (!response.ok || data?.success === false) {
          throw new Error(data?.error || data?.message || "Failed to update connection.");
        }

        toast.success(data?.message || "Email connection updated successfully.");
        onUpdated?.(data);
        onClose?.();
        return;
      }

      const payload = {
        userId,
        name: form.name.trim(),
        provider: "smtp",
        email: form.email.trim().toLowerCase(),
        fullName: form.fullName.trim(),
        username: form.username.trim(),
        password: form.password.trim(),
        host: form.host.trim(),
        port: Number(form.port),
      };

      const response = await fetch(`${API_BASE_URL}/auth/saveSmtpConnection`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok || data?.success === false) {
        throw new Error(data?.error || data?.message || "Failed to save connection.");
      }

      toast.success(data?.message || "Email connected successfully.");
      onSuccess?.(data);
      onClose?.();
    } catch (error) {
      console.error("SMTP connection error:", error);
      toast.error(error.message || "Unable to connect email account.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-xs p-4">
      <div className="relative flex max-h-[90vh] w-full max-w-[500px] flex-col overflow-hidden rounded-[8px] bg-white border ">
        {/* Dark Theme Header */}
        <header className="flex shrink-0 items-center justify-between bg-[#111110] text-white px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white">
              <FiMail className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {editMode ? "Edit Email Connection" : "Connect Email"}
              </h2>
              <p className="text-xs text-slate-300 mt-0.5 font-normal">Custom SMTP connection</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="text-slate-400 hover:text-white transition p-1 rounded-full cursor-pointer"
            aria-label="Close"
          >
            <FiX className="h-5 w-5" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-6">
            <Field label="Connection Name">
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                disabled={submitting}
                className="w-full rounded-[8px] border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 outline-none focus:border-slate-800 transition placeholder:text-slate-400 disabled:bg-slate-100"
                placeholder="e.g. Support Email"
              />
            </Field>

            <Field label="Email Address">
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                disabled={submitting}
                className="w-full rounded-[8px] border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 outline-none focus:border-slate-800 transition placeholder:text-slate-400 disabled:bg-slate-100"
                placeholder="you@example.com"
              />
            </Field>

            {!editMode && (
              <Field label="Full Name">
                <input
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  disabled={submitting}
                  className="w-full rounded-[8px] border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 outline-none focus:border-slate-800 transition placeholder:text-slate-400 disabled:bg-slate-100"
                  placeholder="Your full name"
                />
              </Field>
            )}

            <Field label="SMTP Username">
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                disabled={submitting}
                className="w-full rounded-[8px] border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 outline-none focus:border-slate-800 transition placeholder:text-slate-400 disabled:bg-slate-100"
                placeholder="Usually the same as your email"
              />
            </Field>

            <Field label="Password / App Password">
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  disabled={submitting}
                  className="w-full rounded-[8px] border border-slate-300 bg-white pl-3 pr-10 py-2 text-xs font-medium text-slate-900 outline-none focus:border-slate-800 transition placeholder:text-slate-400 disabled:bg-slate-100"
                  placeholder={editMode ? "Leave blank to keep current password" : "Enter password or App Password"}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  disabled={submitting}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
                </button>
              </div>
              <p className="mt-1.5 text-[11px] text-slate-500 font-normal">
                Use an App Password when required by your email provider.
              </p>
            </Field>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_120px]">
              <Field label="SMTP Host">
                <div className="relative">
                  <FiServer className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    name="host"
                    value={form.host}
                    onChange={handleChange}
                    disabled={submitting}
                    className="w-full rounded-[8px] border border-slate-300 bg-white pl-9 pr-3 py-2 text-xs font-medium text-slate-900 outline-none focus:border-slate-800 transition placeholder:text-slate-400 disabled:bg-slate-100"
                    placeholder="smtp.yourprovider.com"
                  />
                </div>
              </Field>

              <Field label="Port">
                <input
                  type="number"
                  name="port"
                  value={form.port}
                  onChange={handleChange}
                  disabled={submitting}
                  className="w-full rounded-[8px] border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 outline-none focus:border-slate-800 transition placeholder:text-slate-400 disabled:bg-slate-100"
                  placeholder="587"
                  min="1"
                  max="65535"
                />
              </Field>
            </div>

            {editMode && (
              <Field label="Status">
                <select
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                  disabled={submitting}
                  className="w-full rounded-[8px] border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 outline-none focus:border-slate-800 transition disabled:bg-slate-100 cursor-pointer"
                >
                  <option value="active">Active</option>
                  <option value="disconnected">Disconnected</option>
                </select>
              </Field>
            )}
          </div>

          <footer className="flex shrink-0 items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/50 px-6 py-4">
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
              className="px-5 py-2 rounded-[8px] bg-[#111110] hover:bg-black text-xs font-bold text-white transition cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
            >
              {editMode
                ? submitting
                  ? "Saving..."
                  : "Save Changes"
                : submitting
                ? "Connecting..."
                : "Save Connection"}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};

const Field = ({ label, children }) => (
  <div>
    <label className="mb-2 block text-sm font-semibold text-slate-700">{label}</label>
    {children}
  </div>
);

export default OutlookConnectionModal;
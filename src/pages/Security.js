import { apiFetch } from "../utils/apiClient";
import React, { useContext, useState } from "react";
import {
  FiShield,
  FiLock,
  FiSmartphone,
  FiEye,
  FiEyeOff,
  FiX,
} from "react-icons/fi";
import toast from "react-hot-toast";

import { UserContext } from "../component/UserContext";
import AppLayout from "../component/AppLayout";

const API_BASE = "https://email-syncing-backend.vercel.app";

const Security = () => {
  const { user, updateUser, loading } = useContext(UserContext);

  const [twoFaLoading, setTwoFaLoading] = useState(false);
  const [verifyTwoFaLoading, setVerifyTwoFaLoading] = useState(false);
  const [disableLoading, setDisableLoading] = useState(false);

  const [showTwoFaModal, setShowTwoFaModal] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [manualKey, setManualKey] = useState("");
  const [twoFaToken, setTwoFaToken] = useState("");
  const [disableToken, setDisableToken] = useState("");

  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;

    setPasswordData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const handleSetupTwoFactor = async () => {
    if (!user?._id) {
      toast.error("User information is unavailable");
      return;
    }

    try {
      setTwoFaLoading(true);

      const res = await apiFetch(`${API_BASE}/auth/2fa/setup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user._id,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to setup 2FA");
      }

      setQrCodeUrl(data.qrCodeUrl || "");
      setManualKey(data.manualKey || "");
      setTwoFaToken("");
      setShowTwoFaModal(true);
    } catch (error) {
      toast.error(error.message || "Failed to setup 2FA");
    } finally {
      setTwoFaLoading(false);
    }
  };

  const handleVerifyTwoFactor = async () => {
    if (!user?._id) {
      toast.error("User information is unavailable");
      return;
    }

    const normalizedToken = twoFaToken.trim();

    if (!normalizedToken) {
      toast.error("Enter the 6-digit code");
      return;
    }

    if (normalizedToken.length !== 6) {
      toast.error("Authentication code must be 6 digits");
      return;
    }

    try {
      setVerifyTwoFaLoading(true);

      const res = await apiFetch(`${API_BASE}/auth/2fa/verify-setup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user._id,
          token: normalizedToken,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Invalid authentication code");
      }

      toast.success("Two-factor authentication enabled");

      updateUser({
        ...user,
        twoFactorEnabled: true,
      });

      setShowTwoFaModal(false);
      setTwoFaToken("");
      setQrCodeUrl("");
      setManualKey("");
    } catch (error) {
      toast.error(error.message || "Failed to verify code");
    } finally {
      setVerifyTwoFaLoading(false);
    }
  };

  const handleDisableTwoFactor = async () => {
    if (!user?._id) {
      toast.error("User information is unavailable");
      return;
    }

    const normalizedToken = disableToken.trim();

    if (!normalizedToken) {
      toast.error("Enter authentication code");
      return;
    }

    if (normalizedToken.length !== 6) {
      toast.error("Authentication code must be 6 digits");
      return;
    }

    try {
      setDisableLoading(true);

      const res = await apiFetch(`${API_BASE}/auth/2fa/disable`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user._id,
          token: normalizedToken,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to disable 2FA");
      }

      toast.success("Two-factor authentication disabled");

      updateUser({
        ...user,
        twoFactorEnabled: false,
      });

      setDisableToken("");
    } catch (error) {
      toast.error(error.message || "Failed to disable 2FA");
    } finally {
      setDisableLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!user?._id) {
      toast.error("User information is unavailable");
      return;
    }

    const { currentPassword, newPassword, confirmPassword } = passwordData;

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("All password fields are required");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password do not match");
      return;
    }

    if (currentPassword === newPassword) {
      toast.error("New password must be different from current password");
      return;
    }

    try {
      setPasswordLoading(true);

      const res = await apiFetch(`${API_BASE}/auth/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user._id,
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update password");
      }

      toast.success("Password updated successfully");

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setShowPassword(false);
    } catch (error) {
      toast.error(error.message || "Failed to update password");
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleCloseTwoFaModal = () => {
    if (verifyTwoFaLoading) {
      return;
    }

    setShowTwoFaModal(false);
    setTwoFaToken("");
  };

  const handleCopyManualKey = async () => {
    if (!manualKey) {
      toast.error("Manual key is unavailable");
      return;
    }

    try {
      await navigator.clipboard.writeText(manualKey);
      toast.success("Copied key");
    } catch (error) {
      toast.error("Unable to copy key");
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f8fafc] font-medium text-slate-500">
        <div className="animate-pulse">Loading security...</div>
      </div>
    );
  }

  return (
    <AppLayout>
      <main className="mx-auto w-full max-w-[1100px] space-y-6">
        <div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold text-[#0f172a]">
            Security Settings
          </h1>

          <p className="mt-1 text-xs text-slate-400">
            Manage your password and two-factor authentication.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="space-y-5 rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eef2ff] text-[#4f46e5]">
                <FiShield className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-sm font-semibold text-[#0f172a]">
                  Two-Factor Authentication
                </h2>

                <p className="mt-1 text-xs leading-relaxed text-slate-400">
                  Add an extra layer of protection using an authenticator app.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-4">
              <div>
                <p className="text-xs font-semibold text-slate-700">
                  Current Status
                </p>

                <p
                  className={`mt-1 text-xs font-semibold ${
                    user?.twoFactorEnabled
                      ? "text-emerald-600"
                      : "text-amber-600"
                  }`}
                >
                  {user?.twoFactorEnabled ? "Enabled" : "Disabled"}
                </p>
              </div>

              <FiSmartphone className="h-5 w-5 text-slate-400" />
            </div>

            {user?.twoFactorEnabled ? (
              <>
                <div>
                  <label
                    htmlFor="disable-two-fa-token"
                    className="text-[10px] font-semibold uppercase tracking-wider text-slate-400"
                  >
                    Authentication Code
                  </label>

                  <input
                    id="disable-two-fa-token"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={disableToken}
                    onChange={(e) =>
                      setDisableToken(e.target.value.replace(/\D/g, ""))
                    }
                    maxLength={6}
                    placeholder="000000"
                    className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2 text-center font-mono text-base tracking-[0.35em] outline-none focus:border-red-400 focus:ring-2 focus:ring-red-500/10"
                  />

                  <p className="mt-2 text-[11px] text-slate-400">
                    Enter the 6-digit code from your authenticator app to
                    disable 2FA.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleDisableTwoFactor}
                  disabled={disableLoading}
                  className="w-full rounded-xl bg-red-50 py-2.5 text-xs font-semibold text-red-600 transition-all hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {disableLoading ? "Disabling..." : "Disable 2FA"}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleSetupTwoFactor}
                disabled={twoFaLoading}
                className="w-full rounded-xl bg-[#4f46e5] py-2.5 text-xs font-semibold text-white transition-all hover:bg-[#4338ca] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {twoFaLoading ? "Preparing..." : "Enable 2FA"}
              </button>
            )}
          </div>

          <div className="space-y-5 rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eef2ff] text-[#4f46e5]">
                <FiLock className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-sm font-semibold text-[#0f172a]">
                  Change Password
                </h2>

                <p className="mt-1 text-xs leading-relaxed text-slate-400">
                  Update your account password securely.
                </p>
              </div>
            </div>

            <SecurityInput
              label="Current Password"
              name="currentPassword"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              showPassword={showPassword}
              autoComplete="current-password"
            />

            <SecurityInput
              label="New Password"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              showPassword={showPassword}
              autoComplete="new-password"
            />

            <SecurityInput
              label="Confirm New Password"
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              showPassword={showPassword}
              autoComplete="new-password"
            />

            <button
              type="button"
              onClick={() => setShowPassword((previousValue) => !previousValue)}
              className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-700"
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
              {showPassword ? "Hide Passwords" : "Show Passwords"}
            </button>

            <button
              type="button"
              onClick={handleUpdatePassword}
              disabled={passwordLoading}
              className="w-full rounded-xl bg-[#4f46e5] py-2.5 text-xs font-semibold text-white transition-all hover:bg-[#4338ca] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {passwordLoading ? "Updating..." : "Update Password"}
            </button>
          </div>
        </div>
      </main>

      {showTwoFaModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="two-fa-modal-title"
        >
          <div className="relative w-full max-w-md space-y-5 rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl">
            <button
              type="button"
              onClick={handleCloseTwoFaModal}
              disabled={verifyTwoFaLoading}
              aria-label="Close modal"
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FiX className="h-5 w-5" />
            </button>

            <div className="text-center">
              <h2
                id="two-fa-modal-title"
                className="text-lg font-semibold text-slate-900"
              >
                Setup Authenticator App
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Scan the QR code with Google Authenticator, Microsoft
                Authenticator, or Authy.
              </p>
            </div>

            {qrCodeUrl && (
              <div className="mx-auto flex max-w-[180px] justify-center rounded-xl border border-slate-100 bg-slate-50 p-2">
                <img
                  src={qrCodeUrl}
                  alt="Two-factor authentication QR code"
                  className="h-40 w-40 mix-blend-multiply"
                />
              </div>
            )}

            <div className="flex items-center justify-between gap-2 rounded-lg border bg-slate-50 p-3 font-mono text-[11px] text-slate-500">
              <span className="truncate">Key: {manualKey}</span>

              <button
                type="button"
                onClick={handleCopyManualKey}
                className="font-sans font-semibold text-[#4f46e5] hover:underline"
              >
                Copy
              </button>
            </div>

            <div>
              <label
                htmlFor="two-fa-verification-code"
                className="text-xs font-semibold text-slate-500"
              >
                Verification Code
              </label>

              <input
                id="two-fa-verification-code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={twoFaToken}
                onChange={(e) =>
                  setTwoFaToken(e.target.value.replace(/\D/g, ""))
                }
                maxLength={6}
                placeholder="000000"
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2 text-center font-mono text-base tracking-[0.35em] outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleCloseTwoFaModal}
                disabled={verifyTwoFaLoading}
                className="flex-1 rounded-xl border border-slate-200 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleVerifyTwoFactor}
                disabled={verifyTwoFaLoading}
                className="flex-1 rounded-xl bg-[#4f46e5] py-2 text-xs font-semibold text-white hover:bg-[#4338ca] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {verifyTwoFaLoading ? "Verifying..." : "Verify & Enable"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

const SecurityInput = ({
  label,
  name,
  value,
  onChange,
  showPassword,
  autoComplete,
}) => {
  const inputId = `security-${name}`;

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={inputId}
        className="text-[10px] font-semibold uppercase tracking-wider text-slate-400"
      >
        {label}
      </label>

      <input
        id={inputId}
        type={showPassword ? "text" : "password"}
        name={name}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
      />
    </div>
  );
};

export default Security;

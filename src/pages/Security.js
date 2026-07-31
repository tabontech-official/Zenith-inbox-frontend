// import React, { useContext, useState } from "react";
// import {
//   FiShield,
//   FiLock,
//   FiSmartphone,
//   FiEye,
//   FiEyeOff,
//   FiX,
// } from "react-icons/fi";

// import { UserContext } from "../component/UserContext";
// import Sidebar from "../component/Sidebar";
// import Navbar from "../component/Navbar";
// import toast from "react-hot-toast";

// const API_BASE = "http://localhost:5000";

// const Security = () => {
//   const { user, updateUser, loading } = useContext(UserContext);

//   const [twoFaLoading, setTwoFaLoading] = useState(false);
//   const [disableLoading, setDisableLoading] = useState(false);
//   const [showTwoFaModal, setShowTwoFaModal] = useState(false);
//   const [qrCodeUrl, setQrCodeUrl] = useState("");
//   const [manualKey, setManualKey] = useState("");
//   const [twoFaToken, setTwoFaToken] = useState("");

//   const [passwordLoading, setPasswordLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);

//   const [passwordData, setPasswordData] = useState({
//     currentPassword: "",
//     newPassword: "",
//     confirmPassword: "",
//   });

//   const handlePasswordChange = (e) => {
//     setPasswordData({
//       ...passwordData,
//       [e.target.name]: e.target.value,
//     });
//   };
// const [disableToken, setDisableToken] = useState("");
//   const handleSetupTwoFactor = async () => {
//     try {
//       setTwoFaLoading(true);

//       const res = await fetch(`${API_BASE}/auth/2fa/setup`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ userId: user._id }),
//       });

//       const data = await res.json();

//       if (!res.ok || !data.success) {
//         throw new Error(data.message || "Failed to setup 2FA");
//       }

//       setQrCodeUrl(data.qrCodeUrl);
//       setManualKey(data.manualKey);
//       setShowTwoFaModal(true);
//     } catch (error) {
//       toast.error(error.message || "Failed to setup 2FA");
//     } finally {
//       setTwoFaLoading(false);
//     }
//   };

//   const handleVerifyTwoFactor = async () => {
//     try {
//       if (!twoFaToken.trim()) {
//         toast.error("Enter the 6-digit code");
//         return;
//       }

//       const res = await fetch(`${API_BASE}/auth/2fa/verify-setup`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ userId: user._id, token: twoFaToken }),
//       });

//       const data = await res.json();

//       if (!res.ok || !data.success) {
//         throw new Error(data.message || "Invalid code");
//       }

//       toast.success("Two-factor authentication enabled");
//       updateUser({ ...user, twoFactorEnabled: true });

//       setShowTwoFaModal(false);
//       setTwoFaToken("");
//       setQrCodeUrl("");
//       setManualKey("");
//     } catch (error) {
//       toast.error(error.message || "Failed to verify code");
//     }
//   };

//  const handleDisableTwoFactor = async () => {
//   try {
//     if (!disableToken.trim()) {
//       toast.error("Enter authentication code");
//       return;
//     }

//     setDisableLoading(true);

//     const res = await fetch(`${API_BASE}/auth/2fa/disable`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         userId: user._id,
//         token: disableToken,
//       }),
//     });

//     const data = await res.json();

//     if (!res.ok || !data.success) {
//       throw new Error(data.message || "Failed to disable 2FA");
//     }

//     toast.success("Two-factor authentication disabled");
//     updateUser({ ...user, twoFactorEnabled: false });
//     setDisableToken("");
//   } catch (error) {
//     toast.error(error.message || "Failed to disable 2FA");
//   } finally {
//     setDisableLoading(false);
//   }
// };

//   const handleUpdatePassword = async () => {
//     try {
//       const { currentPassword, newPassword, confirmPassword } = passwordData;

//       if (!currentPassword || !newPassword || !confirmPassword) {
//         toast.error("All password fields are required");
//         return;
//       }

//       if (newPassword.length < 8) {
//         toast.error("New password must be at least 8 characters");
//         return;
//       }

//       if (newPassword !== confirmPassword) {
//         toast.error("New password and confirm password do not match");
//         return;
//       }

//       setPasswordLoading(true);

//       const res = await fetch(`${API_BASE}/auth/change-password`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           userId: user._id,
//           currentPassword,
//           newPassword,
//         }),
//       });

//       const data = await res.json();

//       if (!res.ok || !data.success) {
//         throw new Error(data.message || "Failed to update password");
//       }

//       toast.success("Password updated successfully");

//       setPasswordData({
//         currentPassword: "",
//         newPassword: "",
//         confirmPassword: "",
//       });
//     } catch (error) {
//       toast.error(error.message || "Failed to update password");
//     } finally {
//       setPasswordLoading(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-screen bg-[#f8fafc] text-slate-500 font-medium">
//         <div className="animate-pulse">Loading security...</div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex min-h-screen bg-[#f4f7fc] text-[#334155] font-sans antialiased">
//       <Sidebar />

//       <div className="flex-1 flex flex-col ">
//         <div className="hidden sm:block">
//           <Navbar />
//         </div>

//         <main className="flex-1 p-6 lg:p-8 max-w-[1100px] w-full mx-auto space-y-6">
//           <div className="bg-white p-6 rounded-2xl border border-slate-200/70 shadow-sm">
//             <h1 className="text-xl font-semibold text-[#0f172a]">
//               Security Settings
//             </h1>
//             <p className="text-xs text-slate-400 mt-1">
//               Manage your password and two-factor authentication.
//             </p>
//           </div>

//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//             <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-6 space-y-5">
//               <div className="flex items-start gap-3">
//                 <div className="w-10 h-10 rounded-xl bg-[#eef2ff] text-[#4f46e5] flex items-center justify-center">
//                   <FiShield className="w-5 h-5" />
//                 </div>

//                 <div>
//                   <h2 className="text-sm font-semibold text-[#0f172a]">
//                     Two-Factor Authentication
//                   </h2>
//                   <p className="text-xs text-slate-400 mt-1 leading-relaxed">
//                     Add an extra layer of protection using an authenticator app.
//                   </p>
//                 </div>
//               </div>

//               <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 flex items-center justify-between">
//                 <div>
//                   <p className="text-xs font-semibold text-slate-700">
//                     Current Status
//                   </p>
//                   <p
//                     className={`text-xs font-semibold mt-1 ${
//                       user?.twoFactorEnabled
//                         ? "text-emerald-600"
//                         : "text-amber-600"
//                     }`}
//                   >
//                     {user?.twoFactorEnabled ? "Enabled" : "Disabled"}
//                   </p>
//                 </div>

//                 <FiSmartphone className="text-slate-400 w-5 h-5" />
//               </div>

//               {user?.twoFactorEnabled ? (
//                 <button
//                   onClick={handleDisableTwoFactor}
//                   disabled={disableLoading}
//                   className="w-full py-2.5 rounded-xl text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100 transition-all disabled:opacity-60"
//                 >
//                   {disableLoading ? "Disabling..." : "Disable 2FA"}
//                 </button>
//               ) : (
//                 <button
//                   onClick={handleSetupTwoFactor}
//                   disabled={twoFaLoading}
//                   className="w-full py-2.5 rounded-xl text-xs font-semibold bg-[#4f46e5] text-white hover:bg-[#4338ca] transition-all disabled:opacity-60"
//                 >
//                   {twoFaLoading ? "Preparing..." : "Enable 2FA"}
//                 </button>
//               )}
//             </div>

//             <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-6 space-y-5">
//               <div className="flex items-start gap-3">
//                 <div className="w-10 h-10 rounded-xl bg-[#eef2ff] text-[#4f46e5] flex items-center justify-center">
//                   <FiLock className="w-5 h-5" />
//                 </div>

//                 <div>
//                   <h2 className="text-sm font-semibold text-[#0f172a]">
//                     Change Password
//                   </h2>
//                   <p className="text-xs text-slate-400 mt-1 leading-relaxed">
//                     Update your account password securely.
//                   </p>
//                 </div>
//               </div>

//               <SecurityInput
//                 label="Current Password"
//                 name="currentPassword"
//                 value={passwordData.currentPassword}
//                 onChange={handlePasswordChange}
//                 showPassword={showPassword}
//               />

//               <SecurityInput
//                 label="New Password"
//                 name="newPassword"
//                 value={passwordData.newPassword}
//                 onChange={handlePasswordChange}
//                 showPassword={showPassword}
//               />

//               <SecurityInput
//                 label="Confirm New Password"
//                 name="confirmPassword"
//                 value={passwordData.confirmPassword}
//                 onChange={handlePasswordChange}
//                 showPassword={showPassword}
//               />

//               <button
//                 type="button"
//                 onClick={() => setShowPassword(!showPassword)}
//                 className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-700"
//               >
//                 {showPassword ? <FiEyeOff /> : <FiEye />}
//                 {showPassword ? "Hide Passwords" : "Show Passwords"}
//               </button>

//               <button
//                 onClick={handleUpdatePassword}
//                 disabled={passwordLoading}
//                 className="w-full py-2.5 rounded-xl text-xs font-semibold bg-[#4f46e5] text-white hover:bg-[#4338ca] transition-all disabled:opacity-60"
//               >
//                 {passwordLoading ? "Updating..." : "Update Password"}
//               </button>
//             </div>
//           </div>
//         </main>
//       </div>

//       {showTwoFaModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
//           <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 space-y-5 relative">
//             <button
//               onClick={() => setShowTwoFaModal(false)}
//               className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
//             >
//               <FiX className="w-5 h-5" />
//             </button>

//             <div className="text-center">
//               <h2 className="text-lg font-semibold text-slate-900">
//                 Setup Authenticator App
//               </h2>
//               <p className="text-xs text-slate-400 mt-1">
//                 Scan the QR code with Google Authenticator, Microsoft Authenticator, or Authy.
//               </p>
//             </div>

//             {qrCodeUrl && (
//               <div className="flex justify-center p-2 bg-slate-50 border border-slate-100 rounded-xl max-w-[180px] mx-auto">
//                 <img
//                   src={qrCodeUrl}
//                   alt="2FA QR Code"
//                   className="h-40 w-40 mix-blend-multiply"
//                 />
//               </div>
//             )}

//             <div className="rounded-lg bg-slate-50 border p-3 text-[11px] text-slate-500 font-mono flex items-center justify-between gap-2">
//               <span className="truncate">Key: {manualKey}</span>
//               <button
//                 onClick={() => {
//                   navigator.clipboard.writeText(manualKey);
//                   toast.success("Copied key");
//                 }}
//                 className="text-[#4f46e5] font-sans font-semibold hover:underline"
//               >
//                 Copy
//               </button>
//             </div>

//             <div>
//               <label className="text-xs font-semibold text-slate-500">
//                 Verification Code
//               </label>
//               <input
//                 type="text"
//                 value={twoFaToken}
//                 onChange={(e) => setTwoFaToken(e.target.value)}
//                 maxLength={6}
//                 placeholder="000000"
//                 className="mt-1 w-full tracking-[0.35em] text-center font-mono text-base rounded-xl border border-slate-200 px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
//               />
//             </div>

//             <div className="flex gap-3">
//               <button
//                 onClick={() => setShowTwoFaModal(false)}
//                 className="flex-1 rounded-xl border border-slate-200 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50"
//               >
//                 Cancel
//               </button>

//               <button
//                 onClick={handleVerifyTwoFactor}
//                 className="flex-1 rounded-xl bg-[#4f46e5] py-2 text-xs font-semibold text-white hover:bg-[#4338ca]"
//               >
//                 Verify & Enable
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// const SecurityInput = ({ label, name, value, onChange, showPassword }) => (
//   <div className="space-y-1.5">
//     <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
//       {label}
//     </label>

//     <input
//       type={showPassword ? "text" : "password"}
//       name={name}
//       value={value}
//       onChange={onChange}
//       className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500"
//     />
//   </div>
// );

// export default Security;
import React, { useContext, useState } from "react";
import {
  FiShield,
  FiLock,
  FiSmartphone,
  FiEye,
  FiEyeOff,
  FiX,
} from "react-icons/fi";

import { UserContext } from "../component/UserContext";
import Sidebar from "../component/Sidebar";
import Navbar from "../component/Navbar";
import toast from "react-hot-toast";

const API_BASE = "http://localhost:5000";

const Security = () => {
  const { user, updateUser, loading } = useContext(UserContext);

  const [twoFaLoading, setTwoFaLoading] = useState(false);
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
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSetupTwoFactor = async () => {
    try {
      setTwoFaLoading(true);

      const res = await fetch(`${API_BASE}/auth/2fa/setup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user._id }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to setup 2FA");
      }

      setQrCodeUrl(data.qrCodeUrl);
      setManualKey(data.manualKey);
      setShowTwoFaModal(true);
    } catch (error) {
      toast.error(error.message || "Failed to setup 2FA");
    } finally {
      setTwoFaLoading(false);
    }
  };

  const handleVerifyTwoFactor = async () => {
    try {
      if (!twoFaToken.trim()) {
        toast.error("Enter the 6-digit code");
        return;
      }

      const res = await fetch(`${API_BASE}/auth/2fa/verify-setup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user._id,
          token: twoFaToken,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Invalid code");
      }

      toast.success("Two-factor authentication enabled");
      updateUser({ ...user, twoFactorEnabled: true });

      setShowTwoFaModal(false);
      setTwoFaToken("");
      setQrCodeUrl("");
      setManualKey("");
    } catch (error) {
      toast.error(error.message || "Failed to verify code");
    }
  };

  const handleDisableTwoFactor = async () => {
    try {
      if (!disableToken.trim()) {
        toast.error("Enter authentication code");
        return;
      }

      if (disableToken.trim().length !== 6) {
        toast.error("Authentication code must be 6 digits");
        return;
      }

      setDisableLoading(true);

      const res = await fetch(`${API_BASE}/auth/2fa/disable`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user._id,
          token: disableToken,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to disable 2FA");
      }

      toast.success("Two-factor authentication disabled");
      updateUser({ ...user, twoFactorEnabled: false });
      setDisableToken("");
    } catch (error) {
      toast.error(error.message || "Failed to disable 2FA");
    } finally {
      setDisableLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    try {
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

      setPasswordLoading(true);

      const res = await fetch(`${API_BASE}/auth/change-password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
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
    } catch (error) {
      toast.error(error.message || "Failed to update password");
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#f8fafc] text-slate-500 font-medium">
        <div className="animate-pulse">Loading security...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f4f7fc] text-[#334155] font-sans antialiased">
      <Sidebar />

      <div className="flex-1 flex flex-col ">
        <div className="hidden sm:block">
          <Navbar />
        </div>

        <main className="flex-1 p-6 lg:p-8 max-w-[1100px] w-full mx-auto space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/70 shadow-sm">
            <h1 className="text-xl font-semibold text-[#0f172a]">
              Security Settings
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Manage your password and two-factor authentication.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-6 space-y-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#eef2ff] text-[#4f46e5] flex items-center justify-center">
                  <FiShield className="w-5 h-5" />
                </div>

                <div>
                  <h2 className="text-sm font-semibold text-[#0f172a]">
                    Two-Factor Authentication
                  </h2>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Add an extra layer of protection using an authenticator app.
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-700">
                    Current Status
                  </p>
                  <p
                    className={`text-xs font-semibold mt-1 ${
                      user?.twoFactorEnabled
                        ? "text-emerald-600"
                        : "text-amber-600"
                    }`}
                  >
                    {user?.twoFactorEnabled ? "Enabled" : "Disabled"}
                  </p>
                </div>

                <FiSmartphone className="text-slate-400 w-5 h-5" />
              </div>

              {user?.twoFactorEnabled ? (
                <>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      Authentication Code
                    </label>

                    <input
                      type="text"
                      value={disableToken}
                      onChange={(e) =>
                        setDisableToken(e.target.value.replace(/\D/g, ""))
                      }
                      maxLength={6}
                      placeholder="000000"
                      className="mt-1 w-full tracking-[0.35em] text-center font-mono text-base rounded-xl border border-slate-200 px-4 py-2 outline-none focus:ring-2 focus:ring-red-500/10 focus:border-red-400"
                    />

                    <p className="text-[11px] text-slate-400 mt-2">
                      Enter the 6-digit code from your authenticator app to
                      disable 2FA.
                    </p>
                  </div>

                  <button
                    onClick={handleDisableTwoFactor}
                    disabled={disableLoading}
                    className="w-full py-2.5 rounded-xl text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100 transition-all disabled:opacity-60"
                  >
                    {disableLoading ? "Disabling..." : "Disable 2FA"}
                  </button>
                </>
              ) : (
                <button
                  onClick={handleSetupTwoFactor}
                  disabled={twoFaLoading}
                  className="w-full py-2.5 rounded-xl text-xs font-semibold bg-[#4f46e5] text-white hover:bg-[#4338ca] transition-all disabled:opacity-60"
                >
                  {twoFaLoading ? "Preparing..." : "Enable 2FA"}
                </button>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-6 space-y-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#eef2ff] text-[#4f46e5] flex items-center justify-center">
                  <FiLock className="w-5 h-5" />
                </div>

                <div>
                  <h2 className="text-sm font-semibold text-[#0f172a]">
                    Change Password
                  </h2>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
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
              />

              <SecurityInput
                label="New Password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                showPassword={showPassword}
              />

              <SecurityInput
                label="Confirm New Password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                showPassword={showPassword}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-700"
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
                {showPassword ? "Hide Passwords" : "Show Passwords"}
              </button>

              <button
                onClick={handleUpdatePassword}
                disabled={passwordLoading}
                className="w-full py-2.5 rounded-xl text-xs font-semibold bg-[#4f46e5] text-white hover:bg-[#4338ca] transition-all disabled:opacity-60"
              >
                {passwordLoading ? "Updating..." : "Update Password"}
              </button>
            </div>
          </div>
        </main>
      </div>

      {showTwoFaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 space-y-5 relative">
            <button
              onClick={() => setShowTwoFaModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <FiX className="w-5 h-5" />
            </button>

            <div className="text-center">
              <h2 className="text-lg font-semibold text-slate-900">
                Setup Authenticator App
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Scan the QR code with Google Authenticator, Microsoft
                Authenticator, or Authy.
              </p>
            </div>

            {qrCodeUrl && (
              <div className="flex justify-center p-2 bg-slate-50 border border-slate-100 rounded-xl max-w-[180px] mx-auto">
                <img
                  src={qrCodeUrl}
                  alt="2FA QR Code"
                  className="h-40 w-40 mix-blend-multiply"
                />
              </div>
            )}

            <div className="rounded-lg bg-slate-50 border p-3 text-[11px] text-slate-500 font-mono flex items-center justify-between gap-2">
              <span className="truncate">Key: {manualKey}</span>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(manualKey);
                  toast.success("Copied key");
                }}
                className="text-[#4f46e5] font-sans font-semibold hover:underline"
              >
                Copy
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500">
                Verification Code
              </label>

              <input
                type="text"
                value={twoFaToken}
                onChange={(e) =>
                  setTwoFaToken(e.target.value.replace(/\D/g, ""))
                }
                maxLength={6}
                placeholder="000000"
                className="mt-1 w-full tracking-[0.35em] text-center font-mono text-base rounded-xl border border-slate-200 px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowTwoFaModal(false)}
                className="flex-1 rounded-xl border border-slate-200 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                onClick={handleVerifyTwoFactor}
                className="flex-1 rounded-xl bg-[#4f46e5] py-2 text-xs font-semibold text-white hover:bg-[#4338ca]"
              >
                Verify & Enable
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SecurityInput = ({ label, name, value, onChange, showPassword }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
      {label}
    </label>

    <input
      type={showPassword ? "text" : "password"}
      name={name}
      value={value}
      onChange={onChange}
      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500"
    />
  </div>
);

export default Security;
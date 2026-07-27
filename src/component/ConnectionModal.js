// import React, { useEffect, useState } from "react";
// import { FaGoogle, FaTimes } from "react-icons/fa";
// import { MdInfo } from "react-icons/md";
// import axios from "axios";
// import toast from "react-hot-toast";

// const ConnectionModal = ({
//   isOpen,
//   onClose,
//   onSuccess,
//   editMode = false,
//   connectionData = null,
//   onUpdated,
// }) => {
//   const [connectionName, setConnectionName] = useState(
//     "My Google Restricted Connection"
//   );
//   const [status, setStatus] = useState("active");
//   const [email, setEmail] = useState("");
//   const [submitting, setSubmitting] = useState(false);

//   useEffect(() => {
//     if (isOpen) {
//       if (editMode && connectionData) {
//         setConnectionName(connectionData.name || "");
//         setStatus(connectionData.status || "active");
//         setEmail(connectionData.email || "");
//       } else {
//         setConnectionName("My Google Restricted Connection");
//         setStatus("active");
//         setEmail("");
//       }
//     }
//   }, [isOpen, editMode, connectionData]);

//   const handleGoogleSignIn = () => {
//     const userId = localStorage.getItem("userid");
//     if (!userId) {
//       alert("User not found. Please log in again.");
//       return;
//     }

//     const scenarioId = localStorage.getItem("scenarioId");
//     localStorage.setItem("scenarioId", scenarioId);

//     const activeModule =
//       localStorage.getItem("activeShopifyModule") || "Initial Email";
//     localStorage.setItem("activeShopifyModule", activeModule);

//     try {
//       const routerBranches = JSON.parse(
//         localStorage.getItem("routerBranchesState") || "[]"
//       );
//       localStorage.setItem(
//         "shopifyScenarioState",
//         JSON.stringify({ routerBranches })
//       );
//       console.log(
//         "💾 Saved routerBranches before Google OAuth:",
//         routerBranches
//       );
//     } catch (err) {
//       console.error("❌ Error saving routerBranches before redirect:", err);
//     }

//     // ✅ Redirect the current tab
//     const currentPath = window.location.pathname.replace(/^\//, ""); // remove leading "/"
//     console.log(currentPath);
//     window.location.href = `https://email-syncing-backend.vercel.app/auth/google?userId=${userId}&redirect=${encodeURIComponent(
//       currentPath
//     )}`;
//   };

//   const handleSubmit = async (e) => {
//     if (editMode) {
//       e.preventDefault();
//       if (!connectionName.trim()) {
//         toast.error("Connection name is required");
//         return;
//       }
//       try {
//         setSubmitting(true);
//         const res = await axios.put(
//           `https://email-syncing-backend.vercel.app/auth/connection/${connectionData._id}`,
//           {
//             name: connectionName.trim(),
//             status: status
//           }
//         );
//         if (res.data.success) {
//           toast.success("Gmail connection updated successfully!");
//           onUpdated?.();
//           onClose();
//         }
//       } catch (err) {
//         console.error("Error updating connection:", err);
//         toast.error(
//           err.response?.data?.error || err.response?.data?.message || "Failed to update connection"
//         );
//       } finally {
//         setSubmitting(false);
//       }
//     } else {
//       handleGoogleSignIn();
//     }
//   };

//   useEffect(() => {
//     const listener = (event) => {
//       if (event.data?.type === "google-auth-success") {
//         console.log("Gmail connected successfully!");
//         if (window.googlePopup && !window.googlePopup.closed) {
//           window.googlePopup.close();
//         }

//         onSuccess?.({
//           ...event.data,
//           triggerRefresh: true,
//         });
//       }
//     };

//     window.addEventListener("message", listener);
//     return () => window.removeEventListener("message", listener);
//   }, [onClose, onSuccess]);

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
//       <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg overflow-hidden animate-fadeIn">
//         <div className="bg-gradient-to-r from-[#e45341] to-[#f46654] text-white flex justify-between items-center px-5 py-3">
//           <h2 className="text-sm font-semibold tracking-wide flex items-center gap-2">
//             {editMode ? "Edit Gmail Connection" : "Create a Gmail Connection"}
//           </h2>
//           <button onClick={onClose} className="hover:text-gray-200">
//             <FaTimes className="w-5 h-5" />
//           </button>
//         </div>

//         <div className="p-6 space-y-6">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Connection Name <span className="text-red-500">*</span>
//             </label>
//             <input
//               type="text"
//               value={connectionName}
//               onChange={(e) => setConnectionName(e.target.value)}
//               className="w-full py-2 px-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
//             />
//           </div>

//           {editMode && (
//             <>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Email
//                 </label>
//                 <input
//                   type="email"
//                   value={email}
//                   disabled
//                   className="w-full py-2 px-3 border border-gray-300 rounded-lg text-sm bg-gray-100 text-gray-500 cursor-not-allowed focus:outline-none"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Status
//                 </label>
//                 <select
//                   value={status}
//                   onChange={(e) => setStatus(e.target.value)}
//                   className="w-full py-2 px-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
//                 >
//                   <option value="active">Active</option>
//                   <option value="disconnected">Disconnected</option>
//                 </select>
//               </div>
//             </>
//           )}

//           {!editMode && (
//             <>
//               <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-gray-700">
//                 <MdInfo className="text-blue-500 w-5 h-5 flex-shrink-0 mt-0.5" />
//                 <p>
//                   Make’s use and transfer of information received from Google APIs
//                   will adhere to{" "}
//                   <a
//                     href="https://developers.google.com/terms/api-services-user-data-policy"
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="text-blue-600 underline hover:no-underline"
//                   >
//                     Google API Services User Data Policy
//                   </a>
//                   .
//                 </p>
//               </div>

//               <p className="text-xs text-gray-600">
//                 If you’re using a personal Google account (@gmail.com), please
//                 follow{" "}
//                 <a
//                   href="https://support.google.com/mail/answer/22370"
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="text-blue-600 underline hover:no-underline"
//                 >
//                   this guide
//                 </a>{" "}
//                 for additional steps.
//               </p>
//             </>
//           )}
//         </div>

//         <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t">
//           <button
//             onClick={onClose}
//             className="px-5 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition"
//             disabled={submitting}
//           >
//             Cancel
//           </button>
//           <button
//             onClick={handleSubmit}
//             disabled={submitting}
//             className="px-5 py-2 flex items-center gap-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow transition"
//           >
//             {editMode ? (
//               submitting ? "Saving..." : "Save Changes"
//             ) : (
//               <>
//                 <FaGoogle className="w-5 h-5" />
//                 Sign in with Google
//               </>
//             )}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ConnectionModal;
import React, { useEffect, useState } from "react";
import {
  FaTimes,
  FaEye,
  FaEyeSlash,
  FaKey,
} from "react-icons/fa";
import { MdInfo, MdEmail } from "react-icons/md";
import axios from "axios";
import toast from "react-hot-toast";

const API_BASE_URL =
  "https://email-syncing-backend.vercel.app";

const ConnectionModal = ({
  isOpen,
  onClose,
  onSuccess,
  editMode = false,
  connectionData = null,
  onUpdated,
}) => {
  const [connectionName, setConnectionName] = useState(
    "My Gmail Connection"
  );

  const [status, setStatus] = useState("active");
  const [email, setEmail] = useState("");
  const [appPassword, setAppPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (editMode && connectionData) {
      setConnectionName(
        connectionData.name || "My Gmail Connection"
      );
      setStatus(connectionData.status || "active");
      setEmail(connectionData.email || "");
      setAppPassword("");
      setShowPassword(false);
    } else {
      setConnectionName("My Gmail Connection");
      setStatus("active");
      setEmail("");
      setAppPassword("");
      setShowPassword(false);
    }
  }, [isOpen, editMode, connectionData]);

  const normalizeAppPassword = (value) => {
    return value.replace(/\s/g, "");
  };

  const formatAppPassword = (value) => {
    const cleanedValue = value
      .replace(/\s/g, "")
      .replace(/[^a-zA-Z0-9]/g, "")
      .slice(0, 16);

    return cleanedValue.match(/.{1,4}/g)?.join(" ") || "";
  };

  const isValidEmail = (value) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  const validateCreateForm = () => {
    const cleanPassword =
      normalizeAppPassword(appPassword);

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

    if (cleanPassword.length !== 16) {
      toast.error(
        "Google App Password must contain 16 characters."
      );
      return false;
    }

    return true;
  };

  const handleCreateConnection = async () => {
    if (!validateCreateForm()) return;

    const userId = localStorage.getItem("userid");

    if (!userId) {
      toast.error(
        "User not found. Please log in again."
      );
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
          appPassword:
            normalizeAppPassword(appPassword),
        }
      );

      if (!response.data?.success) {
        toast.error(
          response.data?.message ||
            "Unable to connect Gmail account."
        );
        return;
      }

      toast.success(
        response.data?.message ||
          "Gmail connected successfully!"
      );

      onSuccess?.({
        ...response.data,
        triggerRefresh: true,
      });

      onClose();
    } catch (error) {
      console.error(
        "Gmail App Password connection error:",
        error
      );

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
        {
          name: connectionName.trim(),
          status,
        }
      );

      if (!response.data?.success) {
        toast.error(
          response.data?.message ||
            "Failed to update connection."
        );
        return;
      }

      toast.success(
        "Gmail connection updated successfully!"
      );

      onUpdated?.();
      onClose();
    } catch (error) {
      console.error(
        "Error updating Gmail connection:",
        error
      );

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

    if (editMode) {
      await handleUpdateConnection();
      return;
    }

    await handleCreateConnection();
  };

  if (!isOpen) return null;

  const passwordLength =
    normalizeAppPassword(appPassword).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 px-4">
      <div className="w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-2xl animate-fadeIn">
        <div className="flex items-center justify-between bg-gradient-to-r from-[#e45341] to-[#f46654] px-5 py-4 text-white">
          <h2 className="text-sm font-semibold tracking-wide">
            {editMode
              ? "Edit Gmail Connection"
              : "Connect Gmail Account"}
          </h2>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-md p-1 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
            aria-label="Close modal"
          >
            <FaTimes className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="max-h-[72vh] space-y-5 overflow-y-auto p-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Connection Name
                <span className="ml-1 text-red-500">
                  *
                </span>
              </label>

              <input
                type="text"
                value={connectionName}
                onChange={(event) =>
                  setConnectionName(event.target.value)
                }
                placeholder="My Gmail Connection"
                disabled={submitting}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Gmail Address
                <span className="ml-1 text-red-500">
                  *
                </span>
              </label>

              <div className="relative">
                <MdEmail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

                <input
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder="yourname@gmail.com"
                  autoComplete="email"
                  disabled={editMode || submitting}
                  className={`w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm outline-none transition ${
                    editMode
                      ? "cursor-not-allowed bg-gray-100 text-gray-500"
                      : "focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  }`}
                />
              </div>
            </div>

            {!editMode && (
              <>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Google App Password
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </label>

                  <div className="relative">
                    <FaKey className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                    <input
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      value={appPassword}
                      onChange={(event) =>
                        setAppPassword(
                          formatAppPassword(
                            event.target.value
                          )
                        )
                      }
                      placeholder="abcd efgh ijkl mnop"
                      autoComplete="new-password"
                      disabled={submitting}
                      className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-11 text-sm tracking-wider outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-gray-100"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (previousValue) =>
                            !previousValue
                        )
                      }
                      disabled={submitting}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-600 disabled:cursor-not-allowed"
                      aria-label={
                        showPassword
                          ? "Hide App Password"
                          : "Show App Password"
                      }
                    >
                      {showPassword ? (
                        <FaEyeSlash className="h-5 w-5" />
                      ) : (
                        <FaEye className="h-5 w-5" />
                      )}
                    </button>
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                      Enter the App Password generated
                      from your Google account.
                    </p>

                    <span
                      className={`text-xs font-medium ${
                        passwordLength === 16
                          ? "text-green-600"
                          : "text-gray-400"
                      }`}
                    >
                      {passwordLength}/16
                    </span>
                  </div>
                </div>

                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <div className="flex items-start gap-3">
                    <MdInfo className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />

                    <div className="space-y-2 text-xs leading-5 text-gray-700">
                      <p className="font-semibold text-gray-800">
                        How to generate an App Password
                      </p>

                      <p>
                        1. Enable 2-Step Verification
                        on your Google account.
                      </p>

                      <p>
                        2. Open Google App Passwords.
                      </p>

                      <p>
                        3. Create a new App Password
                        for this application.
                      </p>

                      <p>
                        4. Paste the generated
                        16-character password above.
                      </p>

                      <a
                        href="https://myaccount.google.com/apppasswords"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex font-medium text-blue-600 underline hover:no-underline"
                      >
                        Generate Google App Password
                      </a>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3">
                  <MdInfo className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />

                  <p className="text-xs leading-5 text-gray-700">
                    Do not enter your normal Gmail
                    password. Only enter the App Password
                    generated by Google.
                  </p>
                </div>

                <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3">
                  <MdInfo className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-500" />

                  <p className="text-xs leading-5 text-gray-700">
                    Your Gmail account will be used for
                    both incoming emails through IMAP and
                    outgoing emails through SMTP.
                  </p>
                </div>
              </>
            )}

            {editMode && (
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Status
                </label>

                <select
                  value={status}
                  onChange={(event) =>
                    setStatus(event.target.value)
                  }
                  disabled={submitting}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-gray-100"
                >
                  <option value="active">
                    Active
                  </option>

                  <option value="disconnected">
                    Disconnected
                  </option>
                </select>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 border-t bg-gray-50 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="flex min-w-[160px] items-center justify-center gap-2 rounded-lg bg-orange-600 px-5 py-2.5 text-sm font-medium text-white shadow transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {editMode ? (
                submitting ? (
                  "Saving..."
                ) : (
                  "Save Changes"
                )
              ) : submitting ? (
                "Testing Connection..."
              ) : (
                <>
                  <FaKey className="h-4 w-4" />
                  Connect Gmail
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConnectionModal;
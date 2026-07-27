
// // import React, { useEffect, useState } from "react";
// // import {
// //   FaTimes,
// //   FaEye,
// //   FaEyeSlash,
// //   FaKey,
// // } from "react-icons/fa";
// // import { MdInfo, MdEmail } from "react-icons/md";
// // import axios from "axios";
// // import toast from "react-hot-toast";

// // const API_BASE_URL =
// //   "https://email-syncing-backend.vercel.app";

// // const ConnectionModal = ({
// //   isOpen,
// //   onClose,
// //   onSuccess,
// //   editMode = false,
// //   connectionData = null,
// //   onUpdated,
// // }) => {
// //   const [connectionName, setConnectionName] = useState(
// //     "My Gmail Connection"
// //   );

// //   const [status, setStatus] = useState("active");
// //   const [email, setEmail] = useState("");
// //   const [appPassword, setAppPassword] = useState("");
// //   const [showPassword, setShowPassword] = useState(false);
// //   const [submitting, setSubmitting] = useState(false);

// //   useEffect(() => {
// //     if (!isOpen) return;

// //     if (editMode && connectionData) {
// //       setConnectionName(
// //         connectionData.name || "My Gmail Connection"
// //       );
// //       setStatus(connectionData.status || "active");
// //       setEmail(connectionData.email || "");
// //       setAppPassword("");
// //       setShowPassword(false);
// //     } else {
// //       setConnectionName("My Gmail Connection");
// //       setStatus("active");
// //       setEmail("");
// //       setAppPassword("");
// //       setShowPassword(false);
// //     }
// //   }, [isOpen, editMode, connectionData]);

// //   const normalizeAppPassword = (value) => {
// //     return value.replace(/\s/g, "");
// //   };

// //   const formatAppPassword = (value) => {
// //     const cleanedValue = value
// //       .replace(/\s/g, "")
// //       .replace(/[^a-zA-Z0-9]/g, "")
// //       .slice(0, 16);

// //     return cleanedValue.match(/.{1,4}/g)?.join(" ") || "";
// //   };

// //   const isValidEmail = (value) => {
// //     return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
// //   };

// //   const validateCreateForm = () => {
// //     const cleanPassword =
// //       normalizeAppPassword(appPassword);

// //     if (!connectionName.trim()) {
// //       toast.error("Connection name is required.");
// //       return false;
// //     }

// //     if (!email.trim()) {
// //       toast.error("Gmail address is required.");
// //       return false;
// //     }

// //     if (!isValidEmail(email.trim())) {
// //       toast.error("Please enter a valid email address.");
// //       return false;
// //     }

// //     if (cleanPassword.length !== 16) {
// //       toast.error(
// //         "Google App Password must contain 16 characters."
// //       );
// //       return false;
// //     }

// //     return true;
// //   };

// //   const handleCreateConnection = async () => {
// //     if (!validateCreateForm()) return;

// //     const userId = localStorage.getItem("userid");

// //     if (!userId) {
// //       toast.error(
// //         "User not found. Please log in again."
// //       );
// //       return;
// //     }

// //     try {
// //       setSubmitting(true);

// //       const response = await axios.post(
// //         `${API_BASE_URL}/auth/gmail/app-password`,
// //         {
// //           userId,
// //           name: connectionName.trim(),
// //           email: email.trim().toLowerCase(),
// //           appPassword:
// //             normalizeAppPassword(appPassword),
// //         }
// //       );

// //       if (!response.data?.success) {
// //         toast.error(
// //           response.data?.message ||
// //             "Unable to connect Gmail account."
// //         );
// //         return;
// //       }

// //       toast.success(
// //         response.data?.message ||
// //           "Gmail connected successfully!"
// //       );

// //       onSuccess?.({
// //         ...response.data,
// //         triggerRefresh: true,
// //       });

// //       onClose();
// //     } catch (error) {
// //       console.error(
// //         "Gmail App Password connection error:",
// //         error
// //       );

// //       toast.error(
// //         error.response?.data?.message ||
// //           error.response?.data?.error ||
// //           "Unable to connect. Check your Gmail address and App Password."
// //       );
// //     } finally {
// //       setSubmitting(false);
// //     }
// //   };

// //   const handleUpdateConnection = async () => {
// //     if (!connectionName.trim()) {
// //       toast.error("Connection name is required.");
// //       return;
// //     }

// //     if (!connectionData?._id) {
// //       toast.error("Connection ID is missing.");
// //       return;
// //     }

// //     try {
// //       setSubmitting(true);

// //       const response = await axios.put(
// //         `${API_BASE_URL}/auth/connection/${connectionData._id}`,
// //         {
// //           name: connectionName.trim(),
// //           status,
// //         }
// //       );

// //       if (!response.data?.success) {
// //         toast.error(
// //           response.data?.message ||
// //             "Failed to update connection."
// //         );
// //         return;
// //       }

// //       toast.success(
// //         "Gmail connection updated successfully!"
// //       );

// //       onUpdated?.();
// //       onClose();
// //     } catch (error) {
// //       console.error(
// //         "Error updating Gmail connection:",
// //         error
// //       );

// //       toast.error(
// //         error.response?.data?.error ||
// //           error.response?.data?.message ||
// //           "Failed to update connection."
// //       );
// //     } finally {
// //       setSubmitting(false);
// //     }
// //   };

// //   const handleSubmit = async (event) => {
// //     event.preventDefault();

// //     if (editMode) {
// //       await handleUpdateConnection();
// //       return;
// //     }

// //     await handleCreateConnection();
// //   };

// //   if (!isOpen) return null;

// //   const passwordLength =
// //     normalizeAppPassword(appPassword).length;

// //   return (
// //     <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 px-4">
// //       <div className="w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-2xl animate-fadeIn">
// //         <div className="flex items-center justify-between bg-gradient-to-r from-[#e45341] to-[#f46654] px-5 py-4 text-white">
// //           <h2 className="text-sm font-semibold tracking-wide">
// //             {editMode
// //               ? "Edit Gmail Connection"
// //               : "Connect Gmail Account"}
// //           </h2>

// //           <button
// //             type="button"
// //             onClick={onClose}
// //             disabled={submitting}
// //             className="rounded-md p-1 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
// //             aria-label="Close modal"
// //           >
// //             <FaTimes className="h-5 w-5" />
// //           </button>
// //         </div>

// //         <form onSubmit={handleSubmit}>
// //           <div className="max-h-[72vh] space-y-5 overflow-y-auto p-6">
// //             <div>
// //               <label className="mb-2 block text-sm font-medium text-gray-700">
// //                 Connection Name
// //                 <span className="ml-1 text-red-500">
// //                   *
// //                 </span>
// //               </label>

// //               <input
// //                 type="text"
// //                 value={connectionName}
// //                 onChange={(event) =>
// //                   setConnectionName(event.target.value)
// //                 }
// //                 placeholder="My Gmail Connection"
// //                 disabled={submitting}
// //                 className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-gray-100"
// //               />
// //             </div>

// //             <div>
// //               <label className="mb-2 block text-sm font-medium text-gray-700">
// //                 Gmail Address
// //                 <span className="ml-1 text-red-500">
// //                   *
// //                 </span>
// //               </label>

// //               <div className="relative">
// //                 <MdEmail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

// //                 <input
// //                   type="email"
// //                   value={email}
// //                   onChange={(event) =>
// //                     setEmail(event.target.value)
// //                   }
// //                   placeholder="yourname@gmail.com"
// //                   autoComplete="email"
// //                   disabled={editMode || submitting}
// //                   className={`w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm outline-none transition ${
// //                     editMode
// //                       ? "cursor-not-allowed bg-gray-100 text-gray-500"
// //                       : "focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
// //                   }`}
// //                 />
// //               </div>
// //             </div>

// //             {!editMode && (
// //               <>
// //                 <div>
// //                   <label className="mb-2 block text-sm font-medium text-gray-700">
// //                     Google App Password
// //                     <span className="ml-1 text-red-500">
// //                       *
// //                     </span>
// //                   </label>

// //                   <div className="relative">
// //                     <FaKey className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

// //                     <input
// //                       type={
// //                         showPassword
// //                           ? "text"
// //                           : "password"
// //                       }
// //                       value={appPassword}
// //                       onChange={(event) =>
// //                         setAppPassword(
// //                           formatAppPassword(
// //                             event.target.value
// //                           )
// //                         )
// //                       }
// //                       placeholder="abcd efgh ijkl mnop"
// //                       autoComplete="new-password"
// //                       disabled={submitting}
// //                       className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-11 text-sm tracking-wider outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-gray-100"
// //                     />

// //                     <button
// //                       type="button"
// //                       onClick={() =>
// //                         setShowPassword(
// //                           (previousValue) =>
// //                             !previousValue
// //                         )
// //                       }
// //                       disabled={submitting}
// //                       className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-600 disabled:cursor-not-allowed"
// //                       aria-label={
// //                         showPassword
// //                           ? "Hide App Password"
// //                           : "Show App Password"
// //                       }
// //                     >
// //                       {showPassword ? (
// //                         <FaEyeSlash className="h-5 w-5" />
// //                       ) : (
// //                         <FaEye className="h-5 w-5" />
// //                       )}
// //                     </button>
// //                   </div>

// //                   <div className="mt-2 flex items-center justify-between">
// //                     <p className="text-xs text-gray-500">
// //                       Enter the App Password generated
// //                       from your Google account.
// //                     </p>

// //                     <span
// //                       className={`text-xs font-medium ${
// //                         passwordLength === 16
// //                           ? "text-green-600"
// //                           : "text-gray-400"
// //                       }`}
// //                     >
// //                       {passwordLength}/16
// //                     </span>
// //                   </div>
// //                 </div>

// //                 <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
// //                   <div className="flex items-start gap-3">
// //                     <MdInfo className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />

// //                     <div className="space-y-2 text-xs leading-5 text-gray-700">
// //                       <p className="font-semibold text-gray-800">
// //                         How to generate an App Password
// //                       </p>

// //                       <p>
// //                         1. Enable 2-Step Verification
// //                         on your Google account.
// //                       </p>

// //                       <p>
// //                         2. Open Google App Passwords.
// //                       </p>

// //                       <p>
// //                         3. Create a new App Password
// //                         for this application.
// //                       </p>

// //                       <p>
// //                         4. Paste the generated
// //                         16-character password above.
// //                       </p>

// //                       <a
// //                         href="https://myaccount.google.com/apppasswords"
// //                         target="_blank"
// //                         rel="noopener noreferrer"
// //                         className="inline-flex font-medium text-blue-600 underline hover:no-underline"
// //                       >
// //                         Generate Google App Password
// //                       </a>
// //                     </div>
// //                   </div>
// //                 </div>

// //                 <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3">
// //                   <MdInfo className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />

// //                   <p className="text-xs leading-5 text-gray-700">
// //                     Do not enter your normal Gmail
// //                     password. Only enter the App Password
// //                     generated by Google.
// //                   </p>
// //                 </div>

// //                 <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3">
// //                   <MdInfo className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-500" />

// //                   <p className="text-xs leading-5 text-gray-700">
// //                     Your Gmail account will be used for
// //                     both incoming emails through IMAP and
// //                     outgoing emails through SMTP.
// //                   </p>
// //                 </div>
// //               </>
// //             )}

// //             {editMode && (
// //               <div>
// //                 <label className="mb-2 block text-sm font-medium text-gray-700">
// //                   Status
// //                 </label>

// //                 <select
// //                   value={status}
// //                   onChange={(event) =>
// //                     setStatus(event.target.value)
// //                   }
// //                   disabled={submitting}
// //                   className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-gray-100"
// //                 >
// //                   <option value="active">
// //                     Active
// //                   </option>

// //                   <option value="disconnected">
// //                     Disconnected
// //                   </option>
// //                 </select>
// //               </div>
// //             )}
// //           </div>

// //           <div className="flex justify-end gap-3 border-t bg-gray-50 px-6 py-4">
// //             <button
// //               type="button"
// //               onClick={onClose}
// //               disabled={submitting}
// //               className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
// //             >
// //               Cancel
// //             </button>

// //             <button
// //               type="submit"
// //               disabled={submitting}
// //               className="flex min-w-[160px] items-center justify-center gap-2 rounded-lg bg-orange-600 px-5 py-2.5 text-sm font-medium text-white shadow transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
// //             >
// //               {editMode ? (
// //                 submitting ? (
// //                   "Saving..."
// //                 ) : (
// //                   "Save Changes"
// //                 )
// //               ) : submitting ? (
// //                 "Testing Connection..."
// //               ) : (
// //                 <>
// //                   <FaKey className="h-4 w-4" />
// //                   Connect Gmail
// //                 </>
// //               )}
// //             </button>
// //           </div>
// //         </form>
// //       </div>
// //     </div>
// //   );
// // };

// // export default ConnectionModal;
// import React, { useEffect, useState } from "react";
// import {
//   FaTimes,
//   FaEye,
//   FaEyeSlash,
//   FaKey,
//   FaLock,
//   FaChevronDown,
//   FaUserShield,
//   FaPlus,
//   FaClipboardCheck,
//   FaUser,
// } from "react-icons/fa";
// import { MdEmail, MdVerifiedUser } from "react-icons/md";
// import { FiShield } from "react-icons/fi";
// import axios from "axios";
// import toast from "react-hot-toast";

// const API_BASE_URL = "https://email-syncing-backend.vercel.app";

// // Small reusable field wrapper so every input keeps identical spacing,
// // label styling, help-icon, and helper-text treatment.
// const Field = ({ label, required, hint, children, helperText }) => (
//   <div>
//     <div className="mb-2 flex items-center gap-1.5">
//       <label className="text-sm font-semibold text-gray-800">
//         {label}
//         {required && <span className="ml-0.5 text-red-500">*</span>}
//       </label>
//       {hint && (
//         <span
//           title={hint}
//           className="flex h-4 w-4 cursor-help items-center justify-center rounded-full border border-gray-300 text-[10px] text-gray-400"
//         >
//           ?
//         </span>
//       )}
//     </div>
//     {children}
//     {helperText && (
//       <p className="mt-1.5 text-xs text-gray-500">{helperText}</p>
//     )}
//   </div>
// );

// const STEPS = [
//   {
//     icon: FaUserShield,
//     text: (
//       <>
//         Enable <span className="font-medium text-gray-800">2‑Step Verification</span> on your Google
//         Account
//       </>
//     ),
//   },
//   {
//     icon: FaLock,
//     text: (
//       <>
//         Go to{" "}
//         <a
//           href="https://myaccount.google.com/apppasswords"
//           target="_blank"
//           rel="noopener noreferrer"
//           className="font-medium text-indigo-600 underline hover:no-underline"
//         >
//           Google App Passwords
//         </a>{" "}
//         page
//       </>
//     ),
//   },
//   {
//     icon: FaPlus,
//     text: (
//       <>
//         Create a new App Password{" "}
//         <span className="text-gray-500">(Mail → Other)</span>
//       </>
//     ),
//   },
//   {
//     icon: FaClipboardCheck,
//     text: "Copy the 16‑character password and paste it here",
//   },
// ];

// const ConnectionModal = ({
//   isOpen,
//   onClose,
//   onSuccess,
//   editMode = false,
//   connectionData = null,
//   onUpdated,
// }) => {
//   const [connectionName, setConnectionName] = useState("My Gmail Connection");
//   const [status, setStatus] = useState("active");
//   const [email, setEmail] = useState("");
//   const [appPassword, setAppPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [submitting, setSubmitting] = useState(false);
//   const [showHelp, setShowHelp] = useState(false);

//   useEffect(() => {
//     if (!isOpen) return;

//     if (editMode && connectionData) {
//       setConnectionName(connectionData.name || "My Gmail Connection");
//       setStatus(connectionData.status || "active");
//       setEmail(connectionData.email || "");
//       setAppPassword("");
//       setShowPassword(false);
//     } else {
//       setConnectionName("My Gmail Connection");
//       setStatus("active");
//       setEmail("");
//       setAppPassword("");
//       setShowPassword(false);
//       setShowHelp(false);
//     }
//   }, [isOpen, editMode, connectionData]);

//   const normalizeAppPassword = (value) => value.replace(/\s/g, "");

//   const formatAppPassword = (value) => {
//     const cleanedValue = value
//       .replace(/\s/g, "")
//       .replace(/[^a-zA-Z0-9]/g, "")
//       .slice(0, 16);

//     return cleanedValue.match(/.{1,4}/g)?.join(" ") || "";
//   };

//   const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

//   const validateCreateForm = () => {
//     const cleanPassword = normalizeAppPassword(appPassword);

//     if (!connectionName.trim()) {
//       toast.error("Connection name is required.");
//       return false;
//     }
//     if (!email.trim()) {
//       toast.error("Gmail address is required.");
//       return false;
//     }
//     if (!isValidEmail(email.trim())) {
//       toast.error("Please enter a valid email address.");
//       return false;
//     }
//     if (cleanPassword.length !== 16) {
//       toast.error("Google App Password must contain 16 characters.");
//       return false;
//     }
//     return true;
//   };

//   const handleCreateConnection = async () => {
//     if (!validateCreateForm()) return;

//     const userId = localStorage.getItem("userid");
//     if (!userId) {
//       toast.error("User not found. Please log in again.");
//       return;
//     }

//     try {
//       setSubmitting(true);

//       const response = await axios.post(
//         `${API_BASE_URL}/auth/gmail/app-password`,
//         {
//           userId,
//           name: connectionName.trim(),
//           email: email.trim().toLowerCase(),
//           appPassword: normalizeAppPassword(appPassword),
//         }
//       );

//       if (!response.data?.success) {
//         toast.error(
//           response.data?.message || "Unable to connect Gmail account."
//         );
//         return;
//       }

//       toast.success(response.data?.message || "Gmail connected successfully!");
//       onSuccess?.({ ...response.data, triggerRefresh: true });
//       onClose();
//     } catch (error) {
//       console.error("Gmail App Password connection error:", error);
//       toast.error(
//         error.response?.data?.message ||
//           error.response?.data?.error ||
//           "Unable to connect. Check your Gmail address and App Password."
//       );
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const handleUpdateConnection = async () => {
//     if (!connectionName.trim()) {
//       toast.error("Connection name is required.");
//       return;
//     }
//     if (!connectionData?._id) {
//       toast.error("Connection ID is missing.");
//       return;
//     }

//     try {
//       setSubmitting(true);

//       const response = await axios.put(
//         `${API_BASE_URL}/auth/connection/${connectionData._id}`,
//         { name: connectionName.trim(), status }
//       );

//       if (!response.data?.success) {
//         toast.error(response.data?.message || "Failed to update connection.");
//         return;
//       }

//       toast.success("Gmail connection updated successfully!");
//       onUpdated?.();
//       onClose();
//     } catch (error) {
//       console.error("Error updating Gmail connection:", error);
//       toast.error(
//         error.response?.data?.error ||
//           error.response?.data?.message ||
//           "Failed to update connection."
//       );
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const handleSubmit = async (event) => {
//     event.preventDefault();
//     if (editMode) {
//       await handleUpdateConnection();
//       return;
//     }
//     await handleCreateConnection();
//   };

//   if (!isOpen) return null;

//   const passwordLength = normalizeAppPassword(appPassword).length;

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 px-4 py-8 backdrop-blur-sm">
//       <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
//         <form onSubmit={handleSubmit}>
//           <div className="max-h-[85vh] overflow-y-auto">
//             {/* Header */}
//             <div className="relative px-6 pb-5 pt-6">
//               <button
//                 type="button"
//                 onClick={onClose}
//                 disabled={submitting}
//                 className="absolute right-5 top-5 rounded-md p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-60"
//                 aria-label="Close modal"
//               >
//                 <FaTimes className="h-4 w-4" />
//               </button>

//               <div className="flex items-start gap-4">
//                 <div className="relative flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-gray-50 ring-1 ring-gray-200">
//                   <MdEmail className="h-8 w-8 text-red-500" />
//                   <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-green-500 ring-2 ring-white">
//                     <FaLock className="h-2.5 w-2.5 text-white" />
//                   </span>
//                 </div>

//                 <div className="pt-1">
//                   <h2 className="text-xl font-bold text-gray-900">
//                     {editMode ? "Edit Gmail Connection" : "Connect your Gmail"}
//                   </h2>
//                   <p className="mt-1 text-sm leading-5 text-gray-500">
//                     {editMode
//                       ? "Update this connection's name or status."
//                       : "Securely connect your Gmail account in less than a minute."}
//                   </p>
//                 </div>
//               </div>
//             </div>

//             <div className="space-y-5 px-6 pb-6">
//               {!editMode && (
//                 <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4">
//                   <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-green-500">
//                     <MdVerifiedUser className="h-5 w-5 text-white" />
//                   </span>
//                   <div className="flex-1">
//                     <p className="text-sm font-semibold text-green-700">
//                       Your Gmail password is NEVER required.
//                     </p>
//                     <p className="mt-0.5 text-xs leading-5 text-gray-600">
//                       For your security, we only use a Google App Password, so
//                       your personal Gmail password stays private.
//                     </p>
//                   </div>
//                   <FiShield className="mt-1 h-6 w-6 flex-shrink-0 text-green-400" />
//                 </div>
//               )}

//               <Field
//                 label="Connection Name"
//                 required
//                 hint="A label to help you identify this mailbox later."
//                 helperText="Used to identify this mailbox inside your account."
//               >
//                 <div className="relative">
//                   <FaUser className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
//                   <input
//                     type="text"
//                     value={connectionName}
//                     onChange={(event) => setConnectionName(event.target.value)}
//                     placeholder="e.g., Work Gmail"
//                     disabled={submitting}
//                     className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-gray-100"
//                   />
//                 </div>
//               </Field>

//               <Field
//                 label="Gmail Address"
//                 required
//                 helperText="We will use this email to sync incoming and outgoing messages."
//               >
//                 <div className="relative">
//                   <MdEmail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
//                   <input
//                     type="email"
//                     value={email}
//                     onChange={(event) => setEmail(event.target.value)}
//                     placeholder="youremail@gmail.com"
//                     autoComplete="email"
//                     disabled={editMode || submitting}
//                     className={`w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm outline-none transition ${
//                       editMode
//                         ? "cursor-not-allowed bg-gray-100 text-gray-500"
//                         : "focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
//                     }`}
//                   />
//                 </div>
//               </Field>

//               {!editMode && (
//                 <>
//                   <Field
//                     label="Google App Password"
//                     required
//                     hint="A 16-character code Google generates for third-party apps."
//                   >
//                     <div className="relative">
//                       <FaKey className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
//                       <input
//                         type={showPassword ? "text" : "password"}
//                         value={appPassword}
//                         onChange={(event) =>
//                           setAppPassword(formatAppPassword(event.target.value))
//                         }
//                         placeholder="abcd efgh ijkl mnop"
//                         autoComplete="new-password"
//                         disabled={submitting}
//                         className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-11 text-sm tracking-wider outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-gray-100"
//                       />
//                       <button
//                         type="button"
//                         onClick={() => setShowPassword((prev) => !prev)}
//                         disabled={submitting}
//                         className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-600 disabled:cursor-not-allowed"
//                         aria-label={showPassword ? "Hide App Password" : "Show App Password"}
//                       >
//                         {showPassword ? (
//                           <FaEyeSlash className="h-4 w-4" />
//                         ) : (
//                           <FaEye className="h-4 w-4" />
//                         )}
//                       </button>
//                     </div>

//                     <div className="mt-2 flex items-center justify-between gap-3">
//                       <p className="text-xs leading-5 text-gray-500">
//                         <span className="font-medium text-green-600">
//                           Not your Gmail password.
//                         </span>{" "}
//                         Paste the 16‑character App Password generated from your
//                         Google Account.
//                       </p>
//                       <span
//                         className={`flex-shrink-0 text-xs font-semibold ${
//                           passwordLength === 16 ? "text-green-600" : "text-gray-400"
//                         }`}
//                       >
//                         {passwordLength}/16
//                       </span>
//                     </div>

//                     <a
//                       href="https://myaccount.google.com/apppasswords"
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline"
//                     >
//                       Generate App Password ↗
//                     </a>
//                   </Field>

//                   {/* Collapsible help panel */}
//                   <div className="overflow-hidden rounded-xl border border-gray-200">
//                     <button
//                       type="button"
//                       onClick={() => setShowHelp((prev) => !prev)}
//                       className="flex w-full items-center gap-3 bg-gray-50 px-4 py-3 text-left transition hover:bg-gray-100"
//                     >
//                       <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
//                         ?
//                       </span>
//                       <span className="flex-1">
//                         <span className="block text-sm font-semibold text-gray-800">
//                           Need help generating an App Password?
//                         </span>
//                         <span className="block text-xs text-gray-500">
//                           Click to view step-by-step instructions.
//                         </span>
//                       </span>
//                       <FaChevronDown
//                         className={`h-3.5 w-3.5 flex-shrink-0 text-gray-400 transition-transform ${
//                           showHelp ? "rotate-180" : ""
//                         }`}
//                       />
//                     </button>

//                     {showHelp && (
//                       <div className="grid grid-cols-4 gap-2 px-4 pb-5 pt-4">
//                         {STEPS.map((step, index) => {
//                           const StepIcon = step.icon;
//                           return (
//                             <div
//                               key={index}
//                               className="flex flex-col items-center text-center"
//                             >
//                               <span className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500 text-white">
//                                 <StepIcon className="h-4 w-4" />
//                               </span>
//                               <span className="mt-2 text-[11px] font-medium leading-4 text-gray-600">
//                                 {index + 1}. {step.text}
//                               </span>
//                             </div>
//                           );
//                         })}
//                       </div>
//                     )}
//                   </div>

//                   <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3">
//                     <FaLock className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" />
//                     <p className="text-xs leading-5 text-gray-700">
//                       Do not enter your normal Gmail password. Only enter the
//                       App Password generated by Google.
//                     </p>
//                   </div>

//                   <div className="flex items-center justify-between gap-3 rounded-xl bg-gray-50 p-4">
//                     <div className="flex items-start gap-3">
//                       <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
//                         <FiShield className="h-4 w-4" />
//                       </span>
//                       <p className="text-xs leading-5 text-gray-600">
//                         Your App Password is encrypted before being stored.
//                         <br />
//                         You can remove this connection at any time.
//                       </p>
//                     </div>
//                     <span className="flex-shrink-0 text-2xl">🔒</span>
//                   </div>
//                 </>
//               )}

//               {editMode && (
//                 <Field label="Status">
//                   <select
//                     value={status}
//                     onChange={(event) => setStatus(event.target.value)}
//                     disabled={submitting}
//                     className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-gray-100"
//                   >
//                     <option value="active">Active</option>
//                     <option value="disconnected">Disconnected</option>
//                   </select>
//                 </Field>
//               )}
//             </div>
//           </div>

//           <div className="flex justify-end gap-3 border-t border-gray-100 bg-gray-50 px-6 py-4">
//             <button
//               type="button"
//               onClick={onClose}
//               disabled={submitting}
//               className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
//             >
//               Cancel
//             </button>

//             <button
//               type="submit"
//               disabled={submitting}
//               className="flex min-w-[190px] items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-500 px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:from-indigo-700 hover:to-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
//             >
//               {editMode ? (
//                 submitting ? (
//                   "Saving..."
//                 ) : (
//                   "Save Changes"
//                 )
//               ) : submitting ? (
//                 "Testing Connection..."
//               ) : (
//                 <>
//                   <FaLock className="h-3.5 w-3.5" />
//                   Connect Gmail Securely
//                 </>
//               )}
//             </button>
//           </div>

//           <div className="flex items-center justify-center gap-1.5 border-t border-gray-100 bg-white px-6 py-3">
//             <FaLock className="h-3 w-3 text-gray-400" />
//             <span className="text-xs text-gray-500">
//               We respect your privacy and keep your information safe.
//             </span>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default ConnectionModal;
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="flex max-h-[88vh] w-full max-w-[430px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto">
            <header className="relative border-b border-slate-100 px-5 py-4">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                aria-label="Close modal"
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
              >
                <FaTimes className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-3 pr-10">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50">
                  <SiGmail className="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-slate-900">
                    {editMode ? "Edit Gmail Connection" : "Connect Gmail"}
                  </h2>
                  <p className="mt-0.5 text-xs leading-5 text-slate-500">
                    {editMode
                      ? "Update the connection name or status."
                      : "Use a Google App Password to connect securely."}
                  </p>
                </div>
              </div>
            </header>

            <div className="space-y-4 px-5 py-4">
              {!editMode && (
                <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-3">
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                    <FiShield className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-emerald-800">
                      Your normal Gmail password is not required.
                    </p>
                    <p className="mt-1 text-[11px] leading-4 text-slate-600">
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
                    className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-[13px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-100"
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
                    className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-[13px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
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
                        className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-10 text-[13px] tracking-[0.08em] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-100"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((current) => !current)}
                        disabled={submitting}
                        aria-label={showPassword ? "Hide App Password" : "Show App Password"}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
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
                        className="inline-flex shrink-0 items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-700"
                      >
                        Generate password
                        <FiExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </Field>

                  <div className="overflow-hidden rounded-xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setShowHelp((current) => !current)}
                      className="flex w-full items-center justify-between gap-3 bg-slate-50 px-3 py-2.5 text-left hover:bg-slate-100"
                    >
                      <div>
                        <p className="text-xs font-medium text-slate-800">
                          How to generate an App Password
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-500">
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
                      <div className="space-y-2 border-t border-slate-200 px-3 py-3 text-[11px] leading-4 text-slate-600">
                        <p><strong className="text-slate-800">1.</strong> Enable 2-Step Verification on your Google Account.</p>
                        <p><strong className="text-slate-800">2.</strong> Open Google App Passwords.</p>
                        <p><strong className="text-slate-800">3.</strong> Create a new App Password.</p>
                        <p><strong className="text-slate-800">4.</strong> Copy the 16-character password and paste it above.</p>
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
                    className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-[13px] text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-100"
                  >
                    <option value="active">Active</option>
                    <option value="disconnected">Disconnected</option>
                  </select>
                </Field>
              )}
            </div>
          </div>

          <footer className="flex items-center justify-end gap-2 border-t border-slate-100 bg-white px-5 py-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="h-9 rounded-lg border border-slate-300 bg-white px-4 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex h-9 min-w-[135px] items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 text-xs font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FaLock className="h-3 w-3" />
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
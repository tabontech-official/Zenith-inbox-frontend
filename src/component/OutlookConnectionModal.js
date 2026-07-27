// import React, { useState } from "react";
// import toast from "react-hot-toast";
// import { FaMicrosoft } from "react-icons/fa";
// import { FiEye, FiEyeOff, FiX } from "react-icons/fi";

// const OutlookConnectionModal = ({
//   isOpen,
//   onClose,
//   onSuccess,
//   editMode = false,
//   connectionData = null,
//   onUpdated,
// }) => {
//   const [connectionType, setConnectionType] = useState("microsoft");
//   const [showPassword, setShowPassword] = useState(false);
//   const [status, setStatus] = useState("active");
//   const [submitting, setSubmitting] = useState(false);
//   const [form, setForm] = useState({
//     name: "My Outlook Connection",
//     provider: "smtp",
//     email: "",
//     fullName: "",
//     username: "",
//     password: "",
//     host: "smtp.office365.com",
//     port: "",
//   });

//   React.useEffect(() => {
//     if (isOpen) {
//       if (editMode && connectionData) {
//         setForm({
//           name: connectionData.name || "",
//           provider: connectionData.provider || "smtp",
//           email: connectionData.email || "",
//           fullName: connectionData.fullName || "",
//           username: connectionData.smtp?.username || "",
//           password: "",
//           host: connectionData.smtp?.host || "",
//           port: connectionData.smtp?.port || "",
//         });
//         setStatus(connectionData.status || "active");
//       } else {
//         setConnectionType("microsoft");
//         setForm({
//           name: "My Outlook Connection",
//           provider: "smtp",
//           email: "",
//           fullName: "",
//           username: "",
//           password: "",
//           host: "smtp.office365.com",
//           port: "",
//         });
//         setStatus("active");
//       }
//     }
//   }, [isOpen, editMode, connectionData]);

//   if (!isOpen) return null;

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleManualSubmit = async () => {
//     try {
//       const userId = localStorage.getItem("userid");
//       if (!userId) {
//         alert("User not found. Please login again.");
//         return;
//       }

//       const payload = { ...form, provider: "smtp", userId };

//       const res = await fetch(
//         "https://email-syncing-backend.vercel.app/auth/saveSmtpConnection",
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify(payload),
//         }
//       );

//       if (!res.ok) throw new Error("Failed to save connection");
//       const data = await res.json();

//       console.log("SMTP Outlook connection saved:", data);
//       onSuccess?.(data);
//       onClose();
//     } catch (err) {
//       console.error("Error saving connection:", err);
//       toast.error("Failed to save connection");
//     }
//   };

//   const handleEditSubmit = async (e) => {
//     e.preventDefault();
//     if (!form.name.trim()) {
//       toast.error("Connection name is required");
//       return;
//     }
//     const isSmtp = connectionData?.provider === "smtp";
//     let payload = {};

//     if (isSmtp) {
//       if (!form.email.trim()) {
//         toast.error("Email is required");
//         return;
//       }
//       payload = {
//         name: form.name.trim(),
//         email: form.email.trim(),
//         status: status,
//         smtp: {
//           host: form.host.trim(),
//           port: Number(form.port),
//           username: form.username.trim(),
//         }
//       };
//       if (form.password.trim() !== "") {
//         payload.smtp.password = form.password.trim();
//       }
//     } else {
//       payload = {
//         name: form.name.trim(),
//         status: status,
//       };
//     }

//     try {
//       setSubmitting(true);
//       const res = await fetch(
//         `https://email-syncing-backend.vercel.app/auth/connection/${connectionData._id}`,
//         {
//           method: "PUT",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify(payload),
//         }
//       );

//       const data = await res.json();
//       if (!res.ok) {
//         throw new Error(data.error || data.message || "Failed to update connection");
//       }

//       toast.success("Outlook connection updated successfully!");
//       onUpdated?.();
//       onClose();
//     } catch (err) {
//       console.error("Error updating connection:", err);
//       toast.error(err.message || "Failed to update connection");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const handleMicrosoftOAuth = () => {
//     const userId = localStorage.getItem("userid");
//     if (!userId) {
//       alert("User not found. Please login again.");
//       return;
//     }
//     const scenarioId = localStorage.getItem("scenarioId");
//     localStorage.setItem("shopifyEditingMode", scenarioId ? "update" : "add");
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
//         " Saved routerBranches before Microsoft OAuth:",
//         routerBranches
//       );
//     } catch (err) {
//       console.error(" Error saving routerBranches before redirect:", err);
//     }

//     onClose();

//     const currentPath = window.location.pathname.replace(/^\//, "");

//     window.location.href = `https://email-syncing-backend.vercel.app/auth/outlook?userId=${userId}&redirect=${encodeURIComponent(
//       currentPath
//     )}`;
//   };

//   return (
//     <div className="fixed inset-0 flex items-center justify-center z-50 p-4 sm:p-0">
//       {/* Blurred Backdrop */}
//       <div 
//         className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" 
//         onClick={onClose}
//       ></div>
      
//       {/* Modal Container */}
//       <div className="relative bg-white rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] w-full max-w-[460px] max-h-[90vh] flex flex-col overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-300">
        
//         {/* Header */}
//         <div className="relative shrink-0 flex items-center justify-between px-6 py-5 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white overflow-hidden">
//           <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
//           <div className="relative flex items-center space-x-3">
//             <div className="bg-white/20 p-2 rounded-lg backdrop-blur-md border border-white/30 shadow-inner">
//               <FaMicrosoft className="text-white text-xl drop-shadow-md" />
//             </div>
//             <h2 className="font-semibold text-xl tracking-tight text-white drop-shadow-sm">
//               {editMode ? "Edit Outlook Connection" : "Connect Outlook"}
//             </h2>
//           </div>
//           <button 
//             onClick={onClose}
//             className="relative text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-full transition-colors"
//           >
//             <FiX className="text-xl" />
//           </button>
//         </div>

//         {/* Body */}
//         <div className="p-7 space-y-6 bg-gray-50/30 overflow-y-auto">
//           {!editMode && (
//             <div className="group">
//               <label className="block text-[14px] font-semibold text-gray-700 mb-1.5 ml-1">
//                 Connection Type
//               </label>
//               <select
//                 value={connectionType}
//                 onChange={(e) => setConnectionType(e.target.value)}
//                 className="w-full bg-white border border-gray-200 hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none px-4 py-3 rounded-xl text-[14px] text-gray-800 transition-all shadow-sm cursor-pointer"
//               >
//                 <option value="other">Other (Custom SMTP)</option>
//                 <option value="microsoft">Microsoft 365 (OAuth)</option>
//               </select>
//             </div>
//           )}

//           {/* Add Mode: Custom SMTP OR Edit Mode: SMTP */}
//           {((!editMode && connectionType === "other") || (editMode && connectionData?.provider === "smtp")) && (
//             <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-5">
//               <div>
//                 <label className="block text-[14px] font-semibold text-gray-700 mb-1.5 ml-1">
//                   Connection Name
//                 </label>
//                 <input
//                   type="text"
//                   name="name"
//                   value={form.name}
//                   onChange={handleChange}
//                   className="w-full bg-white border border-gray-200 hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none px-4 py-3 rounded-xl text-[14px] text-gray-800 transition-all shadow-sm"
//                 />
//               </div>

//               <div>
//                 <label className="block text-[14px] font-semibold text-gray-700 mb-1.5 ml-1">
//                   Email Address
//                 </label>
//                 <input
//                   type="email"
//                   name="email"
//                   value={form.email}
//                   onChange={handleChange}
//                   className="w-full bg-white border border-gray-200 hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none px-4 py-3 rounded-xl text-[14px] text-gray-800 transition-all shadow-sm"
//                   placeholder="yourname@outlook.com"
//                 />
//               </div>

//               {!editMode && (
//                 <div>
//                   <label className="block text-[14px] font-semibold text-gray-700 mb-1.5 ml-1">
//                     Full Name
//                   </label>
//                   <input
//                     type="text"
//                     name="fullName"
//                     value={form.fullName}
//                     onChange={handleChange}
//                     className="w-full bg-white border border-gray-200 hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none px-4 py-3 rounded-xl text-[14px] text-gray-800 transition-all shadow-sm"
//                     placeholder="Your full name"
//                   />
//                 </div>
//               )}

//               <div>
//                 <label className="block text-[14px] font-semibold text-gray-700 mb-1.5 ml-1">
//                   Username
//                 </label>
//                 <input
//                   type="text"
//                   name="username"
//                   value={form.username}
//                   onChange={handleChange}
//                   className="w-full bg-white border border-gray-200 hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none px-4 py-3 rounded-xl text-[14px] text-gray-800 transition-all shadow-sm"
//                   placeholder="Usually same as email"
//                 />
//               </div>

//               <div>
//                 <label className="block text-[14px] font-semibold text-gray-700 mb-1.5 ml-1">
//                   Password / App Password
//                 </label>
//                 <div className="relative group">
//                   <input
//                     type={showPassword ? "text" : "password"}
//                     name="password"
//                     value={form.password}
//                     onChange={handleChange}
//                     className="w-full bg-white border border-gray-200 hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none px-4 py-3 pr-11 rounded-xl text-[14px] text-gray-800 transition-all shadow-sm"
//                     placeholder={editMode ? "Leave blank to keep current password" : "Enter password"}
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowPassword(!showPassword)}
//                     className="absolute right-3 top-3 text-gray-400 hover:text-blue-500 transition-colors bg-white px-1"
//                   >
//                     {showPassword ? <FiEyeOff className="text-lg" /> : <FiEye className="text-lg" />}
//                   </button>
//                 </div>
//                 <p className="text-xs text-gray-500 mt-2 ml-1 flex items-center">
//                   <span className="w-1 h-1 rounded-full bg-gray-400 mr-1.5"></span>
//                   If MFA is enabled, use an Outlook App Password.
//                 </p>
//               </div>

//               <div className="grid grid-cols-2 gap-5 pt-2">
//                 <div>
//                   <label className="block text-[14px] font-semibold text-gray-700 mb-1.5 ml-1">
//                     SMTP Host
//                   </label>
//                   <input
//                     type="text"
//                     name="host"
//                     value={form.host}
//                     onChange={handleChange}
//                     className="w-full bg-gray-50/50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none px-4 py-3 rounded-xl text-[14px] text-gray-800 transition-all shadow-sm"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-[14px] font-semibold text-gray-700 mb-1.5 ml-1">
//                     Port
//                   </label>
//                   <input
//                     type="number"
//                     name="port"
//                     value={form.port}
//                     onChange={handleChange}
//                     className="w-full bg-gray-50/50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none px-4 py-3 rounded-xl text-[14px] text-gray-800 transition-all shadow-sm"
//                   />
//                 </div>
//               </div>

//               {editMode && (
//                 <div className="pt-2">
//                   <label className="block text-[14px] font-semibold text-gray-700 mb-1.5 ml-1">
//                     Status
//                   </label>
//                   <select
//                     value={status}
//                     onChange={(e) => setStatus(e.target.value)}
//                     className="w-full bg-white border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none px-4 py-3 rounded-xl text-[14px] text-gray-800 transition-all shadow-sm cursor-pointer"
//                   >
//                     <option value="active">Active</option>
//                     <option value="disconnected">Disconnected</option>
//                   </select>
//                 </div>
//               )}
//             </div>
//           )}

//           {/* Edit Mode: OAuth Outlook */}
//           {editMode && connectionData?.provider === "outlook" && (
//             <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-5">
//               <div>
//                 <label className="block text-[14px] font-semibold text-gray-700 mb-1.5 ml-1">
//                   Connection Name
//                 </label>
//                 <input
//                   type="text"
//                   name="name"
//                   value={form.name}
//                   onChange={handleChange}
//                   className="w-full bg-white border border-gray-200 hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none px-4 py-3 rounded-xl text-[14px] text-gray-800 transition-all shadow-sm"
//                 />
//               </div>

//               <div>
//                 <label className="block text-[14px] font-semibold text-gray-700 mb-1.5 ml-1">
//                   Email Address
//                 </label>
//                 <input
//                   type="email"
//                   name="email"
//                   value={form.email}
//                   disabled
//                   className="w-full border border-gray-100 bg-gray-100/50 text-gray-500 px-4 py-3 rounded-xl text-[14px] cursor-not-allowed shadow-inner"
//                 />
//               </div>

//               <div>
//                 <label className="block text-[14px] font-semibold text-gray-700 mb-1.5 ml-1">
//                   Status
//                 </label>
//                 <select
//                   value={status}
//                   onChange={(e) => setStatus(e.target.value)}
//                   className="w-full bg-white border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none px-4 py-3 rounded-xl text-[14px] text-gray-800 transition-all shadow-sm cursor-pointer"
//                 >
//                   <option value="active">Active</option>
//                   <option value="disconnected">Disconnected</option>
//                 </select>
//               </div>
//             </div>
//           )}

//           {/* Add Mode: Microsoft OAuth */}
//           {!editMode && connectionType === "microsoft" && (
//             <div className="flex flex-col items-center justify-center py-10 px-4 animate-in fade-in zoom-in-95 duration-300">
//               <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-5 border border-blue-100 shadow-inner">
//                 <FaMicrosoft className="text-blue-600 text-3xl" />
//               </div>
//               <h3 className="text-lg font-semibold text-gray-900 mb-2">Connect Securely</h3>
//               <p className="text-[14px] text-gray-500 mb-8 text-center leading-relaxed px-4">
//                 You'll be securely redirected to Microsoft to authorize access for your Outlook account.
//               </p>
//               <button
//                 onClick={handleMicrosoftOAuth}
//                 className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3.5 rounded-xl shadow-lg shadow-blue-500/30 transform active:scale-95 transition-all font-semibold"
//               >
//                 <FaMicrosoft className="text-lg" />
//                 <span>Continue with Microsoft</span>
//               </button>
//             </div>
//           )}
//         </div>

//         {/* Footer actions */}
//         {(editMode || connectionType === "other") && (
//           <div className="flex justify-end space-x-3 px-7 py-5 bg-gray-50/80 border-t border-gray-100 backdrop-blur-md">
//             <button
//               onClick={onClose}
//               className="px-6 py-2.5 text-[14px] font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm"
//               disabled={submitting}
//             >
//               Cancel
//             </button>
//             <button
//               onClick={editMode ? handleEditSubmit : handleManualSubmit}
//               disabled={submitting}
//               className="px-6 py-2.5 text-[14px] font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:from-blue-700 hover:to-indigo-700 transform active:scale-95 transition-all disabled:opacity-70 disabled:active:scale-100"
//             >
//               {editMode ? (submitting ? "Saving..." : "Save Changes") : (submitting ? "Connecting..." : "Save Connection")}
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default OutlookConnectionModal;
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close modal"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
      />

      <div className="relative flex max-h-[90vh] w-full max-w-[520px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <header className="flex shrink-0 items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 text-white">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/30 bg-white/15">
              <FiMail className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-xl font-semibold">
                {editMode ? "Edit Email Connection" : "Connect Email"}
              </h2>
              <p className="mt-0.5 text-xs text-white/75">Custom SMTP connection</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-full p-2 text-white/80 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
            aria-label="Close"
          >
            <FiX className="h-5 w-5" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto bg-slate-50/50 p-6">
            <Field label="Connection Name">
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                disabled={submitting}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
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
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
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
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
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
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
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
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 pr-12"
                  placeholder={editMode ? "Leave blank to keep current password" : "Enter password or App Password"}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  disabled={submitting}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-blue-600"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                </button>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Use an App Password when required by your email provider.
              </p>
            </Field>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_140px]">
              <Field label="SMTP Host">
                <div className="relative">
                  <FiServer className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    name="host"
                    value={form.host}
                    onChange={handleChange}
                    disabled={submitting}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 pl-11"
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
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
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
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 cursor-pointer"
                >
                  <option value="active">Active</option>
                  <option value="disconnected">Disconnected</option>
                </select>
              </Field>
            )}
          </div>

          <footer className="flex shrink-0 justify-end gap-3 border-t border-slate-200 bg-white px-6 py-5">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:from-blue-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
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
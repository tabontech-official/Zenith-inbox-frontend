// import React, { useContext, useState } from "react";
// import {
//   FiUser,
//   FiMail,
//   FiClock,
//   FiEdit3,
//   FiSave,
//   FiGlobe,
//   FiPhone,
//   FiMessageCircle,
//   FiBriefcase,
//   FiMapPin,
//     FiShield,
//   FiSmartphone,
//   FiKey,

//   FiLink,
// } from "react-icons/fi";

// import { UserContext } from "../component/UserContext";
// import Sidebar from "../component/Sidebar";
// import Navbar from "../component/Navbar";
// import toast from "react-hot-toast";

// const Profile = () => {
//   const { user, organization, updateUser, updateOrganization, loading } =
//     useContext(UserContext);
//   const [imagePreview, setImagePreview] = useState(null);
// const [twoFactorMethod, setTwoFactorMethod] = useState("");
//   const [editing, setEditing] = useState(false);
//   const [saving, setSaving] = useState(false);
//   const [profileImageFile, setProfileImageFile] = useState(null);
// const [authenticatorSelected, setAuthenticatorSelected] = useState(false);
// const [twoFaLoading, setTwoFaLoading] = useState(false);
// const [qrCodeUrl, setQrCodeUrl] = useState("");
// const [manualKey, setManualKey] = useState("");
// const [twoFaToken, setTwoFaToken] = useState("");
// const [showTwoFaModal, setShowTwoFaModal] = useState(false);

// const handleSetupTwoFactor = async () => {
//   try {
//     setTwoFaLoading(true);

//     const res = await fetch(
//       "https://email-syncing-backend.vercel.app/auth/2fa/setup",
//       {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ userId: user._id }),
//       }
//     );

//     const data = await res.json();

//     if (!res.ok || !data.success) {
//       throw new Error(data.message || "Failed to setup 2FA");
//     }

//     setQrCodeUrl(data.qrCodeUrl);
//     setManualKey(data.manualKey);
//     setShowTwoFaModal(true);
//   } catch (error) {
//     toast.error(error.message || "Failed to setup 2FA");
//   } finally {
//     setTwoFaLoading(false);
//   }
// };

// const handleVerifyTwoFactor = async () => {
//   try {
//     if (!twoFaToken.trim()) {
//       toast.error("Enter the 6-digit code");
//       return;
//     }

//     const res = await fetch(
//       "https://email-syncing-backend.vercel.app/auth/2fa/verify-setup",
//       {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           userId: user._id,
//           token: twoFaToken,
//         }),
//       }
//     );

//     const data = await res.json();

//     if (!res.ok || !data.success) {
//       throw new Error(data.message || "Invalid code");
//     }

//     toast.success("Two-step authentication enabled");
//     updateUser({
//       ...user,
//       twoFactorEnabled: true,
//     });

//     setShowTwoFaModal(false);
//     setTwoFaToken("");
//     setQrCodeUrl("");
//     setManualKey("");
//   } catch (error) {
//     toast.error(error.message || "Failed to verify code");
//   }
// };

//   const [formData, setFormData] = useState({
//     fullName: user?.fullName || "",
//     email: user?.email || "",
//     role: user?.role || "",
//     timeZone: organization?.TimeZone || "UTC",

//     phone: organization?.phone || "",
//     whatsapp: organization?.whatsapp || "",
//     organizationName: organization?.organizationName || "",
//     website: organization?.website || "",
//     region: organization?.Region || "",
//     country: organization?.country || "",
//     address: organization?.address || "",
//     supportEmail: organization?.supportEmail || "",

//     hourlyRate: organization?.hourlyRate || "",
//     experienceYears: organization?.experienceYears || "",
//     services: organization?.services || "",
//   });

//   const handleChange = (e) =>
//     setFormData({ ...formData, [e.target.name]: e.target.value });

//   const handleSave = async () => {
//     try {
//       setSaving(true);

//       const fd = new FormData();

//       fd.append("fullName", formData.fullName);
//       fd.append("role", formData.role);
//       fd.append("phone", formData.phone);
//       fd.append("whatsapp", formData.whatsapp);
//       fd.append("TimeZone", formData.timeZone);

//       fd.append("organizationName", formData.organizationName);
//       fd.append("website", formData.website);
//       fd.append("Region", formData.region);
//       fd.append("country", formData.country);
//       fd.append("address", formData.address);
//       fd.append("supportEmail", formData.supportEmail);

//       fd.append("hourlyRate", formData.hourlyRate);
//       fd.append("experienceYears", formData.experienceYears);
//       fd.append("services", formData.services);

//       if (profileImageFile) {
//         fd.append("image", profileImageFile);
//       }

//       const res = await fetch(
//         `https://email-syncing-backend.vercel.app/auth/updateUserAndOrganization/${user._id}`,
//         {
//           method: "PUT",
//           body: fd,
//         }
//       );

//       const result = await res.json();
//       if (!res.ok) throw new Error(result.message);

//       updateUser(result.data.user);
//       updateOrganization(result.data.organization);

//       toast.success(
//         result.imageUpdated
//           ? "Profile  updated successfully"
//           : "Profile updated successfully"
//       );

//       setEditing(false);
//       setProfileImageFile(null);
//     } catch (error) {
//       console.error(error);
//       toast.error("Failed to update profile");
//     } finally {
//       setSaving(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-screen text-gray-500">
//         Loading profile...
//       </div>
//     );
//   }

//   return (
//     <div className="flex min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
//       <Sidebar />

//       <div className="flex-1 flex flex-col md:ml-64">
//         <div className="hidden sm:block">
//           <Navbar />
//         </div>

//         <div className="flex-1 p-10">
//           <div className="bg-white rounded-2xl shadow-xl p-10 max-w-5xl mx-auto">
//             <div className="flex flex-col items-center border-b pb-8">
//               <div className="relative w-24 h-24 mb-4">
//                 {imagePreview ? (
//                   <img
//                     src={imagePreview}
//                     alt="Profile Preview"
//                     className="w-24 h-24 rounded-full object-cover"
//                   />
//                 ) : user?.profileImage ? (
//                   <img
//                     src={user.profileImage}
//                     alt="Profile"
//                     className="w-24 h-24 rounded-full object-cover"
//                   />
//                 ) : (
//                   <div className="w-24 h-24 bg-indigo-600 text-white flex items-center justify-center rounded-full text-3xl font-semibold">
//                     {formData.fullName.slice(0, 2).toUpperCase()}
//                   </div>
//                 )}

//                 {editing && (
//                   <input
//                     type="file"
//                     accept="image/*"
//                     className="absolute inset-0 opacity-0 cursor-pointer"
//                     onChange={(e) => {
//                       const file = e.target.files[0];
//                       if (!file) return;

//                       setProfileImageFile(file);
//                       setImagePreview(URL.createObjectURL(file));
//                     }}
//                   />
//                 )}
//               </div>

//               <h1 className="text-2xl font-semibold text-gray-800">
//                 {formData.fullName}
//               </h1>

//               <p className="text-sm text-gray-500 mt-1">
//                 {formData.organizationName || "No organization"}
//               </p>

//               <button
//                 onClick={() => (editing ? handleSave() : setEditing(true))}
//                 disabled={saving}
//                 className="mt-4 flex items-center gap-2 text-sm px-5 py-2 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition disabled:opacity-70"
//               >
//                 {editing ? <FiSave /> : <FiEdit3 />}
//                 {editing
//                   ? saving
//                     ? "Saving..."
//                     : "Save Changes"
//                   : "Edit Profile"}
//               </button>
//             </div>

//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-10">
//               <ProfileField
//                 label="Full Name"
//                 icon={<FiUser />}
//                 editing={editing}
//                 name="fullName"
//                 value={formData.fullName}
//                 onChange={handleChange}
//               />
//               {/* <ProfileField
//                 label="Email"
//                 icon={<FiMail />}
//                 value={formData.email}
//                 readOnly
//               /> */}

//               {/* <ProfileField
//                 label="Role / Title"
//                 icon={<FiBriefcase />}
//                 editing={editing}
//                 name="role"
//                 value={formData.role}
//                 onChange={handleChange}
//               /> */}
//               <ProfileField
//                 label="Phone"
//                 icon={<FiPhone />}
//                 editing={editing}
//                 name="phone"
//                 value={formData.phone}
//                 onChange={handleChange}
//               />

//               <ProfileField
//                 label="WhatsApp"
//                 icon={<FiMessageCircle />}
//                 editing={editing}
//                 name="whatsapp"
//                 value={formData.whatsapp}
//                 onChange={handleChange}
//               />
//               <ProfileField
//                 label="Time Zone"
//                 icon={<FiClock />}
//                 editing={editing}
//                 name="timeZone"
//                 value={formData.timeZone}
//                 onChange={handleChange}
//                 select
//               />

//               <ProfileField
//                 label="Organization Name"
//                 icon={<FiUser />}
//                 editing={editing}
//                 name="organizationName"
//                 value={formData.organizationName}
//                 onChange={handleChange}
//               />
//               <ProfileField
//                 label="Website"
//                 icon={<FiLink />}
//                 editing={editing}
//                 name="website"
//                 value={formData.website}
//                 onChange={handleChange}
//               />

//               <ProfileField
//                 label="Region"
//                 icon={<FiGlobe />}
//                 editing={editing}
//                 name="region"
//                 value={formData.region}
//                 onChange={handleChange}
//               />
//               <ProfileField
//                 label="Country"
//                 icon={<FiGlobe />}
//                 editing={editing}
//                 name="country"
//                 value={formData.country}
//                 onChange={handleChange}
//               />
//               <ProfileField
//                 label="Hourly Rate"
//                 icon={<FiClock />}
//                 editing={editing}
//                 name="hourlyRate"
//                 value={formData.hourlyRate}
//                 onChange={handleChange}
//               />

//               <ProfileField
//                 label="Experience (Years)"
//                 icon={<FiBriefcase />}
//                 editing={editing}
//                 name="experienceYears"
//                 value={formData.experienceYears}
//                 onChange={handleChange}
//               />

//               <ProfileField
//                 label="Services Offered"
//                 icon={<FiMessageCircle />}
//                 editing={editing}
//                 name="services"
//                 value={formData.services}
//                 onChange={handleChange}
//               />

//               <ProfileField
//                 label="Address"
//                 icon={<FiMapPin />}
//                 editing={editing}
//                 name="address"
//                 value={formData.address}
//                 onChange={handleChange}
//               />
//             </div>
//             <div className="mt-10 border-t pt-8">
//   <div className="flex items-center gap-3 mb-6">
//     <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
//       <FiShield />
//     </div>

//     <div>
//       <h2 className="text-lg font-semibold text-gray-800">
//         Two-Step Authentication
//       </h2>
//       <p className="text-sm text-gray-500">
//         Protect your account using an authenticator app.
//       </p>
//     </div>
//   </div>

//   <button
//     type="button"
//     onClick={() => setAuthenticatorSelected(true)}
//     className={`w-full text-left rounded-xl border p-5 transition ${
//       authenticatorSelected
//         ? "border-indigo-500 bg-indigo-50"
//         : "border-gray-200 bg-white hover:bg-gray-50"
//     }`}
//   >
//     <div className="flex items-center gap-3 mb-3">
//       <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
//         <FiSmartphone />
//       </div>

//       <h3 className="font-semisemibold text-gray-800">
//         Authenticator App
//       </h3>
//     </div>

//     <p className="text-sm text-gray-500">
//       Use Google Authenticator, Microsoft Authenticator, or Authy to generate login codes.
//     </p>
//   </button>

//   {authenticatorSelected && (
//     <div className="mt-6 rounded-xl bg-gray-50 border p-5 flex items-center justify-between">
//       <div>
//         <p className="font-semisemibold text-gray-800">
//           Authenticator App selected
//         </p>
//         <p className="text-sm text-gray-500 mt-1">
//           Backend setup is required before enabling this option.
//         </p>
//       </div>

//     <button
//   type="button"
//   onClick={handleSetupTwoFactor}
//   disabled={twoFaLoading || user?.twoFactorEnabled}
//   className={`px-5 py-2 rounded-lg text-sm font-semisemibold transition ${
//     user?.twoFactorEnabled
//       ? "bg-green-100 text-green-700 cursor-not-allowed"
//       : "bg-indigo-600 text-white hover:bg-indigo-700"
//   }`}
// >
//   {user?.twoFactorEnabled
//     ? "Enabled"
//     : twoFaLoading
//       ? "Loading..."
//       : "Enable"}
// </button>
//     </div>
//   )}
// </div>
// {showTwoFaModal && (
//   <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
//     <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
//       <h2 className="text-xl font-semibold text-gray-800">
//         Setup Authenticator App
//       </h2>

//       <p className="mt-2 text-sm text-gray-500">
//         Scan this QR code with Google Authenticator, Microsoft Authenticator, or Authy.
//       </p>

//       {qrCodeUrl && (
//         <div className="mt-5 flex justify-center">
//           <img src={qrCodeUrl} alt="2FA QR Code" className="h-48 w-48" />
//         </div>
//       )}

//       <div className="mt-4 rounded-lg bg-gray-50 p-3 text-xs text-gray-600 break-all">
//         Manual key: {manualKey}
//       </div>

//       <input
//         type="text"
//         value={twoFaToken}
//         onChange={(e) => setTwoFaToken(e.target.value)}
//         maxLength={6}
//         placeholder="Enter 6-digit code"
//         className="mt-5 w-full rounded-lg border px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
//       />

//       <div className="mt-6 flex justify-end gap-3">
//         <button
//           onClick={() => setShowTwoFaModal(false)}
//           className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
//         >
//           Cancel
//         </button>

//         <button
//           onClick={handleVerifyTwoFactor}
//           className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semisemibold text-white hover:bg-indigo-700"
//         >
//           Verify & Enable
//         </button>
//       </div>
//     </div>
//   </div>
// )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// const ProfileField = ({
//   label,
//   icon,
//   name,
//   value,
//   onChange,
//   editing,
//   readOnly,
//   select,
// }) => (
//   <div className="flex flex-col gap-2">
//     <label className="text-sm text-gray-500">{label}</label>
//     <div className="flex items-center gap-2 border rounded-lg px-3 py-2 bg-gray-50">
//       <span className="text-gray-400">{icon}</span>

//       {editing && !readOnly ? (
//         select ? (
//           <select
//             name={name}
//             value={value}
//             onChange={onChange}
//             className="flex-1 bg-transparent outline-none text-gray-700"
//           >
//             <option value="UTC">UTC</option>
//             <option value="America/New_York">America/New_York</option>
//             <option value="Europe/London">Europe/London</option>
//             <option value="Asia/Karachi">Asia/Karachi</option>
//             <option value="Asia/Dubai">Asia/Dubai</option>
//           </select>
//         ) : (
//           <input
//             type="text"
//             name={name}
//             value={value}
//             onChange={onChange}
//             className="flex-1 bg-transparent outline-none text-gray-700"
//           />
//         )
//       ) : (
//         <span className="text-gray-800">{value || "—"}</span>
//       )}
//     </div>
//   </div>
// );

// export default Profile;
import React, { useContext, useState, useEffect } from "react";
import {
  FiUser,
  FiMail,
  FiClock,
  FiEdit3,
  FiSave,
  FiGlobe,
  FiPhone,
  FiMessageCircle,
  FiBriefcase,
  FiMapPin,
  FiShield,
  FiSmartphone,
  FiLink,
  FiX,
} from "react-icons/fi";

import { UserContext } from "../component/UserContext";
import Sidebar from "../component/Sidebar";
import Navbar from "../component/Navbar";
import toast from "react-hot-toast";

const Profile = () => {
  const { user, organization, updateUser, updateOrganization, loading } =
    useContext(UserContext);

  const [imagePreview, setImagePreview] = useState(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [authenticatorSelected, setAuthenticatorSelected] = useState(false);
  const [twoFaLoading, setTwoFaLoading] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [manualKey, setManualKey] = useState("");
  const [twoFaToken, setTwoFaToken] = useState("");
  const [showTwoFaModal, setShowTwoFaModal] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    role: "",
    timeZone: "UTC",
    phone: "",
    whatsapp: "",
    organizationName: "",
    website: "",
    region: "",
    country: "",
    address: "",
    supportEmail: "",
    hourlyRate: "",
    experienceYears: "",
    services: "",
  });

  useEffect(() => {
    if (user || organization) {
      setFormData({
        fullName: user?.fullName || "",
        email: user?.email || "",
        role: user?.role || "",
        timeZone: organization?.TimeZone || "UTC",
        phone: organization?.phone || "",
        whatsapp: organization?.whatsapp || "",
        organizationName: organization?.organizationName || "",
        website: organization?.website || "",
        region: organization?.Region || "",
        country: organization?.country || "",
        address: organization?.address || "",
        supportEmail: organization?.supportEmail || "",
        hourlyRate: organization?.hourlyRate || "",
        experienceYears: organization?.experienceYears || "",
        services: organization?.services || "",
      });
    }
  }, [user, organization]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSetupTwoFactor = async () => {
    try {
      setTwoFaLoading(true);
      const res = await fetch("https://email-syncing-backend.vercel.app/auth/2fa/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user._id }),
      });

      const data = await res.json();
      if (!res.ok || !data.success)
        throw new Error(data.message || "Failed to setup 2FA");

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

      const res = await fetch("https://email-syncing-backend.vercel.app/auth/2fa/verify-setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user._id, token: twoFaToken }),
      });

      const data = await res.json();
      if (!res.ok || !data.success)
        throw new Error(data.message || "Invalid code");

      toast.success("Two-step authentication enabled");
      updateUser({ ...user, twoFactorEnabled: true });
      setShowTwoFaModal(false);
      setTwoFaToken("");
      setQrCodeUrl("");
      setManualKey("");
    } catch (error) {
      toast.error(error.message || "Failed to verify code");
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const fd = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key === "timeZone") fd.append("TimeZone", formData.timeZone);
        else if (key === "region") fd.append("Region", formData.region);
        else fd.append(key, formData[key]);
      });

      if (profileImageFile) fd.append("image", profileImageFile);

      const res = await fetch(
        `https://email-syncing-backend.vercel.app/auth/updateUserAndOrganization/${user._id}`,
        {
          method: "PUT",
          body: fd,
        },
      );

      const result = await res.json();
      if (!res.ok) throw new Error(result.message);

      updateUser(result.data.user);
      updateOrganization(result.data.organization);
      toast.success("Profile updated successfully");
      setEditing(false);
      setProfileImageFile(null);
    } catch (error) {
      console.error(error);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#f8fafc] text-slate-500 font-medium">
        <div className="animate-pulse">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f4f7fc] text-[#334155] font-sans antialiased">
      <Sidebar />

      <div className="flex-1 flex flex-col md:ml-64">
        <div className="hidden sm:block">
          <Navbar />
        </div>

        <main className="flex-1 p-6 lg:p-8 max-w-[1400px] w-full mx-auto space-y-6">
          {/* Top Account Settings Heading Block */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/70 shadow-sm">
            <div>
              <h1 className="text-xl font-semibold text-[#0f172a]">
                Account Settings
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Manage your personal details, workspace settings and security
                preferences.
              </p>
            </div>
            <button
              onClick={() => (editing ? handleSave() : setEditing(true))}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semisemibold shadow-sm transition-all duration-150"
            >
              {editing ? (
                saving ? (
                  <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-indigo-600 border-t-transparent rounded-full" />
                ) : (
                  <FiSave className="w-3.5 h-3.5" />
                )
              ) : (
                <FiEdit3 className="w-3.5 h-3.5" />
              )}
              {editing
                ? saving
                  ? "Saving..."
                  : "Save Changes"
                : "Edit Profile"}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Side: Miniature Profile Info Widget */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-6 text-center">
                <div className="relative w-28 h-28 mx-auto mb-4 group">
                  <div className="w-full h-full rounded-full overflow-hidden bg-[#eef2ff] flex items-center justify-center">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : user?.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-2xl font-semibold text-[#4f46e5]">
                        {formData.fullName.slice(0, 2).toUpperCase() || "ME"}
                      </div>
                    )}
                  </div>
                  {editing && (
                    <label className="absolute inset-0 bg-black/40 text-white text-[11px] font-semisemibold rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150 cursor-pointer">
                      <FiEdit3 className="w-4 h-4 mb-0.5" />
                      <span>Change</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (!file) return;
                          setProfileImageFile(file);
                          setImagePreview(URL.createObjectURL(file));
                        }}
                      />
                    </label>
                  )}
                </div>

                <h2 className="text-lg font-semibold text-[#0f172a] tracking-tight">
                  {formData.fullName || "medspa trader"}
                </h2>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  {formData.organizationName || "Smith Marketing"}
                </p>

                <div className="mt-6 pt-5 border-t border-slate-100 text-left space-y-3.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Email Status</span>
                    <span className="font-semisemibold text-[#10b981] bg-[#ecfdf5] px-2 py-0.5 rounded-md text-[11px]">
                      Verified
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">2FA Protection</span>
                    <span
                      className={`font-semisemibold px-2 py-0.5 rounded-md text-[11px] ${user?.twoFactorEnabled ? "text-[#10b981] bg-[#ecfdf5]" : "text-amber-600 bg-amber-50"}`}
                    >
                      {user?.twoFactorEnabled ? "Active" : "Disabled"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Two-Step Authentication Card Minimal Structure */}
              <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-5 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#eef2ff] text-[#4f46e5] flex items-center justify-center flex-shrink-0">
                    <FiShield className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#0f172a] text-sm">
                      Two-Step Authentication (2FA)
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                      Secure your workspace ecosystem account with a time-based
                      multi-factor token check layer.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setAuthenticatorSelected(!authenticatorSelected)
                  }
                  className={`w-full text-left rounded-xl border p-3.5 transition-all duration-150 ${
                    authenticatorSelected
                      ? "border-[#4f46e5] bg-[#f5f7ff]"
                      : "border-slate-100 bg-white hover:border-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-500 flex items-center justify-center flex-shrink-0">
                      <FiSmartphone className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-700 text-xs">
                        Authenticator App
                      </h4>
                      <p className="text-[10px] text-slate-400">
                        Google Authenticator, Microsoft Authenticator, or Authy.
                      </p>
                    </div>
                  </div>
                </button>

                {authenticatorSelected && (
                  <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 space-y-3">
                    <p className="text-[11px] text-slate-400 leading-tight">
                      Configure and enable your multi-factor authentication
                      setup.
                    </p>{" "}
                    <button
                      type="button"
                      onClick={handleSetupTwoFactor}
                      disabled={twoFaLoading || user?.twoFactorEnabled}
                      className={`w-full py-2 rounded-lg text-xs font-semisemibold shadow-sm transition-all text-center ${
                        user?.twoFactorEnabled
                          ? "bg-emerald-50 text-emerald-700 cursor-not-allowed"
                          : "bg-[#4f46e5] text-white hover:bg-[#4338ca]"
                      }`}
                    >
                      {user?.twoFactorEnabled
                        ? "Active"
                        : twoFaLoading
                          ? "Loading..."
                          : "Setup Authenticator"}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right Side Fields Layout */}
            <div className="lg:col-span-8 space-y-6">
              {/* Form Block 1: Personal Details */}
              <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100">
                  <h3 className="font-semibold text-sm text-[#0f172a]">
                    Personal & Contact Details
                  </h3>
                </div>
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                  <ProfileField
                    label="Full Name"
                    icon={<FiUser />}
                    name="fullName"
                    value={formData.fullName}
                    editing={editing}
                    onChange={handleChange}
                  />
                  <ProfileField
                    label="Email Address"
                    icon={<FiMail />}
                    name="email"
                    value={formData.email}
                    editing={false}
                    readOnly
                  />
                  <ProfileField
                    label="Phone"
                    icon={<FiPhone />}
                    name="phone"
                    value={formData.phone}
                    editing={editing}
                    onChange={handleChange}
                  />
                  <ProfileField
                    label="WhatsApp"
                    icon={<FiMessageCircle />}
                    name="whatsapp"
                    value={formData.whatsapp}
                    editing={editing}
                    onChange={handleChange}
                  />
                  <div className="sm:col-span-2">
                    <ProfileField
                      label="Time Zone"
                      icon={<FiClock />}
                      name="timeZone"
                      value={formData.timeZone}
                      editing={editing}
                      onChange={handleChange}
                      select
                    />
                  </div>
                </div>
              </div>

              {/* Form Block 2: Organization Settings */}
              <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100">
                  <h3 className="font-semibold text-sm text-[#0f172a]">
                    Organization & Professional Data
                  </h3>
                </div>
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                  <ProfileField
                    label="Organization Name"
                    icon={<FiBriefcase />}
                    name="organizationName"
                    value={formData.organizationName}
                    editing={editing}
                    onChange={handleChange}
                  />
                  <ProfileField
                    label="Website"
                    icon={<FiLink />}
                    name="website"
                    value={formData.website}
                    editing={editing}
                    onChange={handleChange}
                  />
                  <ProfileField
                    label="Region"
                    icon={<FiGlobe />}
                    name="region"
                    value={formData.region}
                    editing={editing}
                    onChange={handleChange}
                  />
                  <ProfileField
                    label="Country"
                    icon={<FiGlobe />}
                    name="country"
                    value={formData.country}
                    editing={editing}
                    onChange={handleChange}
                  />
                  <ProfileField
                    label="Hourly Rate"
                    icon={<FiClock />}
                    name="hourlyRate"
                    value={formData.hourlyRate}
                    editing={editing}
                    onChange={handleChange}
                  />
                  <ProfileField
                    label="Experience (Years)"
                    icon={<FiBriefcase />}
                    name="experienceYears"
                    value={formData.experienceYears}
                    editing={editing}
                    onChange={handleChange}
                  />
                  {formData.services && (
                    <div className="sm:col-span-2">
                      <ProfileField
                        label="Services Offered"
                        icon={<FiMessageCircle />}
                        name="services"
                        value={formData.services}
                        editing={editing}
                        onChange={handleChange}
                      />
                    </div>
                  )}
                  {formData.address && (
                    <div className="sm:col-span-2">
                      <ProfileField
                        label="Address"
                        icon={<FiMapPin />}
                        name="address"
                        value={formData.address}
                        editing={editing}
                        onChange={handleChange}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Verification Code Activation Dialog Modal Layout */}
      {showTwoFaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 space-y-5 relative">
            <button
              onClick={() => setShowTwoFaModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1">
              <h2 className="text-lg font-semibold text-slate-900">
                Setup Authenticator App
              </h2>
              <p className="text-xs text-slate-400">
                Scan this code using your verification platform app.
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
                className="text-[#4f46e5] font-sans font-semisemibold hover:underline flex-shrink-0"
              >
                Copy
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semisemibold text-slate-500">
                Verification Code
              </label>
              <input
                type="text"
                value={twoFaToken}
                onChange={(e) => setTwoFaToken(e.target.value)}
                maxLength={6}
                placeholder="000 000"
                className="w-full tracking-[0.4em] text-center font-mono text-base rounded-xl border border-slate-200 px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>

            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setShowTwoFaModal(false)}
                className="flex-1 rounded-xl border border-slate-200 py-2 text-xs font-semisemibold text-slate-500 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleVerifyTwoFactor}
                className="flex-1 rounded-xl bg-[#4f46e5] py-2 text-xs font-semisemibold text-white hover:bg-[#4338ca] shadow-sm transition-all"
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

/* Internal ProfileField matching image_f04f86.png properties */
const ProfileField = ({
  label,
  icon,
  name,
  value,
  onChange,
  editing,
  readOnly,
  select,
}) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
      {label}
    </label>
    <div
      className={`flex items-center gap-2.5 w-full ${
        editing && !readOnly
          ? "border border-slate-200 bg-white rounded-xl px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500/10 focus-within:border-indigo-500"
          : "py-0.5"
      }`}
    >
      <span className="text-slate-400 text-sm flex-shrink-0">{icon}</span>

      {editing && !readOnly ? (
        select ? (
          <select
            name={name}
            value={value}
            onChange={onChange}
            className="flex-1 bg-transparent outline-none text-xs text-slate-700 cursor-pointer font-medium"
          >
            <option value="UTC">UTC</option>
            <option value="America/New_York">America/New_York</option>
            <option value="Europe/London">Europe/London</option>
            <option value="Asia/Karachi">Asia/Karachi</option>
            <option value="Asia/Dubai">Asia/Dubai</option>
          </select>
        ) : (
          <input
            type="text"
            name={name}
            value={value}
            onChange={onChange}
            className="flex-1 bg-transparent outline-none text-xs text-slate-700 font-medium"
          />
        )
      ) : (
        <span className="text-xs font-medium text-slate-700 truncate">
          {value || "—"}
        </span>
      )}
    </div>
  </div>
);

export default Profile;

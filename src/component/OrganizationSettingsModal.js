// import React, { useState, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { FiX, FiBriefcase, FiGlobe, FiClock, FiMapPin } from "react-icons/fi";
// import toast from "react-hot-toast";
// import axios from "axios";

// const OrganizationSettingsModal = ({ open, onClose }) => {
//   const [loading, setLoading] = useState(false);
//   const [formData, setFormData] = useState({
//     organizationName: "",
//     region: "",
//     timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "",
//     country: "",
//     partnerLink: "",
//   });

//   useEffect(() => {
//     if (open) fetchExistingOrganization();
//   }, [open]);

//   const fetchExistingOrganization = async () => {
//     const userId = localStorage.getItem("userid");
//     if (!userId) return;

//     try {
//       const res = await axios.get(
//         `https://email-syncing-backend.vercel.app/auth/organization/get/${userId}`,
//       );

//       if (res.data?.success && res.data.data) {
//         const org = res.data.data;
//         setFormData({
//           organizationName: org.organizationName || "",
//           region: org.Region || "",
//           timezone:
//             org.TimeZone || Intl.DateTimeFormat().resolvedOptions().timeZone,
//           country: org.country || "",
//           partnerLink: org.PartnerLink || "",
//         });
//       }
//     } catch (err) {
//       console.warn("No existing organization found or error fetching:", err);
//     }
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;

//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const userId = localStorage.getItem("userid");

//     if (!userId) {
//       toast.error("User ID not found — please log in again.");
//       return;
//     }

//     if (!formData.organizationName.trim()) {
//       toast.error("Organization name is required!");
//       return;
//     }

//     try {
//       setLoading(true);
//       toast.loading("Saving organization...", { id: "org" });

//       const res = await axios.post(
//         "https://email-syncing-backend.vercel.app/auth/organization/create",
//         {
//           userId,
//           organizationName: formData.organizationName,
//           Region: formData.region,
//           TimeZone: formData.timezone,
//           country: formData.country,
//           PartnerLink: formData.partnerLink,
//         },
//       );

//       toast.dismiss("org");

//       if (res.data.success) {
//         toast.success("Organization saved successfully!");
//         onClose();
//       } else {
//         toast.error(res.data.message || "Failed to save organization.");
//       }
//     } catch (err) {
//       console.error("createOrganization Error:", err);
//       toast.dismiss("org");
//       toast.error("Error while creating organization.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const inputClassName =
//     "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400";

//   const labelClassName = "mb-1.5 block text-sm font-semibold text-slate-700";

//   return (
//     <AnimatePresence>
//       {open && (
//         <motion.div
//           className="fixed inset-0 z-[9999] flex min-h-screen items-center justify-center overflow-y-auto bg-slate-950/45 p-4 backdrop-blur-sm"
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           exit={{ opacity: 0 }}
//           role="dialog"
//           aria-modal="true"
//           aria-labelledby="organization-settings-title"
//         >
//           <motion.div
//             className="relative my-auto flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
//             initial={{ scale: 0.96, opacity: 0 }}
//             animate={{ scale: 1, opacity: 1 }}
//             exit={{ scale: 0.96, opacity: 0 }}
//             transition={{ duration: 0.2, ease: "easeOut" }}
//           >
//             {/* Header */}
//             <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
//               <div>
//                 <h2
//                   id="organization-settings-title"
//                   className="text-xl font-semibold tracking-tight text-slate-950"
//                 >
//                   Organization Settings
//                 </h2>

//                 <p className="mt-1 text-sm leading-6 text-slate-500">
//                   Update your organization profile and regional settings.
//                 </p>
//               </div>

//               <button
//                 type="button"
//                 onClick={onClose}
//                 disabled={loading}
//                 className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-60"
//                 aria-label="Close modal"
//               >
//                 <FiX className="h-5 w-5" />
//               </button>
//             </div>

//             <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
//               {/* Body */}
//               <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
//                 <div className="space-y-4">
//                   <div>
//                     <label htmlFor="organizationName" className={labelClassName}>
//                       Organization Name <span className="text-red-500">*</span>
//                     </label>

//                     <div className="relative">
//                       <FiBriefcase className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

//                       <input
//                         id="organizationName"
//                         type="text"
//                         name="organizationName"
//                         value={formData.organizationName}
//                         onChange={handleChange}
//                         required
//                         disabled={loading}
//                         className={`${inputClassName} pl-10`}
//                         placeholder="Enter organization name"
//                       />
//                     </div>
//                   </div>

//                   <div>
//                     <label htmlFor="region" className={labelClassName}>
//                       Region
//                     </label>

//                     <div className="relative">
//                       <FiGlobe className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

//                       <input
//                         id="region"
//                         type="text"
//                         name="region"
//                         value={formData.region}
//                         onChange={handleChange}
//                         disabled={loading}
//                         placeholder="e.g. South Asia"
//                         className={`${inputClassName} pl-10`}
//                       />
//                     </div>
//                   </div>

//                   <div>
//                     <label htmlFor="timezone" className={labelClassName}>
//                       Timezone <span className="text-red-500">*</span>
//                     </label>

//                     <div className="relative">
//                       <FiClock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

//                       <input
//                         id="timezone"
//                         type="text"
//                         name="timezone"
//                         value={formData.timezone}
//                         onChange={handleChange}
//                         required
//                         disabled={loading}
//                         className={`${inputClassName} pl-10`}
//                         placeholder="Asia/Karachi"
//                       />
//                     </div>
//                   </div>

//                   <div>
//                     <label htmlFor="country" className={labelClassName}>
//                       Country <span className="text-red-500">*</span>
//                     </label>

//                     <div className="relative">
//                       <FiMapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

//                       <input
//                         id="country"
//                         type="text"
//                         name="country"
//                         value={formData.country}
//                         onChange={handleChange}
//                         required
//                         disabled={loading}
//                         className={`${inputClassName} pl-10`}
//                         placeholder="Pakistan"
//                       />
//                     </div>
//                   </div>

//                   {/* Partner Link is intentionally kept commented, same as your original code. */}
//                   {/* <div>
//                     <label htmlFor="partnerLink" className={labelClassName}>
//                       Partner Link
//                     </label>

//                     <input
//                       id="partnerLink"
//                       type="url"
//                       name="partnerLink"
//                       value={formData.partnerLink}
//                       onChange={handleChange}
//                       disabled={loading}
//                       placeholder="https://partner.example.com"
//                       className={inputClassName}
//                     />
//                   </div> */}
//                 </div>
//               </div>

//               {/* Footer */}
//               <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50/60 px-6 py-4">
//                 <button
//                   type="button"
//                   onClick={onClose}
//                   disabled={loading}
//                   className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-60"
//                 >
//                   Cancel
//                 </button>

//                 <button
//                   type="submit"
//                   disabled={loading}
//                   className={`inline-flex h-10 items-center justify-center rounded-xl px-5 text-sm font-semibold text-white transition focus:outline-none focus:ring-4 focus:ring-indigo-500/20 ${
//                     loading
//                       ? "cursor-not-allowed bg-slate-400"
//                       : "bg-indigo-600 hover:bg-indigo-700"
//                   }`}
//                 >
//                   {loading ? "Saving..." : "Save Changes"}
//                 </button>
//               </div>
//             </form>
//           </motion.div>
//         </motion.div>
//       )}
//     </AnimatePresence>
//   );
// };

// export default OrganizationSettingsModal;
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiBriefcase, FiGlobe, FiClock, FiMapPin } from "react-icons/fi";
import toast from "react-hot-toast";
import axios from "axios";

const OrganizationSettingsModal = ({ open, onClose }) => {
  const timezones = [
    "Asia/Karachi",
    "Asia/Dubai",
    "Asia/Riyadh",
    "Asia/Kolkata",
    "Asia/Dhaka",
    "Europe/London",
    "Europe/Berlin",
    "America/New_York",
    "America/Chicago",
    "America/Los_Angeles",
    "Australia/Sydney",
  ];

  const countries = [
    "Pakistan",
    "United Arab Emirates",
    "Saudi Arabia",
    "India",
    "Bangladesh",
    "United Kingdom",
    "Germany",
    "United States",
    "Canada",
    "Australia",
  ];

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    organizationName: "",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Karachi",
    country: "",
    partnerLink: "",
  });

  useEffect(() => {
    if (open) fetchExistingOrganization();
  }, [open]);

  const fetchExistingOrganization = async () => {
    const userId = localStorage.getItem("userid");
    if (!userId) return;

    try {
      const res = await axios.get(
        `https://email-syncing-backend.vercel.app/auth/organization/get/${userId}`,
      );

      if (res.data?.success && res.data.data) {
        const org = res.data.data;

        setFormData({
          organizationName: org.organizationName || "",
          timezone:
            org.TimeZone ||
            Intl.DateTimeFormat().resolvedOptions().timeZone ||
            "Asia/Karachi",
          country: org.country || "",
          partnerLink: org.PartnerLink || "",
        });
      }
    } catch (err) {
      console.warn("No existing organization found or error fetching:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userId = localStorage.getItem("userid");

    if (!userId) {
      toast.error("User ID not found — please log in again.");
      return;
    }

    if (!formData.organizationName.trim()) {
      toast.error("Organization name is required!");
      return;
    }

    if (!formData.timezone) {
      toast.error("Timezone is required!");
      return;
    }

    if (!formData.country) {
      toast.error("Country is required!");
      return;
    }

    try {
      setLoading(true);
      toast.loading("Saving organization...", { id: "org" });

      const res = await axios.post(
        "https://email-syncing-backend.vercel.app/auth/organization/create",
        {
          userId,
          organizationName: formData.organizationName,
          TimeZone: formData.timezone,
          country: formData.country,
          PartnerLink: formData.partnerLink,
        },
      );

      toast.dismiss("org");

      if (res.data.success) {
        toast.success("Organization saved successfully!");
        onClose();
      } else {
        toast.error(res.data.message || "Failed to save organization.");
      }
    } catch (err) {
      console.error("createOrganization Error:", err);
      toast.dismiss("org");
      toast.error("Error while creating organization.");
    } finally {
      setLoading(false);
    }
  };

  const inputClassName =
    "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400";

  const labelClassName = "mb-1.5 block text-sm font-semibold text-slate-700";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[9999] flex min-h-screen items-center justify-center overflow-y-auto bg-slate-950/45 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="organization-settings-title"
        >
          <motion.div
            className="relative my-auto flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
              <div>
                <h2
                  id="organization-settings-title"
                  className="text-xl font-semibold tracking-tight text-slate-950"
                >
                  Organization Settings
                </h2>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Update your organization profile and timezone settings.
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                aria-label="Close modal"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex min-h-0 flex-1 flex-col"
            >
              <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="organizationName" className={labelClassName}>
                      Organization Name <span className="text-red-500">*</span>
                    </label>

                    <div className="relative">
                      <FiBriefcase className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                      <input
                        id="organizationName"
                        type="text"
                        name="organizationName"
                        value={formData.organizationName}
                        onChange={handleChange}
                        required
                        disabled={loading}
                        className={`${inputClassName} pl-10`}
                        placeholder="Enter organization name"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="timezone" className={labelClassName}>
                      Timezone <span className="text-red-500">*</span>
                    </label>

                    <div className="relative">
                      <FiClock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                      <select
                        id="timezone"
                        name="timezone"
                        value={formData.timezone}
                        onChange={handleChange}
                        required
                        disabled={loading}
                        className={`${inputClassName} pl-10`}
                      >
                        <option value="">Select timezone</option>
                        {timezones.map((timezone) => (
                          <option key={timezone} value={timezone}>
                            {timezone}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="country" className={labelClassName}>
                      Country <span className="text-red-500">*</span>
                    </label>

                    <div className="relative">
                      <FiMapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                      <select
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        required
                        disabled={loading}
                        className={`${inputClassName} pl-10`}
                      >
                        <option value="">Select country</option>
                        {countries.map((country) => (
                          <option key={country} value={country}>
                            {country}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Partner Link is intentionally kept commented. */}
                  {/* <div>
                    <label htmlFor="partnerLink" className={labelClassName}>
                      Partner Link
                    </label>

                    <input
                      id="partnerLink"
                      type="url"
                      name="partnerLink"
                      value={formData.partnerLink}
                      onChange={handleChange}
                      disabled={loading}
                      placeholder="https://partner.example.com"
                      className={inputClassName}
                    />
                  </div> */}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50/60 px-6 py-4">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className={`inline-flex h-10 items-center justify-center rounded-xl px-5 text-sm font-semibold text-white transition focus:outline-none focus:ring-4 focus:ring-indigo-500/20 ${
                    loading
                      ? "cursor-not-allowed bg-slate-400"
                      : "bg-indigo-600 hover:bg-indigo-700"
                  }`}
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OrganizationSettingsModal;
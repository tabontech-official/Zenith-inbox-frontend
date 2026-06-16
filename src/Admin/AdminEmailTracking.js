// import React, { useEffect, useState, useMemo } from "react";
// import Sidebar from "../component/Sidebar";
// import {
//   FiChevronDown,
//   FiChevronUp,
//   FiMail,
//   FiLayers,
//   FiFileText,
//   FiFolder,
//   FiEye,
//   FiX,
//   FiFilter,
//   FiUser,
//   FiRefreshCcw,
// } from "react-icons/fi";

// const AdminEmailTracking = () => {
//   const [summary, setSummary] = useState([]);
//   const [expanded, setExpanded] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [selectedEmail, setSelectedEmail] = useState(null);

//   // 🔍 Filters
//   const [serviceFilter, setServiceFilter] = useState("");
//   const [templateFilter, setTemplateFilter] = useState("");
//   const [lastTriggeredFilter, setLastTriggeredFilter] = useState(false);

//   // Fetch Data
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const res = await fetch("https://email-syncing-backend.vercel.app/auth/email-tracking");
//         const data = await res.json();
//         setSummary(data.data || []);
//       } catch (err) {
//         console.error("Error loading summary:", err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchData();
//   }, []);

//   // 🧠 All unique services and templates for dropdowns
//   const allServices = useMemo(() => {
//     const set = new Set();
//     summary.forEach((u) => {
//       Object.keys(u.templatesByService || {}).forEach((s) => set.add(s));
//     });
//     return Array.from(set);
//   }, [summary]);

//   const allTemplates = useMemo(() => {
//     const set = new Set();
//     summary.forEach((u) =>
//       Object.values(u.templatesByService || {}).forEach((tpls) =>
//         tpls.forEach((t) => set.add(t.name))
//       )
//     );
//     return Array.from(set);
//   }, [summary]);

//   // 🎯 Apply filters to data
//   const filteredSummary = useMemo(() => {
//     return summary
//       .map((user) => {
//         let filteredEmails = user.emailTemplateMap || [];

//         if (serviceFilter)
//           filteredEmails = filteredEmails.filter(
//             (e) => e.serviceDetected === serviceFilter
//           );

//         if (templateFilter)
//           filteredEmails = filteredEmails.filter(
//             (e) => e.matchedTemplate === templateFilter
//           );

//         if (lastTriggeredFilter && filteredEmails.length > 0) {
//           const latest = filteredEmails.reduce((a, b) =>
//             new Date(a.date) > new Date(b.date) ? a : b
//           );
//           filteredEmails = [latest];
//         }

//         return { ...user, emailTemplateMap: filteredEmails };
//       })
//       .filter((u) => u.emailTemplateMap.length > 0);
//   }, [summary, serviceFilter, templateFilter, lastTriggeredFilter]);

//   // 🌀 Loading state
//   if (loading) {
//     return (
//       <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
//         <FiMail className="text-indigo-500 text-4xl mb-3 animate-bounce" />
//         <p className="text-gray-600 font-medium">Loading tracking data...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 md:ml-64 flex flex-col md:flex-row">
//       <Sidebar />

//       <main className="flex-1 p-6">
//         {/* --- Header --- */}
//         <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
//           <h1 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
//             <FiMail className="text-indigo-600" /> Email Tracking Overview
//           </h1>
//         </div>

//         {/* --- Filters Section --- */}
//         <div className="bg-white shadow-md border border-gray-100 rounded-xl p-4 mb-6">
//           <div className="flex flex-wrap items-center gap-4">
//             <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
//               <FiFilter className="text-indigo-600" />
//               <span>Filters</span>
//             </div>

//             {/* Service Filter */}
//             <div className="flex items-center gap-2">
//               <FiLayers className="text-indigo-500" />
//               <select
//                 value={serviceFilter}
//                 onChange={(e) => setServiceFilter(e.target.value)}
//                 className="border border-gray-300 rounded-md text-sm px-3 py-1 focus:ring-2 focus:ring-indigo-500 outline-none"
//               >
//                 <option value="">All Services</option>
//                 {allServices.map((s) => (
//                   <option key={s} value={s}>
//                     {s}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             {/* Template Filter */}
//             <div className="flex items-center gap-2">
//               <FiFileText className="text-indigo-500" />
//               <select
//                 value={templateFilter}
//                 onChange={(e) => setTemplateFilter(e.target.value)}
//                 className="border border-gray-300 rounded-md text-sm px-3 py-1 focus:ring-2 focus:ring-indigo-500 outline-none"
//               >
//                 <option value="">All Templates</option>
//                 {allTemplates.map((t) => (
//                   <option key={t} value={t}>
//                     {t}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             {/* Last Trigger Filter */}
//             <label className="flex items-center gap-2 text-sm text-gray-600">
//               <input
//                 type="checkbox"
//                 checked={lastTriggeredFilter}
//                 onChange={(e) => setLastTriggeredFilter(e.target.checked)}
//               />
//               Show only last triggered
//             </label>

//             {/* Reset */}
//             <button
//               onClick={() => {
//                 setServiceFilter("");
//                 setTemplateFilter("");
//                 setLastTriggeredFilter(false);
//               }}
//               className="flex items-center gap-1 text-gray-600 hover:text-indigo-600 text-sm font-medium transition"
//             >
//               <FiRefreshCcw /> Reset
//             </button>
//           </div>
//         </div>

//         {/* --- Main Table --- */}
//         <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
//           {filteredSummary.length === 0 ? (
//             <div className="p-8 text-center text-gray-500 text-sm">
//               No matching data found for selected filters.
//             </div>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="min-w-full text-sm text-left text-gray-700">
//                 <thead className="bg-gray-100 text-gray-500 text-xs uppercase">
//                   <tr>
//                     <th className="px-4 py-3">User</th>
//                     <th className="px-4 py-3 text-center">Emails</th>
//                     <th className="px-4 py-3 text-center">Active</th>
//                     <th className="px-4 py-3 text-center">Inactive</th>
//                     <th className="px-4 py-3 text-center">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {filteredSummary.map((item) => (
//                     <React.Fragment key={item.user._id}>
//                       {/* Main Row */}
//                       <tr className="hover:bg-gray-50 transition">
//                         <td className="px-4 py-3 flex items-center gap-2 font-medium text-gray-800">
//                           <FiUser className="text-indigo-500" />
//                           {item.user.fullName}
//                         </td>
//                         <td className="px-4 py-3 text-center">
//                           {item.totalEmails}
//                         </td>
//                         <td className="px-4 py-3 text-center text-green-600 font-semibold">
//                           {item.activeTemplates}
//                         </td>
//                         <td className="px-4 py-3 text-center text-gray-400 font-semibold">
//                           {item.inactiveTemplates}
//                         </td>
//                         <td className="px-4 py-3 text-center">
//                           <button
//                             onClick={() =>
//                               setExpanded(
//                                 expanded === item.user._id
//                                   ? null
//                                   : item.user._id
//                               )
//                             }
//                             className="text-indigo-600 text-xs font-semibold flex items-center justify-center gap-1 hover:text-indigo-800 transition"
//                           >
//                             {expanded === item.user._id ? (
//                               <>
//                                 Hide <FiChevronUp />
//                               </>
//                             ) : (
//                               <>
//                                 View <FiChevronDown />
//                               </>
//                             )}
//                           </button>
//                         </td>
//                       </tr>

//                       {/* Expanded Email Section */}
//                       {expanded === item.user._id && (
//                         <tr className="bg-gray-50/70">
//                           <td colSpan="6" className="p-5">
//                             <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
//                               <FiFileText className="text-indigo-500" />
//                               Filtered Email Logs
//                             </h4>

//                             <div className="overflow-x-auto border border-gray-200 rounded-md">
//                               <table className="min-w-full text-xs text-gray-700">
//                                 <thead className="bg-gray-100 text-gray-500 uppercase">
//                                   <tr>
//                                     <th className="px-3 py-2">Subject</th>
//                                     <th className="px-3 py-2">Template</th>
//                                     <th className="px-3 py-2">Service</th>
//                                     <th className="px-3 py-2">Platform</th>
//                                     <th className="px-3 py-2 text-right">
//                                       Date
//                                     </th>
//                                     <th className="px-3 py-2 text-right">
//                                       Action
//                                     </th>
//                                   </tr>
//                                 </thead>
//                                 <tbody>
//                                   {item.emailTemplateMap.map((e, idx) => (
//                                     <tr
//                                       key={idx}
//                                       className="border-t hover:bg-gray-50 transition"
//                                     >
//                                       <td className="px-3 py-2 flex items-center gap-2">
//                                         <FiMail className="text-indigo-400" />
//                                         {e.subject}
//                                       </td>
//                                       <td className="px-3 py-2">
//                                         {e.matchedTemplate}
//                                       </td>
//                                       <td className="px-3 py-2">
//                                         {e.serviceDetected}
//                                       </td>
//                                       <td className="px-3 py-2">
//                                         {e.detectedPlatform}
//                                       </td>
//                                       <td className="px-3 py-2 text-right text-gray-500">
//                                         {new Date(e.date).toLocaleString()}
//                                       </td>
//                                       <td className="px-3 py-2 text-right">
//                                         <button
//                                           onClick={() => setSelectedEmail(e)}
//                                           className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center gap-1 transition"
//                                         >
//                                           <FiEye /> View
//                                         </button>
//                                       </td>
//                                     </tr>
//                                   ))}
//                                 </tbody>
//                               </table>
//                             </div>
//                           </td>
//                         </tr>
//                       )}
//                     </React.Fragment>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>
//       </main>

//       {/* --- Email Modal --- */}
//       {selectedEmail && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
//           <div className="bg-white rounded-xl shadow-lg w-full max-w-3xl max-h-[85vh] overflow-y-auto p-6 relative animate-fadeIn">
//             <button
//               onClick={() => setSelectedEmail(null)}
//               className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition"
//             >
//               <FiX size={20} />
//             </button>

//             <h2 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
//               <FiMail className="text-indigo-500" /> {selectedEmail.subject}
//             </h2>

//             <div className="text-sm text-gray-600 mb-4 space-y-1">
//               <p>
//                 <strong>Template:</strong> {selectedEmail.matchedTemplate}
//               </p>
//               <p>
//                 <strong>Service:</strong> {selectedEmail.serviceDetected}
//               </p>
//               <p>
//                 <strong>Platform:</strong> {selectedEmail.detectedPlatform}
//               </p>
//               <p>
//                 <strong>Date:</strong>{" "}
//                 {new Date(selectedEmail.date).toLocaleString()}
//               </p>
//             </div>

//             <div className="border-t pt-3">
//               <h4 className="font-medium text-gray-700 mb-2">
//                 Email Body Preview
//               </h4>
//               <div
//                 className="bg-gray-50 border border-gray-200 rounded-md p-4 text-sm text-gray-700 overflow-auto"
//                 dangerouslySetInnerHTML={{
//                   __html: selectedEmail.htmlBody || "<p>No HTML body</p>",
//                 }}
//               ></div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AdminEmailTracking;
import React, { useEffect, useState, useMemo } from "react";
import Sidebar from "../component/Sidebar";
import { useNavigate } from "react-router-dom";
import {
  FiMail,
  FiLayers,
  FiFileText,
  FiFilter,
  FiUser,
  FiRefreshCcw,
  FiEye,
} from "react-icons/fi";

const AdminEmailTracking = () => {
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // Filters
  const [serviceFilter, setServiceFilter] = useState("");
  const [templateFilter, setTemplateFilter] = useState("");

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          "https://email-syncing-backend.vercel.app/auth/email-tracking"
        );
        const data = await res.json();
        setSummary(data.data || []);
      } catch (err) {
        console.error("Error loading summary:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Unique Services
  const allServices = useMemo(() => {
    const set = new Set();
    summary.forEach((u) => {
      Object.keys(u.templatesByService || {}).forEach((s) =>
        set.add(s)
      );
    });
    return Array.from(set);
  }, [summary]);

  // Unique Templates
  const allTemplates = useMemo(() => {
    const set = new Set();
    summary.forEach((u) =>
      Object.values(u.templatesByService || {}).forEach((tpls) =>
        tpls.forEach((t) => set.add(t.name))
      )
    );
    return Array.from(set);
  }, [summary]);

  // Filter users (based on their emails/templates)
  const filteredSummary = useMemo(() => {
    return summary.filter((user) => {
      const emails = user.emailTemplateMap || [];

      if (serviceFilter) {
        if (
          !emails.some(
            (e) => e.serviceDetected === serviceFilter
          )
        )
          return false;
      }

      if (templateFilter) {
        if (
          !emails.some(
            (e) => e.matchedTemplate === templateFilter
          )
        )
          return false;
      }

      return true;
    });
  }, [summary, serviceFilter, templateFilter]);

  // Loading
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <FiMail className="text-indigo-500 text-4xl mb-3 animate-bounce" />
        <p className="text-gray-600 font-medium">
          Loading tracking data...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 md:ml-64 flex">
      <Sidebar />

      <main className="flex-1 p-6">
        {/* Header */}
        <h1 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
          <FiMail className="text-indigo-600" />
          Email Tracking Overview
        </h1>

        {/* Filters */}
        <div className="bg-white shadow-md border rounded-xl p-4 mb-6 flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <FiFilter className="text-indigo-600" />
            Filters
          </div>

          {/* Service */}
          <div className="flex items-center gap-2">
            <FiLayers className="text-indigo-500" />
            <select
              value={serviceFilter}
              onChange={(e) =>
                setServiceFilter(e.target.value)
              }
              className="border rounded-md px-3 py-1 text-sm"
            >
              <option value="">All Services</option>
              {allServices.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Template */}
          <div className="flex items-center gap-2">
            <FiFileText className="text-indigo-500" />
            <select
              value={templateFilter}
              onChange={(e) =>
                setTemplateFilter(e.target.value)
              }
              className="border rounded-md px-3 py-1 text-sm"
            >
              <option value="">All Templates</option>
              {allTemplates.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Reset */}
          <button
            onClick={() => {
              setServiceFilter("");
              setTemplateFilter("");
            }}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-indigo-600"
          >
            <FiRefreshCcw /> Reset
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-md border overflow-hidden">
          {filteredSummary.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No users found.
            </div>
          ) : (
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 text-gray-500 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3 text-center">
                    Emails
                  </th>
                  <th className="px-4 py-3 text-center">
                    Active
                  </th>
                  <th className="px-4 py-3 text-center">
                    Inactive
                  </th>
                  <th className="px-4 py-3 text-center">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredSummary.map((item) => (
                  <tr
                    key={item.user._id}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 flex items-center gap-2 font-medium">
                      <FiUser className="text-indigo-500" />
                      {item.user.fullName}
                    </td>

                    <td className="px-4 py-3 text-center">
                      {item.totalEmails}
                    </td>

                    <td className="px-4 py-3 text-center text-green-600 font-semibold">
                      {item.activeTemplates}
                    </td>

                    <td className="px-4 py-3 text-center text-gray-400 font-semibold">
                      {item.inactiveTemplates}
                    </td>

                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() =>
                          navigate(
                            `/admin/email/${item.user._id}`
                          )
                        }
                        className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 justify-center"
                      >
                        <FiEye /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminEmailTracking;
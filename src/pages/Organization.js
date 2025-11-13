
// import React, { useState, useEffect } from "react";
// import Sidebar from "../component/Sidebar";
// import Navbar from "../component/Navbar";
// import { useNavigate } from "react-router-dom";
// import {
//   FiMail,
//   FiArrowLeft,
//   FiArrowRight,
//   FiEdit,
//   FiPlusCircle,
//   FiInbox,
// } from "react-icons/fi";
// import axios from "axios";
// import { motion } from "framer-motion";

// const Organization = () => {
//   const [automationOn, setAutomationOn] = useState(true);
//   const navigate = useNavigate();
//   const [emails, setEmails] = useState([]);
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [page, setPage] = useState(1);
//   const [limit] = useState(5);
//   const [totalPages, setTotalPages] = useState(1);
//   const [stats, setStats] = useState({
//     total: 0,
//     processed: 0,
//     partial: 0,
//     failed: 0,
//     pending: 0,
//   });
//   const [recentScenarios, setRecentScenarios] = useState([]);
//   const [scenariosLoading, setScenariosLoading] = useState(false);

//   const fetchEmails = async () => {
//     try {
//       setLoading(true);
//       const userId = localStorage.getItem("userid");
//       if (!userId) return console.error("No userId in localStorage");

//       const res = await axios.get(
//         `https://email-syncing-backend.vercel.app/mailhook/getAllEmails/${userId}?page=${page}&limit=${limit}`
//       );

//       setEmails(res.data?.data || []);
//       setTotalPages(res.data?.totalPages || 1);
//       setStats(res.data?.stats || {});
//     } catch (err) {
//       console.error("Error fetching emails:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchUser = async () => {
//     try {
//       const userId = localStorage.getItem("userid");
//       if (!userId) return console.error("No userId in localStorage");

//       const res = await axios.get(
//         `https://email-syncing-backend.vercel.app/auth/getUsers/${userId}`
//       );
//       setUser(res.data?.data || null);
//     } catch (err) {
//       console.error("Error fetching user:", err);
//     }
//   };

//   const fetchRecentScenarios = async () => {
//     try {
//       setScenariosLoading(true);
//       const userId = localStorage.getItem("userid");
//       if (!userId) return;

//       const res = await axios.get(
//         `https://email-syncing-backend.vercel.app/scenario/user/${userId}`
//       );

//       const scenarios = Array.isArray(res.data)
//         ? res.data
//         : res.data.data || [];

//       const recent = scenarios
//         .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
//         .slice(0, 5);

//       setRecentScenarios(recent);
//     } catch (err) {
//       console.error("Error fetching scenarios:", err);
//     } finally {
//       setScenariosLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchUser();
//     fetchRecentScenarios();
//   }, []);

//   useEffect(() => {
//     fetchEmails();
//   }, [page]);

//   const fetchEmailById = (id) => {
//     navigate(`/inbox`);
//   };

//   const getEmailStatus = (statuses) => {
//     if (!statuses || statuses.length === 0) return "Pending";
//     if (statuses.every((s) => s.status === "failed")) return "Failed";
//     if (statuses.every((s) => s.status === "completed")) return "Processed";
//     if (statuses.some((s) => s.status === "partial")) return "Partial";
//     return "Pending";
//   };

//   const rootEmails = emails.filter((e) => !e.isForwarded && !e.parentEmailId);

//   const statCards = [
//     { label: "Total Emails", value: stats.total },
//     { label: "Processed", value: stats.processed },
//     { label: "Partial", value: stats.partial },
//     { label: "Failed", value: stats.failed },
//     { label: "Pending", value: stats.pending },
//   ];

//   return (
//     <div className="flex min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 font-inter">
//       <Sidebar />

//       <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300">
//         <div className="hidden sm:block">
//           <Navbar />
//         </div>

//         <main className="flex-1 p-6 sm:p-8 overflow-auto">
//           <motion.div
//             className="flex flex-col sm:flex-row justify-between sm:items-center mb-10"
//             initial={{ opacity: 0, y: -20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.5 }}
//           >
//             <div>
//               <h1 className="text-4xl font-semibold text-gray-900 tracking-tight">
//                 Dashboard
//               </h1>
//               <p className="text-gray-500 mt-1 text-sm">
//                 Overview of your email automation and performance
//               </p>
//             </div>
//           </motion.div>

//           <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
//             {statCards.map((item, i) => (
//               <motion.div
//                 key={i}
//                 className="p-6 rounded-2xl shadow-sm hover:shadow-lg transition transform hover:-translate-y-1 bg-white border border-gray-100"
//                 initial={{ opacity: 0, y: 10 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: 0.05 * i, duration: 0.4 }}
//               >
//                 <p className="text-sm font-medium text-gray-500">
//                   {item.label}
//                 </p>
//                 <h2 className="text-4xl font-semibold mt-2 text-gray-900">
//                   {item.value}
//                 </h2>
//               </motion.div>
//             ))}
//           </section>

//           <motion.div
//             className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-10"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ duration: 0.5 }}
//           >
//             <div className="flex justify-between items-center mb-4">
//               <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
//                 <FiInbox className="text-indigo-600" /> Recent Scenarios
//               </h3>
//               <button
//                 onClick={() => navigate("/scenarios/all")}
//                 className="text-sm text-indigo-600 font-medium hover:underline"
//               >
//                 View More →
//               </button>
//             </div>

//             <div className="overflow-x-auto">
//               <table className="w-full text-sm">
//                 <thead className="bg-gray-50 text-gray-500 border-b">
//                   <tr>
//                     <th className="py-2 px-3 text-left">Scenario Name</th>
//                     <th className="py-2 px-3 text-left">Type</th>
//                     <th className="py-2 px-3 text-left">Status</th>
//                     <th className="py-2 px-3 text-left">Created</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {scenariosLoading ? (
//                     <tr>
//                       <td
//                         colSpan={4}
//                         className="py-8 text-center text-gray-500"
//                       >
//                         Loading scenarios...
//                       </td>
//                     </tr>
//                   ) : recentScenarios.length > 0 ? (
//                     recentScenarios.map((s, i) => (
//                       <motion.tr
//                         key={s._id}
//                         className="border-b last:border-none hover:bg-gray-50 transition cursor-pointer"
//                         initial={{ opacity: 0 }}
//                         animate={{ opacity: 1 }}
//                         transition={{ delay: 0.05 * i, duration: 0.4 }}
//                         onClick={() =>
//                           navigate(
//                             s.type === "shopify"
//                               ? `/scenarios/shopify/${s._id}`
//                               : `/scenarios/others/${s._id}`
//                           )
//                         }
//                       >
//                         <td className="py-3 px-3 font-semibold text-gray-800">
//                           {s.name || "Untitled Scenario"}
//                         </td>
//                         <td className="py-3 px-3 capitalize text-gray-600">
//                           {s.type || "N/A"}
//                         </td>
//                         <td className="py-3 px-3">
//                           {s.scenarioActive ? (
//                             <span className="bg-green-100 text-green-700 px-3 py-1 text-xs rounded-full font-medium">
//                               Active
//                             </span>
//                           ) : (
//                             <span className="bg-red-100 text-red-700 px-3 py-1 text-xs rounded-full font-medium">
//                               Inactive
//                             </span>
//                           )}
//                         </td>
//                         <td className="py-3 px-3 text-gray-500">
//                           {new Date(s.createdAt).toLocaleDateString("en-US", {
//                             year: "numeric",
//                             month: "short",
//                             day: "numeric",
//                           })}
//                         </td>
//                       </motion.tr>
//                     ))
//                   ) : (
//                     <tr>
//                       <td
//                         colSpan={4}
//                         className="py-8 text-center text-gray-400 italic"
//                       >
//                         No scenarios found
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           </motion.div>

//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//             <motion.div
//               className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ duration: 0.5 }}
//             >
//               <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-800">
//                 <FiInbox className="text-indigo-600" /> Recent Emails
//               </h3>

//               <div className="overflow-x-auto">
//                 <table className="w-full text-sm">
//                   <thead className="bg-gray-50 text-gray-500 border-b">
//                     <tr>
//                       <th className="py-2 px-3 text-left">From</th>
//                       <th className="py-2 px-3 text-left">Subject</th>
//                       <th className="py-2 px-3 text-left">Status</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {loading ? (
//                       <tr>
//                         <td
//                           colSpan={3}
//                           className="py-8 text-center text-gray-500"
//                         >
//                           Loading emails...
//                         </td>
//                       </tr>
//                     ) : rootEmails.length > 0 ? (
//                       rootEmails.map((email, i) => {
//                         const root = email.rootEmail || email;
//                         const status = getEmailStatus(
//                           email.statuses || root.statuses
//                         );
//                         const color =
//                           status === "Processed"
//                             ? "bg-green-100 text-green-700"
//                             : status === "Pending"
//                             ? "bg-yellow-100 text-yellow-700"
//                             : status === "Partial"
//                             ? "bg-blue-100 text-blue-700"
//                             : status === "Failed"
//                             ? "bg-red-100 text-red-700"
//                             : "bg-gray-100 text-gray-700";

//                         return (
//                           <motion.tr
//                             key={i}
//                             onClick={() => fetchEmailById(root._id)}
//                             className="border-b last:border-none hover:bg-gray-50 transition cursor-pointer"
//                             initial={{ opacity: 0 }}
//                             animate={{ opacity: 1 }}
//                             transition={{ delay: 0.1 * i, duration: 0.5 }}
//                           >
//                             <td className="py-3 px-3 font-semibold text-gray-800">
//                               {root.senderAddress || "N/A"}
//                             </td>
//                             <td className="py-3 px-3 text-gray-600 truncate max-w-xs">
//                               {root.subject || "No Subject"}
//                             </td>
//                             <td className="py-3 px-3">
//                               <span
//                                 className={`px-3 py-1 text-xs rounded-full font-medium ${color}`}
//                               >
//                                 {status}
//                               </span>
//                             </td>
//                           </motion.tr>
//                         );
//                       })
//                     ) : (
//                       <tr>
//                         <td
//                           colSpan={3}
//                           className="py-8 text-center text-gray-400 italic"
//                         >
//                           No recent emails found
//                         </td>
//                       </tr>
//                     )}
//                   </tbody>
//                 </table>
//               </div>

//               <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
//                 <button
//                   disabled={page === 1}
//                   onClick={() => setPage((p) => Math.max(p - 1, 1))}
//                   className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
//                     page === 1
//                       ? "bg-gray-100 text-gray-400 cursor-not-allowed"
//                       : "bg-indigo-600 text-white hover:bg-indigo-500"
//                   }`}
//                 >
//                   <FiArrowLeft /> Prev
//                 </button>

//                 <span className="text-gray-600 text-sm">
//                   Page {page} of {totalPages}
//                 </span>

//                 <button
//                   disabled={page === totalPages}
//                   onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
//                   className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
//                     page === totalPages
//                       ? "bg-gray-100 text-gray-400 cursor-not-allowed"
//                       : "bg-indigo-600 text-white hover:bg-indigo-500"
//                   }`}
//                 >
//                   Next <FiArrowRight />
//                 </button>
//               </div>
//             </motion.div>

//             <motion.div
//               className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ duration: 0.5 }}
//             >
//               <h3 className="text-lg font-semibold mb-4 text-gray-800">
//                 Quick Actions
//               </h3>
//               <div className="flex flex-col space-y-3">
//                 <button
//                   onClick={() => navigate("/connection")}
//                   className="flex items-center justify-center gap-2 bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-500 transition"
//                 >
//                   <FiMail /> Connect Inbox
//                 </button>
//                 <button
//                   onClick={() => navigate("/templates")}
//                   className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-200 transition"
//                 >
//                   <FiEdit /> Edit Templates
//                 </button>
//                 <button
//                   onClick={() => navigate("/scenarios/others")}
//                   className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-200 transition"
//                 >
//                   <FiPlusCircle /> Create Scenario
//                 </button>
//               </div>
//             </motion.div>
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// };

// export default Organization;

import React, { useState, useEffect } from "react";
import Sidebar from "../component/Sidebar";
import Navbar from "../component/Navbar";
import { useNavigate } from "react-router-dom";
import {
  FiMail,
  FiArrowLeft,
  FiArrowRight,
  FiEdit,
  FiPlusCircle,
  FiInbox,
} from "react-icons/fi";
import axios from "axios";
import { motion } from "framer-motion";

const Organization = () => {
  const [automationOn, setAutomationOn] = useState(true);
  const navigate = useNavigate();
  const [emails, setEmails] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    total: 0,
    processed: 0,
    partial: 0,
    failed: 0,
    pending: 0,
  });
  const [recentScenarios, setRecentScenarios] = useState([]);
  const [scenariosLoading, setScenariosLoading] = useState(false);

  const fetchEmails = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem("userid");
      if (!userId) return console.error("No userId in localStorage");

      const res = await axios.get(
        `https://email-syncing-backend.vercel.app/mailhook/getAllEmails/${userId}?page=${page}&limit=${limit}`
      );

      setEmails(res.data?.data || []);
      setTotalPages(res.data?.totalPages || 1);
      setStats(res.data?.stats || {});
    } catch (err) {
      console.error("Error fetching emails:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUser = async () => {
    try {
      const userId = localStorage.getItem("userid");
      if (!userId) return console.error("No userId in localStorage");

      const res = await axios.get(
        `https://email-syncing-backend.vercel.app/auth/getUsers/${userId}`
      );
      setUser(res.data?.data || null);
    } catch (err) {
      console.error("Error fetching user:", err);
    }
  };

  const fetchRecentScenarios = async () => {
    try {
      setScenariosLoading(true);
      const userId = localStorage.getItem("userid");
      if (!userId) return;

      const res = await axios.get(
        `https://email-syncing-backend.vercel.app/scenario/user/${userId}`
      );

      const scenarios = Array.isArray(res.data)
        ? res.data
        : res.data.data || [];

      const recent = scenarios
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

      setRecentScenarios(recent);
    } catch (err) {
      console.error("Error fetching scenarios:", err);
    } finally {
      setScenariosLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
    fetchRecentScenarios();
  }, []);

  useEffect(() => {
    fetchEmails();
  }, [page]);

  const fetchEmailById = (id) => {
    navigate(`/inbox`);
  };

  const getEmailStatus = (statuses) => {
    if (!statuses || statuses.length === 0) return "Pending";
    if (statuses.every((s) => s.status === "failed")) return "Failed";
    if (statuses.every((s) => s.status === "completed")) return "Processed";
    if (statuses.some((s) => s.status === "partial")) return "Partial";
    return "Pending";
  };

  const rootEmails = emails.filter((e) => !e.isForwarded && !e.parentEmailId);

  const statCards = [
    { label: "Total Emails", value: stats.total },
    { label: "Processed", value: stats.processed },
    { label: "Partial", value: stats.partial },
    { label: "Failed", value: stats.failed },
    { label: "Pending", value: stats.pending },
  ];

  return (
    <div className="flex min-h-screen bg-white  font-inter">
      <Sidebar />

      <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300">
        <div className="hidden sm:block">
          <Navbar />
        </div>

      <main className="relative flex-1 p-6 sm:p-8 overflow-auto">

 
<div
    className="
      relative
      ml-0 mr-4          /* LEFT attached, RIGHT small gap */
      rounded-3xl p-8 sm:p-10
      bg-white/30 backdrop-blur-xl
      border border-white/50 shadow-[0_8px_40px_rgba(0,0,0,0.15)]
      transition-all duration-500
    "
  >

    {/* 🔥 Background Video INSIDE glass container */}
    <video
      autoPlay
      loop
      muted
      playsInline
      className="absolute inset-0 w-full h-full object-cover -z-10 rounded-3xl"
    >
      <source src="https://cdn.shopify.com/videos/c/o/v/df08c454451b4622be7ffeb6d0eed475.mp4" type="video/mp4" />
    </video>

    {/* HEADER */}
    <motion.div
      className="flex flex-col sm:flex-row justify-between sm:items-center mb-10 relative z-10"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div>
        <h1 className="text-4xl font-semibold text-gray-900">
          Dashboard
        </h1>
        <p className="text-gray-700 mt-1 text-sm">
          Overview of your email automation and performance
        </p>
      </div>
    </motion.div>

   <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-10 relative z-10">
      {statCards.map((item, i) => (
        <motion.div
          key={i}
          className="
            p-6 rounded-2xl 
            bg-white/50 backdrop-blur-xl
            border border-white/80
            shadow-[0_6px_25px_rgba(0,0,0,0.10)]
            hover:shadow-[0_10px_35px_rgba(0,0,0,0.15)]
            transition transform hover:-translate-y-1
          "
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 * i, duration: 0.4 }}
        >
          <p className="text-sm font-medium text-gray-700">{item.label}</p>
          <h2 className="text-4xl font-semibold mt-2 text-gray-900">
            {item.value}
          </h2>
        </motion.div>
      ))}
    </section>
    {/* 🔹 RECENT SCENARIOS */}
    <motion.div
      className="
        rounded-2xl p-6 mb-10
        bg-white/50 backdrop-blur-xl
        border border-white/80
        shadow-[0_6px_30px_rgba(0,0,0,0.10)]
      "
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <FiInbox className="text-indigo-600" /> Recent Scenarios
        </h3>
        <button
          onClick={() => navigate("/scenarios/all")}
          className="text-sm text-indigo-600 font-medium hover:underline"
        >
          View More →
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-700 border-b">
            <tr>
              <th className="py-2 px-3 text-left">Scenario Name</th>
              <th className="py-2 px-3 text-left">Type</th>
              <th className="py-2 px-3 text-left">Status</th>
              <th className="py-2 px-3 text-left">Created</th>
            </tr>
          </thead>
          <tbody>
            {scenariosLoading ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-gray-600">
                  Loading scenarios...
                </td>
              </tr>
            ) : recentScenarios.length > 0 ? (
              recentScenarios.map((s, i) => (
                <motion.tr
                  key={s._id}
                  className="border-b last:border-none hover:bg-gray-200/50 transition cursor-pointer"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.05 * i, duration: 0.4 }}
                  onClick={() =>
                    navigate(
                      s.type === "shopify"
                        ? `/scenarios/shopify/${s._id}`
                        : `/scenarios/others/${s._id}`
                    )
                  }
                >
                  <td className="py-3 px-3 font-semibold text-gray-900">
                    {s.name || "Untitled Scenario"}
                  </td>
                  <td className="py-3 px-3 capitalize text-gray-700">
                    {s.type || "N/A"}
                  </td>
                  <td className="py-3 px-3">
                    {s.scenarioActive ? (
                      <span className="bg-green-100 text-green-700 px-3 py-1 text-xs rounded-full font-medium">
                        Active
                      </span>
                    ) : (
                      <span className="bg-red-100 text-red-700 px-3 py-1 text-xs rounded-full font-medium">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-gray-600">
                    {new Date(s.createdAt).toLocaleDateString()}
                  </td>
                </motion.tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="py-8 text-center text-gray-500 italic">
                  No scenarios found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>

    {/* TWO COLUMN */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

      {/* Recent Emails */}
      <motion.div
        className="
          lg:col-span-2 p-6
          bg-white/50 backdrop-blur-xl
          border border-white/80
          rounded-2xl shadow-[0_6px_30px_rgba(0,0,0,0.10)]
        "
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900">
          <FiInbox className="text-indigo-600" /> Recent Emails
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-700 border-b">
              <tr>
                <th className="py-2 px-3 text-left">From</th>
                <th className="py-2 px-3 text-left">Subject</th>
                <th className="py-2 px-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-gray-600">
                    Loading emails...
                  </td>
                </tr>
              ) : rootEmails.length > 0 ? (
                rootEmails.map((email, i) => {
                  const root = email.rootEmail || email;
                  const status = getEmailStatus(
                    email.statuses || root.statuses
                  );

                  const badgeColor =
                    status === "Processed"
                      ? "bg-green-100 text-green-700"
                      : status === "Pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : status === "Partial"
                      ? "bg-blue-100 text-blue-700"
                      : status === "Failed"
                      ? "bg-red-100 text-red-700"
                      : "bg-gray-100 text-gray-700";

                  return (
                    <motion.tr
                      key={i}
                      onClick={() => fetchEmailById(root._id)}
                      className="border-b hover:bg-gray-200/50 transition cursor-pointer"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 * i, duration: 0.5 }}
                    >
                      <td className="py-3 px-3 font-semibold text-gray-900">
                        {root.senderAddress || "N/A"}
                      </td>
                      <td className="py-3 px-3 text-gray-700 truncate max-w-xs">
                        {root.subject || "No Subject"}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-3 py-1 text-xs rounded-full font-medium ${badgeColor}`}>
                          {status}
                        </span>
                      </td>
                    </motion.tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-gray-500 italic">
                    No recent emails found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-300/40">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              page === 1
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-indigo-600 text-white hover:bg-indigo-500"
            }`}
          >
            <FiArrowLeft /> Prev
          </button>

          <span className="text-gray-700 text-sm">
            Page {page} of {totalPages}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              page === totalPages
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-indigo-600 text-white hover:bg-indigo-500"
            }`}
          >
            Next <FiArrowRight />
          </button>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        className="
          p-6
          bg-white/50 backdrop-blur-xl
          border border-white/80
          rounded-2xl shadow-[0_6px_30px_rgba(0,0,0,0.10)]
        "
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h3 className="text-lg font-semibold mb-4 text-gray-900">
          Quick Actions
        </h3>

        <div className="flex flex-col space-y-3">

          <button
            onClick={() => navigate("/connection")}
            className="flex items-center justify-center gap-2 bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-500 transition"
          >
            <FiMail /> Connect Inbox
          </button>

          <button
            onClick={() => navigate("/templates")}
            className="flex items-center justify-center gap-2 bg-gray-200 text-gray-900 py-2.5 rounded-lg font-medium hover:bg-gray-300 transition"
          >
            <FiEdit /> Edit Templates
          </button>

          <button
            onClick={() => navigate("/scenarios/others")}
            className="flex items-center justify-center gap-2 bg-gray-200 text-gray-900 py-2.5 rounded-lg font-medium hover:bg-gray-300 transition"
          >
            <FiPlusCircle /> Create Scenario
          </button>
        </div>
      </motion.div>
    </div>
  </div>
</main>


      </div>
    </div>
  );
};

export default Organization;

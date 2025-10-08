// import React, { useState, useEffect } from "react";
// import Sidebar from "../component/Sidebar";
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

//   useEffect(() => {
//     fetchUser();
//   }, []);

//   useEffect(() => {
//     fetchEmails();
//   }, [page]);

//   const fetchEmailById = async (id) => {
//     navigate(`/organization/email/${id}`);
//   };

//   const getEmailStatus = (statuses) => {
//     if (!statuses || statuses.length === 0) return "Pending";
//     if (statuses.every((s) => s.status === "failed")) return "Failed";
//     if (statuses.every((s) => s.status === "completed")) return "Processed";
//     if (statuses.some((s) => s.status === "partial")) return "Partial";
//     return "Pending";
//   };

//   const rootEmails = emails.filter((e) => !e.isForwarded && !e.parentEmailId);

//   return (
//     <div className="flex bg-gray-50 min-h-screen font-inter antialiased">
//       <Sidebar />

//       <main className="flex-1 md:ml-64 p-8 overflow-auto">
//         <div className="flex justify-between items-center mb-8 ">
//           <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>

//           <div className="flex items-center gap-3">
//             <span className="text-sm font-medium text-gray-700">
//               Automation
//             </span>
//             <label className="relative inline-flex items-center cursor-pointer">
//               <input
//                 type="checkbox"
//                 checked={automationOn}
//                 onChange={() => setAutomationOn(!automationOn)}
//                 className="sr-only peer"
//               />
//               <div className="w-11 h-6 bg-gray-300 peer-checked:bg-[#4F46E5] rounded-full transition-all"></div>
//               <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-5 transition-transform"></div>
//             </label>
//             <span
//               className={`text-sm font-semibold ${
//                 automationOn ? "text-green-600" : "text-gray-400"
//               }`}
//             >
//               {automationOn ? "ON" : "OFF"}
//             </span>
//           </div>
//         </div>

//         <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
//           {[
//             { label: "New", value: stats.pending || 12 },
//             { label: "Sent", value: stats.processed || 84 },
//             { label: "Pending", value: stats.partial || 8 },
//             { label: "Needs Review", value: stats.total || 3 },
//             { label: "Failed", value: stats.failed || 1 },
//           ].map((item, i) => (
//             <div
//               key={i}
//               className="bg-white shadow rounded-lg p-6 text-center hover:shadow-md transition"
//             >
//               <p className="text-gray-500 text-sm mb-1">{item.label}</p>
//               <h2 className="text-3xl font-bold text-gray-900">{item.value}</h2>
//             </div>
//           ))}
//         </section>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
//             <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
//               <FiInbox className="text-[#4F46E5]" /> Recent Emails
//             </h3>

//             <table className="w-full text-sm">
//               <thead className="text-left border-b text-gray-500">
//                 <tr>
//                   <th className="pb-2">From</th>
//                   <th className="pb-2">Subject</th>
//                   <th className="pb-2">Status</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {loading ? (
//                   <tr>
//                     <td colSpan={3} className="py-8 text-center text-gray-500">
//                       Loading emails...
//                     </td>
//                   </tr>
//                 ) : rootEmails.length > 0 ? (
//                   rootEmails.map((email, i) => {
//                     const root = email.rootEmail || email;
//                     const status = getEmailStatus(
//                       email.statuses || root.statuses
//                     );
//                     const color =
//                       status === "Processed"
//                         ? "bg-indigo-100 text-indigo-700"
//                         : status === "Pending"
//                         ? "bg-yellow-100 text-yellow-700"
//                         : status === "Partial"
//                         ? "bg-blue-100 text-blue-700"
//                         : status === "Failed"
//                         ? "bg-red-100 text-red-700"
//                         : "bg-gray-100 text-gray-700";

//                     return (
//                       <tr
//                         key={i}
//                         className="border-b last:border-none hover:bg-gray-50 transition cursor-pointer"
//                         onClick={() => fetchEmailById(root._id)}
//                       >
//                         <td className="py-3 font-semibold text-gray-800">
//                           {root.senderAddress || "N/A"}
//                         </td>
//                         <td className="py-3 text-gray-600">
//                           {root.subject || "No Subject"}
//                         </td>
//                         <td className="py-3">
//                           <span
//                             className={`px-3 py-1 text-xs rounded-full font-medium ${color}`}
//                           >
//                             {status}
//                           </span>
//                         </td>
//                       </tr>
//                     );
//                   })
//                 ) : (
//                   <tr>
//                     <td
//                       colSpan={3}
//                       className="text-center py-8 text-gray-500 italic"
//                     >
//                       No recent emails found
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>

//             <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
//               <button
//                 disabled={page === 1}
//                 onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
//                 className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition ${
//                   page === 1
//                     ? "bg-gray-200 text-gray-400 cursor-not-allowed"
//                     : "bg-[#4F46E5] text-white hover:bg-[#4338CA]"
//                 }`}
//               >
//                 <FiArrowLeft /> Prev
//               </button>

//               <span className="text-gray-600 text-sm">
//                 Page {page} of {totalPages}
//               </span>

//               <button
//                 disabled={page === totalPages}
//                 onClick={() =>
//                   setPage((prev) => Math.min(prev + 1, totalPages))
//                 }
//                 className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition ${
//                   page === totalPages
//                     ? "bg-gray-200 text-gray-400 cursor-not-allowed"
//                     : "bg-[#4F46E5] text-white hover:bg-[#4338CA]"
//                 }`}
//               >
//                 Next <FiArrowRight />
//               </button>
//             </div>
//           </div>

//           <div className="bg-white rounded-lg shadow p-6">
//             <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
//             <div className="flex flex-col space-y-3">
//               <button onClick={()=>navigate("/connection")} className="flex items-center justify-center gap-2 bg-[#4F46E5] text-white py-2 rounded-lg font-medium hover:bg-[#4338CA] transition">
//                 <FiMail /> Connect another inbox
//               </button>
//               <button
//                 onClick={() => navigate("/templates")}
//                 className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-200 transition"
//               >
//                 <FiEdit /> Edit templates
//               </button>
//               <button
//                 onClick={() => navigate("/scenarios/others")}
//                 className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-200 transition"
//               >
//                 <FiPlusCircle /> Create scenario
//               </button>
//             </div>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// };

// export default Organization;
import React, { useState, useEffect } from "react";
import Sidebar from "../component/Sidebar";
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

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    fetchEmails();
  }, [page]);

  const fetchEmailById = async (id) => {
    navigate(`/organization/email/${id}`);
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
    {
      label: "Total Emails",
      value: stats.total,
      color: "bg-blue-50 text-blue-700 border border-blue-100",
    },
    {
      label: "Processed",
      value: stats.processed,
      color: "bg-green-50 text-green-700 border border-green-100",
    },
    {
      label: "Partial",
      value: stats.partial,
      color: "bg-yellow-50 text-yellow-700 border border-yellow-100",
    },
    {
      label: "Failed",
      value: stats.failed,
      color: "bg-red-50 text-red-700 border border-red-100",
    },
    {
      label: "Pending",
      value: stats.pending,
      color: "bg-gray-50 text-gray-700 border border-gray-200",
    },
  ];

  return (
    <div className="flex bg-gradient-to-br from-indigo-50 via-white to-purple-50 min-h-screen font-inter">
      <Sidebar />

      <main className="flex-1 md:ml-64 p-8 overflow-auto">
        <motion.div
          className="flex flex-col sm:flex-row justify-between sm:items-center mb-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <h1 className="text-4xl font-semibold text-gray-900 tracking-tight">
              Dashboard
            </h1>
            <p className="text-gray-500 mt-1 text-sm">
              Overview of your email automation and performance
            </p>
          </div>

          <div className="flex items-center gap-3 mt-4 sm:mt-0 bg-white px-4 py-2 rounded-full shadow-sm border">
            <span className="text-sm font-medium text-gray-700">
              Automation
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={automationOn}
                onChange={() => setAutomationOn(!automationOn)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-indigo-300 rounded-full peer-checked:bg-indigo-600 transition-all"></div>
              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm peer-checked:translate-x-5 transition-transform"></div>
            </label>
            <span
              className={`text-xs font-semibold ${
                automationOn ? "text-green-600" : "text-gray-400"
              }`}
            >
              {automationOn ? "ON" : "OFF"}
            </span>
          </div>
        </motion.div>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
          {statCards.map((item, i) => (
            <motion.div
              key={i}
              className={`p-6 rounded-2xl shadow-sm hover:shadow-lg transition transform hover:-translate-y-1 bg-white border border-gray-100`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i, duration: 0.4 }}
            >
              <p className="text-sm font-medium text-gray-500">{item.label}</p>
              <h2 className="text-4xl font-semibold mt-2 text-gray-900">
                {item.value}
              </h2>
            </motion.div>
          ))}
        </section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Emails */}
          <motion.div
            className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-800">
              <FiInbox className="text-indigo-600" /> Recent Emails
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 border-b">
                  <tr>
                    <th className="py-2 px-3 text-left">From</th>
                    <th className="py-2 px-3 text-left">Subject</th>
                    <th className="py-2 px-3 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan={3}
                        className="py-8 text-center text-gray-500"
                      >
                        Loading emails...
                      </td>
                    </tr>
                  ) : rootEmails.length > 0 ? (
                    rootEmails.map((email, i) => {
                      const root = email.rootEmail || email;
                      const status = getEmailStatus(
                        email.statuses || root.statuses
                      );
                      const color =
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
                          className="border-b last:border-none hover:bg-gray-50 transition cursor-pointer"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.1 * i, duration: 0.5 }}
                        >
                          <td className="py-3 px-3 font-semibold text-gray-800">
                            {root.senderAddress || "N/A"}
                          </td>
                          <td className="py-3 px-3 text-gray-600 truncate max-w-xs">
                            {root.subject || "No Subject"}
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`px-3 py-1 text-xs rounded-full font-medium ${color}`}
                            >
                              {status}
                            </span>
                          </td>
                        </motion.tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={3}
                        className="py-8 text-center text-gray-400 italic"
                      >
                        No recent emails found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  page === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-indigo-600 text-white hover:bg-indigo-500"
                }`}
              >
                <FiArrowLeft /> Prev
              </button>

              <span className="text-gray-600 text-sm">
                Page {page} of {totalPages}
              </span>

              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  page === totalPages
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-indigo-600 text-white hover:bg-indigo-500"
                }`}
              >
                Next <FiArrowRight />
              </button>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
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
                className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-200 transition"
              >
                <FiEdit /> Edit Templates
              </button>
              <button
                onClick={() => navigate("/scenarios/others")}
                className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-200 transition"
              >
                <FiPlusCircle /> Create Scenario
              </button>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Organization;

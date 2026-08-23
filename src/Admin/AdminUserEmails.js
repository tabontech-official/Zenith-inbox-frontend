import { apiFetch } from "../utils/apiClient";
// import React, { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import { FiMail, FiEye } from "react-icons/fi";
// import Sidebar from "../component/Sidebar";

// const AdminUserEmails = () => {
//   const { userId } = useParams();
//   const [emails, setEmails] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedEmail, setSelectedEmail] = useState(null);

//   useEffect(() => {
//     const fetchUserEmails = async () => {
//       try {
//         const res = await apiFetch(
//           `https://email-syncing-backend.vercel.app/auth/email-tracking?userId=${userId}`
//         );
//         const data = await res.json();

//         const userData = data.data?.[0];
//         setEmails(userData?.emailTemplateMap || []);
//       } catch (err) {
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchUserEmails();
//   }, [userId]);

//   if (loading) return <p className="p-6">Loading...</p>;

//   return (
//     <div className="p-6">
//            <Sidebar />
//       <h1 className="text-xl font-semibold mb-4">
//         User Email Timeline
//       </h1>

//       <div className="space-y-4">
//         {emails.map((email) => (
//           <div
//             key={email.id}
//             className="border rounded-lg p-4 bg-white shadow-sm"
//           >
//             {/* MAIN EMAIL */}
//             <div className="flex justify-between items-center">
//               <div>
//                 <p className="font-medium">{email.subject}</p>
//                 <p className="text-xs text-gray-500">
//                   {new Date(email.date).toLocaleString()}
//                 </p>
//                 <p className="text-xs">
//                   Template: {email.matchedTemplate}
//                 </p>
//               </div>

//               <button
//                 onClick={() => setSelectedEmail(email)}
//                 className="text-indigo-600 flex items-center gap-1"
//               >
//                 <FiEye /> View
//               </button>
//             </div>

//             {/* 🔥 REPLIES SECTION */}
//             {email.replies?.length > 0 && (
//               <div className="mt-4 pl-4 border-l-2 border-gray-200 space-y-3">
//                 {email.replies.map((r) => (
//                   <div
//                     key={r.id}
//                     className="bg-gray-50 p-3 rounded"
//                   >
//                     <p className="text-sm font-medium">
//                       Reply: {r.subject}
//                     </p>
//                     <p className="text-xs text-gray-500">
//                       {new Date(r.date).toLocaleString()}
//                     </p>

//                     <button
//                       onClick={() => setSelectedEmail(r)}
//                       className="text-indigo-500 text-xs mt-1"
//                     >
//                       View Reply
//                     </button>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         ))}
//       </div>

//       {/* MODAL */}
//       {selectedEmail && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
//           <div className="bg-white p-6 rounded-lg w-[600px] max-h-[80vh] overflow-auto">
//             <h2 className="font-semibold mb-2">
//               {selectedEmail.subject}
//             </h2>

//             <div
//               dangerouslySetInnerHTML={{
//                 __html:
//                   selectedEmail.htmlBody || "<p>No content</p>",
//               }}
//             />

//             <button
//               onClick={() => setSelectedEmail(null)}
//               className="mt-4 text-red-500"
//             >
//               Close
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AdminUserEmails;
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  FiMail,
  FiEye,
  FiClock,
  FiArrowLeft,
  FiChevronRight,
  FiMessageSquare,
  FiX,
} from "react-icons/fi";
import PlatformAdminLayout from "./PlatformAdminLayout";

const AdminUserEmails = () => {
  const { userId } = useParams();
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmail, setSelectedEmail] = useState(null);

  useEffect(() => {
    const fetchUserEmails = async () => {
      try {
        const res = await apiFetch(
          `https://email-syncing-backend.vercel.app/auth/email-tracking?userId=${userId}`,
        );
        const data = await res.json();
        const userData = data.data?.[0];
        setEmails(userData?.emailTemplateMap || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserEmails();
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50  flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <PlatformAdminLayout pageTitle="User Email Timeline">
      <div className="p-4 md:p-8 font-sans">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <div
              className="flex items-center gap-2 text-slate-400 mb-2 cursor-pointer hover:text-indigo-600 transition-colors"
              onClick={() => window.history.back()}
            >
              <FiArrowLeft />{" "}
              <span className="text-sm font-medium">Back to Users</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
              Email Timeline
            </h1>
            <p className="text-slate-500 font-medium">
              Tracking interactions for User ID:{" "}
              <span className="text-indigo-600">#{userId?.slice(-6)}</span>
            </p>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-bold">
              {emails.length}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Total Emails Sent
              </p>
              <p className="text-sm font-bold text-slate-700">
                Outbound Activity
              </p>
            </div>
          </div>
        </div>

        {/* TIMELINE CONTAINER */}
        <div className="relative ">
          {/* Vertical Line */}
          <div className="absolute left-4 md:left-8 top-0 bottom-0 w-0.5 bg-slate-200 z-0"></div>

          <div className="space-y-8 relative z-10">
            {emails.length > 0 ? (
              emails.map((email) => (
                <div key={email.id} className="relative pl-12 md:pl-20 group">
                  {/* Timeline Dot */}
                  <div className="absolute left-[11px] md:left-[27px] top-2 w-4 h-4 rounded-full bg-white border-4 border-indigo-600 shadow-sm transition-transform group-hover:scale-125"></div>

                  {/* MAIN EMAIL CARD */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="mt-1 w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center">
                          <FiMail size={20} />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800 text-lg leading-tight mb-1">
                            {email.subject}
                          </h3>
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="flex items-center gap-1 text-xs font-bold text-slate-400">
                              <FiClock />{" "}
                              {new Date(email.date).toLocaleString()}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-wider border border-indigo-100">
                              {email.matchedTemplate}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedEmail(email)}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-100"
                      >
                        <FiEye /> Preview
                      </button>
                    </div>

                    {/* 🔥 REPLIES SECTION */}
                    {email.replies?.length > 0 && (
                      <div className="mt-6 space-y-3">
                        <div className="flex items-center gap-2 text-slate-400 mb-2">
                          <div className="h-[1px] flex-1 bg-slate-100"></div>
                          <span className="text-[10px] font-bold uppercase tracking-widest">
                            Conversation Thread
                          </span>
                          <div className="h-[1px] flex-1 bg-slate-100"></div>
                        </div>

                        {email.replies.map((r) => (
                          <div
                            key={r.id}
                            className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex items-center justify-between hover:bg-white hover:border-indigo-100 transition-all cursor-default"
                          >
                            <div className="flex items-center gap-3">
                              <FiMessageSquare className="text-indigo-400" />
                              <div>
                                <p className="text-sm font-bold text-slate-700">
                                  {r.subject}
                                </p>
                                <p className="text-[11px] text-slate-400 font-medium">
                                  {new Date(r.date).toLocaleString()}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => setSelectedEmail(r)}
                              className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                              title="View Reply"
                            >
                              <FiChevronRight size={20} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="ml-12 md:ml-20 bg-white p-12 rounded-3xl border-2 border-dashed border-slate-200 text-center">
                <FiMail size={48} className="mx-auto text-slate-200 mb-4" />
                <h3 className="text-xl font-bold text-slate-800">
                  No Email History
                </h3>
                <p className="text-slate-400">
                  This user hasn't received any automated emails yet.
                </p>
              </div>
            )}
          </div>
        </div>

        {selectedEmail && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setSelectedEmail(null)}
            ></div>
            <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col relative shadow-2xl animate-in fade-in zoom-in duration-200">
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">
                    {selectedEmail.subject}
                  </h2>
                  <p className="text-xs text-slate-400 font-bold uppercase mt-1 tracking-wider">
                    Email Content Preview
                  </p>
                </div>
                <button
                  onClick={() => setSelectedEmail(null)}
                  className="p-2 bg-slate-50 text-slate-400 hover:text-slate-600 rounded-xl transition-colors"
                >
                  <FiX size={20} />
                </button>
              </div>

              {/* Modal Body (Content) */}
              <div className="p-8 overflow-y-auto flex-1 bg-slate-50/30">
                <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm min-h-[300px]">
                  <div
                    className="prose prose-slate max-w-none text-slate-700"
                    dangerouslySetInnerHTML={{
                      __html:
                        selectedEmail.htmlBody ||
                        "<div class='text-center py-10 text-slate-300'>No HTML content found for this email.</div>",
                    }}
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-slate-100 text-right">
                <button
                  onClick={() => setSelectedEmail(null)}
                  className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-all"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PlatformAdminLayout>
  );
};

export default AdminUserEmails;

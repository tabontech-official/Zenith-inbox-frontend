// // import React, { useState, useEffect } from "react";
// // import Sidebar from "../component/Sidebar";
// // import axios from "axios";
// // import { motion, AnimatePresence } from "framer-motion";
// // import { FiArrowLeft } from "react-icons/fi";

// // const Inbox = () => {
// //   const [emails, setEmails] = useState([]);
// //   const [selectedEmail, setSelectedEmail] = useState(null);
// //   const [loading, setLoading] = useState(false);
// //   const [readEmails, setReadEmails] = useState(new Set());
// //   const [isMobileView, setIsMobileView] = useState(false);

// //   // ✅ Detect mobile view
// //   useEffect(() => {
// //     const handleResize = () => setIsMobileView(window.innerWidth < 768);
// //     handleResize();
// //     window.addEventListener("resize", handleResize);
// //     return () => window.removeEventListener("resize", handleResize);
// //   }, []);

// //   const fetchEmails = async () => {
// //     try {
// //       setLoading(true);
// //       const userId = localStorage.getItem("userid");
// //       const res = await axios.get(
// //         `https://email-syncing-backend.vercel.app/mailhook/getAllEmailsData/${userId}`
// //       );
// //       const data = res.data?.data?.rootEmails || [];
// //       setEmails(data);
// //       if (!isMobileView && data.length > 0) setSelectedEmail(data[0]);
// //     } catch (error) {
// //       console.error("Error fetching inbox emails:", error);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   useEffect(() => {
// //     fetchEmails();
// //   }, []);

// //   const handleEmailClick = (email) => {
// //     setSelectedEmail(email);
// //     setReadEmails((prev) => new Set(prev).add(email._id));
// //   };

// //   const handleBackToList = () => setSelectedEmail(null);

// //   const renderEmailContent = (email) => (
// //     <motion.div
// //       key={email._id}
// //       initial={{ opacity: 0, y: 10 }}
// //       animate={{ opacity: 1, y: 0 }}
// //       transition={{ duration: 0.3 }}
// //       className="mb-6 border-b pb-4 last:border-none"
// //     >
// //       <div className="flex items-start gap-3">
// //         <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold shadow-sm">
// //           {email.senderAddress?.charAt(0).toUpperCase() || "?"}
// //         </div>
// //         <div>
// //           <p className="text-sm text-gray-700">
// //             <strong>{email.senderAddress}</strong> →{" "}
// //             {email.recipientAddress || "me"}
// //           </p>
// //           <p className="text-xs text-gray-400 mb-2">
// //             {new Date(email.date).toLocaleString()}
// //           </p>

// //           {email.htmlBody ? (
// //             <div
// //               className="prose prose-sm text-gray-800 leading-relaxed"
// //               dangerouslySetInnerHTML={{ __html: email.htmlBody }}
// //             />
// //           ) : (
// //             <p className="text-gray-700 whitespace-pre-line">
// //               {email.textBody || "No message content"}
// //             </p>
// //           )}
// //         </div>
// //       </div>

// //       {email.children && email.children.length > 0 && (
// //         <div className="ml-10 mt-4 border-l-2 border-gray-200 pl-4">
// //           {email.children.map((child) => renderEmailContent(child))}
// //         </div>
// //       )}
// //     </motion.div>
// //   );

// //   // ✨ Framer Motion animation variants
// //   const slideVariants = {
// //     initial: { x: "100%" },
// //     animate: { x: 0 },
// //     exit: { x: "100%" },
// //   };

// //   return (
// //     <div className="flex bg-gradient-to-br from-gray-50 to-indigo-50 min-h-screen font-inter mt-6">
// //       <Sidebar />

// //       <main className="flex-1 md:ml-64 flex h-screen overflow-hidden mt-6">
// //         <div className="flex w-full bg-white rounded-2xl shadow-lg m-4 md:m-6 border border-gray-200 overflow-hidden relative">
// //           {/* 💌 Email List */}
// //           <motion.div
// //             className={`${
// //               isMobileView
// //                 ? selectedEmail
// //                   ? "hidden"
// //                   : "block"
// //                 : "w-1/3 border-r border-gray-200"
// //             } bg-gray-50 overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-300 transition-all`}
// //           >
// //             <div className="p-5 border-b border-gray-200 bg-white sticky top-0 z-10">
// //               <h2 className="text-lg font-semibold text-gray-800">
// //                 Inbox
// //               </h2>
// //               <p className="text-xs text-gray-500 mt-1">
// //                 Recent conversations
// //               </p>
// //             </div>

// //             {loading ? (
// //               <div className="flex justify-center items-center py-10 text-gray-500 text-sm">
// //                 Loading emails...
// //               </div>
// //             ) : emails.length === 0 ? (
// //               <div className="flex justify-center items-center py-10 text-gray-400 text-sm italic">
// //                 No emails found
// //               </div>
// //             ) : (
// //               <ul className="p-2">
// //                 {emails.map((email) => {
// //                   const isRead = readEmails.has(email._id);
// //                   const isSelected = selectedEmail?._id === email._id;

// //                   return (
// //                     <li
// //                       key={email._id}
// //                       onClick={() => handleEmailClick(email)}
// //                       className={`px-4 py-3 border-b rounded-lg cursor-pointer transition-all duration-200 ${
// //                         isSelected
// //                           ? "bg-indigo-50 border-l-4 border-indigo-600"
// //                           : !isRead
// //                           ? "bg-indigo-100 hover:bg-indigo-200"
// //                           : "hover:bg-gray-100"
// //                       }`}
// //                     >
// //                       <div className="flex justify-between items-center mb-1">
// //                         <p
// //                           className={`text-sm truncate ${
// //                             !isRead
// //                               ? "font-bold text-gray-900"
// //                               : "font-medium text-gray-800"
// //                           }`}
// //                         >
// //                           {email.senderAddress}
// //                         </p>
// //                         <span className="text-xs text-gray-400">
// //                           {new Date(email.date).toLocaleTimeString([], {
// //                             hour: "2-digit",
// //                             minute: "2-digit",
// //                           })}
// //                         </span>
// //                       </div>
// //                       <p
// //                         className={`text-sm truncate ${
// //                           !isRead
// //                             ? "text-gray-900 font-semibold"
// //                             : "text-gray-700"
// //                         }`}
// //                       >
// //                         {email.subject || "No Subject"}
// //                       </p>
// //                       <p className="text-xs text-gray-500 truncate">
// //                         {email.textBody?.slice(0, 70) ||
// //                           "No preview available"}
// //                       </p>
// //                     </li>
// //                   );
// //                 })}
// //               </ul>
// //             )}
// //           </motion.div>

// //           {/* 📬 Email View */}
// //           <AnimatePresence mode="wait">
// //             {selectedEmail && (
// //               <motion.div
// //                 key={selectedEmail._id}
// //                 variants={slideVariants}
// //                 initial="initial"
// //                 animate="animate"
// //                 exit="exit"
// //                 transition={{ duration: 0.3 }}
// //                 className={`absolute md:static top-0 left-0 w-full md:w-2/3 h-full bg-white overflow-y-auto p-6 md:p-8`}
// //               >
// //                 {/* Mobile Back Button */}
// //                 {isMobileView && (
// //                   <button
// //                     onClick={handleBackToList}
// //                     className="flex items-center gap-2 text-indigo-600 mb-4"
// //                   >
// //                     <FiArrowLeft className="text-xl" /> Back
// //                   </button>
// //                 )}

// //                 <div className="border-b pb-4 mb-6">
// //                   <h3 className="text-2xl font-semibold text-gray-900 mb-1">
// //                     {selectedEmail.subject || "No Subject"}
// //                   </h3>
// //                   <p className="text-sm text-gray-600">
// //                     From:{" "}
// //                     <span className="font-medium text-gray-800">
// //                       {selectedEmail.senderAddress}
// //                     </span>
// //                   </p>
// //                   <p className="text-xs text-gray-400 mt-1">
// //                     {new Date(selectedEmail.date).toLocaleString()}
// //                   </p>
// //                 </div>

// //                 {renderEmailContent(selectedEmail)}
// //               </motion.div>
// //             )}
// //           </AnimatePresence>
// //         </div>
// //       </main>
// //     </div>
// //   );
// // };

// // export default Inbox;
// import React, { useState, useEffect } from "react";
// import Sidebar from "../component/Sidebar";
// import axios from "axios";
// import { motion, AnimatePresence } from "framer-motion";
// import { FiArrowLeft } from "react-icons/fi";

// const Inbox = () => {
//   const [emails, setEmails] = useState([]);
//   const [selectedEmail, setSelectedEmail] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [readEmails, setReadEmails] = useState(new Set());
//   const [isMobileView, setIsMobileView] = useState(false);

//   useEffect(() => {
//     const handleResize = () => setIsMobileView(window.innerWidth < 768);
//     handleResize();
//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, []);

//   const fetchEmails = async () => {
//     try {
//       setLoading(true);
//       const userId = localStorage.getItem("userid");
//       const res = await axios.get(
//         `https://email-syncing-backend.vercel.app/mailhook/getAllEmailsData/${userId}`
//       );
//       const data = res.data?.data?.rootEmails || [];
//       setEmails(data);
//       if (!isMobileView && data.length > 0) setSelectedEmail(data[0]);
//     } catch (error) {
//       console.error("Error fetching inbox emails:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchEmails();
//   }, []);

//   const handleEmailClick = (email) => {
//     setSelectedEmail(email);
//     setReadEmails((prev) => new Set(prev).add(email._id));
//   };

//   const handleBackToList = () => setSelectedEmail(null);

//   // 📬 Clean Gmail-like stacked conversation layout
//   const renderConversation = (email, depth = 0) => (
//     <div key={email._id} className="space-y-4">
//       <motion.div
//         initial={{ opacity: 0, y: 10 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.3 }}
//         className={`rounded-xl border border-gray-200 shadow-sm p-4 bg-white ${
//           depth % 2 === 1 ? "bg-gray-50" : "bg-white"
//         }`}
//       >
//         {/* Header */}
//         <div className="flex items-start justify-between mb-2">
//           <div>
//             <p className="text-sm font-medium text-gray-900">
//               {email.senderAddress || "Unknown Sender"}
//             </p>
//             <p className="text-xs text-gray-500">
//               {email.recipientAddress ? `to ${email.recipientAddress}` : "to me"}
//             </p>
//           </div>
//           <p className="text-xs text-gray-400 whitespace-nowrap">
//             {new Date(email.date).toLocaleString()}
//           </p>
//         </div>

//         {/* Message content */}
//         <div className="text-sm text-gray-800 leading-relaxed mt-2">
//           {email.htmlBody ? (
//             <div
//               className="prose prose-sm max-w-none"
//               dangerouslySetInnerHTML={{ __html: email.htmlBody }}
//             />
//           ) : (
//             <p className="whitespace-pre-line">{email.textBody || "No content"}</p>
//           )}
//         </div>
//       </motion.div>

//       {/* Children emails */}
//       {email.children && email.children.length > 0 && (
//         <div className="ml-3 border-l border-gray-200 pl-3 space-y-4">
//           {email.children.map((child) => renderConversation(child, depth + 1))}
//         </div>
//       )}
//     </div>
//   );

//   const slideVariants = {
//     initial: { x: "100%" },
//     animate: { x: 0 },
//     exit: { x: "100%" },
//   };

//   return (
//     <div className="flex bg-gradient-to-br from-gray-50 to-indigo-50 min-h-screen font-inter">
//       <Sidebar />

//       <main className="flex-1 md:ml-64 flex h-screen overflow-hidden">
//         <div className="flex w-full bg-white rounded-2xl shadow-lg m-4 md:m-6 border border-gray-200 overflow-hidden relative">
//           {/* 📥 Email List */}
//           <motion.div
//             className={`${
//               isMobileView
//                 ? selectedEmail
//                   ? "hidden"
//                   : "block"
//                 : "w-1/3 border-r border-gray-200"
//             } bg-gray-50 overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-300`}
//           >
//             <div className="p-5 border-b border-gray-200 bg-white sticky top-0 z-10">
//               <h2 className="text-lg font-semibold text-gray-800">Inbox</h2>
//               <p className="text-xs text-gray-500 mt-1">Recent conversations</p>
//             </div>

//             {loading ? (
//               <div className="flex justify-center items-center py-10 text-gray-500 text-sm">
//                 Loading emails...
//               </div>
//             ) : emails.length === 0 ? (
//               <div className="flex justify-center items-center py-10 text-gray-400 text-sm italic">
//                 No emails found
//               </div>
//             ) : (
//               <ul className="p-2">
//                 {emails.map((email) => {
//                   const isRead = readEmails.has(email._id);
//                   const isSelected = selectedEmail?._id === email._id;

//                   return (
//                     <li
//                       key={email._id}
//                       onClick={() => handleEmailClick(email)}
//                       className={`px-4 py-3 border-b rounded-lg cursor-pointer transition-all duration-200 ${
//                         isSelected
//                           ? "bg-indigo-50 border-l-4 border-indigo-600"
//                           : !isRead
//                           ? "bg-indigo-100 hover:bg-indigo-200"
//                           : "hover:bg-gray-100"
//                       }`}
//                     >
//                       <div className="flex justify-between items-center mb-1">
//                         <p
//                           className={`text-sm truncate ${
//                             !isRead
//                               ? "font-bold text-gray-900"
//                               : "font-medium text-gray-800"
//                           }`}
//                         >
//                           {email.senderAddress}
//                         </p>
//                         <span className="text-xs text-gray-400">
//                           {new Date(email.date).toLocaleTimeString([], {
//                             hour: "2-digit",
//                             minute: "2-digit",
//                           })}
//                         </span>
//                       </div>
//                       <p
//                         className={`text-sm truncate ${
//                           !isRead
//                             ? "text-gray-900 font-semibold"
//                             : "text-gray-700"
//                         }`}
//                       >
//                         {email.subject || "No Subject"}
//                       </p>
//                       <p className="text-xs text-gray-500 truncate">
//                         {email.textBody?.slice(0, 70) ||
//                           "No preview available"}
//                       </p>
//                     </li>
//                   );
//                 })}
//               </ul>
//             )}
//           </motion.div>

//           {/* 📨 Email Conversation View */}
//           <AnimatePresence mode="wait">
//             {selectedEmail && (
//               <motion.div
//                 key={selectedEmail._id}
//                 variants={slideVariants}
//                 initial="initial"
//                 animate="animate"
//                 exit="exit"
//                 transition={{ duration: 0.3 }}
//                 className={`absolute md:static top-0 left-0 w-full md:w-2/3 h-full bg-gray-50 overflow-y-auto p-4 md:p-8`}
//               >
//                 {/* Mobile Back Button */}
//                 {isMobileView && (
//                   <button
//                     onClick={handleBackToList}
//                     className="flex items-center gap-2 text-indigo-600 mb-4"
//                   >
//                     <FiArrowLeft className="text-xl" /> Back
//                   </button>
//                 )}

//                 {/* Header */}
//                 <div className="border-b pb-3 mb-6">
//                   <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-1">
//                     {selectedEmail.subject || "No Subject"}
//                   </h3>
//                   <p className="text-sm text-gray-600">
//                     Conversation with{" "}
//                     <span className="font-medium text-gray-800">
//                       {selectedEmail.senderAddress}
//                     </span>
//                   </p>
//                 </div>

//                 {/* Gmail-style stacked thread */}
//                 <div className="space-y-6">{renderConversation(selectedEmail)}</div>
//               </motion.div>
//             )}
//           </AnimatePresence>
//         </div>
//       </main>
//     </div>
//   );
// };

// export default Inbox;
import React, { useState, useEffect } from "react";
import Sidebar from "../component/Sidebar";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { FiArrowLeft } from "react-icons/fi";

const Inbox = () => {
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [readEmails, setReadEmails] = useState(new Set());
  const [isMobileView, setIsMobileView] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchEmails = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem("userid");
      const res = await axios.get(
        `https://email-syncing-backend.vercel.app/mailhook/getAllEmailsData/${userId}`
      );
      const data = res.data?.data?.rootEmails || [];
      setEmails(data);
      if (!isMobileView && data.length > 0) setSelectedEmail(data[0]);
    } catch (error) {
      console.error("Error fetching inbox emails:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, []);

  const handleEmailClick = (email) => {
    setSelectedEmail(email);
    setReadEmails((prev) => new Set(prev).add(email._id));
  };

  const handleBackToList = () => setSelectedEmail(null);

  // 📨 Gmail-like formatted conversation
  const renderConversation = (email, depth = 0) => (
    <div key={email._id} className="space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`rounded-xl border border-gray-200 shadow-sm p-4 ${
          depth % 2 === 1 ? "bg-gray-50" : "bg-white"
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div>
            <p className="text-sm font-medium text-gray-900 break-all">
              {email.senderAddress || "Unknown Sender"}
            </p>
            <p className="text-xs text-gray-500 break-all">
              {email.recipientAddress ? `to ${email.recipientAddress}` : "to me"}
            </p>
          </div>
          <p className="text-xs text-gray-400 whitespace-nowrap">
            {new Date(email.date).toLocaleString()}
          </p>
        </div>

        {/* Message content with formatting fixes */}
        <div
          className="text-sm text-gray-800 leading-relaxed mt-2 whitespace-pre-wrap break-words overflow-hidden"
          style={{
            wordWrap: "break-word",
            overflowWrap: "break-word",
            lineHeight: "1.6",
          }}
        >
          {email.htmlBody ? (
            <div
              className="prose prose-sm max-w-none break-words text-gray-800"
              style={{ wordWrap: "break-word", overflowWrap: "anywhere" }}
              dangerouslySetInnerHTML={{
                __html: sanitizeHtml(email.htmlBody),
              }}
            />
          ) : (
            <p>{email.textBody || "No content"}</p>
          )}
        </div>
      </motion.div>

      {/* Children emails */}
      {email.children && email.children.length > 0 && (
        <div className="ml-3 border-l border-gray-200 pl-3 space-y-4">
          {email.children.map((child) => renderConversation(child, depth + 1))}
        </div>
      )}
    </div>
  );

  // ✅ Basic HTML sanitizer to prevent broken HTML (optional but safe)
  const sanitizeHtml = (html) => {
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.innerHTML;
  };

  const slideVariants = {
    initial: { x: "100%" },
    animate: { x: 0 },
    exit: { x: "100%" },
  };

  return (
    <div className="flex bg-gradient-to-br from-gray-50 to-indigo-50 min-h-screen font-inter">
      <Sidebar />

      <main className="flex-1 md:ml-64 flex h-screen overflow-hidden">
        <div className="flex w-full bg-white rounded-2xl shadow-lg m-4 md:m-6 border border-gray-200 overflow-hidden relative">
          {/* 📥 Email List */}
          <motion.div
            className={`${
              isMobileView
                ? selectedEmail
                  ? "hidden"
                  : "block"
                : "w-1/3 border-r border-gray-200"
            } bg-gray-50 overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-300`}
          >
            <div className="p-5 border-b border-gray-200 bg-white sticky top-6 z-10 rounded-t-xl shadow-sm">
  <h2 className="text-lg font-semibold text-gray-800">Inbox</h2>
  <p className="text-xs text-gray-500 mt-1">Recent conversations</p>
</div>


            {loading ? (
              <div className="flex justify-center items-center py-10 text-gray-500 text-sm">
                Loading emails...
              </div>
            ) : emails.length === 0 ? (
              <div className="flex justify-center items-center py-10 text-gray-400 text-sm italic">
                No emails found
              </div>
            ) : (
              <ul className="p-2">
                {emails.map((email) => {
                  const isRead = readEmails.has(email._id);
                  const isSelected = selectedEmail?._id === email._id;

                  return (
                    <li
                      key={email._id}
                      onClick={() => handleEmailClick(email)}
                      className={`px-4 py-3 border-b rounded-lg cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? "bg-indigo-50 border-l-4 border-indigo-600"
                          : !isRead
                          ? "bg-indigo-100 hover:bg-indigo-200"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <p
                          className={`text-sm truncate ${
                            !isRead
                              ? "font-bold text-gray-900"
                              : "font-medium text-gray-800"
                          }`}
                        >
                          {email.senderAddress}
                        </p>
                        <span className="text-xs text-gray-400">
                          {new Date(email.date).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p
                        className={`text-sm truncate ${
                          !isRead
                            ? "text-gray-900 font-semibold"
                            : "text-gray-700"
                        }`}
                      >
                        {email.subject || "No Subject"}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {email.textBody?.slice(0, 70) ||
                          "No preview available"}
                      </p>
                    </li>
                  );
                })}
              </ul>
            )}
          </motion.div>

          {/* 📨 Email View */}
          <AnimatePresence mode="wait">
            {selectedEmail && (
              <motion.div
                key={selectedEmail._id}
                variants={slideVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
                className={`absolute md:static top-0 left-0 w-full md:w-2/3 h-full bg-gray-50 overflow-y-auto p-4 md:p-8`}
              >
                {isMobileView && (
                  <button
                    onClick={handleBackToList}
                    className="flex items-center gap-2 text-indigo-600 mb-4"
                  >
                    <FiArrowLeft className="text-xl" /> Back
                  </button>
                )}

                <div className="border-b pb-3 mb-6">
                  <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-1 break-words">
                    {selectedEmail.subject || "No Subject"}
                  </h3>
                  <p className="text-sm text-gray-600 break-all">
                    Conversation with{" "}
                    <span className="font-medium text-gray-800">
                      {selectedEmail.senderAddress}
                    </span>
                  </p>
                </div>

                <div className="space-y-6">{renderConversation(selectedEmail)}</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default Inbox;

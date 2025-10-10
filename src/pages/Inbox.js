
import React, { useState, useEffect } from "react";
import Sidebar from "../component/Sidebar";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

const Inbox = () => {
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchEmails = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem("userid");
      const res = await axios.get(
        `https://email-syncing-backend.vercel.app/mailhook/getAllEmailsData/${userId}`
      );
      const data = res.data?.data?.rootEmails || [];
      setEmails(data);
      if (data.length > 0) setSelectedEmail(data[0]);
    } catch (error) {
      console.error("Error fetching inbox emails:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, []);

  const listContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const listItem = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 60 } },
  };

  const emailView = {
    hidden: { opacity: 0, x: 40 },
    show: {
      opacity: 1,
      x: 0,
      transition: { type: "spring", damping: 18, stiffness: 100 },
    },
    exit: { opacity: 0, x: -40 },
  };

  const renderEmailContent = (email) => (
    <motion.div
      key={email._id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-6 border-b pb-4 last:border-none"
    >
      <div className="flex items-start gap-3">
        <motion.div
          whileHover={{ rotate: -5, scale: 1.05 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="flex-shrink-0"
        >
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold shadow-sm">
            {email.senderAddress?.charAt(0).toUpperCase() || "?"}
          </div>
        </motion.div>
        <div>
          <p className="text-sm text-gray-700">
            <strong>{email.senderAddress}</strong> →{" "}
            {email.recipientAddress || "me"}
          </p>
          <p className="text-xs text-gray-400 mb-2">
            {new Date(email.date).toLocaleString()}
          </p>

          {email.htmlBody ? (
            <div
              className="prose prose-sm text-gray-800 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: email.htmlBody }}
            />
          ) : (
            <p className="text-gray-700 whitespace-pre-line">
              {email.textBody || "No message content"}
            </p>
          )}
        </div>
      </div>

      {email.children && email.children.length > 0 && (
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="ml-10 mt-4 border-l-2 border-gray-200 pl-4"
        >
          {email.children.map((child) => renderEmailContent(child))}
        </motion.div>
      )}
    </motion.div>
  );

 return (
  <div className="flex bg-gradient-to-br from-gray-50 to-indigo-50 min-h-screen font-inter">
    <Sidebar />

    <main className="flex-1 md:ml-64 flex h-screen overflow-hidden">
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="flex w-full bg-white rounded-2xl shadow-lg m-6 border border-gray-200 overflow-hidden"
      >
        {/* 📩 Email List */}
        <motion.div
          className="w-1/3 border-r border-gray-200 bg-gray-50 
          overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-300 
          scrollbar-track-transparent hover:scrollbar-thumb-indigo-400 
          transition-all duration-300 ease-in-out"
        >
          {/* Header */}
          <div className="p-5 border-b border-gray-200 bg-white sticky top-0 z-10">
            <h2 className="text-lg font-semibold text-gray-800">Lead Conversation</h2>
            <p className="text-xs text-gray-500 mt-1">Recent conversations</p>
          </div>

          {/* Loading / Empty / List */}
          {loading ? (
            <motion.div
              className="flex justify-center items-center py-10 text-gray-500 text-sm"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              Loading emails...
            </motion.div>
          ) : emails.length === 0 ? (
            <div className="flex justify-center items-center py-10 text-gray-400 text-sm italic">
              No emails found
            </div>
          ) : (
            <motion.ul
              variants={listContainer}
              initial="hidden"
              animate="show"
              className="p-2"
            >
              {emails.map((email) => (
                <motion.li
                  key={email._id}
                  variants={listItem}
                  whileHover={{
                    scale: 1.02,
                    backgroundColor: "#EEF2FF",
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedEmail(email)}
                  className={`px-4 py-3 border-b rounded-lg cursor-pointer transition-all duration-300 ${
                    selectedEmail?._id === email._id
                      ? "bg-indigo-50 border-l-4 border-indigo-600 shadow-sm"
                      : "hover:bg-gray-100"
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {email.senderAddress}
                    </p>
                    <span className="text-xs text-gray-400">
                      {new Date(email.date).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-900 font-medium truncate">
                    {email.subject || "No Subject"}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {email.textBody?.slice(0, 70) || "No preview available"}
                  </p>
                </motion.li>
              ))}
            </motion.ul>
          )}
        </motion.div>

        {/* 📬 Email View */}
        <motion.div
          layout
          className="flex-1 overflow-y-auto bg-white p-8 scrollbar-thin scrollbar-thumb-indigo-300"
        >
          <AnimatePresence mode="wait">
            {selectedEmail ? (
              <motion.div
                key={selectedEmail._id}
                variants={emailView}
                initial="hidden"
                animate="show"
                exit="exit"
              >
                {/* Email Header */}
                <motion.div
                  layout
                  className="border-b pb-4 mb-6"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <h3 className="text-2xl font-semibold text-gray-900 mb-1">
                    {selectedEmail.subject || "No Subject"}
                  </h3>
                  <p className="text-sm text-gray-600">
                    From:{" "}
                    <span className="font-medium text-gray-800">
                      {selectedEmail.senderAddress}
                    </span>
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(selectedEmail.date).toLocaleString()}
                  </p>
                </motion.div>

                {/* Email Thread */}
                {renderEmailContent(selectedEmail)}
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center text-gray-400 text-sm"
              >
                <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mb-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-8 h-8 text-indigo-500"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.005 1.875l-7.5 5.25a2.25 2.25 0 01-2.49 0l-7.5-5.25A2.25 2.25 0 013 6.993V6.75"
                    />
                  </svg>
                </div>
                <p>Select an email to view the conversation</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </main>
  </div>
);

};

export default Inbox;

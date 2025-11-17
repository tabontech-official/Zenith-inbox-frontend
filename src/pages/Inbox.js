import React, { useState, useEffect } from "react";
import Sidebar from "../component/Sidebar";
import axios from "axios";
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

      if (!isMobileView && data.length > 0) {
        setSelectedEmail(data[0]);
      }
    } catch (err) {
      console.error("Error fetching inbox:", err);
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

  // ❇️ Sanitize HTML Body
  const sanitizeHtml = (html) => {
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.innerHTML;
  };

  // 📨 Conversation Renderer
  const renderConversation = (email, depth = 0) => (
    <div key={email._id}>
      <div
        className={`p-4 rounded-lg border mb-4 ${
          depth % 2 === 0 ? "bg-white" : "bg-gray-50"
        }`}
      >
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="text-sm font-semibold text-gray-900 break-all">
              {email.senderAddress}
            </p>
            <p className="text-xs text-gray-500 break-all">
              to {email.recipientAddress || "me"}
            </p>
          </div>

          <p className="text-xs text-gray-400">
            {new Date(email.date).toLocaleString()}
          </p>
        </div>

        <div
          className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap break-words"
          dangerouslySetInnerHTML={{
            __html: sanitizeHtml(email.htmlBody || email.textBody || ""),
          }}
        />
      </div>

      {email.children?.map((child) =>
        renderConversation(child, depth + 1)
      )}
    </div>
  );

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar />

      <main className="flex-1 md:ml-64 flex h-screen overflow-hidden">
        <div className="flex w-full bg-white m-4 rounded-xl shadow-md overflow-hidden">

          {/* 📥 Email List */}
          <div
            className={`${
              isMobileView && selectedEmail ? "hidden" : "block"
            } md:w-1/3 border-r bg-gray-50 overflow-y-auto h-full`}
          >
            <div className="p-4 border-b bg-white sticky top-0 z-10">
              <h2 className="text-lg font-semibold text-gray-800">Inbox</h2>
              <p className="text-xs text-gray-500">Your synced emails</p>
            </div>

            {loading ? (
              <div className="p-10 text-center text-gray-500 text-sm">
                Loading...
              </div>
            ) : emails.length === 0 ? (
              <div className="p-10 text-center text-gray-400 italic">
                No emails found.
              </div>
            ) : (
              <ul>
                {emails.map((email) => {
                  const isRead = readEmails.has(email._id);
                  const isSelected = selectedEmail?._id === email._id;

                  return (
                    <li
                      key={email._id}
                      onClick={() => handleEmailClick(email)}
                      className={`p-4 border-b cursor-pointer transition
                        ${
                          isSelected
                            ? "bg-indigo-50 border-l-4 border-indigo-600"
                            : isRead
                            ? "bg-white hover:bg-gray-100"
                            : "bg-indigo-100 hover:bg-indigo-200"
                        }
                      `}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <p
                          className={`text-sm truncate ${
                            isRead ? "text-gray-800" : "font-bold text-gray-900"
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
                          isRead ? "text-gray-700" : "font-semibold"
                        }`}
                      >
                        {email.subject || "No Subject"}
                      </p>

                      <p className="text-xs text-gray-500 truncate">
                        {email.textBody?.slice(0, 80) || "No message preview"}
                      </p>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* 📄 Email Content */}
          {selectedEmail && (
            <div className="flex-1 p-6 overflow-y-auto bg-gray-50">

              {/* Mobile Back Button */}
              {isMobileView && (
                <button
                  onClick={handleBackToList}
                  className="flex items-center gap-2 text-indigo-600 mb-4"
                >
                  <FiArrowLeft /> Back
                </button>
              )}

              {/* Header */}
              <div className="border-b pb-4 mb-6">
                <h3 className="text-xl font-semibold text-gray-900 break-words">
                  {selectedEmail.subject || "No Subject"}
                </h3>
                <p className="text-sm text-gray-600">
                  Conversation with{" "}
                  <span className="font-semibold">
                    {selectedEmail.senderAddress}
                  </span>
                </p>
              </div>

              {/* Email Thread */}
              <div className="space-y-4">
                {renderConversation(selectedEmail)}
              </div>

            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Inbox;

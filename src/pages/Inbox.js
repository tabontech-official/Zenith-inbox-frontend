import React, { useState, useEffect } from "react";
import Sidebar from "../component/Sidebar";
import axios from "axios";

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
      setEmails(res.data?.data?.rootEmails || []);
    } catch (error) {
      console.error("Error fetching inbox emails:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, []);

  const renderEmailContent = (email) => {
    return (
      <div key={email._id} className="mb-6 border-b pb-4 last:border-none">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-semibold">
              {email.senderAddress?.charAt(0).toUpperCase() || "?"}
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-700">
              <strong>{email.senderAddress}</strong> to{" "}
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

        {/* Recursive rendering for children */}
        {email.children && email.children.length > 0 && (
          <div className="ml-10 mt-4 border-l-2 border-gray-200 pl-4">
            {email.children.map((child) => renderEmailContent(child))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex bg-gray-50 min-h-screen font-inter">
      <Sidebar />
      <main className="flex-1 md:ml-64 flex h-screen overflow-hidden">
        <div className="flex w-full border-t border-gray-200 bg-white rounded-lg shadow-sm m-4 overflow-hidden">
          {/* Left Sidebar (Email List) */}
          <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Inbox</h2>
            </div>
            {loading ? (
              <div className="flex justify-center items-center py-10 text-gray-500">
                Loading emails...
              </div>
            ) : (
              <ul>
                {emails.map((email) => (
                  <li
                    key={email._id}
                    onClick={() => setSelectedEmail(email)}
                    className={`px-4 py-3 border-b cursor-pointer transition ${
                      selectedEmail?._id === email._id
                        ? "bg-indigo-50 border-l-4 border-indigo-600"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex justify-between items-center">
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
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {email.subject || "No Subject"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {email.textBody?.slice(0, 60) || "No preview available"}
                    </p>
                    <span className="inline-block text-[11px] mt-1 px-2 py-[1px] rounded-full bg-indigo-100 text-indigo-700">
                      New
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Right Side (Email Thread View) */}
          <div className="flex-1 overflow-y-auto p-6">
            {selectedEmail ? (
              <>
                <div className="border-b pb-3 mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">
                    {selectedEmail.subject}
                  </h3>
                  <p className="text-sm text-gray-500">
                    From: {selectedEmail.senderAddress}
                  </p>
                </div>

                {/* Main Email + Replies */}
                {renderEmailContent(selectedEmail)}
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                Select an email to view conversation
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Inbox;

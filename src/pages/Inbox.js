import React, { useState, useEffect } from "react";
import Sidebar from "../component/Sidebar";
import axios from "axios";
import {
  FiArrowLeft,
  FiSearch,
  FiTrash2,
  FiArchive,
  FiMail,
  FiRefreshCw,
} from "react-icons/fi";

const Inbox = () => {
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [readEmails, setReadEmails] = useState(new Set());
  const [isMobileView, setIsMobileView] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth < 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // const fetchEmails = async () => {
  //   try {
  //     setLoading(true);
  //     const userId = localStorage.getItem("userid");
  //     const res = await axios.get(`https://email-syncing-backend.vercel.app/mailhook/getAllEmailsData/${userId}`);
  //     const data = res.data?.data?.rootEmails || [];
  //     setEmails(data);
  //     if (!isMobileView && data.length > 0 && !selectedEmail) {
  //       setSelectedEmail(data[0]);
  //     }
  //   } catch (err) {
  //     console.error("Error fetching inbox:", err);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const fetchEmails = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem("userid");
      const res = await axios.get(
        `https://email-syncing-backend.vercel.app/mailhook/getAllEmailsData/${userId}`,
      );

      let data = res.data?.data?.rootEmails || [];

      // Latest emails first
      data = data.sort((a, b) => new Date(b.date) - new Date(a.date));

      setEmails(data);

      if (!isMobileView && data.length > 0 && !selectedEmail) {
        setSelectedEmail(data[0]); // latest email automatically open
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

  const sanitizeHtml = (html) => {
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.innerHTML;
  };

  const renderConversation = (email) => (
    <div
      key={email._id}
      className="mb-6 bg-white border border-gray-200 rounded shadow-sm"
    >
      <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
        <div>
          <span className="font-bold text-gray-900">{email.senderAddress}</span>
          <span className="text-gray-500 text-sm ml-2">{`<${email.senderAddress}>`}</span>
        </div>
        <span className="text-xs text-gray-500">
          {new Date(email.date).toLocaleString()}
        </span>
      </div>
      <div
        className="p-6 text-sm text-gray-800 prose max-w-none"
        dangerouslySetInnerHTML={{
          __html: sanitizeHtml(email.htmlBody || email.textBody || ""),
        }}
      />
      {email.children?.map((child) => renderConversation(child))}
    </div>
  );

  return (
    <div className="flex bg-[#f3f2f1] h-screen overflow-hidden font-sans text-gray-900">
      <Sidebar />

      {/* Main Container */}
      <main className="flex-1 flex md:ml-64 flex-col min-w-0">
        {/* Outlook Ribbon/Header */}
        <header className="h-12 bg-white border-b flex items-center px-4 gap-6 text-sm text-gray-700 z-10">
          <button className="flex items-center gap-2 bg-blue-700 text-white px-3 py-1 rounded-sm hover:bg-blue-800">
            <FiMail /> Inbox
          </button>
          <div className="h-4 w-[1px] bg-gray-300" />
          {/* <button className="flex items-center gap-2 hover:bg-gray-100 p-1 px-2 rounded"><FiTrash2 /> Delete</button>
          <button className="flex items-center gap-2 hover:bg-gray-100 p-1 px-2 rounded"><FiArchive /> Archive</button> */}
          <button
            onClick={fetchEmails}
            className="flex items-center gap-2 hover:bg-gray-100 p-1 px-2 rounded"
          >
            <FiRefreshCw className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </header>

        <div className="flex-1 flex overflow-hidden">
          {/* List Pane */}
          <section
            className={`${isMobileView && selectedEmail ? "hidden" : "flex"} flex-col w-full md:w-[350px] lg:w-[400px] border-r bg-white`}
          >
            {/* <div className="p-3 border-b">
              <div className="relative">
                <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search" 
                  className="w-full pl-9 pr-3 py-1.5 bg-gray-100 border-none rounded focus:ring-1 focus:ring-blue-500 text-sm"
                />
              </div>
            </div> */}

            <div className="overflow-y-auto flex-1 custom-scrollbar">
              {loading && (
                <div className="p-4 text-center text-sm">Loading...</div>
              )}
              {emails.map((email) => {
                const isRead = readEmails.has(email._id);
                const isSelected = selectedEmail?._id === email._id;
                return (
                  <div
                    key={email._id}
                    onClick={() => handleEmailClick(email)}
                    className={`relative flex flex-col p-4 border-b cursor-pointer border-l-4 transition-colors
                      ${isSelected ? "bg-[#f3f2f1] border-l-blue-600" : "bg-white border-l-transparent hover:bg-gray-50"}
                    `}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span
                        className={`text-sm truncate ${!isRead ? "font-bold text-blue-700" : "font-semibold text-gray-900"}`}
                      >
                        {email.senderAddress.split("@")[0]}
                      </span>
                      <span className="text-xs text-gray-500 shrink-0">
                        {new Date(email.date).toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <div
                      className={`text-sm truncate ${!isRead ? "font-semibold" : "text-gray-700"}`}
                    >
                      {email.subject || "(No Subject)"}
                    </div>
                    <div className="text-xs text-gray-500 truncate mt-1">
                      {email.textBody?.slice(0, 60)}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Reading Pane */}
          <section
            className={`${isMobileView && !selectedEmail ? "hidden" : "flex"} flex-1 flex-col bg-white overflow-hidden`}
          >
            {selectedEmail ? (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Email Header */}
                <div className="p-6 border-b shrink-0">
                  {isMobileView && (
                    <button
                      onClick={() => setSelectedEmail(null)}
                      className="flex items-center gap-2 text-blue-600 mb-4 text-sm"
                    >
                      <FiArrowLeft /> Back to Inbox
                    </button>
                  )}
                  <h1 className="text-xl font-light text-gray-900 mb-4">
                    {selectedEmail.subject || "No Subject"}
                  </h1>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold">
                      {selectedEmail.senderAddress[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-sm">
                        {selectedEmail.senderAddress}
                      </div>
                      <div className="text-xs text-gray-500">
                        To: {selectedEmail.recipientAddress || "me"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Email Body */}
                <div className="flex-1 overflow-y-auto p-6 bg-[#faf9f8]">
                  <div className="max-w-4xl mx-auto">
                    {renderConversation(selectedEmail)}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-[#faf9f8]">
                <FiMail size={48} className="mb-4 opacity-20" />
                <p>Select an item to read</p>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default Inbox;

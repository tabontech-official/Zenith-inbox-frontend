import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Sidebar from "../component/Sidebar";
import { ChevronLeftIcon, PaperClipIcon } from "@heroicons/react/24/solid";
import { format } from "date-fns";
import axios from "axios";

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    return format(new Date(dateString), "MMM d, yyyy 'at' h:mm a");
  } catch {
    return "Invalid Date";
  }
};

const renderEmailChain = (email, title = "Email", level = 0, domId = "") => {
  if (!email) return null;

  const isRoot = level === 0;
  const indentationStyle = {
    borderLeft: !isRoot ? "4px solid #6D28D9" : "none",
    paddingLeft: !isRoot ? "20px" : "0",
  };
  const bgColor = isRoot
    ? "bg-white border border-gray-200"
    : "bg-purple-50 hover:bg-purple-100 transition duration-200 ease-in-out";

  const sender =
    email.senderAddress || email.forwardedMeta?.from || "Unknown Sender";
  const recipient =
    email.recipientAddress || email.forwardedMeta?.to || "Unknown Recipient";
  const cc = email.cc || email.forwardedMeta?.cc || null;
  const subject = email.subject || email.forwardedMeta?.subject || "No Subject";
  const dateValue = email.date || email.forwardedMeta?.date;
  const bodyText =
    email.textBody ||
    email.htmlBody ||
    email.forwardedMeta?.body ||
    "No content available";
  const hasAttachments = email.attachments && email.attachments.length > 0;

  return (
    <div
      key={email._id}
      id={domId}
      style={indentationStyle}
      className="w-full transition"
    >
      <div
        className={`${bgColor} mb-8 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition duration-300 ease-in-out`}
      >
        <div className="flex items-start justify-between mb-6 pb-4 border-b border-purple-200">
          <h3
            className={`text-2xl font-extrabold ${
              isRoot ? "text-purple-700" : "text-gray-800"
            } tracking-tight`}
          >
            {title}
          </h3>
          <span
            className={`text-sm font-semibold px-3 py-1 rounded-full ${
              isRoot
                ? "bg-purple-100 text-purple-700"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            {isRoot ? "Original Message" : `Level ${level}`}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-y-4 gap-x-8 text-sm mb-6">
          <div className="lg:col-span-2">
            <label className="block text-xs font-bold uppercase text-purple-600 mb-1 tracking-wider">
              From
            </label>
            <p className="font-semibold text-gray-900 text-base break-words">
              {sender}
            </p>
          </div>
          <div className="lg:col-span-2">
            <label className="block text-xs font-bold uppercase text-purple-600 mb-1 tracking-wider">
              To
            </label>
            <p className="font-semibold text-gray-900 text-base break-words">
              {recipient}
            </p>
          </div>

          {cc && cc.length > 0 && (
            <div className="lg:col-span-2">
              <label className="block text-xs font-bold uppercase text-purple-600 mb-1 tracking-wider">
                Cc
              </label>
              <div className="flex flex-wrap gap-2">
                {cc.map((c, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="lg:col-span-4 mt-2">
            <label className="block text-xs font-bold uppercase text-purple-600 mb-1 tracking-wider">
              Subject
            </label>
            <p className="text-xl font-extrabold text-gray-900">{subject}</p>
          </div>
          <div className="lg:col-span-4 flex items-center justify-between mt-2">
            <div>
              <label className="block text-xs font-bold uppercase text-purple-600 mb-1 tracking-wider">
                Date
              </label>
              <p className="text-sm font-medium text-gray-700">
                {formatDate(dateValue)}
              </p>
            </div>
            {hasAttachments && (
              <div className="flex items-center text-sm font-medium text-purple-600">
                <PaperClipIcon className="w-4 h-4 mr-1" />
                <span>{email.attachments.length} Attachment(s)</span>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-xs font-bold uppercase text-purple-600 mb-3 tracking-wider">
            Message Body
          </label>
          <div className="max-h-72 overflow-y-auto p-6 rounded-xl bg-gray-50 border border-gray-200 text-gray-700">
            {email.htmlBody ? (
              <div dangerouslySetInnerHTML={{ __html: email.htmlBody }} />
            ) : (
              <div className="whitespace-pre-wrap">{bodyText}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const EmailDetailPage = () => {
  const { id: emailId } = useParams();
  const [thread, setThread] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchThread = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `https://email-syncing-backend.vercel.app/mailhook/getAllEmailsData/${emailId}`
        );
        setThread(res.data?.data || null);
      } catch (err) {
        console.error("Error fetching thread:", err);
      } finally {
        setLoading(false);
      }
    };

    if (emailId) fetchThread();
  }, [emailId]);

  const scrollToEmail = (domId) => {
    const el = document.getElementById(domId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      el.classList.add("highlight-card");
      setTimeout(() => el.classList.remove("highlight-card"), 1500);
    }
  };

  if (loading)
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50">
        <svg
          className="animate-spin h-10 w-10 text-purple-600 mb-4"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <p className="text-2xl text-purple-600 font-semibold">
          Loading conversation thread...
        </p>
      </div>
    );

  if (!thread)
    return (
      <div className="p-10 text-center bg-gray-50 min-h-screen flex flex-col items-center justify-center">
        <p className="text-4xl font-extrabold text-purple-600 mb-4">
          404: Thread Not Found
        </p>
        <Link
          to="/organization"
          className="text-white bg-purple-700 hover:bg-purple-800 transition px-6 py-3 rounded-lg"
        >
          <ChevronLeftIcon className="w-5 h-5 mr-2 inline" />
          Return to Email Overview
        </Link>
      </div>
    );

  const { rootEmail, children, statuses } = thread;

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />

      <main className="flex-1 lg:ml-64 p-6 flex gap-6">
        <div className="flex-1 space-y-6">
          <div className="mb-10 border-b border-gray-200 pb-6">
            <Link
              to="/organization"
              className="text-purple-700 hover:text-purple-900 font-semibold inline-flex items-center"
            >
              <ChevronLeftIcon className="w-5 h-5 mr-2" />
              Back to Email Overview
            </Link>
            <h1 className="text-3xl font-extrabold text-gray-900 mt-4">
              Full Conversation Thread
            </h1>
          </div>

          {renderEmailChain(
            rootEmail,
            "Original Email",
            0,
            "email-" + rootEmail._id
          )}
          {children &&
            children.map((child) =>
              renderEmailChain(child, "Reply/Forward", 1, "email-" + child._id)
            )}
        </div>

        <aside className="w-80 bg-white rounded-xl shadow-md border border-gray-200 p-4 sticky top-6 h-fit">
          <h2 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">
            Conversation History
          </h2>

          <div className="mb-5">
            <h3 className="text-sm font-semibold text-purple-600 mb-2">
              Original Email
            </h3>
            <div
              onClick={() => scrollToEmail("email-" + rootEmail._id)}
              className="p-3 border rounded-lg hover:shadow-md transition cursor-pointer"
            >
              <p className="font-medium text-gray-800 truncate">
                {rootEmail?.subject || "No Subject"}
              </p>
              <p className="text-xs text-gray-500">
                {formatDate(rootEmail?.date)}
              </p>
            </div>
          </div>

          <div className="mb-5">
            <h3 className="text-sm font-semibold text-purple-600 mb-2">
              Replies / Forwards
            </h3>
            {children && children.length > 0 ? (
              <div className="space-y-2">
                {children.map((child) => (
                  <div
                    key={child._id}
                    onClick={() => scrollToEmail("email-" + child._id)}
                    className="p-3 border rounded-lg hover:shadow-md transition cursor-pointer"
                  >
                    <p className="font-medium text-gray-800 truncate">
                      {child.subject}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(child.date)}
                    </p>
                    <span className="text-[10px] text-purple-500 font-semibold">
                      {child.isForwarded ? "Forward" : "Reply"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400">No replies/forwards</p>
            )}
          </div>

          <div>
            <h3 className="text-sm font-semibold text-purple-600 mb-2">
              Automation History
            </h3>
            {statuses && statuses.length > 0 ? (
              <div className="space-y-2">
                {statuses.map((h) => (
                  <div
                    key={h._id}
                    onClick={() => scrollToEmail("email-" + rootEmail._id)}
                    className="p-3 border rounded-lg hover:shadow-md transition cursor-pointer"
                  >
                    <p className="font-medium text-gray-800">Automation Run</p>
                    <p className="text-xs text-gray-500">
                      {formatDate(h.lastExecutedAt)}
                    </p>
                    <span
                      className={`inline-block mt-2 px-2 py-0.5 text-xs rounded-full ${
                        h.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : h.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : h.status === "partial"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {h.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400">No automation history</p>
            )}
          </div>
        </aside>
      </main>

      <style>
        {`
          .highlight-card {
            animation: flashHighlight 1.2s ease;
          }
          @keyframes flashHighlight {
            0% { background-color: #fef9c3; }
            100% { background-color: transparent; }
          }
        `}
      </style>
    </div>
  );
};

export default EmailDetailPage;

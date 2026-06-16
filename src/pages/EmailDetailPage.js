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

const formatEmailBody = (html, text, forwardedBody) => {
  let isHtml = html && html.trim().length > 0;
  let content = isHtml ? html : (text || forwardedBody || "");

  if (!content) return "";

  // Normalize email body text before rendering:
  // 1. Trim leading/trailing whitespace
  content = content.trim();

  content = content.replace(/disabled/g, "");

  if (isHtml) {
    // 2. Replace 3 or more consecutive HTML line breaks with a maximum of 2.
    content = content.replace(/(?:<br\s*\/?>\s*[\r\n]*\s*){3,}/gi, "<br/><br/>");

    // Replace 3 or more consecutive newlines with 2.
    content = content.replace(/\n{3,}/g, "\n\n");
  } else {
    // 2. Replace 3 or more consecutive line breaks with a maximum of 2.
    content = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    content = content.replace(/\n{3,}/g, "\n\n");

    // Escape HTML entities to prevent rendering issues or injection in plain text
    content = content
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

    // 3. Make links and email addresses clickable
    content = content.replace(
      /(https?:\/\/[^\s<]+)/g,
      '<a href="$1" target="_blank" style="color:#1a73e8;text-decoration:underline;font-weight:500">$1</a>',
    );

    content = content.replace(
      /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g,
      '<a href="mailto:$1" style="color:#1a73e8;text-decoration:underline">$1</a>',
    );

    // Convert newlines to breaks for HTML rendering
    content = content.replace(/\n/g, "<br/>");
  }

  // Modern styled headers or form keys formatting (preserved from original code)
  content = content.replace(
    /(Full Name:|Business Email:|Country:|Service:|Budget:|Store Name:|Store URL:|Problem & Goal:)/g,
    '<br/><strong style="color:#202124;font-weight:600">$1</strong>',
  );

  return content;
};

const renderEmailChain = (email, title = "Email", level = 0, domId = "") => {
  if (!email) return null;

  const isRoot = level === 0;
  const indentationStyle = {
    borderLeft: !isRoot ? "3px solid #cbd5e1" : "none",
    paddingLeft: !isRoot ? "24px" : "0",
  };

  const sender =
    email.senderAddress || email.forwardedMeta?.from || "Unknown Sender";
  const recipient =
    email.recipientAddress || email.forwardedMeta?.to || "Unknown Recipient";
  const cc = email.cc || email.forwardedMeta?.cc || null;
  const subject = email.subject || email.forwardedMeta?.subject || "No Subject";
  const dateValue = email.date || email.forwardedMeta?.date;
  const hasAttachments = email.attachments && email.attachments.length > 0;

  return (
    <div
      key={email._id}
      id={domId}
      style={indentationStyle}
      className="w-full transition duration-300"
    >
      <div
        className="bg-white border border-slate-200 mb-6 rounded-xl shadow-[0_1px_2px_0_rgba(60,64,67,0.15)] hover:shadow-[0_1px_3px_1px_rgba(60,64,67,0.2)] transition-shadow duration-300"
      >
        {/* Card Header: Sender Info, Recipient Info, Date, Attachment badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 bg-slate-50/70 px-6 py-4 rounded-t-xl gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {/* Sender Initials Avatar */}
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold uppercase text-slate-700 shadow-inner">
              {sender?.[0]?.toUpperCase() || "?"}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-baseline gap-x-2">
                <span className="truncate text-sm font-bold text-slate-900">
                  {sender.includes("<") ? sender.split("<")[0].trim() : sender.split("@")[0]}
                </span>
                <span className="truncate text-xs text-slate-500 font-normal">
                  {sender.includes("<") ? sender.substring(sender.indexOf("<")) : `<${sender}>`}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                to {recipient}
              </p>
              {cc && cc.length > 0 && (
                <p className="text-[11px] text-slate-400 mt-0.5">
                  cc: {cc.join(", ")}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
            <span className="text-xs font-medium text-slate-500 bg-slate-100/80 px-2 py-0.5 rounded">
              {formatDate(dateValue)}
            </span>
          </div>
        </div>

        {/* Subject Area */}
        <div className="px-6 pt-4">
          <h3 className="text-base font-semibold text-slate-800 leading-snug">
            {subject}
          </h3>
        </div>

        {/* Message Body - clean, no max height limit, proper typography */}
        <div className="px-6 py-5">
          <div 
            className="prose prose-sm max-w-4xl text-sm leading-relaxed text-slate-800"
            style={{ fontFamily: "Roboto, Arial, sans-serif" }}
            dangerouslySetInnerHTML={{
              __html: formatEmailBody(email.htmlBody, email.textBody, email.forwardedMeta?.body),
            }}
          />
        </div>

        {/* Attachments Section - styled cleanly at the bottom */}
        {hasAttachments && (
          <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/50 rounded-b-xl flex flex-col gap-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              <PaperClipIcon className="w-4 h-4 text-slate-400" />
              <span>{email.attachments.length} Attachment(s)</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {email.attachments.map((a, i) => (
                <span 
                  key={i} 
                  className="bg-white border border-slate-200 px-3 py-1 rounded-lg text-slate-600 text-xs font-medium shadow-sm flex items-center gap-1.5"
                >
                  <span className="truncate max-w-[200px]">{a.filename || `attachment-${i}`}</span>
                  {a.size && <span className="text-[10px] text-slate-400">({Math.round(a.size / 1024)} KB)</span>}
                </span>
              ))}
            </div>
          </div>
        )}
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
          `http://localhost:5000/mailhook/getAllEmailsData/${emailId}`
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

      <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300">
        <main className="flex-1 p-6 flex gap-6 lead-conversation-view">
        <div className="flex-1 space-y-6">
          <div className="mb-10 border-b border-gray-200 pb-6">
            <Link
              to="/organization"
              className="text-indigo-600 hover:text-indigo-850 font-semibold inline-flex items-center transition duration-200"
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
      </div>

      {/* <style>
        {`
          .highlight-card {
            animation: flashHighlight 1.2s ease;
          }
          @keyframes flashHighlight {
            0% { background-color: #fef9c3; }
            100% { background-color: transparent; }
          }
        `}
      </style> */}
    </div>
  );
};

export default EmailDetailPage;

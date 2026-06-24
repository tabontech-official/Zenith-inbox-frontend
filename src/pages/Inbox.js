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

  const fetchEmails = async () => {
    try {
      setLoading(true);

      const userId = localStorage.getItem("userid");

      const res = await axios.get(
        `https://email-syncing-backend.vercel.app/mailhook/getAllEmailsData/${userId}`,
      );

      let data = res.data?.data?.rootEmails || [];

      data = data.filter((email) => {
        const hasReply = email.children && email.children.length > 0;

        const isGmailVerification =
          email.senderAddress?.toLowerCase().includes("google.com") ||
          email.subject
            ?.toLowerCase()
            .includes("gmail forwarding confirmation") ||
          email.textBody?.includes("mail-settings.google.com");

        return hasReply || isGmailVerification;
      });

      // Latest emails upar
      data = data.sort((a, b) => new Date(b.date) - new Date(a.date));

      setEmails(data);

      if (!isMobileView && data.length > 0 && !selectedEmail) {
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
 const getDisplayRecipient = (email) => {
  const possibleEmails = [
    email?.toEmail,
    email?.to,
    email?.originalTo,
    email?.originalRecipient,
    email?.recipientEmail,
    email?.recipientAddress,
  ].filter(Boolean);

  const realEmail = possibleEmails.find(
    (address) =>
      !address.includes("mail.replexengine.com") &&
      !address.includes("zenith-inbox.com")
  );

  return realEmail || email?.senderAddress || "";
};
  const formatEmailBody = (html, text) => {
    let isHtml = html && html.trim().length > 0;
    let content = isHtml ? html : text;

    if (!content) return "";

    // Normalize email body text before rendering:
    // 1. Trim leading/trailing whitespace
    content = content.trim();

    content = content.replace(/disabled/g, "");

    if (isHtml) {
      // 2. Replace 3 or more consecutive HTML line breaks with a maximum of 2.
      content = content.replace(
        /(?:<br\s*\/?>\s*[\r\n]*\s*){3,}/gi,
        "<br/><br/>",
      );

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

    return `
    <div class="email-body-content" style="font-family: Roboto, RobotoDraft, Helvetica, Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #202124; max-width: 100%; word-break: break-word; overflow-wrap: break-word;">
      ${content}
    </div>
  `;
  };

  const handleEmailClick = (email) => {
    setSelectedEmail(email);
    setReadEmails((prev) => new Set(prev).add(email._id));
  };

  const sanitizeHtml = (html) => {
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.innerHTML;
  };

  const renderConversation = (email) => {
    return (
      <div
        key={email._id}
        className="mb-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_0_rgba(60,64,67,0.15)] transition duration-200"
      >
        {/* Email Header - Gmail Style */}
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 bg-slate-50/70 px-5 py-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Sender Initials Avatar */}
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold uppercase text-slate-700 shadow-inner">
              {email.senderAddress?.[0]?.toUpperCase() || "?"}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-baseline gap-x-2">
                <span className="truncate text-sm font-bold text-slate-900">
                  {email.senderAddress?.split("@")[0]}
                </span>
                <span className="truncate text-xs text-slate-500 font-normal">
                  {`<${email.senderAddress}>`}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
  to {getDisplayRecipient(email)}
              </p>
            </div>
          </div>

          <span className="shrink-0 text-xs font-medium text-slate-500 bg-slate-100/80 px-2 py-0.5 rounded">
            {new Date(email.date).toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>

        {/* Email Body - Clean Gmail Style spacing */}
        <div
          className="prose prose-sm max-w-4xl px-6 py-5 text-sm leading-relaxed text-slate-800"
          style={{ fontFamily: "Roboto, Arial, sans-serif" }}
          dangerouslySetInnerHTML={{
            __html: formatEmailBody(email.htmlBody, email.textBody),
          }}
        />

        {/* Children replies rendered as a clean stacked thread rather than a dark nested box */}
        {email.children?.length > 0 && (
          <div className="border-t border-slate-100 bg-slate-50/30 p-4 space-y-4">
            {email.children.map((child) => renderConversation(child))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100 font-sans text-slate-900">
      <Sidebar />

      <main className="flex min-w-0 flex-1 flex-col md:ml-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                  <FiMail size={20} />
                </div>

                <div>
                  <h1 className="text-xl font-semibold tracking-tight text-slate-950">
                    Inbox
                  </h1>
                  <p className="mt-0.5 text-sm text-slate-500">
                    Manage customer requests and troubleshooting conversations.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={fetchEmails}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <FiRefreshCw className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="flex min-h-0 flex-1 overflow-hidden p-4">
          <div className="flex min-h-0 w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            {/* Email List */}
            <section
              className={`${
                isMobileView && selectedEmail ? "hidden" : "flex"
              } w-full flex-col border-r border-slate-200 bg-white md:w-[380px] lg:w-[420px]`}
            >
              <div className="border-b border-slate-100 p-4">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />

                  <input
                    type="text"
                    placeholder="Search emails..."
                    className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  Conversations
                </p>

                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                  {emails.length}
                </span>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto">
                {loading && (
                  <div className="flex h-40 items-center justify-center">
                    <div className="flex flex-col items-center gap-3 text-slate-400">
                      <FiRefreshCw className="animate-spin" size={24} />
                      <p className="text-sm font-medium">Loading inbox...</p>
                    </div>
                  </div>
                )}

                {!loading && emails.length === 0 && (
                  <div className="flex h-60 flex-col items-center justify-center px-6 text-center text-slate-400">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
                      <FiMail size={22} />
                    </div>
                    <p className="text-sm font-semibold text-slate-600">
                      No emails found
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Refresh your inbox or check email syncing.
                    </p>
                  </div>
                )}

                {!loading &&
                  emails.map((email) => {
                    const isRead = readEmails.has(email._id);
                    const isSelected = selectedEmail?._id === email._id;

                    return (
                      <button
                        key={email._id}
                        onClick={() => handleEmailClick(email)}
                        className={`group flex w-full flex-col border-b border-slate-100 px-4 py-4 text-left transition ${
                          isSelected
                            ? "bg-blue-50/70"
                            : "bg-white hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold uppercase text-white ${
                              isSelected ? "bg-blue-600" : "bg-slate-700"
                            }`}
                          >
                            {email.senderAddress?.[0]?.toUpperCase() || "?"}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="mb-1 flex items-center justify-between gap-3">
                              <span
                                className={`truncate text-sm ${
                                  !isRead
                                    ? "font-bold text-slate-950"
                                    : "font-semibold text-slate-700"
                                }`}
                              >
                                {email.senderAddress?.split("@")[0]}
                              </span>

                              <span className="shrink-0 text-xs font-medium text-slate-400">
                                {new Date(email.date).toLocaleDateString([], {
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>
                            </div>

                            <p
                              className={`truncate text-sm ${
                                !isRead
                                  ? "font-semibold text-slate-900"
                                  : "font-medium text-slate-600"
                              }`}
                            >
                              {email.subject || "(No Subject)"}
                            </p>

                            <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-400">
                              {email.textBody?.slice(0, 120) ||
                                "No preview available"}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
              </div>
            </section>

            {/* Email Detail */}
            <section
              className={`${
                isMobileView && !selectedEmail ? "hidden" : "flex"
              } min-w-0 flex-1 flex-col bg-slate-50`}
            >
              {selectedEmail ? (
                <div className="flex min-h-0 flex-1 flex-col">
                  {/* Email Header */}
                  <div className="shrink-0 border-b border-slate-200 bg-white px-6 py-5">
                    {isMobileView && (
                      <button
                        onClick={() => setSelectedEmail(null)}
                        className="mb-4 inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-blue-600"
                      >
                        <FiArrowLeft />
                        Back to Inbox
                      </button>
                    )}

                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                          {selectedEmail.subject || "No Subject"}
                        </h2>

                        <div className="mt-4 flex items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-orange-500 text-sm font-bold uppercase text-white">
                            {selectedEmail.senderAddress?.[0]?.toUpperCase() ||
                              "?"}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-900">
                              {selectedEmail.senderAddress}
                            </p>
                            <p className="truncate text-xs text-slate-500">
                              To: {selectedEmail.senderAddress || "me"}{" "}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* <div className="flex items-center gap-2">
                        <button className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">
                          <FiArchive size={15} />
                          Archive
                        </button>

                        <button className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 px-3 text-sm font-semibold text-red-600 transition hover:bg-red-100">
                          <FiTrash2 size={15} />
                          Delete
                        </button>
                      </div> */}
                    </div>
                  </div>

                  {/* Email Body */}
                  <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50 px-5 py-6 lead-conversation-view">
                    <div className="mx-auto max-w-5xl">
                      {renderConversation(selectedEmail)}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-1 flex-col items-center justify-center bg-slate-50 px-6 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-slate-300 shadow-sm">
                    <FiMail size={32} />
                  </div>

                  <h3 className="text-base font-semibold text-slate-700">
                    Select an email
                  </h3>

                  <p className="mt-1 max-w-sm text-sm text-slate-400">
                    Choose a conversation from the inbox to view the full
                    troubleshooting request.
                  </p>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Inbox;

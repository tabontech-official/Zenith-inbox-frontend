import React, { useState, useEffect } from "react";
import Sidebar from "../component/Sidebar";
import axios from "axios";
import {
  FiArrowLeft,
  FiSearch,
  FiTrash2,
  FiMail,
  FiRefreshCw,
  FiSend,
} from "react-icons/fi";

const API_BASE_URL = "https://email-syncing-backend.vercel.app/mailhook";

const Inbox = () => {
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [replySending, setReplySending] = useState(false);
  const [readEmails, setReadEmails] = useState(new Set());
  const [isMobileView, setIsMobileView] = useState(false);
  const [selectedLeadIds, setSelectedLeadIds] = useState(new Set());
  const [leadStatuses, setLeadStatuses] = useState({});
  const [replyText, setReplyText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // 'all', 'awaiting', 'auto_replied'
  const [modal, setModal] = useState({
    open: false,
    type: "info",
    title: "",
    message: "",
    onConfirm: null,
  });

  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth < 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const showModal = ({ type = "info", title, message, onConfirm = null }) => {
    setModal({
      open: true,
      type,
      title,
      message,
      onConfirm,
    });
  };

  const closeModal = () => {
    setModal({
      open: false,
      type: "info",
      title: "",
      message: "",
      onConfirm: null,
    });
  };

  const safeText = (val) => {
    if (!val) return "";
    if (typeof val === "object") return "";
    return val;
  };

  const leadStatusOptions = [
    { value: "new_lead", label: "New Lead" },
    { value: "secured", label: "Secured" },
    { value: "closed", label: "Closed" },
  ];

  const normalizeEmails = (threads = []) => {
    return threads
      .filter((t) => !t.isDeleted)
      .map((thread) => {
        const messages = thread.conversation || [];

        return {
          _id: thread._id,
          threadId: thread.threadId || thread._id,
          subject: thread.subject || "",
          textBody: thread.textBody || thread.body || "",
          htmlBody: thread.htmlBody || "",
          senderAddress:
            thread.senderAddress || thread.forwardedMeta?.from || "Unknown",
          recipientAddress:
            thread.recipientAddress || thread.forwardedMeta?.to || "",
          date: thread.date || thread.createdAt,
          direction: thread.direction || "incoming",
          leadStatus: thread.leadStatus || "new_lead",
          service: thread.service || null,
          stepType: thread.stepType || null,
          discussion: thread.discussion || [],
          replies: messages.map((msg) => ({
            _id: msg._id,
            subject: msg.subject || "",
            textBody: msg.textBody || "",
            htmlBody: msg.htmlBody || "",
            senderAddress: msg.senderAddress || msg.forwardedMeta?.from || "",
            recipientAddress:
              msg.recipientAddress || msg.forwardedMeta?.to || "",
            date: msg.date || msg.createdAt,
            direction: msg.direction || "outgoing",
            isForwarded: msg.isForwarded || false,
            leadStatus: msg.leadStatus || thread.leadStatus || "new_lead",
            service: msg.service || null,
            stepType: msg.stepType || null,
          })),
        };
      });
  };

  const fetchEmails = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem("userid");
      const res = await axios.get(`${API_BASE_URL}/getAllEmailsData/${userId}`);
      const raw = res.data?.data?.threads || [];

      let data = normalizeEmails(raw);

      data = data.sort(
        (a, b) =>
          new Date(b.date || b.createdAt || 0) -
          new Date(a.date || a.createdAt || 0),
      );

      setEmails(data);

      const initialStatuses = {};
      data.forEach((email) => {
        initialStatuses[email._id] = email.leadStatus || "new_lead";
      });

      setLeadStatuses(initialStatuses);

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

  const cleanAddress = (value = "") => {
    return String(value).replace(/^"|"$/g, "").trim();
  };

  const getNameFromAddress = (address = "") => {
    const clean = cleanAddress(address);
    if (!clean) return "Unknown";
    if (clean.includes("<")) {
      return clean.split("<")[0].trim() || clean.match(/<(.+)>/)?.[1] || clean;
    }
    return clean.split("@")[0];
  };

  const getDisplayAddress = (address = "") => {
    return cleanAddress(address);
  };

  const getDisplayRecipient = (email) => {
    const possibleEmails = [
      email?.recipientAddress,
      email?.forwardedMeta?.to,
      email?.toEmail,
      email?.to,
      email?.originalTo,
      email?.originalRecipient,
      email?.recipientEmail,
    ].filter(Boolean);

    const realEmail = possibleEmails.find(
      (address) =>
        !address.includes("mail.replexengine.com") &&
        !address.includes("zenith-inbox.com"),
    );

    return cleanAddress(realEmail || email?.recipientAddress || "");
  };

  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    if (isNaN(diffInSeconds) || diffInSeconds < 0) return "";
    if (diffInSeconds < 60) return `${diffInSeconds}s`;
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d`;
  };

  const getInitials = (address = "") => {
    const name = getNameFromAddress(address);
    if (!name || name === "Unknown") return "MK";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const getCompanyAndSnippet = (email) => {
    const bodyText = (
      safeText(email.textBody) ||
      safeText(email.htmlBody) ||
      ""
    ).replace(/<[^>]*>/g, "").trim();

    let company = email.service || "";
    if (!company && email.senderAddress?.includes("@")) {
      const domain = email.senderAddress.split("@")[1]?.split(".")[0];
      if (
        domain &&
        !["gmail", "yahoo", "hotmail", "outlook", "icloud"].includes(
          domain.toLowerCase(),
        )
      ) {
        company = domain.charAt(0).toUpperCase() + domain.slice(1);
      }
    }

    return {
      company: company ? `${company} Co.` : "Velvet Thread Co.",
      snippet:
        bodyText.length > 0
          ? `"${bodyText.slice(0, 50)}${bodyText.length > 50 ? "..." : ""}"`
          : safeText(email.subject)
          ? `"${safeText(email.subject)}"`
          : '"Looking for theme customization..."',
    };
  };

  const getThreadMessages = (email) => {
    if (!email) return [];
    const parentId = email._id;
    const cleanReplies = (email.replies || email.conversation || []).filter(
      (msg) => msg._id !== parentId,
    );
    const replies = cleanReplies.map((msg) => ({
      ...msg,
      isParentMessage: false,
    }));
    const parentMessage = {
      ...email,
      isParentMessage: true,
    };
    const thread = [parentMessage, ...replies];
    return thread.sort(
      (a, b) =>
        new Date(a.date || a.createdAt || 0) -
        new Date(b.date || b.createdAt || 0),
    );
  };

  const toggleLeadSelection = (emailId) => {
    setSelectedLeadIds((prev) => {
      const next = new Set(prev);
      if (next.has(emailId)) next.delete(emailId);
      else next.add(emailId);
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelectedLeadIds((prev) => {
      if (prev.size === filteredEmails.length) return new Set();
      return new Set(filteredEmails.map((email) => email._id));
    });
  };

  const handleStatusChange = async (emailId, leadStatus) => {
    const oldStatus = leadStatuses[emailId] || "new_lead";
    setLeadStatuses((prev) => ({ ...prev, [emailId]: leadStatus }));

    try {
      await axios.patch(`${API_BASE_URL}/lead-status/${emailId}`, {
        leadStatus,
      });

      setEmails((prev) =>
        prev.map((email) =>
          email._id === emailId ? { ...email, leadStatus } : email,
        ),
      );

      if (selectedEmail?._id === emailId) {
        setSelectedEmail((prev) => ({ ...prev, leadStatus }));
      }
    } catch (err) {
      console.error("Error updating lead status:", err);
      setLeadStatuses((prev) => ({ ...prev, [emailId]: oldStatus }));
      showModal({
        type: "error",
        title: "Status Update Failed",
        message: err.response?.data?.message || "UPDATE ERROR",
      });
    }
  };

  const handleDeleteLeads = async (idsToDelete) => {
    if (!idsToDelete.length) return;

    showModal({
      type: "confirm",
      title: "Delete Lead",
      message: `Are you sure you want to delete ${idsToDelete.length} selected lead(s)?`,
      onConfirm: async () => {
        try {
          await axios.post(`${API_BASE_URL}/leads/delete-many`, {
            emailIds: idsToDelete,
          });

          setEmails((prev) =>
            prev.filter((email) => !idsToDelete.includes(email._id)),
          );

          setSelectedLeadIds(new Set());

          if (selectedEmail && idsToDelete.includes(selectedEmail._id)) {
            setSelectedEmail(null);
          }

          closeModal();
        } catch (err) {
          console.error("Error deleting leads:", err);
          showModal({
            type: "error",
            title: "Delete Failed",
            message: err.response?.data?.message || "Lead delete failed",
          });
        }
      },
    });
  };

  const handleSendThreadReply = async () => {
    if (!selectedEmail || !replyText.trim() || replySending) return;

    const message = replyText.trim();
    const userId = localStorage.getItem("userid");

    try {
      setReplySending(true);

      const res = await axios.post(
        `${API_BASE_URL}/send-thread-reply/${selectedEmail._id}`,
        { message, userId },
      );

      const sentEmail = res.data?.data;

      if (sentEmail) {
        setEmails((prev) =>
          prev.map((email) =>
            email._id === selectedEmail._id
              ? {
                  ...email,
                  children: [
                    ...(email.conversation || email.children || []),
                    sentEmail,
                  ],
                }
              : email,
          ),
        );

        setSelectedEmail((prev) => ({
          ...prev,
          children: [...(prev.children || []), sentEmail],
        }));
      }

      setReplyText("");
    } catch (err) {
      console.error("Error sending thread reply:", err);
      showModal({
        type: "error",
        title: "Reply Failed",
        message: err.response?.data?.message || "",
      });
    } finally {
      setReplySending(false);
    }
  };

  const formatEmailBody = (html, text, isDark = false) => {
    let isHtml = html && html.trim().length > 0;
    let content = isHtml ? html : text;

    if (!content) return "";

    content = content.trim();
    content = content.replace(/disabled/g, "");

    if (isHtml) {
      content = content.replace(
        /(?:<br\s*\/?>\s*[\r\n]*\s*){3,}/gi,
        "<br/><br/>",
      );
      content = content.replace(/\n{3,}/g, "\n\n");
    } else {
      content = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
      content = content.replace(/\n{3,}/g, "\n\n");

      content = content
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

      const linkColor = isDark ? "#F59E0B" : "#1a73e8";
      content = content.replace(
        /(https?:\/\/[^\s<]+)/g,
        `<a href="$1" target="_blank" rel="noreferrer" style="color:${linkColor};text-decoration:underline;font-weight:500">$1</a>`,
      );

      content = content.replace(
        /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g,
        `<a href="mailto:$1" style="color:${linkColor};text-decoration:underline">$1</a>`,
      );

      content = content.replace(/\n/g, "<br/>");
    }

    const textColor = isDark ? "#ffffff" : "#202124";
    const labelColor = isDark ? "#f3f4f6" : "#202124";

    content = content.replace(
      /(Full Name:|Business Email:|Country:|Service:|Budget:|Store Name:|Store URL:|Problem & Goal:)/g,
      `<br/><strong style="color:${labelColor};font-weight:600">$1</strong>`,
    );

    return `
      <div class="email-body-content" style="font-family: system-ui, -apple-system, sans-serif; font-size: 14px; line-height: 1.6; color: ${textColor}; max-width: 100%; word-break: break-word; overflow-wrap: break-word;">
        ${content}
      </div>
    `;
  };

  const handleEmailClick = (email) => {
    setSelectedEmail(email);
    setReadEmails((prev) => new Set(prev).add(email._id));
  };

  // Counts for filter tabs
  const awaitingCount = emails.filter(
    (e) => e.direction === "incoming" || e.leadStatus === "new_lead",
  ).length;

  const filteredEmails = emails.filter((email) => {
    const term = searchTerm.trim().toLowerCase();
    const sender = email.senderAddress || email.forwardedMeta?.from || "";
    const recipient = email.recipientAddress || email.forwardedMeta?.to || "";

    const matchesSearch =
      !term ||
      sender.toLowerCase().includes(term) ||
      recipient.toLowerCase().includes(term) ||
      (email.subject || "").toLowerCase().includes(term) ||
      (email.textBody || "").toLowerCase().includes(term) ||
      (email.service || "").toLowerCase().includes(term);

    if (!matchesSearch) return false;

    if (activeTab === "awaiting") {
      return email.direction === "incoming" || email.leadStatus === "new_lead";
    } else if (activeTab === "auto_replied") {
      return (
        email.direction === "outgoing" ||
        (email.replies && email.replies.length > 0) ||
        email.stepType === "Auto Reply"
      );
    }

    return true;
  });

  return (
    <div className="flex h-screen overflow-hidden bg-[#FAF8F5] font-sans text-slate-900 antialiased">
      <Sidebar />

      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div
              className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full ${
                modal.type === "error"
                  ? "bg-red-50 text-red-600"
                  : modal.type === "confirm"
                  ? "bg-amber-50 text-amber-600"
                  : "bg-blue-50 text-blue-600"
              }`}
            >
              {modal.type === "error"
                ? "!"
                : modal.type === "confirm"
                ? "?"
                : "i"}
            </div>

            <h3 className="text-lg font-bold text-slate-900">{modal.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              {modal.message}
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={closeModal}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              {modal.type === "confirm" ? (
                <button
                  onClick={modal.onConfirm}
                  className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                >
                  Delete
                </button>
              ) : (
                <button
                  onClick={closeModal}
                  className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black"
                >
                  OK
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <main className="flex min-w-0 flex-1 overflow-hidden bg-[#FAF8F5]">
        {/* LEFT PANEL: Leads List */}
        <section
          className={`${
            isMobileView && selectedEmail ? "hidden" : "flex"
          } w-full flex-col border-r border-[#EBE8E1] bg-[#FAF8F5] md:w-[350px] lg:w-[380px] shrink-0 min-h-0`}
        >
          {/* Header Area */}
          <div className="p-5 pb-3 border-b border-[#EBE8E1]">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                Leads
              </h1>

              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E6F4EA] px-2.5 py-1 text-xs font-semibold text-[#137333]">
                <span className="h-2 w-2 rounded-full bg-[#34A853]"></span>
                Automation live
              </span>
            </div>

            {/* Filter Tabs */}
            <div className="mt-4 flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              <button
                onClick={() => setActiveTab("all")}
                className={`rounded-full px-3.5 py-1 text-xs font-medium transition ${
                  activeTab === "all"
                    ? "bg-[#111111] text-white"
                    : "bg-[#EFECE6] text-slate-700 hover:bg-[#E5E2DC]"
                }`}
              >
                All
              </button>

              <button
                onClick={() => setActiveTab("awaiting")}
                className={`rounded-full px-3.5 py-1 text-xs font-medium transition whitespace-nowrap ${
                  activeTab === "awaiting"
                    ? "bg-[#111111] text-white"
                    : "bg-[#EFECE6] text-slate-700 hover:bg-[#E5E2DC]"
                }`}
              >
                Awaiting you · {awaitingCount}
              </button>

              <button
                onClick={() => setActiveTab("auto_replied")}
                className={`rounded-full px-3.5 py-1 text-xs font-medium transition whitespace-nowrap ${
                  activeTab === "auto_replied"
                    ? "bg-[#111111] text-white"
                    : "bg-[#EFECE6] text-slate-700 hover:bg-[#E5E2DC]"
                }`}
              >
                Auto-replied
              </button>
            </div>

            {/* Search Bar & Action Controls */}
            <div className="mt-3 flex items-center gap-2">
              <div className="relative flex-1">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search leads..."
                  className="h-9 w-full rounded-full border border-[#E5E2DC] bg-[#F0EEE9] pl-9 pr-3 text-xs outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white"
                />
              </div>

              <button
                onClick={fetchEmails}
                title="Refresh Inbox"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E5E2DC] bg-[#F0EEE9] text-slate-600 transition hover:bg-[#E5E2DC]"
              >
                <FiRefreshCw
                  className={`text-xs ${loading ? "animate-spin" : ""}`}
                />
              </button>

              {selectedLeadIds.size > 0 && (
                <button
                  onClick={() => handleDeleteLeads([...selectedLeadIds])}
                  className="flex h-9 items-center gap-1 rounded-full bg-red-50 px-2.5 text-xs font-semibold text-red-600 hover:bg-red-100"
                >
                  <FiTrash2 className="text-xs" />
                  ({selectedLeadIds.size})
                </button>
              )}
            </div>
          </div>

          {/* Leads Items List */}
          <div className="min-h-0 flex-1 overflow-y-auto">
            {loading && (
              <div className="flex h-40 items-center justify-center">
                <div className="flex flex-col items-center gap-2 text-slate-400">
                  <FiRefreshCw className="animate-spin text-lg" />
                  <p className="text-xs font-medium">Loading leads...</p>
                </div>
              </div>
            )}

            {!loading && filteredEmails.length === 0 && (
              <div className="flex h-60 flex-col items-center justify-center px-6 text-center text-slate-400">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#EFECE6]">
                  <FiMail className="text-slate-500" />
                </div>
                <p className="text-xs font-semibold text-slate-700">
                  No leads found
                </p>
                <p className="mt-1 text-[11px] text-slate-400">
                  Try adjusting your search or tab filters.
                </p>
              </div>
            )}

            {!loading &&
              filteredEmails.map((email, idx) => {
                const isSelected = selectedEmail?._id === email._id;
                const name = getNameFromAddress(email.senderAddress);
                const { company, snippet } = getCompanyAndSnippet(email);
                const timeAgo = formatTimeAgo(email.date) || `${idx + 1}m`;

                // Determine badge type based on status/direction
                let badgeContent = null;
                if (email.leadStatus === "closed") {
                  badgeContent = (
                    <span className="inline-flex rounded-full bg-[#FCE8E6] px-2.5 py-0.5 text-[11px] font-medium text-[#C5221F]">
                      Reply failed · retrying
                    </span>
                  );
                } else if (
                  email.direction === "incoming" ||
                  email.leadStatus === "new_lead"
                ) {
                  badgeContent = (
                    <span className="inline-flex rounded-full bg-[#FEF3C7] px-2.5 py-0.5 text-[11px] font-medium text-[#92400E]">
                      Awaiting your reply
                    </span>
                  );
                } else if (
                  email.direction === "outgoing" ||
                  (email.replies && email.replies.length > 0)
                ) {
                  badgeContent = (
                    <span className="inline-flex rounded-full bg-[#E6F4EA] px-2.5 py-0.5 text-[11px] font-medium text-[#137333]">
                      Auto-replied · {timeAgo}
                    </span>
                  );
                } else {
                  badgeContent = (
                    <span className="inline-flex rounded-full bg-[#EFECE6] px-2.5 py-0.5 text-[11px] font-medium text-[#5F6368]">
                      No reply yet · day 2 nudge queued
                    </span>
                  );
                }

                return (
                  <button
                    key={email._id}
                    onClick={() => handleEmailClick(email)}
                    className={`group relative flex w-full flex-col border-b border-[#EBE8E1] px-5 py-4 text-left transition ${
                      isSelected
                        ? "bg-[#F2EFE8] border-l-4 border-l-black"
                        : "bg-transparent hover:bg-[#F4F1EA] border-l-4 border-l-transparent"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-sm truncate pr-2">
                        {name}
                      </span>
                      <span className="text-xs text-slate-400 font-medium shrink-0">
                        {timeAgo}
                      </span>
                    </div>

                    <p className="mt-1 truncate text-xs text-slate-500 font-normal leading-relaxed">
                      <span className="font-semibold text-slate-700">
                        {company}
                      </span>{" "}
                      · {snippet}
                    </p>

                    <div className="mt-2.5 flex items-center justify-between">
                      {badgeContent}

                      <input
                        type="checkbox"
                        checked={selectedLeadIds.has(email._id)}
                        onClick={(e) => e.stopPropagation()}
                        onChange={() => toggleLeadSelection(email._id)}
                        className="h-3.5 w-3.5 rounded border-[#D0CCC3] text-slate-900 focus:ring-0 opacity-0 group-hover:opacity-100 checked:opacity-100 transition"
                      />
                    </div>
                  </button>
                );
              })}
          </div>
        </section>

        {/* RIGHT PANEL: Lead Detail & Thread View */}
        <section
          className={`${
            isMobileView && !selectedEmail ? "hidden" : "flex"
          } min-w-0 flex-1 flex-col bg-[#FAF8F5]`}
        >
          {selectedEmail ? (
            <div className="flex min-h-0 flex-1 flex-col">
              {/* Header */}
              <div className="shrink-0 border-b border-[#EBE8E1] bg-[#FAF8F5] px-6 py-4">
                {isMobileView && (
                  <button
                    onClick={() => setSelectedEmail(null)}
                    className="mb-3 inline-flex items-center gap-1 text-xs font-semibold text-slate-700"
                  >
                    <FiArrowLeft /> Back to Leads
                  </button>
                )}

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#A3B899] text-xs font-bold text-slate-800 uppercase tracking-wider">
                      {getInitials(selectedEmail.senderAddress)}
                    </div>

                    <div>
                      <h2 className="text-base font-bold text-slate-900 flex items-center gap-1.5 flex-wrap">
                        <span>
                          {getNameFromAddress(selectedEmail.senderAddress)}
                        </span>
                        <span className="text-slate-300 font-normal">·</span>
                        <span>
                          {getCompanyAndSnippet(selectedEmail).company}
                        </span>
                      </h2>

                      <p className="text-xs text-slate-400 font-normal mt-0.5">
                        via Shopify Partner Directory · Theme customization · est.
                        budget $3-5k
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="inline-flex rounded-full bg-[#FEF3C7] px-3 py-1 text-xs font-medium text-[#92400E]">
                      Hot — replied in 4 min
                    </span>

                    <a
                      href={`https://mail.google.com/mail/u/0/#search/${encodeURIComponent(
                        selectedEmail.senderAddress || "",
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center rounded-full border border-[#E0DDD5] bg-white px-3.5 py-1 text-xs font-semibold text-slate-800 shadow-2xs hover:bg-slate-50 transition"
                    >
                      Open in Gmail
                    </a>

                    <select
                      value={leadStatuses[selectedEmail._id] || "new_lead"}
                      onChange={(e) =>
                        handleStatusChange(selectedEmail._id, e.target.value)
                      }
                      className="h-7 rounded-full border border-[#E0DDD5] bg-white px-2.5 text-xs font-medium text-slate-700 outline-none"
                    >
                      {leadStatusOptions.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={() => handleDeleteLeads([selectedEmail._id])}
                      className="flex h-7 w-7 items-center justify-center rounded-full border border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                      title="Delete Lead"
                    >
                      <FiTrash2 className="text-xs" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Thread Messages List */}
              <div className="min-h-0 flex-1 overflow-y-auto px-8 py-6 space-y-6">
                {getThreadMessages(selectedEmail).map((message, index) => {
                  const isIncoming = message.direction === "incoming";
                  const senderName = getNameFromAddress(
                    message.senderAddress || selectedEmail.senderAddress,
                  );
                  const msgTime = message.date
                    ? new Date(message.date).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "10:42 AM";

                  if (isIncoming) {
                    return (
                      <div
                        key={`${message._id}-${index}`}
                        className="flex flex-col items-start space-y-1.5"
                      >
                        <p className="text-xs text-slate-400 font-medium px-1">
                          {senderName} · {msgTime} · via directory inquiry
                        </p>

                        <div className="w-full max-w-[85%] rounded-[20px] border border-[#EAE7E0] bg-white p-5 text-sm leading-relaxed text-slate-800 shadow-2xs">
                          <div
                            dangerouslySetInnerHTML={{
                              __html: formatEmailBody(
                                message.htmlBody,
                                message.textBody,
                                false,
                              ),
                            }}
                          />
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={`${message._id}-${index}`}
                      className="flex flex-col items-end space-y-1.5"
                    >
                      <div className="flex items-center gap-1.5 text-xs font-medium text-[#137333] px-1">
                        <span className="text-emerald-600 font-bold">✦</span>
                        <span>Auto-reply</span>
                        <span className="text-slate-300">·</span>
                        <span>Priority template</span>
                        <span className="text-slate-300">·</span>
                        <span>sent in 38s</span>
                        <span className="text-slate-300">·</span>
                        <span className="text-slate-400">{msgTime}</span>
                      </div>

                      <div className="w-full max-w-[85%] rounded-[22px] bg-[#111111] p-5 text-sm leading-relaxed text-white shadow-md">
                        <div
                          dangerouslySetInnerHTML={{
                            __html: formatEmailBody(
                              message.htmlBody,
                              message.textBody,
                              true,
                            ),
                          }}
                        />
                      </div>
                    </div>
                  );
                })}

                {/* Hand-off Divider */}
                <div className="my-6 flex justify-center">
                  <span className="rounded-full bg-[#EFECE6] px-4 py-1.5 text-xs font-medium text-[#78716C]">
                    Automation handed off — this thread is yours now
                  </span>
                </div>
              </div>

              {/* Bottom Reply Bar */}
              <div className="border-t border-[#EBE8E1] bg-[#FAF8F5] p-4">
                <div className="flex items-center gap-3 max-w-5xl mx-auto">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendThreadReply();
                      }
                    }}
                    placeholder={`Reply to ${getNameFromAddress(
                      selectedEmail.senderAddress,
                    )}... (sends from ${
                      getDisplayRecipient(selectedEmail) || "wahid@thefold.tech"
                    })`}
                    className="h-12 flex-1 rounded-full border border-[#E5E2DC] bg-[#F0EEE9] px-6 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-slate-400 focus:bg-white"
                  />

                  <button
                    onClick={handleSendThreadReply}
                    disabled={!replyText.trim() || replySending}
                    className="h-12 rounded-full bg-[#111111] px-7 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center shrink-0"
                  >
                    {replySending ? (
                      <FiRefreshCw className="animate-spin text-sm" />
                    ) : (
                      "Send"
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center bg-[#FAF8F5] px-6 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#EFECE6] text-slate-400">
                <FiMail size={24} />
              </div>
              <h3 className="text-base font-semibold text-slate-700">
                Select a lead
              </h3>
              <p className="mt-1 max-w-sm text-xs text-slate-400">
                Choose a lead from the list to view the complete message thread
                and reply.
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Inbox;

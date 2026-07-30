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
  FiCheckCircle,
  FiClock,
  FiExternalLink,
  FiUser,
  FiZap,
  FiFilter,
  FiMessageSquare,
  FiInbox,
  FiTag,
  FiMessageCircle,
  FiCornerUpLeft,
} from "react-icons/fi";

const API_BASE_URL = "https://email-syncing-backend.vercel.app/mailhook";

const Inbox = () => {
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [replySending, setReplySending] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [selectedLeadIds, setSelectedLeadIds] = useState(new Set());
  const [leadStatuses, setLeadStatuses] = useState({});
  const [replyText, setReplyText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // 'all', 'awaiting', 'auto_replied', 'secured', 'closed'
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
            textBody: msg.textBody || msg.body || "",
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
      if (!userId) {
        setLoading(false);
        return;
      }
      const res = await axios.get(`${API_BASE_URL}/getAllEmailsData/${userId}`);
      const raw = res.data?.data?.threads || [];

      let data = normalizeEmails(raw);

      data = data.sort(
        (a, b) =>
          new Date(b.date || b.createdAt || 0) -
          new Date(a.date || a.createdAt || 0)
      );

      setEmails(data);

      const initialStatuses = {};
      data.forEach((email) => {
        initialStatuses[email._id] = email.leadStatus || "new_lead";
      });

      setLeadStatuses(initialStatuses);

      if (!isMobileView && data.length > 0 && !selectedEmail) {
        setSelectedEmail(data[0]);
      } else if (selectedEmail) {
        const updated = data.find((e) => e._id === selectedEmail._id);
        if (updated) setSelectedEmail(updated);
      }
    } catch (err) {
      console.error("Error fetching inbox:", err);
      if (err.response && err.response.status === 404) {
        setEmails([]);
      }
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
    if (!clean) return "Unknown Lead";
    if (clean.includes("<")) {
      return clean.split("<")[0].trim() || clean.match(/<(.+)>/)?.[1] || clean;
    }
    return clean.split("@")[0];
  };

  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    if (isNaN(diffInSeconds) || diffInSeconds < 0) return "Just now";
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const getInitials = (address = "") => {
    const name = getNameFromAddress(address);
    if (!name || name === "Unknown Lead") return "LD";
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
    )
      .replace(/<[^>]*>/g, "")
      .trim();

    let company = email.service || "";
    if (!company && email.senderAddress?.includes("@")) {
      const domain = email.senderAddress.split("@")[1]?.split(".")[0];
      if (
        domain &&
        !["gmail", "yahoo", "hotmail", "outlook", "icloud"].includes(
          domain.toLowerCase()
        )
      ) {
        company = domain.charAt(0).toUpperCase() + domain.slice(1);
      }
    }

    return {
      company: company ? `${company}` : "General Lead",
      snippet:
        bodyText.length > 0
          ? `${bodyText.slice(0, 65)}${bodyText.length > 65 ? "..." : ""}`
          : safeText(email.subject)
          ? `${safeText(email.subject)}`
          : "Inquiry message received",
    };
  };

  // Helper to compile full thread messages including incoming replies and manual replies
  const getThreadMessages = (email) => {
    if (!email) return [];
    const parentId = String(email._id);

    const rawReplies = email.replies || email.conversation || [];
    const cleanReplies = rawReplies.filter((msg) => String(msg._id) !== parentId);

    const replies = cleanReplies.map((msg) => ({
      ...msg,
      isParentMessage: false,
    }));

    const parentMessage = {
      ...email,
      isParentMessage: true,
    };

    // Convert discussion array to thread messages if present
    const discussionMessages = (email.discussion || []).map((disc, idx) => ({
      _id: `disc-${idx}-${disc.date || disc.createdAt}`,
      subject: `Re: ${email.subject || "Lead Inquiry"}`,
      textBody: disc.message || "",
      htmlBody: `<div>${(disc.message || "").replace(/\n/g, "<br/>")}</div>`,
      senderAddress: "You (Support)",
      recipientAddress: email.senderAddress,
      date: disc.date || disc.createdAt || new Date(),
      direction: "outgoing",
      isParentMessage: false,
      stepType: "Manual Reply",
    }));

    const fullList = [parentMessage, ...replies, ...discussionMessages];

    const map = new Map();
    fullList.forEach((item) => {
      if (item.isParentMessage) {
        map.set(`parent-${item._id}`, item);
        return;
      }

      const rawText = item.textBody || item.message || "";
      const rawHtml = item.htmlBody || "";
      const cleanText = (rawText || rawHtml)
        .replace(/<[^>]*>/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();

      // 2-minute time window resolution to group near-identical duplicate messages
      const itemTime = new Date(item.date || item.createdAt || Date.now()).getTime();
      const timeWindow = Math.floor(itemTime / 120000);

      const dedupeKey = cleanText
        ? `${item.direction || "outgoing"}-${timeWindow}-${cleanText}`
        : String(item._id);

      if (!map.has(dedupeKey)) {
        map.set(dedupeKey, item);
      } else {
        const existing = map.get(dedupeKey);
        const existingIsTemp = String(existing._id).startsWith("disc-") || String(existing._id).startsWith("reply-");
        const itemIsTemp = String(item._id).startsWith("disc-") || String(item._id).startsWith("reply-");
        if (existingIsTemp && !itemIsTemp) {
          map.set(dedupeKey, item);
        }
      }
    });

    return Array.from(map.values()).sort(
      (a, b) =>
        new Date(a.date || a.createdAt || 0) -
        new Date(b.date || b.createdAt || 0)
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

  const handleStatusChange = async (emailId, leadStatus) => {
    const oldStatus = leadStatuses[emailId] || "new_lead";
    setLeadStatuses((prev) => ({ ...prev, [emailId]: leadStatus }));

    try {
      await axios.patch(`${API_BASE_URL}/lead-status/${emailId}`, {
        leadStatus,
      });

      setEmails((prev) =>
        prev.map((email) =>
          email._id === emailId ? { ...email, leadStatus } : email
        )
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
        message: err.response?.data?.message || "Unable to update lead status.",
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
            prev.filter((email) => !idsToDelete.includes(email._id))
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
        { message, userId }
      );

      const updatedDoc = res.data?.data;
      const sentChildEmail = res.data?.sentEmail?.data || {
        _id: `reply-${Date.now()}`,
        subject: `Re: ${selectedEmail.subject || "Lead Inquiry"}`,
        textBody: message,
        htmlBody: `<div>${message.replace(/\n/g, "<br/>")}</div>`,
        senderAddress: "You (Support)",
        recipientAddress: selectedEmail.senderAddress,
        date: new Date().toISOString(),
        direction: "outgoing",
        stepType: "Manual Reply",
      };

      const updatedDiscussion = updatedDoc?.discussion || [
        ...(selectedEmail.discussion || []),
        { message, date: new Date().toISOString(), createdBy: userId },
      ];

      const updatedReplies = [
        ...(selectedEmail.replies || []).filter((r) => r._id !== sentChildEmail._id),
        sentChildEmail,
      ];

      const newLeadStatus =
        selectedEmail.leadStatus === "new_lead" ? "awaiting" : selectedEmail.leadStatus;

      setEmails((prev) =>
        prev.map((email) =>
          email._id === selectedEmail._id
            ? {
                ...email,
                leadStatus: newLeadStatus,
                discussion: updatedDiscussion,
                replies: updatedReplies,
                conversation: updatedReplies,
              }
            : email
        )
      );

      setSelectedEmail((prev) => ({
        ...prev,
        leadStatus: newLeadStatus,
        discussion: updatedDiscussion,
        replies: updatedReplies,
        conversation: updatedReplies,
      }));

      setReplyText("");
    } catch (err) {
      console.error("Error sending thread reply:", err);
      showModal({
        type: "error",
        title: "Reply Failed",
        message: err.response?.data?.message || "Unable to send reply.",
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
        "<br/><br/>"
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

      const linkColor = isDark ? "#60A5FA" : "#2563EB";
      content = content.replace(
        /(https?:\/\/[^\s<]+)/g,
        `<a href="$1" target="_blank" rel="noreferrer" style="color:${linkColor};text-decoration:underline;font-weight:500">$1</a>`
      );

      content = content.replace(
        /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g,
        `<a href="mailto:$1" style="color:${linkColor};text-decoration:underline">$1</a>`
      );

      content = content.replace(/\n/g, "<br/>");
    }

    const textColor = isDark ? "#F3F4F6" : "#1E293B";
    const labelColor = isDark ? "#FFFFFF" : "#0F172A";

    content = content.replace(
      /(Full Name:|Business Email:|Country:|Service:|Budget:|Store Name:|Store URL:|Problem & Goal:)/g,
      `<br/><strong style="color:${labelColor};font-weight:600">$1</strong>`
    );

    return `
      <div class="email-body-content" style="font-family: system-ui, -apple-system, sans-serif; font-size: 13.5px; line-height: 1.6; color: ${textColor}; max-width: 100%; word-break: break-word; overflow-wrap: break-word;">
        ${content}
      </div>
    `;
  };

  const handleEmailClick = (email) => {
    setSelectedEmail(email);
  };

  // Counts for filter tabs
  const awaitingCount = emails.filter(
    (e) => e.direction === "incoming" || e.leadStatus === "new_lead"
  ).length;

  const autoRepliedCount = emails.filter(
    (e) =>
      e.direction === "outgoing" ||
      (e.replies && e.replies.length > 0) ||
      e.stepType === "Auto Reply"
  ).length;

  const securedCount = emails.filter((e) => e.leadStatus === "secured").length;
  const closedCount = emails.filter((e) => e.leadStatus === "closed").length;

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
    } else if (activeTab === "secured") {
      return email.leadStatus === "secured";
    } else if (activeTab === "closed") {
      return email.leadStatus === "closed";
    }

    return true;
  });

  return (
    <div className="flex h-screen overflow-hidden bg-[#FAF8F5] font-sans text-slate-900 antialiased">
      <Sidebar />

      {/* Alert / Confirm Modal */}
      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-[16px] bg-white p-6 shadow-2xl border border-slate-200">
            <div
              className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${
                modal.type === "error"
                  ? "bg-red-50 text-red-600"
                  : modal.type === "confirm"
                  ? "bg-amber-50 text-amber-600"
                  : "bg-blue-50 text-blue-600"
              }`}
            >
              <FiMail size={22} />
            </div>

            <h3 className="text-base font-bold text-slate-900">{modal.title}</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-500 font-medium">
              {modal.message}
            </p>

            <div className="mt-6 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-[8px] border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>

              {modal.type === "confirm" ? (
                <button
                  type="button"
                  onClick={modal.onConfirm}
                  className="rounded-[8px] bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 transition cursor-pointer"
                >
                  Delete
                </button>
              ) : (
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-[8px] bg-[#111110] px-4 py-2 text-xs font-bold text-white hover:bg-black transition cursor-pointer"
                >
                  OK
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="flex min-w-0 flex-1 overflow-hidden bg-[#FAF8F5] pt-[60px]">
        {/* LEFT PANEL: Leads List */}
        <section
          className={`${
            isMobileView && selectedEmail ? "hidden" : "flex"
          } w-full flex-col border-r border-[#EBE8E1] bg-[#FAF8F5] md:w-[360px] lg:w-[390px] shrink-0 min-h-0`}
        >
          {/* Header Area */}
          <div className="p-5 pb-3 border-b border-[#EBE8E1]">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <FiInbox size={12} className="text-slate-400" />
                  <span>Inbox / Overview</span>
                </div>
                <h1 className="text-lg font-bold tracking-tight text-slate-900 mt-0.5">
                  Lead Inbox
                </h1>
              </div>

              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 text-[11px] font-semibold text-emerald-800">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75 animate-ping" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-600" />
                </span>
                Poll 60s
              </span>
            </div>

            {/* Filter Tabs */}
            <div className="mt-3.5 flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              <button
                type="button"
                onClick={() => setActiveTab("all")}
                className={`rounded-[8px] px-3.5 py-1.5 text-xs font-bold transition whitespace-nowrap shrink-0 cursor-pointer ${
                  activeTab === "all"
                    ? "bg-[#111110] text-white shadow-2xs"
                    : "bg-[#EFECE6] text-slate-700 hover:bg-[#E5E2DC]"
                }`}
              >
                All ({emails.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("awaiting")}
                className={`rounded-[8px] px-3.5 py-1.5 text-xs font-bold transition whitespace-nowrap shrink-0 cursor-pointer ${
                  activeTab === "awaiting"
                    ? "bg-[#111110] text-white shadow-2xs"
                    : "bg-[#EFECE6] text-slate-700 hover:bg-[#E5E2DC]"
                }`}
              >
                Awaiting ({awaitingCount})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("auto_replied")}
                className={`rounded-[8px] px-3.5 py-1.5 text-xs font-bold transition whitespace-nowrap shrink-0 cursor-pointer ${
                  activeTab === "auto_replied"
                    ? "bg-[#111110] text-white shadow-2xs"
                    : "bg-[#EFECE6] text-slate-700 hover:bg-[#E5E2DC]"
                }`}
              >
                Replied ({autoRepliedCount})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("secured")}
                className={`rounded-[8px] px-3.5 py-1.5 text-xs font-bold transition whitespace-nowrap shrink-0 cursor-pointer ${
                  activeTab === "secured"
                    ? "bg-[#111110] text-white shadow-2xs"
                    : "bg-[#EFECE6] text-slate-700 hover:bg-[#E5E2DC]"
                }`}
              >
                Secured ({securedCount})
              </button>
            </div>

            {/* Search Bar & Action Controls */}
            <div className="mt-3 flex items-center gap-2">
              <div className="relative flex-1 flex items-center">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none text-slate-400">
                  <FiSearch className="text-sm" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search leads by name, email..."
                  className="h-9 w-full rounded-[8px] border border-[#E5E2DC] bg-[#F0EEE9] pl-9 pr-3 text-xs outline-none transition placeholder:text-slate-400 focus:border-slate-800 focus:bg-white font-medium"
                />
              </div>

              <button
                type="button"
                onClick={fetchEmails}
                title="Refresh Inbox"
                className="flex h-9 w-9 items-center justify-center rounded-[8px] border border-[#E5E2DC] bg-[#F0EEE9] text-slate-600 transition hover:bg-[#E5E2DC] shrink-0 cursor-pointer"
              >
                <FiRefreshCw
                  className={`text-xs ${loading ? "animate-spin text-slate-900" : ""}`}
                />
              </button>

              {selectedLeadIds.size > 0 && (
                <button
                  type="button"
                  onClick={() => handleDeleteLeads([...selectedLeadIds])}
                  className="flex h-9 items-center gap-1.5 rounded-[8px] bg-red-50 border border-red-200 px-3 text-xs font-bold text-red-600 hover:bg-red-100 shrink-0 transition cursor-pointer"
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
                  <FiRefreshCw className="animate-spin text-lg text-slate-700" />
                  <p className="text-xs font-bold text-slate-600">Loading leads...</p>
                </div>
              </div>
            )}

            {!loading && filteredEmails.length === 0 && (
              <div className="flex h-60 flex-col items-center justify-center px-6 text-center text-slate-400">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#EFECE6]">
                  <FiInbox className="text-slate-600 text-lg" />
                </div>
                <p className="text-xs font-bold text-slate-700">
                  No leads found
                </p>
                <p className="mt-1 text-[11px] text-slate-400 font-normal">
                  Try adjusting your search query or active tab filter.
                </p>
              </div>
            )}

            {!loading &&
              filteredEmails.map((email, idx) => {
                const isSelected = selectedEmail?._id === email._id;
                const name = getNameFromAddress(email.senderAddress);
                const { company, snippet } = getCompanyAndSnippet(email);
                const timeAgo = formatTimeAgo(email.date) || `${idx + 1}m ago`;

                // Status Badges
                let badgeContent = null;
                if (email.leadStatus === "closed") {
                  badgeContent = (
                    <span className="inline-flex rounded-full bg-red-50 border border-red-200 px-2 py-0.5 text-[10px] font-bold text-red-700">
                      Closed
                    </span>
                  );
                } else if (email.leadStatus === "secured") {
                  badgeContent = (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                      <FiCheckCircle size={10} className="text-emerald-600" /> Secured
                    </span>
                  );
                } else if (
                  email.direction === "incoming" ||
                  email.leadStatus === "new_lead"
                ) {
                  badgeContent = (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                      <FiClock size={10} className="text-amber-600" /> Awaiting reply
                    </span>
                  );
                } else if (
                  email.direction === "outgoing" ||
                  (email.replies && email.replies.length > 0)
                ) {
                  badgeContent = (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                      <FiCheckCircle size={10} className="text-emerald-600" /> Replied
                    </span>
                  );
                } else {
                  badgeContent = (
                    <span className="inline-flex rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                      New Lead
                    </span>
                  );
                }

                return (
                  <button
                    key={email._id}
                    type="button"
                    onClick={() => handleEmailClick(email)}
                    className={`group relative flex w-full flex-col border-b border-[#EBE8E1] px-5 py-3.5 text-left transition cursor-pointer ${
                      isSelected
                        ? "bg-[#F2EFE8] border-l-4 border-l-black"
                        : "bg-transparent hover:bg-[#F4F1EA] border-l-4 border-l-transparent"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs truncate pr-2">
                        {name}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold shrink-0">
                        {timeAgo}
                      </span>
                    </div>

                    <p className="mt-1 truncate text-xs text-slate-500 font-normal leading-relaxed">
                      <span className="font-bold text-slate-800">
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
                        className="h-3.5 w-3.5 rounded border-[#D0CCC3] text-slate-900 focus:ring-0 opacity-0 group-hover:opacity-100 checked:opacity-100 transition cursor-pointer"
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
              {/* Top Detail Header */}
              <div className="shrink-0 border-b border-[#EBE8E1] bg-[#FAF8F5] px-6 py-4">
                {isMobileView && (
                  <button
                    type="button"
                    onClick={() => setSelectedEmail(null)}
                    className="mb-3 inline-flex items-center gap-1 text-xs font-bold text-slate-700"
                  >
                    <FiArrowLeft /> Back to Leads
                  </button>
                )}

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#111110] text-xs font-bold text-white uppercase tracking-wider shadow-2xs">
                      {getInitials(selectedEmail.senderAddress)}
                    </div>

                    <div>
                      <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 flex-wrap">
                        <span>
                          {getNameFromAddress(selectedEmail.senderAddress)}
                        </span>
                        <span className="text-slate-300 font-normal">·</span>
                        <span className="text-slate-600 font-medium">
                          {selectedEmail.senderAddress}
                        </span>
                      </h2>

                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        Subject: <span className="text-slate-800 font-bold">{selectedEmail.subject || "No Subject"}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={`https://mail.google.com/mail/u/0/#search/${encodeURIComponent(
                        selectedEmail.senderAddress || ""
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 h-9 rounded-[8px] border border-[#E0DDD5] bg-white px-3.5 text-xs font-bold text-slate-800 shadow-2xs hover:bg-slate-50 transition cursor-pointer"
                    >
                      <FiExternalLink size={13} />
                      <span>Open in Gmail</span>
                    </a>

                    <select
                      value={leadStatuses[selectedEmail._id] || "new_lead"}
                      onChange={(e) =>
                        handleStatusChange(selectedEmail._id, e.target.value)
                      }
                      className="h-9 rounded-[8px] border border-[#E0DDD5] bg-white px-3 text-xs font-bold text-slate-800 outline-none hover:bg-slate-50 transition cursor-pointer shadow-2xs"
                    >
                      {leadStatusOptions.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => handleDeleteLeads([selectedEmail._id])}
                      className="flex h-9 w-9 items-center justify-center rounded-[8px] border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition cursor-pointer shadow-2xs shrink-0"
                      title="Delete Lead"
                    >
                      <FiTrash2 className="text-sm" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Thread Messages List */}
              <div className="min-h-0 flex-1 overflow-y-auto px-6 lg:px-8 py-6 space-y-6">
                {getThreadMessages(selectedEmail).map((message, index) => {
                  const isIncoming = message.direction === "incoming";
                  const senderName = getNameFromAddress(
                    message.senderAddress || selectedEmail.senderAddress
                  );
                  const msgTime = message.date
                    ? new Date(message.date).toLocaleString([], {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Just now";

                  if (isIncoming) {
                    return (
                      <div
                        key={`${message._id}-${index}`}
                        className="flex flex-col items-start space-y-1.5"
                      >
                        <p className="text-[11px] text-slate-400 font-semibold px-1 flex items-center gap-1.5">
                          <FiUser size={13} className="text-slate-600" />
                          <span className="font-bold text-slate-800">{senderName}</span>
                          <span>·</span>
                          <span>{msgTime}</span>
                        </p>

                        <div className="w-full max-w-[85%] rounded-[18px] border border-[#EAE7E0] bg-white p-5 text-xs leading-relaxed text-slate-800 shadow-2xs">
                          <div
                            dangerouslySetInnerHTML={{
                              __html: formatEmailBody(
                                message.htmlBody,
                                message.textBody,
                                false
                              ),
                            }}
                          />
                        </div>
                      </div>
                    );
                  }

                  const isManual = message.stepType === "Manual Reply" || message.senderAddress?.includes("You");

                  return (
                    <div
                      key={`${message._id}-${index}`}
                      className="flex flex-col items-end space-y-1.5"
                    >
                      <div className="flex items-center gap-1.5 text-[11px] font-bold px-1">
                        {isManual ? (
                          <span className="text-indigo-600 flex items-center gap-1">
                            <FiCornerUpLeft size={12} /> Reply Sent
                          </span>
                        ) : (
                          <span className="text-emerald-700 flex items-center gap-1">
                            <FiZap size={12} /> Auto-reply Sent
                          </span>
                        )}
                        <span className="text-slate-300">·</span>
                        <span className="text-slate-400 font-normal">{msgTime}</span>
                      </div>

                      <div className="w-full max-w-[85%] rounded-[18px] bg-[#111110] p-5 text-xs leading-relaxed text-white shadow-md border border-slate-800">
                        <div
                          dangerouslySetInnerHTML={{
                            __html: formatEmailBody(
                              message.htmlBody,
                              message.textBody,
                              true
                            ),
                          }}
                        />
                      </div>
                    </div>
                  );
                })}

                {/* Hand-off Divider */}
                <div className="my-6 flex justify-center">
                  <span className="rounded-full bg-[#EFECE6] border border-[#E0DDD5] px-4 py-1.5 text-xs font-bold text-slate-700 shadow-2xs flex items-center gap-1.5">
                    <FiMessageCircle size={13} className="text-slate-600" />
                    Automation handed off — thread ready for custom replies
                  </span>
                </div>
              </div>

              {/* Bottom Reply Bar */}
              <div className="border-t border-[#EBE8E1] bg-[#FAF8F5] p-4 shrink-0">
                <div className="flex flex-col gap-2.5 max-w-5xl mx-auto">
                  {/* Quick Reply Pills */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                    <span className="text-[11px] font-bold text-slate-400 whitespace-nowrap flex items-center gap-1">
                      <FiTag size={12} /> Quick Templates:
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setReplyText(
                          `Hi ${getNameFromAddress(
                            selectedEmail.senderAddress
                          )}, thanks for reaching out! We received your request and would love to connect.`
                        )
                      }
                      className="rounded-full border border-[#E0DDD5] bg-white px-3 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-100 transition whitespace-nowrap cursor-pointer"
                    >
                      👋 Greeting & Intro
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setReplyText(
                          "Just checking in to see if you had any questions regarding our initial proposal?"
                        )
                      }
                      className="rounded-full border border-[#E0DDD5] bg-white px-3 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-100 transition whitespace-nowrap cursor-pointer"
                    >
                      📌 Follow-up Nudge
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setReplyText(
                          "Could you please share your store URL and preferred project timeline?"
                        )
                      }
                      className="rounded-full border border-[#E0DDD5] bg-white px-3 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-100 transition whitespace-nowrap cursor-pointer"
                    >
                      📝 Ask Project Details
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
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
                        selectedEmail.senderAddress
                      )}...`}
                      className="h-11 flex-1 rounded-[8px] border border-[#E5E2DC] bg-[#F0EEE9] px-4 text-xs font-medium text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-slate-800 focus:bg-white"
                    />

                    <button
                      type="button"
                      onClick={handleSendThreadReply}
                      disabled={!replyText.trim() || replySending}
                      className="h-11 rounded-[8px] bg-[#111110] hover:bg-black px-6 text-xs font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2 shrink-0 cursor-pointer shadow-xs"
                    >
                      {replySending ? (
                        <FiRefreshCw className="animate-spin text-xs" />
                      ) : (
                        <>
                          <FiSend size={13} />
                          <span>Send Reply</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center bg-[#FAF8F5] px-6 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white border border-[#EBE8E1] text-slate-600 shadow-2xs">
                <FiMessageSquare size={24} />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Select a Lead Thread
              </h3>
              <p className="mt-1 max-w-sm text-xs text-slate-500 leading-relaxed font-medium">
                Choose a lead from the left list to view their message thread, status history, and send direct replies.
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Inbox;

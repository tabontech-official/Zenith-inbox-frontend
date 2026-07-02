import React, { useState, useEffect } from "react";
import Sidebar from "../component/Sidebar";
import axios from "axios";
import {
  FiArrowLeft,
  FiSearch,
  FiTrash2,
  FiMail,
  FiRefreshCw,
  FiMessageSquare,
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
  const safeText = (val) => {
    if (!val) return "";
    if (typeof val === "object") return "";
    return val;
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

          // IMPORTANT: unify replies
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

  const getEmailLabel = (email) => {
    if (email.direction === "incoming") return "Incoming";
    if (email.stepType === "Manual Reply") return "Manual Reply";
    if (email.direction === "outgoing") return "Auto Reply";
    return "Email";
  };

  const getEmailBadgeClass = (email) => {
    if (email.direction === "incoming") {
      return "border-blue-100 bg-blue-50 text-blue-700";
    }

    if (email.stepType === "Manual Reply") {
      return "border-purple-100 bg-purple-50 text-purple-700";
    }

    return "border-emerald-100 bg-emerald-50 text-emerald-700";
  };

  const getAvatarClass = (email) => {
    if (email.direction === "incoming") return "bg-blue-600";
    if (email.stepType === "Manual Reply") return "bg-purple-600";
    return "bg-emerald-600";
  };

 const getThreadMessages = (email) => {
  if (!email) return [];

  const parentId = email._id;

  // STEP 1: clean conversation (REMOVE DUPLICATES)
  const cleanReplies = (email.replies || email.conversation || []).filter(
    (msg) => msg._id !== parentId
  );

  // STEP 2: normalize replies
  const replies = cleanReplies.map((msg) => ({
    ...msg,
    isParentMessage: false,
  }));

  // STEP 3: parent always first
  const parentMessage = {
    ...email,
    isParentMessage: true,
  };

  // STEP 4: combine properly
  const thread = [parentMessage, ...replies];

  // STEP 5: sort safely
  return thread.sort(
    (a, b) =>
      new Date(a.date || a.createdAt || 0) -
      new Date(b.date || b.createdAt || 0)
  );
};

  const getThreadReplies = (email) => {
    return (email?.children || []).filter(
      (child) => child.direction === "outgoing",
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
            message: err.response?.data?.message || "Lead delete nahi hui",
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

  const formatEmailBody = (html, text) => {
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

      content = content.replace(
        /(https?:\/\/[^\s<]+)/g,
        '<a href="$1" target="_blank" rel="noreferrer" style="color:#1a73e8;text-decoration:underline;font-weight:500">$1</a>',
      );

      content = content.replace(
        /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g,
        '<a href="mailto:$1" style="color:#1a73e8;text-decoration:underline">$1</a>',
      );

      content = content.replace(/\n/g, "<br/>");
    }

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

  const renderMessageCard = (message) => {
    const fromAddress = getDisplayAddress(
      message.senderAddress || message.forwardedMeta?.from || "",
    );

    const toAddress = getDisplayAddress(
      message.recipientAddress || message.forwardedMeta?.to || "",
    );

    const messageDate = message.date || message.createdAt;

    return (
      <div
key={`${message._id}-${message.date || message.createdAt}`}
        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
      >
        <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50 px-5 py-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold uppercase text-white ${getAvatarClass(
                message,
              )}`}
            >
              {fromAddress?.[0]?.toUpperCase() || "?"}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate text-sm font-bold text-slate-900">
                  {getNameFromAddress(fromAddress)}
                </p>

                <span
                  className={`rounded-full border px-2 py-0.5 text-[11px] font-bold ${getEmailBadgeClass(
                    message,
                  )}`}
                >
                  {getEmailLabel(message)}
                </span>

                {message.isForwarded && (
                  <span className="rounded-full border border-orange-100 bg-orange-50 px-2 py-0.5 text-[11px] font-bold text-orange-700">
                    Forwarded
                  </span>
                )}

                {message.isParentMessage && (
                  <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-bold text-slate-500">
                    Parent
                  </span>
                )}
              </div>

              <p className="mt-1 break-all text-xs text-slate-500">
                <strong>From:</strong> {fromAddress || "-"}
              </p>

              <p className="mt-0.5 break-all text-xs text-slate-500">
                <strong>To:</strong> {toAddress || "-"}
              </p>

              {message.service && (
                <p className="mt-0.5 text-xs text-slate-500">
                  <strong>Service:</strong> {message.service}
                </p>
              )}

              {message.stepType && (
                <p className="mt-0.5 text-xs text-slate-500">
                  <strong>Step:</strong> {message.stepType}
                </p>
              )}
            </div>
          </div>

          <div className="shrink-0 text-left lg:text-right">
            <p className="text-xs font-semibold text-slate-500">
              {messageDate
                ? new Date(messageDate).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "-"}
            </p>

            <p className="mt-1 text-[11px] capitalize text-slate-400">
              {(message.leadStatus || "new_lead").replace("_", " ")}
            </p>
          </div>
        </div>

        <div className="px-5 py-4">
          <p className="mb-3 text-sm font-semibold text-slate-900">
            {message.subject || "(No Subject)"}
          </p>

          <div
            className="prose prose-sm max-w-none text-sm leading-relaxed text-slate-700"
            dangerouslySetInnerHTML={{
              __html: formatEmailBody(message.htmlBody, message.textBody),
            }}
          />
        </div>
      </div>
    );
  };

  const renderConversation = (email) => {
    const messages = getThreadMessages(email);

    return (
      <div className="space-y-4">
        {messages.map((message) => renderMessageCard(message))}

        {/* {email.discussion?.length > 0 && (
          <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
            <p className="mb-3 text-sm font-bold text-amber-800">
              Internal Discussion
            </p>

            <div className="space-y-2">
              {email.discussion.map((note) => (
                <div
                  key={note._id}
                  className="rounded-xl bg-white px-3 py-2 text-sm text-slate-700 shadow-sm"
                >
                  <p>{note.message}</p>

                  <span className="mt-1 block text-[11px] text-slate-400">
                    {note.createdAt
                      ? new Date(note.createdAt).toLocaleString()
                      : ""}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )} */}
      </div>
    );
  };

  const filteredEmails = emails.filter((email) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;

    const sender = email.senderAddress || email.forwardedMeta?.from || "";

    const recipient = email.recipientAddress || email.forwardedMeta?.to || "";

    return (
      sender.toLowerCase().includes(term) ||
      recipient.toLowerCase().includes(term) ||
      (email.subject || "").toLowerCase().includes(term) ||
      (email.textBody || "").toLowerCase().includes(term) ||
      (email.service || "").toLowerCase().includes(term)
    );
  });

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100 font-sans text-slate-900">
      <Sidebar />
      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div
              className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full ${
                modal.type === "error"
                  ? "bg-red-50 text-red-600"
                  : modal.type === "confirm"
                    ? "bg-orange-50 text-orange-600"
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
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              {modal.type === "confirm" ? (
                <button
                  onClick={modal.onConfirm}
                  className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                >
                  Delete
                </button>
              ) : (
                <button
                  onClick={closeModal}
                  className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  OK
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      <main className="flex min-w-0 flex-1 flex-col md:ml-64">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <FiMail size={20} />
              </div>

              <div>
                <h1 className="text-xl font-semibold tracking-tight text-slate-950">
                  Inbox
                </h1>
                <p className="mt-0.5 text-sm text-slate-500">
                  Manage customer requests and email conversations.
                </p>
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

        <div className="flex min-h-0 flex-1 overflow-hidden p-4">
          <div className="flex min-h-0 w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
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
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search emails..."
                    className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  Conversations
                </p>

                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleSelectAll}
                    className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    {selectedLeadIds.size === filteredEmails.length &&
                    filteredEmails.length > 0
                      ? "Unselect"
                      : "Select All"}
                  </button>

                  {selectedLeadIds.size > 0 && (
                    <button
                      onClick={() => handleDeleteLeads([...selectedLeadIds])}
                      className="inline-flex items-center gap-1 rounded-lg border border-red-100 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-100"
                    >
                      <FiTrash2 size={13} />
                      Delete ({selectedLeadIds.size})
                    </button>
                  )}

                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                    {filteredEmails.length}
                  </span>
                </div>
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

                {!loading && filteredEmails.length === 0 && (
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
                  filteredEmails.map((email) => {
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
                          <input
                            type="checkbox"
                            checked={selectedLeadIds.has(email._id)}
                            onClick={(e) => e.stopPropagation()}
                            onChange={() => toggleLeadSelection(email._id)}
                            className="mt-3 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />

                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold uppercase text-white ${
                              isSelected ? "bg-blue-600" : "bg-slate-700"
                            }`}
                          >
                            {(email.senderAddress ||
                              email.forwardedMeta?.from ||
                              "?")?.[0]?.toUpperCase()}
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
                                {getNameFromAddress(email.senderAddress)}
                              </span>

                              <span className="shrink-0 text-xs font-medium text-slate-400">
                                {email.date
                                  ? new Date(email.date).toLocaleDateString(
                                      [],
                                      {
                                        month: "short",
                                        day: "numeric",
                                      },
                                    )
                                  : ""}
                              </span>
                            </div>

                            <p
                              className={`truncate text-sm ${
                                !isRead
                                  ? "font-semibold text-slate-900"
                                  : "font-medium text-slate-600"
                              }`}
                            >
                              {safeText(email.subject)}
                            </p>

                            <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-400">
                              {(
                                safeText(email.textBody) ||
                                safeText(email.htmlBody) ||
                                ""
                              )
                                .replace(/<[^>]*>/g, "")
                                .slice(0, 120) || "No preview available"}
                            </p>

                            <div className="mt-2 flex flex-wrap items-center gap-1.5">
                              <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold capitalize text-slate-600">
                                {leadStatusOptions.find(
                                  (option) =>
                                    option.value === leadStatuses[email._id],
                                )?.label || "New Lead"}
                              </span>

                              {(email.conversation || email.children || [])
                                .length && (
                                <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                                  {
                                    (email.conversation || email.children || [])
                                      .length
                                  }{" "}
                                  Reply
                                  {(email.conversation || email.children || [])
                                    .length > 1
                                    ? "ies"
                                    : ""}
                                </span>
                              )}

                              {email.service && (
                                <span className="inline-flex rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
                                  {email.service}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
              </div>
            </section>

            <section
              className={`${
                isMobileView && !selectedEmail ? "hidden" : "flex"
              } min-w-0 flex-1 flex-col bg-slate-50`}
            >
              {selectedEmail ? (
                <div className="flex min-h-0 flex-1 flex-col">
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
                              To: {getDisplayRecipient(selectedEmail) || "-"}
                            </p>

                            {selectedEmail.service && (
                              <p className="truncate text-xs text-slate-500">
                                Service: {selectedEmail.service}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <select
                          value={leadStatuses[selectedEmail._id] || "new_lead"}
                          onChange={(e) =>
                            handleStatusChange(
                              selectedEmail._id,
                              e.target.value,
                            )
                          }
                          className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                        >
                          {leadStatusOptions.map((status) => (
                            <option key={status.value} value={status.value}>
                              {status.label}
                            </option>
                          ))}
                        </select>

                        <button
                          onClick={() => handleDeleteLeads([selectedEmail._id])}
                          className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 px-3 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                        >
                          <FiTrash2 size={15} />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="lead-conversation-view min-h-0 flex-1 overflow-y-auto bg-slate-50 px-5 py-6">
                    <div className="mx-auto max-w-5xl space-y-4">
                      {renderConversation(selectedEmail)}

                      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800">
                          <FiMessageSquare size={16} />
                          Reply in same email thread
                        </div>

                        {/* <div className="mb-3 space-y-2">
                          {getThreadReplies(selectedEmail).length === 0 ? (
                            <p className="text-sm text-slate-400">
                              No reply sent from here yet.
                            </p>
                          ) : (
                            getThreadReplies(selectedEmail).map((item, index) => (
                              <div
                                key={`${item._id || item.createdAt}-${index}`}
                                className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700"
                              >
                                <div className="mb-1 flex flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-400">
                                  <span>From: {item.senderAddress || "-"}</span>
                                  <span>To: {item.recipientAddress || "-"}</span>
                                </div>

                                <p>{item.textBody}</p>

                                <span className="mt-1 block text-[11px] text-slate-400">
                                  {new Date(
                                    item.date || item.createdAt,
                                  ).toLocaleString()}
                                </span>
                              </div>
                            ))
                          )}
                        </div> */}

                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Type email reply here..."
                          rows={4}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                        />

                        <button
                          onClick={handleSendThreadReply}
                          className="mt-3 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                          disabled={!replyText.trim() || replySending}
                        >
                          <FiSend size={15} />
                          {replySending ? "Sending..." : "Send Email Reply"}
                        </button>
                      </div>
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
                    Choose a conversation from the inbox to view the full email
                    thread.
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

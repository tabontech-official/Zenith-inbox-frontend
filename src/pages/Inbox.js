import React, { useState, useEffect, useRef } from "react";
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
  FiPaperclip,
  FiFile,
  FiDownload,
  FiX,
  FiAlertCircle,
  FiShoppingBag,
  FiSliders,
  FiShield,
  FiStar,
  FiCheck,
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
  const [replyingToMessage, setReplyingToMessage] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // 'all', 'awaiting', 'auto_replied', 'secured', 'closed'
  const [modal, setModal] = useState({
    open: false,
    type: "info",
    title: "",
    message: "",
    onConfirm: null,
  });

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (selectedEmail) {
      const timer = setTimeout(() => {
        scrollToBottom();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [selectedEmail?._id, selectedEmail?.conversation?.length, selectedEmail?.replies?.length]);

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

  const markEmailAsRead = (emailId) => {
    if (!emailId) return;
    try {
      const readIds = new Set(JSON.parse(localStorage.getItem("readEmailIds") || "[]"));
      if (!readIds.has(emailId)) {
        readIds.add(emailId);
        localStorage.setItem("readEmailIds", JSON.stringify(Array.from(readIds)));
        window.dispatchEvent(new Event("readEmailUpdated"));
      }
    } catch (e) {
      console.error("Error updating read email status:", e);
    }
  };

  const handleEmailClick = (email) => {
    setSelectedEmail(email);
    setReplyingToMessage(null);
    if (email && email._id) {
      markEmailAsRead(email._id);
    }
  };

  const leadStatusOptions = [
    { value: "new_lead", label: "New Lead" },
    { value: "secured", label: "Secured" },
    { value: "closed", label: "Closed" },
  ];

  const getThreadLatestDate = (thread) => {
    if (!thread) return 0;
    let maxTime = 0;

    const checkDate = (d) => {
      if (!d) return;
      const ms = new Date(d).getTime();
      if (!isNaN(ms) && ms > maxTime) {
        maxTime = ms;
      }
    };

    checkDate(thread.lastActivityAt);
    checkDate(thread.date);
    checkDate(thread.createdAt);

    const msgs = thread.replies || thread.conversation || thread.discussion || [];
    msgs.forEach((m) => {
      checkDate(m.date);
      checkDate(m.createdAt);
      checkDate(m.timestamp);
    });

    return maxTime;
  };

  const normalizeEmails = (threads = []) => {
    return threads
      .filter((t) => !t.isDeleted)
      .map((thread) => {
        const messages = thread.conversation || [];
        const sortedMsgs = [...messages].sort(
          (m1, m2) =>
            new Date(m2.date || m2.createdAt || 0) -
            new Date(m1.date || m1.createdAt || 0)
        );
        const newestMessage = sortedMsgs.length > 0 ? sortedMsgs[0] : null;

        const lastActivityAt =
          (newestMessage ? newestMessage.date || newestMessage.createdAt : null) ||
          thread.lastActivityAt ||
          thread.date ||
          thread.createdAt;

        const latestSenderAddress =
          (newestMessage ? newestMessage.senderAddress || newestMessage.forwardedMeta?.from : null) ||
          thread.senderAddress ||
          thread.forwardedMeta?.from ||
          "Unknown";

        const latestTextBody =
          (newestMessage ? newestMessage.textBody || newestMessage.htmlBody || newestMessage.body : null) ||
          thread.textBody ||
          thread.body ||
          "";

        return {
          _id: thread._id,
          threadId: thread.threadId || thread._id,
          subject: thread.subject || "",
          textBody: thread.textBody || thread.body || "",
          htmlBody: thread.htmlBody || "",
          latestTextBody,
          latestSenderAddress,
          senderAddress:
            thread.senderAddress || thread.forwardedMeta?.from || "Unknown",
          recipientAddress:
            thread.recipientAddress || thread.forwardedMeta?.to || "",
          date: thread.date || thread.createdAt,
          lastActivityAt,
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

  const prevEmailMapRef = useRef(new Map());

  const playNotificationSound = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {
      console.log("Audio play error:", e);
    }
  };

  const sendDesktopNotification = (title, body) => {
    try {
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(title, {
          body: body || "You received a new message in Zenith Inbox",
        });
      }
    } catch (e) {
      console.log("Desktop notification error:", e);
    }
  };

  const fetchEmails = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const userId = localStorage.getItem("userid");
      if (!userId) return;

      const res = await axios.get(`${API_BASE_URL}/getAllEmailsData/${userId}`);
      const raw = res.data?.data?.threads || [];

      let data = normalizeEmails(raw);

      data = data.sort(
        (a, b) => getThreadLatestDate(b) - getThreadLatestDate(a)
      );

      // Check for new incoming messages during background polls to trigger notifications
      if (!showLoading && prevEmailMapRef.current.size > 0) {
        let hasNewIncoming = false;
        let newSender = "";
        let newSnippet = "";

        data.forEach((thread) => {
          const prevMsgCount = prevEmailMapRef.current.get(thread._id) || 0;
          const currentMsgCount = (thread.replies || thread.conversation || []).length || 1;

          if (currentMsgCount > prevMsgCount) {
            hasNewIncoming = true;
            newSender = getNameFromAddress(thread.latestSenderAddress || thread.senderAddress, thread);
            newSnippet = thread.latestTextBody || thread.subject || "New message received";
          }
        });

        if (hasNewIncoming) {
          playNotificationSound();
          sendDesktopNotification(`📩 New Email from ${newSender}`, newSnippet);
        }
      }

      // Update message counts reference
      const newMap = new Map();
      data.forEach((t) => {
        const count = (t.replies || t.conversation || []).length || 1;
        newMap.set(t._id, count);
      });
      prevEmailMapRef.current = newMap;

      setEmails(data);

      const initialStatuses = {};
      data.forEach((email) => {
        initialStatuses[email._id] = email.leadStatus || "new_lead";
      });

      setLeadStatuses(initialStatuses);

      if (!isMobileView && data.length > 0 && !selectedEmail) {
        setSelectedEmail(data[0]);
        markEmailAsRead(data[0]._id);
      } else if (selectedEmail) {
        const updated = data.find((e) => e._id === selectedEmail._id);
        if (updated) {
          setSelectedEmail(updated);
          markEmailAsRead(updated._id);
        }
      }
    } catch (err) {
      console.error("Error fetching inbox:", err);
      if (err.response && err.response.status === 404) {
        setEmails([]);
      }
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    fetchEmails(true);

    // Automatic real-time background polling every 6 seconds
    const interval = setInterval(() => {
      fetchEmails(false);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  const cleanAddress = (value = "") => {
    return String(value).replace(/^"|"$/g, "").trim();
  };

  const getNameFromAddress = (address = "", emailObj = null) => {
    if (emailObj) {
      const first = emailObj.senderFirstName?.trim();
      const last = emailObj.senderLastName?.trim();
      if (first || last) {
        return `${first || ""} ${last || ""}`.trim();
      }
      if (emailObj.senderName?.trim()) {
        return emailObj.senderName.trim();
      }
    }
    const clean = cleanAddress(address);
    if (!clean) return "Unknown Lead";
    if (clean.includes("<")) {
      return clean.split("<")[0].trim() || clean.match(/<(.+)>/)?.[1] || clean;
    }
    return clean.split("@")[0];
  };

  const getAttachmentUrl = (att) => {
    if (!att) return "#";
    const pathStr = att.url || att.path || "";
    if (!pathStr) return "#";
    if (
      pathStr.startsWith("http://") ||
      pathStr.startsWith("https://") ||
      pathStr.startsWith("data:")
    ) {
      return pathStr;
    }
    const cleanPath = String(pathStr)
      .replace(/\\/g, "/")
      .replace(/^(.*?)uploads\//, "");

    const backendOrigin = API_BASE_URL.replace(/\/mailhook\/?$/, "");
    return `${backendOrigin}/uploads/${cleanPath}`;
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
      const rawText = item.textBody || item.message || "";
      const rawHtml = item.htmlBody || "";
      const cleanText = (rawText || rawHtml)
        .replace(/<[^>]*>/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();

      const textSnippet = cleanText.slice(0, 150);
      const cleanMsgId = item.messageId ? String(item.messageId).replace(/^<|>$/g, "").trim() : "";

      // Deduplicate by clean Message-ID or by textSnippet
      const contentKey = cleanMsgId ? `msg:${cleanMsgId}` : textSnippet ? `text:${textSnippet}` : `id:${item._id}`;

      if (!map.has(contentKey)) {
        map.set(contentKey, item);
      } else {
        const existing = map.get(contentKey);
        // Prefer outgoing status badge / reply over duplicate incoming sync
        if (existing.direction === "incoming" && item.direction === "outgoing") {
          map.set(contentKey, item);
        }
      }
    });

    const uniqueMessages = Array.from(map.values());

    return uniqueMessages.sort(
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

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...filesArray]);
    }
  };

  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSendThreadReply = async () => {
    if (!selectedEmail || (!replyText.trim() && selectedFiles.length === 0) || replySending) return;

    const message = replyText.trim();
    const userId = localStorage.getItem("userid");

    try {
      setReplySending(true);

      const formData = new FormData();
      formData.append("message", message);
      if (userId) formData.append("userId", userId);
      if (replyingToMessage) {
        if (replyingToMessage.messageId) {
          formData.append("targetMessageId", replyingToMessage.messageId);
        }
        if (replyingToMessage._id) {
          formData.append("targetParentEmailId", replyingToMessage._id);
        }
      }
      selectedFiles.forEach((file) => {
        formData.append("attachments", file);
      });

      const res = await axios.post(
        `${API_BASE_URL}/send-thread-reply/${selectedEmail._id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
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
        attachments: selectedFiles.map((f) => ({
          filename: f.name,
          size: f.size,
          contentType: f.type,
        })),
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

      const nowIso = new Date().toISOString();

      setEmails((prev) => {
        const updated = prev.map((email) =>
          email._id === selectedEmail._id
            ? {
                ...email,
                leadStatus: newLeadStatus,
                discussion: updatedDiscussion,
                replies: updatedReplies,
                conversation: updatedReplies,
                lastActivityAt: nowIso,
                latestTextBody: message,
                latestSenderAddress: "You (Support)",
              }
            : email
        );

        return updated.sort(
          (a, b) => getThreadLatestDate(b) - getThreadLatestDate(a)
        );
      });

      setSelectedEmail((prev) => ({
        ...prev,
        leadStatus: newLeadStatus,
        discussion: updatedDiscussion,
        replies: updatedReplies,
        conversation: updatedReplies,
        lastActivityAt: nowIso,
        latestTextBody: message,
        latestSenderAddress: "You (Support)",
      }));

      setReplyText("");
      setReplyingToMessage(null);
      setSelectedFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
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

  // Sidebar navigation option state: 'all' | 'shopify' | 'custom' | 'awaiting' | 'replied' | 'secured'
  const [sidebarFilter, setSidebarFilter] = useState("all");

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

  const shopifyCount = emails.filter(
    (e) =>
      (e.service || "").toLowerCase().includes("shopify") ||
      (e.subject || "").toLowerCase().includes("shopify") ||
      e.stepType === "shopify-test-parent" ||
      !!e.extraFields?.storeName
  ).length;

  const customCount = emails.filter(
    (e) =>
      (e.service || "").toLowerCase() === "custom" ||
      e.emailType === "custom" ||
      (e.subject || "").toLowerCase().includes("custom test") ||
      (!((e.service || "").toLowerCase().includes("shopify") || (e.subject || "").toLowerCase().includes("shopify")))
  ).length;

  const filteredEmails = emails.filter((email) => {
    // 1. Sidebar Category/Status Filter
    if (sidebarFilter === "shopify") {
      const isShopify =
        (email.service || "").toLowerCase().includes("shopify") ||
        (email.subject || "").toLowerCase().includes("shopify") ||
        email.stepType === "shopify-test-parent" ||
        !!email.extraFields?.storeName;
      if (!isShopify) return false;
    } else if (sidebarFilter === "custom") {
      const isCustom =
        (email.service || "").toLowerCase() === "custom" ||
        email.emailType === "custom" ||
        (email.subject || "").toLowerCase().includes("custom test") ||
        (!((email.service || "").toLowerCase().includes("shopify") || (email.subject || "").toLowerCase().includes("shopify")));
      if (!isCustom) return false;
    } else if (sidebarFilter === "awaiting") {
      if (!(email.direction === "incoming" || email.leadStatus === "new_lead")) return false;
    } else if (sidebarFilter === "replied") {
      const isReplied =
        email.direction === "outgoing" ||
        (email.replies && email.replies.length > 0) ||
        email.stepType === "Auto Reply";
      if (!isReplied) return false;
    } else if (sidebarFilter === "secured") {
      if (email.leadStatus !== "secured") return false;
    }

    // 2. Search Term Filter
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;

    const sender = email.latestSenderAddress || email.senderAddress || email.forwardedMeta?.from || "";
    const recipient = email.recipientAddress || email.forwardedMeta?.to || "";
    const subj = email.subject || "";
    const body = email.latestTextBody || email.textBody || "";

    return (
      sender.toLowerCase().includes(term) ||
      recipient.toLowerCase().includes(term) ||
      subj.toLowerCase().includes(term) ||
      body.toLowerCase().includes(term)
    );
  });

  return (
    <div className="flex h-screen overflow-hidden bg-[#FAF8F5] font-sans text-slate-900 antialiased">
      <Sidebar />

      {/* Alert / Confirm Modal */}
      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-[440px] rounded-[24px] bg-white p-7 shadow-2xl border border-slate-100/80">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-[16px] ${
                modal.type === "error"
                  ? "bg-red-50 text-red-600 border border-red-100"
                  : modal.type === "confirm"
                  ? "bg-[#FFF8EE] text-[#D97706] border border-[#FDE68A]/40"
                  : "bg-indigo-50 text-indigo-600 border border-indigo-100"
              }`}
            >
              {modal.type === "confirm" ? (
                <FiMail size={22} className="text-[#D97706]" />
              ) : modal.type === "error" ? (
                <FiAlertCircle size={22} />
              ) : (
                <FiMail size={22} />
              )}
            </div>

            <h3 className="mt-5 text-lg font-bold text-[#111110] tracking-tight">{modal.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-500 font-medium">
              {modal.message}
            </p>

            <div className="mt-7 flex items-center justify-end gap-3">
              {modal.type === "confirm" && (
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-[12px] border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition cursor-pointer shadow-2xs"
                >
                  Cancel
                </button>
              )}

              {modal.type === "confirm" ? (
                <button
                  type="button"
                  onClick={modal.onConfirm}
                  className="rounded-[12px] bg-[#DC2626] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#B91C1C] transition cursor-pointer shadow-xs active:scale-[0.98]"
                >
                  Delete
                </button>
              ) : (
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-[12px] bg-[#111110] px-6 py-2.5 text-xs font-bold text-white hover:bg-black transition cursor-pointer shadow-xs"
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
        {/* LEFT SIDEBAR NAVIGATION OPTIONS */}
        <aside className="hidden md:flex w-52 lg:w-56 flex-col border-r border-[#EBE8E1] bg-[#FAF8F5] p-3 shrink-0">
          <div className="px-3 py-2 mb-1">
            <h2 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Lead Inbox</h2>
          </div>

          <div className="space-y-1">
            <button
              type="button"
              onClick={() => setSidebarFilter("all")}
              className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-bold transition cursor-pointer ${
                sidebarFilter === "all" ? "bg-[#111110] text-white shadow-2xs" : "text-slate-700 hover:bg-[#EFECE6]"
              }`}
            >
              <span className="flex items-center gap-2.5">
                <FiInbox size={15} /> All
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                  sidebarFilter === "all" ? "bg-slate-800 text-white" : "bg-[#E5E2DC] text-slate-700"
                }`}
              >
                {emails.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSidebarFilter("shopify")}
              className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-bold transition cursor-pointer ${
                sidebarFilter === "shopify" ? "bg-[#34A853] text-white shadow-2xs" : "text-slate-700 hover:bg-[#EFECE6]"
              }`}
            >
              <span className="flex items-center gap-2.5">
                <FiShoppingBag size={15} /> Shopify
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                  sidebarFilter === "shopify" ? "bg-emerald-800 text-white" : "bg-[#E5E2DC] text-slate-700"
                }`}
              >
                {shopifyCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSidebarFilter("custom")}
              className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-bold transition cursor-pointer ${
                sidebarFilter === "custom" ? "bg-indigo-600 text-white shadow-2xs" : "text-slate-700 hover:bg-[#EFECE6]"
              }`}
            >
              <span className="flex items-center gap-2.5">
                <FiSliders size={15} /> Custom
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                  sidebarFilter === "custom" ? "bg-indigo-800 text-white" : "bg-[#E5E2DC] text-slate-700"
                }`}
              >
                {customCount}
              </span>
            </button>

            <div className="my-3 border-t border-[#EBE8E1] px-3 pt-3">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Status Filters</span>
            </div>

            <button
              type="button"
              onClick={() => setSidebarFilter("awaiting")}
              className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-bold transition cursor-pointer ${
                sidebarFilter === "awaiting" ? "bg-amber-600 text-white shadow-2xs" : "text-slate-700 hover:bg-[#EFECE6]"
              }`}
            >
              <span className="flex items-center gap-2.5">
                <FiClock size={15} /> Awaiting reply
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                  sidebarFilter === "awaiting" ? "bg-amber-800 text-white" : "bg-[#E5E2DC] text-slate-700"
                }`}
              >
                {awaitingCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSidebarFilter("replied")}
              className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-bold transition cursor-pointer ${
                sidebarFilter === "replied" ? "bg-emerald-600 text-white shadow-2xs" : "text-slate-700 hover:bg-[#EFECE6]"
              }`}
            >
              <span className="flex items-center gap-2.5">
                <FiCheckCircle size={15} /> Replied
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                  sidebarFilter === "replied" ? "bg-emerald-800 text-white" : "bg-[#E5E2DC] text-slate-700"
                }`}
              >
                {autoRepliedCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSidebarFilter("secured")}
              className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-bold transition cursor-pointer ${
                sidebarFilter === "secured" ? "bg-blue-600 text-white shadow-2xs" : "text-slate-700 hover:bg-[#EFECE6]"
              }`}
            >
              <span className="flex items-center gap-2.5">
                <FiShield size={15} /> Secured
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                  sidebarFilter === "secured" ? "bg-blue-800 text-white" : "bg-[#E5E2DC] text-slate-700"
                }`}
              >
                {securedCount}
              </span>
            </button>
          </div>
        </aside>

        {/* MIDDLE PANEL: Leads List */}
        <section
          className={`${
            isMobileView && selectedEmail ? "hidden" : "flex"
          } w-full flex-col border-r border-[#EBE8E1] bg-[#FAF8F5] md:w-[340px] lg:w-[370px] shrink-0 min-h-0`}
        >
          {/* Search & Actions Header */}
          <div className="p-4 border-b border-[#EBE8E1]">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <FiSearch className="absolute left-3 top-3 text-slate-400 text-xs" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search leads, emails..."
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
                  Try adjusting your search query or active filter.
                </p>
              </div>
            )}

            {!loading &&
              filteredEmails.map((email, idx) => {
                const isSelected = selectedEmail?._id === email._id;
                const name = getNameFromAddress(email.latestSenderAddress || email.senderAddress, email);
                const { company, snippet } = getCompanyAndSnippet(email);
                const timeAgo = formatTimeAgo(email.lastActivityAt || email.date) || `${idx + 1}m ago`;
                const msgCount = (email.replies || email.conversation || []).length || 1;
                const conversation = email.replies || email.conversation || [];
                const hasReplies = conversation.length > 1 || email.direction === "outgoing" || email.stepType === "Auto Reply";

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
                } else if (hasReplies) {
                  badgeContent = (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                      <FiCheckCircle size={10} className="text-emerald-600" /> Replied
                    </span>
                  );
                } else {
                  badgeContent = (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                      <FiClock size={10} className="text-amber-600" /> Awaiting reply
                    </span>
                  );
                }

                const readIds = new Set(
                  JSON.parse(localStorage.getItem("readEmailIds") || "[]")
                );
                const isUnread = !readIds.has(email._id);

                return (
                  <button
                    key={email._id}
                    type="button"
                    onClick={() => handleEmailClick(email)}
                    className={`group relative flex w-full flex-col border-b border-[#EBE8E1] px-4 py-3.5 text-left transition cursor-pointer ${
                      isSelected
                        ? "bg-[#F2EFE8] border-l-4 border-l-black"
                        : isUnread
                        ? "bg-amber-50/50 hover:bg-[#F4F1EA] border-l-4 border-l-red-500"
                        : "bg-transparent hover:bg-[#F4F1EA] border-l-4 border-l-transparent"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs truncate pr-2 flex items-center gap-1.5">
                        {isUnread && (
                          <span className="h-2 w-2 rounded-full bg-red-600 shrink-0 animate-pulse" title="Unread message" />
                        )}
                        <span className={`truncate ${isUnread ? "font-black text-slate-950" : "font-bold text-slate-800"}`}>{name}</span>
                        {msgCount > 1 && (
                          <span className="rounded-full bg-slate-200 px-1.5 py-0.2 text-[9px] font-extrabold text-slate-700">
                            {msgCount}
                          </span>
                        )}
                        {isUnread && (
                          <span className="rounded-full bg-red-100 border border-red-200 px-1.5 py-0.2 text-[9px] font-black text-red-700">
                            UNREAD
                          </span>
                        )}
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

        {/* RIGHT PANEL: Lead Detail & Thread View (Gmail Structure) */}
        <section
          className={`${
            isMobileView && !selectedEmail ? "hidden" : "flex"
          } min-w-0 flex-1 flex-col bg-[#FAF8F5]`}
        >
          {selectedEmail ? (
            <div className="flex min-h-0 flex-1 flex-col">
              {/* Top Detail Header Toolbar */}
              <div className="shrink-0 border-b border-[#EBE8E1] bg-[#FAF8F5] px-6 py-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedEmail(null)}
                      className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-[#E0DDD5] bg-white text-slate-700 hover:bg-slate-50 transition cursor-pointer shadow-2xs"
                      title="Back to leads list"
                    >
                      <FiArrowLeft size={14} />
                    </button>

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

              {/* Gmail-Style Thread Messages List */}
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

                  const isManual = message.stepType === "Manual Reply" || message.senderAddress?.includes("You");

                  // Gmail-style Avatar color
                  const avatarBg = isIncoming
                    ? "bg-[#C2410C]"
                    : isManual
                    ? "bg-[#18181B]"
                    : "bg-[#7E22CE]";

                  return (
                    <div
                      key={`${message._id}-${index}`}
                      className="rounded-[18px] border border-[#EAE7E0] bg-white p-5 shadow-2xs transition hover:shadow-xs"
                    >
                      {/* Message Header */}
                      <div className="flex items-start justify-between pb-3 mb-3 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white uppercase tracking-wider ${avatarBg}`}
                          >
                            {getInitials(message.senderAddress || senderName)}
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 text-xs">
                                {senderName}
                              </span>
                              {!isIncoming && (
                                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-extrabold text-slate-600">
                                  {isManual ? "Manual Reply" : "Auto-reply"}
                                </span>
                              )}
                            </div>

                            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                              to {message.recipientAddress || "me"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 text-right">
                          <span className="text-[11px] font-semibold text-slate-400">
                            {msgTime}
                          </span>
                          {isIncoming && (
                            <button
                              type="button"
                              onClick={() => setReplyingToMessage(message)}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-900 transition cursor-pointer"
                              title="Reply to this message"
                            >
                              <FiCornerUpLeft size={13} />
                              <span>Reply</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Message Body */}
                      <div className="text-xs leading-relaxed text-slate-800">
                        <div
                          dangerouslySetInnerHTML={{
                            __html: formatEmailBody(
                              message.htmlBody,
                              message.textBody,
                              false
                            ),
                          }}
                        />

                        {/* Attachments Grid */}
                        {message.attachments && message.attachments.length > 0 && (
                          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-2">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Attachments ({message.attachments.length})
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {message.attachments.map((att, attIdx) => (
                                <a
                                  key={attIdx}
                                  href={getAttachmentUrl(att)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  download={att.filename || "attachment"}
                                  className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3 py-2 text-xs font-medium text-slate-800 transition group"
                                >
                                  <FiFile size={14} className="text-indigo-600 shrink-0" />
                                  <div className="flex flex-col">
                                    <span className="font-semibold text-[11px] max-w-[180px] truncate group-hover:underline">
                                      {att.filename}
                                    </span>
                                    {att.size && (
                                      <span className="text-[9px] text-slate-400">
                                        {(att.size / 1024).toFixed(0)} KB
                                      </span>
                                    )}
                                  </div>
                                  <FiDownload
                                    size={12}
                                    className="text-slate-400 group-hover:text-slate-700 ml-1 shrink-0"
                                  />
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
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

                {/* Scroll Target for Latest Message */}
                <div ref={messagesEndRef} />
              </div>

              {/* Bottom Reply Composer */}
              <div className="border-t border-[#EBE8E1] bg-[#FAF8F5] p-4 shrink-0">
                <div className="flex flex-col gap-2.5 max-w-5xl mx-auto">
                  {/* Targeted Message Indicator Banner */}
                  {replyingToMessage && (
                    <div className="flex items-center justify-between rounded-lg bg-indigo-50 border border-indigo-200 px-3 py-1.5 text-xs text-indigo-950 font-medium shadow-2xs">
                      <span className="truncate flex items-center gap-1.5">
                        <FiCornerUpLeft size={13} className="text-indigo-600 shrink-0" />
                        <span>Replying directly to message from <strong className="font-bold">{getNameFromAddress(replyingToMessage.senderAddress || selectedEmail.senderAddress)}</strong>:</span>
                        <span className="text-slate-600 truncate max-w-[280px]">"{replyingToMessage.textBody?.replace(/<[^>]*>/g, '').trim().slice(0, 60) || 'Selected message'}..."</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setReplyingToMessage(null)}
                        className="text-indigo-600 hover:text-indigo-900 text-xs font-bold shrink-0 ml-2 cursor-pointer"
                      >
                        ✕ Clear target
                      </button>
                    </div>
                  )}

                  {/* Selected Files Preview */}
                  {selectedFiles.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 pb-1">
                      {selectedFiles.map((file, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-1.5 rounded-md border border-[#E0DDD5] bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 shadow-2xs"
                        >
                          <FiFile size={12} className="text-indigo-600" />
                          <span className="max-w-[150px] truncate">{file.name}</span>
                          <span className="text-[9px] text-slate-400">
                            ({(file.size / 1024).toFixed(0)}KB)
                          </span>
                          <button
                            type="button"
                            onClick={() => removeFile(idx)}
                            className="text-slate-400 hover:text-red-600 transition cursor-pointer ml-1"
                          >
                            <FiX size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Quick Reply Pills */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                    <button
                      type="button"
                      onClick={() => setReplyText("Ok, see you soon.")}
                      className="rounded-full border border-[#E0DDD5] bg-white px-3.5 py-1.5 text-xs font-medium text-slate-800 hover:bg-slate-100 transition whitespace-nowrap cursor-pointer shadow-2xs"
                    >
                      Ok, see you soon.
                    </button>
                    <button
                      type="button"
                      onClick={() => setReplyText("I'm here.")}
                      className="rounded-full border border-[#E0DDD5] bg-white px-3.5 py-1.5 text-xs font-medium text-slate-800 hover:bg-slate-100 transition whitespace-nowrap cursor-pointer shadow-2xs"
                    >
                      I'm here.
                    </button>
                    <button
                      type="button"
                      onClick={() => setReplyText("I am waiting.")}
                      className="rounded-full border border-[#E0DDD5] bg-white px-3.5 py-1.5 text-xs font-medium text-slate-800 hover:bg-slate-100 transition whitespace-nowrap cursor-pointer shadow-2xs"
                    >
                      I am waiting.
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setReplyText(
                          `Hi ${getNameFromAddress(
                            selectedEmail.senderAddress
                          )}, thanks for reaching out! We received your request and would love to connect.`
                        )
                      }
                      className="rounded-full border border-[#E0DDD5] bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition whitespace-nowrap cursor-pointer shadow-2xs"
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
                      className="rounded-full border border-[#E0DDD5] bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition whitespace-nowrap cursor-pointer shadow-2xs"
                    >
                      📌 Follow-up Nudge
                    </button>
                  </div>

                  {/* Input Box and Controls */}
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      multiple
                      className="hidden"
                    />

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      title="Attach files"
                      className="h-11 w-11 rounded-[8px] border border-[#E5E2DC] bg-[#F0EEE9] hover:bg-white hover:border-slate-400 text-slate-700 flex items-center justify-center transition cursor-pointer shrink-0"
                    >
                      <FiPaperclip size={16} />
                    </button>

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
                      disabled={(!replyText.trim() && selectedFiles.length === 0) || replySending}
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
                Choose a lead from the list to view their message thread, status history, and send direct replies.
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Inbox;

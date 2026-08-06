import React, { useState, useEffect, useRef } from "react";
import AppLayout from "../component/AppLayout";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { fetchCompanyProfile, generateAiReply, recordAiReplyUsed } from "../utils/aiReplyService";
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
  FiPrinter,
  FiSmile,
  FiMoreVertical,
  FiLink,
  FiImage,
  FiLock,
  FiEdit3,
  FiMaximize2,
  FiChevronDown,
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
  const [activeReplyMsgId, setActiveReplyMsgId] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const replyTextRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // 'all', 'awaiting', 'auto_replied', 'secured', 'closed'
  const [modal, setModal] = useState({
    open: false,
    type: "info",
    title: "",
    message: "",
    onConfirm: null,
  });

  // ── AI Replies ──────────────────────────────────────────────────────────────
  const [aiActive, setAiActive] = useState(() => {
    try {
      const stored = localStorage.getItem("aiRepliesActive");
      return stored === "true";
    } catch { return false; }
  });
  const [aiGenerating, setAiGenerating] = useState(false);
  const companyProfileRef = useRef(null); // cached company profile
  // ────────────────────────────────────────────────────────────────────────────

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
    setActiveReplyMsgId(null);
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

        const uniqueMsgsMap = new Map();
        messages.forEach((m) => {
          const cleanId = m.messageId ? m.messageId.replace(/^<|>$/g, "").trim().toLowerCase() : "";
          const text = (m.textBody || m.htmlBody || m.body || "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim().toLowerCase().slice(0, 100);
          const dir = m.direction || "incoming";
          const sender = (m.senderAddress || "").trim().toLowerCase();
          const key = cleanId || `${dir}:${sender}:${text}`;

          if (!uniqueMsgsMap.has(key)) {
            uniqueMsgsMap.set(key, m);
          }
        });

        const deduplicatedMsgs = Array.from(uniqueMsgsMap.values());

        const sortedMsgs = [...deduplicatedMsgs].sort(
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
          replies: deduplicatedMsgs.map((msg) => ({
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
  const selectedEmailRef = useRef(selectedEmail);

  useEffect(() => {
    selectedEmailRef.current = selectedEmail;
  }, [selectedEmail]);

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

      const currentSelected = selectedEmailRef.current;

      if (currentSelected) {
        const updated = data.find(
          (e) =>
            e._id === currentSelected._id ||
            (e.threadId && e.threadId === currentSelected.threadId) ||
            (e.conversationId && e.conversationId === currentSelected.conversationId)
        );
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

  // Sync AI replies status from user settings + pre-load company profile
  useEffect(() => {
    const userId = localStorage.getItem("userid");
    if (!userId) return;

    // Check AI status from backend
    axios
      .get(`https://email-syncing-backend.vercel.app/auth/getUsers/${userId}`)
      .then((res) => {
        const userData = res.data?.data;
        if (userData) {
          const isActive = userData.Ai === true || userData.subscription?.aiRepliesActive === true;
          setAiActive(isActive);
          localStorage.setItem("aiRepliesActive", String(isActive));
        }
      })
      .catch(() => {});

    // Pre-load company profile for AI replies
    fetchCompanyProfile(userId).then((profile) => {
      companyProfileRef.current = profile;
    });
  }, []);

  const cleanAddress = (value = "") => {
    return String(value).replace(/^"|"$/g, "").trim();
  };

  const getLeadAddressForThread = (emailObj) => {
    if (!emailObj) return "";
    const conversation = emailObj.replies || emailObj.conversation || [];
    const incomingMsg = conversation.find((m) => m.direction === "incoming" || (m.senderAddress && m.senderAddress.includes("@")));
    if (incomingMsg?.senderAddress) return incomingMsg.senderAddress;
    if (emailObj.direction === "outgoing" && emailObj.recipientAddress) {
      return emailObj.recipientAddress;
    }
    return emailObj.latestSenderAddress || emailObj.senderAddress || emailObj.recipientAddress || "";
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

  const formatGmailDate = (d) => {
    const dateObj = new Date(d);
    if (isNaN(dateObj.getTime())) return "";
    try {
      const formattedStr = dateObj.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
      const timeAgo = formatTimeAgo(d);
      return timeAgo ? `${formattedStr} (${timeAgo})` : formattedStr;
    } catch (e) {
      return "";
    }
  };

  const getAvatarColor = (nameStr = "") => {
    const colors = ["#C0392B", "#8E44AD", "#2980B9", "#27AE60", "#D35400", "#16A085", "#7F8C8D", "#D97706"];
    let hash = 0;
    for (let i = 0; i < (nameStr || "").length; i++) {
      hash = nameStr.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
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

      const itemKey = item._id
        ? `id:${item._id}`
        : cleanMsgId
        ? `msg:${cleanMsgId}`
        : `text:${item.direction}:${textSnippet}`;

      if (!map.has(itemKey)) {
        map.set(itemKey, item);
      } else {
        const existing = map.get(itemKey);
        if (existing.direction === "incoming" && item.direction === "outgoing") {
          map.set(itemKey, item);
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

  // ── AI Generate Reply ────────────────────────────────────────────────────────
  const handleGenerateAiReply = async () => {
    if (!selectedEmail || aiGenerating) return;

    const userId = localStorage.getItem("userid");
    if (!userId) return;

    // Ensure company profile is loaded
    if (!companyProfileRef.current) {
      companyProfileRef.current = await fetchCompanyProfile(userId);
    }

    // Get the latest customer message to reply to
    const allMsgs = [
      ...(selectedEmail.replies || selectedEmail.conversation || []),
    ];
    const incomingMsgs = allMsgs.filter((m) => m.direction === "incoming" || !m.direction);
    const lastCustomerMsg = incomingMsgs[incomingMsgs.length - 1] || selectedEmail;

    const customerText =
      (lastCustomerMsg.textBody || lastCustomerMsg.htmlBody || "")
        .replace(/<[^>]*>/g, "")
        .replace(/\s+/g, " ")
        .trim() ||
      (selectedEmail.textBody || selectedEmail.htmlBody || "")
        .replace(/<[^>]*>/g, "")
        .replace(/\s+/g, " ")
        .trim() ||
      selectedEmail.subject ||
      "";

    const customerName = getNameFromAddress(
      getLeadAddressForThread(selectedEmail),
      selectedEmail
    );

    try {
      setAiGenerating(true);
      const aiReply = await generateAiReply(
        customerText,
        companyProfileRef.current,
        customerName
      );
      setReplyText(aiReply);
      // Focus the textarea so user can review/edit before sending
      setTimeout(() => replyTextRef.current?.focus(), 100);
    } catch (err) {
      console.error("AI reply generation failed:", err);
      alert("AI reply generation failed: " + (err.message || "Unknown error"));
    } finally {
      setAiGenerating(false);
    }
  };
  // ────────────────────────────────────────────────────────────────────────────

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

      const rawReplies = [
        ...(selectedEmail.replies || []).filter((r) => r._id !== sentChildEmail._id),
        sentChildEmail,
      ];

      const uniqueRepliesMap = new Map();
      rawReplies.forEach((r) => {
        const text = (r.textBody || r.htmlBody || r.body || "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim().toLowerCase().slice(0, 100);
        const dir = r.direction || "outgoing";
        const key = r._id && !String(r._id).startsWith("reply-") ? r._id.toString() : `${dir}:${text}`;

        if (!uniqueRepliesMap.has(key)) {
          uniqueRepliesMap.set(key, r);
        }
      });
      const updatedReplies = Array.from(uniqueRepliesMap.values());

      const newLeadStatus = "awaiting";

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

      // Record AI reply usage if AI was used to generate this reply
      if (aiActive) {
        const userId = localStorage.getItem("userid");
        const customerAddr = getLeadAddressForThread(selectedEmail);
        const customerName = getNameFromAddress(customerAddr, selectedEmail);
        recordAiReplyUsed(userId, {
          customerName,
          businessEmail: customerAddr,
          scenarioName: selectedEmail.scenarioName || selectedEmail.service || "AI Reply",
          service: selectedEmail.service || "General",
          inboundMessage: (selectedEmail.textBody || selectedEmail.htmlBody || "").slice(0, 500),
          generatedReply: message,
          scenarioType: selectedEmail.stepType?.includes("shopify") ? "shopify" : "custom",
        });
      }

      setReplyText("");
      setReplyingToMessage(null);
      setActiveReplyMsgId("none");
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
      // 1. Remove <html>, <head>, <body>, <!DOCTYPE> wrapper tags
      content = content
        .replace(/<!DOCTYPE[^>]*>/gi, "")
        .replace(/<html[^>]*>/gi, "")
        .replace(/<\/html>/gi, "")
        .replace(/<head[\s\S]*?<\/head>/gi, "")
        .replace(/<body[^>]*>/gi, "")
        .replace(/<\/body>/gi, "");

      // 2. Strip global style rules (body, html, :root, *) and scope remaining rules to .email-body-content
      content = content.replace(/<style[\s\S]*?<\/style>/gi, (styleBlock) => {
        return styleBlock
          .replace(/html\s*\{[^}]*\}/gi, "")
          .replace(/body\s*\{[^}]*\}/gi, "")
          .replace(/:root\s*\{[^}]*\}/gi, "")
          .replace(/\*\s*\{[^}]*\}/gi, "")
          .replace(/(?:^|\})\s*([a-zA-Z0-9_\-.,#\s>+~]+)\s*\{/gi, (match, selector) => {
            const scopedSelector = selector
              .split(",")
              .map((s) => `.email-body-content ${s.trim()}`)
              .join(", ");
            return `\n${scopedSelector} {`;
          });
      });

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

    const textColor = isDark ? "#F8FAFC" : "#0F172A";
    const labelColor = isDark ? "#FFFFFF" : "#020617";
    const quoteColor = isDark ? "#94A3B8" : "#475569";
    const quoteBorder = isDark ? "#475569" : "#CBD5E1";

    content = content.replace(
      /(Full Name:|Business Email:|Country:|Service:|Budget:|Store Name:|Store URL:|Problem & Goal:)/g,
      `<br/><strong style="color:${labelColor};font-weight:700">$1</strong>`
    );

    return `
      <style>
        .email-body-content-${isDark ? "dark" : "light"} {
          color: ${textColor} !important;
        }
        .email-body-content-${isDark ? "dark" : "light"} p,
        .email-body-content-${isDark ? "dark" : "light"} span,
        .email-body-content-${isDark ? "dark" : "light"} td,
        .email-body-content-${isDark ? "dark" : "light"} div {
          color: inherit;
        }
        .email-body-content-${isDark ? "dark" : "light"} blockquote {
          border-left: 3px solid ${quoteBorder} !important;
          color: ${quoteColor} !important;
          margin: 8px 0 !important;
          padding-left: 12px !important;
          opacity: 0.9;
        }
      </style>
      <div class="email-body-content email-body-content-${isDark ? "dark" : "light"}" style="font-family: system-ui, -apple-system, sans-serif; font-size: 13.5px; line-height: 1.6; color: ${textColor}; max-width: 100%; word-break: break-word; overflow-wrap: break-word; overflow-x: auto; isolation: isolate;">
        ${content}
      </div>
    `;
  };

  const buildEmailHtml = (content, isDark = false) => {
    return formatEmailBody(content, content, isDark);
  };

  // Sidebar navigation option state & URL filters
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const sidebarFilter = searchParams.get("filter") || "all";
  const targetScenarioId = searchParams.get("scenarioId");
  const targetScenarioName = searchParams.get("scenario");
  const targetConnectionId = searchParams.get("connectionId");
  const targetConnectionName = searchParams.get("connection");
  const targetConnectionEmail = searchParams.get("connEmail");

  const isThreadReplied = (e) => {
    if (!e) return false;
    const msgs = e.replies || e.conversation || e.discussion || [];

    if (!msgs || msgs.length === 0) {
      if (e.leadStatus === "replied" || e.leadStatus === "customer_replied") return true;
      if (e.leadStatus === "awaiting" || e.awaitingReply === true) return false;
      return (e.direction || "incoming") === "outgoing";
    }

    const latestMsg = msgs[msgs.length - 1];
    const isOutgoing =
      latestMsg.direction === "outgoing" ||
      latestMsg.stepType === "Auto Reply" ||
      latestMsg.stepType === "Manual Reply" ||
      latestMsg.role === "assistant" ||
      (latestMsg.senderAddress && latestMsg.senderAddress.includes("2014tabontech@gmail.com"));

    return isOutgoing;
  };

  const awaitingCount = emails.filter(
    (e) => e.leadStatus !== "secured" && e.leadStatus !== "closed" && !isThreadReplied(e)
  ).length;

  const autoRepliedCount = emails.filter((e) => isThreadReplied(e)).length;

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
    // 1. Specific Scenario Filter
    if (targetScenarioId || targetScenarioName) {
      const tId = String(targetScenarioId || "");
      const tName = (targetScenarioName || "").toLowerCase().trim();
      const eScenId = String(email.scenarioId || email.scenario_id || "");
      const eScenName = (email.scenarioName || email.scenario || email.service || "").toLowerCase().trim();

      let matchScen = false;
      if (tId && eScenId && eScenId === tId) matchScen = true;
      else if (tName && eScenName && (eScenName === tName || eScenName.includes(tName) || tName.includes(eScenName))) matchScen = true;
      else if (tName && tName.includes("shopify")) {
        matchScen =
          (email.service || "").toLowerCase().includes("shopify") ||
          (email.subject || "").toLowerCase().includes("shopify") ||
          email.stepType === "shopify-test-parent" ||
          !!email.extraFields?.storeName;
      } else if (tName && tName.includes("custom")) {
        matchScen =
          (email.service || "").toLowerCase().includes("custom") ||
          email.emailType === "custom" ||
          (email.subject || "").toLowerCase().includes("custom") ||
          (!((email.service || "").toLowerCase().includes("shopify") || (email.subject || "").toLowerCase().includes("shopify")));
      }

      if (!matchScen) return false;
    }

    // 2. Specific Connection Filter
    if (targetConnectionId || targetConnectionName || targetConnectionEmail) {
      const tId = String(targetConnectionId || "");
      const tConnName = (targetConnectionName || "").toLowerCase().trim();
      const tConnEmail = (targetConnectionEmail || "").toLowerCase().trim();
      const eConnId = String(email.connectionId || email.connection_id || "");
      const recip = (email.recipientAddress || "").toLowerCase();
      const sender = (email.senderAddress || "").toLowerCase();

      let matchConn = false;

      // 1. Match by Connection ID
      if (tId && eConnId && (eConnId === tId || tId === "conn_default")) {
        matchConn = true;
      }

      // 2. Match by Connection Email (e.g. 2014tabontech@gmail.com)
      if (!matchConn && tConnEmail && tConnEmail.includes("@")) {
        if (recip.includes(tConnEmail) || sender.includes(tConnEmail)) matchConn = true;
        const cleanUser = tConnEmail.split("@")[0];
        if (!matchConn && cleanUser && cleanUser.length >= 2 && (recip.includes(cleanUser) || sender.includes(cleanUser))) matchConn = true;
      }

      // 3. Match by Connection Name if it's an email address
      if (!matchConn && tConnName && tConnName.includes("@")) {
        if (recip.includes(tConnName) || sender.includes(tConnName)) matchConn = true;
        const cleanUser = tConnName.split("@")[0];
        if (!matchConn && cleanUser && cleanUser.length >= 2 && (recip.includes(cleanUser) || sender.includes(cleanUser))) matchConn = true;
      }

      // 4. Default Connection Match: All inbox emails belong to the user's active connections
      if (!matchConn) {
        matchConn = true;
      }

      if (!matchConn) return false;
    }

    // 3. Category/Status Filter
    if (!targetScenarioId && !targetScenarioName && !targetConnectionId && !targetConnectionName) {
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
      }
    }

    if (sidebarFilter === "awaiting") {
      if (email.leadStatus === "secured" || email.leadStatus === "closed") return false;
      if (isThreadReplied(email)) return false;
    } else if (sidebarFilter === "replied") {
      if (!isThreadReplied(email)) return false;
    } else if (sidebarFilter === "secured") {
      if (email.leadStatus !== "secured") return false;
    }

    // 4. Search Term Filter
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
    <AppLayout>
      <div className="flex h-full overflow-hidden font-sans text-slate-900 antialiased">

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
      <main className="flex min-w-0 flex-1 overflow-hidden bg-[#F7F7FA] relative flex-col">

        {/* =================== GMAIL-STYLE LIST VIEW =================== */}
        {!selectedEmail && (
          <div className="flex flex-col flex-1 min-h-0">
            {/* Search & Actions Header */}
            <div className="shrink-0 bg-white border-b border-slate-200 px-5 py-3 flex items-center gap-3">
              <div className="relative flex-1 max-w-lg">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search leads, emails..."
                  className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white"
                />
              </div>
              <button
                type="button"
                onClick={fetchEmails}
                title="Refresh"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 transition hover:bg-slate-100 shrink-0 cursor-pointer"
              >
                <FiRefreshCw size={14} className={loading ? "animate-spin" : ""} />
              </button>
              <span className="text-xs text-slate-400 font-medium shrink-0">{filteredEmails.length} leads</span>
            </div>

            {/* Table Header */}
            {!loading && filteredEmails.length > 0 && (
              <div className="shrink-0 bg-white border-b border-slate-200 px-5 py-2 flex items-center gap-4">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-slate-900 cursor-pointer"
                  checked={selectedLeadIds.size === filteredEmails.length && filteredEmails.length > 0}
                  onChange={() => {
                    if (selectedLeadIds.size === filteredEmails.length) {
                      setSelectedLeadIds(new Set());
                    } else {
                      setSelectedLeadIds(new Set(filteredEmails.map((e) => e._id)));
                    }
                  }}
                />
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex-1">Sender</span>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex-[3]">Subject</span>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider w-20 text-right">Date</span>
              </div>
            )}

            {/* Lead Rows */}
            <div className="flex-1 overflow-y-auto bg-white">
              {loading && (
                <div className="flex h-40 items-center justify-center">
                  <div className="flex flex-col items-center gap-2">
                    <FiRefreshCw className="animate-spin text-slate-400" size={20} />
                    <p className="text-xs text-slate-500">Loading leads...</p>
                  </div>
                </div>
              )}

              {!loading && filteredEmails.length === 0 && (
                <div className="flex h-60 flex-col items-center justify-center text-center px-6">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                    <FiInbox size={22} />
                  </div>
                  <p className="text-sm font-semibold text-slate-700">No leads found</p>
                  <p className="mt-1 text-xs text-slate-400">Try adjusting your search or filter.</p>
                </div>
              )}

              {!loading && filteredEmails.map((email, idx) => {
                const targetAddress = getLeadAddressForThread(email);
                const name = getNameFromAddress(targetAddress, email);
                const { company, snippet } = getCompanyAndSnippet(email);
                const timeAgo = formatTimeAgo(email.lastActivityAt || email.date) || `${idx + 1}m ago`;
                const msgCount = (email.replies || email.conversation || []).length || 1;
                const isChecked = selectedLeadIds.has(email._id);
                const readIds = new Set(JSON.parse(localStorage.getItem("readEmailIds") || "[]"));
                const isUnread = !readIds.has(email._id);

                // Status badge color
                let statusBadge = null;
                if (email.leadStatus === "secured") {
                  statusBadge = <span className="shrink-0 inline-flex rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">Secured</span>;
                } else if (email.leadStatus === "closed") {
                  statusBadge = <span className="shrink-0 inline-flex rounded-full bg-red-50 border border-red-200 px-2 py-0.5 text-[10px] font-bold text-red-700">Closed</span>;
                } else if (isThreadReplied(email)) {
                  statusBadge = <span className="shrink-0 inline-flex rounded-full bg-blue-50 border border-blue-200 px-2 py-0.5 text-[10px] font-bold text-blue-700">Replied</span>;
                } else {
                  statusBadge = <span className="shrink-0 inline-flex rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-700">Awaiting</span>;
                }

                return (
                  <div
                    key={email._id}
                    className={`group flex items-center gap-4 border-b border-slate-100 px-5 py-3 cursor-pointer transition select-none ${
                      isChecked
                        ? "bg-blue-50/60"
                        : isUnread
                        ? "bg-white hover:bg-slate-50 font-semibold"
                        : "bg-white hover:bg-slate-50"
                    }`}
                    onClick={() => handleEmailClick(email)}
                  >
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onClick={(e) => e.stopPropagation()}
                      onChange={() => toggleLeadSelection(email._id)}
                      className="h-4 w-4 rounded border-slate-300 text-slate-900 cursor-pointer shrink-0 opacity-0 group-hover:opacity-100 checked:opacity-100 transition"
                    />

                    {/* Unread dot */}
                    <span className={`h-2 w-2 rounded-full shrink-0 ${isUnread ? "bg-blue-500" : "bg-transparent"}`} />

                    {/* Sender name */}
                    <span className={`w-[160px] shrink-0 truncate text-sm ${isUnread ? "font-bold text-slate-900" : "font-medium text-slate-700"}`}>
                      {name}
                      {msgCount > 1 && (
                        <span className="ml-1.5 text-[10px] font-normal text-slate-400">({msgCount})</span>
                      )}
                    </span>

                    {/* Subject + snippet */}
                    <span className="flex-1 min-w-0 text-sm truncate">
                      <span className={`${isUnread ? "font-bold text-slate-900" : "font-medium text-slate-800"}`}>
                        {email.subject || company || "No Subject"}
                      </span>
                      <span className="text-slate-400 font-normal"> – {snippet}</span>
                    </span>

                    {/* Status badge */}
                    <span className="shrink-0">{statusBadge}</span>

                    {/* Date */}
                    <span className="w-16 shrink-0 text-right text-xs text-slate-400 font-medium">{timeAgo}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =================== GMAIL DETAIL VIEW (Image 1 & Image 2) =================== */}
        {selectedEmail && (
          <div className="flex flex-col flex-1 min-h-0 bg-white">
            {/* Top Toolbar Header (Gmail Style) */}
            <div className="shrink-0 border-b border-slate-200 bg-white px-6 py-3.5 flex items-center justify-between">
              {/* Left: Back button & Subject Title */}
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <button
                  type="button"
                  onClick={() => setSelectedEmail(null)}
                  className="p-2 rounded-full text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                  title="Back to leads"
                >
                  <FiArrowLeft size={18} />
                </button>
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <h2 className="text-lg font-normal text-[#202124] truncate tracking-tight">
                    {selectedEmail.subject || selectedEmail.latestSubject || "No Subject"}
                  </h2>
                  <span className="shrink-0 rounded bg-slate-200/80 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                    Inbox <span className="text-slate-500 font-normal">x</span>
                  </span>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="p-2 rounded-full text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                  title="Print thread"
                >
                  <FiPrinter size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const gmailUrl = `https://mail.google.com/mail/u/0/#inbox/${selectedEmail.providerThreadId || selectedEmail.providerMessageId || ""}`;
                    window.open(gmailUrl, "_blank");
                  }}
                  className="p-2 rounded-full text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                  title="Open in Gmail window"
                >
                  <FiExternalLink size={16} />
                </button>
                <select
                  value={leadStatuses[selectedEmail._id] || selectedEmail.leadStatus || "new_lead"}
                  onChange={(e) => handleStatusChange(selectedEmail._id, e.target.value)}
                  className="h-8 rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-xs font-medium text-slate-700 cursor-pointer outline-none hover:bg-slate-100 transition"
                >
                  {leadStatusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => handleDeleteLeads([selectedEmail._id])}
                  className="p-2 rounded-full text-slate-600 hover:bg-red-50 hover:text-red-600 transition cursor-pointer"
                  title="Delete lead"
                >
                  <FiTrash2 size={16} />
                </button>
              </div>
            </div>

            {/* Thread Scrollable Content (Image 1 Stacked Messages) */}
            <div className="flex-1 overflow-y-auto px-8 py-6 flex flex-col gap-6">
              {(() => {
                const conversation = selectedEmail.replies || selectedEmail.conversation || selectedEmail.discussion || [];
                const allMessages = conversation.length > 0 ? conversation : [selectedEmail];

                return allMessages.map((msg, mIdx) => {
                  const isOutgoing = msg.direction === "outgoing" || msg.stepType === "Auto Reply" || msg.stepType === "Manual Reply" || msg.role === "assistant";
                  const senderName = isOutgoing
                    ? "sami"
                    : getNameFromAddress(msg.senderAddress || msg.from || getLeadAddressForThread(selectedEmail), selectedEmail);
                  const senderEmailAddr = isOutgoing
                    ? "2014tabontech@gmail.com"
                    : msg.senderAddress || msg.from || getLeadAddressForThread(selectedEmail);
                  const recipientAddr = isOutgoing
                    ? getNameFromAddress(getLeadAddressForThread(selectedEmail), selectedEmail)
                    : "me";

                  const msgBody = msg.htmlBody || msg.textBody || msg.latestHtmlBody || msg.latestTextBody || msg.body || msg.content || "";
                  const fullDateStr = formatGmailDate(msg.date || msg.createdAt || msg.timestamp);
                  const avatarLetter = (senderName.charAt(0) || "U").toUpperCase();

                  // Distinct styling for Sender (Lead/Customer) vs Receiver (Support/You)
                  const avatarColor = isOutgoing ? "#059669" : "#4F46E5"; // Emerald Green for Support, Indigo Blue for Customer
                  const containerStyle = isOutgoing
                    ? "bg-emerald-50/40 border border-emerald-200/80 border-l-4 border-l-emerald-500 rounded-xl p-4 shadow-2xs"
                    : "bg-indigo-50/40 border border-indigo-200/80 border-l-4 border-l-indigo-500 rounded-xl p-4 shadow-2xs";

                  const badgeStyle = isOutgoing
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                    : "bg-indigo-100 text-indigo-800 border border-indigo-200";

                  const badgeLabel = isOutgoing
                    ? (msg.stepType === "Auto Reply" ? "AI Auto-Reply" : "Support (You)")
                    : "Customer Lead";

                  const msgIdKey = msg._id || mIdx;
                  const isReplyBoxOpenHere =
                    activeReplyMsgId === msgIdKey ||
                    (!activeReplyMsgId && mIdx === allMessages.length - 1);

                  return (
                    <div key={msgIdKey} className={`flex flex-col mb-4 ${containerStyle}`}>
                      {/* Message Header Row */}
                      <div className="flex items-start justify-between gap-4 mb-3">
                        {/* Left: Avatar + Sender Details + Role Badge */}
                        <div className="flex items-start gap-3.5 min-w-0 flex-1">
                          <div
                            className="h-10 w-10 rounded-full text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-xs"
                            style={{ backgroundColor: avatarColor }}
                          >
                            {avatarLetter}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-[#202124] text-sm truncate">
                                {senderName}
                              </span>
                              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase ${badgeStyle}`}>
                                {badgeLabel}
                              </span>
                              <span className="text-xs text-slate-500 font-normal truncate">
                                &lt;{senderEmailAddr}&gt;
                              </span>
                            </div>
                            <span className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                              to {recipientAddr} <FiChevronDown size={11} className="text-slate-400" />
                            </span>
                          </div>
                        </div>

                        {/* Right: Date & Message Action (Reply ↩) */}
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs text-slate-500 font-medium">
                            {fullDateStr}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveReplyMsgId(msgIdKey);
                              setReplyingToMessage(msg);
                              const targetName = isOutgoing
                                ? getNameFromAddress(getLeadAddressForThread(selectedEmail), selectedEmail)
                                : senderName;
                              const greeting = `Hi ${targetName.split(" ")[0]}, `;
                              if (!replyText || !replyText.startsWith(greeting)) {
                                setReplyText(greeting);
                              }
                              setTimeout(() => {
                                if (replyTextRef.current) {
                                  replyTextRef.current.focus();
                                }
                              }, 50);
                            }}
                            className="p-1.5 rounded-full text-slate-600 hover:bg-slate-200/60 transition cursor-pointer"
                            title="Reply to message"
                          >
                            <FiCornerUpLeft size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Message Body (Gmail Style Full Width) */}
                      <div className="pl-13 pr-4 text-[#202124] text-sm leading-relaxed font-normal">
                        {msgBody ? (
                          <div
                            dangerouslySetInnerHTML={{ __html: buildEmailHtml(msgBody, false) }}
                          />
                        ) : (
                          <p className="text-sm italic text-slate-400">No content</p>
                        )}

                        {/* Attachments */}
                        {(msg.attachments || []).length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {msg.attachments.map((att, aIdx) => (
                              <a
                                key={aIdx}
                                href={att.url || "#"}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
                              >
                                <FiFile size={13} className="text-slate-500" />
                                <span>{att.filename || att.name || `Attachment ${aIdx + 1}`}</span>
                              </a>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* =================== GMAIL INLINE REPLY COMPOSER BOX (Image 2) =================== */}
                      {isReplyBoxOpenHere && (
                        <div id="gmail-reply-composer" className="mt-5 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden animate-in fade-in duration-150">
                          {/* Header inside reply box */}
                          <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div className="flex items-center gap-3 text-xs font-semibold text-slate-700">
                              <div className="h-7 w-7 rounded-full bg-[#8E44AD] text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                                S
                              </div>
                              <div className="flex items-center gap-1.5">
                                <FiCornerUpLeft size={14} className="text-slate-500" />
                                <FiChevronDown size={12} className="text-slate-400" />
                                <span>
                                  {replyingToMessage
                                    ? getNameFromAddress(replyingToMessage.senderAddress || replyingToMessage.from, selectedEmail)
                                    : getNameFromAddress(getLeadAddressForThread(selectedEmail), selectedEmail)}
                                </span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const gmailUrl = `https://mail.google.com/mail/u/0/#inbox/${selectedEmail.providerThreadId || selectedEmail.providerMessageId || ""}`;
                                window.open(gmailUrl, "_blank");
                              }}
                              className="text-slate-400 hover:text-slate-700 transition cursor-pointer"
                              title="Pop out reply window"
                            >
                              <FiMaximize2 size={13} />
                            </button>
                          </div>

                          {/* Textarea Input */}
                          <div className="p-4 flex flex-col gap-3">
                            <textarea
                              ref={replyTextRef}
                              rows={4}
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="Hi Sami,"
                              className="w-full text-sm text-[#202124] placeholder:text-slate-400 outline-none resize-none bg-transparent font-sans"
                            />

                            {/* Ellipsis quoted text button */}
                            <div className="flex items-center">
                              <button
                                type="button"
                                className="px-2 py-0.5 rounded border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition cursor-pointer"
                                title="Show quoted text"
                              >
                                ...
                              </button>
                            </div>
                          </div>

                          {/* Bottom Toolbar Row (Gmail Style) */}
                          <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between bg-slate-50/40">
                            {/* Left Action Controls: Send button + Formatting icons */}
                            <div className="flex items-center gap-3">
                              {/* Blue Send Button */}
                              <div className="inline-flex rounded-full shadow-xs">
                                <button
                                  type="button"
                                  onClick={handleSendThreadReply}
                                  disabled={replySending || !replyText.trim()}
                                  className="h-9 bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs font-bold px-4 rounded-l-full flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer"
                                >
                                  {replySending ? (
                                    <FiRefreshCw className="animate-spin" size={13} />
                                  ) : (
                                    "Send"
                                  )}
                                </button>
                                <button
                                  type="button"
                                  onClick={handleSendThreadReply}
                                  disabled={replySending || !replyText.trim()}
                                  className="h-9 bg-[#1a73e8] hover:bg-[#1557b0] text-white px-2 rounded-r-full border-l border-white/20 flex items-center justify-center transition disabled:opacity-50 cursor-pointer"
                                >
                                  <FiChevronDown size={13} />
                                </button>
                              </div>

                              {/* Toolbar Icons */}
                              <div className="flex items-center gap-1 text-slate-500">
                                <button
                                  type="button"
                                  onClick={() => fileInputRef.current?.click()}
                                  className="p-2 rounded-full hover:bg-slate-200/60 hover:text-slate-800 transition cursor-pointer"
                                  title="Attach files"
                                >
                                  <FiPaperclip size={15} />
                                </button>
                                <input ref={fileInputRef} type="file" className="hidden" multiple onChange={handleFileChange} />
                                <button
                                  type="button"
                                  className="p-2 rounded-full hover:bg-slate-200/60 hover:text-slate-800 transition cursor-pointer"
                                  title="Insert link"
                                >
                                  <FiLink size={15} />
                                </button>

                                {/* ✨ AI Generate Reply Button — visible when AI Replies are active */}
                                {aiActive && (
                                  <button
                                    type="button"
                                    onClick={handleGenerateAiReply}
                                    disabled={aiGenerating}
                                    title="Generate AI reply using company knowledge"
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold transition cursor-pointer ml-1 ${
                                      aiGenerating
                                        ? "bg-violet-100 text-violet-400 border border-violet-200"
                                        : "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-sm hover:from-violet-700 hover:to-indigo-700 active:scale-[0.97]"
                                    }`}
                                  >
                                    {aiGenerating ? (
                                      <>
                                        <FiRefreshCw size={11} className="animate-spin" />
                                        <span>Generating...</span>
                                      </>
                                    ) : (
                                      <>
                                        <FiZap size={11} />
                                        <span>Generate with AI</span>
                                      </>
                                    )}
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Right Action: Discard / Delete draft */}
                            <button
                              type="button"
                              onClick={() => {
                                setReplyText("");
                                setSelectedFiles([]);
                                setReplyingToMessage(null);
                                setActiveReplyMsgId("none");
                              }}
                              className="p-2 rounded-full text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                              title="Discard draft"
                            >
                              <FiTrash2 size={16} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                });
              })()}

              <div ref={messagesEndRef} />
            </div>
          </div>
        )}

        {/* =================== FOOTER ACTION BAR (when checkboxes selected) =================== */}
        {selectedLeadIds.size > 0 && (
          <div className="absolute bottom-0 left-0 right-0 z-30 flex items-center justify-between gap-3 border-t border-slate-200 bg-white px-6 py-3 shadow-lg animate-in slide-in-from-bottom-2 duration-200">
            {/* Left: count + clear */}
            <div className="flex items-center gap-3 shrink-0">
              <span className="rounded-full bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white">
                {selectedLeadIds.size} selected
              </span>
              <button
                type="button"
                onClick={() => setSelectedLeadIds(new Set())}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition cursor-pointer"
              >
                Clear
              </button>
            </div>

            {/* Right: action buttons */}
            <div className="flex items-center gap-2 flex-wrap justify-end">
              <button
                type="button"
                onClick={() => {
                  [...selectedLeadIds].forEach((id) => handleStatusChange(id, "archived"));
                  setSelectedLeadIds(new Set());
                }}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <FiInbox size={13} />
                Archived
              </button>

              <button
                type="button"
                onClick={() => handleDeleteLeads([...selectedLeadIds])}
                className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 transition cursor-pointer"
              >
                <FiTrash2 size={13} />
                Delete
              </button>

              <button
                type="button"
                onClick={() => {
                  [...selectedLeadIds].forEach((id) => handleStatusChange(id, "closed"));
                  setSelectedLeadIds(new Set());
                }}
                className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition cursor-pointer"
              >
                <FiX size={13} />
                Closed
              </button>

              <button
                type="button"
                onClick={() => {
                  [...selectedLeadIds].forEach((id) => handleStatusChange(id, "secured"));
                  setSelectedLeadIds(new Set());
                }}
                className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition cursor-pointer"
              >
                <FiCheckCircle size={13} />
                Secured
              </button>

              <button
                type="button"
                onClick={() => {
                  [...selectedLeadIds].forEach((id) => handleStatusChange(id, "new_lead"));
                  setSelectedLeadIds(new Set());
                }}
                className="flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition cursor-pointer"
              >
                <FiStar size={13} />
                New Lead
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
    </AppLayout>
  );
};

export default Inbox;

import React, { useState, useEffect, useRef } from "react";
import AppLayout from "../component/AppLayout";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { fetchCompanyProfile, generateAiReply, recordAiReplyUsed } from "../utils/aiReplyService";
import {
  emailMatchesScenario,
  emailMatchesConnection,
} from "../utils/leadFilters";
import { splitQuotedBody } from "../utils/quotedBody";
import { getCached, setCached, getCacheKey, invalidateCache } from "../utils/appCache";
import { TableSkeleton } from "../component/Skeletons";
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

/*
 * Something to read while the mailbox is being assembled.
 *
 * These are real things the inbox does, not filler — someone who reads
 * one has learnt a feature they might not otherwise find. Rotated on a
 * timer that runs only while a fetch is pending, so it costs nothing the
 * rest of the time.
 */
/*
 * Tips rotated while the inbox is loading for the first time.
 */
const LOADING_TIPS = [
  "Turning a scenario back on asks whether to send the queued replies.",
  "Templates are matched by service first, then fall back to General.",
  "A lead that pasted an email instead of a name is greeted “Dear Sir/Madam”.",
  "Run history times follow the timezone in your organisation settings.",
];

/*
 * A real HTML tag, not merely a "<" somewhere.
 *
 * The old test was /<\/?[a-z][\s\S]*>/ — any "<", a letter, and a
 * ">" later in the string. A plain-text reply containing
 * "support <support@tabontech.com> wrote:" matched it, so the text
 * was rendered as markup: every newline collapsed to a space and the
 * "> " quote markers showed as literal characters.
 *
 * The tag name must now be followed by whitespace, "/" or ">", which
 * an email address in angle brackets never is.
 */
const looksLikeMarkup = (value) =>
  Boolean(value) &&
  /<\/?(?:div|p|br|span|a|table|tbody|thead|tfoot|tr|td|th|ul|ol|li|h[1-6]|blockquote|strong|b|em|i|u|s|img|pre|code|hr|font|center|section|article)(?:\s[^>]*)?\/?>/i.test(value);

const Inbox = () => {
  const currentUserId = localStorage.getItem("userid");
  const cachedThreads = getCached(getCacheKey("inbox_threads", currentUserId));

  const [emails, setEmails] = useState(cachedThreads || []);
  const [selectedEmail, setSelectedEmail] = useState(null);
  /*
   * Starts true. The list mounts with nothing and immediately fetches,
   * and `loading` was only ever set to FALSE — never to true — so the
   * first render showed "No leads found" for the whole of the request.
   * An empty inbox and an inbox that has not arrived yet are different
   * things and must not look the same.
   */
  const [loading, setLoading] = useState(!cachedThreads);
  const [loadingMore, setLoadingMore] = useState(false);

  /*
   * Has a fetch for the CURRENT view actually completed?
   *
   * The empty state is gated on this rather than on `loading` alone.
   * "Nothing here" is a claim about data we have; until a response has
   * landed we have not got any, and saying it anyway is how the inbox
   * came to report "No leads here yet" beside a sidebar count of 7.
   */
  const [hasLoaded, setHasLoaded] = useState(Boolean(cachedThreads));

  const [tipIndex, setTipIndex] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [totalInView, setTotalInView] = useState(0);

  /*
   * Which view the list is showing: "new" (needs a reply) or "all".
   *
   * Held in a ref as well as state because fetchEmails runs from a timer
   * and from effects, where a stale closure would silently keep asking
   * for the previous view.
   */
  /*
   * Seeded from the URL, not from a hardcoded default.
   *
   * Starting at "new" regardless meant landing on ?view=all fetched the
   * WRONG view on mount, and the effect that noticed the mismatch fired
   * its corrective fetch while the first was still in flight — where the
   * one-at-a-time guard dropped it. The list ended up empty with loading
   * already finished, which is the "No leads here yet" over a sidebar
   * count of 7.
   */
  const initialView =
    (new URLSearchParams(window.location.search).get("view") || "new")
      .toLowerCase() === "all"
      ? "all"
      : "new";

  const [inboxView, setInboxViewState] = useState(initialView);
  const inboxViewRef = useRef(initialView);

  const setInboxView = (next) => {
    inboxViewRef.current = next;
    setInboxViewState(next);
  };
  const [replySending, setReplySending] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [selectedLeadIds, setSelectedLeadIds] = useState(new Set());
  /*
   * Right-click menu for a lead row.
   *
   * null when closed. When open it carries the row it was opened on AND
   * the ids it will act on, resolved once at open time: right-clicking a
   * row that is part of a checkbox selection acts on the whole selection,
   * right-clicking outside one acts on just that row. Resolving it up
   * front means the menu cannot act on a different set than the one it
   * named when it opened.
   */
  const [contextMenu, setContextMenu] = useState(null);
  /*
   * Which message has its address details expanded. One at a time, the
   * way a mail client does it — the row is a summary, and the full
   * from/to/date belongs behind the chevron rather than always on.
   */
  const [expandedMsgDetails, setExpandedMsgDetails] = useState(null);

  /*
   * Which messages have their quoted history expanded.
   *
   * A reply carries the whole conversation beneath it, which the
   * recipient needs but this view does not: the quoted text is already
   * on screen as its own message above. Collapsed by default, behind the
   * same "..." every mail client uses.
   */
  const [expandedQuotes, setExpandedQuotes] = useState(() => new Set());

  const toggleQuote = (id) =>
    setExpandedQuotes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const [processingLeadId, setProcessingLeadId] = useState(null);
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
    /*
     * The confirm button's own label and tone.
     *
     * This dialog hardcoded "Delete" in red, because deleting was the
     * only thing that ever used it. The first other caller inherited a
     * red Delete button on a prompt about sending email — a dialog that
     * describes one action and offers a button naming another is worse
     * than no dialog. Every confirm now names its own action, and red is
     * opt-in for the ones that actually destroy something.
     */
    confirmLabel: "Confirm",
    danger: false,
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

  const showModal = ({
    type = "info",
    title,
    message,
    onConfirm = null,
    confirmLabel = "Confirm",
    danger = false,
  }) => {
    setModal({
      open: true,
      type,
      title,
      message,
      onConfirm,
      confirmLabel,
      danger,
    });
  };

  const closeModal = () => {
    setModal({
      open: false,
      type: "info",
      title: "",
      message: "",
      onConfirm: null,
      confirmLabel: "Confirm",
      danger: false,
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

  /*
   * The counterpart to markEmailAsRead. Same store, same event, so the
   * row dot and the sidebar badge move together — see the note in
   * controller/leadActions.js about why read state stays on the client.
   */
  const markEmailAsUnread = (emailId) => {
    if (!emailId) return;
    try {
      const readIds = new Set(
        JSON.parse(localStorage.getItem("readEmailIds") || "[]")
      );
      if (readIds.delete(emailId)) {
        localStorage.setItem("readEmailIds", JSON.stringify(Array.from(readIds)));
        window.dispatchEvent(new Event("readEmailUpdated"));
      }
    } catch (e) {
      console.error("Error updating read email status:", e);
    }
  };

  const isEmailRead = (emailId) => {
    try {
      const readIds = new Set(
        JSON.parse(localStorage.getItem("readEmailIds") || "[]")
      );
      return readIds.has(emailId);
    } catch {
      return false;
    }
  };

  /*
   * Message bodies are fetched when a thread is opened, not with the
   * list.
   *
   * htmlBody is ~70% of the mail collection's bytes and the list never
   * renders it, so the list endpoint no longer sends it. This pulls it
   * for the one thread being read and merges it in by id.
   *
   * The thread opens immediately either way — the pane falls back to
   * textBody, which the list does carry, so there is no blank frame
   * while this is in flight.
   */
  const loadThreadBodies = async (thread) => {
    if (!thread?._id) return;

    try {
      const token = localStorage.getItem("usertoken");
      const res = await axios.get(`${API_BASE_URL}/thread/${thread._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const bodies = res.data?.data?.bodies || {};
      if (!Object.keys(bodies).length) return;

      const withBodies = (message) => {
        const found = bodies[String(message?._id)];
        if (!found) return message;
        return {
          ...message,
          htmlBody: found.htmlBody || message.htmlBody || "",
          textBody: message.textBody || found.textBody || "",
        };
      };

      const merge = (item) => ({
        ...withBodies(item),
        replies: (item.replies || []).map(withBodies),
      });

      /* Only if the user is still looking at this thread. */
      setSelectedEmail((prev) =>
        prev && prev._id === thread._id ? merge(prev) : prev,
      );

      /* Cached on the list too, so reopening it is instant. */
      setEmails((prev) =>
        prev.map((item) => (item._id === thread._id ? merge(item) : item)),
      );
    } catch (err) {
      console.error("Could not load the conversation bodies:", err);
    }
  };

  const handleEmailClick = (email) => {
    setSelectedEmail(email);
    setReplyingToMessage(null);
    setActiveReplyMsgId(null);
    if (email && email._id) {
      markEmailAsRead(email._id);
      loadThreadBodies(email);
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

        /*
         * Spread the thread FIRST, then override.
         *
         * This used to be a field whitelist, which silently dropped every
         * field it did not name — matchedScenarioId, connectionId,
         * isArchived, queuedForScenarioId, cc, attachments. So the
         * scenario filter had nothing to match on and returned an empty
         * list while the sidebar, which spreads the whole thread,
         * confidently counted the same lead.
         *
         * Anything the server adds from now on arrives intact rather than
         * needing a line added here.
         */
        return {
          ...thread,
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
            ...msg,
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

  /*
   * The current list, readable from inside fetchEmails without making it
   * depend on a re-render.
   */
  const emailsRef = useRef([]);

  /* The scrolling list, watched so the next page loads before you hit the end. */
  const listScrollRef = useRef(null);
  const pageRef = useRef(1);

  /* A request that arrived while another was running, to run next. */
  const queuedFetchRef = useRef(null);

  /*
   * True while a sidebar filter or a search is narrowing the list. Read
   * inside fetchEmails, which runs from timers and effects where a stale
   * closure would use the previous value.
   */
  const narrowedRef = useRef(
    (() => {
      const p = new URLSearchParams(window.location.search);
      return Boolean(
        p.get("scenarioId") ||
          p.get("scenario") ||
          p.get("connectionId") ||
          p.get("connection") ||
          (p.get("filter") && p.get("filter") !== "all"),
      );
    })(),
  );

  /* True on the Archived view, which is the one place archived rows belong. */
  const archivedViewRef = useRef(
    new URLSearchParams(window.location.search).get("filter") === "archived",
  );

  useEffect(() => {
    selectedEmailRef.current = selectedEmail;
  }, [selectedEmail]);

  useEffect(() => {
    emailsRef.current = emails;
  }, [emails]);

  /*
   * Load the next page before the user reaches the bottom.
   *
   * Fired at 300px from the end rather than at the end itself, so the
   * rows are usually already there by the time they scroll into view and
   * the list never visibly stalls.
   */
  useEffect(() => {
    const node = listScrollRef.current;
    if (!node || !hasMore || loading) return undefined;

    const onScroll = () => {
      if (loadingMore || fetchInFlightRef.current) return;

      const remaining =
        node.scrollHeight - node.scrollTop - node.clientHeight;

      if (remaining < 300) {
        fetchEmails(false, { page: pageRef.current + 1 });
      }
    };

    node.addEventListener("scroll", onScroll, { passive: true });

    /* A short list may not scroll at all — check once on arrival. */
    onScroll();

    return () => node.removeEventListener("scroll", onScroll);
  }, [hasMore, loading, loadingMore, emails.length]);

  /* Rotate the tip while a fetch is pending, and only then. */
  useEffect(() => {
    if (!loading && hasLoaded) return undefined;

    const timer = setInterval(
      () => setTipIndex((i) => (i + 1) % LOADING_TIPS.length),
      3200,
    );

    return () => clearInterval(timer);
  }, [loading, hasLoaded]);

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

  /*
   * One request at a time. A background tick that arrives while a fetch
   * is still running is dropped rather than queued — the newer response
   * would carry the same data anyway, and stacking them is what made a
   * slow endpoint feel frozen.
   */
  const fetchInFlightRef = useRef(false);

  /*
   * One page at a time.
   *
   * The whole mailbox used to arrive in a single response, so nothing
   * could be drawn until all of it had. A page is enough to fill the
   * screen; the rest arrives as the user scrolls.
   */
  const PAGE_SIZE = 25;

  const fetchEmails = async (showLoading = true, { page = 1 } = {}) => {
    /*
     * One at a time — but a request the user caused is queued, not lost.
     *
     * The guard used to drop everything that arrived while a fetch was
     * running. Right for a background tick, whose data would be a
     * duplicate. Wrong for a view change, which is the only request that
     * will ever carry that view: it vanished, and the list was left
     * empty with loading already finished.
     */
    if (fetchInFlightRef.current) {
      if (showLoading || page > 1) {
        queuedFetchRef.current = { showLoading, page };
      }
      return;
    }

    const isFirstPage = page === 1;

    /*
     * Which view this request is for. If it changes while the request is
     * in flight, the response belongs to a view the user has left and
     * must not be rendered.
     */
    const requestedFor = inboxViewRef.current;

    try {
      const userId = localStorage.getItem("userid");
      const token = localStorage.getItem("usertoken");
      if (!userId) {
        setLoading(false);
        return;
      }

      fetchInFlightRef.current = true;
      if (showLoading && isFirstPage) setLoading(true);
      if (!isFirstPage) setLoadingMore(true);

      const res = await axios.get(`${API_BASE_URL}/getAllEmailsData/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        /*
         * Paging is skipped whenever a filter or a search is active.
         *
         * Those are applied on the client, so a page of 25 threads can
         * narrow to 2 rows — the list would look empty while "load more"
         * insisted there was more, and a scenario's count would not match
         * the rows it opened. Filtered views are small by definition, so
         * they are fetched whole.
         */
        params: {
          /*
           * A scenario, connection or status filter is a question about
           * the whole history, and its sidebar count is computed that
           * way. Asking the server for view=new as well returned only
           * the unanswered ones — a scenario showing 7 opened on "You
           * are all caught up".
           */
          view: narrowedRef.current ? "all" : inboxViewRef.current,
          /*
           * Archived threads are excluded server-side, so the Archived
           * view has to ask for them explicitly.
           */
          ...(archivedViewRef.current ? { includeArchived: 1 } : {}),
          ...(narrowedRef.current ? {} : { page, limit: PAGE_SIZE }),
        },
      });

      /* Superseded — the user moved on before this arrived. */
      if (inboxViewRef.current !== requestedFor) return;

      const payload = res.data?.data || {};
      const raw = payload.threads || [];

      setHasMore(!narrowedRef.current && Boolean(payload.hasMore));
      setTotalInView(Number(payload.totalThreads) || raw.length);

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

      /*
       * Carry forward bodies the list does not send.
       *
       * The list endpoint omits htmlBody — it is fetched per thread when
       * one is opened. So a background refresh brings back rows WITHOUT
       * it, and replacing state wholesale threw away what had already
       * been loaded: a thread that rendered correctly turned into a wall
       * of run-on text a few seconds later, when the poll landed.
       *
       * A row that arrives without a body keeps the one we already have.
       */
      const previousById = new Map(
        emailsRef.current.map((item) => [String(item._id), item]),
      );

      const keepLoadedBodies = (incoming) => {
        const previous = previousById.get(String(incoming._id));
        if (!previous) return incoming;

        const merged = {
          ...incoming,
          htmlBody: incoming.htmlBody || previous.htmlBody || "",
        };

        /* Same rule for each message inside the thread. */
        const previousReplies = new Map(
          (previous.replies || []).map((r) => [String(r._id), r]),
        );

        merged.replies = (incoming.replies || []).map((reply) => {
          const before = previousReplies.get(String(reply._id));
          if (!before) return reply;
          return { ...reply, htmlBody: reply.htmlBody || before.htmlBody || "" };
        });

        return merged;
      };

      data = data.map(keepLoadedBodies);

      /*
       * Page 1 replaces the list; later pages extend it, skipping any
       * thread already held — a lead arriving mid-scroll shifts the
       * pages, and a duplicated row is worse than a missing one.
       */
      if (!isFirstPage) {
        const seen = new Set(emailsRef.current.map((item) => String(item._id)));
        data = [
          ...emailsRef.current,
          ...data.filter((item) => !seen.has(String(item._id))),
        ];
      }

      setEmails(data);
      if (isFirstPage) {
        setCached(getCacheKey("inbox_threads", userId), data);
      }
      pageRef.current = page;

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
          /*
           * Belt and braces: the match above can be by thread rather than
           * by id, in which case keepLoadedBodies had nothing to merge.
           * Never downgrade an open thread to a body-less row.
           */
          setSelectedEmail(
            updated.htmlBody || !currentSelected.htmlBody
              ? updated
              : { ...updated, htmlBody: currentSelected.htmlBody, replies: currentSelected.replies || updated.replies },
          );
          markEmailAsRead(updated._id);
        }
      }
    } catch (err) {
      console.error("Error fetching inbox:", err);
      if (err.response && err.response.status === 404) {
        setEmails([]);
      }
    } finally {
      fetchInFlightRef.current = false;
      setLoadingMore(false);

      /*
       * A queued request runs now, and `loading` stays on until it
       * finishes — clearing it between the two would flash an empty list
       * with an empty-state message in the gap.
       */
      const queued = queuedFetchRef.current;
      queuedFetchRef.current = null;

      if (queued) {
        fetchEmails(queued.showLoading, { page: queued.page });
      } else {
        setLoading(false);
        setHasLoaded(true);
      }
    }
  };

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    fetchEmails(true);

    /*
     * Background refresh.
     *
     * Was every 6 seconds with no guard, so on a slow response the
     * requests piled up: each one still in flight when the next fired,
     * all of them re-fetching the same list, and the browser's per-host
     * connection limit then delaying the user's own actions.
     *
     * Now: one at a time, paused while the tab is hidden, and refreshed
     * immediately when the tab comes back so nothing looks stale. The
     * refresh button remains for an on-demand check.
     */
    const tick = () => {
      if (document.hidden) return;
      fetchEmails(false);
    };

    const interval = setInterval(tick, 20000);

    const onVisible = () => {
      if (!document.hidden) fetchEmails(false);
    };

    document.addEventListener("visibilitychange", onVisible);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  // Sync AI replies status from user settings + pre-load company profile
  useEffect(() => {
    const userId = localStorage.getItem("userid");
    if (!userId) return;

    const token = localStorage.getItem("usertoken");
    axios
      .get(`https://email-syncing-backend.vercel.app/auth/getUsers/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
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
      const token = localStorage.getItem("usertoken");
      await axios.patch(`${API_BASE_URL}/lead-status/${emailId}`, {
        leadStatus,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
      danger: true,
      confirmLabel: "Delete",
      title: "Delete Lead",
      message: `Are you sure you want to delete ${idsToDelete.length} selected lead(s)?`,
      onConfirm: async () => {
        try {
          const token = localStorage.getItem("usertoken");
          await axios.post(`${API_BASE_URL}/leads/delete-many`, {
            emailIds: idsToDelete,
          }, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
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

  /*
   * Archive / restore. Sends one request per lead rather than a bulk
   * endpoint because the server moves a whole thread per call, and the
   * inbox lists threads — one row is one call.
   */
  const handleArchiveLeads = async (ids, archived) => {
    if (!ids.length) return;

    /* Optimistic: the rows leave the current view immediately. */
    setEmails((prev) =>
      prev.map((email) =>
        ids.includes(email._id) ? { ...email, isArchived: archived } : email
      )
    );

    try {
      const token = localStorage.getItem("usertoken");

      await Promise.all(
        ids.map((emailId) =>
          axios.patch(
            `${API_BASE_URL}/lead-archive/${emailId}`,
            { archived },
            { headers: { Authorization: `Bearer ${token}` } }
          )
        )
      );

      setSelectedLeadIds(new Set());

      if (archived && selectedEmail && ids.includes(selectedEmail._id)) {
        setSelectedEmail(null);
      }
    } catch (err) {
      console.error("Error archiving leads:", err);

      /* Put them back — a failed archive must not look like it worked. */
      setEmails((prev) =>
        prev.map((email) =>
          ids.includes(email._id) ? { ...email, isArchived: !archived } : email
        )
      );

      showModal({
        type: "error",
        title: archived ? "Archive Failed" : "Restore Failed",
        message:
          err.response?.data?.message ||
          `Unable to ${archived ? "archive" : "restore"} the selected lead(s).`,
      });
    }
  };

  /*
   * Run the lead's own scenario against it on demand.
   *
   * Confirmed first, because it sends real mail to a real customer and
   * the lead may already have been answered once — the server reports
   * which case it was, and the result says so.
   */
  const handleProcessScenario = (email) => {
    if (!email?._id) return;

    showModal({
      type: "confirm",
      confirmLabel: "Run scenario",
      title: "Process Scenario",
      message:
        "Run this lead's scenario against it now? If the scenario sends a reply, it goes to the real sender.",
      onConfirm: async () => {
        closeModal();
        setProcessingLeadId(email._id);

        try {
          const token = localStorage.getItem("usertoken");
          const res = await axios.post(
            `${API_BASE_URL}/lead-process-scenario/${email._id}`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          );

          showModal({
            type: "info",
            title: "Scenario Processed",
            message: res.data?.message || "The scenario ran against this lead.",
          });

          fetchEmails();
        } catch (err) {
          console.error("Error processing scenario:", err);
          showModal({
            type: "error",
            title: "Could Not Process",
            message:
              err.response?.data?.message ||
              "The scenario could not be run against this lead.",
          });
        } finally {
          setProcessingLeadId(null);
        }
      },
    });
  };

  /*
   * Open the row menu.
   *
   * A right-click inside an existing checkbox selection acts on that
   * whole selection; anywhere else acts on the one row, and does NOT
   * change the selection — right-clicking to check one thing should not
   * silently throw away what the user had already ticked.
   */
  const openLeadContextMenu = (event, email) => {
    event.preventDefault();
    event.stopPropagation();

    const ids = selectedLeadIds.has(email._id)
      ? [...selectedLeadIds]
      : [email._id];

    /*
     * Clamped so a click near the right or bottom edge does not open a
     * menu that runs off screen with its last items unreachable.
     */
    const MENU_W = 216;
    const MENU_H = 340;

    setContextMenu({
      x: Math.min(event.clientX, window.innerWidth - MENU_W - 8),
      y: Math.min(event.clientY, window.innerHeight - MENU_H - 8),
      email,
      ids,
    });
  };

  const closeContextMenu = () => setContextMenu(null);

  /*
   * Dismissal. Anything that moves the menu away from what it points at
   * closes it: a click elsewhere, Escape, a scroll, a resize.
   */
  useEffect(() => {
    if (!contextMenu) return undefined;

    const close = () => setContextMenu(null);
    const onKey = (e) => {
      if (e.key === "Escape") close();
    };

    window.addEventListener("click", close);
    window.addEventListener("contextmenu", close);
    window.addEventListener("resize", close);
    window.addEventListener("keydown", onKey);
    /* Capture: the list scrolls in its own container, not on window. */
    window.addEventListener("scroll", close, true);

    return () => {
      window.removeEventListener("click", close);
      window.removeEventListener("contextmenu", close);
      window.removeEventListener("resize", close);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", close, true);
    };
  }, [contextMenu]);

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
    const token = localStorage.getItem("usertoken");

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
            Authorization: `Bearer ${token}`,
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

      /*
       * Pull the sent message's own body back in.
       *
       * The list omits htmlBody, so a reply appended locally has only
       * its text version until this runs — and the text version is the
       * one carrying "> " quote markers. Fetching the thread gives the
       * message the markup it was actually sent with.
       */
      if (selectedEmail?._id) {
        loadThreadBodies(selectedEmail);
      }
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
    /*
     * Is this markup, or is it text?
     *
     * It used to be "html is non-empty", and buildEmailHtml() passes the
     * same value as both arguments — so ANY content took the HTML branch.
     * That was harmless while bodies were real HTML. Now that incoming
     * mail is stored as text (see the backend's utils/emailBody.js), the
     * same assumption would render a plain-text message as unescaped
     * markup: no line breaks, no linkified URLs, one run-on paragraph.
     *
     * looksLikeMarkup (module scope) tests for actual tags, so text goes
     * down the text branch — escaped, linkified, line breaks preserved —
     * and legacy stored HTML still renders the way it always did.
     */
    let isHtml = looksLikeMarkup(html);
    let content = isHtml ? html : text || html;

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

      /*
       * Trailing punctuation is sentence, not URL.
       *
       * A plain `[^\s<]+` swallowed it, so "our offer (https://x.com/deal)"
       * produced a link to ".../deal)" — a 404. Sentence-ending characters
       * are peeled off and left outside the anchor; a closing bracket is
       * only peeled when the URL has no matching opener, so genuinely
       * parenthesised URLs still work.
       */
      content = content.replace(/(https?:\/\/[^\s<]+)/g, (match) => {
        let url = match;
        let tail = "";

        while (url.length > 1) {
          const last = url[url.length - 1];

          if (".,;:!?'\"".includes(last)) {
            tail = last + tail;
            url = url.slice(0, -1);
            continue;
          }

          const opener = last === ")" ? "(" : last === "]" ? "[" : null;

          if (
            opener &&
            url.split(last).length - 1 > url.split(opener).length - 1
          ) {
            tail = last + tail;
            url = url.slice(0, -1);
            continue;
          }

          break;
        }

        return `<a href="${url}" target="_blank" rel="noreferrer" style="color:${linkColor};text-decoration:underline;font-weight:500">${url}</a>${tail}`;
      });

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
        /*
          Bounds for the markup we now keep.

          Incoming HTML is reduced to basic semantic tags with every
          width, style and class removed, so the sender can no longer
          size anything — which means WE have to. Without these an
          800px logo or a wide data table pushes the reading pane out
          and the whole page scrolls sideways.
        */
        .email-body-content-${isDark ? "dark" : "light"} img {
          max-width: 100% !important;
          height: auto !important;
          border-radius: 6px;
        }
        .email-body-content-${isDark ? "dark" : "light"} table {
          width: auto !important;
          max-width: 100% !important;
          border-collapse: collapse;
          margin: 10px 0;
          font-size: 12.5px;
          display: block;
          overflow-x: auto;
        }
        .email-body-content-${isDark ? "dark" : "light"} th,
        .email-body-content-${isDark ? "dark" : "light"} td {
          border: 1px solid ${quoteBorder};
          padding: 6px 10px;
          text-align: left;
          vertical-align: top;
        }
        .email-body-content-${isDark ? "dark" : "light"} th {
          font-weight: 700;
          background: ${isDark ? "#1E293B" : "#F1F5F9"};
        }
        .email-body-content-${isDark ? "dark" : "light"} h1,
        .email-body-content-${isDark ? "dark" : "light"} h2,
        .email-body-content-${isDark ? "dark" : "light"} h3,
        .email-body-content-${isDark ? "dark" : "light"} h4,
        .email-body-content-${isDark ? "dark" : "light"} h5,
        .email-body-content-${isDark ? "dark" : "light"} h6 {
          font-weight: 700;
          line-height: 1.3;
          margin: 14px 0 6px;
        }
        .email-body-content-${isDark ? "dark" : "light"} h1 { font-size: 18px; }
        .email-body-content-${isDark ? "dark" : "light"} h2 { font-size: 16px; }
        .email-body-content-${isDark ? "dark" : "light"} h3 { font-size: 15px; }
        .email-body-content-${isDark ? "dark" : "light"} h4,
        .email-body-content-${isDark ? "dark" : "light"} h5,
        .email-body-content-${isDark ? "dark" : "light"} h6 { font-size: 14px; }
        .email-body-content-${isDark ? "dark" : "light"} p { margin: 0 0 10px; }
        .email-body-content-${isDark ? "dark" : "light"} ul,
        .email-body-content-${isDark ? "dark" : "light"} ol {
          margin: 8px 0 10px;
          padding-left: 22px;
        }
        .email-body-content-${isDark ? "dark" : "light"} li { margin: 3px 0; }
        .email-body-content-${isDark ? "dark" : "light"} a {
          color: ${isDark ? "#60A5FA" : "#2563EB"};
          text-decoration: underline;
          word-break: break-word;
        }
        .email-body-content-${isDark ? "dark" : "light"} pre {
          background: ${isDark ? "#0F172A" : "#F1F5F9"};
          padding: 10px 12px;
          border-radius: 8px;
          overflow-x: auto;
          font-size: 12.5px;
        }
        .email-body-content-${isDark ? "dark" : "light"} code {
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          font-size: 12.5px;
        }
        .email-body-content-${isDark ? "dark" : "light"} hr {
          border: none;
          border-top: 1px solid ${quoteBorder};
          margin: 14px 0;
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

  /*
   * Changing view closes the open conversation.
   *
   * The route is the same component for every sidebar entry, so
   * navigating from a thread back to Inbox — or across to a filter — left
   * the reading pane mounted and the list unreachable. It looked like the
   * sidebar had stopped responding.
   */
  useEffect(() => {
    /*
     * The view lives in the URL so the sidebar can link to it and a
     * refresh keeps you where you were. Absent means "new", which is the
     * landing view: the leads still waiting on you.
     */
    const nextView =
      (new URLSearchParams(location.search).get("view") || "new").toLowerCase() ===
      "all"
        ? "all"
        : "new";

    const params = new URLSearchParams(location.search);

    /* Any of these narrows the list on the client — see narrowedRef. */
    const nowNarrowed = Boolean(
      params.get("scenarioId") ||
        params.get("scenario") ||
        params.get("connectionId") ||
        params.get("connection") ||
        (params.get("filter") && params.get("filter") !== "all"),
    );

    const viewChanged = nextView !== inboxViewRef.current;
    const narrowingChanged = nowNarrowed !== narrowedRef.current;
    const archivedChanged =
      (params.get("filter") === "archived") !== archivedViewRef.current;

    narrowedRef.current = nowNarrowed;
    archivedViewRef.current = params.get("filter") === "archived";

    if (viewChanged || narrowingChanged || archivedChanged) {
      setInboxView(nextView);
      setEmails([]);
      setHasMore(false);
      setLoading(true);
      setHasLoaded(false);
      pageRef.current = 1;
      fetchEmails(true, { page: 1 });
    }

    setSelectedEmail(null);
    setReplyingToMessage(null);
    setActiveReplyMsgId(null);
    setSelectedLeadIds(new Set());
    /*
     * Keyed on the navigation, not just the query string: clicking Inbox
     * while already on an unfiltered /inbox produces the same URL, and
     * watching `search` alone would leave an open thread on screen.
     */
  }, [location.key, location.search]);
  const targetScenarioId = searchParams.get("scenarioId");
  const targetScenarioName = searchParams.get("scenario");
  const targetConnectionId = searchParams.get("connectionId");
  const targetConnectionName = searchParams.get("connection");
  const targetConnectionEmail = searchParams.get("connEmail");

  const isThreadReplied = (e) => {
    if (!e) return false;

    /*
     * The server decides this, from the newest message in the thread.
     * Everything below is the old local guess, kept only for a thread
     * that arrived without the field.
     */
    if (e.newestDirection) return e.newestDirection === "outgoing";

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
      latestMsg.role === "assistant";

    /*
     * A hardcoded "or the sender is 2014tabontech@gmail.com" used to sit
     * here — one developer's mailbox deciding, for every account on the
     * platform, whether a lead counted as replied to. direction and
     * stepType already carry that, and they carry it for everyone.
     */
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
    /*
     * Scenario and connection matching come from utils/leadFilters.js,
     * the same definition the sidebar counts use — so a row that says 2
     * gives you those 2 when you click it.
     *
     * Both filters used to end in a blanket "otherwise match anyway",
     * which meant neither of them ever excluded a single lead: picking a
     * scenario or a connection returned the whole inbox.
     */
    if (targetScenarioId || targetScenarioName) {
      const matches = emailMatchesScenario(email, {
        _id: targetScenarioId,
        name: targetScenarioName,
      });

      if (!matches) return false;
    }

    if (targetConnectionId || targetConnectionName || targetConnectionEmail) {
      const matches = emailMatchesConnection(email, {
        _id: targetConnectionId,
        email: targetConnectionEmail,
      });

      if (!matches) return false;
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

    /*
     * Archived leads are filed away, not deleted: out of every view
     * except the one that exists to show them.
     */
    if (sidebarFilter === "archived") {
      if (!email.isArchived) return false;
    } else if (email.isArchived) {
      return false;
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-[440px] rounded-[24px] bg-white p-7 shadow-2xl border border-slate-100/80">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-[16px] ${
                modal.type === "error"
                  ? "bg-red-50 text-red-600 border border-red-100"
                  : modal.type === "confirm"
                  ? modal.danger
                    ? "bg-red-50 text-red-600 border border-red-100"
                    : "bg-[#FFF8EE] text-[#D97706] border border-[#FDE68A]/40"
                  : "bg-indigo-50 text-indigo-600 border border-indigo-100"
              }`}
            >
              {modal.type === "confirm" ? (
                modal.danger ? (
                  <FiTrash2 size={22} className="text-[#DC2626]" />
                ) : (
                  <FiAlertCircle size={22} className="text-[#D97706]" />
                )
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
                  className={`rounded-[12px] px-6 py-2.5 text-xs font-bold text-white transition cursor-pointer shadow-xs active:scale-[0.98] ${
                    modal.danger
                      ? "bg-[#DC2626] hover:bg-[#B91C1C]"
                      : "bg-[#111110] hover:bg-black"
                  }`}
                >
                  {modal.confirmLabel}
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
              {/*
                Says how many are loaded out of how many exist, so a
                partially loaded list never looks like the whole thing.
              */}
              <span className="text-xs text-slate-400 font-medium shrink-0">
                {loading || !hasLoaded
                  ? "Loading…"
                  : hasMore && !searchTerm.trim()
                    ? `${filteredEmails.length} of ${totalInView} leads`
                    : `${filteredEmails.length} lead${filteredEmails.length === 1 ? "" : "s"}`}
              </span>
            </div>

            {/* Table Header */}
            {!loading && hasLoaded && filteredEmails.length > 0 && (
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
            <div ref={listScrollRef} className="flex-1 overflow-y-auto bg-white">
              {loading && emails.length === 0 && (
                <div className="p-4">
                  <TableSkeleton rows={7} cols={3} />
                </div>
              )}

              {(!loading || emails.length > 0) && hasLoaded && filteredEmails.length === 0 && (
                <div className="flex h-60 flex-col items-center justify-center text-center px-6">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                    <FiInbox size={22} />
                  </div>

                  {searchTerm.trim() ? (
                    <>
                      <p className="text-sm font-semibold text-slate-700">
                        Nothing matches “{searchTerm.trim()}”
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        Try a different search, or clear it to see the list again.
                      </p>
                    </>
                  ) : narrowedRef.current ? (
                    <>
                      <p className="text-sm font-semibold text-slate-700">
                        Nothing here yet
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        No leads match this filter. Pick another, or open
                        All to see everything.
                      </p>
                    </>
                  ) : inboxView === "new" ? (
                    <>
                      <p className="text-sm font-semibold text-slate-700">
                        You are all caught up
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        Every lead has been answered. Open All to see the
                        full history.
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-semibold text-slate-700">
                        No leads here yet
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        Leads appear once a scenario matches an incoming
                        email.
                      </p>
                    </>
                  )}
                </div>
              )}

              {!loading && hasLoaded && filteredEmails.map((email, idx) => {
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
                    onContextMenu={(e) => openLeadContextMenu(e, email)}
                  >
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onClick={(e) => e.stopPropagation()}
                      onChange={() => toggleLeadSelection(email._id)}
                      className="h-4 w-4 rounded border-slate-300 text-slate-900 cursor-pointer shrink-0 opacity-40 group-hover:opacity-100 checked:opacity-100 transition"
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

              {/*
                End of the loaded rows. Says what is happening rather
                than leaving the list to just stop — a paged list that
                ends silently reads as a list that has finished.
              */}
              {!loading && loadingMore && (
                <div className="flex items-center justify-center gap-2 border-b border-slate-100 px-5 py-4 text-xs text-slate-500">
                  <FiRefreshCw className="animate-spin text-slate-400" size={13} />
                  Loading more leads…
                </div>
              )}

              {!loading && !loadingMore && hasMore && (
                <button
                  type="button"
                  onClick={() =>
                    fetchEmails(false, { page: pageRef.current + 1 })
                  }
                  className="w-full border-b border-slate-100 px-5 py-4 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Load more ({totalInView - filteredEmails.length} remaining)
                </button>
              )}

              {!loading &&
                !hasMore &&
                filteredEmails.length > PAGE_SIZE && (
                  <p className="px-5 py-4 text-center text-[11px] text-slate-400">
                    That is all {filteredEmails.length} of them.
                  </p>
                )}
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

                  /*
                   * Who actually sent and received THIS message.
                   *
                   * Every outgoing message used to render a hardcoded
                   * "sami <2014tabontech@gmail.com>" — one developer's
                   * mailbox, shown to every account on the platform,
                   * regardless of which connection the reply was really
                   * sent from. The documents carry the truth already:
                   * outgoing rows store the sending connection in
                   * senderAddress and the customer in recipientAddress.
                   *
                   * The name is read from the message too, not from the
                   * thread root — passing the root made every message in
                   * a thread display the root sender's name.
                   */
                  const senderEmailAddr = cleanAddress(
                    msg.senderAddress ||
                      msg.from ||
                      (isOutgoing
                        ? selectedEmail.recipientAddress
                        : getLeadAddressForThread(selectedEmail)) ||
                      ""
                  );

                  const recipientEmailAddr = cleanAddress(
                    msg.recipientAddress ||
                      msg.to ||
                      (isOutgoing
                        ? getLeadAddressForThread(selectedEmail)
                        : selectedEmail.recipientAddress) ||
                      ""
                  );

                  const senderName = getNameFromAddress(
                    senderEmailAddr,
                    /*
                     * The stored first/last name belongs to whoever sent
                     * the thread, so it only describes an incoming
                     * message from that same address.
                     */
                    !isOutgoing &&
                      cleanAddress(selectedEmail.senderAddress || "") ===
                        senderEmailAddr
                      ? selectedEmail
                      : null
                  );

                  const recipientName = recipientEmailAddr
                    ? getNameFromAddress(recipientEmailAddr, null)
                    : "me";

                  const isDetailsOpen = expandedMsgDetails === (msg._id || mIdx);

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
                    ? (msg.stepType === "Auto Reply" ? "AI Reply" : "Support (You)")
                    : "Customer Lead";

                  /*
                   * Where a reply from this thread goes, and what to call
                   * the person receiving it.
                   *
                   * Both come from the server, which resolves them the
                   * same way the send does — so the composer cannot
                   * promise one recipient and deliver to another.
                   */
                  const replyToAddress =
                    selectedEmail.leadReplyAddress ||
                    getLeadAddressForThread(selectedEmail) ||
                    "";

                  const replyToLabel =
                    selectedEmail.leadName ||
                    getNameFromAddress(replyToAddress, null);

                  const replyFirstName =
                    selectedEmail.leadFirstName ||
                    String(replyToLabel || "there").split(" ")[0];

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
                            <button
                              type="button"
                              aria-expanded={isDetailsOpen}
                              title={
                                isDetailsOpen
                                  ? "Hide details"
                                  : "Show from, to and date"
                              }
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedMsgDetails(
                                  isDetailsOpen ? null : msg._id || mIdx
                                );
                              }}
                              className="mt-0.5 flex w-fit items-center gap-1 rounded px-1 -ml-1 text-xs font-medium text-slate-500 transition hover:bg-slate-200/60 hover:text-slate-700 cursor-pointer"
                            >
                              to {recipientName}
                              <FiChevronDown
                                size={11}
                                className={`text-slate-400 transition-transform ${
                                  isDetailsOpen ? "rotate-180" : ""
                                }`}
                              />
                            </button>

                            {isDetailsOpen && (
                              <dl className="mt-2 grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1 rounded-lg border border-slate-200 bg-white/80 px-3 py-2 text-[11px]">
                                <dt className="font-semibold text-slate-400">
                                  from
                                </dt>
                                <dd className="break-all text-slate-700">
                                  {senderName && senderName !== senderEmailAddr
                                    ? `${senderName} <${senderEmailAddr || "unknown"}>`
                                    : senderEmailAddr || "unknown"}
                                </dd>

                                <dt className="font-semibold text-slate-400">
                                  to
                                </dt>
                                <dd className="break-all text-slate-700">
                                  {recipientEmailAddr || "unknown"}
                                </dd>

                                {(msg.cc || []).length > 0 && (
                                  <>
                                    <dt className="font-semibold text-slate-400">
                                      cc
                                    </dt>
                                    <dd className="break-all text-slate-700">
                                      {msg.cc.join(", ")}
                                    </dd>
                                  </>
                                )}

                                <dt className="font-semibold text-slate-400">
                                  date
                                </dt>
                                <dd className="text-slate-700">{fullDateStr}</dd>

                                <dt className="font-semibold text-slate-400">
                                  subject
                                </dt>
                                <dd className="break-words text-slate-700">
                                  {msg.subject || selectedEmail.subject || "—"}
                                </dd>
                              </dl>
                            )}
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
                              /*
                                Greet whoever the reply is going to, from
                                the same resolved identity the header and
                                placeholder use.
                              */
                              const greeting = `Hi ${replyFirstName}, `;
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
                          (() => {
                            const { main, quoted } = splitQuotedBody(
                              msgBody,
                              looksLikeMarkup(msgBody),
                            );

                            const quoteOpen = expandedQuotes.has(msgIdKey);

                            return (
                              <>
                                <div
                                  dangerouslySetInnerHTML={{
                                    __html: buildEmailHtml(main, false),
                                  }}
                                />

                                {quoted && (
                                  <div className="mt-1">
                                    <button
                                      type="button"
                                      onClick={() => toggleQuote(msgIdKey)}
                                      aria-expanded={quoteOpen}
                                      title={
                                        quoteOpen
                                          ? "Hide the quoted conversation"
                                          : "Show the quoted conversation"
                                      }
                                      className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-xs font-bold leading-none transition ${
                                        quoteOpen
                                          ? "border-slate-400 bg-slate-200 text-slate-700"
                                          : "border-slate-300 bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700"
                                      }`}
                                    >
                                      •••
                                    </button>

                                    {quoteOpen && (
                                      <div
                                        className="mt-2 border-l-2 border-slate-200 pl-3 text-slate-500"
                                        dangerouslySetInnerHTML={{
                                          __html: buildEmailHtml(quoted, false),
                                        }}
                                      />
                                    )}
                                  </div>
                                )}
                              </>
                            );
                          })()
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
                              {/*
                                Where this reply is going.

                                It used to name whoever sent the message
                                being replied to — which, on a relayed
                                Partner Directory lead, is
                                partners@shopify.com. The reply does not
                                go there, so the header was describing
                                something that would not happen. The
                                address is shown in full, because "who
                                will receive this" is not a detail to
                                leave to inference.
                              */}
                              <div className="flex flex-wrap items-center gap-1.5">
                                <FiCornerUpLeft size={14} className="text-slate-500" />
                                <span className="text-slate-500 font-medium">To</span>
                                <span className="font-semibold text-slate-800">
                                  {replyToLabel}
                                </span>
                                {/*
                                  The address itself is the whole point —
                                  it is what the send will use. A badge
                                  explaining that it differs from the
                                  sender only added noise; anyone who
                                  wants that detail can hover.
                                */}
                                <span
                                  className="font-normal text-slate-500"
                                  title={
                                    selectedEmail.leadIsRelayed
                                      ? `Relayed by ${selectedEmail.senderAddress} — replies go to the customer directly.`
                                      : undefined
                                  }
                                >
                                  &lt;{replyToAddress}&gt;
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
                              placeholder={`Hi ${replyFirstName},`}
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
        {/*
          Lead context menu.

          Ordered by what it does, not by how often it is used: open the
          conversation, change how it is marked, file it away, run the
          automation, then delete. Destructive last and visually separated,
          so the item next to "Archive" is never the one that deletes.
        */}
        {contextMenu && (
          <div
            role="menu"
            style={{ top: contextMenu.y, left: contextMenu.x }}
            onClick={(e) => e.stopPropagation()}
            onContextMenu={(e) => e.preventDefault()}
            className="fixed z-50 w-[216px] overflow-hidden rounded-[12px] border border-slate-200 bg-white py-1 shadow-2xl animate-in fade-in zoom-in-95 duration-100"
          >
            {contextMenu.ids.length > 1 && (
              <div className="border-b border-slate-100 px-3 py-2 text-[11px] font-bold text-slate-500">
                {contextMenu.ids.length} leads selected
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                closeContextMenu();
                handleEmailClick(contextMenu.email);
              }}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-xs font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <FiCornerUpLeft size={13} className="text-slate-400" />
              Reply
            </button>

            <div className="my-1 h-px bg-slate-100" />

            {/*
              Labelled by what the click DOES, not by the current state —
              a menu item reading "Read" next to an unread row is
              ambiguous about which way it will go.
            */}
            {isEmailRead(contextMenu.email._id) ? (
              <button
                type="button"
                onClick={() => {
                  contextMenu.ids.forEach(markEmailAsUnread);
                  closeContextMenu();
                }}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-xs font-medium text-slate-700 transition hover:bg-slate-50"
              >
                <FiMail size={13} className="text-slate-400" />
                Mark as unread
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  contextMenu.ids.forEach(markEmailAsRead);
                  closeContextMenu();
                }}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-xs font-medium text-slate-700 transition hover:bg-slate-50"
              >
                <FiCheck size={13} className="text-slate-400" />
                Mark as read
              </button>
            )}

            <div className="my-1 h-px bg-slate-100" />

            <button
              type="button"
              onClick={() => {
                contextMenu.ids.forEach((id) => handleStatusChange(id, "secured"));
                setSelectedLeadIds(new Set());
                closeContextMenu();
              }}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-xs font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <FiCheckCircle size={13} className="text-emerald-500" />
              Mark as secured
            </button>

            <button
              type="button"
              onClick={() => {
                contextMenu.ids.forEach((id) => handleStatusChange(id, "closed"));
                setSelectedLeadIds(new Set());
                closeContextMenu();
              }}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-xs font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <FiX size={13} className="text-slate-400" />
              Close lead
            </button>

            <button
              type="button"
              onClick={() => {
                const restoring = Boolean(contextMenu.email.isArchived);
                handleArchiveLeads(contextMenu.ids, !restoring);
                closeContextMenu();
              }}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-xs font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <FiInbox size={13} className="text-slate-400" />
              {contextMenu.email.isArchived ? "Move to inbox" : "Archive"}
            </button>

            <div className="my-1 h-px bg-slate-100" />

            {/*
              Single lead only. Processing sends real mail, and a menu
              item that fires an unknown number of live replies from one
              click is not something to offer casually.
            */}
            <button
              type="button"
              disabled={
                contextMenu.ids.length > 1 ||
                processingLeadId === contextMenu.email._id
              }
              title={
                contextMenu.ids.length > 1
                  ? "Process one lead at a time"
                  : "Run this lead's scenario against it now"
              }
              onClick={() => {
                const target = contextMenu.email;
                closeContextMenu();
                handleProcessScenario(target);
              }}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
            >
              <FiZap
                size={13}
                className={
                  contextMenu.ids.length > 1 ? "text-slate-300" : "text-amber-500"
                }
              />
              Process scenario
            </button>

            <div className="my-1 h-px bg-slate-100" />

            <button
              type="button"
              onClick={() => {
                const ids = contextMenu.ids;
                closeContextMenu();
                handleDeleteLeads(ids);
              }}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-xs font-semibold text-red-600 transition hover:bg-red-50"
            >
              <FiTrash2 size={13} />
              Delete
            </button>
          </div>
        )}

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
                onClick={() => handleArchiveLeads([...selectedLeadIds], true)}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <FiInbox size={13} />
                Archive
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

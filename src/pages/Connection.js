import { apiFetch } from "../utils/apiClient";
import { connectionBadge, isConnectionUsable } from "../utils/connectionHealth";
import React, { useState, useEffect, useContext } from "react";
import AppLayout from "../component/AppLayout";
import ConnectionModal from "../component/ConnectionModal";
import OutlookConnectionModal from "../component/OutlookConnectionModal";
import MicrosoftConnectionModal from "../component/MicrosoftConnectionModal";
import CreateConnectionModal from "../component/CreateConnectionModal";
import {
  FaGoogle,
  FaMicrosoft,
  FaEnvelope,
  FaTrashAlt,
  FaSpinner,
  FaPlug,
  FaEdit,
} from "react-icons/fa";
import axios from "axios";
import toast from "react-hot-toast";
import ConfirmDeleteModal from "../component/ConformationModel";
import MailhookConnectionModal from "../component/MailhookConnectionModal";
import ConfirmMailhookDeleteModal from "../component/ConfirmMailhookDeleteModal";
import { UserContext } from "../component/UserContext";
import {
  consumeMicrosoftOAuthResult,
  startMicrosoftOAuth,
} from "../utils/microsoftOAuth";
import { isOAuthConnection } from "../utils/connectionProviders";
import { getCached, setCached, getCacheKey, invalidateCache } from "../utils/appCache";
import { TableSkeleton } from "../component/Skeletons";

const ConnectionsPage = () => {
  const { user } = useContext(UserContext);
  const userId = localStorage.getItem("userid") || user?._id;

  const cachedConns = getCached(getCacheKey("connections_list", userId));
  const cachedHooks = getCached(getCacheKey("mailhooks_list", userId));

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOutlookModalOpen, setIsOutlookModalOpen] = useState(false);
  const [isMicrosoftModalOpen, setIsMicrosoftModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [connections, setConnections] = useState(cachedConns || []);
  const [loading, setLoading] = useState(!cachedConns && !cachedHooks);
  const [mailhooks, setMailhooks] = useState(cachedHooks || []);
  const [isMailhookModalOpen, setIsMailhookModalOpen] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [connectionToDelete, setConnectionToDelete] = useState(null);
  const [connectionToEdit, setConnectionToEdit] = useState(null);
  const [editProvider, setEditProvider] = useState(null);
  const [mailhookToDelete, setMailhookToDelete] = useState(null);
  const [isMailhookDeleteModalOpen, setIsMailhookDeleteModalOpen] =
    useState(false);
  const [selectedMailhookId, setSelectedMailhookId] = useState(null);
  const [startAtStep3, setStartAtStep3] = useState(false);

  /*
   * Was a sidebar link that set ?status=verified and was never read — the
   * page showed everything regardless. Seeded from the query string so any
   * existing link still lands on the right filter.
   */
  const [statusFilter, setStatusFilter] = useState(
    new URLSearchParams(window.location.search).get("status") === "verified"
      ? "verified"
      : "all",
  );

  const isVerifiedHook = (hook) => hook.connectionVerified === true;
  /*
   * A connection that has lost its grant does not belong under
   * "Verified" — that tab is where someone looks to confirm their
   * mailboxes are good, which is exactly when a stale badge misleads.
   */
  const isVerifiedConn = (conn) =>
    conn.verified === true && isConnectionUsable(conn);

  const visibleMailhooks =
    statusFilter === "verified" ? mailhooks.filter(isVerifiedHook) : mailhooks;

  const visibleConnections =
    statusFilter === "verified"
      ? connections.filter(isVerifiedConn)
      : connections;

  const verifiedCount =
    mailhooks.filter(isVerifiedHook).length +
    connections.filter(isVerifiedConn).length;

  const totalCount = mailhooks.length + connections.length;

  const STATUS_FILTERS = [
    { id: "all", label: "All connections", count: totalCount },
    { id: "verified", label: "Verified", count: verifiedCount },
  ];

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const openOutlookModal = () => setIsOutlookModalOpen(true);
  const closeOutlookModal = () => setIsOutlookModalOpen(false);
  const closeMicrosoftModal = () => setIsMicrosoftModalOpen(false);
  const openCreateModal = () => setIsCreateModalOpen(true);
  const closeCreateModal = () => setIsCreateModalOpen(false);

  /*
   * Microsoft never uses the app-password modal: Exchange Online rejects
   * basic auth outright, so this hands off to the MSAL OAuth flow on the
   * backend. Shared with the scenario builders and the sidebar — see
   * utils/microsoftOAuth.js.
   */
  const startOutlookOAuth = () =>
    startMicrosoftOAuth({
      userId: user?._id,
      redirectPath: "/connection",
    });

  const handleProviderSelect = (providerId) => {
    closeCreateModal();

    if (providerId === "gmail") {
      openModal();
      return;
    }

    if (providerId === "microsoft") {
      startOutlookOAuth();
      return;
    }

    /*
     * Mailhook reuses the same setup modal the sidebar and setup wizard
     * open. Always start at step 1 with no card selected: picking it from
     * here means creating a new connection, never editing an existing one.
     */
    if (providerId === "mailhook") {
      setStartAtStep3(false);
      setSelectedMailhookId(null);
      setIsMailhookModalOpen(true);
      return;
    }

    /* "other" -> the existing generic custom-SMTP modal, unchanged. */
    openOutlookModal();
  };

  /*
   * The Microsoft OAuth callback returns here with the outcome in the
   * query string. Reporting and cleanup are shared so every page that can
   * start the flow handles the return the same way.
   */
  useEffect(() => {
    consumeMicrosoftOAuthResult({ onSuccess: () => fetchConnections() });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchMailhooks = async () => {
    try {
      const userId = localStorage.getItem("userid");
      const token = localStorage.getItem("usertoken");
      if (!userId) return;

      const res = await axios.get(
        `https://email-syncing-backend.vercel.app/mailhookcard/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setMailhooks(res.data.data);
        setCached(getCacheKey("mailhooks_list", userId), res.data.data);
      }
    } catch (err) {
      console.error("Error fetching mailhooks:", err);
    }
  };

  const openEditModal = (conn) => {
    /*
     * An OAuth connection has no password to edit — re-authorising means
     * sending the user back through Microsoft. Opening the app-password
     * form for one would offer a field that cannot fix anything.
     */
    if (isOAuthConnection(conn)) {
      startMicrosoftOAuth({
        userId: user?._id,
        redirectPath: "/connection",
      });
      return;
    }

    setConnectionToEdit(conn);
    setEditProvider(conn.provider);
    if (conn.provider === "gmail") {
      setIsModalOpen(true);
    } else if (conn.provider === "microsoft") {
      setIsMicrosoftModalOpen(true);
    } else if (conn.provider === "outlook" || conn.provider === "smtp") {
      setIsOutlookModalOpen(true);
    }
  };

  const fetchConnections = async () => {
    try {
      const userId = localStorage.getItem("userid");
      const token = localStorage.getItem("usertoken");
      if (!userId) return setLoading(false);

      if (connections.length === 0 && mailhooks.length === 0) {
        setLoading(true);
      }

      const res = await axios.get(
        `https://email-syncing-backend.vercel.app/auth/getConnection/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const connList = res.data || [];
      setConnections(connList);
      setCached(getCacheKey("connections_list", userId), connList);

      if (connList.length > 0) {
        try {
          await axios.put(
            `https://email-syncing-backend.vercel.app/auth/setup/${userId}`,
            {
              stepCompleted: 4,
              setupCompleted: true,
              skipped: false,
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } catch (apiErr) {
          console.error("Failed to auto-complete setup:", apiErr);
        }
      }
    } catch (err) {
      toast.error("Failed to load connections");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConnections();
    fetchMailhooks();

    const handleMailhookEvent = () => setIsMailhookModalOpen(true);
    const handleGmailEvent = () => openModal();
    const handleOutlookEvent = () => openOutlookModal();
    /*
     * Fired by the sidebar's "+ Microsoft" button. This is an ADD, so it
     * takes the OAuth path; the app-password modal remains only for
     * editing an existing connection.
     */
    const handleMicrosoftEvent = () => startOutlookOAuth();

    window.addEventListener("openMailhookModal", handleMailhookEvent);
    window.addEventListener("openGmailModal", handleGmailEvent);
    window.addEventListener("openOutlookModal", handleOutlookEvent);
    window.addEventListener("openMicrosoftModal", handleMicrosoftEvent);

    return () => {
      window.removeEventListener("openMailhookModal", handleMailhookEvent);
      window.removeEventListener("openGmailModal", handleGmailEvent);
      window.removeEventListener("openOutlookModal", handleOutlookEvent);
      window.removeEventListener("openMicrosoftModal", handleMicrosoftEvent);
    };
  }, []);

  const handleConnectionAdded = async (newConn) => {
    toast.success(`${newConn.provider} connected successfully!`);
    await fetchConnections();

    try {
      const userId = localStorage.getItem("userid");
      const token = localStorage.getItem("usertoken");
      if (!userId) return;

      await axios.put(
        `https://email-syncing-backend.vercel.app/auth/setup/${userId}`,
        {
          stepCompleted: 4,
          setupCompleted: false,
          skipped: false,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("Error updating setup progress:", err);
    }
  };

  const providerIcon = (provider) => {
    if (!provider) return <FaEnvelope className="text-slate-500 h-5 w-5" />;
    switch (provider.toLowerCase()) {
      case "gmail":
        return <FaGoogle className="text-red-500 h-5 w-5" />;
      case "microsoft":
      case "microsoft-oauth":
      case "outlook":
        return <FaMicrosoft className="text-blue-600 h-5 w-5" />;
      default:
        return <FaEnvelope className="text-slate-600 h-5 w-5" />;
    }
  };

  const hasConnections = mailhooks.length > 0 || connections.length > 0;

  const Loader = () => (
    <div className="flex flex-col justify-center items-center py-24">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-900 border-t-transparent mb-3"></div>
      <p className="text-xs font-semibold text-slate-600">
        Loading connections...
      </p>
    </div>
  );

  return (
    <AppLayout>
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto bg-[#F7F7FA]">
        {/* Top Title Subheader */}
        <header className="flex items-center justify-between gap-4 border-b border-[#EBE8E1] bg-white px-6 py-2">
          <div className="flex min-w-0 flex-wrap items-center gap-4">
            <p className="text-xs text-slate-500 font-medium">
              Connect and manage your Gmail, Outlook, SMTP, and Mailhook
              provider accounts.
            </p>

            {/* Moved here from the sidebar, next to the list they filter. */}
            {totalCount > 0 && (
              <div className="flex items-center gap-1 rounded-full border border-[#EBE8E1] bg-[#F7F7FA] p-0.5">
                {STATUS_FILTERS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setStatusFilter(f.id)}
                    className={`rounded-full px-3 py-1 text-[11px] font-semibold transition cursor-pointer ${
                      statusFilter === f.id
                        ? "bg-white text-slate-900 shadow-2xs"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    {f.label}
                    <span
                      className={`ml-1.5 ${
                        statusFilter === f.id
                          ? "text-slate-400"
                          : "text-slate-400"
                      }`}
                    >
                      {f.count}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {hasConnections && (
            <button
              onClick={openCreateModal}
              className="shrink-0 rounded-full bg-[#111111] px-5 py-2 text-xs font-semibold text-white shadow-2xs transition hover:bg-slate-800"
            >
              Create Connection
            </button>
          )}
        </header>

        {/* Main Canvas Body */}
        <main className="flex-1 p-6 lg:p-8 ">
          <div className="w-full">
            {loading ? (
              <Loader />
            ) : totalCount > 0 &&
              visibleMailhooks.length === 0 &&
              visibleConnections.length === 0 ? (
              <div className="rounded-[20px] border border-[#EBE8E1] bg-white p-12 text-center max-w-md mx-auto shadow-2xs my-12">
                <h3 className="text-base font-bold text-slate-900">
                  No verified connections
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  None of your connections have completed verification yet.
                </p>
                <button
                  onClick={() => setStatusFilter("all")}
                  className="mt-5 rounded-full border border-slate-300 bg-white px-5 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 cursor-pointer"
                >
                  Show all connections
                </button>
              </div>
            ) : totalCount === 0 ? (
              <div className="rounded-[20px] border border-[#EBE8E1] bg-white p-12 text-center max-w-md mx-auto shadow-2xs my-12">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 mb-4">
                  <FaPlug size={22} />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  No Connections Added
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  Connect your Gmail, Outlook, or Mailhook account to start
                  sending and automating email sequences.
                </p>
                <div className="mt-6 flex justify-center gap-2">
                  <button
                    onClick={openCreateModal}
                    className="rounded-full bg-[#111111] px-5 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-slate-800 transition"
                  >
                    Create Connection
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Mailhooks List */}
                {visibleMailhooks.map((hook) => (
                  <div
                    key={hook._id}
                    className="rounded-[20px] border border-[#EBE8E1] bg-white p-5 shadow-2xs hover:shadow-md transition flex flex-col justify-between space-y-4 relative"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                            <FaEnvelope className="h-4 w-4" />
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-900 text-sm truncate max-w-[160px]">
                              {/* A card is created before the forwarding
                                  address is confirmed, so fall back to the
                                  mailhook itself rather than showing a
                                  nameless connection. */}
                              {hook.forwardingEmail || hook.mailhook}
                            </h3>
                            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                              Mailhook Connection
                            </p>
                          </div>
                        </div>

                        {hook.connectionVerified ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#E6F4EA] px-2.5 py-0.5 text-[11px] font-semibold text-[#137333]">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#34A853]"></span>
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                            Unverified
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-medium">
                        Added{" "}
                        {new Date(hook.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>

                      <div className="flex items-center gap-2">
                        {!hook.connectionVerified && (
                          <button
                            onClick={() => {
                              setSelectedMailhookId(hook._id);
                              setIsMailhookModalOpen(true);
                              setStartAtStep3(true);
                            }}
                            className="rounded-[8px] border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition"
                          >
                            Verify
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setMailhookToDelete(hook);
                            setIsMailhookDeleteModalOpen(true);
                          }}
                          className="rounded-[8px] border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-100 transition flex items-center gap-1"
                        >
                          <FaTrashAlt size={11} />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Email Connections List (Gmail, Outlook, SMTP) */}
                {visibleConnections.map((conn) => (
                  <div
                    key={conn._id}
                    className="rounded-[20px] border border-[#EBE8E1] bg-white p-5 shadow-2xs hover:shadow-md transition flex flex-col justify-between space-y-4 relative"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                            {providerIcon(conn.provider)}
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-bold text-slate-900 text-sm truncate">
                              {conn.email}
                            </h3>
                            <p className="text-[11px] font-medium text-slate-400 capitalize tracking-wider">
                              {conn.provider} Account
                            </p>
                          </div>
                        </div>

                        {/*
                          `verified` only records that this account
                          connected once — it is never cleared when the
                          grant is later revoked. Badging on it alone left
                          a dead mailbox showing a green "Verified" while
                          the server refused to run scenarios on it.
                        */}
                        {(() => {
                          const badge = connectionBadge(conn);

                          if (badge.tone === "busy") {
                            return (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700">
                                <FaSpinner
                                  className="animate-spin text-blue-600"
                                  size={10}
                                />
                                {badge.label}
                              </span>
                            );
                          }

                          const tones = {
                            ok: "bg-[#E6F4EA] text-[#137333]",
                            error: "bg-red-50 text-red-700",
                            warn: "bg-amber-50 text-amber-700",
                          };
                          const dots = {
                            ok: "bg-[#34A853]",
                            error: "bg-red-500",
                            warn: "bg-amber-500",
                          };

                          return (
                            <span
                              title={badge.detail || badge.label}
                              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${tones[badge.tone]}`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${dots[badge.tone]}`}
                              ></span>
                              {badge.label}
                            </span>
                          );
                        })()}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-medium">
                        Added{" "}
                        {conn.createdAt
                          ? new Date(conn.createdAt).toLocaleDateString(
                              "en-US",
                              { month: "short", day: "numeric" },
                            )
                          : "Recently"}
                      </span>

                      <div className="flex items-center gap-2">
                        {!conn.verified && !conn.verifying && (
                          <button
                            onClick={async () => {
                              try {
                                setConnections((prev) =>
                                  prev.map((c) =>
                                    c._id === conn._id
                                      ? { ...c, verifying: true }
                                      : c,
                                  ),
                                );
                                const res = await apiFetch(
                                  `https://email-syncing-backend.vercel.app/mailhook/verify`,
                                  {
                                    method: "POST",
                                    headers: {
                                      "Content-Type": "application/json",
                                      Authorization: `Bearer ${localStorage.getItem("usertoken")}`,
                                    },
                                    body: JSON.stringify({
                                      connectionId: conn._id,
                                    }),
                                  },
                                );
                                const data = await res.json();
                                if (data.success) {
                                  toast.success(
                                    `${conn.email} verified successfully!`,
                                  );
                                  setConnections((prev) =>
                                    prev.map((c) =>
                                      c._id === conn._id
                                        ? {
                                            ...c,
                                            verified: true,
                                            verifying: false,
                                          }
                                        : c,
                                    ),
                                  );
                                } else {
                                  toast.error(
                                    data.message ||
                                      "Failed to verify connection",
                                  );
                                  setConnections((prev) =>
                                    prev.map((c) =>
                                      c._id === conn._id
                                        ? { ...c, verifying: false }
                                        : c,
                                    ),
                                  );
                                }
                              } catch (err) {
                                toast.error("Verification error");
                                setConnections((prev) =>
                                  prev.map((c) =>
                                    c._id === conn._id
                                      ? { ...c, verifying: false }
                                      : c,
                                  ),
                                );
                              }
                            }}
                            className="rounded-[8px] border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition"
                          >
                            Verify
                          </button>
                        )}

                        <button
                          onClick={() => openEditModal(conn)}
                          className="rounded-[8px] border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition flex items-center gap-1"
                        >
                          <FaEdit size={11} />
                          Edit
                        </button>

                        <button
                          onClick={() => {
                            setConnectionToDelete(conn);
                            setDeleteModalOpen(true);
                          }}
                          className="rounded-[8px] border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-100 transition flex items-center gap-1"
                        >
                          <FaTrashAlt size={11} />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      <ConfirmMailhookDeleteModal
        isOpen={isMailhookDeleteModalOpen}
        onClose={() => setIsMailhookDeleteModalOpen(false)}
        mailhook={mailhookToDelete}
        onDeleted={(deletedId) => {
          setMailhooks((prev) => prev.filter((m) => m._id !== deletedId));
        }}
      />
      <MailhookConnectionModal
        isOpen={isMailhookModalOpen}
        onClose={() => {
          setIsMailhookModalOpen(false);
          setStartAtStep3(false);
          setSelectedMailhookId(null);
          fetchMailhooks();
        }}
        user={{ _id: localStorage.getItem("userid"), mailhook: user?.mailhook }}
        startAtStep3={startAtStep3}
        cardId={selectedMailhookId}
        onMailhookUpdated={fetchMailhooks}
      />

      <CreateConnectionModal
        isOpen={isCreateModalOpen}
        onClose={closeCreateModal}
        onSelect={handleProviderSelect}
      />

      <ConnectionModal
        isOpen={isModalOpen}
        onClose={() => {
          closeModal();
          setConnectionToEdit(null);
          setEditProvider(null);
          fetchConnections();
        }}
        onSuccess={handleConnectionAdded}
        editMode={connectionToEdit && editProvider === "gmail"}
        connectionData={connectionToEdit}
        onUpdated={fetchConnections}
      />

      <MicrosoftConnectionModal
        isOpen={isMicrosoftModalOpen}
        onClose={() => {
          closeMicrosoftModal();
          setConnectionToEdit(null);
          setEditProvider(null);
          fetchConnections();
        }}
        onSuccess={handleConnectionAdded}
        editMode={connectionToEdit && editProvider === "microsoft"}
        connectionData={connectionToEdit}
        onUpdated={fetchConnections}
      />

      <OutlookConnectionModal
        isOpen={isOutlookModalOpen}
        onClose={() => {
          closeOutlookModal();
          setConnectionToEdit(null);
          setEditProvider(null);
          fetchConnections();
        }}
        onSuccess={handleConnectionAdded}
        editMode={
          connectionToEdit &&
          (editProvider === "outlook" || editProvider === "smtp")
        }
        connectionData={connectionToEdit}
        onUpdated={fetchConnections}
      />

      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        connectionId={connectionToDelete?._id}
        onDeleted={(id) => {
          setConnections((prev) => prev.filter((conn) => conn._id !== id));
        }}
      />
    </AppLayout>
  );
};

export default ConnectionsPage;

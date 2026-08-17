import React, { useState, useEffect, useContext } from "react";
import AppLayout from "../component/AppLayout";
import ConnectionModal from "../component/ConnectionModal";
import OutlookConnectionModal from "../component/OutlookConnectionModal";
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
import { UserContext } from "../component/UserContext";
import ConfirmMailhookDeleteModal from "../component/ConfirmMailhookDeleteModal";

const ConnectionsPage = () => {
  const { user } = useContext(UserContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOutlookModalOpen, setIsOutlookModalOpen] = useState(false);
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mailhooks, setMailhooks] = useState([]);
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

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const openOutlookModal = () => setIsOutlookModalOpen(true);
  const closeOutlookModal = () => setIsOutlookModalOpen(false);

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
      }
    } catch (err) {
      console.error("Error fetching mailhooks:", err);
    }
  };

  const openEditModal = (conn) => {
    setConnectionToEdit(conn);
    setEditProvider(conn.provider);
    if (conn.provider === "gmail") {
      setIsModalOpen(true);
    } else if (conn.provider === "outlook" || conn.provider === "smtp") {
      setIsOutlookModalOpen(true);
    }
  };

  const fetchConnections = async () => {
    try {
      const userId = localStorage.getItem("userid");
      const token = localStorage.getItem("usertoken");
      if (!userId) return setLoading(false);

      setLoading(true);

      const res = await axios.get(
        `https://email-syncing-backend.vercel.app/auth/getConnection/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const connList = res.data || [];
      setConnections(connList);

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

    window.addEventListener("openMailhookModal", handleMailhookEvent);
    window.addEventListener("openGmailModal", handleGmailEvent);
    window.addEventListener("openOutlookModal", handleOutlookEvent);

    return () => {
      window.removeEventListener("openMailhookModal", handleMailhookEvent);
      window.removeEventListener("openGmailModal", handleGmailEvent);
      window.removeEventListener("openOutlookModal", handleOutlookEvent);
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
      case "outlook":
        return <FaMicrosoft className="text-blue-600 h-5 w-5" />;
      default:
        return <FaEnvelope className="text-slate-600 h-5 w-5" />;
    }
  };

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
        <header className="border-b border-[#EBE8E1] bg-white px-6 py-2">
          <p className="text-xs text-slate-500  font-medium">
            Connect and manage your Gmail, Outlook, SMTP, and Mailhook provider
            accounts.
          </p>
        </header>

        {/* Main Canvas Body */}
        <main className="flex-1 p-6 lg:p-8 ">
          <div className="w-full">
            {loading ? (
              <Loader />
            ) : mailhooks.length === 0 && connections.length === 0 ? (
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
                    onClick={openModal}
                    className="rounded-full bg-[#111111] px-5 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-slate-800 transition"
                  >
                    Connect Gmail
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Mailhooks List */}
                {mailhooks.map((hook) => (
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
                              {hook.forwardingEmail}
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
                {connections.map((conn) => (
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

                        {conn.verifying ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700">
                            <FaSpinner
                              className="animate-spin text-blue-600"
                              size={10}
                            />
                            Verifying
                          </span>
                        ) : conn.verified ? (
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
                                const res = await fetch(
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

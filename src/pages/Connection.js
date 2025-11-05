import React, { useState, useEffect, useContext } from "react";
import Sidebar from "../component/Sidebar";
import ConnectionModal from "../component/ConnectionModal";
import OutlookConnectionModal from "../component/OutlookConnectionModal";
import {
  FaGoogle,
  FaMicrosoft,
  FaEnvelope,
  FaTrashAlt,
  FaCheckCircle,
  FaShieldAlt,
  FaSpinner,
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
  const [deleting, setDeleting] = useState(false);
  const [mailhookToDelete, setMailhookToDelete] = useState(null);
  const [isMailhookDeleteModalOpen, setIsMailhookDeleteModalOpen] =
    useState(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const openOutlookModal = () => setIsOutlookModalOpen(true);
  const closeOutlookModal = () => setIsOutlookModalOpen(false);

  const fetchMailhooks = async () => {
    try {
      const userId = localStorage.getItem("userid");
      if (!userId) return;

      const res = await axios.get(
        `https://email-syncing-backend.vercel.app/mailhookcard/${userId}`
      );
      if (res.data.success) {
        setMailhooks(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching mailhooks:", err);
    }
  };

  const fetchConnections = async () => {
    try {
      const userId = localStorage.getItem("userid");
      if (!userId) return setLoading(false);

      setLoading(true);

      const res = await axios.get(
        `https://email-syncing-backend.vercel.app/auth/getConnection/${userId}`
      );

      const connections = res.data || [];
      setConnections(connections);

      if (connections.length > 0) {
        try {
          await axios.put(
            `https://email-syncing-backend.vercel.app/auth/setup/${userId}`,
            {
              stepCompleted: 4,
              setupCompleted: true,
              skipped: false,
            }
          );
          console.log(" Setup marked as completed because connection exists");
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
  }, []);
  const [selectedMailhookId, setSelectedMailhookId] = useState(null);

  const handleConnectionAdded = async (newConn) => {
    toast.success(`${newConn.provider} connected successfully!`);
    await fetchConnections();

    try {
      const userId = localStorage.getItem("userid");
      if (!userId) return;

      await axios.put(
        `https://email-syncing-backend.vercel.app/auth/setup/${userId}`,
        {
          stepCompleted: 4,
          setupCompleted: false,
          skipped: false,
        }
      );
    } catch (err) {
      console.error("Error updating setup progress:", err);
      toast.error("Failed to update setup progress");
    }
  };

  const providerIcon = (provider) => {
    if (!provider) return <FaEnvelope className="text-gray-500 h-6 w-6" />;
    switch (provider.toLowerCase()) {
      case "gmail":
        return <FaGoogle className="text-red-500 h-6 w-6" />;
      case "outlook":
        return <FaMicrosoft className="text-blue-600 h-6 w-6" />;
      default:
        return <FaEnvelope className="text-gray-500 h-6 w-6" />;
    }
  };

  const Loader = () => (
    <div className="flex flex-col justify-center items-center py-20">
      <svg
        className="animate-spin h-10 w-10 text-purple-600 mb-3"
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
      <p className="text-sm text-purple-600 font-medium">
        Loading connections...
      </p>
    </div>
  );
  const [startAtStep3, setStartAtStep3] = useState(false);
 

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800  sm:text-left">
              Connections
            </h1>

            <div className="flex flex-wrap sm:justify-end gap-2 sm:gap-3 w-full">
              <button
                onClick={() => setIsMailhookModalOpen(true)}
                className="flex items-center justify-center px-3 sm:px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg shadow hover:from-green-600 hover:to-emerald-700 transition"
              >
                <FaEnvelope className="h-4 w-4 mr-1.5 sm:mr-2" />
                Mailhook
              </button>

              <button
                onClick={openModal}
                className="flex items-center justify-center px-3 sm:px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-red-500 to-pink-600 rounded-lg shadow hover:from-red-600 hover:to-pink-700 transition"
              >
                <FaGoogle className="h-4 w-4 mr-1.5 sm:mr-2" />
                Gmail
              </button>

              <button
                onClick={openOutlookModal}
                className="flex items-center justify-center px-3 sm:px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow hover:from-blue-700 hover:to-indigo-700 transition"
              >
                <FaMicrosoft className="h-4 w-4 mr-1.5 sm:mr-2" />
                Outlook
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {loading ? (
            <Loader />
          ) : (
            <>
              {mailhooks.length === 0 && connections.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                  <FaEnvelope className="h-12 w-12 text-gray-400 mb-3" />
                  <p className="text-lg text-center px-4 sm:px-0">
                    You haven’t created any connections yet.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                  {mailhooks.map((hook) => (
                    <div
                      key={hook._id}
                      className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition p-5 flex flex-col justify-between"
                    >
                      {/* Header */}
                      <div className="flex items-center space-x-3">
                        <FaEnvelope className="text-purple-600 h-6 w-6" />
                        <div className="min-w-0">
                          <h3 className="text-sm sm:text-base font-semibold text-gray-800 truncate">
                            {hook.forwardingEmail}
                          </h3>
                          <p className="text-xs text-gray-500 truncate">
                            Mailhook Connection
                          </p>
                        </div>
                      </div>

                      {/* Status Section */}
                      <div className="mt-4 flex justify-between items-center gap-3">
                        {hook.connectionVerified ? (
                          <div className="flex items-center gap-2 text-green-600 font-semibold text-sm">
                            <FaCheckCircle className="text-green-600" />
                            Verified
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedMailhookId(hook._id);
                              setIsMailhookModalOpen(true);
                              setStartAtStep3(true);
                            }}
                            className="flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-md hover:from-blue-700 hover:to-indigo-700 shadow-sm transition"
                          >
                            <FaShieldAlt className="text-white text-xs" />
                            Verify
                          </button>
                        )}
                      </div>

                      <div className="mt-4 border-t pt-3 flex justify-between items-center text-xs sm:text-sm text-gray-600">
                        <span className="truncate">
                          Added on{" "}
                          {new Date(hook.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </span>

                        <button
                          onClick={() => {
                            setMailhookToDelete(hook);
                            setIsMailhookDeleteModalOpen(true);
                          }}
                          className="flex items-center space-x-1 text-red-600 hover:text-red-800 transition"
                        >
                          <FaTrashAlt className="h-4 w-4" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  ))}

                  {connections.map((conn) => (
                    <div
                      key={conn._id}
                      className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition p-5 flex flex-col justify-between"
                    >
                      {/* Header */}
                      <div className="flex items-center space-x-3">
                        {providerIcon(conn.provider)}
                        <div className="min-w-0">
                          <h3 className="text-sm sm:text-base font-semibold text-gray-800 truncate flex items-center gap-2">
                            {conn.email}
                            {conn.verified ? (
                              <FaCheckCircle className="text-green-500 text-xs" />
                            ) : (
                              <FaShieldAlt className="text-gray-400 text-xs" />
                            )}
                          </h3>
                          <p className="text-xs text-gray-500 capitalize truncate">
                            {conn.provider} Connection
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap justify-between items-center gap-3">
                        {conn.verifying ? (
                          <div className="flex items-center gap-2 text-blue-600 font-medium text-sm">
                            <FaSpinner className="animate-spin text-blue-600" />
                            Verifying...
                          </div>
                        ) : conn.verified ? (
                          <div className="flex items-center gap-2 text-green-600 font-semibold text-sm">
                            <FaCheckCircle className="text-green-600" />
                            Verified
                          </div>
                        ) : (
                          <button
                            onClick={async () => {
                              try {
                                const updated = connections.map((c) =>
                                  c._id === conn._id
                                    ? { ...c, verifying: true }
                                    : c
                                );
                                setConnections(updated);

                                const res = await fetch(
                                  `https://email-syncing-backend.vercel.app/mailhook/verify`,
                                  {
                                    method: "POST",
                                    headers: {
                                      "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify({
                                      connectionId: conn._id,
                                    }),
                                  }
                                );

                                const data = await res.json();

                                if (data.success) {
                                  toast.success(
                                    `${conn.email} verified successfully!`
                                  );
                                  setConnections((prev) =>
                                    prev.map((c) =>
                                      c._id === conn._id
                                        ? {
                                            ...c,
                                            verified: true,
                                            verifying: false,
                                          }
                                        : c
                                    )
                                  );
                                } else {
                                  toast.error(
                                    data.message ||
                                      "Failed to verify connection"
                                  );
                                  setConnections((prev) =>
                                    prev.map((c) =>
                                      c._id === conn._id
                                        ? { ...c, verifying: false }
                                        : c
                                    )
                                  );
                                }
                              } catch (err) {
                                toast.error(
                                  "Verification error. Please try again."
                                );
                                setConnections((prev) =>
                                  prev.map((c) =>
                                    c._id === conn._id
                                      ? { ...c, verifying: false }
                                      : c
                                  )
                                );
                              }
                            }}
                            className="flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-md hover:from-blue-700 hover:to-indigo-700 shadow-sm transition"
                          >
                            <FaShieldAlt className="text-white text-xs" />
                            Verify
                          </button>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="mt-4 border-t pt-3 flex justify-between items-center text-xs sm:text-sm text-gray-600">
                        <span className="truncate">
                          Added on{" "}
                          {new Date(conn.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </span>

                        <button
                          onClick={() => {
                            setConnectionToDelete(conn);
                            setDeleteModalOpen(true);
                          }}
                          className="flex items-center space-x-1 text-red-600 hover:text-red-800 transition"
                        >
                          <FaTrashAlt className="h-4 w-4" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
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
          fetchConnections();
        }}
        onSuccess={handleConnectionAdded}
      />

      <OutlookConnectionModal
        isOpen={isOutlookModalOpen}
        onClose={() => {
          closeOutlookModal();
          fetchConnections();
        }}
        onSuccess={handleConnectionAdded}
      />

      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        connectionId={connectionToDelete?._id}
        onDeleted={(id) => {
          setConnections((prev) => prev.filter((conn) => conn._id !== id));
        }}
      />
    </div>
  );
};

export default ConnectionsPage;

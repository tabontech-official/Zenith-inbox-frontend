import React, { useState, useEffect } from "react";
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

const ConnectionsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOutlookModalOpen, setIsOutlookModalOpen] = useState(false);
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🧱 Delete modal states
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [connectionToDelete, setConnectionToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const openOutlookModal = () => setIsOutlookModalOpen(true);
  const closeOutlookModal = () => setIsOutlookModalOpen(false);

  const fetchConnections = async () => {
    try {
      const userId = localStorage.getItem("userid");
      if (!userId) return setLoading(false);
      setLoading(true);
      const res = await axios.get(
        `https://email-syncing-backend.vercel.app/auth/getConnection/${userId}`
      );
      setConnections(res.data || []);
    } catch (err) {
      toast.error("Failed to load connections");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  const handleConnectionAdded = async (newConn) => {
    toast.success(`${newConn.provider} connected successfully!`);
    await fetchConnections();
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

  return (
    <div className="flex">
      <Sidebar />
      <div className="ml-64 flex-1 min-h-screen bg-gray-50 font-sans text-gray-800">
        <header className="flex items-center justify-between p-6 bg-white border-b border-gray-200 sticky top-0 z-10">
          <h1 className="text-2xl font-bold text-gray-800">Connections</h1>
          <div className="flex space-x-3">
            <button
              onClick={openModal}
              className="flex items-center px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-red-500 to-pink-600 rounded-lg shadow hover:from-red-600 hover:to-pink-700 focus:outline-none transition"
            >
              <FaGoogle className="h-5 w-5 mr-2" />
              Connect Gmail
            </button>

            <button
              onClick={openOutlookModal}
              className="flex items-center px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow hover:from-blue-700 hover:to-indigo-700 focus:outline-none transition"
            >
              <FaMicrosoft className="h-5 w-5 mr-2" />
              Connect Outlook
            </button>
          </div>
        </header>

        <main className="container mx-auto p-8">
          {loading ? (
            <Loader />
          ) : connections.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
              <FaEnvelope className="h-12 w-12 text-gray-400 mb-3" />
              <p className="text-lg">
                You haven’t created any connections yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {connections.map((conn) => (
                <div
                  key={conn._id}
                  className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition p-5 relative"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {providerIcon(conn.provider)}
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-gray-800 truncate flex items-center gap-2">
                        {conn.email}
                        {conn.verified ? (
                          <FaCheckCircle className="text-green-500 text-sm" />
                        ) : (
                          <FaShieldAlt className="text-gray-400 text-sm" />
                        )}
                      </h3>
                      <p className="text-xs text-gray-500 capitalize">
                        {conn.provider} connection
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-between items-center">
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
                            setConnections((prev) =>
                              prev.map((c) =>
                                c._id === conn._id
                                  ? { ...c, verifying: true }
                                  : c
                              )
                            );

                            const res = await fetch(
                              `https://email-syncing-backend.vercel.app/mailhook/verify`,
                              {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
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
                                    ? { ...c, verified: true, verifying: false }
                                    : c
                                )
                              );
                            } else {
                              toast.error(
                                data.message || "Failed to verify connection"
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
                        className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-md hover:from-blue-700 hover:to-indigo-700 shadow-sm transition"
                      >
                        <FaShieldAlt className="text-white text-sm" />
                        Verify
                      </button>
                    )}
                  </div>

                  {/* 🔻 Footer */}
                  <div className="mt-4 border-t pt-3 flex justify-between items-center text-sm text-gray-600">
                    <span>
                      Added on{" "}
                      {new Date(conn.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
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
        </main>
      </div>

      {/* Connection Modals */}
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


import React, { useState } from "react";
import { FiAlertTriangle } from "react-icons/fi";
import axios from "axios";
import toast from "react-hot-toast";

const ConfirmMailhookDeleteModal = ({
  isOpen,
  onClose,
  mailhook,
  onDeleted,
}) => {
  const [loading, setLoading] = useState(false);

  if (!isOpen || !mailhook) return null;

  const handleDelete = async () => {
    try {
      setLoading(true);
      const res = await axios.delete(
        `https://email-syncing-backend.vercel.app/mailhookcard/mailhookcard/${mailhook._id}`
      );

      if (res.data.success) {
        toast.success("Mailhook deleted successfully!");
        if (onDeleted) onDeleted(mailhook._id);
        onClose();
      } else {
        toast.error(res.data.message || "Failed to delete mailhook.");
      }
    } catch (err) {
      console.error("Error deleting mailhook:", err);
      toast.error("Server error while deleting mailhook.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-xl w-[90%] sm:w-[400px] p-6 relative">
        <h2 className="flex items-center justify-center text-lg font-semibold text-red-600 mb-4">
          <FiAlertTriangle className="mr-2 text-xl" />
          Confirm Deletion
        </h2>

        <p className="text-gray-700 text-center mb-6 text-sm">
          Are you sure you want to delete the mailhook{" "}
          <span className="font-semibold text-gray-900">
            {mailhook.forwardingEmail || "this connection"}
          </span>
          ?<br />
          This will also remove its linked verification record.
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-600 hover:text-gray-800 border border-gray-300 hover:bg-gray-100 transition"
          >
            Cancel
          </button>

          <button
            onClick={handleDelete}
            disabled={loading}
            className={`px-4 py-2 rounded-lg text-sm font-semibold text-white transition ${
              loading
                ? "bg-red-400 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmMailhookDeleteModal;

import React, { useState } from "react";
import { FaExclamationTriangle } from "react-icons/fa";
import axios from "axios";
import toast from "react-hot-toast";

const ConfirmDeleteModal = ({ isOpen, onClose, connectionId, onDeleted }) => {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleDelete = async () => {
    if (!connectionId) {
      toast.error("No connection selected.");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.delete(
        `http://localhost:5000/mailhook/deleteConnection/${connectionId}`
      );

      if (res.data.success) {
        toast.success("Connection deleted successfully!");
        onDeleted?.(connectionId); // Notify parent
        onClose();
      } else {
        toast.error(res.data.message || "Failed to delete connection.");
      }
    } catch (error) {
      console.error("❌ Delete error:", error);
      toast.error("Server error while deleting connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 animate-fadeIn">
        <div className="flex flex-col items-center text-center">
          <FaExclamationTriangle className="text-red-500 w-10 h-10 mb-3" />
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            Delete Connection?
          </h2>
          <p className="text-sm text-gray-600 mb-5">
            This action cannot be undone. The selected email connection will be permanently deleted.
          </p>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-5 py-2 text-sm font-medium text-gray-600 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className={`px-5 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition ${
              loading ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;

import React from "react";
import { FiX } from "react-icons/fi";

const TestEmailModal = ({ email, onClose }) => {
  if (!email) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-xl w-96 shadow-xl relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-red-500"
        >
          <FiX size={22} />
        </button>

        <h2 className="text-xl font-bold mb-3">Latest Test Email</h2>

        <div className="space-y-2">
          <p><strong>Name:</strong> {email.fullName}</p>
          <p><strong>Email:</strong> {email.businessEmail}</p>
          <p><strong>Store:</strong> {email.storeName}</p>
          <p><strong>Country:</strong> {email.country}</p>
          <p><strong>Service:</strong> {email.service}</p>
          <p><strong>Budget:</strong> {email.budget}</p>
          <p><strong>Description:</strong> {email.helpDescription}</p>
          <p><strong>Email Type:</strong> {email.Emailtype}</p>
        </div>
      </div>
    </div>
  );
};

export default TestEmailModal;

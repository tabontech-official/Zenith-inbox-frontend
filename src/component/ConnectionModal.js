import React, { useState } from "react";
import { FaGoogle, FaTimes } from "react-icons/fa";
import { MdInfo } from "react-icons/md";

const ConnectionModal = ({ isOpen, onClose }) => {
  const [connectionName, setConnectionName] = useState(
    "My Google Restricted connection"
  );
  const [advancedSettings, setAdvancedSettings] = useState(false);

  const handleGoogleSignIn = () => {
    const userId = localStorage.getItem("userid"); 
    window.location.href = `http://localhost:5000/auth/google?userId=${userId}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50 font-sans">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#e45341] to-[#f46654] text-white flex justify-between items-center px-5 py-3">
          <h2 className="text-sm font-semibold tracking-wide flex items-center gap-2">
            <span>Create a Connection</span>
          </h2>
          <button onClick={onClose} className="hover:text-gray-200">
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Connection Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={connectionName}
              onChange={(e) => setConnectionName(e.target.value)}
              className="w-full py-2 px-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </div>

          <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-gray-700">
            <MdInfo className="text-blue-500 w-5 h-5 flex-shrink-0 mt-0.5" />
            <p>
              Make’s use and transfer of information received from Google APIs
              to any other app will adhere to{" "}
              <a
                href="#"
                className="text-blue-600 underline hover:no-underline"
              >
                Google API Services User Data Policy
              </a>
              .
            </p>
          </div>

          <p className="text-xs text-gray-600">
            If you’re using a personal Google account (@gmail or
            @googlemail.com), please follow{" "}
            <a href="#" className="text-blue-600 underline hover:no-underline">
              this guide
            </a>{" "}
            for additional required steps.
          </p>

          <div className="flex items-center">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={advancedSettings}
                onChange={() => setAdvancedSettings(!advancedSettings)}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-gray-300 rounded-full peer peer-checked:bg-green-500 transition-colors"></div>
              <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-md transition-transform peer-checked:translate-x-5"></div>
              <span className="ml-3 text-sm text-gray-700">
                Advanced settings
              </span>
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleGoogleSignIn}
            className="px-5 py-2 flex items-center gap-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow transition"
          >
            <FaGoogle className="w-5 h-5" />
            Sign in with Google
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConnectionModal;

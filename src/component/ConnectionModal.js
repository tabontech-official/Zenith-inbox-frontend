import React, { useEffect, useState } from "react";
import { FaGoogle, FaTimes } from "react-icons/fa";
import { MdInfo } from "react-icons/md";

const ConnectionModal = ({ isOpen, onClose, onSuccess }) => {
  const [connectionName, setConnectionName] = useState(
    "My Google Restricted Connection"
  );

  const handleGoogleSignIn = () => {
    const userId = localStorage.getItem("userid");
    if (!userId) {
      alert("User not found. Please log in again.");
      return;
    }

    const scenarioId = localStorage.getItem("scenarioId");
    localStorage.setItem("scenarioId", scenarioId);

    const activeModule =
      localStorage.getItem("activeShopifyModule") || "Initial Email";
    localStorage.setItem("activeShopifyModule", activeModule);

    try {
      const routerBranches = JSON.parse(
        localStorage.getItem("routerBranchesState") || "[]"
      );
      localStorage.setItem(
        "shopifyScenarioState",
        JSON.stringify({ routerBranches })
      );
      console.log(
        "💾 Saved routerBranches before Google OAuth:",
        routerBranches
      );
    } catch (err) {
      console.error("❌ Error saving routerBranches before redirect:", err);
    }

    // ✅ Redirect the current tab
    const currentPath = window.location.pathname.replace(/^\//, ""); // remove leading "/"
    console.log(currentPath);
    window.location.href = `https://email-syncing-backend.vercel.app/auth/google?userId=${userId}&redirect=${encodeURIComponent(
      currentPath
    )}`;
  };

  useEffect(() => {
    const listener = (event) => {
      if (event.data?.type === "google-auth-success") {
        console.log("Gmail connected successfully!");
        if (window.googlePopup && !window.googlePopup.closed) {
          window.googlePopup.close();
        }

        onSuccess?.({
          ...event.data,
          triggerRefresh: true,
        });
      }
    };

    window.addEventListener("message", listener);
    return () => window.removeEventListener("message", listener);
  }, [onClose, onSuccess]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg overflow-hidden animate-fadeIn">
        <div className="bg-gradient-to-r from-[#e45341] to-[#f46654] text-white flex justify-between items-center px-5 py-3">
          <h2 className="text-sm font-semibold tracking-wide flex items-center gap-2">
            Create a Gmail Connection
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
              will adhere to{" "}
              <a
                href="https://developers.google.com/terms/api-services-user-data-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline hover:no-underline"
              >
                Google API Services User Data Policy
              </a>
              .
            </p>
          </div>

          <p className="text-xs text-gray-600">
            If you’re using a personal Google account (@gmail.com), please
            follow{" "}
            <a
              href="https://support.google.com/mail/answer/22370"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline hover:no-underline"
            >
              this guide
            </a>{" "}
            for additional steps.
          </p>
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

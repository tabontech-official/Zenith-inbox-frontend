import React, { useState, useContext } from "react";
import {
  FiX,
  FiCopy,
  FiCheckCircle,
  FiAlertCircle,
  FiMail,
  FiUser,
  FiSmile,
} from "react-icons/fi";
import { CiLink } from "react-icons/ci";
import { UserContext } from "./UserContext";

const WebhookModal = ({
  showWebhookInfo,
  setShowWebhookInfo,
  webhookUrl,
  loading,
}) => {
  const { user } = useContext(UserContext);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!webhookUrl) return;
    try {
      await navigator.clipboard.writeText(webhookUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  if (!showWebhookInfo) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn"
      onClick={() => setShowWebhookInfo(false)}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-[500px] p-6 relative transform animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={() => setShowWebhookInfo(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors"
        >
          <FiX className="w-6 h-6" />
        </button>

        <div className="flex items-center mb-5">
          <FiMail className="w-6 h-6 text-purple-600 mr-2" />
          <h2 className="text-xl font-semibold text-gray-900">
            Webhook Mailhook Instructions
          </h2>
        </div>

        <p className="text-sm text-gray-600 mb-6 leading-relaxed">
          <p className="text-sm text-gray-600 mb-6 leading-relaxed flex items-center">
            <span className="flex items-center text-purple-600 font-medium mr-2">
              <FiUser className="w-4 h-4 mr-1" />
              {user?.fullName || "User"}
            </span>
            <FiSmile className="w-4 h-4 text-yellow-500 ml-2" />
          </p>{" "}
          This is your <strong>email forwarding mailhook</strong>. <br />
          Copy the URL below and paste it into your{" "}
          <strong>mail forwarding settings</strong> in your email provider.{" "}
          <br />
          All forwarded emails will be delivered here.
        </p>

        {loading ? (
          <div className="flex items-center text-gray-500 text-sm mb-4">
            <FiAlertCircle className="mr-2 text-yellow-500" />
            Loading webhook...
          </div>
        ) : webhookUrl ? (
          <div className="flex items-center bg-gray-50 border rounded-lg px-3 py-3 mb-5 shadow-sm">
            <CiLink className="mr-3 text-purple-600 w-5 h-5" />
            <span className="text-sm text-gray-800 font-mono break-all select-all">
              {webhookUrl}
            </span>
          </div>
        ) : (
          <div className="flex items-center text-red-500 text-sm mb-4">
            <FiAlertCircle className="mr-2" />
            Webhook URL not available
          </div>
        )}

        <button
          onClick={handleCopy}
          disabled={loading || !webhookUrl}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors 
            ${
              copied
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-purple-600 text-white hover:bg-purple-700"
            } 
            disabled:opacity-50`}
        >
          {copied ? (
            <>
              <FiCheckCircle className="w-5 h-5" /> Copied!
            </>
          ) : (
            <>
              <FiCopy className="w-5 h-5" /> Copy Webhook URL
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default WebhookModal;

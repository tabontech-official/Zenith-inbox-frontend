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
import { useNavigate } from "react-router-dom";

const WebhookModal = ({
  showWebhookInfo,
  setShowWebhookInfo,
  webhookUrl,
  loading,
}) => {
  const { user } = useContext(UserContext);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
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

  const setupCompleted = user?.setup?.completed === true;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn"
      onClick={() => setShowWebhookInfo(false)}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-[600px] p-6 relative transform animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setShowWebhookInfo(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors"
        >
          <FiX className="w-6 h-6" />
        </button>

        <div className="flex items-center mb-5">
          <FiMail className="w-6 h-6 text-purple-600 mr-2" />
          <h2 className="text-xl font-semibold text-gray-900">
            {setupCompleted
              ? "Mailhook Setup Complete"
              : "Webhook Mailhook Instructions"}
          </h2>
        </div>

        {setupCompleted ? (
          <>
            <div className="flex items-center justify-center text-green-600 mb-4">
              <FiCheckCircle className="text-2xl mr-2" />
              <span className="text-base font-semibold">
                Your mailhook is set up properly!
              </span>
            </div>

            <p className="text-sm text-gray-600 mb-6 text-center leading-relaxed">
              Great job,{" "}
              <span className="font-medium text-purple-600">
                {user?.fullName || "User"}
              </span>
              ! Your mail forwarding is configured correctly.
              <br />
              You can now start receiving and automating your leads.
            </p>
            <div className="mt-4 mb-2 rounded-lg border border-purple-200 bg-purple-50 p-4">
              <p className="text-sm text-purple-800 leading-relaxed text-center">
                <strong>Need to connect another forwarding account?</strong>
                <br />
                You can add and manage additional mailhook connections from the{" "}
                <strong>Connections</strong> page.
              </p>

              <button
                onClick={() => {
                  setShowWebhookInfo(false);
                  navigate("/connection");
                }}
                className="mt-3 w-full rounded-md bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700"
              >
                Go to Connections
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed flex items-center">
              <span className="flex items-center text-purple-600 font-medium mr-2">
                <FiUser className="w-4 h-4 mr-1" />
                {user?.fullName || "User"}
              </span>
              <FiSmile className="w-4 h-4 text-yellow-500 ml-2" />
            </p>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              This is your <strong>email forwarding mailhook</strong>. <br />
              Copy the URL below and paste it into your{" "}
              <strong>mail forwarding settings</strong> in your email provider.
              <br />
              All forwarded emails will be delivered here.
            </p>
          </>
        )}

        {loading ? (
          <div className="flex items-center text-gray-500 text-sm mb-4">
            <FiAlertCircle className="mr-2 text-yellow-500" />
            Loading webhook...
          </div>
        ) : webhookUrl ? (
          <div className="flex items-center bg-gray-50 border rounded-lg px-3 py-3 mb-5 shadow-sm">
            <CiLink className="mr-3 text-purple-600 w-5 h-5" />

            <span className="flex-1 text-sm text-gray-800 font-mono break-all select-all">
              {webhookUrl}
            </span>

            <button
              onClick={handleCopy}
              className="ml-3 rounded-md bg-purple-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-purple-700"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        ) : (
          <div className="flex items-center text-red-500 text-sm mb-4">
            <FiAlertCircle className="mr-2" />
            Webhook URL not available
          </div>
        )}

        {!setupCompleted && (
          <div className="mt-4 rounded-lg border border-purple-200 bg-purple-50 p-4">
            <p className="text-sm text-purple-800 leading-relaxed">
              <strong>Need to connect another email account?</strong> You can
              add and manage additional mailhook connections from the{" "}
              <strong>Connections</strong> page.
            </p>

            <button
              onClick={() => {
                setShowWebhookInfo(false);
                navigate("/connection");
              }}
              className="mt-3 inline-flex items-center justify-center rounded-md bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700"
            >
              Go to Connections
            </button>
          </div>
        )}

        {/* {setupCompleted && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              You can manage this in your{" "}
              <span
                onClick={() => setShowWebhookInfo(false)}
                className="text-purple-600 font-semibold cursor-pointer hover:underline"
              >
                Organization Settings
              </span>
              .
            </p>
          </div>
        )} */}
      </div>
    </div>
  );
};

export default WebhookModal;

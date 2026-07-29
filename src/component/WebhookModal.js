import React, { useState, useContext } from "react";
import {
  FiX,
  FiCopy,
  FiCheckCircle,
  FiAlertCircle,
  FiMail,
  FiUser,
  FiSmile,
  FiRefreshCcw,
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
  const navigate = useNavigate();

  const [copied, setCopied] = useState(false);
  const [showInboxModal, setShowInboxModal] = useState(false);
  const [hideWebhookModal, setHideWebhookModal] = useState(false);
  const [latestMailhookEmails, setLatestMailhookEmails] = useState([]);
  const [loadingMailhookEmails, setLoadingMailhookEmails] = useState(false);

  const setupCompleted = user?.setup?.completed === true;
  const latestEmail = latestMailhookEmails[0];

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

  const formatEmailBody = (text = "") => {
    return text
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .replace(/@import\s+url\([^)]+\)\s*;?/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/^\s*[\w\s.#:,>*-]+\s*\{[^}]*\}\s*$/gm, "")
      .replace(/\n\s*\n+/g, "\n")
      .replace(/[ \t]+/g, " ")
      .trim()
      .replace(
        /(https?:\/\/[^\s<]+)/g,
        '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-purple-600 underline break-all">$1</a>'
      )
      .replace(/\n/g, "<br />");
  };

  const fetchMailhookEmails = async () => {
    if (!user?._id) return;

    try {
      setLoadingMailhookEmails(true);

      const res = await fetch(
        `https://email-syncing-backend.vercel.app/mailhook/verification/${user._id}`
      );

      const data = await res.json();

      if (data.success && data.data) {
        const emails = Array.isArray(data.data) ? data.data : [data.data];
        setLatestMailhookEmails(emails);
      } else {
        setLatestMailhookEmails([]);
      }
    } catch (err) {
      console.error("Error fetching mailhook emails:", err);
      setLatestMailhookEmails([]);
    } finally {
      setLoadingMailhookEmails(false);
    }
  };

  const openInboxModal = async () => {
    setHideWebhookModal(true);
    setShowInboxModal(true);
    await fetchMailhookEmails();
  };

  const closeInboxModal = () => {
    setShowInboxModal(false);
    setHideWebhookModal(false);
  };

  const closeWebhookModal = () => {
    setShowWebhookInfo(false);
    setShowInboxModal(false);
    setHideWebhookModal(false);
  };

  if (!showWebhookInfo) return null;

  return (
    <>
      {!hideWebhookModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn"
          onClick={closeWebhookModal}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-[600px] p-6 relative transform animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeWebhookModal}
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

            <button
              type="button"
              onClick={openInboxModal}
              className="mb-5 flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-4 py-2 text-sm font-semibold text-purple-700 hover:bg-purple-100 transition"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75 animate-ping" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-600" />
              </span>
              Mailhook Inbox
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700">
                Live
              </span>
            </button>

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
                  This is your <strong>email forwarding mailhook</strong>.{" "}
                  <br />
                  Copy the URL below and paste it into your{" "}
                  <strong>mail forwarding settings</strong> in your email
                  provider.
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
                  <strong>Need to connect another email account?</strong> You
                  can add and manage additional mailhook connections from the{" "}
                  <strong>Connections</strong> page.
                </p>

                <button
                  onClick={() => {
                    closeWebhookModal();
                    navigate("/connection");
                  }}
                  className="mt-3 inline-flex items-center justify-center rounded-md bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700"
                >
                  Go to Connections
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {showInboxModal && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 px-4"
          onClick={closeInboxModal}
        >
          <div
            className="w-full max-w-2xl max-h-[82vh] overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b px-6 py-4 bg-purple-50">
              <div className="flex items-center gap-3">
                <FiMail className="text-purple-600 text-xl" />
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Mailhook Inbox
                  </h3>
                  <p className="text-xs text-gray-500">
                    Latest received email from your mailhook
                  </p>
                </div>
              </div>

              <button
                onClick={closeInboxModal}
                className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
              >
                <FiX />
              </button>
            </div>

            <div className="px-6 py-5 overflow-y-auto max-h-[58vh]">
              <div className="flex justify-end mb-4">
                <button
                  onClick={fetchMailhookEmails}
                  disabled={loadingMailhookEmails}
                  className="inline-flex items-center gap-1 rounded-full border border-purple-200 bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-700 hover:bg-purple-100 disabled:opacity-50"
                >
                  <FiRefreshCcw />
                  {loadingMailhookEmails ? "Checking..." : "Retry"}
                </button>
              </div>

              {loadingMailhookEmails ? (
                <div className="text-center py-12 text-sm text-gray-500">
                  Loading emails...
                </div>
              ) : latestMailhookEmails.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center">
                  <FiMail className="mx-auto text-2xl text-purple-600 mb-3" />
                  <p className="text-sm font-semibold text-gray-800">
                    No emails received yet.
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                      Any email received on your mailhook will appear here.
                  </p>
                </div>
              ) : (
                <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                  <div className="border-b bg-gray-50 px-5 py-4">
                    <h4 className="text-base font-bold text-gray-900 break-words">
                      {latestEmail?.subject || "No subject"}
                    </h4>

                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-gray-500">From</p>
                        <p className="text-sm font-semibold text-gray-800 break-all">
                          {latestEmail?.sender ||
                            latestEmail?.from ||
                            "Unknown sender"}
                        </p>
                      </div>

                      <div className="sm:text-right">
                        <p className="text-xs text-gray-500">Received</p>
                        <p className="text-xs font-medium text-gray-600">
                          {latestEmail?.date
                            ? new Date(latestEmail.date).toLocaleString()
                            : "Unknown date"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="px-5 py-5">
                    <div
                      className="text-sm text-gray-700 leading-6 break-words [&_a]:text-purple-600 [&_a]:underline [&_a]:break-all"
                      dangerouslySetInnerHTML={{
                        __html: formatEmailBody(
                          latestEmail?.htmlBody ||
                            latestEmail?.formattedBody ||
                            latestEmail?.textBody ||
                            "No email body available."
                        ),
                      }}
                    />

                    {latestEmail?.verificationUrl && (
                      <a
                        href={latestEmail.verificationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-5 inline-flex rounded-full bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700"
                      >
                        Open Verification Link
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between border-t bg-gray-50 px-6 py-4">
              <p className="text-xs text-gray-500">
                This inbox shows latest mailhook email.
              </p>

              <button
                onClick={closeInboxModal}
                className="rounded-full bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default WebhookModal;
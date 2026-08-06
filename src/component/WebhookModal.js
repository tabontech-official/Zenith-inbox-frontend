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
import { X, Check } from "lucide-react";

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
        '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-indigo-600 font-semibold underline break-all">$1</a>'
      )
      .replace(/\n/g, "<br />");
  };

  const fetchMailhookEmails = async () => {
    if (!user?._id) return;

    try {
      setLoadingMailhookEmails(true);

      const res = await fetch(
        `http://localhost:5000/mailhook/verification/${user._id}`
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
          className="fixed inset-0 bg-black/10 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn"
          onClick={closeWebhookModal}
        >
          <div
            className="bg-white rounded-[8px]  w-[560px] border  overflow-hidden flex flex-col relative transform animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Dark Theme Header */}
            <div className="flex items-center justify-between bg-[#111110] text-white px-6 py-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white">
                  <FiMail className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">
                    {setupCompleted
                      ? "Mailhook Setup Complete"
                      : "Webhook Mailhook Instructions"}
                  </h2>
                  <p className="text-xs text-slate-300 mt-0.5 font-normal">
                    {setupCompleted
                      ? "Your mail forwarding is configured correctly"
                      : "Copy your mailhook endpoint for email forwarding"}
                  </p>
                </div>
              </div>

              <button
                onClick={closeWebhookModal}
                className="text-slate-400 hover:text-white transition p-1 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-5">
              {/* Mailhook Live Badge */}
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={openInboxModal}
                  className="flex items-center gap-2 rounded-[8px] border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-bold text-slate-800 hover:bg-slate-100 transition cursor-pointer"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75 animate-ping" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-600" />
                  </span>
                  Mailhook Inbox
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                    Live
                  </span>
                </button>
              </div>

              {setupCompleted ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm bg-emerald-50/70 border border-emerald-200/80 p-3 rounded-[8px]">
                    <FiCheckCircle className="text-lg shrink-0 text-emerald-600" />
                    <span>Your mailhook is set up properly!</span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    Great job,{" "}
                    <span className="font-bold text-slate-900">
                      {user?.fullName || "User"}
                    </span>
                    ! Your mail forwarding is configured correctly. You can now start receiving and automating your leads.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-slate-800 font-bold flex items-center gap-1.5">
                    <FiUser className="w-3.5 h-3.5 text-slate-600" />
                    <span>{user?.fullName || "User"}</span>
                  </p>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    This is your <strong>email forwarding mailhook</strong>. Copy the URL below and paste it into your <strong>mail forwarding settings</strong> in your email provider. All forwarded emails will be delivered here.
                  </p>
                </div>
              )}

              {/* Webhook URL Input & Copy Button */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Mailhook Address Endpoint
                </label>
                {loading ? (
                  <div className="flex items-center text-slate-500 text-xs py-2">
                    <FiAlertCircle className="mr-2 text-amber-500" />
                    Loading mailhook URL...
                  </div>
                ) : webhookUrl ? (
                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-[8px] p-1.5">
                    <CiLink className="ml-2 mr-2 text-slate-400 w-5 h-5 shrink-0" />
                    <span className="flex-1 text-xs text-slate-800 font-mono truncate select-all font-medium">
                      {webhookUrl}
                    </span>

                    <button
                      type="button"
                      onClick={handleCopy}
                      className="ml-2 rounded-[6px] bg-[#111110] hover:bg-black px-4 py-2 text-xs font-bold text-white transition cursor-pointer flex items-center gap-1 shrink-0"
                    >
                      {copied ? (
                        <>
                          <Check size={13} className="text-emerald-400" /> Copied!
                        </>
                      ) : (
                        "Copy"
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center text-red-500 text-xs py-2 font-medium">
                    <FiAlertCircle className="mr-1.5" />
                    Webhook URL not available
                  </div>
                )}
              </div>

              {!setupCompleted && (
                <div className="rounded-[8px] border border-slate-200 bg-slate-50 p-4 space-y-2">
                  <p className="text-xs text-slate-700 leading-relaxed">
                    <strong>Need to connect another email account?</strong> You can add and manage additional mailhook connections from the <strong>Connections</strong> page.
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      closeWebhookModal();
                      navigate("/connection");
                    }}
                    className="inline-flex items-center justify-center rounded-[8px] bg-[#111110] hover:bg-black px-4 py-2 text-xs font-bold text-white transition cursor-pointer"
                  >
                    Go to Connections
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end px-6 py-4 border-t border-slate-100 bg-slate-50/50 shrink-0">
              <button
                type="button"
                onClick={closeWebhookModal}
                className="px-5 py-2 bg-[#111110] hover:bg-black text-white text-xs font-bold rounded-[8px] transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inbox Modal */}
      {showInboxModal && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
          onClick={closeInboxModal}
        >
          <div
            className="w-full max-w-2xl max-h-[85vh] overflow-hidden rounded-[12px] bg-white shadow-2xl border border-slate-200 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between bg-[#111110] text-white px-6 py-4 shrink-0">
              <div className="flex items-center gap-3">
                <FiMail className="text-white text-lg" />
                <div>
                  <h3 className="text-base font-bold text-white">
                    Mailhook Inbox
                  </h3>
                  <p className="text-xs text-slate-300 font-normal">
                    Latest received emails from your mailhook
                  </p>
                </div>
              </div>

              <button
                onClick={closeInboxModal}
                className="text-slate-400 hover:text-white transition p-1 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh] space-y-4">
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={fetchMailhookEmails}
                  disabled={loadingMailhookEmails}
                  className="inline-flex items-center gap-1.5 rounded-[8px] border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-800 hover:bg-slate-50 disabled:opacity-50 transition cursor-pointer"
                >
                  <FiRefreshCcw />
                  {loadingMailhookEmails ? "Checking..." : "Retry"}
                </button>
              </div>

              {loadingMailhookEmails ? (
                <div className="text-center py-12 text-xs text-slate-500 font-medium">
                  Loading emails...
                </div>
              ) : latestMailhookEmails.length === 0 ? (
                <div className="rounded-[12px] border border-dashed border-slate-300 bg-slate-50/70 p-8 text-center">
                  <FiMail className="mx-auto text-2xl text-slate-400 mb-2" />
                  <p className="text-xs font-bold text-slate-800">
                    No emails received yet.
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Any email received on your mailhook will appear here.
                  </p>
                </div>
              ) : (
                <div className="rounded-[12px] border border-slate-200 bg-white overflow-hidden">
                  <div className="border-b border-slate-200 bg-slate-50 p-4">
                    <h4 className="text-sm font-bold text-slate-900 break-words">
                      {latestEmail?.subject || "No subject"}
                    </h4>

                    <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">From</p>
                        <p className="font-semibold text-slate-800 break-all">
                          {latestEmail?.sender ||
                            latestEmail?.from ||
                            "Unknown sender"}
                        </p>
                      </div>

                      <div className="sm:text-right">
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Received</p>
                        <p className="font-medium text-slate-600">
                          {latestEmail?.date
                            ? new Date(latestEmail.date).toLocaleString()
                            : "Unknown date"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4">
                    <div
                      className="text-xs text-slate-700 leading-relaxed break-words"
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
                        className="mt-4 inline-flex rounded-[8px] bg-[#111110] hover:bg-black px-4 py-2 text-xs font-bold text-white transition"
                      >
                        Open Verification Link
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-4 shrink-0">
              <p className="text-xs text-slate-500 font-medium">
                This inbox shows the latest mailhook email.
              </p>

              <button
                type="button"
                onClick={closeInboxModal}
                className="px-5 py-2 bg-[#111110] hover:bg-black text-white text-xs font-bold rounded-[8px] transition cursor-pointer"
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

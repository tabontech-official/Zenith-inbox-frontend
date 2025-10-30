import React, { useContext, useState } from "react";
import {
  FiInfo,
  FiMail,
  FiCopy,
  FiSend,
  FiServer,
  FiSettings,
  FiFolder,
  FiPlusCircle,
  FiCheckCircle,
  FiArrowRightCircle,
  FiAlertCircle,
  FiToggleRight,
  FiSave,
  FiRefreshCcw,
  FiSearch,
  FiArrowRight,
  FiUser,
  FiKey,
  FiLock,
  FiBarChart2,
  FiAlertTriangle,
  FiEye,
  FiPlayCircle,
  FiSmile,
  FiGlobe,
} from "react-icons/fi";
import { FaRegLightbulb } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../component/UserContext";

const MailhookSetupGuide = () => {
  const navigate = useNavigate();
  const { user, loading } = useContext(UserContext);
  const [activeTab, setActiveTab] = useState("gmail");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500 text-sm">
        Loading user info...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-10 px-6 sm:px-10 font-inter">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-100 p-8 sm:p-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <FiInfo className="text-indigo-600" /> Setup Coach
          </h1>
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-indigo-600 hover:underline"
          >
            ← Back
          </button>
        </div>

        <p className="text-gray-600 mb-8">
          Follow these instructions carefully — each section guides you toward
          completing your full Mailhook setup successfully.
        </p>

        <div className="space-y-12">
          {/* STEP 1 */}
          <section id="step1" className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FiMail className="text-indigo-600" /> Step 1: Get Started
              </h4>
              <span className="text-xs bg-indigo-100 text-indigo-800 px-2.5 py-0.5 rounded-full font-medium">
                1 / 5
              </span>
            </div>

            <p className="text-gray-600 text-sm mb-3">
              Welcome! You’re about to set up your <strong>Zenith Inbox</strong>.
              This process takes less than a minute.
            </p>

            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 mb-4">
              <li>We’ll create your private mailhook.</li>
              <li>Then connect your email forwarding.</li>
              <li>Finally, configure how your replies are sent.</li>
            </ul>

            <div className="bg-indigo-50 border-l-4 border-indigo-500 rounded p-3 text-indigo-800 text-sm">
              <strong>Tip:</strong> Click{" "}
              <span className="font-semibold text-indigo-700">
                “Start 60-sec Setup”
              </span>{" "}
              in your app to begin the process.
            </div>
          </section>

          {/* STEP 2 */}
          <section id="step2" className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FiCopy className="text-indigo-600" /> Step 2 – Connect Your Email
              </h4>
              <span className="text-xs bg-indigo-100 text-indigo-800 px-2.5 py-0.5 rounded-full font-medium">
                2 / 5
              </span>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Choose your email provider below and follow the steps to forward
              your emails to your unique <strong>Mailhook address</strong>.
            </p>

            <div className="bg-gray-100 rounded-lg p-1 flex space-x-1 mb-5">
              {["gmail", "outlook", "smtp"].map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                    activeTab === t
                      ? "bg-white text-indigo-700 shadow-md"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-center gap-2 capitalize">
                    {t === "gmail" && <FiMail className="text-indigo-600" />}
                    {t === "outlook" && <FiSend className="text-indigo-600" />}
                    {t === "smtp" && <FiServer className="text-indigo-600" />}
                    {t}
                  </div>
                </button>
              ))}
            </div>

            {/* Gmail Instructions */}
            {activeTab === "gmail" && (
              <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
                <p><strong>Gmail setup:</strong></p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Go to Gmail → Settings → “See all settings”.</li>
                  <li>Open the “Forwarding and POP/IMAP” tab.</li>
                  <li>Click “Add a forwarding address”.</li>
                  <li>
                    Enter your Mailhook address:
                    <code className="block bg-gray-50 border border-indigo-200 text-indigo-700 px-3 py-2 rounded-lg text-xs font-mono mt-1 break-all">
                      {user?.mailhook || "your-mailhook@zenith-inbox.com"}
                    </code>
                  </li>
                  <li>Gmail will send a confirmation email to your Mailhook.</li>
                </ol>
              </div>
            )}

            {/* Outlook Instructions */}
            {activeTab === "outlook" && (
              <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
                <p><strong>Outlook setup:</strong></p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Open Outlook Settings → “View all Outlook settings”.</li>
                  <li>Go to Mail → Forwarding.</li>
                  <li>Enable “Start forwarding”.</li>
                  <li>
                    Enter your Mailhook address:
                    <code className="block bg-gray-50 border border-indigo-200 text-indigo-700 px-3 py-2 rounded-lg text-xs font-mono mt-1 break-all">
                      {user?.mailhook || "your-mailhook@zenith-inbox.com"}
                    </code>
                  </li>
                  <li>Click Save to confirm changes.</li>
                </ul>
              </div>
            )}

            {/* SMTP Instructions */}
            {activeTab === "smtp" && (
              <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
                <p><strong>Custom SMTP setup:</strong></p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Open your provider’s SMTP settings panel.</li>
                  <li>Enter your username and app password (if 2FA is on).</li>
                  <li>
                    Host example: <code className="bg-gray-100 px-1">smtp.domain.com</code>  
                    Port example: <code className="bg-gray-100 px-1">587</code>
                  </li>
                  <li>Enable STARTTLS or SSL for secure delivery.</li>
                </ul>
              </div>
            )}
          </section>

          {/* STEP 3 */}
          <section id="step3" className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FiAlertCircle className="text-indigo-600" /> Step 3 – Verify Forwarding
              </h4>
              <span className="text-xs bg-indigo-100 text-indigo-800 px-2.5 py-0.5 rounded-full font-medium">
                3 / 5
              </span>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Once you’ve added your Mailhook in Gmail or Outlook, check for a verification email.
            </p>

            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
              <li>Open your Gmail Forwarding settings again.</li>
              <li>Find your Mailhook address in the dropdown.</li>
              <li>Select it under “Forward a copy of incoming mail to”.</li>
              <li>Save changes to activate forwarding.</li>
              <li>
                Check your Mailhook inbox to see Gmail’s verification email and click the link inside.
              </li>
            </ul>

            <div className="mt-5 bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded text-yellow-700 text-sm flex items-start gap-2">
              <FiInfo className="mt-0.5 text-yellow-500" />
              <p>
                If no confirmation appears, wait a few minutes and make sure forwarding is enabled.
              </p>
            </div>
          </section>

          {/* STEP 4 */}
          <section id="step4" className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FiSend className="text-indigo-600" /> Step 4 – Set Up SMTP Sending
              </h4>
              <span className="text-xs bg-indigo-100 text-indigo-800 px-2.5 py-0.5 rounded-full font-medium">
                4 / 5
              </span>
            </div>

            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
              <li>Connect your sending method — Gmail, Microsoft, or Custom SMTP.</li>
              <li>Use OAuth or credentials to authenticate.</li>
              <li>Only verified accounts are allowed for deliverability.</li>
              <li>Once connected, you’ll proceed automatically to Step 5.</li>
            </ul>

            <div className="mt-4 bg-indigo-50 border-l-4 border-indigo-500 p-3 rounded text-indigo-800 text-sm flex gap-2">
              <FiInfo className="mt-0.5 text-indigo-600" />
              <p>
                <strong>Tip:</strong> Use a domain-based email for better deliverability.
              </p>
            </div>
          </section>

          {/* STEP 5 */}
          <section id="step5" className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FiCheckCircle className="text-green-600" /> Step 5 – Review & Go Live
              </h4>
              <span className="text-xs bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full font-medium">
                5 / 5
              </span>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Review your setup to ensure everything’s connected properly before activating automation.
            </p>

            <div className="space-y-2 text-sm text-gray-700">
              <p> Your Mailhook: <strong>{user?.mailhook || "loading..."}</strong></p>
              <p> Verify forwarding and SMTP setup.</p>
              <p> Once everything is verified, start building scenarios!</p>
            </div>

            <div className="mt-5 bg-green-50 border-l-4 border-green-400 p-3 rounded text-green-800 text-sm flex gap-2">
              <FiSmile className="mt-0.5 text-green-600" />
              <p>
                <strong>Success Tip:</strong> All leads will now automatically flow into your Zenith Inbox.
              </p>
            </div>
          </section>
        </div>

        <div className="mt-12 text-center text-sm text-gray-500 border-t pt-4">
          Need help?{" "}
          <a
            href="/pages/mailhook/instruction"
            target="_blank"
            className="text-indigo-600 font-semibold hover:underline"
          >
            View detailed guide
          </a>
        </div>
      </div>
    </div>
  );
};

export default MailhookSetupGuide;

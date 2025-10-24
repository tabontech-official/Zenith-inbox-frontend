import React, { useContext, useState } from "react";
import {
  FiCopy,
  FiArrowLeft,
  FiMail,
  FiSettings,
  FiSend,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../component/UserContext";

const MailhookSetupGuide = () => {
  const navigate = useNavigate();
  const { user, loading } = useContext(UserContext);
  const [activeTab, setActiveTab] = useState("gmail");

  const userMailhook = user?.mailhook || "your-mailhook@zenith-inbox.com";

  const handleCopy = () => {
    if (user?.mailhook) {
      navigator.clipboard.writeText(user.mailhook);
      alert("Mailhook copied to clipboard!");
    } else {
      alert("Mailhook not available yet!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500 text-sm">
        Loading user info...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-10 px-6 sm:px-10 font-inter">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-100 p-8 sm:p-10 relative">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute left-6 top-6 flex items-center text-indigo-600 hover:underline text-sm font-medium"
        >
          <FiArrowLeft className="mr-1" /> Back
        </button>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-2 mt-4">
          Mail Forwarding Setup Guide
        </h1>
        <p className="text-gray-600 text-center mb-10">
          Forward all your new leads to your Zenith Inbox Mailhook.
        </p>

        {/* Mailhook display */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center justify-between mb-10 font-mono text-sm text-indigo-600">
          <span>{userMailhook}</span>
          <FiCopy
            className="cursor-pointer text-gray-500 hover:text-indigo-600"
            onClick={handleCopy}
          />
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab("gmail")}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition ${
                activeTab === "gmail"
                  ? "bg-white shadow text-indigo-600"
                  : "text-gray-600 hover:text-indigo-600"
              }`}
            >
              <FiMail className="mr-2" /> Gmail
            </button>
            <button
              onClick={() => setActiveTab("outlook")}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition ${
                activeTab === "outlook"
                  ? "bg-white shadow text-indigo-600"
                  : "text-gray-600 hover:text-indigo-600"
              }`}
            >
              <FiSend className="mr-2" /> Outlook
            </button>
          </div>
        </div>

        {/* Tab content */}
        <div className="transition-all duration-300">
          {activeTab === "gmail" && (
            <section className="animate-fadeIn">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <FiSettings className="mr-2 text-indigo-500" /> Set up in Gmail
              </h2>
              <ol className="list-decimal list-inside space-y-3 text-gray-700 leading-relaxed text-sm sm:text-base">
                <li>
                  Open <strong>Gmail</strong> and click the ⚙️{" "}
                  <strong>Settings</strong> icon.
                </li>
                <li>
                  Click <strong>See all settings</strong>.
                </li>
                <li>
                  Go to the <strong>Forwarding and POP/IMAP</strong> tab.
                </li>
                <li>
                  Click <strong>Add a forwarding address</strong>.
                </li>
                <li>
                  Paste your Mailhook:{" "}
                  <span className="text-indigo-600 font-mono">
                    {userMailhook}
                  </span>
                </li>
                <li>
                  Click <strong>Next → Proceed → OK</strong>.
                </li>
                <li>
                  You’ll receive a Gmail verification email in your Zenith
                  Inbox.
                </li>
                <li>
                  Open it and click <strong>Verify</strong>.
                </li>
                <li>
                  Go back to Gmail → <strong>Forwarding and POP/IMAP</strong> →
                  choose <strong>Forward a copy to your Mailhook</strong>.
                </li>
                <li>
                  Click <strong>Save Changes</strong>.
                </li>
              </ol>

              <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-800">
                Once verified, Gmail will automatically forward new emails to
                your Zenith Inbox.
              </div>
            </section>
          )}

          {activeTab === "outlook" && (
            <section className="animate-fadeIn">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <FiSend className="mr-2 text-indigo-500" /> Set up in Outlook
              </h2>
              <ol className="list-decimal list-inside space-y-3 text-gray-700 leading-relaxed text-sm sm:text-base">
                <li>
                  Go to{" "}
                  <a
                    href="https://outlook.live.com/mail/0/options/mail/forwarding"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 underline"
                  >
                    Outlook Forwarding Settings
                  </a>
                  .
                </li>
                <li>
                  Enable <strong>Start forwarding</strong>.
                </li>
                <li>
                  Paste your Mailhook:{" "}
                  <span className="text-indigo-600 font-mono">
                    {userMailhook}
                  </span>
                </li>
                <li>Check “Keep a copy of forwarded messages.”</li>
                <li>
                  Click <strong>Save</strong>.
                </li>
              </ol>

              <div className="mt-4 p-3 bg-green-50 border border-green-100 rounded-lg text-sm text-green-800">
                Outlook will now forward all new messages directly to your
                Zenith Inbox Mailhook.
              </div>
            </section>
          )}
        </div>

        {/* Footer */}
        <div className="mt-10 border-t pt-6 text-center text-sm text-gray-500">
          <p>
            Need more help? Contact{" "}
            <span className="text-indigo-600 font-medium">
              support@zenith-inbox.com
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default MailhookSetupGuide;

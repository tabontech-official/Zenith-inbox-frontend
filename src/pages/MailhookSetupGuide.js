import React, { useContext } from "react";
import { FiCopy, FiArrowLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../component/UserContext";

const MailhookSetupGuide = () => {
  const navigate = useNavigate();
  const { user, loading } = useContext(UserContext); 

  const userMailhook =
    user?.mailhook || "your-mailhook@zenith-inbox.com"; 

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
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-md border border-gray-100 p-8 sm:p-10">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-indigo-600 hover:underline text-sm font-medium"
          >
            <FiArrowLeft className="mr-1" /> Back
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center flex-1">
            How to Set Up Mail Forwarding
          </h1>
        </div>

        <p className="text-gray-600 text-center mb-10">
          Follow these steps to forward all your leads to your Zenith Inbox Mailhook.
        </p>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center justify-between mb-10 font-mono text-sm text-indigo-600">
          <span>{userMailhook}</span>
          <FiCopy
            className="cursor-pointer text-gray-500 hover:text-indigo-600"
            onClick={handleCopy}
          />
        </div>

        <section className="mb-12">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Set up in Gmail
          </h2>
          <ol className="list-decimal list-inside space-y-3 text-gray-700 leading-relaxed text-sm sm:text-base">
            <li>
              Open <strong>Gmail</strong> and click the ⚙️{" "}
              <strong>Settings</strong> icon (top right).
            </li>
            <li>Click <strong>See all settings</strong>.</li>
            <li>Go to the <strong>Forwarding and POP/IMAP</strong> tab.</li>
            <li>Click <strong>Add a forwarding address</strong>.</li>
            <li>
              Paste your Mailhook:{" "}
              <span className="text-indigo-600 font-mono">{userMailhook}</span>
            </li>
            <li>Click <strong>Next → Proceed → OK</strong>.</li>
            <li>
              A Gmail verification email will appear in your Zenith Inbox within
              a few seconds.
            </li>
            <li>In the verification email, click <strong>Verify</strong>.</li>
            <li>
              Go back to Gmail’s settings →{" "}
              <strong>Forwarding and POP/IMAP</strong>, and under “Forwarding,”
              choose <strong>Forward a copy to your Mailhook</strong>.
            </li>
            <li>Click <strong>Save Changes</strong>.</li>
          </ol>

          <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-800">
            Once verified, Gmail will automatically forward all new messages
            to your Zenith Inbox.
          </div>
        </section>

        {/* Outlook Section */}
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Set up in Outlook (Microsoft)
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
            <li>Enable <strong>Start forwarding</strong>.</li>
            <li>
              In the forwarding address field, paste:{" "}
              <span className="text-indigo-600 font-mono">{userMailhook}</span>
            </li>
            <li>Check the box “Keep a copy of forwarded messages.”</li>
            <li>Click <strong>Save</strong>.</li>
          </ol>

          <div className="mt-4 p-3 bg-green-50 border border-green-100 rounded-lg text-sm text-green-800">
            Outlook will now forward all new messages directly to your Zenith
            Inbox Mailhook.
          </div>
        </section>

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

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
  const [step, setStep] = useState(1);
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

        <p className="text-gray-600 mb-6">
          Follow these quick instructions carefully — each step will guide you
          toward completing your setup successfully.
        </p>

        {/* Step navigation */}
        <div className="flex flex-wrap gap-2 bg-gray-100 rounded-lg p-1 mb-8">
          {[1, 2, 3, 4, 5].map((num) => (
            <button
              key={num}
              onClick={() => setStep(num)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                step === num
                  ? "bg-white shadow text-indigo-600"
                  : "text-gray-600 hover:text-indigo-600"
              }`}
            >
              Step {num}
            </button>
          ))}
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
          {step === 1 && (
            <>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FiMail className="text-indigo-600" /> Step 1: Get Started
                </h4>
                <span className="text-xs bg-indigo-100 text-indigo-800 px-2.5 py-0.5 rounded-full font-medium">
                  1 / 5
                </span>
              </div>

              <p className="text-gray-600 text-sm leading-relaxed mb-3">
                Welcome! You’re about to set up your{" "}
                <strong>Zenith Inbox</strong>. This process takes less than a
                minute.
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
                to begin the process.
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FiCopy className="text-indigo-600" /> Step 2 – Connect Your
                  Email
                </h4>
                <span className="text-xs bg-indigo-100 text-indigo-800 px-2.5 py-0.5 rounded-full font-medium">
                  2 / 5
                </span>
              </div>

              <p className="text-sm text-gray-600 leading-relaxed mb-4">
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
                      {t === "outlook" && (
                        <FiSend className="text-indigo-600" />
                      )}
                      {t === "smtp" && <FiServer className="text-indigo-600" />}
                      {t}
                    </div>
                  </button>
                ))}
              </div>

              {activeTab === "gmail" && (
                <div className="text-sm text-gray-700 leading-relaxed space-y-4 animate-fadeIn">
                  <div className="flex items-start gap-3">
                    <FiSettings className="text-indigo-600 text-lg mt-0.5" />
                    <p>
                      Open <strong>Gmail Settings</strong> → click the gear icon
                      → <strong>“See all settings”</strong>.
                    </p>
                  </div>

                  <div className="flex items-start gap-3">
                    <FiFolder className="text-indigo-600 text-lg mt-0.5" />
                    <p>
                      Go to the <strong>Forwarding and POP/IMAP</strong> tab.
                    </p>
                  </div>

                  <div className="flex items-start gap-3">
                    <FiPlusCircle className="text-indigo-600 text-lg mt-0.5" />
                    <p>
                      Click <strong>“Add a forwarding address”</strong>.
                    </p>
                  </div>

                  <div className="flex items-start gap-3">
                    <FiMail className="text-indigo-600 text-lg mt-0.5" />
                    <p>
                      Enter your Mailhook address:
                      <code className="block bg-gray-50 border border-indigo-200 text-indigo-700 px-3 py-2 rounded-lg text-xs font-mono mt-1 break-all select-all">
                        {user?.mailhook || "your-mailhook@zenith-inbox.com"}
                      </code>
                    </p>
                  </div>

                  <div className="flex items-start gap-3">
                    <FiCheckCircle className="text-green-600 text-lg mt-0.5" />
                    <p>
                      Gmail will send a <strong>confirmation email</strong> to
                      this Mailhook address.
                    </p>
                  </div>

                  <div className="mt-5 p-3 bg-indigo-50 border-l-4 border-indigo-500 rounded text-indigo-800 text-xs flex items-center gap-2">
                    <FiArrowRightCircle className="text-indigo-600" />
                    <p>
                      Click <strong>Next</strong> below to proceed and verify
                      your forwarding setup.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === "outlook" && (
                <div className="text-sm text-gray-700 leading-relaxed space-y-4 animate-fadeIn">
                  <div className="flex items-start gap-3">
                    <FiSettings className="text-indigo-600 text-lg mt-0.5" />
                    <p>
                      Open <strong>Outlook Settings</strong> → click{" "}
                      <strong>“View all Outlook settings”</strong>.
                    </p>
                  </div>

                  <div className="flex items-start gap-3">
                    <FiSend className="text-indigo-600 text-lg mt-0.5" />
                    <p>
                      Navigate to <strong>Mail → Forwarding</strong>.
                    </p>
                  </div>

                  <div className="flex items-start gap-3">
                    <FiToggleRight className="text-indigo-600 text-lg mt-0.5" />
                    <p>
                      Enable <strong>Start forwarding</strong>.
                    </p>
                  </div>

                  <div className="flex items-start gap-3">
                    <FiMail className="text-indigo-600 text-lg mt-0.5" />
                    <p>
                      Enter your Mailhook address:
                      <code className="block bg-gray-50 border border-indigo-200 text-indigo-700 px-3 py-2 rounded-lg text-xs font-mono mt-1 break-all select-all">
                        {user?.mailhook || "your-mailhook@zenith-inbox.com"}
                      </code>
                    </p>
                  </div>

                  <div className="flex items-start gap-3">
                    <FiSave className="text-green-600 text-lg mt-0.5" />
                    <p>
                      Click <strong>Save</strong> to apply your changes.
                    </p>
                  </div>

                  <div className="mt-5 p-3 bg-blue-50 border-l-4 border-blue-400 rounded text-blue-800 text-xs flex items-center gap-2">
                    <FiArrowRightCircle className="text-indigo-600" />
                    <p>
                      Click <strong>Next</strong> below to verify your Outlook
                      forwarding connection.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === "smtp" && (
                <div className="text-sm text-gray-700 leading-relaxed space-y-4 animate-fadeIn">
                  <div className="flex items-start gap-3">
                    <FiServer className="text-indigo-600 text-lg mt-0.5" />
                    <p>
                      Open your email provider or hosting control panel’s{" "}
                      <strong>SMTP / Email Settings</strong>.
                    </p>
                  </div>

                  <div className="flex items-start gap-3">
                    <FiKey className="text-indigo-600 text-lg mt-0.5" />
                    <p>
                      Enter your <strong>username</strong> and{" "}
                      <strong>app password</strong> (if 2FA is enabled).
                    </p>
                  </div>

                  <div className="flex items-start gap-3">
                    <FiGlobe className="text-indigo-600 text-lg mt-0.5" />
                    <p>
                      Use your SMTP Host and Port settings (e.g.,{" "}
                      <code className="bg-gray-100 text-indigo-700 rounded px-1 py-0.5 text-xs">
                        smtp.yourdomain.com
                      </code>
                      , Port{" "}
                      <code className="bg-gray-100 text-indigo-700 rounded px-1 py-0.5 text-xs">
                        587
                      </code>
                      ).
                    </p>
                  </div>

                  <div className="flex items-start gap-3">
                    <FiLock className="text-green-600 text-lg mt-0.5" />
                    <p>
                      Enable <strong>STARTTLS</strong> or <strong>SSL</strong>{" "}
                      for secure connections.
                    </p>
                  </div>

                  <div className="flex items-start gap-3">
                    <FiCheckCircle className="text-green-600 text-lg mt-0.5" />
                    <p>
                      Test your configuration to confirm successful SMTP
                      connection.
                    </p>
                  </div>

                  <div className="mt-5 p-3 bg-indigo-50 border-l-4 border-indigo-500 rounded text-indigo-800 text-xs flex items-center gap-2">
                    <FiArrowRightCircle className="text-indigo-600" />
                    <p>
                      After entering your SMTP credentials in the app, click{" "}
                      <strong>Next</strong> to continue setup.
                    </p>
                  </div>
                </div>
              )}
            </>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-semibold text-[#111827] flex items-center gap-2">
                  <FiAlertCircle className="text-[#4F46E5]" /> Step 3 – Verify
                  Forwarding
                </h4>
                <span className="text-xs bg-[#E0E7FF] text-[#3730A3] px-2.5 py-0.5 rounded-full font-medium">
                  3 / 5
                </span>
              </div>

              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                Great job — your Mailhook is now connected! Let’s verify that
                Gmail is forwarding messages correctly to your Mailhook address.
              </p>

              <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
                <div className="flex items-start gap-3">
                  <FiMail className="text-[#4F46E5] text-lg mt-0.5" />
                  <p>
                    Go back to your <strong>Gmail Settings</strong> → open the{" "}
                    <strong>Forwarding and POP/IMAP</strong> tab again.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <FiRefreshCcw className="text-[#4F46E5] text-lg mt-0.5" />
                  <p>
                    Refresh that page — you’ll now see your{" "}
                    <strong>Mailhook address</strong> in the forwarding
                    dropdown.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <FiToggleRight className="text-[#4F46E5] text-lg mt-0.5" />
                  <p>
                    Select your Mailhook under{" "}
                    <strong>“Forward a copy of incoming mail to”</strong> and
                    choose what happens to the original email (e.g., “Keep
                    Gmail’s copy in Inbox”).
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <FiSave className="text-green-600 text-lg mt-0.5" />
                  <p>
                    Scroll down and click <strong>Save Changes</strong> to
                    enable forwarding.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <FiMail className="text-[#4F46E5] text-lg mt-0.5" />
                  <p>
                    Now return to this screen. Zenith Inbox will automatically
                    check for Gmail’s confirmation email.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <FiSearch className="text-[#4F46E5] text-lg mt-0.5" />
                  <p>
                    If the confirmation email hasn’t appeared yet, click{" "}
                    <strong>Retry Checking</strong> below. Once it arrives,
                    you’ll see the Gmail verification message appear here.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <FiCheckCircle className="text-green-600 text-lg mt-0.5" />
                  <p>
                    Open that email, click the{" "}
                    <strong>verification link</strong>, and your Gmail
                    forwarding will be fully active. Then click{" "}
                    <strong>Validate Forwarding</strong> to complete the
                    process.
                  </p>
                </div>
              </div>

              <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 rounded p-3 text-yellow-700 text-sm flex items-start gap-2">
                <FiInfo className="text-yellow-600 text-lg mt-0.5" />
                <p>
                  <strong>Note:</strong> If you don’t see the confirmation email
                  after a few minutes, double-check that forwarding is enabled
                  and that your Mailhook address is selected in Gmail.
                </p>
              </div>

              <div className="mt-4 bg-indigo-50 border-l-4 border-indigo-500 rounded p-3 text-indigo-800 text-xs flex items-start gap-2">
                <FaRegLightbulb className="text-[#4F46E5] text-lg mt-0.5" />
                <p>
                  <strong>Pro Tip:</strong> Keep Gmail open in another tab while
                  verifying — the process completes faster and ensures you don’t
                  miss the prompt.
                </p>
              </div>

              <div className="mt-6 border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
                <h5 className="text-sm font-semibold text-[#111827] mb-2 flex items-center gap-2">
                  <FiUser className="text-[#4F46E5]" /> Add Your Email for
                  Verification
                </h5>
                <p className="text-xs text-gray-600 mb-3">
                  Enter the email address where you enabled forwarding. We’ll
                  use it to confirm your Mailhook connection and validate your
                  setup.
                </p>

                <div className="mt-3 text-xs text-gray-500 flex items-center gap-2">
                  <FiArrowRight className="text-[#4F46E5]" />
                  <p>
                    Once your email is validated successfully, click{" "}
                    <strong>Next</strong> below to continue to SMTP setup.
                  </p>
                </div>
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-[#111827] flex items-center gap-2">
                  <FiSend className="text-[#4F46E5]" /> Step 4 – Set Up SMTP
                  Sending
                </h4>
                <span className="text-xs bg-[#E0E7FF] text-[#3730A3] px-2.5 py-0.5 rounded-full font-medium">
                  4 / 5
                </span>
              </div>

              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                Choose how <strong>Zenith Inbox</strong> will send emails on
                your behalf.
              </p>

              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex items-start gap-3">
                  <FiMail className="text-[#4F46E5] text-lg mt-0.5" />
                  <p>
                    Select your sending method — <strong>Gmail</strong>,{" "}
                    <strong>Microsoft</strong>, or <strong>Custom SMTP</strong>.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <FiKey className="text-[#4F46E5] text-lg mt-0.5" />
                  <p>
                    Connect securely using <strong>OAuth</strong> (recommended)
                    or your credentials.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <FiLock className="text-green-600 text-lg mt-0.5" />
                  <p>
                    Use only verified accounts for better deliverability and
                    security.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <FiCheckCircle className="text-green-600 text-lg mt-0.5" />
                  <p>
                    Once connected successfully, you’ll be redirected to{" "}
                    <strong>Step 5</strong> automatically.
                  </p>
                </div>
              </div>

              <div className="mt-5 bg-indigo-50 border-l-4 border-indigo-500 rounded p-3 text-indigo-800 text-sm flex items-center gap-2">
                <FiInfo className="text-[#4F46E5]" />
                <p>
                  <strong>Tip:</strong> Use your business domain email instead
                  of Gmail to improve trust and avoid spam filters.
                </p>
              </div>
            </>
          )}

          {step === 5 && (
            <>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-[#111827] flex items-center gap-2">
                  <FiCheckCircle className="text-green-600" /> Step 5 – Review &
                  Go Live
                </h4>
                <span className="text-xs bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full font-medium">
                  5 / 5
                </span>
              </div>

              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                You’re almost done! Review your setup before activating your
                automation.
              </p>

              {user?.setup?.steps ? (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-5 shadow-inner">
                  <h5 className="font-semibold text-[#111827] mb-2 flex items-center gap-2">
                    <FiBarChart2 className="text-[#4F46E5]" /> Setup Progress
                    Summary
                  </h5>
                  <ul className="space-y-2 text-sm">
                    {user.setup.steps.map((s) => (
                      <li
                        key={s._id}
                        className="flex items-center justify-between border-b border-gray-100 pb-1"
                      >
                        <div className="flex items-center gap-2">
                          {s.status === "completed" ? (
                            <FiCheckCircle className="text-green-600" />
                          ) : (
                            <FiAlertTriangle className="text-yellow-500" />
                          )}
                          <span>{s.title}</span>
                        </div>
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            s.status === "completed"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-4 text-xs text-gray-600 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <FiCheckCircle className="text-green-600" />
                      <span>
                        Completed:{" "}
                        <strong>
                          {
                            user.setup.steps.filter(
                              (s) => s.status === "completed"
                            ).length
                          }
                        </strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FiAlertTriangle className="text-yellow-500" />
                      <span>
                        Skipped:{" "}
                        <strong>
                          {
                            user.setup.steps.filter(
                              (s) => s.status === "skipped"
                            ).length
                          }
                        </strong>
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-sm italic mb-4">
                  Loading setup progress...
                </p>
              )}

              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex items-start gap-3">
                  <FiEye className="text-[#4F46E5] text-lg mt-0.5" />
                  <p>
                    Review all your setup steps and confirm they’re completed.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <FiMail className="text-[#4F46E5] text-lg mt-0.5" />
                  <p>Ensure your Mailhook and SMTP are properly connected.</p>
                </div>
                <div className="flex items-start gap-3">
                  <FiPlayCircle className="text-green-600 text-lg mt-0.5" />
                  <p>
                    Click <strong>“Start Building Scenarios”</strong> to
                    activate your workspace.
                  </p>
                </div>
              </div>

              <div className="mt-5 bg-green-50 border-l-4 border-green-400 rounded p-3 text-green-800 text-sm flex items-start gap-2">
                <FiSmile className="text-green-600 text-lg mt-0.5" />
                <p>
                  <strong>Success Tip:</strong> You’re all set! Once activated,
                  all leads will automatically flow into{" "}
                  <strong>Zenith Inbox</strong>.
                </p>
              </div>
            </>
          )}
        </div>

        <div className="mt-8 text-center text-sm text-gray-500 border-t pt-4">
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

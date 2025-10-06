import React, { useState } from "react";
import {
  FiMail,
  FiArrowRight,
  FiArrowLeft,
  FiCopy,
  FiCheck,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const SetupFlow = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [testSent, setTestSent] = useState(false);
  const [selectedTab, setSelectedTab] = useState("Gmail");
  const [sendingMode, setSendingMode] = useState("Auto-Send");
  const [followUp1, setFollowUp1] = useState(2);
  const [followUp2, setFollowUp2] = useState(5);
  const [safetyNet, setSafetyNet] = useState(true);
  const [followUp1Unit, setFollowUp1Unit] = useState("days");
  const [followUp2Unit, setFollowUp2Unit] = useState("days");

  const progressWidth =
    step === 1
      ? "14%"
      : step === 2
      ? "28%"
      : step === 3
      ? "42%"
      : step === 4
      ? "56%"
      : step === 5
      ? "70%"
      : step === 6
      ? "84%"
      : "100%";

  const [selectedTone, setSelectedTone] = useState("Friendly");
  const [selectedServices, setSelectedServices] = useState(["Store Setup"]);

  const toggleService = (service) => {
    setSelectedServices((prev) =>
      prev.includes(service)
        ? prev.filter((s) => s !== service)
        : [...prev, service]
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F9FAFB] text-center">
      <div className="flex flex-col items-center mb-10">
        <div className="flex items-center space-x-2 mb-3">
          <FiMail className="text-[#4F46E5] text-2xl" />
          <span className="font-semibold text-lg text-[#111827]">
            Zenith Inbox
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-72 sm:w-[28rem] h-[6px] bg-[#E0E7FF] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#4F46E5] rounded-full transition-all duration-500"
            style={{ width: progressWidth }}
          ></div>
        </div>
      </div>

      {step === 1 && (
        <div className="bg-white shadow-md rounded-xl p-8 sm:p-10 max-w-lg w-[90%]">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#111827] mb-4">
            Never miss a Shopify lead again.
          </h1>
          <p className="text-[#4B5563] text-base mb-8 leading-relaxed">
            We’ll create your mailhook and help you forward Shopify leads to it.
            Then we’ll set up how replies send (SMTP).
          </p>
          <button
            onClick={() => setStep(2)}
            className="bg-[#4F46E5] hover:bg-[#4338CA] text-white px-8 py-3 rounded-lg text-sm font-semibold flex items-center justify-center mx-auto space-x-2 shadow-md"
          >
            <span>Start 60-sec Setup</span>
            <FiArrowRight />
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="bg-white shadow-md rounded-xl p-8 sm:p-10 max-w-2xl w-[90%] text-left">
          <h2 className="text-2xl font-bold text-[#111827] text-center mb-2">
            Your Mailhook is Ready
          </h2>
          <p className="text-[#4B5563] text-center mb-8">
            This is a private, unique address just for your leads.
          </p>

          <div className="border border-[#E5E7EB] rounded-xl p-6 space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-[#111827]">
                  Your Unique Mailhook
                </h3>
                <span className="text-green-700 bg-green-100 text-xs px-3 py-1 rounded-full">
                  Private & Unique
                </span>
              </div>
              <p className="text-[#4B5563] mb-3">
                Forward your Shopify leads to this address.
              </p>
              <div className="bg-[#F3F4F6] text-[#4F46E5] px-4 py-3 rounded-lg flex justify-between items-center font-mono text-sm">
                acme-m14272@zenith-inbox.com
                <FiCopy className="text-gray-500 cursor-pointer" />
              </div>
            </div>

            <div className="border border-[#E5E7EB] rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h4 className="font-semibold text-[#111827]">
                    Verify your mailhook
                  </h4>
                  <p className="text-sm text-[#6B7280]">
                    Let’s make sure it’s working.
                  </p>
                </div>
                <button
                  onClick={() => setTestSent(true)}
                  disabled={testSent}
                  className={`text-sm font-semibold px-4 py-2 rounded-md ${
                    testSent
                      ? "bg-[#E0E7FF] text-[#4F46E5] cursor-not-allowed"
                      : "bg-[#4F46E5] text-white hover:bg-[#4338CA]"
                  }`}
                >
                  Send a test to this address
                </button>
              </div>

              <div
                className={`px-4 py-3 rounded-md text-sm ${
                  testSent
                    ? "bg-green-50 text-green-700 flex items-center space-x-2"
                    : "bg-[#F9FAFB] text-[#6B7280]"
                }`}
              >
                {testSent ? (
                  <>
                    <FiCheck className="text-green-600" />
                    <span>Test received ✓</span>
                  </>
                ) : (
                  <span>No activity yet.</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-between mt-8">
            <button
              onClick={() => setStep(1)}
              className="flex items-center space-x-2 px-5 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
            >
              <FiArrowLeft /> <span>Back</span>
            </button>

            <button
              disabled={!testSent}
              onClick={() => setStep(3)}
              className={`flex items-center space-x-2 px-6 py-2 rounded-lg text-sm font-semibold ${
                testSent
                  ? "bg-[#4F46E5] text-white hover:bg-[#4338CA]"
                  : "bg-[#E0E7FF] text-[#9CA3AF] cursor-not-allowed"
              }`}
            >
              <span>Next</span> <FiArrowRight />
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="bg-white shadow-md rounded-xl p-8 sm:p-10 max-w-2xl w-[90%] text-left">
          <h2 className="text-2xl font-bold text-[#111827] text-center mb-2">
            Set up Forwarding
          </h2>
          <p className="text-[#4B5563] text-center mb-8">
            Automatically send your Shopify leads to Zenith Inbox.
          </p>

          <div className="bg-[#F3F4F6] text-[#4F46E5] px-4 py-3 rounded-lg flex justify-between items-center font-mono text-sm mb-6">
            Forward emails to: <span>acme-m14272@zenith-inbox.com</span>
            <FiCopy className="text-gray-500 cursor-pointer" />
          </div>

          <div className="flex border border-gray-300 rounded-lg overflow-hidden mb-4 w-full sm:w-[24rem] mx-auto">
            {["Gmail", "Outlook"].map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`w-1/2 px-6 py-2 text-sm font-medium text-center transition-colors ${
                  selectedTab === tab
                    ? "border-b-2 border-[#4F46E5] text-[#4F46E5] bg-[#EEF2FF]"
                    : "text-gray-500 hover:text-[#4F46E5] bg-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {selectedTab === "Gmail" && (
            <div className="border border-gray-200 rounded-lg p-5 text-sm text-[#111827] leading-7 bg-white">
              <ol className="list-decimal list-inside space-y-2">
                <li>
                  In Gmail, go to{" "}
                  <a href="#" className="text-[#4F46E5] underline">
                    Settings → Filters and Blocked Addresses
                  </a>
                  .
                </li>
                <li>Click "Create a new filter".</li>
                <li>
                  In the "From" field, enter{" "}
                  <code className="bg-gray-100 px-1 py-0.5 rounded">
                    @shopify.com
                  </code>
                  .
                </li>
                <li>Click "Create filter".</li>
                <li>Check "Forward it to:" and add your mailhook address.</li>
                <li>Click "Create filter" to finish.</li>
              </ol>
            </div>
          )}

          {selectedTab === "Outlook" && (
            <div className="border border-gray-200 rounded-lg p-5 text-sm text-[#111827] leading-7 bg-white">
              <ol className="list-decimal list-inside space-y-2">
                <li>
                  In Gmail, go to{" "}
                  <a href="#" className="text-[#4F46E5] underline">
                    Settings → Filters and Blocked Addresses
                  </a>
                  .
                </li>
                <li>Click "Create a new filter".</li>
                <li>
                  In the "From" field, enter{" "}
                  <code className="bg-gray-100 px-1 py-0.5 rounded">
                    @shopify.com
                  </code>
                  .
                </li>
                <li>Click "Create filter".</li>
                <li>Check "Forward it to:" and add your mailhook address.</li>
                <li>Click "Create filter" to finish.</li>
              </ol>
            </div>
          )}

          {/* Footer Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={() => setStep(2)}
              className="flex items-center space-x-2 px-5 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
            >
              <FiArrowLeft /> <span>Back</span>
            </button>

            <button
              onClick={() => setStep(4)}
              className="flex items-center space-x-2 px-6 py-2 rounded-lg text-sm font-semibold bg-[#4F46E5] text-white hover:bg-[#4338CA]"
            >
              <span>Next</span> <FiArrowRight />
            </button>
          </div>
        </div>
      )}
      {step === 4 && (
        <div className="bg-white shadow-md rounded-xl p-8 sm:p-10 max-w-2xl w-[90%] text-left">
          <h2 className="text-2xl font-bold text-[#111827] text-center mb-2">
            Set up Sending (SMTP)
          </h2>
          <p className="text-[#4B5563] text-center mb-8">
            Configure how Zenith Inbox will send replies from your own email
            address.
          </p>

          <div className="flex border border-gray-300 rounded-lg overflow-hidden mb-6 w-full sm:w-[24rem] mx-auto">
            {["Gmail", "Other"].map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`w-1/2 px-6 py-2 text-sm font-medium text-center transition-colors ${
                  selectedTab === tab
                    ? "border-b-2 border-[#4F46E5] text-[#4F46E5] bg-[#EEF2FF]"
                    : "text-gray-500 hover:text-[#4F46E5] bg-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {selectedTab === "Gmail" && (
            <div className="border border-[#E5E7EB] rounded-lg p-8 text-center space-y-4">
              <p className="text-[#4B5563]">
                Connect your Gmail account securely using OAuth 2.0.
              </p>
              <button className="bg-[#EA4335] hover:bg-[#C33D2D] text-white px-6 py-3 rounded-lg text-sm font-semibold shadow-md">
                Connect with Gmail
              </button>
            </div>
          )}

          {selectedTab === "Other" && (
            <div className="border border-[#E5E7EB] rounded-lg p-6 space-y-5">
              <div>
                <h3 className="font-semibold text-[#111827] mb-1">
                  SMTP Credentials
                </h3>
                <p className="text-sm text-[#6B7280]">
                  These are stored securely and are required to send emails.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#111827] mb-1">
                    SMTP Server
                  </label>
                  <input
                    type="text"
                    placeholder="smtp.gmail.com"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#111827] mb-1">
                    Port
                  </label>
                  <input
                    type="text"
                    placeholder="587"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#111827] mb-1">
                  Username
                </label>
                <input
                  type="email"
                  placeholder="your.email@example.com"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#111827] mb-1">
                  Password / App Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                />
              </div>

              <button className="w-full bg-gray-100 text-[#111827] font-medium py-2 rounded-md hover:bg-gray-200">
                Test Connection
              </button>
            </div>
          )}

          <div className="flex justify-between mt-8">
            <button
              onClick={() => setStep(3)}
              className="flex items-center space-x-2 px-5 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
            >
              <FiArrowLeft /> <span>Back</span>
            </button>

            <button
              onClick={() => setStep(5)}
              className="flex items-center space-x-2 px-6 py-2 rounded-lg text-sm font-semibold bg-[#4F46E5] text-white hover:bg-[#4338CA]"
            >
              <span>Next</span> <FiArrowRight />
            </button>
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="bg-white shadow-md rounded-xl p-8 sm:p-10 max-w-2xl w-[90%] text-left">
          <h2 className="text-2xl font-bold text-[#111827] text-center mb-2">
            Define Your Voice
          </h2>
          <p className="text-[#4B5563] text-center mb-8">
            Customize the AI's personality and services.
          </p>

          {/* Tone of Voice */}
          <div className="border border-[#E5E7EB] rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-[#111827] mb-2">Tone of Voice</h3>
            <p className="text-sm text-[#6B7280] mb-4">
              Choose the personality for your AI assistant.
            </p>
            <div className="flex flex-wrap gap-3">
              {["Friendly", "Expert", "Concise"].map((tone) => (
                <button
                  key={tone}
                  onClick={() => setSelectedTone(tone)}
                  className={`flex items-center space-x-2 border rounded-lg px-5 py-2 text-sm font-medium transition-all ${
                    selectedTone === tone
                      ? "border-[#4F46E5] text-[#4F46E5] bg-[#EEF2FF]"
                      : "border-gray-300 text-[#111827] hover:border-[#4F46E5]"
                  }`}
                >
                  <span>
                    {tone === "Friendly"
                      ? "😊"
                      : tone === "Expert"
                      ? "🧠"
                      : "⚡"}
                  </span>
                  <span>{tone}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="border border-[#E5E7EB] rounded-lg p-6 mb-6 space-y-4">
            <h3 className="font-semibold text-[#111827]">
              Signature & Calendar
            </h3>

            <div>
              <label className="block text-sm font-medium text-[#111827] mb-1">
                Brand Signature
              </label>
              <textarea
                rows="2"
                placeholder="Best,\nThe Zenith Team"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#111827] mb-1">
                Calendar Link
              </label>
              <input
                type="text"
                placeholder="https://cal.com/your-name"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              />
            </div>
          </div>

          <div className="border border-[#E5E7EB] rounded-lg p-6 space-y-3">
            <h3 className="font-semibold text-[#111827]">Services Offered</h3>
            <p className="text-sm text-[#6B7280] mb-3">
              Toggle the services you provide.
            </p>

            <div className="grid grid-cols-2 gap-4">
              {["Store Setup", "Theme Fix", "Migration", "CRO"].map(
                (service) => (
                  <label
                    key={service}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    {/* Toggle */}
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={selectedServices.includes(service)}
                        onChange={() => toggleService(service)}
                        className="sr-only peer"
                      />
                      {/* Toggle track */}
                      <div className="w-10 h-5 bg-gray-300 peer-checked:bg-[#4F46E5] rounded-full transition-colors duration-300"></div>
                      {/* Toggle circle */}
                      <div className="absolute top-[2px] left-[2px] w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 peer-checked:translate-x-5"></div>
                    </div>

                    {/* Label */}
                    <span className="text-sm font-medium text-[#111827]">
                      {service}
                    </span>
                  </label>
                )
              )}
            </div>
          </div>

          <div className="flex justify-between mt-8">
            <button
              onClick={() => setStep(4)}
              className="flex items-center space-x-2 px-5 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
            >
              <FiArrowLeft /> <span>Back</span>
            </button>

            <button
              onClick={() => setStep(6)}
              className="flex items-center space-x-2 px-6 py-2 rounded-lg text-sm font-semibold bg-[#4F46E5] text-white hover:bg-[#4338CA]"
            >
              <span>Next</span> <FiArrowRight />
            </button>
          </div>
        </div>
      )}

      {step === 6 && (
        <div className="bg-white shadow-md rounded-xl p-8 sm:p-10 max-w-3xl w-[90%] text-left">
          <h2 className="text-2xl font-bold text-[#111827] text-center mb-2">
            Automation Mode
          </h2>
          <p className="text-[#4B5563] text-center mb-8">
            Choose how you want replies and follow-ups to be handled.
          </p>

          <div className="border border-[#E5E7EB] rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-[#111827] mb-2">Sending Mode</h3>
            <p className="text-sm text-[#6B7280] mb-4">
              Choose to send replies automatically or draft them for your
              review.
            </p>

            <div className="flex items-center space-x-6">
              {["Auto-Send"].map((mode) => (
                <label
                  key={mode}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <div className="relative">
                    <input
                      type="radio"
                      name="sendingMode"
                      value={mode}
                      checked={sendingMode === mode}
                      onChange={() => setSendingMode(mode)}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-gray-300 peer-checked:bg-[#4F46E5] rounded-full transition-colors duration-300"></div>
                    <div className="absolute top-[2px] left-[2px] w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 peer-checked:translate-x-5"></div>
                  </div>
                  <span className="text-sm font-medium text-[#111827]">
                    {mode}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Follow-ups */}
          <div className="border border-[#E5E7EB] rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-[#111827] mb-2">Follow-ups</h3>
            <p className="text-sm text-[#6B7280] mb-4">
              Set up automated follow-up sequences if you don't get a reply.
            </p>

            <div className="flex flex-wrap items-center gap-2 text-sm text-[#111827]">
              <span>Send follow-up after</span>

              {/* First delay input */}
              <input
                type="number"
                min="1"
                value={followUp1}
                onChange={(e) => setFollowUp1(e.target.value)}
                className="w-16 border border-gray-300 rounded-md px-2 py-1 text-center focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              />

              {/* First time unit selector */}
              <select
                value={followUp1Unit}
                onChange={(e) => setFollowUp1Unit(e.target.value)}
                className="border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              >
                {["seconds", "minutes", "hours", "days", "months"].map(
                  (unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  )
                )}
              </select>

              <span>, then another after</span>

              {/* Second delay input */}
              <input
                type="number"
                min="1"
                value={followUp2}
                onChange={(e) => setFollowUp2(e.target.value)}
                className="w-16 border border-gray-300 rounded-md px-2 py-1 text-center focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              />

              {/* Second time unit selector */}
              <select
                value={followUp2Unit}
                onChange={(e) => setFollowUp2Unit(e.target.value)}
                className="border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              >
                {["seconds", "minutes", "hours", "days", "months"].map(
                  (unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  )
                )}
              </select>

              <span>before the next follow-up.</span>
            </div>
          </div>

          {/* Safety Net */}
          <div className="border border-[#E5E7EB] rounded-lg p-6">
            <h3 className="font-semibold text-[#111827] mb-2">Safety Net</h3>
            <p className="text-sm text-[#6B7280] mb-4">
              Pause if OOO/autoresponder found
            </p>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-[#111827] font-medium">
                Pause Detection
              </span>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={safetyNet}
                  onChange={() => setSafetyNet(!safetyNet)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-gray-300 peer-checked:bg-[#4F46E5] rounded-full transition-colors duration-300"></div>
                <div className="absolute top-[2px] left-[2px] w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 peer-checked:translate-x-5"></div>
              </div>
            </label>
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={() => setStep(5)}
              className="flex items-center space-x-2 px-5 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
            >
              <FiArrowLeft /> <span>Back</span>
            </button>

            <button onClick={()=>setStep(7)} className="flex items-center space-x-2 px-6 py-2 rounded-lg text-sm font-semibold bg-[#4F46E5] text-white hover:bg-[#4338CA]">
              <span>Next</span> <FiArrowRight />
            </button>
          </div>
        </div>
      )}

      {step === 7 && (
        <div className="bg-white shadow-md rounded-xl p-8 sm:p-10 max-w-2xl w-[90%] text-left">
          <h2 className="text-2xl font-bold text-[#111827] text-center mb-2">
            Review &amp; Go Live
          </h2>
          <p className="text-[#4B5563] text-center mb-8">
            Confirm your setup and enable automation.
          </p>

          {/* Checklist */}
          <div className="border border-[#E5E7EB] rounded-lg p-6 space-y-4 mb-8">
            <div>
              <h3 className="font-semibold text-[#111827] mb-1">
                Setup Checklist
              </h3>
              <p className="text-sm text-[#6B7280]">
                Everything looks good! You're ready to go live.
              </p>
            </div>

            <ul className="space-y-2 text-sm text-[#111827]">
              {[
                "Mailhook created and verified",
                "Forwarding rules configured",
                "SMTP credentials connected",
                "AI voice and services defined",
                "Automation mode selected",
              ].map((item) => (
                <li key={item} className="flex items-center space-x-2">
                  <span className="text-green-600">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            {/* Mailhook + Mode */}
            <div className="bg-[#F3F4F6] p-4 rounded-lg mt-4 text-sm text-[#4B5563]">
              <p>
                <strong>Your Mailhook:</strong>{" "}
                <span className="text-[#4F46E5] font-mono">
                  acme-m14272@zenith-inbox.com
                </span>
              </p>
              <p>
                <strong>Automation Mode:</strong> Auto-Send (during business
                hours)
              </p>
            </div>
          </div>

          {/* Footer buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={() => setStep(6)}
              className="flex items-center space-x-2 px-5 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
            >
              <FiArrowLeft /> <span>Back</span>
            </button>

            <button
              onClick={() => navigate("/organization")}
              className="flex items-center space-x-2 px-6 py-3 rounded-lg text-sm font-semibold bg-[#4F46E5] text-white hover:bg-[#4338CA] shadow-md"
            >
              <span>Enable Automation &amp; Go to Dashboard</span> 🚀
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SetupFlow;

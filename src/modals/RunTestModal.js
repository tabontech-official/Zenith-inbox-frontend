import React, { useState } from "react";
import { FiX } from "react-icons/fi";
import toast from "react-hot-toast";

const RunTestModal = ({ onClose, runScenarioExecutionAnimation }) => {
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);

  const runTest = async () => {
    if (!email || !subject || !body) {
      toast.error("All fields are required.");
      return;
    }

    // 🔥 1) CLOSE MODAL IMMEDIATELY
    onClose();

    // 🔥 2) Run animation in background (user won't see modal)
    const ok = await runScenarioExecutionAnimation();

    // If scenario invalid → stop here
    if (!ok) return;

    // 🔥 3) Fire API AFTER closing modal
    try {
      const userId = localStorage.getItem("userid");

      await fetch("https://email-syncing-backend.vercel.app/mailhook/test/custom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          emailType: "custom",
          senderEmail: email,
          subject,
          body,
        }),
      });

      toast.success("Test email sent!");
    } catch (err) {
      toast.error("Server error.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50">
      <div
        className="
        bg-white/95 backdrop-blur-xl 
        border border-white/30 shadow-2xl 
        rounded-2xl w-[460px] p-7 animate-fadeIn
      "
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Run Custom Test
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 transition"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Email */}
        <label className="block text-sm font-medium text-gray-700">
          Sender Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="
            w-full border border-gray-300 rounded-lg px-3 py-2 mt-1
            focus:ring-2 focus:ring-blue-400 focus:border-blue-400
          "
          placeholder="customer@example.com"
        />

        {/* Subject */}
        <label className="block text-sm font-medium text-gray-700 mt-4">
          Email Subject
        </label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="
            w-full border border-gray-300 rounded-lg px-3 py-2 mt-1
            focus:ring-2 focus:ring-blue-400 focus:border-blue-400
          "
          placeholder="Enter subject..."
        />

        {/* Body */}
        <label className="block text-sm font-medium text-gray-700 mt-4">
          Message Body
        </label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={6}
          className="
            w-full border border-gray-300 rounded-lg px-3 py-2 mt-1
            focus:ring-2 focus:ring-blue-400 focus:border-blue-400
          "
          placeholder="Write your message..."
        ></textarea>

        {/* Footer Buttons */}
        <div className="flex justify-end gap-3 mt-7">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition"
          >
            Cancel
          </button>

          <button
            onClick={runTest}
            disabled={loading}
            className="
              px-6 py-2 rounded-lg bg-blue-600 text-white 
              hover:bg-blue-700 shadow disabled:opacity-50 transition
            "
          >
            {loading ? "Sending…" : "Run Test"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RunTestModal;

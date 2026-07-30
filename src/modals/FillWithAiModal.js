import React, { useState } from "react";
import { FiZap, FiCopy, FiCheck, FiX, FiUpload, FiArrowRight } from "react-icons/fi";
import { generateAiPrompt } from "../utils/companyProfileSchema";
import toast from "react-hot-toast";

const FillWithAiModal = ({ isOpen, onClose, onOpenImportModal }) => {
  const [copied, setCopied] = useState(false);
  const aiPrompt = generateAiPrompt();

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(aiPrompt);
      setCopied(true);
      toast.success("AI Prompt copied to clipboard!");
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      toast.error("Failed to copy prompt to clipboard.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl rounded-[20px] bg-white shadow-2xl border border-gray-100 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
              <FiZap className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">Fill Company Profile with AI</h2>
              <p className="text-xs text-gray-500">
                Use an external AI assistant (ChatGPT, Claude, Gemini) to interview you and generate JSON.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        {/* Step Workflow Header */}
        <div className="bg-gray-50 px-6 py-3 border-b border-gray-100 grid grid-cols-4 gap-2 text-center text-xs font-medium text-gray-600">
          <div className="flex items-center justify-center gap-1.5 text-indigo-700 font-semibold">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-[11px]">1</span>
            <span>Copy Prompt</span>
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-[11px]">2</span>
            <span>AI Interview</span>
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-[11px]">3</span>
            <span>Get JSON</span>
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-[11px]">4</span>
            <span>Import JSON</span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          <div className="rounded-[12px] bg-indigo-50/70 p-3.5 border border-indigo-100 text-xs text-indigo-900 flex items-start gap-3">
            <FiZap className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold mb-1">How it works:</p>
              <ol className="list-decimal list-inside space-y-1 text-indigo-800">
                <li>Click <strong>Copy Prompt</strong> below.</li>
                <li>Paste it into ChatGPT, Claude, Gemini, or any LLM.</li>
                <li>Answer the AI's step-by-step interview questions about your company.</li>
                <li>Copy or download the resulting JSON output and click <strong>Proceed to Import JSON</strong>.</li>
              </ol>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-700">AI Prompt Preview (Auto-Generated Schema)</label>
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[8px] text-xs font-semibold shadow-sm transition-all"
              >
                {copied ? <FiCheck className="w-3.5 h-3.5 text-emerald-300" /> : <FiCopy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied Prompt!" : "Copy Prompt"}</span>
              </button>
            </div>

            <textarea
              readOnly
              rows={10}
              value={aiPrompt}
              className="w-full rounded-[12px] border border-gray-200 bg-gray-50 p-3.5 font-mono text-[11px] text-gray-800 focus:outline-none"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4 bg-white rounded-b-[20px]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-[10px] text-xs font-semibold transition-all"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-800 rounded-[10px] text-xs font-semibold transition-all"
            >
              {copied ? <FiCheck className="w-3.5 h-3.5 text-emerald-600" /> : <FiCopy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied" : "Copy Prompt"}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                if (onOpenImportModal) onOpenImportModal();
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#111110] hover:bg-black text-white rounded-[10px] text-xs font-semibold shadow-sm transition-all"
            >
              <FiUpload className="w-3.5 h-3.5 text-indigo-400" />
              <span>Proceed to Import JSON</span>
              <FiArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FillWithAiModal;

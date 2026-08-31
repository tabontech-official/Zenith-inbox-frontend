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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl rounded-[8px] bg-white shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">

        {/* Modal Header — black themed */}
        <div className="bg-[#111110] text-white px-6 py-5 flex items-start justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-white/10 border border-white/15">
              <FiZap className="h-4.5 w-4.5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-white">Fill with AI</h2>
              <p className="text-[12px] text-slate-400 mt-0.5">
                Use ChatGPT, Claude, or Gemini to generate your company profile JSON.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition cursor-pointer"
          >
            <FiX className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Step Workflow Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-2.5 grid grid-cols-4 gap-2 text-center text-xs font-medium text-slate-500 shrink-0">
          {[
            { n: 1, label: "Copy Prompt", active: true },
            { n: 2, label: "AI Interview", active: false },
            { n: 3, label: "Get JSON", active: false },
            { n: 4, label: "Import JSON", active: false },
          ].map(({ n, label, active }) => (
            <div key={n} className={`flex items-center justify-center gap-1.5 ${active ? "text-slate-900 font-bold" : ""}`}>
              <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${active ? "bg-[#111110] text-white" : "bg-slate-200 text-slate-500"}`}>{n}</span>
              <span>{label}</span>
            </div>
          ))}
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Info block */}
          <div className="rounded-[10px] bg-slate-50 p-3.5 border border-slate-200 text-xs text-slate-700 flex items-start gap-3">
            <FiZap className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-900 mb-1">How it works:</p>
              <ol className="list-decimal list-inside space-y-1 text-slate-600">
                <li>Click <strong className="text-slate-900">Copy Prompt</strong> below.</li>
                <li>Paste it into ChatGPT, Claude, Gemini, or any LLM.</li>
                <li>Answer the AI's step-by-step interview questions about your company.</li>
                <li>Copy the resulting JSON and click <strong className="text-slate-900">Proceed to Import JSON</strong>.</li>
              </ol>
            </div>
          </div>

          {/* Prompt Preview */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">AI Prompt Preview</label>
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#111110] hover:bg-black text-white rounded-[8px] text-xs font-semibold shadow-xs transition"
              >
                {copied ? <FiCheck className="w-3.5 h-3.5 text-emerald-400" /> : <FiCopy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied!" : "Copy Prompt"}</span>
              </button>
            </div>
            <textarea
              readOnly
              rows={10}
              value={aiPrompt}
              className="w-full rounded-[8px] border border-slate-200 bg-slate-50 p-3.5 font-mono text-[11px] text-slate-700 focus:outline-none resize-none"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4 bg-white shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-[8px] text-xs font-semibold transition"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-[8px] text-xs font-semibold transition"
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
              className="flex items-center gap-1.5 px-4 py-2 bg-[#111110] hover:bg-black text-white rounded-[8px] text-xs font-semibold shadow-xs transition"
            >
              <FiUpload className="w-3.5 h-3.5 text-emerald-400" />
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

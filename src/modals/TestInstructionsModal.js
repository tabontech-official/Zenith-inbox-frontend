import React, { useState } from "react";
import { X, Play, Mail, CheckCircle2, Zap, HelpCircle, ArrowRight } from "lucide-react";

const TestInstructionsModal = ({ onClose, onRunCanvasTest }) => {
  const [activeTab, setActiveTab] = useState("canvas"); // "canvas" | "live"

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white w-[580px] rounded-[16px] shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between bg-[#111110] text-white px-6 py-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400">
              <HelpCircle size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Scenario Testing Guide</h2>
              <p className="text-xs text-slate-300 mt-0.5 font-normal">
                Follow these simple instructions to test your scenario
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition p-1 rounded-full cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 bg-slate-50/70 px-6 pt-3 gap-6">
          <button
            type="button"
            onClick={() => setActiveTab("canvas")}
            className={`pb-3 text-xs font-bold flex items-center gap-2 border-b-2 transition cursor-pointer ${
              activeTab === "canvas"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Zap size={14} /> 1. Instant Canvas Test
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("live")}
            className={`pb-3 text-xs font-bold flex items-center gap-2 border-b-2 transition cursor-pointer ${
              activeTab === "live"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Mail size={14} /> 2. Live Email Test (Real Sync)
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto max-h-[60vh] space-y-4">
          {activeTab === "canvas" ? (
            <div className="space-y-4 text-xs">
              <div className="bg-indigo-50/60 border border-indigo-100 rounded-[12px] p-3.5 flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">Configure Incoming Leads Trigger</h4>
                  <p className="text-slate-600 mt-1 leading-relaxed">
                    Click the <b>Incoming Leads</b> node card and select your <b>Connection</b> (e.g. <span className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono text-[11px]">your-email@domain.com</span>) and enter a <b>Subject Filter</b> (e.g. <span className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono text-[11px]">Product Inquiry</span>).
                  </p>
                </div>
              </div>

              <div className="bg-indigo-50/60 border border-indigo-100 rounded-[12px] p-3.5 flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">Configure Email Template & Sender</h4>
                  <p className="text-slate-600 mt-1 leading-relaxed">
                    Click the <b>Email Template</b> node card, choose your <b>Sender Connection</b> and select an active <b>Email Template</b> to send responses with.
                  </p>
                </div>
              </div>

              <div className="bg-emerald-50/60 border border-emerald-100 rounded-[12px] p-3.5 flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">Run Canvas Test Validation</h4>
                  <p className="text-slate-600 mt-1 leading-relaxed">
                    Click the <b>Run Test</b> button. Watch the execution animation step through all nodes on the canvas in green to confirm everything is valid!
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 text-xs">
              <div className="bg-slate-50 border border-slate-200 rounded-[12px] p-3.5 flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">Save & Activate Scenario</h4>
                  <p className="text-slate-600 mt-1 leading-relaxed">
                    Click <b>Save Scenario</b>. Make sure the scenario status is <b>Live</b> so the background syncing engine listens for incoming lead emails.
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-[12px] p-3.5 flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">Send Real Email to Trigger Connection</h4>
                  <p className="text-slate-600 mt-1 leading-relaxed">
                    From any email account (e.g. personal email), send an email to your <b>Incoming Leads Connection</b>:
                  </p>
                  <ul className="mt-2 space-y-1 bg-white p-2.5 rounded-lg border border-slate-200 text-[11px]">
                    <li><b>To:</b> <span className="text-slate-800 font-mono">your-email@domain.com</span></li>
                    <li><b>Subject:</b> Must contain your filter e.g. <span className="text-indigo-600 font-bold">Product Inquiry</span></li>
                    <li><b>Body:</b> Any test message content</li>
                  </ul>
                </div>
              </div>

              <div className="bg-emerald-50/60 border border-emerald-100 rounded-[12px] p-3.5 flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">Automatic Response Dispatch</h4>
                  <p className="text-slate-600 mt-1 leading-relaxed">
                    The backend engine polls every 60 seconds, detects the subject match, evaluates any delays, and dispatches your template response automatically!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 border border-slate-300 rounded-[8px] text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            Close Guide
          </button>

          {onRunCanvasTest && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onRunCanvasTest();
              }}
              className="px-5 py-2 bg-[#111110] hover:bg-black text-white text-xs font-bold rounded-[8px] transition cursor-pointer flex items-center gap-1.5"
            >
              <Play size={13} /> Run Canvas Test Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestInstructionsModal;

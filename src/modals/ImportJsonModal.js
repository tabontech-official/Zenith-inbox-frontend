import React, { useState } from "react";
import {
  FiUploadCloud,
  FiFileText,
  FiAlertTriangle,
  FiCheckCircle,
  FiX,
  FiCheck,
  FiLayers,
  FiPackage,
  FiFolder,
  FiHelpCircle,
  FiBookOpen,
} from "react-icons/fi";
import { validateAndNormalizeCompanyProfileJson } from "../utils/companyProfileSchema";
import toast from "react-hot-toast";

const ImportJsonModal = ({ isOpen, onClose, onImportSuccess }) => {
  const [activeTab, setActiveTab] = useState("file"); // 'file' | 'text'
  const [rawText, setRawText] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [validationResult, setValidationResult] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);

  if (!isOpen) return null;

  const resetModalState = () => {
    setRawText("");
    setSelectedFile(null);
    setValidationResult(null);
    setIsDragOver(false);
  };

  const handleClose = () => {
    resetModalState();
    onClose();
  };

  const processJson = (content) => {
    const result = validateAndNormalizeCompanyProfileJson(content);
    setValidationResult(result);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".json")) {
      toast.error("Please select a valid .json file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size exceeds 5MB limit.");
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      processJson(event.target.result);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".json")) {
      toast.error("Please select a valid .json file.");
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      processJson(event.target.result);
    };
    reader.readAsText(file);
  };

  const handleTextChange = (e) => {
    const text = e.target.value;
    setRawText(text);
    if (text.trim()) {
      processJson(text);
    } else {
      setValidationResult(null);
    }
  };

  const handleConfirmImport = () => {
    if (!validationResult || !validationResult.isValid || !validationResult.normalizedData) {
      toast.error("Cannot import invalid JSON.");
      return;
    }

    onImportSuccess(validationResult.normalizedData);
    toast.success("Company Profile imported successfully!");
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-[620px] rounded-[24px] bg-white p-7 shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-indigo-50/80 text-indigo-600 border border-indigo-100/60 shrink-0">
              <FiUploadCloud size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#111110] tracking-tight">
                Import Company Profile JSON
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Upload or paste JSON to populate profile fields automatically.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Input Method Tabs */}
        <div className="flex border-b border-slate-100 mt-6 gap-6 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab("file")}
            className={`pb-3 flex items-center gap-2 transition cursor-pointer ${
              activeTab === "file"
                ? "border-b-2 border-indigo-600 text-indigo-600"
                : "text-slate-500 hover:text-slate-800 border-b-2 border-transparent"
            }`}
          >
            <FiUploadCloud size={15} />
            <span>Upload File</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("text")}
            className={`pb-3 flex items-center gap-2 transition cursor-pointer ${
              activeTab === "text"
                ? "border-b-2 border-indigo-600 text-indigo-600"
                : "text-slate-500 hover:text-slate-800 border-b-2 border-transparent"
            }`}
          >
            <FiFileText size={15} />
            <span>Paste JSON Text</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="mt-5 space-y-4 overflow-y-auto flex-1 pr-1">
          {activeTab === "file" ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              className={`relative flex flex-col items-center justify-center rounded-[20px] border-2 border-dashed p-10 text-center transition-all cursor-pointer ${
                isDragOver
                  ? "border-indigo-500 bg-indigo-50/40"
                  : "border-slate-200 bg-slate-50/40 hover:bg-slate-50 hover:border-slate-300"
              }`}
            >
              <input
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="absolute inset-0 cursor-pointer opacity-0"
              />
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm border border-slate-100 mb-3 text-indigo-600">
                <FiUploadCloud size={24} />
              </div>
              <p className="text-sm font-bold text-slate-800">
                {selectedFile ? selectedFile.name : "Click to upload or drag & drop .json file"}
              </p>
              <p className="text-xs text-slate-400 font-medium mt-1">
                JSON files up to 5MB supported
              </p>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Paste Raw JSON Content
              </label>
              <textarea
                rows={7}
                value={rawText}
                onChange={handleTextChange}
                placeholder={`{\n  "company": {\n    "companyName": "Acme Inc.",\n    "industry": "Software"\n  }\n}`}
                className="w-full rounded-[14px] border border-slate-200 bg-slate-50/50 p-3.5 font-mono text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
              />
            </div>
          )}

          {/* Validation Errors Display */}
          {validationResult && !validationResult.isValid && (
            <div className="rounded-[14px] bg-red-50 p-4 border border-red-200 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-red-800">
                <FiAlertTriangle size={15} className="text-red-600 shrink-0" />
                <span>JSON Validation Errors</span>
              </div>
              <ul className="list-disc list-inside text-xs text-red-700 space-y-1 pl-1">
                {validationResult.errors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Validation Warnings Display */}
          {validationResult && validationResult.warnings.length > 0 && (
            <div className="rounded-[14px] bg-amber-50 p-3.5 border border-amber-200 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-800">
                <FiAlertTriangle size={15} className="text-amber-600 shrink-0" />
                <span>Schema Warnings</span>
              </div>
              <ul className="list-disc list-inside text-[11px] text-amber-700 pl-1">
                {validationResult.warnings.map((w, idx) => (
                  <li key={idx}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Data Preview Summary Cards */}
          {validationResult && validationResult.isValid && validationResult.normalizedData && (
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                  <FiCheckCircle size={15} className="text-emerald-600" />
                  Valid JSON Schema Ready for Import
                </span>
                <span className="text-[11px] font-semibold text-slate-400">
                  Preview Summary
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <div className="p-3 bg-slate-50 rounded-[12px] border border-slate-200/80">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Company Name
                  </span>
                  <span className="text-xs font-bold text-slate-900 truncate block mt-0.5">
                    {validationResult.normalizedData.company?.companyName || "(Not specified)"}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-[12px] border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Services
                    </span>
                    <span className="text-xs font-bold text-slate-900 mt-0.5 block">
                      {validationResult.normalizedData.services?.length || 0}
                    </span>
                  </div>
                  <FiLayers size={16} className="text-indigo-600" />
                </div>

                <div className="p-3 bg-slate-50 rounded-[12px] border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Products
                    </span>
                    <span className="text-xs font-bold text-slate-900 mt-0.5 block">
                      {validationResult.normalizedData.products?.length || 0}
                    </span>
                  </div>
                  <FiPackage size={16} className="text-emerald-600" />
                </div>

                <div className="p-3 bg-slate-50 rounded-[12px] border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Portfolio
                    </span>
                    <span className="text-xs font-bold text-slate-900 mt-0.5 block">
                      {validationResult.normalizedData.portfolio?.length || 0}
                    </span>
                  </div>
                  <FiFolder size={16} className="text-blue-600" />
                </div>

                <div className="p-3 bg-slate-50 rounded-[12px] border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      FAQs
                    </span>
                    <span className="text-xs font-bold text-slate-900 mt-0.5 block">
                      {validationResult.normalizedData.faqs?.length || 0}
                    </span>
                  </div>
                  <FiHelpCircle size={16} className="text-amber-600" />
                </div>

                <div className="p-3 bg-slate-50 rounded-[12px] border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Knowledge
                    </span>
                    <span className="text-xs font-bold text-slate-900 mt-0.5 block">
                      {validationResult.normalizedData.companyKnowledge?.length || 0} chars
                    </span>
                  </div>
                  <FiBookOpen size={16} className="text-purple-600" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="mt-7 flex items-center justify-between border-t border-slate-100 pt-5">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-[12px] bg-slate-100 hover:bg-slate-200 px-5 py-2.5 text-xs font-bold text-slate-700 transition cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirmImport}
            disabled={!validationResult || !validationResult.isValid}
            className={`rounded-[12px] px-6 py-2.5 text-xs font-bold transition flex items-center gap-2 shadow-xs ${
              validationResult && validationResult.isValid
                ? "bg-[#6366F1] hover:bg-[#4F46E5] text-white cursor-pointer active:scale-[0.98]"
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
            }`}
          >
            <FiCheck size={16} />
            <span>Confirm & Populate Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportJsonModal;

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
  const [activeTab, setActiveTab] = useState("file");
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
    if (!file.name.endsWith(".json")) { toast.error("Please select a valid .json file."); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("File size exceeds 5MB limit."); return; }
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (event) => processJson(event.target.result);
    reader.readAsText(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (!file.name.endsWith(".json")) { toast.error("Please select a valid .json file."); return; }
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (event) => processJson(event.target.result);
    reader.readAsText(file);
  };

  const handleTextChange = (e) => {
    const text = e.target.value;
    setRawText(text);
    if (text.trim()) processJson(text);
    else setValidationResult(null);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-[620px] rounded-[8px] bg-white shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">

        {/* Modal Header — black themed */}
        <div className="bg-[#111110] text-white px-6 py-5 flex items-start justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-white/10 border border-white/15">
              <FiUploadCloud size={18} className="text-emerald-400" />
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-white">Import Company Profile JSON</h2>
              <p className="text-[12px] text-slate-400 mt-0.5">
                Upload or paste JSON to populate your profile automatically.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition cursor-pointer"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Input Method Tabs */}
        <div className="flex border-b border-slate-200 bg-white px-6 gap-6 text-xs font-bold shrink-0">
          {[
            { id: "file", label: "Upload File", icon: FiUploadCloud },
            { id: "text", label: "Paste JSON Text", icon: FiFileText },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`pb-3 pt-3 flex items-center gap-1.5 transition cursor-pointer border-b-2 -mb-px ${
                activeTab === id
                  ? "border-slate-900 text-slate-900"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Icon size={14} />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {activeTab === "file" ? (
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              className={`relative flex flex-col items-center justify-center rounded-[10px] border-2 border-dashed p-10 text-center transition-all cursor-pointer ${
                isDragOver
                  ? "border-slate-700 bg-slate-50"
                  : "border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-400"
              }`}
            >
              <input
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="absolute inset-0 cursor-pointer opacity-0"
              />
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-xs border border-slate-200 mb-3 text-slate-600">
                <FiUploadCloud size={22} />
              </div>
              <p className="text-sm font-bold text-slate-800">
                {selectedFile ? selectedFile.name : "Click to upload or drag & drop .json file"}
              </p>
              <p className="text-xs text-slate-400 font-medium mt-1">JSON files up to 5MB supported</p>
            </div>
          ) : (
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                Paste Raw JSON Content
              </label>
              <textarea
                rows={7}
                value={rawText}
                onChange={handleTextChange}
                placeholder={`{\n  "company": {\n    "companyName": "Acme Inc.",\n    "industry": "Software"\n  }\n}`}
                className="w-full rounded-[8px] border border-slate-200 bg-slate-50 p-3.5 font-mono text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-slate-400 transition resize-none"
              />
            </div>
          )}

          {/* Validation Errors */}
          {validationResult && !validationResult.isValid && (
            <div className="rounded-[8px] bg-red-50 p-4 border border-red-200 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-red-800">
                <FiAlertTriangle size={14} className="text-red-600 shrink-0" />
                <span>JSON Validation Errors</span>
              </div>
              <ul className="list-disc list-inside text-xs text-red-700 space-y-1 pl-1">
                {validationResult.errors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Validation Warnings */}
          {validationResult && validationResult.warnings?.length > 0 && (
            <div className="rounded-[8px] bg-amber-50 p-3.5 border border-amber-200 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-800">
                <FiAlertTriangle size={14} className="text-amber-600 shrink-0" />
                <span>Schema Warnings</span>
              </div>
              <ul className="list-disc list-inside text-[11px] text-amber-700 pl-1">
                {validationResult.warnings.map((w, idx) => (
                  <li key={idx}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Data Preview Summary */}
          {validationResult && validationResult.isValid && validationResult.normalizedData && (
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                  <FiCheckCircle size={14} className="text-emerald-600" />
                  Valid JSON — Ready to Import
                </span>
                <span className="text-[11px] font-semibold text-slate-400">Preview Summary</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <div className="p-3 bg-slate-50 rounded-[8px] border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Company Name</span>
                  <span className="text-xs font-bold text-slate-900 truncate block mt-0.5">
                    {validationResult.normalizedData.company?.companyName || "(Not specified)"}
                  </span>
                </div>
                {[
                  { label: "Services", key: "services", icon: FiLayers },
                  { label: "Products", key: "products", icon: FiPackage },
                  { label: "Portfolio", key: "portfolio", icon: FiFolder },
                  { label: "FAQs", key: "faqs", icon: FiHelpCircle },
                  { label: "Knowledge", key: "companyKnowledge", icon: FiBookOpen, suffix: " chars" },
                ].map(({ label, key, icon: Icon, suffix = "" }) => (
                  <div key={key} className="p-3 bg-slate-50 rounded-[8px] border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">{label}</span>
                      <span className="text-xs font-bold text-slate-900 mt-0.5 block">
                        {Array.isArray(validationResult.normalizedData[key])
                          ? validationResult.normalizedData[key].length
                          : (validationResult.normalizedData[key]?.length || 0)}{suffix}
                      </span>
                    </div>
                    <Icon size={15} className="text-slate-400" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4 bg-white shrink-0">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-[8px] bg-slate-100 hover:bg-slate-200 px-5 py-2 text-xs font-bold text-slate-700 transition cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirmImport}
            disabled={!validationResult || !validationResult.isValid}
            className={`rounded-[8px] px-5 py-2 text-xs font-bold transition flex items-center gap-2 shadow-xs ${
              validationResult && validationResult.isValid
                ? "bg-[#111110] hover:bg-black text-white cursor-pointer active:scale-[0.98]"
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
            }`}
          >
            <FiCheck size={14} />
            <span>Confirm & Populate Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportJsonModal;

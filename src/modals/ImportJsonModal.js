import React, { useState } from "react";
import { FiUploadCloud, FiFileText, FiAlertTriangle, FiCheckCircle, FiX, FiCheck, FiLayers, FiPackage, FiFolder, FiHelpCircle, FiShield, FiClock, FiBookOpen } from "react-icons/fi";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-[20px] bg-white shadow-2xl border border-gray-100 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
              <FiUploadCloud className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">Import Company Profile JSON</h2>
              <p className="text-xs text-gray-500">Upload or paste JSON to populate profile fields automatically.</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        {/* Input Method Tabs */}
        <div className="flex border-b border-gray-100 px-6 bg-gray-50/50">
          <button
            type="button"
            onClick={() => setActiveTab("file")}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === "file"
                ? "border-indigo-600 text-indigo-600 bg-white"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            <FiUploadCloud className="w-3.5 h-3.5" />
            <span>Upload File</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("text")}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === "text"
                ? "border-indigo-600 text-indigo-600 bg-white"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            <FiFileText className="w-3.5 h-3.5" />
            <span>Paste JSON Text</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {activeTab === "file" ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              className={`relative flex flex-col items-center justify-center rounded-[16px] border-2 border-dashed p-8 text-center transition-all ${
                isDragOver
                  ? "border-indigo-500 bg-indigo-50/50"
                  : "border-gray-200 bg-gray-50 hover:bg-gray-100/70"
              }`}
            >
              <input
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="absolute inset-0 cursor-pointer opacity-0"
              />
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm border border-gray-100 mb-3 text-indigo-600">
                <FiUploadCloud className="h-6 w-6" />
              </div>
              <p className="text-xs font-semibold text-gray-800 mb-1">
                {selectedFile ? selectedFile.name : "Click to upload or drag & drop .json file"}
              </p>
              <p className="text-[11px] text-gray-400">JSON files up to 5MB supported</p>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Paste Raw JSON Output</label>
              <textarea
                rows={6}
                value={rawText}
                onChange={handleTextChange}
                placeholder={`{\n  "company": {\n    "companyName": "Acme Inc.",\n    "industry": "Software"\n  }\n}`}
                className="w-full rounded-[12px] border border-gray-200 bg-gray-50 p-3 font-mono text-xs text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          )}

          {/* Validation Errors Display */}
          {validationResult && !validationResult.isValid && (
            <div className="rounded-[12px] bg-red-50 p-4 border border-red-200 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-red-800">
                <FiAlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
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
            <div className="rounded-[12px] bg-amber-50 p-3.5 border border-amber-200 space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-800">
                <FiAlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
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
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
                  <FiCheckCircle className="w-4 h-4 text-emerald-600" />
                  Valid JSON Schema Ready for Import
                </span>
                <span className="text-[11px] font-semibold text-gray-500">Preview Summary</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-gray-50 rounded-[10px] border border-gray-200">
                  <span className="text-[11px] text-gray-500 block">Company Name</span>
                  <span className="text-xs font-semibold text-gray-900 truncate block">
                    {validationResult.normalizedData.company?.companyName || "(Not specified)"}
                  </span>
                </div>

                <div className="p-3 bg-gray-50 rounded-[10px] border border-gray-200 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-gray-500 block">Services</span>
                    <span className="text-xs font-semibold text-gray-900">
                      {validationResult.normalizedData.services?.length || 0}
                    </span>
                  </div>
                  <FiLayers className="w-4 h-4 text-indigo-600" />
                </div>

                <div className="p-3 bg-gray-50 rounded-[10px] border border-gray-200 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-gray-500 block">Products</span>
                    <span className="text-xs font-semibold text-gray-900">
                      {validationResult.normalizedData.products?.length || 0}
                    </span>
                  </div>
                  <FiPackage className="w-4 h-4 text-green-600" />
                </div>

                <div className="p-3 bg-gray-50 rounded-[10px] border border-gray-200 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-gray-500 block">Portfolio Items</span>
                    <span className="text-xs font-semibold text-gray-900">
                      {validationResult.normalizedData.portfolio?.length || 0}
                    </span>
                  </div>
                  <FiFolder className="w-4 h-4 text-blue-600" />
                </div>

                <div className="p-3 bg-gray-50 rounded-[10px] border border-gray-200 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-gray-500 block">FAQs</span>
                    <span className="text-xs font-semibold text-gray-900">
                      {validationResult.normalizedData.faqs?.length || 0}
                    </span>
                  </div>
                  <FiHelpCircle className="w-4 h-4 text-yellow-600" />
                </div>

                <div className="p-3 bg-gray-50 rounded-[10px] border border-gray-200 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-gray-500 block">Knowledge Base</span>
                    <span className="text-xs font-semibold text-gray-900">
                      {validationResult.normalizedData.companyKnowledge?.length || 0} chars
                    </span>
                  </div>
                  <FiBookOpen className="w-4 h-4 text-purple-600" />
                </div>
              </div>

              {/* Overwrite Warning Banner */}
              <div className="rounded-[12px] bg-amber-500/10 p-3.5 border border-amber-300/40 text-amber-900 flex items-start gap-2.5">
                <FiAlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs leading-relaxed">
                  <strong>Warning:</strong> Importing this JSON will replace current profile field values in the form. Data will be saved permanently only when you click <strong>Save Profile</strong>.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4 bg-white rounded-b-[20px]">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-[10px] text-xs font-semibold transition-all"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirmImport}
            disabled={!validationResult || !validationResult.isValid}
            className={`flex items-center gap-1.5 px-5 py-2 rounded-[10px] text-xs font-semibold shadow-sm transition-all ${
              validationResult && validationResult.isValid
                ? "bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            <FiCheck className="w-4 h-4" />
            <span>Confirm & Populate Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportJsonModal;

import React, { useState, useEffect } from "react";
import {
  FiCpu,
  FiSave,
  FiSliders,
  FiTerminal,
  FiCheckCircle,
  FiLayers,
  FiShield,
  FiZap,
} from "react-icons/fi";
import PlatformAdminLayout from "./PlatformAdminLayout";
import toast from "react-hot-toast";

const API_BASE_URL = "https://email-syncing-backend.vercel.app/api/ai-config";

// Preset Free OpenRouter Models
const OPENROUTER_FREE_MODELS = [
  { id: "google/gemini-2.0-flash-exp:free", name: "Google Gemini 2.0 Flash (Free)" },
  { id: "meta-llama/llama-3.3-70b-instruct:free", name: "Meta Llama 3.3 70B Instruct (Free)" },
  { id: "deepseek/deepseek-r1:free", name: "DeepSeek R1 Reasoning (Free)" },
  { id: "qwen/qwen-2.5-coder-32b-instruct:free", name: "Qwen 2.5 Coder 32B (Free)" },
  { id: "mistralai/mistral-7b-instruct:free", name: "Mistral 7B Instruct (Free)" },
];

const AdminAIConfig = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [masterPrompt, setMasterPrompt] = useState("");
  const [provider, setProvider] = useState("openrouter");
  const [modelName, setModelName] = useState("google/gemini-2.0-flash-exp:free");
  const [customModel, setCustomModel] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(1024);
  const [ragEnabled, setRagEnabled] = useState(true);

  // Fetch Master Config
  useEffect(() => {
    const fetchConfig = async () => {
      setLoading(true);
      try {
        const response = await fetch(API_BASE_URL);
        const result = await response.json();

        if (result.success && result.data) {
          const d = result.data;
          setMasterPrompt(d.masterPrompt || "");
          setProvider(d.provider || "openrouter");
          setModelName(d.modelName || "google/gemini-2.0-flash-exp:free");
          setApiKey(d.apiKey || "");
          setTemperature(d.temperature ?? 0.7);
          setMaxTokens(d.maxTokens ?? 1024);
          setRagEnabled(d.ragEnabled ?? true);
        }
      } catch (err) {
        console.warn("AI config not found or could not be loaded, using defaults:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const selectedModel = customModel.trim() ? customModel.trim() : modelName;

    const payload = {
      masterPrompt,
      provider,
      modelName: selectedModel,
      apiKey,
      temperature,
      maxTokens,
      ragEnabled,
    };

    try {
      const response = await fetch(API_BASE_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Master AI Configuration saved successfully!");
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      console.error("Error saving AI config:", err);
      toast.error(err.message || "Failed to save AI configuration.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#f4f7fc] text-slate-500 font-medium">
        <div className="animate-pulse flex items-center gap-2">
          <FiCpu className="w-5 h-5 text-purple-600 animate-spin" />
          <span>Loading Master AI Configuration...</span>
        </div>
      </div>
    );
  }

  return (
    <PlatformAdminLayout>
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1400px] w-full mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/70 shadow-sm">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
                  <FiCpu className="w-4 h-4" />
                </div>
                <h1 className="text-xl font-semibold text-[#0f172a]">
                  Master AI Configuration (Admin Only)
                </h1>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Configure global Master Prompt instructions, OpenRouter models, and inference behavior.
              </p>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#111110] hover:bg-black text-white rounded-xl text-xs font-semibold shadow-sm transition-all duration-150"
            >
              {saving ? (
                <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <FiSave className="w-4 h-4 text-purple-400" />
              )}
              <span>{saving ? "Saving..." : "Save AI Settings"}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Master System Prompt */}
            <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/70 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-sm font-semibold text-[#0f172a] flex items-center gap-2">
                  <FiTerminal className="w-4 h-4 text-purple-600" />
                  Master System Prompt (Super Admin Instructions)
                </h2>
                <span className="text-[11px] font-semibold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-lg">
                  Combined with Customer RAG Data
                </span>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                This Master System Prompt will be injected into every AI response pipeline. It dictates assistant behavior, response boundaries, output formatting, safety rules, and company-wide defaults.
              </p>

              <textarea
                rows={14}
                value={masterPrompt}
                onChange={(e) => setMasterPrompt(e.target.value)}
                placeholder={`You are an expert AI customer support & sales agent...

Response Rules:
1. Be polite, clear, and direct.
2. Use company knowledge context provided.
3. Never guess unverified pricing or technical facts.`}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              />
            </div>

            {/* Right Column: OpenRouter Model & Parameters */}
            <div className="lg:col-span-4 space-y-6">
              {/* Model Config Card */}
              <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-6 space-y-4">
                <h2 className="text-sm font-semibold text-[#0f172a] border-b border-slate-100 pb-3 flex items-center gap-2">
                  <FiZap className="w-4 h-4 text-purple-600" />
                  OpenRouter Model Engine
                </h2>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Inference Provider</label>
                  <select
                    value={provider}
                    onChange={(e) => setProvider(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none"
                  >
                    <option value="openrouter">OpenRouter (Modular API)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Select OpenRouter Model</label>
                  <select
                    value={modelName}
                    onChange={(e) => {
                      setModelName(e.target.value);
                      setCustomModel("");
                    }}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none"
                  >
                    {OPENROUTER_FREE_MODELS.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Custom Model Name (Optional Override)</label>
                  <input
                    type="text"
                    value={customModel}
                    onChange={(e) => setCustomModel(e.target.value)}
                    placeholder="e.g. meta-llama/llama-3.1-405b-instruct:free"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Current active: <span className="font-semibold text-purple-600">{customModel || modelName}</span>
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">OpenRouter API Key (Optional Override)</label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-or-v1-..."
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              {/* Hyperparameters Card */}
              <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-6 space-y-4">
                <h2 className="text-sm font-semibold text-[#0f172a] border-b border-slate-100 pb-3 flex items-center gap-2">
                  <FiSliders className="w-4 h-4 text-purple-600" />
                  Model Hyperparameters
                </h2>

                <div>
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="font-medium text-slate-700">Temperature</span>
                    <span className="font-mono text-purple-600 font-semibold">{temperature}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    className="w-full accent-purple-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                    <span>Precise (0.0)</span>
                    <span>Creative (1.0)</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Max Token Response Length</label>
                  <input
                    type="number"
                    value={maxTokens}
                    onChange={(e) => setMaxTokens(parseInt(e.target.value) || 1024)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
      </main>
    </PlatformAdminLayout>
  );
};

export default AdminAIConfig;

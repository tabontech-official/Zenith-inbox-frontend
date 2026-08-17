import React, { useState, useEffect } from "react";
import { FiSave, FiCode, FiRefreshCw } from "react-icons/fi";
import toast from "react-hot-toast";
import axios from "axios";
import Sidebar from "../component/Sidebar";

const API_URL = "http://localhost:5000/admin/scripts";

const AdminScriptsPage = () => {
  const [headerScript, setHeaderScript] = useState("");
  const [footerScript, setFooterScript] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("usertoken");

  const fetchScripts = async () => {
    try {
      setLoading(true);

      const res = await axios.get(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = res.data?.data;

      setHeaderScript(data?.headerScript || "");
      setFooterScript(data?.footerScript || "");
    } catch (error) {
      toast.error("Failed to load scripts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScripts();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);

      await axios.put(
        API_URL,
        {
          headerScript,
          footerScript,
          isActive: true,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Scripts saved successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save scripts");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setHeaderScript("");
    setFooterScript("");
  };

  return (
    <div className="flex min-h-screen bg-[#f4f7fc] text-slate-700">
      <Sidebar />

      <div className="flex-1 flex flex-col ">
        <main className="flex-1 p-6 lg:p-8 max-w-[1200px] w-full mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div>
              <h1 className="text-xl font-semibold text-slate-950">
                Scripts Manager
              </h1>
              <p className="mt-1 text-xs text-slate-400">
                Add scripts for header or footer without changing code manually.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleReset}
                disabled={saving || loading}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FiRefreshCw className="h-3.5 w-3.5" />
                Reset
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving || loading}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <FiSave className="h-3.5 w-3.5" />
                {saving ? "Saving..." : "Save Scripts"}
              </button>
            </div>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
              Loading scripts...
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <ScriptBox
                title="Header Script"
                description="Scripts added here will be rendered inside document head."
                value={headerScript}
                onChange={setHeaderScript}
                placeholder={`<!-- Example: Google Analytics, Clarity, Meta Pixel -->\n<script>\n  console.log("Header script");\n</script>`}
              />

              <ScriptBox
                title="Footer Script"
                description="Scripts added here will be rendered before closing body."
                value={footerScript}
                onChange={setFooterScript}
                placeholder={`<!-- Example: Tawk.to, chatbot widgets, tracking scripts -->\n<script>\n  console.log("Footer script");\n</script>`}
              />
            </div>
          )}

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-6 text-amber-800">
            <strong>Important:</strong> This page must be accessible to admins
            only. Scripts can be dangerous, so role-based authorization must be
            enforced on the backend before saving or loading any script.
          </div>
        </main>
      </div>
    </div>
  );
};

const ScriptBox = ({ title, description, value, onChange, placeholder }) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-start gap-3 border-b border-slate-100 p-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
          <FiCode className="h-4 w-4" />
        </div>

        <div>
          <h2 className="text-sm font-semibold text-slate-950">{title}</h2>
          <p className="mt-1 text-xs text-slate-400">{description}</p>
        </div>
      </div>

      <div className="p-5">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          spellCheck={false}
          className="min-h-[320px] w-full resize-y rounded-xl border border-slate-200 bg-slate-950 p-4 font-mono text-xs leading-6 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
        />
      </div>
    </div>
  );
};

export default AdminScriptsPage;

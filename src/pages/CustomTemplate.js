import React, { useState, useEffect, useRef } from "react";
import Sidebar from "../component/Sidebar";
import axios from "axios";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "../component/UserContext";
import { Sparkles, Zap, X, CheckCircle2, BoltIcon, Layout } from "lucide-react";

export default function Template() {
  const location = useLocation();
  const { user } = useContext(UserContext);

  const plan = user?.subscription?.plan || "free";
  const isPro = plan === "pro";

  const [aiEnabled, setAiEnabled] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  useEffect(() => {
    if (user?.Ai !== undefined) {
      setAiEnabled(user.Ai);
    }
  }, [user]);
  const aiBlockToast = () =>
    toast.error(
      "Auto response is enabled. Switch to manual mode to edit templates.",
    );

  const [templates, setTemplates] = useState([]);
  const urlParams = new URLSearchParams(location.search);

  const viewType = urlParams.get("view"); // e.g. "Initial Email" or "First Follow-up"
  const [filteredTemplates, setFilteredTemplates] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [platform, setPlatform] = useState("");
  const [service, setService] = useState("");
  const [content, setContent] = useState("");
  const [sequenceType, setSequenceType] = useState("");
  const [conditions, setConditions] = useState([
    { field: "subject", operator: "contains", value: "" },
  ]);
  const [globalActive, setGlobalActive] = useState(false);
  const quillRef = useRef(null);

  const navigate = useNavigate();

  // 🟣 Extract ?service= param from URL
  const [selectedServiceFilter, setSelectedServiceFilter] = useState(
    urlParams.get("service") || "All",
  );

  // 🟢 Fetch Templates
  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem("userid");
      const res = await axios.get(
        "http://localhost:5000/template/all/custom",
        {
          params: { userId },
        },
      );

      setTemplates(res.data);
      setFilteredTemplates(res.data);
      const otherTemplates = res.data.filter((t) => t.platform === "other");

      const hasActive = otherTemplates.some((t) => t.active === true);

      setGlobalActive(hasActive);
    } catch (err) {
      toast.error("Failed to fetch templates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);
  const [selectedSequenceFilter, setSelectedSequenceFilter] = useState("All");

  // 🟢 Filter Templates whenever dropdown changes

  const groupedTemplates = filteredTemplates.reduce((acc, tpl) => {
    if (!acc[tpl.service]) acc[tpl.service] = [];
    acc[tpl.service].push(tpl);
    return acc;
  }, {});

  const insertField = (placeholder) => {
    const editor = quillRef.current.getEditor();
    const range = editor.getSelection();
    if (range) {
      editor.insertText(range.index, placeholder);
      editor.setSelection(range.index + placeholder.length);
    } else {
      editor.insertText(editor.getLength(), placeholder);
    }
  };

  const handleEdit = (template) => {
    setEditingId(template._id);
    setPlatform(template.platform);
    setService(template.service || "");
    setConditions(
      template.conditions?.length > 0
        ? template.conditions
        : [{ field: "subject", operator: "contains", value: "" }],
    );
    setContent(template.content);
    setIsDrawerOpen(true);
  };

  const handleSaveTemplate = async () => {
    try {
      const userId = localStorage.getItem("userid");
      const payload = { userId, platform, service, conditions, content };

      if (editingId) {
        await axios.put(
          `http://localhost:5000/template/update/${editingId}`,
          payload,
        );
        toast.success("Template updated successfully!");
      } else {
        await axios.post(
          "http://localhost:5000/template/create",
          payload,
        );
        toast.success("Template created successfully!");
      }

      setIsDrawerOpen(false);
      setEditingId(null);
      setPlatform("");
      setService("");
      setConditions([{ field: "subject", operator: "contains", value: "" }]);
      setContent("");
      fetchTemplates();
    } catch (err) {
      toast.error("Failed to save template");
    }
  };

  const handleToggle = async (id, currentStatus) => {
    const template = templates.find((tpl) => tpl._id === id);

    setTemplates((prev) =>
      prev.map((tpl) =>
        tpl._id === id ? { ...tpl, active: !currentStatus } : tpl,
      ),
    );

    try {
      await axios.put(
        `http://localhost:5000/template/update/${id}`,
        {
          active: !currentStatus,
        },
      );
      toast.success(
        `Template ${!currentStatus ? "activated" : "deactivated"} successfully`,
      );
      fetchTemplates();
    } catch (err) {
      setTemplates((prev) =>
        prev.map((tpl) =>
          tpl._id === id ? { ...tpl, active: currentStatus } : tpl,
        ),
      );
      toast.error("Failed to toggle template status");
    }
  };
  const [deleteId, setDeleteId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const openDeleteConfirm = (id) => {
    setDeleteId(id);
    setShowDeleteConfirm(true);
  };
  const handleDeleteTemplate = async () => {
    try {
      await axios.delete(
        `http://localhost:5000/template/delete/${deleteId}`,
      );

      toast.success("Template deleted!");

      setShowDeleteConfirm(false);
      setDeleteId(null);

      fetchTemplates(); // Refresh list
    } catch (err) {
      toast.error("Failed to delete template");
    }
  };

  const handleGlobalToggle = async () => {
    try {
      const userId = localStorage.getItem("userid");
      const res = await axios.patch(
        "http://localhost:5000/template/templatestatus/all/other",
        { userId },
      );
      if (res.data.success) {
        const newStatus = res.data.toggledTo;
        setGlobalActive(newStatus);
        toast.success(
          newStatus ? "All templates activated" : "All templates deactivated",
        );
        fetchTemplates();
      } else {
        toast.error(res.data.message || "Failed to update all templates");
      }
    } catch (err) {
      toast.error("Error updating all templates");
    }
  };

  const Loader = () => (
    <div className="flex flex-col justify-center items-center py-10">
      <svg
        className="animate-spin h-8 w-8 text-purple-600 mb-2"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      <p className="text-sm text-purple-600 font-medium">
        Loading templates...
      </p>
    </div>
  );

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 min-h-screen bg-gray-50 lg:ml-64">
        <header className="flex flex-col md:flex-row md:items-center justify-between px-4 py-1 bg-white border-b border-gray-100 shadow-sm gap-4">
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex w-12 h-12 bg-indigo-50 rounded-xl items-center justify-center text-indigo-600">
              <Layout size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                Service Templates
              </h1>
              <p className="text-sm text-gray-500 mt-0.5 max-w-xs sm:max-w-none">
                Manage and automate your Shopify service communication
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-2xl border">
            {/* AI TOGGLE */}
            <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-xl shadow-sm border">
              <div className="flex items-center gap-2">
                <Sparkles
                  size={16}
                  className={aiEnabled ? "text-indigo-500" : "text-gray-400"}
                />
                <span className="text-sm font-semibold text-gray-700">
                  Auto Response
                </span>

                {!isPro && (
                  <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-bold">
                    AWESOME
                  </span>
                )}
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={aiEnabled}
                  onChange={async () => {
                    if (!isPro) {
                      setShowUpgradeModal(true);
                      return;
                    }

                    const userId = localStorage.getItem("userid");
                    const newValue = !aiEnabled;
                    setAiEnabled(newValue);

                    try {
                      await axios.patch(
                        "http://localhost:5000/auth/user/ai",
                        { userId, enabled: newValue },
                      );
                      toast.success(
                        newValue
                          ? "Auto Response Active"
                          : "Auto Response Paused",
                      );
                    } catch {
                      setAiEnabled(!newValue);
                      toast.error("Sync failed");
                    }
                  }}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-gray-200 rounded-full peer-checked:bg-indigo-600 after:absolute after:top-[2px] after:left-[2px] after:h-4 after:w-4 after:bg-white after:rounded-full peer-checked:after:translate-x-5 transition-all"></div>
              </label>
            </div>

            {/* GLOBAL TOGGLE */}
            <div className="flex items-center gap-3 px-4 py-2">
              <Zap
                size={16}
                className={globalActive ? "text-amber-500" : "text-gray-400"}
              />
              <span className="text-sm font-semibold text-gray-700">
                Global Status
              </span>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={globalActive}
                  onChange={() => {
                    if (aiEnabled) return aiBlockToast();
                    handleGlobalToggle();
                  }}
                  className="sr-only peer"
                />
                <div
                  className={`w-10 h-5 rounded-full ${
                    aiEnabled
                      ? "bg-gray-200"
                      : globalActive
                        ? "bg-green-500"
                        : "bg-gray-300"
                  } after:absolute after:top-[2px] after:left-[2px] after:h-4 after:w-4 after:bg-white after:rounded-full ${globalActive && !aiEnabled ? "after:translate-x-5" : ""}`}
                ></div>
              </label>
            </div>
          </div>
        </header>

        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center sm:justify-between px-4 sm:px-8 py-4 bg-white border-b gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 gap-2">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                Filter by Service:
              </label>
              <select
                value={selectedServiceFilter}
                onChange={(e) => setSelectedServiceFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-purple-500 w-36 sm:w-40"
              >
                <option value="All">All Services</option>
                {[
                  ...new Set(templates.map((t) => t.service).filter(Boolean)),
                ].map((srv) => (
                  <option key={srv} value={srv}>
                    {srv}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {viewType && (
            <div className="bg-indigo-50 px-4 py-2 rounded-md text-sm text-indigo-700 border border-indigo-200 w-full sm:w-auto text-center sm:text-left">
              Viewing all <b>{viewType}</b> templates
              <button
                onClick={() => navigate("/templates")}
                className="ml-2 text-indigo-600 underline hover:text-indigo-800"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        <main className="container mx-auto p-4 sm:p-6 lg:p-8">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            {/* ================= DESKTOP TABLE ================= */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="min-w-full border-collapse text-sm">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    {["Label", "Template", "Status", "Action"].map((h) => (
                      <th
                        key={h}
                        className="p-3 text-left text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="text-center">
                        <Loader />
                      </td>
                    </tr>
                  ) : Object.keys(groupedTemplates).length > 0 ? (
                    Object.entries(groupedTemplates).map(([srv, group]) => (
                      <React.Fragment key={srv}>
                        <tr className="bg-gray-100">
                          <td
                            colSpan="5"
                            className="p-3 font-semibold text-gray-800"
                          >
                            {srv}
                          </td>
                        </tr>

                        {group.map((t) => (
                          <tr
                            key={t._id}
                            className={`border-b transition ${
                              aiEnabled ? "bg-gray-50" : "hover:bg-gray-50"
                            }`}
                            onClick={() => aiEnabled && aiBlockToast()}
                          >
                            <td className="p-3 text-sm">{t.name}</td>

                            {/* TEMPLATE COLUMN */}
                            <td className="p-3 text-sm max-w-[220px]">
                              {aiEnabled ? (
                                <span className="inline-flex items-center gap-2 text-indigo-600 font-semibold">
                                  <BoltIcon className="w-4 h-4" />
                                  Auto Reply
                                  <span className="text-xs text-gray-500">
                                    (AI Enabled)
                                  </span>
                                </span>
                              ) : (
                                <span className="text-gray-600 truncate block">
                                  {t.content
                                    .replace(/<[^>]+>/g, "")
                                    .slice(0, 80)}
                                  ...
                                </span>
                              )}
                            </td>

                            {/* STATUS */}
                            <td className="p-3 text-center">
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={t.active}
                                  disabled={aiEnabled}
                                  onChange={() => {
                                    if (aiEnabled) return aiBlockToast();
                                    handleToggle(t._id, t.active);
                                  }}
                                  className="sr-only peer"
                                />
                                <div
                                  className={`w-11 h-6 rounded-full transition-colors ${
                                    aiEnabled
                                      ? "bg-gray-200"
                                      : "bg-gray-300 peer-checked:bg-green-500"
                                  }`}
                                ></div>
                                <div
                                  className={`absolute left-[2px] top-[2px] w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
                                    !aiEnabled && t.active
                                      ? "translate-x-5"
                                      : ""
                                  }`}
                                ></div>
                              </label>
                            </td>

                            {/* ACTIONS */}
                            <td className="p-3 flex gap-3">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (aiEnabled) return aiBlockToast();
                                  handleEdit(t);
                                }}
                                className={`text-sm font-medium ${
                                  aiEnabled
                                    ? "text-gray-400"
                                    : "text-indigo-600 hover:underline"
                                }`}
                              >
                                Edit
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (aiEnabled) return aiBlockToast();
                                  openDeleteConfirm(t._id);
                                }}
                                className={`text-sm font-medium ${
                                  aiEnabled
                                    ? "text-gray-400"
                                    : "text-red-600 hover:underline"
                                }`}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        className="p-6 text-center text-gray-500 text-sm"
                      >
                        No templates found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* ================= MOBILE VIEW ================= */}
            <div className="block sm:hidden divide-y divide-gray-200">
              {loading ? (
                <Loader />
              ) : Object.keys(groupedTemplates).length > 0 ? (
                Object.entries(groupedTemplates).map(([srv, group]) => (
                  <div key={srv} className="bg-gray-50">
                    <h3 className="px-4 py-2 font-semibold text-gray-800 text-sm bg-gray-100 border-b">
                      {srv}
                    </h3>

                    {group.map((t) => (
                      <div
                        key={t._id}
                        className={`p-4 bg-white border-b ${
                          aiEnabled ? "opacity-70" : "hover:bg-gray-50"
                        }`}
                        onClick={() => aiEnabled && aiBlockToast()}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-semibold text-gray-900 text-sm">
                            {t.name}
                          </h4>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (aiEnabled) return aiBlockToast();
                              handleEdit(t);
                            }}
                            className={`text-xs font-medium ${
                              aiEnabled
                                ? "text-gray-400"
                                : "text-indigo-600 hover:underline"
                            }`}
                          >
                            Edit
                          </button>
                        </div>

                        <p className="text-xs text-gray-600 mb-2">
                          {aiEnabled ? (
                            <span className="text-indigo-600 font-semibold">
                              ⚡ Auto Reply (AI Enabled)
                            </span>
                          ) : (
                            <>
                              {t.content.replace(/<[^>]+>/g, "").slice(0, 100)}
                              ...
                            </>
                          )}
                        </p>

                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500 font-medium">
                            {t.active ? "Active" : "Inactive"}
                          </span>

                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={t.active}
                              disabled={aiEnabled}
                              onChange={() => {
                                if (aiEnabled) return aiBlockToast();
                                handleToggle(t._id, t.active);
                              }}
                              className="sr-only peer"
                            />
                            <div className="w-10 h-5 bg-gray-300 rounded-full peer-checked:bg-green-500"></div>
                            <div className="absolute left-[2px] top-[2px] w-4 h-4 bg-white rounded-full shadow-md transition-transform peer-checked:translate-x-5"></div>
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-gray-500 text-sm">
                  No templates found
                </div>
              )}
            </div>
          </div>
        </main>

        <div className="fixed inset-0 z-50 flex pointer-events-none">
          <div
            className={`flex-1 bg-black transition-opacity duration-300 ${
              isDrawerOpen ? "opacity-40 pointer-events-auto" : "opacity-0"
            }`}
            onClick={() => setIsDrawerOpen(false)}
          ></div>

          <div
            className={`w-full sm:max-w-lg lg:max-w-xl bg-white shadow-2xl h-full flex flex-col transform transition-transform duration-300 ease-in-out pointer-events-auto ${
              isDrawerOpen ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="flex justify-between items-center p-4 sm:p-6 border-b">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 truncate">
                {editingId ? "Edit Template" : "Create New Template"}
              </h2>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-xl sm:text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Service Request
                </label>
                <input
                  type="text"
                  value={service || "Any (general)"}
                  readOnly
                  className="w-full p-2 sm:p-3 border rounded-lg bg-gray-100 text-gray-700 text-sm sm:text-base"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Sequence Type
                </label>
                <input
                  type="text"
                  value={sequenceType || "-"}
                  readOnly
                  className="w-full p-2 sm:p-3 border rounded-lg bg-gray-100 text-gray-700 text-sm sm:text-base"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template Response
                </label>

                <div className="border rounded-lg overflow-hidden">
                  <ReactQuill
                    ref={quillRef}
                    theme="snow"
                    value={content}
                    onChange={setContent}
                    className="bg-white"
                  />
                </div>

                {/* Insert Fields Section */}
                <div className="mt-4 border rounded-lg bg-gray-50 p-3 sm:p-4">
                  <h3 className="text-sm font-semibold text-gray-600 mb-2">
                    Insert Fields
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: "Full name", placeholder: "{{FullName}}" },
                      {
                        label: "Business email",
                        placeholder: "{{BusinessEmail}}",
                      },
                      { label: "Store name", placeholder: "{{StoreName}}" },
                      { label: "Store URL", placeholder: "{{StoreURL}}" },
                      { label: "Country", placeholder: "{{Country}}" },
                      { label: "Service", placeholder: "{{Service}}" },
                      { label: "Budget", placeholder: "{{Budget}}" },
                      {
                        label: "Problem & Goal",
                        placeholder: "{{ProblemGoal}}",
                      },
                    ].map((field, idx) => (
                      <span
                        key={idx}
                        onClick={() => insertField(field.placeholder)}
                        className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded cursor-pointer hover:bg-purple-200 transition"
                      >
                        {field.label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 sm:p-5 border-t bg-white flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="w-full sm:w-auto px-5 py-2 text-sm font-medium text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTemplate}
                className="w-full sm:w-auto px-5 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
              >
                {editingId ? "Update Template" : "Save Template"}
              </button>
            </div>
          </div>
        </div>
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-[350px] shadow-xl">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                Delete Template?
              </h2>

              <p className="text-gray-600 text-sm mb-4">
                Are you sure you want to delete this template? This action
                cannot be undone.
              </p>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 bg-gray-200 rounded"
                >
                  Cancel
                </button>

                <button
                  onClick={handleDeleteTemplate}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
        {showUpgradeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transition-all transform">
              <div className="h-2 bg-indigo-600 w-full" />

              <button
                onClick={() => setShowUpgradeModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>

              <div className="p-8">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                    <Sparkles className="text-indigo-600" size={32} />
                  </div>

                  <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                    Unlock AI Templates
                  </h2>
                  <p className="mt-3 text-gray-500 leading-relaxed">
                    Take your productivity to the next level. Generate
                    high-converting emails in seconds with our{" "}
                    <strong>Pro AI engine</strong>.
                  </p>
                </div>

                <div className="mt-6 space-y-3">
                  {[
                    "Unlimited AI Generations",
                    "Custom Brand Voice",
                    "Priority Support",
                  ].map((feature) => (
                    <div
                      key={feature}
                      className="flex items-center gap-3 text-sm text-gray-600"
                    >
                      <CheckCircle2 className="text-emerald-500" size={18} />
                      {feature}
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex flex-col gap-3">
                  <button
                    onClick={() => {
                      setShowUpgradeModal(false);
                      navigate("/pricing");
                    }}
                    className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-[0.98]"
                  >
                    Upgrade to Pro
                  </button>

                  <button
                    onClick={() => setShowUpgradeModal(false)}
                    className="w-full py-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    Maybe later
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

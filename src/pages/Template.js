import React, { useState, useEffect, useRef, useContext } from "react";
import AppLayout from "../component/AppLayout";
import axios from "axios";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";
import { UserContext } from "../component/UserContext";
import { BoltIcon, CheckCircle2, Layout, Sparkles, X, Zap } from "lucide-react";
import { FiZap } from "react-icons/fi";

export default function Template() {
  const location = useLocation();
  const { user, setUser: setContextUser } = useContext(UserContext);
  const plan = user?.subscription?.plan || "free";
  const isPro = plan === "pro";
  const [aiLoadingId, setAiLoadingId] = useState(null);
  const [aiEnabled, setAiEnabled] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [templates, setTemplates] = useState([]);
  const urlParams = new URLSearchParams(location.search);

  // AI Replies toggle — with company profile guard
  const [aiActive, setAiActive] = useState(() => user?.Ai ?? user?.subscription?.aiRepliesActive ?? true);
  const [togglingAi, setTogglingAi] = useState(false);

  const handleToggleAiReplies = async () => {
    const targetUserId = localStorage.getItem("userid") || user?._id;
    if (!targetUserId) return;
    const nextStatus = !aiActive;

    // If activating, first check company profile is filled
    if (nextStatus) {
      try {
        const cpRes = await axios.get(`http://localhost:5000/api/company-profile/${targetUserId}`);
        // API returns { success, data: { company: { companyName, businessDescription, ... }, ... } }
        const profileData = cpRes.data?.data || cpRes.data;
        const cp = profileData?.company || profileData;
        const isComplete =
          cp?.companyName && cp.companyName.trim().length > 0 &&
          cp?.businessDescription && cp.businessDescription.trim().length > 0;
        if (!isComplete) {
          toast.error("Please complete your company profile before activating AI replies.", { duration: 4000 });
          navigate("/company-profile");
          return;
        }
      } catch (err) {
        // If the profile check itself fails (network, server error), don't block the user
        // Just log a warning and allow activation to proceed
        console.warn("Could not verify company profile, proceeding anyway:", err?.message);
      }
    }

    setAiActive(nextStatus);
    setTemplates((prev) => prev.map((t) => ({ ...t, aiResponse: nextStatus })));
    try {
      setTogglingAi(true);
      const res = await axios.post(
        `http://localhost:5000/auth/toggle-ai-replies/${targetUserId}`,
        { enabled: nextStatus, userId: targetUserId }
      );
      await axios.patch("http://localhost:5000/template/ai-toggle-all", {
        userId: targetUserId,
        platform: "shopify",
        aiResponse: nextStatus,
      });
      if (res.data?.user && setContextUser) setContextUser(res.data.user);
      toast.success(nextStatus ? "AI Replies activated on all templates!" : "AI Replies paused on all templates.");
    } catch (err) {
      setAiActive(!nextStatus);
      fetchTemplates();
      toast.error("Failed to update AI replies status.");
    } finally {
      setTogglingAi(false);
    }
  };

  const viewType = urlParams.get("view");
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

  const [selectedServiceFilter, setSelectedServiceFilter] = useState(
    urlParams.get("service") || "All",
  );

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem("userid");
      const res = await axios.get(
        "http://localhost:5000/template/all",
        {
          params: { userId },
        },
      );

      setTemplates(res.data);
      setFilteredTemplates(res.data);
      const nonGeneral = res.data.filter(
        (t) => t.service?.toLowerCase() !== "general",
      );
      const allActive =
        nonGeneral.length > 0 && nonGeneral.every((t) => t.active);
      setGlobalActive(allActive);
    } catch (err) {
      toast.error("Failed to fetch templates");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTemplateAi = async (templateId, currentStatus) => {
    const nextStatus = !currentStatus;
    setTemplates((prev) =>
      prev.map((t) => (t._id === templateId ? { ...t, aiResponse: nextStatus } : t))
    );
    try {
      await axios.patch(`http://localhost:5000/template/ai-toggle/${templateId}`, {
        aiResponse: nextStatus,
      });
      toast.success(nextStatus ? "AI Response enabled for template!" : "Switched to Fixed Template.");
    } catch (err) {
      setTemplates((prev) =>
        prev.map((t) => (t._id === templateId ? { ...t, aiResponse: currentStatus } : t))
      );
      toast.error("Failed to update template AI status.");
    }
  };

  const handleBulkToggleAi = async (enableAll) => {
    const userId = localStorage.getItem("userid") || user?._id;
    if (!userId) return;
    setTemplates((prev) => prev.map((t) => ({ ...t, aiResponse: enableAll })));
    try {
      await axios.patch("http://localhost:5000/template/ai-toggle-all", {
        userId,
        platform: "shopify",
        aiResponse: enableAll,
      });
      toast.success(enableAll ? "AI Response enabled on ALL Shopify templates!" : "Disabled AI response on all templates.");
    } catch (err) {
      fetchTemplates();
      toast.error("Failed to bulk update templates AI status.");
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);
  const [selectedSequenceFilter, setSelectedSequenceFilter] = useState("All");

  useEffect(() => {
    let filtered = [...templates];

    if (viewType) {
      const lowerView = viewType.toLowerCase();

      filtered = filtered.filter((t) => {
        const name = t.name?.toLowerCase() || "";
        if (lowerView.includes("initial")) return name.includes("initial");
        if (lowerView.includes("first")) return name.includes("first");
        if (lowerView.includes("second")) return name.includes("second");
        return false;
      });
    }

    if (selectedServiceFilter !== "All") {
      filtered = filtered.filter(
        (t) => t.service?.toLowerCase() === selectedServiceFilter.toLowerCase(),
      );
    }

    if (selectedSequenceFilter !== "All") {
      filtered = filtered.filter(
        (t) => formatSequenceName(t.name) === selectedSequenceFilter,
      );
    }

    setFilteredTemplates(filtered);

    if (!viewType) {
      if (selectedServiceFilter === "All") {
        navigate("/templates");
      } else {
        navigate(
          `/templates?service=${encodeURIComponent(selectedServiceFilter)}`,
        );
      }
    }
  }, [selectedServiceFilter, selectedSequenceFilter, templates, viewType]);

  const formatSequenceName = (name = "") => {
    const lower = name.toLowerCase();
    if (lower.includes("initial")) return "Initial Email";
    if (lower.includes("first")) return "First Follow-Up";
    if (lower.includes("second")) return "Second Follow-Up";
    return name;
  };

  const groupedTemplates = filteredTemplates.reduce((acc, tpl) => {
    if (!acc[tpl.service]) acc[tpl.service] = [];
    acc[tpl.service].push(tpl);
    return acc;
  }, {});

  const insertField = (placeholder) => {
    const editor = quillRef.current?.getEditor();
    if (!editor) return;

    editor.focus();

    const range = editor.getSelection(true);

    const index = range
      ? range.index
      : Math.max(editor.getLength() - 1, 0);

    editor.insertText(index, placeholder, "user");
    editor.setSelection(index + placeholder.length, 0, "user");
  };

  const handleEdit = (template) => {
    setEditingId(template._id);
    setPlatform(template.platform);
    setService(template.service || "");
    setSequenceType(formatSequenceName(template.name) || "-");
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
    if (template?.service?.toLowerCase() === "general" && currentStatus) {
      toast.error("You cannot deactivate General templates.");
      return;
    }

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
    } catch (err) {
      setTemplates((prev) =>
        prev.map((tpl) =>
          tpl._id === id ? { ...tpl, active: currentStatus } : tpl,
        ),
      );
      toast.error("Failed to toggle template status");
    }
  };

  const handleGlobalToggle = async () => {
    try {
      const userId = localStorage.getItem("userid");
      const res = await axios.patch(
        "http://localhost:5000/template/templatestatus/all",
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
    <div className="flex flex-col justify-center items-center py-12">
      <svg
        className="animate-spin h-7 w-7 text-slate-900 mb-2"
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
      <p className="text-xs text-slate-600 font-semibold">
        Loading templates...
      </p>
    </div>
  );

  useEffect(() => {
    if (user?.Ai !== undefined) {
      setAiEnabled(user.Ai);
    }
  }, [user]);

  const aiBlockToast = () =>
    toast.error(
      "Auto response is enabled. Switch to manual mode to edit templates.",
    );
  return (
    <AppLayout>
      <div className="w-full flex-1 min-w-0 h-full overflow-y-auto bg-[#FAF8F5]">
        {/* Sticky header: status bar + filter bar */}
        <div className="sticky top-0 z-20">
        {/* Main Header */}
       <div className="border-b border-gray-200 bg-white">
        <div className="flex min-h-[30px] items-center justify-between gap-4 px-6 text-[11px] text-gray-500">
          <div className="flex min-w-0 items-center divide-x divide-gray-200">
            <div className="flex items-center gap-1.5 pr-4 font-medium text-green-700">
              <span className="relative flex h-3 w-3 items-center justify-center">
                <span className="absolute h-3 w-3 rounded-full bg-green-200" />
                <span className="relative h-2 w-2 rounded-full bg-green-500" />
              </span>

              <span>All systems live</span>
            </div>

            <div className="hidden px-4 sm:block">
              Shopify Templates
              {/* {user?.email ? ` · ${user.email}` : ""} */}
            </div>

            <div className="hidden px-4 md:block">
              {/* Filter matched {stats?.processed || 0} leads today */}
            </div>

            <div className="hidden px-4 lg:block">
              Manage and automate your shopify service communication.
            </div>
          </div>

         
        </div>
      </div>
        {/* Filter Bar & Controls */}
        <div className="border-b border-gray-200 bg-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-6 py-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-slate-700 whitespace-nowrap">
                  Filter by Service:
                </label>
                <select
                  value={selectedServiceFilter}
                  onChange={(e) => setSelectedServiceFilter(e.target.value)}
                  className="border border-slate-300 rounded-[8px] px-3 py-1.5 text-xs font-semibold text-slate-800 bg-white focus:border-slate-800 outline-none shadow-2xs w-40 transition"
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

              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-slate-700 whitespace-nowrap">
                  Filter by Sequence:
                </label>
                <select
                  value={selectedSequenceFilter}
                  onChange={(e) => setSelectedSequenceFilter(e.target.value)}
                  className="border border-slate-300 rounded-[8px] px-3 py-1.5 text-xs font-semibold text-slate-800 bg-white focus:border-slate-800 outline-none shadow-2xs w-44 transition"
                >
                  <option value="All">All Sequences</option>
                  {[
                    ...new Set(
                      templates
                        .map((t) => formatSequenceName(t.name))
                        .filter(Boolean)
                    ),
                  ].map((seq) => (
                    <option key={seq} value={seq}>
                      {seq}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              {/* AI Replies Toggle */}
              <button
                type="button"
                onClick={handleToggleAiReplies}
                disabled={togglingAi}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-[10px] border text-xs font-bold transition cursor-pointer shadow-2xs ${
                  aiActive
                    ? "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100"
                    : "bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200"
                }`}
                title={aiActive ? "AI Replies are ACTIVE — click to pause" : "AI Replies are PAUSED — click to activate"}
              >
                <span className={`h-2 w-2 rounded-full ${aiActive ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
                <FiZap size={13} className={aiActive ? "text-emerald-700" : "text-slate-500"} />
                <span>{aiActive ? "AI Replies: Active" : "AI Replies: Paused"}</span>
              </button>

              {/* Template Status */}
              <div className="flex items-center gap-3 px-3.5 py-1.5 bg-slate-50 rounded-[10px] border border-slate-200">
                <div className="flex items-center gap-1.5">
                  <Zap
                    size={15}
                    className={globalActive ? "text-emerald-600 fill-emerald-100" : "text-slate-400"}
                  />
                  <span className="text-xs font-bold text-slate-800 whitespace-nowrap">
                    Template Status
                  </span>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={globalActive}
                    onChange={() => {
                      if (aiEnabled) {
                        aiBlockToast();
                        return;
                      }
                      handleGlobalToggle();
                    }}
                    className="sr-only peer"
                  />
                  <div
                    className={`w-9 h-5 rounded-full transition-all duration-300 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all
                      ${aiEnabled
                        ? "bg-slate-200"
                        : globalActive
                          ? "bg-emerald-600 peer-checked:after:translate-x-4"
                          : "bg-slate-300"
                      }
                    `}
                  ></div>
                </label>
              </div>
            </div>
          </div>

          {viewType && (
            <div className="mt-3 bg-emerald-50 px-4 py-2 rounded-[8px] text-xs font-medium text-emerald-900 border border-emerald-200 flex items-center justify-between">
              <span>Viewing all <strong>{viewType}</strong> templates</span>
              <button
                onClick={() => navigate("/templates")}
                className="text-emerald-700 font-bold underline hover:text-emerald-900 cursor-pointer"
              >
                Clear Filter
              </button>
            </div>
          )}
        </div>
        </div>{/* end sticky */}

        {/* Content Table */}
        <main className="px-4 sm:px-6 lg:px-8 pb-12 mt-4">
          <div className="bg-white rounded-[12px] border border-slate-200 shadow-2xs overflow-hidden">
            <div className="hidden sm:block overflow-x-auto">
              <table className="min-w-full border-collapse text-xs">
                <thead className="bg-[#111110] text-white">
                  <tr>
                    {[
                      "Service Request",
                      "Sequence Type",
                      "Template Preview",
                      "Status",
                      "Action",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="text-center">
                        <Loader />
                      </td>
                    </tr>
                  ) : Object.keys(groupedTemplates).length > 0 ? (
                    Object.entries(groupedTemplates).map(([srv, group]) => (
                      <React.Fragment key={srv}>
                        <tr className="bg-slate-100/90 border-t border-b border-slate-200">
                          <td
                            colSpan="5"
                            className="px-4 py-2.5 font-bold text-slate-900 text-xs tracking-tight"
                          >
                            {srv}
                          </td>
                        </tr>

                        {group.map((t) => (
                          <tr
                            key={t._id}
                            className={`transition ${
                              aiEnabled ? "bg-slate-50/50" : "hover:bg-slate-50/80"
                            }`}
                            onClick={() => {
                              if (aiEnabled) {
                                aiBlockToast();
                              }
                            }}
                          >
                            <td className="px-4 py-3 text-xs font-semibold text-slate-800">
                              {t.service}
                            </td>

                            <td className="px-4 py-3 text-xs font-semibold text-slate-800">
                              {formatSequenceName(t.name)}
                            </td>

                            <td className="px-4 py-3 text-xs max-w-[280px]">
                              <div className="flex flex-col gap-1.5 items-start">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleTemplateAi(t._id, t.aiResponse !== false);
                                  }}
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition cursor-pointer shadow-2xs ${
                                    t.aiResponse !== false
                                      ? "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100"
                                      : "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200"
                                  }`}
                                  title="Click to toggle AI response for this specific template"
                                >
                                  <BoltIcon className={`w-3.5 h-3.5 ${t.aiResponse !== false ? "text-emerald-600 fill-emerald-100" : "text-slate-400"}`} />
                                  <span>{t.aiResponse !== false ? "Auto Reply (AI Enabled)" : "Fixed Template"}</span>
                                </button>

                                <span className="text-slate-500 text-[11px] font-normal truncate block max-w-[250px]">
                                  {(t.content || "").replace(/<[^>]+>/g, "").slice(0, 65)}...
                                </span>
                              </div>
                            </td>

                            <td className="px-4 py-3 text-center">
                              <label
                                className={`relative inline-flex items-center ${
                                  t.aiResponse !== false || aiEnabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                                }`}
                                title={
                                  t.aiResponse !== false
                                    ? "Status toggle is inactive while Auto Reply (AI) is enabled."
                                    : "Toggle template active status"
                                }
                              >
                                <input
                                  type="checkbox"
                                  checked={t.aiResponse !== false ? false : t.active}
                                  disabled={t.aiResponse !== false || aiEnabled}
                                  onChange={() => {
                                    if (t.aiResponse !== false) {
                                      toast.error("Auto Reply (AI) is active on this template. Switch to Fixed Template mode to change status.");
                                      return;
                                    }
                                    if (aiEnabled) {
                                      aiBlockToast();
                                      return;
                                    }
                                    handleToggle(t._id, t.active);
                                  }}
                                  className="sr-only peer"
                                />

                                <div
                                  className={`w-9 h-5 rounded-full transition-colors ${
                                    t.aiResponse !== false || aiEnabled
                                      ? "bg-slate-200"
                                      : "bg-slate-300 peer-checked:bg-emerald-600"
                                  }`}
                                ></div>

                                <div
                                  className={`absolute left-[2px] top-[2px] w-4 h-4 bg-white rounded-full shadow-xs transition-transform ${
                                    t.aiResponse === false && !aiEnabled && t.active ? "translate-x-4" : ""
                                  }`}
                                ></div>
                              </label>
                            </td>

                            <td className="px-4 py-3">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (aiEnabled) {
                                    aiBlockToast();
                                    return;
                                  }
                                  handleEdit(t);
                                }}
                                className={`text-xs font-bold transition cursor-pointer ${
                                  aiEnabled
                                    ? "text-slate-400"
                                    : "text-slate-900 hover:text-emerald-700 underline"
                                }`}
                              >
                                Edit
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
                        className="p-8 text-center text-slate-500 text-xs font-medium"
                      >
                        No templates found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile View */}
            <div className="block sm:hidden divide-y divide-slate-200">
              {loading ? (
                <Loader />
              ) : Object.keys(groupedTemplates).length > 0 ? (
                Object.entries(groupedTemplates).map(([srv, group]) => (
                  <div key={srv} className="bg-slate-50">
                    <h3 className="px-4 py-2.5 font-bold text-slate-900 text-xs bg-slate-100 border-b border-slate-200">
                      {srv}
                    </h3>

                    {group.map((t) => (
                      <div
                        key={t._id}
                        className="p-4 bg-white border-b border-slate-100 hover:bg-slate-50 transition"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-bold text-slate-900 text-xs">
                            {formatSequenceName(t.name)}
                          </h4>
                          <button
                            type="button"
                            onClick={() => handleEdit(t)}
                            className="text-slate-900 text-xs font-bold hover:underline cursor-pointer"
                          >
                            Edit
                          </button>
                        </div>

                        <p className="text-xs text-slate-500 mb-2">
                          <span className="font-bold text-slate-700">
                            Service:
                          </span>{" "}
                          {t.service || "N/A"}
                        </p>

                        <p className="text-xs text-slate-600 line-clamp-2 mb-3 font-normal">
                          {t.content.replace(/<[^>]+>/g, "").slice(0, 100)}...
                        </p>

                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-500 font-bold">
                            {t.active ? "Active" : "Inactive"}
                          </span>

                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={t.active}
                              onChange={() => handleToggle(t._id, t.active)}
                              className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-slate-300 rounded-full peer-checked:bg-emerald-600 transition-colors"></div>
                            <div className="absolute left-[2px] top-[2px] w-4 h-4 bg-white rounded-full shadow-xs transition-transform peer-checked:translate-x-4"></div>
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-500 text-xs font-medium">
                  No templates found
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Drawer Side Modal */}
        <div className="fixed inset-0 z-50 flex pointer-events-none">
          <div
            className={`flex-1 bg-black/50 backdrop-blur-xs transition-opacity duration-300 ${
              isDrawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0"
            }`}
            onClick={() => setIsDrawerOpen(false)}
          ></div>

          <div
            className={`w-full sm:max-w-lg lg:max-w-xl bg-white shadow-2xl h-full flex flex-col transform transition-transform duration-300 ease-in-out pointer-events-auto ${
              isDrawerOpen ? "translate-x-0" : "translate-x-full"
            }`}
          >
            {/* Drawer Dark Header Bar */}
            <div className="flex justify-between items-center px-6 py-4 bg-[#111110] text-white shrink-0">
              <div>
                <h2 className="text-base font-bold text-white">
                  {editingId ? "Edit Template" : "Create New Template"}
                </h2>
                <p className="text-xs text-slate-300 mt-0.5 font-normal">
                  Customize automated email template response content
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="text-slate-400 hover:text-white transition p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Service Request
                </label>
                <input
                  type="text"
                  value={service || "Any (general)"}
                  readOnly
                  className="w-full p-3 border border-slate-200 rounded-[8px] bg-slate-100/80 text-slate-700 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Sequence Type
                </label>
                <input
                  type="text"
                  value={sequenceType || "-"}
                  readOnly
                  className="w-full p-3 border border-slate-200 rounded-[8px] bg-slate-100/80 text-slate-700 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-2">
                  Template Response Body
                </label>

                <div className="border border-slate-300 rounded-[8px] overflow-hidden shadow-2xs">
                  <ReactQuill
                    ref={quillRef}
                    theme="snow"
                    value={content}
                    onChange={setContent}
                    className="bg-white"
                  />
                </div>

                <div className="mt-4 border border-slate-200 rounded-[10px] bg-slate-50/80 p-4 shadow-2xs">
                  <h3 className="text-xs font-bold text-slate-900 mb-2.5">
                    Insert Field Variables
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
                      <button
                        key={idx}
                        type="button"
                        onClick={() => insertField(field.placeholder)}
                        className="px-2.5 py-1 bg-white text-slate-800 text-xs font-bold rounded-[6px] border border-slate-300 hover:bg-slate-100 hover:border-slate-400 transition cursor-pointer shadow-2xs"
                      >
                        {field.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-slate-200 bg-slate-50 flex justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="px-5 py-2.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-[8px] hover:bg-slate-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveTemplate}
                className="px-5 py-2.5 text-xs font-bold text-white bg-[#111110] hover:bg-black rounded-[8px] transition cursor-pointer shadow-xs"
              >
                {editingId ? "Update Template" : "Save Template"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="relative bg-white rounded-[12px] shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 bg-[#111110] text-white">
              <div className="flex items-center gap-2">
                <Sparkles className="text-emerald-400" size={20} />
                <h2 className="text-base font-bold text-white">
                  Unlock AI Templates
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowUpgradeModal(false)}
                className="text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <p className="text-xs text-slate-600 font-normal leading-relaxed">
                Take your productivity to the next level. Generate high-converting emails in seconds with our <strong>Pro AI engine</strong>.
              </p>

              <div className="mt-5 space-y-2.5">
                {[
                  "Unlimited AI Generations",
                  "Custom Brand Voice",
                  "Priority Support",
                ].map((feature) => (
                  <div
                    key={feature}
                    className="flex items-center gap-2.5 text-xs font-semibold text-slate-800"
                  >
                    <CheckCircle2 className="text-emerald-600 shrink-0" size={16} />
                    {feature}
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setShowUpgradeModal(false);
                    navigate("/pricing");
                  }}
                  className="w-full py-2.5 px-4 bg-[#111110] hover:bg-black text-white font-bold text-xs rounded-[8px] shadow-xs transition cursor-pointer"
                >
                  Upgrade to Pro
                </button>

                <button
                  type="button"
                  onClick={() => setShowUpgradeModal(false)}
                  className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition cursor-pointer"
                >
                  Maybe later
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

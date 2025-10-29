import React, { useState, useEffect, useRef } from "react";
import Sidebar from "../component/Sidebar";
import axios from "axios";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";

export default function Template() {
  const location = useLocation();

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
    urlParams.get("service") || "All"
  );

  // 🟢 Fetch Templates
  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem("userid");
      const res = await axios.get(
        "https://email-syncing-backend.vercel.app/template/all",
        {
          params: { userId },
        }
      );

      setTemplates(res.data);
      setFilteredTemplates(res.data);
      const nonGeneral = res.data.filter(
        (t) => t.service?.toLowerCase() !== "general"
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

  useEffect(() => {
    fetchTemplates();
  }, []);
const [selectedSequenceFilter, setSelectedSequenceFilter] = useState("All");

  // 🟢 Filter Templates whenever dropdown changes
useEffect(() => {
  let filtered = [...templates];

  // 🟣 If "viewType" exists (like Initial Email, First Follow-up, etc.)
  if (viewType) {
    const lowerView = viewType.toLowerCase();

    // Step 1: Filter by sequence (Initial / First / Second)
    filtered = filtered.filter((t) => {
      const name = t.name?.toLowerCase() || "";
      if (lowerView.includes("initial")) return name.includes("initial");
      if (lowerView.includes("first")) return name.includes("first");
      if (lowerView.includes("second")) return name.includes("second");
      return false;
    });

    // Step 2: If user selects a service manually → filter inside same sequence
    if (selectedServiceFilter !== "All") {
      filtered = filtered.filter(
        (t) => t.service?.toLowerCase() === selectedServiceFilter.toLowerCase()
      );
    }

    setFilteredTemplates(filtered);
    return;
  }

  // 🟡 Normal filters (when not viewing a specific sequence)
  if (selectedServiceFilter === "All") {
    setFilteredTemplates(templates);
    navigate("/templates");
  } else {
    filtered = templates.filter(
      (t) => t.service?.toLowerCase() === selectedServiceFilter.toLowerCase()
    );
    setFilteredTemplates(filtered);
    navigate(`/templates?service=${encodeURIComponent(selectedServiceFilter)}`);
  }
}, [selectedServiceFilter, templates, viewType]);



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
    setSequenceType(formatSequenceName(template.name) || "-");
    setConditions(
      template.conditions?.length > 0
        ? template.conditions
        : [{ field: "subject", operator: "contains", value: "" }]
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
          `https://email-syncing-backend.vercel.app/template/update/${editingId}`,
          payload
        );
        toast.success("Template updated successfully!");
      } else {
        await axios.post(
          "https://email-syncing-backend.vercel.app/template/create",
          payload
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
        tpl._id === id ? { ...tpl, active: !currentStatus } : tpl
      )
    );

    try {
      await axios.put(
        `https://email-syncing-backend.vercel.app/template/update/${id}`,
        {
          active: !currentStatus,
        }
      );
      toast.success(
        `Template ${!currentStatus ? "activated" : "deactivated"} successfully`
      );
    } catch (err) {
      setTemplates((prev) =>
        prev.map((tpl) =>
          tpl._id === id ? { ...tpl, active: currentStatus } : tpl
        )
      );
      toast.error("Failed to toggle template status");
    }
  };

  const handleGlobalToggle = async () => {
    try {
      const userId = localStorage.getItem("userid");
      const res = await axios.patch(
        "https://email-syncing-backend.vercel.app/template/templatestatus/all",
        { userId }
      );
      if (res.data.success) {
        const newStatus = res.data.toggledTo;
        setGlobalActive(newStatus);
        toast.success(
          newStatus ? "All templates activated" : "All templates deactivated"
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
        {/* HEADER */}
        <header className="flex items-center justify-between px-8 py-5 bg-white border-b shadow-sm">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800 tracking-tight">
              Service Templates
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage, customize, and activate your Shopify service templates
            </p>
          </div>

          {/* Global Toggle */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">
              All Templates
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={globalActive}
                onChange={handleGlobalToggle}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-green-500 transition-colors"></div>
              <div className="absolute left-[2px] top-[2px] w-5 h-5 bg-white rounded-full shadow-md transition-transform peer-checked:translate-x-5"></div>
            </label>
            <span
              className={`text-xs font-semibold ${
                globalActive ? "text-green-600" : "text-gray-400"
              }`}
            >
              {globalActive ? "ON" : "OFF"}
            </span>
          </div>
        </header>

        {/* FILTER BAR */}
       {/* FILTER BAR */}
<div className="flex flex-wrap items-center justify-between px-8 py-4 bg-white border-b gap-4">
  <div className="flex items-center gap-4 flex-wrap">
    {/* Service Filter */}
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium text-gray-700">
        Filter by Service:
      </label>
      <select
        value={selectedServiceFilter}
        onChange={(e) => setSelectedServiceFilter(e.target.value)}
        className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-purple-500"
      >
        <option value="All">All Services</option>
        {[...new Set(templates.map((t) => t.service).filter(Boolean))].map(
          (srv) => (
            <option key={srv} value={srv}>
              {srv}
            </option>
          )
        )}
      </select>
    </div>

    {/* Sequence Filter */}
    {/* <div className="flex items-center gap-2">
      <label className="text-sm font-medium text-gray-700">
        Filter by Sequence:
      </label>
      <select
        value={selectedSequenceFilter}
        onChange={(e) => setSelectedSequenceFilter(e.target.value)}
        className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-purple-500"
      >
        <option value="All">All Templates</option>
        <option value="Initial Email">Initial Email</option>
        <option value="First Follow-Up">First Follow-Up</option>
        <option value="Second Follow-Up">Second Follow-Up</option>
      </select>
    </div> */}
  </div>

  {viewType && (
    <div className="bg-indigo-50 px-4 py-2 rounded-md text-sm text-indigo-700 border border-indigo-200">
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


        {/* MAIN CONTENT */}
        <main className="container mx-auto p-8">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="w-full border-collapse">
              <thead className="bg-gray-100 border-b">
                <tr>
                  {[
                    "Service Request",
                    "Sequence Type",
                    "Template",
                    "Status",
                    "Action",
                  ].map((h) => (
                    <th
                      key={h}
                      className="p-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wide"
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
                          className="p-3 font-semibold text-gray-800 text-base"
                        >
                          {srv}
                        </td>
                      </tr>

                      {group.map((t) => (
                        <tr
                          key={t._id}
                          className="border-b hover:bg-gray-50 transition"
                        >
                          <td className="p-3 text-sm">{t.service}</td>
                          <td className="p-3 text-sm">
                            {formatSequenceName(t.name)}
                          </td>
                          <td className="p-3 text-sm text-gray-600">
                            {t.content.replace(/<[^>]+>/g, "").slice(0, 80)}...
                          </td>
                          <td className="p-3 text-center">
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={t.active}
                                onChange={() => handleToggle(t._id, t.active)}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-green-500 transition-colors"></div>
                              <div className="absolute left-[2px] top-[2px] w-5 h-5 bg-white rounded-full shadow-md transition-transform peer-checked:translate-x-5"></div>
                            </label>
                          </td>
                          <td className="p-3">
                            <button
                              onClick={() => handleEdit(t)}
                              className="text-blue-600 hover:underline text-sm"
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
                      className="p-6 text-center text-gray-500 text-sm"
                    >
                      No templates found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </main>

        {/* SIDE DRAWER */}
        <div className="fixed inset-0 z-50 flex pointer-events-none">
          <div
            className={`flex-1 bg-black transition-opacity duration-300 ${
              isDrawerOpen ? "opacity-40 pointer-events-auto" : "opacity-0"
            }`}
            onClick={() => setIsDrawerOpen(false)}
          ></div>

          <div
            className={`w-full max-w-xl bg-white shadow-2xl h-full flex flex-col transform transition-transform duration-300 ease-in-out pointer-events-auto ${
              isDrawerOpen ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">
                {editingId ? "Edit Template" : "Create New Template"}
              </h2>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Request
                </label>
                <input
                  type="text"
                  value={service || "Any (general)"}
                  readOnly
                  className="w-full p-2 border rounded-lg bg-gray-100 text-gray-700"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sequence Type
                </label>
                <input
                  type="text"
                  value={sequenceType || "-"}
                  readOnly
                  className="w-full p-2 border rounded-lg bg-gray-100 text-gray-700"
                />
              </div>

              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template Response
                </label>

                <div className="border rounded-lg overflow-hidden">
                  <ReactQuill
                    ref={quillRef}
                    theme="snow"
                    value={content}
                    onChange={setContent}
                    className="bg-white "
                  />
                </div>

                <div className="mt-3 border rounded-lg bg-gray-50 p-3">
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

            <div className="p-4 border-t bg-white flex justify-end gap-3">
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="px-6 py-2 text-sm font-medium text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTemplate}
                className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
              >
                {editingId ? "Update Template" : "Save Template"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect, useRef } from "react";
import Sidebar from "../component/Sidebar";
import axios from "axios";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/solid"; 

const SERVICES = [
  "Troubleshooting",
  "Theme customization",
  "Store build or redesign",
  "Store migration",
  "Website and marketing content",
  "SEO",
  "Site performance and speed",
  "Custom apps and integrations",
  "Store settings configuration",
  "Product and collection setup",
  "Social media marketing",
  "Product descriptions",
  "Search engine advertising",
  "POS setup and migration",
  "Custom domain setup",
  "Conversion rate optimization",
  "Analytics and tracking",
  "Sales channel setup",
  "Logo and visual branding",
  "Business strategy guidance",
  "Website audit and optimization strategy",
  "Sales tax guidance",
  "Product photography",
  "Email marketing",
  "3D modelling",
  "Banner ads",
  "Video and illustrations",
  "Content marketing",
  "Product sourcing guidance",
];

export default function Template() {
  const [templates, setTemplates] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false); 
  const quillRef = useRef(null);

  const [editingId, setEditingId] = useState(null);
  const [platform, setPlatform] = useState("");
  const [service, setService] = useState("");
  const [content, setContent] = useState("");
  const [conditions, setConditions] = useState([
    { field: "subject", operator: "contains", value: "" },
  ]);
  const [sequenceType, setSequenceType] = useState("");

  const [deleteId, setDeleteId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const fetchTemplates = async () => {
    try {
      const userId = localStorage.getItem("userid");
      const res = await axios.get("https://email-syncing-backend.vercel.app/template/all", {
        params: { userId },
      });
      setTemplates(res.data);
    } catch (err) {
      toast.error(" Failed to fetch templates");
    }
  };

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


  useEffect(() => {
    fetchTemplates();
  }, []);

  const addCondition = () =>
    setConditions([
      ...conditions,
      { field: "subject", operator: "contains", value: "" },
    ]);

  const updateCondition = (index, field, value) => {
    const newConditions = [...conditions];
    newConditions[index][field] = value;
    setConditions(newConditions);
  };

  const removeCondition = (index) =>
    setConditions(conditions.filter((_, i) => i !== index));

  const handleEdit = (template) => {
    setEditingId(template._id);
    setPlatform(template.platform);
    setService(template.service || "");
    setSequenceType(template.name || "-"); // 👈 here
    setConditions(
      template.conditions?.length > 0
        ? template.conditions
        : [{ field: "subject", operator: "contains", value: "" }]
    );
    setContent(template.content);
    setIsDrawerOpen(true);
  };

  const confirmDelete = (id) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`https://email-syncing-backend.vercel.app/template/delete/${deleteId}`);
      toast.success(" Template deleted successfully!");
      fetchTemplates();
    } catch (err) {
      toast.error(" Failed to delete template");
    } finally {
      setIsDeleteModalOpen(false);
      setDeleteId(null);
    }
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
        toast.success(" Template updated successfully!");
      } else {
        await axios.post("https://email-syncing-backend.vercel.app/template/create", payload);
        toast.success(" Template created successfully!");
      }

      setIsDrawerOpen(false);
      setEditingId(null);
      setPlatform("");
      setService("");
      setConditions([{ field: "subject", operator: "contains", value: "" }]);
      setContent("");

      fetchTemplates();
    } catch (err) {
      toast.error(" Failed to save template");
    }
  };

  const handleToggle = async (id, currentStatus) => {
    try {
      await axios.put(`https://email-syncing-backend.vercel.app/template/update/${id}`, {
        active: !currentStatus,
      });
      toast.info(
        ` Template ${!currentStatus ? "activated" : "deactivated"} successfully`
      );
      fetchTemplates();
    } catch (err) {
      toast.error(" Failed to toggle template status");
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="flex-1 min-h-screen bg-gray-50 lg:ml-64">
        {/* Header */}
        {/* <header className="flex items-center justify-between p-6 bg-white border-b">
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
            Service Templates
          </h1>
          <button
            onClick={() => {
              setEditingId(null);
              setPlatform("");
              setService("");
              setConditions([
                { field: "subject", operator: "contains", value: "" },
              ]);
              setContent("");
              setIsDrawerOpen(true);
            }}
            className="px-5 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium hover:opacity-90 transition"
          >
            + Create Template
          </button>
        </header> */}
        <header className="flex items-center justify-between px-8 py-5 bg-white border-b shadow-sm">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800 tracking-tight">
              Service Templates
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              Manage, customize, and activate your Shopify service templates
            </p>
          </div>
        </header>

        <main className="container mx-auto p-8">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="w-full border-collapse">
              <thead className="bg-gray-100 border-b">
                <tr>
                  {[
                    "Service request",
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
                {templates.length > 0 ? (
                  <>
                    {templates
                      .filter((t) => t.service === "General")
                      .map((t) => (
                        <tr key={t._id} className="border-b hover:bg-gray-50">
                          <td className="p-3 text-sm">{t.service}</td>
                          <td className="p-3 text-sm">{t.name}</td>
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
                                disabled={t.service === "General"}
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

                    {templates.some((t) => t.service === "General") && (
                      <tr>
                        <td colSpan="5" className="p-4"></td>
                      </tr>
                    )}

                    {templates
                      .filter((t) => t.service !== "General")
                      .map((t) => (
                        <tr key={t._id} className="border-b hover:bg-gray-50">
                          <td className="p-3 text-sm">
                            {t.service || "Any (general)"}
                          </td>
                          <td className="p-3 text-sm">{t.name}</td>
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
                                disabled={t.service === "General"}
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
                  </>
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

        {isDeleteModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300 ease-out animate-scaleIn">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Confirm Delete
              </h2>
              <p className="text-base text-gray-600 mb-8 leading-relaxed">
                Are you sure you want to delete this template? <br />
                <span className="font-medium text-red-600">
                  This action cannot be undone.
                </span>
              </p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-5 py-2 text-sm font-medium bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-5 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-md transition"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

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
                    className="bg-white h-40"
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

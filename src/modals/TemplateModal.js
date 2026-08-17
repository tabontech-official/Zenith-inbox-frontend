import React, { useState, useRef, useEffect } from "react";
import { X, Plus, ArrowLeft, Sparkles, Edit3 } from "lucide-react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import toast from "react-hot-toast";

const TemplateModal = ({
  node,
  templates = [],
  connections = [],
  onSave,
  onClose,
  fetchActiveTemplates,
}) => {
  const config = node?.data?.config || {};
  const userId = localStorage.getItem("userid");

  const [mode, setMode] = useState("select"); // "select" | "create" | "edit"
  const [editingTemplateId, setEditingTemplateId] = useState(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    config.templateId || config.template || ""
  );

  const [connectionId, setConnectionId] = useState(config.connectionId || "");

  // New/Edit template form fields
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const quillRef = useRef(null);

  useEffect(() => {
    const tplId = config.templateId || config.template;
    if (tplId) {
      setSelectedTemplateId(String(tplId));
    }
  }, [config.templateId, config.template, node]);

  useEffect(() => {
    if (config.connectionId && connections.length > 0) {
      const exists = connections.some(
        (c) => String(c._id) === String(config.connectionId)
      );
      if (exists) {
        setConnectionId(config.connectionId);
      }
    }
  }, [connections, config.connectionId]);

  // Find currently selected template & connection
  const selectedTemplate = templates.find(
    (t) => String(t._id) === String(selectedTemplateId)
  );
  const selectedConnection = connections.find(
    (c) => String(c._id) === String(connectionId)
  );

  const insertField = (fieldValue) => {
    const editor = quillRef.current?.getEditor();
    if (!editor) return;
    let range = editor.getSelection();

    if (!range) {
      const length = editor.getLength();
      editor.insertText(length - 1, fieldValue);
      editor.setSelection(length + fieldValue.length);
      return;
    }

    editor.insertText(range.index, fieldValue);
    editor.setSelection(range.index + fieldValue.length);
  };

  const handleStartEdit = (template) => {
    if (!template) return;
    setEditingTemplateId(template._id);
    setName(template.name || "");
    setSubject(template.subject || "");
    setBody(template.body || template.content || "");
    setMode("edit");
  };

  const handleStartCreate = () => {
    setEditingTemplateId(null);
    setName("");
    setSubject("");
    setBody("");
    setMode("create");
  };

  const handleSaveOrUpdateTemplate = async () => {
    if (!name.trim()) {
      toast.error("Please enter a template name");
      return;
    }
    if (!subject.trim()) {
      toast.error("Please enter a subject line");
      return;
    }

    setIsSaving(true);
    try {
      let res;
      let targetId = editingTemplateId;

      if (editingTemplateId) {
        // Update existing template
        res = await fetch(
          `http://localhost:5000/template/update/${editingTemplateId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name,
              subject,
              content: body,
              body,
            }),
          }
        );
      } else {
        // Create new template
        res = await fetch(
          "http://localhost:5000/template/save/other",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId,
              name,
              subject,
              content: body,
              body,
            }),
          }
        );
      }

      const data = await res.json();
      if (data.success || data.template || data.updated) {
        toast.success(
          editingTemplateId
            ? "Template updated successfully!"
            : "Template created successfully!"
        );

        if (fetchActiveTemplates) await fetchActiveTemplates();

        const savedId =
          data.template?._id ||
          data.updated?._id ||
          data.data?._id ||
          editingTemplateId ||
          crypto.randomUUID();

        // Apply updated template to node with selected sender connection
        onSave({
          templateId: savedId,
          template: savedId,
          name,
          subject,
          content: body,
          body,
          connectionId: connectionId || "",
          connectionEmail: selectedConnection?.email || "",
        });
        onClose();
      } else {
        toast.error(data.message || "Failed to save template");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error saving template");
    } finally {
      setIsSaving(false);
    }
  };

  const handleApplySelectedTemplate = () => {
    if (!selectedTemplateId) {
      toast.error("Please select a template");
      return;
    }

    if (selectedTemplate) {
      onSave({
        templateId: selectedTemplate._id,
        template: selectedTemplate._id,
        name: selectedTemplate.name,
        subject: selectedTemplate.subject || "",
        content: selectedTemplate.body || selectedTemplate.content || "",
        body: selectedTemplate.body || selectedTemplate.content || "",
        connectionId: connectionId || "",
        connectionEmail: selectedConnection?.email || "",
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/10 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white w-[560px] max-h-[88vh] flex flex-col rounded-[8px] border border-slate-200 overflow-hidden shadow-2xl">
        {/* Header */}
       <div className="flex items-center justify-between bg-[#111110] text-white px-6 py-4 shrink-0">
          <div>
            <h2 className="text-base font-bold text-white">
              {mode === "select"
                ? "Select Email Template"
                : mode === "edit"
                ? `Edit Template — ${name}`
                : "Create New Template"}
            </h2>
            <p className="text-xs text-slate-300 mt-0.5 font-normal">
              {mode === "select"
                ? "Choose an active template and sender connection"
                : mode === "edit"
                ? "Modify and save your email template"
                : "Design and save a reusable email template"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition p-1 rounded-full cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* Sender Connection Dropdown (Always visible) */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Sender Connection <span className="text-red-500">*</span>
            </label>
            <select
              value={connectionId}
              onChange={(e) => setConnectionId(e.target.value)}
              className="w-full border border-slate-300 rounded-[8px] px-3.5 py-2 text-xs font-medium text-slate-900 bg-white outline-none focus:border-slate-800 transition"
            >
              <option value="">Select Connection</option>
              {connections.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.provider ? c.provider.toUpperCase() : "EMAIL"} - {c.email}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-500 mt-1 font-normal">
              Select the email account to send responses from when triggered.
            </p>
          </div>

          {mode === "select" ? (
            <>
              {/* Select Existing Template */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-800">
                    Active Templates <span className="text-red-500">*</span>
                  </label>

                  <button
                    type="button"
                    onClick={handleStartCreate}
                    className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                  >
                    <Plus size={14} /> Create New Template
                  </button>
                </div>

                <select
                  value={selectedTemplateId}
                  onChange={(e) => setSelectedTemplateId(e.target.value)}
                  className="w-full border border-slate-300 rounded-[8px] px-3.5 py-2 text-xs font-medium text-slate-900 bg-white outline-none focus:border-slate-800 transition"
                >
                  <option value="">Choose a Template</option>
                  {templates.map((t) => (
                    <option key={t._id} value={String(t._id)}>
                      {t.name} {t.subject ? `— ${t.subject}` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Template Preview Card with Edit Template Button */}
              {selectedTemplate ? (
                <div className="border border-slate-200 rounded-[12px] bg-slate-50/70 p-4 space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="text-xs font-bold text-slate-800">
                      {selectedTemplate.name}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(selectedTemplate)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-2.5 py-1 rounded-full transition cursor-pointer"
                      >
                        <Edit3 size={13} /> Edit Template
                      </button>

                      <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        Active
                      </span>
                    </div>
                  </div>

                  {selectedTemplate.subject && (
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Subject Line
                      </p>
                      <p className="text-xs font-medium text-slate-800">
                        {selectedTemplate.subject}
                      </p>
                    </div>
                  )}

                  {(selectedTemplate.body || selectedTemplate.content) && (
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Content Preview
                      </p>
                      <div
                        className="text-xs text-slate-600 font-normal line-clamp-4 bg-white p-3 rounded-[8px] border border-slate-200 mt-1"
                        dangerouslySetInnerHTML={{
                          __html: selectedTemplate.body || selectedTemplate.content,
                        }}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="border-2 border-dashed border-slate-200 rounded-[12px] p-6 text-center text-slate-400 text-xs">
                  <p className="font-medium">No template selected.</p>
                  <p className="text-[11px] mt-1">
                    Select a template above or click <b>Create New Template</b>.
                  </p>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Mode Switcher Back Button */}
              <button
                type="button"
                onClick={() => setMode("select")}
                className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                <ArrowLeft size={14} /> Back to Template Selection
              </button>

              {/* Field 1: Template Name */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Template Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Initial Inquiry Follow-up"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-slate-300 rounded-[8px] px-3.5 py-2 text-xs font-medium text-slate-900 bg-white outline-none focus:border-slate-800 transition"
                />
              </div>

              {/* Field 2: Subject */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Subject Line <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Re: Your inquiry regarding {{StoreName}}"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full border border-slate-300 rounded-[8px] px-3.5 py-2 text-xs font-medium text-slate-900 bg-white outline-none focus:border-slate-800 transition"
                />
              </div>

              {/* Field 3: Body Editor */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Body Content
                </label>
                <ReactQuill
                  ref={quillRef}
                  theme="snow"
                  value={body}
                  onChange={(val) => setBody(val)}
                  className="bg-white rounded-[8px] overflow-hidden border border-slate-300"
                />

                <div className="mt-3 border border-slate-200 rounded-[8px] bg-slate-50/70 p-3">
                  <h4 className="text-[11px] font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                    <Sparkles size={12} className="text-indigo-500" /> Insert Dynamic Fields
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { label: "Full name", placeholder: "{{FullName}}" },
                      { label: "Business email", placeholder: "{{BusinessEmail}}" },
                      { label: "Store name", placeholder: "{{StoreName}}" },
                      { label: "Store URL", placeholder: "{{StoreURL}}" },
                      { label: "Country", placeholder: "{{Country}}" },
                      { label: "Service", placeholder: "{{Service}}" },
                      { label: "Budget", placeholder: "{{Budget}}" },
                      { label: "Problem & Goal", placeholder: "{{ProblemGoal}}" },
                    ].map((f, i) => (
                      <span
                        key={i}
                        onClick={() => insertField(f.placeholder)}
                        className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-[11px] font-semibold rounded-full cursor-pointer hover:bg-indigo-100 transition"
                      >
                        {f.label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 border border-slate-300 rounded-[8px] text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            Cancel
          </button>

          {mode === "select" ? (
            <button
              type="button"
              onClick={handleApplySelectedTemplate}
              className="px-5 py-2 bg-[#111110] hover:bg-black text-white text-xs font-bold rounded-[8px] transition cursor-pointer"
            >
              Apply Template
            </button>
          ) : (
            <button
              type="button"
              disabled={isSaving}
              onClick={handleSaveOrUpdateTemplate}
              className="px-5 py-2 bg-[#111110] hover:bg-black text-white text-xs font-bold rounded-[8px] transition cursor-pointer flex items-center gap-1.5"
            >
              {isSaving
                ? "Saving..."
                : editingTemplateId
                ? "Save & Apply Changes"
                : "Save & Select Template"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TemplateModal;

import React, { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const SaveTemplateModal = ({ onClose, onSave }) => {
  const [name, setName] = useState("");

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-[380px] shadow-xl">
        <h2 className="text-lg font-semibold mb-3">Save Email as Template</h2>

        <input
          type="text"
          placeholder="Enter template name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded px-3 py-2 mb-4"
        />

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">
            Cancel
          </button>
          <button
            onClick={() => onSave(name)}
            className="px-4 py-2 bg-purple-600 text-white rounded"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

const EmailModal = ({
  node,
  connections,
  onSave,
  onClose,
  openGmailModal,
  openOutlookModal,
  templates = [],
  showTemplateOption,
}) => {
  const config = node?.data?.config || {};

  const [selectedTemplateId, setSelectedTemplateId] = useState(
    config.templateId || ""
  );

  const [appType, setAppType] = useState(
    config.appType || config.emailType || ""
  );

  const [connectionId, setConnectionId] = useState(config.connectionId ?? "");

  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  useEffect(() => {
    if (config.connectionId && connections.length > 0) {
      const exists = connections.some((c) => c._id === config.connectionId);
      console.log("✔ Exists?", exists);

      if (exists) {
        setConnectionId(config.connectionId);
      }
    }
  }, [connections]);

  useEffect(() => {
    if (!config.connectionId || connections.length === 0) return;

    const conn = connections.find((c) => c._id === config.connectionId);
    if (!conn) return;

    if (conn.provider === "gmail") {
      setAppType("Gmail");
    } else {
      setAppType("Email");
    }
  }, [connections]);

  const [to, setTo] = useState(config.to || "");
  const [subject, setSubject] = useState(config.subject || "");
  const [body, setBody] = useState(config.body || "");

  const [ccList, setCcList] = useState(config.cc || []);
  const [bccList, setBccList] = useState(config.bcc || []);

  const quillRef = useRef(null);

  const filteredConnections = connections.filter((c) => {
    if (appType === "Gmail") {
      return c.provider === "gmail";
    }
    if (appType === "Email") {
      return (
        c.provider === "outlook" ||
        c.provider === "smtp" ||
        c.provider === "other"
      );
    }
    return false;
  });

  const handleTemplateSelect = (id) => {
    console.log("🟣 Template Selected:", id);
    setSelectedTemplateId(id);

    if (!id) {
      setSubject("");
      setBody("");
      return;
    }

    const tpl = templates.find((t) => t._id === id);
    console.log("🟣 Matching Template:", tpl);

    if (tpl) {
      setSubject(tpl.name);
      setBody(tpl.content);
    }
  };
  const saveTemplateToDB = async (name, content) => {
    try {
      const userId = localStorage.getItem("userid");

      const res = await fetch(
        "https://email-syncing-backend.vercel.app/template/save/other",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, name, content }),
        }
      );

      const data = await res.json();

      if (data.success) {
        alert("Template saved successfully!");
      } else {
        alert("Failed to save template");
      }
    } catch (err) {
      alert("Error saving template");
    }
  };
    const insertField = (value) => {
    const editor = quillRef.current?.getEditor();
    if (!editor) return;
    let range = editor.getSelection();

    if (!range) {
      const length = editor.getLength();
      editor.insertText(length - 1, value);
      editor.setSelection(length + value.length);
      return;
    }

    editor.insertText(range.index, value);
    editor.setSelection(range.index + value.length);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[550px] rounded-lg shadow-lg">
        <div className="flex items-center justify-between bg-purple-600 text-white px-5 py-3 rounded-t-lg">
          <h2 className="font-semibold">Configure Email</h2>
          <button onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div>
            <label className="text-sm font-medium">Application Type</label>
            <select
              value={appType}
              onChange={(e) => {
                console.log("🔧 App Type Changed:", e.target.value);
                setAppType(e.target.value);
              }}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">Select Type</option>
              <option value="Gmail">Gmail</option>
              <option value="Email">Email (Outlook / SMTP)</option>
            </select>
          </div>

          {appType && (
            <div>
              <label className="text-sm font-medium">Connection</label>

              <div className="flex gap-2 mt-1">
                <select
                  value={connectionId}
                  onChange={(e) => {
                    console.log("🔌 Connection Changed:", e.target.value);
                    setConnectionId(e.target.value);
                  }}
                  className="flex-1 border rounded px-3 py-2"
                >
                  <option value="">Select Connection</option>

                  {filteredConnections.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.provider.toUpperCase()} - {c.email}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() =>
                    appType === "Gmail" ? openGmailModal() : openOutlookModal()
                  }
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                >
                  Add
                </button>
              </div>
            </div>
          )}

          {showTemplateOption && (
            <div>
              <label className="text-sm font-medium">
                Use Existing Template
              </label>
              <select
                value={selectedTemplateId}
                onChange={(e) => handleTemplateSelect(e.target.value)}
                className="w-full border rounded px-3 py-2 mt-1"
              >
                <option value="">Custom Email</option>

                {templates.map((tpl) => (
                  <option key={tpl._id} value={tpl._id}>
                    {tpl.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="text-sm font-medium">Subject</label>
            <input
              className="w-full border rounded px-3 py-2 mt-1"
              value={subject}
              onChange={(e) => {
                console.log("✏️ Subject Changed:", e.target.value);
                setSubject(e.target.value);
              }}
            />
          </div>

          {!selectedTemplateId && (
            <div>
              <label className="text-sm font-medium">Body</label>

              <ReactQuill
                ref={quillRef}
                theme="snow"
                value={body}
                onChange={(value) => {
                  console.log("📝 Body Updated");
                  setBody(value);
                }}
                className="mt-1 bg-white"
              />
              <div className="mt-4 border rounded-lg bg-gray-50 p-3">
                <h3 className="text-sm font-semibold text-gray-600 mb-2">
                  Insert Fields
                </h3>

                <div className="flex flex-wrap gap-2">
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
                      className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded cursor-pointer hover:bg-purple-200"
                    >
                      {f.label}
                    </span>
                  ))}
                </div>
                </div>
              <button
                onClick={() => setShowSaveTemplateModal(true)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save as Template
              </button>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 px-4 py-3 border-t bg-gray-50">
          <button onClick={onClose} className="px-4 py-2 border rounded-md">
            Cancel
          </button>

          <button
            onClick={() => {
              console.log("💾 Final Save Payload:", {
                appType,
                connectionId,
                subject,
                body,
                templateId: selectedTemplateId,
              });

              onSave({
                appType,
                connectionId,
                to,
                subject,
                body: selectedTemplateId ? "" : body,
                cc: ccList,
                bcc: bccList,
                templateId: selectedTemplateId || null,
                emailType: appType,
              });
            }}
            className="px-4 py-2 bg-purple-600 text-white rounded-md"
          >
            Save
          </button>
        </div>
      </div>
      {showSaveTemplateModal && (
        <SaveTemplateModal
          onClose={() => setShowSaveTemplateModal(false)}
          onSave={(name) => {
            saveTemplateToDB(name, body);
            setShowSaveTemplateModal(false);
          }}
        />
      )}
    </div>
  );
};

export default EmailModal;

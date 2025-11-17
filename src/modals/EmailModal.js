import React, { useState } from "react";
import ReactQuill from "react-quill";
import { X } from "lucide-react";
import "react-quill/dist/quill.snow.css";

const EmailModal = ({ node, connections, onSave, onClose }) => {
  const config = node?.data?.config || {};

  const [connectionId, setConnectionId] = useState(config.connectionId || "");
  const [subject, setSubject] = useState(config.subject || "");
  const [to, setTo] = useState(config.to || "");
  const [cc, setCc] = useState(config.cc || []);
  const [bcc, setBcc] = useState(config.bcc || []);
  const [body, setBody] = useState(config.body || "");

  const handleAddEmail = (listSetter, valueSetter, value) => {
    if (!value.trim()) return;
    listSetter((prev) => [...prev, value.trim()]);
    valueSetter("");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white w-[550px] rounded-lg shadow-lg">
        <div className="flex items-center justify-between bg-purple-600 text-white px-4 py-3 rounded-t-lg">
          <h2 className="font-semibold">Configure Email</h2>
          <button onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Connection */}
          <div>
            <label className="text-sm font-medium">Connection</label>
            <select
              className="w-full border rounded px-3 py-2 mt-1"
              value={connectionId}
              onChange={(e) => setConnectionId(e.target.value)}
            >
              <option value="">Select a connection</option>
              {connections.map((conn) => (
                <option key={conn._id} value={conn._id}>
                  {conn.provider.toUpperCase()} - {conn.email}
                </option>
              ))}
            </select>
          </div>

          {/* TO FIELD */}
          <div>
            <label className="text-sm font-medium">To</label>
            <input
              className="w-full border rounded px-3 py-2 mt-1"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="Recipient email"
            />
          </div>

          {/* CC */}
          <div>
            <label className="text-sm font-medium">CC</label>

            <input
              className="w-full border rounded px-3 py-2 mt-1"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleAddEmail(setCc, () => {}, e.target.value);
                  e.target.value = "";
                }
              }}
              placeholder="Add CC and press Enter"
            />

            <div className="flex flex-wrap mt-2 gap-2">
              {cc.map((email, index) => (
                <span
                  key={index}
                  className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs flex items-center"
                >
                  {email}
                  <button
                    onClick={() =>
                      setCc((prev) => prev.filter((_, i) => i !== index))
                    }
                    className="ml-2 text-red-500"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* BCC */}
          <div>
            <label className="text-sm font-medium">BCC</label>

            <input
              className="w-full border rounded px-3 py-2 mt-1"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleAddEmail(setBcc, () => {}, e.target.value);
                  e.target.value = "";
                }
              }}
              placeholder="Add BCC and press Enter"
            />

            <div className="flex flex-wrap mt-2 gap-2">
              {bcc.map((email, index) => (
                <span
                  key={index}
                  className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs flex items-center"
                >
                  {email}
                  <button
                    onClick={() =>
                      setBcc((prev) => prev.filter((_, i) => i !== index))
                    }
                    className="ml-2 text-red-500"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* SUBJECT */}
          <div>
            <label className="text-sm font-medium">Subject</label>
            <input
              className="w-full border rounded px-3 py-2 mt-1"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          {/* BODY */}
          <div>
            <label className="text-sm font-medium">Body</label>
            <ReactQuill value={body} onChange={setBody} className="h-32" />
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex justify-end gap-2 px-4 py-3 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-md text-sm"
          >
            Cancel
          </button>
          <button
            onClick={() =>
              onSave({
                connectionId,
                subject,
                to,
                cc,
                bcc,
                body,
              })
            }
            className="px-4 py-2 bg-purple-600 text-white rounded-md text-sm"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailModal;

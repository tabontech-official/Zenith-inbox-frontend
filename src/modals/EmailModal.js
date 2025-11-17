import React, { useState } from "react";
import { X } from "lucide-react";

const EmailModal = ({
  node,
  connections,
  onSave,
  onClose,
  openGmailModal,
  openOutlookModal,
}) => {
  const config = node?.data?.config || {};

  const [appType, setAppType] = useState(config.appType || "");
  const [connectionId, setConnectionId] = useState(config.connectionId || "");
  const [to, setTo] = useState(config.to || "");
  const [subject, setSubject] = useState(config.subject || "");
  const [body, setBody] = useState(config.body || "");

  const [ccList, setCcList] = useState(config.cc || []);
  const [bccList, setBccList] = useState(config.bcc || []);
  const [ccInput, setCcInput] = useState("");
  const [bccInput, setBccInput] = useState("");

  /* Filter based on App Type */
  const filteredConnections = connections.filter((c) => {
    if (appType === "Gmail") return c.provider === "gmail";
    if (appType === "Email") return c.provider === "outlook" || c.provider === "smtp";
    return false;
  });

  /* Add CC/BCC */
  const handleAddEmail = (e, type) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();

      const value = type === "cc" ? ccInput.trim() : bccInput.trim();
      if (!value || !/\S+@\S+\.\S+/.test(value)) return;

      if (type === "cc") {
        setCcList([...ccList, value]);
        setCcInput("");
      } else {
        setBccList([...bccList, value]);
        setBccInput("");
      }
    }
  };

  const removeCc = (i) => setCcList(ccList.filter((_, index) => index !== i));
  const removeBcc = (i) => setBccList(bccList.filter((_, index) => index !== i));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
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

  <div className="relative mt-1">

    <select
      value={appType}
      onChange={(e) => setAppType(e.target.value)}
      className="w-full border rounded-lg px-3 py-2 pr-24 appearance-none focus:ring-0 focus:outline-none"
      style={{ paddingRight: "90px" }} 
    >
      <option value="">Select Type</option>
      <option value="Gmail">Gmail</option>
      <option value="Email">Email (Outlook / SMTP)</option>
    </select>

    <button
      onClick={() =>
        appType === "Gmail" ? openGmailModal() : openOutlookModal()
      }
      disabled={!appType}
      className={`absolute right-1 top-1 bottom-1 px-4 text-sm rounded-md 
        ${appType ? "bg-purple-600 text-white hover:bg-purple-700" : "bg-gray-200 text-gray-500 cursor-not-allowed"}
        focus:outline-none
      `}
      style={{
        height: "calc(100% - 8px)",  
      }}
    >
      Add
    </button>

  </div>
</div>


          {appType && (
            <div>
              <label className="text-sm font-medium">Connection</label>
              <select
                value={connectionId}
                onChange={(e) => setConnectionId(e.target.value)}
                className="w-full border rounded px-3 py-2 mt-1"
              >
                <option value="">Select Connection</option>
                {filteredConnections.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.provider.toUpperCase()} - {c.email}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="text-sm font-medium">To</label>
            <input
              className="w-full border rounded px-3 py-2 mt-1"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="Recipient Email"
            />
          </div>

          <div>
            <label className="text-sm font-medium">CC</label>
            <div className="border rounded px-3 py-2">
              <div className="flex flex-wrap gap-2 mb-2">
                {ccList.map((email, i) => (
                  <span
                    key={i}
                    className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs flex items-center"
                  >
                    {email}
                    <button
                      onClick={() => removeCc(i)}
                      className="ml-2 text-red-500"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>

              <input
                value={ccInput}
                onChange={(e) => setCcInput(e.target.value)}
                onKeyDown={(e) => handleAddEmail(e, "cc")}
                placeholder="Type email and press Enter"
                className="w-full outline-none text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">BCC</label>
            <div className="border rounded px-3 py-2">
              <div className="flex flex-wrap gap-2 mb-2">
                {bccList.map((email, i) => (
                  <span
                    key={i}
                    className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs flex items-center"
                  >
                    {email}
                    <button
                      onClick={() => removeBcc(i)}
                      className="ml-2 text-red-500"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>

              <input
                value={bccInput}
                onChange={(e) => setBccInput(e.target.value)}
                onKeyDown={(e) => handleAddEmail(e, "bcc")}
                placeholder="Type email and press Enter"
                className="w-full outline-none text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Subject</label>
            <input
              className="w-full border rounded px-3 py-2 mt-1"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Body</label>
            <textarea
              className="w-full border rounded px-3 py-2 mt-1 h-32"
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 px-4 py-3 border-t bg-gray-50">
          <button onClick={onClose} className="px-4 py-2 border rounded-md">
            Cancel
          </button>

          <button
            onClick={() =>
             onSave({
  appType,
  connectionId,
  to,
  subject,
  body,
  cc: ccList,
  bcc: bccList,
  template: body,    // <-- THIS IS THE FIX
})

            }
            className="px-4 py-2 bg-purple-600 text-white rounded-md"
          >
            Save
          </button>
        </div>

      </div>
    </div>
  );
};

export default EmailModal;

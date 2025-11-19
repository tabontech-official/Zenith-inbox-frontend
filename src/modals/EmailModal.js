// import React, { useState } from "react";
// import { X } from "lucide-react";

// const EmailModal = ({
//   node,
//   connections,
//   onSave,
//   onClose,
//   openGmailModal,
//   openOutlookModal,
// }) => {

//   // ---- Correct config mapping ----
//   const config = node?.data?.config || {};

//   const [appType, setAppType] = useState(config.appType || config.emailType || "");
//   const [connectionId, setConnectionId] = useState(config.connectionId || "");

//   const [to, setTo] = useState(config.to || "");
//   const [subject, setSubject] = useState(config.subject || "");
//   const [body, setBody] = useState(config.template || ""); // 🔥 FIXED (template -> body)

//   const [ccList, setCcList] = useState(config.cc || []);
//   const [bccList, setBccList] = useState(config.bcc || []);

//   const [ccInput, setCcInput] = useState("");
//   const [bccInput, setBccInput] = useState("");

//   // ---- Filter connections based on App Type ----
//   const filteredConnections = connections.filter((c) => {
//     if (appType === "Gmail") return c.provider === "gmail";
//     if (appType === "Email") return c.provider === "outlook" || c.provider === "smtp";
//     return false;
//   });

//   // ---- CC & BCC add ----
//   const handleAddEmail = (e, type) => {
//     if (e.key === "Enter" || e.key === ",") {
//       e.preventDefault();

//       const value = type === "cc" ? ccInput.trim() : bccInput.trim();
//       if (!value || !/\S+@\S+\.\S+/.test(value)) return;

//       if (type === "cc") {
//         setCcList([...ccList, value]);
//         setCcInput("");
//       } else {
//         setBccList([...bccList, value]);
//         setBccInput("");
//       }
//     }
//   };

//   const removeCc = (i) => setCcList(ccList.filter((_, index) => index !== i));
//   const removeBcc = (i) => setBccList(bccList.filter((_, index) => index !== i));

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
//       <div className="bg-white w-[550px] rounded-lg shadow-lg">

//         {/* HEADER */}
//         <div className="flex items-center justify-between bg-purple-600 text-white px-5 py-3 rounded-t-lg">
//           <h2 className="font-semibold">Configure Email</h2>
//           <button onClick={onClose}>
//             <X className="w-5 h-5" />
//           </button>
//         </div>

//         <div className="p-5 space-y-5">

//           {/* App Type */}
//           <div>
//             <label className="text-sm font-medium">Application Type</label>

//             <div className="relative mt-1">
//               <select
//                 value={appType}
//                 onChange={(e) => setAppType(e.target.value)}
//                 className="w-full border rounded-lg px-3 py-2 pr-24"
//                 style={{ paddingRight: "90px" }}
//               >
//                 <option value="">Select Type</option>
//                 <option value="Gmail">Gmail</option>
//                 <option value="Email">Email (Outlook / SMTP)</option>
//               </select>

//               <button
//                 onClick={() => (appType === "Gmail" ? openGmailModal() : openOutlookModal())}
//                 disabled={!appType}
//                 className={`absolute right-1 top-1 bottom-1 px-4 text-sm rounded-md
//                   ${appType ? "bg-purple-600 text-white hover:bg-purple-700" : "bg-gray-200 text-gray-500 cursor-not-allowed"}
//                 `}
//                 style={{ height: "calc(100% - 8px)" }}
//               >
//                 Add
//               </button>
//             </div>
//           </div>

//           {/* Connection */}
//           {appType && (
//             <div>
//               <label className="text-sm font-medium">Connection</label>
//               <select
//                 value={connectionId}
//                 onChange={(e) => setConnectionId(e.target.value)}
//                 className="w-full border rounded px-3 py-2 mt-1"
//               >
//                 <option value="">Select Connection</option>

//                 {filteredConnections.map((c) => (
//                   <option key={c._id} value={c._id}>
//                     {c.provider.toUpperCase()} - {c.email}
//                   </option>
//                 ))}

//               </select>
//             </div>
//           )}

//           {/* CC */}
//           <div>
//             <label className="text-sm font-medium">CC</label>
//             <div className="border rounded px-3 py-2">
//               <div className="flex flex-wrap gap-2 mb-2">
//                 {ccList.map((email, i) => (
//                   <span key={i} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs flex items-center">
//                     {email}
//                     <button onClick={() => removeCc(i)} className="ml-2 text-red-500">✕</button>
//                   </span>
//                 ))}
//               </div>

//               <input
//                 value={ccInput}
//                 onChange={(e) => setCcInput(e.target.value)}
//                 onKeyDown={(e) => handleAddEmail(e, "cc")}
//                 placeholder="Type email and press Enter"
//                 className="w-full outline-none text-sm"
//               />
//             </div>
//           </div>

//           {/* BCC */}
//           <div>
//             <label className="text-sm font-medium">BCC</label>
//             <div className="border rounded px-3 py-2">
//               <div className="flex flex-wrap gap-2 mb-2">
//                 {bccList.map((email, i) => (
//                   <span key={i} className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs flex items-center">
//                     {email}
//                     <button onClick={() => removeBcc(i)} className="ml-2 text-red-500">✕</button>
//                   </span>
//                 ))}
//               </div>

//               <input
//                 value={bccInput}
//                 onChange={(e) => setBccInput(e.target.value)}
//                 onKeyDown={(e) => handleAddEmail(e, "bcc")}
//                 placeholder="Type email and press Enter"
//                 className="w-full outline-none text-sm"
//               />
//             </div>
//           </div>

//           {/* Subject */}
//           <div>
//             <label className="text-sm font-medium">Subject</label>
//             <input
//               className="w-full border rounded px-3 py-2 mt-1"
//               value={subject}
//               onChange={(e) => setSubject(e.target.value)}
//             />
//           </div>

//           {/* Body */}
//           <div>
//             <label className="text-sm font-medium">Body</label>
//             <textarea
//               className="w-full border rounded px-3 py-2 mt-1 h-32"
//               value={body}
//               onChange={(e) => setBody(e.target.value)}
//             />
//           </div>
//         </div>

//         {/* Footer */}
//         <div className="flex justify-end gap-2 px-4 py-3 border-t bg-gray-50">
//           <button onClick={onClose} className="px-4 py-2 border rounded-md">
//             Cancel
//           </button>

//           <button
//             onClick={() =>
//               onSave({
//                 appType,
//                 connectionId,
//                 to,
//                 subject,
//                 body,
//                 cc: ccList,
//                 bcc: bccList,
//                 template: body,   // 🔥 DB expects this
//                 emailType: appType,
//               })
//             }
//             className="px-4 py-2 bg-purple-600 text-white rounded-md"
//           >
//             Save
//           </button>
//         </div>

//       </div>
//     </div>
//   );
// };

// export default EmailModal;
import React, { useRef, useState } from "react";
import { X } from "lucide-react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const EmailModal = ({
  node,
  connections,
  onSave,
  onClose,
  openGmailModal,
  openOutlookModal,
}) => {
  // ---- Correct config mapping ----
  const config = node?.data?.config || {};

  const [appType, setAppType] = useState(
    config.appType || config.emailType || ""
  );
  const [connectionId, setConnectionId] = useState(config.connectionId || "");

  const [to, setTo] = useState(config.to || "");
  const [subject, setSubject] = useState(config.subject || "");
  const [body, setBody] = useState(config.template || ""); // 🔥 FIXED (template -> body)

  const [ccList, setCcList] = useState(config.cc || []);
  const [bccList, setBccList] = useState(config.bcc || []);

  const [ccInput, setCcInput] = useState("");
  const [bccInput, setBccInput] = useState("");

  // ---- Filter connections based on App Type ----
  const filteredConnections = connections.filter((c) => {
    if (appType === "Gmail") return c.provider === "gmail";
    if (appType === "Email")
      return c.provider === "outlook" || c.provider === "smtp";
    return false;
  });

  // ---- CC & BCC add ----
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
  const removeBcc = (i) =>
    setBccList(bccList.filter((_, index) => index !== i));
  const insertField = (value) => {
    const editor = quillRef.current?.getEditor();
    if (!editor) return;

    let range = editor.getSelection();

    // If no cursor, insert at end safely
    if (!range) {
      const length = editor.getLength();
      editor.insertText(length - 1, value);
      editor.setSelection(length + value.length);
      return;
    }

    // Insert at cursor
    editor.insertText(range.index, value);
    editor.setSelection(range.index + value.length);
  };

  const quillRef = useRef(null);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white w-[550px] rounded-lg shadow-lg">
        {/* HEADER */}
        <div className="flex items-center justify-between bg-purple-600 text-white px-5 py-3 rounded-t-lg">
          <h2 className="font-semibold">Configure Email</h2>
          <button onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* App Type */}
          <div>
            <label className="text-sm font-medium">Application Type</label>

            <div className="relative mt-1">
              <select
                value={appType}
                onChange={(e) => setAppType(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 pr-24"
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
                  ${
                    appType
                      ? "bg-purple-600 text-white hover:bg-purple-700"
                      : "bg-gray-200 text-gray-500 cursor-not-allowed"
                  }
                `}
                style={{ height: "calc(100% - 8px)" }}
              >
                Add
              </button>
            </div>
          </div>

          {/* Connection */}
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

          {/* CC */}
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

          {/* BCC */}
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

          {/* Subject */}
          <div>
            <label className="text-sm font-medium">Subject</label>
            <input
              className="w-full border rounded px-3 py-2 mt-1"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          {/* Body */}
          <div>
            <label className="text-sm font-medium">Body</label>
            <ReactQuill
              ref={quillRef}
              theme="snow"
              value={body}
              onChange={setBody}
              className="mt-1 bg-white"
              style={{ marginBottom: "40px" }}
            />

            {/* Insert Fields Box */}
            <div className="mt-4 border rounded-lg bg-gray-50 p-3 sm:p-4">
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
                template: body, // 🔥 DB expects this
                emailType: appType,
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

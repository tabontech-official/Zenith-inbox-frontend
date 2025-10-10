import {
  FiMail,
  FiUser,
  FiGlobe,
  FiFileText,
  FiPaperclip,
  FiAtSign,
  FiCalendar,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import { X } from "lucide-react";
import { useState } from "react";

export default function EmailInspector({ email, onClose }) {
  const [openSections, setOpenSections] = useState({
    text: true,
    html: false,
    sender: true,
    recipient: true,
    attachments: false,
  });

  if (!email) return null;

  const toggleSection = (key) =>
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const senderRaw = email?.senderAddress || "";
  const senderName = senderRaw.includes("<")
    ? senderRaw.split("<")[0].trim()
    : senderRaw || "Unknown Sender";
  const senderEmail =
    senderRaw.match(/<([^>]+)>/)?.[1] || senderRaw || "No email found";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-[800px] max-h-[90vh] overflow-y-auto relative">
        <div className="flex justify-between items-center border-b px-6 py-4 bg-gray-50 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <FiMail className="text-purple-600 w-6 h-6" />
            <h2 className="text-lg font-semibold text-gray-800">
              Email Details
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-gray-50 rounded-lg border p-4 text-sm">
            <div className="flex items-center gap-2 mb-2 text-gray-700">
              <FiCalendar className="text-purple-500" />
              <span className="font-semibold">Date:</span>
              <span>
                {email.date
                  ? new Date(email.date).toLocaleString("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })
                  : "N/A"}
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <FiFileText className="text-purple-500" />
              <span className="font-semibold">Subject:</span>
              <span>{email.subject || "No subject"}</span>
            </div>
          </div>

          <CollapsibleSection
            title="Plain Text"
            icon={<FiFileText />}
            isOpen={openSections.text}
            toggle={() => toggleSection("text")}
          >
            <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
              {email.textBody || "No plain text content."}
            </pre>
          </CollapsibleSection>

          <CollapsibleSection
            title="HTML Content"
            icon={<FiGlobe />}
            isOpen={openSections.html}
            toggle={() => toggleSection("html")}
          >
            <div
              className="text-sm text-gray-700"
              dangerouslySetInnerHTML={{
                __html: email.htmlBody || "<i>No HTML content available.</i>",
              }}
            ></div>
          </CollapsibleSection>

          <CollapsibleSection
            title="Sender Info"
            icon={<FiUser />}
            isOpen={openSections.sender}
            toggle={() => toggleSection("sender")}
          >
            <div className="text-sm text-gray-700 space-y-1">
              <p>
                <span className="font-semibold">Name:</span> {senderName}
              </p>
              <p>
                <span className="font-semibold">Email:</span> {senderEmail}
              </p>
            </div>
          </CollapsibleSection>

          <CollapsibleSection
            title="Recipient Info"
            icon={<FiAtSign />}
            isOpen={openSections.recipient}
            toggle={() => toggleSection("recipient")}
          >
            <p className="text-sm text-gray-700">
              {email.recipientAddress || "No recipient information."}
            </p>
          </CollapsibleSection>

          <CollapsibleSection
            title="Attachments"
            icon={<FiPaperclip />}
            isOpen={openSections.attachments}
            toggle={() => toggleSection("attachments")}
          >
            {email.attachments?.length ? (
              email.attachments.map((a, i) => (
                <div key={i} className="text-sm text-gray-700">
                  📎 {a.filename} ({a.contentType}, {a.size} bytes)
                </div>
              ))
            ) : (
              <i className="text-gray-500 text-sm">No attachments found.</i>
            )}
          </CollapsibleSection>
        </div>
      </div>
    </div>
  );
}

function CollapsibleSection({ title, icon, isOpen, toggle, children }) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <div
        onClick={toggle}
        className="flex justify-between items-center bg-purple-50 px-4 py-2 cursor-pointer"
      >
        <div className="flex items-center gap-2 text-purple-700 font-medium">
          {icon} {title}
        </div>
        {isOpen ? <FiChevronUp /> : <FiChevronDown />}
      </div>
      {isOpen && <div className="p-4 bg-white">{children}</div>}
    </div>
  );
}

import React from "react";
import { FaEnvelope, FaMicrosoft, FaTimes } from "react-icons/fa";
import { SiGmail } from "react-icons/si";
import { FiChevronRight } from "react-icons/fi";

/*
 * Provider picker for the /connection page.
 *
 * Labels are kept identical to the three options already used in the
 * scenario dropdowns and the sidebar, so the same account type is never
 * called two different things in two places.
 *
 * This component only *chooses* — it renders no connection form of its
 * own. Each option hands control back to the page, which reuses the
 * existing modal (or, for Microsoft, starts the OAuth redirect).
 */
export const CONNECTION_PROVIDER_OPTIONS = [
  {
    id: "gmail",
    label: "Gmail / Google Workspace",
    description: "Connect with a Google App Password.",
    Icon: SiGmail,
    iconClass: "text-red-500",
  },
  {
    id: "microsoft",
    label: "Outlook / Live / Microsoft 365",
    description: "Sign in securely with Microsoft (OAuth).",
    Icon: FaMicrosoft,
    iconClass: "text-blue-600",
  },
  {
    id: "other",
    label: "Other Email",
    description: "Any other provider, using custom SMTP settings.",
    Icon: FaEnvelope,
    iconClass: "text-slate-500",
  },
];

const CreateConnectionModal = ({ isOpen, onClose, onSelect }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-xs p-4">
      <div className="flex max-h-[88vh] w-full max-w-[460px] flex-col overflow-hidden rounded-[8px] border bg-white">
        {/* Dark Theme Header — matches the Gmail / Microsoft modals */}
        <header className="flex shrink-0 items-center justify-between bg-[#111110] px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10">
              <FaEnvelope className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Create Connection
              </h2>
              <p className="mt-0.5 text-xs font-normal text-slate-300">
                Choose the type of email account to connect
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="cursor-pointer rounded-full p-1 text-slate-400 transition hover:text-white"
          >
            <FaTimes className="h-5 w-5" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="space-y-2.5 p-6">
            {CONNECTION_PROVIDER_OPTIONS.map((option) => {
              const { Icon } = option;

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => onSelect?.(option.id)}
                  className="group flex w-full cursor-pointer items-center gap-3 rounded-[8px] border border-slate-200 bg-white px-4 py-3 text-left transition hover:border-slate-800 hover:bg-slate-50"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                    <Icon className={`h-4 w-4 ${option.iconClass}`} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-bold text-slate-900">
                      {option.label}
                    </p>
                    <p className="mt-0.5 text-[11px] font-normal text-slate-500">
                      {option.description}
                    </p>
                  </div>

                  <FiChevronRight className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:text-slate-800" />
                </button>
              );
            })}
          </div>
        </div>

        <footer className="flex shrink-0 items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/50 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-[8px] border border-slate-300 bg-white px-5 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-100"
          >
            Cancel
          </button>
        </footer>
      </div>
    </div>
  );
};

export default CreateConnectionModal;

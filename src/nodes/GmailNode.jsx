import React from "react";
import { Handle, Position } from "reactflow";
import { FiMail } from "react-icons/fi";
import { Edit, Plus, X, AlertCircle } from "lucide-react";

const GmailNode = ({ data, selected }) => {
  const isHighlighted = data?.highlight;
  const isSuccess = data?.success;

  const connectedEmail = data?.config?.connectionEmail || "your-email@domain.com";
  const subjectFilter = data?.config?.subject || "";
  const hasConnection = Boolean(data?.config?.connectionId);
  const hasSubject = Boolean(data?.config?.subject && data?.config?.subject.trim());
  const isFullyConfigured = hasConnection && hasSubject;

  return (
    <div className="relative group">
      <div
        className={`
          relative 
          p-4 
          bg-[#F4FBF7] 
          rounded-[22px] 
          border 
          shadow-xs 
          hover:shadow-md
          w-[270px] 
          transition-all duration-200
          ${
            data?.errorMessage || isHighlighted || (!hasSubject && hasConnection)
              ? "border-red-500 ring-2 ring-red-200 bg-red-50/20 shadow-md"
              : data?.executing
              ? "border-amber-400 ring-2 ring-amber-300 bg-amber-50/20 shadow-md"
              : selected || isSuccess
              ? "border-emerald-500 ring-2 ring-emerald-200 bg-emerald-50/10 shadow-md"
              : "border-slate-200/90"
          }
        `}
      >
        {/* Delete Button (on hover) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            data?.confirmDeleteNode?.(data?.id);
          }}
          className="
            opacity-0 group-hover:opacity-100
            absolute top-3 right-11
            w-7 h-7 
            rounded-lg 
            bg-red-50 hover:bg-red-100 text-red-600 border border-red-200
            flex items-center justify-center 
            transition-all z-20 cursor-pointer
          "
          title="Delete Node"
        >
          <X size={14} />
        </button>

        {/* Edit Email Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            data?.openEditEmailModal?.(data?.id);
          }}
          className="
            absolute top-3 right-3 
            w-7 h-7 
            rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200/80 
            flex items-center justify-center 
            text-slate-500 hover:text-slate-900 
            transition-colors z-20 cursor-pointer
          "
          title="Configure Email Node"
        >
          <Edit size={14} />
        </button>

        {/* Header Row */}
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100/70 flex items-center justify-center shrink-0 shadow-2xs">
              <FiMail size={18} />
            </div>

            <div className="leading-tight">
              <h3 className="text-sm font-bold text-slate-900">
                Incoming Leads
              </h3>
            </div>
          </div>

          <span
            className={`w-2.5 h-2.5 rounded-full ring-4 shrink-0 group-hover:hidden ${
              isFullyConfigured
                ? "bg-emerald-500 ring-emerald-50"
                : "bg-amber-400 ring-amber-50"
            }`}
          ></span>
        </div>

        {/* Error Message */}
        {(!hasSubject || data?.errorMessage) && (
          <div className="w-full flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-xs px-2.5 py-1.5 rounded-lg mb-2">
            <AlertCircle size={14} className="shrink-0 text-red-500" />
            <span className="truncate">
              {data?.errorMessage || (!hasSubject ? "Subject filter missing" : "Setup Required")}
            </span>
          </div>
        )}

        {/* Details Body */}
        <div className="space-y-1.5 mt-2 text-xs">
          <p className="font-semibold text-slate-700 truncate">
            {hasConnection ? `GMAIL · ${connectedEmail}` : "Select Email Connection"}
          </p>

          <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
            <span>Subject contains</span>
            <span className="bg-white text-slate-800 font-bold px-2 py-0.5 rounded-[4px] border border-slate-200/80 truncate max-w-[130px]">
              {subjectFilter || "Not Set"}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 mt-2.5 border-t border-slate-200/80 flex items-center justify-between text-xs">
          <span className="text-[11px] font-medium text-slate-400">
            Polls every 60s
          </span>

          {isFullyConfigured ? (
            <span className="text-[11px] font-semibold text-emerald-600 shrink-0">
              ✓ Configured
            </span>
          ) : (
            <span className="text-[11px] font-semibold text-amber-600 shrink-0">
              ⚠ Setup Required
            </span>
          )}
        </div>

        {/* Add Node Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            data?.openModuleModal?.(data?.id);
          }}
          className="
            absolute left-1/2 bottom-[-14px] -translate-x-1/2
            w-7 h-7 rounded-full bg-white border border-slate-300
            flex items-center justify-center shadow-xs 
            hover:bg-slate-50 hover:scale-110 hover:border-slate-400 transition-all z-20 cursor-pointer
          "
          title="Add Module"
        >
          <Plus size={14} className="text-slate-700" />
        </button>

        {/* Handles */}
        <Handle
          type="target"
          position={Position.Top}
          className="!w-3 !h-2 !rounded-full !bg-slate-300 !border-2 !border-white hover:!bg-indigo-500 transition-colors"
          style={{ top: -7 }}
        />
        <Handle
          type="source"
          position={Position.Bottom}
          className="!w-3 !h-2 !rounded-full !bg-slate-300 !border-2 !border-white hover:!bg-indigo-500 transition-colors"
          style={{ bottom: -7 }}
        />
      </div>
    </div>
  );
};

export default GmailNode;

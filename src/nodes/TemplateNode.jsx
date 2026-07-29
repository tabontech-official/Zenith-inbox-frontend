import React from "react";
import { Handle, Position } from "reactflow";
import { FiFileText } from "react-icons/fi";
import { Edit, Plus, X, AlertCircle } from "lucide-react";

const TemplateNode = ({ data, selected }) => {
  const isHighlighted = data?.highlight;
  const isSuccess = data?.success;

  const connectionEmail = data?.config?.connectionEmail;

  return (
    <div className="relative group">
      <div
        onClick={() => {
          data?.openTemplateModal?.(data?.id);
        }}
        className={`
          relative 
          p-4 
          bg-white 
          rounded-[22px] 
          border 
          shadow-xs 
          hover:shadow-md
          w-[270px] 
          cursor-pointer
          transition-all duration-200
          ${
            selected
              ? "border-indigo-500 ring-2 ring-indigo-200 shadow-md"
              : isHighlighted
              ? "border-red-400 ring-2 ring-red-100 bg-red-50/20"
              : isSuccess
              ? "border-emerald-400 ring-2 ring-emerald-100 bg-emerald-50/20"
              : "border-slate-200/90"
          }
        `}
      >
        {/* Delete Button (only on hover) */}
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

        {/* Edit Template Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            data?.openTemplateModal?.(data?.id);
          }}
          className="
            absolute top-3 right-3 
            w-7 h-7 
            rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200/80 
            flex items-center justify-center 
            text-slate-500 hover:text-slate-900 
            transition-colors z-20 cursor-pointer
          "
          title="Configure Email Template"
        >
          <Edit size={14} />
        </button>

        {/* Header Row */}
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-100/70 flex items-center justify-center shrink-0 shadow-2xs">
              <FiFileText size={18} />
            </div>

            <div className="leading-tight">
              <h3 className="text-sm font-bold text-slate-900">
                Email Template
              </h3>
              <p className="text-[11px] font-medium text-slate-400">
                {data?.config?.name || "Predefined Template"}
              </p>
            </div>
          </div>

          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-50 shrink-0 group-hover:hidden"></span>
        </div>

        {/* Error Message */}
        {data?.errorMessage && (
          <div className="w-full flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-xs px-2.5 py-1.5 rounded-lg mb-2">
            <AlertCircle size={14} className="shrink-0 text-red-500" />
            <span className="truncate">{data.errorMessage}</span>
          </div>
        )}

        {/* Sender Connection Display */}
        <div className="space-y-1 mt-2 text-xs">
          <p className="font-semibold text-slate-700 truncate">
            {connectionEmail ? `SENDER · ${connectionEmail}` : "Select Sender Connection"}
          </p>
        </div>

        {/* Footer */}
        <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-[11px] font-medium text-slate-500 truncate max-w-[170px]">
            {data?.config?.subject ? `Subject: ${data.config.subject}` : "Variables: {{first_name}}"}
          </span>
          <span className="text-[11px] font-semibold text-emerald-600 shrink-0">
            ✓ Configured
          </span>
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

export default TemplateNode;

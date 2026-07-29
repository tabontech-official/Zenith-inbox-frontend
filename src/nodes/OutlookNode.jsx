import React from "react";
import { Handle, Position } from "reactflow";
import { FaMicrosoft } from "react-icons/fa";
import { Edit, Plus, X } from "lucide-react";

const OutlookNode = ({ data, selected }) => {
  return (
    <div className="relative group">
      <div
        className={`
          relative 
          p-4 
          bg-white 
          rounded-[22px] 
          border 
          shadow-xs 
          hover:shadow-md
          w-[270px] 
          transition-all duration-200
          ${
            selected
              ? "border-indigo-500 ring-2 ring-indigo-200 shadow-md"
              : "border-slate-200/90"
          }
        `}
      >
        {/* Delete Button */}
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

        {/* Edit Button */}
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
          title="Edit Outlook Email"
        >
          <Edit size={14} />
        </button>

        {/* Header Row */}
        <div className="flex items-center gap-3 mb-2.5">
          <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 border border-sky-100/70 flex items-center justify-center shrink-0 shadow-2xs">
            <FaMicrosoft size={16} />
          </div>

          <div className="leading-tight">
            <h3 className="text-sm font-bold text-slate-900">Outlook</h3>
            <p className="text-[11px] font-medium text-slate-400">
              Send Email Message
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-[11px] font-medium text-slate-500">
            Microsoft Exchange
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

export default OutlookNode;

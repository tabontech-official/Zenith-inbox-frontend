import React from "react";
import { Handle, Position } from "reactflow";
import { Eye, Plus, Zap, Code } from "lucide-react";

const WebhookNode = ({ data, selected }) => {
  const isExecuting = data?.executing;
  const isHighlighted = data?.highlight;
  const isSuccess = data?.success;

  return (
    <div className="relative group">
      {/* Running Indicator */}
      {isExecuting && (
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-semibold text-indigo-600 animate-pulse bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
          Running…
        </div>
      )}

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
              : isHighlighted
              ? "border-red-400 ring-2 ring-red-100 bg-red-50/20"
              : isSuccess
              ? "border-emerald-400 ring-2 ring-emerald-100 bg-emerald-50/20"
              : "border-slate-200/90"
          }
        `}
      >
        <div className="flex items-center justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-500 border border-rose-100/70 flex items-center justify-center shrink-0 shadow-2xs">
              <Zap size={18} />
            </div>

            <div className="leading-tight">
              <h3 className="text-sm font-bold text-slate-900">
                Webhooks Trigger
              </h3>
              <p className="text-[11px] font-semibold text-slate-400">
                {data?.label || "Webhook"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* View Details Eye Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                data?.openWebhookModal?.(data?.id);
              }}
              className="w-7 h-7 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors"
              title="View Webhook Info"
            >
              <Eye size={14} />
            </button>

            {/* Active Status Dot */}
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-50 shrink-0"></span>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
          <p className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
            <Code size={12} className="text-slate-400" /> Custom Mailhook
          </p>
          <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
            ✓ Active
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
          id="b"
          className="!w-3 !h-2 !rounded-full !bg-slate-300 !border-2 !border-white hover:!bg-indigo-500 transition-colors"
          style={{ top: -7 }}
        />
        <Handle
          type="source"
          position={Position.Bottom}
          id="a"
          className="!w-3 !h-2 !rounded-full !bg-slate-300 !border-2 !border-white hover:!bg-indigo-500 transition-colors"
          style={{ bottom: -7 }}
        />
      </div>
    </div>
  );
};

export default WebhookNode;

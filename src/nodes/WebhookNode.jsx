import React from "react";
import { Handle, Position } from "reactflow";
import { Eye, Plus, Zap, Code } from "lucide-react";

const ACCENT_COLOR = "#FF6961";
const ACCENT_BG = "#FFF0F0";
const BORDER_COLOR = "#FFC7C4";

const WebhookNode = ({ data, selected }) => {
  return (
    <div
      className={`
        relative 
        p-5 
        bg-white 
        rounded-xl 
        border-2 
        shadow-xl 
        w-[280px] 
        transition-all 
        ${
          selected
            ? `border-[${ACCENT_COLOR}] ring-2 ring-[${ACCENT_COLOR}]`
            : `border-[${BORDER_COLOR}]`
        }
      `}
      style={{
        boxShadow: selected
          ? `0 4px 15px rgba(255, 105, 97, 0.3), 0 1px 4px rgba(0,0,0,0.08)`
          : `0 3px 10px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)`,
      }}
    >
      <div className="flex items-start gap-4">
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center`}
          style={{ backgroundColor: ACCENT_BG }}
        >
          <Zap
            size={20}
            className="text-gray-900"
            style={{ color: ACCENT_COLOR }}
          />
        </div>

        <div className="flex-1 leading-tight">
          <h3 className="text-lg font-bold text-gray-800">Webhooks Trigger</h3>
          <p className="text-sm text-gray-500 mt-0">
            {data?.label || "Incoming Request"}
          </p>
          <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
            <Code size={12} /> Custom Mailhook
          </p>
        </div>
      </div>

      <div className="absolute top-2 right-2 flex gap-1">
       <button
  onClick={(e) => {
    e.stopPropagation();
    data?.openWebhookModal?.(data?.id);
  }}
  className="
    w-7 h-7 
    border 
    rounded-md 
    flex items-center justify-center 
    bg-white 
    hover:bg-gray-50 
    transition
  "
  style={{ borderColor: BORDER_COLOR }}
  title="View Details"
>
  <Eye size={14} className="text-gray-600" />
</button>

      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          data?.openModuleModal?.(data?.id);
        }}
        className={`
    absolute 
    left-1/2
    bottom-[-15px]
    -translate-x-1/2
    w-7 h-7 
    rounded-full 
    bg-white 
    border border-gray-300 
    flex items-center justify-center 
    shadow-md 
    hover:bg-gray-100 
    hover:scale-[1.15] 
    transition-all 
    z-10
  `}
        title="Add Module"
      >
        <Plus size={14} className="text-gray-600" />
      </button>

      <Handle
        type="source"
        position={Position.Bottom}
        id="a"
        className={`!w-4 !h-2 !rounded-full !bg-gray-300 !border-2 !border-white transition-colors hover:!bg-[${ACCENT_COLOR}]`}
        style={{ bottom: -10 }}
      />
      <Handle
        type="target"
        position={Position.Top}
        id="b"
        className={`!w-4 !h-2 !rounded-full !bg-gray-300 !border-2 !border-white transition-colors hover:!bg-[${ACCENT_COLOR}]`}
        style={{ top: -10 }}
      />
    </div>
  );
};

export default WebhookNode;

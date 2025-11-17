import React from "react";
import { Handle } from "reactflow";
import { Eye } from "lucide-react";

const WebhookNode = ({ data }) => {
  return (
    <div
      className="
        relative 
        px-5 py-4 
        bg-white 
        rounded-2xl 
        border border-[#ff9c9c] 
        shadow-[0_2px_8px_rgba(0,0,0,0.06)] 
        w-[260px]
      "
    >

      {/* ---- Top Right Icon ---- */}
      <button
        className="
          absolute top-2 right-2 
          w-8 h-8 
          border border-[#ff9c9c] 
          rounded-xl 
          flex items-center justify-center 
          bg-white 
          hover:bg-[#fff6f6] 
          transition
        "
      >
        <Eye size={16} className="text-[#ff6961]" />
      </button>

      {/* ---- Icon + Text ---- */}
      <div className="flex items-center gap-4">
        
        {/* Icon Box */}
        <div className="w-12 h-12 rounded-xl bg-[#ffe7e7] flex items-center justify-center">
          <svg
            stroke="#ff6961"
            fill="none"
            strokeWidth="2"
            viewBox="0 0 24 24"
            width="28"
            height="28"
          >
            <path d="M4 7l8-4 8 4-8 4-8-4z"></path>
            <path d="M4 17l8 4 8-4"></path>
            <path d="M4 12l8 4 8-4"></path>
          </svg>
        </div>

        {/* Title + Description */}
        <div className="leading-tight">
          <h3 className="text-[16px] font-semibold text-gray-800">
            Webhooks
          </h3>
          <p className="text-[13px] text-gray-500 mt-[2px]">
            Custom mailhook
          </p>
        </div>

      </div>

      {/* ---- ReactFlow Handles ---- */}
      <Handle type="source" position="bottom" className="!bg-gray-400" />
      <Handle type="target" position="top" className="!bg-gray-400" />
    </div>
  );
};

export default WebhookNode;

import React from "react";
import { Handle } from "reactflow";
import { GitBranch, Eye } from "lucide-react";

const RouterNode = ({ data }) => {
  return (
    <div
      className="
        relative 
        px-5 py-4 
        bg-white 
        rounded-2xl 
        border border-[#66c28a] 
        shadow-[0_2px_8px_rgba(0,0,0,0.06)] 
        w-[260px]
      "
    >

      {/* ---- Top Right Mini Button ---- */}
      <button
        className="
          absolute top-2 right-2 
          w-8 h-8 
          border border-[#66c28a] 
          rounded-xl 
          flex items-center justify-center 
          bg-white 
          hover:bg-[#eefcf4] 
          transition
        "
      >
        <Eye size={16} className="text-[#3d9c61]" />
      </button>

      {/* ---- Icon + Text ---- */}
      <div className="flex items-center gap-4">
        
        {/* Icon Box */}
        <div className="w-12 h-12 rounded-xl bg-[#e7f7ed] flex items-center justify-center">
          <GitBranch size={26} className="text-[#3d9c61]" />
        </div>

        {/* Title + Description */}
        <div className="leading-tight">
          <h3 className="text-[16px] font-semibold text-gray-800">Router</h3>

          <p className="text-[13px] text-gray-500 mt-[2px]">
            Split paths
          </p>
        </div>

      </div>

      {/* ---- ReactFlow Handles ---- */}
      <Handle type="target" position="top" className="!bg-gray-400" />
      <Handle type="source" position="bottom" className="!bg-gray-400" />
    </div>
  );
};

export default RouterNode;

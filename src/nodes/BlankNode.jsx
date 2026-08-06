import React from "react";
import { Handle, Position } from "reactflow";
import { Plus } from "lucide-react";

const BlankNode = ({ data, selected }) => {
  return (
    <div className="relative">
      <div
        onClick={() => data?.openModuleModal?.(data?.id)}
        className={`
          relative 
          px-4 py-4
          bg-white/95 
          backdrop-blur-xs
          rounded-[18px] 
          border-2 border-dashed border-[#CBD5E1]
          hover:border-slate-400 hover:shadow-md
          w-[190px] 
          cursor-pointer
          transition-all duration-200 group
          flex flex-col items-center justify-center text-center
          ${selected ? "border-indigo-500 ring-2 ring-indigo-200" : ""}
        `}
      >
        {/* Top Centered Circular Plus Icon */}
        <div className="w-9 h-9 rounded-full bg-[#F1F5F9] flex items-center justify-center group-hover:scale-105 group-hover:bg-[#111110] group-hover:text-white transition-all shadow-2xs">
          <Plus size={18} className="text-[#1E293B] group-hover:text-white transition-colors" />
        </div>

        {/* Text Details */}
        <h3 className="text-xs font-bold text-[#0F172A] mt-2 mb-0.5">
          + Add Node / Module
        </h3>
        <p className="text-[11px] font-medium text-[#64748B]">
          {data?.subtitle || "Follow-up or Delay"}
        </p>

        {/* Handles */}
        <Handle
          type="source"
          position={Position.Bottom}
          id="a"
          className="!w-2.5 !h-1.5 !rounded-full !bg-slate-300 !border-2 !border-white hover:!bg-indigo-500 transition-colors"
          style={{ bottom: -6 }}
        />
        <Handle
          type="target"
          position={Position.Top}
          id="b"
          className="!w-2.5 !h-1.5 !rounded-full !bg-slate-300 !border-2 !border-white hover:!bg-indigo-500 transition-colors"
          style={{ top: -6 }}
        />
      </div>
    </div>
  );
};

export default BlankNode;

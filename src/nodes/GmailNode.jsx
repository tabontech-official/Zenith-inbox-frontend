import React from "react";
import { Handle } from "reactflow";
import { FaGoogle } from "react-icons/fa";
import { Edit, Eye } from "lucide-react";

const GmailNode = ({ data }) => {
  return (
    <div
      className="
        relative 
        px-5 py-4 
        bg-white 
        rounded-2xl 
        border border-[#e57373] 
        shadow-[0_2px_8px_rgba(0,0,0,0.06)] 
        w-[260px]
      "
    >

      {/* ---- Top Right Mini Button ---- */}
      <button
        className="
          absolute top-2 right-2 
          w-8 h-8 
          border border-[#e57373] 
          rounded-xl 
          flex items-center justify-center 
          bg-white 
          hover:bg-[#fff5f5] 
          transition
        "
      >
        <Edit size={16} className="text-[#e57373]" />
      </button>

      {/* ---- Icon + Text ---- */}
      <div className="flex items-center gap-4">
        
        {/* Icon Box */}
        <div className="w-12 h-12 rounded-xl bg-[#fde0e0] flex items-center justify-center">
          <FaGoogle size={26} className="text-[#e57373]" />
        </div>

        {/* Title & Description */}
        <div className="leading-tight">
          <h3 className="text-[16px] font-semibold text-gray-800">Gmail</h3>
          <p className="text-[13px] text-gray-500 mt-[2px]">
            Send Email
          </p>
        </div>

      </div>

      {/* ---- ReactFlow Handles ---- */}
      <Handle type="target" position="top" className="!bg-gray-400" />
      <Handle type="source" position="bottom" className="!bg-gray-400" />
    </div>
  );
};

export default GmailNode;

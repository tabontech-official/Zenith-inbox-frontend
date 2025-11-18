
import React from "react";
import { Handle } from "reactflow";
import { FaGoogle } from "react-icons/fa";
import { Edit, Plus, X } from "lucide-react";

const GmailNode = ({ data }) => {
  return (
    <div
      className="
        relative group
        px-5 py-5 
        bg-white 
        rounded-2xl 
        border-2 border-[#e57373]/60
        shadow-[0_3px_10px_rgba(0,0,0,0.05)] 
        w-[260px]
        transition-all
      "
    >

      {/* ---- DELETE BUTTON (hover only) ---- */}
      <button
 onClick={(e) => {
    e.stopPropagation();  
    data?.confirmDeleteNode(data.id);
  }}
        className="
          opacity-0 group-hover:opacity-100 
          absolute top-2 right-12
          w-7 h-7 
          rounded-lg 
          bg-red-500 text-white 
          flex items-center justify-center 
          shadow 
          transition
        "
      >
        <X size={16} />
      </button>

      {/* ---- EDIT BUTTON ---- */}
      <button
        className="
          absolute top-2 right-2 
          w-8 h-8 
          border border-[#e57373]/70 
          rounded-lg 
          flex items-center justify-center 
          bg-white 
          hover:bg-[#ffecec] 
          transition
        "
      >
        <Edit size={16} className="text-[#e57373]" />
      </button>

      {/* ---- Icon + Text ---- */}
      <div className="flex items-center gap-4 mt-2">

        {/* Icon Box */}
        <div className="w-12 h-12 rounded-xl bg-[#fde4e4] flex items-center justify-center shadow-inner">
          <FaGoogle size={26} className="text-[#e57373]" />
        </div>

        {/* Title + Description */}
        <div className="leading-tight">
          <h3 className="text-[17px] font-semibold text-gray-800">Gmail</h3>

          <p className="text-[13px] text-gray-500 mt-[3px]">
            Send Email Message
          </p>
        </div>

      </div>

      {/* ---- ReactFlow Handles ---- */}
      <Handle 
        type="target" 
        position="top" 
        className="!w-4 !h-2 !rounded-full !bg-gray-400 !border-2 !border-white"
      />

      <Handle 
        type="source" 
        position="bottom" 
        className="!w-4 !h-2 !rounded-full !bg-gray-400 !border-2 !border-white"
      />
<button
onClick={(e) => {
  e.stopPropagation();
  data?.openModuleModal?.(data?.id);
}}
  className="
    absolute 
    left-1/2 
    bottom-[-15px] 
    -translate-x-1/2
    w-8 h-8 
    rounded-full 
    bg-white 
    border border-gray-300 
    flex items-center justify-center 
    shadow-md 
    hover:bg-gray-100 
    hover:scale-110 
    transition 
    z-10
  "
>
  <Plus size={16} className="text-gray-700" />
</button>
    </div>
  );
};

export default GmailNode;

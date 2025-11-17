import React from "react";
import { Handle } from "reactflow";
import { Eye, X } from "lucide-react";

const ConditionNode = ({ data }) => {
  return (
    <div
      className="
        relative group
        px-5 py-4 
        bg-white 
        rounded-2xl 
        border border-[#facc15] 
        shadow-[0_2px_8px_rgba(0,0,0,0.06)] 
        w-[260px]
      "
      onClick={() => data?.openConditionModal?.()}  // ★ OPEN MODAL ON CLICK
    >

      {/* ---- DELETE BUTTON ---- */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          data?.deleteNode();
        }}
        className="
          opacity-0 group-hover:opacity-100 
          absolute top-2 right-12
          w-7 h-7 
          rounded-xl 
          bg-red-500 text-white 
          flex items-center justify-center 
          shadow 
          transition
        "
      >
        <X size={16} />
      </button>

      {/* ---- VIEW BUTTON ---- */}
      <button
  onClick={(e) => {
    e.stopPropagation();
    data?.openConditionModal?.();
  }}
  className="
    absolute top-2 right-2 
    w-8 h-8 
    border border-[#facc15]
    rounded-xl 
    flex items-center justify-center 
    bg-white 
    hover:bg-[#fffce7] 
    transition
  "
>
  <Eye size={16} className="text-[#eab308]" />
</button>


      {/* Icon + Text */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-[#fef9c3] flex items-center justify-center">
          <svg
            stroke="#eab308"
            fill="none"
            strokeWidth="2"
            viewBox="0 0 24 24"
            width="28"
            height="28"
          >
            <path d="M10 3H3v18h18V10h-7z"></path>
            <circle cx="12" cy="14" r="3"></circle>
          </svg>
        </div>

        <div className="leading-tight">
          <h3 className="text-[16px] font-semibold text-gray-800">
            Condition
          </h3>
          <p className="text-[13px] text-gray-500 mt-[2px]">
            Filter criteria
          </p>
        </div>
      </div>

      <Handle type="source" position="bottom" className="!bg-gray-400" />
      <Handle type="target" position="top" className="!bg-gray-400" />
    </div>
  );
};

export default ConditionNode;

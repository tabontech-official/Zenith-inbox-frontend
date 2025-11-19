import React from "react";
import { Handle } from "reactflow";
import { FiFileText } from "react-icons/fi";
import { Plus, X, AlertCircle } from "lucide-react";

const TemplateNode = ({ data }) => {
  const highlightStyle = data?.highlight
    ? "border-red-500 shadow-[0_0_12px_rgba(255,0,0,0.6)] bg-gradient-to-br from-red-50 to-red-100"
    : data?.success
    ? "border-green-500 shadow-[0_0_12px_rgba(34,197,94,0.6)] bg-gradient-to-br from-green-50 to-green-100"
    : "";

  return (
    <div
      className={`
        relative group   /* THIS enables hover effects for children */
        px-5 py-5 
        rounded-2xl 
        border-2 
        shadow-[0_3px_10px_rgba(0,0,0,0.05)]
        w-[260px]
        transition-all
        ${highlightStyle}
      `}
    >
      {/* ---- DELETE BUTTON (only on hover) ---- */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          data?.confirmDeleteNode?.(data?.id);
        }}
        className="
          opacity-0 group-hover:opacity-100   /* <-- show only on hover */
          absolute top-3 right-3
          w-8 h-8 
          rounded-lg 
          bg-red-500 text-white 
          flex items-center justify-center 
          shadow 
          hover:bg-red-600
          transition z-20
        "
      >
        <X size={16} />
      </button>

      {/* ---- ERROR MESSAGE ---- */}
      {data?.errorMessage && (
        <div
          className="
            w-full flex items-center gap-2
            bg-red-100 border border-red-300 
            text-red-700 text-sm 
            px-3 py-2 rounded-lg mt-10
          "
        >
          <AlertCircle size={16} />
          <span>{data.errorMessage}</span>
        </div>
      )}

      {/* ---- ICON + TITLE ---- */}
      <div className="flex items-center gap-4 mt-4">
        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center shadow-inner">
          <FiFileText size={26} className="text-blue-500" />
        </div>

        <div className="leading-tight">
          <h3 className="text-[17px] font-semibold text-gray-800">
            Email Template
          </h3>
          <p className="text-[13px] text-gray-500 mt-[3px]">
            Use Predefined Template
          </p>
        </div>
      </div>

      {/* ---- HANDLES ---- */}
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

      {/* ---- ADD MODULE BUTTON ---- */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          data?.openModuleModal?.(data?.id);
        }}
        className="
          absolute left-1/2 bottom-[-15px] -translate-x-1/2
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

export default TemplateNode;

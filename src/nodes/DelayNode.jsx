// import React from "react";
// import { Handle } from "reactflow";
// import { Clock, Edit, X, Plus } from "lucide-react";

// const DelayNode = ({ data }) => {

//   // --- Highlight Effect ---
//   const highlightStyle = data?.highlight
//   ? "border-red-500 shadow-[0_0_12px_rgba(255,0,0,0.6)] bg-gradient-to-br from-red-50 to-red-100"
//   : data?.success
//   ? "border-green-500 shadow-[0_0_12px_rgba(34,197,94,0.6)] bg-gradient-to-br from-green-50 to-green-100"
//   : ""; // default

//   return (
//     <div
//       className={`
//         relative group
//         px-5 py-5 
//         rounded-2xl 
//         border-2 
//         shadow-[0_3px_10px_rgba(0,0,0,0.05)]
//         w-[260px]
//         transition-all
//         ${highlightStyle}
//       `}
//     >

//       {/* Delete Button */}
//       <button
//         onClick={(e) => {
//           e.stopPropagation();
//           data?.confirmDeleteNode(data.id);
//         }}
//         className="
//           opacity-0 group-hover:opacity-100 
//           absolute top-2 right-12
//           w-7 h-7 
//           rounded-lg 
//           bg-red-500 text-white 
//           flex items-center justify-center 
//           shadow 
//           transition
//         "
//       >
//         <X size={16} />
//       </button>

//       {/* Edit Button */}
//       <button
//         onClick={(e) => {
//           e.stopPropagation();
//           data?.openModuleModal?.(data?.id);
//         }}
//         className="
//           absolute top-2 right-2 
//           w-8 h-8 
//           border border-[#6aa9ff]/70 
//           rounded-lg 
//           flex items-center justify-center 
//           bg-white 
//           hover:bg-[#f2f7ff] 
//           transition
//         "
//       >
//         <Edit size={16} className="text-[#6aa9ff]" />
//       </button>

//       {/* Icon + Text */}
//       <div className="flex items-center gap-4 mt-2">
//         <div className="w-12 h-12 rounded-xl bg-[#e4efff] flex items-center justify-center">
//           <Clock size={26} className="text-[#6aa9ff]" />
//         </div>

//         <div className="leading-tight">
//           <h3 className="text-[17px] font-semibold text-gray-800">Delay</h3>
//           <p className="text-[13px] text-gray-500 mt-[3px]">
//             {data?.config?.delayValue || 5}{" "}
//             {data?.config?.delayUnit || "seconds"}
//           </p>
//         </div>
//       </div>

//       {/* Handles */}
//       <Handle
//         type="target"
//         position="top"
//         className="!w-4 !h-2 !rounded-full !bg-gray-400 !border-2 !border-white"
//       />
//       <Handle
//         type="source"
//         position="bottom"
//         className="!w-4 !h-2 !rounded-full !bg-gray-400 !border-2 !border-white"
//       />

//       {/* Bottom Center Add Button */}
//       <button
//         onClick={(e) => {
//           e.stopPropagation();
//           data?.openModuleModal?.(data?.id);
//         }}
//         className="
//           absolute 
//           left-1/2 
//           bottom-[-15px] 
//           -translate-x-1/2
//           w-8 h-8 
//           rounded-full 
//           bg-white 
//           border border-gray-300 
//           flex items-center justify-center 
//           shadow-md 
//           hover:bg-gray-100 
//           hover:scale-110 
//           transition 
//           z-10
//         "
//       >
//         <Plus size={16} className="text-gray-700" />
//       </button>

//     </div>
//   );
// };

// export default DelayNode;
import React from "react";
import { Handle } from "reactflow";
import { Clock, Edit, X, Plus, AlertCircle } from "lucide-react";

const DelayNode = ({ data }) => {
  const highlightStyle = data?.highlight
    ? "border-red-500 shadow-[0_0_12px_rgba(255,0,0,0.6)] bg-gradient-to-br from-red-50 to-red-100"
    : data?.success
    ? "border-green-500 shadow-[0_0_12px_rgba(34,197,94,0.6)] bg-gradient-to-br from-green-50 to-green-100"
    : "";

  return (
    // <div
    //   className={`
    //     relative group
    //     px-5 py-5 
    //     rounded-2xl 
    //     border-2 
    //     shadow-[0_3px_10px_rgba(0,0,0,0.05)]
    //     w-[260px]
    //     transition-all
    //     ${highlightStyle}
    //   `}
    // >
       <div
      className={`
        relative group
        px-5 py-5 
        rounded-2xl 
        bg-white 
        border-2 
        shadow-[0_3px_10px_rgba(0,0,0,0.05)]
        w-[260px]
        transition-all
        ${highlightStyle}
      `}
    >


      {/* ---- Delete Button ---- */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          data?.confirmDeleteNode(data.id);
        }}
        className="
          opacity-0 group-hover:opacity-100
          absolute top-3 right-14
          w-7 h-7 
          rounded-lg 
          bg-red-500 text-white 
          flex items-center justify-center 
          shadow 
          transition z-20
        "
      >
        <X size={16} />
      </button>

      {/* ---- Edit Button ---- */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          data?.openModuleModal?.(data?.id);
        }}
        className="
          absolute top-3 right-3 
          w-8 h-8 
          border border-blue-300 
          rounded-lg 
          flex items-center justify-center 
          bg-white 
          hover:bg-blue-50 
          transition z-20
        "
      >
        <Edit size={16} className="text-blue-500" />
      </button>

      {/* ---- Error Message ---- */}
      {data?.errorMessage && (
        <div className="
          w-full
          flex items-center gap-2
          bg-red-100 
          border border-red-300 
          text-red-700 
          text-sm 
          px-3 py-2 
          rounded-lg 
          mt-10
        ">
          <AlertCircle size={16} />
          <span>{data.errorMessage}</span>
        </div>
      )}

      {/* ---- Icon + Title ---- */}
      <div className="flex items-center gap-4 mt-4">
        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center shadow-inner">
          <Clock size={26} className="text-blue-500" />
        </div>

        <div className="leading-tight">
          <h3 className="text-[17px] font-semibold text-gray-800">Delay</h3>
          <p className="text-[13px] text-gray-500 mt-[3px]">
            {data?.config?.delayValue || 5} {data?.config?.delayUnit || "seconds"}
          </p>
        </div>
      </div>

      {/* ---- Handles ---- */}
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

      {/* ---- Add Button ---- */}
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

export default DelayNode;

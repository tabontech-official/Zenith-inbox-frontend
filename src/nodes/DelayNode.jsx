// import React from "react";
// import { Handle } from "reactflow";
// import { Clock, Edit, X } from "lucide-react";

// const DelayNode = ({ data }) => {
//   return (
//     <div
//       className="
//         relative group
//         px-5 py-4 
//         bg-white 
//         rounded-2xl 
//         border border-[#6aa9ff] 
//         shadow-[0_2px_8px_rgba(0,0,0,0.06)] 
//         w-[260px]
//       "
//     >

//       {/* ---- DELETE BUTTON (hover only) ---- */}
//       <button
//   onClick={(e) => {
//     e.stopPropagation();  
//     data?.deleteNode();
//   }}
//   className="
//     opacity-0 group-hover:opacity-100 
//     absolute top-2 right-12
//     w-7 h-7 
//     rounded-xl 
//     bg-red-500 text-white 
//     flex items-center justify-center 
//     shadow 
//     transition
//   "
// >
//   <X size={16} />
// </button>

//       {/* ---- EDIT BUTTON ---- */}
//       <button
//         className="
//           absolute top-2 right-2 
//           w-8 h-8 
//           border border-[#6aa9ff] 
//           rounded-xl 
//           flex items-center justify-center 
//           bg-white 
//           hover:bg-[#f2f7ff] 
//           transition
//         "
//       >
//         <Edit size={16} className="text-[#6aa9ff]" />
//       </button>

//       {/* ---- Icon + Title ---- */}
//       <div className="flex items-center gap-4">

//         {/* Icon Box */}
//         <div className="w-12 h-12 rounded-xl bg-[#e4efff] flex items-center justify-center">
//           <Clock size={26} className="text-[#6aa9ff]" />
//         </div>

//         {/* Title + Delay text */}
//         <div className="leading-tight">
//           <h3 className="text-[16px] font-semibold text-gray-800">Delay</h3>

//           <p className="text-[13px] text-gray-500 mt-[2px]">
//             {data?.config?.delayValue || 5}{" "}
//             {data?.config?.delayUnit || "seconds"}
//           </p>
//         </div>

//       </div>

//       {/* ---- ReactFlow Handles ---- */}
//       <Handle type="target" position="top" className="!bg-gray-400" />
//       <Handle type="source" position="bottom" className="!bg-gray-400" />
//     </div>
//   );
// };

// export default DelayNode;
import React from "react";
import { Handle } from "reactflow";
import { Clock, Edit, X, Plus } from "lucide-react";

const DelayNode = ({ data }) => {
  return (
    <div
      className="
        relative group
        px-5 py-5 
        bg-white 
        rounded-2xl 
        border-2 border-[#6aa9ff]/60
        shadow-[0_3px_10px_rgba(0,0,0,0.05)] 
        w-[260px]
        transition-all
      "
    >

      {/* Delete Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          data?.deleteNode();
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

      {/* Edit Button */}
      <button
        className="
          absolute top-2 right-2 
          w-8 h-8 
          border border-[#6aa9ff]/70 
          rounded-lg 
          flex items-center justify-center 
          bg-white 
          hover:bg-[#f2f7ff] 
          transition
        "
      >
        <Edit size={16} className="text-[#6aa9ff]" />
      </button>

      {/* Icon + Text */}
      <div className="flex items-center gap-4 mt-2">
        <div className="w-12 h-12 rounded-xl bg-[#e4efff] flex items-center justify-center">
          <Clock size={26} className="text-[#6aa9ff]" />
        </div>

        <div className="leading-tight">
          <h3 className="text-[17px] font-semibold text-gray-800">Delay</h3>
          <p className="text-[13px] text-gray-500 mt-[3px]">
            {data?.config?.delayValue || 5}{" "}
            {data?.config?.delayUnit || "seconds"}
          </p>
        </div>
      </div>

      {/* Handles */}
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

      {/* Bottom Center Add Button */}
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

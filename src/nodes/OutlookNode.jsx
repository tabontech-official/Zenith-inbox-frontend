// src/scenario-builder/nodes/OutlookNode.jsx
import React from "react";
import { Handle } from "reactflow";
import { FaMicrosoft } from "react-icons/fa";

const OutlookNode = ({ data }) => {
  return (
    <div className="p-4 bg-blue-600 text-white rounded-xl shadow-md min-w-[180px]">
      <div className="flex items-center gap-2">
        <FaMicrosoft className="w-6 h-6" />
        <h3 className="font-semibold">Outlook</h3>
      </div>

      <p className="text-xs mt-1 opacity-80">Send Email</p>

      <Handle type="target" position="left" className="bg-white" />
      <Handle type="source" position="right" className="bg-white" />
    </div>
  );
};

export default OutlookNode;

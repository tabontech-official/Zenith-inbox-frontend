// src/scenario-builder/nodes/CustomEmailNode.jsx
import React from "react";
import { Handle } from "reactflow";
import { FaEnvelope } from "react-icons/fa";

const CustomEmailNode = ({ data }) => {
  const subject = data?.config?.subject || "Custom Email";
  const to = data?.config?.to || "Recipient";

  return (
    <div className="p-4 bg-purple-600 text-white rounded-xl shadow-md min-w-[200px]">
      <div className="flex items-center gap-2">
        <FaEnvelope className="w-6 h-6" />
        <h3 className="font-semibold">Custom Email</h3>
      </div>

      <div className="mt-2 text-xs opacity-90">
        <p><span className="font-semibold">To:</span> {to}</p>
        <p><span className="font-semibold">Subject:</span> {subject}</p>
      </div>

      <Handle type="target" position="left" className="bg-white" />
      <Handle type="source" position="right" className="bg-white" />
    </div>
  );
};

export default CustomEmailNode;

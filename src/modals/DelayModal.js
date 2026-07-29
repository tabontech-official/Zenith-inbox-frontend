import React, { useState } from "react";
import { X } from "lucide-react";

const DelayModal = ({ node, onSave, onClose }) => {
  const config = node?.data?.config || {};

  const [delayValue, setDelayValue] = useState(config.delayValue || 5);
  const [delayUnit, setDelayUnit] = useState(config.delayUnit || "seconds");

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white w-[400px] rounded-[8px] shadow-lg">
        <div className="flex items-center justify-between bg-[#111110] text-white px-4 py-3 rounded-t-lg">
          <h2 className="font-semibold">Configure Delay</h2>
          <button onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <label className="text-sm font-medium">Delay Value</label>
          <input
            type="number"
            className="w-full border rounded px-3 py-2"
            value={delayValue}
            onChange={(e) => setDelayValue(e.target.value)}
          />

          <label className="text-sm font-medium">Delay Unit</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={delayUnit}
            onChange={(e) => setDelayUnit(e.target.value)}
          >
            <option value="seconds">Seconds</option>
            <option value="minutes">Minutes</option>
            <option value="hours">Hours</option>
          </select>
        </div>

        <div className="flex justify-end gap-2 px-4 py-3 border-t bg-gray-50">
          <button onClick={onClose} className="px-4 py-2 border rounded-md">
            Cancel
          </button>
          <button
            onClick={() => onSave({ delayValue, delayUnit })}
            className="px-6 py-2 bg-[#111110]  text-white rounded-md"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default DelayModal;

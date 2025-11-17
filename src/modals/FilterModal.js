import React, { useState } from "react";
import { X, Plus } from "lucide-react";

const emptyCond = { field: "", operator: "Equal to", value: "" };

const FilterModal = ({ node, onSave, onClose }) => {
  const config = node?.data?.config || {};

  const [label, setLabel] = useState(config.label || "");
  const [conditions, setConditions] = useState(
    config.conditions?.length ? config.conditions : [emptyCond]
  );

  const updateCond = (i, key, value) => {
    setConditions((prev) => {
      const arr = [...prev];
      arr[i][key] = value;
      return arr;
    });
  };

  const addCond = () => setConditions([...conditions, emptyCond]);

  const removeCond = (index) =>
    setConditions((prev) => prev.filter((_, i) => i !== index));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white w-[600px] rounded-lg shadow-xl">
        <div className="flex items-center justify-between bg-green-600 text-white px-4 py-3 rounded-t-lg">
          <h2 className="font-semibold">Router Filter</h2>
          <button onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div>
            <label className="text-sm font-medium">Label</label>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full border rounded px-3 py-2 mt-1"
              placeholder="Branch Label (optional)"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Conditions</label>

            {conditions.map((cond, index) => (
              <div
                key={index}
                className="border rounded-lg p-3 bg-gray-50 mt-3 space-y-2"
              >
                <select
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={cond.field}
                  onChange={(e) => updateCond(index, "field", e.target.value)}
                >
                  <option value="">Select Field</option>
                  <option value="From">From</option>
                  <option value="To">To</option>
                  <option value="Subject">Subject</option>
                  <option value="Body">Body</option>
                </select>

                <select
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={cond.operator}
                  onChange={(e) =>
                    updateCond(index, "operator", e.target.value)
                  }
                >
                  <option value="Equal to">Equal to</option>
                  <option value="Contains">Contains</option>
                  <option value="Does not contain">Does not contain</option>
                </select>

                <input
                  className="w-full border rounded px-3 py-2 text-sm"
                  placeholder="Enter value"
                  value={cond.value}
                  onChange={(e) => updateCond(index, "value", e.target.value)}
                />

                <button
                  onClick={() => removeCond(index)}
                  className="text-red-600 text-xs"
                >
                  Remove Condition
                </button>
              </div>
            ))}

            <button
              onClick={addCond}
              className="flex items-center gap-1 px-3 py-2 bg-green-500 text-white text-xs rounded mt-3"
            >
              <Plus className="w-4 h-4" /> Add Condition
            </button>
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border rounded-md">
            Cancel
          </button>
          <button
            onClick={() => onSave({ label, conditions })}
            className="px-4 py-2 bg-green-600 text-white rounded-md"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;

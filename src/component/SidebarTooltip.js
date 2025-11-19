// SidebarTooltip.jsx
import { useEffect, useState } from "react";

export default function SidebarTooltip({ step, refs, onNext, onSkip }) {
  const [pos, setPos] = useState(null);

  const getRef = () => {
    switch (step) {
      case 1: return refs.leadRef.current;
      case 2: return refs.allScenarioRef.current;
      case 3: return refs.shopifyScenarioRef.current;
      case 4: return refs.customScenarioRef.current;
      default: return null;
    }
  };

  const titles = {
    1: "Lead Conversation",
    2: "All Scenarios",
    3: "Shopify Scenario",
    4: "Custom Scenario",
  };

  useEffect(() => {
    const el = getRef();
    if (!el) return;

    const rect = el.getBoundingClientRect();
    setPos({
      top: rect.top + window.scrollY + 5,
      left: rect.right + 20,
    });
  }, [step]);

  if (!pos) return null;

  return (
    <>
      {/* Background Blur */}
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[30]" />

      {/* Tooltip */}
      <div
        className="absolute z-[999] bg-white border border-gray-200 shadow-xl p-4 rounded-lg w-72"
        style={{ top: pos.top, left: pos.left }}
      >
        {/* Arrow */}
        <div className="absolute left-[-8px] top-5 w-4 h-4 bg-white rotate-45 border-l border-t border-gray-200" />

        <h3 className="font-semibold text-gray-900">{titles[step]}</h3>
        <p className="text-sm text-gray-600 mb-3">
          This section helps you manage {titles[step]}.
        </p>

        <div className="flex justify-between">
          <button
            onClick={onSkip}
            className="px-3 py-1 border rounded-md text-sm hover:bg-gray-100"
          >
            Skip
          </button>

          <button
            onClick={onNext}
            className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
}

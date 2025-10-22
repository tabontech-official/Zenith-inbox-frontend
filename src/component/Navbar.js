import React, { useState } from "react";
import {
  FiEdit3,
  FiMoreVertical,
  FiHelpCircle,
  FiSend,
  FiBell,
} from "react-icons/fi";
import OrganizationSettingsModal from "./OrganizationSettingsModal";
import ScenarioSelectModal from "./ScenarioSelectModal";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [openScenario, setOpenScenario] = useState(false);
  const handleSelect = (type) => {
    console.log("Selected Scenario:", type);
    setOpenScenario(false);
  };
  return (
    <header className="w-full bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-end sticky top-0 z-30 shadow-sm">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 bg-white border border-gray-300 hover:border-gray-400 text-gray-700 px-3 py-1.5 rounded-md text-sm font-medium transition"
        >
          <FiEdit3 className="text-gray-500" />
          Organization settings
        </button>

        <button className="p-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100 transition">
          <FiMoreVertical className="w-4 h-4" />
        </button>

        <button
          onClick={() => setOpenScenario(true)}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-1.5 rounded-md text-sm font-medium transition"
        >
          + Create scenario
        </button>

        <div className="w-px h-6 bg-gray-300 mx-2"></div>

        {/* <button className="p-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100 transition">
          <FiHelpCircle className="w-5 h-5" />
        </button>
        <button className="p-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100 transition">
          <FiSend className="w-5 h-5" />
        </button>
        <button className="p-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100 transition">
          <FiBell className="w-5 h-5" />
        </button> */}

        <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm font-semibold cursor-pointer hover:bg-purple-700 transition">
          MR
        </div>
      </div>
      <OrganizationSettingsModal
        open={open}
        onClose={() => setOpen(false)}
        // onSave={handleSave}
      />
      <ScenarioSelectModal
        open={openScenario}
        onClose={() => setOpenScenario(false)}
        onSelect={handleSelect}
      />
    </header>
  );
};

export default Navbar;

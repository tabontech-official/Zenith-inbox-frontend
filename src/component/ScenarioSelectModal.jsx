import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiShoppingBag, FiSettings } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const ScenarioSelectModal = ({ open, onClose }) => {
  const navigate = useNavigate();

  const handleSelect = (type) => {
    if (type === "shopify") {
      navigate("/scenarios/shopify");
    } else if (type === "custom") {
      navigate("/scenarios/others");
    }
    onClose(); 
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center bg-black/40 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 relative"
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <FiX className="w-5 h-5" />
            </button>

            {/* Title */}
            <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">
              Choose Scenario Type
            </h2>

            {/* Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleSelect("shopify")}
                className="flex flex-col items-center justify-center border border-gray-200 hover:border-indigo-500 rounded-xl p-6 transition group shadow-sm"
              >
                <div className="bg-indigo-100 text-indigo-600 p-3 rounded-full mb-3 group-hover:bg-indigo-200">
                  <FiShoppingBag size={24} />
                </div>
                <h3 className="font-semibold text-gray-800 text-base">
                  Shopify Scenario
                </h3>
                <p className="text-sm text-gray-500 mt-1 text-center">
                  Automate your Shopify Partner Lead Response.
                </p>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleSelect("custom")}
                className="flex flex-col items-center justify-center border border-gray-200 hover:border-indigo-500 rounded-xl p-6 transition group shadow-sm"
              >
                <div className="bg-indigo-100 text-indigo-600 p-3 rounded-full mb-3 group-hover:bg-indigo-200">
                  <FiSettings size={24} />
                </div>
                <h3 className="font-semibold text-gray-800 text-base">
                  Custom Scenario
                </h3>
                <p className="text-sm text-gray-500 mt-1 text-center">
                  Automate your Business Lead Replies.
                </p>
              </motion.button>
            </div>

            {/* Cancel button */}
            <div className="mt-6 flex justify-center">
              <button
                onClick={onClose}
                className="text-sm text-gray-500 hover:text-gray-700 transition"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ScenarioSelectModal;

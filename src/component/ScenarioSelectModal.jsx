import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiShoppingBag, FiSettings, FiArrowRight } from "react-icons/fi";
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
          className="fixed inset-0 z-[9999] flex min-h-screen items-center justify-center overflow-y-auto bg-slate-950/45 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="scenario-select-title"
        >
          <motion.div
            className="relative my-auto flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
              <div>
                <h2
                  id="scenario-select-title"
                  className="text-xl font-semibold tracking-tight text-slate-950"
                >
                  Choose Scenario Type
                </h2>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Select the type of automation you want to create or manage.
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                aria-label="Close modal"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <motion.button
                  type="button"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelect("shopify")}
                  className="group flex min-h-[190px] flex-col rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-indigo-300 hover:bg-indigo-50/40 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                >
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 transition group-hover:bg-indigo-100">
                    <FiShoppingBag className="h-6 w-6" />
                  </div>

                  <h3 className="text-base font-semibold text-slate-950">
                    Shopify Scenario
                  </h3>

                  <p className="mt-2 flex-1 text-sm leading-6 text-slate-500">
                    Automate your Shopify Partner lead response workflow.
                  </p>

                  <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600">
                    Continue
                    <FiArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                  </div>
                </motion.button>

                <motion.button
                  type="button"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelect("custom")}
                  className="group flex min-h-[190px] flex-col rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-indigo-300 hover:bg-indigo-50/40 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                >
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 transition group-hover:bg-indigo-100">
                    <FiSettings className="h-6 w-6" />
                  </div>

                  <h3 className="text-base font-semibold text-slate-950">
                    Custom Scenario
                  </h3>

                  <p className="mt-2 flex-1 text-sm leading-6 text-slate-500">
                    Build a custom automation for your business lead replies.
                  </p>

                  <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600">
                    Continue
                    <FiArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                  </div>
                </motion.button>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50/60 px-6 py-4">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
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
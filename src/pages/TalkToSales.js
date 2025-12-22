import React from "react";
import { motion } from "framer-motion";
import { FiCheckCircle, FiArrowRight } from "react-icons/fi";
import Header from "../component/Header";

/* =======================
   ANIMATIONS
======================= */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const TalkToSales = () => {
  return (
    <div className="min-h-screen bg-[#030014] text-white relative overflow-x-hidden">
      <Header />

      {/* AMBIENT BACKGROUND */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-0 left-1/4 w-[420px] h-[420px] bg-purple-600/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 right-1/4 w-[420px] h-[420px] bg-blue-600/10 rounded-full blur-[140px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
      </div>

      {/* MAIN */}
      <main className="relative pt-24 sm:pt-28 md:pt-32 pb-12 px-4 sm:px-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-7xl mx-auto"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            
            {/* LEFT CONTENT */}
            <motion.div variants={fadeUp} className="space-y-10">
              <div className="space-y-6">
                <span
                  className="inline-flex px-4 py-1.5 rounded-full
                             bg-purple-500/10 border border-purple-500/20
                             text-xs font-semibold text-purple-400 uppercase tracking-widest"
                >
                  Lead Automation Strategy
                </span>

                <h1
                  className="font-black leading-tight
                             text-[clamp(2.4rem,5vw,3.75rem)]"
                >
                  Design your lead <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-400 to-blue-400">
                    automation system.
                  </span>
                </h1>

                <p className="text-base sm:text-lg text-gray-400 max-w-xl leading-relaxed">
                  Work with our team to design powerful lead automation flows —
                  from email capture and conditional logic to delays, templates,
                  and automated follow-ups tailored to your business.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 max-w-lg">
                {[
                  "Visual lead automation scenarios (no-code)",
                  "Conditional logic & smart routing",
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-4 rounded-2xl
                               bg-white/[0.03] border border-white/5
                               hover:border-purple-500/30 transition"
                  >
                    <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <FiCheckCircle className="text-purple-400 w-4 h-4" />
                    </div>
                    <span className="text-gray-300 font-medium">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* RIGHT FORM */}
            <motion.div variants={fadeUp} className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 blur-2xl opacity-20 rounded-[2.5rem]" />

              <div
                className="relative rounded-[2rem] bg-black/40
                           border border-white/10 backdrop-blur-3xl
                           p-6 sm:p-8 md:p-10 shadow-2xl"
              >
                <h2 className="text-2xl sm:text-3xl font-bold mb-8">
                  Request a Sales Call
                </h2>

                <form
                  className="space-y-6"
                  onSubmit={(e) => e.preventDefault()}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Input label="Full Name" placeholder="John Doe" />
                    <Input label="Work Email" placeholder="john@company.com" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Input label="Company Name" placeholder="Company Inc." />

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">
                        Company Size
                      </label>
                      <select
                        className="w-full bg-white/[0.05] border border-white/10
                                   rounded-2xl px-5 py-4
                                   focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      >
                        <option className="bg-[#030014]">1–10</option>
                        <option className="bg-[#030014]">11–50</option>
                        <option className="bg-[#030014]">51–200</option>
                        <option className="bg-[#030014]">200+</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">
                      Project Goals
                    </label>
                    <textarea
                      rows="3"
                      placeholder="Describe your use case..."
                      className="w-full bg-white/[0.05] border border-white/10
                                 rounded-2xl px-5 py-4 resize-none
                                 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    />
                  </div>

                  <button
                    type="submit"
                    className="group w-full py-4 rounded-2xl
                               font-black text-base sm:text-lg
                               bg-white text-black hover:bg-purple-50 transition
                               flex items-center justify-center gap-3"
                  >
                    Book Strategy Session
                    <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

/* INPUT */
const Input = ({ label, placeholder }) => (
  <div>
    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">
      {label}
    </label>
    <input
      type="text"
      placeholder={placeholder}
      className="w-full bg-white/[0.05] border border-white/10
                 rounded-2xl px-5 py-4
                 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
    />
  </div>
);

export default TalkToSales;

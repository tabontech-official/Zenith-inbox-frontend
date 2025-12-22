import React from "react";
import { motion } from "framer-motion";
import { FiMail, FiCheck, FiArrowRight, FiStar } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import Header from "../component/Header";

/* =======================
   Animations
======================= */
const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

const Pricing = () => {
  const navigate = useNavigate();

  return (
    // Changed h-screen to min-h-screen and removed overflow-hidden to allow scrolling on mobile
    <div className="min-h-screen bg-[#030014] text-white relative selection:bg-purple-500/30 pb-20">
      <Header/>
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-purple-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-indigo-600/10 rounded-full blur-[120px]" />
      </div>

     

      {/* MAIN CONTENT */}
      <main className="relative z-10 pt-32 md:pt-40 px-6">
        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          className="w-full max-w-6xl mx-auto"
        >
          {/* Title - Responsive font sizes */}
          <motion.h1
            variants={fadeUp}
            className="text-center text-4xl sm:text-5xl md:text-6xl font-black mb-10 md:mb-16 leading-tight"
          >
            Simple pricing for{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">
              lead automation
            </span>
          </motion.h1>

          {/* Pricing Grid - Stacks on mobile, 2 cols on tablet/desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10 items-stretch max-w-4xl mx-auto">

            {/* FREE PLAN */}
            <motion.div
              variants={fadeUp}
              className="flex flex-col justify-between rounded-3xl p-6 md:p-8
                         bg-gradient-to-b from-white/[0.04] to-white/[0.01]
                         border border-white/10 shadow-xl"
            >
              <div>
                <h3 className="text-xl font-bold mb-2">Free</h3>
                <p className="text-gray-400 mb-6 text-sm md:text-base">
                  Everything you need to start automating leads.
                </p>

                <div className="flex items-end gap-2 mb-8">
                  <span className="text-4xl md:text-5xl font-black">$0</span>
                  <span className="text-gray-400 mb-1">/month</span>
                </div>

                <ul className="space-y-4 text-sm">
                  {[
                    "Visual scenario builder",
                    "Email lead capture (mailhook)",
                    "Conditions & delays",
                    "Manual email templates",
                    "Basic lead tracking",
                  ].map((f, i) => (
                    <li key={i} className="flex items-center gap-3 text-gray-300">
                      <FiCheck className="text-purple-400 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => navigate("/login")}
                className="mt-8 w-full py-4 rounded-xl font-bold
                           bg-white text-black hover:bg-purple-50 transition"
              >
                Start for Free
              </button>
            </motion.div>

            {/* PRO PLAN */}
            <motion.div
              variants={fadeUp}
              className="relative flex flex-col justify-between rounded-3xl p-6 md:p-8
                         bg-gradient-to-br from-purple-600/30 via-indigo-600/10 to-transparent
                         border border-purple-500/50
                         shadow-[0_0_80px_rgba(139,92,246,0.15)] md:shadow-[0_0_80px_rgba(139,92,246,0.35)]"
            >
              {/* Badge */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2
                              px-4 py-1 rounded-full
                              bg-gradient-to-r from-purple-500 to-indigo-500
                              text-[10px] md:text-xs font-bold uppercase tracking-widest whitespace-nowrap">
                Coming Soon
              </div>

              <div>
                <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                  Pro <FiStar className="text-yellow-400" />
                </h3>
                <p className="text-gray-300 mb-6 text-sm md:text-base">
                  AI-powered automation for serious teams.
                </p>

                <div className="flex items-end gap-2 mb-8">
                  <span className="text-4xl md:text-5xl font-black">$9.99</span>
                  <span className="text-gray-300 mb-1">/month</span>
                </div>

                <ul className="space-y-4 text-sm">
                  {[
                    "Everything in Free",
                    "AI-generated email templates",
                    "AI template suggestions",
                    "Smart conditional routing",
                    "Automated follow-up ideas",
                  ].map((f, i) => (
                    <li key={i} className="flex items-center gap-3 text-gray-200">
                      <FiCheck className="text-purple-400 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => navigate("/talk-to-sales")}
                className="mt-8 w-full py-4 rounded-xl font-bold
                           bg-gradient-to-r from-purple-500 to-indigo-500
                           hover:opacity-90 transition flex items-center justify-center gap-2"
              >
                Join Waitlist <FiArrowRight />
              </button>
            </motion.div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Pricing;
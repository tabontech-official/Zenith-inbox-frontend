import React from "react";
import { motion } from "framer-motion";
import { FiCheck, FiArrowRight, FiStar } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import Header from "../component/Header";

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
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

const Pricing = () => {
  const navigate = useNavigate();
  const handleProCheckout = async () => {
    try {
      const userId = localStorage.getItem("userid");

      if (!userId) {
        navigate("/login");
        return;
      }

      const res = await fetch(
        `https://email-syncing-backend.vercel.app/stripe/create-checkout-session/${userId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url; // 🔥 Stripe Checkout open
      }
    } catch (err) {
      console.error("Checkout error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#030014] text-white relative overflow-x-hidden">
      <Header />

      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-0 left-1/4 w-[420px] h-[420px] bg-purple-600/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 right-1/4 w-[420px] h-[420px] bg-indigo-600/10 rounded-full blur-[140px]" />
      </div>

      <main className="relative pt-24 sm:pt-28 md:pt-32 pb-10 px-4 sm:px-6">
        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          className="max-w-6xl mx-auto"
        >
          {/* TITLE */}
          <motion.h1
            variants={fadeUp}
            className="text-center font-black mb-10
                       text-[clamp(2.2rem,5vw,3.75rem)]
                       leading-tight"
          >
            Simple pricing for{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">
              lead automation
            </span>
          </motion.h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <motion.div
              variants={fadeUp}
              className="flex flex-col justify-between rounded-3xl p-6
                         bg-gradient-to-b from-white/[0.04] to-white/[0.01]
                         border border-white/10 shadow-xl"
            >
              <div>
                <h3 className="text-xl font-bold mb-2">Free</h3>
                <p className="text-gray-400 mb-5 text-sm">
                  Everything you need to start automating leads.
                </p>

                <div className="flex items-end gap-2 mb-6">
                  <span className="text-4xl font-black">$0</span>
                  <span className="text-gray-400 mb-1">/month</span>
                </div>

                <ul className="space-y-3 text-sm">
                  {[
                    "Visual scenario builder",
                    "Email lead capture (mailhook)",
                    "Conditions & delays",
                    "Manual email templates",
                    "Basic lead tracking",
                  ].map((f, i) => (
                    <li key={i} className="flex gap-3 text-gray-300">
                      <FiCheck className="text-purple-400 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => navigate("/login")}
                className="mt-6 w-full py-3 rounded-xl font-semibold
                           bg-white text-black hover:bg-purple-50 transition"
              >
                Start for Free
              </button>
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="relative flex flex-col justify-between rounded-3xl p-6
                         bg-gradient-to-br from-purple-600/30 via-indigo-600/10 to-transparent
                         border border-purple-500/50
                         shadow-[0_0_70px_rgba(139,92,246,0.35)]"
            >
              <div
                className="absolute -top-4 left-1/2 -translate-x-1/2
                              px-4 py-1 rounded-full
                              bg-gradient-to-r from-purple-500 to-indigo-500
                              text-xs font-bold uppercase tracking-wider"
              >
                Awesome
              </div>

              <div>
                <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                  Pro <FiStar className="text-yellow-400" />
                </h3>

                <p className="text-gray-300 mb-5 text-sm">
                  AI-powered automation for serious teams.
                </p>

                <div className="flex items-end gap-2 mb-6">
                  <span className="text-4xl font-black">$29.99</span>
                  <span className="text-gray-300 mb-1">/month</span>
                </div>

                <ul className="space-y-3 text-sm">
                  {[
                    "Everything in Free",
                    "AI-generated email templates",
                    "AI template suggestions",
                    "Smart conditional routing",
                    "Automated follow-up ideas",
                  ].map((f, i) => (
                    <li key={i} className="flex gap-3 text-gray-200">
                      <FiCheck className="text-purple-400 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={handleProCheckout}
                className="mt-6 w-full py-3 rounded-xl font-semibold
             bg-gradient-to-r from-purple-500 to-indigo-500
             hover:opacity-90 transition
             flex items-center justify-center gap-2"
              >
                Upgrade · Awesome <FiArrowRight />
              </button>
            </motion.div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Pricing;

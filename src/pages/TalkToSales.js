import React from "react";
import { motion } from "framer-motion";
import { FiCheckCircle, FiArrowRight } from "react-icons/fi";
import Header from "../component/Header";

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
    transition: { duration: 0.6 },
  },
};

const TalkToSales = () => {
  return (
    <div className="min-h-screen bg-[#030014] text-white overflow-x-hidden relative">

      <Header />

      {/* BACKGROUND GLOW */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-0 left-1/4 w-[380px] h-[380px] bg-purple-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-[380px] h-[380px] bg-blue-600/10 blur-[120px] rounded-full" />
      </div>

      <main className="pt-36 pb-24 px-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-7xl mx-auto"
        >
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* LEFT SIDE */}
            <motion.div variants={fadeUp} className="space-y-8">

              <span className="inline-flex px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-semibold text-purple-400 uppercase tracking-widest">
                Lead Automation Strategy
              </span>

              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                Design your lead automation system
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">
                  with our experts.
                </span>
              </h1>

              <p className="text-gray-400 text-lg leading-relaxed max-w-lg">
                Work with our team to design powerful lead automation flows —
                from email capture and conditional logic to templates and
                automated follow-ups tailored to your business.
              </p>

              {/* BENEFITS */}
              <div className="space-y-4 max-w-md">
                {[
                  "Visual automation scenarios (no-code)",
                  "Conditional logic & smart routing",
                  "Email templates & follow-up flows",
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:border-purple-500/30 transition"
                  >
                    <FiCheckCircle className="text-purple-400 w-5 h-5" />
                    <span className="text-gray-300">{item}</span>
                  </div>
                ))}
              </div>

            </motion.div>


            {/* RIGHT FORM */}
            <motion.div variants={fadeUp}>

              <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl p-8 shadow-xl">

                <h2 className="text-2xl font-semibold mb-6">
                  Request a Sales Call
                </h2>

                <form
                  className="space-y-5"
                  onSubmit={(e) => e.preventDefault()}
                >

                  <div className="grid sm:grid-cols-2 gap-5">
                    <Input label="Full Name" placeholder="John Doe" />
                    <Input label="Work Email" placeholder="john@company.com" />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5">
                    <Input label="Company Name" placeholder="Company Inc." />

                    <div>
                      <label className="block text-xs font-semibold uppercase text-gray-500 mb-2">
                        Company Size
                      </label>

                      <select className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500/40">
                        <option className="bg-[#030014]">1–10</option>
                        <option className="bg-[#030014]">11–50</option>
                        <option className="bg-[#030014]">51–200</option>
                        <option className="bg-[#030014]">200+</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-gray-500 mb-2">
                      Project Goals
                    </label>

                    <textarea
                      rows="3"
                      placeholder="Describe your use case..."
                      className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-white text-black font-semibold hover:bg-gray-200 transition flex items-center justify-center gap-2"
                  >
                    Book Strategy Session
                    <FiArrowRight />
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


/* INPUT COMPONENT */

const Input = ({ label, placeholder }) => (
  <div>
    <label className="block text-xs font-semibold uppercase text-gray-500 mb-2">
      {label}
    </label>

    <input
      type="text"
      placeholder={placeholder}
      className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
    />
  </div>
);

export default TalkToSales;
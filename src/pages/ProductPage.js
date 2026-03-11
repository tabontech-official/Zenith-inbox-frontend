import React from "react";
import { motion } from "framer-motion";
import {
  FiMail,
  FiZap,
  FiSend,
  FiRepeat,
  FiBarChart2,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import Header from "../component/Header";

const fadeUp = {
  hidden: { opacity: 0, y: 25 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

const ProductPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#030014] text-white overflow-x-hidden">

      <Header />

      <div className="px-6 pt-36 pb-24">

        {/* HERO */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="max-w-4xl mx-auto text-center mb-20"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Lead automation,
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">
              {" "}built visually
            </span>
          </h1>

          <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Design automated email replies, follow-ups, and decision flows —
            without writing code.
          </p>
        </motion.div>


        {/* FEATURES */}
        <div className="max-w-6xl mx-auto space-y-6">

          {/* Row 1 */}
          <div className="grid md:grid-cols-3 gap-6">

            <Feature
              icon={<FiZap />}
              title="Visual Scenario Builder"
              desc="Build automation flows using a drag-and-drop canvas with conditions, delays, and actions."
            />

            <Feature
              icon={<FiMail />}
              title="Email Lead Capture"
              desc="Capture leads via a simple mailhook or email forwarding — no integrations needed."
            />

            <Feature
              icon={<FiSend />}
              title="Template Replies"
              desc="Send predefined or AI-assisted email templates automatically based on your logic."
            />

          </div>


          {/* Row 2 */}
          <div className="grid md:grid-cols-2 gap-6 md:max-w-4xl mx-auto">

            <Feature
              icon={<FiRepeat />}
              title="Smart Follow-ups"
              desc="Add delays and automatically stop follow-ups when a lead replies."
            />

            <Feature
              icon={<FiBarChart2 />}
              title="Lead Tracking"
              desc="Track which leads were contacted, which templates were sent, and where each lead is in the flow."
            />

          </div>

        </div>


        {/* CTA */}
        <div className="mt-24 text-center">

          <h2 className="text-3xl font-semibold mb-6">
            Ready to automate your leads?
          </h2>

          <button
            onClick={() => navigate("/login")}
            className="px-9 py-4 bg-white text-black rounded-xl font-semibold hover:bg-gray-200 transition"
          >
            Start Automating Leads
          </button>

        </div>

      </div>

    </div>
  );
};


const Feature = ({ icon, title, desc }) => (
  <motion.div
    variants={fadeUp}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true }}
    whileHover={{ y: -6 }}
    className="p-7 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-purple-500/40 transition"
  >
    <div className="w-12 h-12 mb-5 rounded-xl bg-white/5 flex items-center justify-center text-xl text-purple-400">
      {icon}
    </div>

    <h3 className="text-lg font-semibold mb-2">
      {title}
    </h3>

    <p className="text-gray-400 text-sm leading-relaxed">
      {desc}
    </p>
  </motion.div>
);

export default ProductPage;
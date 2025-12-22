import React from "react";
import { motion } from "framer-motion";
import {
  FiMail,
  FiZap,
  FiSend,
  FiRepeat,
  FiBarChart2,
  FiArrowRight,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import Header from "../component/Header";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7 } },
};

const ProductPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#030014] text-white px-6 pt-32 pb-24">
 <Header />
       <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="max-w-4xl mx-auto text-center mb-20"
      >
        <h1 className="text-5xl md:text-6xl font-black mb-6">
          Lead automation,{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">
            built visually
          </span>
        </h1>
        <p className="text-gray-400 text-xl">
          Design automated email replies, follow-ups, and decision flows — without code.
        </p>
      </motion.div>

      {/* FEATURES */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
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
          title="Template-based Replies"
          desc="Send predefined or AI-assisted email templates automatically based on logic."
        />
        <Feature
          icon={<FiRepeat />}
          title="Smart Follow-ups"
          desc="Add delays and stop sequences automatically when a lead replies."
        />
        <Feature
          icon={<FiBarChart2 />}
          title="Lead Tracking"
          desc="See which leads were contacted, which templates were sent, and what’s next."
        />
      </div>

      {/* CTA */}
      <div className="mt-24 text-center">
        <button
          onClick={() => navigate("/login")}
          className="px-10 py-5 bg-white text-black rounded-2xl font-black hover:bg-purple-50 transition"
        >
          Start Automating Leads
        </button>
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
    className="p-8 rounded-3xl bg-white/[0.04] border border-white/10"
  >
    <div className="w-12 h-12 mb-4 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 text-2xl">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-gray-400">{desc}</p>
  </motion.div>
);

export default ProductPage;

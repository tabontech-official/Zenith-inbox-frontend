import React from "react";
import { motion } from "framer-motion";
import {
  FiCode,
  FiGitBranch,
  FiTerminal,
  FiArrowRight,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import Header from "../component/Header";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7 } },
};

const DevelopersPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#030014] text-white px-6 pt-32 pb-24">
<Header/>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="max-w-4xl mx-auto text-center mb-20"
      >
        <h1 className="text-5xl md:text-6xl font-black mb-6">
          Built for{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">
            developers
          </span>
        </h1>
        <p className="text-gray-400 text-xl">
          Extend, control, and integrate lead automation using APIs, webhooks, and logic.
        </p>
      </motion.div>

      {/* DEV FEATURES */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
        <DevFeature
          icon={<FiTerminal />}
          title="Mailhook Ingestion"
          desc="Forward emails into Replex via mailhook and parse content programmatically."
        />
        <DevFeature
          icon={<FiGitBranch />}
          title="Conditional Logic Engine"
          desc="Define branching logic using conditions, delays, and state transitions."
        />
        <DevFeature
          icon={<FiCode />}
          title="API & Webhooks (Coming)"
          desc="Trigger scenarios, fetch lead states, and push events programmatically."
        />
        <DevFeature
          icon={<FiCode />}
          title="AI Template Generation"
          desc="Generate and refine email templates using AI with structured inputs."
        />
      </div>

      {/* CODE BLOCK */}
      <div className="max-w-4xl mx-auto mt-20 bg-black/40 border border-white/10 rounded-3xl p-6 text-left text-sm font-mono text-gray-300">
        <pre>
{`POST /api/leads
{
  "from": "lead@example.com",
  "subject": "Interested in pricing",
  "body": "Can you tell me more?"
}`}
        </pre>
      </div>

      {/* CTA */}
      <div className="mt-20 text-center">
        <button
          onClick={() => navigate("/talk-to-sales")}
          className="px-10 py-5 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl font-black hover:opacity-90 transition inline-flex items-center gap-2"
        >
          Talk to Sales <FiArrowRight />
        </button>
      </div>
    </div>
  );
};

const DevFeature = ({ icon, title, desc }) => (
  <motion.div
    variants={fadeUp}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true }}
    className="p-8 rounded-3xl bg-white/[0.04] border border-white/10"
  >
    <div className="w-12 h-12 mb-4 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-2xl">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-gray-400">{desc}</p>
  </motion.div>
);

export default DevelopersPage;

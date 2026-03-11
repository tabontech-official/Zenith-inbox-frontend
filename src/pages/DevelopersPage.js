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
  hidden: { opacity: 0, y: 25 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

const DevelopersPage = () => {
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
            Built for{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">
              developers
            </span>
          </h1>

          <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Extend, control, and integrate lead automation using APIs,
            webhooks, and programmable logic.
          </p>
        </motion.div>


        {/* FEATURES */}
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6">

          <DevFeature
            icon={<FiTerminal />}
            title="Mailhook Ingestion"
            desc="Forward emails into Replex using a mailhook and parse the content programmatically."
          />

          <DevFeature
            icon={<FiGitBranch />}
            title="Conditional Logic Engine"
            desc="Define automation flows with conditions, delays, and state transitions."
          />

          <DevFeature
            icon={<FiCode />}
            title="API & Webhooks"
            desc="Trigger scenarios, fetch lead states, and push automation events via API."
          />

          <DevFeature
            icon={<FiCode />}
            title="AI Template Generation"
            desc="Generate and refine email templates using AI with structured inputs."
          />

        </div>


        {/* CODE BLOCK */}
        <div className="max-w-4xl mx-auto mt-20">

          <div className="rounded-2xl border border-white/10 bg-black/40 overflow-hidden">

            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/[0.03]">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="ml-3 text-xs text-gray-400">
                api/request.json
              </span>
            </div>

            <pre className="p-6 text-sm font-mono text-gray-300 overflow-x-auto">
{`POST /api/leads
{
  "from": "lead@example.com",
  "subject": "Interested in pricing",
  "body": "Can you tell me more?"
}`}
            </pre>

          </div>

        </div>


        {/* CTA */}
        <div className="mt-24 text-center">

          <h2 className="text-3xl font-semibold mb-6">
            Need custom integrations?
          </h2>

          <button
            onClick={() => navigate("/talk-to-sales")}
            className="px-9 py-4 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl font-semibold hover:opacity-90 transition inline-flex items-center gap-2"
          >
            Talk to Sales <FiArrowRight />
          </button>

        </div>

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
    whileHover={{ y: -6 }}
    className="p-7 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-indigo-500/40 transition"
  >

    <div className="w-12 h-12 mb-5 rounded-xl bg-white/5 flex items-center justify-center text-xl text-indigo-400">
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

export default DevelopersPage;
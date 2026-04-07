import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FiMail,
  FiZap,
  FiSend,
  FiRepeat,
  FiBarChart2,
  FiArrowRight,
  FiPlay,
} from "react-icons/fi";
import { PiRobotLight } from "react-icons/pi";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();
  const [demoOpen, setDemoOpen] = useState(false);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.12 },
    },
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 25 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <div className="min-h-screen bg-[#030014] text-white overflow-x-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[80px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[80px]" />
      </div>

      {/* Navbar */}
      <header className="fixed top-6 inset-x-0 max-w-6xl mx-auto z-50 px-6 py-2.5 bg-white/[0.03] border border-white/10 backdrop-blur-xl rounded-xl flex justify-between items-center">
        <div className="flex items-center gap-2 font-semibold text-lg">
          <FiMail className="text-indigo-400 text-xl" />
          Replex Engine
        </div>

        <nav className="hidden md:flex gap-8 text-sm text-gray-400">
          <a href="/product" className="hover:text-white">
            Product
          </a>
          <a href="/developer" className="hover:text-white">
            Developers
          </a>
          <a href="/pricing" className="hover:text-white">
            Pricing
          </a>
        </nav>

        <button
          onClick={() => navigate("/register")}
          className="px-5 py-2 bg-white text-black rounded-xl text-sm font-semibold hover:bg-gray-200"
        >
          Get Started
        </button>
      </header>

      {/* HERO */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-44 pb-24">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-7"
          >
            <motion.div
              variants={fadeUp}
              className="inline-flex items-center gap-2 px-4 py-1.5 text-xs uppercase tracking-widest text-purple-400 bg-purple-500/10 border border-purple-500/20 rounded-full"
            >
              Lead Automation
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="text-5xl md:text-6xl font-bold leading-tight"
            >
              Automate your lead replies
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                visually.
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="text-lg text-gray-400 leading-relaxed max-w-xl"
            >
              Build visual automation flows to reply to leads instantly, apply
              delays, and send the right email at the perfect time — without
              writing code.
            </motion.p>

            <motion.div variants={fadeUp} className="flex gap-4 flex-wrap">
              <button
                onClick={() => navigate("/register")}
                className="px-7 py-3.5 bg-purple-600 hover:bg-purple-500 rounded-xl font-semibold flex items-center gap-2"
              >
                Get Started For Free No Credit Card Required
                <FiArrowRight />
              </button>

              <button
                onClick={() => setDemoOpen(true)}
                className="px-7 py-3.5 bg-white/5 border border-white/10 rounded-xl font-semibold flex items-center gap-2 hover:bg-white/10"
              >
                <FiPlay />
                Watch Demo
              </button>
            </motion.div>
          </motion.div>

          {/* Right video */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="rounded-2xl border border-white/10 bg-black/40 p-1">
              <video
                src="https://videos.ctfassets.net/un655fb9wln6/3wNElEdBiFdK2eauJB7wMp/021db93cbf76430c0b75cfb622876308/make_new_hero_animation.webm"
                autoPlay
                loop
                muted
                playsInline
                className="rounded-xl w-full"
              />
            </div>
          </motion.div>
        </div>
      </main>

      {/* FEATURES */}
      <section className="py-24 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <h2 className="text-4xl font-bold mb-3">Lead Automation Engine</h2>
            <p className="text-gray-400 text-lg">
              Capture leads, reply instantly, and automate follow-ups.
            </p>
          </div>
          <div className="space-y-6">
            {/* Row 1 */}
            <div className="grid md:grid-cols-3 gap-6">
              <StepCard
                icon={<FiZap />}
                title="Capture"
                desc="Automatically capture leads from email using mailhooks or forwarding."
              />

              <StepCard
                icon={<PiRobotLight />}
                title="Understand"
                desc="Analyze incoming emails and detect intent or keywords."
              />

              <StepCard
                icon={<FiSend />}
                title="Reply"
                desc="Send templates or AI-generated replies automatically."
              />
            </div>

            {/* Row 2 */}
            <div className="grid md:grid-cols-2 gap-6 md:max-w-4xl mx-auto">
              <StepCard
                icon={<FiRepeat />}
                title="Follow-up"
                desc="Create delayed follow-up sequences until the lead replies."
              />

              <StepCard
                icon={<FiBarChart2 />}
                title="Track"
                desc="Monitor every lead and see exactly where they are in your workflow."
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-14 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to automate your leads?
          </h2>

          <p className="text-gray-400 mb-8 max-w-xl mx-auto">
            Build powerful automation flows with delays, conditions, and
            templates — and reply to every lead instantly.
          </p>

          <div className="flex justify-center gap-4 flex-wrap">
            <button
              onClick={() => navigate("/login")}
              className="px-8 py-4 bg-white text-black rounded-xl font-semibold hover:bg-gray-200"
            >
              Get Started Free
            </button>

            <button
              onClick={() => navigate("/talk-to-sales")}
              className="px-8 py-4 border border-white/10 rounded-xl hover:bg-white/10"
            >
              Talk to Sales
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-10 text-center text-gray-500 text-sm">
        © 2025 Replex Engine — AI powered lead automation
      </footer>

      {/* Demo modal */}
      {demoOpen && (
        <div
          onClick={() => setDemoOpen(false)}
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-4xl w-full mx-4 bg-black rounded-xl overflow-hidden border border-white/10"
          >
            <video
              src="https://videos.ctfassets.net/un655fb9wln6/3wNElEdBiFdK2eauJB7wMp/021db93cbf76430c0b75cfb622876308/make_new_hero_animation.webm"
              controls
              autoPlay
              className="w-full"
            />
          </div>
        </div>
      )}
    </div>
  );
};

const StepCard = ({ icon, title, desc, className }) => (
  <motion.div
    whileHover={{ y: -6 }}
    className={`p-7 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-purple-500/40 transition ${className}`}
  >
    <div className="w-12 h-12 mb-5 rounded-xl bg-white/5 flex items-center justify-center text-xl text-purple-400">
      {icon}
    </div>

    <h3 className="text-xl font-semibold mb-2">{title}</h3>

    <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
  </motion.div>
);

export default LandingPage;

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FiMail,
  FiZap,
  FiSend,
  FiRepeat,
  FiBarChart2,
  FiCheckCircle,
  FiArrowRight,
  FiPlay,
} from "react-icons/fi";
import { PiRobotLight } from "react-icons/pi";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();
  const [isDemoOpen, setIsDemoOpen] = useState(false);


  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <div className="min-h-screen bg-[#030014] text-white selection:bg-purple-500/30 overflow-x-hidden">
      {/* 1. AMBIENT BACKGROUND */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150" />
      </div>

      {/* HEADER */}
      <header className="fixed top-6 inset-x-0 max-w-5xl mx-auto z-50 px-6 py-3 bg-white/[0.03] border border-white/10 backdrop-blur-xl rounded-full flex justify-between items-center shadow-2xl">
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="p-1.5 text-indigo-500  rounded-lg group-hover:rotate-12 transition-transform">
          <FiMail className="text-indigo-500 text-2xl" />
          </div>
          <span className="font-bold tracking-tight text-lg">
            Replex Engine
          </span>
        </div>

        <nav className="hidden md:flex gap-8 text-sm font-medium text-gray-400">
          <a href="/product" className="hover:text-white transition">
            Product
          </a>
          <a href="/developer" className="hover:text-white transition">
            Developers
          </a>
          <a href="/pricing" className="hover:text-white transition">
            Pricing
          </a>
        </nav>

        <button
          onClick={() => navigate("/login")}
          className="px-5 py-2 text-sm font-bold bg-white text-black rounded-full hover:bg-gray-200 transition-all active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
        >
          Get Started
        </button>
      </header>

      {/* HERO SECTION */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-48 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="space-y-8"
          >
            <motion.div
              variants={fadeUp}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-semibold text-purple-400 uppercase tracking-widest"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
              </span>
              Automate Lead Responses & Follow-ups
            </motion.div>

           <motion.h1
  variants={fadeUp}
  className="text-6xl md:text-7xl font-black leading-[1.05] tracking-tight"
>
  Automate lead replies <br/>
  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-400 to-blue-400">
    visually.
  </span>
</motion.h1>

            <motion.p
              variants={fadeUp}
              className="text-xl text-gray-400 max-w-lg leading-relaxed font-light"
            >
            Build visual scenarios to automatically reply to leads, apply delays,
check conditions, and send the right email template at the right time —
without writing a single line of code.

            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-wrap gap-5">
              <button className="group px-8 py-4 bg-purple-600 hover:bg-purple-500 rounded-2xl font-bold transition-all flex items-center gap-2 shadow-xl shadow-purple-600/20">
                Start Building Free{" "}
                <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button
  onClick={() => setIsDemoOpen(true)}
  className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-bold transition-all flex items-center gap-2"
>
  <FiPlay className="text-purple-400" /> Watch Demo
</button>

            </motion.div>
          </motion.div>

          {/* VIDEO MOCKUP */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            className="relative"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-[2rem] blur-2xl opacity-20" />
            <div className="relative rounded-[1.8rem] border border-white/10 bg-black/50 p-2 backdrop-blur-3xl shadow-2xl">
              <div className="bg-[#0B061F] rounded-2xl overflow-hidden border border-white/5">
                <video
                  src="https://videos.ctfassets.net/un655fb9wln6/3wNElEdBiFdK2eauJB7wMp/021db93cbf76430c0b75cfb622876308/make_new_hero_animation.webm"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* BENTO GRID FEATURES */}
      <section className="relative z-10 py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
               Lead Automation Engine

              </h2>
              <p className="text-gray-400 text-lg">
                Everything you need to capture, reply, and follow up with leads — automatically.
              </p>
            </div>
            <button className="text-purple-400 font-semibold hover:text-purple-300 transition flex items-center gap-2">
              Learn about our architecture <FiArrowRight />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <StepCard
              span="md:col-span-7"
              icon={<FiZap />}
              title="Capture"
              desc="Automatically capture leads from email using a simple mailhook
or forwarding setup — no integrations required.
"
            />
            <StepCard
              span="md:col-span-5"
              icon={<PiRobotLight />}
              title="Understand"
              desc="Read incoming lead emails and evaluate conditions like intent,
keywords, or rules you define.
"
            />
            <StepCard
              span="md:col-span-4"
              icon={<FiSend />}
              title="Reply"
              desc="Send predefined or AI-assisted email templates automatically
based on your scenario logic.
  "
            />
            <StepCard
              span="md:col-span-4"
              icon={<FiRepeat />}
              title="Follow-up"
              desc="Add delays between emails and build follow-up sequences that
stop when a lead replies
."
            />
            <StepCard
              span="md:col-span-4"
              icon={<FiBarChart2 />}
              title="Track"
              desc="Track which leads were contacted, which templates were sent,
and where each lead is in your automation."
            />
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="relative z-10 py-20 px-6 max-w-7xl mx-auto">
        <div className="relative rounded-[3rem] p-8 md:p-16 lg:p-20 overflow-hidden border border-white/10 bg-gradient-to-br from-white/[0.08] to-transparent shadow-2xl">
          {/* Background Glow Effect */}
          <div className="absolute top-0 right-0 w-[50%] h-[100%] bg-purple-600/10 blur-[120px] pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
            {/* LEFT SIDE: TEXT CONTENT */}
            <div className="text-left space-y-8">
              <div>
                <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight leading-tight">
                  Ready to <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-300">
                    automate your leads?
                  </span>
                </h2>
                <p className="text-gray-400 text-lg md:text-xl max-w-md leading-relaxed font-light">
                 Build powerful lead automation flows with conditions, delays,
and templates — and respond to every lead instantly.

                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate("/login")}
                  className="px-10 py-5 bg-white text-black rounded-2xl font-black text-lg hover:scale-105 hover:bg-purple-50 transition-all shadow-[0_20px_40px_rgba(255,255,255,0.1)]"
                >
                  Get Started for Free
                </button>
                <button onClick={() => navigate("/talk-to-sales")} className="px-8 py-5 bg-white/5 border border-white/10 rounded-2xl font-bold hover:bg-white/10 transition-all">
                  Talk to Sales
                </button>
              </div>

              {/* Social Proof Mini-Tag */}
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full border-2 border-[#0B061F] bg-gray-800"
                    />
                  ))}
                </div>
                <span>Trusted by top-tier engineering teams</span>
              </div>
            </div>

            {/* RIGHT SIDE: IMAGE/VISUAL */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative group"
            >
              {/* The Image Container */}
              <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-black/40 p-2 shadow-2xl rotate-2 group-hover:rotate-0 transition-transform duration-500">
                <img
                  src="https://images.ctfassets.net/un655fb9wln6/6zii7sDfVNFq54etd22DzK/ad8a50813dffde8584d269de35c92e36/ai.png"
                  alt="AI Orchestration Dashboard"
                  className="rounded-2xl w-full h-auto object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                />

                {/* Subtle Floating Badge on Image */}
                <div className="absolute bottom-6 left-6 right-6 p-4 bg-black/60 backdrop-blur-md border border-white/10 rounded-xl flex items-center gap-3 animate-bounce-slow">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs font-mono text-gray-300">
                    Agent Status: Optimizing Workflows...
                  </span>
                </div>
              </div>

              {/* Outer Decorative Rings */}
              <div className="absolute -z-10 -top-10 -right-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl opacity-50" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-white/5 py-12 px-6 text-center text-gray-500 text-sm">
        <p>© 2024 Replex Engine. Built for the future of AI.</p>
      </footer>
      {/* DEMO VIDEO MODAL */}
{isDemoOpen && (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 backdrop-blur-sm"
    onClick={() => setIsDemoOpen(false)}
  >
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="relative w-full max-w-4xl mx-4 rounded-2xl overflow-hidden bg-black border border-white/10 shadow-2xl"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Close Button */}
      <button
        onClick={() => setIsDemoOpen(false)}
        className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
      >
        ✕
      </button>

      {/* Video */}
      <video
        src="https://videos.ctfassets.net/un655fb9wln6/3wNElEdBiFdK2eauJB7wMp/021db93cbf76430c0b75cfb622876308/make_new_hero_animation.webm"
        autoPlay
        controls
        className="w-full h-full object-cover"
      />
    </motion.div>
  </motion.div>
)}

    </div>
  );
};

const StepCard = ({ icon, title, desc, span }) => (
  <motion.div
    whileHover={{ y: -8, transition: { duration: 0.2 } }}
    className={`${span} group relative p-8 rounded-[2rem] bg-gradient-to-b from-white/[0.05] to-transparent border border-white/10 hover:border-purple-500/40 transition-all duration-300`}
  >
    <div className="w-14 h-14 mb-6 rounded-2xl bg-white/5 flex items-center justify-center text-2xl text-purple-400 group-hover:scale-110 group-hover:bg-purple-500 group-hover:text-white transition-all duration-500">
      {icon}
    </div>
    <h3 className="text-2xl font-bold mb-3 tracking-tight">{title}</h3>
    <p className="text-gray-400 leading-relaxed font-light">{desc}</p>
  </motion.div>
);

export default LandingPage;

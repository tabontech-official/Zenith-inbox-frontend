import React, { useState, useEffect } from "react";
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

// Mapping string names from DB to actual icon components
const iconMap = {
  FiZap: <FiZap />,
  PiRobotLight: <PiRobotLight />,
  FiSend: <FiSend />,
  FiRepeat: <FiRepeat />,
  FiBarChart2: <FiBarChart2 />
};

const LandingPage = () => {
  const navigate = useNavigate();
  const [demoOpen, setDemoOpen] = useState(false);
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/landing-page");
        if (res.ok) {
          const data = await res.json();
          setContent(data);
        } else {
          console.error("Failed to fetch landing page content");
        }
      } catch (err) {
        console.error("Error connecting to server", err);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030014] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // Fallback to hardcoded if fetch fails completely or content is empty
  const pageData = content || {
    logoText: 'Replex Engine',
    navbarLinks: [
      { label: 'Product', route: '/product' },
      { label: 'Developers', route: '/developer' },
      { label: 'Pricing', route: '/pricing' }
    ],
    hero: {
      badge: 'Lead Automation',
      mainTitle: 'Automate your lead replies\n',
      highlightedTitle: 'visually.',
      description: 'Build visual automation flows to reply to leads instantly, apply delays, and send the right email at the perfect time — without writing code.',
      buttons: [
        { text: 'Get Started For Free No Credit Card Required', route: '/register', isPrimary: true },
        { text: 'Watch Demo', route: '#demo', isPrimary: false }
      ],
      videoUrl: 'https://videos.ctfassets.net/un655fb9wln6/3wNElEdBiFdK2eauJB7wMp/021db93cbf76430c0b75cfb622876308/make_new_hero_animation.webm',
      demoVideoUrl: 'https://videos.ctfassets.net/un655fb9wln6/3wNElEdBiFdK2eauJB7wMp/021db93cbf76430c0b75cfb622876308/make_new_hero_animation.webm'
    },
    features: {
      title: 'Lead Automation Engine',
      subtitle: 'Capture leads, reply instantly, and automate follow-ups.',
      cards: [
        { iconName: 'FiZap', title: 'Capture', description: 'Automatically capture leads from email using mailhooks or forwarding.' },
        { iconName: 'PiRobotLight', title: 'Understand', description: 'Analyze incoming emails and detect intent or keywords.' },
        { iconName: 'FiSend', title: 'Reply', description: 'Send templates or AI-generated replies automatically.' },
        { iconName: 'FiRepeat', title: 'Follow-up', description: 'Create delayed follow-up sequences until the lead replies.' },
        { iconName: 'FiBarChart2', title: 'Track', description: 'Monitor every lead and see exactly where they are in your workflow.' }
      ]
    },
    cta: {
      title: 'Ready to automate your leads?',
      description: 'Build powerful automation flows with delays, conditions, and templates — and reply to every lead instantly.',
      buttons: [
        { text: 'Get Started Free', route: '/login', isPrimary: true },
        { text: 'Talk to Sales', route: '/talk-to-sales', isPrimary: false }
      ]
    },
    footer: {
      copyrightText: '© 2025 Replex Engine — AI powered lead automation',
      links: [
        { label: 'Privacy Policy', route: '/privacy-policy' },
        { label: 'Terms & Conditions', route: '/terms' }
      ]
    }
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
        <div className="flex items-center gap-2 font-semibold text-lg cursor-pointer" onClick={() => navigate("/")}>
          <FiMail className="text-indigo-400 text-xl" />
          {pageData.logoText}
        </div>

        <nav className="hidden md:flex gap-8 text-sm text-gray-400">
          {pageData.navbarLinks?.map((link, idx) => (
            <a key={idx} href={link.route} className="hover:text-white">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/login")}
            className="px-5 py-2 bg-white/10 border border-white/15 text-white rounded-xl text-sm font-semibold hover:bg-indigo-500/20 hover:border-indigo-400/50 hover:text-indigo-100 transition"
          >
            Sign In
          </button>

          <button
            onClick={() => navigate("/register")}
            className="px-5 py-2 bg-indigo-500 text-white rounded-xl text-sm font-semibold hover:bg-indigo-400 shadow-lg shadow-indigo-500/20 transition"
          >
            Get Started
          </button>
        </div>
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
            {pageData.hero?.badge && (
              <motion.div
                variants={fadeUp}
                className="inline-flex items-center gap-2 px-4 py-1.5 text-xs uppercase tracking-widest text-purple-400 bg-purple-500/10 border border-purple-500/20 rounded-full"
              >
                {pageData.hero.badge}
              </motion.div>
            )}

            <motion.h1
              variants={fadeUp}
              className="text-5xl md:text-6xl font-bold leading-tight whitespace-pre-line"
            >
              {pageData.hero?.mainTitle}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                {pageData.hero?.highlightedTitle}
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="text-lg text-gray-400 leading-relaxed max-w-xl"
            >
              {pageData.hero?.description}
            </motion.p>

            <motion.div variants={fadeUp} className="flex gap-4 flex-wrap">
              {pageData.hero?.buttons?.map((btn, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (btn.route === "#demo") setDemoOpen(true);
                    else navigate(btn.route);
                  }}
                  className={btn.isPrimary 
                    ? "px-7 py-3.5 bg-purple-600 hover:bg-purple-500 rounded-xl font-semibold flex items-center gap-2"
                    : "px-7 py-3.5 bg-white/5 border border-white/10 rounded-xl font-semibold flex items-center gap-2 hover:bg-white/10"
                  }
                >
                  {!btn.isPrimary && <FiPlay />}
                  {btn.text}
                  {btn.isPrimary && <FiArrowRight />}
                </button>
              ))}
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
              {pageData.hero?.videoUrl && (
                <video
                  src={pageData.hero.videoUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="rounded-xl w-full"
                />
              )}
            </div>
          </motion.div>
        </div>
      </main>

      {/* FEATURES */}
      <section className="py-24 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <h2 className="text-4xl font-bold mb-3">{pageData.features?.title}</h2>
            <p className="text-gray-400 text-lg">
              {pageData.features?.subtitle}
            </p>
          </div>
          <div className="space-y-6">
            {/* Row 1 - up to 3 cards */}
            <div className="grid md:grid-cols-3 gap-6">
              {pageData.features?.cards?.slice(0, 3).map((card, idx) => (
                <StepCard
                  key={idx}
                  icon={iconMap[card.iconName] || <FiZap />}
                  title={card.title}
                  desc={card.description}
                />
              ))}
            </div>

            {/* Row 2 - remaining cards */}
            {pageData.features?.cards?.length > 3 && (
              <div className="grid md:grid-cols-2 gap-6 md:max-w-4xl mx-auto">
                {pageData.features.cards.slice(3).map((card, idx) => (
                  <StepCard
                    key={idx}
                    icon={iconMap[card.iconName] || <FiZap />}
                    title={card.title}
                    desc={card.description}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-14 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            {pageData.cta?.title}
          </h2>

          <p className="text-gray-400 mb-8 max-w-xl mx-auto">
            {pageData.cta?.description}
          </p>

          <div className="flex justify-center gap-4 flex-wrap">
            {pageData.cta?.buttons?.map((btn, idx) => (
              <button
                key={idx}
                onClick={() => navigate(btn.route)}
                className={btn.isPrimary
                  ? "px-8 py-4 bg-white text-black rounded-xl font-semibold hover:bg-gray-200"
                  : "px-8 py-4 border border-white/10 rounded-xl hover:bg-white/10"
                }
              >
                {btn.text}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-10 text-center text-gray-500 text-sm">
        <div className="flex justify-center gap-6 mb-3">
          {pageData.footer?.links?.map((link, idx) => (
            <button
              key={idx}
              onClick={() => navigate(link.route)}
              className="hover:text-white transition"
            >
              {link.label}
            </button>
          ))}
        </div>

        <p>{pageData.footer?.copyrightText}</p>
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
              src={pageData.hero?.demoVideoUrl}
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

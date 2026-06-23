import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiMail,
  FiZap,
  FiSend,
  FiRepeat,
  FiBarChart2,
  FiArrowRight,
  FiPlay,
  FiX,
  FiCheckCircle,
  FiShield,
  FiMenu,
  FiChevronDown,
  FiClock,
  FiTrendingUp,
  FiLayers,
  FiUsers,
  FiGlobe,
  FiMessageSquare,
} from "react-icons/fi";
import { PiRobotLight } from "react-icons/pi";
import { useNavigate } from "react-router-dom";

const iconMap = {
  FiZap: <FiZap />,
  PiRobotLight: <PiRobotLight />,
  FiSend: <FiSend />,
  FiRepeat: <FiRepeat />,
  FiBarChart2: <FiBarChart2 />,
  FiClock: <FiClock />,
  FiTrendingUp: <FiTrendingUp />,
  FiLayers: <FiLayers />,
  FiUsers: <FiUsers />,
  FiGlobe: <FiGlobe />,
  FiMessageSquare: <FiMessageSquare />,
};

const fallbackData = {
  logoText: "Replex Engine",
  navbarLinks: [
    { label: "Product", route: "/product" },
    { label: "Developers", route: "/developer" },
    { label: "Pricing", route: "/pricing" },
  ],
  hero: {
    badge: "AI Lead Automation",
    mainTitle: "Turn every inbound lead into a ",
    highlightedTitle: "closed conversation.",
    description:
      "Capture leads from email, understand intent with AI, send instant replies, and automate follow-ups — all from a visual no-code workflow builder.",
    buttons: [
      { text: "Start Free — No Credit Card", route: "/register", isPrimary: true },
      { text: "Watch Demo", route: "#demo", isPrimary: false },
    ],
    demoVideoUrl:
      "https://videos.ctfassets.net/un655fb9wln6/3wNElEdBiFdK2eauJB7wMp/021db93cbf76430c0b75cfb622876308/make_new_hero_animation.webm",
  },
  features: {
    title: "From lead captured to results tracked",
    subtitle:
      "Every inbound email moves through one connected pipeline — no manual handoffs, no leads slipping through the cracks.",
    cards: [
      {
        iconName: "FiZap",
        title: "Lead Captured",
        description: "Pull leads from forwarded emails, forms, or mailhooks automatically.",
      },
      {
        iconName: "PiRobotLight",
        title: "AI Understands",
        description: "Detect intent, keywords, context, and lead type before replying.",
      },
      {
        iconName: "FiSend",
        title: "Reply Sent",
        description: "Send templates or AI-assisted responses at the exact right moment.",
      },
      {
        iconName: "FiRepeat",
        title: "Follow-up Triggered",
        description: "Create smart delay sequences until the lead responds or converts.",
      },
      {
        iconName: "FiBarChart2",
        title: "Results Tracked",
        description: "See every lead status, automation step, and workflow outcome clearly.",
      },
    ],
  },
  cta: {
    title: "Ready to stop losing leads?",
    description:
      "Launch your automated reply engine and respond to every inbound opportunity faster than your competitors.",
    buttons: [
      { text: "Get Started Free", route: "/register", isPrimary: true },
      { text: "Talk to Sales", route: "/talk-to-sales", isPrimary: false },
    ],
  },
  footer: {
    copyrightText: "© 2026 Replex Engine — AI powered lead automation",
    links: [
      { label: "Privacy Policy", route: "/privacy-policy" },
      { label: "Terms & Conditions", route: "/terms" },
    ],
  },
};

const productImage =
  "https://cdn.shopify.com/s/files/1/0732/4496/7128/files/screencapture-replexengine-organization-2026-06-23-09_49_56.png?v=1782190241";

const trustedLogos = ["Northwind", "Brightline", "Stackform", "Meridian", "Cloudbase", "PulseHQ"];

const stats = [
  { value: "50K+", label: "Emails automated", accent: "indigo" },
  { value: "12×", label: "Faster lead response", accent: "violet" },
  { value: "98%", label: "Reply delivery rate", accent: "emerald" },
  { value: "24/7", label: "Follow-up coverage", accent: "sky" },
];

const featureCards = [
  {
    iconName: "FiZap",
    title: "Instant lead capture",
    description: "Connect mailhooks, forwarding rules, or webhooks to capture every inbound lead in real time.",
    tag: "Capture",
  },
  {
    iconName: "PiRobotLight",
    title: "AI intent detection",
    description: "Understand what each lead wants — pricing, demo, support — before your team even opens the inbox.",
    tag: "Understand",
  },
  {
    iconName: "FiSend",
    title: "Smart auto-replies",
    description: "Send personalized templates or AI-generated responses the moment a lead hits your pipeline.",
    tag: "Reply",
  },
  {
    iconName: "FiRepeat",
    title: "Automated follow-ups",
    description: "Set delays, conditions, and sequences that nurture leads until they reply or convert.",
    tag: "Follow-up",
  },
  {
    iconName: "FiLayers",
    title: "Visual flow builder",
    description: "Design complex automation paths with a drag-and-drop canvas — no code required.",
    tag: "No-code",
  },
  {
    iconName: "FiBarChart2",
    title: "Lead progress tracking",
    description: "Monitor every lead's journey, step-by-step outcomes, and conversion metrics in one dashboard.",
    tag: "Track",
  },
];

const useCases = [
  {
    iconName: "FiUsers",
    title: "Sales teams",
    description: "Respond to inbound demo requests and pricing inquiries within seconds, not hours.",
    metric: "3× more meetings booked",
  },
  {
    iconName: "FiGlobe",
    title: "Agencies & consultants",
    description: "Automate client lead intake, qualification replies, and nurture sequences at scale.",
    metric: "80% less manual email work",
  },
  {
    iconName: "FiTrendingUp",
    title: "E-commerce & SaaS",
    description: "Turn product questions, trial signups, and support emails into structured sales workflows.",
    metric: "2× conversion on inbound",
  },
  {
    iconName: "FiMessageSquare",
    title: "Support → sales handoff",
    description: "Route intent automatically so support tickets become sales opportunities when they should.",
    metric: "Zero leads left behind",
  },
];

const benefits = [
  {
    title: "Save hours every week",
    description: "Stop copy-pasting replies and chasing leads manually. Automate the repetitive work.",
    icon: <FiClock className="text-sky-500" />,
  },
  {
    title: "Increase conversions",
    description: "Speed-to-lead is everything. Instant replies keep prospects engaged while interest is hot.",
    icon: <FiTrendingUp className="text-emerald-500" />,
  },
  {
    title: "Scale without hiring",
    description: "Handle 10× more inbound volume with the same team using intelligent automation flows.",
    icon: <FiUsers className="text-violet-500" />,
  },
  {
    title: "Full visibility",
    description: "Know exactly where every lead stands — captured, replied, following up, or converted.",
    icon: <FiBarChart2 className="text-indigo-500" />,
  },
];

const testimonials = [
  {
    quote:
      "We went from 4-hour response times to under 2 minutes. Replex Engine handles our entire inbound pipeline while we focus on closing.",
    name: "Sarah Chen",
    role: "Head of Sales, Brightline",
    initials: "SC",
  },
  {
    quote:
      "The visual workflow builder is exactly what we needed. No code, no complexity — just drag, connect, and leads get handled automatically.",
    name: "Marcus Webb",
    role: "Founder, Stackform",
    initials: "MW",
  },
  {
    quote:
      "Follow-up sequences alone recovered 30% of leads we used to lose. The ROI was obvious within the first week.",
    name: "Elena Rodriguez",
    role: "Growth Lead, PulseHQ",
    initials: "ER",
  },
];

const faqs = [
  {
    q: "How does Replex Engine capture leads?",
    a: "Connect via mailhooks, email forwarding, or webhooks. Every inbound message is parsed and routed into your automation workflow automatically.",
  },
  {
    q: "Do I need to write code to build workflows?",
    a: "No. Replex Engine uses a visual drag-and-drop flow builder. Connect nodes for capture, AI understanding, replies, delays, and tracking — all without code.",
  },
  {
    q: "Can I use AI-generated email replies?",
    a: "Yes. You can send template-based replies, AI-assisted responses, or a hybrid — with full control over tone, timing, and conditions.",
  },
  {
    q: "How do follow-up sequences work?",
    a: "Set delay nodes and conditions in your workflow. If a lead doesn't reply, the next follow-up triggers automatically until they respond or the sequence completes.",
  },
  {
    q: "Is there a free plan to get started?",
    a: "Yes. Start free with no credit card required. Build your first automation flow and begin capturing leads in minutes.",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

const sectionReveal = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const LandingPage = () => {
  const navigate = useNavigate();
  const [demoOpen, setDemoOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await fetch("https://email-syncing-backend.vercel.app/api/landing-page");
        if (res.ok) setContent(await res.json());
        else console.error("Failed to fetch landing page content");
      } catch (err) {
        console.error("Error connecting to server", err);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  const pageData = content || fallbackData;
  const workflowCards = pageData.features?.cards?.length
    ? pageData.features.cards
    : fallbackData.features.cards;

  const goTo = (route) => {
    if (route === "#demo") setDemoOpen(true);
    else navigate(route);
    setMobileOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center font-['Inter',ui-sans-serif,system-ui]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-11 w-11 rounded-full border-[3px] border-slate-200 border-t-indigo-600 animate-spin" />
          <p className="text-sm font-medium text-slate-500">Loading Replex Engine...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#F8FAFC] text-slate-900 selection:bg-indigo-100 font-['Inter',ui-sans-serif,system-ui] antialiased">
      {/* Background mesh */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-1/2 top-[-160px] h-[480px] w-[780px] -translate-x-1/2 rounded-full bg-indigo-200/40 blur-[120px]" />
        <div className="absolute right-[-120px] top-[180px] h-[380px] w-[380px] rounded-full bg-violet-200/30 blur-[110px]" />
        <div className="absolute bottom-[-180px] left-[-120px] h-[460px] w-[460px] rounded-full bg-sky-200/35 blur-[120px]" />
      </div>

      {/* ── Navbar ── */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2.5 text-left"
            aria-label="Go to homepage"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/25">
              <FiMail className="text-base" />
            </span>
            <span className="text-[15px] font-bold tracking-tight text-slate-900">
              {pageData.logoText}
            </span>
          </button>

          <nav className="hidden items-center gap-7 md:flex">
            {pageData.navbarLinks?.map((link, idx) => (
              <button
                key={idx}
                onClick={() => goTo(link.route)}
                className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
              >
                {link.label}
              </button>
            ))}
          </nav>

          <div className="hidden items-center gap-2.5 md:flex">
            <button
              onClick={() => navigate("/login")}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate("/register")}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 transition hover:bg-indigo-700"
            >
              Get Started
            </button>
          </div>

          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-700 md:hidden"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-t border-slate-100 bg-white md:hidden"
            >
              <div className="space-y-1 px-4 py-3">
                {pageData.navbarLinks?.map((link, idx) => (
                  <button
                    key={idx}
                    onClick={() => goTo(link.route)}
                    className="block w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    {link.label}
                  </button>
                ))}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    onClick={() => goTo("/login")}
                    className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => goTo("/register")}
                    className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white"
                  >
                    Get Started
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── Hero ── */}
      <main className="relative mx-auto max-w-7xl px-4 pb-16 pt-28 sm:px-6 lg:pt-32 lg:pb-20">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <motion.section variants={container} initial="hidden" animate="show">
            {pageData.hero?.badge && (
              <motion.div
                variants={fadeUp}
                className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-indigo-600 shadow-sm"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {pageData.hero.badge}
              </motion.div>
            )}

            <motion.h1
              variants={fadeUp}
              className="text-4xl font-bold leading-[1.08] tracking-tight text-slate-900 sm:text-5xl lg:text-[3.25rem]"
            >
              <span className="whitespace-pre-line">{pageData.hero?.mainTitle}</span>
              <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-violet-500 bg-clip-text text-transparent">
                {pageData.hero?.highlightedTitle}
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mt-5 max-w-lg text-lg leading-relaxed text-slate-600"
            >
              {pageData.hero?.description}
            </motion.p>

            <motion.div variants={fadeUp} className="mt-8 flex flex-col gap-3 sm:flex-row">
              {pageData.hero?.buttons?.map((btn, idx) => (
                <button
                  key={idx}
                  onClick={() => goTo(btn.route)}
                  className={
                    btn.isPrimary
                      ? "group inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:-translate-y-0.5 hover:bg-indigo-700"
                      : "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50"
                  }
                >
                  {!btn.isPrimary && <FiPlay className="text-indigo-600" />}
                  {btn.text}
                  {btn.isPrimary && (
                    <FiArrowRight className="transition group-hover:translate-x-0.5" />
                  )}
                </button>
              ))}
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600"
            >
              {["No credit card required", "Setup in under 5 minutes", "SOC 2 ready"].map(
                (item) => (
                  <span key={item} className="flex items-center gap-1.5 font-medium">
                    <FiCheckCircle className="shrink-0 text-emerald-500" />
                    {item}
                  </span>
                )
              )}
            </motion.div>
          </motion.section>

          {/* Dashboard preview */}
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
            className="relative"
          >
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-indigo-500/15 via-violet-500/10 to-sky-500/10 blur-2xl" />
            <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_24px_64px_rgba(15,23,42,0.12)]">
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-4 py-2.5">
                <div className="flex gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-400/90" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400/90" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/90" />
                </div>
                <span className="rounded-md bg-white px-2.5 py-0.5 text-[11px] font-semibold text-slate-500 ring-1 ring-slate-200">
                  app.replexengine.com
                </span>
                <div className="w-12" />
              </div>

              <div className="relative bg-slate-50">
                <img
                  src={productImage}
                  alt="Replex Engine dashboard"
                  className="w-full select-none object-cover"
                  loading="eager"
                />

                {/* Floating status card */}
                <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:w-72">
                  <div className="rounded-xl border border-white/80 bg-white/90 p-3.5 shadow-lg backdrop-blur-md">
                    <div className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-slate-900">
                      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                        <FiShield className="text-xs" />
                      </span>
                      Automation active
                    </div>
                    <p className="text-xs leading-5 text-slate-500">
                      Lead captured → intent detected → reply sent → follow-up scheduled
                    </p>
                    <div className="mt-2.5 flex gap-1">
                      {[100, 75, 50, 25].map((w, i) => (
                        <div key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                            style={{ width: `${w}%` }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>
        </div>
      </main>

      {/* ── Trusted by ── */}
      <section className="border-y border-slate-200/70 bg-white/60 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <p className="mb-6 text-center text-xs font-semibold uppercase tracking-widest text-slate-400">
            Trusted by growth teams worldwide
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {trustedLogos.map((name) => (
              <span
                key={name}
                className="text-sm font-bold tracking-tight text-slate-300 transition hover:text-slate-400"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {stats.map(({ value, label, accent }) => (
            <motion.div
              key={label}
              variants={fadeUp}
              className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div
                className={`text-3xl font-bold tracking-tight text-slate-900 ${
                  accent === "indigo"
                    ? "text-indigo-600"
                    : accent === "violet"
                    ? "text-violet-600"
                    : accent === "emerald"
                    ? "text-emerald-600"
                    : "text-sky-600"
                }`}
              >
                {value}
              </div>
              <div className="mt-1 text-sm font-medium text-slate-500">{label}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── Workflow (horizontal) ── */}
      <section id="workflow" className="relative bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <motion.div
            variants={sectionReveal}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            className="mx-auto mb-14 max-w-2xl text-center"
          >
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-indigo-600">
              How it works
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              {pageData.features?.title}
            </h2>
            <p className="mt-3 text-lg leading-relaxed text-slate-600">
              {pageData.features?.subtitle}
            </p>
          </motion.div>

          <div className="rounded-3xl border border-slate-200/80 bg-gradient-to-b from-slate-50 to-white p-4 shadow-sm sm:p-6">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-stretch">
              {workflowCards.slice(0, 5).map((card, idx) => (
                <React.Fragment key={`${card.title}-${idx}`}>
                  <WorkflowStepCard
                    icon={iconMap[card.iconName] || <FiZap />}
                    title={card.title}
                    desc={card.description}
                    index={idx + 1}
                  />
                  {idx < Math.min(workflowCards.length, 5) - 1 && <FlowArrow />}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature cards ── */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24">
        <motion.div
          variants={sectionReveal}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="mx-auto mb-14 max-w-2xl text-center"
        >
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-indigo-600">
            Platform features
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Everything you need to automate lead email
          </h2>
          <p className="mt-3 text-lg text-slate-600">
            From capture to conversion — one platform handles the full inbound lead lifecycle.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {featureCards.map((card) => (
            <FeatureCard
              key={card.title}
              icon={iconMap[card.iconName] || <FiZap />}
              title={card.title}
              description={card.description}
              tag={card.tag}
            />
          ))}
        </motion.div>
      </section>

      {/* ── Product showcase ── */}
      <section className="bg-slate-900 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <motion.div
              variants={sectionReveal}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-60px" }}
            >
              <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-indigo-400">
                Product preview
              </p>
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                A real dashboard built for lead automation
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-slate-400">
                Monitor workflows, track lead progress, and manage every automation from a single
                clean interface — designed for speed and clarity.
              </p>

              <ul className="mt-8 space-y-4">
                {[
                  "Visual workflow canvas with drag-and-drop nodes",
                  "Real-time lead status and step-by-step tracking",
                  "Template library with AI-assisted composition",
                  "One-click test runs before going live",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-slate-300">
                    <FiCheckCircle className="mt-0.5 shrink-0 text-emerald-400" />
                    {item}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => navigate("/register")}
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
              >
                Explore the platform
                <FiArrowRight />
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="absolute -inset-3 rounded-3xl bg-indigo-500/20 blur-2xl" />
              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-800 shadow-2xl">
                <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
                  <div className="flex gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
                  </div>
                  <span className="text-xs font-medium text-slate-400">Workflow Builder</span>
                </div>
                <img
                  src={productImage}
                  alt="Replex Engine workflow builder"
                  className="w-full opacity-90"
                />
              </div>

              {/* Annotation pills */}
              <div className="absolute -left-2 top-1/4 hidden rounded-xl border border-white/10 bg-slate-800/90 px-3 py-2 text-xs font-medium text-white shadow-xl backdrop-blur sm:block">
                <span className="text-emerald-400">●</span> 3 leads captured today
              </div>
              <div className="absolute -right-2 bottom-1/4 hidden rounded-xl border border-white/10 bg-slate-800/90 px-3 py-2 text-xs font-medium text-white shadow-xl backdrop-blur sm:block">
                <span className="text-indigo-400">●</span> 98% reply rate
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Use cases ── */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24">
        <motion.div
          variants={sectionReveal}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="mx-auto mb-14 max-w-2xl text-center"
        >
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-indigo-600">
            Use cases
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Built for teams that live in the inbox
          </h2>
          <p className="mt-3 text-lg text-slate-600">
            Whether you're closing deals or qualifying inbound, Replex Engine adapts to your workflow.
          </p>
        </motion.div>

        <div className="grid gap-5 sm:grid-cols-2">
          {useCases.map((uc) => (
            <UseCaseCard
              key={uc.title}
              icon={iconMap[uc.iconName] || <FiUsers />}
              title={uc.title}
              description={uc.description}
              metric={uc.metric}
            />
          ))}
        </div>
      </section>

      {/* ── Benefits ── */}
      <section className="border-y border-slate-200/70 bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-20">
            <motion.div
              variants={sectionReveal}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-60px" }}
            >
              <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-indigo-600">
                Why Replex Engine
              </p>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                More replies. Less manual work. Higher conversions.
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-slate-600">
                Stop treating every inbound email like a one-off task. Build repeatable automation
                that scales with your business.
              </p>
            </motion.div>

            <div className="grid gap-4 sm:grid-cols-2">
              {benefits.map((b) => (
                <BenefitCard key={b.title} {...b} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24">
        <motion.div
          variants={sectionReveal}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="mx-auto mb-14 max-w-2xl text-center"
        >
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-indigo-600">
            Customer stories
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Teams ship faster with Replex Engine
          </h2>
        </motion.div>

        <div className="grid gap-5 md:grid-cols-3">
          {testimonials.map((t) => (
            <TestimonialCard key={t.name} {...t} />
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="border-t border-slate-200/70 bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <motion.div
            variants={sectionReveal}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            className="mb-12 text-center"
          >
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-indigo-600">
              FAQ
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Common questions
            </h2>
          </motion.div>

          <div className="divide-y divide-slate-200 rounded-2xl border border-slate-200/80 bg-white shadow-sm">
            {faqs.map((faq, idx) => (
              <FaqItem
                key={idx}
                question={faq.q}
                answer={faq.a}
                isOpen={openFaq === idx}
                onToggle={() => setOpenFaq(openFaq === idx ? null : idx)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="mx-auto max-w-7xl px-4 pb-20 pt-4 sm:px-6">
        <motion.div
          variants={sectionReveal}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-950 px-6 py-16 text-center shadow-2xl sm:px-12 sm:py-20"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.35),transparent_60%)]" />
          <div className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(rgba(255,255,255,.6)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.6)_1px,transparent_1px)] [background-size:32px_32px]" />

          <div className="relative mx-auto max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              {pageData.cta?.title}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-slate-300">
              {pageData.cta?.description}
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              {pageData.cta?.buttons?.map((btn, idx) => (
                <button
                  key={idx}
                  onClick={() => goTo(btn.route)}
                  className={
                    btn.isPrimary
                      ? "rounded-xl bg-white px-7 py-3.5 text-sm font-semibold text-slate-900 shadow-lg transition hover:-translate-y-0.5 hover:bg-slate-100"
                      : "rounded-xl border border-white/20 px-7 py-3.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/10"
                  }
                >
                  {btn.text}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <div className="flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
                <FiMail className="text-sm" />
              </span>
              <span className="text-sm font-bold text-slate-900">{pageData.logoText}</span>
            </div>

            <div className="flex flex-wrap gap-6 text-sm font-medium text-slate-500">
              {pageData.footer?.links?.map((link, idx) => (
                <button
                  key={idx}
                  onClick={() => goTo(link.route)}
                  className="transition hover:text-indigo-600"
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 border-t border-slate-100 pt-6 text-center text-sm text-slate-400 sm:text-left">
            {pageData.footer?.copyrightText}
          </div>
        </div>
      </footer>

      {/* ── Demo modal ── */}
      <AnimatePresence>
        {demoOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDemoOpen(false)}
            className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-2xl"
            >
              <button
                onClick={() => setDemoOpen(false)}
                className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-600 shadow-sm transition hover:text-slate-900"
                aria-label="Close demo"
              >
                <FiX />
              </button>
              <div className="aspect-video overflow-hidden rounded-xl bg-slate-100">
                <video
                  src={pageData.hero?.demoVideoUrl}
                  controls
                  autoPlay
                  className="h-full w-full object-cover"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ── Sub-components ── */

const WorkflowStepCard = ({ icon, title, desc, index }) => (
  <motion.article
    whileHover={{ y: -4 }}
    transition={{ type: "spring", stiffness: 380, damping: 28 }}
    className="group relative flex-1 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:border-indigo-200 hover:shadow-md lg:min-h-[220px]"
  >
    <div className="flex h-full flex-col">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-lg text-indigo-600 ring-1 ring-indigo-100 transition group-hover:bg-indigo-600 group-hover:text-white group-hover:ring-indigo-600">
          {icon}
        </div>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-400">
          0{index}
        </span>
      </div>
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-500">{desc}</p>
    </div>
  </motion.article>
);

const FlowArrow = () => (
  <div className="flex shrink-0 items-center justify-center px-0.5">
    <div className="hidden h-px w-5 bg-gradient-to-r from-indigo-200 to-violet-200 lg:block" />
    <div className="flex h-8 w-8 rotate-90 items-center justify-center rounded-full border border-indigo-100 bg-white text-indigo-500 shadow-sm lg:rotate-0">
      <FiArrowRight className="text-sm" />
    </div>
    <div className="hidden h-px w-5 bg-gradient-to-r from-violet-200 to-indigo-200 lg:block" />
  </div>
);

const FeatureCard = ({ icon, title, description, tag }) => (
  <motion.div
    variants={fadeUp}
    whileHover={{ y: -4 }}
    className="group rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:border-indigo-200 hover:shadow-md"
  >
    <div className="mb-4 flex items-center justify-between">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-lg text-indigo-600 transition group-hover:bg-indigo-600 group-hover:text-white">
        {icon}
      </div>
      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        {tag}
      </span>
    </div>
    <h3 className="text-base font-semibold text-slate-900">{title}</h3>
    <p className="mt-2 text-sm leading-relaxed text-slate-500">{description}</p>
  </motion.div>
);

const UseCaseCard = ({ icon, title, description, metric }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-40px" }}
    transition={{ duration: 0.5 }}
    whileHover={{ y: -3 }}
    className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:border-indigo-200 hover:shadow-md"
  >
    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-lg text-violet-600">
      {icon}
    </div>
    <h3 className="text-base font-semibold text-slate-900">{title}</h3>
    <p className="mt-2 text-sm leading-relaxed text-slate-500">{description}</p>
    <p className="mt-4 text-sm font-semibold text-emerald-600">{metric}</p>
  </motion.div>
);

const BenefitCard = ({ icon, title, description }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-40px" }}
    transition={{ duration: 0.5 }}
    className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-5"
  >
    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-white text-lg shadow-sm">
      {icon}
    </div>
    <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
    <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{description}</p>
  </motion.div>
);

const TestimonialCard = ({ quote, name, role, initials }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-40px" }}
    transition={{ duration: 0.5 }}
    className="flex flex-col rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm"
  >
    <p className="flex-1 text-sm leading-relaxed text-slate-600">&ldquo;{quote}&rdquo;</p>
    <div className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-5">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
        {initials}
      </div>
      <div>
        <div className="text-sm font-semibold text-slate-900">{name}</div>
        <div className="text-xs text-slate-500">{role}</div>
      </div>
    </div>
  </motion.div>
);

const FaqItem = ({ question, answer, isOpen, onToggle }) => (
  <div>
    <button
      onClick={onToggle}
      className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-slate-50"
      aria-expanded={isOpen}
    >
      <span className="text-sm font-semibold text-slate-900">{question}</span>
      <FiChevronDown
        className={`shrink-0 text-slate-400 transition-transform duration-200 ${
          isOpen ? "rotate-180" : ""
        }`}
      />
    </button>
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          <p className="px-5 pb-4 text-sm leading-relaxed text-slate-500">{answer}</p>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

export default LandingPage;

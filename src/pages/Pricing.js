import React, { useState } from "react";
import { motion } from "framer-motion";
import { FiCheck, FiArrowRight, FiStar, FiTwitter, FiLinkedin, FiGithub, FiYoutube, FiMail } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import Header from "../component/Header";

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: "easeOut" },
  },
};

const Pricing = () => {
  const navigate = useNavigate();
  const [demoOpen, setDemoOpen] = useState(false);
  const [content, setContent] = useState(null);
const pageData = content || {
    logoText: "Replex Engine",
    navbarLinks: [
      { label: "Product", route: "/product" },
      { label: "Solutions", route: "/solutions" },
      { label: "Developers", route: "/developer" },
      { label: "Pricing", route: "/pricing" },
    ],
    hero: {
      badge: "AI Lead Automation",
      mainTitle: "More than auto-replies, Complete Lead Automation",
      highlightedTitle: "",
      description:
        "Replex Engine captures inbound leads, understands email intent, sends instant replies, and keeps follow-ups running until every opportunity is handled.",
      buttons: [
        {
          text: "Start automating for free",
          route: "/register",
          isPrimary: true,
        },
        { text: "Watch workflow demo", route: "#demo", isPrimary: false },
      ],
      demoVideoUrl:
        "https://videos.ctfassets.net/un655fb9wln6/3wNElEdBiFdK2eauJB7wMp/021db93cbf76430c0b75cfb622876308/make_new_hero_animation.webm",
    },
    features: {
      title: "A visual workflow for every lead",
      subtitle:
        "From first email to final follow-up, Replex Engine keeps your pipeline moving.",
      cards: [
        {
          iconName: "FiZap",
          title: "Capture",
          description:
            "Automatically capture inbound leads from email, forms, forwarding, or mailhooks.",
        },
        {
          iconName: "PiRobotLight",
          title: "Understand",
          description:
            "Detect intent, urgency, lead source, and context before replying.",
        },
        {
          iconName: "FiSend",
          title: "Reply",
          description:
            "Send the right template or AI-assisted response instantly.",
        },
        {
          iconName: "FiRepeat",
          title: "Follow-up",
          description:
            "Trigger delayed sequences until the lead responds or converts.",
        },
        {
          iconName: "FiBarChart2",
          title: "Track",
          description:
            "Monitor lead progress, reply status, and workflow performance.",
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

  const goTo = (route) => {
    if (route === "#demo") setDemoOpen(true);
    else navigate(route);
  };


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
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Checkout error:", err);
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#fafafa] text-zinc-950 font-sans selection:bg-violet-100">
      <Header />

      <section className="relative min-h-[620px] overflow-hidden border-b border-zinc-200/70 bg-[radial-gradient(circle_at_50%_10%,#ffffff_0%,#fafafa_42%,#f4f4f5_100%)] px-5 pb-24 pt-40">
        <CircuitBackground />

        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          className="relative z-10 mx-auto max-w-6xl"
        >
          <motion.div variants={fadeUp} className="mx-auto max-w-4xl text-center">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/80 px-3.5 py-1.5 text-xs font-bold text-zinc-700 shadow-sm backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-violet-600" />
              Pricing
            </div>

            <h1 className="mx-auto max-w-5xl text-[44px] font-semibold leading-[0.98] tracking-[-0.065em] text-zinc-950 sm:text-6xl md:text-[76px]">
              Simple pricing for lead automation
            </h1>

            <p className="mx-auto mt-7 max-w-3xl text-base leading-8 text-zinc-600 sm:text-xl">
              Start free and upgrade when you need AI-powered replies,
              follow-ups, and advanced lead insights.
            </p>
          </motion.div>
        </motion.div>
      </section>

      <section className="border-b border-zinc-200 bg-white px-5 py-24">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mx-auto max-w-5xl"
        >
          <div className="grid gap-6 md:grid-cols-2">
            <PricingCard
              title="Free"
              description="Everything you need to start automating leads."
              price="$0"
              priceNote="/month"
              features={[
                "Visual scenario builder",
                "Email lead capture",
                "Conditions and delays",
                "Manual templates",
                "Basic lead tracking",
              ]}
              buttonText="Start for Free"
              onClick={() => navigate("/login")}
            />

            <PricingCard
              popular
              title="Pro"
              description="AI-powered automation for serious teams."
              price="$29.99"
              priceNote="/month"
              features={[
                "Everything in Free",
                "AI email templates",
                "Smart conditional routing",
                "AI follow-up suggestions",
                "Advanced lead insights",
              ]}
              buttonText="Upgrade to Pro"
              onClick={handleProCheckout}
            />
          </div>
        </motion.div>
      </section>

      <section className="bg-[#FBFAFA] px-5 py-20">
        <div className="mx-auto max-w-4xl rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-[0_8px_30px_rgba(0,0,0,0.08)] sm:p-12">
          <h2 className="text-3xl font-semibold tracking-[-0.045em] text-zinc-950 sm:text-5xl">
            Not sure which plan fits?
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-zinc-600">
            Start free, test your lead workflow, and move to Pro when AI
            automation becomes necessary.
          </p>

          <button
            onClick={() => navigate("/login")}
            className="mt-8 inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-[#6F4BFF] px-4 text-[13px] font-semibold text-white shadow-[0_7px_18px_rgba(111,75,255,0.28)] transition hover:bg-[#6242E8]"
          >
            Start for Free
            <FiArrowRight className="text-[13px]" />
          </button>
        </div>
      </section>
      <footer className="border-t border-zinc-200/70 bg-[#FBFAFA] py-16">
              <div className="mx-auto max-w-7xl px-5">
                <div className="grid gap-10 lg:grid-cols-[1.2fr_3fr]">
                  <button
                    onClick={() => navigate("/")}
                    className="flex items-center gap-2 self-start"
                  >
                    <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-zinc-100 ring-1 ring-zinc-200">
                      <span className="absolute h-3.5 w-3.5 rounded-full border-[3px] border-zinc-900 border-r-transparent" />
                      <span className="absolute right-[5px] top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-zinc-900" />
                    </span>
      
                    <span className="text-[18px] font-semibold tracking-[-0.025em] text-zinc-950">
                      {pageData.logoText}
                    </span>
                  </button>
      
                  <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-5">
                    {[
                      {
                        title: "Product",
                        links: [
                          { label: "Lead Capture", route: "/product" },
                          { label: "AI Replies", route: "/solutions" },
                          { label: "Follow-ups", route: "/product" },
                          { label: "Workflow Automation", route: "/product" },
                        ],
                      },
                      {
                        title: "Solutions",
                        links: [
                          { label: "Sales Teams", route: "/solutions" },
                          { label: "Agencies", route: "/solutions" },
                          { label: "Startups", route: "/solutions" },
                          { label: "Customer Support", route: "/solutions" },
                        ],
                      },
                      {
                        title: "Developers",
                        links: [
                          { label: "API Access", route: "/developer" },
                          { label: "Email Webhooks", route: "/developer" },
                          { label: "Integrations", route: "/developer" },
                          { label: "Documentation", route: "/developer" },
                        ],
                      },
                      {
                        title: "Company",
                        links: [
                          { label: "About", route: "/about" },
                          { label: "Pricing", route: "/pricing" },
                          { label: "Talk to Sales", route: "/talk-to-sales" },
                          { label: "Contact", route: "/contact" },
                        ],
                      },
                      {
                        title: "Legal",
                        links: [
                          { label: "Privacy Policy", route: "/privacy-policy" },
                          { label: "Terms & Conditions", route: "/terms" },
                          { label: "Security", route: "/security" },
                          { label: "Cookie Policy", route: "/cookies" },
                        ],
                      },
                    ].map((group) => (
                      <div key={group.title}>
                        <h4 className="mb-4 text-xs font-semibold text-zinc-400">
                          {group.title}
                        </h4>
      
                        <div className="flex flex-col gap-3">
                          {group.links.map((link) => (
                            <button
                              key={link.label}
                              onClick={() => goTo(link.route)}
                              className="text-left text-sm font-semibold text-zinc-950 transition hover:text-violet-600"
                            >
                              {link.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
      
                <div className="mt-14 flex flex-col items-center justify-between gap-5 border-t border-zinc-200 pt-7 sm:flex-row">
                  <p className="text-sm font-medium text-zinc-500">
                    {pageData.footer?.copyrightText}
                  </p>
      
                  <div className="flex items-center gap-4 text-zinc-500">
                    {[
                      { icon: <FiTwitter />, label: "Twitter" },
                      { icon: <FiLinkedin />, label: "LinkedIn" },
                      { icon: <FiGithub />, label: "GitHub" },
                      { icon: <FiYoutube />, label: "YouTube" },
                      { icon: <FiMail />, label: "Email" },
                    ].map((item) => (
                      <button
                        key={item.label}
                        aria-label={item.label}
                        className="text-[18px] transition hover:text-violet-600"
                      >
                        {item.icon}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </footer>
    </div>
  );
};

const PricingCard = ({
  title,
  description,
  price,
  priceNote,
  features,
  buttonText,
  onClick,
  popular = false,
}) => (
  <motion.div
    variants={fadeUp}
    whileHover={{ y: -4 }}
    className={`relative flex flex-col justify-between rounded-2xl border p-7 shadow-sm transition ${
      popular
        ? "border-[#6F4BFF]/40 bg-white shadow-[0_14px_45px_rgba(111,75,255,0.16)]"
        : "border-zinc-200 bg-white hover:shadow-[0_14px_45px_rgba(24,24,27,0.08)]"
    }`}
  >
    {popular && (
      <div className="absolute -top-4 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-[#6F4BFF] px-4 py-1.5 text-xs font-semibold text-white shadow-[0_7px_18px_rgba(111,75,255,0.28)]">
        <FiStar className="text-[13px]" />
        Most Popular
      </div>
    )}

    <div>
      <h3 className="text-lg font-semibold tracking-[-0.02em] text-zinc-950">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-zinc-600">{description}</p>

      <div className="mt-7 flex items-end gap-2">
        <span className="text-4xl font-semibold tracking-[-0.045em] text-zinc-950">
          {price}
        </span>
        <span className="mb-1 text-sm font-medium text-zinc-500">
          {priceNote}
        </span>
      </div>

      <ul className="mt-7 space-y-3">
        {features.map((feature) => (
          <li
            key={feature}
            className="flex gap-3 text-sm font-medium leading-6 text-zinc-700"
          >
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#F7F7F8] text-[#6F4BFF] ring-1 ring-zinc-200">
              <FiCheck className="text-[13px]" />
            </span>
            {feature}
          </li>
        ))}
      </ul>
    </div>

    <button
      onClick={onClick}
      className={
        popular
          ? "mt-8 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#6F4BFF] px-4 text-sm font-semibold text-white shadow-[0_7px_18px_rgba(111,75,255,0.28)] transition hover:bg-[#6242E8]"
          : "mt-8 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-[#F7F7F8] px-4 text-sm font-semibold text-zinc-950 shadow-sm transition hover:bg-white"
      }
    >
      {buttonText}
      {popular && <FiArrowRight className="text-[13px]" />}
    </button>
  </motion.div>
);

const CircuitBackground = () => (
  <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-90">
    <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(24,24,27,0.045)_1px,transparent_1px),linear-gradient(to_bottom,rgba(24,24,27,0.045)_1px,transparent_1px)] bg-[size:96px_96px]" />
    <div className="absolute inset-x-0 top-0 h-full bg-[radial-gradient(circle_at_center,transparent_0%,transparent_34%,rgba(250,250,250,0.78)_72%)]" />

    <svg
      className="absolute left-1/2 top-8 h-[600px] w-[1500px] -translate-x-1/2 text-zinc-300/55"
      viewBox="0 0 1500 600"
      fill="none"
    >
      <path d="M72 140H222L292 210H474L545 140H690" stroke="currentColor" />
      <path d="M1430 140H1278L1208 210H1026L955 140H810" stroke="currentColor" />
      <path d="M260 460H430L500 525H658V392H750" stroke="currentColor" />
      <path d="M1240 460H1070L1000 525H842V392H750" stroke="currentColor" />
      <path d="M750 0V105M750 495V600M520 0V105L590 175V245M980 0V105L910 175V245" stroke="currentColor" />

      {[260, 430, 585, 750, 915, 1070, 1240].map((x, i) => (
        <rect
          key={i}
          x={x}
          y={i % 2 ? 112 : 382}
          width="12"
          height="12"
          rx="3"
          fill="white"
          stroke="currentColor"
        />
      ))}

      {[350, 675, 825, 1150].map((x, i) => (
        <circle
          key={i}
          cx={x}
          cy={i % 2 ? 165 : 430}
          r="10"
          fill="white"
          stroke="currentColor"
        />
      ))}
    </svg>

    <div className="absolute left-1/2 top-[118px] h-[360px] w-[720px] -translate-x-1/2 rounded-full bg-white/55 blur-3xl" />
  </div>
);

export default Pricing;
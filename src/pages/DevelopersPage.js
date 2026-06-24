import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FiCode,
  FiGitBranch,
  FiTerminal,
  FiArrowRight,
  FiCheckCircle,
  FiMail,
  FiZap,
  FiTwitter,
  FiLinkedin,
  FiGithub,
  FiYoutube,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import Header from "../component/Header";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: "easeOut" },
  },
};

const DevelopersPage = () => {
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
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#fafafa] text-zinc-950 font-sans selection:bg-violet-100">
      <Header />

      <section className="relative min-h-[620px] overflow-hidden border-b border-zinc-200/70 bg-[radial-gradient(circle_at_50%_10%,#ffffff_0%,#fafafa_42%,#f4f4f5_100%)] px-5 pb-24 pt-40">
        <CircuitBackground />

        <div className="relative z-10 mx-auto max-w-7xl">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mx-auto max-w-4xl text-center"
          >
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/80 px-3.5 py-1.5 text-xs font-bold text-zinc-700 shadow-sm backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-violet-600" />
              Developers
            </div>

            <h1 className="mx-auto max-w-5xl text-[44px] font-semibold leading-[0.98] tracking-[-0.065em] text-zinc-950 sm:text-6xl md:text-[76px]">
              Built for developers
            </h1>

            <p className="mx-auto mt-7 max-w-3xl text-base leading-8 text-zinc-600 sm:text-xl">
              Extend, control, and integrate lead automation using APIs,
              webhooks, mailhooks, and programmable workflow logic.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                onClick={() => navigate("/talk-to-sales")}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-[#6F4BFF] px-4 text-[13px] font-semibold text-white shadow-[0_7px_18px_rgba(111,75,255,0.28)] transition hover:bg-[#6242E8]"
              >
                Talk to Sales
                <FiArrowRight className="text-[13px]" />
              </button>

              <button
                onClick={() => navigate("/product")}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-[#F7F7F8] px-4 text-[13px] font-semibold text-zinc-950 shadow-sm transition hover:bg-white"
              >
                View Product
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="border-b border-zinc-200 bg-white px-5 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-14 max-w-3xl text-center">
            <h2 className="text-3xl font-semibold leading-tight tracking-[-0.045em] text-zinc-950 sm:text-5xl">
              Developer tools for lead automation
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-zinc-600">
              Connect Replex Engine with your existing stack and control how
              leads move through your automation system.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <DevFeature
              icon={<FiTerminal />}
              title="Mailhook Ingestion"
              desc="Forward emails into Replex using a mailhook and parse incoming lead content automatically."
            />

            <DevFeature
              icon={<FiGitBranch />}
              title="Conditional Logic Engine"
              desc="Define automation flows with conditions, delays, actions, and state transitions."
            />

            <DevFeature
              icon={<FiCode />}
              title="API & Webhooks"
              desc="Trigger scenarios, fetch lead states, and push automation events through your own systems."
            />

            <DevFeature
              icon={<FiZap />}
              title="AI Template Generation"
              desc="Generate, refine, and reuse email templates with structured AI-assisted inputs."
            />
          </div>
        </div>
      </section>

      <section className="border-b border-zinc-200/70 bg-[#FBFAFA] px-5 py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-2">
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-[#6F4BFF]">
              API example
            </p>

            <h2 className="text-3xl font-semibold leading-tight tracking-[-0.045em] text-zinc-950 sm:text-5xl">
              Capture leads programmatically
            </h2>

            <p className="mt-5 max-w-xl text-base leading-7 text-zinc-600">
              Send lead data into your automation engine and trigger replies,
              follow-ups, and tracking from your backend.
            </p>

            <div className="mt-8 space-y-4">
              {[
                "Send inbound leads into Replex",
                "Trigger workflow scenarios",
                "Track reply and follow-up status",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#F7F7F8] ring-1 ring-zinc-200">
                    <FiCheckCircle className="text-[13px] text-[#6F4BFF]" />
                  </span>
                  <span className="text-sm font-medium leading-6 text-zinc-700">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <CodeBlock />
        </div>
      </section>

      <section className="bg-[#FBFAFA] px-5 py-24">
        <div className="mx-auto max-w-4xl rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-[0_8px_30px_rgba(0,0,0,0.08)] sm:p-12">
          <div className="mx-auto mb-5 flex h-11 w-11 items-center justify-center rounded-full bg-[#F7F7F8] ring-1 ring-zinc-200">
            <FiMail className="text-[#6F4BFF]" />
          </div>

          <h2 className="text-3xl font-semibold tracking-[-0.045em] text-zinc-950 sm:text-5xl">
            Need custom integrations?
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-zinc-600">
            Talk to the team and connect Replex Engine to your existing CRM,
            inbox, forms, or internal tooling.
          </p>

          <button
            onClick={() => navigate("/talk-to-sales")}
            className="mt-8 inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-[#6F4BFF] px-4 text-[13px] font-semibold text-white shadow-[0_7px_18px_rgba(111,75,255,0.28)] transition hover:bg-[#6242E8]"
          >
            Talk to Sales
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

            <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
              {[
                {
                  title: "Product",
                  links: [
                    { label: "Lead Capture", route: "/product" },
                    // { label: "AI Replies", route: "/solutions" },
                    // { label: "Follow-ups", route: "/product" },
                    { label: "Workflow Automation", route: "/product" },
                  ],
                },
                
                {
                  title: "Developers",
                  links: [
                    { label: "API Access", route: "/developer" },
                    // { label: "Email Webhooks", route: "/developer" },
                    { label: "Integrations", route: "/developer" },
                    // { label: "Documentation", route: "/developer" },
                  ],
                },
                {
                  title: "Company",
                  links: [
                    // { label: "About", route: "/about" },
                    { label: "Pricing", route: "/pricing" },
                    { label: "Talk to Sales", route: "/talk-to-sales" },
                    // { label: "Contact", route: "/contact" },
                  ],
                },
                {
                  title: "Legal",
                  links: [
                    { label: "Privacy Policy", route: "/privacy-policy" },
                    { label: "Terms & Conditions", route: "/terms" },
                    // { label: "Security", route: "/security" },
                    // { label: "Cookie Policy", route: "/cookies" },
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

            {/* <div className="flex items-center gap-4 text-zinc-500">
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
            </div> */}
          </div>
        </div>
      </footer>
    </div>
  );
};

const DevFeature = ({ icon, title, desc }) => (
  <motion.div
    variants={fadeUp}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true }}
    whileHover={{ y: -4 }}
    className="rounded-2xl border border-zinc-200 bg-white p-7 shadow-sm transition hover:border-zinc-300 hover:shadow-[0_14px_45px_rgba(24,24,27,0.08)]"
  >
    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#F7F7F8] text-xl text-[#6F4BFF] ring-1 ring-zinc-200">
      {icon}
    </div>

    <h3 className="mb-2 text-lg font-semibold tracking-[-0.02em] text-zinc-950">
      {title}
    </h3>

    <p className="text-sm leading-6 text-zinc-600">{desc}</p>
  </motion.div>
);

const CodeBlock = () => (
  <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_14px_45px_rgba(24,24,27,0.08)]">
    <div className="flex items-center gap-2 border-b border-zinc-200 bg-[#F7F7F8] px-4 py-3">
      <div className="h-3 w-3 rounded-full bg-red-400" />
      <div className="h-3 w-3 rounded-full bg-yellow-400" />
      <div className="h-3 w-3 rounded-full bg-green-400" />
      <span className="ml-3 text-xs font-medium text-zinc-500">
        api/request.json
      </span>
    </div>

    <pre className="overflow-x-auto p-6 text-sm leading-7 text-zinc-700">
{`POST /api/leads
{
  "from": "lead@example.com",
  "subject": "Interested in pricing",
  "body": "Can you tell me more?"
}`}
    </pre>
  </div>
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

export default DevelopersPage;
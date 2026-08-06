import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FiArrowRight,
  FiBox,
  FiUsers,
  FiCode,
  FiBriefcase,
  FiShield,
  FiCheckCircle,
} from "react-icons/fi";

const footerSections = [
  {
    title: "Product",
    icon: <FiBox />,
    description: "Core tools to capture, reply, follow up, and automate leads.",
    links: [
      { label: "Lead Capture", route: "/product" },
      { label: "AI Replies", route: "/solutions" },
      { label: "Follow-ups", route: "/product" },
      { label: "Workflow Automation", route: "/product" },
    ],
  },
  {
    title: "Solutions",
    icon: <FiUsers />,
    description: "Built for teams that need faster lead handling.",
    links: [
      { label: "Sales Teams", route: "/solutions" },
      { label: "Agencies", route: "/solutions" },
      { label: "Startups", route: "/solutions" },
      { label: "Customer Support", route: "/solutions" },
    ],
  },
  {
    title: "Developers",
    icon: <FiCode />,
    description: "Connect Replex Engine with your own systems and workflows.",
    links: [
      { label: "API Access", route: "/developer" },
      { label: "Email Webhooks", route: "/developer" },
      { label: "Integrations", route: "/developer" },
      { label: "Documentation", route: "/developer" },
    ],
  },
  {
    title: "Company",
    icon: <FiBriefcase />,
    description: "Learn more about Replex Engine and how to reach us.",
    links: [
      { label: "About", route: "/about" },
      { label: "Pricing", route: "/pricing" },
      { label: "Talk to Sales", route: "/talk-to-sales" },
      { label: "Contact", route: "/contact" },
    ],
  },
  {
    title: "Legal",
    icon: <FiShield />,
    description: "Important policies, security, and usage information.",
    links: [
      { label: "Privacy Policy", route: "/privacy-policy" },
      { label: "Terms & Conditions", route: "/terms" },
      { label: "Security", route: "/security" },
      { label: "Cookie Policy", route: "/cookies" },
    ],
  },
];

const FooterLinksPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#fafafa] text-zinc-950 font-sans selection:bg-violet-100">
      <section className="relative overflow-hidden border-b border-zinc-200/70 bg-[radial-gradient(circle_at_50%_10%,#ffffff_0%,#fafafa_42%,#f4f4f5_100%)]">
        <header className="fixed inset-x-0 top-2 z-50 px-3">
          <div className="mx-auto flex h-[46px] max-w-[1230px] items-center justify-between rounded-[14px] border border-zinc-200/80 bg-white/85 px-3 shadow-[0_8px_30px_rgba(0,0,0,0.08)] backdrop-blur-xl">
            <button
              onClick={() => navigate("/")}
              className="flex h-full items-center gap-2 border-r border-zinc-200/80 pr-4"
            >
              <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-zinc-100 ring-1 ring-zinc-200">
                <span className="absolute h-3.5 w-3.5 rounded-full border-[3px] border-zinc-900 border-r-transparent" />
                <span className="absolute right-[5px] top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-zinc-900" />
              </span>

              <span className="text-[18px] font-semibold leading-none tracking-[-0.025em] text-zinc-950">
                Replex Engine
              </span>
            </button>

            <button
              onClick={() => navigate("/register")}
              className="inline-flex h-8 items-center gap-2 rounded-lg bg-[#6F4BFF] px-3 text-[13px] font-semibold leading-none text-white shadow-[0_7px_18px_rgba(111,75,255,0.28)] transition hover:bg-[#6242E8]"
            >
              Get Started
              <FiArrowRight className="text-[12px]" />
            </button>
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-5 pb-20 pt-40 text-center">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/80 px-3.5 py-1.5 text-xs font-bold text-zinc-700 shadow-sm backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-600" />
            Replex Engine Directory
          </div>

          <h1 className="mx-auto max-w-4xl text-[44px] font-semibold leading-[0.98] tracking-[-0.065em] text-zinc-950 sm:text-6xl md:text-[76px]">
            Everything you need in one place
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-base leading-8 text-zinc-600 sm:text-xl">
            Explore product features, solutions, developer tools, company pages,
            and legal resources from one simple page.
          </p>
        </div>
      </section>

      <section className="border-b border-zinc-200 bg-white py-24">
        <div className="mx-auto max-w-7xl px-5">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {footerSections.map((section) => (
              <div
                key={section.title}
                className="rounded-2xl border border-zinc-200 bg-[#fafafa] p-6 shadow-[0_18px_60px_rgba(24,24,27,0.07)] transition hover:-translate-y-1 hover:shadow-[0_24px_80px_rgba(24,24,27,0.1)]"
              >
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#6F4BFF] ring-1 ring-zinc-200">
                  {section.icon}
                </div>

                <h2 className="text-2xl font-semibold tracking-[-0.045em] text-zinc-950">
                  {section.title}
                </h2>

                <p className="mt-3 min-h-[56px] text-sm font-medium leading-7 text-zinc-600">
                  {section.description}
                </p>

                <div className="mt-6 space-y-3">
                  {section.links.map((link) => (
                    <button
                      key={link.label}
                      onClick={() => navigate(link.route)}
                      className="group flex w-full items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3 text-left text-sm font-semibold text-zinc-900 shadow-sm transition hover:border-violet-200 hover:text-violet-600"
                    >
                      <span className="inline-flex items-center gap-2">
                        <FiCheckCircle className="text-[14px] text-[#6F4BFF]" />
                        {link.label}
                      </span>

                      <FiArrowRight className="text-[14px] text-zinc-400 transition group-hover:translate-x-1 group-hover:text-violet-600" />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#FBFAFA] py-20">
        <div className="mx-auto max-w-4xl px-5 text-center">
          <h2 className="text-4xl font-semibold tracking-[-0.055em] text-zinc-950 sm:text-5xl">
            Ready to automate your lead replies?
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-zinc-600">
            Start building simple reply flows, follow-ups, and lead handling
            workflows without writing code.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              onClick={() => navigate("/register")}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#6F4BFF] px-5 text-sm font-semibold text-white shadow-[0_7px_18px_rgba(111,75,255,0.28)] transition hover:bg-[#6242E8]"
            >
              Get Started Free
              <FiArrowRight className="text-[14px]" />
            </button>

            <button
              onClick={() => navigate("/contact")}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-5 text-sm font-semibold text-zinc-950 shadow-sm transition hover:bg-zinc-50"
            >
              Contact Us
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FooterLinksPage;

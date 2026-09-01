import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FiZap,
  FiInbox,
  FiLink,
  FiMail,
  FiCheckCircle,
  FiShield,
  FiSearch,
  FiCopy,
  FiCheck,
  FiArrowRight,
  FiSliders,
  FiExternalLink,
  FiArrowLeft,
  FiLayers,
  FiHelpCircle,
  FiCode,
  FiCreditCard,
  FiChevronRight,
  FiTerminal,
  FiBook,
  FiFileText,
} from "react-icons/fi";
import toast from "react-hot-toast";

export default function DocumentationPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSection, setActiveSection] = useState("overview");
  const [copiedCode, setCopiedCode] = useState(null);

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const navGroups = [
    {
      group: "Getting Started",
      items: [
        { id: "overview", label: "Overview & Architecture", icon: FiZap },
        { id: "quickstart", label: "Quick-Start (5 Mins)", icon: FiCheckCircle },
      ],
    },
    {
      group: "Integrations & Mail",
      items: [
        { id: "connections", label: "Email Connections", icon: FiLink },
        { id: "mailhooks", label: "Inbound Mailhooks", icon: FiTerminal },
      ],
    },
    {
      group: "Automation Engine",
      items: [
        { id: "scenarios", label: "Shopify Scenarios", icon: FiSliders },
        { id: "routing", label: "Multi-Branch Routing", icon: FiLayers },
        { id: "queues", label: "Queue & Backlog Control", icon: FiZap },
      ],
    },
    {
      group: "Operations & Inbox",
      items: [
        { id: "inbox", label: "Unified Lead Inbox", icon: FiInbox },
        { id: "ai", label: "AI Replies & Knowledge", icon: FiCode },
        { id: "templates", label: "Templates & Variables", icon: FiMail },
      ],
    },
    {
      group: "Platform & Account",
      items: [
        { id: "plans", label: "Plans & Limits", icon: FiCreditCard },
        { id: "security", label: "Security & Timezones", icon: FiShield },
        { id: "faqs", label: "Troubleshooting & FAQs", icon: FiHelpCircle },
      ],
    },
  ];

  const allItems = navGroups.flatMap((g) => g.items);
  const filteredNavGroups = navGroups
    .map((g) => ({
      ...g,
      items: g.items.filter(
        (i) =>
          i.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          g.group.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((g) => g.items.length > 0);

  const scrollTo = (id) => {
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans antialiased selection:bg-slate-900 selection:text-white">
      {/* Top Shopify Devs-style Navigation Bar */}
      <header className="sticky top-0 z-50 h-14 border-b border-slate-200 bg-white/95 backdrop-blur-md px-6 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link
            to="/dashboard"
            className="flex items-center gap-2.5 group"
            title="Go to Replex Engine Dashboard"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-950 text-white font-extrabold text-xs shadow-xs">
              R
            </div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm tracking-tight text-slate-950">
                Replex Engine
              </span>
              <span className="text-slate-300 font-light">/</span>
              <span className="text-xs font-semibold text-slate-600">
                Docs
              </span>
            </div>
          </Link>

          <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 border border-slate-200 text-slate-600">
            v2.4.0
          </span>
        </div>

        {/* Center Search bar */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-8 relative">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input
            type="text"
            placeholder="Search guides, dynamic tags, API parameters..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-950 focus:border-slate-950 transition"
          />
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-950 transition shadow-2xs"
          >
            <FiArrowLeft size={13} />
            <span>Dashboard</span>
          </Link>
          <Link
            to="/inbox"
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-950 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition shadow-2xs"
          >
            <span>Open Inbox</span>
            <FiExternalLink size={12} />
          </Link>
        </div>
      </header>

      {/* Edge-to-edge Shopify Devs Workspace Layout */}
      <div className="flex-1 flex w-full">
        {/* Left Sidebar attached border-to-border — single view without scrolling */}
        <aside className="w-60 shrink-0 border-r border-slate-200 bg-[#FBFBFB] h-[calc(100vh-56px)] sticky top-14 overflow-hidden px-3 py-3.5 hidden md:flex flex-col justify-between select-none">
          <div className="space-y-3">
            {filteredNavGroups.map((grp) => (
              <div key={grp.group}>
                <div className="px-2 mb-1 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  {grp.group}
                </div>
                <nav className="flex flex-col gap-0.5">
                  {grp.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeSection === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => scrollTo(item.id)}
                        className={`flex items-center gap-2 px-2 py-1 rounded-md text-left text-[11px] font-medium transition cursor-pointer ${
                          isActive
                            ? "bg-slate-900 text-white font-semibold shadow-xs"
                            : "text-slate-600 hover:bg-slate-200/60 hover:text-slate-950"
                        }`}
                      >
                        <Icon size={13} className={isActive ? "text-white" : "text-slate-400"} />
                        <span className="truncate">{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            ))}
          </div>

          <div className="pt-2.5 border-t border-slate-200 px-1.5 flex items-center justify-between text-[10px] font-medium text-slate-400">
            <Link to="/connection" className="hover:text-slate-950 transition">Connections</Link>
            <span>•</span>
            <Link to="/scenarios/all" className="hover:text-slate-950 transition">Scenarios</Link>
            <span>•</span>
            <Link to="/templates" className="hover:text-slate-950 transition">Templates</Link>
          </div>
        </aside>

        {/* Main Content Area attached with clean Shopify Devs margins */}
        <main className="flex-1 min-w-0 h-[calc(100vh-56px)] overflow-y-auto">
          <div className="max-w-4xl px-8 lg:px-12 py-10 space-y-12">
            
            {/* Breadcrumb & Title */}
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-3">
                <Link to="/dashboard" className="hover:text-slate-950 hover:underline">Replex Engine</Link>
                <FiChevronRight size={12} />
                <span className="text-slate-400">Documentation</span>
                <FiChevronRight size={12} />
                <span className="text-slate-900 font-semibold">Platform Guide</span>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
                Replex Engine Documentation
              </h1>
              <p className="mt-3 text-base text-slate-600 leading-relaxed max-w-3xl">
                The high-performance automation and AI conversion platform for Shopify Partners, development agencies, and client service teams.
              </p>
            </div>

            {/* Section 1: Overview */}
            <section id="overview" className="border-t border-slate-200 pt-8 scroll-mt-20">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                <FiZap className="text-purple-600" />
                <span>Architecture</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-950 tracking-tight mb-3">
                1. Platform Overview & Ingestion Flow
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                Replex Engine captures inbound inquiries from your business channels, extracts client requirements, branches leads by requested service, and dispatches human-quality Gemini AI responses.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50">
                  <div className="font-bold text-xs uppercase tracking-wider text-slate-900 mb-1">0ms Ingestion</div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Direct webhook parsing transforms raw marketplace notifications into clean leads in milliseconds.
                  </p>
                </div>
                <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50">
                  <div className="font-bold text-xs uppercase tracking-wider text-slate-900 mb-1">Multi-Branch Router</div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Splits leads by service type (Custom Themes, App Dev, Migrations, Store Optimization).
                  </p>
                </div>
                <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50">
                  <div className="font-bold text-xs uppercase tracking-wider text-slate-900 mb-1">Gemini AI Auto-Pilot</div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Composes bespoke proposals matching your actual portfolio links, pricing floors, and guidelines.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 2: Quick-Start */}
            <section id="quickstart" className="border-t border-slate-200 pt-8 scroll-mt-20">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                <FiCheckCircle className="text-emerald-600" />
                <span>Setup Guide</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-950 tracking-tight mb-3">
                2. Quick-Start Guide (5 Minutes)
              </h2>
              <div className="border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-100">
                <div className="p-4 bg-white flex items-start gap-3.5">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-900 text-xs font-bold text-white">1</span>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">Authorize Outbound Sender Connection</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Go to <Link to="/connection" className="font-semibold text-slate-900 hover:underline">Connections</Link> and connect your Gmail, Outlook, or SMTP sender account.</p>
                  </div>
                </div>
                <div className="p-4 bg-white flex items-start gap-3.5">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-900 text-xs font-bold text-white">2</span>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">Forward Inbound Notifications to Mailhook</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Copy your unique Mailhook address and configure auto-forwarding from your Shopify Partner Directory email.</p>
                  </div>
                </div>
                <div className="p-4 bg-white flex items-start gap-3.5">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-900 text-xs font-bold text-white">3</span>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">Define Company Profile & Pricing Floors</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Under <Link to="/company-profile" className="font-semibold text-slate-900 hover:underline">AI Replies / Profile</Link>, set your core offerings, project minimums, and Calendly link.</p>
                  </div>
                </div>
                <div className="p-4 bg-white flex items-start gap-3.5">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-900 text-xs font-bold text-white">4</span>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">Activate Your Scenario</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Open <Link to="/scenarios/all" className="font-semibold text-slate-900 hover:underline">Scenarios</Link>, select your connections, and toggle status to <span className="font-bold text-emerald-700">Live</span>.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 3: Connections */}
            <section id="connections" className="border-t border-slate-200 pt-8 scroll-mt-20">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                <FiLink className="text-blue-600" />
                <span>Integrations</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-950 tracking-tight mb-3">
                3. Email Connections
              </h2>
              <div className="space-y-4 text-sm text-slate-600">
                <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/30">
                  <h3 className="font-bold text-slate-900 mb-1 text-sm">Gmail (Google Workspace & Personal)</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Requires a 16-character Google App Password generated from your Google Account Security Settings with 2-Step Verification enabled.
                  </p>
                </div>

                <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/30">
                  <h3 className="font-bold text-slate-900 mb-1 text-sm">Microsoft 365 / Outlook</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Supports 1-click modern OAuth 2.0 or dedicated Microsoft App Passwords via SMTP (<code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800 font-mono text-[11px]">smtp.office365.com:587</code>).
                  </p>
                </div>
              </div>
            </section>

            {/* Section 4: Inbound Mailhooks */}
            <section id="mailhooks" className="border-t border-slate-200 pt-8 scroll-mt-20">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                <FiTerminal className="text-teal-600" />
                <span>Inbound Endpoints</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-950 tracking-tight mb-3">
                4. Inbound Mailhooks
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                Each organization receives dedicated mailhook addresses. Notification emails forwarded here are stripped of boilerplate headers and parsed into clean lead records.
              </p>
            </section>

            {/* Section 5: Scenarios & Routing */}
            <section id="scenarios" className="border-t border-slate-200 pt-8 scroll-mt-20">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                <FiSliders className="text-indigo-600" />
                <span>Workflows</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-950 tracking-tight mb-3">
                5. Shopify Partner Directory Scenarios
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                Scenarios evaluate incoming emails and execute multi-step automations.
              </p>

              <div id="queues" className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 mb-4 scroll-mt-24">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 mb-2">Live vs. Paused Status & Queue Management</h3>
                <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
                  <li><strong>• Live:</strong> Automation is active. Inbound leads are matched, triaged, and replied to automatically.</li>
                  <li><strong>• Paused:</strong> Automation is paused. Inbound leads are safely held in your backlog queue without sending outgoing emails.</li>
                  <li><strong>Resuming Queue:</strong> When re-activating a paused scenario, you can choose to <em>Release Queue</em> (send queued answers) or <em>Discard Queue</em> (record leads without late emails).</li>
                </ul>
              </div>
            </section>

            {/* Section 6: Unified Lead Inbox */}
            <section id="inbox" className="border-t border-slate-200 pt-8 scroll-mt-20">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                <FiInbox className="text-amber-600" />
                <span>Triage</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-950 tracking-tight mb-3">
                6. Unified Lead Inbox
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                Real-time multi-account inbox with 0ms instant cached navigation and lead pipeline statuses:
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg border border-slate-200 bg-white text-center">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800 mb-1">New Lead</span>
                  <p className="text-[11px] text-slate-500">Awaiting action</p>
                </div>
                <div className="p-3 rounded-lg border border-slate-200 bg-white text-center">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 mb-1">Replied</span>
                  <p className="text-[11px] text-slate-500">Reply sent</p>
                </div>
                <div className="p-3 rounded-lg border border-slate-200 bg-white text-center">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 mb-1">Secured</span>
                  <p className="text-[11px] text-slate-500">Client won</p>
                </div>
                <div className="p-3 rounded-lg border border-slate-200 bg-white text-center">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 mb-1">Closed</span>
                  <p className="text-[11px] text-slate-500">Disqualified</p>
                </div>
              </div>
            </section>

            {/* Section 7: AI Replies & Profiles */}
            <section id="ai" className="border-t border-slate-200 pt-8 scroll-mt-20">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                <FiCode className="text-teal-600" />
                <span>AI Engine</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-950 tracking-tight mb-3">
                7. AI Replies & Company Knowledge
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                Powered by Google Gemini, the AI reply engine reads incoming requirements and composes responses using your company knowledge profile.
              </p>
              <div className="space-y-3 text-xs text-slate-600">
                <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50">
                  <strong className="text-slate-900">Auto-Pilot Mode:</strong> Automatically generates and dispatches personalized replies within 1–2 minutes of lead receipt.
                </div>
                <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50">
                  <strong className="text-slate-900">Co-Pilot Mode:</strong> Drafts suggestions directly inside your Lead Inbox reply editor for one-click manual review and sending.
                </div>
              </div>
            </section>

            {/* Section 8: Templates & Dynamic Variables */}
            <section id="templates" className="border-t border-slate-200 pt-8 scroll-mt-20">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                <FiMail className="text-pink-600" />
                <span>Placeholders</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-950 tracking-tight mb-3">
                8. Templates & Dynamic Variables
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                Click any dynamic variable below to copy it into your template:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { tag: "{{client_name}}", desc: "Lead's first or full name" },
                  { tag: "{{sender_email}}", desc: "Lead's email address" },
                  { tag: "{{service}}", desc: "Identified service requirement" },
                  { tag: "{{budget}}", desc: "Stated budget or range" },
                  { tag: "{{store_url}}", desc: "Client's Shopify store URL" },
                  { tag: "{{timeline}}", desc: "Requested timeframe" },
                ].map((v) => (
                  <div
                    key={v.tag}
                    onClick={() => handleCopy(v.tag, v.tag)}
                    className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50/40 hover:bg-slate-100 hover:border-slate-300 transition cursor-pointer group"
                  >
                    <div>
                      <code className="font-mono text-xs font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {v.tag}
                      </code>
                      <p className="text-[11px] text-slate-500 mt-1">{v.desc}</p>
                    </div>
                    <div className="text-slate-400 group-hover:text-slate-900">
                      {copiedCode === v.tag ? <FiCheck className="text-emerald-600" size={16} /> : <FiCopy size={16} />}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Section 9: Plans & Limits */}
            <section id="plans" className="border-t border-slate-200 pt-8 scroll-mt-20">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                <FiCreditCard className="text-orange-600" />
                <span>Subscription</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-950 tracking-tight mb-3">
                9. Subscription Plans & Limits
              </h2>
              
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase tracking-wider font-bold">
                    <tr>
                      <th className="p-3">Feature</th>
                      <th className="p-3">Explore (Free)</th>
                      <th className="p-3">Elevate</th>
                      <th className="p-3">Unite</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600">
                    <tr>
                      <td className="p-3 font-semibold text-slate-900">Shopify Scenarios</td>
                      <td className="p-3">1 Prebuilt Scenario</td>
                      <td className="p-3">Multiple Scenarios</td>
                      <td className="p-3 font-bold text-slate-900">Unlimited</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-900">Custom Workflows</td>
                      <td className="p-3">Included</td>
                      <td className="p-3">Unlimited</td>
                      <td className="p-3 font-bold text-slate-900">Unlimited</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-900">Connected Inboxes</td>
                      <td className="p-3">1 Connection</td>
                      <td className="p-3">5 Connections</td>
                      <td className="p-3 font-bold text-slate-900">Unlimited</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-900">AI Replies / Month</td>
                      <td className="p-3">50 Replies</td>
                      <td className="p-3">500 Replies</td>
                      <td className="p-3 font-bold text-slate-900">Unlimited</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Section 10: Troubleshooting */}
            <section id="faqs" className="border-t border-slate-200 pt-8 scroll-mt-20">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                <FiHelpCircle className="text-teal-600" />
                <span>Help & FAQs</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-950 tracking-tight mb-3">
                10. Troubleshooting & FAQs
              </h2>
              <div className="space-y-3.5 text-xs">
                <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/40">
                  <h3 className="font-bold text-slate-900 text-sm mb-1">
                    Why does my scenario show "Paused" instead of "Live"?
                  </h3>
                  <p className="text-slate-500 leading-relaxed">
                    Scenarios require at least one verified sender email connection and one mailhook selected. If your connection password was changed or expired, reconnect your account under Connections first.
                  </p>
                </div>

                <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/40">
                  <h3 className="font-bold text-slate-900 text-sm mb-1">
                    How do I test my automation before going live?
                  </h3>
                  <p className="text-slate-500 leading-relaxed">
                    Forward a test inquiry from your personal email to your mailhook address with the subject "New inquiry from Shopify Partner Directory". The lead will parse and appear in your Lead Inbox instantly.
                  </p>
                </div>
              </div>
            </section>

          </div>
        </main>
      </div>
    </div>
  );
}

import { apiFetch } from "../utils/apiClient";
// import React, { useState } from "react";
// import { motion } from "framer-motion";
// import {
//   FiMail,
//   FiZap,
//   FiSend,
//   FiRepeat,
//   FiBarChart2,
//   FiArrowRight,
//   FiCheckCircle,
//   FiYoutube,
//   FiGithub,
//   FiLinkedin,
//   FiTwitter,
// } from "react-icons/fi";
// import { useNavigate } from "react-router-dom";
// import Header from "../component/Header";

// const fadeUp = {
//   hidden: { opacity: 0, y: 16 },
//   visible: {
//     opacity: 1,
//     y: 0,
//     transition: { duration: 0.55, ease: "easeOut" },
//   },
// };

// const ProductPage = () => {
//   const navigate = useNavigate();
//   const [demoOpen, setDemoOpen] = useState(false);
//   const [content, setContent] = useState(null);
//   const pageData = content || {
//     logoText: "Replex Engine",
//     navbarLinks: [
//       { label: "Product", route: "/product" },
//       { label: "Solutions", route: "/solutions" },
//       { label: "Developers", route: "/developer" },
//       { label: "Pricing", route: "/pricing" },
//     ],
//     hero: {
//       badge: "AI Lead Automation",
//       mainTitle: "More than auto-replies, Complete Lead Automation",
//       highlightedTitle: "",
//       description:
//         "Replex Engine captures inbound leads, understands email intent, sends instant replies, and keeps follow-ups running until every opportunity is handled.",
//       buttons: [
//         {
//           text: "Start automating for free",
//           route: "/register",
//           isPrimary: true,
//         },
//         { text: "Watch workflow demo", route: "#demo", isPrimary: false },
//       ],
//       demoVideoUrl:
//         "https://videos.ctfassets.net/un655fb9wln6/3wNElEdBiFdK2eauJB7wMp/021db93cbf76430c0b75cfb622876308/make_new_hero_animation.webm",
//     },
//     features: {
//       title: "A visual workflow for every lead",
//       subtitle:
//         "From first email to final follow-up, Replex Engine keeps your pipeline moving.",
//       cards: [
//         {
//           iconName: "FiZap",
//           title: "Capture",
//           description:
//             "Automatically capture inbound leads from email, forms, forwarding, or mailhooks.",
//         },
//         {
//           iconName: "PiRobotLight",
//           title: "Understand",
//           description:
//             "Detect intent, urgency, lead source, and context before replying.",
//         },
//         {
//           iconName: "FiSend",
//           title: "Reply",
//           description:
//             "Send the right template or AI-assisted response instantly.",
//         },
//         {
//           iconName: "FiRepeat",
//           title: "Follow-up",
//           description:
//             "Trigger delayed sequences until the lead responds or converts.",
//         },
//         {
//           iconName: "FiBarChart2",
//           title: "Track",
//           description:
//             "Monitor lead progress, reply status, and workflow performance.",
//         },
//       ],
//     },
//     cta: {
//       title: "Ready to stop losing leads?",
//       description:
//         "Launch your automated reply engine and respond to every inbound opportunity faster than your competitors.",
//       buttons: [
//         { text: "Get Started Free", route: "/register", isPrimary: true },
//         { text: "Talk to Sales", route: "/talk-to-sales", isPrimary: false },
//       ],
//     },
//     footer: {
//       copyrightText: "© 2026 Replex Engine — AI powered lead automation",
//       links: [
//         { label: "Privacy Policy", route: "/privacy-policy" },
//         { label: "Terms & Conditions", route: "/terms" },
//       ],
//     },
//   };
//   const goTo = (route) => {
//     if (route === "#demo") setDemoOpen(true);
//     else navigate(route);
//   };
//   return (
//     <div className="min-h-screen overflow-x-hidden bg-[#fafafa] text-zinc-950 font-sans selection:bg-violet-100">
//       <Header />

//       <section className="relative min-h-[620px] overflow-hidden border-b border-zinc-200/70 bg-[radial-gradient(circle_at_50%_10%,#ffffff_0%,#fafafa_42%,#f4f4f5_100%)] px-5 pb-24 pt-40">
//         <CircuitBackground />

//         <div className="relative z-10 mx-auto max-w-7xl">
//           <motion.div
//             initial="hidden"
//             animate="visible"
//             variants={fadeUp}
//             className="mx-auto max-w-4xl text-center"
//           >
//             <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/80 px-3.5 py-1.5 text-xs font-bold text-zinc-700 shadow-sm backdrop-blur">
//               <span className="h-1.5 w-1.5 rounded-full bg-violet-600" />
//               Product
//             </div>

//             <h1 className="mx-auto max-w-5xl text-[44px] font-semibold leading-[0.98] tracking-[-0.065em] text-zinc-950 sm:text-6xl md:text-[76px]">
//               Lead automation, built visually
//             </h1>

//             <p className="mx-auto mt-7 max-w-3xl text-base leading-8 text-zinc-600 sm:text-xl">
//               Build automated email replies, smart follow-ups, and lead
//               workflows visually — without writing code.
//             </p>

//             <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
//               <button
//                 onClick={() => navigate("/login")}
//                 className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-[#6F4BFF] px-4 text-[13px] font-semibold text-white shadow-[0_7px_18px_rgba(111,75,255,0.28)] transition hover:bg-[#6242E8]"
//               >
//                 Start Automating Leads
//                 <FiArrowRight className="text-[13px]" />
//               </button>

//               <button
//                 onClick={() => navigate("/solutions")}
//                 className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-[#F7F7F8] px-4 text-[13px] font-semibold text-zinc-950 shadow-sm transition hover:bg-white"
//               >
//                 View Solutions
//               </button>
//             </div>
//           </motion.div>
//         </div>
//       </section>

//       <section className="border-b border-zinc-200 bg-[#FBFAFA] px-5 py-24">
//         <div className="mx-auto max-w-7xl">
//           <div className="mx-auto mb-14 max-w-3xl text-center">
//             <h2 className="text-3xl font-semibold leading-tight tracking-[-0.045em] text-zinc-950 sm:text-5xl">
//               Everything your lead workflow needs
//             </h2>

//             <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-zinc-600">
//               Capture inbound leads, understand intent, send instant replies,
//               and keep follow-ups running from one visual automation engine.
//             </p>
//           </div>

//           <div className="grid gap-3 lg:grid-cols-3">
//             <FeaturePanel
//               className="lg:col-span-2"
//               icon={<FiZap />}
//               label="Visual builder"
//               title="Build lead workflows visually"
//               desc="Create automated flows with conditions, delays, AI replies, and follow-up actions without touching code."
//               visual={
//                 <div className="mx-auto flex max-w-md items-center justify-center rounded-xl border border-zinc-200 bg-white px-5 py-3 text-sm font-semibold text-zinc-950 shadow-sm">
//                   incoming-lead → detect-intent → send-reply
//                 </div>
//               }
//             />

//             <FeaturePanel
//               className="lg:row-span-2"
//               icon={<FiSend />}
//               label="Smart replies"
//               title="Send the right response instantly"
//               desc="Use templates or AI-assisted replies based on lead source, urgency, and message intent."
//               visual={
//                 <div className="mx-auto mt-2 h-56 w-full max-w-sm rounded-2xl border border-dashed border-zinc-200 bg-[#fafafa] p-5">
//                   <div className="mx-auto w-fit rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-500 shadow-sm">
//                     Reply generated
//                   </div>
//                 </div>
//               }
//             />

//             <FeaturePanel
//               icon={<FiMail />}
//               label="Lead capture"
//               title="Capture leads from email"
//               desc="Connect your inbox, forwarding address, forms, or mailhooks and turn every message into a tracked lead."
//               visual={
//                 <div className="mx-auto flex w-fit items-center gap-2 rounded-full bg-zinc-950 px-4 py-2 text-xs font-semibold text-white shadow-lg">
//                   <FiMail />
//                   new lead received
//                 </div>
//               }
//             />

//             <FeaturePanel
//               icon={<FiRepeat />}
//               label="Follow-ups"
//               title="Keep follow-ups running"
//               desc="Trigger delayed sequences automatically and stop them when the lead replies or converts."
//               visual={
//                 <div className="mx-auto flex w-fit items-center gap-3 rounded-2xl border border-zinc-200 bg-white px-4 py-3 shadow-sm">
//                   <FiMail className="text-[#6F4BFF]" />
//                   <FiRepeat className="text-[#6F4BFF]" />
//                   <FiBarChart2 className="text-[#6F4BFF]" />
//                 </div>
//               }
//             />
//           </div>
//         </div>
//       </section>

//       <section className="border-b border-zinc-200/70 bg-[#FBFAFA] px-5 py-24">
//         <div className="mx-auto max-w-7xl">
//           <div className="mx-auto mb-16 max-w-3xl text-center">
//             <h2 className="text-3xl font-semibold leading-tight tracking-[-0.045em] text-zinc-950 sm:text-5xl">
//               Scale your lead automation
//             </h2>

//             <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-zinc-600">
//               A workflow engine built for every stage of your growth.
//             </p>
//           </div>

//           <div className="grid gap-10 md:grid-cols-3 md:gap-0">
//             {[
//               {
//                 icon: <FiMail />,
//                 title: "Dedicated lead inbox",
//                 desc: "Connect your inbox or forwarding address and capture every inbound opportunity automatically.",
//               },
//               {
//                 icon: <FiZap />,
//                 title: "Built for your workflow",
//                 desc: "Create lightweight or advanced automation flows with templates, AI replies, delays, and conditions.",
//               },
//               {
//                 icon: <FiBarChart2 />,
//                 title: "Flexible automation",
//                 desc: "Start simple and scale your lead handling as your team, volume, and follow-up needs grow.",
//               },
//             ].map((item, index) => (
//               <div
//                 key={item.title}
//                 className={`px-0 md:px-12 ${
//                   index !== 0
//                     ? "md:border-l md:border-dotted md:border-zinc-300"
//                     : ""
//                 }`}
//               >
//                 <div className="mb-6 flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-200 bg-white text-sm text-[#6F4BFF] shadow-sm">
//                   {item.icon}
//                 </div>

//                 <h3 className="text-base font-semibold tracking-[-0.02em] text-zinc-950">
//                   {item.title}
//                 </h3>

//                 <p className="mt-4 max-w-sm text-base leading-7 text-zinc-600">
//                   {item.desc}
//                 </p>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>
//       <section className="border-b border-zinc-200/70 bg-[#FBFAFA] px-5 py-24">
//         <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[0.9fr_1.1fr]">
//           <div>
//             <h2 className="text-3xl font-semibold leading-tight tracking-[-0.045em] text-zinc-950 sm:text-5xl">
//               Talk to the team
//             </h2>

//             <p className="mt-5 text-base leading-7 text-zinc-600">
//               Tell us what you need and we’ll help you set up the right lead
//               automation workflow.
//             </p>

//             <div className="mt-10 space-y-4">
//               {[
//                 "Automated lead capture from email or forms",
//                 "AI-assisted replies and template workflows",
//                 "Smart follow-up sequences",
//                 "Lead tracking and reply status visibility",
//                 "Custom workflow automation for your team",
//                 "Setup support for sales teams and agencies",
//               ].map((item) => (
//                 <div key={item} className="flex items-start gap-3">
//                   <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-100 text-[#6F4BFF]">
//                     <FiCheckCircle className="text-[13px]" />
//                   </span>

//                   <span className="text-sm font-semibold leading-6 text-zinc-950">
//                     {item}
//                   </span>
//                 </div>
//               ))}
//             </div>
//           </div>

//           <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-[0_14px_45px_rgba(24,24,27,0.08)]">
//             <div className="grid gap-6">
//               <div>
//                 <label className="mb-2 block text-sm font-semibold text-zinc-950">
//                   Name
//                 </label>
//                 <input
//                   type="text"
//                   className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-[#6F4BFF] focus:ring-4 focus:ring-violet-100"
//                 />
//               </div>

//               <div>
//                 <label className="mb-2 block text-sm font-semibold text-zinc-950">
//                   Company email
//                 </label>
//                 <input
//                   type="email"
//                   className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-[#6F4BFF] focus:ring-4 focus:ring-violet-100"
//                 />
//               </div>

//               <div>
//                 <label className="mb-2 block text-sm font-semibold text-zinc-950">
//                   Company website{" "}
//                   <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs font-medium text-zinc-500">
//                     Optional
//                   </span>
//                 </label>
//                 <input
//                   type="url"
//                   placeholder="www.example.com"
//                   className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-[#6F4BFF] focus:ring-4 focus:ring-violet-100"
//                 />
//               </div>

//               <div>
//                 <label className="mb-2 block text-sm font-semibold text-zinc-950">
//                   Tell us about your workflow{" "}
//                   <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs font-medium text-zinc-500">
//                     Optional
//                   </span>
//                 </label>
//                 <textarea
//                   rows="5"
//                   placeholder="What are you trying to automate? Lead capture, replies, follow-ups, or tracking?"
//                   className="w-full resize-none rounded-lg border border-zinc-200 bg-white px-3 py-3 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-[#6F4BFF] focus:ring-4 focus:ring-violet-100"
//                 />
//               </div>

//               <button
//                 type="button"
//                 className="inline-flex h-9 w-fit items-center justify-center rounded-lg bg-[#6F4BFF] px-4 text-[13px] font-semibold text-white shadow-[0_7px_18px_rgba(111,75,255,0.28)] transition hover:bg-[#6242E8]"
//               >
//                 Contact us
//               </button>
//             </div>
//           </div>
//         </div>
//       </section>
//       <footer className="border-t border-zinc-200/70 bg-[#FBFAFA] py-16">
//         <div className="mx-auto max-w-7xl px-5">
//           <div className="grid gap-10 lg:grid-cols-[1.2fr_3fr]">
//             <button
//               onClick={() => navigate("/")}
//               className="flex items-center gap-2 self-start"
//             >
//               <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-zinc-100 ring-1 ring-zinc-200">
//                 <span className="absolute h-3.5 w-3.5 rounded-full border-[3px] border-zinc-900 border-r-transparent" />
//                 <span className="absolute right-[5px] top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-zinc-900" />
//               </span>

//               <span className="text-[18px] font-semibold tracking-[-0.025em] text-zinc-950">
//                 {pageData.logoText}
//               </span>
//             </button>

//             <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
//               {[
//                 {
//                   title: "Product",
//                   links: [
//                     { label: "Lead Capture", route: "/product" },
//                     // { label: "AI Replies", route: "/solutions" },
//                     // { label: "Follow-ups", route: "/product" },
//                     { label: "Workflow Automation", route: "/product" },
//                   ],
//                 },
                
//                 {
//                   title: "Developers",
//                   links: [
//                     { label: "API Access", route: "/developer" },
//                     // { label: "Email Webhooks", route: "/developer" },
//                     { label: "Integrations", route: "/developer" },
//                     // { label: "Documentation", route: "/developer" },
//                   ],
//                 },
//                 {
//                   title: "Company",
//                   links: [
//                     // { label: "About", route: "/about" },
//                     { label: "Pricing", route: "/pricing" },
//                     { label: "Talk to Sales", route: "/talk-to-sales" },
//                     // { label: "Contact", route: "/contact" },
//                   ],
//                 },
//                 {
//                   title: "Legal",
//                   links: [
//                     { label: "Privacy Policy", route: "/privacy-policy" },
//                     { label: "Terms & Conditions", route: "/terms" },
//                     // { label: "Security", route: "/security" },
//                     // { label: "Cookie Policy", route: "/cookies" },
//                   ],
//                 },
//               ].map((group) => (
//                 <div key={group.title}>
//                   <h4 className="mb-4 text-xs font-semibold text-zinc-400">
//                     {group.title}
//                   </h4>

//                   <div className="flex flex-col gap-3">
//                     {group.links.map((link) => (
//                       <button
//                         key={link.label}
//                         onClick={() => goTo(link.route)}
//                         className="text-left text-sm font-semibold text-zinc-950 transition hover:text-violet-600"
//                       >
//                         {link.label}
//                       </button>
//                     ))}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>

//           <div className="mt-14 flex flex-col items-center justify-between gap-5 border-t border-zinc-200 pt-7 sm:flex-row">
//             <p className="text-sm font-medium text-zinc-500">
//               {pageData.footer?.copyrightText}
//             </p>

//             {/* <div className="flex items-center gap-4 text-zinc-500">
//               {[
//                 { icon: <FiTwitter />, label: "Twitter" },
//                 { icon: <FiLinkedin />, label: "LinkedIn" },
//                 { icon: <FiGithub />, label: "GitHub" },
//                 { icon: <FiYoutube />, label: "YouTube" },
//                 { icon: <FiMail />, label: "Email" },
//               ].map((item) => (
//                 <button
//                   key={item.label}
//                   aria-label={item.label}
//                   className="text-[18px] transition hover:text-violet-600"
//                 >
//                   {item.icon}
//                 </button>
//               ))}
//             </div> */}
//           </div>
//         </div>
//       </footer>
//     </div>
//   );
// };

// const FeaturePanel = ({ icon, label, title, desc, visual, className = "" }) => (
//   <motion.div
//     variants={fadeUp}
//     initial="hidden"
//     whileInView="visible"
//     viewport={{ once: true }}
//     whileHover={{ y: -4 }}
//     className={`relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 shadow-[0_14px_45px_rgba(24,24,27,0.08)] transition hover:border-zinc-300 ${className}`}
//   >
//     <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(24,24,27,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(24,24,27,0.035)_1px,transparent_1px)] bg-[size:56px_56px]" />

//     <div className="relative flex min-h-[210px] flex-col justify-between">
//       <div className="flex min-h-[90px] items-center justify-center">
//         {visual}
//       </div>

//       <div className="mt-8">
//         <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#F7F7F8] text-xl text-[#6F4BFF] ring-1 ring-zinc-200">
//           {icon}
//         </div>

//         <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#6F4BFF]">
//           {label}
//         </p>

//         <h3 className="text-lg font-semibold tracking-[-0.02em] text-zinc-950">
//           {title}
//         </h3>

//         <p className="mt-3 text-sm leading-6 text-zinc-600">{desc}</p>
//       </div>
//     </div>
//   </motion.div>
// );

// const CircuitBackground = () => (
//   <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-90">
//     <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(24,24,27,0.045)_1px,transparent_1px),linear-gradient(to_bottom,rgba(24,24,27,0.045)_1px,transparent_1px)] bg-[size:96px_96px]" />

//     <div className="absolute inset-x-0 top-0 h-full bg-[radial-gradient(circle_at_center,transparent_0%,transparent_34%,rgba(250,250,250,0.78)_72%)]" />

//     <svg
//       className="absolute left-1/2 top-8 h-[600px] w-[1500px] -translate-x-1/2 text-zinc-300/55"
//       viewBox="0 0 1500 600"
//       fill="none"
//     >
//       <path d="M72 140H222L292 210H474L545 140H690" stroke="currentColor" />
//       <path
//         d="M1430 140H1278L1208 210H1026L955 140H810"
//         stroke="currentColor"
//       />
//       <path d="M260 460H430L500 525H658V392H750" stroke="currentColor" />
//       <path d="M1240 460H1070L1000 525H842V392H750" stroke="currentColor" />
//       <path
//         d="M750 0V105M750 495V600M520 0V105L590 175V245M980 0V105L910 175V245"
//         stroke="currentColor"
//       />

//       {[260, 430, 585, 750, 915, 1070, 1240].map((x, i) => (
//         <rect
//           key={i}
//           x={x}
//           y={i % 2 ? 112 : 382}
//           width="12"
//           height="12"
//           rx="3"
//           fill="white"
//           stroke="currentColor"
//         />
//       ))}

//       {[350, 675, 825, 1150].map((x, i) => (
//         <circle
//           key={i}
//           cx={x}
//           cy={i % 2 ? 165 : 430}
//           r="10"
//           fill="white"
//           stroke="currentColor"
//         />
//       ))}
//     </svg>

//     <div className="absolute left-1/2 top-[118px] h-[360px] w-[720px] -translate-x-1/2 rounded-full bg-white/55 blur-3xl" />
//   </div>
// );
// export default ProductPage;
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FiMail,
  FiZap,
  FiSend,
  FiRepeat,
  FiBarChart2,
  FiArrowRight,
  FiCheckCircle,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import Header from "../component/Header";

const API_URL = "https://email-syncing-backend.vercel.app/api/product-page/product-page";

const iconMap = {
  FiMail: <FiMail />,
  FiZap: <FiZap />,
  FiSend: <FiSend />,
  FiRepeat: <FiRepeat />,
  FiBarChart2: <FiBarChart2 />,
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: "easeOut" },
  },
};

const defaultPageData = {
  logoText: "Replex Engine",

  hero: {
    badge: "Product",
    title: "Lead automation, built visually",
    description:
      "Build automated email replies, smart follow-ups, and lead workflows visually — without writing code.",
    buttons: [
      { text: "Start Automating Leads", route: "/login", isPrimary: true },
      { text: "View Solutions", route: "/solutions", isPrimary: false },
    ],
  },

  workflowSection: {
    title: "Everything your lead workflow needs",
    description:
      "Capture inbound leads, understand intent, send instant replies, and keep follow-ups running from one visual automation engine.",
    cards: [
      {
        iconName: "FiZap",
        label: "Visual builder",
        title: "Build lead workflows visually",
        description:
          "Create automated flows with conditions, delays, AI replies, and follow-up actions without touching code.",
        visualText: "incoming-lead → detect-intent → send-reply",
        className: "lg:col-span-2",
      },
      {
        iconName: "FiSend",
        label: "Smart replies",
        title: "Send the right response instantly",
        description:
          "Use templates or AI-assisted replies based on lead source, urgency, and message intent.",
        visualText: "Reply generated",
        className: "lg:row-span-2",
      },
      {
        iconName: "FiMail",
        label: "Lead capture",
        title: "Capture leads from email",
        description:
          "Connect your inbox, forwarding address, forms, or mailhooks and turn every message into a tracked lead.",
        visualText: "new lead received",
      },
      {
        iconName: "FiRepeat",
        label: "Follow-ups",
        title: "Keep follow-ups running",
        description:
          "Trigger delayed sequences automatically and stop them when the lead replies or converts.",
        visualText: "follow-up automation",
      },
    ],
  },

  scaleSection: {
    title: "Scale your lead automation",
    description: "A workflow engine built for every stage of your growth.",
    cards: [
      {
        iconName: "FiMail",
        title: "Dedicated lead inbox",
        description:
          "Connect your inbox or forwarding address and capture every inbound opportunity automatically.",
      },
      {
        iconName: "FiZap",
        title: "Built for your workflow",
        description:
          "Create lightweight or advanced automation flows with templates, AI replies, delays, and conditions.",
      },
      {
        iconName: "FiBarChart2",
        title: "Flexible automation",
        description:
          "Start simple and scale your lead handling as your team, volume, and follow-up needs grow.",
      },
    ],
  },

  contactSection: {
    title: "Talk to the team",
    description:
      "Tell us what you need and we’ll help you set up the right lead automation workflow.",
    bullets: [
      "Automated lead capture from email or forms",
      "AI-assisted replies and template workflows",
      "Smart follow-up sequences",
      "Lead tracking and reply status visibility",
      "Custom workflow automation for your team",
      "Setup support for sales teams and agencies",
    ],
    buttonText: "Contact us",
  },

  footer: {
    copyrightText: "© 2026 Replex Engine — AI powered lead automation",
    groups: [
      {
        title: "Product",
        links: [
          { label: "Lead Capture", route: "/product" },
          { label: "Workflow Automation", route: "/product" },
        ],
      },
      {
        title: "Developers",
        links: [
          { label: "API Access", route: "/developer" },
          { label: "Integrations", route: "/developer" },
        ],
      },
      {
        title: "Company",
        links: [
          { label: "Pricing", route: "/pricing" },
          { label: "Talk to Sales", route: "/talk-to-sales" },
        ],
      },
      {
        title: "Legal",
        links: [
          { label: "Privacy Policy", route: "/privacy-policy" },
          { label: "Terms & Conditions", route: "/terms" },
        ],
      },
    ],
  },
};

const ProductPage = () => {
  const navigate = useNavigate();

  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  const pageData = {
    ...defaultPageData,
    ...(content || {}),

    hero: {
      ...defaultPageData.hero,
      ...(content?.hero || {}),
      buttons:
        content?.hero?.buttons?.length > 0
          ? content.hero.buttons
          : defaultPageData.hero.buttons,
    },

    workflowSection: {
      ...defaultPageData.workflowSection,
      ...(content?.workflowSection || {}),
      cards:
        content?.workflowSection?.cards?.length > 0
          ? content.workflowSection.cards
          : defaultPageData.workflowSection.cards,
    },

    scaleSection: {
      ...defaultPageData.scaleSection,
      ...(content?.scaleSection || {}),
      cards:
        content?.scaleSection?.cards?.length > 0
          ? content.scaleSection.cards
          : defaultPageData.scaleSection.cards,
    },

    contactSection: {
      ...defaultPageData.contactSection,
      ...(content?.contactSection || {}),
      bullets:
        content?.contactSection?.bullets?.length > 0
          ? content.contactSection.bullets
          : defaultPageData.contactSection.bullets,
    },

    footer: {
      ...defaultPageData.footer,
      ...(content?.footer || {}),
      groups:
        content?.footer?.groups?.length > 0
          ? content.footer.groups
          : defaultPageData.footer.groups,
    },
  };

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await apiFetch(API_URL);

        if (res.ok) {
          const data = await res.json();
          setContent(data);
        } else {
          console.error("Failed to fetch product page content");
        }
      } catch (err) {
        console.error("Error fetching product page content", err);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  const goTo = (route) => {
    if (!route) return;
    navigate(route);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-[3px] border-zinc-200 border-t-violet-600 animate-spin" />
          <p className="text-sm font-semibold text-zinc-500">
            Loading Product Page...
          </p>
        </div>
      </div>
    );
  }

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
            {pageData.hero?.badge && (
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/80 px-3.5 py-1.5 text-xs font-bold text-zinc-700 shadow-sm backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-violet-600" />
                {pageData.hero.badge}
              </div>
            )}

            <h1 className="mx-auto max-w-5xl text-[44px] font-semibold leading-[0.98] tracking-[-0.065em] text-zinc-950 sm:text-6xl md:text-[76px]">
              {pageData.hero?.title}
            </h1>

            <p className="mx-auto mt-7 max-w-3xl text-base leading-8 text-zinc-600 sm:text-xl">
              {pageData.hero?.description}
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              {pageData.hero?.buttons?.map((btn, index) => (
                <button
                  key={index}
                  onClick={() => goTo(btn.route)}
                  className={
                    btn.isPrimary
                      ? "inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-[#6F4BFF] px-4 text-[13px] font-semibold text-white shadow-[0_7px_18px_rgba(111,75,255,0.28)] transition hover:bg-[#6242E8]"
                      : "inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-[#F7F7F8] px-4 text-[13px] font-semibold text-zinc-950 shadow-sm transition hover:bg-white"
                  }
                >
                  {btn.text}
                  {btn.isPrimary && <FiArrowRight className="text-[13px]" />}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="border-b border-zinc-200 bg-[#FBFAFA] px-5 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-14 max-w-3xl text-center">
            <h2 className="text-3xl font-semibold leading-tight tracking-[-0.045em] text-zinc-950 sm:text-5xl">
              {pageData.workflowSection?.title}
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-zinc-600">
              {pageData.workflowSection?.description}
            </p>
          </div>

          <div className="grid gap-3 lg:grid-cols-3">
            {pageData.workflowSection?.cards?.map((card, index) => (
              <FeaturePanel
                key={card.title || index}
                className={card.className || ""}
                icon={iconMap[card.iconName] || <FiZap />}
                label={card.label}
                title={card.title}
                desc={card.description}
                visual={<FeatureVisual card={card} />}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-zinc-200/70 bg-[#FBFAFA] px-5 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2 className="text-3xl font-semibold leading-tight tracking-[-0.045em] text-zinc-950 sm:text-5xl">
              {pageData.scaleSection?.title}
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-zinc-600">
              {pageData.scaleSection?.description}
            </p>
          </div>

          <div className="grid gap-10 md:grid-cols-3 md:gap-0">
            {pageData.scaleSection?.cards?.map((item, index) => (
              <div
                key={item.title || index}
                className={`px-0 md:px-12 ${
                  index !== 0
                    ? "md:border-l md:border-dotted md:border-zinc-300"
                    : ""
                }`}
              >
                <div className="mb-6 flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-200 bg-white text-sm text-[#6F4BFF] shadow-sm">
                  {iconMap[item.iconName] || <FiMail />}
                </div>

                <h3 className="text-base font-semibold tracking-[-0.02em] text-zinc-950">
                  {item.title}
                </h3>

                <p className="mt-4 max-w-sm text-base leading-7 text-zinc-600">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-zinc-200/70 bg-[#FBFAFA] px-5 py-24">
        <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <h2 className="text-3xl font-semibold leading-tight tracking-[-0.045em] text-zinc-950 sm:text-5xl">
              {pageData.contactSection?.title}
            </h2>

            <p className="mt-5 text-base leading-7 text-zinc-600">
              {pageData.contactSection?.description}
            </p>

            <div className="mt-10 space-y-4">
              {pageData.contactSection?.bullets?.map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-100 text-[#6F4BFF]">
                    <FiCheckCircle className="text-[13px]" />
                  </span>

                  <span className="text-sm font-semibold leading-6 text-zinc-950">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-[0_14px_45px_rgba(24,24,27,0.08)]">
            <div className="grid gap-6">
              <FormInput label="Name" type="text" />

              <FormInput label="Company email" type="email" />

              <FormInput
                label="Company website"
                type="url"
                placeholder="www.example.com"
                optional
              />

              <div>
                <label className="mb-2 block text-sm font-semibold text-zinc-950">
                  Tell us about your workflow{" "}
                  <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs font-medium text-zinc-500">
                    Optional
                  </span>
                </label>

                <textarea
                  rows="5"
                  placeholder="What are you trying to automate? Lead capture, replies, follow-ups, or tracking?"
                  className="w-full resize-none rounded-lg border border-zinc-200 bg-white px-3 py-3 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-[#6F4BFF] focus:ring-4 focus:ring-violet-100"
                />
              </div>

              <button
                type="button"
                className="inline-flex h-9 w-fit items-center justify-center rounded-lg bg-[#6F4BFF] px-4 text-[13px] font-semibold text-white shadow-[0_7px_18px_rgba(111,75,255,0.28)] transition hover:bg-[#6242E8]"
              >
                {pageData.contactSection?.buttonText}
              </button>
            </div>
          </div>
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
              {pageData.footer?.groups?.map((group) => (
                <div key={group.title}>
                  <h4 className="mb-4 text-xs font-semibold text-zinc-400">
                    {group.title}
                  </h4>

                  <div className="flex flex-col gap-3">
                    {group.links?.map((link) => (
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
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureVisual = ({ card }) => {
  if (card.iconName === "FiSend") {
    return (
      <div className="mx-auto mt-2 h-56 w-full max-w-sm rounded-2xl border border-dashed border-zinc-200 bg-[#fafafa] p-5">
        <div className="mx-auto w-fit rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-500 shadow-sm">
          {card.visualText}
        </div>
      </div>
    );
  }

  if (card.iconName === "FiMail") {
    return (
      <div className="mx-auto flex w-fit items-center gap-2 rounded-full bg-zinc-950 px-4 py-2 text-xs font-semibold text-white shadow-lg">
        <FiMail />
        {card.visualText}
      </div>
    );
  }

  if (card.iconName === "FiRepeat") {
    return (
      <div className="mx-auto flex w-fit items-center gap-3 rounded-2xl border border-zinc-200 bg-white px-4 py-3 shadow-sm">
        <FiMail className="text-[#6F4BFF]" />
        <FiRepeat className="text-[#6F4BFF]" />
        <FiBarChart2 className="text-[#6F4BFF]" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-md items-center justify-center rounded-xl border border-zinc-200 bg-white px-5 py-3 text-sm font-semibold text-zinc-950 shadow-sm">
      {card.visualText}
    </div>
  );
};

const FormInput = ({ label, type, placeholder, optional }) => (
  <div>
    <label className="mb-2 block text-sm font-semibold text-zinc-950">
      {label}{" "}
      {optional && (
        <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs font-medium text-zinc-500">
          Optional
        </span>
      )}
    </label>

    <input
      type={type}
      placeholder={placeholder}
      className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-[#6F4BFF] focus:ring-4 focus:ring-violet-100"
    />
  </div>
);

const FeaturePanel = ({ icon, label, title, desc, visual, className = "" }) => (
  <motion.div
    variants={fadeUp}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true }}
    whileHover={{ y: -4 }}
    className={`relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 shadow-[0_14px_45px_rgba(24,24,27,0.08)] transition hover:border-zinc-300 ${className}`}
  >
    <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(24,24,27,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(24,24,27,0.035)_1px,transparent_1px)] bg-[size:56px_56px]" />

    <div className="relative flex min-h-[210px] flex-col justify-between">
      <div className="flex min-h-[90px] items-center justify-center">
        {visual}
      </div>

      <div className="mt-8">
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#F7F7F8] text-xl text-[#6F4BFF] ring-1 ring-zinc-200">
          {icon}
        </div>

        <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#6F4BFF]">
          {label}
        </p>

        <h3 className="text-lg font-semibold tracking-[-0.02em] text-zinc-950">
          {title}
        </h3>

        <p className="mt-3 text-sm leading-6 text-zinc-600">{desc}</p>
      </div>
    </div>
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
      <path
        d="M1430 140H1278L1208 210H1026L955 140H810"
        stroke="currentColor"
      />
      <path d="M260 460H430L500 525H658V392H750" stroke="currentColor" />
      <path d="M1240 460H1070L1000 525H842V392H750" stroke="currentColor" />
      <path
        d="M750 0V105M750 495V600M520 0V105L590 175V245M980 0V105L910 175V245"
        stroke="currentColor"
      />

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

export default ProductPage;

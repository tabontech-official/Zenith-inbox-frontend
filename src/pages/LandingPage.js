// import React, { useState, useEffect } from "react";
// import { motion } from "framer-motion";
// import {
//   FiMail,
//   FiZap,
//   FiSend,
//   FiRepeat,
//   FiBarChart2,
//   FiArrowRight,
//   FiPlay,
//   FiX,
//   FiChevronDown,
//   FiCheckCircle,
//   FiTwitter,
//   FiLinkedin,
//   FiGithub,
//   FiYoutube,
// } from "react-icons/fi";
// import { PiRobotLight } from "react-icons/pi";
// import { useNavigate } from "react-router-dom";
// import { ChevronRight } from "lucide-react";

// const iconMap = {
//   FiZap: <FiZap />,
//   PiRobotLight: <PiRobotLight />,
//   FiSend: <FiSend />,
//   FiRepeat: <FiRepeat />,
//   FiBarChart2: <FiBarChart2 />,
// };

// const LandingPage = () => {
//   const navigate = useNavigate();
//   const [demoOpen, setDemoOpen] = useState(false);
//   const [content, setContent] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchContent = async () => {
//       try {
//         const res = await fetch(
//           "http://localhost:5000/api/landing-page",
//         );
//         if (res.ok) setContent(await res.json());
//         else console.error("Failed to fetch landing page content");
//       } catch (err) {
//         console.error("Error connecting to server", err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchContent();
//   }, []);

//   const defaultPageData = {
//   logoText: "Replex Engine",
//   navbarLinks: [
//     { label: "Product", route: "/product" },
//     { label: "Solutions", route: "/solutions" },
//     { label: "Developers", route: "/developer" },
//     { label: "Pricing", route: "/pricing" },
//   ],
//   hero: {
//     badge: "Shopify Partners Lead Automation Tool",
//     mainTitle: "Automate your lead replies",
//     highlightedTitle: "visually.",
//     description:
//       "Build visual automation flows to reply to leads instantly, apply delays, and send the right email at the perfect time — without writing code.",
//     buttons: [
//       {
//         text: "Get Started For Free No Credit Card Required",
//         route: "/register",
//         isPrimary: true,
//       },
//       {
//         text: "Watch Demo",
//         route: "#demo",
//         isPrimary: false,
//       },
//     ],
//     trustItems: [
//       "No-code workflows",
//       "Instant AI replies",
//       "Automated follow-ups",
//     ],
//     demoVideoUrl: "Comming soon",
//   },

//   trustedCountries: [
//     "United States",
//     "United Kingdom",
//     "Germany",
//     "Canada",
//     "Australia",
//   ],

//   leadAutomation: {
//     badge: "Lead automation",
//     title: "Capture, understand, and reply to every lead in minutes",
//     description:
//       "Replex Engine turns your inbox into an automated sales workflow.",
//     bullets: [
//       "Connect your lead inbox or forwarding address",
//       "Let AI detect intent, urgency, and customer context",
//       "Send instant replies and continue follow-ups automatically",
//     ],
//     pipelineLabel: "Active pipeline",
//     pipelineTitle: "Agency lead scenario",
//     pipelineStatus: "Running",
//     steps: [
//       { step: "01", title: "Lead", description: "Email received" },
//       { step: "02", title: "Intent", description: "Template detected" },
//       { step: "03", title: "Reply", description: "Response sent" },
//       { step: "04", title: "Follow-up", description: "Sequence completed" },
//     ],
//     completionTitle: "Scenario completed",
//     completionStatus: "Delivered",
//     completionDescription:
//       "Lead captured, intent analyzed, reply sent, and follow-up sequence completed automatically.",
//     stats: [
//       { label: "Reply time", value: "18s" },
//       { label: "Lead score", value: "92%" },
//       { label: "Status", value: "Won" },
//     ],
//   },

//   clientCommunication: {
//     badge: "Client Communication",
//     title: "Keep every client conversation clear, fast, and organized",
//     description:
//       "Replex Engine helps your team handle incoming conversations, respond faster, and keep follow-ups consistent.",
//     cards: [
//       {
//         title: "Clear conversation flow",
//         text: "Keep every incoming message organized so your team knows what needs attention.",
//       },
//       {
//         title: "Faster response handling",
//         text: "Use ready replies and smart suggestions to answer clients quickly.",
//       },
//       {
//         title: "Consistent follow-through",
//         text: "Make sure no conversation is forgotten by keeping reminders and follow-ups aligned with your process.",
//       },
//       {
//         title: "Simple team visibility",
//         text: "Give your team a cleaner way to track client conversations, response status, and next steps from one place.",
//       },
//     ],
//     buttonText: "Organize Conversations",
//     buttonRoute: "/register",
//   },

//   testimonials: {
//     badge: "Customer Reviews",
//     title: "Trusted by teams who move fast",
//     description:
//       "Join businesses using Replex Engine to capture leads, send instant AI replies, and keep follow-ups running automatically.",
//     buttonText: "Start automating for free",
//     buttonRoute: "/register",
//     quote:
//       "Replex Engine helped us respond to every inbound lead without adding more sales reps.",
//     authorName: "Replex Customer",
//     authorRole: "Growth Team",
//     leftReviews: [],
//     rightReviews: [],
//   },

//   footer: {
//     copyrightText: "© 2026 Replex Engine — AI powered lead automation",
//     links: [
//       { label: "Privacy Policy", route: "/privacy-policy" },
//       { label: "Terms & Conditions", route: "/terms" },
//     ],
//   },
// };

// const pageData = {
//   ...defaultPageData,
//   ...content,
//   hero: {
//     ...defaultPageData.hero,
//     ...(content?.hero || {}),
//   },
//   leadAutomation: {
//     ...defaultPageData.leadAutomation,
//     ...(content?.leadAutomation || {}),
//   },
//   clientCommunication: {
//     ...defaultPageData.clientCommunication,
//     ...(content?.clientCommunication || {}),
//   },
//   testimonials: {
//     ...defaultPageData.testimonials,
//     ...(content?.testimonials || {}),
//   },
//   trustedCountries:
//     content?.trustedCountries?.length > 0
//       ? content.trustedCountries
//       : defaultPageData.trustedCountries,
//   footer: {
//     ...defaultPageData.footer,
//     ...(content?.footer || {}),
//   },
// };
//   const goTo = (route) => {
//     if (route === "#demo") setDemoOpen(true);
//     else navigate(route);
//   };

//   const container = {
//     hidden: { opacity: 0 },
//     show: { opacity: 1, transition: { staggerChildren: 0.08 } },
//   };

//   const reviewsLeft = [
//     {
//       name: "Ahmed Khan",
//       handle: "@ahmedkhan",
//       text: "Replex Engine replies faster than our team could manually. Lead response time dropped badly.",
//     },
//     {
//       name: "Sara Malik",
//       handle: "@saramalik",
//       text: "The follow-up automation is the real win. Leads no longer go cold in our inbox.",
//     },
//     {
//       name: "Bilal Dev",
//       handle: "@bilaldev",
//       text: "Setup was simple and the workflow feels clean. No complicated CRM mess.",
//     },
//     {
//       name: "Hassan Ali",
//       handle: "@hassanali",
//       text: "We connected our inbox and started capturing leads the same day.",
//     },
//   ];

//   const isComingSoon = (url) => {
//     if (!url) return true;

//     const value = url.toLowerCase().trim();

//     return (
//       value === "coming soon" ||
//       value === "comming soon" ||
//       value === "coming-soon" ||
//       value === "comming-soon"
//     );
//   };

//   const reviewsRight = [
//     {
//       name: "Ayesha Noor",
//       handle: "@ayesha",
//       text: "Before Replex we missed replies. Now every inbound email gets handled instantly.",
//     },
//     {
//       name: "Usman Tariq",
//       handle: "@usman",
//       text: "AI intent detection saves our sales team a lot of repetitive work.",
//     },
//     {
//       name: "Zain Agency",
//       handle: "@zainagency",
//       text: "Follow-ups keep running automatically until the lead responds. Very useful.",
//     },
//     {
//       name: "Noman Raza",
//       handle: "@noman",
//       text: "Clean product, simple automation, and perfect for inbound lead handling.",
//     },
//   ];

//   const fadeUp = {
//     hidden: { opacity: 0, y: 16 },
//     show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
//         <div className="flex flex-col items-center gap-3">
//           <div className="h-10 w-10 rounded-full border-[3px] border-zinc-200 border-t-violet-600 animate-spin" />
//           <p className="text-sm font-semibold text-zinc-500">
//             Loading Replex Engine...
//           </p>
//         </div>
//       </div>
//     );
//   }
//   const TestimonialsSection = () => (
//     <section className="relative overflow-hidden border-b border-zinc-200/70  py-24">
//       {" "}
//       <style>{`
//       @keyframes scrollUp {
//         from { transform: translateY(0); }
//         to { transform: translateY(-50%); }
//       }

//       @keyframes scrollDown {
//         from { transform: translateY(-50%); }
//         to { transform: translateY(0); }
//       }

//       .animate-scrollUp {
//         animation: scrollUp 24s linear infinite;
//       }

//       .animate-scrollDown {
//         animation: scrollDown 24s linear infinite;
//       }

//       .animate-scrollUp:hover,
//       .animate-scrollDown:hover {
//         animation-play-state: paused;
//       }
//     `}</style>
//       <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 lg:grid-cols-[0.9fr_1.1fr]">
//         <div>
//           <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-zinc-200 px-3.5 py-1.5 text-xs font-bold text-zinc-700 shadow-sm backdrop-blur">
//             <span className="h-1.5 w-1.5 rounded-full bg-violet-600" />
//             Customer Reviews
//           </div>

//           <h2 className="max-w-xl text-[44px] font-semibold leading-[0.98] tracking-[-0.065em] text-zinc-950 sm:text-6xl">
//             Trusted by teams who move fast
//           </h2>

//           <p className="mt-7 max-w-md text-base leading-8 text-zinc-600 sm:text-xl">
//             Join businesses using Replex Engine to capture leads, send instant
//             AI replies, and keep follow-ups running automatically.
//           </p>

//           <button
//             onClick={() => navigate("/register")}
//             className="mt-8 inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-[#6F4BFF] px-4 text-[13px] font-semibold text-white shadow-[0_7px_18px_rgba(111,75,255,0.28)] transition hover:bg-[#6242E8]"
//           >
//             Start automating for free
//             <FiArrowRight className="text-[13px]" />
//           </button>

//           <div className="mt-12 border-t border-dashed border-zinc-300 pt-8">
//             <p className="max-w-md text-sm font-medium leading-6 text-zinc-700">
//               “Replex Engine helped us respond to every inbound lead without
//               adding more sales reps.”
//             </p>

//             <div className="mt-5 flex items-center gap-3">
//               <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 ring-1 ring-zinc-200">
//                 <span className="text-xs font-bold text-zinc-900">R</span>
//               </div>

//               <div>
//                 <p className="text-sm font-semibold text-zinc-950">
//                   Replex Customer
//                 </p>
//                 <p className="text-xs font-medium text-zinc-500">Growth Team</p>
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="grid gap-4 sm:grid-cols-2">
//           <TestimonialsColumn reviews={reviewsLeft} />
//           <TestimonialsColumn reviews={reviewsRight} reverse />
//         </div>
//       </div>
//     </section>
//   );

//   const TestimonialCard = ({ review }) => (
//     <div className="rounded-2xl border border-zinc-200/80 bg-white/85 p-5 shadow-[0_8px_30px_rgba(0,0,0,0.08)] backdrop-blur-xl">
//       <p className="text-sm font-semibold leading-6 text-zinc-800">
//         {review.text}
//       </p>

//       <div className="mt-5 flex items-center gap-3">
//         <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 text-xs font-bold text-zinc-900 ring-1 ring-zinc-200">
//           {review.name.charAt(0)}
//         </div>

//         <div>
//           <p className="text-sm font-semibold text-zinc-950">{review.name}</p>
//           <p className="text-xs font-medium text-zinc-500">{review.handle}</p>
//         </div>
//       </div>
//     </div>
//   );

//   const TestimonialsColumn = ({ reviews, reverse = false }) => (
//     <div className="relative h-[520px] overflow-hidden">
//       <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-24 bg-gradient-to-b from-white/95 via-[#FBFAFA]/80 to-transparent" />
//       <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-24 bg-gradient-to-t from-[#f4f4f5]/95 via-[#FBFAFA]/80 to-transparent" />
//       <div
//         className={`flex flex-col gap-4 ${
//           reverse ? "animate-scrollDown" : "animate-scrollUp"
//         }`}
//       >
//         {[...reviews, ...reviews].map((review, index) => (
//           <TestimonialCard key={index} review={review} />
//         ))}
//       </div>
//     </div>
//   );
//   const GoogleDataUsageSection = () => (
//     <section className="relative overflow-hidden border-b border-zinc-200/70 bg-white py-24">
//       <div className="mx-auto max-w-7xl px-5">
//         <div className="grid items-start gap-14 lg:grid-cols-[0.9fr_1.1fr]">
//           <div>
//             <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3.5 py-1.5 text-xs font-bold text-zinc-700 shadow-sm">
//               <span className="h-1.5 w-1.5 rounded-full bg-violet-600" />
//               {pageData.clientCommunication?.badge}
//             </div>

//             <h2 className="max-w-xl text-[40px] font-semibold leading-[1] tracking-[-0.06em] text-zinc-950 sm:text-5xl">
//               {pageData.clientCommunication?.title}{" "}
//             </h2>

//             <p className="mt-6 max-w-xl text-base leading-8 text-zinc-600 sm:text-lg">
//               {pageData.clientCommunication?.description}
//             </p>
//           </div>

//           <div className="rounded-2xl border border-zinc-200 bg-[#fafafa] p-6 shadow-[0_24px_80px_rgba(24,24,27,0.08)]">
//             <div className="space-y-5">
//               {pageData.clientCommunication?.cards?.map((item) => (
//                 <div
//                   key={item.title}
//                   className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm"
//                 >
//                   <div className="flex items-start gap-3">
//                     <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#F7F7F8] ring-1 ring-zinc-200">
//                       <FiCheckCircle className="text-[13px] text-[#6F4BFF]" />
//                     </span>

//                     <div>
//                       <h3 className="text-sm font-semibold text-zinc-950">
//                         {item.title}
//                       </h3>
//                       <p className="mt-2 text-sm font-medium leading-6 text-zinc-600">
//                         {item.text}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>

//             <button
//               onClick={() =>
//                 navigate(
//                   pageData.clientCommunication?.buttonRoute || "/register",
//                 )
//               }
//               className="mt-6 inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-[#6F4BFF] px-4 text-[13px] font-semibold text-white shadow-[0_7px_18px_rgba(111,75,255,0.28)] transition hover:bg-[#6242E8]"
//             >
//               {pageData.clientCommunication?.buttonText}{" "}
//               <FiArrowRight className="text-[13px]" />
//             </button>
//           </div>
//         </div>
//       </div>
//     </section>
//   );

//   return (
//     <div className="min-h-screen overflow-x-hidden bg-[#fafafa] text-zinc-950 font-sans selection:bg-violet-100">
//       <section className="relative min-h-[700px] overflow-hidden border-b border-zinc-200/70 bg-[radial-gradient(circle_at_50%_10%,#ffffff_0%,#fafafa_42%,#f4f4f5_100%)]">
//         <CircuitBackground />

//         <header className="fixed inset-x-0 top-2 z-50 px-3">
//           <div className="mx-auto flex h-[46px] max-w-[1230px] items-center justify-between rounded-[14px] border border-zinc-200/80 bg-white/85 px-3 shadow-[0_8px_30px_rgba(0,0,0,0.08)] backdrop-blur-xl">
//             {/* Logo */}
//             <button
//               onClick={() => navigate("/")}
//               className="flex h-full items-center gap-2 border-r border-zinc-200/80 pr-4"
//             >
//               <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-zinc-100 ring-1 ring-zinc-200">
//                 <span className="absolute h-3.5 w-3.5 rounded-full border-[3px] border-zinc-900 border-r-transparent" />
//                 <span className="absolute right-[5px] top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-zinc-900" />
//               </span>

//               <span className="text-[18px] font-semibold leading-none tracking-[-0.025em] text-zinc-950">
//                 {pageData.logoText}
//               </span>
//             </button>

//             {/* Nav */}
//             <nav className="hidden flex-1 items-center gap-6 pl-5 md:flex">
//               {pageData.navbarLinks?.map((link, idx) => (
//                 <button
//                   key={idx}
//                   onClick={() => goTo(link.route)}
//                   className="inline-flex items-center gap-1.5 text-[13px] font-semibold leading-none text-zinc-900 transition hover:text-zinc-600"
//                 >
//                   {link.label}

//                   {[
//                     "Product",
//                     "Products",
//                     "Docs",
//                     "Changelog",
//                     "Company",
//                   ].includes(link.label) && <></>}
//                 </button>
//               ))}
//             </nav>

//             {/* Actions */}
//             <div className="flex h-full items-center gap-2">
//               <button
//                 onClick={() => navigate("/login")}
//                 className="hidden rounded-lg px-3 py-2 text-[13px] font-semibold leading-none text-zinc-950 transition hover:bg-zinc-100 sm:block"
//               >
//                 Sign in
//               </button>

//               <button
//                 onClick={() => navigate("/register")}
//                 className="inline-flex h-8 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 text-[13px] font-semibold leading-none text-zinc-950 shadow-[0_1px_2px_rgba(0,0,0,0.06)] transition hover:bg-zinc-50"
//               >
//                 Start building
//                 <FiArrowRight className="text-[12px]" />
//               </button>
//             </div>
//           </div>
//         </header>

//         <main className="relative z-10 mx-auto flex max-w-6xl flex-col items-center px-5 pb-20 pt-44 text-center sm:pt-48">
//           <motion.div
//             variants={container}
//             initial="hidden"
//             animate="show"
//             className="flex flex-col items-center"
//           >
//             {pageData.hero?.badge && (
//               <motion.div
//                 variants={fadeUp}
//                 className="mb-7 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/80 px-3.5 py-1.5 text-xs font-bold text-zinc-700 shadow-sm backdrop-blur"
//               >
//                 <span className="h-1.5 w-1.5 rounded-full bg-violet-600" />
//                 {pageData.hero.badge}
//               </motion.div>
//             )}

//             <motion.h1
//               variants={fadeUp}
//               className="max-w-5xl text-[44px]  font-semibold leading-[0.98] tracking-[-0.065em] text-zinc-950 sm:text-6xl md:text-[76px]"
//             >
//               {pageData.hero?.mainTitle}
//             </motion.h1>

//             <motion.p
//               variants={fadeUp}
//               className="mt-7 max-w-3xl text-base leading-8 text-zinc-600 sm:text-xl"
//             >
//               {pageData.hero?.description}
//             </motion.p>

//             <motion.div
//               variants={fadeUp}
//               className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
//             >
//               {pageData.hero?.buttons?.map((btn, idx) => (
//                 <button
//                   key={idx}
//                   onClick={() => goTo(btn.route)}
//                   className={
//                     btn.isPrimary
//                       ? "inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-[#6F4BFF] px-4 text-[13px] font-semibold text-white shadow-[0_7px_18px_rgba(111,75,255,0.28)] transition hover:bg-[#6242E8]"
//                       : "inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-[#F7F7F8] px-4 text-[13px] font-semibold text-zinc-950 shadow-sm transition hover:bg-white"
//                   }
//                 >
//                   {!btn.isPrimary && (
//                     <FiPlay className="text-[13px] text-zinc-700" />
//                   )}
//                   {btn.text}
//                   {btn.isPrimary && <FiArrowRight className="text-[13px]" />}
//                 </button>
//               ))}
//             </motion.div>

//             <motion.div
//               variants={fadeUp}
//               className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[13px] font-medium text-zinc-500"
//             >
//               {pageData.hero?.trustItems?.map((item) => (
//                 <span key={item} className="inline-flex items-center gap-1.5">
//                   <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#F7F7F8] ring-1 ring-zinc-200">
//                     <FiCheckCircle className="text-[11px] text-[#6F4BFF]" />
//                   </span>
//                   {item}
//                 </span>
//               ))}
//             </motion.div>
//           </motion.div>
//         </main>
//       </section>

//       <section className="relative z-10 border-b border-zinc-200 bg-white">
//         <div className="mx-auto max-w-7xl px-5">
//           <div className="grid grid-cols-2 items-center gap-6 border-b border-zinc-200 py-7 text-center sm:grid-cols-5">
//             {pageData.trustedCountries?.map((logo) => (
//               <div
//                 key={logo}
//                 className="text-sm font-semibold tracking-[-0.02em] text-zinc-400"
//               >
//                 {logo}
//               </div>
//             ))}
//           </div>

//           <div className="grid items-center gap-14 py-24 lg:grid-cols-2">
//             <div>
//               <p className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-[#6F4BFF]">
//                 {pageData.leadAutomation?.badge}{" "}
//               </p>

//               <h2 className="max-w-xl text-3xl font-semibold leading-tight tracking-[-0.045em] text-zinc-950 sm:text-5xl">
//                 {pageData.leadAutomation?.title}{" "}
//               </h2>

//               <p className="mt-5 max-w-xl text-base leading-7 text-zinc-600">
//                 {pageData.leadAutomation?.description}
//               </p>

//               <div className="mt-8 space-y-4">
//                 {pageData.leadAutomation?.bullets?.map((item) => (
//                   <div key={item} className="flex items-start gap-3">
//                     <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#F7F7F8] ring-1 ring-zinc-200">
//                       <FiCheckCircle className="text-[13px] text-[#6F4BFF]" />
//                     </span>
//                     <span className="text-sm font-medium leading-6 text-zinc-700">
//                       {item}
//                     </span>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             <div className="relative">
//               <div className="absolute -inset-8 rounded-[2rem] bg-zinc-100 blur-3xl" />

//               <div className="relative mx-auto max-w-[520px] rounded-2xl border border-zinc-200 bg-white p-3 shadow-[0_24px_80px_rgba(24,24,27,0.12)]">
//                 <div className="relative overflow-hidden rounded-xl border border-zinc-200 bg-[#fafafa] p-5">
//                   <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(24,24,27,0.045)_1px,transparent_1px),linear-gradient(to_bottom,rgba(24,24,27,0.045)_1px,transparent_1px)] bg-[size:34px_34px]" />

//                   <div className="relative mb-5 flex items-center justify-between">
//                     <div>
//                       <p className="text-xs font-semibold text-zinc-500">
//                         {pageData.leadAutomation?.pipelineLabel ||
//                           "Active pipeline"}{" "}
//                       </p>
//                       <h3 className="text-sm font-semibold text-zinc-950">
//                         {pageData.leadAutomation?.pipelineTitle}{" "}
//                       </h3>
//                     </div>

//                     <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F7F7F8] px-2.5 py-1 text-[11px] font-semibold text-zinc-700 ring-1 ring-zinc-200">
//                       <span className="h-1.5 w-1.5 rounded-full bg-[#6F4BFF]" />
//                       {pageData.leadAutomation?.pipelineStatus}{" "}
//                     </span>
//                   </div>

//                   <div className="relative">
//                     <div className="absolute left-6 right-6 top-[30px] hidden h-px bg-zinc-200 md:block" />
//                     <div className="absolute left-6 right-6 top-[30px] hidden h-px bg-gradient-to-r from-[#6F4BFF] via-[#6F4BFF] to-transparent md:block" />

//                     <div className="relative grid gap-4 md:grid-cols-4">
//                       {pageData.leadAutomation?.steps?.map((item, index) => (
//                         <div
//                           key={item.title}
//                           className="relative flex flex-col items-center text-center"
//                         >
//                           <div
//                             className={
//                               index === 3
//                                 ? "relative z-10 flex h-[62px] w-[62px] items-center justify-center rounded-full bg-[#6F4BFF] text-white shadow-[0_12px_28px_rgba(111,75,255,0.35)] ring-4 ring-white"
//                                 : "relative z-10 flex h-[62px] w-[62px] items-center justify-center rounded-full border border-zinc-200 bg-white text-[#6F4BFF] shadow-sm ring-4 ring-[#fafafa]"
//                             }
//                           >
//                             <span className="text-xs font-semibold">
//                               {item.step}{" "}
//                             </span>

//                             {index === 1 && (
//                               <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-[#6F4BFF] ring-4 ring-white" />
//                             )}

//                             {index === 3 && (
//                               <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[#6F4BFF] shadow-sm">
//                                 <FiCheckCircle className="text-[13px]" />
//                               </span>
//                             )}
//                           </div>

//                           <p className="mt-3 text-sm font-semibold text-zinc-950">
//                             {item.title}{" "}
//                           </p>
//                           <p className="mt-1 text-xs leading-5 text-zinc-500">
//                             {item.description}
//                           </p>
//                         </div>
//                       ))}
//                     </div>
//                   </div>

//                   <div className="relative mt-6 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
//                     <div className="flex items-start gap-3">
//                       <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F7F7F8] ring-1 ring-zinc-200">
//                         <FiMail className="text-[#6F4BFF]" />
//                       </div>

//                       <div className="flex-1">
//                         <div className="flex items-center justify-between gap-3">
//                           <p className="text-sm font-semibold text-zinc-950">
//                             {pageData.leadAutomation?.completionTitle}
//                           </p>
//                           <span className="rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-200">
//                             {pageData.leadAutomation?.completionStatus}
//                           </span>
//                         </div>

//                         <p className="mt-1 text-xs leading-5 text-zinc-500">
//                           {pageData.leadAutomation?.completionDescription}
//                         </p>
//                       </div>
//                     </div>
//                   </div>

//                   <div className="relative mt-4 grid grid-cols-3 gap-2">
//                     {pageData.leadAutomation?.stats?.map((stat) => (
//                       <div
//                         key={stat.label}
//                         className="rounded-xl border border-zinc-200 bg-white p-3 text-center shadow-sm"
//                       >
//                         <p className="text-[11px] font-medium text-zinc-400">
//                           {stat.label}
//                         </p>
//                         <p className="mt-1 text-sm font-semibold text-zinc-950">
//                           {stat.value}
//                         </p>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* working on this below section */}

//       {/* <TestimonialsSection /> */}
//       <GoogleDataUsageSection />

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

//       {demoOpen && (
//         <div
//           onClick={() => setDemoOpen(false)}
//           className="fixed inset-0 z-[80] flex items-center justify-center bg-zinc-950/60 p-4 backdrop-blur-sm"
//         >
//           <motion.div
//             initial={{ scale: 0.96, opacity: 0 }}
//             animate={{ scale: 1, opacity: 1 }}
//             onClick={(e) => e.stopPropagation()}
//             className="relative w-full max-w-5xl overflow-hidden rounded-3xl border border-white/20 bg-white p-2 shadow-2xl"
//           >
//             <button
//               onClick={() => setDemoOpen(false)}
//               className="absolute right-5 top-5 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white/90 text-zinc-700 shadow-sm backdrop-blur transition hover:text-zinc-950"
//               aria-label="Close demo"
//             >
//               <FiX />
//             </button>
//             <div className="aspect-video overflow-hidden rounded-2xl bg-zinc-100">
//               {!isComingSoon(pageData.hero?.demoVideoUrl) ? (
//                 <video
//                   src={pageData.hero.demoVideoUrl}
//                   controls
//                   autoPlay
//                   className="h-full w-full object-cover"
//                 />
//               ) : (
//                 <div className="flex h-full w-full items-center justify-center bg-[#fafafa]">
//                   <div className="text-center">
//                     <p className="text-3xl font-semibold tracking-[-0.05em] text-zinc-900">
//                       Coming Soon
//                     </p>
//                     <p className="mt-2 text-sm font-medium text-zinc-500">
//                       Demo video will be available soon.
//                     </p>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </motion.div>
//         </div>
//       )}
//     </div>
//   );
// };

// const CircuitBackground = () => (
//   <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-90">
//     <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(24,24,27,0.045)_1px,transparent_1px),linear-gradient(to_bottom,rgba(24,24,27,0.045)_1px,transparent_1px)] bg-[size:96px_96px]" />
//     <div className="absolute inset-x-0 top-0 h-full bg-[radial-gradient(circle_at_center,transparent_0%,transparent_34%,rgba(250,250,250,0.78)_72%)]" />
//     <svg
//       className="absolute left-1/2 top-8 h-[600px] w-[1500px] -translate-x-1/2 text-zinc-300/55"
//       viewBox="0 0 1500 600"
//       fill="none"
//     >
//       <path
//         d="M72 140H222L292 210H474L545 140H690"
//         stroke="currentColor"
//         strokeWidth="1"
//       />
//       <path
//         d="M1430 140H1278L1208 210H1026L955 140H810"
//         stroke="currentColor"
//         strokeWidth="1"
//       />
//       <path
//         d="M260 460H430L500 525H658V392H750"
//         stroke="currentColor"
//         strokeWidth="1"
//       />
//       <path
//         d="M1240 460H1070L1000 525H842V392H750"
//         stroke="currentColor"
//         strokeWidth="1"
//       />
//       <path
//         d="M750 0V105M750 495V600M520 0V105L590 175V245M980 0V105L910 175V245"
//         stroke="currentColor"
//         strokeWidth="1"
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

// export default LandingPage;
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
  FiX,
  FiChevronDown,
  FiCheckCircle,
  FiTwitter,
  FiLinkedin,
  FiGithub,
  FiYoutube,
} from "react-icons/fi";
import { PiRobotLight } from "react-icons/pi";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";

const iconMap = {
  FiZap: <FiZap />,
  PiRobotLight: <PiRobotLight />,
  FiSend: <FiSend />,
  FiRepeat: <FiRepeat />,
  FiBarChart2: <FiBarChart2 />,
};

const LandingPage = () => {
  const navigate = useNavigate();
  const [demoOpen, setDemoOpen] = useState(false);
  const [content, setContent] = useState(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await fetch(
          "http://localhost:5000/api/landing-page",
        );
        if (res.ok) setContent(await res.json());
      } catch (err) {
        console.error("Error connecting to server", err);
      }
    };
    fetchContent();
  }, []);

  const defaultPageData = {
  logoText: "Replex Engine",
  navbarLinks: [
    { label: "Product", route: "/product" },
    { label: "Solutions", route: "/solutions" },
    { label: "Developers", route: "/developer" },
    { label: "Pricing", route: "/pricing" },
  ],
  hero: {
    badge: "Shopify Partners Lead Automation Tool",
    mainTitle: "Automate your lead replies",
    highlightedTitle: "visually.",
    description:
      "Build visual automation flows to reply to leads instantly, apply delays, and send the right email at the perfect time — without writing code.",
    buttons: [
      {
        text: "Get Started For Free No Credit Card Required",
        route: "/register",
        isPrimary: true,
      },
      {
        text: "Watch Demo",
        route: "#demo",
        isPrimary: false,
      },
    ],
    trustItems: [
      "No-code workflows",
      "Instant AI replies",
      "Automated follow-ups",
    ],
    demoVideoUrl: "Comming soon",
  },

  trustedCountries: [
    "United States",
    "United Kingdom",
    "Germany",
    "Canada",
    "Australia",
  ],

  leadAutomation: {
    badge: "Lead automation",
    title: "Capture, understand, and reply to every lead in minutes",
    description:
      "Replex Engine turns your inbox into an automated sales workflow.",
    bullets: [
      "Connect your lead inbox or forwarding address",
      "Let AI detect intent, urgency, and customer context",
      "Send instant replies and continue follow-ups automatically",
    ],
    pipelineLabel: "Active pipeline",
    pipelineTitle: "Agency lead scenario",
    pipelineStatus: "Running",
    steps: [
      { step: "01", title: "Lead", description: "Email received" },
      { step: "02", title: "Intent", description: "Template detected" },
      { step: "03", title: "Reply", description: "Response sent" },
      { step: "04", title: "Follow-up", description: "Sequence completed" },
    ],
    completionTitle: "Scenario completed",
    completionStatus: "Delivered",
    completionDescription:
      "Lead captured, intent analyzed, reply sent, and follow-up sequence completed automatically.",
    stats: [
      { label: "Reply time", value: "18s" },
      { label: "Lead score", value: "92%" },
      { label: "Status", value: "Won" },
    ],
  },

  clientCommunication: {
    badge: "Client Communication",
    title: "Keep every client conversation clear, fast, and organized",
    description:
      "Replex Engine helps your team handle incoming conversations, respond faster, and keep follow-ups consistent.",
    cards: [
      {
        title: "Clear conversation flow",
        text: "Keep every incoming message organized so your team knows what needs attention.",
      },
      {
        title: "Faster response handling",
        text: "Use ready replies and smart suggestions to answer clients quickly.",
      },
      {
        title: "Consistent follow-through",
        text: "Make sure no conversation is forgotten by keeping reminders and follow-ups aligned with your process.",
      },
      {
        title: "Simple team visibility",
        text: "Give your team a cleaner way to track client conversations, response status, and next steps from one place.",
      },
    ],
    buttonText: "Organize Conversations",
    buttonRoute: "/register",
  },

  testimonials: {
    badge: "Customer Reviews",
    title: "Trusted by teams who move fast",
    description:
      "Join businesses using Replex Engine to capture leads, send instant AI replies, and keep follow-ups running automatically.",
    buttonText: "Start automating for free",
    buttonRoute: "/register",
    quote:
      "Replex Engine helped us respond to every inbound lead without adding more sales reps.",
    authorName: "Replex Customer",
    authorRole: "Growth Team",
    leftReviews: [],
    rightReviews: [],
  },

  footer: {
    copyrightText: "© 2026 Replex Engine — AI powered lead automation",
    links: [
      { label: "Privacy Policy", route: "/privacy-policy" },
      { label: "Terms & Conditions", route: "/terms" },
    ],
  },
};

const pageData = {
  ...defaultPageData,
  ...content,
  hero: {
    ...defaultPageData.hero,
    ...(content?.hero || {}),
  },
  leadAutomation: {
    ...defaultPageData.leadAutomation,
    ...(content?.leadAutomation || {}),
  },
  clientCommunication: {
    ...defaultPageData.clientCommunication,
    ...(content?.clientCommunication || {}),
  },
  testimonials: {
    ...defaultPageData.testimonials,
    ...(content?.testimonials || {}),
  },
  trustedCountries:
    content?.trustedCountries?.length > 0
      ? content.trustedCountries
      : defaultPageData.trustedCountries,
  footer: {
    ...defaultPageData.footer,
    ...(content?.footer || {}),
  },
};
  const goTo = (route) => {
    if (route === "#demo") setDemoOpen(true);
    else navigate(route);
  };

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };

  const reviewsLeft = [
    {
      name: "Ahmed Khan",
      handle: "@ahmedkhan",
      text: "Replex Engine replies faster than our team could manually. Lead response time dropped badly.",
    },
    {
      name: "Sara Malik",
      handle: "@saramalik",
      text: "The follow-up automation is the real win. Leads no longer go cold in our inbox.",
    },
    {
      name: "Bilal Dev",
      handle: "@bilaldev",
      text: "Setup was simple and the workflow feels clean. No complicated CRM mess.",
    },
    {
      name: "Hassan Ali",
      handle: "@hassanali",
      text: "We connected our inbox and started capturing leads the same day.",
    },
  ];

  const isComingSoon = (url) => {
    if (!url) return true;

    const value = url.toLowerCase().trim();

    return (
      value === "coming soon" ||
      value === "comming soon" ||
      value === "coming-soon" ||
      value === "comming-soon"
    );
  };

  const reviewsRight = [
    {
      name: "Ayesha Noor",
      handle: "@ayesha",
      text: "Before Replex we missed replies. Now every inbound email gets handled instantly.",
    },
    {
      name: "Usman Tariq",
      handle: "@usman",
      text: "AI intent detection saves our sales team a lot of repetitive work.",
    },
    {
      name: "Zain Agency",
      handle: "@zainagency",
      text: "Follow-ups keep running automatically until the lead responds. Very useful.",
    },
    {
      name: "Noman Raza",
      handle: "@noman",
      text: "Clean product, simple automation, and perfect for inbound lead handling.",
    },
  ];

  const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
  };


  const TestimonialsSection = () => (
    <section className="relative overflow-hidden border-b border-zinc-200/70  py-24">
      {" "}
      <style>{`
      @keyframes scrollUp {
        from { transform: translateY(0); }
        to { transform: translateY(-50%); }
      }

      @keyframes scrollDown {
        from { transform: translateY(-50%); }
        to { transform: translateY(0); }
      }

      .animate-scrollUp {
        animation: scrollUp 24s linear infinite;
      }

      .animate-scrollDown {
        animation: scrollDown 24s linear infinite;
      }

      .animate-scrollUp:hover,
      .animate-scrollDown:hover {
        animation-play-state: paused;
      }
    `}</style>
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-zinc-200 px-3.5 py-1.5 text-xs font-bold text-zinc-700 shadow-sm backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-600" />
            Customer Reviews
          </div>

          <h2 className="max-w-xl text-[44px] font-semibold leading-[0.98] tracking-[-0.065em] text-zinc-950 sm:text-6xl">
            Trusted by teams who move fast
          </h2>

          <p className="mt-7 max-w-md text-base leading-8 text-zinc-600 sm:text-xl">
            Join businesses using Replex Engine to capture leads, send instant
            AI replies, and keep follow-ups running automatically.
          </p>

          <button
            onClick={() => navigate("/register")}
            className="mt-8 inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-[#6F4BFF] px-4 text-[13px] font-semibold text-white shadow-[0_7px_18px_rgba(111,75,255,0.28)] transition hover:bg-[#6242E8]"
          >
            Start automating for free
            <FiArrowRight className="text-[13px]" />
          </button>

          <div className="mt-12 border-t border-dashed border-zinc-300 pt-8">
            <p className="max-w-md text-sm font-medium leading-6 text-zinc-700">
              “Replex Engine helped us respond to every inbound lead without
              adding more sales reps.”
            </p>

            <div className="mt-5 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 ring-1 ring-zinc-200">
                <span className="text-xs font-bold text-zinc-900">R</span>
              </div>

              <div>
                <p className="text-sm font-semibold text-zinc-950">
                  Replex Customer
                </p>
                <p className="text-xs font-medium text-zinc-500">Growth Team</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <TestimonialsColumn reviews={reviewsLeft} />
          <TestimonialsColumn reviews={reviewsRight} reverse />
        </div>
      </div>
    </section>
  );

  const TestimonialCard = ({ review }) => (
    <div className="rounded-2xl border border-zinc-200/80 bg-white/85 p-5 shadow-[0_8px_30px_rgba(0,0,0,0.08)] backdrop-blur-xl">
      <p className="text-sm font-semibold leading-6 text-zinc-800">
        {review.text}
      </p>

      <div className="mt-5 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 text-xs font-bold text-zinc-900 ring-1 ring-zinc-200">
          {review.name.charAt(0)}
        </div>

        <div>
          <p className="text-sm font-semibold text-zinc-950">{review.name}</p>
          <p className="text-xs font-medium text-zinc-500">{review.handle}</p>
        </div>
      </div>
    </div>
  );

  const TestimonialsColumn = ({ reviews, reverse = false }) => (
    <div className="relative h-[520px] overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-24 bg-gradient-to-b from-white/95 via-[#FBFAFA]/80 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-24 bg-gradient-to-t from-[#f4f4f5]/95 via-[#FBFAFA]/80 to-transparent" />
      <div
        className={`flex flex-col gap-4 ${
          reverse ? "animate-scrollDown" : "animate-scrollUp"
        }`}
      >
        {[...reviews, ...reviews].map((review, index) => (
          <TestimonialCard key={index} review={review} />
        ))}
      </div>
    </div>
  );
  const GoogleDataUsageSection = () => (
    <section className="relative overflow-hidden border-b border-zinc-200/70 bg-white py-24">
      <div className="mx-auto max-w-7xl px-5">
        <div className="grid items-start gap-14 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3.5 py-1.5 text-xs font-bold text-zinc-700 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-violet-600" />
              {pageData.clientCommunication?.badge}
            </div>

            <h2 className="max-w-xl text-[40px] font-semibold leading-[1] tracking-[-0.06em] text-zinc-950 sm:text-5xl">
              {pageData.clientCommunication?.title}{" "}
            </h2>

            <p className="mt-6 max-w-xl text-base leading-8 text-zinc-600 sm:text-lg">
              {pageData.clientCommunication?.description}
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-[#fafafa] p-6 shadow-[0_24px_80px_rgba(24,24,27,0.08)]">
            <div className="space-y-5">
              {pageData.clientCommunication?.cards?.map((item) => (
                <div
                  key={item.title}
                  className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#F7F7F8] ring-1 ring-zinc-200">
                      <FiCheckCircle className="text-[13px] text-[#6F4BFF]" />
                    </span>

                    <div>
                      <h3 className="text-sm font-semibold text-zinc-950">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-sm font-medium leading-6 text-zinc-600">
                        {item.text}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() =>
                navigate(
                  pageData.clientCommunication?.buttonRoute || "/register",
                )
              }
              className="mt-6 inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-[#6F4BFF] px-4 text-[13px] font-semibold text-white shadow-[0_7px_18px_rgba(111,75,255,0.28)] transition hover:bg-[#6242E8]"
            >
              {pageData.clientCommunication?.buttonText}{" "}
              <FiArrowRight className="text-[13px]" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#fafafa] text-zinc-950 font-sans selection:bg-violet-100">
      <section className="relative min-h-[700px] overflow-hidden border-b border-zinc-200/70 bg-[radial-gradient(circle_at_50%_10%,#ffffff_0%,#fafafa_42%,#f4f4f5_100%)]">
        <CircuitBackground />

        <header className="fixed inset-x-0 top-2 z-50 px-3">
          <div className="mx-auto flex h-[46px] max-w-[1230px] items-center justify-between rounded-[14px] border border-zinc-200/80 bg-white/85 px-3 shadow-[0_8px_30px_rgba(0,0,0,0.08)] backdrop-blur-xl">
            {/* Logo */}
            <button
              onClick={() => navigate("/")}
              className="flex h-full items-center gap-2 border-r border-zinc-200/80 pr-4"
            >
              <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-zinc-100 ring-1 ring-zinc-200">
                <span className="absolute h-3.5 w-3.5 rounded-full border-[3px] border-zinc-900 border-r-transparent" />
                <span className="absolute right-[5px] top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-zinc-900" />
              </span>

              <span className="text-[18px] font-semibold leading-none tracking-[-0.025em] text-zinc-950">
                {pageData.logoText}
              </span>
            </button>

            {/* Nav */}
            <nav className="hidden flex-1 items-center gap-6 pl-5 md:flex">
              {pageData.navbarLinks?.map((link, idx) => (
                <button
                  key={idx}
                  onClick={() => goTo(link.route)}
                  className="inline-flex items-center gap-1.5 text-[13px] font-semibold leading-none text-zinc-900 transition hover:text-zinc-600"
                >
                  {link.label}

                  {[
                    "Product",
                    "Products",
                    "Docs",
                    "Changelog",
                    "Company",
                  ].includes(link.label) && <></>}
                </button>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex h-full items-center gap-2">
              <button
                onClick={() => navigate("/login")}
                className="hidden rounded-lg px-3 py-2 text-[13px] font-semibold leading-none text-zinc-950 transition hover:bg-zinc-100 sm:block"
              >
                Sign in
              </button>

              <button
                onClick={() => navigate("/register")}
                className="inline-flex h-8 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 text-[13px] font-semibold leading-none text-zinc-950 shadow-[0_1px_2px_rgba(0,0,0,0.06)] transition hover:bg-zinc-50"
              >
                Start building
                <FiArrowRight className="text-[12px]" />
              </button>
            </div>
          </div>
        </header>

        <main className="relative z-10 mx-auto flex max-w-6xl flex-col items-center px-5 pb-20 pt-44 text-center sm:pt-48">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="flex flex-col items-center"
          >
            {pageData.hero?.badge && (
              <motion.div
                variants={fadeUp}
                className="mb-7 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/80 px-3.5 py-1.5 text-xs font-bold text-zinc-700 shadow-sm backdrop-blur"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-violet-600" />
                {pageData.hero.badge}
              </motion.div>
            )}

            <motion.h1
              variants={fadeUp}
              className="max-w-5xl text-[44px]  font-semibold leading-[0.98] tracking-[-0.065em] text-zinc-950 sm:text-6xl md:text-[76px]"
            >
              {pageData.hero?.mainTitle}
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mt-7 max-w-3xl text-base leading-8 text-zinc-600 sm:text-xl"
            >
              {pageData.hero?.description}
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
            >
              {pageData.hero?.buttons?.map((btn, idx) => (
                <button
                  key={idx}
                  onClick={() => goTo(btn.route)}
                  className={
                    btn.isPrimary
                      ? "inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-[#6F4BFF] px-4 text-[13px] font-semibold text-white shadow-[0_7px_18px_rgba(111,75,255,0.28)] transition hover:bg-[#6242E8]"
                      : "inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-[#F7F7F8] px-4 text-[13px] font-semibold text-zinc-950 shadow-sm transition hover:bg-white"
                  }
                >
                  {!btn.isPrimary && (
                    <FiPlay className="text-[13px] text-zinc-700" />
                  )}
                  {btn.text}
                  {btn.isPrimary && <FiArrowRight className="text-[13px]" />}
                </button>
              ))}
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[13px] font-medium text-zinc-500"
            >
              {pageData.hero?.trustItems?.map((item) => (
                <span key={item} className="inline-flex items-center gap-1.5">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#F7F7F8] ring-1 ring-zinc-200">
                    <FiCheckCircle className="text-[11px] text-[#6F4BFF]" />
                  </span>
                  {item}
                </span>
              ))}
            </motion.div>
          </motion.div>
        </main>
      </section>

      <section className="relative z-10 border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-7xl px-5">
          <div className="grid grid-cols-2 items-center gap-6 border-b border-zinc-200 py-7 text-center sm:grid-cols-5">
            {pageData.trustedCountries?.map((logo) => (
              <div
                key={logo}
                className="text-sm font-semibold tracking-[-0.02em] text-zinc-400"
              >
                {logo}
              </div>
            ))}
          </div>

          <div className="grid items-center gap-14 py-24 lg:grid-cols-2">
            <div>
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-[#6F4BFF]">
                {pageData.leadAutomation?.badge}{" "}
              </p>

              <h2 className="max-w-xl text-3xl font-semibold leading-tight tracking-[-0.045em] text-zinc-950 sm:text-5xl">
                {pageData.leadAutomation?.title}{" "}
              </h2>

              <p className="mt-5 max-w-xl text-base leading-7 text-zinc-600">
                {pageData.leadAutomation?.description}
              </p>

              <div className="mt-8 space-y-4">
                {pageData.leadAutomation?.bullets?.map((item) => (
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

            <div className="relative">
              <div className="absolute -inset-8 rounded-[2rem] bg-zinc-100 blur-3xl" />

              <div className="relative mx-auto max-w-[520px] rounded-2xl border border-zinc-200 bg-white p-3 shadow-[0_24px_80px_rgba(24,24,27,0.12)]">
                <div className="relative overflow-hidden rounded-xl border border-zinc-200 bg-[#fafafa] p-5">
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(24,24,27,0.045)_1px,transparent_1px),linear-gradient(to_bottom,rgba(24,24,27,0.045)_1px,transparent_1px)] bg-[size:34px_34px]" />

                  <div className="relative mb-5 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-zinc-500">
                        {pageData.leadAutomation?.pipelineLabel ||
                          "Active pipeline"}{" "}
                      </p>
                      <h3 className="text-sm font-semibold text-zinc-950">
                        {pageData.leadAutomation?.pipelineTitle}{" "}
                      </h3>
                    </div>

                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F7F7F8] px-2.5 py-1 text-[11px] font-semibold text-zinc-700 ring-1 ring-zinc-200">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#6F4BFF]" />
                      {pageData.leadAutomation?.pipelineStatus}{" "}
                    </span>
                  </div>

                  <div className="relative">
                    <div className="absolute left-6 right-6 top-[30px] hidden h-px bg-zinc-200 md:block" />
                    <div className="absolute left-6 right-6 top-[30px] hidden h-px bg-gradient-to-r from-[#6F4BFF] via-[#6F4BFF] to-transparent md:block" />

                    <div className="relative grid gap-4 md:grid-cols-4">
                      {pageData.leadAutomation?.steps?.map((item, index) => (
                        <div
                          key={item.title}
                          className="relative flex flex-col items-center text-center"
                        >
                          <div
                            className={
                              index === 3
                                ? "relative z-10 flex h-[62px] w-[62px] items-center justify-center rounded-full bg-[#6F4BFF] text-white shadow-[0_12px_28px_rgba(111,75,255,0.35)] ring-4 ring-white"
                                : "relative z-10 flex h-[62px] w-[62px] items-center justify-center rounded-full border border-zinc-200 bg-white text-[#6F4BFF] shadow-sm ring-4 ring-[#fafafa]"
                            }
                          >
                            <span className="text-xs font-semibold">
                              {item.step}{" "}
                            </span>

                            {index === 1 && (
                              <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-[#6F4BFF] ring-4 ring-white" />
                            )}

                            {index === 3 && (
                              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[#6F4BFF] shadow-sm">
                                <FiCheckCircle className="text-[13px]" />
                              </span>
                            )}
                          </div>

                          <p className="mt-3 text-sm font-semibold text-zinc-950">
                            {item.title}{" "}
                          </p>
                          <p className="mt-1 text-xs leading-5 text-zinc-500">
                            {item.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="relative mt-6 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F7F7F8] ring-1 ring-zinc-200">
                        <FiMail className="text-[#6F4BFF]" />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold text-zinc-950">
                            {pageData.leadAutomation?.completionTitle}
                          </p>
                          <span className="rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-200">
                            {pageData.leadAutomation?.completionStatus}
                          </span>
                        </div>

                        <p className="mt-1 text-xs leading-5 text-zinc-500">
                          {pageData.leadAutomation?.completionDescription}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="relative mt-4 grid grid-cols-3 gap-2">
                    {pageData.leadAutomation?.stats?.map((stat) => (
                      <div
                        key={stat.label}
                        className="rounded-xl border border-zinc-200 bg-white p-3 text-center shadow-sm"
                      >
                        <p className="text-[11px] font-medium text-zinc-400">
                          {stat.label}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-zinc-950">
                          {stat.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* working on this below section */}

      {/* <TestimonialsSection /> */}
      <GoogleDataUsageSection />
<section className="relative overflow-hidden border-b border-zinc-200/70 bg-gradient-to-b from-white to-[#fafafa] py-28">
  <div className="mx-auto max-w-7xl px-5 grid lg:grid-cols-2 gap-16 items-center">

    {/* LEFT SIDE */}
    <div>
      <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-zinc-700 shadow-sm">
        <span className="h-2 w-2 rounded-full bg-violet-600" />
        Legal & Data Protection
      </div>

      <h2 className="text-5xl font-semibold tracking-[-0.06em] leading-[1.05] text-zinc-950">
        Privacy built into everything we do
      </h2>

      <p className="mt-6 text-base leading-7 text-zinc-600 max-w-xl">
        We follow strict data minimization principles. Only the data required to
        run automation workflows is collected — nothing more.
      </p>

      <div className="mt-8 flex flex-col sm:flex-row gap-3">
        <a
          href="/privacy-policy"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#6F4BFF] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(111,75,255,0.25)] hover:bg-[#5b3fe0] transition"
        >
          View Privacy Policy →
        </a>

        {/* <a
          href="/contact"
          className="inline-flex items-center justify-center rounded-lg border border-zinc-200 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-900 hover:bg-zinc-50 transition"
        >
          Contact Support
        </a> */}
      </div>
    </div>

    {/* RIGHT SIDE */}
    <div className="grid gap-5">

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm hover:shadow-md transition">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-violet-50 flex items-center justify-center">
            <span className="h-2 w-2 rounded-full bg-violet-600" />
          </div>
          <h3 className="font-semibold text-zinc-950">Minimal data collection</h3>
        </div>
        <p className="mt-3 text-sm text-zinc-600 leading-6">
          We only access data needed for email automation and workflow execution.
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm hover:shadow-md transition">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-violet-50 flex items-center justify-center">
            <span className="h-2 w-2 rounded-full bg-violet-600" />
          </div>
          <h3 className="font-semibold text-zinc-950">No data selling</h3>
        </div>
        <p className="mt-3 text-sm text-zinc-600 leading-6">
          Your data is never sold, shared, or used for advertising purposes.
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm hover:shadow-md transition">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-violet-50 flex items-center justify-center">
            <span className="h-2 w-2 rounded-full bg-violet-600" />
          </div>
          <h3 className="font-semibold text-zinc-950">User control</h3>
        </div>
        <p className="mt-3 text-sm text-zinc-600 leading-6">
          You can delete your data at any time.
          </p>
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

      {demoOpen && (
        <div
          onClick={() => setDemoOpen(false)}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-zinc-950/60 p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-5xl overflow-hidden rounded-3xl border border-white/20 bg-white p-2 shadow-2xl"
          >
            <button
              onClick={() => setDemoOpen(false)}
              className="absolute right-5 top-5 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white/90 text-zinc-700 shadow-sm backdrop-blur transition hover:text-zinc-950"
              aria-label="Close demo"
            >
              <FiX />
            </button>
            <div className="aspect-video overflow-hidden rounded-2xl bg-zinc-100">
              {!isComingSoon(pageData.hero?.demoVideoUrl) ? (
                <video
                  src={pageData.hero.demoVideoUrl}
                  controls
                  autoPlay
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[#fafafa]">
                  <div className="text-center">
                    <p className="text-3xl font-semibold tracking-[-0.05em] text-zinc-900">
                      Coming Soon
                    </p>
                    <p className="mt-2 text-sm font-medium text-zinc-500">
                      Demo video will be available soon.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

const CircuitBackground = () => (
  <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-90">
    <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(24,24,27,0.045)_1px,transparent_1px),linear-gradient(to_bottom,rgba(24,24,27,0.045)_1px,transparent_1px)] bg-[size:96px_96px]" />
    <div className="absolute inset-x-0 top-0 h-full bg-[radial-gradient(circle_at_center,transparent_0%,transparent_34%,rgba(250,250,250,0.78)_72%)]" />
    <svg
      className="absolute left-1/2 top-8 h-[600px] w-[1500px] -translate-x-1/2 text-zinc-300/55"
      viewBox="0 0 1500 600"
      fill="none"
    >
      <path
        d="M72 140H222L292 210H474L545 140H690"
        stroke="currentColor"
        strokeWidth="1"
      />
      <path
        d="M1430 140H1278L1208 210H1026L955 140H810"
        stroke="currentColor"
        strokeWidth="1"
      />
      <path
        d="M260 460H430L500 525H658V392H750"
        stroke="currentColor"
        strokeWidth="1"
      />
      <path
        d="M1240 460H1070L1000 525H842V392H750"
        stroke="currentColor"
        strokeWidth="1"
      />
      <path
        d="M750 0V105M750 495V600M520 0V105L590 175V245M980 0V105L910 175V245"
        stroke="currentColor"
        strokeWidth="1"
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

export default LandingPage;

import React from "react";
import { motion } from "framer-motion";
import { FiCheckCircle } from "react-icons/fi";

const AUTH_IMAGE =
  "https://cdn.shopify.com/s/files/1/0732/4496/7128/files/Gemini_Generated_Image_qrqzj3qrqzj3qrqz_1.png?v=1781785481";

const AuthVisualPanel = ({ benefits, headline, subheadline }) => (
  <aside className="relative hidden h-full overflow-hidden bg-slate-950 lg:flex lg:flex-col">
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_15%,rgba(99,102,241,0.55),transparent_52%),radial-gradient(ellipse_at_85%_85%,rgba(139,92,246,0.35),transparent_48%)]" />
    <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(rgba(255,255,255,.6)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.6)_1px,transparent_1px)] [background-size:28px_28px]" />

    <div className="relative flex h-full max-h-screen flex-col justify-center gap-6 px-10 py-8 xl:px-14">
      {/* Copy */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-lg shrink-0"
      >
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-indigo-400">
          Replex Engine
        </p>
        <h2 className="text-2xl font-bold leading-snug tracking-tight text-white xl:text-[1.75rem]">
          {headline}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-400">{subheadline}</p>

        <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5">
          {benefits.map((item) => (
            <li key={item} className="flex items-center gap-1.5 text-[12px] text-slate-300">
              <FiCheckCircle className="shrink-0 text-emerald-400" size={13} />
              {item}
            </li>
          ))}
        </ul>
      </motion.div>

      {/* Product image */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.12, ease: "easeOut" }}
        className="relative min-h-0 flex-1"
      >
        <div className="absolute -inset-3 rounded-3xl bg-indigo-500/25 blur-2xl" />
        <div className="relative flex h-full max-h-[min(52vh,520px)] items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-slate-900/40 shadow-2xl shadow-indigo-950/40 backdrop-blur-sm">
          <img
            src={AUTH_IMAGE}
            alt="Replex Engine lead automation platform"
            className="h-full w-full object-contain object-center p-2"
            loading="eager"
          />
        </div>

        {/* Floating badge */}
        <div className="absolute -bottom-2 left-4 rounded-xl border border-white/10 bg-slate-900/90 px-3 py-2 shadow-xl backdrop-blur-md xl:left-6">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            <span className="text-[11px] font-semibold text-slate-200">
              Automation running live
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  </aside>
);

export default AuthVisualPanel;

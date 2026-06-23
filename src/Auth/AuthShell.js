import React from "react";
import { FiMail, FiChevronRight } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";

/* ── Background ── */
export const AuthBackground = () => (
  <div className="pointer-events-none fixed inset-0 -z-10 bg-[#FAFAFA]">
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(199,210,254,0.35),transparent_55%),radial-gradient(ellipse_at_70%_80%,rgba(221,214,254,0.3),transparent_50%)]" />
    <div
      className="absolute inset-0 opacity-[0.35]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg stroke='%23CBD5E1' stroke-width='0.5' opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }}
    />
  </div>
);

/* ── Page footer ── */
export const AuthPageFooter = () => {
  const navigate = useNavigate();
  const year = new Date().getFullYear();

  return (
    <footer className="shrink-0 py-5 text-center text-xs text-slate-400">
      <span>© {year} Replex Engine</span>
      <span className="mx-2">·</span>
      <button
        type="button"
        onClick={() => navigate("/talk-to-sales")}
        className="transition hover:text-slate-600"
      >
        Support
      </button>
      <span className="mx-2">·</span>
      <button
        type="button"
        onClick={() => navigate("/privacy-policy")}
        className="transition hover:text-slate-600"
      >
        Privacy
      </button>
      <span className="mx-2">·</span>
      <button
        type="button"
        onClick={() => navigate("/terms")}
        className="transition hover:text-slate-600"
      >
        Terms
      </button>
    </footer>
  );
};

/* ── Card logo + headings ── */
export const AuthCardHeader = ({ title, subtitle }) => {
  const navigate = useNavigate();

  return (
    <div className="mb-6 text-center">
      <button
        type="button"
        onClick={() => navigate("/")}
        className="mx-auto mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20 transition hover:bg-indigo-700"
        aria-label="Go to homepage"
      >
        <FiMail size={18} />
      </button>
      <h1 className="text-xl font-bold tracking-tight text-slate-900">{title}</h1>
      <p className="mt-1.5 text-sm text-slate-500">{subtitle}</p>
    </div>
  );
};

/* ── Divider ── */
export const AuthDivider = () => (
  <div className="relative my-5 flex items-center">
    <div className="flex-1 border-t border-slate-200" />
    <span className="px-3 text-xs text-slate-400">or</span>
    <div className="flex-1 border-t border-slate-200" />
  </div>
);

/* ── Google button (Clerk-style overlay) ── */
export const GoogleAuthButton = ({ onSuccess, onError, text = "continue_with", showLastUsed = false }) => (
  <div className="relative h-10 w-full">
    {showLastUsed && (
      <span className="absolute -top-2.5 right-3 z-20 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-medium text-slate-500 shadow-sm">
        Last used
      </span>
    )}
    <div className="absolute inset-0 z-10 h-10 overflow-hidden rounded-lg opacity-0">
      <GoogleLogin
        onSuccess={onSuccess}
        onError={onError}
        theme="outline"
        size="large"
        text={text}
        shape="rectangular"
        width="400"
      />
    </div>
    <div className="pointer-events-none flex h-10 w-full items-center justify-center gap-2.5 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 shadow-sm">
      <FcGoogle size={18} />
      {text === "signup_with" ? "Continue with Google" : "Continue with Google"}
    </div>
  </div>
);

/* ── GitHub placeholder ── */
export const GitHubAuthButton = () => (
  <button
    type="button"
    disabled
    title="Coming soon"
    className="mt-2.5 flex h-10 w-full cursor-not-allowed items-center justify-center gap-2.5 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-400 shadow-sm"
  >
    <FaGithub size={18} />
    Continue with GitHub
  </button>
);

/* ── Primary CTA ── */
export const AuthPrimaryButton = ({ children, loading, disabled }) => (
  <button
    type="submit"
    disabled={loading || disabled}
    className={`mt-1 flex h-10 w-full items-center justify-center gap-1 rounded-lg text-sm font-semibold text-white transition ${
      loading || disabled
        ? "cursor-not-allowed bg-indigo-400"
        : "bg-indigo-600 hover:bg-indigo-700"
    }`}
  >
    {loading ? (
      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
    ) : (
      <>
        {children}
        <FiChevronRight size={16} className="opacity-80" />
      </>
    )}
  </button>
);

/* ── Card footer link ── */
export const AuthCardFooter = ({ prompt, linkText, onLinkClick }) => (
  <div className="mt-6 border-t border-slate-100 pt-5 text-center text-sm text-slate-500">
    {prompt}{" "}
    <button
      type="button"
      onClick={onLinkClick}
      className="font-semibold text-indigo-600 transition hover:text-indigo-800"
    >
      {linkText}
    </button>
  </div>
);

/* ── Secured badge ── */
export const AuthSecuredBadge = () => (
  <div className="mt-5 flex items-center justify-center gap-1.5 border-t border-slate-100 pt-4 text-xs text-slate-400">
    <FiMail size={12} className="text-indigo-500" />
    <span>
      Secured by <span className="font-semibold text-slate-500">Replex Engine</span>
    </span>
  </div>
);

/* ── Input styles ── */
export const authInputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/15";

export const authSelectClass =
  "w-full cursor-pointer appearance-none rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/15";

export const authLabelClass = "mb-1.5 block text-sm font-medium text-slate-700";

/* ── Shell wrapper ── */
const AuthShell = ({ children, maxWidth = "max-w-[400px]" }) => (
  <div className="flex min-h-screen flex-col font-['Inter',ui-sans-serif,system-ui] antialiased">
    <AuthBackground />
    <div className="flex flex-1 items-center justify-center px-4 py-8">
      <div
        className={`w-full ${maxWidth} rounded-2xl border border-slate-200/80 bg-white px-8 py-8 shadow-[0_4px_24px_rgba(0,0,0,0.06)] sm:px-10`}
      >
        {children}
      </div>
    </div>
    <AuthPageFooter />
  </div>
);

export default AuthShell;

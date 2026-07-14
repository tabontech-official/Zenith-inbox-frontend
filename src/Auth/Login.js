import React, { useContext, useState, useEffect } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { FiGithub, FiArrowRight } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { UserContext } from "../component/UserContext";
import { AnimatePresence, motion } from "framer-motion";
import { GoogleLogin } from "@react-oauth/google";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);

  useEffect(() => {
    const saved = localStorage.getItem("rememberedEmail");
    if (saved) {
      setEmail(saved);
      setRememberMe(true);
    }
  }, []);

  const redirectAfterLogin = (data) => {
    const userRole = data?.role || "user";
    const setupCompleted = data?.setup?.setupCompleted === true;
    const steps = data?.setup?.steps || [];

    setTimeout(() => {
      if (userRole === "admin") {
        navigate("/admin/dashboard", { replace: true });
        return;
      }

      if (setupCompleted) {
        navigate("/dashboard", { replace: true });
        return;
      }

      const nextStep =
        steps.find(
          (s) => s.status === "skipped" || s.status === "incomplete"
        )?.step || 1;

      navigate(`/setup?step=${nextStep}`, { replace: true });
    }, 800);
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await axios.post(
        "https://email-syncing-backend.vercel.app/auth/google-login",
        { credential: credentialResponse.credential }
      );

      if (response.status === 200) {
        const { token, data } = response.data;
        const TWO_DAYS = 2 * 24 * 60 * 60 * 1000;

        localStorage.setItem("usertoken", token);
        localStorage.setItem("userid", data._id);
        localStorage.setItem("loginExpiry", (Date.now() + TWO_DAYS).toString());
        localStorage.setItem("lastAuthMethod", "google");

        setUser(data);
        setSuccess("Welcome back! Redirecting...");
        setLoading(false);
        redirectAfterLogin(data);
      }
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.error || "Google authentication failed.");
    }
  };

  const handleGoogleClick = () => {
    setError(
      "Google login button UI is ready, but your Google OAuth component/SDK is not connected in this single-file version."
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (rememberMe) localStorage.setItem("rememberedEmail", email);
    else localStorage.removeItem("rememberedEmail");

    try {
      const response = await axios.post(
        "https://email-syncing-backend.vercel.app/auth/signIn",
        {
          email,
          password,
        }
      );

      if (response.status === 200) {
        const resData = response.data;

        if (resData.requiresTwoFactor) {
          localStorage.setItem("twoFactorUserId", resData.userId);
          setSuccess("Two-step verification required...");
          setLoading(false);
          navigate("/verify-2fa", {
            state: { userId: resData.userId },
            replace: true,
          });
          return;
        }

        const { token, data } = resData;
        const TWO_DAYS = 2 * 24 * 60 * 60 * 1000;

        localStorage.setItem("usertoken", token);
        localStorage.setItem("userid", data._id);
        localStorage.setItem("loginExpiry", (Date.now() + TWO_DAYS).toString());
        localStorage.setItem("lastAuthMethod", "email");

        setUser(data);
        setSuccess("Welcome back! Redirecting...");
        setLoading(false);
        redirectAfterLogin(data);
      }
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.error || "Login failed. Please try again.");
    }
  };

  const lastUsedGoogle =
    typeof window !== "undefined" &&
    localStorage.getItem("lastAuthMethod") === "google";

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_25%_20%,#EAFBFF_0%,transparent_28%),radial-gradient(circle_at_70%_75%,#EAE7FF_0%,transparent_30%),#f4f4f5] px-5 py-12 text-zinc-950">
      <CircuitAuthBackground />

      <div className="relative z-10 w-full max-w-[420px] overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_24px_80px_rgba(24,24,27,0.18)]">
        <div className="px-9 pb-8 pt-8">
          <div className="mb-7 text-center">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="mx-auto mb-4 flex items-center gap-2"
            >
              <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-zinc-100 ring-1 ring-zinc-200">
                <span className="absolute h-3.5 w-3.5 rounded-full border-[3px] border-zinc-900 border-r-transparent" />
                <span className="absolute right-[5px] top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-zinc-900" />
              </span>

              <span className="text-xl font-semibold tracking-[-0.035em] text-zinc-950">
                Replex Engine
              </span>
            </button>

            {/* <h1 className="text-base font-semibold text-zinc-950">
              Sign in to Replex Engine
            </h1> */}

            <p className="mt-2 text-sm leading-6 text-zinc-500">
              Welcome back! Please sign in to continue
            </p>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 overflow-hidden rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-center text-xs font-medium text-red-600"
              >
                {error}
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 overflow-hidden rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-center text-xs font-medium text-emerald-600"
              >
                {success}
              </motion.div>
            )}
          </AnimatePresence>

         <div className="relative mb-2 flex justify-center overflow-hidden">
  <GoogleLogin
    onSuccess={handleGoogleSuccess}
    onError={() => setError("Google Authentication Failed")}
    theme="outline"
    size="large"
    text="continue_with"
    shape="rectangular"
    width="340"
  />

  {lastUsedGoogle && (
    <span className="absolute -right-2 -top-3 rounded-full border border-zinc-200 bg-[#F7F7F8] px-2 py-0.5 text-[10px] font-medium text-zinc-500">
      Last used
    </span>
  )}
</div>

          {/* <button
            type="button"
            className="flex h-9 w-full items-center justify-center gap-3 rounded-lg border border-zinc-200 bg-white text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50"
          >
            <FiGithub className="text-lg text-zinc-950" />
            Continue with GitHub
          </button> */}

          <div className="my-7 flex items-center gap-4">
            <div className="h-px flex-1 bg-zinc-200" />
            <span className="text-sm text-zinc-500">or</span>
            <div className="h-px flex-1 bg-zinc-200" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="login-email"
                className="mb-2 block text-sm font-semibold text-zinc-950"
              >
                Email address
              </label>

              <input
                id="login-email"
                type="email"
                autoComplete="email"
                className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-[#6F4BFF] focus:ring-4 focus:ring-violet-100"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="mb-2 block text-sm font-semibold text-zinc-950"
              >
                Password
              </label>

              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 pr-10 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-[#6F4BFF] focus:ring-4 focus:ring-violet-100"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 transition hover:text-zinc-600"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <FaEyeSlash size={15} />
                  ) : (
                    <FaEye size={15} />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-zinc-300 text-[#6F4BFF] focus:ring-violet-100"
                />
                Remember me
              </label>

              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-sm font-semibold text-[#6F4BFF] transition hover:text-[#6242E8]"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#6F4BFF] px-4 text-sm font-semibold text-white shadow-[0_7px_18px_rgba(111,75,255,0.28)] transition hover:bg-[#6242E8] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Please wait..." : "Continue"}
              {!loading && <FiArrowRight className="text-[13px]" />}
            </button>
          </form>
        </div>

        <div className="border-t border-zinc-200 bg-[#FBFAFA] px-9 py-4 text-center text-sm text-zinc-600">
          Don&apos;t have an account?{" "}
          <button
            type="button"
            onClick={() => navigate("/register")}
            className="font-semibold text-[#6F4BFF] transition hover:text-[#6242E8]"
          >
            Sign up
          </button>
        </div>

        <div className="border-t border-zinc-200 bg-[#F7F7F8] px-9 py-4 text-center text-xs font-medium text-zinc-500">
          Secured by{" "}
          <span className="font-semibold text-zinc-700">Replex Engine</span>
        </div>
      </div>
    </div>
  );
};

const CircuitAuthBackground = () => (
  <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-70">
    <div className="absolute left-1/2 top-1/2 h-[520px] w-[1200px] -translate-x-1/2 -translate-y-1/2">
      <svg
        className="h-full w-full text-zinc-300/70"
        viewBox="0 0 1200 520"
        fill="none"
      >
        <path
          d="M40 220H270L360 310H500L590 220H720L810 310H950L1040 220H1160"
          stroke="currentColor"
        />
        <path
          d="M220 120H350L440 210H760L850 120H980"
          stroke="currentColor"
        />
        <path
          d="M260 410H420L500 330H700L780 410H940"
          stroke="currentColor"
        />
      </svg>
    </div>
  </div>
);

export default LoginPage;
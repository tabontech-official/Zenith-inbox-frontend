import React, { useContext, useState, useEffect } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { UserContext } from "../component/UserContext";
import { AnimatePresence, motion } from "framer-motion";
import AuthShell, {
  AuthCardHeader,
  AuthDivider,
  GoogleAuthButton,
  GitHubAuthButton,
  AuthPrimaryButton,
  AuthCardFooter,
  AuthSecuredBadge,
  authInputClass,
  authLabelClass,
} from "./AuthShell";

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
        navigate("/organization", { replace: true });
        return;
      }
      const nextStep =
        steps.find((s) => s.status === "skipped" || s.status === "incomplete")?.step || 1;
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
      setError(err.response?.data?.error || "Google Authentication failed.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (rememberMe) localStorage.setItem("rememberedEmail", email);
    else localStorage.removeItem("rememberedEmail");

    try {
      const response = await axios.post("https://email-syncing-backend.vercel.app/auth/signIn", {
        email,
        password,
      });

      if (response.status === 200) {
        const resData = response.data;

        if (resData.requiresTwoFactor) {
          localStorage.setItem("twoFactorUserId", resData.userId);
          setSuccess("Two-step verification required...");
          setLoading(false);
          navigate("/verify-2fa", { state: { userId: resData.userId }, replace: true });
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
    typeof window !== "undefined" && localStorage.getItem("lastAuthMethod") === "google";

  return (
    <AuthShell>
      <AuthCardHeader
        title="Sign in to Replex Engine"
        subtitle="Welcome back! Please sign in to continue"
      />

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

      <GoogleAuthButton
        onSuccess={handleGoogleSuccess}
        onError={() => setError("Google Authentication Failed")}
        showLastUsed={lastUsedGoogle}
      />
      <GitHubAuthButton />

      <AuthDivider />

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="login-email" className={authLabelClass}>
            Email address
          </label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            className={authInputClass}
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="login-password" className={authLabelClass}>
            Password
          </label>
          <div className="relative">
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              className={`${authInputClass} pr-10`}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FaEyeSlash size={15} /> : <FaEye size={15} />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/20"
            />
            Remember me
          </label>
          <button
            type="button"
            onClick={() => navigate("/forgot-password")}
            className="text-sm font-medium text-indigo-600 transition hover:text-indigo-800"
          >
            Forgot password?
          </button>
        </div>

        <AuthPrimaryButton loading={loading}>Continue</AuthPrimaryButton>
      </form>

      <AuthCardFooter
        prompt="Don't have an account?"
        linkText="Sign up"
        onLinkClick={() => navigate("/register")}
      />

      <AuthSecuredBadge />
    </AuthShell>
  );
};

export default LoginPage;

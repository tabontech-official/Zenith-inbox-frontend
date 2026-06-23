// import React, { useContext, useState, useEffect } from "react";
// import { FaEye, FaEyeSlash } from "react-icons/fa";
// import { FiMail, FiLock, FiArrowRight } from "react-icons/fi";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import { UserContext } from "../component/UserContext";
// import { motion, AnimatePresence } from "framer-motion";
// import { GoogleLogin } from "@react-oauth/google";
// import AuthVisualPanel from "./AuthVisualPanel";

// const inputClass =
//   "w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20";

// const LoginPage = () => {
//   const [showPassword, setShowPassword] = useState(false);
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [rememberMe, setRememberMe] = useState(false);
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");
//   const [loading, setLoading] = useState(false);

//   const navigate = useNavigate();
//   const { setUser } = useContext(UserContext);

//   useEffect(() => {
//     const saved = localStorage.getItem("rememberedEmail");
//     if (saved) {
//       setEmail(saved);
//       setRememberMe(true);
//     }
//   }, []);

//   const handleGoogleSuccess = async (credentialResponse) => {
//     setError("");
//     setSuccess("");
//     setLoading(true);
//     try {
//       const response = await axios.post(
//         "https://email-syncing-backend.vercel.app/auth/google-login",
//         { credential: credentialResponse.credential }
//       );

//       if (response.status === 200) {
//         const resData = response.data;
//         const { token, data } = resData;
//         const TWO_DAYS = 2 * 24 * 60 * 60 * 1000;
//         const expiryTime = Date.now() + TWO_DAYS;

//         localStorage.setItem("usertoken", token);
//         localStorage.setItem("userid", data._id);
//         localStorage.setItem("loginExpiry", expiryTime.toString());

//         setUser(data);
//         setSuccess("Welcome back! Redirecting...");
//         setLoading(false);

//         const userRole = data?.role || "user";
//         const setupCompleted = data?.setup?.setupCompleted === true;
//         const steps = data?.setup?.steps || [];

//         setTimeout(() => {
//           if (userRole === "admin") {
//             navigate("/admin/dashboard", { replace: true });
//             return;
//           }
//           if (setupCompleted) {
//             navigate("/organization", { replace: true });
//             return;
//           }
//           const nextStep =
//             steps.find((s) => s.status === "skipped" || s.status === "incomplete")?.step || 1;
//           navigate(`/setup?step=${nextStep}`, { replace: true });
//         }, 800);
//       }
//     } catch (err) {
//       setLoading(false);
//       setError(err.response?.data?.error || "Google Authentication failed.");
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     setSuccess("");
//     setLoading(true);

//     if (rememberMe) localStorage.setItem("rememberedEmail", email);
//     else localStorage.removeItem("rememberedEmail");

//     try {
//       const response = await axios.post("https://email-syncing-backend.vercel.app/auth/signIn", {
//         email,
//         password,
//       });

//       if (response.status === 200) {
//         const resData = response.data;

//         if (resData.requiresTwoFactor) {
//           localStorage.setItem("twoFactorUserId", resData.userId);
//           setSuccess("Two-step verification required...");
//           setLoading(false);
//           navigate("/verify-2fa", {
//             state: { userId: resData.userId },
//             replace: true,
//           });
//           return;
//         }

//         const { token, data } = resData;
//         const TWO_DAYS = 2 * 24 * 60 * 60 * 1000;
//         const expiryTime = Date.now() + TWO_DAYS;

//         localStorage.setItem("usertoken", token);
//         localStorage.setItem("userid", data._id);
//         localStorage.setItem("loginExpiry", expiryTime.toString());

//         setUser(data);
//         setSuccess("Welcome back! Redirecting...");
//         setLoading(false);

//         const userRole = data?.role || "user";
//         const setupCompleted = data?.setup?.setupCompleted === true;
//         const steps = data?.setup?.steps || [];

//         setTimeout(() => {
//           if (userRole === "admin") {
//             navigate("/admin/dashboard", { replace: true });
//             return;
//           }
//           if (setupCompleted) {
//             navigate("/organization", { replace: true });
//             return;
//           }
//           const nextStep =
//             steps.find((s) => s.status === "skipped" || s.status === "incomplete")?.step || 1;
//           navigate(`/setup?step=${nextStep}`, { replace: true });
//         }, 800);
//       }
//     } catch (err) {
//       setLoading(false);
//       setError(err.response?.data?.error || "Login failed. Please try again.");
//     }
//   };

//   return (
//     <div className="min-h-screen bg-[#F8FAFC] font-['Inter',ui-sans-serif,system-ui] antialiased selection:bg-indigo-100 lg:h-screen lg:overflow-hidden lg:grid lg:grid-cols-2">
//       {/* Mobile background glow */}
//       <div className="pointer-events-none fixed inset-0 -z-10 lg:hidden">
//         <div className="absolute left-1/2 top-0 h-56 w-56 -translate-x-1/2 rounded-full bg-indigo-200/40 blur-[90px]" />
//       </div>

//       {/* Form column */}
//       <div className="relative flex min-h-screen flex-col lg:h-full lg:min-h-0 lg:overflow-hidden">
//         {/* Logo — fixed top-left on desktop */}
//         <button
//           onClick={() => navigate("/")}
//           className="absolute left-5 top-5 z-10 flex items-center gap-2 sm:left-8 sm:top-6"
//           aria-label="Go to homepage"
//         >
//           <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-md shadow-indigo-600/20">
//             <FiMail size={15} />
//           </span>
//           <span className="text-sm font-bold tracking-tight text-slate-900">Replex Engine</span>
//         </button>

//         <div className="flex flex-1 items-center justify-center px-5 py-16 sm:px-8 lg:px-10 lg:py-0">
//           <motion.div
//             initial={{ opacity: 0, y: 12 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.45, ease: "easeOut" }}
//             className="w-full max-w-[400px]"
//           >
//             <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.07)] sm:p-7">
//               <div className="mb-5">
//                 <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
//                   Welcome back
//                 </h1>
//                 <p className="mt-1 text-[13px] leading-relaxed text-slate-500">
//                   Sign in to manage your lead automation workflows.
//                 </p>
//               </div>

//               <AnimatePresence mode="wait">
//                 {error && (
//                   <motion.div
//                     key="error"
//                     initial={{ opacity: 0, height: 0 }}
//                     animate={{ opacity: 1, height: "auto" }}
//                     exit={{ opacity: 0, height: 0 }}
//                     className="mb-3 overflow-hidden rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-center text-xs font-medium text-red-600"
//                   >
//                     {error}
//                   </motion.div>
//                 )}
//                 {success && (
//                   <motion.div
//                     key="success"
//                     initial={{ opacity: 0, height: 0 }}
//                     animate={{ opacity: 1, height: "auto" }}
//                     exit={{ opacity: 0, height: 0 }}
//                     className="mb-3 overflow-hidden rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-center text-xs font-medium text-emerald-600"
//                   >
//                     {success}
//                   </motion.div>
//                 )}
//               </AnimatePresence>

//               <div className="mb-3 flex justify-center overflow-hidden">
//                 <GoogleLogin
//                   onSuccess={handleGoogleSuccess}
//                   onError={() => setError("Google Authentication Failed")}
//                   theme="outline"
//                   size="large"
//                   text="continue_with"
//                   shape="rectangular"
//                   width="340"
//                 />
//               </div>

//               <div className="mb-3 flex items-center">
//                 <div className="flex-1 border-t border-slate-200" />
//                 <span className="px-2.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
//                   or email
//                 </span>
//                 <div className="flex-1 border-t border-slate-200" />
//               </div>

//               <form onSubmit={handleSubmit} className="space-y-3">
//                 <div>
//                   <label htmlFor="login-email" className="mb-1 block text-xs font-medium text-slate-700">
//                     Email address
//                   </label>
//                   <div className="group relative">
//                     <FiMail
//                       className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 transition group-focus-within:text-indigo-500"
//                       size={15}
//                     />
//                     <input
//                       id="login-email"
//                       type="email"
//                       autoComplete="email"
//                       className={inputClass}
//                       placeholder="name@company.com"
//                       value={email}
//                       onChange={(e) => setEmail(e.target.value)}
//                       required
//                     />
//                   </div>
//                 </div>

//                 <div>
//                   <label htmlFor="login-password" className="mb-1 block text-xs font-medium text-slate-700">
//                     Password
//                   </label>
//                   <div className="group relative">
//                     <FiLock
//                       className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 transition group-focus-within:text-indigo-500"
//                       size={15}
//                     />
//                     <input
//                       id="login-password"
//                       type={showPassword ? "text" : "password"}
//                       autoComplete="current-password"
//                       className={`${inputClass} pr-9`}
//                       placeholder="••••••••"
//                       value={password}
//                       onChange={(e) => setPassword(e.target.value)}
//                       required
//                     />
//                     <button
//                       type="button"
//                       className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-indigo-600"
//                       onClick={() => setShowPassword(!showPassword)}
//                       aria-label={showPassword ? "Hide password" : "Show password"}
//                     >
//                       {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
//                     </button>
//                   </div>
//                 </div>

//                 <div className="flex items-center justify-between">
//                   <label className="flex cursor-pointer items-center gap-1.5 text-xs text-slate-600">
//                     <input
//                       type="checkbox"
//                       checked={rememberMe}
//                       onChange={(e) => setRememberMe(e.target.checked)}
//                       className="h-3.5 w-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/20"
//                     />
//                     Remember me
//                   </label>
//                   <button
//                     type="button"
//                     onClick={() => navigate("/forgot-password")}
//                     className="text-xs font-semibold text-indigo-600 transition hover:text-indigo-800"
//                   >
//                     Forgot password?
//                   </button>
//                 </div>

//                 <button
//                   type="submit"
//                   disabled={loading}
//                   className={`flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white shadow-md transition ${
//                     loading
//                       ? "cursor-not-allowed bg-indigo-400 shadow-none"
//                       : "bg-indigo-600 shadow-indigo-600/20 hover:bg-indigo-700"
//                   }`}
//                 >
//                   {loading ? (
//                     <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
//                   ) : (
//                     <>
//                       Sign In
//                       <FiArrowRight size={15} />
//                     </>
//                   )}
//                 </button>
//               </form>

//               <p className="mt-4 text-center text-xs text-slate-500">
//                 Don&apos;t have an account?{" "}
//                 <button
//                   type="button"
//                   onClick={() => navigate("/register")}
//                   className="font-semibold text-indigo-600 transition hover:text-indigo-800"
//                 >
//                   Create account
//                 </button>
//               </p>
//             </div>
//           </motion.div>
//         </div>
//       </div>

//       <AuthVisualPanel
//         headline="Automate every lead reply from one dashboard"
//         subheadline="Capture inbound leads, send instant replies, and track follow-ups automatically."
//         benefits={[
//           "Track leads in real time",
//           "Automate replies instantly",
//           "Manage follow-ups at scale",
//         ]}
//       />
//     </div>
//   );
// };

// export default LoginPage;
// import React, { useContext, useState, useEffect } from "react";
// import { FaEye, FaEyeSlash } from "react-icons/fa";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import { UserContext } from "../component/UserContext";
// import { AnimatePresence, motion } from "framer-motion";
// import AuthShell, {
//   AuthCardHeader,
//   AuthDivider,
//   GoogleAuthButton,
//   GitHubAuthButton,
//   AuthPrimaryButton,
//   AuthCardFooter,
//   AuthSecuredBadge,
//   authInputClass,
//   authLabelClass,
// } from "./AuthShell";

// const LoginPage = () => {
//   const [showPassword, setShowPassword] = useState(false);
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [rememberMe, setRememberMe] = useState(false);
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");
//   const [loading, setLoading] = useState(false);

//   const navigate = useNavigate();
//   const { setUser } = useContext(UserContext);

//   useEffect(() => {
//     const saved = localStorage.getItem("rememberedEmail");
//     if (saved) {
//       setEmail(saved);
//       setRememberMe(true);
//     }
//   }, []);

//   const redirectAfterLogin = (data) => {
//     const userRole = data?.role || "user";
//     const setupCompleted = data?.setup?.setupCompleted === true;
//     const steps = data?.setup?.steps || [];

//     setTimeout(() => {
//       if (userRole === "admin") {
//         navigate("/admin/dashboard", { replace: true });
//         return;
//       }
//       if (setupCompleted) {
//         navigate("/organization", { replace: true });
//         return;
//       }
//       const nextStep =
//         steps.find((s) => s.status === "skipped" || s.status === "incomplete")?.step || 1;
//       navigate(`/setup?step=${nextStep}`, { replace: true });
//     }, 800);
//   };

//   const handleGoogleSuccess = async (credentialResponse) => {
//     setError("");
//     setSuccess("");
//     setLoading(true);
//     try {
//       const response = await axios.post(
//         "https://email-syncing-backend.vercel.app/auth/google-login",
//         { credential: credentialResponse.credential }
//       );

//       if (response.status === 200) {
//         const { token, data } = response.data;
//         const TWO_DAYS = 2 * 24 * 60 * 60 * 1000;
//         localStorage.setItem("usertoken", token);
//         localStorage.setItem("userid", data._id);
//         localStorage.setItem("loginExpiry", (Date.now() + TWO_DAYS).toString());
//         localStorage.setItem("lastAuthMethod", "google");

//         setUser(data);
//         setSuccess("Welcome back! Redirecting...");
//         setLoading(false);
//         redirectAfterLogin(data);
//       }
//     } catch (err) {
//       setLoading(false);
//       setError(err.response?.data?.error || "Google Authentication failed.");
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     setSuccess("");
//     setLoading(true);

//     if (rememberMe) localStorage.setItem("rememberedEmail", email);
//     else localStorage.removeItem("rememberedEmail");

//     try {
//       const response = await axios.post("https://email-syncing-backend.vercel.app/auth/signIn", {
//         email,
//         password,
//       });

//       if (response.status === 200) {
//         const resData = response.data;

//         if (resData.requiresTwoFactor) {
//           localStorage.setItem("twoFactorUserId", resData.userId);
//           setSuccess("Two-step verification required...");
//           setLoading(false);
//           navigate("/verify-2fa", { state: { userId: resData.userId }, replace: true });
//           return;
//         }

//         const { token, data } = resData;
//         const TWO_DAYS = 2 * 24 * 60 * 60 * 1000;
//         localStorage.setItem("usertoken", token);
//         localStorage.setItem("userid", data._id);
//         localStorage.setItem("loginExpiry", (Date.now() + TWO_DAYS).toString());
//         localStorage.setItem("lastAuthMethod", "email");

//         setUser(data);
//         setSuccess("Welcome back! Redirecting...");
//         setLoading(false);
//         redirectAfterLogin(data);
//       }
//     } catch (err) {
//       setLoading(false);
//       setError(err.response?.data?.error || "Login failed. Please try again.");
//     }
//   };

//   const lastUsedGoogle =
//     typeof window !== "undefined" && localStorage.getItem("lastAuthMethod") === "google";

//   return (
//     <AuthShell>
//       <AuthCardHeader
//         title="Sign in to Replex Engine"
//         subtitle="Welcome back! Please sign in to continue"
//       />

//       <AnimatePresence mode="wait">
//         {error && (
//           <motion.div
//             initial={{ opacity: 0, height: 0 }}
//             animate={{ opacity: 1, height: "auto" }}
//             exit={{ opacity: 0, height: 0 }}
//             className="mb-4 overflow-hidden rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-center text-xs font-medium text-red-600"
//           >
//             {error}
//           </motion.div>
//         )}
//         {success && (
//           <motion.div
//             initial={{ opacity: 0, height: 0 }}
//             animate={{ opacity: 1, height: "auto" }}
//             exit={{ opacity: 0, height: 0 }}
//             className="mb-4 overflow-hidden rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-center text-xs font-medium text-emerald-600"
//           >
//             {success}
//           </motion.div>
//         )}
//       </AnimatePresence>

//       <GoogleAuthButton
//         onSuccess={handleGoogleSuccess}
//         onError={() => setError("Google Authentication Failed")}
//         showLastUsed={lastUsedGoogle}
//       />
//       <GitHubAuthButton />

//       <AuthDivider />

//       <form onSubmit={handleSubmit} className="space-y-4">
//         <div>
//           <label htmlFor="login-email" className={authLabelClass}>
//             Email address
//           </label>
//           <input
//             id="login-email"
//             type="email"
//             autoComplete="email"
//             className={authInputClass}
//             placeholder="Enter your email address"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             required
//           />
//         </div>

//         <div>
//           <label htmlFor="login-password" className={authLabelClass}>
//             Password
//           </label>
//           <div className="relative">
//             <input
//               id="login-password"
//               type={showPassword ? "text" : "password"}
//               autoComplete="current-password"
//               className={`${authInputClass} pr-10`}
//               placeholder="Enter your password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               required
//             />
//             <button
//               type="button"
//               className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
//               onClick={() => setShowPassword(!showPassword)}
//               aria-label={showPassword ? "Hide password" : "Show password"}
//             >
//               {showPassword ? <FaEyeSlash size={15} /> : <FaEye size={15} />}
//             </button>
//           </div>
//         </div>

//         <div className="flex items-center justify-between">
//           <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
//             <input
//               type="checkbox"
//               checked={rememberMe}
//               onChange={(e) => setRememberMe(e.target.checked)}
//               className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/20"
//             />
//             Remember me
//           </label>
//           <button
//             type="button"
//             onClick={() => navigate("/forgot-password")}
//             className="text-sm font-medium text-indigo-600 transition hover:text-indigo-800"
//           >
//             Forgot password?
//           </button>
//         </div>

//         <AuthPrimaryButton loading={loading}>Continue</AuthPrimaryButton>
//       </form>

//       <AuthCardFooter
//         prompt="Don't have an account?"
//         linkText="Sign up"
//         onLinkClick={() => navigate("/register")}
//       />

//       <AuthSecuredBadge />
//     </AuthShell>
//   );
// };

// export default LoginPage;
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
        navigate("/organization", { replace: true });
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

            <h1 className="text-base font-semibold text-zinc-950">
              Sign in to Replex Engine
            </h1>

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
          <span className="font-semibold text-zinc-700">Replex</span>
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
// import React, { useState, useEffect } from "react";
// import { FaEye, FaEyeSlash } from "react-icons/fa";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import { AnimatePresence, motion } from "framer-motion";
// import AuthShell, {
//   AuthBackground,
//   AuthPageFooter,
//   AuthCardHeader,
//   AuthDivider,
//   GoogleAuthButton,
//   GitHubAuthButton,
//   AuthPrimaryButton,
//   AuthCardFooter,
//   AuthSecuredBadge,
//   authInputClass,
//   authSelectClass,
//   authLabelClass,
// } from "./AuthShell";

// const COUNTRIES = [
//   "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo (Congo-Brazzaville)", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czechia (Czech Republic)", "Democratic Republic of the Congo", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar (formerly Burma)", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Palestine State", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States of America", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe",
// ];

// const RegisterPage = () => {
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//   const [fullName, setFullName] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [country, setCountry] = useState("");
//   const [website, setWebsite] = useState("");
//   const [acceptedTerms, setAcceptedTerms] = useState(false);
//   const [alert, setAlert] = useState({ type: "", message: "" });
//   const [loading, setLoading] = useState(false);

//   const navigate = useNavigate();

//   useEffect(() => {
//     if (alert.message) {
//       const timer = setTimeout(() => setAlert({ type: "", message: "" }), 5000);
//       return () => clearTimeout(timer);
//     }
//   }, [alert]);

//   const handleGoogleSuccess = async (credentialResponse) => {
//     setAlert({ type: "", message: "" });
//     setLoading(true);
//     try {
//       const response = await axios.post(
//         "https://email-syncing-backend.vercel.app/auth/google-login",
//         { credential: credentialResponse.credential }
//       );

//       if (response.status === 200) {
//         localStorage.setItem("lastAuthMethod", "google");
//         setAlert({ type: "success", message: "Google signup successful! Redirecting..." });

//         const { token, data } = response.data;
//         const TWO_DAYS = 2 * 24 * 60 * 60 * 1000;
//         localStorage.setItem("usertoken", token);
//         localStorage.setItem("userid", data._id);
//         localStorage.setItem("loginExpiry", (Date.now() + TWO_DAYS).toString());

//         setTimeout(() => navigate("/setup?step=1"), 1200);
//       }
//     } catch (err) {
//       setLoading(false);
//       setAlert({
//         type: "error",
//         message: err.response?.data?.error || "Google Authentication failed.",
//       });
//     }
//   };

//   const normalizeWebsite = (url) => {
//     if (!url) return "";
//     const trimmedUrl = url.trim();
//     if (trimmedUrl.startsWith("http://") || trimmedUrl.startsWith("https://")) return trimmedUrl;
//     return `https://${trimmedUrl}`;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (password !== confirmPassword) {
//       setAlert({ type: "error", message: "Passwords do not match." });
//       return;
//     }
//     if (!acceptedTerms) {
//       setAlert({ type: "error", message: "Please accept the Terms and Privacy Policy." });
//       return;
//     }

//     setLoading(true);
//     try {
//       const response = await axios.post("https://email-syncing-backend.vercel.app/auth/signUp", {
//         fullName,
//         email,
//         password,
//         country,
//         website: normalizeWebsite(website),
//       });

//       if (response.status === 200) {
//         localStorage.setItem("lastAuthMethod", "email");
//         setAlert({
//           type: "success",
//           message: "Account created successfully! Redirecting to login...",
//         });
//         setTimeout(() => navigate("/login"), 1500);
//       }
//     } catch (err) {
//       setAlert({
//         type: "error",
//         message: err.response?.data?.error || "Signup failed. Please try again.",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const lastUsedGoogle =
//     typeof window !== "undefined" && localStorage.getItem("lastAuthMethod") === "google";

//   return (
//     <div className="flex min-h-screen flex-col font-['Inter',ui-sans-serif,system-ui] antialiased">
//       <AuthBackground />

//       <div className="flex flex-1 items-start justify-center overflow-y-auto px-4 py-8 sm:items-center">
//         <div className="my-auto w-full max-w-[420px] rounded-2xl border border-slate-200/80 bg-white px-8 py-8 shadow-[0_4px_24px_rgba(0,0,0,0.06)] sm:px-10">
//           <AuthCardHeader
//             title="Create your Replex Engine account"
//             subtitle="Start automating lead replies and follow-ups in minutes"
//           />

//           <AnimatePresence mode="wait">
//             {alert.message && (
//               <motion.div
//                 initial={{ opacity: 0, height: 0 }}
//                 animate={{ opacity: 1, height: "auto" }}
//                 exit={{ opacity: 0, height: 0 }}
//                 className={`mb-4 overflow-hidden rounded-lg border px-3 py-2 text-center text-xs font-medium ${
//                   alert.type === "success"
//                     ? "border-emerald-100 bg-emerald-50 text-emerald-600"
//                     : "border-red-100 bg-red-50 text-red-600"
//                 }`}
//               >
//                 {alert.message}
//               </motion.div>
//             )}
//           </AnimatePresence>

//           <GoogleAuthButton
//             onSuccess={handleGoogleSuccess}
//             onError={() => setAlert({ type: "error", message: "Google Signup Failed" })}
//             text="signup_with"
//             showLastUsed={lastUsedGoogle}
//           />
//           <GitHubAuthButton />

//           <AuthDivider />

//           <form onSubmit={handleSubmit} className="space-y-3.5">
//             <div>
//               <label htmlFor="register-name" className={authLabelClass}>
//                 Full name
//               </label>
//               <input
//                 id="register-name"
//                 type="text"
//                 autoComplete="name"
//                 className={authInputClass}
//                 placeholder="Enter your full name"
//                 value={fullName}
//                 onChange={(e) => setFullName(e.target.value)}
//                 required
//               />
//             </div>

//             <div>
//               <label htmlFor="register-email" className={authLabelClass}>
//                 Email address
//               </label>
//               <input
//                 id="register-email"
//                 type="email"
//                 autoComplete="email"
//                 className={authInputClass}
//                 placeholder="Enter your email address"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 required
//               />
//             </div>

//             <div className="grid grid-cols-2 gap-3">
//               <div>
//                 <label htmlFor="register-country" className={authLabelClass}>
//                   Country
//                 </label>
//                 <div className="relative">
//                   <select
//                     id="register-country"
//                     value={country}
//                     onChange={(e) => setCountry(e.target.value)}
//                     className={authSelectClass}
//                     required
//                   >
//                     <option value="">Select</option>
//                     {COUNTRIES.map((c) => (
//                       <option key={c} value={c}>
//                         {c}
//                       </option>
//                     ))}
//                   </select>
//                   <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400">
//                     <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
//                     </svg>
//                   </div>
//                 </div>
//               </div>

//               <div>
//                 <label htmlFor="register-website" className={authLabelClass}>
//                   Website <span className="font-normal text-slate-400">(optional)</span>
//                 </label>
//                 <input
//                   id="register-website"
//                   type="text"
//                   autoComplete="url"
//                   className={authInputClass}
//                   placeholder="yoursite.com"
//                   value={website}
//                   onChange={(e) => setWebsite(e.target.value)}
//                 />
//               </div>
//             </div>

//             <div>
//               <label htmlFor="register-password" className={authLabelClass}>
//                 Password
//               </label>
//               <div className="relative">
//                 <input
//                   id="register-password"
//                   type={showPassword ? "text" : "password"}
//                   autoComplete="new-password"
//                   className={`${authInputClass} pr-10`}
//                   placeholder="Create a password"
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   required
//                   minLength={6}
//                 />
//                 <button
//                   type="button"
//                   className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
//                   onClick={() => setShowPassword(!showPassword)}
//                   aria-label={showPassword ? "Hide password" : "Show password"}
//                 >
//                   {showPassword ? <FaEyeSlash size={15} /> : <FaEye size={15} />}
//                 </button>
//               </div>
//             </div>

//             <div>
//               <label htmlFor="register-confirm-password" className={authLabelClass}>
//                 Confirm password
//               </label>
//               <div className="relative">
//                 <input
//                   id="register-confirm-password"
//                   type={showConfirmPassword ? "text" : "password"}
//                   autoComplete="new-password"
//                   className={`${authInputClass} pr-10`}
//                   placeholder="Confirm your password"
//                   value={confirmPassword}
//                   onChange={(e) => setConfirmPassword(e.target.value)}
//                   required
//                   minLength={6}
//                 />
//                 <button
//                   type="button"
//                   className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
//                   onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//                   aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
//                 >
//                   {showConfirmPassword ? <FaEyeSlash size={15} /> : <FaEye size={15} />}
//                 </button>
//               </div>
//             </div>

//             <label className="flex cursor-pointer items-start gap-2 text-xs leading-relaxed text-slate-600">
//               <input
//                 type="checkbox"
//                 checked={acceptedTerms}
//                 onChange={(e) => setAcceptedTerms(e.target.checked)}
//                 className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/20"
//                 required
//               />
//               <span>
//                 I agree to the{" "}
//                 <button
//                   type="button"
//                   onClick={() => navigate("/terms")}
//                   className="font-semibold text-indigo-600 hover:text-indigo-800"
//                 >
//                   Terms
//                 </button>{" "}
//                 and{" "}
//                 <button
//                   type="button"
//                   onClick={() => navigate("/privacy-policy")}
//                   className="font-semibold text-indigo-600 hover:text-indigo-800"
//                 >
//                   Privacy Policy
//                 </button>
//               </span>
//             </label>

//             <AuthPrimaryButton loading={loading}>Create Account</AuthPrimaryButton>
//           </form>

//           <AuthCardFooter
//             prompt="Already have an account?"
//             linkText="Sign in"
//             onLinkClick={() => navigate("/login")}
//           />

//           <AuthSecuredBadge />
//         </div>
//       </div>

//       <AuthPageFooter />
//     </div>
//   );
// };

// export default RegisterPage;
import React, { useState, useEffect } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { FiGithub, FiArrowRight } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";

const COUNTRIES = [
  "Afghanistan",
  "Albania",
  "Algeria",
  "Andorra",
  "Angola",
  "Argentina",
  "Australia",
  "Austria",
  "Azerbaijan",
  "Bahrain",
  "Bangladesh",
  "Belgium",
  "Brazil",
  "Canada",
  "China",
  "Denmark",
  "Egypt",
  "France",
  "Germany",
  "India",
  "Indonesia",
  "Ireland",
  "Italy",
  "Japan",
  "Malaysia",
  "Netherlands",
  "New Zealand",
  "Nigeria",
  "Norway",
  "Pakistan",
  "Philippines",
  "Qatar",
  "Saudi Arabia",
  "Singapore",
  "South Africa",
  "Spain",
  "Sweden",
  "Switzerland",
  "Thailand",
  "Turkey",
  "United Arab Emirates",
  "United Kingdom",
  "United States of America",
  "Vietnam",
];

const inputClass =
  "h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-[#6F4BFF] focus:ring-4 focus:ring-violet-100";

const labelClass = "mb-2 block text-sm font-semibold text-zinc-950";

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [country, setCountry] = useState("");
  const [website, setWebsite] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (!alert.message) return;
    const timer = setTimeout(() => setAlert({ type: "", message: "" }), 5000);
    return () => clearTimeout(timer);
  }, [alert]);

  const normalizeWebsite = (url) => {
    if (!url) return "";
    const trimmedUrl = url.trim();
    if (trimmedUrl.startsWith("http://") || trimmedUrl.startsWith("https://")) {
      return trimmedUrl;
    }
    return `https://${trimmedUrl}`;
  };

  const handleGoogleClick = () => {
    setAlert({
      type: "error",
      message:
        "Google signup UI is ready, but Google OAuth SDK is not connected in this single-file version.",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setAlert({ type: "error", message: "Passwords do not match." });
      return;
    }

    if (!acceptedTerms) {
      setAlert({
        type: "error",
        message: "Please accept the Terms and Privacy Policy.",
      });
      return;
    }

    setLoading(true);
    setAlert({ type: "", message: "" });

    try {
      const response = await axios.post(
        "https://email-syncing-backend.vercel.app/auth/signUp",
        {
          fullName,
          email,
          password,
          country,
          website: normalizeWebsite(website),
        },
      );

      if (response.status === 200) {
        localStorage.setItem("lastAuthMethod", "email");
        setAlert({
          type: "success",
          message: "Account created successfully! Redirecting to login...",
        });

        setTimeout(() => navigate("/login"), 1500);
      }
    } catch (err) {
      setAlert({
        type: "error",
        message:
          err.response?.data?.error || "Signup failed. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const lastUsedGoogle =
    typeof window !== "undefined" &&
    localStorage.getItem("lastAuthMethod") === "google";
  const testimonials = [
    {
      text: "Replex Engine helps teams respond faster, automate follow-ups, and stop losing leads.",
      name: "Replex Customer",
      role: "Growth Team",
    },
    {
      text: "We reduced lead response time from hours to seconds using Replex workflows.",
      name: "Marketing Lead",
      role: "SaaS Company",
    },
    {
      text: "Our sales team now focuses on closing deals instead of chasing leads.",
      name: "Sales Director",
      role: "Tech Startup",
    },
  ];
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-screen overflow-hidden bg-[#f4f4f5] text-zinc-950">
      <style>{`
  @keyframes flowLine {
    from { stroke-dashoffset: 180; }
    to { stroke-dashoffset: 0; }
  }

  .circuit-glow {
    stroke: #6F4BFF;
    stroke-width: 2;
    fill: none;
    stroke-dasharray: 24 160;
    animation: flowLine 2.8s linear infinite;
    filter: drop-shadow(0 0 6px #6F4BFF);
  }
`}</style>
      <CircuitAuthBackground />

      <div className="grid h-full lg:grid-cols-[1.05fr_1fr]">
        {/* LEFT SIDE */}
        <div className="relative flex h-full items-start justify-center bg-[#FBFAFA] px-5 pt-16 [clip-path:polygon(0_0,92%_0,100%_8%,100%_100%,0_100%)] lg:pt-20">
          {" "}
          <div className="relative z-10 w-full max-w-[430px] overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_28px_90px_rgba(24,24,27,0.20)]">
            <div className="px-8 py-7">
              <div className="mb-6 text-center">
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
                    Replex
                  </span>
                </button>

                <h1 className="text-base font-semibold text-zinc-950">
                  Create your account
                </h1>

                <p className="mt-2 text-sm text-zinc-500">
                  No credit card required.
                </p>
              </div>

              <AnimatePresence mode="wait">
                {alert.message && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className={`mb-4 overflow-hidden rounded-lg border px-3 py-2 text-center text-xs font-medium ${
                      alert.type === "success"
                        ? "border-emerald-100 bg-emerald-50 text-emerald-600"
                        : "border-red-100 bg-red-50 text-red-600"
                    }`}
                  >
                    {alert.message}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  className="flex h-9 items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50"
                >
                  <FiGithub className="text-lg text-zinc-950" />
                  GitHub
                </button>

                <button
                  type="button"
                  onClick={handleGoogleClick}
                  className="flex h-9 items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50"
                >
                  <FcGoogle className="text-lg" />
                  Google
                </button>
              </div>

              <div className="my-6 flex items-center gap-4">
                <div className="h-px flex-1 bg-zinc-200" />
                <span className="text-sm text-zinc-500">or</span>
                <div className="h-px flex-1 bg-zinc-200" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className={labelClass}>Full name</label>
                  <input
                    className={inputClass}
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className={labelClass}>Email address</label>
                  <input
                    type="email"
                    className={inputClass}
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <PasswordField
                  id="register-password"
                  label="Password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  show={showPassword}
                  setShow={setShowPassword}
                />

                <PasswordField
                  id="register-confirm-password"
                  label="Confirm password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  show={showConfirmPassword}
                  setShow={setShowConfirmPassword}
                />

                <label className="flex cursor-pointer items-start gap-2 text-xs leading-relaxed text-zinc-600">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded border-zinc-300 text-[#6F4BFF] focus:ring-violet-100"
                    required
                  />
                  <span>
                    I agree to the{" "}
                    <button
                      type="button"
                      onClick={() => navigate("/terms")}
                      className="font-semibold text-[#6F4BFF]"
                    >
                      Terms
                    </button>{" "}
                    and{" "}
                    <button
                      type="button"
                      onClick={() => navigate("/privacy-policy")}
                      className="font-semibold text-[#6F4BFF]"
                    >
                      Privacy Policy
                    </button>
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#6F4BFF] px-4 text-sm font-semibold text-white shadow-[0_7px_18px_rgba(111,75,255,0.28)] transition hover:bg-[#6242E8] disabled:opacity-70"
                >
                  {loading ? "Please wait..." : "Continue"}
                  {!loading && <FiArrowRight className="text-[13px]" />}
                </button>
              </form>
            </div>

            <div className="border-t border-zinc-200 bg-[#FBFAFA] px-9 py-4 text-center text-sm text-zinc-600">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="font-semibold text-[#6F4BFF] hover:text-[#6242E8]"
              >
                Sign in
              </button>
            </div>

            <div className="border-t border-zinc-200 bg-[#F7F7F8] px-9 py-4 text-center text-xs font-medium text-zinc-500">
              Secured by{" "}
              <span className="font-semibold text-zinc-700">Replex</span>
            </div>
          </div>
          <p className="absolute bottom-8 left-10 text-sm text-zinc-500">
            © 2026 Replex Engine
          </p>
        </div>

        {/* RIGHT SIDE */}
        <div className="relative hidden items-center justify-center px-16 lg:flex">
          {" "}
          <div className="max-w-md">
            <div className="mb-5 text-5xl font-bold leading-none text-zinc-300">
              “
            </div>

            <motion.h2
              key={activeIndex}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="text-3xl font-semibold leading-tight tracking-[-0.045em] text-zinc-950"
            >
              {testimonials[activeIndex].text}
            </motion.h2>

            <div className="mt-8 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#6F4BFF] text-sm font-bold text-white">
                R
              </div>

              <div>
                <p className="text-sm font-semibold text-zinc-950">
                  {testimonials[activeIndex].name}
                </p>
                <p className="text-sm text-zinc-500">
                  {testimonials[activeIndex].role}
                </p>
              </div>
            </div>
          </div>
          <div className="absolute bottom-8 right-10 flex gap-4 text-sm text-zinc-500">
            <button>Support</button>
            <button>Privacy</button>
            <button>Terms</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const PasswordField = ({
  id,
  label,
  placeholder,
  value,
  onChange,
  show,
  setShow,
}) => (
  <div>
    <label htmlFor={id} className={labelClass}>
      {label}
    </label>

    <div className="relative">
      <input
        id={id}
        type={show ? "text" : "password"}
        autoComplete="new-password"
        className={`${inputClass} pr-10`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required
        minLength={6}
      />

      <button
        type="button"
        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 transition hover:text-zinc-600"
        onClick={() => setShow(!show)}
        aria-label={show ? `Hide ${label}` : `Show ${label}`}
      >
        {show ? <FaEyeSlash size={15} /> : <FaEye size={15} />}
      </button>
    </div>
  </div>
);

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
        <path d="M220 120H350L440 210H760L850 120H980" stroke="currentColor" />
        <path d="M260 410H420L500 330H700L780 410H940" stroke="currentColor" />
      </svg>
      <path d="M40 220H270L360 310H500" className="circuit-glow" />

      <path
        d="M220 120H350L440 210H760"
        className="circuit-glow"
        style={{ animationDelay: "0.9s" }}
      />

      <path
        d="M260 410H420L500 330H700"
        className="circuit-glow"
        style={{ animationDelay: "1.8s" }}
      />
    </div>
  </div>
);

export default RegisterPage;

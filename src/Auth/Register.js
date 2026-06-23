import React, { useState, useEffect } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import AuthShell, {
  AuthBackground,
  AuthPageFooter,
  AuthCardHeader,
  AuthDivider,
  GoogleAuthButton,
  GitHubAuthButton,
  AuthPrimaryButton,
  AuthCardFooter,
  AuthSecuredBadge,
  authInputClass,
  authSelectClass,
  authLabelClass,
} from "./AuthShell";

const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo (Congo-Brazzaville)", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czechia (Czech Republic)", "Democratic Republic of the Congo", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar (formerly Burma)", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Palestine State", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States of America", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe",
];

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
    if (alert.message) {
      const timer = setTimeout(() => setAlert({ type: "", message: "" }), 5000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  const handleGoogleSuccess = async (credentialResponse) => {
    setAlert({ type: "", message: "" });
    setLoading(true);
    try {
      const response = await axios.post(
        "https://email-syncing-backend.vercel.app/auth/google-login",
        { credential: credentialResponse.credential }
      );

      if (response.status === 200) {
        localStorage.setItem("lastAuthMethod", "google");
        setAlert({ type: "success", message: "Google signup successful! Redirecting..." });

        const { token, data } = response.data;
        const TWO_DAYS = 2 * 24 * 60 * 60 * 1000;
        localStorage.setItem("usertoken", token);
        localStorage.setItem("userid", data._id);
        localStorage.setItem("loginExpiry", (Date.now() + TWO_DAYS).toString());

        setTimeout(() => navigate("/setup?step=1"), 1200);
      }
    } catch (err) {
      setLoading(false);
      setAlert({
        type: "error",
        message: err.response?.data?.error || "Google Authentication failed.",
      });
    }
  };

  const normalizeWebsite = (url) => {
    if (!url) return "";
    const trimmedUrl = url.trim();
    if (trimmedUrl.startsWith("http://") || trimmedUrl.startsWith("https://")) return trimmedUrl;
    return `https://${trimmedUrl}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setAlert({ type: "error", message: "Passwords do not match." });
      return;
    }
    if (!acceptedTerms) {
      setAlert({ type: "error", message: "Please accept the Terms and Privacy Policy." });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post("https://email-syncing-backend.vercel.app/auth/signUp", {
        fullName,
        email,
        password,
        country,
        website: normalizeWebsite(website),
      });

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
        message: err.response?.data?.error || "Signup failed. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const lastUsedGoogle =
    typeof window !== "undefined" && localStorage.getItem("lastAuthMethod") === "google";

  return (
    <div className="flex min-h-screen flex-col font-['Inter',ui-sans-serif,system-ui] antialiased">
      <AuthBackground />

      <div className="flex flex-1 items-start justify-center overflow-y-auto px-4 py-8 sm:items-center">
        <div className="my-auto w-full max-w-[420px] rounded-2xl border border-slate-200/80 bg-white px-8 py-8 shadow-[0_4px_24px_rgba(0,0,0,0.06)] sm:px-10">
          <AuthCardHeader
            title="Create your Replex Engine account"
            subtitle="Start automating lead replies and follow-ups in minutes"
          />

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

          <GoogleAuthButton
            onSuccess={handleGoogleSuccess}
            onError={() => setAlert({ type: "error", message: "Google Signup Failed" })}
            text="signup_with"
            showLastUsed={lastUsedGoogle}
          />
          <GitHubAuthButton />

          <AuthDivider />

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label htmlFor="register-name" className={authLabelClass}>
                Full name
              </label>
              <input
                id="register-name"
                type="text"
                autoComplete="name"
                className={authInputClass}
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="register-email" className={authLabelClass}>
                Email address
              </label>
              <input
                id="register-email"
                type="email"
                autoComplete="email"
                className={authInputClass}
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="register-country" className={authLabelClass}>
                  Country
                </label>
                <div className="relative">
                  <select
                    id="register-country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className={authSelectClass}
                    required
                  >
                    <option value="">Select</option>
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400">
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="register-website" className={authLabelClass}>
                  Website <span className="font-normal text-slate-400">(optional)</span>
                </label>
                <input
                  id="register-website"
                  type="text"
                  autoComplete="url"
                  className={authInputClass}
                  placeholder="yoursite.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="register-password" className={authLabelClass}>
                Password
              </label>
              <div className="relative">
                <input
                  id="register-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  className={`${authInputClass} pr-10`}
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
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

            <div>
              <label htmlFor="register-confirm-password" className={authLabelClass}>
                Confirm password
              </label>
              <div className="relative">
                <input
                  id="register-confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  className={`${authInputClass} pr-10`}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                >
                  {showConfirmPassword ? <FaEyeSlash size={15} /> : <FaEye size={15} />}
                </button>
              </div>
            </div>

            <label className="flex cursor-pointer items-start gap-2 text-xs leading-relaxed text-slate-600">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/20"
                required
              />
              <span>
                I agree to the{" "}
                <button
                  type="button"
                  onClick={() => navigate("/terms")}
                  className="font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  Terms
                </button>{" "}
                and{" "}
                <button
                  type="button"
                  onClick={() => navigate("/privacy-policy")}
                  className="font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  Privacy Policy
                </button>
              </span>
            </label>

            <AuthPrimaryButton loading={loading}>Create Account</AuthPrimaryButton>
          </form>

          <AuthCardFooter
            prompt="Already have an account?"
            linkText="Sign in"
            onLinkClick={() => navigate("/login")}
          />

          <AuthSecuredBadge />
        </div>
      </div>

      <AuthPageFooter />
    </div>
  );
};

export default RegisterPage;

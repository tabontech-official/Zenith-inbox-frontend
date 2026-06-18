import React, { useContext, useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { FiMail, FiLock, FiArrowRight } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { UserContext } from "../component/UserContext";
import { motion, AnimatePresence } from "framer-motion";
import { GoogleLogin } from '@react-oauth/google';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);

  const handleGoogleSuccess = async (credentialResponse) => {
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const response = await axios.post("https://email-syncing-backend.vercel.app/auth/google-login", {
        credential: credentialResponse.credential,
      });

      if (response.status === 200) {
        const resData = response.data;
        const { token, data } = resData;
        const TWO_DAYS = 2 * 24 * 60 * 60 * 1000;
        const expiryTime = Date.now() + TWO_DAYS;

        localStorage.setItem("usertoken", token);
        localStorage.setItem("userid", data._id);
        localStorage.setItem("loginExpiry", expiryTime.toString());

        setUser(data);
        setSuccess("Welcome back! Redirecting...");
        setLoading(false);

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
          navigate("/verify-2fa", {
            state: { userId: resData.userId },
            replace: true,
          });
          return;
        }

        const { token, data } = resData;
        const TWO_DAYS = 2 * 24 * 60 * 60 * 1000;
        const expiryTime = Date.now() + TWO_DAYS;

        localStorage.setItem("usertoken", token);
        localStorage.setItem("userid", data._id);
        localStorage.setItem("loginExpiry", expiryTime.toString());

        setUser(data);
        setSuccess("Welcome back! Redirecting...");
        setLoading(false);

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
      }
    } catch (error) {
      setLoading(false);
      setError(error.response?.data?.error || "Login failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Left Side: Form Container */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 md:px-24 xl:px-32 relative z-10">
        
        {/* Subtle glowing orb for aesthetic */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 0.4 }} 
            className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-indigo-300 rounded-full mix-blend-multiply filter blur-[100px]" 
          />
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 0.4 }} 
            className="absolute bottom-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-purple-300 rounded-full mix-blend-multiply filter blur-[100px]" 
          />
        </div>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-md mx-auto bg-white/70 backdrop-blur-xl border border-white/50 shadow-2xl shadow-indigo-900/5 p-10 rounded-3xl"
        >
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-slate-800 tracking-tight mb-2">Welcome back</h2>
            <p className="text-slate-500 text-sm">Please enter your details to sign in.</p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm font-medium text-center shadow-sm"
              >
                {error}
              </motion.div>
            )}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-emerald-50 border border-emerald-100 text-emerald-600 px-4 py-3 rounded-xl mb-6 text-sm font-medium text-center shadow-sm"
              >
                {success}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mb-6 w-full flex justify-center">
            <div className="w-full sm:w-auto">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError("Google Authentication Failed")}
                theme="outline"
                size="large"
                text="continue_with"
                shape="rectangular"
                width="368"
              />
            </div>
          </div>
          
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-slate-200"></div>
            <span className="px-4 text-slate-400 text-xs font-semibold uppercase tracking-widest">Or sign in with email</span>
            <div className="flex-1 border-t border-slate-200"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                  <FiMail size={18} />
                </div>
                <input
                  type="email"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                  <FiLock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-indigo-600 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex justify-end mt-1">
              <span
                onClick={() => navigate("/forgot-password")}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-800 cursor-pointer transition-colors"
              >
                Forgot password?
              </span>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className={`w-full py-3 mt-4 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all shadow-lg ${
                loading
                  ? "bg-indigo-400 cursor-not-allowed shadow-none"
                  : "bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-500/30"
              }`}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>Sign in <FiArrowRight /></>
              )}
            </motion.button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-8">
            Don't have an account?{" "}
            <span
              onClick={() => navigate("/register")}
              className="font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer transition-colors"
            >
              Create one now
            </span>
          </p>
        </motion.div>
      </div>

      {/* Right Side: Showcase */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 relative overflow-hidden flex-col items-center justify-center">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(to right, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        
        {/* Glowing Effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500 rounded-full mix-blend-screen filter blur-[120px] opacity-20 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-fuchsia-500 rounded-full mix-blend-screen filter blur-[120px] opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="relative z-10 flex flex-col items-center max-w-lg text-center"
        >
          <img
            src="https://images.ctfassets.net/un655fb9wln6/5yk7rxBv0Nw98EVV0tI0pi/cf7cc21501065fe11153936be521831a/Waves_25_Hero_transparent.png?w=1920&q=75"
            alt="Hero Graphic"
            className="w-full drop-shadow-[0_0_40px_rgba(99,102,241,0.4)] object-contain"
          />
          <h3 className="text-3xl font-bold text-white mt-8 mb-4">Automate your workflow.</h3>
          <p className="text-slate-400 text-lg leading-relaxed">
            Connect your inbox, sync your data, and unlock powerful automation capabilities tailored to your business needs.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;

import React, { useContext, useState } from "react";
import { FaEye, FaEyeSlash, FaUser, FaLock } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { UserContext } from "../component/UserContext";
import { motion } from "framer-motion";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);
  const handleClick = () => {
    navigate("/register");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/auth/signIn", {
        email,
        password,
      });

      if (response.status === 200) {
        const { token, data } = response.data;
        localStorage.setItem("usertoken", token);
        localStorage.setItem("userid", data._id);
        setUser(data);

        const completed = data?.setup?.stepCompleted || 0;

        if (completed >= 7) {
          navigate("/organization", { replace: true });
        } else {
          const steps = data?.setup?.steps || [];

          const nextSkippedStep = steps.find(
            (s) => s.status === "skipped"
          )?.step;

          if (nextSkippedStep) {
            navigate(`/setup?step=${nextSkippedStep}`, { replace: true });
          } else if (completed > 0) {
            navigate(`/setup?step=${completed + 1}`, { replace: true });
          } else {
            navigate("/setup", { replace: true });
          }
        }
      }
    } catch (error) {
      setError(
        error.response?.data?.error || "Login failed. Please try again."
      );
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-purple-600 to-fuchsia-600 relative overflow-hidden">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: [0.8, 1.2, 1] }}
        transition={{ duration: 6, repeat: Infinity, repeatType: "reverse" }}
        className="absolute top-10 left-10 w-32 h-32 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-70"
      />
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: [0.6, 1.3, 1] }}
        transition={{ duration: 8, repeat: Infinity, repeatType: "reverse" }}
        className="absolute bottom-20 right-20 w-40 h-40 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70"
      />

      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="w-full lg:w-1/2 bg-white p-10 flex flex-col justify-center z-10 shadow-xl"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="max-w-md w-full mx-auto"
        >
          <h2 className="text-4xl font-extrabold mb-6 text-gray-800 text-center">
            Welcome Back
          </h2>
          <p className="text-gray-500 text-center mb-8">
            Please sign in to continue
          </p>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-500 text-sm mb-4 text-center"
            >
              {error}
            </motion.p>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <motion.div
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <label className="flex items-center gap-2 text-sm font-medium mb-1 text-gray-700">
                <FaLock className="text-purple-600" />
                Email <span className="text-red-500">*</span>
              </label>

              <input
                type="email"
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </motion.div>

            <motion.div
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <label className="flex items-center gap-2 text-sm font-medium mb-1 text-gray-700">
                <FaUser className="text-purple-600" />
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <span
                  className="absolute right-3 top-2.5 cursor-pointer text-gray-500"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
            </motion.div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-lg font-semibold shadow-md"
            >
              Sign in
            </motion.button>
          </form>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center text-sm text-purple-600 mt-5 cursor-pointer hover:underline"
            onClick={handleClick}
          >
            Create an account
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-6 text-sm text-gray-500 text-center space-y-1"
          >
            <p  onClick={()=>{
              navigate('/forgot-password')
            }} className="hover:underline cursor-pointer">Forgot password?</p>
            <p className="hover:underline cursor-pointer">
              Resend verification email
            </p>
            <p>
              Can’t log in?{" "}
              <span className="text-blue-500 underline cursor-pointer">
                Click here
              </span>
              .
            </p>
          </motion.div>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 1 }}
        className="hidden lg:flex w-2/3 text-white items-center justify-center relative p-0 overflow-hidden"
      >
        <motion.img
          src="https://images.ctfassets.net/un655fb9wln6/5yk7rxBv0Nw98EVV0tI0pi/cf7cc21501065fe11153936be521831a/Waves_25_Hero_transparent.png?w=1920&q=75"
          alt="Hero Graphic"
          initial={{ scale: 1.1 }}
          animate={{ scale: [1.1, 1, 1.05, 1] }}
          transition={{ duration: 8, repeat: Infinity, repeatType: "mirror" }}
          className="w-full max-w-5xl mx-auto drop-shadow-2xl"
        />
      </motion.div>
    </div>
  );
};

export default LoginPage;

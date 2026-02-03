// import React, { useContext, useState } from "react";
// import { FaEye, FaEyeSlash, FaUser, FaLock } from "react-icons/fa";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import { UserContext } from "../component/UserContext";
// import { motion } from "framer-motion";

// const LoginPage = () => {
//   const [showPassword, setShowPassword] = useState(false);
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");
//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate();
//   const { setUser } = useContext(UserContext);

//   const handleClick = () => {
//     navigate("/register");
//   };


//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     setSuccess("");
//     setLoading(true);

//     try {
//       const response = await axios.post(
//         "https://email-syncing-backend.vercel.app/auth/signIn",
//         { email, password }
//       );

//       if (response.status === 200) {
//         const { token, data } = response.data;
//         localStorage.setItem("usertoken", token);
//         localStorage.setItem("userid", data._id);
//         setUser(data);
//         setSuccess("Login successful! Redirecting...");
//         setLoading(false);

//         const userRole = data?.role || "user"; 
//         const completed = data?.setup?.stepCompleted || 0;

//         setTimeout(() => {
//           if (userRole === "admin") {
//             navigate("/admin/dashboard", { replace: true });
//           }
//           else if (completed >= 7) {
//             navigate("/organization", { replace: true });
//           } else {
//             const steps = data?.setup?.steps || [];
//             const nextSkippedStep = steps.find(
//               (s) => s.status === "skipped"
//             )?.step;

//             if (nextSkippedStep) {
//               navigate(`/setup?step=${nextSkippedStep}`, { replace: true });
//             } else if (completed > 0) {
//               navigate(`/setup?step=${completed + 1}`, { replace: true });
//             } else {
//               navigate("/setup", { replace: true });
//             }
//           }
//         }, 1500);
//       }
//     } catch (error) {
//       setLoading(false);
//       setError(
//         error.response?.data?.error || "Login failed. Please try again."
//       );
//     }
//   };

//   return (
//     <div className="min-h-screen flex bg-gradient-to-br from-purple-600 to-fuchsia-600 relative overflow-hidden">
//       <motion.div
//         initial={{ scale: 0 }}
//         animate={{ scale: [0.8, 1.2, 1] }}
//         transition={{ duration: 6, repeat: Infinity, repeatType: "reverse" }}
//         className="absolute top-10 left-10 w-32 h-32 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-70"
//       />
//       <motion.div
//         initial={{ scale: 0 }}
//         animate={{ scale: [0.6, 1.3, 1] }}
//         transition={{ duration: 8, repeat: Infinity, repeatType: "reverse" }}
//         className="absolute bottom-20 right-20 w-40 h-40 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70"
//       />

//       <motion.div
//         initial={{ x: -100, opacity: 0 }}
//         animate={{ x: 0, opacity: 1 }}
//         transition={{ duration: 0.8 }}
//         className="w-full lg:w-1/2 bg-white p-10 flex flex-col justify-center z-10 shadow-xl"
//       >
//         <motion.div
//           initial={{ scale: 0.9, opacity: 0 }}
//           animate={{ scale: 1, opacity: 1 }}
//           transition={{ delay: 0.2, duration: 0.6 }}
//           className="max-w-md w-full mx-auto"
//         >
//           <h2 className="text-4xl font-extrabold mb-6 text-gray-800 text-center">
//             Welcome Back
//           </h2>
//           <p className="text-gray-500 text-center mb-8">
//             Please login to continue
//           </p>

//           {error && (
//             <motion.div
//               initial={{ opacity: 0, y: -10 }}
//               animate={{ opacity: 1, y: 0 }}
//               className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4 text-center"
//             >
//               {error}
//             </motion.div>
//           )}

//           {success && (
//             <motion.div
//               initial={{ opacity: 0, y: -10 }}
//               animate={{ opacity: 1, y: 0 }}
//               className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded mb-4 text-center"
//             >
//               {success}
//             </motion.div>
//           )}

//           <form onSubmit={handleSubmit} className="space-y-5">
//             <label className="flex items-center gap-2 text-sm font-medium mb-1 text-gray-700">
//               <FaLock className="text-purple-600" />
//               Email <span className="text-red-500">*</span>
//             </label>

//             <input
//               type="email"
//               className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
//               placeholder="you@example.com"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               required
//             />

//             <label className="flex items-center gap-2 text-sm font-medium mb-1 text-gray-700">
//               <FaUser className="text-purple-600" />
//               Password <span className="text-red-500">*</span>
//             </label>
//             <div className="relative">
//               <input
//                 type={showPassword ? "text" : "password"}
//                 className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
//                 placeholder="••••••••"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 required
//               />
//               <span
//                 className="absolute right-3 top-2.5 cursor-pointer text-gray-500"
//                 onClick={() => setShowPassword(!showPassword)}
//               >
//                 {showPassword ? <FaEyeSlash /> : <FaEye />}
//               </span>
//             </div>

//             <motion.button
//               whileHover={{ scale: 1.05 }}
//               whileTap={{ scale: 0.95 }}
//               type="submit"
//               disabled={loading}
//               className={`w-full ${
//                 loading
//                   ? "bg-gray-400 cursor-not-allowed"
//                   : "bg-gradient-to-r from-pink-500 to-purple-600"
//               } text-white py-3 rounded-lg font-semibold shadow-md`}
//             >
//               {loading ? "Logging in..." : "Log in"}
//             </motion.button>
//           </form>

//           <p
//             onClick={handleClick}
//             className="text-center text-sm text-purple-600 mt-5 cursor-pointer hover:underline"
//           >
//             Create an account
//           </p>

//           <div className="mt-1 text-sm text-gray-500 text-center space-y-1">
//             <p
//               onClick={() => {
//                 navigate("/forgot-password");
//               }}
//               className="hover:underline cursor-pointer"
//             >
//               Forgot password?
//             </p>
            
//           </div>
//         </motion.div>
//       </motion.div>

//       <motion.div
//         initial={{ x: 100, opacity: 0 }}
//         animate={{ x: 0, opacity: 1 }}
//         transition={{ duration: 1 }}
//         className="hidden lg:flex w-2/3 text-white items-center justify-center relative p-0 overflow-hidden"
//       >
//         <motion.img
//           src="https://images.ctfassets.net/un655fb9wln6/5yk7rxBv0Nw98EVV0tI0pi/cf7cc21501065fe11153936be521831a/Waves_25_Hero_transparent.png?w=1920&q=75"
//           alt="Hero Graphic"
//           initial={{ scale: 1.1 }}
//           animate={{ scale: [1.1, 1, 1.05, 1] }}
//           transition={{ duration: 8, repeat: Infinity, repeatType: "mirror" }}
//           className="w-full max-w-5xl mx-auto drop-shadow-2xl"
//         />
//       </motion.div>
//     </div>
//   );
// };

// export default LoginPage;
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
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);

  const handleClick = () => {
    navigate("/register");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await axios.post(
        "https://email-syncing-backend.vercel.app/auth/signIn",
        { email, password }
      );

      if (response.status === 200) {
        const { token, data } = response.data;

        localStorage.setItem("usertoken", token);
        localStorage.setItem("userid", data._id);

        setUser(data);
        setSuccess("Login successful! Redirecting...");
        setLoading(false);

        const userRole = data?.role || "user";
        const setupCompleted = data?.setup?.setupCompleted === true;
        const steps = data?.setup?.steps || [];

        setTimeout(() => {
          // 🔐 ADMIN
          if (userRole === "admin") {
            navigate("/admin/dashboard", { replace: true });
            return;
          }

          // ✅ SETUP DONE → ORGANIZATION
          if (setupCompleted) {
            navigate("/organization", { replace: true });
            return;
          }

          // 🧙 SETUP NOT DONE → WIZARD
          const nextStep =
            steps.find(
              (s) => s.status === "skipped" || s.status === "incomplete"
            )?.step || 1;

          navigate(`/setup?step=${nextStep}`, { replace: true });
        }, 800);
      }
    } catch (error) {
      setLoading(false);
      setError(
        error.response?.data?.error || "Login failed. Please try again."
      );
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-purple-600 to-fuchsia-600 relative overflow-hidden">
      {/* background blobs */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: [0.8, 1.2, 1] }}
        transition={{ duration: 6, repeat: Infinity, repeatType: "reverse" }}
        className="absolute top-10 left-10 w-32 h-32 bg-pink-400 rounded-full blur-xl opacity-70"
      />
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: [0.6, 1.3, 1] }}
        transition={{ duration: 8, repeat: Infinity, repeatType: "reverse" }}
        className="absolute bottom-20 right-20 w-40 h-40 bg-purple-500 rounded-full blur-xl opacity-70"
      />

      {/* LEFT PANEL */}
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
            Please login to continue
          </p>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4 text-center">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded mb-4 text-center">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <FaLock className="text-purple-600" />
              Email *
            </label>
            <input
              type="email"
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <FaUser className="text-purple-600" />
              Password *
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500"
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

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={loading}
              className={`w-full ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-pink-500 to-purple-600"
              } text-white py-3 rounded-lg font-semibold shadow-md`}
            >
              {loading ? "Logging in..." : "Log in"}
            </motion.button>
          </form>

          <p
            onClick={handleClick}
            className="text-center text-sm text-purple-600 mt-5 cursor-pointer hover:underline"
          >
            Create an account
          </p>

          <p
            onClick={() => navigate("/forgot-password")}
            className="text-center text-sm text-gray-500 mt-2 cursor-pointer hover:underline"
          >
            Forgot password?
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoginPage;

import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/login");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "https://email-syncing-backend.vercel.app/auth/signUp",
        { fullName, email, password }
      );

      if (response.status === 200) {
        navigate("/login");
      }
    } catch (error) {
      setError(
        error.response?.data?.error || "Signup failed. Please try again."
      );
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="w-full lg:w-1/2 bg-white p-10 flex flex-col justify-center">
        <div className="max-w-md w-full mx-auto">
          <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">
            Create Your Account
          </h2>
          <p className="text-gray-500 text-center mb-8">
            Join us today and get started
          </p>

          {error && (
            <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
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
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
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
            </div>

            <button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold transition"
            >
              Sign up
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-4">
            Already have an account?{" "}
            <span
              onClick={handleClick}
              className="text-purple-600 hover:underline cursor-pointer"
            >
              Sign in
            </span>
          </p>
        </div>
      </div>

      <div className="hidden lg:flex w-2/3 bg-gradient-to-br from-purple-600 to-fuchsia-600 text-white items-center justify-center relative p-0">
        <div className="w-full text-center">
          <img
            src="https://images.ctfassets.net/un655fb9wln6/5yk7rxBv0Nw98EVV0tI0pi/cf7cc21501065fe11153936be521831a/Waves_25_Hero_transparent.png?w=1920&q=75"
            alt="Hero Graphic"
            className="w-full max-w-5xl mx-auto"
          />
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
// import React, { useState, useEffect } from "react";
// import { motion } from "framer-motion";

// const FaEye = (props) => (
//   <svg {...props} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
//     <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
//     <path
//       fillRule="evenodd"
//       d="M.458 10C1.725 5.587 5.568 2.5 10 2.5s8.275 3.087 9.542 7.5c-1.267 4.413-5.11 7.5-9.542 7.5S1.725 14.413.458 10zM14.5 10a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z"
//       clipRule="evenodd"
//     />
//   </svg>
// );
// const FaEyeSlash = (props) => (
//   <svg {...props} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
//     <path d="M13.344 7.21c.548.016 1.05.15 1.5.4 1.547.88 2.87 2.657 3.656 4.39A1.5 1.5 0 0118.5 12h-1.5c-.328 0-.64-.131-.87-.36l-1.92-1.92c-.23-.23-.36-.542-.36-.87V7.5a1.5 1.5 0 011.5-1.5zM3.656 12.001c.786-1.733 2.109-3.51 3.656-4.39.45-.25.952-.384 1.5-.4a1.5 1.5 0 011.5 1.5v.75c0 .328-.131.64-.36.87l-1.92 1.92c-.23.23-.542.36-.87.36H.5a1.5 1.5 0 01-1.5-1.5v-1.5c0-.828.672-1.5 1.5-1.5h1.5zM10 10.5a.5.5 0 00-.5.5v2.5a.5.5 0 001 0v-2.5a.5.5 0 00-.5-.5z" />
//   </svg>
// );
// const useNavigate = () => (path) =>
//   console.log(`[NAVIGATE MOCK] Redirecting to: ${path}`);
// const axios = {
//   post: (url, data) =>
//     new Promise((resolve, reject) => {
//       console.log(`[AXIOS MOCK] Attempting signup to ${url}...`);
//       setTimeout(() => {
//         if (data.email === "fail@example.com") {
//           reject({
//             response: {
//               data: {
//                 error: "User already exists. Please use a different email.",
//               },
//             },
//           });
//         } else {
//           console.log("[AXIOS MOCK] Signup successful.");
//           resolve({ status: 200, data: { message: "Signup successful" } });
//         }
//       }, 1000);
//     }),
// };

// const containerVariants = {
//   hidden: { opacity: 0 },
//   visible: {
//     opacity: 1,
//     transition: {
//       duration: 0.5,
//       delayChildren: 0.3,
//       staggerChildren: 0.1,
//     },
//   },
// };

// const itemVariants = {
//   hidden: { y: 20, opacity: 0 },
//   visible: { y: 0, opacity: 1 },
// };

// const RegisterPage = () => {
//   const [showPassword, setShowPassword] = useState(false);
//   const [fullName, setFullName] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const [isLoading, setIsLoading] = useState(false);

//   const navigate = useNavigate();

//   const handleClick = () => {
//     navigate("/login");
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     setIsLoading(true);

//     try {
//       await axios.post("https://email-syncing-backend.vercel.app/auth/signUp", {
//         fullName,
//         email,
//         password,
//       });

//       navigate("/login");
//     } catch (error) {
//       setError(
//         error.response?.data?.error ||
//           "Signup failed. Please check your credentials."
//       );
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <motion.div
//       className="min-h-screen flex antialiased bg-gray-50"
//       initial={{ opacity: 0, scale: 0.98 }}
//       animate={{ opacity: 1, scale: 1 }}
//       transition={{ duration: 0.5 }}
//     >
//       <motion.div
//         className="w-full lg:w-1/2 p-4 sm:p-8 md:p-12 lg:p-16 flex flex-col justify-center relative z-10"
//         initial={{ x: -100, opacity: 0 }}
//         animate={{ x: 0, opacity: 1 }}
//         transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
//       >
//         <div className="max-w-md w-full mx-auto p-6 bg-white rounded-3xl shadow-2xl border border-gray-100/50">
//           <motion.div
//             variants={containerVariants}
//             initial="hidden"
//             animate="visible"
//           >
//             <motion.h2
//               variants={itemVariants}
//               className="text-4xl font-extrabold mb-3 text-gray-900 text-center"
//             >
//               Start Your Journey
//             </motion.h2>
//             <motion.p
//               variants={itemVariants}
//               className="text-gray-500 text-center mb-10"
//             >
//               Create your account to unlock full access.
//             </motion.p>
//           </motion.div>

//           {error && (
//             <motion.p
//               initial={{ opacity: 0, y: -10 }}
//               animate={{ opacity: 1, y: 0 }}
//               className="bg-red-100 text-red-700 text-sm p-3 rounded-xl mb-6 text-center border border-red-200"
//             >
//               {error}
//             </motion.p>
//           )}

//           <motion.form
//             onSubmit={handleSubmit}
//             className="space-y-6"
//             variants={containerVariants}
//             initial="hidden"
//             animate="visible"
//           >
//             <motion.div variants={itemVariants}>
//               <label className="block text-sm font-medium mb-1 text-gray-700">
//                 Full Name <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="text"
//                 className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 transition duration-300 shadow-sm"
//                 placeholder="John Doe"
//                 value={fullName}
//                 onChange={(e) => setFullName(e.target.value)}
//                 required
//               />
//             </motion.div>

//             <motion.div variants={itemVariants}>
//               <label className="block text-sm font-medium mb-1 text-gray-700">
//                 Email <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="email"
//                 className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 transition duration-300 shadow-sm"
//                 placeholder="you@example.com"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 required
//               />
//             </motion.div>

//             {/* Password */}
//             <motion.div variants={itemVariants}>
//               <label className="block text-sm font-medium mb-1 text-gray-700">
//                 Password <span className="text-red-500">*</span>
//               </label>
//               <div className="relative">
//                 <input
//                   type={showPassword ? "text" : "password"}
//                   className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 transition duration-300 shadow-sm"
//                   placeholder="••••••••"
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   required
//                 />
//                 <span
//                   className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500 hover:text-purple-600 transition"
//                   onClick={() => setShowPassword(!showPassword)}
//                 >
//                   {showPassword ? <FaEyeSlash /> : <FaEye />}
//                 </span>
//               </div>
//             </motion.div>

//             <motion.button
//               type="submit"
//               className={`w-full py-3 rounded-xl font-bold text-white transition duration-300 shadow-lg ${
//                 isLoading
//                   ? "bg-purple-400 cursor-not-allowed"
//                   : "bg-purple-600 hover:bg-purple-700 hover:shadow-xl transform hover:scale-[1.01]"
//               }`}
//               // whileHover={{ scale: 1.01 }}
//               // whileTap={{ scale: 0.98 }}
//               variants={itemVariants}
//               disabled={isLoading}
//             >
//               {isLoading ? (
//                 <div className="flex items-center justify-center">
//                   <svg
//                     className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
//                     xmlns="http://www.w3.org/2000/svg"
//                     fill="none"
//                     viewBox="0 0 24 24"
//                   >
//                     <circle
//                       className="opacity-25"
//                       cx="12"
//                       cy="12"
//                       r="10"
//                       stroke="currentColor"
//                       strokeWidth="4"
//                     ></circle>
//                     <path
//                       className="opacity-75"
//                       fill="currentColor"
//                       d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                     ></path>
//                   </svg>
//                   Signing up...
//                 </div>
//               ) : (
//                 "Create Account"
//               )}
//             </motion.button>
//           </motion.form>

//           {/* Sign In Link */}
//           <motion.p
//             variants={itemVariants}
//             className="text-center text-sm text-gray-600 mt-6"
//           >
//             Already have an account?{" "}
//             <span
//               onClick={handleClick}
//               className="text-purple-600 font-semibold hover:text-purple-700 hover:underline cursor-pointer transition duration-150"
//             >
//               Sign in now
//             </span>
//           </motion.p>
//         </div>
//       </motion.div>

//       {/* Hero/Visual Section - Slides in from the right */}
//       <motion.div
//         className="hidden lg:flex w-1/2 bg-gradient-to-br from-purple-700 to-indigo-800 text-white items-center justify-center relative overflow-hidden p-16 rounded-l-[50px] shadow-2xl"
//         initial={{ x: 100, opacity: 0 }}
//         animate={{ x: 0, opacity: 1 }}
//         transition={{
//           duration: 0.8,
//           type: "spring",
//           stiffness: 100,
//           delay: 0.2,
//         }}
//       >
//         <div
//           className="absolute inset-0 opacity-10"
//           style={{
//             backgroundImage:
//               "url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgICA8ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPgogICAgICAgIDxwYXRoIGQ9Ik0xMDAgMjAwYTEwMCAxMDAgMCAxIDAgMC0yMDBjNTUuMjI5IDAgMTAwIDQ0Ljc3MSAxMDAgMTAwcz0iIGZpbGw9IiNmZmYiLz4KICAgIDwvZz4KPC9zdmc+')",
//             backgroundSize: "400px",
//             backgroundPosition: "center",
//           }}
//         ></div>

//         <div className="relative z-10 text-center space-y-4">
//           <motion.div
//             initial={{ y: 20, opacity: 0 }}
//             animate={{ y: 0, opacity: 1 }}
//             transition={{ delay: 0.5, duration: 0.7 }}
//           >
//             <h3 className="text-5xl font-extrabold mb-4 leading-tight">
//               Manage Your <br />
//               Digital World
//             </h3>
//             <p className="text-xl text-indigo-200">
//               Seamlessly connect, organize, and sync all your data in one
//               beautiful place.
//             </p>
//           </motion.div>
//           <motion.img
//             src="https://images.ctfassets.net/un655fb9wln6/5yk7rxBv0Nw98EVV0tI0pi/cf7cc21501065fe11153936be521831a/Waves_25_Hero_transparent.png?w=1920&q=75"
//             alt="Product Illustration"
//             className="w-full max-w-lg mx-auto mt-10 rounded-2xl shadow-2xl ring-4 ring-indigo-500/50"
//             initial={{ scale: 0.8, opacity: 0 }}
//             animate={{ scale: 1, opacity: 1 }}
//             transition={{
//               delay: 0.7,
//               duration: 0.7,
//               type: "spring",
//               stiffness: 100,
//             }}
//           />
//         </div>
//       </motion.div>
//     </motion.div>
//   );
// };

// export default RegisterPage;

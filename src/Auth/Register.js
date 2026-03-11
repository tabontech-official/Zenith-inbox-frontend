
// import React, { useState } from "react";
// import { FaEye, FaEyeSlash } from "react-icons/fa";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import toast from "react-hot-toast"; // ✅ import toast

// const RegisterPage = () => {
//   const [showPassword, setShowPassword] = useState(false);
//   const [fullName, setFullName] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const navigate = useNavigate();

//   const handleClick = () => {
//     navigate("/login");
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await axios.post(
//         "https://email-syncing-backend.vercel.app/auth/signUp",
//         { fullName, email, password }
//       );

//       if (response.status === 200) {
//         toast.success("Signup successful! ");
//         setTimeout(() => navigate("/login"), 1000);
//       }
//     } catch (error) {
//       const errMsg =
//         error.response?.data?.error || "Signup failed. Please try again.";
//       setError(errMsg);
//       toast.error(errMsg); 
//     }
//   };

//   return (
//     <div className="min-h-screen flex">
//       <div className="w-full lg:w-1/2 bg-white p-10 flex flex-col justify-center">
//         <div className="max-w-md w-full mx-auto">
//           <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">
//             Create Your Account
//           </h2>
//           <p className="text-gray-500 text-center mb-8">
//             Join us today and get started
//           </p>

//           {error && (
//             <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
//           )}

//           <form onSubmit={handleSubmit} className="space-y-5">
//             <div>
//               <label className="block text-sm font-medium mb-1 text-gray-700">
//                 Full Name <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="text"
//                 className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
//                 placeholder="John Doe"
//                 value={fullName}
//                 onChange={(e) => setFullName(e.target.value)}
//                 required
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium mb-1 text-gray-700">
//                 Email <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="email"
//                 className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
//                 placeholder="you@example.com"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 required
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium mb-1 text-gray-700">
//                 Password <span className="text-red-500">*</span>
//               </label>
//               <div className="relative">
//                 <input
//                   type={showPassword ? "text" : "password"}
//                   className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
//                   placeholder="••••••••"
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   required
//                 />
//                 <span
//                   className="absolute right-3 top-2.5 cursor-pointer text-gray-500"
//                   onClick={() => setShowPassword(!showPassword)}
//                 >
//                   {showPassword ? <FaEyeSlash /> : <FaEye />}
//                 </span>
//               </div>
//             </div>

//             <button
//               type="submit"
//               className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold transition"
//             >
//               Sign up
//             </button>
//           </form>

//           <p className="text-center text-sm text-gray-600 mt-4">
//             Already have an account?{" "}
//             <span
//               onClick={handleClick}
//               className="text-purple-600 hover:underline cursor-pointer"
//             >
//               Log in
//             </span>
//           </p>
//         </div>
//       </div>

//       <div className="hidden lg:flex w-2/3 bg-gradient-to-br from-purple-600 to-fuchsia-600 text-white items-center justify-center relative p-0">
//         <div className="w-full text-center">
//           <img
//             src="https://images.ctfassets.net/un655fb9wln6/5yk7rxBv0Nw98EVV0tI0pi/cf7cc21501065fe11153936be521831a/Waves_25_Hero_transparent.png?w=1920&q=75"
//             alt="Hero Graphic"
//             className="w-full max-w-5xl mx-auto"
//           />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default RegisterPage;
import React, { useState, useEffect } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [alert, setAlert] = useState({ type: "", message: "" });
  const navigate = useNavigate();
const [loading, setLoading] = useState(false);
  // 🕓 Automatically hide alert after 4 seconds
  useEffect(() => {
    if (alert.message) {
      const timer = setTimeout(() => setAlert({ type: "", message: "" }), 4000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  const handleClick = () => {
    navigate("/login");
  };
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const response = await axios.post(
      "https://email-syncing-backend.vercel.app/auth/signUp",
      { fullName, email, password }
    );

    if (response.status === 200) {
      setAlert({
        type: "success",
        message: "Signup successful! Redirecting to login...",
      });

      setTimeout(() => navigate("/login"), 1200);
    }
  } catch (error) {
    const errMsg =
      error.response?.data?.error || "Signup failed. Please try again.";
    setAlert({ type: "error", message: errMsg });
  } finally {
    setLoading(false);
  }
};

  // 🔔 Alert Message Component
  const AlertMessage = () =>
    alert.message ? (
      <div
        className={`my-4 p-3 rounded-md text-sm text-center font-medium ${
          alert.type === "success"
            ? "bg-green-100 text-green-700 border border-green-300"
            : "bg-red-100 text-red-700 border border-red-300"
        }`}
      >
        {alert.message}
      </div>
    ) : null;

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

          {/* 🔔 Alert here */}
          <AlertMessage />

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

           <motion.button
whileHover={{ scale: 1.05 }}
whileTap={{ scale: 0.95 }}
type="submit"
disabled={loading}
className={`w-full ${
loading
? "bg-gray-400 cursor-not-allowed"
: "bg-gradient-to-r from-pink-500 to-purple-600"
} text-white py-3 rounded-lg font-semibold shadow-md transition`}
>
{loading ? "Signing up..." : "Sign up"}
</motion.button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-4">
            Already have an account?{" "}
            <span
              onClick={handleClick}
              className="text-purple-600 hover:underline cursor-pointer"
            >
              Log in
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

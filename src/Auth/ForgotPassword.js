import { apiFetch } from "../utils/apiClient";
// import React, { useState } from "react";
// import { FiMail, FiLoader, FiArrowLeft } from "react-icons/fi";
// import toast from "react-hot-toast";
// import { useNavigate } from "react-router-dom";

// const ForgotPassword = () => {
//   const [email, setEmail] = useState("");
//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
//       toast.error("Please enter a valid email.");
//       return;
//     }

//     setLoading(true);
//     try {
//       const res = await apiFetch("https://email-syncing-backend.vercel.app/auth/forgot-password", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email }),
//       });
//       const data = await res.json();
//       if (data.success) {
//         toast.success("Reset link sent to your email!");
//       } else toast.error(data.message || "Failed to send reset link.");
//     } catch {
//       toast.error("Network error, please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
//       <div className="bg-white shadow-xl rounded-2xl w-full max-w-md p-8">
//         <button
//           onClick={() => navigate("/login")}
//           className="flex items-center text-sm text-gray-500 hover:text-gray-700 mb-6"
//         >
//           <FiArrowLeft className="mr-2" /> Back to Login
//         </button>

//         <h2 className="text-2xl font-semibold text-gray-800 text-center mb-2">
//           Forgot Password?
//         </h2>
//         <p className="text-gray-500 text-center text-sm mb-8">
//           Enter your email and we’ll send you a reset link.
//         </p>

//         <form onSubmit={handleSubmit} className="space-y-6">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Email Address
//             </label>
//             <div className="relative">
//               <FiMail className="absolute left-3 top-3 text-gray-400" />
//               <input
//                 type="email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 placeholder="you@example.com"
//                 className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
//               />
//             </div>
//           </div>

//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full flex items-center justify-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-70"
//           >
//             {loading ? <FiLoader className="animate-spin" /> : "Send Reset Link"}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default ForgotPassword;
import React, { useState } from "react";
import { FiMail, FiLoader, FiArrowLeft, FiArrowRight, FiCheckCircle } from "react-icons/fi";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      toast.error("Please enter a valid email.");
      return;
    }

    setLoading(true);

    try {
      const res = await apiFetch(
        "https://email-syncing-backend.vercel.app/auth/forgot-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const data = await res.json();

      if (data.success) {
        toast.success("Reset link sent to your email!");
      } else {
        toast.error(data.message || "Failed to send reset link.");
      }
    } catch {
      toast.error("Network error, please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#fafafa] text-zinc-950 font-sans selection:bg-violet-100">
      <CircuitBackground />

      <header className="fixed inset-x-0 top-2 z-50 px-3">
        <div className="mx-auto flex h-[46px] max-w-[1230px] items-center justify-between rounded-[14px] border border-zinc-200/80 bg-white/85 px-3 shadow-[0_8px_30px_rgba(0,0,0,0.08)] backdrop-blur-xl">
          <button
            onClick={() => navigate("/")}
            className="flex h-full items-center gap-2 border-r border-zinc-200/80 pr-4"
          >
            <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-zinc-100 ring-1 ring-zinc-200">
              <span className="absolute h-3.5 w-3.5 rounded-full border-[3px] border-zinc-900 border-r-transparent" />
              <span className="absolute right-[5px] top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-zinc-900" />
            </span>

            <span className="text-[18px] font-semibold leading-none tracking-[-0.025em] text-zinc-950">
              Replex Engine
            </span>
          </button>

          <button
            onClick={() => navigate("/login")}
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-semibold leading-none text-zinc-950 transition hover:bg-zinc-100"
          >
            <FiArrowLeft className="text-[13px]" />
            Back to login
          </button>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center justify-center px-5 py-28">
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="w-full max-w-[520px] rounded-2xl border border-zinc-200 bg-white p-3 shadow-[0_24px_80px_rgba(24,24,27,0.12)]"
        >
          <div className="relative overflow-hidden rounded-xl border border-zinc-200 bg-[#fafafa] p-7 sm:p-9">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(24,24,27,0.045)_1px,transparent_1px),linear-gradient(to_bottom,rgba(24,24,27,0.045)_1px,transparent_1px)] bg-[size:34px_34px]" />

            <div className="relative">
              <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#6F4BFF] shadow-sm ring-1 ring-zinc-200">
                <FiMail className="text-2xl" />
              </div>

              <div className="mb-7 text-center">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/80 px-3.5 py-1.5 text-xs font-bold text-zinc-700 shadow-sm backdrop-blur">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#6F4BFF]" />
                  Password recovery
                </div>

                <h1 className="text-[38px] font-semibold leading-[0.98] tracking-[-0.06em] text-zinc-950 sm:text-5xl">
                  Forgot Password?
                </h1>

                <p className="mx-auto mt-5 max-w-sm text-sm font-medium leading-6 text-zinc-600 sm:text-base">
                  Enter your email address and we’ll send you a secure reset
                  link.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-zinc-800">
                    Email Address
                  </label>

                  <div className="relative">
                    <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />

                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="h-12 w-full rounded-xl border border-zinc-200 bg-white pl-11 pr-4 text-sm font-medium text-zinc-950 shadow-sm outline-none transition placeholder:text-zinc-400 focus:border-[#6F4BFF] focus:ring-4 focus:ring-violet-100"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg px-4 text-[13px] font-semibold text-white shadow-[0_7px_18px_rgba(111,75,255,0.28)] transition ${
                    loading
                      ? "cursor-not-allowed bg-zinc-400 shadow-none"
                      : "bg-[#6F4BFF] hover:bg-[#6242E8]"
                  }`}
                >
                  {loading ? (
                    <>
                      <FiLoader className="animate-spin text-[15px]" />
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Reset Link
                      <FiArrowRight className="text-[13px]" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-7 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#F7F7F8] ring-1 ring-zinc-200">
                    <FiCheckCircle className="text-[13px] text-[#6F4BFF]" />
                  </span>

                  <p className="text-sm font-medium leading-6 text-zinc-600">
                    Use the same email linked with your Replex Engine account.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

const CircuitBackground = () => (
  <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-90">
    <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(24,24,27,0.045)_1px,transparent_1px),linear-gradient(to_bottom,rgba(24,24,27,0.045)_1px,transparent_1px)] bg-[size:96px_96px]" />
    <div className="absolute inset-x-0 top-0 h-full bg-[radial-gradient(circle_at_center,transparent_0%,transparent_34%,rgba(250,250,250,0.78)_72%)]" />

    <svg
      className="absolute left-1/2 top-8 h-[600px] w-[1500px] -translate-x-1/2 text-zinc-300/55"
      viewBox="0 0 1500 600"
      fill="none"
    >
      <path d="M72 140H222L292 210H474L545 140H690" stroke="currentColor" strokeWidth="1" />
      <path d="M1430 140H1278L1208 210H1026L955 140H810" stroke="currentColor" strokeWidth="1" />
      <path d="M260 460H430L500 525H658V392H750" stroke="currentColor" strokeWidth="1" />
      <path d="M1240 460H1070L1000 525H842V392H750" stroke="currentColor" strokeWidth="1" />
      <path d="M750 0V105M750 495V600M520 0V105L590 175V245M980 0V105L910 175V245" stroke="currentColor" strokeWidth="1" />

      {[260, 430, 585, 750, 915, 1070, 1240].map((x, i) => (
        <rect
          key={i}
          x={x}
          y={i % 2 ? 112 : 382}
          width="12"
          height="12"
          rx="3"
          fill="white"
          stroke="currentColor"
        />
      ))}

      {[350, 675, 825, 1150].map((x, i) => (
        <circle
          key={i}
          cx={x}
          cy={i % 2 ? 165 : 430}
          r="10"
          fill="white"
          stroke="currentColor"
        />
      ))}
    </svg>

    <div className="absolute left-1/2 top-[118px] h-[360px] w-[720px] -translate-x-1/2 rounded-full bg-white/55 blur-3xl" />
  </div>
);

export default ForgotPassword;

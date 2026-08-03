// import React, { useContext, useState } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import axios from "axios";
// import { motion } from "framer-motion";
// import { FiShield } from "react-icons/fi";
// import { UserContext } from "../component/UserContext";

// const VerifyTwoFactor = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { setUser } = useContext(UserContext);

//   const userId =
//     location.state?.userId || localStorage.getItem("twoFactorUserId");

//   const [code, setCode] = useState("");
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);

//   const finishLoginRedirect = (data) => {
//     const userRole = data?.role || "user";
//     const setupCompleted = data?.setup?.setupCompleted === true;
//     const steps = data?.setup?.steps || [];

//     if (userRole === "admin") {
//       navigate("/admin/dashboard", { replace: true });
//       return;
//     }

//     if (setupCompleted) {
//       navigate("/dashboard", { replace: true });
//       return;
//     }

//     const nextStep =
//       steps.find((s) => s.status === "skipped" || s.status === "incomplete")
//         ?.step || 1;

//     navigate(`/setup?step=${nextStep}`, { replace: true });
//   };

//   const handleVerify = async (e) => {
//     e.preventDefault();
//     setError("");

//     if (!userId) {
//       setError("Session expired. Please login again.");
//       return;
//     }

//     if (!code.trim() || code.length !== 6) {
//       setError("Please enter a valid 6-digit code.");
//       return;
//     }

//     try {
//       setLoading(true);

//       const response = await axios.post(
//         "https://email-syncing-backend.vercel.app/auth/2fa/verify-login",
//         {
//           userId,
//           token: code,
//         }
//       );

//       const { token, data } = response.data;

//       const TWO_DAYS = 2 * 24 * 60 * 60 * 1000;
//       const expiryTime = Date.now() + TWO_DAYS;

//       localStorage.setItem("usertoken", token);
//       localStorage.setItem("userid", data._id);
//       localStorage.setItem("loginExpiry", expiryTime.toString());
//       localStorage.removeItem("twoFactorUserId");

//       setUser(data);
//       finishLoginRedirect(data);
//     } catch (err) {
//       setError(
//         err.response?.data?.message ||
//           err.response?.data?.error ||
//           "Invalid verification code"
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex bg-gradient-to-br from-purple-600 to-fuchsia-600 relative overflow-hidden">
//       <motion.div
//         initial={{ x: -100, opacity: 0 }}
//         animate={{ x: 0, opacity: 1 }}
//         transition={{ duration: 0.8 }}
//         className="w-full lg:w-1/2 bg-white p-10 flex flex-col justify-center z-10 shadow-xl"
//       >
//         <div className="max-w-md w-full mx-auto">
//           <div className="flex justify-center mb-5">
//             <div className="h-14 w-14 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center text-2xl">
//               <FiShield />
//             </div>
//           </div>

//           <h2 className="text-4xl font-extrabold mb-4 text-gray-800 text-center">
//             Two-Step Verification
//           </h2>

//           <p className="text-gray-500 text-center mb-8">
//             Enter the 6-digit code from your authenticator app.
//           </p>

//           {error && (
//             <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4 text-center">
//               {error}
//             </div>
//           )}

//           <form onSubmit={handleVerify} className="space-y-5">
//             <input
//               type="text"
//               inputMode="numeric"
//               maxLength={6}
//               value={code}
//               onChange={(e) =>
//                 setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
//               }
//               placeholder="Enter 6-digit code"
//               className="w-full border rounded-lg px-4 py-3 text-center tracking-[0.4em] text-xl font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
//               autoFocus
//             />

//             <button
//               type="submit"
//               disabled={loading}
//               className={`w-full ${
//                 loading
//                   ? "bg-gray-400 cursor-not-allowed"
//                   : "bg-gradient-to-r from-pink-500 to-purple-600"
//               } text-white py-3 rounded-lg font-semibold shadow-md`}
//             >
//               {loading ? "Verifying..." : "Verify"}
//             </button>
//           </form>

//           <p
//             onClick={() => {
//               localStorage.removeItem("twoFactorUserId");
//               navigate("/login", { replace: true });
//             }}
//             className="text-center text-sm text-gray-500 mt-5 cursor-pointer hover:underline"
//           >
//             Back to login
//           </p>
//         </div>
//       </motion.div>
//     </div>
//   );
// };

// export default VerifyTwoFactor;

import React, { useContext, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { FiArrowRight, FiCheckCircle, FiShield } from "react-icons/fi";
import { UserContext } from "../component/UserContext";

const VerifyTwoFactor = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useContext(UserContext);

  const userId =
    location.state?.userId || localStorage.getItem("twoFactorUserId");

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const finishLoginRedirect = (data) => {
    const userRole = data?.role || "user";

    if (userRole === "admin") {
      navigate("/admin/dashboard", { replace: true });
      return;
    }

    navigate("/dashboard", { replace: true });
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");

    if (!userId) {
      setError("Session expired. Please login again.");
      return;
    }

    if (!code.trim() || code.length !== 6) {
      setError("Please enter a valid 6-digit code.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "https://email-syncing-backend.vercel.app/auth/2fa/verify-login",
        {
          userId,
          token: code,
        }
      );

      const { token, data } = response.data;

      const TWO_DAYS = 2 * 24 * 60 * 60 * 1000;
      const expiryTime = Date.now() + TWO_DAYS;

      localStorage.setItem("usertoken", token);
      localStorage.setItem("userid", data._id);
      localStorage.setItem("loginExpiry", expiryTime.toString());
      localStorage.removeItem("twoFactorUserId");

      setUser(data);
      finishLoginRedirect(data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Invalid verification code"
      );
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
            onClick={() => {
              localStorage.removeItem("twoFactorUserId");
              navigate("/login", { replace: true });
            }}
            className="rounded-lg px-3 py-2 text-[13px] font-semibold leading-none text-zinc-950 transition hover:bg-zinc-100"
          >
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
                <FiShield className="text-2xl" />
              </div>

              <div className="mb-7 text-center">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/80 px-3.5 py-1.5 text-xs font-bold text-zinc-700 shadow-sm backdrop-blur">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#6F4BFF]" />
                  Secure login
                </div>

                <h1 className="text-[38px] font-semibold leading-[0.98] tracking-[-0.06em] text-zinc-950 sm:text-5xl">
                  Two-Step Verification
                </h1>

                <p className="mx-auto mt-5 max-w-sm text-sm font-medium leading-6 text-zinc-600 sm:text-base">
                  Enter the 6-digit code from your authenticator app to continue
                  to your account.
                </p>
              </div>

              {error && (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm font-semibold text-red-700">
                  {error}
                </div>
              )}

              <form onSubmit={handleVerify} className="space-y-4">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  onChange={(e) =>
                    setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder="••••••"
                  autoFocus
                  className="h-14 w-full rounded-xl border border-zinc-200 bg-white px-4 text-center text-2xl font-semibold tracking-[0.45em] text-zinc-950 shadow-sm outline-none transition placeholder:text-zinc-300 focus:border-[#6F4BFF] focus:ring-4 focus:ring-violet-100"
                />

                <button
                  type="submit"
                  disabled={loading}
                  className={`inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg px-4 text-[13px] font-semibold text-white shadow-[0_7px_18px_rgba(111,75,255,0.28)] transition ${
                    loading
                      ? "cursor-not-allowed bg-zinc-400 shadow-none"
                      : "bg-[#6F4BFF] hover:bg-[#6242E8]"
                  }`}
                >
                  {loading ? "Verifying..." : "Verify code"}
                  {!loading && <FiArrowRight className="text-[13px]" />}
                </button>
              </form>

              <div className="mt-7 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#F7F7F8] ring-1 ring-zinc-200">
                    <FiCheckCircle className="text-[13px] text-[#6F4BFF]" />
                  </span>

                  <p className="text-sm font-medium leading-6 text-zinc-600">
                    This extra step keeps your Replex Engine account protected
                    from unauthorized access.
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
      <path
        d="M72 140H222L292 210H474L545 140H690"
        stroke="currentColor"
        strokeWidth="1"
      />
      <path
        d="M1430 140H1278L1208 210H1026L955 140H810"
        stroke="currentColor"
        strokeWidth="1"
      />
      <path
        d="M260 460H430L500 525H658V392H750"
        stroke="currentColor"
        strokeWidth="1"
      />
      <path
        d="M1240 460H1070L1000 525H842V392H750"
        stroke="currentColor"
        strokeWidth="1"
      />
      <path
        d="M750 0V105M750 495V600M520 0V105L590 175V245M980 0V105L910 175V245"
        stroke="currentColor"
        strokeWidth="1"
      />

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

export default VerifyTwoFactor;
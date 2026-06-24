import React, { useContext, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { FiShield } from "react-icons/fi";
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
    const setupCompleted = data?.setup?.setupCompleted === true;
    const steps = data?.setup?.steps || [];

    if (userRole === "admin") {
      navigate("/admin/dashboard", { replace: true });
      return;
    }

    if (setupCompleted) {
      navigate("/dashboard", { replace: true });
      return;
    }

    const nextStep =
      steps.find((s) => s.status === "skipped" || s.status === "incomplete")
        ?.step || 1;

    navigate(`/setup?step=${nextStep}`, { replace: true });
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
    <div className="min-h-screen flex bg-gradient-to-br from-purple-600 to-fuchsia-600 relative overflow-hidden">
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="w-full lg:w-1/2 bg-white p-10 flex flex-col justify-center z-10 shadow-xl"
      >
        <div className="max-w-md w-full mx-auto">
          <div className="flex justify-center mb-5">
            <div className="h-14 w-14 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center text-2xl">
              <FiShield />
            </div>
          </div>

          <h2 className="text-4xl font-extrabold mb-4 text-gray-800 text-center">
            Two-Step Verification
          </h2>

          <p className="text-gray-500 text-center mb-8">
            Enter the 6-digit code from your authenticator app.
          </p>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-5">
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) =>
                setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              placeholder="Enter 6-digit code"
              className="w-full border rounded-lg px-4 py-3 text-center tracking-[0.4em] text-xl font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
              autoFocus
            />

            <button
              type="submit"
              disabled={loading}
              className={`w-full ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-pink-500 to-purple-600"
              } text-white py-3 rounded-lg font-semibold shadow-md`}
            >
              {loading ? "Verifying..." : "Verify"}
            </button>
          </form>

          <p
            onClick={() => {
              localStorage.removeItem("twoFactorUserId");
              navigate("/login", { replace: true });
            }}
            className="text-center text-sm text-gray-500 mt-5 cursor-pointer hover:underline"
          >
            Back to login
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyTwoFactor;
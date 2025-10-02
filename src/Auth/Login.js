import React, { useContext, useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { UserContext } from "../component/UserContext";

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
      const response = await axios.post(
        "https://email-syncing-backend.vercel.app/auth/signIn",
        { email, password }
      );

      if (response.status === 200) {
        const { token, data } = response.data;

        localStorage.setItem("usertoken", token);
        localStorage.setItem("userid", data._id);

        setUser(data); 

        navigate("/organization", { replace: true });
      }
    } catch (error) {
      setError(
        error.response?.data?.error || "Login failed. Please try again."
      );
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Section */}
      <div className="w-full lg:w-1/2 bg-white p-10 flex flex-col justify-center">
        <div className="max-w-md w-full mx-auto">
          <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">
            Welcome Back
          </h2>
          <p className="text-gray-500 text-center mb-8">
            Please sign in to continue
          </p>

          {error && (
            <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
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

            {/* Password */}
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

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:opacity-90 transition"
            >
              Sign in
            </button>
          </form>

          {/* Create account */}
          <p
            className="text-center text-sm text-purple-600 mt-5 cursor-pointer hover:underline"
            onClick={handleClick}
          >
            Create an account
          </p>

          {/* Extra Links */}
          <div className="mt-6 text-sm text-gray-500 text-center space-y-1">
            <p className="hover:underline cursor-pointer">Forgot password?</p>
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
          </div>
        </div>
      </div>

      {/* Right Section (Image) */}
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

export default LoginPage;

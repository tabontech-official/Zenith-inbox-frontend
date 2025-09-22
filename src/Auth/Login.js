import React, { useState } from "react";
import { FaEye, FaEyeSlash, FaFacebookF, FaGithub, FaKey, FaGoogle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";  // Import Axios for API requests

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/register");
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   try {
  //     const response = await axios.post("https://email-syncing-backend.vercel.app/auth/signIn", {
  //       email,
  //       password,
  //     });

  //     if (response.status === 200) {
  //       navigate("/organization");
  //     }
  //   } catch (error) {
  //     // Handle any errors during login
  //     setError(error.response?.data?.error || "Login failed. Please try again.");
  //   }
  // };

  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const response = await axios.post(
      "https://email-syncing-backend.vercel.app/auth/signIn",
      { email, password }
    );

    if (response.status === 200) {
      const { token, user } = response.data;

      // Save everything in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("userid", user._id);
      localStorage.setItem("email", user.email);
      localStorage.setItem("name", user.name || "");

      // Navigate to dashboard
      navigate("/organization");
    }
  } catch (error) {
    setError(
      error.response?.data?.error || "Login failed. Please try again."
    );
  }
};

  return (
    <div className="min-h-screen flex">
      <div className="w-full lg:w-1/2 bg-white p-10 flex flex-col justify-center">
        <div className="max-w-md w-full mx-auto">
          <h2 className="text-3xl font-semibold mb-6 text-gray-800">Sign in</h2>

          {/* Error Message */}
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                className="w-full border rounded px-3 py-2"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full border rounded px-3 py-2"
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
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-lg font-semibold mt-4"
            >
              Sign in
            </button>
          </form>

          <p 
            className="text-center text-sm text-pink-500 mt-3 cursor-pointer hover:underline"
            onClick={handleClick}
          >
            CREATE AN ACCOUNT
          </p>

          <div className="my-6 border-t" />

          {/* Social Media Login Buttons */}
          <div className="space-y-3">
            <button className="w-full flex items-center justify-center border px-4 py-3 rounded-lg bg-white hover:bg-gray-100 transition">
              <FaGoogle className="text-red-500 w-5 h-5 mr-2" />
              Sign in with Google
            </button>

            <button className="w-full flex items-center justify-center bg-[#3b5998] text-white px-4 py-3 rounded-lg hover:bg-[#2d4373] transition">
              <FaFacebookF className="w-5 h-5 mr-2" />
              Sign in with Facebook
            </button>

            <button className="w-full flex items-center justify-center bg-gray-800 text-white px-4 py-3 rounded-lg hover:bg-gray-700 transition">
              <FaGithub className="w-5 h-5 mr-2" />
              Sign in with GitHub
            </button>

            <button className="w-full flex items-center justify-center bg-black text-white px-4 py-3 rounded-lg hover:bg-gray-900 transition">
              <FaKey className="w-5 h-5 mr-2" />
              Sign in with SSO
            </button>
          </div>

          <div className="mt-6 text-sm text-gray-500 space-y-1">
            <p>Lost password</p>
            <p>Resend verification email</p>
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

      {/* Image Section */}
      <div className="hidden lg:flex w-2/3 bg-gradient-to-br from-purple-600 to-fuchsia-600 text-white items-center justify-center relative p-0">
        <div className="w-full text-center">
          <img
            src="https://images.ctfassets.net/un655fb9wln6/5yk7rxBv0Nw98EVV0tI0pi/cf7cc21501065fe11153936be521831a/Waves_25_Hero_transparent.png?w=1920&q=75"
            alt="Speaker 3"
            className="w-full max-w-5xl mx-auto"
          />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

import React, { useState } from "react";
import {
  FaEye,
  FaEyeSlash,
  FaFacebookF,
  FaGithub,
  FaGoogle,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/login');
  };
  return (
    <div className="min-h-screen flex">
      <div className="w-full lg:w-1/2 bg-white p-10 flex flex-col justify-center">
        <div className="max-w-md w-full mx-auto">
          <h2 className="text-3xl font-semibold mb-6 text-gray-800">Sign up</h2>

          <div className="flex justify-between gap-5">
            <button className="w-full flex items-center justify-center border px-4 py-3 rounded-lg bg-white hover:bg-gray-100 transition">
              <FaGoogle className="text-red-500 w-5 h-5 mr-2" />
              Sign up with Google
            </button>
            <button className="bg-[#2D477A]  px-4 rounded-full flex items-center justify-center">
              <FaFacebookF className="text-white font-[15px]" />
            </button>

            <button className="bg-gray-800  px-4 rounded-full flex items-center justify-center">
              <FaGithub className="text-white font-[15px]" />
            </button>
          </div>

          <div className="text-center text-gray-500 text-sm my-4">or</div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              placeholder="John Doe"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              className="w-full border rounded px-3 py-2"
              placeholder="you@example.com"
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
              />
              <span
                className="absolute right-3 top-2.5 cursor-pointer text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>

          <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold mt-4 transition">
            Sign up
          </button>

          <p className="text-center text-sm text-gray-600 mt-4">
            Already have an account?{" "}
            <span onClick={handleClick} className="text-purple-600 hover:underline cursor-pointer">
              Sign in
            </span>
          </p>
        </div>
      </div>

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

export default RegisterPage;

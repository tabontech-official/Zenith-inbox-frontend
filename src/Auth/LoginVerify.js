import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const LoginVerify = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("usertoken", token);
      toast.success("Login verified successfully!");
      setTimeout(() => navigate("/dashboard"), 1000);
    } else {
      toast.error("Invalid or expired verification link.");
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow text-center">
        <h2 className="text-2xl font-semibold text-purple-600 mb-2">
          Verifying your login...
        </h2>
        <p className="text-gray-500">Please wait a moment.</p>
      </div>
    </div>
  );
};

export default LoginVerify;

import React from "react";
import { FiMail } from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) =>
    location.pathname === path
      ? "text-white"
      : "text-gray-400 hover:text-white";

  return (
    <header
      className="fixed top-6 inset-x-0 max-w-5xl mx-auto z-50
                 px-6 py-3 rounded-full
                 bg-white/[0.03] border border-white/10
                 backdrop-blur-xl shadow-2xl
                 flex items-center justify-between"
    >
      <div
        onClick={() => navigate("/")}
        className="flex items-center gap-2 cursor-pointer"
      >
        {" "}
        <div className="p-1.5 text-indigo-500  rounded-lg group-hover:rotate-12 transition-transform">
          <FiMail className="text-indigo-500 text-2xl" />
        </div>
        <span className="font-bold tracking-tight text-lg">Replex Engine</span>
      </div>

      {/* NAV */}
      <nav className="hidden md:flex gap-8 text-sm font-medium">
        <button
          onClick={() => navigate("/product")}
          className={isActive("/product")}
        >
          Product
        </button>
        <button
          onClick={() => navigate("/developer")}
          className={isActive("/developer")}
        >
          Developers
        </button>
        <button
          onClick={() => navigate("/pricing")}
          className={isActive("/pricing")}
        >
          Pricing
        </button>
      </nav>

      {/* CTA */}
      <button
        onClick={() => navigate("/login")}
        className="px-5 py-2 text-sm font-bold
                   bg-white text-black rounded-full
                   hover:bg-purple-50 transition"
      >
        Get Started
      </button>
    </header>
  );
};

export default Header;

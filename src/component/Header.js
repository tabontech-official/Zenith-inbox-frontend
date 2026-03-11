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
          <header className="fixed top-6 inset-x-0 max-w-6xl mx-auto z-50 px-6 py-2.5 bg-white/[0.03] border border-white/10 backdrop-blur-xl rounded-xl flex justify-between items-center">

      <div
        onClick={() => navigate("/")}
        className="flex items-center gap-2 cursor-pointer"
      >
        {" "}
        <div className="flex items-center gap-2 font-semibold text-lg">
                <FiMail className="text-indigo-400 text-xl" />
                Replex Engine
              </div>
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
          className="px-5 py-2 bg-white text-black rounded-xl text-sm font-semibold hover:bg-gray-200"
        >
          Get Started
        </button>
    </header>
  );
};

export default Header;

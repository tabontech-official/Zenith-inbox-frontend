import React from "react";
import {
  FiArrowRight,
  FiChevronDown,
} from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navLinks = [
    { label: "Product", route: "/product" },
    { label: "Developers", route: "/developer" },
    { label: "Pricing", route: "/pricing" },
  ];

  const isActive = (path) =>
    location.pathname === path ? "text-[#6F4BFF]" : "text-zinc-900";

  return (
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

        <nav className="hidden flex-1 items-center gap-6 pl-5 md:flex">
          {navLinks.map((link) => (
            <button
              key={link.route}
              onClick={() => navigate(link.route)}
              className={`inline-flex items-center gap-1.5 text-[13px] font-semibold leading-none transition hover:text-zinc-600 ${isActive(
                link.route
              )}`}
            >
              {link.label}

              {["Product", "Developers"].includes(link.label) && (
                <FiChevronDown className="text-[12px] text-zinc-700" />
              )}
            </button>
          ))}
        </nav>

        <div className="flex h-full items-center gap-2">
          <button
            onClick={() => navigate("/login")}
            className="hidden rounded-lg px-3 py-2 text-[13px] font-semibold leading-none text-zinc-950 transition hover:bg-zinc-100 sm:block"
          >
            Sign in
          </button>

          <button
            onClick={() => navigate("/register")}
            className="inline-flex h-8 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 text-[13px] font-semibold leading-none text-zinc-950 shadow-[0_1px_2px_rgba(0,0,0,0.06)] transition hover:bg-zinc-50"
          >
            Start building
            <FiArrowRight className="text-[12px]" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
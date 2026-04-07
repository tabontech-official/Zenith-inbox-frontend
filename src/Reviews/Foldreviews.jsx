import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  MessageSquare,
  ShieldCheck,
  Zap,
  ChevronDown,
  ArrowRight,
  Menu,
  X,
  BarChart3,
  Globe,
  Layout,
  Smartphone,
} from "lucide-react";

const FoldLandingPage = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const logoUrl =
    "https://cdn.shopify.com/s/files/1/0725/3091/9640/files/Gemini_Generated_Image_gtoc5fgtoc5fgtoc.png?v=1774691937";
  const accentColor = "#0056FF";

  // Handle Navbar scroll effect
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFAFB] text-slate-900 font-sans selection:bg-blue-100 overflow-x-hidden">
      {/* --- PROFESSIONAL NAVBAR --- */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/80 backdrop-blur-md border-b border-slate-200 py-3"
            : "bg-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center gap-3">
            {/* <img src={logoUrl} alt="Fold Reviews Logo" className="h-10 w-auto object-contain" /> */}
            <div className="flex flex-col leading-none">
              <span className="text-lg font-black tracking-tighter text-black">
                FOLD REVIEWS
              </span>
              <span className="text-[10px] font-bold text-blue-600 tracking-[0.2em] uppercase">
                The Fold Tech
              </span>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-10">
            <div className="flex items-center gap-1 group cursor-pointer hover:text-blue-600 transition font-medium text-sm">
              Features{" "}
              <ChevronDown
                size={14}
                className="group-hover:rotate-180 transition-transform"
              />
            </div>
            <a
              href="#showcase"
              className="hover:text-blue-600 transition font-medium text-sm"
            >
              Showcase
            </a>
            <a
              href="#pricing"
              className="hover:text-blue-600 transition font-medium text-sm"
            >
              Pricing
            </a>
            <a
              href="#resources"
              className="hover:text-blue-600 transition font-medium text-sm"
            >
              Resources
            </a>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <button className="text-sm font-semibold hover:text-blue-600 transition">
              Login
            </button>
            <button className="bg-black text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-slate-800 hover:scale-105 transition-all active:scale-95 shadow-lg shadow-slate-200">
              Add to Shopify
            </button>
          </div>

          {/* Mobile Toggle */}
          <button
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-40 pb-24 px-6 overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-50 rounded-full blur-3xl opacity-50 z-0"></div>
        <div className="absolute bottom-0 left-[-5%] w-[300px] h-[300px] bg-purple-50 rounded-full blur-3xl opacity-50 z-0"></div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-white border border-slate-200 px-4 py-1.5 rounded-full shadow-sm mb-8">
              <span className="flex h-2 w-2 rounded-full bg-blue-600"></span>
              <span className="text-xs font-bold uppercase tracking-widest text-slate-600">
                New: Video Reviews Support
              </span>
            </div>

            <h1 className="text-5xl md:text-[84px] font-black leading-[1.1] tracking-tight mb-8">
              Collect Reviews that <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                Build Your Empire.
              </span>
            </h1>

            <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-12 leading-relaxed">
              Don't just collect stars. Capture emotions. Fold Reviews helps
              Shopify stores display social proof with high-end, futuristic
              widgets that double conversion rates.
            </p>

            <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
              <button className="w-full sm:w-auto bg-blue-600 text-white px-10 py-5 rounded-2xl font-bold text-lg hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all flex items-center justify-center gap-2 group">
                Install on Shopify{" "}
                <ArrowRight
                  size={20}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </button>
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full border-2 border-white bg-slate-200"
                    ></div>
                  ))}
                </div>
                <span className="text-sm font-medium text-slate-600">
                  Joined by 2,000+ merchants
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- DASHBOARD PREVIEW (GLASSMORPHISM) --- */}
      <section className="px-6 pb-32">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-6xl mx-auto rounded-[40px] border border-white p-4 bg-white/40 backdrop-blur-xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] relative"
        >
          <div className="bg-slate-900 rounded-[32px] w-full aspect-video flex flex-col overflow-hidden">
            {/* Mock Dashboard UI */}
            <div className="h-14 border-b border-slate-800 flex items-center px-6 gap-3">
              <div className="w-3 h-3 rounded-full bg-red-500/20"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/20"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/20"></div>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <BarChart3
                  size={48}
                  className="text-blue-500 mx-auto mb-4 opacity-50"
                />
                <p className="text-slate-500 font-mono text-sm tracking-widest">
                  WIDGET_ENGINE_ACTIVE
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* --- FEATURES GRID --- */}
      <section className="bg-white py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20 text-center">
            <h2 className="text-4xl font-bold mb-4">
              Why Top Stores Choose Fold
            </h2>
            <p className="text-slate-500">
              Built for speed, styled for the future.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureItem
              icon={<Zap className="text-yellow-500" />}
              title="Zero Speed Impact"
              desc="Our lightweight JS bundle ensures your store loads in milliseconds."
            />
            <FeatureItem
              icon={<Layout className="text-blue-500" />}
              title="Glassy UI Widgets"
              desc="Modern review layouts that look like they were built by a luxury agency."
            />
            <FeatureItem
              icon={<Globe className="text-green-500" />}
              title="Auto-Translation"
              desc="Display reviews in your customer's native language instantly."
            />
            <FeatureItem
              icon={<Smartphone className="text-purple-500" />}
              title="Mobile First"
              desc="A review experience optimized for the thumb, not just the mouse."
            />
          </div>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="px-6 py-24">
        <div className="max-w-5xl mx-auto bg-black rounded-[48px] p-12 md:p-24 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-[100px]"></div>
          <h2 className="text-4xl md:text-6xl font-bold mb-8 relative z-10">
            Ready to fold in <br /> more sales?
          </h2>
          <button className="bg-white text-black px-12 py-5 rounded-2xl font-black text-xl hover:bg-slate-100 transition-all relative z-10">
            Get Started Free
          </button>
          <p className="mt-8 text-slate-400 font-medium">
            No credit card required • 14-day trial
          </p>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-white border-t border-slate-100 py-20 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
          <div className="col-span-2">
            <img src={logoUrl} alt="Logo" className="h-8 mb-6" />
            <p className="text-slate-500 max-w-xs">
              Building the future of e-commerce trust systems at The Fold Tech.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-6">Product</h4>
            <ul className="space-y-4 text-slate-500 text-sm">
              <li>
                <a href="#" className="hover:text-blue-600">
                  Features
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600">
                  Integrations
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6">Company</h4>
            <ul className="space-y-4 text-slate-500 text-sm">
              <li>
                <a href="#" className="hover:text-blue-600">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600">
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureItem = ({ icon, title, desc }) => (
  <div className="group p-8 rounded-[32px] border border-slate-100 hover:border-blue-100 hover:bg-blue-50/30 transition-all duration-300">
    <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-3">{title}</h3>
    <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
  </div>
);

export default FoldLandingPage;

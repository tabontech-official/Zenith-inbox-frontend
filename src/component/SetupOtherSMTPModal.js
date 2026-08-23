import { apiFetch } from "../utils/apiClient";
import React, { useState } from "react";
import { FiEye, FiEyeOff, FiX } from "react-icons/fi";
import toast from "react-hot-toast";

const SetupOtherSMTPModal = ({ isOpen, onClose, onSuccess }) => {
const [showPassword, setShowPassword] = useState(false);

const [form, setForm] = useState({
name: "My SMTP Connection",
provider: "smtp",
email: "",
fullName: "",
username: "",
password: "",
host: "",
port: 587,
});

if (!isOpen) return null;

const handleChange = (e) => {
setForm({ ...form, [e.target.name]: e.target.value });
};

const handleSubmit = async () => {
try {
const userId = localStorage.getItem("userid");

  if (!userId) {
    toast.error("User not found. Please login again.");
    return;
  }

  const payload = { ...form, userId };

  const res = await apiFetch(
    "https://email-syncing-backend.vercel.app/auth/saveSmtpConnection",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) throw new Error("Failed to save connection");

  const data = await res.json();

  toast.success("SMTP connected successfully");

  onSuccess?.(data);
  onClose();
} catch (err) {
  console.error(err);
  toast.error("Failed to connect SMTP");
}


};

return (
  <div className="fixed inset-0 flex items-center justify-center z-50 p-4 sm:p-0">
    {/* Blurred Backdrop */}
    <div 
      className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" 
      onClick={onClose}
    ></div>

    {/* Modal Container */}
    <div className="relative bg-white rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] w-full max-w-[460px] max-h-[90vh] flex flex-col overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-300">
      
      {/* Header */}
      <div className="relative shrink-0 flex items-center justify-between px-6 py-5 bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
        <div className="relative flex items-center space-x-3">
          <div className="bg-white/20 p-2 rounded-lg backdrop-blur-md border border-white/30 shadow-inner">
            <svg className="w-5 h-5 text-white drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
          </div>
          <h2 className="font-semibold text-xl tracking-tight text-white drop-shadow-sm">Connect Other SMTP</h2>
        </div>
        <button 
          onClick={onClose}
          className="relative text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-full transition-colors"
        >
          <FiX className="text-xl" />
        </button>
      </div>

      {/* Body */}
      <div className="p-7 space-y-5 bg-gray-50/30 animate-in fade-in slide-in-from-bottom-2 duration-300 overflow-y-auto">
        <div>
          <label className="block text-[14px] font-semibold text-gray-700 mb-1.5 ml-1">Connection Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full bg-white border border-gray-200 hover:border-violet-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none px-4 py-3 rounded-xl text-[14px] text-gray-800 transition-all shadow-sm"
          />
        </div>

        <div>
          <label className="block text-[14px] font-semibold text-gray-700 mb-1.5 ml-1">Email Address</label>
          <input
            type="email"
            name="email"
            placeholder="your@email.com"
            value={form.email}
            onChange={handleChange}
            className="w-full bg-white border border-gray-200 hover:border-violet-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none px-4 py-3 rounded-xl text-[14px] text-gray-800 transition-all shadow-sm"
          />
        </div>

        <div>
          <label className="block text-[14px] font-semibold text-gray-700 mb-1.5 ml-1">Full Name</label>
          <input
            type="text"
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            className="w-full bg-white border border-gray-200 hover:border-violet-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none px-4 py-3 rounded-xl text-[14px] text-gray-800 transition-all shadow-sm"
          />
        </div>

        <div>
          <label className="block text-[14px] font-semibold text-gray-700 mb-1.5 ml-1">Username</label>
          <input
            type="text"
            name="username"
            value={form.username}
            onChange={handleChange}
            className="w-full bg-white border border-gray-200 hover:border-violet-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none px-4 py-3 rounded-xl text-[14px] text-gray-800 transition-all shadow-sm"
          />
        </div>

        <div>
          <label className="block text-[14px] font-semibold text-gray-700 mb-1.5 ml-1">Password / App Password</label>
          <div className="relative group">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full bg-white border border-gray-200 hover:border-violet-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none px-4 py-3 pr-11 rounded-xl text-[14px] text-gray-800 transition-all shadow-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-400 hover:text-violet-500 transition-colors bg-white px-1"
            >
              {showPassword ? <FiEyeOff className="text-lg" /> : <FiEye className="text-lg" />}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-5 pt-1">
          <div>
            <label className="block text-[14px] font-semibold text-gray-700 mb-1.5 ml-1">SMTP Host</label>
            <input
              type="text"
              name="host"
              placeholder="smtp.example.com"
              value={form.host}
              onChange={handleChange}
              className="w-full bg-gray-50/50 border border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none px-4 py-3 rounded-xl text-[14px] text-gray-800 transition-all shadow-sm"
            />
          </div>

          <div>
            <label className="block text-[14px] font-semibold text-gray-700 mb-1.5 ml-1">Port</label>
            <input
              type="number"
              name="port"
              value={form.port}
              onChange={handleChange}
              className="w-full bg-gray-50/50 border border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none px-4 py-3 rounded-xl text-[14px] text-gray-800 transition-all shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-3 px-7 py-5 bg-gray-50/80 border-t border-gray-100 backdrop-blur-md">
        <button
          onClick={onClose}
          className="px-6 py-2.5 text-[14px] font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm"
        >
          Cancel
        </button>

        <button
          onClick={handleSubmit}
          className="px-6 py-2.5 text-[14px] font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl shadow-lg shadow-violet-500/30 hover:shadow-xl hover:shadow-violet-500/40 hover:from-violet-700 hover:to-indigo-700 transform active:scale-95 transition-all"
        >
          Save Connection
        </button>
      </div>
    </div>
  </div>
);
};

export default SetupOtherSMTPModal;

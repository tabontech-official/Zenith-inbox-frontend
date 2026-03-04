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

  const res = await fetch(
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

return ( <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"> <div className="bg-white rounded-lg shadow-xl w-[440px] overflow-hidden">

    {/* Header */}
    <div className="flex items-center justify-between px-5 py-3 bg-indigo-600 text-white">
      <h2 className="font-semibold text-lg">Connect Other SMTP</h2>
      <button onClick={onClose}>
        <FiX className="text-lg" />
      </button>
    </div>

    <div className="p-6 space-y-4">

      <div>
        <label className="text-sm font-medium">Connection Name</label>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="text-sm font-medium">Email Address</label>
        <input
          type="email"
          name="email"
          placeholder="your@email.com"
          value={form.email}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="text-sm font-medium">Full Name</label>
        <input
          type="text"
          name="fullName"
          value={form.fullName}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="text-sm font-medium">Username</label>
        <input
          type="text"
          name="username"
          value={form.username}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="text-sm font-medium">Password / App Password</label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={form.password}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 text-sm pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2.5 text-gray-500"
          >
            {showPassword ? <FiEyeOff /> : <FiEye />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">SMTP Host</label>
          <input
            type="text"
            name="host"
            placeholder="smtp.example.com"
            value={form.host}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Port</label>
          <input
            type="number"
            name="port"
            value={form.port}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 text-sm"
          />
        </div>
      </div>
    </div>

    <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50">
      <button
        onClick={onClose}
        className="px-4 py-2 border rounded text-sm"
      >
        Cancel
      </button>

      <button
        onClick={handleSubmit}
        className="px-4 py-2 bg-indigo-600 text-white rounded text-sm"
      >
        Save Connection
      </button>
    </div>
  </div>
</div>


);
};

export default SetupOtherSMTPModal;

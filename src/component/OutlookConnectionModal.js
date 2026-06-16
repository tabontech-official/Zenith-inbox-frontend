import React, { useState } from "react";
import toast from "react-hot-toast";
import { FaMicrosoft } from "react-icons/fa";
import { FiEye, FiEyeOff, FiX } from "react-icons/fi";

const OutlookConnectionModal = ({
  isOpen,
  onClose,
  onSuccess,
  editMode = false,
  connectionData = null,
  onUpdated,
}) => {
  const [connectionType, setConnectionType] = useState("other");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState("active");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "My Outlook Connection",
    provider: "smtp",
    email: "",
    fullName: "",
    username: "",
    password: "",
    host: "smtp.office365.com",
    port: "",
  });

  React.useEffect(() => {
    if (isOpen) {
      if (editMode && connectionData) {
        setForm({
          name: connectionData.name || "",
          provider: connectionData.provider || "smtp",
          email: connectionData.email || "",
          fullName: connectionData.fullName || "",
          username: connectionData.smtp?.username || "",
          password: "",
          host: connectionData.smtp?.host || "",
          port: connectionData.smtp?.port || "",
        });
        setStatus(connectionData.status || "active");
      } else {
        setConnectionType("other");
        setForm({
          name: "My Outlook Connection",
          provider: "smtp",
          email: "",
          fullName: "",
          username: "",
          password: "",
          host: "smtp.office365.com",
          port: "",
        });
        setStatus("active");
      }
    }
  }, [isOpen, editMode, connectionData]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleManualSubmit = async () => {
    try {
      const userId = localStorage.getItem("userid");
      if (!userId) {
        alert("User not found. Please login again.");
        return;
      }

      const payload = { ...form, provider: "smtp", userId };

      const res = await fetch(
        "http://localhost:5000/auth/saveSmtpConnection",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error("Failed to save connection");
      const data = await res.json();

      console.log("SMTP Outlook connection saved:", data);
      onSuccess?.(data);
      onClose();
    } catch (err) {
      console.error("Error saving connection:", err);
      toast.error("Failed to save connection");
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Connection name is required");
      return;
    }
    const isSmtp = connectionData?.provider === "smtp";
    let payload = {};

    if (isSmtp) {
      if (!form.email.trim()) {
        toast.error("Email is required");
        return;
      }
      payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        status: status,
        smtp: {
          host: form.host.trim(),
          port: Number(form.port),
          username: form.username.trim(),
        }
      };
      if (form.password.trim() !== "") {
        payload.smtp.password = form.password.trim();
      }
    } else {
      payload = {
        name: form.name.trim(),
        status: status,
      };
    }

    try {
      setSubmitting(true);
      const res = await fetch(
        `http://localhost:5000/auth/connection/${connectionData._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || data.message || "Failed to update connection");
      }

      toast.success("Outlook connection updated successfully!");
      onUpdated?.();
      onClose();
    } catch (err) {
      console.error("Error updating connection:", err);
      toast.error(err.message || "Failed to update connection");
    } finally {
      setSubmitting(false);
    }
  };

  const handleMicrosoftOAuth = () => {
    const userId = localStorage.getItem("userid");
    if (!userId) {
      alert("User not found. Please login again.");
      return;
    }
    const scenarioId = localStorage.getItem("scenarioId");
    localStorage.setItem("shopifyEditingMode", scenarioId ? "update" : "add");
    const activeModule =
      localStorage.getItem("activeShopifyModule") || "Initial Email";
    localStorage.setItem("activeShopifyModule", activeModule);

    try {
      const routerBranches = JSON.parse(
        localStorage.getItem("routerBranchesState") || "[]"
      );
      localStorage.setItem(
        "shopifyScenarioState",
        JSON.stringify({ routerBranches })
      );
      console.log(
        " Saved routerBranches before Microsoft OAuth:",
        routerBranches
      );
    } catch (err) {
      console.error(" Error saving routerBranches before redirect:", err);
    }

    onClose();

    const currentPath = window.location.pathname.replace(/^\//, "");

    window.location.href = `http://localhost:5000/auth/outlook?userId=${userId}&redirect=${encodeURIComponent(
      currentPath
    )}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-[440px] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="flex items-center space-x-2">
            <FaMicrosoft className="text-white text-xl" />
            <h2 className="font-semibold text-lg">{editMode ? "Edit Outlook Connection" : "Connect Outlook"}</h2>
          </div>
          <button onClick={onClose}>
            <FiX className="text-white text-lg hover:text-gray-200" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {!editMode && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Connection Type
              </label>
              <select
                value={connectionType}
                onChange={(e) => setConnectionType(e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="other">Other (Custom SMTP)</option>
                <option value="microsoft">Microsoft 365 (OAuth)</option>
              </select>
            </div>
          )}

          {/* Add Mode: Custom SMTP OR Edit Mode: SMTP */}
          {((!editMode && connectionType === "other") || (editMode && connectionData?.provider === "smtp")) && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Connection Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="yourname@outlook.com"
                />
              </div>

              {!editMode && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Your full name"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Usually same as email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password / App Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none pr-10"
                    placeholder={editMode ? "Leave blank to keep current password" : "Enter password"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  If MFA is enabled, use an Outlook App Password.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SMTP Host
                  </label>
                  <input
                    type="text"
                    name="host"
                    value={form.host}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Port
                  </label>
                  <input
                    type="number"
                    name="port"
                    value={form.port}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              {editMode && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="disconnected">Disconnected</option>
                  </select>
                </div>
              )}
            </>
          )}

          {/* Edit Mode: OAuth Outlook */}
          {editMode && connectionData?.provider === "outlook" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Connection Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  disabled
                  className="w-full border rounded px-3 py-2 text-sm bg-gray-100 text-gray-500 cursor-not-allowed outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="active">Active</option>
                  <option value="disconnected">Disconnected</option>
                </select>
              </div>
            </>
          )}

          {/* Add Mode: Microsoft OAuth */}
          {!editMode && connectionType === "microsoft" && (
            <div className="flex flex-col items-center justify-center py-6">
              <p className="text-sm text-gray-600 mb-3 text-center">
                Connect your Outlook (Microsoft 365) account securely using
                OAuth.
              </p>
              <button
                onClick={handleMicrosoftOAuth}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded shadow"
              >
                <FaMicrosoft />
                <span>Connect with Microsoft</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer actions */}
        {(editMode || connectionType === "other") && (
          <div className="flex justify-end space-x-3 px-6 py-4 border-t bg-gray-50">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm border rounded hover:bg-gray-100"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              onClick={editMode ? handleEditSubmit : handleManualSubmit}
              disabled={submitting}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold"
            >
              {editMode ? (submitting ? "Saving..." : "Save Changes") : "Save Connection"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OutlookConnectionModal;

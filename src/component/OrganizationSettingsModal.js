import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX } from "react-icons/fi";
import toast from "react-hot-toast";
import axios from "axios";

const OrganizationSettingsModal = ({ open, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    organizationName: "",
    region: "",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "",
    country: "",
    partnerLink: "",
  });

  useEffect(() => {
    if (open) fetchExistingOrganization();
  }, [open]);

  const fetchExistingOrganization = async () => {
    const userId = localStorage.getItem("userid");
    if (!userId) return;

    try {
      const res = await axios.get(
        `http://localhost:5000/auth/organization/get/${userId}`
      );

      if (res.data?.success && res.data.data) {
        const org = res.data.data;
        setFormData({
          organizationName: org.organizationName || "",
          region: org.Region || "",
          timezone: org.TimeZone || Intl.DateTimeFormat().resolvedOptions().timeZone,
          country: org.country || "",
          partnerLink: org.PartnerLink || "",
        });
      }
    } catch (err) {
      console.warn("No existing organization found or error fetching:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userId = localStorage.getItem("userid");

    if (!userId) {
      toast.error("User ID not found — please log in again.");
      return;
    }
    if (!formData.organizationName.trim()) {
      toast.error("Organization name is required!");
      return;
    }

    try {
      setLoading(true);
      toast.loading("Saving organization...", { id: "org" });

      const res = await axios.post(
        "http://localhost:5000/auth/organization/create",
        {
          userId,
          organizationName: formData.organizationName,
          Region: formData.region,
          TimeZone: formData.timezone,
          country: formData.country,
          PartnerLink: formData.partnerLink,
        }
      );

      toast.dismiss("org");

      if (res.data.success) {
        toast.success("Organization saved successfully!");
        onClose();
      } else {
        toast.error(res.data.message || "Failed to save organization.");
      }
    } catch (err) {
      console.error("createOrganization Error:", err);
      toast.dismiss("org");
      toast.error("Error while creating organization.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center bg-black/40 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 relative"
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <FiX className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Organization Settings
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Organization Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="organizationName"
                  value={formData.organizationName}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Region
                </label>
                <input
                  type="text"
                  name="region"
                  value={formData.region}
                  onChange={handleChange}
                  placeholder="e.g. South Asia"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Timezone <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="timezone"
                  value={formData.timezone}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  placeholder="Asia/Karachi"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  placeholder="Pakistan"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Partner Link
                </label>
                <input
                  type="url"
                  name="partnerLink"
                  value={formData.partnerLink}
                  onChange={handleChange}
                  placeholder="https://partner.example.com"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-5 py-2 text-sm font-semibold text-white rounded-lg transition ${
                    loading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-700"
                  }`}
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OrganizationSettingsModal;
 
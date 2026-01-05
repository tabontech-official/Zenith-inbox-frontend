import React, { useContext, useState } from "react";
import {
  FiUser,
  FiMail,
  FiClock,
  FiEdit3,
  FiSave,
  FiGlobe,
  FiPhone,
  FiMessageCircle,
  FiBriefcase,
  FiMapPin,
  FiLink,
} from "react-icons/fi";
import { UserContext } from "../component/UserContext";
import Sidebar from "../component/Sidebar";
import Navbar from "../component/Navbar";
import toast from "react-hot-toast";

const Profile = () => {
  const { user, organization, updateUser, updateOrganization, loading } =
    useContext(UserContext);

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    // User
    fullName: user?.fullName || "",
    email: user?.email || "",
    role: user?.role || "",
    phone: user?.phone || "",
    whatsapp: user?.whatsapp || "",
    timeZone: organization?.TimeZone || "UTC",

    // Organization
    organizationName: organization?.organizationName || "",
    website: organization?.website || "",
    region: organization?.Region || "",
    country: organization?.country || "",
    address: organization?.address || "",
    supportEmail: organization?.supportEmail || "",
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSave = async () => {
    try {
      setSaving(true);

      const res = await fetch(
        `http://localhost:5000/auth/updateUserAndOrganization/${user._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fullName: formData.fullName,
            role: formData.role,
            phone: formData.phone,
            whatsapp: formData.whatsapp,

            organizationName: formData.organizationName,
            website: formData.website,
            Region: formData.region,
            country: formData.country,
            address: formData.address,
            supportEmail: formData.supportEmail,
            TimeZone: formData.timeZone,
          }),
        }
      );

      const result = await res.json();

      if (!res.ok) throw new Error(result.message);

      updateUser(result.data.user);
      updateOrganization(result.data.organization);

      toast.success("Profile updated successfully");
      setEditing(false);
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Sidebar />

      <div className="flex-1 flex flex-col md:ml-64">
        <div className="hidden sm:block">
          <Navbar />
        </div>

        <div className="flex-1 p-10">
          <div className="bg-white rounded-2xl shadow-xl p-10 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex flex-col items-center border-b pb-8">
              <div className="w-24 h-24 bg-indigo-600 text-white flex items-center justify-center rounded-full text-3xl font-bold mb-4">
                {formData.fullName.slice(0, 2).toUpperCase()}
              </div>

              <h1 className="text-2xl font-bold text-gray-800">
                {formData.fullName}
              </h1>

              <p className="text-sm text-gray-500 mt-1">
                {formData.organizationName || "No organization"}
              </p>

              <button
                onClick={() =>
                  editing ? handleSave() : setEditing(true)
                }
                disabled={saving}
                className="mt-4 flex items-center gap-2 text-sm px-5 py-2 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition disabled:opacity-70"
              >
                {editing ? <FiSave /> : <FiEdit3 />}
                {editing ? (saving ? "Saving..." : "Save Changes") : "Edit Profile"}
              </button>
            </div>

            {/* Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-10">
              <ProfileField label="Full Name" icon={<FiUser />} editing={editing} name="fullName" value={formData.fullName} onChange={handleChange} />
              <ProfileField label="Email" icon={<FiMail />} value={formData.email} readOnly />

              <ProfileField label="Role / Title" icon={<FiBriefcase />} editing={editing} name="role" value={formData.role} onChange={handleChange} />
              <ProfileField label="Phone" icon={<FiPhone />} editing={editing} name="phone" value={formData.phone} onChange={handleChange} />

              <ProfileField label="WhatsApp" icon={<FiMessageCircle />} editing={editing} name="whatsapp" value={formData.whatsapp} onChange={handleChange} />
              <ProfileField label="Time Zone" icon={<FiClock />} editing={editing} name="timeZone" value={formData.timeZone} onChange={handleChange} select />

              <ProfileField label="Organization Name" icon={<FiUser />} editing={editing} name="organizationName" value={formData.organizationName} onChange={handleChange} />
              <ProfileField label="Website" icon={<FiLink />} editing={editing} name="website" value={formData.website} onChange={handleChange} />

              <ProfileField label="Region" icon={<FiGlobe />} editing={editing} name="region" value={formData.region} onChange={handleChange} />
              <ProfileField label="Country" icon={<FiGlobe />} editing={editing} name="country" value={formData.country} onChange={handleChange} />

              <ProfileField label="Address" icon={<FiMapPin />} editing={editing} name="address" value={formData.address} onChange={handleChange} />
              <ProfileField label="Support Email" icon={<FiMail />} editing={editing} name="supportEmail" value={formData.supportEmail} onChange={handleChange} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProfileField = ({
  label,
  icon,
  name,
  value,
  onChange,
  editing,
  readOnly,
  select,
}) => (
  <div className="flex flex-col gap-2">
    <label className="text-sm text-gray-500">{label}</label>
    <div className="flex items-center gap-2 border rounded-lg px-3 py-2 bg-gray-50">
      <span className="text-gray-400">{icon}</span>

      {editing && !readOnly ? (
        select ? (
          <select
            name={name}
            value={value}
            onChange={onChange}
            className="flex-1 bg-transparent outline-none text-gray-700"
          >
            <option value="UTC">UTC</option>
            <option value="America/New_York">America/New_York</option>
            <option value="Europe/London">Europe/London</option>
            <option value="Asia/Karachi">Asia/Karachi</option>
            <option value="Asia/Dubai">Asia/Dubai</option>
          </select>
        ) : (
          <input
            type="text"
            name={name}
            value={value}
            onChange={onChange}
            className="flex-1 bg-transparent outline-none text-gray-700"
          />
        )
      ) : (
        <span className="text-gray-800">{value || "—"}</span>
      )}
    </div>
  </div>
);

export default Profile;

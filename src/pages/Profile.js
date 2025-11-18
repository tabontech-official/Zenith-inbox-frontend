import React, { useContext, useState } from "react";
import {
  FiUser,
  FiMail,
  FiClock,
  FiEdit3,
  FiSave,
  FiGlobe,
} from "react-icons/fi";
import { UserContext } from "../component/UserContext";
import Sidebar from "../component/Sidebar";
import Navbar from "../component/Navbar";
import toast from "react-hot-toast";
const Profile = () => {
  const { user, organization, updateUser, updateOrganization, loading } =
    useContext(UserContext);
  const [editing, setEditing] = useState(false);

  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    organizationName: organization?.organizationName || "",
    region: organization?.Region || "",
    country: organization?.country || "",
    timeZone: organization?.TimeZone || "UTC",
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSave = async () => {
    try {
      const res = await fetch(
        `https://email-syncing-backend.vercel.app/auth/updateUserAndOrganization/${user._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fullName: formData.fullName,
            organizationName: formData.organizationName,
            Region: formData.region,
            country: formData.country,
            TimeZone: formData.timeZone,
          }),
        }
      );

      const result = await res.json();

      if (res.ok && result.success) {
        toast.success("successfully updated profile");
        updateUser(result.data.user);
        updateOrganization(result.data.organization);
        setEditing(false);
      } else {
        console.error("Failed to update profile:", result.message);
      }
    } catch (err) {
      console.error("Error updating profile:", err);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen text-gray-600">
        Loading profile...
      </div>
    );

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 font-inter">
  
        <Sidebar />

      <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300">
           <div className="hidden sm:block">
          <Navbar />
        </div>
        

        <div className="flex-1 p-10">
          <div className="bg-white rounded-xl shadow-lg p-10 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex flex-col items-center border-b pb-8">
              <div className="w-24 h-24 bg-purple-600 text-white flex items-center justify-center rounded-full text-3xl font-bold mb-4">
                {formData.fullName.slice(0, 2).toUpperCase()}
              </div>

              <h1 className="text-2xl font-bold text-gray-800">
                {formData.fullName}
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                {formData.organizationName || "No organization"}
              </p>

              <button
                onClick={() => (editing ? handleSave() : setEditing(true))}
                className="mt-4 flex items-center gap-2 text-sm px-4 py-2 rounded-md text-white bg-purple-600 hover:bg-purple-700 transition"
              >
                {editing ? <FiSave /> : <FiEdit3 />}
                {editing ? "Save Changes" : "Edit Profile"}
              </button>
            </div>

            {/* Info Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-10">
              <ProfileField
                label="Full Name"
                icon={<FiUser />}
                editing={editing}
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
              />
              <ProfileField
                label="Email"
                icon={<FiMail />}
                value={formData.email}
                readOnly
              />
              <ProfileField
                label="Organization"
                icon={<FiUser />}
                editing={editing}
                name="organizationName"
                value={formData.organizationName}
                onChange={handleChange}
              />
              <ProfileField
                label="Region"
                icon={<FiGlobe />}
                editing={editing}
                name="region"
                value={formData.region}
                onChange={handleChange}
              />
              <ProfileField
                label="Country"
                icon={<FiGlobe />}
                editing={editing}
                name="country"
                value={formData.country}
                onChange={handleChange}
              />
              <ProfileField
                label="Time Zone"
                icon={<FiClock />}
                editing={editing}
                name="timeZone"
                value={formData.timeZone}
                onChange={handleChange}
                select
              />
            </div>

            <div className="mt-10 bg-purple-50 rounded-lg p-6 text-sm text-purple-800 flex items-center justify-between">
              {(() => {
                const steps = user?.setup?.steps || [];
                const allCompleted =
                  steps.length > 0 &&
                  steps.every((s) => s.status === "completed");
                const hasSkipped = steps.some(
                  (s) => s.status === "skipped" || s.status === "incomplete"
                );

                return (
                  <div className="flex items-center justify-between w-full">
                    <div>
                      <p className="font-semibold text-sm text-gray-800">
                        Account Status
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {allCompleted && !hasSkipped
                          ? "Your account setup is complete and verified."
                          : "Your setup is not yet complete. Please finish all wizard steps to verify your account."}
                      </p>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        allCompleted && !hasSkipped
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {allCompleted && !hasSkipped ? "Verified" : "Unverified"}
                    </span>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ✅ Reusable Input Component
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
    <div className="flex items-center gap-2 border rounded-md px-3 py-2 bg-gray-50">
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

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
  const [imagePreview, setImagePreview] = useState(null);

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileImageFile, setProfileImageFile] = useState(null);

  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    role: user?.role || "",
    timeZone: organization?.TimeZone || "UTC",

    phone: organization?.phone || "",
    whatsapp: organization?.whatsapp || "",
    organizationName: organization?.organizationName || "",
    website: organization?.website || "",
    region: organization?.Region || "",
    country: organization?.country || "",
    address: organization?.address || "",
    supportEmail: organization?.supportEmail || "",

    hourlyRate: organization?.hourlyRate || "",
    experienceYears: organization?.experienceYears || "",
    services: organization?.services || "",
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSave = async () => {
    try {
      setSaving(true);

      const fd = new FormData();

      fd.append("fullName", formData.fullName);
      fd.append("role", formData.role);
      fd.append("phone", formData.phone);
      fd.append("whatsapp", formData.whatsapp);
      fd.append("TimeZone", formData.timeZone);

      fd.append("organizationName", formData.organizationName);
      fd.append("website", formData.website);
      fd.append("Region", formData.region);
      fd.append("country", formData.country);
      fd.append("address", formData.address);
      fd.append("supportEmail", formData.supportEmail);

      fd.append("hourlyRate", formData.hourlyRate);
      fd.append("experienceYears", formData.experienceYears);
      fd.append("services", formData.services);

      if (profileImageFile) {
        fd.append("image", profileImageFile);
      }

      const res = await fetch(
        `http://localhost:5000/auth/updateUserAndOrganization/${user._id}`,
        {
          method: "PUT",
          body: fd,
        }
      );

      const result = await res.json();
      if (!res.ok) throw new Error(result.message);

      updateUser(result.data.user);
      updateOrganization(result.data.organization);

      toast.success(
        result.imageUpdated
          ? "Profile  updated successfully"
          : "Profile updated successfully"
      );

      setEditing(false);
      setProfileImageFile(null);
    } catch (error) {
      console.error(error);
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
            <div className="flex flex-col items-center border-b pb-8">
              <div className="relative w-24 h-24 mb-4">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Profile Preview"
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : user?.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 bg-indigo-600 text-white flex items-center justify-center rounded-full text-3xl font-bold">
                    {formData.fullName.slice(0, 2).toUpperCase()}
                  </div>
                )}

                {editing && (
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (!file) return;

                      setProfileImageFile(file);
                      setImagePreview(URL.createObjectURL(file));
                    }}
                  />
                )}
              </div>

              <h1 className="text-2xl font-bold text-gray-800">
                {formData.fullName}
              </h1>

              <p className="text-sm text-gray-500 mt-1">
                {formData.organizationName || "No organization"}
              </p>

              <button
                onClick={() => (editing ? handleSave() : setEditing(true))}
                disabled={saving}
                className="mt-4 flex items-center gap-2 text-sm px-5 py-2 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition disabled:opacity-70"
              >
                {editing ? <FiSave /> : <FiEdit3 />}
                {editing
                  ? saving
                    ? "Saving..."
                    : "Save Changes"
                  : "Edit Profile"}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-10">
              <ProfileField
                label="Full Name"
                icon={<FiUser />}
                editing={editing}
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
              />
              {/* <ProfileField
                label="Email"
                icon={<FiMail />}
                value={formData.email}
                readOnly
              /> */}

              {/* <ProfileField
                label="Role / Title"
                icon={<FiBriefcase />}
                editing={editing}
                name="role"
                value={formData.role}
                onChange={handleChange}
              /> */}
              <ProfileField
                label="Phone"
                icon={<FiPhone />}
                editing={editing}
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />

              <ProfileField
                label="WhatsApp"
                icon={<FiMessageCircle />}
                editing={editing}
                name="whatsapp"
                value={formData.whatsapp}
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

              <ProfileField
                label="Organization Name"
                icon={<FiUser />}
                editing={editing}
                name="organizationName"
                value={formData.organizationName}
                onChange={handleChange}
              />
              <ProfileField
                label="Website"
                icon={<FiLink />}
                editing={editing}
                name="website"
                value={formData.website}
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
                label="Hourly Rate"
                icon={<FiClock />}
                editing={editing}
                name="hourlyRate"
                value={formData.hourlyRate}
                onChange={handleChange}
              />

              <ProfileField
                label="Experience (Years)"
                icon={<FiBriefcase />}
                editing={editing}
                name="experienceYears"
                value={formData.experienceYears}
                onChange={handleChange}
              />

              <ProfileField
                label="Services Offered"
                icon={<FiMessageCircle />}
                editing={editing}
                name="services"
                value={formData.services}
                onChange={handleChange}
              />

              <ProfileField
                label="Address"
                icon={<FiMapPin />}
                editing={editing}
                name="address"
                value={formData.address}
                onChange={handleChange}
              />
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

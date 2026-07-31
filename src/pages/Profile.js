
import React, { useContext, useState, useEffect } from "react";
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
import moment from "moment-timezone";
const countries = [
  "Afghanistan",
  "Albania",
  "Algeria",
  "Argentina",
  "Australia",
  "Austria",
  "Bangladesh",
  "Belgium",
  "Brazil",
  "Canada",
  "China",
  "Denmark",
  "Egypt",
  "France",
  "Germany",
  "India",
  "Indonesia",
  "Ireland",
  "Italy",
  "Japan",
  "Malaysia",
  "Netherlands",
  "New Zealand",
  "Pakistan",
  "Saudi Arabia",
  "Singapore",
  "South Africa",
  "Spain",
  "Turkey",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
];

const Profile = () => {
  const { user, organization, updateUser, updateOrganization, loading } =
    useContext(UserContext);
const [disableLoading, setDisableLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileImageFile, setProfileImageFile] = useState(null);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    role: "",
    timeZone: "UTC",
    phone: "",
    whatsapp: "",
    organizationName: "",
    website: "",
    region: "",
    country: "",
    address: "",
    supportEmail: "",
    hourlyRate: "",
    experienceYears: "",
    services: "",
  });



  const timeZones = moment.tz.names();

const countryDefaultTimeZone = {
  Afghanistan: "Asia/Kabul",
  Albania: "Europe/Tirane",
  Algeria: "Africa/Algiers",
  Argentina: "America/Argentina/Buenos_Aires",
  Australia: "Australia/Sydney",
  Austria: "Europe/Vienna",
  Bangladesh: "Asia/Dhaka",
  Belgium: "Europe/Brussels",
  Brazil: "America/Sao_Paulo",
  Canada: "America/Toronto",
  China: "Asia/Shanghai",
  Denmark: "Europe/Copenhagen",
  Egypt: "Africa/Cairo",
  France: "Europe/Paris",
  Germany: "Europe/Berlin",
  India: "Asia/Kolkata",
  Indonesia: "Asia/Jakarta",
  Ireland: "Europe/Dublin",
  Italy: "Europe/Rome",
  Japan: "Asia/Tokyo",
  Malaysia: "Asia/Kuala_Lumpur",
  Netherlands: "Europe/Amsterdam",
  "New Zealand": "Pacific/Auckland",
  Pakistan: "Asia/Karachi",
  "Saudi Arabia": "Asia/Riyadh",
  Singapore: "Asia/Singapore",
  "South Africa": "Africa/Johannesburg",
  Spain: "Europe/Madrid",
  Turkey: "Europe/Istanbul",
  "United Arab Emirates": "Asia/Dubai",
  "United Kingdom": "Europe/London",
  "United States": "America/New_York",
};


const handleChange = (e) => {
  const { name, value } = e.target;

  if (name === "country") {
    setFormData({
      ...formData,
      country: value,
      timeZone: countryDefaultTimeZone[value] || "UTC",
    });
    return;
  }

  setFormData({
    ...formData,
    [name]: value,
  });
};

  useEffect(() => {
    if (user || organization) {
      setFormData({
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
    }
  }, [user, organization]);



  const handleSave = async () => {
    try {
      setSaving(true);

      const fd = new FormData();

      Object.keys(formData).forEach((key) => {
        if (key === "timeZone") fd.append("TimeZone", formData.timeZone);
        else if (key === "region") fd.append("Region", formData.region);
        else fd.append(key, formData[key]);
      });

      if (profileImageFile) fd.append("image", profileImageFile);

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

      toast.success("Profile updated successfully");
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
      <div className="flex items-center justify-center h-screen bg-[#f8fafc] text-slate-500 font-medium">
        <div className="animate-pulse">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f4f7fc] text-[#334155] font-sans antialiased">
      <Sidebar />

      <div className="flex-1 flex flex-col ">
        <div className="hidden sm:block">
          <Navbar />
        </div>

        <main className="flex-1 p-6 lg:p-8 max-w-[1400px] w-full mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/70 shadow-sm">
            <div>
              <h1 className="text-xl font-semibold text-[#0f172a]">
                Account Settings
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Manage your personal details and workspace settings.
              </p>
            </div>

            <button
              onClick={() => (editing ? handleSave() : setEditing(true))}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-sm transition-all duration-150"
            >
              {editing ? (
                saving ? (
                  <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-indigo-600 border-t-transparent rounded-full" />
                ) : (
                  <FiSave className="w-3.5 h-3.5" />
                )
              ) : (
                <FiEdit3 className="w-3.5 h-3.5" />
              )}

              {editing ? (saving ? "Saving..." : "Save Changes") : "Edit Profile"}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-6 text-center">
                <div className="relative w-28 h-28 mx-auto mb-4 group">
                  <div className="w-full h-full rounded-full overflow-hidden bg-[#eef2ff] flex items-center justify-center">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : user?.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-2xl font-semibold text-[#4f46e5]">
                        {formData.fullName.slice(0, 2).toUpperCase() || "ME"}
                      </div>
                    )}
                  </div>

                  {editing && (
                    <label className="absolute inset-0 bg-black/40 text-white text-[11px] font-semibold rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150 cursor-pointer">
                      <FiEdit3 className="w-4 h-4 mb-0.5" />
                      <span>Change</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (!file) return;
                          setProfileImageFile(file);
                          setImagePreview(URL.createObjectURL(file));
                        }}
                      />
                    </label>
                  )}
                </div>

                <h2 className="text-lg font-semibold text-[#0f172a] tracking-tight">
                  {formData.fullName || "—"}
                </h2>

                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  {formData.organizationName || "—"}
                </p>

                <div className="mt-6 pt-5 border-t border-slate-100 text-left space-y-3.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Email Status</span>
                    <span className="font-semibold text-[#10b981] bg-[#ecfdf5] px-2 py-0.5 rounded-md text-[11px]">
                      Verified
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">2FA Protection</span>
                    <span
                      className={`font-semibold px-2 py-0.5 rounded-md text-[11px] ${
                        user?.twoFactorEnabled
                          ? "text-[#10b981] bg-[#ecfdf5]"
                          : "text-amber-600 bg-amber-50"
                      }`}
                    >
                      {user?.twoFactorEnabled ? "Active" : "Disabled"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-8 space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100">
                  <h3 className="font-semibold text-sm text-[#0f172a]">
                    Personal & Contact Details
                  </h3>
                </div>

                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                  <ProfileField
                    label="Full Name"
                    icon={<FiUser />}
                    name="fullName"
                    value={formData.fullName}
                    editing={editing}
                    onChange={handleChange}
                  />

                  <ProfileField
                    label="Email Address"
                    icon={<FiMail />}
                    name="email"
                    value={formData.email}
                    editing={false}
                    readOnly
                  />

                  <ProfileField
                    label="Phone"
                    icon={<FiPhone />}
                    name="phone"
                    value={formData.phone}
                    editing={editing}
                    onChange={handleChange}
                  />

                  <ProfileField
                    label="WhatsApp"
                    icon={<FiMessageCircle />}
                    name="whatsapp"
                    value={formData.whatsapp}
                    editing={editing}
                    onChange={handleChange}
                  />

                  <div className="sm:col-span-2">
                  <ProfileField
  label="Time Zone"
  icon={<FiClock />}
  name="timeZone"
  value={formData.timeZone}
  editing={editing}
  onChange={handleChange}
  select
  options={timeZones}
/>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100">
                  <h3 className="font-semibold text-sm text-[#0f172a]">
                    Organization & Professional Data
                  </h3>
                </div>

                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                  <ProfileField
                    label="Organization Name"
                    icon={<FiBriefcase />}
                    name="organizationName"
                    value={formData.organizationName}
                    editing={editing}
                    onChange={handleChange}
                  />

                  <ProfileField
                    label="Website"
                    icon={<FiLink />}
                    name="website"
                    value={formData.website}
                    editing={editing}
                    onChange={handleChange}
                  />
{/* 
                  <ProfileField
                    label="Region"
                    icon={<FiGlobe />}
                    name="region"
                    value={formData.region}
                    editing={editing}
                    onChange={handleChange}
                  /> */}

                  <ProfileField
                    label="Country"
                    icon={<FiGlobe />}
                    name="country"
                    value={formData.country}
                    editing={editing}
                    onChange={handleChange}
                    select
                    options={countries}
                  />

                  <ProfileField
                    label="Hourly Rate"
                    icon={<FiClock />}
                    name="hourlyRate"
                    value={formData.hourlyRate}
                    editing={editing}
                    onChange={handleChange}
                  />

                  <ProfileField
                    label="Experience (Years)"
                    icon={<FiBriefcase />}
                    name="experienceYears"
                    value={formData.experienceYears}
                    editing={editing}
                    onChange={handleChange}
                  />

                  {formData.services && (
                    <div className="sm:col-span-2">
                      <ProfileField
                        label="Services Offered"
                        icon={<FiMessageCircle />}
                        name="services"
                        value={formData.services}
                        editing={editing}
                        onChange={handleChange}
                      />
                    </div>
                  )}

                  {formData.address && (
                    <div className="sm:col-span-2">
                      <ProfileField
                        label="Address"
                        icon={<FiMapPin />}
                        name="address"
                        value={formData.address}
                        editing={editing}
                        onChange={handleChange}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};const ProfileField = ({
  label,
  icon,
  name,
  value,
  onChange,
  editing,
  readOnly,
  select,
  options = [],
}) => {
  const getTimeZoneLabel = (timeZone) => {
    try {
      const offset = moment.tz(timeZone).format("Z");
      return `(GMT ${offset}) ${timeZone}`;
    } catch {
      return timeZone;
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
        {label}
      </label>

      <div
        className={`flex items-center gap-2.5 w-full ${
          editing && !readOnly
            ? "border border-slate-200 bg-white rounded-xl px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500/10 focus-within:border-indigo-500"
            : "py-0.5"
        }`}
      >
        <span className="text-slate-400 text-sm flex-shrink-0">{icon}</span>

        {editing && !readOnly ? (
          select ? (
            <select
              name={name}
              value={value}
              onChange={onChange}
              className="flex-1 bg-transparent outline-none text-xs text-slate-700 cursor-pointer font-medium"
            >
              <option value="">Select {label}</option>

              {options.map((item) => (
                <option key={item} value={item}>
                  {name === "timeZone" ? getTimeZoneLabel(item) : item}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              name={name}
              value={value}
              onChange={onChange}
              className="flex-1 bg-transparent outline-none text-xs text-slate-700 font-medium"
            />
          )
        ) : (
          <span className="text-xs font-medium text-slate-700 truncate">
            {name === "timeZone" && value ? getTimeZoneLabel(value) : value || "—"}
          </span>
        )}
      </div>
    </div>
  );
};

export default Profile;
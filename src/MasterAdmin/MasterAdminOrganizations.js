import React, { useState, useEffect } from "react";
import { FiHome, FiUsers, FiGlobe, FiLayers } from "react-icons/fi";
import MasterAdminLayout from "./MasterAdminLayout";

const MasterAdminOrganizations = () => {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrgs();
  }, []);

  const fetchOrgs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("usertoken");
      const res = await fetch("https://email-syncing-backend.vercel.app/admin/organizations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setOrganizations(data.data || []);
      }
    } catch (err) {
      console.error("Error fetching master admin organizations:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MasterAdminLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Organizations & Clinic Accounts</h1>
          <p className="text-xs text-slate-500 mt-1">
            Overview of all active tenant organizations registered on the Replex engine.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="p-3.5 font-semibold">Organization Name</th>
                <th className="p-3.5 font-semibold">Account Owner</th>
                <th className="p-3.5 font-semibold">Members</th>
                <th className="p-3.5 font-semibold">Tier Plan</th>
                <th className="p-3.5 font-semibold">Country / Region</th>
                <th className="p-3.5 font-semibold">Created Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {organizations.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-6 text-center text-slate-400">
                    No organizations recorded.
                  </td>
                </tr>
              ) : (
                organizations.map((org, index) => (
                  <tr key={index} className="hover:bg-slate-50/50">
                    <td className="p-3.5 font-bold text-slate-900 flex items-center gap-2">
                      <FiHome size={14} className="text-slate-400" />
                      <span>{org.name}</span>
                    </td>
                    <td className="p-3.5">
                      <div className="font-semibold text-slate-900">{org.ownerName}</div>
                      <div className="text-[10px] text-slate-400">{org.ownerEmail}</div>
                    </td>
                    <td className="p-3.5 font-semibold text-slate-700">
                      {org.membersCount} Member(s)
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 capitalize">
                        {org.plan}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-600 font-medium">
                      {org.country}
                    </td>
                    <td className="p-3.5 text-slate-500">
                      {new Date(org.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </MasterAdminLayout>
  );
};

export default MasterAdminOrganizations;

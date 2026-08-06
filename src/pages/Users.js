import React, { useMemo, useState, useEffect, useContext } from "react";
import {
  FiPlus,
  FiFilter,
  FiChevronUp,
  FiChevronDown,
  FiX,
  FiMail,
  FiUser,
  FiUsers,
  FiShield,
  FiCheck,
  FiSliders,
  FiTrash2,
  FiAlertTriangle,
  FiLoader,
} from "react-icons/fi";
import axios from "axios";
import AppLayout from "../component/AppLayout";
import { UserContext } from "../component/UserContext";

const API_BASE_URL = "https://email-syncing-backend.vercel.app";

const initialPermissions = {
  templates: { view: true, edit: true, delete: false },
  connections: { view: true, edit: true, delete: false },
  scenarios: { view: true, edit: true, delete: false },
  inbox: { view: true, edit: true, delete: false },
  organization: { view: true, edit: false, delete: false },
};

const modulesList = [
  { id: "templates", label: "Templates", desc: "Manage email response templates" },
  { id: "connections", label: "Connections", desc: "Manage mailhooks & email integrations" },
  { id: "scenarios", label: "Scenarios", desc: "Configure automation flow scenarios" },
  { id: "inbox", label: "Inbox", desc: "Access lead threads & send replies" },
  { id: "organization", label: "Organization", desc: "Manage organization settings & profile" },
];

const UsersPage = () => {
  const { user: contextUser } = useContext(UserContext);
  const userId = localStorage.getItem("userid") || contextUser?._id;

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [activeTab, setActiveTab] = useState("general"); // 'general' | 'permissions'
  const [sortDirection, setSortDirection] = useState("desc");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [openFilter, setOpenFilter] = useState(null); // 'user' | 'role' | 'team' | null

  const [filters, setFilters] = useState({
    user: "",
    role: "",
    team: "",
  });

  const [userTeamName, setUserTeamName] = useState("My Team");

  const [inviteForm, setInviteForm] = useState({
    name: "",
    email: "",
    role: "Member",
    team: "My Team",
  });

  const [permissions, setPermissions] = useState(initialPermissions);

  const [users, setUsers] = useState([]);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchTeamAndOrgMembers();
  }, [userId, contextUser]);

  const fetchTeamAndOrgMembers = async () => {
    const targetUserId = userId || contextUser?._id;
    if (!targetUserId) {
      if (contextUser) {
        setUsers([
          {
            id: contextUser._id?.toString() || "owner",
            name: contextUser.fullName || contextUser.email?.split("@")[0] || "Owner",
            email: contextUser.email || "",
            lastLoginDate: "Active",
            lastLoginTime: "",
            role: "Owner",
            team: userTeamName,
            status: "Active",
            timestamp: Date.now(),
          },
        ]);
      }
      return;
    }

    try {
      setLoading(true);

      // Fetch user's actual team name first
      let currentTeam = "My Team";
      try {
        const teamRes = await axios.get(`${API_BASE_URL}/team/getUserTeams/${targetUserId}`);
        if (teamRes.data?.success && Array.isArray(teamRes.data?.data) && teamRes.data.data.length > 0) {
          currentTeam = teamRes.data.data[0].name || "My Team";
          setUserTeamName(currentTeam);
          setInviteForm((prev) => ({ ...prev, team: currentTeam }));
        }
      } catch (teamErr) {
        console.error("Error fetching team name:", teamErr);
      }

      // Fetch org members
      const res = await axios.get(`${API_BASE_URL}/auth/organization/members/${targetUserId}`);
      if (res.data?.success && Array.isArray(res.data?.data)) {
        const formattedUsers = res.data.data.map((u) => ({
          ...u,
          team: currentTeam || u.team || "My Team",
        }));
        setUsers(formattedUsers);
      } else if (contextUser) {
        setUsers([
          {
            id: contextUser._id?.toString() || targetUserId,
            name: contextUser.fullName || contextUser.email?.split("@")[0] || "Owner",
            email: contextUser.email || "",
            lastLoginDate: "Active",
            lastLoginTime: "",
            role: "Owner",
            team: currentTeam,
            status: "Active",
            timestamp: Date.now(),
          },
        ]);
      }
    } catch (err) {
      console.error("Error fetching org members:", err);
      if (contextUser) {
        setUsers([
          {
            id: contextUser._id?.toString() || "owner",
            name: contextUser.fullName || contextUser.email?.split("@")[0] || "Owner",
            email: contextUser.email || "",
            lastLoginDate: "Active",
            lastLoginTime: "",
            role: "Owner",
            team: userTeamName,
            status: "Active",
            timestamp: Date.now(),
          },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    const result = users.filter((user) => {
      const userSearch = filters.user.toLowerCase().trim();
      const roleSearch = filters.role.toLowerCase().trim();
      const teamSearch = filters.team.toLowerCase().trim();

      const matchesUser =
        !userSearch ||
        (user.name && user.name.toLowerCase().includes(userSearch)) ||
        (user.email && user.email.toLowerCase().includes(userSearch)) ||
        (user.id && user.id.toLowerCase().includes(userSearch));

      const matchesRole =
        !roleSearch || (user.role && user.role.toLowerCase() === roleSearch);

      const matchesTeam =
        !teamSearch || (user.team && user.team.toLowerCase() === teamSearch);

      return matchesUser && matchesRole && matchesTeam;
    });

    return result.sort((a, b) => {
      if (sortDirection === "asc") {
        return (a.timestamp || 0) - (b.timestamp || 0);
      }
      return (b.timestamp || 0) - (a.timestamp || 0);
    });
  }, [users, filters, sortDirection]);

  const handleInviteInputChange = (event) => {
    const { name, value } = event.target;
    setInviteForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handlePermissionChange = (moduleKey, rightKey, checked) => {
    setPermissions((prev) => ({
      ...prev,
      [moduleKey]: {
        ...prev[moduleKey],
        [rightKey]: checked,
      },
    }));
  };

  const handleToggleModuleAll = (moduleKey, checked) => {
    setPermissions((prev) => ({
      ...prev,
      [moduleKey]: {
        view: checked,
        edit: checked,
        delete: checked,
      },
    }));
  };

  const handleInviteUser = async (event) => {
    event.preventDefault();

    const name = inviteForm.name.trim();
    const email = inviteForm.email.trim();

    if (!name || !email) {
      return;
    }

    const targetUserId = userId || contextUser?._id;

    try {
      setSubmitting(true);
      if (targetUserId) {
        const res = await axios.post(`${API_BASE_URL}/auth/organization/add-member/${targetUserId}`, {
          name,
          email,
          role: "Member",
          team: inviteForm.team || userTeamName,
          permissions,
        });

        if (res.data?.success && res.data?.data) {
          setUsers((previous) => [...previous, res.data.data]);
        }
      } else {
        const newUser = {
          id: Date.now().toString().slice(-7),
          name,
          email,
          lastLoginDate: "Invitation pending",
          lastLoginTime: "Not logged in yet",
          role: "Member",
          team: inviteForm.team || userTeamName,
          status: "Pending",
          permissions,
          timestamp: Date.now(),
        };
        setUsers((previous) => [...previous, newUser]);
      }

      setInviteForm({
        name: "",
        email: "",
        role: "Member",
        team: userTeamName,
      });
      setPermissions(initialPermissions);
      setActiveTab("general");
      setShowInviteModal(false);
    } catch (err) {
      console.error("Error adding org member:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    const targetId = userToDelete._id || userToDelete.id;

    try {
      setDeleting(true);
      if (targetId) {
        await axios.delete(`${API_BASE_URL}/auth/user/${targetId}`).catch(() => {});
      }
      setUsers((previous) => previous.filter((u) => (u._id || u.id) !== targetId));
      setUserToDelete(null);
    } catch (err) {
      console.error("Error deleting user:", err);
      setUsers((previous) => previous.filter((u) => (u._id || u.id) !== targetId));
      setUserToDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  const toggleSortDirection = () => {
    setSortDirection((previous) => (previous === "desc" ? "asc" : "desc"));
  };

  const getUserInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <AppLayout>
      <div className="w-full">
        {/* Compact page header */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <h1 className="shrink-0 text-lg font-bold text-slate-950">
              Users
            </h1>

            <span className="hidden h-4 w-px bg-slate-300 sm:block" />

            <p className="truncate text-xs text-slate-500">
              Manage users, roles and team access.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setActiveTab("general");
              setShowInviteModal(true);
            }}
            className="inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-md bg-black px-3 text-xs font-semibold text-white transition hover:bg-slate-800 cursor-pointer"
          >
            <FiPlus className="h-4 w-4" />
            Invite user
          </button>
        </div>

        {/* Users table */}
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm relative z-10">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] border-collapse">
              <thead className="relative z-40">
                <tr className="h-12 border-b border-slate-200 bg-white">
                  {/* USER COLUMN HEADER FILTER */}
                  <th className="px-5 text-left relative">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[13px] font-semibold text-slate-600">User</span>
                      <button
                        type="button"
                        onClick={() => setOpenFilter(openFilter === "user" ? null : "user")}
                        className={`p-1 rounded-md hover:bg-slate-100 transition cursor-pointer ${
                          filters.user ? "text-black bg-slate-100 font-bold" : "text-slate-400"
                        }`}
                        title="Filter by User"
                      >
                        <FiFilter className="h-4 w-4" />
                      </button>
                    </div>

                    {openFilter === "user" && (
                      <div className="absolute left-4 top-11 z-[999] w-64 rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xl animate-in fade-in zoom-in duration-150">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-slate-800">Filter User</span>
                          <button
                            type="button"
                            onClick={() => setOpenFilter(null)}
                            className="text-slate-400 hover:text-slate-700 cursor-pointer"
                          >
                            <FiX size={14} />
                          </button>
                        </div>
                        <input
                          type="text"
                          value={filters.user}
                          onChange={(e) => setFilters((prev) => ({ ...prev, user: e.target.value }))}
                          placeholder="Filter by name, email, ID..."
                          className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-xs text-slate-900 outline-none focus:border-black"
                          autoFocus
                        />
                        {filters.user && (
                          <button
                            type="button"
                            onClick={() => setFilters((prev) => ({ ...prev, user: "" }))}
                            className="mt-2 text-[11px] font-semibold text-red-600 hover:underline cursor-pointer"
                          >
                            Clear filter
                          </button>
                        )}
                      </div>
                    )}
                  </th>

                  {/* LAST LOGIN COLUMN HEADER */}
                  <th className="px-5 text-left">
                    <button
                      onClick={toggleSortDirection}
                      className="flex items-center gap-1.5 text-[13px] font-semibold text-slate-600 hover:text-black transition cursor-pointer"
                    >
                      <span>Last login</span>
                      {sortDirection === "desc" ? (
                        <FiChevronUp className="h-4 w-4 text-slate-400" />
                      ) : (
                        <FiChevronDown className="h-4 w-4 text-slate-400" />
                      )}
                    </button>
                  </th>

                  {/* ROLE COLUMN HEADER FILTER */}
                  <th className="px-5 text-left relative">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[13px] font-semibold text-slate-600">Role</span>
                      <button
                        type="button"
                        onClick={() => setOpenFilter(openFilter === "role" ? null : "role")}
                        className={`p-1 rounded-md hover:bg-slate-100 transition cursor-pointer ${
                          filters.role ? "text-black bg-slate-100 font-bold" : "text-slate-400"
                        }`}
                        title="Filter by Role"
                      >
                        <FiFilter className="h-4 w-4" />
                      </button>
                    </div>

                    {openFilter === "role" && (
                      <div className="absolute left-0 top-11 z-[999] w-44 rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xl animate-in fade-in zoom-in duration-150">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-slate-800">Filter Role</span>
                          <button
                            type="button"
                            onClick={() => setOpenFilter(null)}
                            className="text-slate-400 hover:text-slate-700 cursor-pointer"
                          >
                            <FiX size={14} />
                          </button>
                        </div>
                        <div className="flex flex-col gap-1">
                          {["", "Owner", "Member"].map((roleOpt) => (
                            <button
                              key={roleOpt}
                              type="button"
                              onClick={() => {
                                setFilters((prev) => ({ ...prev, role: roleOpt }));
                                setOpenFilter(null);
                              }}
                              className={`w-full px-2.5 py-1.5 text-left text-xs rounded-md transition font-medium cursor-pointer ${
                                filters.role.toLowerCase() === roleOpt.toLowerCase()
                                  ? "bg-slate-900 text-white font-bold"
                                  : "text-slate-700 hover:bg-slate-100"
                              }`}
                            >
                              {roleOpt || "All Roles"}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </th>

                  {/* TEAMS COLUMN HEADER (No filter icon) */}
                  <th className="px-5 text-left">
                    <span className="text-[13px] font-semibold text-slate-600">Teams</span>
                  </th>

                  {/* ACTION COLUMN HEADER */}
                  <th className="px-5 text-right">
                    <span className="text-[13px] font-semibold text-slate-600">Action</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-xs text-slate-400">
                      Loading organization users...
                    </td>
                  </tr>
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-slate-100 transition last:border-b-0 hover:bg-slate-50"
                    >
                      <td className="px-4 py-3 align-middle">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[11px] font-bold text-white">
                            {getUserInitials(user.name)}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-950">
                              {user.name}
                            </p>

                            <p className="mt-0.5 truncate text-[11px] text-slate-500">
                              {user.email}
                              <span className="mx-1 text-slate-300">|</span>
                              ID: {user.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3 align-middle">
                        <p className="text-xs font-semibold text-slate-900">
                          {user.lastLoginDate}
                        </p>

                        <p className="mt-0.5 text-[11px] text-slate-500 flex items-center gap-1">
                          {user.lastLoginTime}
                          {user.status === "Pending" && (
                            <span className="rounded-full bg-amber-50 border border-amber-200 px-1.5 py-0.2 text-[9px] font-bold text-amber-700">
                              Pending
                            </span>
                          )}
                        </p>
                      </td>

                      <td className="px-4 py-3 align-middle">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                            user.role === "Owner"
                              ? "bg-slate-200 text-slate-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>

                      <td className="px-4 py-3 align-middle">
                        <span className="text-xs font-bold text-slate-900 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                          {userTeamName || user.team || "My Team"}
                        </span>
                      </td>

                      <td className="px-4 py-3 align-middle text-right">
                        {user.role?.toLowerCase() !== "owner" && (
                          <button
                            type="button"
                            onClick={() => setUserToDelete(user)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 hover:border-red-200 hover:bg-red-50 hover:text-red-600 transition cursor-pointer shadow-2xs"
                            title={`Delete user ${user.name}`}
                          >
                            <FiTrash2 className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center">
                      <FiUsers className="mx-auto h-7 w-7 text-slate-300" />

                      <p className="mt-2 text-sm font-semibold text-slate-700">
                        No users found
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Try changing your filters.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Invite user modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h2 className="text-base font-bold text-slate-950">
                  Invite User &amp; Access Rights
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Invite member to <strong className="text-slate-900">{userTeamName}</strong> and configure permissions.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowInviteModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-50 px-5 pt-2">
              <button
                type="button"
                onClick={() => setActiveTab("general")}
                className={`pb-2.5 px-4 text-xs font-bold transition border-b-2 cursor-pointer ${
                  activeTab === "general"
                    ? "border-black text-slate-950"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                1. Member Details
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("permissions")}
                className={`pb-2.5 px-4 text-xs font-bold transition border-b-2 flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "permissions"
                    ? "border-black text-slate-950"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <FiShield size={13} />
                <span>2. Module Permissions</span>
              </button>
            </div>

            <form onSubmit={handleInviteUser}>
              {/* TAB 1: General Member Details */}
              {activeTab === "general" && (
                <div className="space-y-4 p-5">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                      Full name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FiUser className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        name="name"
                        value={inviteForm.name}
                        onChange={handleInviteInputChange}
                        placeholder="e.g. John Doe"
                        required
                        className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-black focus:ring-2 focus:ring-black/5"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                      Email address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FiMail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type="email"
                        name="email"
                        value={inviteForm.email}
                        onChange={handleInviteInputChange}
                        placeholder="name@company.com"
                        required
                        className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-black focus:ring-2 focus:ring-black/5"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                        Role
                      </label>
                      <input
                        type="text"
                        value="Member"
                        disabled
                        className="w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2.5 text-sm font-semibold text-slate-700 cursor-not-allowed"
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">Only Owner &amp; Member roles supported.</span>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                        Team
                      </label>
                      <input
                        type="text"
                        value={userTeamName}
                        disabled
                        className="w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2.5 text-sm font-bold text-slate-900 cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Permissions Matrix (5 Modules: View, Edit, Delete) */}
              {activeTab === "permissions" && (
                <div className="p-5 flex flex-col gap-3">
                  <p className="text-xs text-slate-500 font-medium mb-1">
                    Grant granular access rights for each of the 5 core modules:
                  </p>

                  <div className="flex flex-col divide-y divide-slate-200 border border-slate-200 rounded-lg max-h-[270px] sm:max-h-[290px] overflow-y-auto shadow-xs">
                    {modulesList.map((mod) => {
                      const modPerms = permissions[mod.id] || { view: false, edit: false, delete: false };
                      const allChecked = modPerms.view && modPerms.edit && modPerms.delete;

                      return (
                        <div key={mod.id} className="p-3 bg-white hover:bg-slate-50/80 transition">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <span className="text-xs font-bold text-slate-900">{mod.label}</span>
                              <p className="text-[11px] text-slate-400">{mod.desc}</p>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleToggleModuleAll(mod.id, !allChecked)}
                              className="text-[10px] font-bold text-slate-600 hover:text-black transition underline cursor-pointer"
                            >
                              {allChecked ? "Unselect all" : "Select all"}
                            </button>
                          </div>

                          {/* Rights Checkboxes: View, Edit, Delete */}
                          <div className="flex items-center gap-6 pt-1">
                            <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-700">
                              <input
                                type="checkbox"
                                checked={!!modPerms.view}
                                onChange={(e) => handlePermissionChange(mod.id, "view", e.target.checked)}
                                className="h-3.5 w-3.5 rounded border-slate-300 text-black focus:ring-0 cursor-pointer"
                              />
                              <span>View</span>
                            </label>

                            <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-700">
                              <input
                                type="checkbox"
                                checked={!!modPerms.edit}
                                onChange={(e) => handlePermissionChange(mod.id, "edit", e.target.checked)}
                                className="h-3.5 w-3.5 rounded border-slate-300 text-black focus:ring-0 cursor-pointer"
                              />
                              <span>Edit</span>
                            </label>

                            <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-700">
                              <input
                                type="checkbox"
                                checked={!!modPerms.delete}
                                onChange={(e) => handlePermissionChange(mod.id, "delete", e.target.checked)}
                                className="h-3.5 w-3.5 rounded border-slate-300 text-black focus:ring-0 cursor-pointer"
                              />
                              <span>Delete</span>
                            </label>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Modal Footer */}
              <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-5 py-4">
                <div>
                  {activeTab === "general" ? (
                    <button
                      type="button"
                      onClick={() => setActiveTab("permissions")}
                      className="text-xs font-bold text-slate-700 hover:text-black underline cursor-pointer"
                    >
                      Configure Permissions &rarr;
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setActiveTab("general")}
                      className="text-xs font-bold text-slate-700 hover:text-black underline cursor-pointer"
                    >
                      &larr; Back to Details
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    className="h-8 rounded-md border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex h-8 items-center gap-1.5 rounded-md bg-black px-4 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50 cursor-pointer"
                  >
                    <FiPlus className="h-4 w-4" />
                    {submitting ? "Sending Invitation..." : "Send Invitation"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl animate-in zoom-in-95 duration-150 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600 border border-red-100 mb-4">
              <FiAlertTriangle className="h-6 w-6" />
            </div>

            <h3 className="text-base font-bold text-slate-900">
              Delete User Account?
            </h3>

            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Are you sure you want to delete <strong className="text-slate-900">{userToDelete.name}</strong> ({userToDelete.email})? This action will permanently remove their account and all associated data from the database.
            </p>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setUserToDelete(null)}
                className="h-9 rounded-lg border border-slate-300 bg-white px-4 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={deleting}
                onClick={handleDeleteUser}
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-red-600 px-4 text-xs font-semibold text-white transition hover:bg-red-700 shadow-xs cursor-pointer disabled:opacity-50"
              >
                {deleting ? (
                  <>
                    <FiLoader className="h-4 w-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <FiTrash2 className="h-4 w-4" />
                    <span>Delete User</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default UsersPage;
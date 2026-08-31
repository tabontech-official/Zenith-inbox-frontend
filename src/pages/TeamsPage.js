import React, { useState, useEffect, useContext } from "react";
import { FiUsers, FiDisc, FiMoreVertical, FiPlus, FiX, FiEdit2 } from "react-icons/fi";
import axios from "axios";
import AppLayout from "../component/AppLayout";
import { UserContext } from "../component/UserContext";

const API_BASE_URL = "https://email-syncing-backend.vercel.app";

const TeamsPage = () => {
  const { user: contextUser } = useContext(UserContext);
  const userId = localStorage.getItem("userid") || contextUser?._id;

  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddTeamModal, setShowAddTeamModal] = useState(false);
  const [showEditTeamModal, setShowEditTeamModal] = useState(false);
  const [showDropdownId, setShowDropdownId] = useState(null);
  const [editingTeam, setEditingTeam] = useState(null);
  const [teamName, setTeamName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetchUserTeams();
  }, [userId, contextUser]);

  const fetchUserTeams = async () => {
    const targetUserId = userId || contextUser?._id;
    if (!targetUserId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/team/getUserTeams/${targetUserId}`);
      if (res.data?.success && Array.isArray(res.data?.data) && res.data.data.length > 0) {
        setTeams(res.data.data);
      } else {
        const fallbackName = contextUser?.organizationName || contextUser?.companyName || "My Team";
        setTeams([{ _id: "default_team", name: fallbackName, creditsUsed: 0, membersCount: 1 }]);
      }
    } catch (err) {
      console.error("Error fetching user teams:", err);
      const fallbackName = contextUser?.organizationName || contextUser?.companyName || "My Team";
      setTeams([{ _id: "default_team", name: fallbackName, creditsUsed: 0, membersCount: 1 }]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEditModal = (team) => {
    setEditingTeam(team);
    setTeamName(team.name || "My Team");
    setErrorMsg("");
    setShowDropdownId(null);
    setShowEditTeamModal(true);
  };

  const handleUpdateTeam = async () => {
    const newName = teamName.trim();
    if (!newName || !editingTeam) return;
    const targetUserId = userId || contextUser?._id;

    try {
      setLoading(true);
      setErrorMsg("");

      // Primary team update request
      let res;
      if (editingTeam._id && editingTeam._id !== "1" && editingTeam._id !== "default_team") {
        res = await axios.put(`${API_BASE_URL}/team/update/${editingTeam._id}`, {
          name: newName,
        }).catch(() => null);
      }
      
      if (!res?.data?.success && targetUserId) {
        res = await axios.put(`${API_BASE_URL}/team/updateUserTeam/${targetUserId}`, {
          name: newName,
        }).catch(() => null);
      }

      // Also sync user/org profile name in backend
      if (targetUserId) {
        await axios.put(`${API_BASE_URL}/auth/updateUserAndOrganization/${targetUserId}`, {
          organizationName: newName,
        }).catch(() => {});
      }

      const updatedTeamObj = res?.data?.data || { ...editingTeam, name: newName };
      setTeams([updatedTeamObj]);
      setShowEditTeamModal(false);
      setEditingTeam(null);
    } catch (err) {
      console.error("Error updating team name:", err);
      // Optimistic fallback update
      setTeams([{ ...editingTeam, name: newName }]);
      setShowEditTeamModal(false);
      setEditingTeam(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTeamClick = () => {
    if (teams.length >= 1) {
      setErrorMsg("Limit reached: You can only have 1 team. You can edit your existing team name.");
      setShowAddTeamModal(true);
    } else {
      setTeamName("");
      setErrorMsg("");
      setShowAddTeamModal(true);
    }
  };

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        {/* Top Header Row */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">
            Teams
          </h1>

          <button
            type="button"
            onClick={handleAddTeamClick}
            className="h-8 px-3.5 rounded-[8px] bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-700 text-xs font-medium transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
          >
            <FiPlus size={14} className="text-slate-500" />
            <span>Add team</span>
          </button>
        </div>

        {/* Teams List Container */}
        <div className="flex flex-col gap-3">
          {loading && teams.length === 0 ? (
            <div className="rounded-[8px] border border-slate-200 bg-slate-100 p-4 flex items-center justify-between animate-pulse">
              <div className="flex items-center gap-3.5">
                <div className="h-10 w-10 rounded-xl bg-slate-200" />
                <div className="h-4 w-36 bg-slate-200 rounded-md" />
              </div>
              <div className="h-4 w-24 bg-slate-200 rounded-md" />
            </div>
          ) : (
            teams.map((team) => (
              <div
                key={team._id}
                className="rounded-[8px] border bg-gray-200 p-4 flex items-center justify-between shadow-2xs hover:border-slate-300 transition relative"
              >
                {/* Left: Icon & Team Name */}
                <div className="flex items-center gap-3.5">
                  <div className="h-10 w-10 rounded-xl bg-slate-100 border border-slate-200/60 text-slate-700 flex items-center justify-center shrink-0">
                    <FiUsers size={18} />
                  </div>
                  <span className="text-sm font-bold text-slate-900">
                    {team.name}
                  </span>
                </div>

                {/* Right: Credits Used & Options */}
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                    <FiDisc size={15} className="text-slate-500" />
                    <span>{team.creditsUsed || 0} credits used</span>
                  </div>

                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setShowDropdownId(showDropdownId === team._id ? null : team._id)
                      }
                      className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-300 transition cursor-pointer"
                    >
                      <FiMoreVertical size={16} />
                    </button>

                    {showDropdownId === team._id && (
                      <div className="absolute right-0 mt-1.5 w-36 bg-white rounded-lg shadow-xl border border-slate-200 py-1 z-30 animate-in fade-in zoom-in duration-100">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(team)}
                          className="w-full px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition text-left flex items-center gap-2 cursor-pointer"
                        >
                          <FiEdit2 size={13} />
                          Edit team name
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* MODAL 1: EDIT TEAM NAME MODAL */}
      {showEditTeamModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[12px] max-w-[440px] w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150">
            <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                Edit team name
              </h3>
              <button
                type="button"
                onClick={() => setShowEditTeamModal(false)}
                className="text-slate-400 hover:text-slate-700 transition cursor-pointer"
              >
                <FiX size={16} />
              </button>
            </div>

            <div className="p-5 flex flex-col gap-4">
              {errorMsg && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-600 font-medium">
                  {errorMsg}
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Team name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Enter team name"
                  className="w-full px-3 py-2 rounded-md border border-slate-300 text-xs text-slate-900 outline-none focus:border-black"
                  autoFocus
                />
              </div>
            </div>

            <div className="px-5 py-3 border-t border-slate-200 flex items-center justify-end gap-2 bg-slate-50">
              <button
                type="button"
                onClick={() => setShowEditTeamModal(false)}
                className="px-3.5 py-1.5 rounded-md border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleUpdateTeam}
                className="px-4 py-1.5 rounded-md bg-black hover:bg-slate-800 text-white text-xs font-semibold transition cursor-pointer disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD TEAM (LIMIT REACHED NOTICE) */}
      {showAddTeamModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[12px] max-w-[440px] w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150">
            <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                Team Limit Reached
              </h3>
              <button
                type="button"
                onClick={() => setShowAddTeamModal(false)}
                className="text-slate-400 hover:text-slate-700 transition cursor-pointer"
              >
                <FiX size={16} />
              </button>
            </div>

            <div className="p-5 flex flex-col gap-3">
              <p className="text-xs text-slate-600 leading-relaxed">
                You can only have <strong className="text-slate-900">1 team</strong> per account. You cannot create additional teams, but you can edit your existing team name.
              </p>

              {teams.length > 0 && (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 flex items-center justify-between mt-1">
                  <span className="text-xs font-bold text-slate-900">
                    {teams[0].name}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddTeamModal(false);
                      handleOpenEditModal(teams[0]);
                    }}
                    className="text-xs font-bold text-black hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <FiEdit2 size={12} />
                    Edit name
                  </button>
                </div>
              )}
            </div>

            <div className="px-5 py-3 border-t border-slate-200 flex items-center justify-end bg-slate-50">
              <button
                type="button"
                onClick={() => setShowAddTeamModal(false)}
                className="px-4 py-1.5 rounded-md bg-black hover:bg-slate-800 text-white text-xs font-semibold transition cursor-pointer"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default TeamsPage;

import React, { useEffect, useState } from "react";
import Sidebar from "../component/Sidebar";
import {
  FiSearch,
  FiCheckCircle,
  FiUser,
  FiChevronLeft,
  FiChevronRight,
  FiFilter,
  FiTrash2,
  FiClock,
  FiAlertTriangle,
  FiX,
  FiLogIn,
} from "react-icons/fi";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [proUserId, setProUserId] = useState(null);
  const [duration, setDuration] = useState(30);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [proLoading, setProLoading] = useState(false);
  const [revokeLoading, setRevokeLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const openProModal = (id) => {
    setProUserId(id);
    setIsProModalOpen(true);
  };
  const usersPerPage = 8;

  useEffect(() => {
    fetchUsers();
  }, []);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelUserId, setCancelUserId] = useState(null);
  const openCancelModal = (id) => {
    setCancelUserId(id);
    setIsCancelModalOpen(true);
  };

  const confirmRevoke = async () => {
    if (!cancelUserId) return;

    await handleRevokePro(cancelUserId);

    setIsCancelModalOpen(false);
    setCancelUserId(null);
  };
  // const handleGivePro = async () => {
  //   try {
  //     const token = localStorage.getItem("usertoken");

  //     if (!duration || duration <= 0) {
  //       alert("Invalid duration");
  //       return;
  //     }

  //     const res = await fetch(
  //       `https://email-syncing-backend.vercel.app/auth/admin/give-pro/${proUserId}`,
  //       {
  //         method: "PUT",
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: `Bearer ${token}`,
  //         },
  //         body: JSON.stringify({
  //           durationInDays: duration,
  //         }),
  //       },
  //     );

  //     const data = await res.json();

  //     setUsers((prev) =>
  //       prev.map((u) =>
  //         u._id === proUserId
  //           ? {
  //               ...u,
  //               subscription: {
  //                 ...u.subscription,
  //                 plan: "pro",
  //                 status: "active",
  //                 currentPeriodEnd: data.expiry,
  //               },
  //             }
  //           : u,
  //       ),
  //     );

  //     setIsProModalOpen(false);
  //     setProUserId(null);
  //     setDuration(30);
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };


const handleLoginAsUser = async (userId) => {
  try {
    const adminToken = localStorage.getItem("usertoken");

    const res = await fetch(
      `https://email-syncing-backend.vercel.app/auth/admin/login-as/${userId}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      },
    );

    const data = await res.json();

    if (!res.ok || data?.success === false) {
      alert(data?.message || "Failed to login as user");
      return;
    }

    localStorage.setItem("adminToken", adminToken);
    localStorage.setItem("usertoken", data.token);
    localStorage.setItem("user", JSON.stringify(data.data));

    window.location.href = "/dashboard";
  } catch (error) {
    console.error("Login As User Error:", error);
    alert("Something went wrong while login as user.");
  }
};

  const handleGivePro = async () => {
    try {
      setProLoading(true);

      const token = localStorage.getItem("usertoken");

      if (!proUserId) {
        alert("User not selected");
        return;
      }

      if (!duration || duration <= 0) {
        alert("Invalid duration");
        return;
      }

      const res = await fetch(
        `https://email-syncing-backend.vercel.app/auth/admin/give-pro/${proUserId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            durationInDays: duration,
          }),
        },
      );

      const data = await res.json();

      if (!res.ok || data?.success === false) {
        alert(data?.message || "Failed to assign pro plan");
        return;
      }

      const expiry =
        data?.expiry ||
        data?.data?.expiry ||
        data?.subscription?.currentPeriodEnd ||
        data?.data?.subscription?.currentPeriodEnd;

      setUsers((prev) =>
        prev.map((u) =>
          u._id === proUserId
            ? {
                ...u,
                subscription: {
                  ...u.subscription,
                  plan: "pro",
                  status: "active",
                  currentPeriodEnd: expiry,
                },
              }
            : u,
        ),
      );

      window.dispatchEvent(
        new CustomEvent("subscriptionUpdated", {
          detail: {
            userId: proUserId,
            plan: "pro",
            status: "active",
            currentPeriodEnd: expiry,
          },
        }),
      );

      setIsProModalOpen(false);
      setProUserId(null);
      setDuration(30);
    } catch (error) {
      console.error("Give Pro Error:", error);
      alert("Something went wrong while assigning pro plan.");
    } finally {
      setProLoading(false);
    }
  };
  const handleRevokePro = async (id) => {
    try {
      setRevokeLoading(true);

      const token = localStorage.getItem("usertoken");

      const res = await fetch(
        `https://email-syncing-backend.vercel.app/auth/admin/revoke-pro/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await res.json();

      if (!res.ok || data?.success === false) {
        alert(data?.message || "Failed to revoke pro plan");
        return;
      }

      setUsers((prev) =>
        prev.map((u) =>
          u._id === id
            ? {
                ...u,
                subscription: {
                  ...u.subscription,
                  plan: "free",
                  status: "inactive",
                  currentPeriodEnd: null,
                },
              }
            : u,
        ),
      );
    } catch (error) {
      console.error("Revoke Pro Error:", error);
      alert("Something went wrong while revoking pro plan.");
    } finally {
      setRevokeLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("usertoken");
      const res = await fetch(
        "https://email-syncing-backend.vercel.app/auth/users",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleSubscriptionUpdated = () => {
      fetchUsers();
    };

    window.addEventListener("subscriptionUpdated", handleSubscriptionUpdated);

    return () => {
      window.removeEventListener(
        "subscriptionUpdated",
        handleSubscriptionUpdated,
      );
    };
  }, []);

  const openSingleDelete = (id) => {
    setDeleteTarget("single");
    setActiveId(id);
    setIsModalOpen(true);
  };

  const openBulkDelete = () => {
    setDeleteTarget("bulk");
    setIsModalOpen(true);
  };
  const handleConfirmDelete = async () => {
    try {
      setDeleteLoading(true);

      const token = localStorage.getItem("usertoken");

      if (deleteTarget === "single") {
        if (!activeId) {
          alert("User not selected");
          return;
        }

        const res = await fetch(
          `https://email-syncing-backend.vercel.app/auth/user/${activeId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        let data = {};
        const contentType = res.headers.get("content-type");

        if (contentType && contentType.includes("application/json")) {
          data = await res.json();
        }

        if (!res.ok) {
          alert(data?.error || data?.message || "Failed to delete user");
          return;
        }

        setUsers((prev) => prev.filter((u) => u._id !== activeId));
      }

      if (deleteTarget === "bulk") {
        if (!selectedUsers.length) {
          alert("No users selected");
          return;
        }

        const res = await fetch(
          `https://email-syncing-backend.vercel.app/auth/users/bulk-delete`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ ids: selectedUsers }),
          },
        );

        let data = {};
        const contentType = res.headers.get("content-type");

        if (contentType && contentType.includes("application/json")) {
          data = await res.json();
        }

        if (!res.ok) {
          alert(
            data?.error || data?.message || "Failed to delete selected users",
          );
          return;
        }

        setUsers((prev) => prev.filter((u) => !selectedUsers.includes(u._id)));
        setSelectedUsers([]);
      }

      setIsModalOpen(false);
      setActiveId(null);
      setDeleteTarget(null);
    } catch (error) {
      console.error("Delete Error:", error);
      alert("Something went wrong while deleting.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredUsers = users
    .filter((user) => {
      if (filter === "verified") return user.verified;
      if (filter === "pending") return !user.verified;
      if (filter === "admin") return user.role === "admin";
      if (filter === "user") return user.role === "user";
      return true;
    })
    .filter(
      (user) =>
        user.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        user.email?.toLowerCase().includes(search.toLowerCase()),
    );

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const currentUsers = filteredUsers.slice(
    startIndex,
    startIndex + usersPerPage,
  );

  const toggleSelectUser = (id) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id],
    );
  };

  const selectAllUsers = () => {
    if (selectedUsers.length === currentUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(currentUsers.map((u) => u._id));
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]  flex font-sans">
      <Sidebar />

      {/* CUSTOM CONFIRMATION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => {
              if (!deleteLoading) {
                setIsModalOpen(false);
              }
            }}
          ></div>

          <div className="bg-white rounded-3xl p-8 max-w-sm w-full relative shadow-2xl transform transition-all animate-in zoom-in duration-200">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              disabled={deleteLoading}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiX size={24} />
            </button>

            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <FiAlertTriangle size={32} />
            </div>

            <h3 className="text-xl font-bold text-slate-800 text-center mb-2">
              Confirm Delete
            </h3>

            <p className="text-slate-500 text-center mb-8">
              {deleteTarget === "single"
                ? "Are you sure you want to delete this user? This action cannot be undone."
                : `Are you sure you want to delete ${selectedUsers.length} selected users? This will permanently remove their data.`}
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                disabled={deleteLoading}
                className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleteLoading}
                className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {deleteLoading && (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                )}
                {deleteLoading ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 p-4 md:p-8">
        {/* FIXED HEADER SECTION */}
        <div className="sticky top-0 z-40 bg-[#F8FAFC]/80 backdrop-blur-md pb-6 pt-2">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
                Users Directory
              </h1>
              <p className="text-slate-500 font-medium">
                Manage permissions and account status
              </p>
            </div>

            <div className="flex items-center gap-3">
              {selectedUsers.length > 0 && (
                <button
                  onClick={openBulkDelete}
                  disabled={deleteLoading}
                  className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiTrash2 /> Bulk Delete ({selectedUsers.length})
                </button>
              )}
            </div>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
            <div className="relative w-full md:flex-1">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search users..."
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative w-full md:w-48">
                <FiFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  value={filter}
                  onChange={(e) => {
                    setFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-xl text-slate-600 font-bold focus:ring-2 focus:ring-indigo-500 outline-none appearance-none cursor-pointer"
                >
                  <option value="all">All Roles</option>
                  <option value="verified">Verified</option>
                  <option value="pending">Pending</option>
                  <option value="admin">Admins</option>
                  <option value="user">Users</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* TABLE SECTION */}
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden mt-2">
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="p-5 w-12">
                    <input
                      type="checkbox"
                      className="w-5 h-5 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      onChange={selectAllUsers}
                      checked={
                        selectedUsers.length === currentUsers.length &&
                        currentUsers.length > 0
                      }
                    />
                  </th>
                  <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-widest">
                    User Details
                  </th>
                  <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Role
                  </th>
                  <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Status
                  </th>
                  <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Plan
                  </th>
                  <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {currentUsers.map((user) => {
                  const isPro =
                    user.subscription?.plan === "pro" &&
                    user.subscription?.currentPeriodEnd &&
                    new Date(user.subscription.currentPeriodEnd) > new Date();

                  return (
                    <tr
                      key={user._id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Checkbox */}
                      <td className="p-5">
                        <input
                          type="checkbox"
                          className="w-5 h-5 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          checked={selectedUsers.includes(user._id)}
                          onChange={() => toggleSelectUser(user._id)}
                        />
                      </td>

                      {/* User Info */}
                      <td className="p-5">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-lg">
                            {user.fullName?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">
                              {user.fullName || "No Name"}
                            </p>
                            <p className="text-[13px] text-slate-400 font-medium">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="p-5">
                        <span
                          className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                            user.role === "admin"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>

                      {/* Verification */}
                      <td className="p-5">
                        {user.verified ? (
                          <div className="flex items-center text-emerald-600 gap-1.5 text-sm font-bold">
                            <FiCheckCircle className="text-lg" /> Verified
                          </div>
                        ) : (
                          <div className="flex items-center text-slate-300 gap-1.5 text-sm font-bold">
                            <FiClock className="text-lg" /> Pending
                          </div>
                        )}
                      </td>

                      {/* Plan */}
                      <td className="p-5">
                        <span
                          className={`px-3 py-1 rounded-lg text-xs font-bold ${
                            isPro
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {isPro ? "PRO" : "FREE"}
                        </span>
                      </td>

                      {/* Actions */}
                  <td className="p-5 text-center">
  {user.role !== "admin" && (
    <div className="flex items-center justify-center gap-2">
      <button
        type="button"
        onClick={() => handleLoginAsUser(user._id)}
        className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
        title="Login as User"
      >
        <FiLogIn size={18} />
      </button>

      {isPro ? (
        <button
          onClick={() => openCancelModal(user._id)}
          disabled={revokeLoading}
          className="px-3 py-1.5 text-[10px] font-black tracking-widest text-amber-600 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-all uppercase disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {revokeLoading && cancelUserId === user._id
            ? "Revoking..."
            : "Revoke Access"}
        </button>
      ) : (
        <button
          onClick={() => openProModal(user._id)}
          className="px-3 py-1.5 text-[10px] font-black tracking-widest text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition-all uppercase"
        >
          Upgrade Pro
        </button>
      )}

      <button
        type="button"
        onClick={() => openSingleDelete(user._id)}
        disabled={deleteLoading}
        className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        title="Delete User"
      >
        <FiTrash2 size={18} />
      </button>
    </div>
  )}
</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* PAGINATION SECTION */}
        <div className="flex items-center justify-between mt-8 mb-10">
          <p className="text-sm font-bold text-slate-400">
            Total {filteredUsers.length} Users
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-3 rounded-xl bg-white border border-slate-200 text-slate-600 disabled:opacity-30 transition-all shadow-sm"
            >
              <FiChevronLeft size={20} />
            </button>

            <div className="flex gap-1">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${
                    currentPage === i + 1
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100"
                      : "text-slate-400 hover:bg-white hover:text-indigo-600"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-3 rounded-xl bg-white border border-slate-200 text-slate-600 disabled:opacity-30 transition-all shadow-sm"
            >
              <FiChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
      {isProModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* BACKDROP */}
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => {
              if (!proLoading) {
                setIsProModalOpen(false);
              }
            }}
          ></div>

          {/* MODAL */}
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full relative shadow-2xl">
            <h3 className="text-xl font-bold text-center mb-6">
              Assign Pro Plan
            </h3>

            {/* DURATION INPUT */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2 text-slate-600">
                Duration (Days)
              </label>

              <input
                type="number"
                min={1}
                value={duration}
                disabled={proLoading}
                onChange={(e) => setDuration(Number(e.target.value))}
                placeholder="Enter number of days"
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
              />

              {/* QUICK SELECT BUTTONS */}
              <div className="flex gap-2 mt-3">
                {[7, 30, 90].map((d) => (
                  <button
                    key={d}
                    type="button"
                    disabled={proLoading}
                    onClick={() => setDuration(d)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                      duration === d
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-100 hover:bg-indigo-100 text-slate-700"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {d}d
                  </button>
                ))}
              </div>
            </div>

            {/* ACTIONS */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsProModalOpen(false)}
                disabled={proLoading}
                className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleGivePro}
                disabled={proLoading || !duration || duration <= 0}
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {proLoading && (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                )}
                {proLoading ? "Assigning..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => {
              if (!revokeLoading) {
                setIsCancelModalOpen(false);
              }
            }}
          ></div>

          <div className="bg-white rounded-3xl p-8 max-w-sm w-full relative shadow-2xl">
            <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <FiAlertTriangle size={32} />
            </div>

            <h3 className="text-xl font-bold text-center mb-2">
              Cancel Pro Plan
            </h3>

            <p className="text-slate-500 text-center mb-6">
              This user will be downgraded to FREE plan immediately.
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsCancelModalOpen(false)}
                disabled={revokeLoading}
                className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmRevoke}
                disabled={revokeLoading}
                className="flex-1 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {revokeLoading && (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                )}
                {revokeLoading ? "Revoking..." : "Yes, Revoke"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;

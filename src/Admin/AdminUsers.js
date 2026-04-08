// // import React, { useEffect, useState } from "react";
// // import Sidebar from "../component/Sidebar";
// // import {
// //   FiSearch,
// //   FiCheckCircle,
// //   FiXCircle,
// //   FiUser,
// //   FiMail,
// //   FiChevronLeft,
// //   FiChevronRight,
// //   FiFilter,
// // } from "react-icons/fi";

// // const AdminUsers = () => {
// //   const [users, setUsers] = useState([]);
// //   const [search, setSearch] = useState("");
// //   const [filter, setFilter] = useState("all");
// //   const [loading, setLoading] = useState(true);
// //   const [currentPage, setCurrentPage] = useState(1);
// //   const usersPerPage = 10;

// //   useEffect(() => {
// //     const fetchUsers = async () => {
// //       try {
// //         const token = localStorage.getItem("token");
// //         const res = await fetch("https://email-syncing-backend.vercel.app/auth/users", {
// //           headers: {
// //             Authorization: `Bearer ${token}`,
// //           },
// //         });

// //         const data = await res.json();
// //         setUsers(data.users || []);
// //       } catch (error) {
// //         console.error("Error fetching users:", error);
// //       } finally {
// //         setLoading(false);
// //       }
// //     };

// //     fetchUsers();
// //   }, []);

// //   // 🔍 Filter by search & dropdown selection
// //   const filteredUsers = users
// //     .filter((user) => {
// //       if (filter === "verified") return user.verified;
// //       if (filter === "pending") return !user.verified;
// //       if (filter === "admin") return user.role === "admin";
// //       if (filter === "user") return user.role === "user";
// //       return true;
// //     })
// //     .filter(
// //       (user) =>
// //         user.fullName?.toLowerCase().includes(search.toLowerCase()) ||
// //         user.email?.toLowerCase().includes(search.toLowerCase())
// //     );

// //   // 🧮 Pagination logic
// //   const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
// //   const startIndex = (currentPage - 1) * usersPerPage;
// //   const currentUsers = filteredUsers.slice(
// //     startIndex,
// //     startIndex + usersPerPage
// //   );

// //   return (
// //     <div className="min-h-screen bg-gray-50 md:ml-64 flex">
// //       <Sidebar />

// //       <div className="flex-1 p-6">
// //         {/* 🔹 Header */}
// //         <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
// //           <div>
// //             <h1 className="text-2xl font-semibold text-gray-800">All Users</h1>
// //             <p className="text-gray-500 text-sm">Manage all registered users</p>
// //           </div>

// //           {/* 🔹 Controls: Search + Filter */}
// //           <div className="flex flex-col sm:flex-row items-center gap-3 mt-4 md:mt-0">
// //             {/* Filter Dropdown */}
// //             <div className="relative">
// //               <FiFilter className="absolute left-3 top-3 text-gray-400" />
// //               <select
// //                 value={filter}
// //                 onChange={(e) => {
// //                   setFilter(e.target.value);
// //                   setCurrentPage(1);
// //                 }}
// //                 className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
// //               >
// //                 <option value="all">All Users</option>
// //                 <option value="verified">Verified Users</option>
// //                 <option value="pending">Pending Users</option>
// //                 <option value="admin">Admins</option>
// //                 <option value="user">Regular Users</option>
// //               </select>
// //             </div>

// //             {/* Search */}
// //             <div className="relative w-full sm:w-auto">
// //               <FiSearch className="absolute left-3 top-3 text-gray-400" />
// //               <input
// //                 type="text"
// //                 placeholder="Search users..."
// //                 className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 w-full sm:w-64"
// //                 value={search}
// //                 onChange={(e) => {
// //                   setSearch(e.target.value);
// //                   setCurrentPage(1);
// //                 }}
// //               />
// //             </div>
// //           </div>
// //         </div>

// //         {/* 🔹 Table */}
// //         <div className="bg-white shadow-md border border-gray-100 rounded-xl overflow-hidden">
// //           <div className="overflow-x-auto">
// //             <table className="min-w-full text-sm text-left text-gray-600 border-collapse">
// //               <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
// //                 <tr className="border-b border-gray-200">
// //                   <th className="px-5 py-3 w-1/5">User</th>
// //                   <th className="px-5 py-3 w-1/5">Email</th>
// //                   <th className="px-5 py-3 w-1/10">Role</th>
// //                   <th className="px-5 py-3 w-1/10 text-center">Verified</th>
// //                   <th className="px-5 py-3 w-1/10 text-center">Wizard</th>
// //                   <th className="px-5 py-3 w-1/10 text-right">Created At</th>
// //                 </tr>
// //               </thead>

// //               <tbody className="divide-y divide-gray-100">
// //                 {loading ? (
// //                   <tr>
// //                     <td colSpan="6" className="text-center py-8 text-gray-500">
// //                       Loading users...
// //                     </td>
// //                   </tr>
// //                 ) : currentUsers.length > 0 ? (
// //                   currentUsers.map((user, idx) => (
// //                     <tr
// //                       key={user._id}
// //                       className={`transition-colors hover:bg-indigo-50 ${
// //                         idx % 2 === 0 ? "bg-white" : "bg-gray-50/70"
// //                       }`}
// //                     >
// //                       {/* 👤 User */}
// //                       <td className="px-5 py-3 font-medium text-gray-800 whitespace-nowrap">
// //                         <div className="flex items-center gap-2">
// //                           <FiUser className="text-indigo-500" />
// //                           {user.fullName || "—"}
// //                         </div>
// //                       </td>

// //                       {/* ✉️ Email */}
// //                       <td className="px-5 py-3 whitespace-nowrap">
// //                         <div className="flex items-center gap-2 text-gray-600">
// //                           <FiMail className="text-gray-400" />
// //                           {user.email}
// //                         </div>
// //                       </td>

// //                       {/* 🧩 Role */}
// //                       <td className="px-5 py-3 capitalize text-gray-700 whitespace-nowrap">
// //                         {user.role}
// //                       </td>

// //                       {/* ✅ Verified */}
// //                       <td className="px-5 py-3 text-center whitespace-nowrap">
// //                         {user.verified ? (
// //                           <span className="inline-flex items-center text-green-600 text-xs font-semibold bg-green-100 px-2 py-1 rounded-full">
// //                             <FiCheckCircle className="mr-1" /> Verified
// //                           </span>
// //                         ) : (
// //                           <span className="inline-flex items-center text-yellow-600 text-xs font-semibold bg-yellow-100 px-2 py-1 rounded-full">
// //                             <FiXCircle className="mr-1" /> Pending
// //                           </span>
// //                         )}
// //                       </td>

// //                       {/* 🧭 Wizard */}
// //                       <td className="px-5 py-3 text-center whitespace-nowrap">
// //                         {user.setup?.completed ? (
// //                           <span className="text-green-600 font-medium">
// //                             Completed
// //                           </span>
// //                         ) : (
// //                           <span className="text-gray-500 font-medium">
// //                             Step {user.setup?.stepCompleted || 0}
// //                           </span>
// //                         )}
// //                       </td>

// //                       {/* ⏰ Created */}
// //                       <td className="px-5 py-3 text-right text-gray-500 whitespace-nowrap">
// //                         {new Date(user.createdAt).toLocaleDateString()}
// //                       </td>
// //                     </tr>
// //                   ))
// //                 ) : (
// //                   <tr>
// //                     <td
// //                       colSpan="6"
// //                       className="text-center py-8 text-gray-500 text-sm"
// //                     >
// //                       No users found
// //                     </td>
// //                   </tr>
// //                 )}
// //               </tbody>
// //             </table>
// //           </div>

// //           {/* 🔹 Pagination */}
// //           {filteredUsers.length > usersPerPage && (
// //             <div className="flex items-center justify-center py-4 bg-gray-50 border-t border-gray-100 gap-3">
// //               <button
// //                 onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
// //                 disabled={currentPage === 1}
// //                 className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium border transition ${
// //                   currentPage === 1
// //                     ? "text-gray-400 border-gray-200 cursor-not-allowed"
// //                     : "text-indigo-600 border-indigo-300 hover:bg-indigo-50"
// //                 }`}
// //               >
// //                 <FiChevronLeft className="mr-1" /> Prev
// //               </button>

// //               <span className="text-sm text-gray-600">
// //                 Page <strong>{currentPage}</strong> of {totalPages}
// //               </span>

// //               <button
// //                 onClick={() =>
// //                   setCurrentPage((p) => Math.min(p + 1, totalPages))
// //                 }
// //                 disabled={currentPage === totalPages}
// //                 className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium border transition ${
// //                   currentPage === totalPages
// //                     ? "text-gray-400 border-gray-200 cursor-not-allowed"
// //                     : "text-indigo-600 border-indigo-300 hover:bg-indigo-50"
// //                 }`}
// //               >
// //                 Next <FiChevronRight className="ml-1" />
// //               </button>
// //             </div>
// //           )}
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default AdminUsers;
// import React, { useEffect, useState } from "react";
// import Sidebar from "../component/Sidebar";
// import {
//   FiSearch,
//   FiCheckCircle,
//   FiXCircle,
//   FiUser,
//   FiMail,
//   FiChevronLeft,
//   FiChevronRight,
//   FiFilter,
// } from "react-icons/fi";

// const AdminUsers = () => {
//   const [users, setUsers] = useState([]);
//   const [search, setSearch] = useState("");
//   const [filter, setFilter] = useState("all");
//   const [loading, setLoading] = useState(true);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [selectedUsers, setSelectedUsers] = useState([]); // ✅ NEW
//   const usersPerPage = 10;

//   useEffect(() => {
//     fetchUsers();
//   }, []);

//   const fetchUsers = async () => {
//     try {
//       const token = localStorage.getItem("token");
//       const res = await fetch("https://email-syncing-backend.vercel.app/auth/users", {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       const data = await res.json();
//       setUsers(data.users || []);
//     } catch (error) {
//       console.error("Error fetching users:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ✅ SELECT LOGIC
//   const toggleSelectUser = (id) => {
//     setSelectedUsers((prev) =>
//       prev.includes(id)
//         ? prev.filter((uid) => uid !== id)
//         : [...prev, id]
//     );
//   };

//   const selectAllUsers = () => {
//     if (selectedUsers.length === currentUsers.length) {
//       setSelectedUsers([]);
//     } else {
//       setSelectedUsers(currentUsers.map((u) => u._id));
//     }
//   };

//   // ✅ DELETE SINGLE
//   const deleteUser = async (id) => {
//     if (!window.confirm("Delete this user?")) return;

//     const token = localStorage.getItem("token");

//     await fetch(`https://email-syncing-backend.vercel.app/auth/user/${id}`, {
//       method: "DELETE",
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     });

//     setUsers((prev) => prev.filter((u) => u._id !== id));
//   };

//   // ✅ BULK DELETE
//   const deleteSelectedUsers = async () => {
//     if (!window.confirm("Delete selected users?")) return;

//     const token = localStorage.getItem("token");

//     await fetch(`https://email-syncing-backend.vercel.app/auth/users/bulk-delete`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//       body: JSON.stringify({ ids: selectedUsers }),
//     });

//     setUsers((prev) =>
//       prev.filter((u) => !selectedUsers.includes(u._id))
//     );

//     setSelectedUsers([]);
//   };

//   // 🔍 FILTER
//   const filteredUsers = users
//     .filter((user) => {
//       if (filter === "verified") return user.verified;
//       if (filter === "pending") return !user.verified;
//       if (filter === "admin") return user.role === "admin";
//       if (filter === "user") return user.role === "user";
//       return true;
//     })
//     .filter(
//       (user) =>
//         user.fullName?.toLowerCase().includes(search.toLowerCase()) ||
//         user.email?.toLowerCase().includes(search.toLowerCase())
//     );

//   // PAGINATION
//   const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
//   const startIndex = (currentPage - 1) * usersPerPage;
//   const currentUsers = filteredUsers.slice(
//     startIndex,
//     startIndex + usersPerPage
//   );

//   return (
//     <div className="min-h-screen bg-gray-50 md:ml-64 flex">
//       <Sidebar />

//       <div className="flex-1 p-6">
//         {/* HEADER */}
//         <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
//           <div>
//             <h1 className="text-2xl font-semibold text-gray-800">All Users</h1>
//             <p className="text-gray-500 text-sm">Manage all registered users</p>
//           </div>

//           <div className="flex flex-col sm:flex-row items-center gap-3 mt-4 md:mt-0">
//             <div className="relative">
//               <FiFilter className="absolute left-3 top-3 text-gray-400" />
//               <select
//                 value={filter}
//                 onChange={(e) => {
//                   setFilter(e.target.value);
//                   setCurrentPage(1);
//                 }}
//                 className="pl-10 pr-4 py-2 border rounded-lg text-sm"
//               >
//                 <option value="all">All Users</option>
//                 <option value="verified">Verified Users</option>
//                 <option value="pending">Pending Users</option>
//                 <option value="admin">Admins</option>
//                 <option value="user">Users</option>
//               </select>
//             </div>

//             <div className="relative">
//               <FiSearch className="absolute left-3 top-3 text-gray-400" />
//               <input
//                 type="text"
//                 placeholder="Search users..."
//                 className="pl-10 pr-4 py-2 border rounded-lg text-sm"
//                 value={search}
//                 onChange={(e) => {
//                   setSearch(e.target.value);
//                   setCurrentPage(1);
//                 }}
//               />
//             </div>
//           </div>
//         </div>

//         {/* ✅ BULK DELETE BUTTON */}
//         {selectedUsers.length > 0 && (
//           <button
//             onClick={deleteSelectedUsers}
//             className="mb-4 px-4 py-2 bg-red-600 text-white rounded-lg"
//           >
//             Delete Selected ({selectedUsers.length})
//           </button>
//         )}

//         {/* TABLE */}
//         <div className="bg-white shadow-md border rounded-xl overflow-hidden">
//           <div className="overflow-x-auto">
//             <table className="min-w-full text-sm text-left">
//               <thead>
//                 <tr>
//                   {/* ✅ SELECT ALL */}
//                   <th className="px-3">
//                     <input
//                       type="checkbox"
//                       onChange={selectAllUsers}
//                       checked={
//                         selectedUsers.length === currentUsers.length &&
//                         currentUsers.length > 0
//                       }
//                     />
//                   </th>

//                   <th>User</th>
//                   <th>Email</th>
//                   <th>Role</th>
//                   <th>Verified</th>
//                   <th>Wizard</th>
//                   <th>Created</th>

//                   {/* ✅ ACTION */}
//                   <th>Action</th>
//                 </tr>
//               </thead>

//               <tbody>
//                 {currentUsers.map((user) => (
//                   <tr key={user._id}>
//                     <td>
//                       <input
//                         type="checkbox"
//                         checked={selectedUsers.includes(user._id)}
//                         onChange={() => toggleSelectUser(user._id)}
//                       />
//                     </td>

//                     <td>{user.fullName}</td>
//                     <td>{user.email}</td>
//                     <td>{user.role}</td>
//                     <td>{user.verified ? "✔" : "⏳"}</td>
//                     <td>{user.setup?.stepCompleted || 0}</td>
//                     <td>{new Date(user.createdAt).toLocaleDateString()}</td>

//                     <td>
//                       <button
//                         onClick={() => deleteUser(user._id)}
//                         className="text-red-600"
//                       >
//                         Delete
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>

//         {/* PAGINATION */}
//         <div className="flex justify-center mt-4 gap-3">
//           <button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}>
//             Prev
//           </button>

//           <span>
//             {currentPage} / {totalPages}
//           </span>

//           <button
//             onClick={() =>
//               setCurrentPage((p) => Math.min(p + 1, totalPages))
//             }
//           >
//             Next
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AdminUsers;
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
  // ✅ MODAL STATES
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); // 'single' or 'bulk'
  const [activeId, setActiveId] = useState(null); // ID for single delete
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
    await handleRevokePro(cancelUserId);

    setIsCancelModalOpen(false);
    setCancelUserId(null);
  };

  const handleGivePro = async () => {
    try {
      const token = localStorage.getItem("token");

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

      setUsers((prev) =>
        prev.map((u) =>
          u._id === proUserId
            ? {
                ...u,
                subscription: {
                  ...u.subscription,
                  plan: "pro",
                  status: "active",
                  currentPeriodEnd: data.expiry,
                },
              }
            : u,
        ),
      );

      setIsProModalOpen(false);
      setProUserId(null);
      setDuration(30);
    } catch (error) {
      console.error(error);
    }
  };
  const handleRevokePro = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await fetch(`https://email-syncing-backend.vercel.app/auth/admin/revoke-pro/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // 🔥 update UI instantly
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
      console.error(error);
    }
  };
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("https://email-syncing-backend.vercel.app/auth/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ TRIGGER MODAL FUNCTIONS
  const openSingleDelete = (id) => {
    setDeleteTarget("single");
    setActiveId(id);
    setIsModalOpen(true);
  };

  const openBulkDelete = () => {
    setDeleteTarget("bulk");
    setIsModalOpen(true);
  };

  // ✅ ACTUAL DELETE API CALLS
  const handleConfirmDelete = async () => {
    const token = localStorage.getItem("token");

    if (deleteTarget === "single") {
      await fetch(`https://email-syncing-backend.vercel.app/auth/user/${activeId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers((prev) => prev.filter((u) => u._id !== activeId));
    } else {
      await fetch(`https://email-syncing-backend.vercel.app/auth/users/bulk-delete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ids: selectedUsers }),
      });
      setUsers((prev) => prev.filter((u) => !selectedUsers.includes(u._id)));
      setSelectedUsers([]);
    }

    setIsModalOpen(false);
    setActiveId(null);
  };

  // Logic Helpers
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
    <div className="min-h-screen bg-[#F8FAFC] md:ml-64 flex font-sans">
      <Sidebar />

      {/* ✅ CUSTOM CONFIRMATION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsModalOpen(false)}
          ></div>

          <div className="bg-white rounded-3xl p-8 max-w-sm w-full relative shadow-2xl transform transition-all animate-in zoom-in duration-200">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
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
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-200 transition-all"
              >
                Yes, Delete
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
                  className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-100"
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
                        <div className="flex items-center justify-center gap-2">
                          {isPro ? (
                            <button
                              onClick={() => openCancelModal(user._id)}
                              className="px-3 py-1.5 text-[10px] font-black tracking-widest text-amber-600 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-all uppercase"
                            >
                              Cancel Plan
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
                            onClick={() => openSingleDelete(user._id)}
                            className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                            title="Delete User"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        </div>
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
            onClick={() => setIsProModalOpen(false)}
          ></div>

          {/* MODAL */}
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full relative shadow-2xl">
            <h3 className="text-xl font-bold text-center mb-6">
              Assign Pro Plan
            </h3>

            {/* 🔴 DURATION INPUT */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2 text-slate-600">
                Duration (Days)
              </label>

              <input
                type="number"
                min={1}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                placeholder="Enter number of days"
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              />

              {/* 🔥 QUICK SELECT BUTTONS */}
              <div className="flex gap-2 mt-3">
                {[7, 30, 90].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDuration(d)}
                    className="px-3 py-1 bg-slate-100 hover:bg-indigo-100 rounded-lg text-sm font-medium"
                  >
                    {d}d
                  </button>
                ))}
              </div>
            </div>

            {/* ACTIONS */}
            <div className="flex gap-3">
              <button
                onClick={() => setIsProModalOpen(false)}
                className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 rounded-xl font-semibold"
              >
                Cancel
              </button>

              <button
                onClick={handleGivePro}
                disabled={!duration || duration <= 0}
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold disabled:opacity-50"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setIsCancelModalOpen(false)}
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
                onClick={() => setIsCancelModalOpen(false)}
                className="flex-1 py-3 bg-gray-200 rounded-xl font-semibold"
              >
                Cancel
              </button>

              <button
                onClick={confirmRevoke}
                className="flex-1 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-xl font-semibold"
              >
                Yes, Revoke
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;

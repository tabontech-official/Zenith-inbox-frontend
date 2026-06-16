import React, { useEffect, useState } from "react";
import Sidebar from "../component/Sidebar";
import {
  FiMail,
  FiCheckCircle,
  FiXCircle,
  FiDatabase,
  FiUser,
  FiCloud,
  FiFilter,
} from "react-icons/fi";

const AdminConnections = () => {
  const [connections, setConnections] = useState([]);
  const [filteredConnections, setFilteredConnections] = useState([]);
  const [users, setUsers] = useState([]); // distinct users list for filter
  const [selectedUser, setSelectedUser] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("https://email-syncing-backend.vercel.app/auth/connections", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        const allConnections = data.connections || [];

        setConnections(allConnections);
        setFilteredConnections(allConnections);

        // extract unique user names for dropdown
        const uniqueUsers = [
          ...new Map(
            allConnections.map((item) => [item.user?._id, item.user])
          ).values(),
        ];
        setUsers(uniqueUsers);
      } catch (error) {
        console.error("Error fetching connections:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchConnections();
  }, []);

  // 🔍 Filter by search and user
  useEffect(() => {
    let filtered = connections;

    if (selectedUser !== "All") {
      filtered = filtered.filter(
        (c) => c.user?._id === selectedUser || c.user?.fullName === selectedUser
      );
    }

    if (search.trim()) {
      filtered = filtered.filter(
        (c) =>
          c.email?.toLowerCase().includes(search.toLowerCase()) ||
          c.provider?.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFilteredConnections(filtered);
  }, [search, selectedUser, connections]);

  return (
    <div className="min-h-screen bg-gray-50 md:ml-64 flex">
      <Sidebar />

      <div className="flex-1 p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">
              All Connections
            </h1>
            <p className="text-gray-500 text-sm">
              View and filter all user email connections (Gmail, Outlook, SMTP)
            </p>
          </div>
        </div>

        {/* Filters Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          {/* 🔍 Search */}
          <input
            type="text"
            placeholder="Search by email or provider..."
            className="flex-1 pl-3 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* 👤 User Filter */}
          <div className="flex items-center space-x-2">
            <FiFilter className="text-gray-500" />
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="border border-gray-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <option value="All">All Users</option>
              {users.map(
                (u) =>
                  u && (
                    <option key={u._id} value={u._id}>
                      {u.fullName || u.email}
                    </option>
                  )
              )}
            </select>
          </div>
        </div>

        {/* Cards Grid */}
        {loading ? (
          <p className="text-center text-gray-500 py-10">Loading connections...</p>
        ) : filteredConnections.length > 0 ? (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredConnections.map((c) => (
              <div
                key={c._id}
                className="bg-white border border-gray-100 shadow-sm rounded-xl p-5 hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <FiCloud className="text-blue-400 w-5 h-5" />
                    <span className="capitalize font-medium text-gray-800">
                      {c.provider}
                    </span>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      c.status === "active"
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {c.status}
                  </span>
                </div>

                {/* Email */}
                <div className="flex items-center space-x-2 mb-2">
                  <FiMail className="text-gray-400" />
                  <span className="text-gray-700 break-all">{c.email}</span>
                </div>

                {/* Owner */}
                <div className="flex items-center space-x-2 mb-2">
                  <FiUser className="text-indigo-500" />
                  <span className="text-gray-700 text-sm font-medium">
                    {c.user?.fullName || "—"}
                  </span>
                </div>

                <div className="text-xs text-gray-500 ml-6 -mt-1">
                  {c.user?.email}
                </div>

                {/* Verified */}
                <div className="mt-4 flex items-center justify-between">
                  {c.verified ? (
                    <span className="flex items-center text-green-600 text-xs font-semibold bg-green-100 px-2 py-1 rounded-full">
                      <FiCheckCircle className="mr-1" /> Verified
                    </span>
                  ) : (
                    <span className="flex items-center text-yellow-600 text-xs font-semibold bg-yellow-100 px-2 py-1 rounded-full">
                      <FiXCircle className="mr-1" /> Pending
                    </span>
                  )}

                  <span className="text-gray-400 text-xs">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-10">No connections found</p>
        )}
      </div>
    </div>
  );
};

export default AdminConnections;

// import React, { useEffect, useState } from "react";
// import Sidebar from "../component/Sidebar";
// import {
//   FiMail,
//   FiCheckCircle,
//   FiXCircle,
//   FiUser,
//   FiCloud,
//   FiFilter,
//   FiTrash2,
//   FiAlertTriangle,
// } from "react-icons/fi";

// const AdminConnections = () => {
//   const [connections, setConnections] = useState([]);
//   const [filteredConnections, setFilteredConnections] = useState([]);
//   const [users, setUsers] = useState([]);
//   const [selectedUser, setSelectedUser] = useState("All");
//   const [search, setSearch] = useState("");
//   const [loading, setLoading] = useState(true);

//   const [deleteModalOpen, setDeleteModalOpen] = useState(false);
//   const [selectedConnection, setSelectedConnection] = useState(null);
//   const [deleting, setDeleting] = useState(false);
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");

//   const fetchConnections = async () => {
//     try {
//       setLoading(true);
//       setError("");

//       const token = localStorage.getItem("usertoken");

//       const res = await fetch("https://email-syncing-backend.vercel.app/auth/connections", {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         throw new Error(data.error || "Failed to fetch connections");
//       }

//       const allConnections = data.connections || [];

//       setConnections(allConnections);
//       setFilteredConnections(allConnections);

//       const uniqueUsers = [
//         ...new Map(
//           allConnections
//             .filter((item) => item.user)
//             .map((item) => [item.user?._id, item.user])
//         ).values(),
//       ];

//       setUsers(uniqueUsers);
//     } catch (error) {
//       console.error("Error fetching connections:", error);
//       setError(error.message || "Error fetching connections");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchConnections();
//   }, []);

//   useEffect(() => {
//     let filtered = connections;

//     if (selectedUser !== "All") {
//       filtered = filtered.filter(
//         (c) => c.user?._id === selectedUser || c.user?.fullName === selectedUser
//       );
//     }

//     if (search.trim()) {
//       filtered = filtered.filter(
//         (c) =>
//           c.email?.toLowerCase().includes(search.toLowerCase()) ||
//           c.provider?.toLowerCase().includes(search.toLowerCase()) ||
//           c.user?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
//           c.user?.email?.toLowerCase().includes(search.toLowerCase())
//       );
//     }

//     setFilteredConnections(filtered);
//   }, [search, selectedUser, connections]);

//   const openDeleteModal = (connection) => {
//     setSelectedConnection(connection);
//     setDeleteModalOpen(true);
//     setError("");
//     setSuccess("");
//   };

//   const closeDeleteModal = () => {
//     if (deleting) return;

//     setDeleteModalOpen(false);
//     setSelectedConnection(null);
//   };

//   const handleDeleteConnection = async () => {
//     if (!selectedConnection?._id) return;

//     try {
//       setDeleting(true);
//       setError("");
//       setSuccess("");

//       const token = localStorage.getItem("usertoken");

//       const res = await fetch(
//         `https://email-syncing-backend.vercel.app/auth/connection/${selectedConnection._id}`,
//         {
//           method: "DELETE",
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       const data = await res.json();

//       if (!res.ok) {
//         throw new Error(data.error || "Failed to delete connection");
//       }

//       setConnections((prev) =>
//         prev.filter((connection) => connection._id !== selectedConnection._id)
//       );

//       setSuccess("Connection deleted successfully");
//       closeDeleteModal();
//     } catch (error) {
//       console.error("Delete connection error:", error);
//       setError(error.message || "Failed to delete connection");
//     } finally {
//       setDeleting(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 md:ml-64 flex">
//       <Sidebar />

//       <div className="flex-1 p-6">
//         <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
//           <div>
//             <h1 className="text-2xl font-semibold text-gray-800">
//               All Connections
//             </h1>
//             <p className="text-gray-500 text-sm">
//               View, filter, and delete all user email connections.
//             </p>
//           </div>
//         </div>

//         {error && (
//           <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded-lg mb-4 text-sm">
//             {error}
//           </div>
//         )}

//         {success && (
//           <div className="bg-green-100 border border-green-300 text-green-700 px-4 py-2 rounded-lg mb-4 text-sm">
//             {success}
//           </div>
//         )}

//         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
//           <input
//             type="text"
//             placeholder="Search by email, provider, or user..."
//             className="flex-1 pl-3 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//           />

//           <div className="flex items-center space-x-2">
//             <FiFilter className="text-gray-500" />
//             <select
//               value={selectedUser}
//               onChange={(e) => setSelectedUser(e.target.value)}
//               className="border border-gray-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
//             >
//               <option value="All">All Users</option>
//               {users.map(
//                 (u) =>
//                   u && (
//                     <option key={u._id} value={u._id}>
//                       {u.fullName || u.email}
//                     </option>
//                   )
//               )}
//             </select>
//           </div>
//         </div>

//         {loading ? (
//           <p className="text-center text-gray-500 py-10">
//             Loading connections...
//           </p>
//         ) : filteredConnections.length > 0 ? (
//           <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
//             {filteredConnections.map((c) => (
//               <div
//                 key={c._id}
//                 className="bg-white border border-gray-100 shadow-sm rounded-xl p-5 hover:shadow-md transition-shadow"
//               >
//                 <div className="flex items-center justify-between mb-3">
//                   <div className="flex items-center space-x-2">
//                     <FiCloud className="text-blue-400 w-5 h-5" />
//                     <span className="capitalize font-medium text-gray-800">
//                       {c.provider}
//                     </span>
//                   </div>

//                   <span
//                     className={`text-xs font-semibold px-2 py-1 rounded-full ${
//                       c.status === "active"
//                         ? "bg-green-100 text-green-600"
//                         : "bg-red-100 text-red-600"
//                     }`}
//                   >
//                     {c.status}
//                   </span>
//                 </div>

//                 <div className="flex items-center space-x-2 mb-2">
//                   <FiMail className="text-gray-400" />
//                   <span className="text-gray-700 break-all">{c.email}</span>
//                 </div>

//                 <div className="flex items-center space-x-2 mb-2">
//                   <FiUser className="text-indigo-500" />
//                   <span className="text-gray-700 text-sm font-medium">
//                     {c.user?.fullName || "—"}
//                   </span>
//                 </div>

//                 <div className="text-xs text-gray-500 ml-6 -mt-1 break-all">
//                   {c.user?.email || "No user email"}
//                 </div>

//                 <div className="mt-4 flex items-center justify-between">
//                   {c.verified ? (
//                     <span className="flex items-center text-green-600 text-xs font-semibold bg-green-100 px-2 py-1 rounded-full">
//                       <FiCheckCircle className="mr-1" /> Verified
//                     </span>
//                   ) : (
//                     <span className="flex items-center text-yellow-600 text-xs font-semibold bg-yellow-100 px-2 py-1 rounded-full">
//                       <FiXCircle className="mr-1" /> Pending
//                     </span>
//                   )}

//                   <span className="text-gray-400 text-xs">
//                     {c.createdAt
//                       ? new Date(c.createdAt).toLocaleDateString()
//                       : "—"}
//                   </span>
//                 </div>

//                 <button
//                   onClick={() => openDeleteModal(c)}
//                   className="mt-5 w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 border border-red-200 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition"
//                 >
//                   <FiTrash2 />
//                   Delete Connection
//                 </button>
//               </div>
//             ))}
//           </div>
//         ) : (
//           <p className="text-center text-gray-500 py-10">
//             No connections found
//           </p>
//         )}
//       </div>

//       {deleteModalOpen && selectedConnection && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
//           <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
//             <div className="flex items-center gap-3 mb-4">
//               <div className="bg-red-100 text-red-600 rounded-full p-3">
//                 <FiAlertTriangle className="w-6 h-6" />
//               </div>

//               <div>
//                 <h2 className="text-lg font-semibold text-gray-800">
//                   Delete Connection?
//                 </h2>
//                 <p className="text-sm text-gray-500">
//                   This action cannot be undone.
//                 </p>
//               </div>
//             </div>

//             <div className="bg-gray-50 rounded-lg p-4 text-sm mb-5">
//               <p className="text-gray-700">
//                 <span className="font-semibold">Provider:</span>{" "}
//                 {selectedConnection.provider}
//               </p>

//               <p className="text-gray-700 break-all mt-1">
//                 <span className="font-semibold">Email:</span>{" "}
//                 {selectedConnection.email}
//               </p>

//               <p className="text-gray-700 mt-1">
//                 <span className="font-semibold">User:</span>{" "}
//                 {selectedConnection.user?.fullName || "—"}
//               </p>
//             </div>

//             <div className="flex items-center justify-end gap-3">
//               <button
//                 onClick={closeDeleteModal}
//                 disabled={deleting}
//                 className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm hover:bg-gray-100 disabled:opacity-60"
//               >
//                 Cancel
//               </button>

//               <button
//                 onClick={handleDeleteConnection}
//                 disabled={deleting}
//                 className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed"
//               >
//                 {deleting ? "Deleting..." : "Yes, Delete"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AdminConnections;
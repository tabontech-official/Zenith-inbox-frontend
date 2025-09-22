// import React, { useState, useEffect } from "react";
// import Sidebar from "../component/Sidebar";
// import { Link } from "react-router-dom";
// import ConnectionModal from "../component/ConnectionModal";
// import { FaGoogle } from "react-icons/fa";
// import axios from "axios";

// const ConnectionsPage = () => {
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [connections, setConnections] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const openModal = () => setIsModalOpen(true);
//   const closeModal = () => setIsModalOpen(false);

//   useEffect(() => {
//     const fetchConnections = async () => {
//       try {
//         const userId = localStorage.getItem("userid"); // stored after login
//         if (!userId) {
//           console.warn("⚠️ No userId in localStorage");
//           setLoading(false);
//           return;
//         }
//         const res = await axios.get(
//           `http://localhost:5000/auth/getConnection/${userId}`
//         );
//         setConnections(res.data);
//       } catch (err) {
//         console.error("❌ Failed to fetch connections:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchConnections();
//   }, []);

//   return (
//     <div className="flex">
//       <Sidebar />

//       {/* Main Content */}
//       <div className="ml-64 flex-1 min-h-screen bg-gray-50 font-sans text-gray-800">
//         <header className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
//           <h1 className="text-2xl font-normal">Connections</h1>
//           <div className="relative">
//             <button
//               onClick={openModal}
//               className="px-4 py-2 text-sm font-semibold text-white bg-[#e45341] rounded-md hover:bg-[#c24434] focus:outline-none focus:ring-2 focus:ring-[#e45341] focus:ring-offset-2 transition-colors flex items-center"
//             >
//               <FaGoogle className="h-5 w-5 mr-2" />
//               <div className="border-r border-white mx-2 h-5"></div>
//               Create a connection
//             </button>
//           </div>
//         </header>

//         <main className="container mx-auto p-8">
//           {/* Navigation */}
//           <nav className="flex items-center mb-8">
//             <span className="relative pb-1 font-semibold text-purple-600 border-b-2 border-purple-600">
//               ALL
//             </span>
//           </nav>

//           {loading ? (
//             <div className="flex justify-center text-gray-500 mb-12">
//               Loading connections...
//             </div>
//           ) : connections.length === 0 ? (
//             <div className="flex justify-center text-gray-500 mb-12">
//               You haven't created any connections yet
//             </div>
//           ) : (
//             <div className="grid gap-4">
//               {connections.map((conn) => (
//                 <div
//                   key={conn._id}
//                   className="flex items-center justify-between p-4 bg-white border rounded-md shadow-sm"
//                 >
//                   <div>
//                     <h3 className="text-lg font-semibold">{conn.email}</h3>
//                     <p className="text-sm text-gray-500">
//                       {conn.provider.toUpperCase()} connection
//                     </p>
//                   </div>
//                   {/* <button className="px-3 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-600">
//                     Disconnect
//                   </button> */}
//                 </div>
//               ))}
//             </div>
//           )}
//         </main>
//       </div>

//       {/* Connection Modal */}
//       <ConnectionModal isOpen={isModalOpen} onClose={closeModal} />
//     </div>
//   );
// };

// export default ConnectionsPage;
import React, { useState, useEffect } from "react";
import Sidebar from "../component/Sidebar";
import ConnectionModal from "../component/ConnectionModal";
import { FaGoogle, FaMicrosoft, FaEnvelope } from "react-icons/fa";
import axios from "axios";

const ConnectionsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const userId = localStorage.getItem("userid");
        if (!userId) {
          console.warn("⚠️ No userId in localStorage");
          setLoading(false);
          return;
        }
        const res = await axios.get(
          `http://localhost:5000/auth/getConnection/${userId}`
        );
        setConnections(res.data);
      } catch (err) {
        console.error("❌ Failed to fetch connections:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchConnections();
  }, []);

  // ✅ Map provider to icon
  const providerIcon = (provider) => {
    switch (provider.toLowerCase()) {
      case "gmail":
        return <FaGoogle className="text-red-500 h-6 w-6" />;
      case "outlook":
        return <FaMicrosoft className="text-blue-600 h-6 w-6" />;
      default:
        return <FaEnvelope className="text-gray-500 h-6 w-6" />;
    }
  };

  return (
    <div className="flex">
      <Sidebar />

      {/* Main Content */}
      <div className="ml-64 flex-1 min-h-screen bg-gray-50 font-sans text-gray-800">
        {/* Header */}
        <header className="flex items-center justify-between p-6 bg-white border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-800">Connections</h1>
          <button
            onClick={openModal}
            className="flex items-center px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg shadow hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
          >
            <FaGoogle className="h-5 w-5 mr-2" />
            Create Connection
          </button>
        </header>

        <main className="container mx-auto p-8">
          {/* Tabs (future expandable) */}
          <nav className="flex items-center mb-6 text-sm font-medium text-gray-600">
            <span className="relative pb-1 text-purple-600 border-b-2 border-purple-600">
              All Connections
            </span>
          </nav>

          {/* Connections */}
          {loading ? (
            <div className="flex justify-center py-16 text-gray-500">
              Loading connections...
            </div>
          ) : connections.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
              <FaEnvelope className="h-12 w-12 text-gray-400 mb-3" />
              <p className="text-lg">You haven’t created any connections yet.</p>
              <button
                onClick={openModal}
                className="mt-4 px-5 py-2 text-sm font-medium bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
              >
                + Create Connection
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {connections.map((conn) => (
                <div
                  key={conn._id}
                  className="flex items-center justify-between p-5 bg-white border rounded-lg shadow-sm hover:shadow-md transition"
                >
                  <div className="flex items-center space-x-3">
                    {providerIcon(conn.provider)}
                    <div>
                      <h3 className="text-base font-semibold text-gray-800">
                        {conn.email}
                      </h3>
                      <p className="text-sm text-gray-500 capitalize">
                        {conn.provider} connection
                      </p>
                    </div>
                  </div>
                  {/* Future Disconnect Button */}
                  {/* <button className="px-3 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-600">
                    Disconnect
                  </button> */}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Connection Modal */}
      <ConnectionModal isOpen={isModalOpen} onClose={closeModal} />
    </div>
  );
};

export default ConnectionsPage;

// import React from 'react';
// import Sidebar from '../component/Sidebar';
// import { Link } from 'react-router-dom';

// const ConnectionsPage = () => {
//   return (
//     <div className="flex">
//       <Sidebar />

//       {/* Main Content */}
//       <div className="ml-64 flex-1 min-h-screen bg-gray-50 font-sans text-gray-800">
//         <header className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
//           <h1 className="text-2xl font-normal">Connections</h1>
//           <div className="relative">
//             <input
//               type="text"
//               placeholder="Search"
//               className="w-64 px-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
//             />
//           </div>
//         </header>

//         <main className="container mx-auto p-8">
//           {/* Navigation */}
//           <nav className="flex items-center mb-8">
//             <span className="relative pb-1 font-semibold text-purple-600 border-b-2 border-purple-600">
//               ALL
//             </span>
//           </nav>

//           {/* Empty State Text */}
//           <div className="flex justify-center text-gray-500 mb-12">
//             You haven't created any connections yet
//           </div>

//           {/* Centered Card */}
//           <div className="flex justify-center">
//             <div className="max-w-xl p-8 text-center bg-white border border-gray-200 rounded-xl shadow-sm">
//               {/* Icon Circle */}
//               <div className="flex justify-center mb-4">
//                 <div className="relative flex items-center justify-center w-20 h-20 p-2 text-white bg-purple-500 rounded-full">
//                   <span className="absolute top-1 left-3">
//                     <svg
//                       xmlns="http://www.w3.org/2000/svg"
//                       className="w-8 h-8"
//                       fill="none"
//                       viewBox="0 0 24 24"
//                       stroke="currentColor"
//                     >
//                       <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
//                       <circle cx="12" cy="7" r="4" />
//                     </svg>
//                   </span>
//                   <span className="absolute bottom-1 right-3">
//                     <svg
//                       xmlns="http://www.w3.org/2000/svg"
//                       className="w-8 h-8"
//                       fill="none"
//                       viewBox="0 0 24 24"
//                       stroke="currentColor"
//                     >
//                       <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
//                       <polyline points="22,6 12,13 2,6" />
//                     </svg>
//                   </span>
//                 </div>
//               </div>

//               {/* Content */}
//               <h2 className="mb-2 text-2xl font-normal">
//                 Connect more than 2000+ apps
//               </h2>
//               <p className="mb-6 text-sm text-gray-500 leading-relaxed">
//                 Connections are authorized third-party apps that you grant
//                 access permission to use with Make. Connections are the first
//                 step when building your scenario. Open the Scenario Builder and
//                 start adding modules of apps you want to connect.
//               </p>
//                     <Link to="/scenarios/add">
//         <button className="px-6 py-3 text-sm font-semibold text-white bg-purple-600 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors">
//                 Open Scenario Builder
//               </button>
//       </Link>
//             </div>
//           </div>

//           {/* Learn More */}
//           <div className="mt-8 text-center">
//             <a href="#" className="text-sm text-purple-600 hover:underline">
//               Learn more about Connections
//             </a>
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// };

// export default ConnectionsPage;
import React, { useState } from "react";
import Sidebar from "../component/Sidebar";
import { Link } from "react-router-dom";
import ConnectionModal from "../component/ConnectionModal";
import { FaGoogle, FaLink } from "react-icons/fa";

const ConnectionsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="flex">
      <Sidebar />

      {/* Main Content */}
      <div className="ml-64 flex-1 min-h-screen bg-gray-50 font-sans text-gray-800">
        <header className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
          <h1 className="text-2xl font-normal">Connections</h1>
          <div className="relative">
            <button
              onClick={openModal}
              className="px-4 py-2 text-sm font-semibold text-white bg-[#e45341] rounded-md hover:bg-[#c24434] focus:outline-none focus:ring-2 focus:ring-[#e45341] focus:ring-offset-2 transition-colors flex items-center"
            >
              <FaGoogle className="h-5 w-5 mr-2" />
              <div className="border-r border-white mx-2 h-5"></div>
              Create a connection
            </button>
          </div>
        </header>

        <main className="container mx-auto p-8">
          {/* Navigation */}
          <nav className="flex items-center mb-8">
            <span className="relative pb-1 font-semibold text-purple-600 border-b-2 border-purple-600">
              ALL
            </span>
          </nav>

          {/* Empty State Text */}
          <div className="flex justify-center text-gray-500 mb-12">
            You haven't created any connections yet
          </div>

          {/* Centered Card */}
          <div className="flex justify-center">
            <div className="max-w-xl p-8 text-center bg-white border border-gray-200 rounded-xl shadow-sm">
              {/* Icon Circle */}
              <div className="flex justify-center mb-4">
                <div className="relative flex items-center justify-center w-20 h-20 p-2 text-white bg-purple-500 rounded-full">
                  <span className="absolute top-1 left-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-8 h-8"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </span>
                  <span className="absolute bottom-1 right-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-8 h-8"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  </span>
                </div>
              </div>

              {/* Content */}
              <h2 className="mb-2 text-2xl font-normal">
                Connect more than 2000+ apps
              </h2>
              <p className="mb-6 text-sm text-gray-500 leading-relaxed">
                Connections are authorized third-party apps that you grant
                access permission to use with Make. Connections are the first
                step when building your scenario. Open the Scenario Builder and
                start adding modules of apps you want to connect.
              </p>
              <Link to="/scenarios/add">
                <button className="px-6 py-3 text-sm font-semibold text-white bg-purple-600 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors">
                  Open Scenario Builder
                </button>
              </Link>
            </div>
          </div>

          {/* Learn More */}
          <div className="mt-8 text-center">
            <a href="#" className="text-sm text-purple-600 hover:underline">
              Learn more about Connections
            </a>
          </div>
        </main>
      </div>

      {/* The Modal Component - Renders based on isModalOpen state */}
      <ConnectionModal isOpen={isModalOpen} onClose={closeModal} />
    </div>
  );
};

export default ConnectionsPage;

// import React, { useState } from 'react';
// import { FaGoogle, FaRegTimesCircle, FaChevronRight } from 'react-icons/fa';
// import { MdError } from 'react-icons/md';
// import { IoIosArrowForward } from 'react-icons/io';

// const ConnectionModal = ({ isOpen, onClose }) => {
//   const [connectionName, setConnectionName] = useState('My Google Restricted connection');
//   const [advancedSettings, setAdvancedSettings] = useState(false);

//   if (!isOpen) {
//     return null;
//   }

//   return (
//     <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center pt-12 z-50 font-sans text-sm text-gray-800">
//       <div className="bg-white rounded-md shadow-2xl overflow-hidden w-[500px] flex flex-col h-fit">

// <div className="bg-gradient-to-r from-[#e45341] to-[#f46654] text-white flex justify-between items-center py-2 px-4 h-[42px] font-medium">
//           <div className="flex items-center gap-2">
//             <FaChevronRight className="h-4 w-4" />
//             <span>Create a connection</span>
//           </div>
//           <div className="flex items-center gap-2">
//             <FaRegTimesCircle onClick={onClose} className="h-4 w-4 cursor-pointer" />
//           </div>
//         </div>

//         <div className="bg-gray-50 p-4 border-b border-gray-300">

//           <div className="bg-white p-4 rounded-md border border-gray-200 shadow-sm">
//             <div className="flex items-center mb-3">
//               <IoIosArrowForward className="h-4 w-4 rotate-90 text-gray-400 mr-2" />
//               <label className="font-semibold text-sm">
//                 Connection name <span className="text-red-600 font-normal ml-0.5">*</span>
//               </label>
//             </div>
//             <input
//               type="text"
//               value={connectionName}
//               onChange={(e) => setConnectionName(e.target.value)}
//               className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
//             />
//           </div>

//           <div className="mt-4 space-y-4">
//             <div className="flex items-start bg-blue-50 p-3 rounded-md border border-blue-200">
//               <MdError className="h-5 w-5 text-yellow-500 mr-2 mt-1" />
//               <div className="text-xs text-gray-600">
//                 Make's use and transfer of information received from Google APIs to any other app will adhere to <a href="#" className="text-blue-600 underline hover:no-underline">Google API Services User Data Policy</a>.
//               </div>
//             </div>

//             <p className="text-xs text-gray-600">
//               When using a personal Google account (@gmail or @googolemail), please follow <a href="#" className="text-blue-600 underline hover:no-underline">this guide</a> with additional required steps to connect.
//             </p>
//           </div>
//         </div>

//         <div className="flex justify-between items-center py-3 px-4 bg-gray-100 border-t border-gray-300 h-[52px]">

//           <div className="flex items-center">
//             <label className="relative inline-flex items-center cursor-pointer">
//               <input
//                 type="checkbox"
//                 className="sr-only peer"
//                 checked={advancedSettings}
//                 onChange={() => setAdvancedSettings(!advancedSettings)}
//               />
//               <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer-checked:bg-green-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full after:ease-in-out after:duration-300"></div>
//               <span className="ml-2 text-sm text-gray-700">Advanced settings</span>
//             </label>
//           </div>

//           <div className="flex gap-2">
//             <button
//               onClick={onClose}
//               className="py-2 px-4 border border-gray-300 rounded-md text-sm font-medium bg-white hover:bg-gray-100"
//             >
//               Close
//             </button>
//             <button
//               className="py-2 px-4 flex items-center gap-1 border border-blue-600 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
//             >
//               <FaGoogle className="w-5 h-5 -ml-1" />
//               <span>Sign in with Google</span>
//             </button>
//           </div>
//         </div>

//       </div>
//     </div>
//   );
// };

// export default ConnectionModal;
import React, { useState } from "react";
import { FaGoogle, FaRegTimesCircle, FaChevronRight } from "react-icons/fa";
import { MdError } from "react-icons/md";
import { IoIosArrowForward } from "react-icons/io";

const ConnectionModal = ({ isOpen, onClose }) => {
  const [connectionName, setConnectionName] = useState(
    "My Google Restricted connection"
  );
  const [advancedSettings, setAdvancedSettings] = useState(false);

 const handleGoogleSignIn = () => {
  const userId = localStorage.getItem("userid"); // this should already be set when user logs in

  
  window.location.href = `https://email-syncing-backend.vercel.app/auth/google?userId=${userId}`;
};

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center pt-12 z-50 font-sans text-sm text-gray-800">
      <div className="bg-white rounded-md shadow-2xl overflow-hidden w-[500px] flex flex-col h-fit">
        <div className="bg-gradient-to-r from-[#e45341] to-[#f46654] text-white flex justify-between items-center py-2 px-4 h-[42px] font-medium">
          <div className="flex items-center gap-2">
            <FaChevronRight className="h-4 w-4" />
            <span>Create a connection</span>
          </div>
          <div className="flex items-center gap-2">
            <FaRegTimesCircle
              onClick={onClose}
              className="h-4 w-4 cursor-pointer"
            />
          </div>
        </div>

        <div className="bg-gray-50 p-4 border-b border-gray-300">
          <div className="bg-white p-4 rounded-md border border-gray-200 shadow-sm">
            <div className="flex items-center mb-3">
              <IoIosArrowForward className="h-4 w-4 rotate-90 text-gray-400 mr-2" />
              <label className="font-semibold text-sm">
                Connection name{" "}
                <span className="text-red-600 font-normal ml-0.5">*</span>
              </label>
            </div>
            <input
              type="text"
              value={connectionName}
              onChange={(e) => setConnectionName(e.target.value)}
              className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
            />
          </div>

          <div className="mt-4 space-y-4">
            <div className="flex items-start bg-blue-50 p-3 rounded-md border border-blue-200">
              <MdError className="h-5 w-5 text-yellow-500 mr-2 mt-1" />
              <div className="text-xs text-gray-600">
                Make's use and transfer of information received from Google APIs
                to any other app will adhere to{" "}
                <a
                  href="#"
                  className="text-blue-600 underline hover:no-underline"
                >
                  Google API Services User Data Policy
                </a>
                .
              </div>
            </div>

            <p className="text-xs text-gray-600">
              When using a personal Google account (@gmail or @googolemail),
              please follow{" "}
              <a
                href="#"
                className="text-blue-600 underline hover:no-underline"
              >
                this guide
              </a>{" "}
              with additional required steps to connect.
            </p>
          </div>
        </div>

        <div className="flex justify-between items-center py-3 px-4 bg-gray-100 border-t border-gray-300 h-[52px]">
          <div className="flex items-center">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={advancedSettings}
                onChange={() => setAdvancedSettings(!advancedSettings)}
              />
              <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer-checked:bg-green-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full after:ease-in-out after:duration-300"></div>
              <span className="ml-2 text-sm text-gray-700">
                Advanced settings
              </span>
            </label>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="py-2 px-4 border border-gray-300 rounded-md text-sm font-medium bg-white hover:bg-gray-100"
            >
              Close
            </button>
            <button
              onClick={handleGoogleSignIn}
              className="py-2 px-4 flex items-center gap-1 border border-blue-600 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
            >
              <FaGoogle className="w-5 h-5 -ml-1" />
              <span>Sign in with Google</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectionModal;

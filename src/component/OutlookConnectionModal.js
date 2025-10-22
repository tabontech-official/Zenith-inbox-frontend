// import React, { useState } from "react";
// import { FaMicrosoft } from "react-icons/fa";
// import { FiEye, FiEyeOff, FiX } from "react-icons/fi";

// const OutlookConnectionModal = ({ isOpen, onClose, onSuccess }) => {
//   const [form, setForm] = useState({
//     name: "My Outlook Connection",
//     provider: "outlook",
//     email: "",
//     fullName: "",
//     username: "",
//     password: "",
//     host: "smtp.office365.com",
//     port: 587,
//   });

//   const [showPassword, setShowPassword] = useState(false);

//   if (!isOpen) return null;

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async () => {
//     try {
//       const userId = localStorage.getItem("userid");
//       const payload = { ...form, userId };

//       const res = await fetch(
//         "http://localhost:5000/auth/saveSmtpConnection",
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify(payload),
//         }
//       );

//       if (!res.ok) {
//         throw new Error("Failed to save connection");
//       }

//       const data = await res.json();

//       if (onSuccess) {
//         onSuccess(data);
//       }

//       onClose();
//     } catch (err) {}
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
//       <div className="bg-white rounded-lg shadow-xl w-[420px] overflow-hidden">
//         {/* Header */}
//         <div className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
//           <div className="flex items-center space-x-2">
//             <FaMicrosoft className="text-white text-xl" />
//             <h2 className="font-semibold text-lg">Connect Outlook (SMTP)</h2>
//           </div>
//           <button onClick={onClose}>
//             <FiX className="text-white text-lg hover:text-gray-200" />
//           </button>
//         </div>

//         <div className="p-6 space-y-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Connection Name
//             </label>
//             <input
//               type="text"
//               name="name"
//               value={form.name}
//               onChange={handleChange}
//               className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Email Address
//             </label>
//             <input
//               type="email"
//               name="email"
//               value={form.email}
//               onChange={handleChange}
//               className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
//               placeholder="yourname@outlook.com"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Full Name
//             </label>
//             <input
//               type="text"
//               name="fullName"
//               value={form.fullName}
//               onChange={handleChange}
//               className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
//               placeholder="Your full name"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Username
//             </label>
//             <input
//               type="text"
//               name="username"
//               value={form.username}
//               onChange={handleChange}
//               className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
//               placeholder="Usually same as email"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Password / App Password
//             </label>
//             <div className="relative">
//               <input
//                 type={showPassword ? "text" : "password"}
//                 name="password"
//                 value={form.password}
//                 onChange={handleChange}
//                 className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none pr-10"
//                 placeholder="Enter password"
//               />
//               <button
//                 type="button"
//                 onClick={() => setShowPassword(!showPassword)}
//                 className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
//               >
//                 {showPassword ? <FiEyeOff /> : <FiEye />}
//               </button>
//             </div>
//             <p className="text-xs text-gray-500 mt-1">
//               If MFA is enabled, use an Outlook App Password.
//             </p>
//           </div>

//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 SMTP Host
//               </label>
//               <input
//                 type="text"
//                 name="host"
//                 value={form.host}
//                 onChange={handleChange}
//                 className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Port
//               </label>
//               <input
//                 type="number"
//                 name="port"
//                 value={form.port}
//                 onChange={handleChange}
//                 className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
//               />
//             </div>
//           </div>
//         </div>

//         <div className="flex justify-end space-x-3 px-6 py-4 border-t bg-gray-50">
//           <button
//             onClick={onClose}
//             className="px-4 py-2 text-sm border rounded hover:bg-gray-100"
//           >
//             Cancel
//           </button>
//           <button
//             onClick={handleSubmit}
//             className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
//           >
//             Save Connection
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default OutlookConnectionModal;
import React, { useState } from "react";
import { FaMicrosoft } from "react-icons/fa";
import { FiEye, FiEyeOff, FiX } from "react-icons/fi";

const OutlookConnectionModal = ({ isOpen, onClose, onSuccess }) => {
  const [connectionType, setConnectionType] = useState("other"); // "other" | "microsoft"
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    name: "My Outlook Connection",
    provider: "outlook",
    email: "",
    fullName: "",
    username: "",
    password: "",
    host: "smtp.office365.com",
    port: 587,
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const userId = localStorage.getItem("userid");

      if (!userId) {
        alert("User not found. Please login again.");
        return;
      }

      if (connectionType === "other") {
        const payload = { ...form, userId };
        const res = await fetch(
          "http://localhost:5000/auth/saveSmtpConnection",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );

        if (!res.ok) throw new Error("Failed to save connection");
        const data = await res.json();
        onSuccess?.(data);
        onClose();
      } else {
        window.location.href = `http://localhost:5000/auth/outlook?userId=${userId}`;
      }
    } catch (err) {
      console.error("Error saving connection:", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-[440px] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="flex items-center space-x-2">
            <FaMicrosoft className="text-white text-xl" />
            <h2 className="font-semibold text-lg">Connect Outlook</h2>
          </div>
          <button onClick={onClose}>
            <FiX className="text-white text-lg hover:text-gray-200" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Connection Type
            </label>
            <select
              value={connectionType}
              onChange={(e) => setConnectionType(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="other">Other (Custom SMTP)</option>
              <option value="microsoft">Microsoft 365 (OAuth)</option>
            </select>
          </div>

          {connectionType === "other" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Connection Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="yourname@outlook.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Usually same as email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password / App Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none pr-10"
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  If MFA is enabled, use an Outlook App Password.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SMTP Host
                  </label>
                  <input
                    type="text"
                    name="host"
                    value={form.host}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Port
                  </label>
                  <input
                    type="number"
                    name="port"
                    value={form.port}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            </>
          )}

          {connectionType === "microsoft" && (
            <div className="flex flex-col items-center justify-center py-6">
              <p className="text-sm text-gray-600 mb-3 text-center">
                Connect your Outlook (Microsoft 365) account securely using
                OAuth.
              </p>
              <button
                onClick={() => handleSubmit()}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow"
              >
                <FaMicrosoft />
                <span>Connect with Microsoft</span>
              </button>
            </div>
          )}
        </div>

        {connectionType === "other" && (
          <div className="flex justify-end space-x-3 px-6 py-4 border-t bg-gray-50">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm border rounded hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Save Connection
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OutlookConnectionModal;

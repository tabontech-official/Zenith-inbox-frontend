// import React, { useState } from "react";
// import {
//   Plus,
//   Search,
//   ArrowLeft,
//   Settings,
//   Database,
//   FileText,
//   Mail,
//   Code,
//   Cloud,
//   GitBranch,
//   Shield,
//   Network,
// } from "lucide-react";

// import Sidebar from "../component/Sidebar";
// import { Link } from "react-router-dom";

// const BuildScenario = () => {
//   const [open, setOpen] = useState(false); // apps sidebar
//   const [selectedApp, setSelectedApp] = useState(null); // app detail
//   const [selectedModule, setSelectedModule] = useState(null); // trigger/action modal
//   const [savedModule, setSavedModule] = useState(null); // saved module to show as card
//   const [savedSecondModule, setSavedSecondModule] = useState(null); // second saved module

//   const apps = [
//         { name: "Webhooks", color: "bg-red-500", icon: <Cloud /> },
//             { name: "Gmail", color: "bg-red-500", icon: <Mail /> },

//     { name: "Router", color: "bg-green-500", icon: <Cloud /> },
//     { name: "Airtable", color: "bg-sky-500", icon: <Database /> },
//     { name: "Google Drive", color: "bg-yellow-500", icon: <FileText /> },
//     { name: "JSON", color: "bg-purple-400", icon: <Code /> },
//     { name: "Text parser", color: "bg-orange-400", icon: <Search /> },
//     { name: "Notion", color: "bg-black", icon: <GitBranch /> },
//     { name: "Google Sheets", color: "bg-green-500", icon: <Database /> },
//     { name: "Flow Control", color: "bg-green-400", icon: <Settings /> },
//     { name: "Tools", color: "bg-purple-400", icon: <Shield /> },
//     {
//       name: "OpenAI (ChatGPT, Whisper, DALL·E)",
//       color: "bg-green-600",
//       icon: <Mail />,
//     },
//   ];

//   const handleSave = () => {
//     if (!savedModule) {
//       setSavedModule({
//         app: selectedApp,
//         type: "Custom mailhook",
//         description: "Custom mailhook",
//       });
//     } else {
//       setSavedSecondModule({
//         app: selectedApp,
//         type:
//           selectedModule === "customMailhook"
//             ? "Custom mailhook"
//             : "Send an email",
//         description:
//           selectedModule === "customMailhook"
//             ? "Custom mailhook"
//             : "Send an email",
//       });
//     }
//     setSelectedModule(null);
//     setOpen(false);
//     setSelectedApp(null);
//   };

//   return (
//     <div className="flex">
//       <div className="w-64 min-h-screen"></div>
//       <Sidebar />
//       <div className="flex-1 min-h-screen bg-gray-50 font-sans text-gray-800 flex flex-col">
//         {/* Top Button */}
//         <div className="p-6">
//         <Link to="/connection">
//     <button className="flex items-center px-4 py-2 text-sm text-gray-700 bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-100">
//       <ArrowLeft className="mr-2 w-4 h-4" />
//       New scenario
//       <Settings className="ml-2 w-4 h-4" />
//     </button>
//   </Link>
//         </div>

//         <div className="flex-1 flex items-center justify-center relative">
//           {!savedModule ? (
//             <button
//               onClick={() => {
//                 setOpen(!open);
//                 setSelectedApp(null);
//                 setSelectedModule(null);
//               }}
//               className="w-48 h-48 flex items-center justify-center hover:border-purple-700 rounded-full bg-purple-600 text-white text-5xl shadow-lg border-4 border-purple-300"
//             >
//               <Plus className="w-16 h-16" />
//             </button>
//           ) : (
//             <div className="flex items-center justify-center w-full">
//               <div className="relative">
//                 <div className="w-48 h-48 hover:border-red-600 cursor-pointer flex flex-col items-center justify-center rounded-full bg-red-500 text-white shadow-lg border-4 border-red-300 relative">
//                   <Cloud className="w-16 h-16 mb-1" />
//                   <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold border-2 border-white">
//                     1
//                   </div>
//                 </div>

//                 <div className="absolute -bottom-3 -left-3 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-red-200">
//                   <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
//                     <span className="text-white font-bold">⚡</span>
//                   </div>
//                 </div>

//                 <div className="mt-4 text-center">
//                   <h3 className="font-semibold text-gray-800">Webhooks</h3>
//                   <p className="text-sm text-gray-600">
//                     {savedModule.description}
//                   </p>
//                   <div className="inline-block mt-1 px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded">
//                     1
//                   </div>
//                 </div>
//               </div>

//               {/* Connection with dots */}
//               <div className="flex items-center mx-8">
//                 <div className="w-4 h-4 rounded-full bg-pink-400"></div>
//                 <div className="w-4 h-4 rounded-full bg-pink-300 ml-2"></div>
//                 <div className="w-4 h-4 rounded-full bg-pink-200 ml-2"></div>
//                 <div className="w-4 h-4 rounded-full bg-pink-100 ml-2"></div>

//                 <div className="ml-4">
//                 </div>
//               </div>

//               {!savedSecondModule ? (
//                 <button
//                   onClick={() => {
//                     setOpen(!open);
//                     setSelectedApp(null);
//                     setSelectedModule(null);
//                   }}
//                   className="w-44 h-44  flex items-center justify-center rounded-full bg-gray-300 text-gray-600 text-4xl shadow-lg border-4 border-gray-200 hover:bg-gray-400 hover:text-white transition-colors"
//                 >
//                   <Plus className="w-16 h-16" />
//                 </button>
//               ) : (
//                 <div className="relative">
//                   <div
//                     className={`w-32 h-32 flex flex-col items-center justify-center rounded-full ${savedSecondModule.app.color} text-white shadow-lg border-4 border-opacity-50`}
//                   >
//                     <span className="text-2xl">
//                       {savedSecondModule.app.icon}
//                     </span>
//                     <div className="absolute -top-2 -right-2 w-8 h-8 bg-opacity-80 bg-black text-white rounded-full flex items-center justify-center text-sm font-bold border-2 border-white">
//                       2
//                     </div>
//                   </div>

//                   <div className="mt-4 text-center">
//                     <h3 className="font-semibold text-gray-800">
//                       {savedSecondModule.app.name}
//                     </h3>
//                     <p className="text-sm text-gray-600">
//                       {savedSecondModule.description}
//                     </p>
//                     <div className="inline-block mt-1 px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded">
//                       2
//                     </div>
//                   </div>

//                   {/* Third Plus button */}
//                   <div className="absolute top-1/2 -translate-y-1/2 right-[-60px]">
//                     <button
//                       onClick={() => {
//                         setOpen(!open);
//                         setSelectedApp(null);
//                         setSelectedModule(null);
//                       }}
//                       className="w-16 h-16 flex items-center justify-center rounded-full bg-pink-300 text-white text-2xl shadow-lg border-2 border-pink-200 hover:bg-pink-400 transition-colors"
//                     >
//                       <Plus className="w-6 h-6" />
//                     </button>
//                   </div>
//                 </div>
//               )}
//             </div>
//           )}

//           {/* Sidebar Box */}
//           {open && (
//             <div className="absolute left-1/2 translate-x-36 bg-white rounded-lg shadow-lg w-96 z-10">
//               {!selectedApp ? (
//                 <>
//                   <div className="p-4 border-b">
//                     <h2 className="text-xs font-semibold text-gray-500">
//                       ALL APPS
//                     </h2>
//                   </div>
//                   <ul className="max-h-80 overflow-y-auto">
//                     {apps.map((app, idx) => (
//                       <li
//                         key={idx}
//                         onClick={() => setSelectedApp(app)}
//                         className="flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer"
//                       >
//                         <div
//                           className={`w-8 h-8 flex items-center justify-center rounded-full text-white ${app.color}`}
//                         >
//                           {typeof app.icon === "string" ? app.icon : app.icon}
//                         </div>
//                         <span className="ml-3 text-sm text-gray-700">
//                           {app.name}
//                         </span>
//                       </li>
//                     ))}
//                   </ul>
//                   <div className="p-3 border-t">
//                     <div className="flex items-center px-2 py-2 border rounded-md text-gray-500 text-sm">
//                       <Search className="mr-2 w-4 h-4" />
//                       <input
//                         type="text"
//                         placeholder="Search apps or modules"
//                         className="flex-1 outline-none text-gray-600 text-sm"
//                       />
//                     </div>
//                   </div>
//                 </>
//               ) : (
//                 <>
//                   {/* App Detail */}
//                   <div
//                     className="flex items-center px-4 py-3 text-sm text-purple-600 cursor-pointer hover:underline"
//                     onClick={() => setSelectedApp(null)}
//                   >
//                     <ArrowLeft className="mr-2 w-4 h-4" /> BACK
//                   </div>

//                   <div className="flex flex-col items-center text-center p-6 bg-red-50">
//                     <div className="w-12 h-12 flex items-center justify-center rounded-full text-white bg-red-500 mb-3">
//                       {selectedApp.icon}
//                     </div>
//                     <h2 className="text-lg font-semibold">
//                       {selectedApp.name}
//                     </h2>
//                     <span className="text-xs text-purple-600 mt-1 px-2 py-0.5 rounded bg-purple-100">
//                       Built-in
//                     </span>
//                   </div>

//                   {/* Triggers/Actions */}
//                   <div className="p-4 border-b">
//                     <h3 className="text-xs font-semibold text-gray-500 mb-2">
//                       {selectedApp.name === "Webhooks" ? "TRIGGERS" : "ACTIONS"}
//                     </h3>
//                     <div
//                       className="flex items-start cursor-pointer hover:bg-gray-50 p-2 rounded"
//                       onClick={() =>
//                         setSelectedModule(
//                           selectedApp.name === "Webhooks"
//                             ? "customMailhook"
//                             : "sendEmail"
//                         )
//                       }
//                     >
//                       <div
//                         className={`w-8 h-8 flex items-center justify-center rounded-full text-white mr-3 ${selectedApp.color}`}
//                       >
//                         {selectedApp.icon}
//                       </div>
//                       <div>
//                         <p className="text-sm font-semibold text-gray-700">
//                           {selectedApp.name === "Webhooks"
//                             ? "Custom mailhook"
//                             : "Send an email"}
//                           {selectedApp.name === "Webhooks" && (
//                             <span className="ml-2 text-xs bg-purple-200 text-purple-700 px-2 py-0.5 rounded">
//                               INSTANT
//                             </span>
//                           )}
//                         </p>
//                         <p className="text-xs text-gray-500">
//                           {selectedApp.name === "Webhooks"
//                             ? "Triggers when mailhook receives data."
//                             : "Send an email via Gmail."}
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 </>
//               )}
//             </div>
//           )}

//           {/* Modal for Custom Mailhook or Gmail */}
//           {(selectedModule === "customMailhook" ||
//             selectedModule === "sendEmail") && (
//             <div className="absolute top-10 right-10 bg-white rounded-lg shadow-xl w-[500px] border z-20">
//               <div className="flex justify-between items-center px-4 py-2 bg-gradient-to-r from-pink-600 to-pink-400 text-white rounded-t-lg">
//                 <h3 className="font-semibold">
//                   {selectedApp?.name || "Module"}
//                 </h3>
//                 <div className="space-x-2 text-sm">
//                   <button>⋮</button>
//                   <button>?</button>
//                   <button onClick={() => setSelectedModule(null)}>✕</button>
//                 </div>
//               </div>

//               <div className="p-4">
//                 {selectedModule === "customMailhook" ? (
//                   <>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Mailhook <span className="text-red-500">*</span>
//                     </label>
//                     <div className="flex items-center space-x-2">
//                       <select className="flex-1 border rounded px-2 py-1 text-sm">
//                         <option value="my-gateway-webhook">
//                           My gateway-mailhook webhook
//                         </option>
//                       </select>
//                     </div>
//                     <p className="text-xs text-gray-500 mt-2">
//                       For more information on how to create a webhook in
//                       Webhooks, see the{" "}
//                       <a href="#" className="text-blue-600 underline">
//                         online Help
//                       </a>
//                       .
//                     </p>
//                   </>
//                 ) : (
//                   <>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Connection <span className="text-red-500">*</span>
//                     </label>
//                     <div className="flex items-center space-x-2">
//                       <select className="flex-1 border rounded px-2 py-1 text-sm">
//                         <option value="gmail-connection">
//                           My Gmail Connection
//                         </option>
//                       </select>
//                     </div>
//                     <div className="mt-4">
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         To <span className="text-red-500">*</span>
//                       </label>
//                       <input
//                         type="email"
//                         className="w-full border rounded px-2 py-1 text-sm"
//                         placeholder="recipient@example.com"
//                       />
//                     </div>
//                     <div className="mt-4">
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Subject <span className="text-red-500">*</span>
//                       </label>
//                       <input
//                         type="text"
//                         className="w-full border rounded px-2 py-1 text-sm"
//                         placeholder="Email subject"
//                       />
//                     </div>
//                   </>
//                 )}

//                 <div className="mt-4">
//                   <label className="flex items-center text-sm text-gray-600">
//                     <input type="checkbox" className="mr-2" /> Advanced settings
//                   </label>
//                 </div>
//               </div>

//               <div className="flex justify-end space-x-2 px-4 py-2 border-t">
//                 <button
//                   className="px-4 py-2 text-sm border rounded"
//                   onClick={() => setSelectedModule(null)}
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   className="px-4 py-2 text-sm bg-purple-600 text-white rounded"
//                   onClick={handleSave}
//                 >
//                   Save
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default BuildScenario;
import React, { useState } from "react";
import {
  Plus,
  Search,
  ArrowLeft,
  Settings,
  Database,
  FileText,
  Mail,
  Code,
  Cloud,
  GitBranch,
  Shield,
  Network,
} from "lucide-react";

const BuildScenario = () => {
  const [open, setOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);
  const [savedModule, setSavedModule] = useState(null);
  const [savedSecondModule, setSavedSecondModule] = useState(null);
  const [savedThirdModule, setSavedThirdModule] = useState(null);
  const [showRouterBranches, setShowRouterBranches] = useState(false);

  const apps = [
    { name: "Flow Control", color: "bg-green-400", icon: <Settings /> },
    { name: "Router", color: "bg-green-400", icon: <GitBranch /> },
    { name: "OpenRouter", color: "bg-gray-500", icon: <Network /> },
    { name: "peoplefone", color: "bg-red-500", icon: <Mail /> },
    { name: "Clearout", color: "bg-orange-400", icon: <Mail /> },
    { name: "Data store", color: "bg-blue-500", icon: <Database /> },
    { name: "Webhooks", color: "bg-red-500", icon: <Cloud /> },
    { name: "Gmail", color: "bg-red-500", icon: <Mail /> },
    { name: "HTTP", color: "bg-blue-500", icon: <Cloud /> },
    { name: "Airtable", color: "bg-sky-500", icon: <Database /> },
    { name: "Google Drive", color: "bg-yellow-500", icon: <FileText /> },
    { name: "JSON", color: "bg-purple-400", icon: <Code /> },
    { name: "Text parser", color: "bg-orange-400", icon: <Search /> },
    { name: "Notion", color: "bg-black", icon: <GitBranch /> },
    { name: "Google Sheets", color: "bg-green-500", icon: <Database /> },
    { name: "Tools", color: "bg-purple-400", icon: <Shield /> },
    {
      name: "OpenAI (ChatGPT, Whisper, DALL·E)",
      color: "bg-green-600",
      icon: <Mail />,
    },
  ];

  const handleSave = () => {
    if (!savedModule) {
      setSavedModule({
        app: selectedApp,
        type: "Custom mailhook",
        description: "Custom mailhook",
      });
    } else if (!savedSecondModule) {
      setSavedSecondModule({
        app: selectedApp,
        type:
          selectedModule === "customMailhook"
            ? "Custom mailhook"
            : "Send an email",
        description:
          selectedModule === "customMailhook"
            ? "Custom mailhook"
            : "Send an email",
      });
    } else if (!savedThirdModule && selectedApp?.name === "Router") {
      setSavedThirdModule({
        app: selectedApp,
        type: "Router",
        description: "Router",
      });
      setShowRouterBranches(true);
    }
    setSelectedModule(null);
    setOpen(false);
    setSelectedApp(null);
  };

  return (
    <div className="flex">
      <div className="w-64 bg-gray-800 min-h-screen"></div>

      <div className="flex-1 min-h-screen bg-gray-50 font-sans text-gray-800 flex flex-col">
        <div className="p-6">
          <button className="flex items-center px-4 py-2 text-sm text-gray-700 bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-100">
            <ArrowLeft className="mr-2 w-4 h-4" />
            New scenario
            <Settings className="ml-2 w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center relative">
          {!savedModule ? (
            <button
              onClick={() => {
                setOpen(!open);
                setSelectedApp(null);
                setSelectedModule(null);
              }}
              className="w-48 h-48 flex items-center justify-center hover:border-purple-700 rounded-full bg-purple-600 text-white text-5xl shadow-lg border-4 border-purple-300"
            >
              <Plus className="w-16 h-16" />
            </button>
          ) : (
            <div className="flex items-center justify-center w-full">
              <div className="relative">
                <div className="w-48 h-48 hover:border-red-600 cursor-pointer flex flex-col items-center justify-center rounded-full bg-red-500 text-white shadow-lg border-4 border-red-300 relative">
                  <Cloud className="w-16 h-16 mb-1" />
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold border-2 border-white">
                    1
                  </div>
                </div>

                <div className="absolute -bottom-3 -left-3 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-red-200">
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">⚡</span>
                  </div>
                </div>

                <div className="mt-4 text-center">
                  <h3 className="font-semibold text-gray-800">Webhooks</h3>
                  <p className="text-sm text-gray-600">
                    {savedModule.description}
                  </p>
                  <div className="inline-block mt-1 px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded">
                    1
                  </div>
                </div>
              </div>

              <div className="flex items-center mx-8">
                <div className="w-4 h-4 rounded-full bg-pink-400"></div>
                <div className="w-4 h-4 rounded-full bg-pink-300 ml-2"></div>
                <div className="w-4 h-4 rounded-full bg-pink-200 ml-2"></div>
                <div className="w-4 h-4 rounded-full bg-pink-100 ml-2"></div>
                <div className="ml-4"></div>
              </div>

              {!savedSecondModule ? (
                <button
                  onClick={() => {
                    setOpen(!open);
                    setSelectedApp(null);
                    setSelectedModule(null);
                  }}
                  className="w-44 h-44 flex items-center justify-center rounded-full bg-gray-300 text-gray-600 text-4xl shadow-lg border-4 border-gray-200 hover:bg-gray-400 hover:text-white transition-colors"
                >
                  <Plus className="w-16 h-16" />
                </button>
              ) : (
                <>
                  <div className="relative">
                    <div
                      className={`w-44 h-44 flex flex-col items-center justify-center rounded-full ${savedSecondModule.app.color} text-white shadow-lg border-4 border-opacity-50`}
                    >
                      {savedSecondModule.app.icon}
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-opacity-80 bg-black text-white rounded-full flex items-center justify-center text-sm font-bold border-2 border-white">
                        2
                      </div>
                    </div>

                    <div className="mt-4 text-center">
                      <h3 className="font-semibold text-gray-800">
                        {savedSecondModule.app.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {savedSecondModule.description}
                      </p>
                      <div className="inline-block mt-1 px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded">
                        2
                      </div>
                    </div>
                  </div>

                  {showRouterBranches && savedThirdModule ? (
                    <div className="ml-8 relative">
                      <div className="flex items-center mb-8">
                        <div className="w-2 h-2 rounded-full bg-green-400 mr-1"></div>
                        <div className="w-2 h-2 rounded-full bg-green-300 mr-1"></div>
                        <div className="w-2 h-2 rounded-full bg-green-200 mr-1"></div>
                        <div className="text-sm text-gray-400 ml-2">🔧</div>
                      </div>

                      <div className="flex flex-col items-center mb-8">
                        <div className="w-32 h-32 flex flex-col items-center justify-center rounded-full bg-green-400 text-white shadow-lg border-4 border-green-200 relative">
                          <GitBranch className="w-8 h-8" />
                          <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold border-2 border-white">
                            1
                          </div>
                        </div>
                        
                        <div className="mt-2 text-center">
                          <h4 className="font-semibold text-gray-800 text-sm">Router</h4>
                          <div className="inline-block mt-1 px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded">
                            1
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col space-y-4">
                        <div className="flex items-center">
                          <div className="w-4 h-1 bg-gray-300 mr-2"></div>
                          <button
                            onClick={() => {
                              setOpen(!open);
                              setSelectedApp(null);
                              setSelectedModule(null);
                            }}
                            className="w-20 h-20 flex items-center justify-center rounded-full bg-gray-300 text-gray-600 shadow-lg border-2 border-gray-200 hover:bg-gray-400 hover:text-white transition-colors"
                          >
                            <Plus className="w-6 h-6" />
                          </button>
                        </div>
                        
                        <div className="flex items-center">
                          <div className="w-4 h-1 bg-gray-300 mr-2"></div>
                          <button
                            onClick={() => {
                              setOpen(!open);
                              setSelectedApp(null);
                              setSelectedModule(null);
                            }}
                            className="w-20 h-20 flex items-center justify-center rounded-full bg-gray-300 text-gray-600 shadow-lg border-2 border-gray-200 hover:bg-gray-400 hover:text-white transition-colors"
                          >
                            <Plus className="w-6 h-6" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : !savedThirdModule ? (
                    <div className="ml-8">
                      <div className="flex items-center mb-4">
                        <div className="w-2 h-2 rounded-full bg-green-400 mr-1"></div>
                        <div className="w-2 h-2 rounded-full bg-green-300 mr-1"></div>
                        <div className="w-2 h-2 rounded-full bg-green-200 mr-1"></div>
                        <div className="text-sm text-gray-400 ml-2">🔧</div>
                      </div>
                      <button
                        onClick={() => {
                          setOpen(!open);
                          setSelectedApp(null);
                          setSelectedModule(null);
                        }}
                        className="w-32 h-32 flex items-center justify-center rounded-full bg-gray-300 text-gray-600 text-2xl shadow-lg border-4 border-gray-200 hover:bg-gray-400 hover:text-white transition-colors"
                      >
                        <Plus className="w-8 h-8" />
                      </button>
                    </div>
                  ) : null}
                </>
              )}
            </div>
          )}

          {open && (
            <div className="absolute left-1/2 translate-x-36 bg-white rounded-lg shadow-lg w-96 z-10">
              {!selectedApp ? (
                <>
                  <div className="p-4 border-b">
                    <h2 className="text-xs font-semibold text-gray-500">
                      ALL APPS
                    </h2>
                  </div>
                  <ul className="max-h-80 overflow-y-auto">
                    {apps.map((app, idx) => (
                      <li
                        key={idx}
                        onClick={() => setSelectedApp(app)}
                        className="flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer"
                      >
                        <div
                          className={`w-8 h-8 flex items-center justify-center rounded-full text-white ${app.color}`}
                        >
                          {app.icon}
                        </div>
                        <span className="ml-3 text-sm text-gray-700">
                          {app.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className="p-3 border-t">
                    <div className="flex items-center px-2 py-2 border rounded-md text-gray-500 text-sm">
                      <Search className="mr-2 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search apps or modules"
                        className="flex-1 outline-none text-gray-600 text-sm"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div
                    className="flex items-center px-4 py-3 text-sm text-purple-600 cursor-pointer hover:underline"
                    onClick={() => setSelectedApp(null)}
                  >
                    <ArrowLeft className="mr-2 w-4 h-4" /> BACK
                  </div>

                  <div className="flex flex-col items-center text-center p-6 bg-red-50">
                    <div className={`w-12 h-12 flex items-center justify-center rounded-full text-white mb-3 ${selectedApp.color}`}>
                      {selectedApp.icon}
                    </div>
                    <h2 className="text-lg font-semibold">
                      {selectedApp.name}
                    </h2>
                    <span className="text-xs text-purple-600 mt-1 px-2 py-0.5 rounded bg-purple-100">
                      Built-in
                    </span>
                  </div>

                  <div className="p-4 border-b">
                    <h3 className="text-xs font-semibold text-gray-500 mb-2">
                      {selectedApp.name === "Webhooks" ? "TRIGGERS" : 
                       selectedApp.name === "Router" ? "ACTIONS" : "ACTIONS"}
                    </h3>
                    
                    {selectedApp.name === "Router" ? (
                      <div
                        className="flex items-start cursor-pointer hover:bg-gray-50 p-2 rounded"
                        onClick={() => setSelectedModule("routerAction")}
                      >
                        <div className="w-8 h-8 flex items-center justify-center rounded-full text-white mr-3 bg-green-400">
                          <GitBranch className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-700">
                            Route to different paths
                          </p>
                          <p className="text-xs text-gray-500">
                            Routes the execution to different branches based on conditions.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div
                        className="flex items-start cursor-pointer hover:bg-gray-50 p-2 rounded"
                        onClick={() =>
                          setSelectedModule(
                            selectedApp.name === "Webhooks"
                              ? "customMailhook"
                              : "sendEmail"
                          )
                        }
                      >
                        <div
                          className={`w-8 h-8 flex items-center justify-center rounded-full text-white mr-3 ${selectedApp.color}`}
                        >
                          {selectedApp.icon}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-700">
                            {selectedApp.name === "Webhooks"
                              ? "Custom mailhook"
                              : "Send an email"}
                            {selectedApp.name === "Webhooks" && (
                              <span className="ml-2 text-xs bg-purple-200 text-purple-700 px-2 py-0.5 rounded">
                                INSTANT
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-gray-500">
                            {selectedApp.name === "Webhooks"
                              ? "Triggers when mailhook receives data."
                              : "Send an email via Gmail."}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {(selectedModule === "customMailhook" ||
            selectedModule === "sendEmail" ||
            selectedModule === "routerAction") && (
            <div className="absolute top-10 right-10 bg-white rounded-lg shadow-xl w-[500px] border z-20">
              <div className="flex justify-between items-center px-4 py-2 bg-gradient-to-r from-pink-600 to-pink-400 text-white rounded-t-lg">
                <h3 className="font-semibold">
                  {selectedApp?.name || "Module"}
                </h3>
                <div className="space-x-2 text-sm">
                  <button>⋮</button>
                  <button>?</button>
                  <button onClick={() => setSelectedModule(null)}>✕</button>
                </div>
              </div>

              <div className="p-4">
                {selectedModule === "customMailhook" ? (
                  <>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mailhook <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center space-x-2">
                      <select className="flex-1 border rounded px-2 py-1 text-sm">
                        <option value="my-gateway-webhook">
                          My gateway-mailhook webhook
                        </option>
                      </select>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      For more information on how to create a webhook in
                      Webhooks, see the{" "}
                      <a href="#" className="text-blue-600 underline">
                        online Help
                      </a>
                      .
                    </p>
                  </>
                ) : selectedModule === "routerAction" ? (
                  <>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Router Configuration
                    </label>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Number of routes
                        </label>
                        <select className="w-full border rounded px-2 py-1 text-sm">
                          <option value="2">2 routes</option>
                          <option value="3">3 routes</option>
                          <option value="4">4 routes</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Routing condition
                        </label>
                        <input 
                          type="text" 
                          className="w-full border rounded px-2 py-1 text-sm"
                          placeholder="Enter routing condition..."
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Connection <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center space-x-2">
                      <select className="flex-1 border rounded px-2 py-1 text-sm">
                        <option value="gmail-connection">
                          My Gmail Connection
                        </option>
                      </select>
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        To <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        className="w-full border rounded px-2 py-1 text-sm"
                        placeholder="recipient@example.com"
                      />
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Subject <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        className="w-full border rounded px-2 py-1 text-sm"
                        placeholder="Email subject"
                      />
                    </div>
                  </>
                )}

                <div className="mt-4">
                  <label className="flex items-center text-sm text-gray-600">
                    <input type="checkbox" className="mr-2" /> Advanced settings
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-2 px-4 py-2 border-t">
                <button
                  className="px-4 py-2 text-sm border rounded"
                  onClick={() => setSelectedModule(null)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 text-sm bg-purple-600 text-white rounded"
                  onClick={handleSave}
                >
                  Save
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BuildScenario;
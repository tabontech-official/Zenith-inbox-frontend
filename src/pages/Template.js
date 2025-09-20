// import React, { useState, useEffect } from 'react';
// import Sidebar from '../component/Sidebar';
// import axios from 'axios';

// const TemplateList = ({ templates, onToggleStatus }) => (
//   <div className="space-y-4">
//     {templates.length > 0 ? (
//       templates.map((template, index) => (
//         <div
//           key={index}
//           className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow"
//         >
//           <div className="text-lg font-medium text-gray-800">{template}</div>
//         </div>
//       ))
//     ) : (
//       <div className="text-center py-12 text-gray-500 text-lg">
//         No templates found.
//       </div>
//     )}
//   </div>
// );

// const Template = () => {
//   const [selectedPlatform, setSelectedPlatform] = useState('');
//   const [shopifyTemplates, setShopifyTemplates] = useState([]);
//   const [otherTemplateState, setOtherTemplateState] = useState([]);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [selectedTemplate, setSelectedTemplate] = useState('');

//   useEffect(() => {
//     if (selectedPlatform) {
//       axios
//         .get(`http://localhost:5000/template/fetchTemplate/${selectedPlatform}`)
//         .then((response) => {
//           const templates = response.data[0]?.templates || [];
//           if (selectedPlatform === 'shopify') {
//             setShopifyTemplates(templates);
//           } else if (selectedPlatform === 'other') {
//             setOtherTemplateState(templates);
//           }
//         })
//         .catch((error) => {
//           console.error("Error fetching templates:", error);
//         });
//     }
//   }, [selectedPlatform]);

//   const toggleTemplateStatus = (templateId) => {
//     const updatedTemplates = (selectedPlatform === 'shopify' ? shopifyTemplates : otherTemplateState).map(template =>
//       template._id === templateId ? { ...template, active: !template.active } : template
//     );

//     if (selectedPlatform === 'shopify') {
//       setShopifyTemplates(updatedTemplates);
//     } else if (selectedPlatform === 'other') {
//       setOtherTemplateState(updatedTemplates);
//     }
//   };
// const handleSaveTemplate={

// }
//   return (
//     <div className="flex">
//       <Sidebar />

//       <div className="flex-1 min-h-screen bg-gray-100 font-sans text-gray-800 lg:ml-64">
//         <header className="flex items-center justify-between p-6 bg-white border-b border-gray-200">
//           <h1 className="text-3xl font-bold text-gray-800">Templates</h1>
//         </header>

//         <main className="container mx-auto p-8">
//           <div className="flex gap-4 mb-8">
//             <button
//               onClick={() => setSelectedPlatform('shopify')}
//               className={`px-6 py-3 text-sm font-semibold rounded-md transition-colors ${
//                 selectedPlatform === 'shopify' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-800'
//               }`}
//             >
//               Shopify
//             </button>
//             <button
//               onClick={() => setSelectedPlatform('other')}
//               className={`px-6 py-3 text-sm font-semibold rounded-md transition-colors ${
//                 selectedPlatform === 'other' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-800'
//               }`}
//             >
//               Other
//             </button>
//           </div>

//           {selectedPlatform && (
//             <div className="bg-white p-6 rounded-xl shadow-lg">
//               <div className="flex justify-between items-center mb-6">
//                 <h2 className="text-2xl font-semibold text-gray-800">
//                   {selectedPlatform === 'shopify' ? 'Shopify Templates' : 'Custom Templates'}
//                 </h2>
//               </div>

//               <TemplateList
//                 templates={selectedPlatform === 'shopify' ? shopifyTemplates : otherTemplateState}
//                 onToggleStatus={toggleTemplateStatus}
//               />
//             </div>
//           )}

//           {isModalOpen && (
//             <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
//               <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
//                 <div className="flex justify-between items-center mb-4">
//                   <h2 className="text-xl font-bold text-gray-800">Add Custom Template</h2>
//                   <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
//                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
//                   </button>
//                 </div>

//                 <div className="mb-6">
//                   <label htmlFor="template-select" className="block text-sm font-medium text-gray-700 mb-2">Select a template:</label>
//                   <select
//                     id="template-select"
//                     onChange={(e) => setSelectedTemplate(e.target.value)}
//                     value={selectedTemplate}
//                     className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
//                   >
//                     <option value="">-- Select Template --</option>
//                     {otherTemplateState.map((template) => (
//                       <option key={template._id} value={template.name}>
//                         {template.name}
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 <div className="flex justify-end gap-2">
//                   <button
//                     onClick={() => setIsModalOpen(false)}
//                     className="px-6 py-2 text-sm font-semibold text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     onClick={handleSaveTemplate}
//                     className="px-6 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors"
//                   >
//                     Save
//                   </button>
//                 </div>
//               </div>
//             </div>
//           )}
//         </main>
//       </div>
//     </div>
//   );
// };

// export default Template;
import React, { useState, useEffect } from "react";
import Sidebar from "../component/Sidebar";
import axios from "axios";

const TemplateList = ({ templates, onToggleStatus }) => (
  <div className="space-y-4">
    {templates.length > 0 ? (
      templates.map((template, index) => (
        <div
          key={index}
          className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="text-lg font-medium text-gray-800">{template}</div>
        </div>
      ))
    ) : (
      <div className="text-center py-12 text-gray-500 text-lg">
        No templates found.
      </div>
    )}
  </div>
);

const Template = () => {
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [shopifyTemplates, setShopifyTemplates] = useState([]);
  const [otherTemplateState, setOtherTemplateState] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("");

  const userId = localStorage.getItem("userId"); // Assume the userId is stored in localStorage

  useEffect(() => {
    if (selectedPlatform) {
      axios
        .get(`http://localhost:5000/template/fetchTemplate/${selectedPlatform}`)
        .then((response) => {
          const templates = response.data[0]?.templates || [];
          if (selectedPlatform === "shopify") {
            setShopifyTemplates(templates);
          } else if (selectedPlatform === "other") {
            setOtherTemplateState(templates);
          }
        })
        .catch((error) => {
          console.error("Error fetching templates:", error);
        });
    }
  }, [selectedPlatform]);

  const toggleTemplateStatus = (templateId) => {
    const updatedTemplates = (
      selectedPlatform === "shopify" ? shopifyTemplates : otherTemplateState
    ).map((template) =>
      template._id === templateId
        ? { ...template, active: !template.active }
        : template
    );

    if (selectedPlatform === "shopify") {
      setShopifyTemplates(updatedTemplates);
    } else if (selectedPlatform === "other") {
      setOtherTemplateState(updatedTemplates);
    }
  };

  const handlePlatformSelection = async (platform) => {
    setSelectedPlatform(platform);
    const userId = localStorage.getItem("userid");
    try {
      // Save the selected platform for the user in the backend
      const response = await axios.post(
        "http://localhost:5000/auth/addPlatform",
        {
          userId,
          platform,
        }
      );

      console.log("Platform saved successfully:", response.data);
    } catch (error) {
      console.error("Error saving platform:", error);
    }
  };

  return (
    <div className="flex">
      <Sidebar />

      <div className="flex-1 min-h-screen bg-gray-100 font-sans text-gray-800 lg:ml-64">
        {/* Header Section */}
        <header className="flex items-center justify-between p-6 bg-white border-b border-gray-200">
          <h1 className="text-3xl font-bold text-gray-800">Templates</h1>
        </header>

        <main className="container mx-auto p-8">
          {/* Platform Selection - Buttons */}
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => handlePlatformSelection("shopify")}
              className={`px-6 py-3 text-sm font-semibold rounded-md transition-colors ${
                selectedPlatform === "shopify"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              Shopify
            </button>
            <button
              onClick={() => handlePlatformSelection("other")}
              className={`px-6 py-3 text-sm font-semibold rounded-md transition-colors ${
                selectedPlatform === "other"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              Other
            </button>
          </div>

          {/* Template Display Section */}
          {selectedPlatform && (
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">
                  {selectedPlatform === "shopify"
                    ? "Shopify Templates"
                    : "Custom Templates"}
                </h2>
              </div>

              <TemplateList
                templates={
                  selectedPlatform === "shopify"
                    ? shopifyTemplates
                    : otherTemplateState
                }
                onToggleStatus={toggleTemplateStatus}
              />
            </div>
          )}

          {/* Modal for adding a new template */}
          {isModalOpen && (
            <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
              <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-800">
                    Add Custom Template
                  </h2>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      ></path>
                    </svg>
                  </button>
                </div>

                <div className="mb-6">
                  <label
                    htmlFor="template-select"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Select a template:
                  </label>
                  <select
                    id="template-select"
                    onChange={(e) => setSelectedTemplate(e.target.value)}
                    value={selectedTemplate}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">-- Select Template --</option>
                    {otherTemplateState.map((template) => (
                      <option key={template._id} value={template.name}>
                        {template.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-2 text-sm font-semibold text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    // onClick={handleSaveTemplate}
                    className="px-6 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Template;

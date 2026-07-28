// import React, { useState, useEffect } from "react";
// import Sidebar from "../component/Sidebar";
// import toast from "react-hot-toast";
// import {
//   FiPlus,
//   FiTrash2,
//   FiSave,
//   FiArrowUp,
//   FiArrowDown,
//   FiLayout,
//   FiVideo,
//   FiType,
//   FiLink,
//   FiGrid,
//   FiFeather,
// } from "react-icons/fi";

// const AdminLandingPage = () => {
//   const [content, setContent] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [activeTab, setActiveTab] = useState("hero");

//   useEffect(() => {
//     const fetchContent = async () => {
//       try {
//         const res = await fetch(
//           "https://email-syncing-backend.vercel.app/api/landing-page",
//         );
//         if (res.ok) {
//           const data = await res.json();
//           setContent(data);
//         } else {
//           toast.error("Failed to fetch landing page content");
//         }
//       } catch (err) {
//         toast.error("Error connecting to server");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchContent();
//   }, []);

//   const handleSave = async () => {
//     setSaving(true);
//     try {
//       const token = localStorage.getItem("usertoken");
//       const res = await fetch(
//         "https://email-syncing-backend.vercel.app/api/landing-page",
//         {
//           method: "PUT",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//           body: JSON.stringify(content),
//         },
//       );
//       if (res.ok) {
//         toast.success("Landing page updated successfully");
//       } else {
//         toast.error("Failed to update landing page");
//       }
//     } catch (err) {
//       toast.error("Error saving changes");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleChange = (
//     section,
//     field,
//     value,
//     index = null,
//     subField = null,
//   ) => {
//     setContent((prev) => {
//       const newContent = { ...prev };
//       if (index !== null && subField !== null) {
//         newContent[section][field][index][subField] = value;
//       } else if (index !== null) {
//         // array but no subfield handling if needed
//       } else if (field) {
//         newContent[section][field] = value;
//       } else {
//         newContent[section] = value;
//       }
//       return newContent;
//     });
//   };

//   const addFeatureCard = () => {
//     setContent((prev) => ({
//       ...prev,
//       features: {
//         ...prev.features,
//         cards: [
//           ...prev.features.cards,
//           {
//             iconName: "FiZap",
//             title: "New Feature",
//             description: "Feature description",
//           },
//         ],
//       },
//     }));
//   };

//   const removeFeatureCard = (index) => {
//     setContent((prev) => {
//       const newCards = [...prev.features.cards];
//       newCards.splice(index, 1);
//       return { ...prev, features: { ...prev.features, cards: newCards } };
//     });
//   };

//   const moveFeatureCard = (index, direction) => {
//     setContent((prev) => {
//       const newCards = [...prev.features.cards];
//       if (direction === -1 && index > 0) {
//         [newCards[index - 1], newCards[index]] = [
//           newCards[index],
//           newCards[index - 1],
//         ];
//       } else if (direction === 1 && index < newCards.length - 1) {
//         [newCards[index + 1], newCards[index]] = [
//           newCards[index],
//           newCards[index + 1],
//         ];
//       }
//       return { ...prev, features: { ...prev.features, cards: newCards } };
//     });
//   };

//   if (loading)
//     return (
//       <div className="min-h-screen bg-gray-50  flex items-center justify-center">
//         <div className="flex flex-col items-center gap-4">
//           <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
//           <div className="text-sm font-medium text-gray-500 tracking-wide">
//             Loading Content...
//           </div>
//         </div>
//       </div>
//     );

//   const tabs = [
//     // { id: "general", label: "General", icon: <FiType /> },
//     { id: "hero", label: "Hero Section", icon: <FiLayout /> },
//     // { id: 'features', label: 'Features', icon: <FiGrid /> },
//     // { id: 'cta', label: 'Call to Action', icon: <FiFeather /> },
//     // { id: 'footer', label: 'Footer', icon: <FiLink /> }
//   ];

//   return (
//     <div className="min-h-screen bg-slate-50  flex">
//       <Sidebar />
//       <div className="flex-1 max-w-7xl mx-auto w-full">
//         <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-200 px-8 py-5 flex justify-between items-center shadow-sm">
//           <div>
//             <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
//               Landing Page Content
//             </h1>
//             <p className="text-slate-500 text-sm mt-1">
//               Manage public site content and media dynamically.
//             </p>
//           </div>
//           <button
//             onClick={handleSave}
//             disabled={saving}
//             className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition shadow-md shadow-indigo-200 disabled:opacity-50 disabled:shadow-none"
//           >
//             <FiSave className={saving ? "animate-pulse" : ""} />{" "}
//             {saving ? "Saving..." : "Save Changes"}
//           </button>
//         </div>

//         {content && (
//           <div className="p-8 flex flex-col lg:flex-row gap-8 items-start">
//             <div className="w-full lg:w-64 flex-shrink-0 sticky top-32 space-y-2">
//               {tabs.map((tab) => (
//                 <button
//                   key={tab.id}
//                   onClick={() => setActiveTab(tab.id)}
//                   className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
//                     activeTab === tab.id
//                       ? "bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100/50"
//                       : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent"
//                   }`}
//                 >
//                   <span
//                     className={
//                       activeTab === tab.id
//                         ? "text-indigo-600"
//                         : "text-slate-400"
//                     }
//                   >
//                     {tab.icon}
//                   </span>
//                   {tab.label}
//                 </button>
//               ))}
//             </div>

//             <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 p-8 min-h-[600px]">
            

//               {activeTab === "hero" && (
//                 <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
//                   <h2 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2 pb-4 border-b border-slate-100">
//                     <FiLayout className="text-indigo-500" /> Hero Section
//                   </h2>

//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
//                     <div className="col-span-full">
//                       <label className="block text-sm font-medium text-slate-700 mb-2">
//                         Badge Text
//                       </label>
//                       <input
//                         type="text"
//                         value={content.hero.badge}
//                         onChange={(e) =>
//                           handleChange("hero", "badge", e.target.value)
//                         }
//                         className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
//                       />
//                     </div>

//                     <div className="col-span-1">
//                       <label className="block text-sm font-medium text-slate-700 mb-2">
//                         Main Title
//                       </label>
//                       <input
//                         type="text"
//                         value={content.hero.mainTitle}
//                         onChange={(e) =>
//                           handleChange("hero", "mainTitle", e.target.value)
//                         }
//                         className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
//                       />
//                     </div>

//                     <div className="col-span-1">
//                       <label className="block text-sm font-medium text-slate-700 mb-2">
//                         Highlighted Title
//                       </label>
//                       <input
//                         type="text"
//                         value={content.hero.highlightedTitle}
//                         onChange={(e) =>
//                           handleChange(
//                             "hero",
//                             "highlightedTitle",
//                             e.target.value,
//                           )
//                         }
//                         className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
//                         placeholder="Appears in gradient color"
//                       />
//                     </div>

//                     <div className="col-span-full">
//                       <label className="block text-sm font-medium text-slate-700 mb-2">
//                         Hero Description
//                       </label>
//                       <textarea
//                         value={content.hero.description}
//                         onChange={(e) =>
//                           handleChange("hero", "description", e.target.value)
//                         }
//                         className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition h-28 resize-none"
//                       />
//                     </div>

//                     <div className="col-span-full pt-4 mt-2 border-t border-slate-100">
//                       <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2 mb-4">
//                         <FiLink className="text-indigo-400" /> Hero Buttons
//                       </h3>

//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                         {content.hero.buttons?.map((button, index) => (
//                           <div
//                             key={button._id || index}
//                             className="bg-slate-50 border border-slate-100 rounded-xl p-5 space-y-4"
//                           >
//                             <h4 className="text-sm font-semibold text-slate-700">
//                               Button {index + 1}
//                             </h4>

//                             <div>
//                               <label className="block text-sm font-medium text-slate-700 mb-2">
//                                 Button Text
//                               </label>
//                               <input
//                                 type="text"
//                                 value={button.text}
//                                 onChange={(e) =>
//                                   handleChange(
//                                     "hero",
//                                     "buttons",
//                                     e.target.value,
//                                     index,
//                                     "text",
//                                   )
//                                 }
//                                 className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
//                               />
//                             </div>
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                     <div className="col-span-full pt-4 mt-2 border-t border-slate-100">
//                       <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2 mb-4">
//                         <FiVideo className="text-indigo-400" /> Media URLs
//                       </h3>
//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                         {/* <div>
//                           <label className="block text-sm font-medium text-slate-700 mb-2">Hero Video (WebM/MP4)</label>
//                           <input 
//                             type="text" 
//                             value={content.hero.videoUrl} 
//                             onChange={e => handleChange('hero', 'videoUrl', e.target.value)} 
//                             className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" 
//                           />
//                         </div> */}
//                         <div>
//                           <label className="block text-sm font-medium text-slate-700 mb-2">
//                             Demo Video (WebM/MP4)
//                           </label>
//                           <input
//                             type="text"
//                             value={content.hero.demoVideoUrl}
//                             onChange={(e) =>
//                               handleChange(
//                                 "hero",
//                                 "demoVideoUrl",
//                                 e.target.value,
//                               )
//                             }
//                             className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
//                           />
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default AdminLandingPage;
import React, { useState, useEffect } from "react";
import Sidebar from "../component/Sidebar";
import toast from "react-hot-toast";
import {
  FiPlus,
  FiTrash2,
  FiSave,
  FiArrowUp,
  FiArrowDown,
  FiLayout,
  FiVideo,
  FiType,
  FiLink,
  FiGrid,
  FiFeather,
  FiMessageSquare,
  FiGlobe,
  FiStar,
} from "react-icons/fi";

const API_URL = "https://email-syncing-backend.vercel.app/api/landing-page";

const AdminLandingPage = () => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("hero");

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await fetch(API_URL);
        if (!res.ok) {
          toast.error("Failed to fetch landing page content");
          return;
        }

        const data = await res.json();

        setContent({
          ...data,
          hero: {
            badge: "",
            mainTitle: "",
            highlightedTitle: "",
            description: "",
            buttons: [],
            trustItems: [],
            demoVideoUrl: "",
            ...data.hero,
          },
          trustedCountries: data.trustedCountries || [],
          leadAutomation: {
            badge: "",
            title: "",
            description: "",
            bullets: [],
            pipelineLabel: "Active pipeline",
            pipelineTitle: "",
            pipelineStatus: "",
            steps: [],
            completionTitle: "",
            completionStatus: "",
            completionDescription: "",
            stats: [],
            ...data.leadAutomation,
          },
          clientCommunication: {
            badge: "",
            title: "",
            description: "",
            cards: [],
            buttonText: "",
            buttonRoute: "/register",
            ...data.clientCommunication,
          },
          testimonials: {
            badge: "",
            title: "",
            description: "",
            buttonText: "",
            buttonRoute: "/register",
            quote: "",
            authorName: "",
            authorRole: "",
            leftReviews: [],
            rightReviews: [],
            ...data.testimonials,
          },
        });
      } catch (err) {
        toast.error("Error connecting to server");
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  const handleSave = async () => {
    setSaving(true);

    try {
      const token = localStorage.getItem("usertoken");

      const res = await fetch(API_URL, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(content),
      });

      if (res.ok) {
        toast.success("Landing page updated successfully");
      } else {
        toast.error("Failed to update landing page");
      }
    } catch (err) {
      toast.error("Error saving changes");
    } finally {
      setSaving(false);
    }
  };

  const updateField = (section, field, value) => {
    setContent((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const updateRootArrayItem = (field, index, value) => {
    setContent((prev) => {
      const updated = [...(prev[field] || [])];
      updated[index] = value;
      return { ...prev, [field]: updated };
    });
  };

  const addRootArrayItem = (field, value = "") => {
    setContent((prev) => ({
      ...prev,
      [field]: [...(prev[field] || []), value],
    }));
  };

  const removeRootArrayItem = (field, index) => {
    setContent((prev) => {
      const updated = [...(prev[field] || [])];
      updated.splice(index, 1);
      return { ...prev, [field]: updated };
    });
  };

  const updateArrayItem = (section, field, index, subField, value) => {
    setContent((prev) => {
      const updated = [...(prev[section]?.[field] || [])];
      updated[index] = {
        ...updated[index],
        [subField]: value,
      };

      return {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: updated,
        },
      };
    });
  };

  const addArrayItem = (section, field, item) => {
    setContent((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: [...(prev[section]?.[field] || []), item],
      },
    }));
  };

  const removeArrayItem = (section, field, index) => {
    setContent((prev) => {
      const updated = [...(prev[section]?.[field] || [])];
      updated.splice(index, 1);

      return {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: updated,
        },
      };
    });
  };

  const moveArrayItem = (section, field, index, direction) => {
    setContent((prev) => {
      const updated = [...(prev[section]?.[field] || [])];
      const targetIndex = index + direction;

      if (targetIndex < 0 || targetIndex >= updated.length) return prev;

      [updated[index], updated[targetIndex]] = [
        updated[targetIndex],
        updated[index],
      ];

      return {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: updated,
        },
      };
    });
  };

  const TextInput = ({ label, value, onChange, placeholder }) => (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2">
        {label}
      </label>
      <input
        type="text"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
      />
    </div>
  );

  const TextArea = ({ label, value, onChange, placeholder }) => (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2">
        {label}
      </label>
      <textarea
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition h-28 resize-none"
      />
    </div>
  );

  const ArrayControls = ({ onAdd, addLabel }) => (
    <button
      type="button"
      onClick={onAdd}
      className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-semibold border border-indigo-100 hover:bg-indigo-100"
    >
      <FiPlus /> {addLabel}
    </button>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50  flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <div className="text-sm font-medium text-gray-500 tracking-wide">
            Loading Content...
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "hero", label: "Hero Section", icon: <FiLayout /> },
    { id: "countries", label: "Countries", icon: <FiGlobe /> },
    { id: "leadAutomation", label: "Lead Automation", icon: <FiGrid /> },
    {
      id: "clientCommunication",
      label: "Client Communication",
      icon: <FiMessageSquare />,
    },
    // { id: "testimonials", label: "Testimonials", icon: <FiStar /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50  flex">
      <Sidebar />

      <div className="flex-1 max-w-7xl mx-auto w-full">
        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-200 px-8 py-5 flex justify-between items-center shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
              Landing Page Content
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Manage all landing page sections except footer.
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition shadow-md shadow-indigo-200 disabled:opacity-50 disabled:shadow-none"
          >
            <FiSave className={saving ? "animate-pulse" : ""} />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>

        {content && (
          <div className="p-8 flex flex-col lg:flex-row gap-8 items-start">
            <div className="w-full lg:w-64 flex-shrink-0 sticky top-32 space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? "bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100/50"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent"
                  }`}
                >
                  <span
                    className={
                      activeTab === tab.id
                        ? "text-indigo-600"
                        : "text-slate-400"
                    }
                  >
                    {tab.icon}
                  </span>
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 p-8 min-h-[600px]">
              {activeTab === "hero" && (
                <div>
                  <h2 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2 pb-4 border-b border-slate-100">
                    <FiLayout className="text-indigo-500" /> Hero Section
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
                    <div className="col-span-full">
                      <TextInput
                        label="Badge Text"
                        value={content.hero.badge}
                        onChange={(value) => updateField("hero", "badge", value)}
                      />
                    </div>

                    <TextInput
                      label="Main Title"
                      value={content.hero.mainTitle}
                      onChange={(value) =>
                        updateField("hero", "mainTitle", value)
                      }
                    />

                    <TextInput
                      label="Highlighted Title"
                      value={content.hero.highlightedTitle}
                      onChange={(value) =>
                        updateField("hero", "highlightedTitle", value)
                      }
                    />

                    <div className="col-span-full">
                      <TextArea
                        label="Hero Description"
                        value={content.hero.description}
                        onChange={(value) =>
                          updateField("hero", "description", value)
                        }
                      />
                    </div>

                    <div className="col-span-full pt-4 mt-2 border-t border-slate-100">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                          <FiLink className="text-indigo-400" /> Hero Buttons
                        </h3>

                        <ArrayControls
                          addLabel="Add Button"
                          onAdd={() =>
                            addArrayItem("hero", "buttons", {
                              text: "New Button",
                              route: "/",
                              isPrimary: false,
                            })
                          }
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {content.hero.buttons?.map((button, index) => (
                          <div
                            key={button._id || index}
                            className="bg-slate-50 border border-slate-100 rounded-xl p-5 space-y-4"
                          >
                            <div className="flex justify-between items-center">
                              <h4 className="text-sm font-semibold text-slate-700">
                                Button {index + 1}
                              </h4>

                              <button
                                onClick={() =>
                                  removeArrayItem("hero", "buttons", index)
                                }
                                className="text-red-500 hover:text-red-700"
                              >
                                <FiTrash2 />
                              </button>
                            </div>

                            <TextInput
                              label="Button Text"
                              value={button.text}
                              onChange={(value) =>
                                updateArrayItem(
                                  "hero",
                                  "buttons",
                                  index,
                                  "text",
                                  value,
                                )
                              }
                            />

                            <TextInput
                              label="Button Route"
                              value={button.route}
                              onChange={(value) =>
                                updateArrayItem(
                                  "hero",
                                  "buttons",
                                  index,
                                  "route",
                                  value,
                                )
                              }
                            />

                            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                              <input
                                type="checkbox"
                                checked={!!button.isPrimary}
                                onChange={(e) =>
                                  updateArrayItem(
                                    "hero",
                                    "buttons",
                                    index,
                                    "isPrimary",
                                    e.target.checked,
                                  )
                                }
                              />
                              Primary Button
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="col-span-full pt-4 mt-2 border-t border-slate-100">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-semibold text-slate-800">
                          Trust Items
                        </h3>

                        <ArrayControls
                          addLabel="Add Item"
                          onAdd={() =>
                            addArrayItem("hero", "trustItems", "New trust item")
                          }
                        />
                      </div>

                      <div className="space-y-3">
                        {content.hero.trustItems?.map((item, index) => (
                          <div key={index} className="flex gap-3">
                            <input
                              type="text"
                              value={item}
                              onChange={(e) =>
                                updateArrayItem(
                                  "hero",
                                  "trustItems",
                                  index,
                                  null,
                                  e.target.value,
                                )
                              }
                              className="flex-1 border border-slate-300 rounded-lg p-3 text-sm"
                            />
                            <button
                              onClick={() =>
                                removeArrayItem("hero", "trustItems", index)
                              }
                              className="px-3 text-red-500"
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="col-span-full pt-4 mt-2 border-t border-slate-100">
                      <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2 mb-4">
                        <FiVideo className="text-indigo-400" /> Media URLs
                      </h3>

                      <TextInput
                        label="Demo Video URL or Coming Soon"
                        value={content.hero.demoVideoUrl}
                        onChange={(value) =>
                          updateField("hero", "demoVideoUrl", value)
                        }
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "countries" && (
                <div>
                  <h2 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2 pb-4 border-b border-slate-100">
                    <FiGlobe className="text-indigo-500" /> Trusted Countries
                  </h2>

                  <div className="max-w-3xl space-y-3">
                    {content.trustedCountries?.map((country, index) => (
                      <div key={index} className="flex gap-3">
                        <input
                          type="text"
                          value={country}
                          onChange={(e) =>
                            updateRootArrayItem(
                              "trustedCountries",
                              index,
                              e.target.value,
                            )
                          }
                          className="flex-1 border border-slate-300 rounded-lg p-3 text-sm"
                        />

                        <button
                          onClick={() =>
                            removeRootArrayItem("trustedCountries", index)
                          }
                          className="px-3 text-red-500"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    ))}

                    <ArrayControls
                      addLabel="Add Country"
                      onAdd={() =>
                        addRootArrayItem("trustedCountries", "New Country")
                      }
                    />
                  </div>
                </div>
              )}

              {activeTab === "leadAutomation" && (
                <div>
                  <h2 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2 pb-4 border-b border-slate-100">
                    <FiGrid className="text-indigo-500" /> Lead Automation
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl">
                    <TextInput
                      label="Badge"
                      value={content.leadAutomation.badge}
                      onChange={(value) =>
                        updateField("leadAutomation", "badge", value)
                      }
                    />

                    <TextInput
                      label="Pipeline Label"
                      value={content.leadAutomation.pipelineLabel}
                      onChange={(value) =>
                        updateField("leadAutomation", "pipelineLabel", value)
                      }
                    />

                    <div className="col-span-full">
                      <TextInput
                        label="Title"
                        value={content.leadAutomation.title}
                        onChange={(value) =>
                          updateField("leadAutomation", "title", value)
                        }
                      />
                    </div>

                    <div className="col-span-full">
                      <TextArea
                        label="Description"
                        value={content.leadAutomation.description}
                        onChange={(value) =>
                          updateField("leadAutomation", "description", value)
                        }
                      />
                    </div>

                    <TextInput
                      label="Pipeline Title"
                      value={content.leadAutomation.pipelineTitle}
                      onChange={(value) =>
                        updateField("leadAutomation", "pipelineTitle", value)
                      }
                    />

                    <TextInput
                      label="Pipeline Status"
                      value={content.leadAutomation.pipelineStatus}
                      onChange={(value) =>
                        updateField("leadAutomation", "pipelineStatus", value)
                      }
                    />

                    <TextInput
                      label="Completion Title"
                      value={content.leadAutomation.completionTitle}
                      onChange={(value) =>
                        updateField("leadAutomation", "completionTitle", value)
                      }
                    />

                    <TextInput
                      label="Completion Status"
                      value={content.leadAutomation.completionStatus}
                      onChange={(value) =>
                        updateField("leadAutomation", "completionStatus", value)
                      }
                    />

                    <div className="col-span-full">
                      <TextArea
                        label="Completion Description"
                        value={content.leadAutomation.completionDescription}
                        onChange={(value) =>
                          updateField(
                            "leadAutomation",
                            "completionDescription",
                            value,
                          )
                        }
                      />
                    </div>

                    <div className="col-span-full border-t border-slate-100 pt-5">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-semibold text-slate-800">
                          Bullets
                        </h3>
                        <ArrayControls
                          addLabel="Add Bullet"
                          onAdd={() =>
                            addArrayItem(
                              "leadAutomation",
                              "bullets",
                              "New bullet point",
                            )
                          }
                        />
                      </div>

                      <div className="space-y-3">
                        {content.leadAutomation.bullets?.map((item, index) => (
                          <div key={index} className="flex gap-3">
                            <input
                              type="text"
                              value={item}
                              onChange={(e) =>
                                updateArrayItem(
                                  "leadAutomation",
                                  "bullets",
                                  index,
                                  null,
                                  e.target.value,
                                )
                              }
                              className="flex-1 border border-slate-300 rounded-lg p-3 text-sm"
                            />
                            <button
                              onClick={() =>
                                removeArrayItem(
                                  "leadAutomation",
                                  "bullets",
                                  index,
                                )
                              }
                              className="px-3 text-red-500"
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="col-span-full border-t border-slate-100 pt-5">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-semibold text-slate-800">
                          Pipeline Steps
                        </h3>
                        <ArrayControls
                          addLabel="Add Step"
                          onAdd={() =>
                            addArrayItem("leadAutomation", "steps", {
                              step: "05",
                              title: "New Step",
                              description: "Step description",
                            })
                          }
                        />
                      </div>

                      <div className="space-y-4">
                        {content.leadAutomation.steps?.map((step, index) => (
                          <div
                            key={index}
                            className="bg-slate-50 border border-slate-100 rounded-xl p-5 space-y-4"
                          >
                            <div className="flex justify-between">
                              <h4 className="text-sm font-semibold">
                                Step {index + 1}
                              </h4>

                              <div className="flex gap-2">
                                <button
                                  onClick={() =>
                                    moveArrayItem(
                                      "leadAutomation",
                                      "steps",
                                      index,
                                      -1,
                                    )
                                  }
                                  className="text-slate-500"
                                >
                                  <FiArrowUp />
                                </button>
                                <button
                                  onClick={() =>
                                    moveArrayItem(
                                      "leadAutomation",
                                      "steps",
                                      index,
                                      1,
                                    )
                                  }
                                  className="text-slate-500"
                                >
                                  <FiArrowDown />
                                </button>
                                <button
                                  onClick={() =>
                                    removeArrayItem(
                                      "leadAutomation",
                                      "steps",
                                      index,
                                    )
                                  }
                                  className="text-red-500"
                                >
                                  <FiTrash2 />
                                </button>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <TextInput
                                label="Step Number"
                                value={step.step}
                                onChange={(value) =>
                                  updateArrayItem(
                                    "leadAutomation",
                                    "steps",
                                    index,
                                    "step",
                                    value,
                                  )
                                }
                              />

                              <TextInput
                                label="Title"
                                value={step.title}
                                onChange={(value) =>
                                  updateArrayItem(
                                    "leadAutomation",
                                    "steps",
                                    index,
                                    "title",
                                    value,
                                  )
                                }
                              />

                              <TextInput
                                label="Description"
                                value={step.description}
                                onChange={(value) =>
                                  updateArrayItem(
                                    "leadAutomation",
                                    "steps",
                                    index,
                                    "description",
                                    value,
                                  )
                                }
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="col-span-full border-t border-slate-100 pt-5">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-semibold text-slate-800">
                          Stats
                        </h3>
                        <ArrayControls
                          addLabel="Add Stat"
                          onAdd={() =>
                            addArrayItem("leadAutomation", "stats", {
                              label: "New stat",
                              value: "0",
                            })
                          }
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {content.leadAutomation.stats?.map((stat, index) => (
                          <div
                            key={index}
                            className="bg-slate-50 border border-slate-100 rounded-xl p-5 space-y-4"
                          >
                            <div className="flex justify-between">
                              <h4 className="text-sm font-semibold">
                                Stat {index + 1}
                              </h4>
                              <button
                                onClick={() =>
                                  removeArrayItem(
                                    "leadAutomation",
                                    "stats",
                                    index,
                                  )
                                }
                                className="text-red-500"
                              >
                                <FiTrash2 />
                              </button>
                            </div>

                            <TextInput
                              label="Label"
                              value={stat.label}
                              onChange={(value) =>
                                updateArrayItem(
                                  "leadAutomation",
                                  "stats",
                                  index,
                                  "label",
                                  value,
                                )
                              }
                            />

                            <TextInput
                              label="Value"
                              value={stat.value}
                              onChange={(value) =>
                                updateArrayItem(
                                  "leadAutomation",
                                  "stats",
                                  index,
                                  "value",
                                  value,
                                )
                              }
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "clientCommunication" && (
                <div>
                  <h2 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2 pb-4 border-b border-slate-100">
                    <FiMessageSquare className="text-indigo-500" /> Client
                    Communication
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl">
                    <TextInput
                      label="Badge"
                      value={content.clientCommunication.badge}
                      onChange={(value) =>
                        updateField("clientCommunication", "badge", value)
                      }
                    />

                    <TextInput
                      label="Button Text"
                      value={content.clientCommunication.buttonText}
                      onChange={(value) =>
                        updateField("clientCommunication", "buttonText", value)
                      }
                    />

                    <div className="col-span-full">
                      <TextInput
                        label="Title"
                        value={content.clientCommunication.title}
                        onChange={(value) =>
                          updateField("clientCommunication", "title", value)
                        }
                      />
                    </div>

                    <div className="col-span-full">
                      <TextArea
                        label="Description"
                        value={content.clientCommunication.description}
                        onChange={(value) =>
                          updateField(
                            "clientCommunication",
                            "description",
                            value,
                          )
                        }
                      />
                    </div>

                    <TextInput
                      label="Button Route"
                      value={content.clientCommunication.buttonRoute}
                      onChange={(value) =>
                        updateField("clientCommunication", "buttonRoute", value)
                      }
                    />

                    <div className="col-span-full border-t border-slate-100 pt-5">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-semibold text-slate-800">
                          Cards
                        </h3>

                        <ArrayControls
                          addLabel="Add Card"
                          onAdd={() =>
                            addArrayItem("clientCommunication", "cards", {
                              title: "New Card",
                              text: "Card description",
                            })
                          }
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {content.clientCommunication.cards?.map(
                          (card, index) => (
                            <div
                              key={index}
                              className="bg-slate-50 border border-slate-100 rounded-xl p-5 space-y-4"
                            >
                              <div className="flex justify-between">
                                <h4 className="text-sm font-semibold">
                                  Card {index + 1}
                                </h4>
                                <button
                                  onClick={() =>
                                    removeArrayItem(
                                      "clientCommunication",
                                      "cards",
                                      index,
                                    )
                                  }
                                  className="text-red-500"
                                >
                                  <FiTrash2 />
                                </button>
                              </div>

                              <TextInput
                                label="Title"
                                value={card.title}
                                onChange={(value) =>
                                  updateArrayItem(
                                    "clientCommunication",
                                    "cards",
                                    index,
                                    "title",
                                    value,
                                  )
                                }
                              />

                              <TextArea
                                label="Text"
                                value={card.text}
                                onChange={(value) =>
                                  updateArrayItem(
                                    "clientCommunication",
                                    "cards",
                                    index,
                                    "text",
                                    value,
                                  )
                                }
                              />
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "testimonials" && (
                <div>
                  <h2 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2 pb-4 border-b border-slate-100">
                    <FiStar className="text-indigo-500" /> Testimonials
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl">
                    <TextInput
                      label="Badge"
                      value={content.testimonials.badge}
                      onChange={(value) =>
                        updateField("testimonials", "badge", value)
                      }
                    />

                    <TextInput
                      label="Button Text"
                      value={content.testimonials.buttonText}
                      onChange={(value) =>
                        updateField("testimonials", "buttonText", value)
                      }
                    />

                    <div className="col-span-full">
                      <TextInput
                        label="Title"
                        value={content.testimonials.title}
                        onChange={(value) =>
                          updateField("testimonials", "title", value)
                        }
                      />
                    </div>

                    <div className="col-span-full">
                      <TextArea
                        label="Description"
                        value={content.testimonials.description}
                        onChange={(value) =>
                          updateField("testimonials", "description", value)
                        }
                      />
                    </div>

                    <TextInput
                      label="Button Route"
                      value={content.testimonials.buttonRoute}
                      onChange={(value) =>
                        updateField("testimonials", "buttonRoute", value)
                      }
                    />

                    <TextInput
                      label="Author Name"
                      value={content.testimonials.authorName}
                      onChange={(value) =>
                        updateField("testimonials", "authorName", value)
                      }
                    />

                    <TextInput
                      label="Author Role"
                      value={content.testimonials.authorRole}
                      onChange={(value) =>
                        updateField("testimonials", "authorRole", value)
                      }
                    />

                    <div className="col-span-full">
                      <TextArea
                        label="Quote"
                        value={content.testimonials.quote}
                        onChange={(value) =>
                          updateField("testimonials", "quote", value)
                        }
                      />
                    </div>

                    {["leftReviews", "rightReviews"].map((reviewField) => (
                      <div
                        key={reviewField}
                        className="col-span-full border-t border-slate-100 pt-5"
                      >
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-sm font-semibold text-slate-800">
                            {reviewField === "leftReviews"
                              ? "Left Reviews"
                              : "Right Reviews"}
                          </h3>

                          <ArrayControls
                            addLabel="Add Review"
                            onAdd={() =>
                              addArrayItem("testimonials", reviewField, {
                                name: "Customer Name",
                                handle: "@handle",
                                text: "Review text",
                              })
                            }
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {content.testimonials?.[reviewField]?.map(
                            (review, index) => (
                              <div
                                key={index}
                                className="bg-slate-50 border border-slate-100 rounded-xl p-5 space-y-4"
                              >
                                <div className="flex justify-between">
                                  <h4 className="text-sm font-semibold">
                                    Review {index + 1}
                                  </h4>
                                  <button
                                    onClick={() =>
                                      removeArrayItem(
                                        "testimonials",
                                        reviewField,
                                        index,
                                      )
                                    }
                                    className="text-red-500"
                                  >
                                    <FiTrash2 />
                                  </button>
                                </div>

                                <TextInput
                                  label="Name"
                                  value={review.name}
                                  onChange={(value) =>
                                    updateArrayItem(
                                      "testimonials",
                                      reviewField,
                                      index,
                                      "name",
                                      value,
                                    )
                                  }
                                />

                                <TextInput
                                  label="Handle"
                                  value={review.handle}
                                  onChange={(value) =>
                                    updateArrayItem(
                                      "testimonials",
                                      reviewField,
                                      index,
                                      "handle",
                                      value,
                                    )
                                  }
                                />

                                <TextArea
                                  label="Review Text"
                                  value={review.text}
                                  onChange={(value) =>
                                    updateArrayItem(
                                      "testimonials",
                                      reviewField,
                                      index,
                                      "text",
                                      value,
                                    )
                                  }
                                />
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLandingPage;
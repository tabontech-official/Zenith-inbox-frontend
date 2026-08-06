// import React, { useEffect, useState } from "react";
// import { Mail, Clock, Server, Layers, Trash2, X, Workflow } from "lucide-react";
// import { useNavigate } from "react-router-dom";
// import Sidebar from "../component/Sidebar";
// import ScenarioSelectModal from "../component/ScenarioSelectModal";

// const getScenarioName = (scenario) => {
//   if (scenario.name && scenario.name.trim() !== "") return scenario.name;
//   const modules = scenario.routerBranches?.[0]?.modules || [];
//   if (
//     modules.some((m) => m.type === "Send an Email" && m.app?.name === "Gmail")
//   )
//     return "Gmail Scenario";
//   if (modules.some((m) => m.type === "Custom Email"))
//     return "Outlook/SMTP Scenario";
//   if (modules.some((m) => m.type === "Delay")) return "Delay Scenario";
//   if (modules.length > 1) return "Mixed Scenario";
//   return "Untitled Scenario";
// };

// const getScenarioDescription = (scenario) => {
//   if (scenario.description && scenario.description.trim() !== "")
//     return scenario.description;
//   const modules = scenario.routerBranches?.[0]?.modules || [];
//   if (modules.length > 0) return modules.map((m) => m.description).join(", ");
//   return "No description available";
// };

// const getScenarioIcon = (scenario) => {
//   const modules = scenario.routerBranches?.[0]?.modules || [];
//   if (modules.some((m) => m.app?.name === "Gmail"))
//     return <Mail className="w-5 h-5 text-red-500" />;
//   if (modules.some((m) => m.type === "Custom Email"))
//     return <Server className="w-5 h-5 text-blue-500" />;
//   if (modules.some((m) => m.type === "Delay"))
//     return <Clock className="w-5 h-5 text-yellow-500" />;
//   return <Layers className="w-5 h-5 text-purple-500" />;
// };

// const Loader = () => (
//   <tr>
//     <td colSpan="5">
//       <div className="flex flex-col justify-center items-center py-10">
//         <svg
//           className="animate-spin h-8 w-8 text-purple-600 mb-2"
//           viewBox="0 0 24 24"
//         >
//           <circle
//             className="opacity-25"
//             cx="12"
//             cy="12"
//             r="10"
//             stroke="currentColor"
//             strokeWidth="4"
//           ></circle>
//           <path
//             className="opacity-75"
//             fill="currentColor"
//             d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//           ></path>
//         </svg>
//         <p className="text-sm text-purple-600 font-medium">Loading data...</p>
//       </div>
//     </td>
//   </tr>
// );

// const AllScenariosPage = () => {
//   const [scenarios, setScenarios] = useState([]);
//   const [deleteModalOpen, setDeleteModalOpen] = useState(false);
//   const [selectedScenario, setSelectedScenario] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [openScenarioModal, setOpenScenarioModal] = useState(false);
//   const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
//   const navigate = useNavigate();

//   useEffect(() => {
//     fetchScenarios();
//   }, []);

//   const fetchScenarios = async () => {
//     const userId = localStorage.getItem("userid");
//     try {
//       setLoading(true);
//       const res = await fetch(`https://email-syncing-backend.vercel.app/scenario/user/${userId}`);
//       const data = await res.json();
//       setScenarios(Array.isArray(data) ? data : data.data || []);
//     } catch (err) {
//       console.error("Error fetching scenarios:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleRowClick = (scenario) => {
//     navigate(
//       scenario.type === "shopify"
//         ? `/scenarios/shopify/${scenario._id}`
//         : `/scenarios/others/${scenario._id}`,
//     );
//   };

//   const handleDelete = async () => {
//     if (!selectedScenario) return;
//     try {
//       await fetch(
//         `https://email-syncing-backend.vercel.app/scenario/detail/${selectedScenario._id}`,
//         { method: "DELETE" },
//       );
//       setDeleteModalOpen(false);
//       setSelectedScenario(null);
//       fetchScenarios();
//     } catch (err) {
//       console.error("Error deleting scenario:", err);
//     }
//   };

//   const handleSelectScenario = (type) => {
//     setOpenScenarioModal(false);
//     navigate(type === "shopify" ? "/scenarios/shopify" : "/scenarios/others");
//   };

//   return (
//     <div className="flex bg-gradient-to-br from-gray-50 to-indigo-50 min-h-screen font-inter">
//       <Sidebar />

//       <main className="flex-1  flex flex-col">
//         <header className="flex flex-col md:flex-row md:items-center justify-between px-4 py-1 bg-white border-b border-gray-100 shadow-sm gap-4">
//           <div className="flex items-center gap-4">
//             <div className="hidden sm:flex w-12 h-12 bg-indigo-50 rounded-xl items-center justify-center text-indigo-600">
//               <Workflow className="w-6 h-6" />
//             </div>

//             <div>
//               <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
//                 All Scenarios
//               </h1>
//               <p className="text-sm text-gray-500 mt-0.5">
//                 Manage, edit, and organize your automation workflows.
//               </p>
//             </div>
//           </div>

//           <div className="flex flex-wrap items-center gap-3 bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
//             <div className="text-sm text-gray-600 font-medium px-3 py-1 bg-white rounded-lg border border-gray-100 shadow-sm">
//               Shopify:{" "}
//               <span className="font-semibold text-indigo-600">
//                 {scenarios.filter((s) => s.type === "shopify").length}/1
//               </span>
//             </div>

//             <div className="text-sm text-gray-600 font-medium px-3 py-1 bg-white rounded-lg border border-gray-100 shadow-sm">
//               Custom:{" "}
//               <span className="font-semibold text-indigo-600">
//                 {scenarios.filter((s) => s.type !== "shopify").length}/2
//               </span>
//             </div>

//             <button
//               onClick={() => {
//                 const shopifyCount = scenarios.filter(
//                   (s) => s.type === "shopify",
//                 ).length;
//                 const customCount = scenarios.filter(
//                   (s) => s.type !== "shopify",
//                 ).length;

//                 if (shopifyCount >= 1 && customCount >= 2) {
//                   setUpgradeModalOpen(true);
//                   return;
//                 }

//                 setOpenScenarioModal(true);
//               }}
//               className="px-4 py-2 rounded-xl font-medium shadow-sm bg-indigo-600 hover:bg-indigo-500 text-white transition"
//             >
//               + New Scenario
//             </button>
//           </div>
//         </header>

//         {/* 🔹 Responsive Table */}
//         <section className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-auto">
//           {/* 📱 Responsive Scenarios List */}
//           <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
//             {/* 🖥️ Table for md+ screens */}
//             <table className="hidden md:table w-full text-sm text-left text-gray-600">
//               <thead className="bg-gray-100 text-gray-700 uppercase tracking-wide text-xs">
//                 <tr>
//                   <th className="px-6 py-3">Scenario</th>
//                   <th className="px-6 py-3">Description</th>
//                   <th className="px-6 py-3">Type</th>
//                   <th className="px-6 py-3">Created</th>
//                   <th className="px-6 py-3 text-right">Actions</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-100">
//                 {scenarios.map((scenario) => (
//                   <tr
//                     key={scenario._id}
//                     onClick={() => handleRowClick(scenario)}
//                     className="hover:bg-indigo-50 cursor-pointer"
//                   >
//                     <td className="px-6 py-4 flex items-center gap-3 font-semibold text-gray-800">
//                       <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-indigo-100 text-indigo-600">
//                         {getScenarioIcon(scenario)}
//                       </div>
//                       {getScenarioName(scenario)}
//                     </td>
//                     <td className="px-6 py-4 text-gray-600 truncate max-w-sm">
//                       {getScenarioDescription(scenario)}
//                     </td>
//                     <td className="px-6 py-4 capitalize">{scenario.type}</td>
//                     <td className="px-6 py-4 text-gray-500">
//                       {new Date(scenario.createdAt).toLocaleDateString(
//                         "en-US",
//                         {
//                           year: "numeric",
//                           month: "short",
//                           day: "numeric",
//                         },
//                       )}
//                     </td>
//                     <td className="px-6 py-4 text-right">
//                       <button
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           setSelectedScenario(scenario);
//                           setDeleteModalOpen(true);
//                         }}
//                         className="text-gray-400 hover:text-red-500"
//                       >
//                         <Trash2 className="w-5 h-5" />
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>

//             {/* 📱 Mobile Card View */}
//             <div className="md:hidden divide-y divide-gray-100">
//               {scenarios.map((scenario) => (
//                 <div
//                   key={scenario._id}
//                   onClick={() => handleRowClick(scenario)}
//                   className="p-4 hover:bg-indigo-50 transition cursor-pointer"
//                 >
//                   <div className="flex items-center gap-3 mb-2">
//                     <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600">
//                       {getScenarioIcon(scenario)}
//                     </div>
//                     <div className="flex-1">
//                       <h3 className="text-base font-semibold text-gray-900">
//                         {getScenarioName(scenario)}
//                       </h3>
//                       <p className="text-xs text-gray-500">
//                         {new Date(scenario.createdAt).toLocaleDateString(
//                           "en-US",
//                           {
//                             month: "short",
//                             day: "numeric",
//                           },
//                         )}{" "}
//                         • {scenario.type}
//                       </p>
//                     </div>
//                     <button
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         setSelectedScenario(scenario);
//                         setDeleteModalOpen(true);
//                       }}
//                       className="text-gray-400 hover:text-red-500"
//                     >
//                       <Trash2 className="w-5 h-5" />
//                     </button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </section>
//       </main>

//       {/* 🗑️ Delete Modal */}
//       {deleteModalOpen && (
//         <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
//           <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm sm:max-w-md p-6">
//             <div className="flex justify-between items-center mb-4">
//               <h2 className="text-lg font-semibold text-gray-900">
//                 Confirm Delete
//               </h2>
//               <button
//                 onClick={() => setDeleteModalOpen(false)}
//                 className="text-gray-400 hover:text-gray-600 transition"
//               >
//                 <X className="w-5 h-5" />
//               </button>
//             </div>

//             <p className="text-gray-600 mb-6 leading-relaxed">
//               Are you sure you want to delete{" "}
//               <span className="font-semibold text-gray-800">
//                 {selectedScenario?.name || "this scenario"}
//               </span>
//               ?
//             </p>

//             <div className="flex justify-end gap-3">
//               <button
//                 onClick={() => setDeleteModalOpen(false)}
//                 className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleDelete}
//                 className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white shadow transition"
//               >
//                 Delete
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {upgradeModalOpen && (
//         <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
//           <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">
//             <button
//               onClick={() => setUpgradeModalOpen(false)}
//               className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition"
//             >
//               <X className="w-5 h-5" />
//             </button>

//             <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
//               <Layers className="w-6 h-6" />
//             </div>

//             <h2 className="text-xl font-bold text-gray-900 mb-2">
//               Scenario Limit Reached
//             </h2>

//             <p className="text-gray-600 leading-relaxed mb-5">
//               You’ve reached the free plan limit of{" "}
//               <span className="font-semibold text-gray-900">
//                 1 Shopify scenario
//               </span>{" "}
//               and{" "}
//               <span className="font-semibold text-gray-900">
//                 2 custom scenarios
//               </span>
//               . Higher limits will be available with the Pro plan soon.
//             </p>

//             <div className="rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 mb-5">
//               <p className="text-sm font-semibold text-indigo-700">
//                 Pro plan coming soon
//               </p>
//               <p className="text-sm text-indigo-600 mt-1">
//                 More scenarios, higher automation limits, and advanced workflow
//                 features are on the way.
//               </p>
//             </div>

//             <div className="flex justify-end">
//               <button
//                 onClick={() => setUpgradeModalOpen(false)}
//                 className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow transition"
//               >
//                 Got it
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ✅ Scenario Select Modal */}
//       <ScenarioSelectModal
//         open={openScenarioModal}
//         onClose={() => setOpenScenarioModal(false)}
//         onSelect={handleSelectScenario}
//       />
//     </div>
//   );
// };

// export default AllScenariosPage;
import React, { useEffect, useState, useRef } from "react";
import {
  Mail,
  Clock,
  Server,
  Layers,
  Trash2,
  X,
  Workflow,
  Plus,
  Search,
  ChevronRight,
  AlertTriangle,
  PlayCircle,
  PauseCircle,
  Sparkles,
  SlidersHorizontal,
  Check,
  Cpu,
  ChevronDown,
  ChevronUp,
  Zap,
  Settings,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import AppLayout from "../component/AppLayout";

const getScenarioName = (scenario) => {
  if (scenario.name?.trim()) {
    return scenario.name;
  }

  const modules = scenario.routerBranches?.[0]?.modules || [];

  if (
    modules.some(
      (module) =>
        module.type === "Send an Email" &&
        module.app?.name === "Gmail",
    )
  ) {
    return "Gmail Scenario";
  }

  if (modules.some((module) => module.type === "Custom Email")) {
    return "Outlook / SMTP Scenario";
  }

  if (modules.some((module) => module.type === "Delay")) {
    return "Delay Scenario";
  }

  if (modules.length > 1) {
    return "Mixed Workflow";
  }

  return "Untitled Scenario";
};

const getScenarioDescription = (scenario) => {
  if (scenario.description?.trim()) {
    return scenario.description;
  }

  const modules = scenario.routerBranches?.[0]?.modules || [];

  if (modules.length > 0) {
    return modules
      .map((module) => module.description)
      .filter(Boolean)
      .join(", ");
  }

  return "No description configured for this scenario.";
};

const getScenarioIcon = (scenario) => {
  const modules = scenario.routerBranches?.[0]?.modules || [];

  if (modules.some((module) => module.app?.name === "Gmail")) {
    return <Mail className="h-4 w-4 text-zinc-900" />;
  }

  if (modules.some((module) => module.type === "Custom Email")) {
    return <Server className="h-4 w-4 text-zinc-800" />;
  }

  if (modules.some((module) => module.type === "Delay")) {
    return <Clock className="h-4 w-4 text-zinc-700" />;
  }

  return <Layers className="h-4 w-4 text-zinc-700" />;
};

const formatDate = (date) => {
  if (!date) return "N/A";

  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const AllScenariosPage = () => {
  const navigate = useNavigate();

  const [scenarios, setScenarios] = useState([]);
  const [selectedScenario, setSelectedScenario] = useState(null);

  const [loading, setLoading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  // New Split Dropdown State & Ref
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchScenarios = async () => {
    const userId = localStorage.getItem("userid");

    if (!userId) {
      console.error("No userId found in localStorage");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `https://email-syncing-backend.vercel.app/scenario/user/${userId}`,
      );

      const data = await response.json();

      setScenarios(Array.isArray(data) ? data : data?.data || []);
    } catch (error) {
      console.error("Error fetching scenarios:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScenarios();
  }, []);

  const shopifyCount = scenarios.filter(
    (scenario) => scenario.type === "shopify",
  ).length;

  const customCount = scenarios.filter(
    (scenario) => scenario.type !== "shopify",
  ).length;

  const activeCount = scenarios.filter(
    (scenario) => scenario.scenarioActive,
  ).length;

  const pausedCount = scenarios.filter(
    (scenario) => !scenario.scenarioActive,
  ).length;

  const filteredScenarios = scenarios.filter((scenario) => {
    const name = getScenarioName(scenario).toLowerCase();
    const description = getScenarioDescription(scenario).toLowerCase();
    const query = searchQuery.toLowerCase().trim();

    const matchesSearch =
      name.includes(query) || description.includes(query);

    const matchesFilter =
      activeFilter === "all" ||
      (activeFilter === "shopify" && scenario.type === "shopify") ||
      (activeFilter === "custom" && scenario.type !== "shopify") ||
      (activeFilter === "active" && scenario.scenarioActive) ||
      (activeFilter === "paused" && !scenario.scenarioActive);

    return matchesSearch && matchesFilter;
  });

  const handleRowClick = (scenario) => {
    navigate(
      scenario.type === "shopify"
        ? `/scenarios/shopify/${scenario._id}`
        : `/scenarios/others/${scenario._id}`,
    );
  };

  const handleCreateScenario = (type) => {
    setDropdownOpen(false);

    if (type === "shopify" && shopifyCount >= 1) {
      setUpgradeModalOpen(true);
      return;
    }

    if (type === "custom" && customCount >= 2) {
      setUpgradeModalOpen(true);
      return;
    }

    navigate(
      type === "shopify"
        ? "/scenarios/shopify"
        : "/scenarios/others",
    );
  };

  const handleDelete = async () => {
    if (!selectedScenario) return;

    try {
      await fetch(
        `https://email-syncing-backend.vercel.app/scenario/detail/${selectedScenario._id}`,
        {
          method: "DELETE",
        },
      );

      setDeleteModalOpen(false);
      setSelectedScenario(null);

      fetchScenarios();
    } catch (error) {
      console.error("Error deleting scenario:", error);
    }
  };

  const openDeleteModal = (event, scenario) => {
    event.stopPropagation();

    setSelectedScenario(scenario);
    setDeleteModalOpen(true);
  };

  const filterOptions = [
    { label: "All Workflows", value: "all", count: scenarios.length },
    { label: "Shopify", value: "shopify", count: shopifyCount },
    { label: "Custom", value: "custom", count: customCount },
    { label: "Active", value: "active", count: activeCount },
    { label: "Paused", value: "paused", count: pausedCount },
  ];

  return (
    <AppLayout>
      <div className="flex-1 overflow-y-auto px-6 py-3 bg-zinc-100 font-sans text-zinc-900">
        {/* Full-width container */}
        <div className="w-full ">
          {/* Header */}
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-zinc-900 text-white shadow-xs">
                  <Workflow className="h-5 w-5" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
                  Scenarios
                </h1>
              </div>
              <p className="mt-1 text-sm text-zinc-500">
                Manage, edit and organize your automated workflows.
              </p>
            </div>

            {/* Split Button Matching Image */}
            {/* <div className="relative inline-block text-left" ref={dropdownRef}>
              <div className="inline-flex items-center rounded-[8px] bg-zinc-950 p-0.5 shadow-xs">
                <button
                  type="button"
                  onClick={() => handleCreateScenario("shopify")}
                  className="flex h-9 items-center gap-2 rounded-l-[6px] bg-zinc-950 px-3.5 text-xs font-bold text-white transition hover:bg-zinc-800"
                >
                  <Plus className="h-4 w-4 stroke-[2.5]" />
                  <span>New scenario</span>
                </button>

                <div className="h-5 w-[1px] bg-zinc-800" />

                <button
                  type="button"
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  className="flex h-9 w-9 items-center justify-center rounded-r-[6px] bg-zinc-950 text-white transition hover:bg-zinc-800"
                  aria-label="Toggle options menu"
                >
                  {dropdownOpen ? (
                    <ChevronUp className="h-4 w-4 stroke-[2.5]" />
                  ) : (
                    <ChevronDown className="h-4 w-4 stroke-[2.5]" />
                  )}
                </button>
              </div>

              {dropdownOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-[12px] border border-zinc-200 bg-white p-1.5 shadow-xl transition-all">
                  <button
                    type="button"
                    onClick={() => handleCreateScenario("shopify")}
                    className="flex w-full items-center gap-3 rounded-[8px] px-3 py-2.5 text-left text-xs font-semibold text-zinc-800 transition hover:bg-zinc-100"
                  >
                    <Zap className="h-4 w-4 text-zinc-700" />
                    <span>Shopify Scenario</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCreateScenario("custom")}
                    className="flex w-full items-center gap-3 rounded-[8px] px-3 py-2.5 text-left text-xs font-semibold text-zinc-800 transition hover:bg-zinc-100"
                  >
                    <Settings className="h-4 w-4 text-zinc-700" />
                    <span>Custom Scenario</span>
                  </button>
                </div>
              )}
            </div> */}
          </div>

          {/* Metric Cards Grid */}
          <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-[8px] border border-zinc-200 bg-white p-5 shadow-xs transition hover:border-zinc-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase  text-zinc-500">
                    Total Scenarios
                  </p>
                  <p className="mt-2 text-2xl font-bold text-zinc-900">
                    {scenarios.length}
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-zinc-100 text-zinc-700">
                  <Layers className="h-5 w-5" />
                </div>
              </div>
            </div>

            <div className="rounded-[8px] border border-zinc-200 bg-white p-5 shadow-xs transition hover:border-zinc-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase  text-zinc-500">
                    Shopify Limit
                  </p>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-zinc-900">
                      {shopifyCount}
                    </span>
                    <span className="text-xs font-medium text-zinc-400">
                      / 1 max
                    </span>
                  </div>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-zinc-100 text-zinc-700">
                  <Mail className="h-5 w-5" />
                </div>
              </div>
            </div>

            <div className="rounded-[8px] border border-zinc-200 bg-white p-5 shadow-xs transition hover:border-zinc-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase  text-zinc-500">
                    Custom Limit
                  </p>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-zinc-900">
                      {customCount}
                    </span>
                    <span className="text-xs font-medium text-zinc-400">
                      / 2 max
                    </span>
                  </div>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-zinc-100 text-zinc-700">
                  <Cpu className="h-5 w-5" />
                </div>
              </div>
            </div>

            <div className="rounded-[8px] border border-zinc-200 bg-white p-5 shadow-xs transition hover:border-zinc-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase  text-zinc-500">
                    Active Automations
                  </p>
                  <p className="mt-2 text-2xl font-bold text-zinc-900">
                    {activeCount}
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-zinc-100 text-zinc-900">
                  <PlayCircle className="h-5 w-5" />
                </div>
              </div>
            </div>
          </section>

          {/* ClickUp / Asana Filter Header */}
          <section className="mb-6 rounded-[8px] border border-zinc-200 bg-white p-2.5 shadow-xs">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              
              {/* Filter Tabs */}
              <div className="flex flex-wrap items-center gap-1 rounded-[8px] bg-zinc-100 p-1">
                <div className="flex items-center px-2 text-zinc-400">
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                </div>
                
                {filterOptions.map((filter) => {
                  const isActive = activeFilter === filter.value;
                  return (
                    <button
                      type="button"
                      key={filter.value}
                      onClick={() => setActiveFilter(filter.value)}
                      className={`group flex h-8 items-center gap-2 rounded-[8px] px-3 text-xs font-medium transition ${
                        isActive
                          ? "bg-white text-zinc-900 shadow-xs border border-zinc-200/80 font-semibold"
                          : "text-zinc-600 hover:bg-zinc-200/60 hover:text-zinc-900"
                      }`}
                    >
                      {isActive && <Check className="h-3 w-3 text-zinc-900" />}
                      <span>{filter.label}</span>
                      <span
                        className={`rounded-[8px] px-1.5 py-0.5 text-[10px] font-mono transition ${
                          isActive
                            ? "bg-zinc-900 text-white"
                            : "bg-zinc-200 text-zinc-600 group-hover:bg-zinc-300"
                        }`}
                      >
                        {filter.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Search Control */}
              <div className="relative w-full lg:w-72">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Filter scenarios..."
                  className="h-8 w-full rounded-[8px] border border-zinc-200 bg-zinc-50 pl-8 pr-4 text-xs text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-white focus:ring-1 focus:ring-zinc-900"
                />
              </div>
            </div>
          </section>

          {/* Scenarios Table */}
          <section className="overflow-hidden rounded-[8px] border border-zinc-200 bg-white shadow-xs">
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left">
                <thead className="border-b border-zinc-200 bg-zinc-50">
                  <tr>
                    <th className="px-5 py-3 text-[11px] font-semibold uppercase  text-zinc-500">
                      Scenario Name
                    </th>
                    <th className="px-5 py-3 text-[11px] font-semibold uppercase  text-zinc-500">
                      Description
                    </th>
                    <th className="px-5 py-3 text-[11px] font-semibold uppercase  text-zinc-500">
                      Type
                    </th>
                    <th className="px-5 py-3 text-[11px] font-semibold uppercase  text-zinc-500">
                      Status
                    </th>
                    <th className="px-5 py-3 text-[11px] font-semibold uppercase  text-zinc-500">
                      Created
                    </th>
                    <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase  text-zinc-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-zinc-100">
                  {loading ? (
                    <tr>
                      <td colSpan={6}>
                        <div className="flex min-h-[200px] flex-col items-center justify-center py-8">
                          <span className="h-7 w-7 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900" />
                          <p className="mt-3 text-xs font-medium text-zinc-500">
                            Loading scenarios...
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : filteredScenarios.length > 0 ? (
                    filteredScenarios.map((scenario) => (
                      <tr
                        key={scenario._id}
                        onClick={() => handleRowClick(scenario)}
                        className="group cursor-pointer transition hover:bg-zinc-50"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] border border-zinc-200 bg-zinc-50 group-hover:border-zinc-400 group-hover:bg-zinc-100">
                              {getScenarioIcon(scenario)}
                            </div>
                            <div className="min-w-0">
                              <p className=" text-sm font-semibold text-zinc-900 group-hover:text-black">
                                {getScenarioName(scenario)}
                              </p>
                              <p className="mt-0.5 text-[10px] font-heading text-zinc-400">
                                ID: {scenario._id?.slice(-8)}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="max-w-xs px-5 py-4">
                          <p className="truncate text-xs text-zinc-600">
                            {getScenarioDescription(scenario)}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <span className="inline-flex rounded-[8px] border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-[10px] font-medium capitalize text-zinc-800">
                            {scenario.type || "Custom"}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          {scenario.scenarioActive ? (
                            <span className="inline-flex items-center gap-1.5 rounded-[8px] border border-zinc-300 bg-zinc-900 px-2.5 py-1 text-[10px] font-medium text-white">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-[8px] border border-zinc-200 bg-zinc-100 px-2.5 py-1 text-[10px] font-medium text-zinc-600">
                              <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
                              Paused
                            </span>
                          )}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-xs text-zinc-500">
                          {formatDate(scenario.createdAt)}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={(event) =>
                                openDeleteModal(event, scenario)
                              }
                              className="flex h-8 w-8 items-center justify-center rounded-[8px] text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-900"
                              aria-label="Delete scenario"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                            <ChevronRight className="h-4 w-4 text-zinc-300 transition group-hover:translate-x-0.5 group-hover:text-zinc-900" />
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6}>
                        <div className="flex min-h-[220px] flex-col items-center justify-center p-8 text-center">
                          <div className="flex h-12 w-12 items-center justify-center rounded-[8px] bg-zinc-100 text-zinc-800">
                            <Workflow className="h-6 w-6" />
                          </div>
                          <h3 className="mt-3 text-sm font-semibold text-zinc-900">
                            No scenarios found
                          </h3>
                          <p className="mt-1 max-w-sm text-xs text-zinc-500">
                            No scenarios match your search or selected filter.
                          </p>
                          <button
                            type="button"
                            onClick={() => setDropdownOpen(true)}
                            className="mt-4 inline-flex h-8 items-center gap-1.5 rounded-[8px] bg-zinc-900 px-3 text-xs font-medium text-white transition hover:bg-zinc-800"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            Create New Scenario
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="divide-y divide-zinc-100 md:hidden">
              {loading ? (
                <div className="flex min-h-[180px] flex-col items-center justify-center p-6">
                  <span className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900" />
                  <p className="mt-3 text-xs font-medium text-zinc-500">
                    Loading scenarios...
                  </p>
                </div>
              ) : filteredScenarios.length > 0 ? (
                filteredScenarios.map((scenario) => (
                  <button
                    type="button"
                    key={scenario._id}
                    onClick={() => handleRowClick(scenario)}
                    className="w-full p-4 text-left transition hover:bg-zinc-50 active:bg-zinc-100"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] border border-zinc-200 bg-zinc-50">
                        {getScenarioIcon(scenario)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="truncate text-xs font-semibold text-zinc-900">
                            {getScenarioName(scenario)}
                          </h3>
                          <span
                            role="button"
                            tabIndex={0}
                            onClick={(event) =>
                              openDeleteModal(event, scenario)
                            }
                            onKeyDown={(event) => {
                              if (
                                event.key === "Enter" ||
                                event.key === " "
                              ) {
                                openDeleteModal(event, scenario);
                              }
                            }}
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </span>
                        </div>

                        <p className="mt-1 line-clamp-2 text-xs text-zinc-500">
                          {getScenarioDescription(scenario)}
                        </p>

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <span className="rounded-[8px] border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[10px] font-medium capitalize text-zinc-800">
                            {scenario.type || "Custom"}
                          </span>

                          {scenario.scenarioActive ? (
                            <span className="inline-flex items-center gap-1 rounded-[8px] bg-zinc-900 px-2 py-0.5 text-[10px] font-medium text-white">
                              <PlayCircle className="h-3 w-3 text-zinc-300" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-[8px] border border-zinc-200 bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-600">
                              <PauseCircle className="h-3 w-3 text-zinc-400" />
                              Paused
                            </span>
                          )}

                          <span className="text-[10px] text-zinc-400">
                            {formatDate(scenario.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <Workflow className="h-8 w-8 text-zinc-300" />
                  <h3 className="mt-3 text-sm font-semibold text-zinc-900">
                    No scenarios found
                  </h3>
                  <p className="mt-1 text-xs text-zinc-500">
                    Try adjusting your search query or reset filters.
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-[8px] border border-zinc-200 bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-zinc-100 text-zinc-900">
                <Trash2 className="h-5 w-5" />
              </div>
              <button
                type="button"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setSelectedScenario(null);
                }}
                className="flex h-8 w-8 items-center justify-center rounded-[8px] text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <h2 className="mt-4 text-base font-semibold text-zinc-900">
              Delete Scenario?
            </h2>

            <p className="mt-1.5 text-xs leading-relaxed text-zinc-500">
              Are you sure you want to permanently delete{" "}
              <span className="font-semibold text-zinc-900">
                "{selectedScenario ? getScenarioName(selectedScenario) : "this scenario"}"
              </span>
              ? This action cannot be undone.
            </p>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setSelectedScenario(null);
                }}
                className="h-9 rounded-[8px] border border-zinc-200 bg-white px-4 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                className="h-9 rounded-[8px] bg-zinc-900 px-4 text-xs font-semibold text-white transition hover:bg-black shadow-xs"
              >
                Delete Scenario
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Modal */}
      {upgradeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-[8px] border border-zinc-200 bg-white p-6 shadow-xl">
            <button
              type="button"
              onClick={() => setUpgradeModalOpen(false)}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-[8px] text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-zinc-100 text-zinc-900">
              <AlertTriangle className="h-5 w-5" />
            </div>

            <h2 className="mt-4 text-base font-semibold text-zinc-900">
              Scenario Limit Reached
            </h2>

            <p className="mt-1.5 text-xs leading-relaxed text-zinc-500">
              You have reached the free tier limit of{" "}
              <span className="font-semibold text-zinc-900">1 Shopify scenario</span>{" "}
              and{" "}
              <span className="font-semibold text-zinc-900">2 custom scenarios</span>.
            </p>

            <div className="mt-4 rounded-[8px] border border-zinc-200 bg-zinc-50 p-3.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-900">
                <Sparkles className="h-3.5 w-3.5 text-zinc-700" />
                Pro Plan Coming Soon
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-zinc-600">
                Higher limits and advanced workflow automation features will be available with the Pro plan.
              </p>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setUpgradeModalOpen(false)}
                className="h-9 rounded-[8px] bg-zinc-900 px-4 text-xs font-semibold text-white transition hover:bg-black shadow-xs"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </AppLayout>
  );
};

export default AllScenariosPage;
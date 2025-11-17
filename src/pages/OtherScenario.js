// import React, { useEffect, useState, useCallback } from "react";
// import { ArrowLeft, Plus } from "lucide-react";
// import Sidebar from "../component/Sidebar";
// import toast from "react-hot-toast";
// import { useNavigate, useParams } from "react-router-dom";

// import ReactFlow, {
//   ReactFlowProvider,
//   addEdge,
//   Controls,
//   Background,
//   MiniMap,
//   applyNodeChanges,
//   applyEdgeChanges,
// } from "reactflow";

// import "reactflow/dist/style.css";
// import { FiMail, FiGitBranch, FiClock, FiFilter, FiX } from "react-icons/fi"
// import WebhookNode from "../nodes/WebhookNode";
// import RouterNode from "../nodes/RouterNode";
// import GmailNode from "../nodes/GmailNode";
// import DelayNode from "../nodes/DelayNode";
// import OutlookNode from "../nodes/OutlookNode";
// import ConditionNode from "../nodes/conditionNode";

// import EmailModal from "../modals/EmailModal";
// import DelayModal from "../modals/DelayModal";
// import FilterModal from "../modals/FilterModal";
// import ConnectionModal from "../component/ConnectionModal";

// import flowToScenario from "../utils/flowToScenario";
// import OutlookConnectionModal from "../component/OutlookConnectionModal";

// const nodeTypes = {
//   webhookNode: WebhookNode,
//   routerNode: RouterNode,
//   gmailNode: GmailNode,
//   delayNode: DelayNode,
//   outlookNode: OutlookNode,
//   conditionNode: ConditionNode,
// };

// const OthersScenariosPage = () => {
//   const navigate = useNavigate();
//   const { id } = useParams();

//   const [rfNodes, setRfNodes] = useState([]);
//   const [rfEdges, setRfEdges] = useState([]);

//   const [connections, setConnections] = useState([]);
//   const [scenarioName, setScenarioName] = useState("");
//   const [editingNode, setEditingNode] = useState(null);

//   const [showEmailModal, setShowEmailModal] = useState(false);
//   const [showDelayModal, setShowDelayModal] = useState(false);
//   const [showFilterModal, setShowFilterModal] = useState(false);
//   const [showConnectionModal, setShowConnectionModal] = useState(false);

//   const [showModuleModal, setShowModuleModal] = useState(false);
//   const [showBranchButton, setShowBranchButton] = useState(false);

//   const userId = localStorage.getItem("userid");

//   const deleteNode = (nodeId) => {
//     setRfNodes((nds) => nds.filter((n) => n.id !== nodeId));
//     setRfEdges((eds) =>
//       eds.filter((e) => e.source !== nodeId && e.target !== nodeId)
//     );
//   };

//   useEffect(() => {
//     const defaultWebhook = {
//       id: "webhook-1",
//       type: "webhookNode",
//       position: { x: 200, y: 80 },
//       data: {
//         label: "Webhook",
//         config: {},
//         deleteNode: () => deleteNode("webhook-1"),
//       },
//     };

//     setRfNodes([defaultWebhook]);
//   }, []);
//   const [showGmailModal, setShowGmailModal] = useState(false);
//   const [showOutlookModal, setShowOutlookModal] = useState(false);

//  const addModule = (type) => {
//   const nodeId = crypto.randomUUID();

//   const newNode = {
//     id: nodeId,
//     type,
//     position: { x: 200, y: 400 },
//     data: {
//       label: type,
//       config: {},
//       deleteNode: () => deleteNode(nodeId),
//       openConditionModal: () => {
//         setEditingNode(newNode);
//         setShowFilterModal(true);
//       },
//     },
//   };

//   console.log("🟩 MODULE ADDED:", newNode);

//   setRfNodes((prev) => [...prev, newNode]);

//   if (type === "routerNode") setShowBranchButton(true);

//   if (type === "conditionNode") {
//     setEditingNode(newNode);
//     setShowFilterModal(true);
//   }

//   setShowModuleModal(false);
// };
// const rebuildFlowFromScenario = (scenario) => {
//   const nodes = [];
//   const edges = [];

//   // Always add Webhook node
//   nodes.push({
//     id: "webhook-1",
//     type: "webhookNode",
//     position: { x: 200, y: 80 },
//     data: { label: "Webhook", config: {}, deleteNode: () => {} },
//   });

//   const branches = scenario.routerBranches;

//   // CASE 1: NO router, NO filter → simple straight-line modules
//   const hasAnyFilter = branches.some(b => b.filter && b.filter.conditions?.length);

//   if (!hasAnyFilter && branches.length === 1) {
//     let y = 200;
//     let prev = "webhook-1";

//     branches[0].modules.forEach(mod => {
//       const nodeType =
//         mod.type === "Send Email"
//           ? "gmailNode"
//           : mod.type === "Delay"
//           ? "delayNode"
//           : "customEmailNode";

//       nodes.push({
//         id: mod.id,
//         type: nodeType,
//         position: { x: 200, y },
//         data: { label: mod.type, config: mod, deleteNode: () => {} },
//       });

//       edges.push({
//         id: `edge-${prev}-${mod.id}`,
//         source: prev,
//         target: mod.id,
//         type: "smoothstep",
//       });

//       prev = mod.id;
//       y += 160;
//     });

//     setRfNodes(nodes);
//     setRfEdges(edges);
//     return;
//   }

//   // CASE 2: Router scenario
//   let baseY = 200;

//   const routerId = "router-main";
//   nodes.push({
//     id: routerId,
//     type: "routerNode",
//     position: { x: 200, y: baseY },
//     data: { label: "Router", config: {}, deleteNode: () => {} },
//   });

//   edges.push({
//     id: "edge-webhook-router",
//     source: "webhook-1",
//     target: routerId,
//     type: "smoothstep",
//   });

//   let branchIndex = 0;

//   branches.forEach((branch) => {
//     const branchX = 200 + branchIndex * 300;
//     const branchStartId =
//       branch.filter && branch.filter.conditions?.length
//         ? `cond-${branch.id}`
//         : branch.modules[0]?.id;

//     // Add condition node if exists
//     if (branch.filter && branch.filter.conditions?.length) {
//       nodes.push({
//         id: branchStartId,
//         type: "conditionNode",
//         position: { x: branchX, y: baseY + 160 },
//         data: { label: "Condition", config: branch.filter, deleteNode: () => {} },
//       });

//       edges.push({
//         id: `edge-router-${branchStartId}`,
//         source: routerId,
//         target: branchStartId,
//       });
//     } else {
//       edges.push({
//         id: `edge-router-${branchStartId}`,
//         source: routerId,
//         target: branchStartId,
//       });
//     }

//     // Add modules under branch
//     let y = baseY + 300;
//     let prev = branchStartId;

//     branch.modules.forEach((mod) => {
//       const nodeType =
//         mod.type === "Send Email"
//           ? "gmailNode"
//           : mod.type === "Delay"
//           ? "delayNode"
//           : "customEmailNode";

//       nodes.push({
//         id: mod.id,
//         type: nodeType,
//         position: { x: branchX, y },
//         data: { label: mod.type, config: mod, deleteNode: () => {} },
//       });

//       edges.push({
//         id: `edge-${prev}-${mod.id}`,
//         source: prev,
//         target: mod.id,
//       });

//       prev = mod.id;
//       y += 180;
//     });

//     branchIndex++;
//   });

//   setRfNodes(nodes);
//   setRfEdges(edges);
// };

// const loadScenario = async () => {
//   if (!id) return; // Create page, not edit

//   try {
//     const res = await fetch(
//       `https://email-syncing-backend.vercel.app/scenario/detail/${id}`
//     );
//     const data = await res.json();

//     console.log("📥 Loaded Scenario:", data);

//     setScenarioName(data.name || "");

//     // Convert scenario back to RF nodes + edges
//     rebuildFlowFromScenario(data);
//   } catch (err) {
//     console.error("Error loading scenario:", err);
//   }
// };
// useEffect(() => {
//   loadScenario();
// }, [id]);

//   const fetchConnections = async () => {
//     try {
//       const res = await fetch(
//         `https://email-syncing-backend.vercel.app/auth/getConnection/${localStorage.getItem(
//           "userid"
//         )}`
//       );
//       const data = await res.json();
//       setConnections(data);
//     } catch (err) {
//       console.error("Error fetching connections:", err);
//     }
//   };
//   useEffect(() => {
//     fetchConnections();
//   }, []);

//   const addBranch = () => {
//     const id = crypto.randomUUID();

//     const branchNode = {
//       id,
//       type: "routerNode",
//       position: { x: 450, y: 400 },
//       data: {
//         label: "Branch",
//         deleteNode: () => deleteNode(id),
//       },
//     };

//     setRfNodes((prev) => [...prev, branchNode]);
//   };

//   const onConnect = useCallback(
//     (params) => setRfEdges((eds) => addEdge(params, eds)),
//     []
//   );

//   const handleNodeClick = (event, node) => {
//   console.log("🟦 MODULE CLICKED:", node);

//   setEditingNode(node);

//   if (node.type === "gmailNode" || node.type === "outlookNode") {
//     setShowEmailModal(true);
//   } else if (node.type === "delayNode") {
//     setShowDelayModal(true);
//   } else if (node.type === "conditionNode") {
//     setShowFilterModal(true);
//   }
// };

//   const saveScenario = async () => {
//   const scenario = flowToScenario(rfNodes, rfEdges);

//   console.log("🟥 FINAL NODES:", rfNodes);
//   console.log("🟥 FINAL EDGES:", rfEdges);
//   console.log("🟥 FINAL SCENARIO (routerBranches):", scenario);
//     const payload = {
//       userId,
//       name: scenarioName,
//       description: "",
//       type: "other",
//       routerBranches: scenario,
//     };

//     const url = id
//       ? `https://email-syncing-backend.vercel.app/scenario/detail/${id}`
//       : `https://email-syncing-backend.vercel.app/scenario`;

//     await fetch(url, {
//       method: id ? "PUT" : "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(payload),
//     });

//     toast.success("Scenario saved!");
//     navigate("/scenarios/all");
//   };

//   return (
//     <ReactFlowProvider>
//       <div className="flex">
//         <div className="w-64 min-h-screen bg-gray-100">
//           <Sidebar />
//         </div>

//         <div className="flex-1 min-h-screen bg-gray-50">
//           <div className="border-b bg-white shadow-sm">
//             <div className="p-3 flex items-center justify-between">
//               <div className="w-2/3">
//                 <h1 className="text-xl font-medium mb-2">
//                   {id ? "Edit Scenario" : "Create Scenario"}
//                 </h1>
//                 <input
//                   value={scenarioName}
//                   onChange={(e) => setScenarioName(e.target.value)}
//                   placeholder="Enter scenario name"
//                   className="px-4 py-2 border rounded-md w-full"
//                 />
//               </div>

//               <div className="flex gap-2">
//                 <button
//                   onClick={() => navigate(-1)}
//                   className="px-4 py-2 border rounded-md"
//                 >
//                   <ArrowLeft className="inline mr-2" /> Back
//                 </button>

//                 <button
//                   onClick={saveScenario}
//                   className="px-4 py-2 bg-green-600 text-white rounded-md"
//                 >
//                   Save
//                 </button>
//               </div>
//             </div>
//           </div>

//           <div className="h-[calc(100vh-120px)]">
//             <div className="flex justify-end pr-6 mt-4">
//               <button
//                 onClick={() => setShowModuleModal(true)}
//                 className="px-4 py-2 bg-blue-600 text-white rounded-full shadow-md hover:bg-blue-700 transition"
//               >
//                 <Plus className="inline mr-1" size={18} /> Add Module
//               </button>
//             </div>

//             <ReactFlow
//               nodes={rfNodes}
//               edges={rfEdges}
//               nodeTypes={nodeTypes}
//               onNodesChange={(chg) =>
//                 setRfNodes((nds) => applyNodeChanges(chg, nds))
//               }
//               onEdgesChange={(chg) =>
//                 setRfEdges((eds) => applyEdgeChanges(chg, eds))
//               }
//               onConnect={onConnect}
//               onNodeClick={handleNodeClick}
//               fitView
//             >
//               <Controls />
//               <MiniMap />
//               <Background gap={16} />
//             </ReactFlow>
//           </div>

//           {/* {showModuleModal && (
//             <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
//               <div className="bg-white p-6 rounded-lg w-80 space-y-4">
//                 <h2 className="text-lg font-semibold">Select Module</h2>

//                 <button
//                   className="w-full p-3 border rounded"
//                   onClick={() => addModule("gmailNode")}
//                 >
//                   Email
//                 </button>

//                 <button
//                   className="w-full p-3 border rounded"
//                   onClick={() => addModule("routerNode")}
//                 >
//                   Router
//                 </button>

//                 <button
//                   className="w-full p-3 border rounded"
//                   onClick={() => addModule("delayNode")}
//                 >
//                   Delay
//                 </button>

//                 <button
//                   className="w-full p-3 border rounded"
//                   onClick={() => addModule("conditionNode")}
//                 >
//                   Condition
//                 </button>

//                 <button
//                   className="w-full p-3 mt-4 bg-gray-200 rounded"
//                   onClick={() => setShowModuleModal(false)}
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </div>
//           )} */}

// {showModuleModal && (
//   <div className="fixed inset-0 backdrop-blur-sm bg-black/40 flex justify-center items-center animate-fadeIn">
//     <div className="bg-white/90 p-6 rounded-2xl shadow-xl w-80 space-y-6 border border-white/30 animate-scaleIn">

//       {/* Title */}
//       <div className="flex justify-between items-center">
//         <h2 className="text-xl font-semibold text-gray-800">Select Module</h2>
//         <button
//           onClick={() => setShowModuleModal(false)}
//           className="text-gray-600 hover:text-red-500 transition"
//         >
//           <FiX size={22} />
//         </button>
//       </div>

//       {/* Options */}
//       <div className="space-y-3">

//         <button
//           className="w-full p-3 border rounded-xl bg-gray-50 hover:bg-blue-100 hover:border-blue-400
//           transition-all flex items-center gap-3"
//           onClick={() => addModule("gmailNode")}
//         >
//           <FiMail size={20} className="text-blue-500" /> Email
//         </button>

//         <button
//           className="w-full p-3 border rounded-xl bg-gray-50 hover:bg-purple-100 hover:border-purple-400
//           transition-all flex items-center gap-3"
//           onClick={() => addModule("routerNode")}
//         >
//           <FiGitBranch size={20} className="text-purple-500" /> Router
//         </button>

//         <button
//           className="w-full p-3 border rounded-xl bg-gray-50 hover:bg-yellow-100 hover:border-yellow-400
//           transition-all flex items-center gap-3"
//           onClick={() => addModule("delayNode")}
//         >
//           <FiClock size={20} className="text-yellow-500" /> Delay
//         </button>

//         <button
//           className="w-full p-3 border rounded-xl bg-gray-50 hover:bg-green-100 hover:border-green-400
//           transition-all flex items-center gap-3"
//           onClick={() => addModule("conditionNode")}
//         >
//           <FiFilter size={20} className="text-green-500" /> Condition
//         </button>
//       </div>

//       {/* Cancel Button */}
//       <button
//         className="w-full p-3 bg-gray-200 rounded-xl hover:bg-gray-300 transition-all"
//         onClick={() => setShowModuleModal(false)}
//       >
//         Cancel
//       </button>

//     </div>
//   </div>
// )}

//           {showEmailModal && (
//             <EmailModal
//               node={editingNode}
//               connections={connections}
//               onClose={() => setShowEmailModal(false)}
//               openGmailModal={() => setShowGmailModal(true)}
//               openOutlookModal={() => setShowOutlookModal(true)}
//            onSave={(data) => {
//   console.log("🟧 MODULE CONFIG SAVED:", {
//     nodeId: editingNode.id,
//     type: editingNode.type,
//     savedConfig: data
//   });

//   setRfNodes((prev) =>
//     prev.map((n) =>
//       n.id === editingNode.id
//         ? { ...n, data: { ...n.data, config: data } }
//         : n
//     )
//   );

//   setShowEmailModal(false);
// }}

//             />
//           )}

//           {showDelayModal && (
//             <DelayModal
//               node={editingNode}
//               onClose={() => setShowDelayModal(false)}
//               onSave={(data) => {
//                 setRfNodes((prev) =>
//                   prev.map((n) =>
//                     n.id === editingNode.id
//                       ? { ...n, data: { ...n.data, config: data } }
//                       : n
//                   )
//                 );
//                 setShowDelayModal(false);
//               }}
//             />
//           )}

//           {showFilterModal && (
//             <FilterModal
//               node={editingNode}
//               onClose={() => setShowFilterModal(false)}
//               onSave={(data) => {
//                 setRfNodes((prev) =>
//                   prev.map((n) =>
//                     n.id === editingNode.id
//                       ? { ...n, data: { ...n.data, config: data } }
//                       : n
//                   )
//                 );
//                 setShowFilterModal(false);
//               }}
//             />
//           )}

//           <ConnectionModal
//             isOpen={showGmailModal}
//             onClose={() => setShowGmailModal(false)}
//             onSuccess={() => {
//               fetchConnections();
//               setShowGmailModal(false);
//             }}
//           />

//           <OutlookConnectionModal
//             isOpen={showOutlookModal}
//             onClose={() => setShowOutlookModal(false)}
//             onSuccess={() => {
//               fetchConnections();
//               setShowOutlookModal(false);
//             }}
//           />
//         </div>
//       </div>
//     </ReactFlowProvider>
//   );
// };

// export default OthersScenariosPage;
import React, { useEffect, useState, useCallback } from "react";
import { ArrowLeft, Plus } from "lucide-react";
import Sidebar from "../component/Sidebar";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";

import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  Controls,
  Background,
  MiniMap,
  applyNodeChanges,
  applyEdgeChanges,
} from "reactflow";

import "reactflow/dist/style.css";
import { FiMail, FiGitBranch, FiClock, FiFilter, FiX } from "react-icons/fi";
import WebhookNode from "../nodes/WebhookNode";
import RouterNode from "../nodes/RouterNode";
import GmailNode from "../nodes/GmailNode";
import DelayNode from "../nodes/DelayNode";
import OutlookNode from "../nodes/OutlookNode";
import ConditionNode from "../nodes/conditionNode";

import EmailModal from "../modals/EmailModal";
import DelayModal from "../modals/DelayModal";
import FilterModal from "../modals/FilterModal";
import ConnectionModal from "../component/ConnectionModal";

import flowToScenario from "../utils/flowToScenario";
import OutlookConnectionModal from "../component/OutlookConnectionModal";

const nodeTypes = {
  webhookNode: WebhookNode,
  routerNode: RouterNode,
  gmailNode: GmailNode,
  delayNode: DelayNode,
  outlookNode: OutlookNode,
  conditionNode: ConditionNode,
};

const OthersScenariosPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [rfNodes, setRfNodes] = useState([]);
  const [rfEdges, setRfEdges] = useState([]);

  const [connections, setConnections] = useState([]);
  const [scenarioName, setScenarioName] = useState("");
  const [editingNode, setEditingNode] = useState(null);

  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showDelayModal, setShowDelayModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showConnectionModal, setShowConnectionModal] = useState(false);

  const [showModuleModal, setShowModuleModal] = useState(false);
  const [showBranchButton, setShowBranchButton] = useState(false);

  const userId = localStorage.getItem("userid");

  const deleteNode = (nodeId) => {
    setRfNodes((nds) => nds.filter((n) => n.id !== nodeId));
    setRfEdges((eds) =>
      eds.filter((e) => e.source !== nodeId && e.target !== nodeId)
    );
  };

  useEffect(() => {
    const defaultWebhook = {
      id: "webhook-1",
      type: "webhookNode",
      position: { x: 200, y: 80 },
      data: {
        id: "webhook-1",
        label: "Webhook",
        config: {},
        deleteNode: () => deleteNode("webhook-1"),

        openModuleModal: () => {
          setEditingNode("webhook-1");
          setShowModuleModal(true);
        },
      },
    };

    setRfNodes([defaultWebhook]);
  }, []);

  const [showGmailModal, setShowGmailModal] = useState(false);
  const [showOutlookModal, setShowOutlookModal] = useState(false);

  const addModule = (type) => {
    const parentId = editingNode; 
    const nodeId = crypto.randomUUID();

    const parentNode = rfNodes.find((n) => n.id === parentId);

    if (parentNode && parentNode.type !== "routerNode") {
      const childExists = rfEdges.some((e) => e.source === parentId);

      if (childExists) {
        toast.error("This module already has an output.");
        return;
      }
    }

    const newNode = {
      id: nodeId,
      type,
      position: {
        x: parentNode ? parentNode.position.x : 200,
        y: parentNode ? parentNode.position.y + 180 : 400,
      },
      data: {
        id: nodeId,
        label: type,
        config: {},
        deleteNode: () => deleteNode(nodeId),

        openModuleModal: (id) => {
          setEditingNode(id);
          setShowModuleModal(true);
        },

        openConditionModal: () => {
          setEditingNode(newNode);
          setShowFilterModal(true);
        },
      },
    };

    setRfNodes((prev) => [...prev, newNode]);

    // 3) Auto-connect
    if (parentId) {
      setRfEdges((prev) => [
        ...prev,
        {
          id: `edge-${parentId}-${nodeId}`,
          source: parentId,
          target: nodeId,
          type: "smoothstep",
        },
      ]);
    }

    // 4) Special cases
    if (type === "conditionNode") {
      setEditingNode(newNode);
      setShowFilterModal(true);
    }

    // Close modal
    setShowModuleModal(false);
  };

  const rebuildFlowFromScenario = (scenario) => {
    const nodes = [];
    const edges = [];

    // Always add Webhook node
    nodes.push({
      id: "webhook-1",
      type: "webhookNode",
      position: { x: 200, y: 80 },
      data: { label: "Webhook", config: {}, deleteNode: () => {} },
    });

    const branches = scenario.routerBranches;

    // CASE 1: NO router, NO filter → simple straight-line modules
    const hasAnyFilter = branches.some(
      (b) => b.filter && b.filter.conditions?.length
    );

    if (!hasAnyFilter && branches.length === 1) {
      let y = 200;
      let prev = "webhook-1";

      branches[0].modules.forEach((mod) => {
        const nodeType =
          mod.type === "Send Email"
            ? "gmailNode"
            : mod.type === "Delay"
            ? "delayNode"
            : "customEmailNode";

        nodes.push({
          id: mod.id,
          type: nodeType,
          position: { x: 200, y },
          data: { label: mod.type, config: mod, deleteNode: () => {} },
        });

        edges.push({
          id: `edge-${prev}-${mod.id}`,
          source: prev,
          target: mod.id,
          type: "smoothstep",
        });

        prev = mod.id;
        y += 160;
      });

      setRfNodes(nodes);
      setRfEdges(edges);
      return;
    }

    // CASE 2: Router scenario
    let baseY = 200;

    const routerId = "router-main";
    nodes.push({
      id: routerId,
      type: "routerNode",
      position: { x: 200, y: baseY },
      data: { label: "Router", config: {}, deleteNode: () => {} },
    });

    edges.push({
      id: "edge-webhook-router",
      source: "webhook-1",
      target: routerId,
      type: "smoothstep",
    });

    let branchIndex = 0;

    branches.forEach((branch) => {
      const branchX = 200 + branchIndex * 300;
      const branchStartId =
        branch.filter && branch.filter.conditions?.length
          ? `cond-${branch.id}`
          : branch.modules[0]?.id;

      // Add condition node if exists
      if (branch.filter && branch.filter.conditions?.length) {
        nodes.push({
          id: branchStartId,
          type: "conditionNode",
          position: { x: branchX, y: baseY + 160 },
          data: {
            label: "Condition",
            config: branch.filter,
            deleteNode: () => {},
          },
        });

        edges.push({
          id: `edge-router-${branchStartId}`,
          source: routerId,
          target: branchStartId,
        });
      } else {
        edges.push({
          id: `edge-router-${branchStartId}`,
          source: routerId,
          target: branchStartId,
        });
      }

      // Add modules under branch
      let y = baseY + 300;
      let prev = branchStartId;

      branch.modules.forEach((mod) => {
        const nodeType =
          mod.type === "Send Email"
            ? "gmailNode"
            : mod.type === "Delay"
            ? "delayNode"
            : "customEmailNode";

        nodes.push({
          id: mod.id,
          type: nodeType,
          position: { x: branchX, y },
          data: { label: mod.type, config: mod, deleteNode: () => {} },
        });

        edges.push({
          id: `edge-${prev}-${mod.id}`,
          source: prev,
          target: mod.id,
        });

        prev = mod.id;
        y += 180;
      });

      branchIndex++;
    });

    setRfNodes(nodes);
    setRfEdges(edges);
  };

  const loadScenario = async () => {
    if (!id) return; // Create page, not edit

    try {
      const res = await fetch(
        `https://email-syncing-backend.vercel.app/scenario/detail/${id}`
      );
      const data = await res.json();

      console.log("📥 Loaded Scenario:", data);

      setScenarioName(data.name || "");

      // Convert scenario back to RF nodes + edges
      rebuildFlowFromScenario(data);
    } catch (err) {
      console.error("Error loading scenario:", err);
    }
  };
  useEffect(() => {
    loadScenario();
  }, [id]);

  const fetchConnections = async () => {
    try {
      const res = await fetch(
        `https://email-syncing-backend.vercel.app/auth/getConnection/${localStorage.getItem(
          "userid"
        )}`
      );
      const data = await res.json();
      setConnections(data);
    } catch (err) {
      console.error("Error fetching connections:", err);
    }
  };
  useEffect(() => {
    fetchConnections();
  }, []);

  const addBranch = () => {
    const id = crypto.randomUUID();

    const branchNode = {
      id,
      type: "routerNode",
      position: { x: 450, y: 400 },
      data: {
        label: "Branch",
        deleteNode: () => deleteNode(id),
      },
    };

    setRfNodes((prev) => [...prev, branchNode]);
  };

  const onConnect = useCallback(
    (params) => setRfEdges((eds) => addEdge(params, eds)),
    []
  );

  const handleNodeClick = (event, node) => {
    console.log("🟦 MODULE CLICKED:", node);

    setEditingNode(node);

    if (node.type === "gmailNode" || node.type === "outlookNode") {
      setShowEmailModal(true);
    } else if (node.type === "delayNode") {
      setShowDelayModal(true);
    } else if (node.type === "conditionNode") {
      setShowFilterModal(true);
    }
  };

  const saveScenario = async () => {
    const scenario = flowToScenario(rfNodes, rfEdges);

    console.log("🟥 FINAL NODES:", rfNodes);
    console.log("🟥 FINAL EDGES:", rfEdges);
    console.log("🟥 FINAL SCENARIO (routerBranches):", scenario);
    const payload = {
      userId,
      name: scenarioName,
      description: "",
      type: "other",
      routerBranches: scenario,
    };

    const url = id
      ? `https://email-syncing-backend.vercel.app/scenario/detail/${id}`
      : `https://email-syncing-backend.vercel.app/scenario`;

    await fetch(url, {
      method: id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    toast.success("Scenario saved!");
    navigate("/scenarios/all");
  };

  return (
    <ReactFlowProvider>
      <div className="flex">
        <div className="w-64 min-h-screen bg-gray-100">
          <Sidebar />
        </div>

        <div className="flex-1 min-h-screen bg-gray-50">
         <div className="border-b bg-gradient-to-r from-white via-gray-50 to-gray-100 shadow-sm">
  <div className="p-4 flex items-center justify-between">
    
    {/* Left Section */}
    <div className="w-2/3">
      <h1 className="text-2xl font-semibold text-gray-800 tracking-tight mb-2">
        {id ? "Edit Scenario" : "Create Scenario"}
      </h1>

      <input
        value={scenarioName}
        onChange={(e) => setScenarioName(e.target.value)}
        placeholder="Enter scenario name"
        className="px-4 py-2 border rounded-lg w-full bg-white shadow-sm
                   focus:outline-none focus:ring-2 focus:ring-indigo-500
                   transition"
      />
    </div>

    {/* Action Buttons */}
    <div className="flex items-center gap-3">
      
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="px-4 py-2 rounded-lg flex items-center gap-2
                   border border-gray-300
                   bg-white text-gray-700
                   hover:bg-gray-100 hover:text-indigo-600
                   shadow-sm transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      {/* Save Button */}
      <button
        onClick={saveScenario}
        className="px-5 py-2 rounded-lg flex items-center gap-2
                   bg-indigo-600 text-white font-medium
                   hover:bg-indigo-700 shadow-md transition"
      >
        Save
      </button>

    </div>
  </div>
</div>


          <div className="h-[calc(100vh-120px)]">
            {/* <div className="flex justify-end pr-6 mt-4">
              <button
                onClick={() => setShowModuleModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-full shadow-md hover:bg-blue-700 transition"
              >
                <Plus className="inline mr-1" size={18} /> Add Module
              </button>
            </div> */}

            <ReactFlow
              nodes={rfNodes}
              edges={rfEdges}
              nodeTypes={nodeTypes}
              onNodesChange={(chg) =>
                setRfNodes((nds) => applyNodeChanges(chg, nds))
              }
              onEdgesChange={(chg) =>
                setRfEdges((eds) => applyEdgeChanges(chg, eds))
              }
              onConnect={onConnect}
              onNodeClick={handleNodeClick}
              fitView
            >
              <Controls />
              <MiniMap />
              <Background gap={16} />
            </ReactFlow>
          </div>

          {/* {showModuleModal && (
            <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
              <div className="bg-white p-6 rounded-lg w-80 space-y-4">
                <h2 className="text-lg font-semibold">Select Module</h2>

                <button
                  className="w-full p-3 border rounded"
                  onClick={() => addModule("gmailNode")}
                >
                  Email
                </button>

                <button
                  className="w-full p-3 border rounded"
                  onClick={() => addModule("routerNode")}
                >
                  Router
                </button>

                <button
                  className="w-full p-3 border rounded"
                  onClick={() => addModule("delayNode")}
                >
                  Delay
                </button>

                <button
                  className="w-full p-3 border rounded"
                  onClick={() => addModule("conditionNode")}
                >
                  Condition
                </button>

                <button
                  className="w-full p-3 mt-4 bg-gray-200 rounded"
                  onClick={() => setShowModuleModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )} */}

          {showModuleModal && (
            <div className="fixed inset-0 backdrop-blur-sm bg-black/40 flex justify-center items-center animate-fadeIn">
              <div className="bg-white/90 p-6 rounded-2xl shadow-xl w-80 space-y-6 border border-white/30 animate-scaleIn">
                {/* Title */}
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Select Module
                  </h2>
                  <button
                    onClick={() => setShowModuleModal(false)}
                    className="text-gray-600 hover:text-red-500 transition"
                  >
                    <FiX size={22} />
                  </button>
                </div>

                {/* Options */}
                <div className="space-y-3">
                  <button
                    className="w-full p-3 border rounded-xl bg-gray-50 hover:bg-blue-100 hover:border-blue-400 
          transition-all flex items-center gap-3"
                    onClick={() => addModule("gmailNode")}
                  >
                    <FiMail size={20} className="text-blue-500" /> Email
                  </button>

                  <button
                    className="w-full p-3 border rounded-xl bg-gray-50 hover:bg-purple-100 hover:border-purple-400 
          transition-all flex items-center gap-3"
                    onClick={() => addModule("routerNode")}
                  >
                    <FiGitBranch size={20} className="text-purple-500" /> Router
                  </button>

                  <button
                    className="w-full p-3 border rounded-xl bg-gray-50 hover:bg-yellow-100 hover:border-yellow-400 
          transition-all flex items-center gap-3"
                    onClick={() => addModule("delayNode")}
                  >
                    <FiClock size={20} className="text-yellow-500" /> Delay
                  </button>

                  <button
                    className="w-full p-3 border rounded-xl bg-gray-50 hover:bg-green-100 hover:border-green-400 
          transition-all flex items-center gap-3"
                    onClick={() => addModule("conditionNode")}
                  >
                    <FiFilter size={20} className="text-green-500" /> Condition
                  </button>
                </div>

                {/* Cancel Button */}
                <button
                  className="w-full p-3 bg-gray-200 rounded-xl hover:bg-gray-300 transition-all"
                  onClick={() => setShowModuleModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {showEmailModal && (
            <EmailModal
              node={editingNode}
              connections={connections}
              onClose={() => setShowEmailModal(false)}
              openGmailModal={() => setShowGmailModal(true)}
              openOutlookModal={() => setShowOutlookModal(true)}
              onSave={(data) => {
                console.log("🟧 MODULE CONFIG SAVED:", {
                  nodeId: editingNode.id,
                  type: editingNode.type,
                  savedConfig: data,
                });

                setRfNodes((prev) =>
                  prev.map((n) =>
                    n.id === editingNode.id
                      ? { ...n, data: { ...n.data, config: data } }
                      : n
                  )
                );

                setShowEmailModal(false);
              }}
            />
          )}

          {showDelayModal && (
            <DelayModal
              node={editingNode}
              onClose={() => setShowDelayModal(false)}
              onSave={(data) => {
                setRfNodes((prev) =>
                  prev.map((n) =>
                    n.id === editingNode.id
                      ? { ...n, data: { ...n.data, config: data } }
                      : n
                  )
                );
                setShowDelayModal(false);
              }}
            />
          )}

          {showFilterModal && (
            <FilterModal
              node={editingNode}
              onClose={() => setShowFilterModal(false)}
              onSave={(data) => {
                setRfNodes((prev) =>
                  prev.map((n) =>
                    n.id === editingNode.id
                      ? { ...n, data: { ...n.data, config: data } }
                      : n
                  )
                );
                setShowFilterModal(false);
              }}
            />
          )}

          <ConnectionModal
            isOpen={showGmailModal}
            onClose={() => setShowGmailModal(false)}
            onSuccess={() => {
              fetchConnections();
              setShowGmailModal(false);
            }}
          />

          <OutlookConnectionModal
            isOpen={showOutlookModal}
            onClose={() => setShowOutlookModal(false)}
            onSuccess={() => {
              fetchConnections();
              setShowOutlookModal(false);
            }}
          />
        </div>
      </div>
    </ReactFlowProvider>
  );
};

export default OthersScenariosPage;

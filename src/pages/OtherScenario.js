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

// import WebhookNode from "../nodes/WebhookNode";
// import RouterNode from "../nodes/RouterNode";
// import GmailNode from "../nodes/GmailNode";
// import DelayNode from "../nodes/DelayNode";
// import OutlookNode from "../nodes/OutlookNode";

// import EmailModal from "../modals/EmailModal";
// import DelayModal from "../modals/DelayModal";
// import FilterModal from "../modals/FilterModal";
// import ConnectionModal from "../component/ConnectionModal";

// import scenarioToFlow from "../utils/scenarioToFlow";
// import flowToScenario from "../utils/flowToScenario";

// const nodeTypes = {
//   webhookNode: WebhookNode,
//   routerNode: RouterNode,
//   gmailNode: GmailNode,
//   delayNode: DelayNode,
//   outlookNode: OutlookNode,
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

//   const userId = localStorage.getItem("userid");

//   // fetch connections
//   useEffect(() => {
//     const load = async () => {
//       const res = await fetch(
//         `https://email-syncing-backend.vercel.app/auth/getConnection/${userId}`
//       );

//       const data = await res.json();
//       setConnections(data);
//     };
//     load();
//   }, []);

//   // load scenario in edit mode
//   useEffect(() => {
//     if (!id) return;

//     const loadScenario = async () => {
//       const res = await fetch(
//         `https://email-syncing-backend.vercel.app/scenario/detail/${id}`
//       );
//       const data = await res.json();

//       const { nodes, edges } = scenarioToFlow(data);
//       setRfNodes(nodes);
//       setRfEdges(edges);

//       setScenarioName(data.name || "");
//     };

//     loadScenario();
//   }, [id]);

//   // Add modules by dragging or clicking
//   const handleAddNode = (type) => {
//     const newNode = {
//       id: crypto.randomUUID(),
//       type,
//       position: { x: 200, y: 200 },
//       data: { label: type, config: {} },
//     };

//     setRfNodes((nds) => [...nds, newNode]);
//   };

//   const onConnect = useCallback(
//     (params) => setRfEdges((eds) => addEdge(params, eds)),
//     []
//   );

//   const handleNodeClick = (event, node) => {
//     setEditingNode(node);

//     if (node.type === "gmailNode" || node.type === "outlookNode") {
//       setShowEmailModal(true);
//     } else if (node.type === "delayNode") {
//       setShowDelayModal(true);
//     } else if (node.type === "routerNode") {
//       setShowFilterModal(true);
//     }
//   };

//   const saveScenario = async () => {
//     const scenario = flowToScenario(rfNodes, rfEdges);

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
//           {/* HEADER */}
//           <div className="border-b bg-white shadow-sm">
//             <div className="p-6 flex items-center justify-between">
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

//           {/* CANVAS */}
//           <div className="h-[calc(100vh-120px)]">
//             <ReactFlow
//               nodes={rfNodes}
//               edges={rfEdges}
//               nodeTypes={nodeTypes}
//         onNodesChange={(changes) =>
//   setRfNodes((nds) => applyNodeChanges(changes, nds))
// }

// onEdgesChange={(changes) =>
//   setRfEdges((eds) => applyEdgeChanges(changes, eds))
// }
//               onConnect={onConnect}
//               onNodeClick={handleNodeClick}
//               fitView
//             >
//               <Controls />
//               <MiniMap />
//               <Background gap={16} />
//             </ReactFlow>
//           </div>

//           {/* Floating Add Buttons */}
//           <div className="fixed bottom-6 right-6 space-y-3">
//             <button
//               onClick={() => handleAddNode("gmailNode")}
//               className="px-4 py-2 bg-red-500 text-white rounded-full shadow-lg flex gap-2"
//             >
//               <Plus /> Gmail
//             </button>

//             <button
//               onClick={() => handleAddNode("routerNode")}
//               className="px-4 py-2 bg-green-500 text-white rounded-full shadow-lg flex gap=2"
//             >
//               <Plus /> Router
//             </button>

//             <button
//               onClick={() => handleAddNode("delayNode")}
//               className="px-4 py-2 bg-blue-500 text-white rounded-full shadow-lg flex gap=2"
//             >
//               <Plus /> Delay
//             </button>
//           </div>

//           {/* MODALS */}
//           {showEmailModal && (
//             <EmailModal
//               node={editingNode}
//               connections={connections}
//               onClose={() => setShowEmailModal(false)}
//               onSave={(data) => {
//                 setRfNodes((prev) =>
//                   prev.map((n) =>
//                     n.id === editingNode.id
//                       ? { ...n, data: { ...n.data, config: data } }
//                       : n
//                   )
//                 );
//                 setShowEmailModal(false);
//               }}
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
//             isOpen={showConnectionModal}
//             onClose={() => setShowConnectionModal(false)}
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

import WebhookNode from "../nodes/WebhookNode";
import RouterNode from "../nodes/RouterNode";
import GmailNode from "../nodes/GmailNode";
import DelayNode from "../nodes/DelayNode";
import OutlookNode from "../nodes/OutlookNode";

import EmailModal from "../modals/EmailModal";
import DelayModal from "../modals/DelayModal";
import FilterModal from "../modals/FilterModal";
import ConnectionModal from "../component/ConnectionModal";

import scenarioToFlow from "../utils/scenarioToFlow";
import flowToScenario from "../utils/flowToScenario";

/* ------------------- NODE TYPES ------------------- */
const nodeTypes = {
  webhookNode: WebhookNode,
  routerNode: RouterNode,
  gmailNode: GmailNode,
  delayNode: DelayNode,
  outlookNode: OutlookNode,

};

const OthersScenariosPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [rfNodes, setRfNodes] = useState([]);
  const [rfEdges, setRfEdges] = useState([]);

  const [connections, setConnections] = useState([]);
  const [scenarioName, setScenarioName] = useState("");

  const [editingNode, setEditingNode] = useState(null);

  // Modals
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showDelayModal, setShowDelayModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showConnectionModal, setShowConnectionModal] = useState(false);

  const [showModuleModal, setShowModuleModal] = useState(false);
  const [showBranchButton, setShowBranchButton] = useState(false);

  const userId = localStorage.getItem("userid");

  /* ------------------- DEFAULT WEBHOOK NODE ON LOAD ------------------- */
  useEffect(() => {
    const defaultWebhook = {
      id: "webhook-1",
      type: "webhookNode",
      position: { x: 200, y: 80 },
      data: { label: "Webhook", config: {} },
    };

   setRfNodes([defaultWebhook]);

  }, []);

  /* ------------------- Add Module Function ------------------- */
  const addModule = (type) => {
    const newNode = {
      id: crypto.randomUUID(),
      type,
      position: { x: 200, y: 400 },
      data: { label: type },
    };

    setRfNodes((prev) => [...prev, newNode]);

    // If router → show Add Branch button
    if (type === "routerNode") {
      setShowBranchButton(true);
    }

    setShowModuleModal(false);
  };

  /* ------------------- ADD BRANCH ------------------- */
  const addBranch = () => {
    const branchNode = {
      id: crypto.randomUUID(),
      type: "routerNode",
      position: { x: 450, y: 400 },
      data: { label: "Branch" },
    };

    setRfNodes((prev) => [...prev, branchNode]);
  };

  /* ------------------- REACT FLOW EVENTS ------------------- */
  const onConnect = useCallback(
    (params) => setRfEdges((eds) => addEdge(params, eds)),
    []
  );

  const handleNodeClick = (event, node) => {
    setEditingNode(node);

    if (node.type === "gmailNode" || node.type === "outlookNode") {
      setShowEmailModal(true);
    } else if (node.type === "delayNode") {
      setShowDelayModal(true);
    } else if (node.type === "routerNode") {
      setShowFilterModal(true);
    }
  };

  /* ------------------- SAVE SCENARIO ------------------- */
  const saveScenario = async () => {
    const scenario = flowToScenario(rfNodes, rfEdges);

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

  /* ------------------- RETURN UI ------------------- */
  return (
    <ReactFlowProvider>
      <div className="flex">
        {/* Left Sidebar */}
        <div className="w-64 min-h-screen bg-gray-100">
          <Sidebar />
        </div>

        {/* Main Editor */}
        <div className="flex-1 min-h-screen bg-gray-50">
          {/* Header */}
          <div className="border-b bg-white shadow-sm">
            <div className="p-6 flex items-center justify-between">
              <div className="w-2/3">
                <h1 className="text-xl font-medium mb-2">
                  {id ? "Edit Scenario" : "Create Scenario"}
                </h1>
                <input
                  value={scenarioName}
                  onChange={(e) => setScenarioName(e.target.value)}
                  placeholder="Enter scenario name"
                  className="px-4 py-2 border rounded-md w-full"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => navigate(-1)}
                  className="px-4 py-2 border rounded-md"
                >
                  <ArrowLeft className="inline mr-2" /> Back
                </button>

                <button
                  onClick={saveScenario}
                  className="px-4 py-2 bg-green-600 text-white rounded-md"
                >
                  Save
                </button>
              </div>
            </div>
          </div>

          {/* Canvas */}
          <div className="h-[calc(100vh-120px)]">
            {/* Top Right Add Module Button */}
<div className="flex justify-end pr-6 mt-4">
  <button
    onClick={() => setShowModuleModal(true)}
    className="px-4 py-2 bg-blue-600 text-white rounded-full shadow-md hover:bg-blue-700 transition"
  >
    <Plus className="inline mr-1" size={18} /> Add Module
  </button>
</div>

            <ReactFlow
              nodes={rfNodes}
              edges={rfEdges}
              nodeTypes={nodeTypes}
              onNodesChange={(changes) =>
                setRfNodes((nds) => applyNodeChanges(changes, nds))
              }
              onEdgesChange={(changes) =>
                setRfEdges((eds) => applyEdgeChanges(changes, eds))
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

          {/* ADD BRANCH BUTTON */}
          {showBranchButton && (
            <button
              onClick={addBranch}
              className="fixed bottom-8 left-72 px-4 py-2 bg-purple-600 text-white rounded-full shadow-lg"
            >
              + Add Branch
            </button>
          )}

          {/* MODULE SELECTION MODAL */}
          {showModuleModal && (
            <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
              <div className="bg-white p-6 rounded-lg w-80 space-y-4">
                <h2 className="text-lg font-semibold">Select Module</h2>

                <button
                  className="w-full p-3 border rounded"
                  onClick={() => addModule("gmailNode")}
                >
                  Gmail
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
                  className="w-full p-3 mt-4 bg-gray-200 rounded"
                  onClick={() => setShowModuleModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* EXISTING MODALS */}
          {showEmailModal && (
            <EmailModal
              node={editingNode}
              connections={connections}
              onClose={() => setShowEmailModal(false)}
              onSave={(data) => {
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
            isOpen={showConnectionModal}
            onClose={() => setShowConnectionModal(false)}
          />
        </div>
      </div>
    </ReactFlowProvider>
  );
};

export default OthersScenariosPage;

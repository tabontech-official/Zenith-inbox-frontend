import React, { useEffect, useState, useCallback } from "react";
import { ArrowLeft, Plus, Redo, Undo } from "lucide-react";
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
import WebhookModal from "../component/WebhookModal";
import { useContext } from "react";
import { UserContext } from "../component/UserContext";
import { ListOrdered, MailCheck, Sparkles } from "lucide-react";

const nodeTypes = {
  webhookNode: WebhookNode,
  // routerNode: RouterNode,
  gmailNode: GmailNode,
  delayNode: DelayNode,
  outlookNode: OutlookNode,
  conditionNode: ConditionNode,
};

const OthersScenariosPage = () => {
  const navigate = useNavigate();
  const [highlightedNodes, setHighlightedNodes] = useState([]);

  const { id } = useParams();
  const [showWebhookModal, setShowWebhookModal] = useState(false);
  const { user } = useContext(UserContext);
  const [validNodes, setValidNodes] = useState([]);

  const [webhookUrl, setWebhookUrl] = useState("");
  const performDeleteNode = () => {
    const nodeId = nodeToDelete;

    setRfNodes((nodes) => {
      const updatedNodes = nodes.filter((n) => n.id !== nodeId);

      setRfEdges((edges) => {
        const incoming = edges.find((e) => e.target === nodeId);
        const outgoing = edges.find((e) => e.source === nodeId);

        let newEdges = edges.filter(
          (e) => e.source !== nodeId && e.target !== nodeId
        );

        // Auto-reconnect chain
        if (incoming && outgoing) {
          newEdges.push({
            id: `edge-${incoming.source}-${outgoing.target}`,
            source: incoming.source,
            target: outgoing.target,
            type: "smoothstep",
          });
        }

        return newEdges;
      });

      return updatedNodes;
    });

    setShowDeleteConfirm(false);
    setNodeToDelete(null);
  };
  const validateBeforeActivate = () => {
    let highlight = [];
    let validList = [];
    let hasError = false;

    rfNodes.forEach((node) => {
      const cfg = node.data?.config || {};
      let invalid = false;

      if (node.type === "gmailNode") {
        if (!cfg.connectionId || !cfg.subject || !cfg.body) {
          invalid = true;
        }
      }

      if (node.type === "delayNode") {
        if (!cfg.delayValue || !cfg.delayUnit) {
          invalid = true;
        }
      }

      if (node.type === "conditionNode") {
        if (!cfg.conditions || cfg.conditions.length === 0) {
          invalid = true;
        }
      }

      if (invalid) {
        highlight.push(node.id);
        hasError = true;
      } else {
        validList.push(node.id);
      }
    });

    setHighlightedNodes(highlight);
    setValidNodes(validList);

    if (hasError) {
      toast.error("Please fix highlighted nodes before activating scenario.");
      return false;
    }

    return true;
  };

  const [rfNodes, setRfNodes] = useState([]);
  const [rfEdges, setRfEdges] = useState([]);
  const [nodeToDelete, setNodeToDelete] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
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
  useEffect(() => {
    if (user?.mailhook) {
      setWebhookUrl(user.mailhook);
    }
  }, [user]);
  const deleteNode = (nodeId) => {
    setRfNodes((nodes) => {
      const updatedNodes = nodes.filter((n) => n.id !== nodeId);

      setRfEdges((edges) => {
        const incoming = edges.find((e) => e.target === nodeId);
        const outgoing = edges.find((e) => e.source === nodeId);

        let newEdges = edges.filter(
          (e) => e.source !== nodeId && e.target !== nodeId
        );

        // IF BOTH EXIST → Reconnect previous to next
        if (incoming && outgoing) {
          newEdges.push({
            id: `edge-${incoming.source}-${outgoing.target}`,
            source: incoming.source,
            target: outgoing.target,
            type: "smoothstep",
          });
        }

        return newEdges;
      });

      return updatedNodes;
    });
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

        openWebhookModal: () => {
          setShowWebhookModal(true);
        },
      },
    };

    setRfNodes([defaultWebhook]);
  }, []);

  const [showGmailModal, setShowGmailModal] = useState(false);
  const [showOutlookModal, setShowOutlookModal] = useState(false);

  const addModule = (type) => {
    const parentId = editingNode?.id || editingNode; // ← FIXED

    const nodeId = crypto.randomUUID();

    const parentNode = rfNodes.find((n) => n.id === parentId);

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

        confirmDeleteNode: () => {
          setNodeToDelete(nodeId);
          setShowDeleteConfirm(true);
        },

        openModuleModal: () => {
          setEditingNode({ id: nodeId, type });
          setShowModuleModal(true);
        },

        openConditionModal: () => {
          setEditingNode({ id: nodeId, type });
          setShowFilterModal(true);
        },
      },
    };

    setRfNodes((prev) => [...prev, newNode]);

    // AUTO CONNECT FIX
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

    if (type === "conditionNode") {
      setEditingNode(newNode);
      setShowFilterModal(true);
    }

    if (type === "delayNode") {
      setRfNodes((prev) =>
        prev.map((n) =>
          n.id === nodeId
            ? {
                ...n,
                data: {
                  ...n.data,
                  config: { delayValue: 5, delayUnit: "seconds" },
                },
              }
            : n
        )
      );
    }

    setShowModuleModal(false);
  };

  const rebuildFlowFromScenario = (scenario) => {
    const nodes = [];
    const edges = [];

    // Add webhook
    nodes.push({
      id: "webhook-1",
      type: "webhookNode",
      position: { x: 200, y: 80 },
      data: {
        id: "webhook-1",
        config: {},
        deleteNode: () => deleteNode("webhook-1"),
        openModuleModal: () => {
          setEditingNode("webhook-1");
          setShowModuleModal(true);
        },
        openWebhookModal: () => setShowWebhookModal(true),
      },
    });

    scenario.routerBranches.forEach((branch) => {
      let prev = "webhook-1";

      branch.modules.forEach((mod) => {
        let nodeType =
          mod.type === "Condition"
            ? "conditionNode"
            : mod.type === "Delay"
            ? "delayNode"
            : "gmailNode";

        nodes.push({
          id: mod.id,
          type: nodeType,
          position: mod.position,
          data: {
            id: mod.id,
            config: mod,

            deleteNode: () => deleteNode(mod.id),

            confirmDeleteNode: () => {
              setNodeToDelete(mod.id);
              setShowDeleteConfirm(true);
            },

            openModuleModal: () => {
              setEditingNode({ id: mod.id, type: nodeType });
              setShowModuleModal(true);
            },

            openConditionModal: () => {
              setEditingNode({ id: mod.id, type: nodeType });
              setShowFilterModal(true);
            },
          },
        });

        edges.push({
          id: `edge-${prev}-${mod.id}`,
          source: prev,
          target: mod.id,
          type: "smoothstep",
        });

        prev = mod.id;
      });
    });

    setRfNodes(nodes);
    setRfEdges(edges);
  };

  const loadScenario = async () => {
    if (!id) return;

    try {
      const res = await fetch(`http://localhost:5000/scenario/detail/${id}`);
      const data = await res.json();

      console.log("📥 Loaded Scenario:", data);

      setScenarioName(data.name || "");

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
        `http://localhost:5000/auth/getConnection/${localStorage.getItem(
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
      ? `http://localhost:5000/scenario/detail/${id}`
      : `http://localhost:5000/scenario`;

    await fetch(url, {
      method: id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    toast.success("Scenario saved!");
    navigate("/scenarios/all");
  };
  const [isActive, setIsActive] = useState(false);
  const organizeNodes = () => {
    const spacingY = 170;
    const spacingX = 0;

    setRfNodes((nodes) => {
      let y = 80;
      return nodes.map((n, index) => ({
        ...n,
        position: {
          x: 200 + spacingX,
          y: index === 0 ? 80 : 80 + index * spacingY,
        },
      }));
    });

    toast.success("Nodes organized neatly!");
  };
  return (
    <ReactFlowProvider>
      <div className="flex">
        <div className="w-64 min-h-screen bg-gray-100">
          <Sidebar />
        </div>

        <div className="flex-1 min-h-screen bg-gray-50">
          <div className="border-b bg-white/90 backdrop-blur-sm shadow-sm">
            <div className="px-6 py-4 flex items-center justify-between">
              <div>
                <input
                  type="text"
                  value={scenarioName}
                  onChange={(e) => setScenarioName(e.target.value)}
                  className="
      text-2xl font-semibold text-gray-900
      bg-transparent border-none p-0 m-0
      focus:outline-none focus:ring-0
      w-full
    "
                  placeholder="Scenario Name"
                />

                <p className="text-sm text-gray-500 -mt-1">
                  Configure your automation workflow
                </p>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={saveScenario}
                  className="
          px-5 py-2 rounded-lg 
          bg-blue-600 text-white text-sm font-medium
          hover:bg-blue-700 
          shadow-sm transition
        "
                >
                  {id ? "Update Scenario" : "Create Scenario"}
                </button>

                <button
                  className="
          flex items-center gap-2
          px-5 py-2 rounded-lg 
          bg-green-600 text-white text-sm font-medium
          hover:bg-green-700 
          shadow-sm transition
        "
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  Run Test
                </button>

                <div className="flex items-center gap-3 px-4 py-2 border rounded-full bg-white shadow-sm">
                  <span className="text-sm font-medium text-gray-800">
                    Activate Scenario
                  </span>

                  <button
                    onClick={() => {
                      if (!isActive) {
                        const ok = validateBeforeActivate();
                        if (!ok) return;
                      }
                      setIsActive(!isActive);
                    }}
                    className={`
            relative inline-flex h-5 w-10 items-center rounded-full transition
            ${isActive ? "bg-indigo-600" : "bg-gray-300"}
          `}
                  >
                    <span
                      className={`
              inline-block h-4 w-4 transform rounded-full bg-white transition
              ${isActive ? "translate-x-5" : "translate-x-1"}
            `}
                    />
                  </button>

                  <span
                    className={`text-sm font-semibold ${
                      isActive ? "text-green-600" : "text-gray-400"
                    }`}
                  >
                    {isActive ? "ON" : "OFF"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="h-[calc(100vh-120px)]">
            <ReactFlow
              nodes={rfNodes.map((n) => ({
                ...n,
                data: {
                  ...n.data,
                  highlight: highlightedNodes.includes(n.id),
                  success: validNodes.includes(n.id), // <-- NEW
                },
              }))}
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
          <div
            className="
    fixed bottom-6 left-1/2 -translate-x-1/2
    bg-white/90 backdrop-blur-md
    shadow-xl border border-gray-200
    rounded-full px-6 py-3
    flex items-center gap-6
    z-50
"
          >
            <button
              onClick={organizeNodes}
              className="
      flex items-center gap-2
      text-purple-700 font-medium
      hover:text-purple-900
      transition
    "
            >
              <ListOrdered size={18} />
              Organize
            </button>

            {/* Divider */}
            <div className="w-[1px] h-6 bg-gray-300"></div>

            {/* Test Email */}
            <button
              className="
      flex items-center gap-2
      text-green-700 font-medium
      hover:text-green-900
      transition
    "
            >
              <MailCheck size={18} />
              Test Email
            </button>
          </div>

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

                  {/* <button
                    className="w-full p-3 border rounded-xl bg-gray-50 hover:bg-purple-100 hover:border-purple-400 
          transition-all flex items-center gap-3"
                    onClick={() => addModule("routerNode")}
                  >
                    <FiGitBranch size={20} className="text-purple-500" /> Router
                  </button> */}

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
          {showWebhookModal && (
            <WebhookModal
              showWebhookInfo={showWebhookModal}
              setShowWebhookInfo={setShowWebhookModal}
              webhookUrl={webhookUrl}
              loading={false}
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
          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm">
              <div className="bg-white p-6 rounded-xl shadow-xl w-80">
                <h2 className="text-lg font-semibold text-gray-800">
                  Delete Module?
                </h2>
                <p className="text-gray-600 mt-2">
                  Are you sure you want to delete this module?
                </p>

                <div className="flex justify-end gap-3 mt-5">
                  <button
                    className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setNodeToDelete(null);
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    onClick={performDeleteNode}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ReactFlowProvider>
  );
};

export default OthersScenariosPage;

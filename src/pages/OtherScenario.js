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
import {
  FiMail,
  FiGitBranch,
  FiClock,
  FiFilter,
  FiX,
  FiFileText,
} from "react-icons/fi";
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
import RunTestModal from "../modals/RunTestModal";
import TestEmailModal from "../modals/TestEmailModal";
import TemplateNode from "../nodes/TemplateNode";

const nodeTypes = {
  webhookNode: WebhookNode,
  // routerNode: RouterNode,
  gmailNode: GmailNode,
  delayNode: DelayNode,
  outlookNode: OutlookNode,
  conditionNode: ConditionNode,
  templateNode: TemplateNode,
};

const OthersScenariosPage = () => {
  const [showRunTestModal, setShowRunTestModal] = useState(false);

  const navigate = useNavigate();
  const [highlightedNodes, setHighlightedNodes] = useState([]);

  const { id } = useParams();
  const [showWebhookModal, setShowWebhookModal] = useState(false);
  const { user } = useContext(UserContext);
  const [validNodes, setValidNodes] = useState([]);
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  const [webhookUrl, setWebhookUrl] = useState("");
  const performDeleteNode = () => {
    const nodeId = nodeToDelete;

    setRfNodes((nodes) => {
      const updatedNodes = nodes.filter((n) => n.id !== nodeId);

      setRfEdges((edges) => {
        const incoming = edges.find((e) => e.target === nodeId);
        const outgoing = edges.find((e) => e.source === nodeId);

        let newEdges = edges.filter(
          (e) => e.source !== nodeId && e.target !== nodeId,
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
        const hasTemplate = cfg.templateId && String(cfg.templateId).length > 0;
        const hasBody = cfg.body && cfg.body.trim().length > 0;

        if (!cfg.connectionId || !cfg.subject || (!hasTemplate && !hasBody)) {
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
  const [showTestEmailModal, setShowTestEmailModal] = useState(false);
  const [testEmail, setTestEmail] = useState(null);

  const fetchTestEmail = async () => {
    try {
      const res = await fetch(
        `https://email-syncing-backend.vercel.app/mailhook/email/latest/${userId}`,
      );

      const data = await res.json();

      if (data.success) {
        setTestEmail(data.email);
        setShowTestEmailModal(true);
      } else {
        toast.error(data.message || "No email found!");
      }
    } catch (err) {
      toast.error("Error fetching test email");
    }
  };
  const handleRunTest = async () => {
    const success = await runScenarioExecutionAnimation();

    if (success) {
      await fetchTestEmail();
    }
  };
  const [executingNode, setExecutingNode] = useState(null);
  const [executionComplete, setExecutionComplete] = useState(false);
  const [rfNodes, setRfNodes] = useState([]);
  const [rfEdges, setRfEdges] = useState([]);
  const [nodeToDelete, setNodeToDelete] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [connections, setConnections] = useState([]);
  const [scenarioName, setScenarioName] = useState("");
  const [editingNode, setEditingNode] = useState(null);
  const [otherActiveTemplates, setOtherActiveTemplates] = useState([]);

  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showDelayModal, setShowDelayModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showConnectionModal, setShowConnectionModal] = useState(false);

  const [showModuleModal, setShowModuleModal] = useState(false);
  const [showBranchButton, setShowBranchButton] = useState(false);

  const userId = localStorage.getItem("userid");
  const fetchActiveTemplates = async () => {
    try {
      const res = await fetch(
        `https://email-syncing-backend.vercel.app/template/other/active?userId=${userId}`,
      );

      const data = await res.json();
      if (data.success) {
        setOtherActiveTemplates(data.templates);
      }
    } catch (err) {
      console.error("Error fetching templates", err);
    }
  };

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
          (e) => e.source !== nodeId && e.target !== nodeId,
        );

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
    const parentId = editingNode?.id || editingNode;

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

        openEditEmailModal: () => {
          setEditingNode({ id: nodeId, type });
          setShowEmailModal(true);
        },

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
    if (type === "templateNode") {
      fetchActiveTemplates(); // <-- ADD THIS
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
            : n,
        ),
      );
    }

    setShowModuleModal(false);
  };

  // const rebuildFlowFromScenario = (scenario) => {
  //   const nodes = [];
  //   const edges = [];

  //   nodes.push({
  //     id: "webhook-1",
  //     type: "webhookNode",
  //     position: { x: 200, y: 80 },
  //     data: {
  //       id: "webhook-1",
  //       config: {},
  //       deleteNode: () => deleteNode("webhook-1"),
  //       openModuleModal: () => {
  //         setEditingNode("webhook-1");
  //         setShowModuleModal(true);
  //       },
  //       openWebhookModal: () => setShowWebhookModal(true),
  //     },
  //   });

  //   scenario.routerBranches.forEach((branch) => {
  //     let prev = "webhook-1";

  //     branch.modules.forEach((mod) => {
  //       let nodeType =
  //         mod.type === "Condition"
  //           ? "conditionNode"
  //           : mod.type === "Delay"
  //           ? "delayNode"
  //           : mod.type === "Template"
  //           ? "templateNode"
  //           : "gmailNode"; // fallback = email node

  //       // ==================================================
  //       // ⭐  T E M P L A T E   N O D E
  //       // ==================================================
  //       if (nodeType === "templateNode") {
  //         nodes.push({
  //           id: mod.id,
  //           type: "templateNode",
  //           position: mod.position,
  //           data: {
  //             id: mod.id,
  //             config: {
  //               templateId: mod.templateId || "",
  //               name: mod.templateName || "",
  //               content: mod.templateContent || "",
  //             },

  //             openTemplateModal: () => {
  //               setEditingNode({ id: mod.id, type: "templateNode" });
  //               setShowTemplateModal(true);
  //             },

  //             confirmDeleteNode: () => {
  //               setNodeToDelete(mod.id);
  //               setShowDeleteConfirm(true);
  //             },

  //             openModuleModal: () => {
  //               setEditingNode({ id: mod.id, type: "templateNode" });
  //               setShowModuleModal(true);
  //             },
  //           },
  //         });

  //         edges.push({
  //           id: `edge-${prev}-${mod.id}`,
  //           source: prev,
  //           target: mod.id,
  //           type: "smoothstep",
  //         });

  //         prev = mod.id;
  //         return;
  //       }

  //       // ==================================================
  //       // ⭐  C O N D I T I O N   N O D E
  //       // ==================================================
  //       if (nodeType === "conditionNode") {
  //         nodes.push({
  //           id: mod.id,
  //           type: "conditionNode",
  //           position: mod.position,
  //           data: {
  //             id: mod.id,
  //             config: mod.filter || { conditions: [] },

  //             openConditionModal: () => {
  //               setEditingNode({ id: mod.id, type: "conditionNode" });
  //               setShowFilterModal(true);
  //             },

  //             confirmDeleteNode: () => {
  //               setNodeToDelete(mod.id);
  //               setShowDeleteConfirm(true);
  //             },

  //             openModuleModal: () => {
  //               setEditingNode({ id: mod.id, type: "conditionNode" });
  //               setShowModuleModal(true);
  //             },
  //           },
  //         });

  //         edges.push({
  //           id: `edge-${prev}-${mod.id}`,
  //           source: prev,
  //           target: mod.id,
  //           type: "smoothstep",
  //         });

  //         prev = mod.id;
  //         return;
  //       }

  //       if (nodeType === "delayNode") {
  //         nodes.push({
  //           id: mod.id,
  //           type: "delayNode",
  //           position: mod.position,
  //           data: {
  //             id: mod.id,
  //             config: {
  //               delayValue: mod.delayValue,
  //               delayUnit: mod.delayUnit,
  //             },

  //             openEditModal: () => {
  //               setEditingNode({ id: mod.id, type: "delayNode" });
  //               setShowDelayModal(true);
  //             },

  //             confirmDeleteNode: () => {
  //               setNodeToDelete(mod.id);
  //               setShowDeleteConfirm(true);
  //             },

  //             openModuleModal: () => {
  //               setEditingNode({ id: mod.id, type: "delayNode" });
  //               setShowModuleModal(true);
  //             },
  //           },
  //         });

  //         edges.push({
  //           id: `edge-${prev}-${mod.id}`,
  //           source: prev,
  //           target: mod.id,
  //           type: "smoothstep",
  //         });

  //         prev = mod.id;
  //         return;
  //       }

  //       const isMongoId = /^[0-9a-fA-F]{24}$/.test(mod.template);
  //       nodes.push({
  //         id: mod.id,
  //         type: "gmailNode",
  //         position: mod.position,
  //         data: {
  //           id: mod.id,

  //           config: {
  //             appType: mod.emailType || "",
  //             emailType: mod.emailType || "",
  //             to: mod.to || "",
  //             subject: mod.subject || "",
  //             cc: mod.cc || [],
  //             bcc: mod.bcc || [],
  //             connectionId: mod.connectionId || "",

  //             templateId: isMongoId ? mod.template : null,
  //             body: isMongoId ? "" : mod.template || "",
  //           },

  //           openEditEmailModal: () => {
  //             setEditingNode({ id: mod.id, type: "gmailNode" });
  //             setShowEmailModal(true);
  //           },

  //           confirmDeleteNode: () => {
  //             setNodeToDelete(mod.id);
  //             setShowDeleteConfirm(true);
  //           },

  //           openModuleModal: () => {
  //             setEditingNode({ id: mod.id, type: "gmailNode" });
  //             setShowModuleModal(true);
  //           },
  //         },
  //       });

  //       edges.push({
  //         id: `edge-${prev}-${mod.id}`,
  //         source: prev,
  //         target: mod.id,
  //         type: "smoothstep",
  //       });

  //       prev = mod.id;
  //     });
  //   });

  //   // SAVE NODES + EDGES
  //   setRfNodes(nodes);
  //   setRfEdges(edges);
  // };

  const rebuildFlowFromScenario = (scenario) => {
    const nodes = [];
    const edges = [];

    const START_X = 400;
    const START_Y = 80;
    const BRANCH_SPACING_X = 350;
    const NODE_SPACING_Y = 180;

    // Webhook Node (center)
    nodes.push({
      id: "webhook-1",
      type: "webhookNode",
      position: { x: START_X, y: START_Y },
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

    scenario.routerBranches.forEach((branch, branchIndex) => {
      const branchX =
        START_X + (branchIndex === 0 ? -BRANCH_SPACING_X : BRANCH_SPACING_X);

      let prevNodeId = "webhook-1";

      branch.modules.forEach((mod, modIndex) => {
        const yPos = START_Y + (modIndex + 1) * NODE_SPACING_Y;
        const nodeType =
          mod.type === "Condition"
            ? "conditionNode"
            : mod.type === "Delay"
              ? "delayNode"
              : mod.type === "Template"
                ? "templateNode"
                : "gmailNode";

        const newNode = {
          id: mod.id,
          type: nodeType,
          position: { x: branchX, y: yPos },
          data: {
            id: mod.id,
            config: mod,
            openModuleModal: () => {
              setEditingNode({ id: mod.id, type: nodeType });
              setShowModuleModal(true);
            },
            confirmDeleteNode: () => {
              setNodeToDelete(mod.id);
              setShowDeleteConfirm(true);
            },
          },
        };

        if (nodeType === "gmailNode") {
          const isMongoId = /^[0-9a-fA-F]{24}$/.test(mod.template);
          newNode.data.config = {
            appType: mod.emailType || "",
            emailType: mod.emailType || "",
            to: mod.to || "",
            subject: mod.subject || "",
            cc: mod.cc || [],
            bcc: mod.bcc || [],
            connectionId: mod.connectionId || "",
            templateId: isMongoId ? mod.template : null,
            body: isMongoId ? "" : mod.template || "",
          };
          newNode.data.openEditEmailModal = () => {
            setEditingNode({ id: mod.id, type: "gmailNode" });
            setShowEmailModal(true);
          };
        }

        // Template config
        if (nodeType === "templateNode") {
          newNode.data.config = {
            templateId: mod.templateId || "",
            name: mod.templateName || "",
            content: mod.templateContent || "",
          };
          newNode.data.openTemplateModal = () => {
            setEditingNode({ id: mod.id, type: "templateNode" });
            setShowTemplateModal(true);
          };
        }

        // Condition config
        if (nodeType === "conditionNode") {
          newNode.data.config = mod.filter || { conditions: [] };
          newNode.data.openConditionModal = () => {
            setEditingNode({ id: mod.id, type: "conditionNode" });
            setShowFilterModal(true);
          };
        }

        // Delay config
        if (nodeType === "delayNode") {
          newNode.data.config = {
            delayValue: mod.delayValue,
            delayUnit: mod.delayUnit,
          };
          newNode.data.openEditModal = () => {
            setEditingNode({ id: mod.id, type: "delayNode" });
            setShowDelayModal(true);
          };
        }

        nodes.push(newNode);

        // Connect edge
        edges.push({
          id: `edge-${prevNodeId}-${mod.id}`,
          source: prevNodeId,
          target: mod.id,
          type: "smoothstep",
        });

        prevNodeId = mod.id;
      });
    });

    setRfNodes(nodes);
    setRfEdges(edges);
  };

  const [isTemplateAvailable, setIsTemplateAvailable] = useState(false);

  const loadScenario = async () => {
    if (!id) return;

    try {
      await fetchConnections();

      await fetchActiveTemplates();

      const res = await fetch(
        `https://email-syncing-backend.vercel.app/scenario/detail/${id}`,
      );
      const data = await res.json();

      console.log("📥 Loaded Scenario:", data);

      setScenarioName(data.name || "");
      setIsActive(data.scenarioActive || false);

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
          "userid",
        )}`,
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
    [],
  );

  const handleNodeClick = (event, node) => {
    setEditingNode(node);

    const isTemplateConnected = checkIfTemplateBefore(node.id);

    if (node.type === "gmailNode") {
      setShowEmailModal(true);
      setIsTemplateAvailable(isTemplateConnected); // <— new flag
    }

    if (node.type === "delayNode") setShowDelayModal(true);
    if (node.type === "conditionNode") setShowFilterModal(true);
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
      scenarioActive: isActive,
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
  const runScenarioExecutionAnimation = async () => {
    setHighlightedNodes([]);
    setValidNodes([]);
    setExecutingNode(null);

    let hasError = false;

    setRfNodes((prev) =>
      prev.map((n) => ({ ...n, data: { ...n.data, errorMessage: null } })),
    );

    for (let i = 0; i < rfNodes.length; i++) {
      const node = rfNodes[i];
      const cfg = node.data?.config || {};

      setExecutingNode(node.id);
      await new Promise((res) => setTimeout(res, 700));

      let error = null;

      if (node.type === "gmailNode") {
        if (!cfg.connectionId) error = "Connection not selected";
        else if (!cfg.subject) error = "Email subject missing";
        else if (!cfg.body) error = "Email body missing";
      }

      if (node.type === "delayNode") {
        if (!cfg.delayValue || !cfg.delayUnit)
          error = "Delay duration or unit missing";
      }

      if (node.type === "conditionNode") {
        if (!cfg.conditions || cfg.conditions.length === 0)
          error = "At least 1 condition is required";
      }

      if (error) {
        hasError = true;

        setHighlightedNodes((prev) => [...prev, node.id]);

        setRfNodes((prev) =>
          prev.map((n) =>
            n.id === node.id
              ? { ...n, data: { ...n.data, errorMessage: error } }
              : n,
          ),
        );
      } else {
        setValidNodes((prev) => [...prev, node.id]);
      }
    }

    setExecutingNode(null);
    return !hasError;
  };
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [showEdgeModal, setShowEdgeModal] = useState(false);
  const handleEdgeContextMenu = (event, edge) => {
    event.preventDefault();
    setSelectedEdge(edge);
    setShowEdgeModal(true);
  };

  const handleAddEmailTemplateFromEdge = async (edge) => {
    const sourceId = edge.source;
    const targetId = edge.target;
    const newNodeId = crypto.randomUUID();

    await fetchActiveTemplates(); // <----- ADD THIS LINE

    const sourceNode = rfNodes.find((n) => n.id === sourceId);
    const targetNode = rfNodes.find((n) => n.id === targetId);

    const newX = (sourceNode.position.x + targetNode.position.x) / 2;
    const newY = (sourceNode.position.y + targetNode.position.y) / 2;

    setRfNodes((prev) => [
      ...prev,
      {
        id: newNodeId,
        type: "templateNode",
        position: { x: newX, y: newY },
        data: {
          id: newNodeId,
          config: {},

          openTemplateModal: () => {
            setEditingNode({ id: newNodeId, type: "templateNode" });
            setShowTemplateModal(true);
          },

          confirmDeleteNode: () => {
            setNodeToDelete(newNodeId);
            setShowDeleteConfirm(true);
          },

          openModuleModal: () => {
            setEditingNode({ id: newNodeId, type: "templateNode" });
            setShowModuleModal(true);
          },
        },
      },
    ]);

    setRfEdges((prev) => {
      const filtered = prev.filter((e) => e.id !== edge.id);

      return [
        ...filtered,
        {
          id: `edge-${sourceId}-${newNodeId}`,
          source: sourceId,
          target: newNodeId,
          type: "smoothstep",
        },
        {
          id: `edge-${newNodeId}-${targetId}`,
          source: newNodeId,
          target: targetId,
          type: "smoothstep",
        },
      ];
    });

    setEditingNode({ id: newNodeId, type: "templateNode" });
    setShowTemplateModal(true);
  };
  const checkIfTemplateBefore = (gmailNodeId) => {
    const incoming = rfEdges.filter((e) => e.target === gmailNodeId);

    if (!incoming.length) return false;

    const parentId = incoming[0].source;
    const parentNode = rfNodes.find((n) => n.id === parentId);

    if (!parentNode) return false;

    if (parentNode.type === "templateNode") return true;

    return false;
  };

  const handleAddDelayFromEdge = (edge) => {
    const sourceId = edge.source;
    const targetId = edge.target;
    const newNodeId = crypto.randomUUID();

    const sourceNode = rfNodes.find((n) => n.id === sourceId);
    const targetNode = rfNodes.find((n) => n.id === targetId);

    const newX = (sourceNode.position.x + targetNode.position.x) / 2;
    const newY = (sourceNode.position.y + targetNode.position.y) / 2;

    setRfNodes((prev) => [
      ...prev,
      {
        id: newNodeId,
        type: "delayNode",
        position: { x: newX, y: newY },
        data: {
          id: newNodeId,
          config: { delayValue: 5, delayUnit: "seconds" },

          confirmDeleteNode: () => {
            setNodeToDelete(newNodeId);
            setShowDeleteConfirm(true);
          },

          openModuleModal: () => {
            setEditingNode({ id: newNodeId, type: "delayNode" });
            setShowModuleModal(true);
          },

          openEditModal: () => {
            setEditingNode({ id: newNodeId, type: "delayNode" });
            setShowDelayModal(true);
          },
        },
      },
    ]);

    setRfEdges((prev) => {
      const filtered = prev.filter((e) => e.id !== edge.id);

      return [
        ...filtered,
        {
          id: `edge-${sourceId}-${newNodeId}`,
          source: sourceId,
          target: newNodeId,
          type: "smoothstep",
        },
        {
          id: `edge-${newNodeId}-${targetId}`,
          source: newNodeId,
          target: targetId,
          type: "smoothstep",
        },
      ];
    });

    setEditingNode({ id: newNodeId, type: "delayNode" });
    setShowDelayModal(true);
  };

  const handleAddConditionFromEdge = (edge) => {
    const sourceId = edge.source;
    const targetId = edge.target;
    const newNodeId = crypto.randomUUID();

    const sourceNode = rfNodes.find((n) => n.id === sourceId);
    const targetNode = rfNodes.find((n) => n.id === targetId);

    const newX = (sourceNode.position.x + targetNode.position.x) / 2;
    const newY = (sourceNode.position.y + targetNode.position.y) / 2;

    setRfNodes((prev) => [
      ...prev,
      {
        id: newNodeId,
        type: "conditionNode",
        position: { x: newX, y: newY },
        data: {
          id: newNodeId,
          config: {},

          confirmDeleteNode: () => {
            setNodeToDelete(newNodeId);
            setShowDeleteConfirm(true);
          },

          openModuleModal: () => {
            setEditingNode({ id: newNodeId, type: "conditionNode" });
            setShowModuleModal(true);
          },

          openConditionModal: () => {
            setEditingNode({ id: newNodeId, type: "conditionNode" });
            setShowFilterModal(true);
          },
        },
      },
    ]);

    setRfEdges((prev) => {
      const filtered = prev.filter((e) => e.id !== edge.id);

      return [
        ...filtered,
        {
          id: `edge-${sourceId}-${newNodeId}`,
          source: sourceId,
          target: newNodeId,
          type: "smoothstep",
        },
        {
          id: `edge-${newNodeId}-${targetId}`,
          source: newNodeId,
          target: targetId,
          type: "smoothstep",
        },
      ];
    });

    setEditingNode({ id: newNodeId, type: "conditionNode" });
    setShowFilterModal(true);
  };
  const saveTemplateToDB = async (name, content) => {
    try {
      const userId = localStorage.getItem("userid");

      const res = await fetch(
        "https://email-syncing-backend.vercel.app/template/save/other",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            name,
            content,
          }),
        },
      );

      const data = await res.json();

      if (data.success) {
        alert("Template saved successfully!");
      } else {
        alert("Failed to save template");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving template");
    }
  };

  return (
    <ReactFlowProvider>
      <div className="flex">
        <div className="w-64 min-h-screen bg-gray-100">
          <Sidebar />
        </div>

        <div className="flex-1 min-h-screen bg-gray-50">
          <div className="border-b bg-white/90 backdrop-blur-sm shadow-sm">
            <div className="px-6 py-1 flex items-center justify-between">
              <div className="mt-0.5">
                <input
                  type="text"
                  value={scenarioName}
                  onChange={(e) => setScenarioName(e.target.value)}
                  className="text-xl sm:text-xl font-semibold text-gray-800 border-none outline-none focus:ring-0 w-full"
                  placeholder="Scenario Name"
                />

                <p className="text-sm text-gray-500 mt-1">
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
                  onClick={() => setShowRunTestModal(true)}
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

          <div style={{ height: "100%", width: "100%", overflow: "hidden" }}>
            <ReactFlow
              nodes={rfNodes.map((n) => ({
                ...n,
                data: {
                  ...n.data,
                  highlight: highlightedNodes.includes(n.id),
                  success: validNodes.includes(n.id),
                  executing: executingNode === n.id, // 🔥 add this
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
              onEdgeContextMenu={handleEdgeContextMenu}
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
              onClick={fetchTestEmail}
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
          {showTestEmailModal && (
            <TestEmailModal
              email={testEmail}
              onClose={() => setShowTestEmailModal(false)}
            />
          )}

          {showEdgeModal && selectedEdge && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center animate-fadeIn z-50">
              <div className="bg-white/90 p-6 rounded-2xl shadow-xl w-80 space-y-6 border border-white/30 animate-scaleIn">
                {/* Title */}
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Connection Options
                  </h2>
                  <button
                    onClick={() => setShowEdgeModal(false)}
                    className="text-gray-600 hover:text-red-500 transition"
                  >
                    <FiX size={22} />
                  </button>
                </div>

                {/* Buttons List */}
                <div className="space-y-3">
                  {/* Unlink */}
                  <button
                    className="w-full p-3 border rounded-xl bg-red-50 hover:bg-red-100 hover:border-red-300
          transition-all flex items-center gap-3"
                    onClick={() => {
                      setRfEdges((edges) =>
                        edges.filter((e) => e.id !== selectedEdge.id),
                      );
                      setShowEdgeModal(false);
                    }}
                  >
                    <FiX size={20} className="text-red-500" />
                    Unlink Connection
                  </button>

                  {/* Template */}
                  <button
                    className="w-full p-3 border rounded-xl bg-purple-50 hover:bg-purple-100 hover:border-purple-300 
          transition-all flex items-center gap-3"
                    onClick={() => {
                      handleAddEmailTemplateFromEdge(selectedEdge);
                      setShowEdgeModal(false);
                    }}
                  >
                    <FiFileText size={20} className="text-purple-600" />
                    Add Email Template
                  </button>

                  {/* Delay */}
                  <button
                    className="w-full p-3 border rounded-xl bg-yellow-50 hover:bg-yellow-100 hover:border-yellow-300 
          transition-all flex items-center gap-3"
                    onClick={() => {
                      handleAddDelayFromEdge(selectedEdge);
                      setShowEdgeModal(false);
                    }}
                  >
                    <FiClock size={20} className="text-yellow-600" />
                    Add Delay
                  </button>

                  {/* Condition */}
                  <button
                    className="w-full p-3 border rounded-xl bg-blue-50 hover:bg-blue-100 hover:border-blue-300 
          transition-all flex items-center gap-3"
                    onClick={() => {
                      handleAddConditionFromEdge(selectedEdge);
                      setShowEdgeModal(false);
                    }}
                  >
                    <FiFilter size={20} className="text-blue-600" />
                    Add Condition
                  </button>
                </div>

                {/* Cancel */}
                <button
                  className="w-full p-3 bg-gray-200 rounded-xl hover:bg-gray-300 transition-all"
                  onClick={() => setShowEdgeModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

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
                  {/* Email */}
                  <button
                    className="w-full p-3 border rounded-xl bg-gray-50 hover:bg-blue-100 hover:border-blue-400 
          transition-all flex items-center gap-3"
                    onClick={() => addModule("gmailNode")}
                  >
                    <FiMail size={20} className="text-blue-500" /> Email
                  </button>

                  {/* Template Node */}
                  <button
                    className="w-full p-3 border rounded-xl bg-gray-50 hover:bg-purple-100 hover:border-purple-400 
          transition-all flex items-center gap-3"
                    onClick={() => addModule("templateNode")}
                  >
                    <FiFileText size={20} className="text-purple-500" />
                    Email Template
                  </button>

                  {/* Delay */}
                  <button
                    className="w-full p-3 border rounded-xl bg-gray-50 hover:bg-yellow-100 hover:border-yellow-400 
          transition-all flex items-center gap-3"
                    onClick={() => addModule("delayNode")}
                  >
                    <FiClock size={20} className="text-yellow-500" /> Delay
                  </button>

                  {/* Condition */}
                  <button
                    className="w-full p-3 border rounded-xl bg-gray-50 hover:bg-green-100 hover:border-green-400 
          transition-all flex items-center gap-3"
                    onClick={() => addModule("conditionNode")}
                  >
                    <FiFilter size={20} className="text-green-500" /> Condition
                  </button>
                </div>

                {/* Cancel */}
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
              templates={otherActiveTemplates}
              showTemplateOption={isTemplateAvailable} // <-- NEW
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
                      : n,
                  ),
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
                      : n,
                  ),
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
                      : n,
                  ),
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
          {showRunTestModal && (
            <RunTestModal
              onClose={() => setShowRunTestModal(false)}
              runScenarioExecutionAnimation={runScenarioExecutionAnimation}
              onTestSuccess={async () => {
                await fetchTestEmail(); // fetch latest test email
                setShowTestEmailModal(true); // open TestEmailModal
              }}
            />
          )}

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

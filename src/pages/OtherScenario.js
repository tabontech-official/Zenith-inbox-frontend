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
import BlankNode from "../nodes/BlankNode";
import TemplateModal from "../modals/TemplateModal";
import TestInstructionsModal from "../modals/TestInstructionsModal";
import { Zap, Edit3, HelpCircle } from "lucide-react";

const nodeTypes = {
  blankNode: BlankNode,
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
  const [showTestInstructionsModal, setShowTestInstructionsModal] = useState(false);

  const navigate = useNavigate();
  const [highlightedNodes, setHighlightedNodes] = useState([]);
  const [isEditingName, setIsEditingName] = useState(false);

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

      if (updatedNodes.length === 0) {
        return [
          {
            id: "blank-1",
            type: "blankNode",
            position: { x: 200, y: 80 },
            data: {
              id: "blank-1",
              label: "Add Initial Node",
              openModuleModal: () => {
                setEditingNode("blank-1");
                setShowModuleModal(true);
              },
            },
          },
        ];
      }

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

      if (data.success && data.email) {
        setTestEmail(data.email);
        setShowTestEmailModal(true);
      } else {
        toast.error(
          "No incoming test email found yet. Send an email to your connected address to inspect real email logs.",
          { duration: 4000 }
        );
      }
    } catch (err) {
      toast.error("No incoming test email found yet.");
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
    if (rfNodes.length === 0) {
      setRfNodes([
        {
          id: "blank-1",
          type: "blankNode",
          position: { x: 200, y: 80 },
          data: {
            id: "blank-1",
            label: "Add Initial Node",
            openModuleModal: () => {
              setEditingNode("blank-1");
              setShowModuleModal(true);
            },
          },
        },
      ]);
    }
  }, [rfNodes.length]);

  const [showGmailModal, setShowGmailModal] = useState(false);
  const [showOutlookModal, setShowOutlookModal] = useState(false);

  const addModule = (type) => {
    const parentId = editingNode?.id || editingNode;
    const isReplacingBlank = rfNodes.length === 1 && rfNodes[0].type === "blankNode";
    const nodeId = type === "webhookNode" ? "webhook-1" : crypto.randomUUID();
    const parentNode = rfNodes.find((n) => n.id === parentId);

    const position = isReplacingBlank || !parentNode
      ? { x: 200, y: 80 }
      : { x: parentNode.position.x, y: parentNode.position.y + 180 };

    let newNode;
    if (type === "webhookNode") {
      newNode = {
        id: nodeId,
        type: "webhookNode",
        position,
        data: {
          id: nodeId,
          label: "Webhook",
          config: {},
          deleteNode: () => deleteNode(nodeId),
          openModuleModal: () => {
            setEditingNode(nodeId);
            setShowModuleModal(true);
          },
          openWebhookModal: () => {
            setShowWebhookModal(true);
          },
        },
      };
    } else {
      newNode = {
        id: nodeId,
        type,
        position,
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
    }

    if (isReplacingBlank) {
      setRfNodes([newNode]);
      setRfEdges([]);
    } else {
      setRfNodes((prev) => [
        ...prev.filter((n) => n.id !== parentId || n.type !== "blankNode"),
        newNode,
      ]);
      if (parentId && parentId !== "blank-1") {
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
    }

    if (type === "conditionNode") {
      setEditingNode(newNode);
      setShowFilterModal(true);
    }
    if (type === "templateNode") {
      fetchActiveTemplates();
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

  const rebuildFlowFromScenario = (data) => {
    if (!data) return;

    console.log("📥 REBUILDING FLOW FROM SAVED SCENARIO:", data);

    // 1. Direct restore if saved with rfNodes & rfEdges
    if (data.rfNodes && data.rfNodes.length > 0) {
      const restoredNodes = data.rfNodes.map((n) => ({
        ...n,
        data: {
          ...n.data,
          confirmDeleteNode: (nodeId) => {
            setNodeToDelete(nodeId || n.id);
            setShowDeleteConfirm(true);
          },
          openModuleModal: (nodeId) => {
            setEditingNode({ id: nodeId || n.id, type: n.type });
            setShowModuleModal(true);
          },
          openEditEmailModal: () => {
            setEditingNode(n);
            setShowEmailModal(true);
          },
          openTemplateModal: () => {
            setEditingNode(n);
            fetchActiveTemplates();
            setShowTemplateModal(true);
          },
          openDelayModal: () => {
            setEditingNode(n);
            setShowDelayModal(true);
          },
          openConditionModal: () => {
            setEditingNode(n);
            setShowFilterModal(true);
          },
          openWebhookModal: () => setShowWebhookModal(true),
        },
      }));

      // Sync incomingLead from DB if available
      if (data.incomingLead && (data.incomingLead.connectionId || data.incomingLead.subjectFilter)) {
        const connId =
          data.incomingLead.connectionId?._id ||
          data.incomingLead.connectionId;
        const subj = data.incomingLead.subjectFilter || "";

        restoredNodes.forEach((n) => {
          if (n.type === "gmailNode") {
            if (!n.data.config) n.data.config = {};
            if (connId && !n.data.config.connectionId) n.data.config.connectionId = connId;
            if (subj && !n.data.config.subject) n.data.config.subject = subj;
          }
        });
      }

      setRfNodes(restoredNodes);
      setRfEdges(data.rfEdges || []);
      return;
    }

    // 2. Reconstruct from routerBranches
    if (data.routerBranches && data.routerBranches.length > 0) {
      const nodes = [];
      const edges = [];

      data.routerBranches.forEach((branch, branchIndex) => {
        let prevNodeId = null;

        (branch.modules || []).forEach((mod, modIndex) => {
          const nodeType =
            mod.nodeType ||
            (mod.type === "Condition" || mod.type === "conditionNode"
              ? "conditionNode"
              : mod.type === "Delay" || mod.type === "delayNode"
              ? "delayNode"
              : mod.type === "Template" || mod.type === "templateNode"
              ? "templateNode"
              : mod.type === "Webhook" || mod.type === "webhookNode"
              ? "webhookNode"
              : "gmailNode");

          const nodeId = mod.id || crypto.randomUUID();
          const position = mod.position || {
            x: 200 + branchIndex * 350,
            y: 80 + modIndex * 180,
          };

          const newNode = {
            id: nodeId,
            type: nodeType,
            position: position,
            data: {
              id: nodeId,
              config: mod.config || {
                ...mod,
                templateId: mod.templateId || (mod.type === "Template" ? mod.template : null),
                name: mod.templateName || mod.name || "",
                content: mod.templateContent || mod.content || mod.body || "",
                connectionId: mod.connectionId || "",
                connectionEmail: mod.connectionEmail || "",
                subject: mod.subject || "",
                delayValue: mod.delayValue || null,
                delayUnit: mod.delayUnit || null,
              },
              confirmDeleteNode: () => {
                setNodeToDelete(nodeId);
                setShowDeleteConfirm(true);
              },
              openModuleModal: () => {
                setEditingNode({ id: nodeId, type: nodeType });
                setShowModuleModal(true);
              },
              openEditEmailModal: () => {
                setEditingNode({ id: nodeId, type: nodeType });
                setShowEmailModal(true);
              },
              openTemplateModal: () => {
                setEditingNode({ id: nodeId, type: nodeType });
                fetchActiveTemplates();
                setShowTemplateModal(true);
              },
              openDelayModal: () => {
                setEditingNode({ id: nodeId, type: nodeType });
                setShowDelayModal(true);
              },
              openConditionModal: () => {
                setEditingNode({ id: nodeId, type: nodeType });
                setShowFilterModal(true);
              },
              openWebhookModal: () => setShowWebhookModal(true),
            },
          };

          nodes.push(newNode);

          if (prevNodeId) {
            edges.push({
              id: `edge-${prevNodeId}-${nodeId}`,
              source: prevNodeId,
              target: nodeId,
              type: "smoothstep",
            });
          }
          prevNodeId = nodeId;
        });
      });

      if (nodes.length > 0) {
        setRfNodes(nodes);
        setRfEdges(edges);
      }
    }
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

    if (node.type === "blankNode") {
      setShowModuleModal(true);
    }

    if (node.type === "webhookNode") {
      setShowWebhookModal(true);
    }

    if (node.type === "gmailNode") {
      setShowEmailModal(true);
      setIsTemplateAvailable(isTemplateConnected);
    }

    if (node.type === "templateNode") {
      fetchActiveTemplates();
      setShowTemplateModal(true);
    }

    if (node.type === "delayNode") setShowDelayModal(true);
    if (node.type === "conditionNode") setShowFilterModal(true);
  };

  const saveScenario = async () => {
    const scenario = flowToScenario(rfNodes, rfEdges);

    const gmailNode = rfNodes.find((n) => n.type === "gmailNode");
    const gmailConfig = gmailNode?.data?.config || {};

    const incomingLeadObj = {
      app: {
        name: gmailConfig.appType || gmailConfig.emailType || "Gmail",
        color: "",
        icon: "",
      },
      connectionId: gmailConfig.connectionId || null,
      subjectFilter: gmailConfig.subject || "",
      pollInterval: 60,
      enabled: Boolean(gmailConfig.connectionId),
    };

    console.log("🟥 SAVING SCENARIO INCOMING LEAD:", incomingLeadObj);
    console.log("🟥 SAVING SCENARIO NODES:", rfNodes);
    console.log("🟥 SAVING SCENARIO EDGES:", rfEdges);
    console.log("🟥 SAVING SCENARIO BRANCHES:", scenario);

    const payload = {
      userId,
      name: scenarioName,
      description: "",
      type: "other",
      incomingLead: incomingLeadObj,
      routerBranches: scenario,
      rfNodes: rfNodes,
      rfEdges: rfEdges,
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
        else if (!cfg.subject) error = "Subject filter missing";
      }

      if (node.type === "templateNode") {
        if (!cfg.templateId && !cfg.template && !cfg.content && !cfg.body)
          error = "Template not selected";
        else if (!cfg.connectionId)
          error = "Sender connection missing";
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
      <div className="flex h-screen overflow-hidden bg-[#FAF8F5] font-sans antialiased text-slate-900">
        <Sidebar />

        <main className="flex flex-1 flex-col overflow-hidden min-w-0 pt-[60px]">
          {/* Top Header Bar (Full width, no max-width) */}
          <div className="sticky top-0 z-30 border-b border-slate-200 bg-[#FAF8F5] px-6 py-3 shadow-2xs w-full">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between w-full">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-medium text-slate-400">
                    Scenarios /
                  </span>
                  <div className="relative flex items-center group">
                    <input
                      type="text"
                      value={scenarioName}
                      placeholder="Custom Scenario — Automation Flow"
                      onChange={(e) => setScenarioName(e.target.value)}
                      className="text-sm sm:text-base font-bold text-slate-900 bg-transparent hover:bg-slate-100/70 focus:bg-white border border-transparent hover:border-slate-200 focus:border-slate-300 rounded-[6px] px-2 py-0.5 outline-none transition-all w-[280px] sm:w-[360px] truncate focus:not-truncate cursor-pointer focus:cursor-text"
                      title="Click to edit scenario name"
                    />
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100/90 border border-emerald-200/80 px-2.5 py-0.5 text-xs font-bold text-emerald-800 shrink-0">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-600"></span>
                    Live
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-600"></span>
                    Mailhook Active
                  </span>
                  <span className="text-slate-300 font-normal">|</span>
                  <span>{connections.length > 0 ? `${connections.length} Sender Accounts` : "1 Sender Accounts"}</span>
                  <span className="text-slate-300 font-normal">|</span>
                  <span>{rfNodes.filter(n => n.type !== "blankNode").length} Active Nodes</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowTestInstructionsModal(true)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50/80 px-3.5 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition cursor-pointer"
                >
                  <HelpCircle size={14} className="text-indigo-600" />
                  How to Test
                </button>

                <button
                  type="button"
                  onClick={() => setShowWebhookModal(true)}
                  className="rounded-full border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-800 shadow-2xs hover:bg-slate-50 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Zap size={14} className="text-amber-500" /> Webhook Info
                </button>

                <button
                  type="button"
                  onClick={handleRunTest}
                  className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50/80 px-3.5 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition cursor-pointer"
                >
                  <Sparkles size={14} className="text-indigo-600" />
                  Run Test
                </button>

                <button
                  type="button"
                  onClick={saveScenario}
                  className="rounded-full bg-[#111110] hover:bg-black px-4.5 py-1.5 text-xs font-bold text-white shadow-2xs transition cursor-pointer"
                >
                  {id ? "Update Scenario" : "Save Scenario"}
                </button>

                <div className="flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-1 shadow-2xs">
                  <span className="text-xs font-semibold text-slate-700">
                    {isActive ? "On" : "Off"}
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={() => {
                        if (!isActive) {
                          const ok = validateBeforeActivate();
                          if (!ok) return;
                        }
                        setIsActive(!isActive);
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-8 h-4 bg-slate-300 peer-checked:bg-emerald-600 rounded-full transition-colors"></div>
                    <div className="absolute left-0.5 top-0.5 w-3 h-3 bg-white rounded-full transition-transform peer-checked:translate-x-4"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Main Canvas Body */}
          <div className="flex-1 overflow-y-auto bg-[#FAF8F5] p-6 relative w-full">
            <div className="absolute inset-0 bg-[radial-gradient(#D5D1C8_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none"></div>

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-8 w-full">
              {/* LEFT SIDEBAR: Setup Checklist */}
              <div className="space-y-4">
                <div className="rounded-[20px] bg-gradient-to-b from-slate-950 via-zinc-900 to-black text-white p-5 border border-slate-800 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>

                  {(() => {
                    const checklistSteps = [];

                    const webhookNode = rfNodes.find((n) => n.type === "webhookNode");
                    const emailNode = rfNodes.find((n) => n.type === "gmailNode");

                    if (webhookNode) {
                      checklistSteps.push({
                        label: "Setup Webhook Trigger",
                        isComplete: Boolean(webhookUrl),
                        warning: !webhookUrl ? "Webhook URL missing" : null,
                        onClick: () => setShowWebhookModal(true),
                      });
                    } else if (emailNode) {
                      const hasConn = Boolean(emailNode.data?.config?.connectionId);
                      const hasSubj = Boolean(emailNode.data?.config?.subject && emailNode.data.config.subject.trim());
                      const isComplete = hasConn && hasSubj;
                      let warning = null;
                      if (!hasConn) warning = "Select email connection";
                      else if (!hasSubj) warning = "Subject filter missing";

                      checklistSteps.push({
                        label: "Configure Email Trigger",
                        isComplete,
                        warning,
                        onClick: () => {
                          setEditingNode(emailNode);
                          setShowEmailModal(true);
                        },
                      });
                    } else {
                      checklistSteps.push({
                        label: "Add Initial Trigger Node",
                        isComplete: false,
                        warning: "Click to select trigger node",
                        onClick: () => setShowModuleModal(true),
                      });
                    }

                    checklistSteps.push({
                      label: "Connect Sender Account",
                      isComplete: connections && connections.length > 0,
                      warning: !connections || connections.length === 0 ? "No sender connection" : null,
                      onClick: () => setShowGmailModal(true),
                    });

                    rfNodes
                      .filter((n) => n.type !== "blankNode" && n.type !== "webhookNode")
                      .forEach((n) => {
                        if (n.type === "gmailNode") {
                          const isConn = Boolean(n.data?.config?.connectionId);
                          checklistSteps.push({
                            label: `Configure Email ${n.data?.config?.subject || ""}`,
                            isComplete: isConn,
                            warning: !isConn ? "Sender connection missing" : null,
                            onClick: () => {
                              setEditingNode(n);
                              setShowEmailModal(true);
                            },
                          });
                        } else if (n.type === "templateNode") {
                          const hasTpl = Boolean(
                            n.data?.config?.templateId || n.data?.config?.name
                          );
                          checklistSteps.push({
                            label: `Review Template (${n.data?.config?.name || "Predefined"})`,
                            isComplete: hasTpl,
                            onClick: () => {
                              fetchActiveTemplates();
                              setShowTemplateModal(true);
                            },
                          });
                        } else if (n.type === "delayNode") {
                          const hasDelay = Boolean(n.data?.config?.delayValue);
                          checklistSteps.push({
                            label: `Configure Delay (${n.data?.config?.delayValue || 5} ${
                              n.data?.config?.delayUnit || "seconds"
                            })`,
                            isComplete: hasDelay,
                            onClick: () => {
                              setEditingNode(n);
                              setShowDelayModal(true);
                            },
                          });
                        } else if (n.type === "conditionNode") {
                          const hasFilter = Boolean(
                            n.data?.config?.conditions?.length
                          );
                          checklistSteps.push({
                            label: "Configure Filter Criteria",
                            isComplete: hasFilter,
                            onClick: () => {
                              setEditingNode(n);
                              setShowFilterModal(true);
                            },
                          });
                        }
                      });

                    const completedCount = checklistSteps.filter((s) => s.isComplete).length;
                    const progressPercent =
                      checklistSteps.length > 0
                        ? Math.round((completedCount / checklistSteps.length) * 100)
                        : 0;

                    return (
                      <>
                        <div className="flex items-center justify-between relative z-10 mb-2">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            Setup Checklist
                          </span>
                          <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800/50 px-2 py-0.5 rounded-full">
                            {progressPercent}% Complete
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-slate-800 rounded-full h-1.5 mb-5 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-emerald-500 to-teal-400 h-1.5 rounded-full transition-all duration-500"
                            style={{ width: `${progressPercent}%` }}
                          ></div>
                        </div>

                        <div className="space-y-2.5 relative z-10">
                          {checklistSteps.map((step, idx) => (
                            <div
                              key={idx}
                              onClick={step.onClick}
                              className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-900/80 transition cursor-pointer group border border-transparent hover:border-slate-800"
                            >
                              <div
                                className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold ${
                                  step.isComplete
                                    ? "bg-emerald-500 text-slate-950"
                                    : "border border-slate-600 text-slate-400 group-hover:border-slate-400"
                                }`}
                              >
                                {step.isComplete ? "✓" : idx + 1}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p
                                  className={`text-xs font-semibold ${
                                    step.isComplete
                                      ? "text-slate-300 line-through decoration-slate-600 opacity-80"
                                      : "text-slate-100"
                                  }`}
                                >
                                  {step.label}
                                </p>
                                {step.warning && (
                                  <p className="text-[10px] text-amber-400 mt-0.5 font-medium flex items-center gap-1">
                                    <span>⚠</span> {step.warning}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    );
                  })()}
                </div>

                {/* LEFT SIDEBAR: Testing Instructions Card */}
                <div className="rounded-[20px] bg-white p-5 border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                      <HelpCircle size={16} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Testing Guide</h4>
                      <p className="text-[11px] text-slate-500 font-medium">How to test your flow</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-slate-600 pt-1 border-t border-slate-100">
                    <div className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
                      <span>Click <b>Run Test</b> above to animate & validate node steps visually.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
                      <span>Or send a live email to your trigger address with subject filter e.g. <code className="bg-slate-100 px-1 py-0.5 rounded text-[10px]">Product Inquiry</code>.</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowTestInstructionsModal(true)}
                    className="w-full mt-2 py-2 px-3 rounded-[10px] bg-[#111110] hover:bg-black text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <HelpCircle size={14} /> Open Full Guide
                  </button>
                </div>
              </div>

              {/* RIGHT SIDE: ReactFlow Canvas Container */}
              <div className="bg-white/80 backdrop-blur-sm border border-slate-200/80 rounded-[24px] shadow-xl overflow-hidden h-[calc(100vh-170px)] relative">
                <ReactFlow
                  nodes={rfNodes.map((n) => ({
                    ...n,
                    data: {
                      ...n.data,
                      confirmDeleteNode: (nodeId) => {
                        setNodeToDelete(nodeId || n.id);
                        setShowDeleteConfirm(true);
                      },
                      openWebhookModal: () => setShowWebhookModal(true),
                      openModuleModal: (nodeId) => {
                        setEditingNode({ id: nodeId || n.id, type: n.type });
                        setShowModuleModal(true);
                      },
                      highlight: highlightedNodes.includes(n.id),
                      success: validNodes.includes(n.id),
                      executing: executingNode === n.id,
                      openTemplateModal: () => {
                        setEditingNode(n);
                        fetchActiveTemplates();
                        setShowTemplateModal(true);
                      },
                      openEditEmailModal: () => {
                        setEditingNode(n);
                        setShowEmailModal(true);
                      },
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

                {/* Floating Action Bar */}
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md shadow-lg border border-[#EBE8E1] rounded-full px-6 py-2.5 flex items-center gap-6 z-50 text-xs font-semibold text-slate-700">
                  <button
                    onClick={organizeNodes}
                    className="flex items-center gap-2 text-slate-800 hover:text-black transition cursor-pointer"
                  >
                    <ListOrdered size={16} className="text-purple-600" />
                    Organize
                  </button>

                  <div className="w-[1px] h-4 bg-[#E0DDD5]"></div>

                  <button
                    onClick={fetchTestEmail}
                    className="flex items-center gap-2 text-slate-800 hover:text-black transition cursor-pointer"
                  >
                    <MailCheck size={16} className="text-emerald-600" />
                    Test Email
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      {showTestEmailModal && (
        <TestEmailModal
          email={testEmail}
          onClose={() => setShowTestEmailModal(false)}
        />
      )}

      {showEdgeModal && selectedEdge && (
        <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-[20px] shadow-2xl w-80 space-y-5 border border-[#EBE8E1]">
            {/* Title */}
            <div className="flex justify-between items-center">
              <h2 className="text-base font-bold text-slate-900">
                Connection Options
              </h2>
              <button
                type="button"
                onClick={() => setShowEdgeModal(false)}
                className="text-slate-400 hover:text-slate-700 transition"
              >
                <FiX size={18} />
              </button>
            </div>

            {/* Buttons List */}
            <div className="space-y-2.5">
              <button
                type="button"
                className="w-full p-3 border border-red-200 rounded-[12px] bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold transition-all flex items-center gap-3 cursor-pointer"
                onClick={() => {
                  setRfEdges((edges) =>
                    edges.filter((e) => e.id !== selectedEdge.id),
                  );
                  setShowEdgeModal(false);
                }}
              >
                <FiX size={16} className="text-red-600" />
                Unlink Connection
              </button>

              <button
                type="button"
                className="w-full p-3 border border-purple-200 rounded-[12px] bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-semibold transition-all flex items-center gap-3 cursor-pointer"
                onClick={() => {
                  handleAddEmailTemplateFromEdge(selectedEdge);
                  setShowEdgeModal(false);
                }}
              >
                <FiFileText size={16} className="text-purple-600" />
                Add Email Template
              </button>

              <button
                type="button"
                className="w-full p-3 border border-amber-200 rounded-[12px] bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold transition-all flex items-center gap-3 cursor-pointer"
                onClick={() => {
                  handleAddDelayFromEdge(selectedEdge);
                  setShowEdgeModal(false);
                }}
              >
                <FiClock size={16} className="text-amber-600" />
                Add Delay
              </button>

              <button
                type="button"
                className="w-full p-3 border border-blue-200 rounded-[12px] bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-semibold transition-all flex items-center gap-3 cursor-pointer"
                onClick={() => {
                  handleAddConditionFromEdge(selectedEdge);
                  setShowEdgeModal(false);
                }}
              >
                <FiFilter size={16} className="text-blue-600" />
                Add Condition
              </button>
            </div>

            {/* Cancel */}
            <button
              type="button"
              className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-[8px] text-xs font-semibold text-slate-700 hover:bg-slate-200 transition cursor-pointer"
              onClick={() => setShowEdgeModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {showModuleModal && (
        <div className="fixed inset-0 z-[9999]  backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[8px]  w-[420px] overflow-hidden border ">
            {/* Header matching Image 1 */}
            <div className="flex justify-between items-center bg-[#111110] text-white px-6 py-4">
              <div>
                <h2 className="text-base font-bold text-white">
                  Select Application
                </h2>
                <p className="text-xs text-slate-400 mt-0.5 font-medium">
                  Choose an app to add to your workflow
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowModuleModal(false)}
                className="text-slate-400 hover:text-white transition p-1 rounded-full cursor-pointer"
              >
                <FiX size={18} />
              </button>
            </div>

            {/* Options List matching Image 1 */}
            <div className="p-6 space-y-3">
              <button
                type="button"
                className="w-full p-3.5 border border-slate-200/90 rounded-[16px] bg-white hover:border-slate-400 hover:shadow-2xs text-slate-800 text-xs font-bold transition-all flex items-center gap-3.5 cursor-pointer group"
                onClick={() => addModule("gmailNode")}
              >
                <div className="w-10 h-10 rounded-xl bg-[#111110] text-white flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                  <FiMail size={20} />
                </div>
                <div className="text-left">
                  <div className="text-slate-900 font-bold text-sm">Incoming Leads</div>
                  <div className="text-xs text-slate-400 font-medium mt-0.5">Gmail / Email Connection</div>
                </div>
              </button>

              <button
                type="button"
                className="w-full p-3.5 border border-slate-200/90 rounded-[16px] bg-white hover:border-slate-400 hover:shadow-2xs text-slate-800 text-xs font-bold transition-all flex items-center gap-3.5 cursor-pointer group"
                onClick={() => addModule("templateNode")}
              >
                <div className="w-10 h-10 rounded-xl bg-[#111110] text-white flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                  <FiFileText size={20} />
                </div>
                <div className="text-left">
                  <div className="text-slate-900 font-bold text-sm">Email Template</div>
                  <div className="text-xs text-slate-400 font-medium mt-0.5">Email Template</div>
                </div>
              </button>

              <button
                type="button"
                className="w-full p-3.5 border border-slate-200/90 rounded-[16px] bg-white hover:border-slate-400 hover:shadow-2xs text-slate-800 text-xs font-bold transition-all flex items-center gap-3.5 cursor-pointer group"
                onClick={() => addModule("delayNode")}
              >
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                  <FiClock size={20} />
                </div>
                <div className="text-left">
                  <div className="text-slate-900 font-bold text-sm">Delay</div>
                  <div className="text-xs text-slate-400 font-medium mt-0.5">Delay</div>
                </div>
              </button>

              <button
                type="button"
                className="w-full p-3.5 border border-slate-200/90 rounded-[16px] bg-white hover:border-slate-400 hover:shadow-2xs text-slate-800 text-xs font-bold transition-all flex items-center gap-3.5 cursor-pointer group"
                onClick={() => addModule("webhookNode")}
              >
                <div className="w-10 h-10 rounded-xl bg-[#111110] text-white flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                  <Zap size={20} />
                </div>
                <div className="text-left">
                  <div className="text-slate-900 font-bold text-sm">Webhook Trigger</div>
                  <div className="text-xs text-slate-400 font-medium mt-0.5">Custom Mailhook Request</div>
                </div>
              </button>

              <button
                type="button"
                className="w-full p-3.5 border border-slate-200/90 rounded-[16px] bg-white hover:border-slate-400 hover:shadow-2xs text-slate-800 text-xs font-bold transition-all flex items-center gap-3.5 cursor-pointer group"
                onClick={() => addModule("conditionNode")}
              >
                <div className="w-10 h-10 rounded-xl bg-[#111110] text-white flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                  <FiFilter size={20} />
                </div>
                <div className="text-left">
                  <div className="text-slate-900 font-bold text-sm">Condition</div>
                  <div className="text-xs text-slate-400 font-medium mt-0.5">Filter criteria</div>
                </div>
              </button>
            </div>
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
          showTemplateOption={isTemplateAvailable}
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

      {showTemplateModal && (
        <TemplateModal
          node={editingNode}
          templates={otherActiveTemplates}
          connections={connections}
          fetchActiveTemplates={fetchActiveTemplates}
          onClose={() => setShowTemplateModal(false)}
          onSave={(data) => {
            setRfNodes((prev) =>
              prev.map((n) =>
                n.id === (editingNode?.id || editingNode)
                  ? { ...n, data: { ...n.data, config: data } }
                  : n,
              ),
            );
            setShowTemplateModal(false);
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
            await fetchTestEmail();
            setShowTestEmailModal(true);
          }}
        />
      )}

      {showTestInstructionsModal && (
        <TestInstructionsModal
          onClose={() => setShowTestInstructionsModal(false)}
          onRunCanvasTest={runScenarioExecutionAnimation}
        />
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-[20px] shadow-2xl w-80 space-y-4 border border-[#EBE8E1]">
            <h2 className="text-base font-bold text-slate-900">
              Delete Module?
            </h2>
            <p className="text-xs leading-relaxed text-slate-500">
              Are you sure you want to delete this module?
            </p>

            <div className="flex justify-end gap-2.5 mt-5">
              <button
                type="button"
                className="px-4 py-2 bg-slate-100 border border-slate-200 rounded-[8px] text-xs font-semibold text-slate-700 hover:bg-slate-200 transition cursor-pointer"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setNodeToDelete(null);
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                className="px-4 py-2 bg-red-600 text-white rounded-[8px] text-xs font-semibold hover:bg-red-700 transition cursor-pointer"
                onClick={performDeleteNode}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </ReactFlowProvider>
  );
};

export default OthersScenariosPage;

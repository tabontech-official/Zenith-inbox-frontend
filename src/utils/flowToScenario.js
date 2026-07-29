export default function flowToScenario(nodes = [], edges = []) {
  if (!nodes || nodes.length === 0) return [];

  // Filter out blank nodes
  const activeNodes = nodes.filter((n) => n.type !== "blankNode");
  if (activeNodes.length === 0) return [];

  // Build adjacency list graph
  const graph = {};
  edges.forEach((e) => {
    if (!graph[e.source]) graph[e.source] = [];
    graph[e.source].push(e.target);
  });

  // Find root nodes (nodes with no incoming edges)
  const incomingTargets = new Set(edges.map((e) => e.target));
  let rootNodes = activeNodes.filter((n) => !incomingTargets.has(n.id));

  // Fallback if all active nodes are connected in cyclic/orphan format
  if (rootNodes.length === 0) {
    rootNodes = [activeNodes[0]];
  }

  const resultBranches = rootNodes.map((rootNode, index) => {
    const visitedIds = walkBranch(rootNode.id, graph);

    const modules = visitedIds
      .map((id) => {
        const n = nodes.find((item) => item.id === id);
        if (!n) return null;

        const config = n.data?.config || {};

        return {
          id: n.id,
          type:
            n.type === "gmailNode"
              ? "Send Email"
              : n.type === "templateNode"
              ? "Template"
              : n.type === "delayNode"
              ? "Delay"
              : n.type === "conditionNode"
              ? "Condition"
              : n.type === "webhookNode"
              ? "Webhook"
              : n.type,
          nodeType: n.type,
          emailType:
            n.type === "gmailNode"
              ? "Gmail"
              : n.type === "outlookNode"
              ? "Email"
              : undefined,
          to: config.to || "",
          subject: config.subject || "",
          cc: config.cc || [],
          bcc: config.bcc || [],
          connectionId: config.connectionId || "",
          connectionEmail: config.connectionEmail || "",
          templateId: config.templateId || null,
          templateName: config.name || "",
          templateContent: config.content || config.body || "",
          delayValue: config.delayValue || null,
          delayUnit: config.delayUnit || null,
          filter: config.conditions ? config : null,
          position: n.position,
          config: config,
        };
      })
      .filter(Boolean);

    return {
      id: index + 1,
      modules,
    };
  });

  return resultBranches;
}

function walkBranch(startId, graph) {
  const visited = [];
  let current = startId;

  while (current && !visited.includes(current)) {
    visited.push(current);
    const next = graph[current];
    if (!next || next.length === 0) break;
    current = next[0];
  }

  return visited;
}

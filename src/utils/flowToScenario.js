// Convert React Flow nodes + edges → routerBranches (scenario format)
export default function flowToScenario(nodes, edges) {
  const routerNode = nodes.find((n) => n.type === "routerNode");
  const webhookNode = nodes.find((n) => n.type === "webhookNode");

  if (!routerNode || !webhookNode) {
    return [];
  }

  // Build adjacency map
  const graph = {};
  edges.forEach((e) => {
    if (!graph[e.source]) graph[e.source] = [];
    graph[e.source].push(e.target);
  });

  // Get all direct branches from router
  const routerBranches = (graph[routerNode.id] || []).map((branchId) => ({
    branchId,
    nodes: traverseBranch(branchId, graph),
  }));

  // Convert branches into scenario-friendly format
  const finalBranches = routerBranches.map((branch) => {
    const modules = [];
    let filter = null;

    branch.nodes.forEach((node) => {
      const rfNode = nodes.find((n) => n.id === node);
      if (!rfNode) return;

      // Router filters
      if (rfNode.type === "routerNode") {
        filter = rfNode.data.config;
      }

      // Email modules
      if (
        rfNode.type === "gmailNode" ||
        rfNode.type === "outlookNode" ||
        rfNode.type === "customEmailNode"
      ) {
        modules.push({
          type:
            rfNode.type === "gmailNode"
              ? "Send Email"
              : rfNode.type === "outlookNode"
              ? "Outlook"
              : "Custom Email",
          ...rfNode.data.config,
        });
      }

      // Delay module
      if (rfNode.type === "delayNode") {
        modules.push({
          type: "Delay",
          delayValue: rfNode.data.config.delayValue,
          delayUnit: rfNode.data.config.delayUnit,
        });
      }
    });

    return { filter, modules };
  });

  return finalBranches;
}

// BFS or DFS through branch chain
function traverseBranch(start, graph) {
  const visited = [];
  let current = start;

  while (current && !visited.includes(current)) {
    visited.push(current);

    const next = graph[current];
    if (!next || next.length === 0) break;

    current = next[0];
  }

  return visited;
}

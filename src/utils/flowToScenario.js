// // Convert React Flow nodes + edges → routerBranches (scenario format)
// export default function flowToScenario(nodes, edges) {
//   const routerNode = nodes.find((n) => n.type === "routerNode");
//   const webhookNode = nodes.find((n) => n.type === "webhookNode");

//   if (!routerNode || !webhookNode) {
//     return [];
//   }

//   // Build adjacency map
//   const graph = {};
//   edges.forEach((e) => {
//     if (!graph[e.source]) graph[e.source] = [];
//     graph[e.source].push(e.target);
//   });

//   // Get all direct branches from router
//   const routerBranches = (graph[routerNode.id] || []).map((branchId) => ({
//     branchId,
//     nodes: traverseBranch(branchId, graph),
//   }));

//   // Convert branches into scenario-friendly format
//   const finalBranches = routerBranches.map((branch) => {
//     const modules = [];
//     let filter = null;

//     branch.nodes.forEach((node) => {
//       const rfNode = nodes.find((n) => n.id === node);
//       if (!rfNode) return;

//       // Router filters
//       if (rfNode.type === "routerNode") {
//         filter = rfNode.data.config;
//       }

//       // Email modules
//       if (
//         rfNode.type === "gmailNode" ||
//         rfNode.type === "outlookNode" ||
//         rfNode.type === "customEmailNode"
//       ) {
//         modules.push({
//           type:
//             rfNode.type === "gmailNode"
//               ? "Send Email"
//               : rfNode.type === "outlookNode"
//               ? "Outlook"
//               : "Custom Email",
//           ...rfNode.data.config,
//         });
//       }

//       // Delay module
//       if (rfNode.type === "delayNode") {
//         modules.push({
//           type: "Delay",
//           delayValue: rfNode.data.config.delayValue,
//           delayUnit: rfNode.data.config.delayUnit,
//         });
//       }
//     });

//     return { filter, modules };
//   });

//   return finalBranches;
// }

// // BFS or DFS through branch chain
// function traverseBranch(start, graph) {
//   const visited = [];
//   let current = start;

//   while (current && !visited.includes(current)) {
//     visited.push(current);

//     const next = graph[current];
//     if (!next || next.length === 0) break;

//     current = next[0];
//   }

//   return visited;
// }

export default function flowToScenario(nodes, edges) {
  if (!nodes || nodes.length === 0) return [];

  const graph = {};
  edges.forEach((e) => {
    if (!graph[e.source]) graph[e.source] = [];
    graph[e.source].push(e.target);
  });

  const routerNode = nodes.find((n) => n.type === "routerNode");

  let branchStarts = [];

  if (routerNode) {
    branchStarts = graph[routerNode.id] || [];
  } else {
    const first = findStartNode(nodes, edges);
    branchStarts = first ? [first.id] : [];
  }

  const resultBranches = branchStarts.map((startNodeId, index) => {
    const visitedNodeIds = walk(startNodeId, graph);

    let filter = null;
    const modules = [];

    visitedNodeIds.forEach((id) => {
      const n = nodes.find((item) => item.id === id);
      if (!n) return;

      const config = n.data?.config || {};

      if (n.type === "conditionNode" || n.type === "routerNode") {
        filter = {
          label: config.label || "",
          conditions: (config.conditions || []).filter(
            (c) => c.field && c.value
          ),
          template: config.template || "",
        };
        return;
      }

      if (n.type === "delayNode") {
        modules.push({
          id: n.id,
          type: "Delay",
          delayValue: config.delayValue || 0,
          delayUnit: config.delayUnit || "seconds",
          emailType: "Delay",
          position: n.position,
        });
        return;
      }

      if (
        n.type === "gmailNode" ||
        n.type === "outlookNode" ||
        n.type === "customEmailNode"
      ) {
        const emailType =
          n.type === "gmailNode"
            ? "Gmail"
            : n.type === "outlookNode"
            ? "Email"
            : "Email";

        modules.push({
          id: n.id,
          type:
            n.type === "gmailNode"
              ? "Send Email"
              : n.type === "outlookNode"
              ? "Outlook"
              : "Custom Email",

          emailType, // REQUIRED ENUM

          connectionId: config.connectionId || "",
          to: config.to || "",
          subject: config.subject || "",
          cc: config.cc || [],
          bcc: config.bcc || [],
          template: config.body || "",
          position: n.position,
        });
      }
    });

    return {
      id: index + 1, // 🔥 REQUIRED BY MONGOOSE
      filter,
      modules,
    };
  });

  return resultBranches;
}

// --- HELPERS ---
function walk(start, graph) {
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

function findStartNode(nodes, edges) {
  const targets = edges.map((e) => e.target);
  return nodes.find((n) => !targets.includes(n.id));
}

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

  // Build graph
  const graph = {};
  edges.forEach((e) => {
    if (!graph[e.source]) graph[e.source] = [];
    graph[e.source].push(e.target);
  });

  // Find webhook root node
  const webhookNode = nodes.find((n) => n.type === "webhookNode");
  if (!webhookNode) return [];

  // All outgoing nodes from webhook = branches
  const branchStarts = graph[webhookNode.id] || [];

  const resultBranches = branchStarts.map((startNodeId, index) => {
    const visited = walkBranch(startNodeId, graph);

    const modules = [];
    let filter = null;

    visited.forEach((id) => {
      const n = nodes.find((item) => item.id === id);
      if (!n) return;

      const config = n.data?.config || {};

      // Condition Node
      // if (n.type === "conditionNode") {
      //   filter = {
      //     conditions: config.conditions || [],
      //   };
      //   return;
      // }

      // Condition node in branch
      if (n.type === "conditionNode") {
        modules.push({
          id: n.id,
          type: "Condition",
          position: n.position,
          filter: config, // conditions
        });
        return;
      }
      // Delay Node
      if (n.type === "delayNode") {
        modules.push({
          id: n.id,
          type: "Delay",
          delayValue: config.delayValue,
          delayUnit: config.delayUnit,
          emailType: "Delay",
          position: n.position,
        });
        return;
      }

      // Email Node
      if (n.type === "gmailNode" || n.type === "outlookNode") {
        modules.push({
          id: n.id,
          type: "Send Email",
          to: config.to,
          subject: config.subject,
          cc: config.cc || [],
          bcc: config.bcc || [],
          template: config.body,
          emailType: n.type === "gmailNode" ? "Gmail" : "Email",
          connectionId: config.connectionId,
          position: n.position,
        });
      }
    });

    return {
      id: index + 1,
      filter,
      modules,
    };
  });

  return resultBranches;
}

// Walk down each branch
function walkBranch(start, graph) {
  const visited = [];
  let current = start;

  while (current && !visited.includes(current)) {
    visited.push(current);

    const next = graph[current];
    if (!next || next.length === 0) break;

    // Always choose first child (your UI constrains 1 chain per branch)
    current = next[0];
  }

  return visited;
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

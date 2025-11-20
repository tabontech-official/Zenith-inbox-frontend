// export default function flowToScenario(nodes, edges) {
//   if (!nodes || nodes.length === 0) return [];

//   // Build graph
//   const graph = {};
//   edges.forEach((e) => {
//     if (!graph[e.source]) graph[e.source] = [];
//     graph[e.source].push(e.target);
//   });

//   // Find webhook root node
//   const webhookNode = nodes.find((n) => n.type === "webhookNode");
//   if (!webhookNode) return [];

//   // All outgoing nodes from webhook = branches
//   const branchStarts = graph[webhookNode.id] || [];

//   const resultBranches = branchStarts.map((startNodeId, index) => {
//     const visited = walkBranch(startNodeId, graph);

//     const modules = [];
//     let filter = null;

//     visited.forEach((id) => {
//       const n = nodes.find((item) => item.id === id);
//       if (!n) return;

//       const config = n.data?.config || {};

//       // Condition Node
//       // if (n.type === "conditionNode") {
//       //   filter = {
//       //     conditions: config.conditions || [],
//       //   };
//       //   return;
//       // }

//       // Condition node in branch
//       if (n.type === "conditionNode") {
//         modules.push({
//           id: n.id,
//           type: "Condition",
//           position: n.position,
//           filter: config, // conditions
//         });
//         return;
//       }
//       // Delay Node
//       if (n.type === "delayNode") {
//         modules.push({
//           id: n.id,
//           type: "Delay",
//           delayValue: config.delayValue,
//           delayUnit: config.delayUnit,
//           emailType: "Delay",
//           position: n.position,
//         });
//         return;
//       }

//       // Email Node
//       if (n.type === "gmailNode" || n.type === "outlookNode") {
//         modules.push({
//           id: n.id,
//           type: "Send Email",
//           to: config.to,
//           subject: config.subject,
//           cc: config.cc || [],
//           bcc: config.bcc || [],
//           template: config.body,
//           emailType: n.type === "gmailNode" ? "Gmail" : "Email",
//           connectionId: config.connectionId,
//           position: n.position,
//         });
//       }
//     });

//     return {
//       id: index + 1,
//       filter,
//       modules,
//     };
//   });

//   return resultBranches;
// }

// // Walk down each branch
// function walkBranch(start, graph) {
//   const visited = [];
//   let current = start;

//   while (current && !visited.includes(current)) {
//     visited.push(current);

//     const next = graph[current];
//     if (!next || next.length === 0) break;

//     // Always choose first child (your UI constrains 1 chain per branch)
//     current = next[0];
//   }

//   return visited;
// }

// // --- HELPERS ---
// function walk(start, graph) {
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

// function findStartNode(nodes, edges) {
//   const targets = edges.map((e) => e.target);
//   return nodes.find((n) => !targets.includes(n.id));
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

      // ⭐ CONDITION NODE
      if (n.type === "conditionNode") {
        modules.push({
          id: n.id,
          type: "Condition",
          position: n.position,
          filter: config,
        });
        return;
      }

      // ⭐ DELAY NODE
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

      // ⭐⭐ NEW: TEMPLATE NODE SUPPORT ⭐⭐
      if (n.type === "templateNode") {
        modules.push({
          id: n.id,
          type: "Template",            // DB me read-friendly name
          templateId: config.templateId || null,
          templateName: config.name || "",
          templateContent: config.content || "",
          position: n.position,
        });
        return;
      }

      // ⭐ EMAIL NODE (Gmail / Outlook)
      if (n.type === "gmailNode" || n.type === "outlookNode") {
        modules.push({
          id: n.id,
          type: "Send Email",
          to: config.to,
          subject: config.subject,
          cc: config.cc || [],
          bcc: config.bcc || [],
template: config.templateId ? config.templateId : config.body,
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

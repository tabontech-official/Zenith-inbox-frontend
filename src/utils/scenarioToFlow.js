// Convert scenario routerBranches → React Flow nodes + edges
export default function scenarioToFlow(scenario) {
  const nodes = [];
  const edges = [];

  if (!scenario || !scenario.routerBranches) {
    return { nodes: [], edges: [] };
  }

  let posY = 150;

  // Helper 💡 ensure every node has a valid position
  const makePos = (x, y) => ({
    x: Number.isFinite(x) ? x : 0,
    y: Number.isFinite(y) ? y : 0,
  });

  // 🔴 1) Webhook Node (START)
  const webhookId = "webhook-1";
  nodes.push({
    id: webhookId,
    type: "webhookNode",
    position: makePos(50, posY),
    data: { label: "Webhook", config: {} },
  });

  // 🟢 2) Router Node
  const routerId = "router-1";
  nodes.push({
    id: routerId,
    type: "routerNode",
    position: makePos(350, posY),
    data: { label: "Router", config: {} },
  });

  edges.push({
    id: `edge-${webhookId}-${routerId}`,
    source: webhookId,
    target: routerId,
  });

  // 🟡 3) Branches + Modules
  scenario.routerBranches.forEach((branch, branchIndex) => {
    let prevNodeId = routerId;

    let branchY = posY + branchIndex * 220;
    let posX = 650;

    // OPTIONAL: branch filter
    if (branch.filter) {
      const filterId = `filter-${branchIndex}`;

      nodes.push({
        id: filterId,
        type: "routerNode",
        position: makePos(posX, branchY),
        data: {
          label: branch.filter.label || `Branch ${branchIndex + 1}`,
          config: branch.filter,
        },
      });

      edges.push({
        id: `edge-${prevNodeId}-${filterId}`,
        source: prevNodeId,
        target: filterId,
      });

      prevNodeId = filterId;
      posX += 270;
    }

    // Modules
    (branch.modules || []).forEach((mod, modIndex) => {
      const nodeId = `branch-${branchIndex}-mod-${modIndex}`;

      let type = "gmailNode";
      if (mod.type === "Custom Email") type = "customEmailNode";
      if (mod.type === "Outlook") type = "outlookNode";
      if (mod.type === "Delay") type = "delayNode";

      nodes.push({
        id: nodeId,
        type,
        position: makePos(posX, branchY),
        data: { label: mod.type, config: mod },
      });

      edges.push({
        id: `edge-${prevNodeId}-${nodeId}`,
        source: prevNodeId,
        target: nodeId,
      });

      prevNodeId = nodeId;
      posX += 280;
    });
  });

  return { nodes, edges };
}

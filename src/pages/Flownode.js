import ReactFlow, {
  addEdge,
  Background,
  Controls,
  ReactFlowProvider,
} from "react-flow-renderer";
import { useCallback, useMemo, useState } from "react";
import { Cloud, GitBranch, Mail, Clock, Plus } from "lucide-react";

const dottedLineStyle = {
  strokeDasharray: "5,5",
  strokeWidth: 2,
  stroke: "#a855f7",
};

const nodeBase = {
  width: 190,
  padding: 14,
  borderRadius: 20,
  borderWidth: 3,
  borderStyle: "solid",
  fontSize: 13,
  fontWeight: 500,
  textAlign: "center",
  background: "white",
  boxShadow: "0 4px 8px rgba(0,0,0,0.08)",
};

const getStyle = (type) => {
  switch (type) {
    case "webhook":
      return { borderColor: "#ef4444", icon: Cloud, color: "#ef4444", bg: "#fef2f2" };
    case "router":
      return { borderColor: "#22c55e", icon: GitBranch, color: "#22c55e", bg: "#f0fdf4" };
    case "email":
      return { borderColor: "#3b82f6", icon: Mail, color: "#3b82f6", bg: "#eff6ff" };
    case "delay":
      return { borderColor: "#f59e0b", icon: Clock, color: "#f59e0b", bg: "#fff7ed" };
    default:
      return { borderColor: "#a855f7", icon: Plus, color: "#a855f7", bg: "#f3e8ff" };
  }
};

const CustomNode = ({ data }) => {
  const { label, type } = data;
  const { icon: Icon, borderColor, color, bg } = getStyle(type);
  return (
    <div
      style={{
        ...nodeBase,
        borderColor,
        backgroundColor: bg,
      }}
      className="flex items-center justify-center space-x-2"
    >
      <Icon size={18} color={color} />
      <span style={{ color: "#374151" }}>{label}</span>
    </div>
  );
};

const nodeTypes = { custom: CustomNode };

const SimpleFlowLayout = ({ routerBranches, onAddModule, onAddBranch }) => {
  const initialNodes = useMemo(() => {
    const nodes = [
      {
        id: "1",
        type: "custom",
        position: { x: 300, y: 50 },
        data: { label: "Webhook", type: "webhook" },
      },
      {
        id: "2",
        type: "custom",
        position: { x: 300, y: 200 },
        data: { label: "Router", type: "router" },
      },
    ];

    // Branches and their modules
    routerBranches.forEach((branch, i) => {
      branch.modules.forEach((mod, j) => {
        const y = 400 + j * 160;
        const x = 50 + i * 250;
        nodes.push({
          id: `${i + 3}-${j}`,
          type: "custom",
          position: { x, y },
          data: { label: mod.app.name, type: mod.app.name.toLowerCase() },
        });
      });
    });
    return nodes;
  }, [routerBranches]);

  const initialEdges = useMemo(() => {
    const edges = [
      { id: "e1-2", source: "1", target: "2", style: dottedLineStyle },
    ];

    routerBranches.forEach((branch, i) => {
      branch.modules.forEach((mod, j) => {
        if (j === 0)
          edges.push({
            id: `e2-${i + 3}-${j}`,
            source: "2",
            target: `${i + 3}-${j}`,
            style: dottedLineStyle,
          });
        else
          edges.push({
            id: `e${i + 3}-${j - 1}-${i + 3}-${j}`,
            source: `${i + 3}-${j - 1}`,
            target: `${i + 3}-${j}`,
            style: dottedLineStyle,
          });
      });
    });
    return edges;
  }, [routerBranches]);

  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);

  return (
    <div style={{ height: 700 }} className="rounded-xl border shadow-inner bg-white">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        connectionLineType="step"
        connectionLineStyle={dottedLineStyle}
        fitView
      >
        <Controls />
        <Background color="#ddd" variant="dots" />
      </ReactFlow>

      {/* Add buttons below */}
      <div className="flex justify-center gap-4 py-4">
        <button
          onClick={onAddModule}
          className="px-4 py-2 bg-purple-100 text-purple-700 border border-purple-400 rounded-lg hover:bg-purple-200 transition"
        >
          + Add Module
        </button>
        <button
          onClick={onAddBranch}
          className="px-4 py-2 bg-green-100 text-green-700 border border-green-400 rounded-lg hover:bg-green-200 transition"
        >
          + Add Branch
        </button>
      </div>
    </div>
  );
};

// Wrap with provider in OthersScenariosPage
const FlowWrapper = (props) => (
  <ReactFlowProvider>
    <SimpleFlowLayout {...props} />
  </ReactFlowProvider>
);

export default FlowWrapper;

import React from "react";
import type { Agent } from "./AgentCanvasWrapper";

interface ContextMenuProps {
  position: { x: number; y: number };
  agent: Agent | null;
  onEdit: (agent: Agent) => void;
  onDelete: (agentId: number) => void;
  onAddAgent: () => void;
  onClose: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({
  position,
  agent,
  onEdit,
  onDelete,
  onAddAgent,
  onClose,
}) => {
  return (
    <div
      className="fixed bg-white border border-gray-300 p-2 z-50 shadow-lg rounded-md"
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
    >
      {agent ? (
        <>
          <div className="font-bold mb-2">Agent Menu</div>
          <div
            className="p-2 cursor-pointer hover:bg-blue-100 rounded-md text-blue-700"
            onClick={() => {
              onEdit(agent);
              onClose();
            }}
          >
            Edit Agent
          </div>
          <div
            className="p-2 cursor-pointer hover:bg-red-100 rounded-md text-red-700"
            onClick={() => {
              onDelete(agent.id);
              onClose();
            }}
          >
            Delete Agent
          </div>
          <div className="p-2 cursor-pointer hover:bg-gray-100 rounded-md text-gray-700" onClick={onClose}>
            View Agent Details
          </div>
          <div className="p-2 cursor-pointer hover:bg-gray-100 rounded-md text-gray-700" onClick={onClose}>
            Assign Task
          </div>
        </>
      ) : (
        <>
          <div className="font-bold mb-2">Canvas Menu</div>
          <div
            className="p-2 cursor-pointer hover:bg-green-100 rounded-md text-green-700"
            onClick={() => {
              onAddAgent();
              onClose();
            }}
          >
            Add Agent
          </div>
          <div className="p-2 cursor-pointer hover:bg-gray-100 rounded-md text-gray-700" onClick={onClose}>
            Zoom In
          </div>
          <div className="p-2 cursor-pointer hover:bg-gray-100 rounded-md text-gray-700" onClick={onClose}>
            Zoom Out
          </div>
          <div className="p-2 cursor-pointer hover:bg-gray-100 rounded-md text-gray-700" onClick={onClose}>
            Reset View
          </div>
        </>
      )}
    </div>
  );
};

export default ContextMenu;
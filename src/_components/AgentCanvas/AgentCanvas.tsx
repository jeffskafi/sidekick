"use client";

import React, { useEffect, useRef } from "react";
import { Stage, Layer, Rect } from "react-konva";
import type Konva from "konva";
import type { Agent } from "~/server/db/schema";
import { useCanvasScaling } from "~/hooks/useCanvasScaling";
import { useAgentSelection } from "~/hooks/useAgentSelection";
import { useAgentMovement } from "~/hooks/useAgentMovement";
import { useStageInteractions } from "~/hooks/useStageInteractions";
import { useContextMenu } from "~/hooks/useContextMenu";
import ContextMenu from "./ContextMenu";
import AgentGroup from "./AgentGroup";

interface AgentCanvasProps {
  agents: Agent[];
  onSelect: (agent: Agent | Agent[]) => void;
  onEdit: (agent: Agent) => void;
  onDelete: (agentId: number) => void;
  onUpdateAgent: (agent: Agent) => void;
}

const AgentCanvas: React.FC<AgentCanvasProps> = ({
  agents,
  onSelect,
  onEdit,
  onDelete,
  onUpdateAgent,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scale, stageSize, updateStageSize } = useCanvasScaling(containerRef);
  const { selectedAgents, handleSelect } = useAgentSelection(agents, onSelect);
  const moveAgents = useAgentMovement(onUpdateAgent);
  const stageRef = useRef<Konva.Stage>(null);

  const {
    isDragging,
    isRightClicking,
    selectionArea,
    handleStageMouseDown,
    handleStageMouseMove,
    handleStageMouseUp,
  } = useStageInteractions(
    handleSelect,
    moveAgents,
    selectedAgents,
    stageRef
  );

  const { contextMenu, handleContextMenu, closeContextMenu } = useContextMenu();

  useEffect(() => {
    updateStageSize();
  }, [updateStageSize]);

  return (
    <div
      ref={containerRef}
      className="relative h-[600px] w-full bg-gray-100"
      onContextMenu={(e) => e.preventDefault()}
    >
      <Stage
        ref={stageRef}
        width={stageSize.width}
        height={stageSize.height}
        scaleX={scale}
        scaleY={scale}
        onMouseDown={handleStageMouseDown}
        onMouseMove={handleStageMouseMove}
        onMouseUp={(e) => handleStageMouseUp(e, agents)}
        onContextMenu={(e) => handleContextMenu(e, null)}
      >
        <Layer>
          {agents.map((agent) => (
            <AgentGroup
              key={agent.id}
              agent={agent}
              isSelected={selectedAgents.some((a) => a.id === agent.id)}
              onClick={handleSelect}
              onContextMenu={handleContextMenu}
            />
          ))}
          {selectionArea.start && selectionArea.end && (
            <Rect
              x={Math.min(selectionArea.start.x, selectionArea.end.x)}
              y={Math.min(selectionArea.start.y, selectionArea.end.y)}
              width={Math.abs(selectionArea.end.x - selectionArea.start.x)}
              height={Math.abs(selectionArea.end.y - selectionArea.start.y)}
              fill="rgba(0, 0, 255, 0.1)"
              stroke="blue"
            />
          )}
        </Layer>
      </Stage>
      {contextMenu.isOpen && contextMenu.position && (
        <ContextMenu
          position={contextMenu.position}
          agent={contextMenu.agent}
          onEdit={onEdit}
          onDelete={onDelete}
          onClose={closeContextMenu}
        />
      )}
    </div>
  );
};

export default AgentCanvas;
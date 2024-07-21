"use client";

import { useRef, useCallback, useEffect } from "react";
import { Stage, Layer, Rect } from "react-konva";
import { useAgentContext } from "~/contexts/AgentContext";
import { useCanvasScaling } from "~/hooks/useCanvasScaling";
import { useStageInteractions } from "~/hooks/useStageInteractions";
import { useSelectionArea } from "~/hooks/useSelectionArea";
import { useAgentMovement } from "~/hooks/useAgentMovement";
import AgentGroup from "./AgentGroup";
import type { Agent } from "~/server/db/schema";
import type Konva from "konva";

interface AgentCanvasProps {
  className?: string;
}

export default function AgentCanvas({ className }: AgentCanvasProps) {
  const { agents, selectedAgents, selectAgents, updateAgent } =
    useAgentContext();

  const containerRef = useRef<HTMLDivElement>(null);
  const { scale, stageSize } = useCanvasScaling(containerRef);

  const { selectionArea, startSelection, updateSelection, endSelection } =
    useSelectionArea(scale);

  const { moveSingleAgent, moveAgentGroup } = useAgentMovement(updateAgent);

  const handleSelect = useCallback(
    (agentOrAgents: Agent | Agent[]) => {
      selectAgents(
        Array.isArray(agentOrAgents) ? agentOrAgents : [agentOrAgents],
      );
    },
    [selectAgents],
  );

  const handleAgentMove = useCallback(
    (agentsToMove: Agent[], newPosition: { x: number; y: number }, stage: Konva.Stage) => {
      if (agentsToMove.length === 1 && agentsToMove[0]) {
        moveSingleAgent(agentsToMove[0], newPosition, stage, agents);
      } else if (agentsToMove.length > 1) {
        moveAgentGroup(agentsToMove, newPosition, stage, agents);
      }
    },
    [agents, moveSingleAgent, moveAgentGroup]
  );

  const {
    handleStageMouseDown,
    handleStageTouchStart,
    handleStageMouseMove,
    handleStageTouchMove,
    handleStageMouseUp,
    handleStageTouchEnd,
  } = useStageInteractions(
    handleSelect,
    handleAgentMove,
    selectedAgents,
    agents,
    startSelection,
    updateSelection,
    endSelection,
  );

  // Prevent context menu on the canvas
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      const preventDefault = (e: Event) => {
        e.preventDefault();
      };
      container.addEventListener("contextmenu", preventDefault);
      return () => {
        container.removeEventListener("contextmenu", preventDefault);
      };
    }
  }, []);

  const selectionRect =
    selectionArea.start && selectionArea.end
      ? {
          x: Math.min(selectionArea.start.x, selectionArea.end.x),
          y: Math.min(selectionArea.start.y, selectionArea.end.y),
          width: Math.abs(selectionArea.end.x - selectionArea.start.x),
          height: Math.abs(selectionArea.end.y - selectionArea.start.y),
        }
      : null;

  return (
    <div
      ref={containerRef}
      className={`no-scroll flex-grow bg-gray-100 ${className}`}
    >
      <Stage
        width={stageSize.width}
        height={stageSize.height}
        scaleX={scale}
        scaleY={scale}
        onMouseDown={handleStageMouseDown}
        onTouchStart={handleStageTouchStart}
        onMouseMove={handleStageMouseMove}
        onTouchMove={handleStageTouchMove}
        onMouseUp={handleStageMouseUp}
        onTouchEnd={handleStageTouchEnd}
      >
        <Layer>
          {agents.map((agent) => (
            <AgentGroup
              key={agent.id}
              agent={agent}
              isSelected={selectedAgents.some((a) => a.id === agent.id)}
              onSelect={handleSelect}
              allAgents={agents}
            />
          ))}
          {selectionRect && (
            <Rect
              x={selectionRect.x}
              y={selectionRect.y}
              width={selectionRect.width}
              height={selectionRect.height}
              fill="rgba(0, 0, 0, 0.05)"
              stroke="#000"
              strokeWidth={0.5}
              dash={[4, 2]}
              cornerRadius={30}
              opacity={0.5}
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
}

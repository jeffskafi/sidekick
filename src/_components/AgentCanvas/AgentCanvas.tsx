"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Stage, Layer, Circle, Text, Group, Rect } from "react-konva";
import type Konva from "konva";
import type { KonvaEventObject } from "konva/lib/Node";
import type { Agent } from "~/server/db/schema";
import { useCanvasScaling } from "~/hooks/useCanvasScaling";
import { useAgentSelection } from "~/hooks/useAgentSelection";
import ContextMenu from "./ContextMenu";

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
  const [selectionArea, setSelectionArea] = useState<{
    start: { x: number; y: number } | null;
    end: { x: number; y: number } | null;
  }>({ start: null, end: null });
  const [contextMenuPosition, setContextMenuPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [contextMenuAgent, setContextMenuAgent] = useState<Agent | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [isRightClicking, setIsRightClicking] = useState(false);
  const stageRef = useRef<Konva.Stage>(null);

  useEffect(() => {
    updateStageSize();
  }, [updateStageSize]);

  const handleAgentClick = useCallback(
    (agent: Agent, event: KonvaEventObject<MouseEvent>) => {
      event.cancelBubble = true;
      handleSelect(agent, event.evt.ctrlKey || event.evt.metaKey);
    },
    [handleSelect]
  );

  const handleRightClick = useCallback(
    (e: KonvaEventObject<MouseEvent>, agent: Agent | null) => {
      e.evt.preventDefault();
      e.evt.stopPropagation();
      e.evt.cancelBubble = true;
      const stage = e.target.getStage();
      if (stage) {
        const pointerPosition = stage.getPointerPosition();
        if (pointerPosition) {
          const newPosition = { x: e.evt.clientX, y: e.evt.clientY };
          setContextMenuPosition(newPosition);
          setContextMenuAgent(agent);
          setShowContextMenu(true);
          setIsRightClicking(true);
          if (agent) {
            handleSelect(agent, e.evt.ctrlKey || e.evt.metaKey);
          } else {
            handleSelect([], false);
          }
        }
      }
    },
    [handleSelect]
  );

  const handleStageMouseDown = useCallback(
    (e: KonvaEventObject<MouseEvent>) => {
      if (e.evt.button === 2) {
        handleRightClick(e, null);
        return;
      }
      if (e.target === e.target.getStage()) {
        setSelectionArea({
          start: e.target.getStage().getPointerPosition()!,
          end: null,
        });
        setIsDragging(true);
        setContextMenuPosition(null);
        setContextMenuAgent(null);
      }
    },
    [handleRightClick]
  );

  const handleStageMouseMove = useCallback(
    (e: KonvaEventObject<MouseEvent>) => {
      if (isDragging && e.evt.button === 0) {
        setSelectionArea((prev) => ({
          ...prev,
          end: e.target.getStage()!.getPointerPosition()!,
        }));
      }
    },
    [isDragging]
  );

  const handleStageMouseUp = useCallback(
    (e: KonvaEventObject<MouseEvent>) => {
      if (e.evt.button === 2) {
        setIsRightClicking(false);
        return;
      }
      if (isDragging) {
        setIsDragging(false);
        if (selectionArea.start && selectionArea.end) {
          const x1 = Math.min(selectionArea.start.x, selectionArea.end.x);
          const x2 = Math.max(selectionArea.start.x, selectionArea.end.x);
          const y1 = Math.min(selectionArea.start.y, selectionArea.end.y);
          const y2 = Math.max(selectionArea.start.y, selectionArea.end.y);

          const selected = agents.filter(
            (agent) =>
              agent.xPosition >= x1 &&
              agent.xPosition <= x2 &&
              agent.yPosition >= y1 &&
              agent.yPosition <= y2
          );

          handleSelect(selected, false);
        }
        setSelectionArea({ start: null, end: null });
      }
    },
    [agents, isDragging, handleSelect, selectionArea]
  );

  const handleDragEnd = (e: KonvaEventObject<DragEvent>, agent: Agent) => {
    const node = e.target;
    const updatedAgent = { ...agent, xPosition: node.x(), yPosition: node.y() };
    onUpdateAgent(updatedAgent);
  };

  const handleStageClick = useCallback(
    (e: KonvaEventObject<MouseEvent>) => {
      if (isRightClicking) {
        setIsRightClicking(false);
        return;
      }
      if (e.target === e.target.getStage()) {
        handleSelect([], false);
        setShowContextMenu(false);
      }
    },
    [handleSelect, isRightClicking]
  );

  const closeContextMenu = useCallback(() => {
    setShowContextMenu(false);
    setContextMenuPosition(null);
  }, []);

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
        onMouseUp={handleStageMouseUp}
        onClick={handleStageClick}
      >
        <Layer>
          {agents.map((agent) => (
            <Group
              key={agent.id}
              x={agent.xPosition}
              y={agent.yPosition}
              draggable
              onClick={(e) => {
                if (!isRightClicking) handleAgentClick(agent, e);
              }}
              onDragEnd={(e) => handleDragEnd(e, agent)}
              onContextMenu={(e) => handleRightClick(e, agent)}
            >
              <Circle
                radius={30}
                fill={agent.status === "idle" ? "#3498db" : "#e74c3c"}
                stroke={
                  selectedAgents.some((a: Agent) => a.id === agent.id) ? "4" : "1"
                }
                strokeWidth={
                  selectedAgents.some((a: Agent) => a.id === agent.id) ? 4 : 1
                }
              />
              <Text
                text={`${agent.name} (${Math.round(agent.xPosition)},${Math.round(agent.yPosition)})`}
                fontSize={14}
                fill="black"
                width={60}
                align="center"
                y={40}
                offsetX={30}
              />
            </Group>
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
      {showContextMenu && contextMenuPosition && (
        <ContextMenu
          position={contextMenuPosition}
          agent={contextMenuAgent}
          onEdit={onEdit}
          onDelete={onDelete}
          onClose={closeContextMenu}
        />
      )}
    </div>
  );
};

export default AgentCanvas;
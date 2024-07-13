"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
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
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "~/components/ui/drawer";
import { Button } from "~/components/ui/button";

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
    selectionArea,
    handleStageMouseDown,
    handleStageMouseMove,
    handleStageMouseUp,
  } = useStageInteractions(
    handleSelect,
    moveAgents,
    selectedAgents
  );

  const { contextMenu, handleContextMenu, closeContextMenu } = useContextMenu();

  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  const handleAgentSelect = useCallback((agent: Agent, isMultiSelect: boolean) => {
    handleSelect(agent, isMultiSelect);
  }, [handleSelect]);

  const handleAgentDoubleClick = useCallback((agent: Agent) => {
    setSelectedAgent(agent);
  }, []);

  const handleDrawerOpenChange = useCallback((open: boolean) => {
    if (!open) {
      setSelectedAgent(null);
    }
  }, []);

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
              onClick={handleAgentSelect}
              onDoubleClick={handleAgentDoubleClick}
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
          position={{
            x: contextMenu.position.x * scale,
            y: contextMenu.position.y * scale,
          }}
          agent={contextMenu.agent}
          onEdit={onEdit}
          onDelete={onDelete}
          onClose={closeContextMenu}
        />
      )}
      <Drawer open={!!selectedAgent} onOpenChange={handleDrawerOpenChange}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{selectedAgent?.name}</DrawerTitle>
            <DrawerDescription>Agent Details</DrawerDescription>
          </DrawerHeader>
          <div className="p-4">
            <p>ID: {selectedAgent?.id}</p>
            <p>Status: {selectedAgent?.status}</p>
            <p>Position: ({selectedAgent?.xPosition}, {selectedAgent?.yPosition})</p>
          </div>
          <DrawerFooter>
            <Button onClick={() => onEdit(selectedAgent!)}>Edit Agent</Button>
            <DrawerClose asChild>
              <Button variant="outline">Close</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default AgentCanvas;
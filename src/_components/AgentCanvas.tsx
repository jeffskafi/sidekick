'use client';

import React, { useState, useEffect } from 'react';
import { Stage, Layer, Circle, Text, Rect, Label } from 'react-konva';
import type Konva from 'konva';

export interface Agent {
  id: number;
  projectId: number;
  name: string;
  status: string;
  skills: string[];
  xPosition: number;
  yPosition: number;
  createdAt: Date;
  updatedAt: Date | null;
}

interface AgentCanvasProps {
  agents: Agent[];
  onSelect: (agent: Agent | Agent[]) => void;
}

const AgentCanvas: React.FC<AgentCanvasProps> = ({ agents, onSelect }) => {
  const [stageSize, setStageSize] = useState({ width: window.innerWidth - 300, height: 600 });
  const [agentPositions, setAgentPositions] = useState<Record<number, { x: number, y: number }>>({});
  const [selectionArea, setSelectionArea] = useState<{ start: { x: number, y: number } | null, end: { x: number, y: number } | null }>({ start: null, end: null });
  const [selectedAgents, setSelectedAgents] = useState<Agent[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const handleResize = () => setStageSize({ width: window.innerWidth - 300, height: 600 });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const positions = agents.reduce((acc, agent) => {
      acc[agent.id] = { x: agent.xPosition, y: agent.yPosition };
      return acc;
    }, {} as Record<number, { x: number, y: number }>);
    setAgentPositions(positions);
  }, [agents]);

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>, agent: Agent) => {
    const { x, y } = e.target.position();
    setAgentPositions(prev => ({ ...prev, [agent.id]: { x, y } }));
    onSelect({ ...agent, xPosition: x, yPosition: y });
  };

  const handleSelect = (agent: Agent) => {
    onSelect(agent);
  };

  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (e.evt.button !== 0) return;

    const stage = e.target.getStage()!;
    const pointerPosition = stage.getPointerPosition()!;
    const { x, y } = pointerPosition;

    // Check if clicked on an agent
    const clickedAgent = agents.find(agent => {
      const agentPos = agentPositions[agent.id] ?? { x: agent.xPosition, y: agent.yPosition };
      return Math.abs(agentPos.x - x) < 10 && Math.abs(agentPos.y - y) < 10;
    });

    if (clickedAgent) {
      // Handle single agent selection
      setSelectedAgents([clickedAgent]);
    } else {
      // Start area selection
      setSelectionArea({ start: { x, y }, end: { x, y } });
      setIsDragging(true);
    }
  };

  const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isDragging) return;
    const { x, y } = e.target.getStage()!.getPointerPosition()!;
    setSelectionArea(prev => ({ ...prev, end: { x, y } }));
  };

  const handleMouseUp = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (e.evt.button !== 0) return;

    if (isDragging) {
      // Finish area selection
      setIsDragging(false);
      if (selectionArea.start && selectionArea.end) {
        const selected = agents.filter(agent => {
          const { x, y } = agentPositions[agent.id] ?? { x: agent.xPosition, y: agent.yPosition };
          const start = selectionArea.start!;
          const end = selectionArea.end!;
          return (
            x >= Math.min(start.x, end.x) &&
            x <= Math.max(start.x, end.x) &&
            y >= Math.min(start.y, end.y) &&
            y <= Math.max(start.y, end.y)
          );
        });

        setSelectedAgents(selected);
        onSelect(selected);
      }
      setSelectionArea({ start: null, end: null });
    }
  };

  return (
    <div className="agent-canvas-container">
      <Stage
        width={stageSize.width}
        height={stageSize.height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <Layer>
          <Rect
            x={0}
            y={0}
            width={stageSize.width}
            height={stageSize.height}
            fill="#f0f0f0"
            shadowBlur={10}
            shadowColor="rgba(0, 0, 0, 0.2)"
          />
          {agents.map((agent) => (
            <Label
              key={agent.id}
              x={agentPositions[agent.id]?.x ?? agent.xPosition}
              y={agentPositions[agent.id]?.y ?? agent.yPosition}
              draggable
              onDragEnd={(e) => handleDragEnd(e, agent)}
            >
              <Circle
                radius={30}
                fill={agent.status === 'idle' ? '#3498db' : '#e74c3c'}
                onClick={() => handleSelect(agent)}
                stroke={selectedAgents.some(a => a.id === agent.id) ? 'yellow' : 'black'}
                strokeWidth={selectedAgents.some(a => a.id === agent.id) ? 4 : 1}
              />
              <Text
                text={agent.name}
                fontSize={14}
                fill="black"
                width={60}
                align="center"
                y={40}
                offsetX={30}
              />
            </Label>
          ))}
          {isDragging && selectionArea.start && selectionArea.end && (
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
    </div>
  );
};

export default AgentCanvas;
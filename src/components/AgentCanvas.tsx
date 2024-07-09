'use client';

import React, { useState, useEffect } from 'react';
import { Stage, Layer, Circle, Text, Rect, Label, Tag } from 'react-konva';
import type Konva from 'konva';

export interface Agent {
  id: number;
  projectId: number;
  name: string;
  status: string;
  skills: Record<string, string[]>;
  xPosition: number;
  yPosition: number;
  createdAt: string;
  updatedAt: string;
}

interface AgentCanvasProps {
  agents: Agent[];
  onSelect: (agent: Agent) => void;
}

const AgentCanvas: React.FC<AgentCanvasProps> = ({ agents, onSelect }) => {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [stageSize, setStageSize] = useState({ width: window.innerWidth - 300, height: 600 });
  const [agentPositions, setAgentPositions] = useState<Record<number, { x: number, y: number }>>({});

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
    setSelectedId(agent.id);
    onSelect(agent);
  };

  return (
    <div className="agent-canvas-container">
      <Stage width={stageSize.width} height={stageSize.height}>
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
                stroke={selectedId === agent.id ? 'yellow' : 'black'}
                strokeWidth={selectedId === agent.id ? 4 : 1}
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
        </Layer>
      </Stage>
    </div>
  );
};

export default AgentCanvas;
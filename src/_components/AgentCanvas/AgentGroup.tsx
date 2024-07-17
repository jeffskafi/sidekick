// components/AgentGroup.tsx
import React, { useState, useRef, useEffect } from "react";
import { Group, Circle, Text, Rect } from "react-konva";
import type Konva from "konva";
import type { Agent } from "~/server/db/schema";
import { useHoverAnimation, useStatusAnimation } from "~/hooks/useAgentAnimations";

interface AgentGroupProps {
  agent: Agent;
  isSelected: boolean;
  onSelect: (agent: Agent) => void;
  allAgents: Agent[];
}

const AgentGroup: React.FC<AgentGroupProps> = ({ agent, isSelected, onSelect, allAgents }) => {
  // TODO: REMOVE AFTER TESTING
  // agent.status = 'task_complete';
  // agent.status = 'working';
  // agent.status = 'needs_human_input';
  // agent.status = 'error';

  const [isHovered, setIsHovered] = useState(false);
  const mainCircleRef = useRef<Konva.Circle>(null);
  const innerCircleRef = useRef<Konva.Circle>(null);
  const hoverCircleRef = useRef<Konva.Circle>(null);
  const statusIndicatorRef = useRef<Konva.Rect>(null);
  const rippleCircleRef = useRef<Konva.Circle>(null);

  const handleClick = () => {
    onSelect(agent);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "task_complete": return "#4CAF50";
      case "working": return "#FF6F00";
      case "needs_human_input": return "#FF6F00";
      case "error": return "#F44336";
      default: return "#999";
    }
  };

  const getAgentIdentifier = (name: string) => {
    name = name.trim();

    if (name.length <= 2) {
      return name;
    }
    
    const baseIdentifier = name.slice(0, 2);
    const firstLetter = baseIdentifier[0]!.toUpperCase();
    const secondLetter = baseIdentifier[1]!.toLowerCase();
    const identifier = firstLetter + secondLetter;
    
    const duplicates = allAgents.filter(a => a.name === name);
    if (duplicates.length > 1) {
      const index = duplicates.findIndex(a => a.id === agent.id) + 1;
      return `${firstLetter}${index}`;
    }
    
    return identifier;
  };

  useHoverAnimation(hoverCircleRef, isHovered);
  useStatusAnimation(mainCircleRef, innerCircleRef, statusIndicatorRef, rippleCircleRef, agent.status, getStatusColor);

  return (
    <Group
      x={agent.xPosition}
      y={agent.yPosition}
      onClick={handleClick}
      onTap={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Ripple effect for needs_human_input */}
      <Circle
        ref={rippleCircleRef}
        radius={30}
        fill={getStatusColor(agent.status)}
        opacity={0}
      />
      {/* Main circle (border) */}
      <Circle
        ref={mainCircleRef}
        radius={30}
        fill="transparent"
        stroke={getStatusColor(agent.status)}
        strokeWidth={2}
      />
      {/* Inner circle for pulsation */}
      <Circle
        ref={innerCircleRef}
        radius={28}
        fill={getStatusColor(agent.status)}
        opacity={0}
      />
      {/* Status indicator */}
      <Rect
        ref={statusIndicatorRef}
        width={10}
        height={10}
        fill={getStatusColor(agent.status)}
        cornerRadius={5}
        offsetX={5}
        offsetY={5}
      />
      {/* Hover effect circle */}
      <Circle
        ref={hoverCircleRef}
        radius={32}
        stroke="#5c5c5c"
        strokeWidth={2}
        opacity={0}
      />
      {/* Agent ID badge */}
      <Group x={-20} y={-20}>
        <Circle
          radius={10}
          fill="#5c5c5c"
        />
        <Text
          text={getAgentIdentifier(agent.name)}
          fontSize={10}
          fill="#f0f0f0"
          width={20}
          height={20}
          align="center"
          verticalAlign="middle"
          offsetX={10}
          offsetY={10}
        />
      </Group>
    </Group>
  );
};

export default AgentGroup;
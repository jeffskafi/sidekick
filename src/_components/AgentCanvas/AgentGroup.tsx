// components/AgentGroup.tsx
import React, { useState, useRef, useEffect, useCallback } from "react";
import { Group, Circle, Text } from "react-konva";
import Konva from "konva";
import type { Agent } from "~/server/db/schema";

interface AgentGroupProps {
  agent: Agent;
  isSelected: boolean;
  onSelect: (agent: Agent) => void;
  allAgents: Agent[]; // We need this to check for duplicate names
}

const AgentGroup: React.FC<AgentGroupProps> = ({ agent, isSelected, onSelect, allAgents }) => {
  const [isHovered, setIsHovered] = useState(false);
  const hoverCircleRef = useRef<Konva.Circle>(null);

  const handleClick = () => {
    onSelect(agent);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "#4CAF50";
      case "idle": return "#FFC107";
      case "error": return "#F44336";
      default: return "#FFC107"; // Default to idle color
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
    
    // Check for duplicate names
    const duplicates = allAgents.filter(a => a.name === name);
    if (duplicates.length > 1) {
      const index = duplicates.findIndex(a => a.id === agent.id) + 1;
      return `${firstLetter}${index}`;
    }
    
    return identifier;
  };

  // Create a memoized easing function
  const easeInOut = useCallback((t: number, b: number, c: number, d: number): number => {
    return Konva.Easings.EaseInOut(t, b, c, d) as number;
  }, []);

  useEffect(() => {
    if (hoverCircleRef.current) {
      const tween = new Konva.Tween({
        node: hoverCircleRef.current,
        duration: 0.2,
        easing: easeInOut,
        strokeWidth: isHovered || isSelected ? 2 : 0,
      });
      tween.play();
    }
  }, [isHovered, isSelected, easeInOut]);

  return (
    <Group
      id={`agent-${agent.id}`}
      x={agent.xPosition}
      y={agent.yPosition}
      onClick={handleClick}
      onTap={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Hover effect with easing (now first, so it's drawn behind other elements) */}
      <Circle
        ref={hoverCircleRef}
        radius={32}
        stroke="#5c5c5c"
        strokeWidth={0}
      />
      {/* Main circle */}
      <Circle
        radius={30}
        fill="#f0f0f0"
        stroke={getStatusColor(agent.status)}
        strokeWidth={2}
      />
      {/* Status indicator */}
      <Circle
        radius={5}
        fill={getStatusColor(agent.status)}
        x={0}
        y={0}
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
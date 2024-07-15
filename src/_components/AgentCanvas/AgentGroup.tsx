// components/AgentGroup.tsx
import React from "react";
import { Group, Circle, Text } from "react-konva";
import type { Agent } from "~/server/db/schema";
import './agentCanvasStyles.css';


interface AgentGroupProps {
  agent: Agent;
  isSelected: boolean;
  onSelect: (agent: Agent) => void;
}

const AgentGroup: React.FC<AgentGroupProps> = ({ agent, isSelected, onSelect }) => {
  const handleTap = () => {
    onSelect(agent);
  };

  const handleClick = () => {
    onSelect(agent);
  };

  return (
    <Group
      key={agent.id}
      id={`agent-${agent.id}`}
      x={agent.xPosition}
      y={agent.yPosition}
      onClick={handleClick}
      onTap={handleTap}
    >
      <Circle
        radius={30}
        fill={agent.status === "idle" ? "blue" : "red"}
        stroke={isSelected ? "yellow" : "white"}
        strokeWidth={isSelected ? 4 : 1}
      />
      <Text
        text={`${agent.name} (${Math.round(agent.xPosition)},${Math.round(agent.yPosition)})`}
        fontSize={14}
        fill="white"
        width={60}
        align="center"
        y={40}
        offsetX={30}
      />
    </Group>
  );
};

export default AgentGroup;
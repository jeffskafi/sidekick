// components/AgentGroup.tsx
import React from "react";
import { Group, Circle, Text } from "react-konva";
import type { Agent } from "~/server/db/schema";
import type { KonvaEventObject } from "konva/lib/Node";

interface AgentGroupProps {
  agent: Agent;
  isSelected: boolean;
  onClick: (agent: Agent, isMultiSelect: boolean) => void;
  onDoubleClick: (agent: Agent) => void;
  onContextMenu: (e: KonvaEventObject<MouseEvent>, agent: Agent) => void;
}

const AgentGroup: React.FC<AgentGroupProps> = ({
  agent,
  isSelected,
  onClick,
  onDoubleClick,
  onContextMenu,
}) => {
  const handleClick = (e: KonvaEventObject<MouseEvent>) => {
    console.log("Agent clicked", agent);
    onClick(agent, e.evt.ctrlKey || e.evt.metaKey);
  };

  const handleDoubleClick = (e: KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true;
    onDoubleClick(agent);
  };

  const handleContextMenu = (e: KonvaEventObject<MouseEvent>) => {
    e.evt.preventDefault();
    onContextMenu(e, agent);
  };

  return (
    <Group
      key={agent.id}
      id={`agent-${agent.id}`}
      x={agent.xPosition}
      y={agent.yPosition}
      onClick={handleClick}
      onDblClick={handleDoubleClick}
      onContextMenu={handleContextMenu}
      draggable={false}
    >
      <Circle
        radius={30}
        fill={agent.status === "idle" ? "#3498db" : "#e74c3c"}
        stroke={isSelected ? "4" : "1"}
        strokeWidth={isSelected ? 4 : 1}
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
  );
};

export default AgentGroup;
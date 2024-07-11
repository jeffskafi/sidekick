import React from 'react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "~/components/ui/context-menu"
import type { Agent } from "~/server/db/schema";

interface AgentItemProps {
  agent: Agent;
  onEdit: (agent: Agent) => void;
  onDelete: (agentId: number) => void;
}

const getAgentStyle = (agent: Agent): React.CSSProperties => ({
  left: `${agent.xPosition}px`,
  top: `${agent.yPosition}px`,
});

export function AgentItem({ agent, onEdit, onDelete }: AgentItemProps) {
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  console.log(`Agent ${agent.name} position: (${agent.xPosition}, ${agent.yPosition})`);

  return (
    <ContextMenu>
      <ContextMenuTrigger 
        className="flex items-center justify-center w-20 h-20 bg-primary text-primary-foreground rounded-full cursor-pointer absolute"
        style={getAgentStyle(agent)}
        onContextMenu={handleContextMenu}
      >
        {agent.name}
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={() => onEdit(agent)}>Edit</ContextMenuItem>
        <ContextMenuItem onClick={() => onDelete(agent.id)}>Delete</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
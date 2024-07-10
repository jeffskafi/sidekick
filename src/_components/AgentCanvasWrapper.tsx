'use client';

import { useState } from 'react';
import AgentCanvas from './AgentCanvas';
import AgentSidebar from './AgentSidebar';

export interface Agent {
  id: number;
  projectId: number;
  name: string;
  status: string;
  xPosition: number;
  yPosition: number;
  createdAt: Date;
  updatedAt: Date | null;
  skills: string[];
}

interface AgentCanvasWrapperProps {
  agents: Agent[];
}

export default function AgentCanvasWrapper({ agents }: AgentCanvasWrapperProps) {
  const [selectedAgents, setSelectedAgents] = useState<Agent[]>([]);

  const handleSelectAgents = (agents: Agent | Agent[]) => {
    setSelectedAgents(Array.isArray(agents) ? agents : [agents]);
  };

  const handleEditAgent = (agent: Agent) => {
    console.log('Edit agent:', agent);
    // Implement edit functionality here
  };

  const handleDeleteAgent = (agentId: number) => {
    console.log('Delete agent:', agentId);
    // Implement delete functionality here
  };

  return (
    <div className="relative w-full h-full">
      <AgentCanvas 
        agents={agents} 
        onSelect={handleSelectAgents}
        onEdit={handleEditAgent}
        onDelete={handleDeleteAgent}
      />
      <AgentSidebar selectedAgents={selectedAgents} />
    </div>
  );
}
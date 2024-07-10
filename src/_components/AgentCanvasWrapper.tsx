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
  const [agentList, setAgentList] = useState<Agent[]>(agents);

  const handleSelectAgents = (agents: Agent | Agent[]) => {
    setSelectedAgents(Array.isArray(agents) ? agents : [agents]);
  };

  const handleEditAgent = (agent: Agent) => {
    console.log('Edit agent:', agent);
    // Implement edit functionality here
  };

  const handleDeleteAgent = (agentId: number) => {
    setAgentList(prevAgents => prevAgents.filter(agent => agent.id !== agentId));
  };

  const handleUpdateAgent = (updatedAgent: Agent) => {
    setAgentList(prevAgents =>
      prevAgents.map(agent =>
        agent.id === updatedAgent.id ? updatedAgent : agent
      )
    );
  };

  const handleAddAgent = () => {
    const newAgent: Agent = {
      id: Date.now(), // Temporary ID, should be replaced with a proper ID from the backend
      projectId: 1, // Assuming a default project ID
      name: `Agent ${agentList.length + 1}`,
      status: 'idle',
      xPosition: Math.random() * 500, // Random position
      yPosition: Math.random() * 500,
      createdAt: new Date(),
      updatedAt: null,
      skills: [],
    };
    setAgentList(prevAgents => [...prevAgents, newAgent]);
  };

  return (
    <div className="relative w-full h-full">
      <AgentCanvas 
        agents={agentList} 
        onSelect={handleSelectAgents}
        onEdit={handleEditAgent}
        onDelete={handleDeleteAgent}
        onUpdateAgent={handleUpdateAgent}
        onAddAgent={handleAddAgent}
      />
      <AgentSidebar selectedAgents={selectedAgents} />
    </div>
  );
}
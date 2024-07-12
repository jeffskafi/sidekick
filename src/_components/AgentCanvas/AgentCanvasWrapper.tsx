'use client';

import { useState, useEffect } from 'react';
import AgentCanvas from './AgentCanvas';
import AgentSidebar from '../AgentSidebar';
import { AddAgentButton } from '../AddAgentButton';
import type { Agent } from '../../server/db/schema';

interface AgentCanvasWrapperProps {
  agents: Agent[];
}

export default function AgentCanvasWrapper({ agents: initialAgents }: AgentCanvasWrapperProps) {
  const [agentList, setAgentList] = useState<Agent[]>(initialAgents);
  const [selectedAgents, setSelectedAgents] = useState<Agent[]>([]);

  useEffect(() => {
    setAgentList(initialAgents);
  }, [initialAgents]);

  const handleAgentAdded = (newAgent: Agent) => {
    setAgentList(prevAgents => [...prevAgents, newAgent]);
  };

  const handleSelectAgents = (agents: Agent | Agent[]) => {
    setSelectedAgents(Array.isArray(agents) ? agents : [agents]);
  };

  const handleEditAgent = (agent: Agent) => {
    console.log('Edit agent:', agent);
    // Implement edit functionality here
  };
  const handleDeleteAgent = async (agentId: number) => {
    try {
      const response = await fetch(`/api/agents?id=${agentId}`, {
        method: 'DELETE',
      });
  
      if (!response.ok) {
        throw new Error('Failed to delete agent');
      }
  
      setAgentList(prevAgents => prevAgents.filter(agent => agent.id !== agentId));
    } catch (error) {
      console.error('Error deleting agent:', error);
    }
  };

  const handleUpdateAgent = (updatedAgent: Agent) => {
    setAgentList(prevAgents =>
      prevAgents.map(agent =>
        agent.id === updatedAgent.id ? updatedAgent : agent
      )
    );
    // You might want to add an API call here to persist the changes
  };

  return (
    <div className="relative w-full h-full">
      <AgentCanvas 
        agents={agentList} 
        onSelect={handleSelectAgents}
        onEdit={handleEditAgent}
        onDelete={handleDeleteAgent}
        onUpdateAgent={handleUpdateAgent}
      />
      <AgentSidebar selectedAgents={selectedAgents} />
      <AddAgentButton onAgentAdded={handleAgentAdded} />
    </div>
  );
}
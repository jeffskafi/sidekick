'use client';

import { useState, useEffect } from 'react';
import AgentCanvas from './AgentCanvas';
import AgentSidebar from '../AgentSidebar';
import { useRouter } from 'next/navigation';
import { insertAgentSchema } from '../../server/db/schema';
import type { Agent, NewAgent } from '../../server/db/schema';

interface AgentCanvasWrapperProps {
  agents: Agent[];
}

export default function AgentCanvasWrapper({ agents: initialAgents }: AgentCanvasWrapperProps) {
  const [selectedAgents, setSelectedAgents] = useState<Agent[]>([]);
  const [agentList, setAgentList] = useState<Agent[]>(initialAgents);
  const router = useRouter();

  useEffect(() => {
    setAgentList(initialAgents);
  }, [initialAgents]);

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
  };

  const handleAddAgent = async () => {
    try {
      const newAgentData: NewAgent = {
        projectId: 1, // Replace with actual project ID
        name: `Agent ${agentList.length + 1}`,
        xPosition: Math.random() * 500,
        yPosition: Math.random() * 500,
      };

      // Validate new agent data
      insertAgentSchema.parse(newAgentData);

      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newAgentData),
      });

      if (!response.ok) {
        throw new Error('Failed to add agent');
      }

      const newAgent: Agent = await response.json() as Agent;

      setAgentList(prevAgents => [...prevAgents, newAgent]);
    } catch (error) {
      console.error('Error adding agent:', error);
    }
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
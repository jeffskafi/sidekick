'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Agent } from '~/server/db/schema';

interface AgentContextType {
  agents: Agent[];
  selectedAgents: Agent[];
  setAgents: (agents: Agent[]) => void;
  selectAgents: (agents: Agent[]) => void;
  updateAgent: (updatedAgent: Agent) => Promise<void>;
  deleteAgent: (agentId: number) => Promise<void>;
  moveAgents: (agentsToMove: Agent[], newPosition: { x: number; y: number }) => Promise<void>;
  handleAgentAdded: (newAgent: Agent) => void;
}

const AgentContext = createContext<AgentContextType | undefined>(undefined);

export function AgentProvider({ children, initialAgents }: { children: React.ReactNode, initialAgents: Agent[] }) {
  const [agents, setAgents] = useState<Agent[]>(initialAgents);
  const [selectedAgents, setSelectedAgents] = useState<Agent[]>([]);

  const selectAgents = useCallback((newSelectedAgents: Agent[]) => {
    setSelectedAgents(newSelectedAgents);
  }, []);

  const updateAgent = useCallback(async (updatedAgent: Agent) => {
    try {
      const response = await fetch(`/api/agents`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedAgent),
      });
      if (!response.ok) {
        throw new Error('Failed to update agent');
      }
      const updatedAgentFromServer = await response.json() as Agent;
      setAgents(prevAgents => prevAgents.map(agent => 
        agent.id === updatedAgentFromServer.id ? updatedAgentFromServer : agent
      ));
    } catch (error) {
      console.error('Failed to update agent:', error instanceof Error ? error.message : String(error));
    }
  }, []);

  const deleteAgent = useCallback(async (agentId: number) => {
    try {
      const response = await fetch(`/api/agents?id=${agentId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete agent');
      }
      setAgents(prevAgents => prevAgents.filter(agent => agent.id !== agentId));
    } catch (error) {
      console.error('Failed to delete agent:', error);
    }
  }, []);

  const moveAgents = useCallback(async (agentsToMove: Agent[], newPosition: { x: number; y: number }) => {
    const updatedAgents = agentsToMove.map(agent => ({
      ...agent,
      xPosition: newPosition.x,
      yPosition: newPosition.y
    }));

    try {
      await Promise.all(updatedAgents.map(agent => updateAgent(agent)));
    } catch (error) {
      console.error('Failed to move agents:', error);
    }
  }, [updateAgent]);

  const handleAgentAdded = useCallback((newAgent: Agent) => {
    setAgents(prevAgents => [...prevAgents, newAgent]);
  }, []);

  return (
    <AgentContext.Provider value={{ 
      agents, 
      selectedAgents, 
      setAgents, 
      selectAgents, 
      updateAgent, 
      deleteAgent,
      moveAgents,
      handleAgentAdded
    }}>
      {children}
    </AgentContext.Provider>
  );
}

export function useAgentContext() {
  const context = useContext(AgentContext);
  if (context === undefined) {
    throw new Error('useAgentContext must be used within an AgentProvider');
  }
  return context;
}
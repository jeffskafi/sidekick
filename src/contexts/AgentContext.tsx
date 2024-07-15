'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Agent } from '~/server/db/schema';

interface AgentContextType {
  agents: Agent[];
  selectedAgents: Agent[];
  setAgents: (agents: Agent[]) => void;
  selectAgents: (agents: Agent[]) => void;
  updateAgent: (updatedAgent: Agent) => void;
  deleteAgent: (agentId: number) => void;
  moveAgents: (agentsToMove: Agent[], newPosition: { x: number; y: number }) => void;
}

const AgentContext = createContext<AgentContextType | undefined>(undefined);

export function AgentProvider({ children, initialAgents }: { children: React.ReactNode, initialAgents: Agent[] }) {
  const [agents, setAgents] = useState<Agent[]>(initialAgents);
  const [selectedAgents, setSelectedAgents] = useState<Agent[]>([]);

  const selectAgents = useCallback((newSelectedAgents: Agent[]) => {
    setSelectedAgents(newSelectedAgents);
  }, []);

  const updateAgent = useCallback((updatedAgent: Agent) => {
    setAgents(prevAgents => prevAgents.map(agent => 
      agent.id === updatedAgent.id ? updatedAgent : agent
    ));
  }, []);

  const deleteAgent = useCallback((agentId: number) => {
    setAgents(prevAgents => prevAgents.filter(agent => agent.id !== agentId));
  }, []);

  const moveAgents = useCallback((agentsToMove: Agent[], newPosition: { x: number; y: number }) => {
    setAgents(prevAgents => prevAgents.map(agent => {
      if (agentsToMove.some(a => a.id === agent.id)) {
        return { ...agent, xPosition: newPosition.x, yPosition: newPosition.y };
      }
      return agent;
    }));
  }, []);

  return (
    <AgentContext.Provider value={{ 
      agents, 
      selectedAgents, 
      setAgents, 
      selectAgents, 
      updateAgent, 
      deleteAgent,
      moveAgents 
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
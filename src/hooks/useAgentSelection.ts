// useAgentSelection.ts
import { useState, useCallback, useEffect } from 'react';
import type { Agent } from '~/server/db/schema';

export function useAgentSelection(agents: Agent[], onSelect: (agents: Agent[]) => void) {
  const [selectedAgents, setSelectedAgents] = useState<Agent[]>([]);

  const handleSelect = useCallback((agentOrAgents: Agent | Agent[], isMultiSelect: boolean) => {
    setSelectedAgents(prev => {
      if (Array.isArray(agentOrAgents)) {
        return agentOrAgents;
      }
      if (isMultiSelect) {
        return prev.some(a => a.id === agentOrAgents.id)
          ? prev.filter(a => a.id !== agentOrAgents.id)
          : [...prev, agentOrAgents];
      } else {
        return [agentOrAgents];
      }
    });
  }, []);

  useEffect(() => {
    onSelect(selectedAgents);
  }, [selectedAgents, onSelect]);

  return { selectedAgents, handleSelect };
}
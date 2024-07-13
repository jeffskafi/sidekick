// hooks/useAgentMovement.ts
import { useCallback } from 'react';
import type { Agent } from '~/server/db/schema';
import { easeInOut } from '../helpers/movement';
import type Konva from 'konva';

export function useAgentMovement(onUpdateAgent: (agent: Agent) => void) {
  const moveAgents = useCallback(
    (agentsToMove: Agent[], newPosition: { x: number; y: number }, stage: Konva.Stage) => {
      console.log("Moving agents to:", newPosition);
      agentsToMove.forEach((agent: Agent) => {
        const group = stage.findOne(`#agent-${agent.id}`);
        if (group) {
          group.to({
            x: newPosition.x,
            y: newPosition.y,
            duration: 0.15,
            easing: easeInOut,
            onFinish: () => {
              const updatedAgent: Agent = {
                ...agent,
                xPosition: newPosition.x,
                yPosition: newPosition.y,
              };
              console.log("Updated agent:", updatedAgent);
              onUpdateAgent(updatedAgent);
            },
          });
        } else {
          console.error(`Agent group not found for agent ${agent.id}`);
        }
      });
    },
    [onUpdateAgent]
  );

  return moveAgents;
}
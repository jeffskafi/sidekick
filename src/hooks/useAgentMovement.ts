// hooks/useAgentMovement.ts
import { useCallback } from 'react';
import type { Agent } from '~/server/db/schema';
import { easeInOut } from '../helpers/movement';
import type Konva from 'konva';

export function useAgentMovement(onUpdateAgent: (agent: Agent) => void) {
  const moveAgents = useCallback(
    (agentsToMove: Agent[], newPosition: { x: number; y: number }, stage: Konva.Stage) => {
      agentsToMove.forEach((agent: Agent) => {
        const group = stage.findOne(`#agent-${agent.id}`);
        if (group) {
          const newX = newPosition.x / stage.scaleX();
          const newY = newPosition.y / stage.scaleY();
          group.to({
            x: newX,
            y: newY,
            duration: 0.15,
            easing: easeInOut,
            onFinish: () => {
              const updatedAgent: Agent = {
                ...agent,
                xPosition: newX,
                yPosition: newY,
              };
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
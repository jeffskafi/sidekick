'use client';

import { useRef, useCallback } from 'react';
import { Stage, Layer, Rect } from 'react-konva';
import { useAgentContext } from '~/contexts/AgentContext';
import { useCanvasScaling } from '~/hooks/useCanvasScaling';
import { useStageInteractions } from '~/hooks/useStageInteractions';
import { useSelectionArea } from '~/hooks/useSelectionArea';
import { useAgentMovement } from '~/hooks/useAgentMovement';
import AgentGroup from './AgentGroup';
import type { Agent } from '~/server/db/schema';

export default function AgentCanvas() {
  const { agents, selectedAgents, selectAgents, updateAgent } = useAgentContext();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scale, stageSize } = useCanvasScaling(containerRef);
  const { selectionArea, startSelection, updateSelection, endSelection } = useSelectionArea();
  const moveAgents = useAgentMovement(updateAgent);

  const handleSelect = useCallback(
    (agentOrAgents: Agent | Agent[]) => {
      selectAgents(Array.isArray(agentOrAgents) ? agentOrAgents : [agentOrAgents]);
    },
    [selectAgents]
  );

  const { handleStageMouseDown, handleStageMouseMove, handleStageMouseUp } = useStageInteractions(
    handleSelect,
    moveAgents,
    selectedAgents,
    agents,
    startSelection,
    updateSelection,
    endSelection
  );

  const selectionRect = selectionArea.start && selectionArea.end ? {
    x: Math.min(selectionArea.start.x, selectionArea.end.x),
    y: Math.min(selectionArea.start.y, selectionArea.end.y),
    width: Math.abs(selectionArea.end.x - selectionArea.start.x),
    height: Math.abs(selectionArea.end.y - selectionArea.start.y),
  } : null;

  return (
    <div ref={containerRef} className="flex-grow bg-gray-800">
      <Stage
        width={stageSize.width}
        height={stageSize.height}
        scaleX={scale}
        scaleY={scale}
        onMouseDown={handleStageMouseDown}
        onMouseMove={handleStageMouseMove}
        onMouseUp={handleStageMouseUp}
      >
        <Layer>
          {agents.map((agent) => (
            <AgentGroup
              key={agent.id}
              agent={agent}
              isSelected={selectedAgents.some((a) => a.id === agent.id)}
            />
          ))}
          {selectionRect && (
            <Rect
              x={selectionRect.x}
              y={selectionRect.y}
              width={selectionRect.width}
              height={selectionRect.height}
              fill="rgba(0, 0, 255, 0.1)"
              stroke="blue"
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
}
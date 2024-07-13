// hooks/useStageInteractions.ts
import { useState, useCallback, useRef } from 'react';
import type { KonvaEventObject } from 'konva/lib/Node';
import type { Agent } from '~/server/db/schema';
import type Konva from 'konva';

export function useStageInteractions(
  handleSelect: (agentOrAgents: Agent | Agent[], isMultiSelect: boolean) => void,
  moveAgents: (agentsToMove: Agent[], newPosition: { x: number; y: number }, stage: Konva.Stage) => void,
  selectedAgents: Agent[],
) {
  const [isDragging, setIsDragging] = useState(false);
  const [isRightClicking, setIsRightClicking] = useState(false);
  const [selectionArea, setSelectionArea] = useState<{
    start: { x: number; y: number } | null;
    end: { x: number; y: number } | null;
  }>({ start: null, end: null });
  const dragStartPosition = useRef<{ x: number; y: number } | null>(null);

  const handleStageMouseDown = useCallback(
    (e: KonvaEventObject<MouseEvent>) => {
      console.log("Mouse Down", e.target);
      if (e.evt.button === 2) {
        setIsRightClicking(true);
        return;
      }
      const stage = e.target.getStage();
      if (stage && e.target === stage) {
        const pos = stage.getPointerPosition();
        if (pos) {
          setIsDragging(true);
          dragStartPosition.current = pos;
          setSelectionArea({
            start: pos,
            end: null,
          });
        }
      }
    },
    []
  );

  const handleStageMouseMove = useCallback(
    (e: KonvaEventObject<MouseEvent>) => {
      if (!isDragging) return;
      const stage = e.target.getStage();
      if (stage) {
        const pos = stage.getPointerPosition();
        if (pos) {
          setSelectionArea((prev) => ({
            ...prev,
            end: pos,
          }));
        }
      }
    },
    [isDragging]
  );

  const handleStageMouseUp = useCallback(
    (e: KonvaEventObject<MouseEvent>, agents: Agent[]) => {
      console.log("Mouse Up", e.target, selectedAgents);
      if (isRightClicking) {
        setIsRightClicking(false);
        return;
      }
      const stage = e.target.getStage();
      if (!stage) return;

      const endPos = stage.getPointerPosition();
      if (!endPos || !dragStartPosition.current) return;

      const dx = endPos.x - dragStartPosition.current.x;
      const dy = endPos.y - dragStartPosition.current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 5 && e.target === stage) {
        console.log("Treating as click on empty stage");
        if (selectedAgents.length > 0) {
          console.log("Moving agents", selectedAgents, "to", endPos);
          moveAgents(selectedAgents, endPos, stage);
          handleSelect([], false); // Deselect after moving
        } else {
          // Only deselect if no agents are selected
          handleSelect([], false);
        }
      } else if (isDragging) {
        console.log("Finalizing selection area");
        // Finalize selection area
        const x1 = Math.min(dragStartPosition.current.x, endPos.x);
        const x2 = Math.max(dragStartPosition.current.x, endPos.x);
        const y1 = Math.min(dragStartPosition.current.y, endPos.y);
        const y2 = Math.max(dragStartPosition.current.y, endPos.y);

        const newSelectedAgents = agents.filter(
          (agent) =>
            agent.xPosition >= x1 &&
            agent.xPosition <= x2 &&
            agent.yPosition >= y1 &&
            agent.yPosition <= y2
        );

        console.log("New selected agents", newSelectedAgents);
        handleSelect(newSelectedAgents, e.evt.ctrlKey || e.evt.metaKey);
      }

      setIsDragging(false);
      dragStartPosition.current = null;
      setSelectionArea({ start: null, end: null });
    },
    [isDragging, isRightClicking, handleSelect, moveAgents, selectedAgents]
  );

  return {
    isDragging,
    isRightClicking,
    selectionArea,
    handleStageMouseDown,
    handleStageMouseMove,
    handleStageMouseUp,
  };
}
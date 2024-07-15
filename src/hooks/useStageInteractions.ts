// hooks/useStageInteractions.ts
import { useState, useCallback, useRef } from 'react';
import type { KonvaEventObject } from 'konva/lib/Node';
import type { Agent } from '~/server/db/schema';
import type Konva from 'konva';

export function useStageInteractions(
  handleSelect: (agentOrAgents: Agent | Agent[]) => void,
  moveAgents: (agentsToMove: Agent[], newPosition: { x: number; y: number }, stage: Konva.Stage) => void,
  selectedAgents: Agent[],
  agents: Agent[],
  startSelection: (pos: { x: number; y: number }) => void,
  updateSelection: (pos: { x: number; y: number }) => void,
  endSelection: () => void
) {
  const [isDragging, setIsDragging] = useState(false);
  const [isRightClicking, setIsRightClicking] = useState(false);
  const dragStartPosition = useRef<{ x: number; y: number } | null>(null);

  const handleStageMouseDown = useCallback(
    (e: KonvaEventObject<MouseEvent>) => {
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
          startSelection(pos);
        }
      }
    },
    [startSelection]
  );

  const handleStageTouchStart = useCallback(
    (e: KonvaEventObject<TouchEvent>) => {
      const stage = e.target.getStage();
      if (stage && e.target === stage) {
        const pos = stage.getPointerPosition();
        if (pos) {
          setIsDragging(true);
          dragStartPosition.current = pos;
          startSelection(pos);
        }
      }
    },
    [startSelection]
  );

  const handleStageMouseMove = useCallback(
    (e: KonvaEventObject<MouseEvent>) => {
      if (!isDragging) return;
      const stage = e.target.getStage();
      if (stage) {
        const pos = stage.getPointerPosition();
        if (pos) {
          updateSelection(pos);
        }
      }
    },
    [isDragging, updateSelection]
  );

  const handleStageTouchMove = useCallback(
    (e: KonvaEventObject<TouchEvent>) => {
      if (!isDragging) return;
      const stage = e.target.getStage();
      if (stage) {
        const pos = stage.getPointerPosition();
        if (pos) {
          updateSelection(pos);
        }
      }
    },
    [isDragging, updateSelection]
  );

  const handleStageMouseUp = useCallback(
    (e: KonvaEventObject<MouseEvent>) => {
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
        if (selectedAgents.length > 0) {
          moveAgents(selectedAgents, endPos, stage);
        }
      } else if (isDragging) {
        const x1 = Math.min(dragStartPosition.current.x, endPos.x) / stage.scaleX();
        const x2 = Math.max(dragStartPosition.current.x, endPos.x) / stage.scaleX();
        const y1 = Math.min(dragStartPosition.current.y, endPos.y) / stage.scaleY();
        const y2 = Math.max(dragStartPosition.current.y, endPos.y) / stage.scaleY();

        const newSelectedAgents = agents.filter(
          (agent) =>
            agent.xPosition >= x1 &&
            agent.xPosition <= x2 &&
            agent.yPosition >= y1 &&
            agent.yPosition <= y2
        );

        handleSelect(newSelectedAgents);
      }

      setIsDragging(false);
      dragStartPosition.current = null;
      endSelection();
    },
    [isDragging, isRightClicking, handleSelect, moveAgents, selectedAgents, agents, endSelection]
  );

  const handleStageTouchEnd = useCallback(
    (e: KonvaEventObject<TouchEvent>) => {
      const stage = e.target.getStage();
      if (!stage) return;

      const endPos = stage.getPointerPosition();
      if (!endPos || !dragStartPosition.current) return;

      const dx = endPos.x - dragStartPosition.current.x;
      const dy = endPos.y - dragStartPosition.current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 5 && e.target === stage) {
        if (selectedAgents.length > 0) {
          moveAgents(selectedAgents, endPos, stage);
        }
      } else if (isDragging) {
        const x1 = Math.min(dragStartPosition.current.x, endPos.x) / stage.scaleX();
        const x2 = Math.max(dragStartPosition.current.x, endPos.x) / stage.scaleX();
        const y1 = Math.min(dragStartPosition.current.y, endPos.y) / stage.scaleY();
        const y2 = Math.max(dragStartPosition.current.y, endPos.y) / stage.scaleY();

        const newSelectedAgents = agents.filter(
          (agent) =>
            agent.xPosition >= x1 &&
            agent.xPosition <= x2 &&
            agent.yPosition >= y1 &&
            agent.yPosition <= y2
        );

        handleSelect(newSelectedAgents);
      }

      setIsDragging(false);
      dragStartPosition.current = null;
      endSelection();
    },
    [isDragging, handleSelect, moveAgents, selectedAgents, agents, endSelection]
  );

  return {
    handleStageMouseDown,
    handleStageTouchStart,
    handleStageMouseMove,
    handleStageTouchMove,
    handleStageMouseUp,
    handleStageTouchEnd,
  };
}
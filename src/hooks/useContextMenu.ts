import { useState, useCallback } from 'react';
import type { KonvaEventObject } from 'konva/lib/Node';
import type { Agent } from '~/server/db/schema';

interface ContextMenuState {
  isOpen: boolean;
  position: { x: number; y: number } | null;
  agent: Agent | null;
}

export function useContextMenu() {
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    isOpen: false,
    position: null,
    agent: null,
  });

  const handleContextMenu = useCallback((e: KonvaEventObject<MouseEvent>, agent: Agent | null) => {
    e.evt.preventDefault();
    const stage = e.target.getStage();
    if (stage) {
      const pointerPosition = stage.getPointerPosition();
      if (pointerPosition) {
        setContextMenu({
          isOpen: true,
          position: pointerPosition,
          agent: agent,
        });
      }
    }
  }, []);

  const closeContextMenu = useCallback(() => {
    setContextMenu({
      isOpen: false,
      position: null,
      agent: null,
    });
  }, []);

  return {
    contextMenu,
    handleContextMenu,
    closeContextMenu,
  };
}
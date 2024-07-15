import { useState, useCallback } from 'react';
import type { KonvaEventObject } from 'konva/lib/Node';

export function useSelectionArea(scale: number) {
  const [selectionArea, setSelectionArea] = useState<{
    start: { x: number; y: number } | null;
    end: { x: number; y: number } | null;
  }>({ start: null, end: null });

  const startSelection = useCallback((pos: { x: number; y: number }) => {
    setSelectionArea({ start: { x: pos.x / scale, y: pos.y / scale }, end: null });
  }, [scale]);

  const updateSelection = useCallback((pos: { x: number; y: number }) => {
    setSelectionArea(prev => ({ ...prev, end: { x: pos.x / scale, y: pos.y / scale } }));
  }, [scale]);

  const endSelection = useCallback(() => {
    setSelectionArea({ start: null, end: null });
  }, []);

  return {
    selectionArea,
    startSelection,
    updateSelection,
    endSelection,
  };
}
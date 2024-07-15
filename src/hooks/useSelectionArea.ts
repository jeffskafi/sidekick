import { useState, useCallback } from 'react';
import type { KonvaEventObject } from 'konva/lib/Node';

export function useSelectionArea() {
  const [selectionArea, setSelectionArea] = useState<{
    start: { x: number; y: number } | null;
    end: { x: number; y: number } | null;
  }>({ start: null, end: null });

  const startSelection = useCallback((pos: { x: number; y: number }) => {
    setSelectionArea({ start: pos, end: null });
  }, []);

  const updateSelection = useCallback((pos: { x: number; y: number }) => {
    setSelectionArea(prev => ({ ...prev, end: pos }));
  }, []);

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
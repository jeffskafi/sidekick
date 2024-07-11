// useCanvasScaling.ts
import type { RefObject } from "react";
import { useState, useEffect, useCallback } from 'react';

export function useCanvasScaling(containerRef: RefObject<HTMLDivElement>) {
    const [scale, setScale] = useState(1);
    const [stageSize, setStageSize] = useState({ width: 0, height: 0 });

    const updateStageSize = useCallback(() => {
        if (containerRef.current) {
            const { offsetWidth, offsetHeight } = containerRef.current;
            setStageSize({ width: offsetWidth, height: offsetHeight });
            
            // Calculate and set scale based on container size
            // This is just an example; adjust the logic as needed
            const newScale = Math.min(offsetWidth / 1000, offsetHeight / 600);
            setScale(newScale);
        }
    }, [containerRef]);

    useEffect(() => {
        updateStageSize();
        window.addEventListener('resize', updateStageSize);
        return () => window.removeEventListener('resize', updateStageSize);
    }, [updateStageSize]);

    return { scale, stageSize, updateStageSize };
}
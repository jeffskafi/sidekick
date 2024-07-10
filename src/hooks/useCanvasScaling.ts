// useCanvasScaling.ts
import type { RefObject } from "react";
import { useState, useEffect, useCallback } from 'react';

export function useCanvasScaling(containerRef: RefObject<HTMLDivElement>) {
    const [scale, setScale] = useState(1);
    const [stageSize, setStageSize] = useState({ width: 0, height: 0 });

    const updateStageSize = useCallback(() => {
        if (containerRef.current) {
            setStageSize({
                width: containerRef.current.offsetWidth,
                height: containerRef.current.offsetHeight,
            });
        }
    }, [containerRef]);

    useEffect(() => {
        updateStageSize();
        window.addEventListener('resize', updateStageSize);
        return () => window.removeEventListener('resize', updateStageSize);
    }, [updateStageSize]);

    return { scale, stageSize, updateStageSize };
}
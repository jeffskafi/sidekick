import { useEffect } from 'react';
import type { RefObject } from 'react';
import Konva from 'konva';

export const useHoverAnimation = (hoverCircleRef: RefObject<Konva.Circle>, isHovered: boolean, isSelected: boolean) => {
  useEffect(() => {
    const node = hoverCircleRef.current;
    if (node) {
      node.to({
        opacity: isHovered || isSelected ? 1 : 0,
        strokeWidth: isHovered || isSelected ? 2 : 0,
        duration: 0.3,
      });
    }
  }, [isHovered, isSelected, hoverCircleRef]);
};

export const useStatusAnimation = (
  mainCircleRef: RefObject<Konva.Circle>,
  statusIndicatorRef: RefObject<Konva.Rect>,
  rippleCircleRef: RefObject<Konva.Circle>,
  status: string,
  getStatusColor: (status: string) => string
) => {
  useEffect(() => {
    const mainNode = mainCircleRef.current;
    const statusNode = statusIndicatorRef.current;
    const rippleNode = rippleCircleRef.current;

    if (!mainNode || !statusNode || !rippleNode) return;

    const anim = new Konva.Animation((frame) => {
      const time = frame?.time;
      if (time === undefined) return;

      const statusColor = getStatusColor(status);
      mainNode.stroke(statusColor);

      switch (status) {
        case 'working':
          animateWorking(time, statusNode);
          break;
        case 'needs_human_input':
          animateNeedsHumanInput(time, mainNode, rippleNode, statusColor);
          break;
      }
    }, mainNode.getLayer());

    anim.start();

    return () => {
      anim.stop();
    };
  }, [status, mainCircleRef, statusIndicatorRef, rippleCircleRef, getStatusColor]);
};

const animateWorking = (time: number, statusIndicator: Konva.Rect) => {
  const duration = 2000; // 2 seconds for one complete cycle
  const progress = (time % duration) / duration;
  
  // Morph between rounded square and more rounded square
  const minCornerRadius = 1; // Minimum corner radius
  const maxCornerRadius = 4; // Maximum corner radius
  const morphProgress = Math.abs(Math.sin(progress * Math.PI));
  const cornerRadius = minCornerRadius + (maxCornerRadius - minCornerRadius) * morphProgress;
  
  statusIndicator.cornerRadius(cornerRadius);
};

const animateNeedsHumanInput = (time: number, mainCircle: Konva.Circle, rippleCircle: Konva.Circle, statusColor: string) => {
  const duration = 1500;
  const progress = (time % duration) / duration;
  
  // Inner pulsation
  const innerOpacity = 0.7 * (1 - progress);
  mainCircle.fill(statusColor);
  mainCircle.opacity(innerOpacity);
  
  // Ensure stroke is always visible
  mainCircle.stroke(statusColor);
  mainCircle.setAttr('strokeOpacity', 1);
  
  // Outer ripple effect
  const scale = 1 + 0.5 * progress;
  const outerOpacity = 0.5 * (1 - progress);
  rippleCircle.scale({ x: scale, y: scale });
  rippleCircle.opacity(outerOpacity);
};
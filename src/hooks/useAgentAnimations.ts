import { useEffect, RefObject } from 'react';
import Konva from 'konva';

export const useHoverAnimation = (hoverCircleRef: RefObject<Konva.Circle>, isHovered: boolean) => {
  useEffect(() => {
    const node = hoverCircleRef.current;
    if (node) {
      node.to({
        opacity: isHovered ? 1 : 0,
        duration: 0.3,
      });
    }
  }, [isHovered, hoverCircleRef]);
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
          animateNeedsHumanInput(time, rippleNode);
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
  const progress = (time % 2000) / 2000;
  const scale = 1 + Math.abs(Math.sin(progress * Math.PI)) * 0.2;
  statusIndicator.scale({ x: scale, y: scale });
  
  // Morph between circle and square
  const morphProgress = Math.abs(Math.sin(progress * Math.PI));
  const cornerRadius = 10 * (1 - morphProgress); // 10 is the initial corner radius for a rounded square
  statusIndicator.cornerRadius(cornerRadius);
};

const animateNeedsHumanInput = (time: number, rippleCircle: Konva.Circle) => {
  const rippleProgress = (time % 1500) / 1500;
  const rippleScale = 0.8 + rippleProgress * 0.4;
  const opacity = 0.3 - rippleProgress * 0.3;
  rippleCircle.scale({ x: rippleScale, y: rippleScale });
  rippleCircle.opacity(opacity);
};
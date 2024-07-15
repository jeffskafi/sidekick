import React, { useState, useCallback, useEffect } from "react";
import { useSpring, animated } from "@react-spring/web";
import { X, ChevronUp } from "lucide-react";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  children,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);

  const [{ y }, api] = useSpring(() => ({ y: "100%" }));

  useEffect(() => {
    if (isOpen) {
      api.start({ y: "0%", immediate: false });
    } else {
      api.start({ y: "100%", immediate: false });
    }
  }, [isOpen, api]);

  const handleStart = useCallback((clientY: number) => {
    setIsDragging(true);
    setStartY(clientY);
  }, []);

  const handleMove = useCallback(
    (clientY: number) => {
      if (!isDragging) return;
      const diff = clientY - startY;
      const newY = Math.max(0, Math.min(100, diff / window.innerHeight * 100));
      api.start({ y: `${newY}%`, immediate: true });
    },
    [isDragging, startY, api],
  );

  const handleEnd = useCallback(() => {
    setIsDragging(false);
    const currentY = parseFloat(y.get());
    if (currentY > 50) {
      api.start({ y: "100%", immediate: false });
      onClose();
    } else {
      api.start({ y: "0%", immediate: false });
    }
  }, [y, api, onClose]);

  return (
    <animated.div
      style={{
        bottom: 0,
        left: 0,
        right: 0,
        position: "fixed",
        height: "80%",
        zIndex: 50,
        y,
        touchAction: "none",
      }}
      className="rounded-t-2xl bg-white text-black shadow-lg"
      onTouchStart={(e) => handleStart(e.touches[0].clientY)}
      onTouchMove={(e) => handleMove(e.touches[0].clientY)}
      onTouchEnd={handleEnd}
      onMouseDown={(e) => handleStart(e.clientY)}
      onMouseMove={(e) => handleMove(e.clientY)}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
    >
      <div className="relative p-4">
        <div className="absolute left-0 right-0 top-0 flex flex-col items-center px-4 py-2">
          <div className="h-1 w-16 rounded-full bg-gray-300 mb-2" />
          <div className="flex justify-between items-center w-full">
            <button onClick={onClose} className="p-2">
              <X size={20} className="text-black" />
            </button>
            <button onClick={() => api.start({ y: "0%", immediate: false })} className="p-2">
              <ChevronUp size={20} className="text-black" />
            </button>
          </div>
        </div>
        <div className="pt-16">
          {children}
        </div>
      </div>
    </animated.div>
  );
};
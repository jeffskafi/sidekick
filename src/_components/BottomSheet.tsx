import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
} from "react";
import { useSpring, animated } from "@react-spring/web";
import { X, ChevronUp, ChevronDown } from "lucide-react";

// Custom debounce function with improved typing
function debounce<T extends (...args: never[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const BottomSheet: React.FC<BottomSheetProps> = React.memo(
  ({ isOpen, onClose, children }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isPeeking, setIsPeeking] = useState(true);
    const dragRef = useRef<HTMLDivElement>(null);
    const startYRef = useRef<number>(0);
    const currentYRef = useRef<number>(0);

    const [{ y }, api] = useSpring(() => ({ y: "100%" }));

    useEffect(() => {
      if (isOpen) {
        void api.start({ y: "90%", immediate: false });
        setIsPeeking(true);
      } else {
        void api.start({ y: "100%", immediate: false });
      }
    }, [isOpen, api]);

    const handleStart = useCallback((clientY: number) => {
      setIsDragging(true);
      startYRef.current = clientY;
      currentYRef.current = clientY;
    }, []);

    const handleMove = useMemo(() => {
      const debouncedMove = debounce((clientY: number) => {
        if (!isDragging) return;
        currentYRef.current = clientY;
        const diff = currentYRef.current - startYRef.current;
        const newY = Math.max(
          0,
          Math.min(
            90,
            (diff / window.innerHeight) * 100 + (isPeeking ? 90 : 0),
          ),
        );
        void api.start({ y: `${newY}%`, immediate: true });
      }, 0.01); // 0.01ms debounce for 60fps

      return (clientY: number) => {
        debouncedMove(clientY);
      };
    }, [isDragging, api, isPeeking]);

    const handleEnd = useCallback(() => {
      setIsDragging(false);
      const currentY = parseFloat(y.get());
      if (currentY > 95) {
        void api.start({ y: "100%", immediate: false });
        onClose();
      } else if (currentY > 45) {
        void api.start({ y: "90%", immediate: false });
        setIsPeeking(true);
      } else {
        void api.start({ y: "0%", immediate: false });
        setIsPeeking(false);
      }
    }, [y, api, onClose]);

    const handleExpand = useCallback(() => {
      if (isPeeking) {
        void api.start({ y: "0%", immediate: false });
        setIsPeeking(false);
      } else {
        void api.start({ y: "90%", immediate: false });
        setIsPeeking(true);
      }
    }, [api, isPeeking]);

    const animatedDivStyle = useMemo(
      () => ({
        bottom: 0,
        left: 0,
        right: 0,
        position: "fixed" as const,
        height: "100%",
        zIndex: 50,
        y,
        touchAction: "none" as const,
        backdropFilter: "blur(10px)",
        backgroundColor: "rgba(255, 255, 255, 0.7)",
        border: "1px solid rgba(255, 255, 255, 0.5)",
        borderTopLeftRadius: "16px",
        borderTopRightRadius: "16px",
        boxShadow: "0 12px 24px rgba(0, 0, 0, 0.3)",
      }),
      [y],
    );

    const memoizedContent = useMemo(
      () => (
        <div className="relative p-4">
          <div className="absolute left-0 right-0 top-0 flex flex-col items-center px-4 py-2">
            <div className="mb-2 h-1 w-16 rounded-full bg-gray-300" />
            <div className="flex w-full items-center justify-between">
              <button onClick={onClose} className="p-2">
                <X size={20} className="text-black" />
              </button>
              <button onClick={handleExpand} className="p-2">
                {isPeeking ? (
                  <ChevronUp size={20} className="text-black" />
                ) : (
                  <ChevronDown size={20} className="text-black" />
                )}
              </button>
            </div>
          </div>
          <div className="max-h-[calc(100vh-4rem)] overflow-y-auto pt-16">
            {children}
          </div>
        </div>
      ),
      [children, isPeeking, onClose, handleExpand],
    );

    return (
      <animated.div
        ref={dragRef}
        style={animatedDivStyle}
        className="select-none text-black"
        onPointerDown={(e) => {
          e.preventDefault();
          (e.target as HTMLElement).setPointerCapture(e.pointerId);
          handleStart(e.clientY);
        }}
        onPointerMove={(e) => {
          e.preventDefault();
          handleMove(e.clientY);
        }}
        onPointerUp={(e) => {
          e.preventDefault();
          (e.target as HTMLElement).releasePointerCapture(e.pointerId);
          handleEnd();
        }}
        onPointerCancel={(e) => {
          e.preventDefault();
          (e.target as HTMLElement).releasePointerCapture(e.pointerId);
          handleEnd();
        }}
      >
        {memoizedContent}
      </animated.div>
    );
  },
);

BottomSheet.displayName = "BottomSheet";

export { BottomSheet };
import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
} from "react";
import { useSpring, animated } from "@react-spring/web";
import { X, ChevronUp, ChevronDown } from "lucide-react";
import { useAgentContext } from "~/contexts/AgentContext";
import { useTaskContext } from "~/contexts/TaskContext";
import { debounce } from "~/lib/utils";
import styles from "./BottomSheet.module.css";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const BottomSheet: React.FC<BottomSheetProps> = React.memo(
  ({ isOpen, onClose }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isPeeking, setIsPeeking] = useState(true);
    const dragRef = useRef<HTMLDivElement>(null);
    const startYRef = useRef<number>(0);
    const currentYRef = useRef<number>(0);

    const [{ y }, api] = useSpring(() => ({ y: "100%" }));

    const { selectedAgents } = useAgentContext();
    const { tasks } = useTaskContext();

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
      }),
      [y],
    );

    const memoizedContent = useMemo(() => {
      const getAgentStatus = (agentId: number) => {
        const agentTask = tasks.find((task) => task.agentId === agentId);
        if (!agentTask) return "idle";

        switch (agentTask.status) {
          case "todo":
            return "needs_human_input";
          case "in_progress":
            return "working";
          case "done":
            return "task_complete";
          case "failed":
          case "exception":
            return "error";
          default:
            return "idle";
        }
      };

      const getStatusColor = (status: string) => {
        switch (status) {
          case "idle":
            return "bg-gray-400";
          case "working":
            return "bg-blue-400";
          case "task_complete":
            return "bg-green-400";
          case "needs_human_input":
            return "bg-yellow-400";
          case "error":
            return "bg-red-400";
          default:
            return "bg-gray-400";
        }
      };

      return (
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
            <h2 className="mb-4 text-lg font-semibold">Selected Agents</h2>
            {selectedAgents.map((agent) => {
              const agentStatus = getAgentStatus(agent.id);
              return (
                <div
                  key={agent.id}
                  className="mb-4 rounded-lg border border-gray-200 p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">{agent.name}</h3>
                    <span
                      className={`inline-block h-3 w-3 rounded-full ${getStatusColor(agentStatus)}`}
                    ></span>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    Status: {agentStatus}
                  </p>
                  <p className="text-sm text-gray-600">
                    Position: ({agent.xPosition}, {agent.yPosition})
                  </p>
                  <div className="mt-2">
                    <p className="text-sm font-medium">Skills:</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {agent.skills?.map((skill, index) => (
                        <span
                          key={index}
                          className="rounded-full bg-gray-200 px-2 py-1 text-xs"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }, [isPeeking, onClose, handleExpand, selectedAgents, tasks]);

    return (
      <animated.div
        ref={dragRef}
        style={animatedDivStyle}
        className={`${styles.bottomSheet} select-none overflow-hidden rounded-t-2xl text-black dark:text-white`}
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
        <div className={styles.blurOverlay} />
        <div className={`${styles.content} relative z-10`}>
          {memoizedContent}
        </div>
      </animated.div>
    );
  },
);

BottomSheet.displayName = "BottomSheet";

export { BottomSheet };

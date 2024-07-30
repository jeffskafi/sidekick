import React from "react";
import type { Task } from "~/server/db/schema";
import { Flag } from "lucide-react";

interface PriorityButtonProps {
  priority: Task['priority'];
  onToggle: () => void;
  size?: number;
}

const PriorityButton: React.FC<PriorityButtonProps> = ({
  priority,
  onToggle,
  size = 16,
}) => {
  const colors: Record<Task['priority'], string> = {
    none: "text-gray-300",
    low: "text-green-500",
    medium: "text-yellow-500",
    high: "text-red-500",
  };
  return (
    <button
      onClick={onToggle}
      className={`mr-2 transition-colors duration-300 focus:outline-none ${colors[priority]}`}
      title={priority === "none" ? "Set priority" : `Priority: ${priority}`}
    >
      <Flag size={size} />
    </button>
  );
};

export default PriorityButton;
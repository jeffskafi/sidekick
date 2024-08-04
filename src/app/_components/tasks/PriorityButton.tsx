import React from "react";
import type { Task } from "~/server/db/schema";
import { Flag } from "lucide-react";

interface PriorityButtonProps {
  priority: Task['priority'];
  onToggle: () => void;
  size?: number;
}

const PriorityButton: React.FC<PriorityButtonProps> = ({ priority, onToggle, size = 24 }) => {
  const priorityColors = {
    none: "text-gray-400 hover:text-primary-light dark:hover:text-primary-dark",
    low: "text-primary-light dark:text-primary-dark",
    medium: "text-secondary-light dark:text-secondary-dark",
    high: "text-accent-light dark:text-accent-dark",
  };

  return (
    <button
      onClick={onToggle}
      className={`transition-colors duration-200 ${priorityColors[priority]}`}
      title={priority === "none" ? "Set priority" : `Priority: ${priority}`}
    >
      <Flag size={size} />
    </button>
  );
};

export default PriorityButton;
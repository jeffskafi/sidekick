"use client";

import { useState } from "react";
import { useTheme } from "../ThemeProvider";

interface AnimatedCheckmarkProps {
  completed: boolean;
  onToggle: () => void;
  size?: number;
}

const AnimatedCheckmark: React.FC<AnimatedCheckmarkProps> = ({
  completed,
  onToggle,
  size = 20,
}) => {
  const { theme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);

  const handleToggle = () => {
    onToggle();
    if (completed) {
      setIsDisabled(true);
      setTimeout(() => setIsDisabled(false), 300);
    }
  };

  return (
    <button
      onClick={handleToggle}
      onMouseEnter={() => !isDisabled && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`mr-2 flex items-center justify-center rounded-full transition-all duration-300 h-${size} w-${size} ${
        completed
          ? "bg-green-500"
          : theme === "dark"
            ? "border border-gray-600 bg-gray-700 hover:border-green-400"
            : "border border-gray-300 bg-white hover:border-green-400"
      }`}
    >
      <svg
        width={size * 0.8}
        height={size * 0.8}
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`transition-all duration-300 ${
          completed
            ? "opacity-100"
            : isHovered && !isDisabled
              ? "opacity-50"
              : "opacity-0"
        }`}
      >
        <path
          d="M4 8L7 11L12 6"
          stroke={completed ? "#8affb7" : "#3fcf72"}
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={
            completed ? "animate-draw-checkmark" : "animate-hover-checkmark"
          }
        />
      </svg>
    </button>
  );
};

export default AnimatedCheckmark;
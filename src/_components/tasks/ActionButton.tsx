import React from "react";
import { motion } from "framer-motion";

const ActionButton: React.FC<{
  icon: React.ReactNode;
  onClick: () => void;
  label: string;
  theme: "light" | "dark";
}> = ({ icon, onClick, label, theme }) => (
  <motion.button
    onClick={onClick}
    className={`${
      theme === "dark"
        ? "bg-background-dark text-primary-dark hover:bg-gray-700"
        : "bg-background-light text-primary hover:bg-gray-100"
    } flex h-7 w-7 touch-manipulation items-center justify-center rounded-full transition-colors`}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    aria-label={label}
  >
    {icon}
  </motion.button>
);

export default ActionButton;

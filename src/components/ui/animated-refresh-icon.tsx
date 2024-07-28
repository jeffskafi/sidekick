import React from "react";
import { motion } from "framer-motion";
import { RefreshCw, Loader2 } from "lucide-react";

interface AnimatedRefreshIconProps {
  isLoading: boolean;
  size: number;
}

const AnimatedRefreshIcon: React.FC<AnimatedRefreshIconProps> = ({
  isLoading,
  size,
}) => {
  return (
    <motion.div
      className={!isLoading ? "pulse" : ""}
    >
      {isLoading ? (
        <Loader2 size={size} className="animate-spin" />
      ) : (
        <RefreshCw size={size} />
      )}
    </motion.div>
  );
};

export default AnimatedRefreshIcon;
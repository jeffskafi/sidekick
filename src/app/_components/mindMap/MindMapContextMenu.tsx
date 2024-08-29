import React from "react";
import { Button } from "~/components/ui/button";
import { Trash2, Pen } from "lucide-react";
import { motion } from "framer-motion";

interface MindMapItemMenuProps {
  x: number;
  y: number;
  onDelete: () => void;
  onRename: () => void;
}

const MindMapItemMenu: React.FC<MindMapItemMenuProps> = ({
  x,
  y,
  onDelete,
  onRename,
}) => {
  const iconButtonClass =
    "h-8 w-8 p-0 rounded-full transition-colors duration-200 ease-in-out no-highlight flex items-center justify-center";

  const getButtonClass = (baseClass: string) => {
    return `${iconButtonClass} ${baseClass}`;
  };

  return (
    <div className="absolute z-50" style={{ left: `${x}px`, top: `${y}px` }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center space-x-2 rounded-full bg-surface-light p-1 dark:bg-surface-dark"
      >
        <Button
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            onRename();
          }}
          className={getButtonClass(
            "text-primary-light hover:bg-primary-light hover:text-white dark:text-primary-dark dark:hover:bg-primary-dark dark:hover:text-white",
          )}
        >
          <Pen size={20} />
        </Button>
        <Button
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className={getButtonClass(
            "text-primary-light hover:bg-red-100 hover:text-red-600 dark:text-primary-dark dark:hover:bg-red-900 dark:hover:text-red-400",
          )}
        >
          <Trash2 size={20} />
        </Button>
      </motion.div>
    </div>
  );
};

export default MindMapItemMenu;

import React from "react";
import { Button } from "~/components/ui/button";
import { Trash2, Pen, Zap } from "lucide-react";
import { motion } from "framer-motion";

interface NodeContextMenuProps {
  x: number;
  y: number;
  onDelete: () => void;
  onEdit: () => void;
  onGenerate: () => void;
}

const NodeContextMenu: React.FC<NodeContextMenuProps> = ({
  x,
  y,
  onDelete,
  onEdit,
  onGenerate,
}) => {
  const iconButtonClass =
    "h-8 w-8 p-0 rounded-full transition-colors duration-200 ease-in-out no-highlight flex items-center justify-center";

  const getButtonClass = (baseClass: string) => {
    return `${iconButtonClass} ${baseClass}`;
  };

  return (
    <div
      className="absolute z-50"
      style={{ left: `${x}px`, top: `${y}px` }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center space-x-2 bg-amber-100 dark:bg-amber-900 rounded-full p-1"
      >
        <Button
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            onGenerate();
          }}
          className={getButtonClass(
            "text-amber-500 hover:bg-amber-500 hover:text-white dark:text-amber-400 dark:hover:bg-amber-500 dark:hover:text-white"
          )}
        >
          <Zap size={20} />
        </Button>
        <Button
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className={getButtonClass(
            "text-amber-600 hover:bg-amber-600 hover:text-white dark:text-amber-300 dark:hover:bg-amber-500 dark:hover:text-white"
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
            "text-amber-500 hover:bg-red-100 hover:text-red-600 dark:text-amber-400 dark:hover:bg-red-900 dark:hover:text-red-400"
          )}
        >
          <Trash2 size={20} />
        </Button>
      </motion.div>
    </div>
  );
};

export default NodeContextMenu;

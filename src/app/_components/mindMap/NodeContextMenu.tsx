import React from "react";
import { Trash2, Pen, Zap } from "lucide-react";
import { Button } from "~/components/ui/button";

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
  const buttonClass =
    "flex items-center px-3 py-2 text-sm transition-colors duration-200 ease-in-out";

  return (
    <div
      className="context-menu absolute z-50 flex overflow-hidden rounded-lg bg-white shadow-lg dark:bg-gray-800"
      style={{ left: `${x}px`, top: `${y}px` }}
    >
      <Button
        variant="ghost"
        className={`${buttonClass} text-amber-600 hover:bg-amber-100 hover:text-amber-700 dark:text-amber-400 dark:hover:bg-amber-900 dark:hover:text-amber-300`}
        onClick={onEdit}
      >
        <Pen size={16} />
      </Button>
      <Button
        variant="ghost"
        className={`${buttonClass} text-amber-500 hover:bg-amber-100 hover:text-amber-600 dark:text-amber-400 dark:hover:bg-amber-900 dark:hover:text-amber-300`}
        onClick={onGenerate}
      >
        <Zap size={16} />
      </Button>
      <Button
        variant="ghost"
        className={`${buttonClass} text-red-500 hover:bg-red-100 hover:text-red-600 dark:text-red-400 dark:hover:bg-red-900 dark:hover:text-red-300`}
        onClick={onDelete}
      >
        <Trash2 size={16} />
      </Button>
    </div>
  );
};

export default NodeContextMenu;

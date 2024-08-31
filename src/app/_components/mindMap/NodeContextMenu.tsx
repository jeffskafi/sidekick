import React from "react";
import { Trash2, Pen, Zap } from "lucide-react";
import CommonContextMenu from "~/components/ui/context-menu";

interface NodeContextMenuProps {
  x: number;
  y: number;
  onDelete: () => void;
  onEdit: () => void;
  onGenerate: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const NodeContextMenu: React.FC<NodeContextMenuProps> = ({
  x,
  y,
  onDelete,
  onEdit,
  onGenerate,
  isOpen,
  onClose,
}) => {
  const getContextMenuActions = () => [
    {
      icon: <Zap size={20} />,
      label: "Generate",
      onClick: onGenerate,
      className:
        "text-amber-500 hover:bg-amber-500 hover:text-white dark:text-amber-400 dark:hover:bg-amber-500 dark:hover:text-white",
    },
    {
      icon: <Pen size={20} />,
      label: "Edit",
      onClick: onEdit,
      className:
        "text-amber-600 hover:bg-amber-600 hover:text-white dark:text-amber-300 dark:hover:bg-amber-500 dark:hover:text-white",
    },
    {
      icon: <Trash2 size={20} />,
      label: "Delete",
      onClick: onDelete,
      className:
        "text-amber-500 hover:bg-red-100 hover:text-red-600 dark:text-amber-400 dark:hover:bg-red-900 dark:hover:text-red-400",
    },
  ];

  return (
    <div className="absolute z-50" style={{ left: `${x}px`, top: `${y}px` }}>
      <CommonContextMenu
        actions={getContextMenuActions()}
        isOpen={isOpen}
        onClose={onClose}
      />
    </div>
  );
};

export default NodeContextMenu;

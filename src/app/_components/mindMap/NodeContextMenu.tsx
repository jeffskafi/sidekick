import React from 'react';

interface NodeContextMenuProps {
  x: number;
  y: number;
  onDelete: () => void;
  onEdit: () => void;
  onGenerate: () => void;
}

const NodeContextMenu: React.FC<NodeContextMenuProps> = ({ x, y, onDelete, onEdit, onGenerate }) => {
  return (
    <div 
      className="absolute bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden z-50 context-menu"
      style={{ left: `${x}px`, top: `${y}px` }}
    >
      <button 
        className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
        onClick={onDelete}
      >
        Delete
      </button>
      <button 
        className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
        onClick={onEdit}
      >
        Edit
      </button>
      <button 
        className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
        onClick={onGenerate}
      >
        Generate
      </button>
    </div>
  );
};

export default NodeContextMenu;

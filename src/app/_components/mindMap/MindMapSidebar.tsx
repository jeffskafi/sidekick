import React, { useState } from "react";
import type { MindMap } from "~/server/db/schema";
import { Button } from "~/components/ui/button";
import { ChevronLeft, ChevronRight, Zap, Pen, Trash2 } from "lucide-react";
import { useMindMapContext } from "~/app/_contexts/MindMapContext";
import { motion, AnimatePresence } from "framer-motion";
import ContextMenu from "~/components/ui/context-menu";

interface MindMapSidebarProps {
  mindMaps: MindMap[];
  onSelectMindMap: (mindMap: MindMap) => void;
  selectedMindMapId: string | undefined;
}

const MindMapSidebar: React.FC<MindMapSidebarProps> = ({
  mindMaps,
  onSelectMindMap,
  selectedMindMapId,
}) => {
  const { deleteMindMap, renameMindMap } = useMindMapContext();
  const [renamingMindMapId, setRenamingMindMapId] = useState<string | null>(null);
  const [newMindMapName, setNewMindMapName] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleDelete = async (mindMapId: string) => {
    await deleteMindMap(mindMapId);
  };

  const handleRename = async (mindMapId: string) => {
    setRenamingMindMapId(mindMapId);
    setNewMindMapName(mindMaps.find(m => m.id === mindMapId)?.name ?? "");
  };

  const confirmRename = async (mindMapId: string) => {
    if (newMindMapName.trim()) {
      await renameMindMap(mindMapId, newMindMapName.trim());
      setRenamingMindMapId(null);
    }
  };

  const getContextMenuActions = (mindMap: MindMap) => [
    {
      icon: <Zap size={20} />,
      label: "Auto-name",
      onClick: () => {
        // Implement auto-naming logic here
        console.log("Auto-naming mind map:", mindMap.id);
      },
      className: "text-amber-500 hover:bg-amber-500 hover:text-white dark:text-amber-400 dark:hover:bg-amber-500 dark:hover:text-white",
    },
    {
      icon: <Pen size={20} />,
      label: "Rename",
      onClick: () => handleRename(mindMap.id),
      className: "text-amber-600 hover:bg-amber-600 hover:text-white dark:text-amber-300 dark:hover:bg-amber-500 dark:hover:text-white",
    },
    {
      icon: <Trash2 size={20} />,
      label: "Delete",
      onClick: () => handleDelete(mindMap.id),
      className: "text-amber-500 hover:bg-red-100 hover:text-red-600 dark:text-amber-400 dark:hover:bg-red-900 dark:hover:text-red-400",
    },
  ];

  return (
    <motion.div
      className="bg-surface-light dark:bg-surface-dark flex flex-col h-full absolute left-0 top-0 z-10"
      animate={{ width: isCollapsed ? "48px" : "256px" }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      style={{ boxShadow: isCollapsed ? "none" : "4px 0 6px rgba(0,0,0,0.1)" }}
    >
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-0 top-2 z-20 mr-1"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
      </Button>
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex-grow overflow-hidden flex flex-col"
          >
            <h2 className="text-xl font-bold text-text-light dark:text-text-dark p-4">Mind Maps</h2>
            <div className="flex-grow overflow-y-auto">
              <ul className="px-4 pb-4">
                {mindMaps.map((mindMap) => (
                  <li
                    key={mindMap.id}
                    className={`mb-2 flex items-center justify-between rounded p-2 ${
                      selectedMindMapId === mindMap.id
                        ? "bg-primary-light dark:bg-primary-dark text-white"
                        : "text-text-light dark:text-text-dark"
                    }`}
                  >
                    {renamingMindMapId === mindMap.id ? (
                      <input
                        type="text"
                        value={newMindMapName}
                        onChange={(e) => setNewMindMapName(e.target.value)}
                        onBlur={() => confirmRename(mindMap.id)}
                        onKeyPress={(e) => e.key === 'Enter' && confirmRename(mindMap.id)}
                        className="w-full bg-transparent text-text-light dark:text-text-dark"
                        autoFocus
                      />
                    ) : (
                      <span onClick={() => onSelectMindMap(mindMap)} className="cursor-pointer flex-grow">
                        {mindMap.name}
                      </span>
                    )}
                    <ContextMenu actions={getContextMenuActions(mindMap)} />
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default MindMapSidebar;

import React, { useState, useEffect } from "react";
import type { MindMap } from "~/server/db/schema";
import { Button } from "~/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Pen,
  Trash2,
  MoreHorizontal,
} from "lucide-react";
import { useMindMapContext } from "~/app/_contexts/MindMapContext";
import { motion, AnimatePresence } from "framer-motion";
import ContextMenu from "~/components/ui/context-menu";

interface MindMapSidebarProps {
  mindMaps: MindMap[];
  onSelectMindMap: (mindMap: MindMap | null) => void;
  selectedMindMapId: string | undefined;
  isCollapsed: boolean;
  setIsCollapsed: (isCollapsed: boolean) => void;
}

const MindMapSidebar: React.FC<MindMapSidebarProps> = ({
  mindMaps,
  onSelectMindMap,
  selectedMindMapId,
  isCollapsed,
  setIsCollapsed,
}) => {
  const { deleteMindMap, renameMindMap, fetchMindMaps } = useMindMapContext();
  const [renamingMindMapId, setRenamingMindMapId] = useState<string | null>(null);
  const [newMindMapName, setNewMindMapName] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    void fetchMindMaps();
  }, [fetchMindMaps]);

  useEffect(() => {
    // This effect will run whenever mindMaps prop changes
  }, [mindMaps]);

  const handleDelete = async (mindMapId: string) => {
    await deleteMindMap(mindMapId);
    // After deleting, fetch the updated list of mind maps
    await fetchMindMaps();
    // If the deleted mind map was selected, clear the selection
    if (selectedMindMapId === mindMapId) {
      onSelectMindMap(null);
    }
  };

  const handleRename = async (mindMapId: string) => {
    setRenamingMindMapId(mindMapId);
    setNewMindMapName(mindMaps.find((m) => m.id === mindMapId)?.name ?? "");
  };

  const confirmRename = async (mindMapId: string) => {
    if (newMindMapName.trim()) {
      await renameMindMap(mindMapId, newMindMapName.trim());
      setRenamingMindMapId(null);
    }
  };

  const handleMenuToggle = (mindMapId: string) => {
    setOpenMenuId(openMenuId === mindMapId ? null : mindMapId);
  };

  const getContextMenuActions = (mindMap: MindMap) => [
    {
      icon: <Pen size={20} />,
      label: "Rename",
      onClick: () => handleRename(mindMap.id),
      className:
        "text-amber-600 hover:bg-amber-600 hover:text-white dark:text-amber-300 dark:hover:bg-amber-500 dark:hover:text-white",
    },
    {
      icon: <Trash2 size={20} />,
      label: "Delete",
      onClick: () => handleDelete(mindMap.id),
      className:
        "text-amber-500 hover:bg-red-100 hover:text-red-600 dark:text-amber-400 dark:hover:bg-red-900 dark:hover:text-red-400",
    },
  ];

  const handleMindMapSelect = (mindMap: MindMap) => {
    onSelectMindMap(mindMap);
    setIsCollapsed(true);
  };

  return (
    <motion.div
      className="absolute left-0 top-0 z-10 flex h-full flex-col bg-surface-light dark:bg-surface-dark"
      animate={{ width: isCollapsed ? "0px" : "256px" }}
      transition={{ duration: 0.1, ease: "easeInOut" }}
      style={{ boxShadow: isCollapsed ? "none" : "4px 0 6px rgba(0,0,0,0.1)" }}
    >
      <div className="flex items-center justify-between p-4">
        {!isCollapsed && (
          <h2 className="text-xl font-bold text-text-light dark:text-text-dark">
            Mind Maps
          </h2>
        )}
        <div className="flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full p-0 mr-2 text-text-light dark:text-text-dark hover:bg-surface-light dark:hover:bg-surface-dark"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </Button>
        </div>
      </div>
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-grow flex-col overflow-hidden"
          >
            <div className="flex-grow overflow-y-auto">
              <ul className="px-4 pb-4">
                {mindMaps.map((mindMap) => (
                  <li
                    key={mindMap.id}
                    className={`mb-2 flex items-center justify-between rounded p-2 ${
                      selectedMindMapId === mindMap.id
                        ? "bg-primary-light dark:bg-primary-dark text-white"
                        : "text-text-light dark:text-text-dark hover:bg-surface-light dark:hover:bg-surface-dark"
                    }`}
                  >
                    {renamingMindMapId === mindMap.id ? (
                      <input
                        type="text"
                        value={newMindMapName}
                        onChange={(e) => setNewMindMapName(e.target.value)}
                        onBlur={() => confirmRename(mindMap.id)}
                        onKeyPress={(e) =>
                          e.key === "Enter" && confirmRename(mindMap.id)
                        }
                        className="w-full bg-transparent text-text-light dark:text-text-dark"
                        autoFocus
                      />
                    ) : (
                      <>
                        <span
                          onClick={() => handleMindMapSelect(mindMap)}
                          className="flex-grow cursor-pointer"
                        >
                          {mindMap.name}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 p-0 rounded-full text-text-light dark:text-text-dark hover:bg-surface-light dark:hover:bg-surface-dark"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMenuToggle(mindMap.id);
                          }}
                        >
                          <MoreHorizontal size={20} />
                        </Button>
                        {openMenuId === mindMap.id && (
                          <div className="absolute right-0 mt-2">
                            <ContextMenu
                              actions={getContextMenuActions(mindMap)}
                              isOpen={true}
                              onClose={() => setOpenMenuId(null)}
                            />
                          </div>
                        )}
                      </>
                    )}
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

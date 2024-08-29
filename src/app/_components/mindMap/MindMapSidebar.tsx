import React, { useState } from "react";
import type { MindMap } from "~/server/db/schema";
import { Button } from "~/components/ui/button";
import { MoreHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import { useMindMapContext } from "~/app/_contexts/MindMapContext";
import MindMapContextMenu from "./MindMapContextMenu";
import { motion, AnimatePresence } from "framer-motion";

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
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; mindMapId: string } | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleDelete = async (mindMapId: string) => {
    await deleteMindMap(mindMapId);
    setContextMenu(null);
  };

  const handleRename = async (mindMapId: string) => {
    setRenamingMindMapId(mindMapId);
    setNewMindMapName(mindMaps.find(m => m.id === mindMapId)?.name ?? "");
    setContextMenu(null);
  };

  const confirmRename = async (mindMapId: string) => {
    if (newMindMapName.trim()) {
      await renameMindMap(mindMapId, newMindMapName.trim());
      setRenamingMindMapId(null);
    }
  };

  return (
    <motion.div
      className="bg-surface-light dark:bg-surface-dark flex flex-col h-full relative"
      animate={{ width: isCollapsed ? "48px" : "256px" }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-4 top-2 z-10"
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
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 p-0"
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setContextMenu({
                          x: rect.left,
                          y: rect.bottom,
                          mindMapId: mindMap.id,
                        });
                      }}
                    >
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {contextMenu && (
        <MindMapContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onDelete={() => handleDelete(contextMenu.mindMapId)}
          onRename={() => handleRename(contextMenu.mindMapId)}
        />
      )}
    </motion.div>
  );
};

export default MindMapSidebar;

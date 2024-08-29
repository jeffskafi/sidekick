import React from "react";
import type { MindMap } from "~/server/db/schema";

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
  return (
    <div className="w-64 bg-gray-100 p-4 dark:bg-gray-800">
      <h2 className="mb-4 text-xl font-bold">Mind Maps</h2>
      <ul>
        {mindMaps.map((mindMap) => (
          <li
            key={mindMap.id}
            className={`mb-2 cursor-pointer rounded p-2 ${
              selectedMindMapId === mindMap.id
                ? "bg-blue-100 dark:bg-blue-900"
                : ""
            }`}
            onClick={() => onSelectMindMap(mindMap)}
          >
            {mindMap.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MindMapSidebar;

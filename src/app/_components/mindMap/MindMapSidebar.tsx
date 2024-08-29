import React, { useState, useEffect } from 'react';
import { getUserMindMaps, createMindMap } from '~/server/actions/mindMapActions';
import type { MindMap } from '~/server/db/schema';

interface MindMapSidebarProps {
  onSelectMindMap: (mindMap: MindMap) => void;
  selectedMindMapId?: string;
}

const MindMapSidebar: React.FC<MindMapSidebarProps> = ({ onSelectMindMap, selectedMindMapId }) => {
  const [mindMaps, setMindMaps] = useState<MindMap[]>([]);
  const [newMapName, setNewMapName] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    void loadMindMaps();
  }, []);

  const loadMindMaps = async () => {
    const maps = await getUserMindMaps();
    setMindMaps(maps);
  };

  const handleCreateMap = async () => {
    if (newMapName.trim()) {
      const newMap = await createMindMap(newMapName);
      setNewMapName('');
      setMindMaps([...mindMaps, newMap]);
    }
  };

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <button onClick={() => setIsCollapsed(!isCollapsed)} className="toggle-btn">
        {isCollapsed ? '>' : '<'}
      </button>
      {!isCollapsed && (
        <>
          <h2>Your Mind Maps</h2>
          <ul>
            {mindMaps.map(map => (
              <li key={map.id} className={map.id === selectedMindMapId ? 'selected' : ''}>
                <button onClick={() => onSelectMindMap(map)}>{map.name}</button>
              </li>
            ))}
          </ul>
          <div>
            <input
              type="text"
              value={newMapName}
              onChange={(e) => setNewMapName(e.target.value)}
              placeholder="New mind map name"
            />
            <button onClick={handleCreateMap}>Create</button>
          </div>
        </>
      )}
    </div>
  );
};

export default MindMapSidebar;
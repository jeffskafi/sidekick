"use client";

import React, {
  useCallback,
  useRef,
  useState,
  useMemo,
  useEffect,
} from "react";
import ForceGraphComponent from "./DynamicForceGraph";
import type { ForceGraphMethods } from "react-force-graph-2d";
import NodeContextMenu from "./NodeContextMenu";
import { useMindMapContext } from "~/app/_contexts/MindMapContext";
import EditNodeModal from "./EditNodeModal";
import type { MindMapNode, MindMapLink } from "~/server/db/schema";
import MindMapSidebar from "./MindMapSidebar";
import { Button } from "~/components/ui/button";
import { Plus } from "lucide-react";
import NewMindMapModal from "./NewMindMapModal";
import { useDarkMode } from "~/app/_contexts/DarkModeContext";
import colors from "tailwindcss/colors";
import type { MindMap } from "~/server/db/schema"; // Make sure this import is correct
import { useWindowSize } from "~/app/_hooks/useWindowSize"; // Add this import

interface UIMindMapNode extends MindMapNode {
  x?: number;
  y?: number;
  __bckgDimensions?: [number, number];
}

interface UIMindMapLink extends Omit<MindMapLink, "sourceId" | "targetId"> {
  source: string;
  target: string;
}

const MindMap: React.FC = () => {
  const {
    graphData,
    handleDeleteNode,
    handleEditNode,
    handleGenerateChildren,
    editingNode,
    setEditingNode,
    handleConfirmEdit,
    loadMindMap,
    createMindMap,
    fetchMindMaps,
    mindMaps,
    selectedMindMapId,
    setSelectedMindMapId,
  } = useMindMapContext();
  const { isDarkMode } = useDarkMode();
  const { width, height } = useWindowSize();

  const [isCollapsed, setIsCollapsed] = useState(false);

  const transformedGraphData = useMemo(
    () => ({
      nodes: graphData.nodes as UIMindMapNode[],
      links: graphData.links.map((link: MindMapLink) => ({
        ...link,
        source: link.sourceId,
        target: link.targetId,
      })) as UIMindMapLink[],
    }),
    [graphData],
  );

  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    node: MindMapNode;
    isOpen: boolean;
  } | null>(null);
  const graphRef = useRef<ForceGraphMethods>(null);
  const [isNewMindMapModalOpen, setIsNewMindMapModalOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const handleNodeClick = (node: UIMindMapNode, event: MouseEvent) => {
    event.preventDefault();
    setContextMenu({
      x: event.clientX,
      y: event.clientY - 100,
      node,
      isOpen: true,
    });
  };

  const handleBackgroundClick = () => {
    setContextMenu(null);
  };

  const handleZoomPan = () => {
    setContextMenu(null);
  };

  const dismissContextMenu = () => {
    if (contextMenu) {
      setContextMenu({ ...contextMenu, isOpen: false });
    }
  };

  const nodeCanvasObject = useCallback(
    (
      node: UIMindMapNode,
      ctx: CanvasRenderingContext2D,
      globalScale: number,
    ) => {
      const label = node.label;
      const fontSize = 16 / globalScale;
      ctx.font = `${fontSize}px Inter, sans-serif`;
      const textWidth = ctx.measureText(label).width;
      const bckgDimensions = [textWidth, fontSize].map(
        (n) => n + fontSize * 0.8,
      ) as [number, number];

      ctx.fillStyle = "#FF7247";
      ctx.beginPath();
      if (node.x !== undefined && node.y !== undefined) {
        ctx.roundRect(
          node.x - bckgDimensions[0] / 2,
          node.y - bckgDimensions[1] / 2,
          bckgDimensions[0],
          bckgDimensions[1],
          5,
        );
      }
      ctx.fill();

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#4A3000";
      ctx.fillText(label, node.x ?? 0, node.y ?? 0);

      node.__bckgDimensions = bckgDimensions;
    },
    [],
  );

  const nodePointerAreaPaint = useCallback(
    (node: UIMindMapNode, color: string, ctx: CanvasRenderingContext2D) => {
      const bckgDimensions = node.__bckgDimensions;
      if (bckgDimensions && node.x !== undefined && node.y !== undefined) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.roundRect(
          node.x - bckgDimensions[0] / 2,
          node.y - bckgDimensions[1] / 2,
          bckgDimensions[0],
          bckgDimensions[1],
          5,
        );
        ctx.fill();
      }
    },
    [],
  );

  const handleCreateNewMindMap = async (rootNodeLabel: string) => {
    const newMindMap = await createMindMap(rootNodeLabel);
    await loadMindMap(newMindMap.id);
    setSelectedMindMapId(newMindMap.id);
    await fetchMindMaps(); // Add this line to refresh the list of mind maps
    setIsNewMindMapModalOpen(false);
  };

  useEffect(() => {
    void fetchMindMaps();
  }, [fetchMindMaps]);

  const graphBackgroundColor = isDarkMode
    ? "rgb(var(--dark-bg))"
    : colors.white;

  const handleSelectMindMap = (mindMap: MindMap | null) => {
    setSelectedMindMapId(mindMap?.id);
    setIsCollapsed(true); // Collapse sidebar when a mind map is selected
    if (mindMap) {
      void loadMindMap(mindMap.id);
    } else {
      setSelectedMindMapId(undefined);
      // Optionally, clear the graph data or load a default mind map
      // setGraphData({ nodes: [], links: [] });
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setIsCollapsed(true);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative flex h-full w-full bg-white dark:bg-dark-bg">
      <div ref={sidebarRef}>
        <MindMapSidebar
          mindMaps={mindMaps}
          onSelectMindMap={handleSelectMindMap}
          selectedMindMapId={selectedMindMapId}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />
      </div>
      <div className="flex-1 overflow-hidden">
        <Button
          className="absolute right-4 top-4 z-10"
          onClick={() => setIsNewMindMapModalOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" /> New Mind Map
        </Button>
        <ForceGraphComponent
          ref={graphRef}
          graphData={transformedGraphData}
          nodeId="id"
          nodeLabel=""
          nodeCanvasObject={nodeCanvasObject}
          nodePointerAreaPaint={nodePointerAreaPaint}
          onNodeClick={handleNodeClick}
          onBackgroundClick={handleBackgroundClick}
          onZoomEnd={handleZoomPan}
          linkColor={() => colors.orange[300]} // Using Tailwind's color palette
          linkWidth={2}
          width={width - (isCollapsed ? 0 : 256)} // Subtract sidebar width when expanded
          height={height - 56} // Subtract header height
          backgroundColor={graphBackgroundColor}
        />
        {contextMenu && (
          <NodeContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            onDelete={() => {
              void handleDeleteNode(contextMenu.node.id);
              dismissContextMenu();
            }}
            onEdit={() => {
              handleEditNode(contextMenu.node);
              dismissContextMenu();
            }}
            onGenerate={() => {
              void handleGenerateChildren(contextMenu.node);
              dismissContextMenu();
            }}
            isOpen={contextMenu.isOpen}
            onClose={dismissContextMenu}
          />
        )}
        {editingNode && (
          <EditNodeModal
            node={editingNode}
            onConfirm={(newLabel) => {
              void handleConfirmEdit(editingNode.id, newLabel);
              dismissContextMenu();
            }}
            onCancel={() => {
              setEditingNode(null);
              dismissContextMenu();
            }}
          />
        )}
      </div>
      <NewMindMapModal
        isOpen={isNewMindMapModalOpen}
        onClose={() => setIsNewMindMapModalOpen(false)}
        onConfirm={handleCreateNewMindMap}
      />
    </div>
  );
};

export default MindMap;

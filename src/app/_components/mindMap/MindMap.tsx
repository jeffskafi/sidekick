"use client";

import React, { useCallback, useRef, useState, useMemo, useEffect } from "react";
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

interface UIMindMapNode extends MindMapNode {
  x?: number;
  y?: number;
  __bckgDimensions?: [number, number];
}

interface UIMindMapLink extends Omit<MindMapLink, 'sourceId' | 'targetId'> {
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
    mindMaps,  // Add this
  } = useMindMapContext();

  const transformedGraphData = useMemo(() => ({
    nodes: graphData.nodes as UIMindMapNode[],
    links: graphData.links.map((link: MindMapLink) => ({
      ...link,
      source: link.sourceId,
      target: link.targetId
    })) as UIMindMapLink[]
  }), [graphData]);

  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    node: MindMapNode;
  } | null>(null);
  const graphRef = useRef<ForceGraphMethods>(null);
  const [isNewMindMapModalOpen, setIsNewMindMapModalOpen] = useState(false);
  const [selectedMindMapId, setSelectedMindMapId] = useState<string | undefined>(undefined);

  const handleNodeClick = (node: UIMindMapNode, event: MouseEvent) => {
    event.preventDefault();
    setContextMenu({ x: event.clientX, y: event.clientY + 20, node });
  };

  const handleBackgroundClick = () => {
    setContextMenu(null);
  };

  const handleZoomPan = () => {
    setContextMenu(null);
  };

  // Add this new function to dismiss the context menu
  const dismissContextMenu = () => {
    setContextMenu(null);
  };

  const nodeCanvasObject = useCallback(
    (node: UIMindMapNode, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const label = node.label;
      const fontSize = 16 / globalScale;
      ctx.font = `${fontSize}px Inter, sans-serif`;
      const textWidth = ctx.measureText(label).width;
      const bckgDimensions = [textWidth, fontSize].map((n) => n + fontSize * 0.8) as [number, number];

      ctx.fillStyle = "#FF7247";
      ctx.beginPath();
      if (node.x !== undefined && node.y !== undefined) {
        ctx.roundRect(
          node.x - bckgDimensions[0] / 2,
          node.y - bckgDimensions[1] / 2,
          bckgDimensions[0],
          bckgDimensions[1],
          5
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
          5
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
    setIsNewMindMapModalOpen(false);
  };

  useEffect(() => {
    void fetchMindMaps();
  }, [fetchMindMaps]);

  return (
    <div className="relative flex h-screen w-screen bg-background-light dark:bg-background-dark">
      <MindMapSidebar
        mindMaps={mindMaps}  // Pass mindMaps to the sidebar
        onSelectMindMap={(mindMap) => {
          void loadMindMap(mindMap.id);
          setSelectedMindMapId(mindMap.id);
        }}
        selectedMindMapId={selectedMindMapId}
      />
      <div className="flex-grow">
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
          linkColor={() => "#FFA07A"}
          linkWidth={2}
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

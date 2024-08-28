"use client";

import React, { useCallback, useRef, useState, useEffect } from "react";
import type { Node } from "./types";
import ForceGraphComponent from "./DynamicForceGraph";
import type { ForceGraphMethods } from "react-force-graph-2d";
import NodeContextMenu from "./NodeContextMenu";
import { useMindMapContext } from "~/app/_contexts/MindMapContext";
import EditNodeModal from "./EditNodeModal";

const MindMap: React.FC = () => {
  const {
    graphData,
    handleDeleteNode,
    handleEditNode,
    handleGenerateChildren,
    editingNode,
    setEditingNode,
    handleConfirmEdit,
  } = useMindMapContext();
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    node: Node;
  } | null>(null);
  const graphRef = useRef<ForceGraphMethods>(null);

  const handleNodeClick = (node: Node, event: MouseEvent) => {
    event.preventDefault();
    setContextMenu({ x: event.clientX, y: event.clientY - 84, node });
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
    (node: Node, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const label = node.label;
      const fontSize = 16 / globalScale;
      ctx.font = `${fontSize}px Inter, sans-serif`;
      const textWidth = ctx.measureText(label).width;
      const bckgDimensions: [number, number] = [textWidth, fontSize].map(
        (n) => n + fontSize * 0.8,
      ) as [number, number];

      ctx.fillStyle = "#FF7247";
      ctx.beginPath();
      ctx.roundRect(
        (node.x ?? 0) - bckgDimensions[0] / 2,
        (node.y ?? 0) - bckgDimensions[1] / 2,
        bckgDimensions[0],
        bckgDimensions[1],
        5,
      );
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
    (node: Node, color: string, ctx: CanvasRenderingContext2D) => {
      const bckgDimensions = node.__bckgDimensions;
      if (bckgDimensions) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.roundRect(
          (node.x ?? 0) - bckgDimensions[0] / 2,
          (node.y ?? 0) - bckgDimensions[1] / 2,
          bckgDimensions[0],
          bckgDimensions[1],
          5,
        );
        ctx.fill();
      }
    },
    [],
  );

  useEffect(() => {
    console.log('Graph data updated:', graphData);
  }, [graphData]);

  return (
    <div className="relative h-screen w-screen bg-background-light dark:bg-background-dark">
      <ForceGraphComponent
        ref={graphRef}
        graphData={graphData}
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
            handleDeleteNode(contextMenu.node.id);
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
            handleConfirmEdit(editingNode.id, newLabel);
            dismissContextMenu();
          }}
          onCancel={() => {
            setEditingNode(null);
            dismissContextMenu();
          }}
        />
      )}
    </div>
  );
};

export default MindMap;

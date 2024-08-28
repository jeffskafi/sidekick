"use client";

import React, { useCallback, useRef, useState } from "react";
import type { Node } from "./types";
import ForceGraphComponent from "./DynamicForceGraph";
import type { ForceGraphMethods } from "react-force-graph-2d";
import NodeContextMenu from "./NodeContextMenu";
import { useMindMapContext } from "~/app/_contexts/MindMapContext";

const MindMap: React.FC = () => {
  const {
    graphData,
    handleDeleteNode,
    handleEditNode,
    handleGenerateChildren,
  } = useMindMapContext();
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    node: Node;
  } | null>(null);
  const graphRef = useRef<ForceGraphMethods>(null);

  const handleNodeClick = (node: Node, event: MouseEvent) => {
    event.preventDefault();
    setContextMenu({ x: event.clientX, y: event.clientY, node });
  };

  const handleBackgroundClick = () => {
    setContextMenu(null);
  };

  const handleZoomPan = () => {
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

  return (
    <div className="relative h-screen w-screen bg-background-light dark:bg-background-dark">
      <ForceGraphComponent
        ref={graphRef}
        graphData={graphData}
        nodeId="id"
        nodeLabel="label"
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
          onDelete={() => handleDeleteNode(contextMenu.node.id)}
          onEdit={() => handleEditNode(contextMenu.node)}
          onGenerate={() => handleGenerateChildren(contextMenu.node)}
        />
      )}
    </div>
  );
};

export default MindMap;

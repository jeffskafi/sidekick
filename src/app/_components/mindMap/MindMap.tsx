"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { generateRelatedWords } from "~/server/actions/mindMapActions";
import type { Link, GraphData } from "./DynamicForceGraph";
import NodeContextMenu from "./NodeContextMenu";
import type { Node } from "./types";
import ForceGraphComponent from "./DynamicForceGraph";
import type { ForceGraphMethods } from "react-force-graph-2d";

const MindMap: React.FC = () => {
  const [graphData, setGraphData] = useState<GraphData>({
    nodes: [],
    links: [],
  });
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    node: Node;
  } | null>(null);
  const graphRef = useRef<ForceGraphMethods>(null);

  useEffect(() => {
    setGraphData({
      nodes: [{ id: "root", label: "Root", name: "Root" }],
      links: [],
    });
  }, []);

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

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        contextMenu &&
        event.target instanceof Element &&
        !event.target.closest(".context-menu")
      ) {
        setContextMenu(null);
      }
    };

    document.addEventListener("click", handleOutsideClick);

    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, [contextMenu]);

  const handleDeleteNode = useCallback((nodeId: string) => {
    setGraphData((prevData) => {
      const nodesToDelete = new Set<string>();
      const linksToDelete = new Set<string>();

      const deleteRecursively = (id: string) => {
        nodesToDelete.add(id);
        prevData.links.forEach((link) => {
          const sourceId =
            typeof link.source === "object" ? link.source.id : link.source;
          const targetId =
            typeof link.target === "object" ? link.target.id : link.target;

          // Delete link to parent
          if (targetId === id) {
            const linkId = `${sourceId}-${targetId}`;
            linksToDelete.add(linkId);
          }

          // Delete links to children
          if (sourceId === id) {
            const linkId = `${sourceId}-${targetId}`;
            linksToDelete.add(linkId);
            deleteRecursively(targetId);
          }
        });
      };

      deleteRecursively(nodeId);

      const newNodes = prevData.nodes.filter(
        (node) => !nodesToDelete.has(node.id),
      );
      const newLinks = prevData.links.filter((link) => {
        const sourceId =
          typeof link.source === "object" ? link.source.id : link.source;
        const targetId =
          typeof link.target === "object" ? link.target.id : link.target;
        return !linksToDelete.has(`${sourceId}-${targetId}`);
      });

      return {
        nodes: newNodes,
        links: newLinks,
      };
    });
    setContextMenu(null);
  }, []);

  const handleEditNode = useCallback((node: Node) => {
    console.log("Edit node:", node);
    setContextMenu(null);
  }, []);

  const handleGenerateChildren = useCallback(async (node: Node) => {
    const relatedWords = await generateRelatedWords(node.label);

    setGraphData((prevData) => {
      const newNodes: Node[] = relatedWords.map((word, index) => ({
        id: `${node.id}-${index}`,
        label: word,
        name: word,
      }));

      const newLinks: Link[] = newNodes.map((newNode) => ({
        source: node.id,
        target: newNode.id,
      }));

      // Remove existing children
      const existingChildrenIds = prevData.links
        .filter((link) => link.source === node.id)
        .map((link) => link.target as string);

      return {
        nodes: [
          ...prevData.nodes.filter((n) => !existingChildrenIds.includes(n.id)),
          ...newNodes,
        ],
        links: [
          ...prevData.links.filter((link) => link.source !== node.id),
          ...newLinks,
        ],
      };
    });

    setContextMenu(null);
  }, []);

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

"use client";

import React, { useEffect, useRef, useCallback, useState } from "react";
import ForceGraph, {
  type NodeObject,
  type ForceGraphInstance,
} from "force-graph";
import { useMindMapContext } from "~/app/_contexts/MindMapContext";
import * as d3 from "d3";

interface Node extends NodeObject {
  id: string;
  name: string;
  isRoot?: boolean;
  isLoading?: boolean;
  __bckgDimensions?: [number, number, number, number, number];
}

interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  nodeId: string | null;
}

const NODE_R = 5; // Node radius
const MAX_NODE_WIDTH = 150; // Maximum width of the node
const MAX_NODE_HEIGHT = 40; // Maximum height of the node
const LINK_DISTANCE = 60; // Desired distance between linked nodes

const MindMap: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<ForceGraphInstance | null>(null);
  const { data, addNode, removeNode, generateRelatedWords } =
    useMindMapContext();

  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    nodeId: null,
  });

  const handleMenuClick = useCallback(
    (node: NodeObject, event: MouseEvent) => {
      event.stopPropagation();
      console.log("Menu clicked for node:", node.id);
      setContextMenu({
        visible: true,
        x: event.clientX,
        y: event.clientY,
        nodeId: node.id as string,
      });
    },
    []
  );

  const handleContextMenuAction = useCallback(
    (action: 'expand' | 'remove') => {
      if (contextMenu.nodeId) {
        if (action === 'remove') {
          removeNode(contextMenu.nodeId);
        } else if (action === 'expand') {
          // Wrap the async operation in a void function
          void (async () => {
            try {
              const node = data.nodes.find(n => n.id === contextMenu.nodeId) as Node;
              if (node && !node.isLoading) {
                const relatedWords = await generateRelatedWords(node.name);
                addNode(node.id, relatedWords);
              }
            } catch (error) {
              console.error("Failed to generate related words:", error);
            }
          })();
        }
      }
      setContextMenu({ ...contextMenu, visible: false });
    },
    [contextMenu, removeNode, addNode, generateRelatedWords, data.nodes]
  );

  useEffect(() => {
    if (!containerRef.current) return;

    console.log("Initializing ForceGraph");

    graphRef.current = ForceGraph()(containerRef.current)
      .graphData(data)
      .nodeId("id")
      .nodeColor((node: NodeObject) =>
        (node as Node).isRoot ? "#ff7f0e" : "#1f77b4"
      )
      .nodeVal(NODE_R)
      .linkColor(() => "#999999")
      .linkWidth(1)
      .d3Force("link", d3.forceLink().id((d: d3.SimulationNodeDatum) => (d as Node).id).distance(LINK_DISTANCE))
      .nodeCanvasObject((node, ctx, globalScale) => {
        const typedNode = node as Node;
        const label = typedNode.name;
        const fontSize = 12 / globalScale;
        ctx.font = `${fontSize}px Sans-Serif`;
        
        // Measure text width and apply ellipsis if necessary
        let textWidth = ctx.measureText(label).width;
        let displayLabel = label;
        if (textWidth > MAX_NODE_WIDTH - 20) {
          const ellipsisWidth = ctx.measureText('...').width;
          const availableWidth = MAX_NODE_WIDTH - 20 - ellipsisWidth;
          let truncatedLabel = '';
          for (const char of label) {
            if (ctx.measureText(truncatedLabel + char).width > availableWidth) {
              break;
            }
            truncatedLabel += char;
          }
          displayLabel = truncatedLabel + '...';
          textWidth = MAX_NODE_WIDTH - 20;
        }

        const nodeWidth = Math.min(textWidth + 20, MAX_NODE_WIDTH);
        const nodeHeight = Math.min(fontSize + 10, MAX_NODE_HEIGHT);

        // Draw pill shape
        ctx.beginPath();
        ctx.moveTo(node.x! - nodeWidth/2 + nodeHeight/2, node.y! - nodeHeight/2);
        ctx.lineTo(node.x! + nodeWidth/2 - nodeHeight/2, node.y! - nodeHeight/2);
        ctx.arc(node.x! + nodeWidth/2 - nodeHeight/2, node.y!, nodeHeight/2, -Math.PI/2, Math.PI/2);
        ctx.lineTo(node.x! - nodeWidth/2 + nodeHeight/2, node.y! + nodeHeight/2);
        ctx.arc(node.x! - nodeWidth/2 + nodeHeight/2, node.y!, nodeHeight/2, Math.PI/2, -Math.PI/2);
        ctx.closePath();

        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        ctx.fill();

        ctx.strokeStyle = typedNode.isRoot ? "#ff7f0e" : "#1f77b4";
        ctx.stroke();

        // Draw text
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = typedNode.isRoot ? "#ff7f0e" : "#1f77b4";
        ctx.fillText(displayLabel, node.x!, node.y!);

        // Draw menu button outside the node
        const menuSize = 16;
        const menuX = node.x! + nodeWidth / 2 + menuSize / 2 + 5;
        const menuY = node.y!;
        
        ctx.fillStyle = "#666";
        ctx.beginPath();
        ctx.arc(menuX, menuY, menuSize / 2, 0, 2 * Math.PI);
        ctx.fill();

        ctx.fillStyle = "#fff";
        ctx.fillRect(menuX - menuSize / 4, menuY - 1, menuSize / 2, 2);
        ctx.fillRect(menuX - menuSize / 4, menuY - 4, menuSize / 2, 2);
        ctx.fillRect(menuX - menuSize / 4, menuY + 2, menuSize / 2, 2);

        typedNode.__bckgDimensions = [nodeWidth, nodeHeight, menuX, menuY, menuSize];
      })
      .nodePointerAreaPaint((node, color, ctx) => {
        const typedNode = node as Node;
        const [nodeWidth, nodeHeight, menuX, menuY, menuSize] = typedNode.__bckgDimensions ?? [0, 0, 0, 0, 0];
        
        // Paint node area
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(node.x! - nodeWidth/2 + nodeHeight/2, node.y! - nodeHeight/2);
        ctx.lineTo(node.x! + nodeWidth/2 - nodeHeight/2, node.y! - nodeHeight/2);
        ctx.arc(node.x! + nodeWidth/2 - nodeHeight/2, node.y!, nodeHeight/2, -Math.PI/2, Math.PI/2);
        ctx.lineTo(node.x! - nodeWidth/2 + nodeHeight/2, node.y! + nodeHeight/2);
        ctx.arc(node.x! - nodeWidth/2 + nodeHeight/2, node.y!, nodeHeight/2, Math.PI/2, -Math.PI/2);
        ctx.closePath();
        ctx.fill();
        
        // Paint menu button area
        ctx.beginPath();
        ctx.arc(menuX, menuY, menuSize / 2, 0, 2 * Math.PI);
        ctx.fill();
      })
      .onNodeClick((node, event) => {
        console.log("Node clicked:", node.id);
        const typedNode = node as Node;
        const [,, menuX, menuY, menuSize] = typedNode.__bckgDimensions ?? [0, 0, 0, 0, 0];
        
        const graphPos = graphRef.current!.screen2GraphCoords(event.offsetX, event.offsetY);
        const dx = graphPos.x - menuX;
        const dy = graphPos.y - menuY;
        
        console.log("Click position:", dx, dy);
        console.log("Menu position:", menuX, menuY);
        console.log("Menu size:", menuSize);

        if (dx * dx + dy * dy <= (menuSize / 2) * (menuSize / 2)) {
          console.log("Menu click detected");
          handleMenuClick(node, event);
        } else {
          console.log("Click on node body");
          // Handle node body click if needed
        }
      });

    console.log("ForceGraph initialized");

    return () => {
      graphRef.current?.pauseAnimation();
    };
  }, [data, handleMenuClick]);

  console.log("Rendering MindMap component");
  console.log("Context menu state:", contextMenu);

  return (
    <>
      <div ref={containerRef} className="w-full h-full" />
      {contextMenu.visible && (
        <div
          style={{
            position: 'absolute',
            top: `${contextMenu.y}px`,
            left: `${contextMenu.x}px`,
            background: 'white',
            border: '1px solid #ccc',
            borderRadius: '4px',
            padding: '8px',
            zIndex: 1000,
          }}
        >
          <button onClick={() => handleContextMenuAction('expand')}>Expand</button>
          <button onClick={() => handleContextMenuAction('remove')}>Remove</button>
        </div>
      )}
    </>
  );
};

export default MindMap;

"use client";

import React, { useEffect, useRef, useCallback } from "react";
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
  __bckgDimensions?: [number, number];
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

  const handleNodeClick = useCallback(
    (node: NodeObject) => {
      const typedNode = node as Node;
      if (typedNode.isLoading) return;

      // Wrap the async operation in a void function
      void (async () => {
        try {
          const relatedWords = await generateRelatedWords(typedNode.name);
          addNode(typedNode.id, relatedWords);
        } catch (error) {
          console.error("Failed to generate related words:", error);
        }
      })();
    },
    [addNode, generateRelatedWords],
  );

  const handleNodeRemove = useCallback(
    (node: NodeObject) => {
      removeNode(node.id as string);
    },
    [removeNode],
  );

  useEffect(() => {
    if (!containerRef.current) return;

    graphRef.current = ForceGraph()(containerRef.current)
      .graphData(data)
      .nodeId("id")
      .nodeColor((node: NodeObject) =>
        (node as Node).isRoot ? "#ff7f0e" : "#1f77b4",
      )
      .nodeVal(NODE_R)
      .linkColor(() => "#999999")
      .linkWidth(1)
      .d3Force("link", d3.forceLink().id((d: d3.SimulationNodeDatum) => (d as Node).id).distance(LINK_DISTANCE))
      .onNodeClick(handleNodeClick)
      .onNodeRightClick(handleNodeRemove)
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

        ctx.strokeStyle = (node as Node).isRoot ? "#ff7f0e" : "#1f77b4";
        ctx.stroke();

        // Draw text
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = (node as Node).isRoot ? "#ff7f0e" : "#1f77b4";
        ctx.fillText(displayLabel, node.x!, node.y!);

        typedNode.__bckgDimensions = [nodeWidth, nodeHeight]; // to re-use in nodePointerAreaPaint
      })
      .nodePointerAreaPaint((node, color, ctx) => {
        const typedNode = node as Node;
        ctx.fillStyle = color;
        const [nodeWidth, nodeHeight] = typedNode.__bckgDimensions ?? [0, 0];
        ctx.beginPath();
        ctx.moveTo(node.x! - nodeWidth/2 + nodeHeight/2, node.y! - nodeHeight/2);
        ctx.lineTo(node.x! + nodeWidth/2 - nodeHeight/2, node.y! - nodeHeight/2);
        ctx.arc(node.x! + nodeWidth/2 - nodeHeight/2, node.y!, nodeHeight/2, -Math.PI/2, Math.PI/2);
        ctx.lineTo(node.x! - nodeWidth/2 + nodeHeight/2, node.y! + nodeHeight/2);
        ctx.arc(node.x! - nodeWidth/2 + nodeHeight/2, node.y!, nodeHeight/2, Math.PI/2, -Math.PI/2);
        ctx.closePath();
        ctx.fill();
      });

    return () => {
      graphRef.current?.pauseAnimation();
    };
  }, [data, handleNodeClick, handleNodeRemove]);

  return <div ref={containerRef} className="w-full h-full" />;
};

export default MindMap;

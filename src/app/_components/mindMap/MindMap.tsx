"use client";

import React, { useEffect, useRef, useCallback } from "react";
import ForceGraph, {
  type NodeObject,
  type ForceGraphInstance,
} from "force-graph";
import { useMindMapContext } from "~/app/_contexts/MindMapContext";

interface Node extends NodeObject {
  id: string;
  name: string;
  isRoot?: boolean;
  isLoading?: boolean;
}

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
      .nodeLabel("name")
      .nodeColor((node: NodeObject) =>
        (node as Node).isRoot ? "#ff7f0e" : "#1f77b4",
      )
      .nodeVal(5)
      .linkColor(() => "#999999")
      .linkWidth(2)
      .onNodeClick(handleNodeClick)
      .onNodeRightClick(handleNodeRemove);

    return () => {
      graphRef.current?.pauseAnimation();
    };
  }, [data, handleNodeClick, handleNodeRemove]);

  return <div ref={containerRef} className="h-full w-full" />;
};

export default MindMap;

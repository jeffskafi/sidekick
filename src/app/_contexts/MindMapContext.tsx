"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { generateRelatedWords as generateRelatedWordsAction } from "~/server/actions/mindMapActions";
import type { GraphData, Node, Link } from "~/app/_components/mindMap/types";

interface MindMapContextType {
  graphData: GraphData;
  setGraphData: React.Dispatch<React.SetStateAction<GraphData>>;
  handleDeleteNode: (nodeId: string) => void;
  handleEditNode: (node: Node) => void;
  handleGenerateChildren: (node: Node) => Promise<void>;
}

const MindMapContext = createContext<MindMapContextType | undefined>(undefined);

export function MindMapProvider({ children }: { children: React.ReactNode }) {
  const [graphData, setGraphData] = useState<GraphData>({
    nodes: [],
    links: [],
  });

  useEffect(() => {
    setGraphData({
      nodes: [{ id: "root", label: "Root", name: "Root" }],
      links: [],
    });
  }, []);

  const handleDeleteNode = useCallback((nodeId: string) => {
    setGraphData((prevData) => {
      const nodesToDelete = new Set<string>();
      const linksToDelete = new Set<string>();

      const deleteRecursively = (id: string) => {
        nodesToDelete.add(id);
        prevData.links.forEach((link) => {
          const sourceId = typeof link.source === "object" ? link.source.id : link.source;
          const targetId = typeof link.target === "object" ? link.target.id : link.target;

          if (targetId === id) {
            const linkId = `${sourceId}-${targetId}`;
            linksToDelete.add(linkId);
          }

          if (sourceId === id) {
            const linkId = `${sourceId}-${targetId}`;
            linksToDelete.add(linkId);
            deleteRecursively(targetId);
          }
        });
      };

      deleteRecursively(nodeId);

      return {
        nodes: prevData.nodes.filter((node) => !nodesToDelete.has(node.id)),
        links: prevData.links.filter((link) => {
          const sourceId = typeof link.source === "object" ? link.source.id : link.source;
          const targetId = typeof link.target === "object" ? link.target.id : link.target;
          return !linksToDelete.has(`${sourceId}-${targetId}`);
        }),
      };
    });
  }, []);

  const handleEditNode = useCallback((node: Node) => {
    console.log("Edit node:", node);
    // Implement edit functionality here
  }, []);

  const handleGenerateChildren = useCallback(async (node: Node) => {
    const relatedWords = await generateRelatedWordsAction(node.label);

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
  }, []);

  const value = {
    graphData,
    setGraphData,
    handleDeleteNode,
    handleEditNode,
    handleGenerateChildren,
  };

  return (
    <MindMapContext.Provider value={value}>{children}</MindMapContext.Provider>
  );
}

export function useMindMapContext() {
  const context = useContext(MindMapContext);
  if (context === undefined) {
    throw new Error("useMindMapContext must be used within a MindMapProvider");
  }
  return context;
}

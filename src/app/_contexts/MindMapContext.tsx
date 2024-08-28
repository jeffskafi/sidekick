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
  editingNode: Node | null;
  setEditingNode: React.Dispatch<React.SetStateAction<Node | null>>;
  handleConfirmEdit: (nodeId: string, newLabel: string) => void;
}

const MindMapContext = createContext<MindMapContextType | undefined>(undefined);

export function MindMapProvider({ children }: { children: React.ReactNode }) {
  const [graphData, setGraphData] = useState<GraphData>({
    nodes: [],
    links: [],
  });
  const [editingNode, setEditingNode] = useState<Node | null>(null);

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
    setEditingNode(node);
  }, []);

  const handleConfirmEdit = useCallback((nodeId: string, newLabel: string) => {
    setGraphData((prevData) => {
      const nodeBeforeUpdate = prevData.nodes.find(node => node.id === nodeId);
      console.log('Node before update:', nodeBeforeUpdate);

      const updatedData = {
        ...prevData,
        nodes: prevData.nodes.map((node) =>
          node.id === nodeId
            ? {
                ...node,
                label: newLabel,
                name: newLabel,
                x: node.x,
                y: node.y,
                vx: 0,
                vy: 0,
                fx: node.x,
                fy: node.y,
              }
            : node
        ),
      };

      const nodeAfterUpdate = updatedData.nodes.find(node => node.id === nodeId);
      console.log('Node after update:', nodeAfterUpdate);

      return updatedData;
    });
    setEditingNode(null);
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
    editingNode,
    setEditingNode,
    handleConfirmEdit,
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

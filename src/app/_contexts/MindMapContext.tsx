"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { generateRelatedWords as generateRelatedWordsAction } from "~/server/actions/mindMapActions";

interface Node {
  id: string;
  name: string;
  isRoot?: boolean;
  isLoading?: boolean;
}

interface Link {
  source: string;
  target: string;
}

interface Data {
  nodes: Node[];
  links: Link[];
}

interface MindMapContextType {
  data: Data;
  addNode: (parentId: string, words: string[]) => void;
  removeNode: (nodeId: string) => void;
  generateRelatedWords: (word: string) => Promise<string[]>;
}

const MindMapContext = createContext<MindMapContextType | undefined>(undefined);

export function MindMapProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<Data>({
    nodes: [{ id: "0", name: "Central Idea", isRoot: true }],
    links: []
  });

  const addNode = useCallback((parentId: string, words: string[]) => {
    setData(prevData => {
      const newNodes = words.map((word, index) => ({
        id: `${parentId}-${index}`,
        name: word
      }));
      const newLinks = newNodes.map(node => ({
        source: parentId,
        target: node.id
      }));

      return {
        nodes: [...prevData.nodes, ...newNodes],
        links: [...prevData.links, ...newLinks]
      };
    });
  }, []);

  const removeNode = useCallback((nodeId: string) => {
    setData(prevData => {
      const nodes = prevData.nodes.filter(n => n.id !== nodeId);
      const links = prevData.links.filter(l => l.source !== nodeId && l.target !== nodeId);
      return { nodes, links };
    });
  }, []);

  const generateRelatedWords = useCallback(async (word: string) => {
    try {
      return await generateRelatedWordsAction(word);
    } catch (error) {
      console.error('Failed to generate related words:', error);
      throw error;
    }
  }, []);

  const value = {
    data,
    addNode,
    removeNode,
    generateRelatedWords,
  };

  return <MindMapContext.Provider value={value}>{children}</MindMapContext.Provider>;
}

export function useMindMapContext() {
  const context = useContext(MindMapContext);
  if (context === undefined) {
    throw new Error("useMindMapContext must be used within a MindMapProvider");
  }
  return context;
}
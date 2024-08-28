"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import * as mindMapActions from "~/server/actions/mindMapActions";
import type { MindMap, MindMapNode, MindMapLink } from "~/server/db/schema";

interface MindMapContextType {
  mindMap: MindMap | null;
  nodes: MindMapNode[];
  links: MindMapLink[];
  loadMindMap: (mindMapId: string) => Promise<void>;
  createMindMap: (name: string) => Promise<MindMap>;
  addNode: (label: string, x: number, y: number) => Promise<MindMapNode>;
  updateNode: (nodeId: string, label: string, x: number, y: number) => Promise<MindMapNode>;
  deleteNode: (nodeId: string) => Promise<void>;
  addLink: (sourceId: string, targetId: string) => Promise<MindMapLink>;
  generateRelatedWords: (word: string) => Promise<string[]>;
  deleteMindMap: (mindMapId: string) => Promise<void>;
}

const MindMapContext = createContext<MindMapContextType | undefined>(undefined);

export function MindMapProvider({ children }: { children: React.ReactNode }) {
  const [mindMap, setMindMap] = useState<MindMap | null>(null);
  const [nodes, setNodes] = useState<MindMapNode[]>([]);
  const [links, setLinks] = useState<MindMapLink[]>([]);

  const loadMindMap = useCallback(async (mindMapId: string) => {
    const data = await mindMapActions.getMindMap(mindMapId);
    setMindMap(data.mindMap);
    setNodes(data.nodes);
    setLinks(data.links);
  }, []);

  const createMindMap = useCallback(async (name: string) => {
    const newMindMap = await mindMapActions.createMindMap(name);
    setMindMap(newMindMap);
    setNodes([]);
    setLinks([]);
    return newMindMap;
  }, []);

  const addNode = useCallback(async (label: string, x: number, y: number) => {
    if (!mindMap) throw new Error('No mind map loaded');
    const newNode = await mindMapActions.addNodeToMindMap(mindMap.id, label, x, y);
    setNodes(prev => [...prev, newNode]);
    return newNode;
  }, [mindMap]);

  const updateNode = useCallback(async (nodeId: string, label: string, x: number, y: number) => {
    const updatedNode = await mindMapActions.updateNode(nodeId, label, x, y);
    setNodes(prev => prev.map(node => node.id === nodeId ? updatedNode : node));
    return updatedNode;
  }, []);

  const deleteNode = useCallback(async (nodeId: string) => {
    await mindMapActions.deleteNode(nodeId);
    setNodes(prev => prev.filter(node => node.id !== nodeId));
    setLinks(prev => prev.filter(link => link.sourceId !== nodeId && link.targetId !== nodeId));
  }, []);

  const addLink = useCallback(async (sourceId: string, targetId: string) => {
    if (!mindMap) throw new Error('No mind map loaded');
    const newLink = await mindMapActions.addLinkToMindMap(mindMap.id, sourceId, targetId);
    setLinks(prev => [...prev, newLink]);
    return newLink;
  }, [mindMap]);

  const generateRelatedWords = useCallback(async (word: string) => {
    if (!mindMap) throw new Error('No mind map loaded');
    const relatedWords = await mindMapActions.generateRelatedWords(word, mindMap.id);
    await loadMindMap(mindMap.id); // Refresh the mind map data after generating related words
    return relatedWords;
  }, [mindMap, loadMindMap]);

  const deleteMindMap = useCallback(async (mindMapId: string) => {
    await mindMapActions.deleteMindMap(mindMapId);
    setMindMap(null);
    setNodes([]);
    setLinks([]);
  }, []);

  const value: MindMapContextType = {
    mindMap,
    nodes,
    links,
    loadMindMap,
    createMindMap,
    addNode,
    updateNode,
    deleteNode,
    addLink,
    generateRelatedWords,
    deleteMindMap,
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

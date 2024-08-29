"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import * as mindMapActions from "~/server/actions/mindMapActions";
import type { MindMap, MindMapNode, MindMapLink } from "~/server/db/schema";

export interface MindMapContextType {
  mindMaps: MindMap[];
  mindMap: MindMap | null;
  nodes: MindMapNode[];
  links: MindMapLink[];
  loadMindMap: (mindMapId: string) => Promise<void>;
  createMindMap: (rootNodeLabel: string) => Promise<MindMap>;
  addNode: (label: string) => Promise<MindMapNode>;
  updateNode: (nodeId: string, label: string) => Promise<MindMapNode>;
  deleteNode: (nodeId: string) => Promise<void>;
  addLink: (sourceId: string, targetId: string) => Promise<MindMapLink>;
  generateRelatedWords: (word: string) => Promise<string[]>;
  deleteMindMap: (mindMapId: string) => Promise<void>;
  setMindMap: React.Dispatch<React.SetStateAction<MindMap | null>>;
  graphData: { nodes: MindMapNode[]; links: MindMapLink[] };
  handleDeleteNode: (nodeId: string) => Promise<void>;
  handleEditNode: (node: MindMapNode) => void;
  handleGenerateChildren: (node: MindMapNode) => Promise<void>;
  editingNode: MindMapNode | null;
  setEditingNode: (node: MindMapNode | null) => void;
  handleConfirmEdit: (nodeId: string, newLabel: string) => Promise<void>;
  fetchMindMaps: () => Promise<void>;
  renameMindMap: (mindMapId: string, newName: string) => Promise<void>;
}

const MindMapContext = createContext<MindMapContextType | undefined>(undefined);

export function MindMapProvider({ children }: { children: React.ReactNode }) {
  const [mindMaps, setMindMaps] = useState<MindMap[]>([]);
  const [mindMap, setMindMap] = useState<MindMap | null>(null);
  const [nodes, setNodes] = useState<MindMapNode[]>([]);
  const [links, setLinks] = useState<MindMapLink[]>([]);
  const [editingNode, setEditingNode] = useState<MindMapNode | null>(null);

  const loadMindMap = useCallback(async (mindMapId: string) => {
    const data = await mindMapActions.getMindMap(mindMapId);
    setMindMap(data.mindMap);
    setNodes(data.nodes);
    setLinks(data.links);
  }, []);

  const createMindMap = useCallback(async (rootNodeLabel: string) => {
    const newMindMap = await mindMapActions.createMindMap(rootNodeLabel);
    setMindMap(newMindMap);
    const rootNode = await mindMapActions.addNodeToMindMap(newMindMap.id, rootNodeLabel);
    setNodes([rootNode]);
    setLinks([]);
    return newMindMap;
  }, []);

  const addNode = useCallback(async (label: string) => {
    if (!mindMap) throw new Error('No mind map loaded');
    const newNode = await mindMapActions.addNodeToMindMap(mindMap.id, label);
    setNodes(prev => [...prev, newNode]);
    return newNode;
  }, [mindMap]);

  const updateNode = useCallback(async (nodeId: string, label: string) => {
    const updatedNode = await mindMapActions.updateNode(nodeId, label);
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
    const relatedWords = await mindMapActions.generateRelatedWords(word);
    await loadMindMap(mindMap.id); // Refresh the mind map data after generating related words
    return relatedWords;
  }, [mindMap, loadMindMap]);

  const deleteMindMap = useCallback(async (mindMapId: string) => {
    await mindMapActions.deleteMindMap(mindMapId);
    setMindMap(null);
    setNodes([]);
    setLinks([]);
  }, []);

  const handleDeleteNode = useCallback(async (nodeId: string) => {
    try {
      await mindMapActions.deleteNode(nodeId);
      // After successful deletion, reload the entire mind map
      if (mindMap) {
        await loadMindMap(mindMap.id);
      }
    } catch (error) {
      console.error("Failed to delete node:", error);
      // Optionally, show an error message to the user
    }
  }, [mindMap, loadMindMap]);

  const handleEditNode = useCallback((node: MindMapNode) => {
    setEditingNode(node);
  }, []);

  const handleGenerateChildren = useCallback(async (node: MindMapNode) => {
    if (!mindMap) return;
    const relatedWords = await mindMapActions.generateRelatedWords(node.label);
    
    // Batch add nodes
    const newNodes = await mindMapActions.batchAddNodesToMindMap(mindMap.id, relatedWords);
    
    // Batch add links
    const newNodeIds = newNodes.map(n => n.id);
    const newLinks = await mindMapActions.batchAddLinksToMindMap(mindMap.id, node.id, newNodeIds);
    
    // Update local state
    setNodes(prevNodes => [...prevNodes, ...newNodes]);
    setLinks(prevLinks => [...prevLinks, ...newLinks]);
  }, [mindMap]);

  const handleConfirmEdit = useCallback(async (nodeId: string, newLabel: string) => {
    await updateNode(nodeId, newLabel);
    setEditingNode(null);
  }, [updateNode]);

  const fetchMindMaps = useCallback(async () => {
    const fetchedMindMaps = await mindMapActions.getUserMindMaps();
    setMindMaps(fetchedMindMaps);
  }, []);

  const renameMindMap = useCallback(async (mindMapId: string, newName: string) => {
    await mindMapActions.renameMindMap(mindMapId, newName);
    await fetchMindMaps(); // Refresh the list of mind maps
  }, [fetchMindMaps]);

  const value: MindMapContextType = {
    mindMaps,
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
    setMindMap,
    graphData: { nodes, links },
    handleDeleteNode,
    handleEditNode,
    handleGenerateChildren,
    editingNode,
    setEditingNode,
    handleConfirmEdit,
    fetchMindMaps,
    renameMindMap,
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

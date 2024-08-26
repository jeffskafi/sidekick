"use client";

import React, { createContext, useContext, useCallback } from "react";
import { generateRelatedWords as generateRelatedWordsAction } from "~/server/actions/mindMapActions";

interface MindMapContextType {
  generateRelatedWords: (word: string) => Promise<string[]>;
}

const MindMapContext = createContext<MindMapContextType | undefined>(undefined);

export function MindMapProvider({ children }: { children: React.ReactNode }) {
  const generateRelatedWords = useCallback(async (word: string) => {
    try {
      return await generateRelatedWordsAction(word);
    } catch (error) {
      console.error('Failed to generate related words:', error);
      throw error; // Re-throw the error so it can be handled in the component
    }
  }, []);

  const value = {
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
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";

interface DarkModeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => Promise<void>;
}

const DarkModeContext = createContext<DarkModeContextType | undefined>(
  undefined,
);

export const useDarkMode = () => {
  const context = useContext(DarkModeContext);
  if (context === undefined) {
    throw new Error("useDarkMode must be used within a DarkModeProvider");
  }
  return context;
};

export const DarkModeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, isLoaded } = useUser();
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (isLoaded && user) {
      const darkModePreference = user.unsafeMetadata.darkMode as
        | boolean
        | undefined;
      setIsDarkMode(darkModePreference ?? false);
      document.documentElement.classList.toggle(
        "dark",
        darkModePreference ?? false,
      );
    }
  }, [isLoaded, user]);

  const toggleDarkMode = async () => {
    if (!user) return;

    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    document.documentElement.classList.toggle("dark", newDarkMode);

    try {
      await user.update({
        unsafeMetadata: {
          darkMode: newDarkMode,
        },
      });
    } catch (error) {
      console.error("Failed to update dark mode preference:", error);
      setIsDarkMode(!newDarkMode);
      document.documentElement.classList.toggle("dark", !newDarkMode);
    }
  };

  return (
    <DarkModeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  );
};

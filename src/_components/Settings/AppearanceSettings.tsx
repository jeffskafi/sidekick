import React, { useState, useEffect } from "react";
import { Label } from "~/components/ui/label";
import SettingsSection from "~/_components/Settings/SettingsSection";

export default function AppearanceSettings() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check the initial theme when the component mounts
    const isDark = document.body.classList.contains('dark-mode');
    setIsDarkMode(isDark);
  }, []);

  const toggleDarkMode = () => {
    document.body.classList.toggle('dark-mode');
    setIsDarkMode(!isDarkMode);
  };

  return (
    <SettingsSection title="Appearance">
      <div className="space-y-4">
        <Label
          htmlFor="theme"
          className="block text-sm font-medium text-gray-700"
        >
          Theme
        </Label>
        <div className="toggle-container">
          <span className="toggle-label">Dark Mode</span>
          <div className={`toggle-switch ${isDarkMode ? 'dark-mode' : ''}`} onClick={toggleDarkMode}>
            <div className="toggle-button"></div>
            <div className="sun"></div>
            <div className="moon"></div>
          </div>
        </div>
      </div>
    </SettingsSection>
  );
}
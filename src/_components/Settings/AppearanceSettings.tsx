import React, { useState, useEffect } from "react";
import { Label } from "~/components/ui/label";
import SettingsSection from "~/_components/Settings/SettingsSection";
import "~/styles/darkModeToggle.css";

const generateStars = (count: number) => {
  return Array.from({ length: count }, () => ({
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 1}s`,
  }));
};

interface AppearanceSettingsProps {
  isDarkMode: boolean;
  toggleDarkMode: (darkMode: boolean) => void;
}

export default function AppearanceSettings({ isDarkMode, toggleDarkMode }: AppearanceSettingsProps) {
  const [stars, setStars] = useState(generateStars(20));

  const handleToggle = () => {
    toggleDarkMode(!isDarkMode);
    setStars(generateStars(20));
  };

  return (
    <SettingsSection title="Appearance">
      <div className="space-y-4">
        <Label
          htmlFor="theme"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Theme
        </Label>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Dark Mode</span>
          <div
            className={`toggle-switch ${isDarkMode ? 'dark-mode' : ''}`}
            onClick={handleToggle}
          >
            <div className="clouds">
              <div className="cloud"></div>
              <div className="cloud"></div>
              <div className="cloud"></div>
            </div>
            <div className="stars">
              {stars.map((star, index) => (
                <div
                  key={index}
                  className="star"
                  style={{
                    left: star.left,
                    top: star.top,
                    animationDelay: star.animationDelay,
                  }}
                />
              ))}
            </div>
            <div className="toggle-button"></div>
            <div className="sun"></div>
            <div className="moon"></div>
          </div>
        </div>
      </div>
    </SettingsSection>
  );
}
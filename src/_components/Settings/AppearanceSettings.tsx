import React, { useState, useEffect } from "react";
import { Label } from "~/components/ui/label";
import SettingsSection from "~/_components/Settings/SettingsSection";
import "~/styles/darkModeToggle.css"; // Make sure this import is present

const generateStars = (count: number) => {
  return Array.from({ length: count }, () => ({
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 1}s`,
  }));
};

export default function AppearanceSettings() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [stars, setStars] = useState(generateStars(20));

  useEffect(() => {
    const isDark = document.body.classList.contains('dark-mode');
    setIsDarkMode(isDark);
  }, []);

  const toggleDarkMode = () => {
    document.body.classList.toggle('dark-mode');
    setIsDarkMode(!isDarkMode);
    setStars(generateStars(20)); // Regenerate stars on toggle
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
            <div className="clouds"></div>
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
import React from "react";
import { Label } from "~/components/ui/label";
import SettingsSection from "~/app/_components/Settings/SettingsSection";
import DarkModeToggle from "~/components/ui/dark-mode-toggle";

export default function AppearanceSettings() {

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
          <DarkModeToggle />
        </div>
      </div>
    </SettingsSection>
  );
}
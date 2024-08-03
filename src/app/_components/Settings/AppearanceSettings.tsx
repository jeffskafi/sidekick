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
          className="block text-sm font-medium text-text-light"
        >
          Theme
        </Label>
        <div className="flex items-center justify-between">
          <span className="text-sm text-text-light">Dark Mode</span>
          <DarkModeToggle />
        </div>
      </div>
    </SettingsSection>
  );
}
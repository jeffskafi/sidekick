import React from "react";
import { Label } from "~/components/ui/label";
import SettingsSection from "~/_components/Settings/SettingsSection";

export default function AppearanceSettings() {
  return (
    <SettingsSection title="Appearance">
      <div className="space-y-4">
        <Label
          htmlFor="theme"
          className="block text-sm font-medium text-gray-700"
        >
          Theme
        </Label>
        <select
          id="theme"
          className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="system">System</option>
        </select>
      </div>
    </SettingsSection>
  );
}

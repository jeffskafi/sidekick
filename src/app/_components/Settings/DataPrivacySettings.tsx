import React from 'react';
import { Button } from "~/components/ui/button";
import SettingsSection from './SettingsSection';

export default function DataPrivacySettings() {
  return (
    <SettingsSection title="Data & Privacy">
      <div className="space-y-4">
        <Button variant="outline" className="w-full">Export My Data</Button>
        <Button variant="outline" className="w-full text-red-600 hover:bg-red-50">Delete My Account</Button>
      </div>
    </SettingsSection>
  );
}
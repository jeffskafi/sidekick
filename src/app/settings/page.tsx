import React from 'react';
import { Button } from "~/components/ui/button";
import AppearanceSettings from '~/_components/Settings/AppearanceSettings';
import SubscriptionSettings from '~/_components/Settings/SubscriptionSettings';
import NotificationSettings from '~/_components/Settings/NotificationSettings';
import DataPrivacySettings from '~/_components/Settings/DataPrivacySettings';

export default function SettingsPage() {
  return (
    <div className="container mx-auto mt-8 max-w-3xl px-4">
      <h1 className="text-4xl font-bold mb-8 text-center">Settings</h1>
      
      <div className="space-y-8 bg-white shadow-lg rounded-lg p-6 md:p-8">
        <AppearanceSettings />
        <SubscriptionSettings />
        <NotificationSettings />
        <DataPrivacySettings />

        <Button className="w-full mt-8">Save Settings</Button>
      </div>
    </div>
  );
}
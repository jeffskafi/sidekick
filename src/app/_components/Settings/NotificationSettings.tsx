import React from 'react';
import SettingsSection from './SettingsSection';
import NotificationToggle from '~/components/ui/NotificationsToggle';

export default function NotificationSettings() {
  return (
    <SettingsSection title="Notifications">
      <div className="space-y-4">
        <NotificationToggle label="Email Notifications" />
        <NotificationToggle label="Push Notifications" />
      </div>
    </SettingsSection>
  );
}
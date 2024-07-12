import React from 'react';
import SettingsSection from './SettingsSection';
import CheckboxItem from './CheckboxItem';

export default function NotificationSettings() {
  return (
    <SettingsSection title="Notifications">
      <div className="space-y-2">
        <CheckboxItem id="emailNotifications" label="Email Notifications" />
        <CheckboxItem id="pushNotifications" label="Push Notifications" />
      </div>
    </SettingsSection>
  );
}
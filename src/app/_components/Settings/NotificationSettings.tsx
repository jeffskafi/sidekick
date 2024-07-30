import React from 'react';
import SettingsSection from './SettingsSection';
import EmailNotificationsToggle from '~/components/ui/EmailNotificationsToggle';
import CheckboxItem from './CheckboxItem';

export default function NotificationSettings() {
  return (
    <SettingsSection title="Notifications">
      <div className="space-y-4">
        <EmailNotificationsToggle />
        <CheckboxItem id="pushNotifications" label="Push Notifications" />
      </div>
    </SettingsSection>
  );
}
import React from 'react';

interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
}

export default function SettingsSection({ title, children }: SettingsSectionProps) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200 dark:border-gray-700 text-text-light dark:text-text-dark">{title}</h2>
      {children}
    </div>
  );
}
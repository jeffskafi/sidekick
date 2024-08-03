import React, { useState } from 'react';
import { Button } from '~/components/ui/button';
import SettingsSection from './SettingsSection';

export default function DataExportSettings() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await fetch('/api/export-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'user_data_export.json';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        throw new Error('Export failed');
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      // Handle error (e.g., show an error message to the user)
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <SettingsSection title="Data Export">
      <div className="space-y-4">
        <p className="text-sm text-text-light-light dark:text-text-light-dark">
          Export all your data in JSON format. This includes your profile information, settings, and any other data associated with your account.
        </p>
        <Button
          onClick={handleExport}
          disabled={isExporting}
          className="w-full"
        >
          {isExporting ? 'Exporting...' : 'Export My Data'}
        </Button>
      </div>
    </SettingsSection>
  );
}
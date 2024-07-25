"use client";

import React from 'react';
import { Button } from "~/components/ui/button";
import AppearanceSettings from '~/_components/Settings/AppearanceSettings';
import SubscriptionSettings from '~/_components/Settings/SubscriptionSettings';
import NotificationSettings from '~/_components/Settings/NotificationSettings';
import DataPrivacySettings from '~/_components/Settings/DataPrivacySettings';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useTheme } from '~/_components/ThemeProvider';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  const toggleDarkMode = (darkMode: boolean) => {
    setTheme(darkMode ? 'dark' : 'light');
  };

  return (
    <Elements stripe={stripePromise}>
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-background-dark' : 'bg-background-light'}`}>
        <div className="container mx-auto mt-8 max-w-3xl px-4">
          <h1 className={`text-4xl font-bold mb-8 text-center ${theme === 'dark' ? 'text-text-dark' : 'text-text-light'}`}>Sidekick Settings</h1>
          
          <div className={`space-y-8 ${theme === 'dark' ? 'bg-surface-dark' : 'bg-surface-light'} shadow-lg rounded-lg p-6 md:p-8`}>
            <AppearanceSettings isDarkMode={theme === 'dark'} toggleDarkMode={toggleDarkMode} />
            <SubscriptionSettings />
            <NotificationSettings />
            <DataPrivacySettings />

            <Button className="w-full mt-8 bg-primary hover:bg-primary-dark text-white">Save Settings</Button>
          </div>
        </div>
      </div>
    </Elements>
  );
}
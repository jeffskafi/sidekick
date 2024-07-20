"use client";

import React, { useEffect, useState } from 'react';
import { Button } from "~/components/ui/button";
import AppearanceSettings from '~/_components/Settings/AppearanceSettings';
import SubscriptionSettings from '~/_components/Settings/SubscriptionSettings';
import NotificationSettings from '~/_components/Settings/NotificationSettings';
import DataPrivacySettings from '~/_components/Settings/DataPrivacySettings';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function SettingsPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check for saved theme preference
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(savedDarkMode);
    document.body.classList.toggle('dark-mode', savedDarkMode);
  }, []);

  const toggleDarkMode = (darkMode: boolean) => {
    setIsDarkMode(darkMode);
    document.body.classList.toggle('dark-mode', darkMode);
    localStorage.setItem('darkMode', darkMode.toString());
  };

  return (
    <Elements stripe={stripePromise}>
      <div className={`min-h-screen ${isDarkMode ? 'dark' : ''} bg-gray-100 dark:bg-gray-900`}>
        <div className="container mx-auto mt-8 max-w-3xl px-4">
          <h1 className="text-4xl font-bold mb-8 text-center dark:text-white">Sidekick Settings</h1>
          
          <div className="space-y-8 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 md:p-8">
            <AppearanceSettings isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
            <SubscriptionSettings />
            <NotificationSettings />
            <DataPrivacySettings />

            <Button className="w-full mt-8 bg-blue-600 hover:bg-blue-700 text-white">Save Settings</Button>
          </div>
        </div>
      </div>
    </Elements>
  );
}
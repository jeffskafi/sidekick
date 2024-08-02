"use client";

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Button } from "~/components/ui/button";
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const AppearanceSettings = dynamic(() => import('~/app/_components/Settings/AppearanceSettings'), { ssr: true });
const SubscriptionSettings = dynamic(() => import('~/app/_components/Settings/SubscriptionSettings'), { ssr: true });
const NotificationSettings = dynamic(() => import('~/app/_components/Settings/NotificationSettings'), { ssr: true });
const DataPrivacySettings = dynamic(() => import('~/app/_components/Settings/DataPrivacySettings'), { ssr: true });

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function SettingsPage() {
  return (
    <Elements stripe={stripePromise}>
      <div className={`min-h-screen py-8 sm:py-12 bg-transparent`}>
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          
          <div className={`space-y-8 bg-transparent shadow-lg rounded-lg p-6 md:p-8`}>
            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <Suspense fallback={<div>Loading appearance settings...</div>}>
                  <AppearanceSettings />
                </Suspense>
                <div className="mt-8">
                  <Suspense fallback={<div>Loading notification settings...</div>}>
                    <NotificationSettings />
                  </Suspense>
                </div>
              </div>
              <div>
                <Suspense fallback={<div>Loading subscription settings...</div>}>
                  <SubscriptionSettings />
                </Suspense>
                <div className="mt-8">
                  <Suspense fallback={<div>Loading data privacy settings...</div>}>
                    <DataPrivacySettings />
                  </Suspense>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
              <Button className="w-full bg-primary hover:bg-primary-dark text-white text-lg py-3">Save Settings</Button>
            </div>
          </div>
        </div>
      </div>
    </Elements>
  );
}
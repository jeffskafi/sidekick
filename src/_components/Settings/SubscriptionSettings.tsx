"use client";

import React, { useState } from 'react';
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import SettingsSection from './SettingsSection';
import { useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

interface CheckoutSession {
  id: string;
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function SubscriptionSettings() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [billingCycle, setBillingCycle] = useState<string>('monthly');

  const handleUpgrade = async () => {
    setError(null);
    setLoading(true);
    const stripe = await stripePromise;
    if (!stripe) {
      setError('Stripe failed to load');
      setLoading(false);
      return;
    }

    if (!process.env.NEXT_PUBLIC_STRIPE_PRICE_ID) {
      setError('Stripe Price ID is not set');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID }),
      });

      if (!response.ok) {
        const errorData = await response.json() as { error?: string };
        throw new Error(errorData.error ?? `HTTP error! status: ${response.status}`);
      }

      const session = await response.json() as CheckoutSession;

      if (!session.id) {
        throw new Error('Session ID is missing from the response');
      }

      const result = await stripe.redirectToCheckout({
        sessionId: session.id,
      });

      if (result.error) {
        throw result.error;
      }
    } catch (error) {
      console.error('Error in handleUpgrade:', error);
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SettingsSection title="Subscription & Billing">
      <div className="space-y-6 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
        <div className="space-y-4">
          <div>
            <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Current Plan</Label>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Free Tier</p>
          </div>
          <div>
            <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Billing Cycle</Label>
            <div className="flex space-x-2 mt-1">
              <button
                className={`px-4 py-2 rounded-md text-sm font-medium ${billingCycle === 'monthly' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                onClick={() => setBillingCycle('monthly')}
              >
                Monthly
              </button>
              <button
                className={`px-4 py-2 rounded-md text-sm font-medium ${billingCycle === 'annually' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                onClick={() => setBillingCycle('annually')}
              >
                Annually (Save 20%)
              </button>
            </div>
          </div>
          <div>
            <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Payment Method</Label>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Visa ending in 1234</p>
            <Button variant="outline" className="mt-2 w-full">Update Payment Method</Button>
          </div>
        </div>
        <button 
          className="upgrade-to-pro-button" 
          onClick={handleUpgrade} 
          disabled={loading}
        >
          <span>{loading ? 'Processing...' : 'Upgrade to Pro'}</span>
        </button>
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </div>
    </SettingsSection>
  );
}
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

  const handleUpgrade = async () => {
    setError(null);
    const stripe = await stripePromise;
    if (!stripe) {
      setError('Stripe failed to load');
      return;
    }

    if (!process.env.NEXT_PUBLIC_STRIPE_PRICE_ID) {
      setError('Stripe Price ID is not set');
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
    }
  };

  return (
    <SettingsSection title="Subscription & Billing">
      <div className="space-y-4">
        <div>
          <Label className="block text-sm font-medium text-gray-700">Current Plan</Label>
          <p className="mt-1 text-sm text-gray-500">Free Tier</p>
        </div>
        <div>
          <Label htmlFor="billingCycle" className="block text-sm font-medium text-gray-700">Billing Cycle</Label>
          <select id="billingCycle" className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
            <option value="monthly">Monthly</option>
            <option value="annually">Annually (Save 20%)</option>
          </select>
        </div>
        <div>
          <Label className="block text-sm font-medium text-gray-700">Payment Method</Label>
          <p className="mt-1 text-sm text-gray-500">Visa ending in 1234</p>
          <Button variant="outline" className="mt-2 w-full">Update Payment Method</Button>
        </div>
        <Button className="w-full" onClick={handleUpgrade}>Upgrade to Pro</Button>
        {error && <p className="text-red-500">{error}</p>}
      </div>
    </SettingsSection>
  );
}
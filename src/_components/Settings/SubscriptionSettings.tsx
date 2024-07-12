"use client";

import React from 'react';
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import SettingsSection from './SettingsSection';
import { useStripe } from '@stripe/react-stripe-js';

interface CheckoutSession {
  id: string;
}

export default function SubscriptionSettings() {
  const stripe = useStripe();

  const handleUpgrade = async () => {
    if (!stripe) return;

    // Call your backend to create a Checkout Session
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ priceId: 'your_price_id_here' }),
    });

    const session = await response.json() as CheckoutSession;

    // Redirect to Checkout
    const result = await stripe.redirectToCheckout({
      sessionId: session.id,
    });

    if (result.error) {
      // Handle any errors from Stripe
      console.error(result.error);
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
      </div>
    </SettingsSection>
  );
}
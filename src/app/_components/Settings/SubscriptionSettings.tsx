"use client";

import React, { useState, useEffect } from "react";
import { Label } from "~/components/ui/label";
import SettingsSection from "./SettingsSection";
import { loadStripe } from "@stripe/stripe-js";
import { useUser } from "@clerk/nextjs";

interface CheckoutSession {
  id: string;
}

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
);

export default function SubscriptionSettings() {
  const { user, isLoaded } = useUser();
  const [error, setError] = useState<string | null>(null);
  const [, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isLoaded && user) {
      document.documentElement.classList.toggle('dark', user.unsafeMetadata.darkMode as boolean || false);
    }
  }, [isLoaded, user]);

  const handleUpgrade = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId: "price_pro",
        }),
      });
      const session: CheckoutSession = await response.json() as CheckoutSession;
      const stripe = await stripePromise;
      const { error } = await stripe!.redirectToCheckout({
        sessionId: session.id,
      });
      if (error) {
        setError(error.message ?? "An unknown error occurred");
      }
    } catch (err) {
      setError("Failed to initiate checkout. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const tiers = [
    { name: 'Free', requests: '10 fast requests/month', color: 'gray', tier: 'free', price: '$0/month' },
    { name: 'Pro', requests: '500 fast requests/month', color: 'amber', tier: 'pro', price: '$7.99/month' },
  ];

  const features = [
    'Fast requests',
    'Slow requests',
    'API access',
    'Custom integrations',
    'Priority support',
  ];

  return (
    <SettingsSection title="Subscription & Billing">
      <div className="space-y-6 rounded-lg bg-white p-6">
        <div className="space-y-6">
          <div className="flex justify-between">
            <div className="w-1/2">
              <Label className="block text-sm font-medium text-text-light">
                Current Plan
              </Label>
              <p className="mt-1 text-sm text-text-light-light">
                {/* Replace this with the actual current plan */}
                Free Tier
              </p>
            </div>
            <div className="w-1/2">
              <Label className="block text-sm font-medium text-text-light">
                Usage
              </Label>
              <p className="mt-1 text-sm text-text-light-light">
                {/* Replace these with actual usage data */}
                Fast requests: 5/10 this month
                <br />
                Slow requests: 50/100 this month
              </p>
            </div>
          </div>
          <div>
            <Label className="block text-lg font-semibold mb-4 text-text-light">
              Subscription Tiers
            </Label>
            <div className="grid grid-cols-3 gap-x-4 text-sm">
              <div className="font-medium text-gray-900 p-2">Feature</div>
              {tiers.map((tier) => (
                <div key={tier.name} className="font-medium text-gray-900 p-2">{tier.name}</div>
              ))}
              
              {['Price', 'Requests', ...features].map((feature, index) => (
                <React.Fragment key={feature}>
                  <div className={`text-gray-600 p-2 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>{feature}</div>
                  {tiers.map((tier) => (
                    <div key={tier.name} className={`text-center p-2 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                      {feature === 'Price' && tier.price}
                      {feature === 'Requests' && tier.requests}
                      {feature !== 'Price' && feature !== 'Requests' && (tier.tier === 'free' ? '❌' : '✅')}
                    </div>
                  ))}
                </React.Fragment>
              ))}
            </div>
            <div className="mt-6 grid grid-cols-3 gap-x-4">
              <div></div> {/* Empty column for alignment */}
              {tiers.map((tier) => (
                <button
                  key={tier.name}
                  className={`w-full rounded-md px-4 py-3 text-sm font-medium transition-all duration-200 ease-in-out
                    ${tier.color === 'gray'
                      ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                      : `bg-amber-500 text-white hover:bg-amber-600 hover:-translate-y-0.5`
                    } 
                    shadow-md hover:shadow-lg ${tier.tier === 'pro' ? 'transform hover:-translate-y-0.5' : ''}`}
                  onClick={tier.tier === 'pro' ? handleUpgrade : undefined}
                  disabled={tier.tier === 'free'}
                >
                  {tier.tier === 'free' ? 'Current Plan' : (
                    <>
                      Upgrade to Pro
                      <span className="block text-xs mt-1 font-normal">$7.99/month</span>
                    </>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
        {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
      </div>
    </SettingsSection>
  );
}
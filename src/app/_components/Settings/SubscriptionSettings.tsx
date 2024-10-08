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

const PRO_PRODUCT_ID = process.env.STRIPE_PRO_SUBSCRIPTION_PRODUCT_ID!;
const TEAMS_PRODUCT_ID = process.env.STRIPE_TEAMS_SUBSCRIPTION_PRODUCT_ID!;

export default function SubscriptionSettings() {
  const { user, isLoaded } = useUser();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isLoaded && user) {
      document.documentElement.classList.toggle('dark', user.unsafeMetadata.darkMode as boolean || false);
    }
  }, [isLoaded, user]);

  const handleUpgrade = async (productId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: productId,
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
    { name: 'Free', requests: '10 fast requests/month\nUnlimited slow requests', color: 'gray', tier: 'free', price: '$0/month', productId: null },
    { name: 'Pro', requests: '500 fast requests/month', color: 'amber', tier: 'pro', price: '$19.99/month', productId: PRO_PRODUCT_ID },
    { name: 'Teams', requests: '1000 fast requests/month/user', color: 'blue', tier: 'team', price: '$39.99/month/user', productId: TEAMS_PRODUCT_ID },
  ];

  const features = [
    'Fast requests',
    'Slow requests',
    'API access',
    'Custom integrations',
    'Priority support',
    'Team collaboration',
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
            <div className="grid grid-cols-4 gap-x-4 text-sm">
              <div className="font-medium text-gray-900 p-2">Feature</div>
              {tiers.map((tier) => (
                <div key={tier.name} className="font-medium text-gray-900 p-2">{tier.name}</div>
              ))}
              
              {['Requests', ...features].map((feature, index) => (
                <React.Fragment key={feature}>
                  <div className={`text-gray-600 p-2 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>{feature}</div>
                  {tiers.map((tier) => (
                    <div key={tier.name} className={`text-center p-2 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                      {feature === 'Requests' && (
                        <span className="whitespace-pre-line">{tier.requests}</span>
                      )}
                      {feature === 'Slow requests' && '✅'}
                      {feature !== 'Requests' && feature !== 'Slow requests' && (
                        tier.tier === 'free' ? '❌' : 
                        tier.tier === 'pro' && feature === 'Team collaboration' ? '❌' : '✅'
                      )}
                    </div>
                  ))}
                </React.Fragment>
              ))}
            </div>
            <div className="mt-6 grid grid-cols-4 gap-x-4">
              <div></div> {/* Empty column for alignment */}
              {tiers.map((tier) => (
                <button
                  key={tier.name}
                  className={`w-full rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 ease-in-out
                    ${tier.color === 'gray'
                      ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                      : tier.color === 'amber'
                      ? 'bg-amber-500 text-white hover:bg-amber-600'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                    } 
                    shadow-md hover:shadow-lg ${tier.tier !== 'free' ? 'hover:-translate-y-0.5' : ''}`}
                  onClick={() => tier.productId && handleUpgrade(tier.productId)}
                  disabled={tier.tier === 'free' || loading}
                >
                  {tier.tier === 'free' ? (
                    <span>Current Plan</span>
                  ) : (
                    <span className="flex flex-col items-center">
                      <span className="text-sm">{tier.name}</span>
                      <span className="text-xs opacity-80">{tier.price}</span>
                    </span>
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
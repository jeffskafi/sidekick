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

  const handleUpgrade = async (tier: 'pro' | 'ultimate' | 'enterprise') => {
    setLoading(true);
    setError(null);
    try {
      if (tier === 'enterprise') {
        // Redirect to a contact form or open a modal for enterprise inquiries
        console.log('Redirecting to enterprise contact form');
        return;
      }

      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId: tier === 'pro' ? "price_pro" : "price_ultimate",
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

  return (
    <SettingsSection title="Subscription & Billing">
      <div className="space-y-6 rounded-lg bg-white p-6">
        <div className="space-y-4">
          <div>
            <Label className="block text-sm font-medium text-text-light">
              Current Plan
            </Label>
            <p className="mt-1 text-sm text-text-light-light">
              {/* Replace this with the actual current plan */}
              Free Tier
            </p>
          </div>
          <div>
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
          <div>
            <Label className="block text-sm font-medium mb-2 text-text-light">
              Subscription Tiers
            </Label>
            <div className="space-y-2">
              <button
                className={`w-full rounded-md px-4 py-2 text-sm font-medium transition-colors bg-amber-100 text-amber-800 hover:bg-amber-200 shadow-sm`}
                onClick={() => handleUpgrade('pro')}
              >
                Upgrade to Pro - 500 fast requests/month
              </button>
              <button
                className={`w-full rounded-md px-4 py-2 text-sm font-medium transition-colors bg-amber-500 text-white hover:bg-amber-400 shadow-inner`}
                onClick={() => handleUpgrade('ultimate')}
              >
                Upgrade to Ultimate - Unlimited fast requests
              </button>
              <button
                className={`w-full rounded-md px-4 py-2 text-sm font-medium transition-colors bg-gray-100 text-gray-800 hover:bg-gray-200 shadow-sm`}
                onClick={() => handleUpgrade('enterprise')}
              >
                Contact Sales - Enterprise Plan (SOC-2 & HIPAA compliant)
              </button>
              <a
                href="/pricing"
                className={`block w-full rounded-md px-4 py-2 text-sm font-medium transition-colors bg-white text-amber-600 hover:bg-amber-50 shadow-sm border border-amber-300 text-center`}
              >
                More Details
              </a>
            </div>
          </div>
        </div>
        {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
      </div>
    </SettingsSection>
  );
}
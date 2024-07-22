"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import SettingsSection from "./SettingsSection";
import { useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import styles from "./SubscriptionSettings.module.css";

interface CheckoutSession {
  id: string;
}

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
);

export default function SubscriptionSettings() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [billingCycle, setBillingCycle] = useState<string>("monthly");

  const glitterParticles = useMemo(() => {
    return Array.from({ length: 200 }, (_, i) => ({
      id: i,
      style: {
        '--x': `${Math.random() * 100}%`,
        '--y': `${Math.random() * 100}%`,
        '--size': `${Math.random() * 3 + 1}px`,
        '--duration': `${Math.random() * 20 + 10}s`,
        '--delay': `${Math.random() * -20}s`,
        '--tx': `${(Math.random() - 0.5) * 20}px`,
        '--ty': `${(Math.random() - 0.5) * 20}px`,
      } as React.CSSProperties,
    }));
  }, []);

  const handleUpgrade = async () => {
    setError(null);
    setLoading(true);
    const stripe = await stripePromise;
    if (!stripe) {
      setError("Stripe failed to load");
      setLoading(false);
      return;
    }

    if (!process.env.NEXT_PUBLIC_STRIPE_PRICE_ID) {
      setError("Stripe Price ID is not set");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID,
        }),
      });

      if (!response.ok) {
        const errorData = (await response.json()) as { error?: string };
        throw new Error(
          errorData.error ?? `HTTP error! status: ${response.status}`,
        );
      }

      const session = (await response.json()) as CheckoutSession;

      if (!session.id) {
        throw new Error("Session ID is missing from the response");
      }

      const result = await stripe.redirectToCheckout({
        sessionId: session.id,
      });

      if (result.error) {
        throw result.error;
      }
    } catch (error) {
      console.error("Error in handleUpgrade:", error);
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SettingsSection title="Subscription & Billing">
      <div className="space-y-6 rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
        <div className="space-y-4">
          <div>
            <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Current Plan
            </Label>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Free Tier
            </p>
          </div>
          <div>
            <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Billing Cycle
            </Label>
            <div className="mt-1 flex space-x-2">
              <button
                className={`rounded-md px-4 py-2 text-sm font-medium ${billingCycle === "monthly" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"}`}
                onClick={() => setBillingCycle("monthly")}
              >
                Monthly
              </button>
              <button
                className={`rounded-md px-4 py-2 text-sm font-medium ${billingCycle === "annually" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"}`}
                onClick={() => setBillingCycle("annually")}
              >
                Annually (Save 20%)
              </button>
            </div>
          </div>
          <div>
            <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Payment Method
            </Label>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Visa ending in 1234
            </p>
            <Button variant="outline" className="mt-2 w-full">
              Update Payment Method
            </Button>
          </div>
        </div>
        <button
          className={`${styles.upgradeButton} relative w-full overflow-hidden rounded-md bg-amber-500 px-4 py-2 font-semibold text-white transition-colors duration-200 ease-in-out hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-opacity-50 disabled:cursor-not-allowed disabled:opacity-50`}
          onClick={handleUpgrade}
          disabled={loading}
        >
          <span className="relative z-10 text-shadow">
            {loading ? "Processing..." : "Upgrade to Pro"}
          </span>
          <div className={styles.glitterContainer} aria-hidden="true">
            {glitterParticles.map((particle) => (
              <div
                key={particle.id}
                className={styles.glitterParticle}
                style={particle.style}
              />
            ))}
          </div>
        </button>
        {error && <p className="mt-4 text-red-500">{error}</p>}
      </div>
    </SettingsSection>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import SettingsSection from "./SettingsSection";
import { loadStripe } from "@stripe/stripe-js";
import styles from "./SubscriptionSettings.module.css";
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
  const [loading, setLoading] = useState<boolean>(false);
  const [billingCycle, setBillingCycle] = useState<string>("monthly");

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
          priceId: billingCycle === "monthly" ? "price_monthly" : "price_yearly",
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

  const glitterParticles = Array.from({ length: 20 }).map((_, index) => ({
    id: index,
    style: {
      "--x": `${Math.random() * 100}%`,
      "--y": `${Math.random() * 100}%`,
      "--size": `${Math.random() * 3 + 1}px`,
      "--duration": `${Math.random() * 2 + 1}s`,
      "--delay": `${Math.random()}s`,
      "--tx": `${(Math.random() - 0.5) * 20}px`,
      "--ty": `${(Math.random() - 0.5) * 20}px`,
    },
  }));

  return (
    <SettingsSection title="Subscription & Billing">
      <div className="space-y-6 rounded-lg bg-surface-light p-6">
        <div className="space-y-4">
          <div>
            <Label className="block text-sm font-medium text-text-light">
              Current Plan
            </Label>
            <p className="mt-1 text-sm text-text-light-light">
              Free Tier
            </p>
          </div>
          <div>
            <Label className="block text-sm font-medium mb-2 text-text-light">
              Billing Cycle
            </Label>
            <div className="flex space-x-2">
              <button
                className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  billingCycle === "monthly" 
                    ? "bg-primary text-white" 
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
                onClick={() => setBillingCycle("monthly")}
              >
                Monthly
              </button>
              <button
                className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  billingCycle === "annually" 
                    ? "bg-primary text-white" 
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
                onClick={() => setBillingCycle("annually")}
              >
                Annually (Save 20%)
              </button>
            </div>
          </div>
          <div>
            <Label className="block text-sm font-medium text-text-light">
              Payment Method
            </Label>
            <p className="mt-1 text-sm text-text-light-light">
              Visa ending in 1234
            </p>
            <Button variant="outline" className="mt-2 w-full border-gray-300 text-gray-700 hover:bg-gray-100">
              Update Payment Method
            </Button>
          </div>
        </div>
        <button
          className={`${styles.upgradeButton} relative w-full overflow-hidden rounded-md bg-primary px-4 py-3 text-lg font-semibold text-white transition-colors duration-200 ease-in-out hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 disabled:cursor-not-allowed disabled:opacity-50`}
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
                style={particle.style as React.CSSProperties}
              />
            ))}
          </div>
        </button>
        {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
      </div>
    </SettingsSection>
  );
}
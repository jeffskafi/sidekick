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

  return (
    <SettingsSection title="Subscription & Billing">
      <div className="space-y-6 rounded-lg bg-white p-6">
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
                    ? "bg-amber-500 text-white hover:bg-amber-400 shadow-inner" 
                    : "bg-amber-100 text-amber-800 hover:bg-amber-200 shadow-sm"
                }`}
                onClick={() => setBillingCycle("monthly")}
              >
                Monthly
              </button>
              <button
                className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  billingCycle === "annually" 
                    ? "bg-amber-500 text-white hover:bg-amber-400 shadow-inner" 
                    : "bg-amber-100 text-amber-800 hover:bg-amber-200 shadow-sm"
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
            <Button variant="outline" className="mt-2 w-full border-amber-500 text-amber-700 hover:bg-amber-50 shadow-sm">
              Update Payment Method
            </Button>
          </div>
        </div>
        <button
          className={`${styles.upgradeButton} relative w-full overflow-hidden rounded-md px-4 py-3 text-lg font-semibold text-white bg-amber-500 transition-colors duration-200 ease-in-out hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-opacity-50 disabled:cursor-not-allowed disabled:opacity-50 shadow-md hover:shadow-lg`}
          onClick={handleUpgrade}
          disabled={loading}
        >
          <span className="relative z-10">
            {loading ? "Processing..." : "Upgrade to Pro"}
          </span>
        </button>
        {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
      </div>
    </SettingsSection>
  );
}
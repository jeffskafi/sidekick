import React from 'react';
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import SettingsSection from './SettingsSection';

export default function SubscriptionSettings() {
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
        <Button className="w-full">Upgrade to Pro</Button>
      </div>
    </SettingsSection>
  );
}
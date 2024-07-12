import React from 'react';
import Link from 'next/link';
import { Button } from "~/components/ui/button";

export default function CanceledPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Payment Canceled</h1>
        <p className="text-xl mb-8">Your payment process was canceled. No charges were made.</p>
        <Link href="/settings">
          <Button>
            Return to Settings
          </Button>
        </Link>
      </div>
    </div>
  );
}
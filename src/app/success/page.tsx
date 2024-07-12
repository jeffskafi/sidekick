import React from "react";
import Link from "next/link";
import { Button } from "~/components/ui/button";

export default function SuccessPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">Payment Successful!</h1>
        <p className="mb-8 text-xl">
          Thank you for your purchase. Your subscription has been activated.
        </p>
        <Link href="/settings">
          <Button>Return to Settings</Button>
        </Link>
      </div>
    </div>
  );
}

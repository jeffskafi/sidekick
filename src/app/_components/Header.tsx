"use client";

import React from "react";
import Link from "next/link";
import { useAuth, UserButton, SignInButton } from "@clerk/nextjs";
import { Palette, CreditCard } from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";

const AppearancePage = dynamic(
  () => import("~/app/_components/Settings/AppearanceSettings"),
  { ssr: true },
);
const SubscriptionPage = dynamic(
  () => import("~/app/_components/Settings/SubscriptionSettings"),
  { ssr: true },
);

const Header = () => {
  const { isSignedIn } = useAuth();

  return (
    <header className="mb-0 border-b pb-0">
      <nav className="container mx-auto flex items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center text-xl font-semibold">
          <Image
            src="/images/logo_main.svg"
            alt="Sidekick Logo"
            width={160}
            height={72}
            priority
          />
        </Link>
        <div className="flex items-center space-x-6">
          {isSignedIn ? (
            <UserButton afterSignOutUrl="/">
              <UserButton.UserProfilePage
                label="Appearance"
                url="appearance"
                labelIcon={<Palette size={16} />}
              >
                <AppearancePage />
              </UserButton.UserProfilePage>
              <UserButton.UserProfilePage
                label="Subscription"
                url="subscription"
                labelIcon={<CreditCard size={16} />}
              >
                <SubscriptionPage />
              </UserButton.UserProfilePage>
            </UserButton>
          ) : (
            <SignInButton mode="modal">
              <button className="text-foreground hover:text-foreground/80 transition-colors">
                Sign In
              </button>
            </SignInButton>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
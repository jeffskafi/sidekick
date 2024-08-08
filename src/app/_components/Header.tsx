"use client";

import React from "react";
import Link from "next/link";
import { useAuth, UserButton, SignInButton } from "@clerk/nextjs";
import { Palette, CreditCard } from "lucide-react";
import dynamic from "next/dynamic";
import { useDarkMode } from "~/app/_contexts/DarkModeContext";

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
  const { isDarkMode } = useDarkMode();

  return (
    <header className="mb-0 border-b">
      <nav className="container mx-auto flex items-center justify-between px-4 py-2" style={{ width: '100%' }}>
        <Link href="/" className="flex items-center">
          <h1 className={`text-[2rem] font-bold ${isDarkMode ? 'text-white' : 'text-black'}`} style={{
            background: 'linear-gradient(90deg, #ff7247 0%, #e63b00 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0px 2px 2px rgba(0, 0, 0, 0.3))',
          }}>
            Planika
          </h1>
        </Link>
        <div className="flex items-center space-x-4">
          {isSignedIn ? (
            <UserButton 
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10"
                }
              }}
            >
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
              <button className="px-4 py-2 text-sm font-medium text-white bg-primary-light dark:bg-primary-dark rounded-full hover:bg-secondary-light dark:hover:bg-secondary-dark transition-colors duration-300">
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
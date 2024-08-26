"use client";

import React from "react";
import Link from "next/link";
import { useAuth, UserButton, SignInButton } from "@clerk/nextjs";
import { Palette, CreditCard, ExternalLink } from "lucide-react";
import dynamic from "next/dynamic";
import { useDarkMode } from "~/app/_contexts/DarkModeContext";
import { useFeatureFlagEnabled } from "posthog-js/react";

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
  const flagEnabled = useFeatureFlagEnabled("subscriptions");

  return (
    <header className="sticky top-0 z-50 mb-0 h-16 bg-white dark:bg-dark-bg">
      <nav
        className="container mx-auto flex items-center justify-between px-4 py-2"
        style={{ width: "100%" }}
      >
        <Link href="/" className="flex items-center">
          <h1
            className={`text-[2rem] font-bold ${isDarkMode ? "text-white" : "text-black"}`}
            style={{
              background: "linear-gradient(90deg, #ff7247 0%, #e63b00 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              filter: "drop-shadow(0px 2px 2px rgba(0, 0, 0, 0.3))",
            }}
          >
            Sidekick
          </h1>
        </Link>
        <Link href="/tasks" className="rounded-full bg-blue-500 px-3 py-2 text-sm font-medium text-white transition-colors duration-300 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700">
          Tasks
        </Link>
        <Link href="/mind-map" className="rounded-full bg-blue-500 px-3 py-2 text-sm font-medium text-white transition-colors duration-300 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700">
          Mind Map
        </Link>
        <div className="flex items-center space-x-4">
          {isSignedIn ? (
            <>
              <a
                href="https://chatgpt.com/g/g-DMgdGagJK-sidekick"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 rounded-full bg-amber-500 px-3 py-2 text-sm font-medium text-white transition-colors duration-300 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700"
              >
                <span>Try on ChatGPT</span>
                <ExternalLink size={14} />
              </a>
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "w-10 h-10",
                  },
                }}
              >
                <UserButton.UserProfilePage
                  label="Appearance"
                  url="appearance"
                  labelIcon={<Palette size={16} />}
                >
                  <AppearancePage />
                </UserButton.UserProfilePage>
                {flagEnabled && (
                  <UserButton.UserProfilePage
                    label="Subscription"
                    url="subscription"
                    labelIcon={<CreditCard size={16} />}
                  >
                    <SubscriptionPage />
                  </UserButton.UserProfilePage>
                )}
              </UserButton>
            </>
          ) : (
            <SignInButton mode="modal">
              <button className="rounded-full bg-primary-light px-4 py-2 text-sm font-medium text-white transition-colors duration-300 hover:bg-secondary-light dark:bg-primary-dark dark:hover:bg-secondary-dark">
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
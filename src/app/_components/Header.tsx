"use client";

import React from "react";
import Link from "next/link";
import { useAuth, UserButton, SignInButton } from "@clerk/nextjs";
import { Palette, CreditCard, ExternalLink, Shield } from "lucide-react";
import dynamic from "next/dynamic";
import { useDarkMode } from "~/app/_contexts/DarkModeContext";
import { useFeatureFlagEnabled } from "posthog-js/react";
import { usePathname } from "next/navigation";

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
  const subscriptionsFlagEnabled = useFeatureFlagEnabled("subscriptions");
  const integrationsFlagEnabled = useFeatureFlagEnabled("integrations");
  const pathname = usePathname();

  const navItems = [
    { href: "/tasks", label: "Tasks" },
    { href: "/mind-map", label: "Mind Maps" },
    {
      href: "/integrations",
      label: "Integrations",
      enabled: integrationsFlagEnabled,
    },
    {
      href: "https://chatgpt.com/g/g-DMgdGagJK-sidekick",
      label: "ChatGPT",
      external: true,
    },
  ];

  return (
    <header className="bg-white shadow-sm dark:bg-black">
      <nav className="container mx-auto px-4 py-2">
        <div className="flex flex-col space-y-2 sm:space-y-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Link href="/" className="flex items-center">
                <h1
                  className={`text-[2rem] font-bold ${isDarkMode ? "text-white" : "text-black"}`}
                  style={{
                    background:
                      "linear-gradient(90deg, #FF7247 0%, #E63B00 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    filter: "drop-shadow(0px 2px 2px rgba(0, 0, 0, 0.3))",
                  }}
                >
                  Sidekick
                </h1>
              </Link>
              <div className="hidden space-x-4 sm:flex">
                {isSignedIn &&
                  navItems.map(
                    (item, index) =>
                      item.enabled !== false &&
                      (item.external ? (
                        <a
                          key={index}
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-sm font-medium text-gray-600 transition-colors duration-200 hover:text-amber-500 dark:text-gray-300 dark:hover:text-amber-400"
                        >
                          {item.label}
                          <ExternalLink size={14} className="ml-1" />
                        </a>
                      ) : (
                        <Link
                          key={index}
                          href={item.href}
                          className={`text-sm font-medium transition-colors duration-200 ${
                            pathname === item.href
                              ? "border-b-2 border-primary-light text-primary-light dark:border-primary-dark dark:text-primary-dark"
                              : "text-gray-600 hover:text-primary-light dark:text-gray-300 dark:hover:text-primary-dark"
                          }`}
                        >
                          {item.label}
                        </Link>
                      )),
                  )}
              </div>
            </div>
            {isSignedIn ? (
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
                {subscriptionsFlagEnabled && (
                  <UserButton.UserProfilePage
                    label="Subscription"
                    url="subscription"
                    labelIcon={<CreditCard size={16} />}
                  >
                    <SubscriptionPage />
                  </UserButton.UserProfilePage>
                )}
                <UserButton.UserProfilePage
                  label="Privacy Policy"
                  url="privacy"
                  labelIcon={<Shield size={16} />}
                >
                  <a
                    href="/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      // Close the UserButton modal
                      document.body.click();
                    }}
                  >
                    Privacy Policy <ExternalLink size={14} className="inline-block ml-1" />
                  </a>
                </UserButton.UserProfilePage>
              </UserButton>
            ) : (
              <SignInButton mode="modal">
                <button className="rounded-full bg-primary-light px-4 py-2 text-sm font-medium text-white transition-colors duration-300 hover:bg-secondary-light dark:bg-primary-dark dark:hover:bg-secondary-dark">
                  Sign In
                </button>
              </SignInButton>
            )}
          </div>
          <div className="flex space-x-4 sm:hidden">
            {isSignedIn &&
              navItems.map(
                (item, index) =>
                  item.enabled !== false &&
                  (item.external ? (
                    <a
                      key={index}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-sm font-medium text-gray-600 transition-colors duration-200 hover:text-amber-500 dark:text-gray-300 dark:hover:text-amber-400"
                    >
                      {item.label}
                      <ExternalLink size={14} className="ml-1" />
                    </a>
                  ) : (
                    <Link
                      key={index}
                      href={item.href}
                      className={`text-sm font-medium transition-colors duration-200 ${
                        pathname === item.href
                          ? "border-b-2 border-primary-light text-primary-light dark:border-primary-dark dark:text-primary-dark"
                          : "text-gray-600 hover:text-primary-light dark:text-gray-300 dark:hover:text-primary-dark"
                      }`}
                    >
                      {item.label}
                    </Link>
                  )),
              )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;

"use client";

import React from "react";
import Link from "next/link";
import { useAuth, UserButton, SignInButton } from "@clerk/nextjs";
import AppearanceSettings from "~/app/_components/Settings/AppearanceSettings";
import NotificationSettings from "~/app/_components/Settings/NotificationSettings";
import SubscriptionSettings from "~/app/_components/Settings/SubscriptionSettings";

const AppearanceIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
    <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm0 16c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7z"/>
    <path d="M12 17.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
  </svg>
);

const NotificationsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
    <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z"/>
  </svg>
);

const SubscriptionIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
    <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
  </svg>
);

const AppearancePage = () => {
  return <AppearanceSettings />;
};

const NotificationsPage = () => {
  return <NotificationSettings />;
};

const SubscriptionPage = () => {
  return <SubscriptionSettings />;
};

const Header = () => {
  const { isSignedIn } = useAuth();

  return (
    <header className="mb-0 border-b pb-0">
      <nav className="container mx-auto flex items-center justify-between px-4 py-4">
        <Link href="/" className="text-xl font-semibold">
          Sidekick
        </Link>
        <div className="flex items-center space-x-6">
          {isSignedIn ? (
            <>
              <Link
                href="/settings"
                className="text-foreground hover:text-foreground/80 transition-colors"
              >
                Settings
              </Link>
              <UserButton afterSignOutUrl="/">
                <UserButton.UserProfilePage
                  label="Appearance"
                  url="appearance"
                  labelIcon={<AppearanceIcon />}
                >
                  <AppearancePage />
                </UserButton.UserProfilePage>
                <UserButton.UserProfilePage
                  label="Notifications"
                  url="notifications"
                  labelIcon={<NotificationsIcon />}
                >
                  <NotificationsPage />
                </UserButton.UserProfilePage>
                <UserButton.UserProfilePage
                  label="Subscription"
                  url="subscription"
                  labelIcon={<SubscriptionIcon />}
                >
                  <SubscriptionPage />
                </UserButton.UserProfilePage>
              </UserButton>
            </>
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
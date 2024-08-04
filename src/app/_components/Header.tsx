"use client";

import React from "react";
import Link from "next/link";
import { useAuth, UserButton, SignInButton } from "@clerk/nextjs";
import {
  Palette,
  // Bell,
  CreditCard,
  // FileArchive
} from "lucide-react";
import dynamic from "next/dynamic";

const AppearancePage = dynamic(
  () => import("~/app/_components/Settings/AppearanceSettings"),
  { ssr: true },
);

// const NotificationsPage = dynamic(
//   () => import("~/app/_components/Settings/NotificationSettings"),
//   { ssr: true },
// );

const SubscriptionPage = dynamic(
  () => import("~/app/_components/Settings/SubscriptionSettings"),
  { ssr: true },
);

// const DataExportPage = dynamic(
//   () => import("~/app/_components/Settings/DataExportSettings"),
//   { ssr: true },
// );

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
            <UserButton afterSignOutUrl="/">
              <UserButton.UserProfilePage
                label="Appearance"
                url="appearance"
                labelIcon={<Palette size={16} />}
              >
                <AppearancePage />
              </UserButton.UserProfilePage>
              {/* <UserButton.UserProfilePage
                label="Notifications"
                url="notifications"
                labelIcon={<Bell size={16} />}
              >
                <NotificationsPage />
              </UserButton.UserProfilePage> */}
              <UserButton.UserProfilePage
                label="Subscription"
                url="subscription"
                labelIcon={<CreditCard size={16} />}
              >
                <SubscriptionPage />
              </UserButton.UserProfilePage>
              {/* <UserButton.UserProfilePage
                label="Data Export"
                url="data-export"
                labelIcon={<FileArchive size={16} />}
              >
                <DataExportPage />
              </UserButton.UserProfilePage> */}
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

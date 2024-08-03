"use client";

import React from "react";
import Link from "next/link";
import { useAuth, UserButton, SignInButton } from "@clerk/nextjs";

const DotIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      fill="currentColor"
      width="16"
      height="16"
    >
      <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512z" />
    </svg>
  )
}

const AppSettingsPage = () => {
  return (
    <div>
      <h1>App Settings</h1>
      <p>Customize your app settings here.</p>
      {/* Add your app settings controls here */}
    </div>
  );
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
                  label="App Settings"
                  url="app-settings"
                  labelIcon={<DotIcon />}
                >
                  <AppSettingsPage />
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
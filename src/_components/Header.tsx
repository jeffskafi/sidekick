"use client";

import React from "react";
import Link from "next/link";
import { UserButton, SignInButton, useAuth } from "@clerk/nextjs";

const Header = () => {
  const { isSignedIn } = useAuth();

  return (
    <header className="border-b">
      <nav className="container mx-auto flex items-center justify-between px-4 py-4">
        <Link href="/" className="text-xl font-semibold">
          Sidekick
        </Link>
        <div className="flex items-center space-x-6">
          <Link
            href="/settings"
            className="text-foreground hover:text-foreground/80 transition-colors"
          >
            Settings
          </Link>
          {isSignedIn ? (
            <>
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8",
                  },
                }}
              />
              <SignInButton mode="modal">
                <button className="text-foreground hover:text-foreground/80 transition-colors">
                  Sign Out
                </button>
              </SignInButton>
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

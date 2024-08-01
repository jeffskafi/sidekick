"use client";

import React from "react";
import Link from "next/link";
import { UserButton, useAuth } from "@clerk/nextjs";
import AuthButtons from "../../components/ui/auth-buttons";

const Header = () => {
  const { isSignedIn } = useAuth();

  return (
    <header className="border-b pb-0 mb-0">
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
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8",
                },
              }}
            />
          ) : (
            <AuthButtons />
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
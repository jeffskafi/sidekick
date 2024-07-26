'use client'

import React from 'react';
import Link from 'next/link';
import { UserButton } from "@clerk/nextjs";
import { useTheme } from './ThemeProvider';

const Header = () => {
  return (
    <header className="border-b">
      <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
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
          <UserButton 
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: "w-8 h-8"
              }
            }}
          />
        </div>
      </nav>
    </header>
  );
};

export default Header;
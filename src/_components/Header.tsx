'use client'

import React from 'react';
import Link from 'next/link';
import { UserButton } from "@clerk/nextjs";
import { useTheme } from './ThemeProvider';

const Header = () => {
  const { theme } = useTheme();

  return (
    <header className={`${theme === 'dark' ? 'bg-background-dark border-gray-700' : 'bg-background-light border-gray-200'} border-b`}>
      <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className={`text-xl font-semibold ${theme === 'dark' ? 'text-text-dark' : 'text-text-light'}`}>
          Sidekick
        </Link>
        <div className="flex items-center space-x-6">
          <Link 
            href="/settings" 
            className={`${theme === 'dark' ? 'text-text-light-dark hover:text-text-dark' : 'text-text-light-light hover:text-text-light'} transition-colors`}
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
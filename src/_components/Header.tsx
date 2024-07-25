import React from 'react';
import Link from 'next/link';
import { UserButton } from "@clerk/nextjs";

const Header = () => {
  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-semibold text-gray-900 dark:text-white">
          Sidekick
        </Link>
        <div className="flex items-center space-x-6">
          <Link href="/settings" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
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
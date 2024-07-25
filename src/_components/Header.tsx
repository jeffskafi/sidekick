import React from 'react';
import Link from 'next/link';
import { UserButton } from "@clerk/nextjs";

const Header = () => {
  return (
    <header className="bg-white shadow-sm">
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          Sidekick
        </Link>
        <div className="flex items-center space-x-4">
          <Link href="/settings" className="text-gray-600 hover:text-gray-900">
            Settings
          </Link>
          <UserButton afterSignOutUrl="/" />
        </div>
      </nav>
    </header>
  );
};

export default Header;
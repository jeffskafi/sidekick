import "~/styles/globals.css";
import '~/styles/darkModeToggle.css';

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton
} from '@clerk/nextjs';
import Link from 'next/link';

export const metadata: Metadata = {
  title: "Sidekick",
  description: "Your AI-powered productivity assistant",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${GeistSans.variable}`}>
        <body className="min-h-screen flex flex-col">
          <header className="bg-white dark:bg-gray-800 shadow-md">
            <div className="container mx-auto px-6 py-3">
              <div className="flex justify-between items-center">
                <Link href="/" className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  Sidekick
                </Link>
                <div className="space-x-4">
                  <Link href="/dashboard" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                    Dashboard
                  </Link>
                  <Link href="/settings" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                    Settings
                  </Link>
                </div>
              </div>
            </div>
          </header>
          <main className="flex-grow">
            {children}
          </main>
        </body>
      </html>
    </ClerkProvider>
  );
}
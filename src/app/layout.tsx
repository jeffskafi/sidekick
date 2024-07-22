import "~/styles/globals.css";
import "~/styles/darkModeToggle.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import {
  ClerkProvider,
  SignInButton,
  SignOutButton,
  UserButton,
  SignedIn,
  SignedOut,
} from "@clerk/nextjs";
import Link from "next/link";

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
        <body className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
          <header className="bg-white shadow-sm dark:bg-gray-800">
            <div className="container mx-auto flex items-center justify-between px-4 py-3">
              <Link
                href="/"
                className="text-2xl font-bold text-blue-600 dark:text-blue-400"
              >
                Sidekick
              </Link>
              <nav className="flex items-center space-x-4">
                <SignedIn>
                  <Link
                    href="/settings"
                    className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
                  >
                    Settings
                  </Link>
                  <UserButton afterSignOutUrl="/" />
                  <SignOutButton>
                    <button className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">
                      Sign out
                    </button>
                  </SignOutButton>
                </SignedIn>
                <SignedOut>
                  <SignInButton mode="modal">
                    <button className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">
                      Sign in
                    </button>
                  </SignInButton>
                </SignedOut>
              </nav>
            </div>
          </header>
          <main className="flex-grow">{children}</main>
        </body>
      </html>
    </ClerkProvider>
  );
}

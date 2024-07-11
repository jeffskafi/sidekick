import "~/styles/globals.css";

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
  title: "Synergy",
  description: "Synergy",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${GeistSans.variable}`}>
        <body>
          <header className="bg-primary text-primary-foreground p-4">
            <div className="container mx-auto flex justify-between items-center">
              <Link href="/" className="text-2xl font-bold">Synergy</Link>
              <nav>
                <Link href="/settings" className="mr-4">Settings</Link>
                <SignedOut>
                  <SignInButton />
                </SignedOut>
                <SignedIn>
                  <UserButton />
                </SignedIn>
              </nav>
            </div>
          </header>
          <main className="container mx-auto mt-8">
            {children}
          </main>
        </body>
      </html>
    </ClerkProvider>
  );
}
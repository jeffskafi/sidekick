import "~/styles/globals.css";
import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import Header from "~/app/_components/Header";
import { CSPostHogProvider } from "~/app/_analytics/provider";
import { DarkModeProvider } from "~/app/_contexts/DarkModeContext";

export const metadata: Metadata = {
  title: "Sidekick",
  description: "Your AI-powered productivity assistant",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <CSPostHogProvider>
        <DarkModeProvider>
          <html lang="en" className={`${GeistSans.variable}`}>
            <body className="flex min-h-screen flex-col bg-gray-50 transition-colors duration-300 dark:bg-dark-bg">
              <Header />
              <main className="flex-grow">{children}</main>
            </body>
          </html>
        </DarkModeProvider>
      </CSPostHogProvider>
    </ClerkProvider>
  );
}
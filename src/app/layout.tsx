import "~/styles/globals.css";
import "~/styles/darkModeToggle.css";
import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import Header from "~/_components/Header";
import { ThemeProvider } from "~/_components/ThemeProvider";

export const metadata: Metadata = {
  title: "Sidekick",
  description: "Your AI-powered productivity assistant",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  viewport: 'width=device-width, initial-scale=1, viewport-fit=cover',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html lang="en" className={GeistSans.variable}>
        <ThemeProvider>
          <body className="flex min-h-screen flex-col bg-gray-50 dark:bg-dark-bg">
            <Header />
            <main className="flex-grow">{children}</main>
          </body>
        </ThemeProvider>
      </html>
    </ClerkProvider>
  );
}
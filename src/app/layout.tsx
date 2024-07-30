import "~/styles/globals.css";
import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "~/app/_components/ThemeProvider";
import Header from "~/app/_components/Header";
import { CSPostHogProvider } from "~/app/_analytics/provider";

export const metadata: Metadata = {
  title: "Sidekick",
  description: "Your AI-powered productivity assistant",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <CSPostHogProvider>
        <html
          lang="en"
          className={`${GeistSans.variable} dark`}
          data-theme="dark"
        >
          <body className="flex min-h-screen flex-col bg-gray-50 dark:bg-dark-bg">
            <ThemeProvider>
              <Header />
              <main className="flex-grow">{children}</main>
            </ThemeProvider>
          </body>
        </html>
      </CSPostHogProvider>
    </ClerkProvider>
  );
}

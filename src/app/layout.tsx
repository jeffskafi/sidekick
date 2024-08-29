import "~/styles/globals.css";
import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import dynamic from "next/dynamic";
import { CSPostHogProvider } from "~/app/_analytics/provider";
import { DarkModeProvider } from "~/app/_contexts/DarkModeContext";
import Script from "next/script";

// Dynamically import the Header component
const Header = dynamic(() => import("~/app/_components/Header"), {
  ssr: false,
});

function themeScript() {
  return `
    (function() {
      function getInitialTheme() {
        const persistedColorPreference = window.localStorage.getItem('theme');
        const hasPersistedPreference = typeof persistedColorPreference === 'string';
        if (hasPersistedPreference) {
          return persistedColorPreference;
        }
        const mql = window.matchMedia('(prefers-color-scheme: dark)');
        const hasMediaQueryPreference = typeof mql.matches === 'boolean';
        if (hasMediaQueryPreference) {
          return mql.matches ? 'dark' : 'light';
        }
        return 'light';
      }

      const theme = getInitialTheme();
      document.documentElement.classList.toggle('dark', theme === 'dark');
      window.localStorage.setItem('theme', theme);
    })();
  `;
}

export const metadata: Metadata = {
  title: "Sidekick",
  description: "Your AI-powered productivity assistant",
  icons: [{ rel: "icon", url: "/images/logo.svg" }],
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
          <html lang="en" className={`${GeistSans.variable} h-full`}>
            <head>
              <script dangerouslySetInnerHTML={{ __html: themeScript() }} />
            </head>
            <body className="flex flex-col min-h-screen bg-gray-50 transition-colors duration-300 dark:bg-dark-bg">
              <Header />
              <Script
                src="https://www.googletagmanager.com/gtag/js?id=AW-16680016187"
                strategy="afterInteractive"
              />
              <Script id="google-analytics" strategy="afterInteractive">
                {`
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', 'AW-16680016187');
                `}
              </Script>
              <main className="flex-1 overflow-hidden">{children}</main>
            </body>
          </html>
        </DarkModeProvider>
      </CSPostHogProvider>
    </ClerkProvider>
  );
}

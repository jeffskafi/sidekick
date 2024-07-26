import "~/styles/globals.css";
import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import Header from "~/_components/Header";
import { ThemeProvider } from "~/_components/ThemeProvider";

export const metadata: Metadata = {
  title: "Sidekick",
  description: "Your AI-powered productivity assistant",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${GeistSans.variable} dark`}>
        <head>
          <script dangerouslySetInnerHTML={{
            __html: `
              // IMPORTANT: set this in <HEAD> top before any other tag.
              const setTheme = (theme) => {
                theme ??= localStorage.theme || "dark";
                document.documentElement.dataset.theme = theme;
                document.documentElement.classList.remove('light', 'dark');
                document.documentElement.classList.add(theme);
                localStorage.theme = theme;
              };
              setTheme();
            `
          }} />
        </head>
        <body className="flex min-h-screen flex-col bg-gray-50 dark:bg-dark-bg">
          <ThemeProvider>
            <Header />
            <main className="flex-grow">{children}</main>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
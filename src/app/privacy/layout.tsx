import Link from "next/link";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/* Your existing layout code */}
        <main>{children}</main>
        <footer className="mt-8 bg-gray-100 py-4">
          <div className="container mx-auto px-4">
            <Link
              href="/privacy-policy"
              className="text-blue-600 hover:underline"
            >
              Privacy Policy
            </Link>
            {/* Add other footer links as needed */}
          </div>
        </footer>
      </body>
    </html>
  );
}

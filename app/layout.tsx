import "./globals.css";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: {
    default: "Stock Market Info — Market Caps & Valuations",
    template: "%s | Stock Market Info",
  },
  description:
    "Track stock market caps, valuations, and financial data for companies and sectors worldwide.",
  metadataBase: new URL("https://stock-market-info.com"),
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50 text-gray-900">
        {/* 🔹 Header */}
        <header className="bg-white shadow sticky top-0 z-50">
          <nav className="max-w-6xl mx-auto flex items-center justify-between p-4">
            <Link href="/" className="text-xl font-bold text-blue-600">
              Stock Market Info
            </Link>
            <div className="space-x-6 text-sm">
              <Link href="/sector/technology" className="hover:underline">
                Technology
              </Link>
              <Link href="/sector/financials" className="hover:underline">
                Financials
              </Link>
              <Link href="/sector/healthcare" className="hover:underline">
                Healthcare
              </Link>
              <Link href="/sector/energy" className="hover:underline">
                Energy
              </Link>
            </div>
          </nav>
        </header>

        {/* 🔹 Main page content */}
        <main>{children}</main>

        {/* 🔹 Footer */}
        <footer className="bg-white mt-12 border-t">
          <div className="max-w-6xl mx-auto p-6 text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Stock Market Info — Market cap & valuation data
          </div>
        </footer>
      </body>
    </html>
  );
}

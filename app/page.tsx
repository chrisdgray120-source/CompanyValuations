import { Metadata } from "next";
import HomeClient from "./HomeClient";

export const metadata: Metadata = {
  title: "Stock Market Info — Market Caps & Company Valuations",
  description:
    "Track market capitalization, financial ratios, and valuation metrics for global companies. Explore sectors, compare stocks, and view real-time trends.",
};

export default async function HomePage() {
  // 🔹 JSON-LD schema for homepage
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Stock Market Info",
    url: "https://stock-market-info.com",
    description:
      "Stock market data platform showing market caps, valuations, and financial metrics for companies worldwide.",
    potentialAction: {
      "@type": "SearchAction",
      target:
        "https://stock-market-info.com/company/{search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomeClient />
    </>
  );
}

import { Metadata } from "next";
import CompanyClient from "./CompanyClient";

type Props = {
  params: { ticker: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const ticker = params.ticker.toUpperCase();
  return {
    title: `${ticker} Market Cap & Financials | Stock Market Info`,
    description: `${ticker} market cap, revenue, earnings, debt, and valuation ratios with historical trends.`,
  };
}

export default async function CompanyPage({ params }: Props) {
  const ticker = params.ticker.toUpperCase();

  // 🚨 For demo, just hardcoding JSON-LD. Later we can fetch company info here.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Placeholder Company",
    tickerSymbol: ticker,
    url: `https://stock-market-info.com/company/${ticker}`,
    logo: "https://via.placeholder.com/150",
    description: `${ticker} market cap, revenue, net income, and valuation ratios.`,
    address: { "@type": "PostalAddress", addressCountry: "US" },
    sameAs: [
      `https://finance.yahoo.com/quote/${ticker}`,
      `https://www.polygon.io/stocks/${ticker}`,
    ],
  };

  return (
    <>
      {/* ✅ JSON-LD server-rendered */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Client component for interactivity */}
      <CompanyClient ticker={ticker} />
    </>
  );
}

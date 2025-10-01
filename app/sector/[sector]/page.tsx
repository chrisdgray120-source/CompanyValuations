import { Metadata } from "next";
import SectorClient from "./SectorClient";

type Props = {
  params: { sector: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const sector = params.sector.toUpperCase();

  return {
    title: `${sector} Sector Companies | Stock Market Info`,
    description: `Market cap, valuation, and financial data for companies in the ${sector} sector.`,
  };
}

export default async function SectorPage({ params }: Props) {
  const sector = params.sector.toUpperCase();

  // For now: dummy JSON-LD (replace with real list later)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${sector} Sector Companies`,
    description: `List of companies in the ${sector} sector with market cap and valuation data.`,
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        url: `https://stock-market-info.com/company/AAPL`,
        name: "Apple Inc (AAPL)",
      },
      {
        "@type": "ListItem",
        position: 2,
        url: `https://stock-market-info.com/company/MSFT`,
        name: "Microsoft Corp (MSFT)",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SectorClient sector={sector} />
    </>
  );
}

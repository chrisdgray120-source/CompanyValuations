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

export default function CompanyPage({ params }: Props) {
  return <CompanyClient ticker={params.ticker.toUpperCase()} />;
}

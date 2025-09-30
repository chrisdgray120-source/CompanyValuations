"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function formatNumber(num: number | null) {
  if (!num) return "-";
  if (num >= 1e12) return (num / 1e12).toFixed(2) + "T";
  if (num >= 1e9) return (num / 1e9).toFixed(2) + "B";
  if (num >= 1e6) return (num / 1e6).toFixed(2) + "M";
  return num.toString();
}

export default function CompanyClient({ ticker }: { ticker: string }) {
  const [company, setCompany] = useState<any | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [feed, setFeed] = useState<any[]>([]);

  useEffect(() => {
    // fundamentals
    fetch("/data/sp500.json")
      .then((res) => res.json())
      .then((data) => {
        const match = data.find((c: any) => c.ticker === ticker);
        setCompany(match);
      });

    // chart data
    fetch(`/data/charts/${ticker}.json`)
      .then((res) => res.json())
      .then(setChartData)
      .catch(() => setChartData([]));

    // stocktwits feed
    fetch(`/api/stocktwits/${ticker}`)
      .then((res) => res.json())
      .then((data) => setFeed(data.messages || []))
      .catch(() => setFeed([]));
  }, [ticker]);

  if (!company) {
    return (
      <main className="p-8">
        <h1 className="text-xl font-bold">Company not found</h1>
      </main>
    );
  }

  // ---- JSON-LD ----
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: company.name,
    tickerSymbol: company.ticker,
    url: `https://stock-market-info.com/company/${company.ticker}`,
    logo: company.logo_url,
    description: `${company.name} (${company.ticker}) market cap ${company.marketCap}, revenue ${company.revenue}, net income ${company.netIncome}, and valuation ratios.`,
    address: {
      "@type": "PostalAddress",
      addressCountry: company.country || "US",
    },
    sameAs: [
      `https://finance.yahoo.com/quote/${company.ticker}`,
      `https://www.polygon.io/stocks/${company.ticker}`,
    ],
  };

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-5xl mx-auto space-y-6">
        {/* Title + logo */}
        <div className="flex items-center space-x-3">
          {company.logo_url && (
            <img
              src={company.logo_url}
              alt={`${company.name} logo`}
              className="w-10 h-10 rounded"
            />
          )}
          <h1 className="text-2xl font-bold text-gray-900">
            {company.name} ({company.ticker}) — Market Cap &amp; Valuation
          </h1>
        </div>

        {/* Fundamentals */}
        <div className="bg-white shadow rounded-xl p-6 mb-6">
          <p className="mb-2">
            <strong>Price:</strong> ${company.price.toFixed(2)}
          </p>
          <p className="mb-2">
            <strong>Market Cap:</strong> {formatNumber(company.marketCap)}
          </p>
          <p className="mb-2">
            <strong>P/E Ratio:</strong> {company.pe ?? "-"}
          </p>
          <p className="mb-2">
            <strong>Dividend Yield:</strong>{" "}
            {company.dividendYield ? company.dividendYield + "%" : "-"}
          </p>
        </div>

        {/* Chart */}
        <div className="bg-white shadow rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-2">Price Chart</h2>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <XAxis dataKey="date" hide />
                <YAxis domain={["auto", "auto"]} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="close"
                  stroke="#2563eb"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400">No chart data available.</p>
          )}
        </div>

        {/* About */}
        <div className="bg-white shadow rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-2">About {company.name}</h2>
          <p className="text-gray-700 leading-relaxed">
            {company.description ?? "No description available."}
          </p>
        </div>
      </div>

      {/* Stocktwits feed */}
      <div className="bg-white shadow rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">Stocktwits Feed</h2>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {feed.length > 0 ? (
            feed.slice(0, 5).map((msg) => (
              <div key={msg.id} className="border-b pb-3">
                <div className="flex items-center space-x-2 mb-1">
                  <img
                    src={msg.user.avatar_url}
                    alt={msg.user.username}
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="text-sm font-semibold">
                    {msg.user.username}
                  </span>
                  {msg.entities?.sentiment && (
                    <span
                      className={`ml-2 text-xs px-2 py-0.5 rounded ${
                        msg.entities.sentiment.basic === "Bullish"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {msg.entities.sentiment.basic}
                    </span>
                  )}
                </div>
                <p className="text-gray-800 text-sm">{msg.body}</p>
                <p className="text-xs text-gray-500">
                  {new Date(msg.created_at).toLocaleString()}
                </p>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No messages found.</p>
          )}
        </div>

        <a
          href={`https://twitter.com/search?q=%24${ticker}&src=typed_query&f=live`}
          target="_blank"
          rel="noopener noreferrer"
          className="block mt-4 text-blue-600 hover:underline text-sm"
        >
          View live ${ticker} chatter on Twitter →
        </a>
      </div>
    </main>
  );
}

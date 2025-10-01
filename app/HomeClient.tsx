"use client";

import { useEffect, useState } from "react";

function formatNumber(num: number) {
  if (num >= 1e12) return (num / 1e12).toFixed(2) + "T";
  if (num >= 1e9) return (num / 1e9).toFixed(2) + "B";
  return num.toString();
}

export default function HomeClient() {
  const [companies, setCompanies] = useState<any[]>([]);

  useEffect(() => {
    fetch("/data/sp500.json")
      .then((res) => res.json())
      .then((data) => {
        // sort by market cap desc, take top 20
        const sorted = [...data].sort(
          (a, b) => (b.marketCap || 0) - (a.marketCap || 0)
        );
        setCompanies(sorted.slice(0, 20));
      });
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* 🔹 Hero */}
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">
            Global Stock Market Caps & Valuations
          </h1>
          <p className="text-gray-600">
            Compare companies, explore sectors, and track valuations in one
            place.
          </p>
        </div>

        {/* 🔹 Top Companies */}
        <div>
          <h2 className="text-xl font-semibold mb-4">
            Top 20 Companies by Market Cap
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {companies.map((c) => (
              <a
                key={c.ticker}
                href={`/company/${c.ticker}`}
                className="bg-white shadow rounded-xl p-4 hover:shadow-lg transition"
              >
                <div className="flex items-center space-x-3">
                  {c.logo_url && (
                    <img
                      src={c.logo_url}
                      alt={`${c.name} logo`}
                      className="w-8 h-8 rounded"
                    />
                  )}
                  <h2 className="font-semibold">
                    {c.name} ({c.ticker})
                  </h2>
                </div>
                <p className="text-gray-600">
                  Market Cap: ${formatNumber(c.marketCap)}
                </p>
              </a>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

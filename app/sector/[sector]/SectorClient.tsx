"use client";

import { useEffect, useState } from "react";

export default function SectorClient({ sector }: { sector: string }) {
  const [companies, setCompanies] = useState<any[]>([]);

  useEffect(() => {
    fetch("/data/sp500.json")
      .then((res) => res.json())
      .then((data) => {
        const filtered = data.filter(
          (c: any) => c.sector?.toUpperCase() === sector
        );
        setCompanies(filtered);
      });
  }, [sector]);

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">
          {sector} Sector — Market Caps & Valuations
        </h1>

        {companies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  Market Cap:{" "}
                  {c.marketCap
                    ? `$${(c.marketCap / 1e9).toFixed(1)}B`
                    : "—"}
                </p>
              </a>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No companies found in this sector.</p>
        )}
      </div>
    </main>
  );
}

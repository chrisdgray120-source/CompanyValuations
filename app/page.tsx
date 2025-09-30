"use client";

import { useState, useEffect } from "react";
import Link from "next/link"; 

// Helper: format market cap nicely (T = trillion, B = billion, etc.)
function formatNumber(num: number | null) {
  if (!num) return "-";
  if (num >= 1e12) return (num / 1e12).toFixed(2) + "T";
  if (num >= 1e9) return (num / 1e9).toFixed(2) + "B";
  if (num >= 1e6) return (num / 1e6).toFixed(2) + "M";
  return num.toString();
}

export default function HomePage() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [sortKey, setSortKey] = useState<keyof any>("marketCap");
  const [sortAsc, setSortAsc] = useState(false);

  useEffect(() => {
    fetch("/data/sp500.json")
      .then((res) => res.json())
      .then(setCompanies)
      .catch((err) => console.error("Failed to load data", err));
  }, []);

  const sorted = [...companies].sort((a, b) => {
    const valA = a[sortKey] ?? 0;
    const valB = b[sortKey] ?? 0;
    if (valA === valB) return 0;
    return sortAsc ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
  });

  const handleSort = (key: keyof any) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
  };

return (
  <main className="min-h-screen bg-gray-50 py-8 px-4">
    <div className="max-w-6xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">
        S&amp;P 500 Company Valuations
      </h1>
      <div className="overflow-x-auto rounded-xl shadow bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th
                className="p-3 text-left cursor-pointer"
                onClick={() => handleSort("name")}
              >
                Company
              </th>
              <th
                className="p-3 text-left cursor-pointer"
                onClick={() => handleSort("ticker")}
              >
                Ticker
              </th>
              <th
                className="p-3 text-right cursor-pointer"
                onClick={() => handleSort("marketCap")}
              >
                Market Cap
              </th>
              <th
                className="p-3 text-right cursor-pointer"
                onClick={() => handleSort("price")}
              >
                Price
              </th>
              <th
                className="p-3 text-right cursor-pointer"
                onClick={() => handleSort("pe")}
              >
                P/E
              </th>
              <th
                className="p-3 text-right cursor-pointer"
                onClick={() => handleSort("dividendYield")}
              >
                Dividend Yield
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((c, i) => (
              <tr
                key={c.ticker}
                className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
              >
                <td className="p-3 font-medium text-gray-900">
                  <Link
                    href={`/company/${c.ticker.toLowerCase()}`}
                    className="hover:underline text-blue-600"
                  >
                    {c.name}
                  </Link>
                </td>
                <td className="p-3 text-gray-600">{c.ticker}</td>
                <td className="p-3 text-right font-semibold">
                  {formatNumber(c.marketCap)}
                </td>
                <td className="p-3 text-right">
                  {c.price ? `$${c.price.toFixed(2)}` : "-"}
                </td>
                <td className="p-3 text-right">{c.pe ?? "-"}</td>
                <td className="p-3 text-right">
                  {c.dividendYield ? c.dividendYield + "%" : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div> {/* 👈 closes the container */}
  </main>
);
}

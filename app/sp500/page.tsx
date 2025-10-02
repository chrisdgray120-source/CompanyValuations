"use client";
import { useEffect, useState } from "react";

type Company = {
  ticker: string;
  name: string;
  sector: string;
};

type Quote = {
  price: number;
  marketCap: number;
};

export default function SP500Page() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [sector, setSector] = useState("All");
  const [quotes, setQuotes] = useState<Record<string, Quote>>({});

  // Load static S&P500 list
  useEffect(() => {
    fetch("/data/sp500.json")
      .then((r) => r.json())
      .then(setCompanies)
      .catch((err) => console.error("Failed to load sp500.json", err));
  }, []);

  // Load live quotes (all tickers at once, comma-separated)
  useEffect(() => {
    async function loadQuotes() {
      if (companies.length === 0) return;
      const tickers = companies.map((c) => c.ticker).join(",");
      try {
        const res = await fetch(`/api/quote/${tickers}`);
        const data = await res.json();

        const mapped: Record<string, Quote> = {};
        data.forEach((q: any) => {
          mapped[q.symbol] = {
            price: q.price,
            marketCap: q.marketCap,
          };
        });
        setQuotes(mapped);
      } catch (err) {
        console.error("Failed to load quotes", err);
      }
    }

    loadQuotes();
  }, [companies]);

  // Collect unique sectors
  const sectors = Array.from(new Set(companies.map((c) => c.sector))).sort();

  // Apply filter
  const filtered =
    sector === "All"
      ? companies
      : companies.filter((c) => c.sector === sector);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">S&amp;P 500 Companies</h1>

      {/* Sector filter */}
      <div className="mb-4">
        <label className="mr-2 font-medium">Sector:</label>
        <select
          value={sector}
          onChange={(e) => setSector(e.target.value)}
          className="border rounded p-1"
        >
          <option value="All">All</option>
          {sectors.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left py-2 px-3">#</th>
              <th className="text-left py-2 px-3">Ticker</th>
              <th className="text-left py-2 px-3">Name</th>
              <th className="text-left py-2 px-3">Sector</th>
              <th className="text-right py-2 px-3">Price</th>
              <th className="text-right py-2 px-3">Market Cap</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c, i) => (
              <tr key={c.ticker} className="border-t hover:bg-gray-50">
                <td className="py-2 px-3">{i + 1}</td>
                <td className="py-2 px-3 font-medium text-blue-600">
                  <a href={`/company/${c.ticker}`}>{c.ticker}</a>
                </td>
                <td className="py-2 px-3">{c.name}</td>
                <td className="py-2 px-3">{c.sector}</td>
                <td className="py-2 px-3 text-right">
                  {quotes[c.ticker]?.price
                    ? `$${quotes[c.ticker].price.toFixed(2)}`
                    : "-"}
                </td>
                <td className="py-2 px-3 text-right">
                  {quotes[c.ticker]?.marketCap
                    ? (quotes[c.ticker].marketCap / 1e9).toFixed(1) + "B"
                    : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

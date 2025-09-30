"use client";

import { useParams } from "next/navigation";
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

export default function CompanyPage() {
  const params = useParams();
  const ticker = (params?.ticker as string)?.toUpperCase();

  const [company, setCompany] = useState<any | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    fetch("/data/sp500.json")
      .then((res) => res.json())
      .then((data) => {
        const match = data.find((c: any) => c.ticker === ticker);
        setCompany(match);
      });
      // chart data
    fetch(`/data/charts/${ticker}.json`)   // 👈 NEW fetch
      .then((res) => res.json())
      .then(setChartData)
      .catch(() => setChartData([]));
  }, [ticker]);

  if (!company) {
    return (
      <main className="p-8">
        <h1 className="text-xl font-bold">Company not found</h1>
      </main>
    );
  }

  return (
  <main className="min-h-screen bg-gray-50 py-8 px-4 space-y-6">
      {/* 🔹 Title + logo */}
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

      <div className="bg-white shadow rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-2">Price Chart</h2>
        {chartData.length > 0 ? (   // 👈 if we have data
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <XAxis dataKey="date" hide />
              <YAxis domain={["auto", "auto"]} />
              <Tooltip />
              <Line type="monotone" dataKey="close" stroke="#2563eb" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-400">No chart data available.</p>
        )}
      </div>

      {/* 🔹 About card */}
      <div className="bg-white shadow rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-2">About {company.name}</h2>
        <p className="text-gray-700 leading-relaxed">
          {company.description ?? "No description available."}
        </p>
      </div>
    </main>
  );
}
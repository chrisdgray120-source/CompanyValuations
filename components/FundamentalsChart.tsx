"use client";
import { useEffect, useState } from "react";
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

type FundamentalsRow = {
  date: string;
  revenue: number;
  netIncome: number;
  eps: number;
  fcf: number;
  sharesOutstanding: number;
};

export default function FundamentalsChart({ ticker }: { ticker: string }) {
  const [data, setData] = useState<FundamentalsRow[]>([]);
  const [showRevenue, setShowRevenue] = useState(true);
  const [showNetIncome, setShowNetIncome] = useState(true);
  const [showEPS, setShowEPS] = useState(false);
  const [showFCF, setShowFCF] = useState(false);
  const [showShares, setShowShares] = useState(false);
  const [viewAnnual, setViewAnnual] = useState(false);

  useEffect(() => {
    const file = viewAnnual
      ? `/data/fundamentals/${ticker}_annual.json`
      : `/data/fundamentals/${ticker}.json`;

    fetch(file)
      .then((res) => res.json())
      .then((data) => {
        if (!data || data.length === 0) {
          // fallback dummy values
          setData([
            {
              date: "2020-12-31",
              revenue: 0,
              netIncome: 0,
              eps: 0,
              fcf: 0,
              sharesOutstanding: 0,
            },
          ]);
        } else {
          // oldest → newest and safe values
          const ordered = [...data].reverse().map((d: any) => ({
            date: d.date,
            revenue: d.revenue ?? 0,
            netIncome: d.netIncome ?? 0,
            eps: d.eps ?? 0,
            fcf: d.fcf ?? 0,
            sharesOutstanding: d.sharesOutstanding ?? 0,
          }));
          setData(ordered);
        }
      })
      .catch(() =>
        setData([
          {
            date: "2020-12-31",
            revenue: 0,
            netIncome: 0,
            eps: 0,
            fcf: 0,
            sharesOutstanding: 0,
          },
        ])
      );
  }, [ticker, viewAnnual]);

  // if only dummy/empty data → show message instead of chart
  const allZero =
    data.length &&
    data.every(
      (d) =>
        d.revenue === 0 &&
        d.netIncome === 0 &&
        d.eps === 0 &&
        d.fcf === 0 &&
        d.sharesOutstanding === 0
    );

  if (allZero) {
    return (
      <div className="bg-white shadow rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-2">Fundamentals</h2>
        <p className="text-gray-400">
          {viewAnnual ? "No annual data available." : "No quarterly data available."}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-xl p-6">
      <h2 className="text-lg font-semibold mb-2">
        Fundamentals ({viewAnnual ? "Annual" : "Quarterly"}, last {data.length} periods)
      </h2>

      {/* Toggle buttons */}
      <div className="flex flex-wrap gap-2 mb-3">
        <button
          onClick={() => setShowRevenue(!showRevenue)}
          className={`px-3 py-1 rounded ${
            showRevenue ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          Revenue
        </button>
        <button
          onClick={() => setViewAnnual(!viewAnnual)}
          className={`px-3 py-1 rounded ${
            viewAnnual ? "bg-indigo-600 text-white" : "bg-gray-200"
          }`}
        >
          {viewAnnual ? "Quarterly View" : "MAX (Annual)"}
        </button>
        <button
          onClick={() => setShowNetIncome(!showNetIncome)}
          className={`px-3 py-1 rounded ${
            showNetIncome ? "bg-green-600 text-white" : "bg-gray-200"
          }`}
        >
          Net Income
        </button>
        <button
          onClick={() => setShowEPS(!showEPS)}
          className={`px-3 py-1 rounded ${
            showEPS ? "bg-yellow-400 text-black" : "bg-gray-200"
          }`}
        >
          EPS
        </button>
        <button
          onClick={() => setShowFCF(!showFCF)}
          className={`px-3 py-1 rounded ${
            showFCF ? "bg-purple-600 text-white" : "bg-gray-200"
          }`}
        >
          Free Cash Flow
        </button>
        <button
          onClick={() => setShowShares(!showShares)}
          className={`px-3 py-1 rounded ${
            showShares ? "bg-red-600 text-white" : "bg-gray-200"
          }`}
        >
          Shares Out.
        </button>
      </div>

      <div className="w-full h-[480px] bg-gray-50 rounded-xl p-3">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data}>
            <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              stroke="#17191dff"
              tick={{ fontSize: 12, fill: "#17191dff" }}
            />
            <YAxis
              yAxisId="left"
              stroke="#17191dff"
              tick={{ fontSize: 12, fill: "#17191dff" }}
              tickFormatter={(v) => `$${(v / 1e9).toFixed(0)}B`}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#17191dff"
              tick={{ fontSize: 12, fill: "#17191dff" }}
            />

<Tooltip
  formatter={(value: any, name: string) => {
    const labels: Record<string, string> = {
      revenue: "Revenue",
      netIncome: "Net Income",
      eps: "EPS",
      fcf: "Free Cash Flow",
      sharesOutstanding: "Shares Outstanding",
    };

    let displayValue: string;

    if (value == null) {
      displayValue = "-";
    } else {
      switch (name) {
        case "eps":
          displayValue = `$${Number(value).toFixed(2)}`;
          break;
        case "sharesOutstanding":
          displayValue = Number(value).toLocaleString();
          break;
        case "revenue":
        case "netIncome":
        case "fcf":
          if (Math.abs(value) >= 1e9) {
            displayValue = `$${(value / 1e9).toFixed(2)}B`;
          } else if (Math.abs(value) >= 1e6) {
            displayValue = `$${(value / 1e6).toFixed(2)}M`;
          } else {
            displayValue = `$${Number(value).toFixed(0)}`;
          }
          break;
        default:
          displayValue = Number(value).toLocaleString();
      }
    }

    return [displayValue, labels[name] || name];
  }}
/>


            {/* Bars for revenue + net income */}
            {showRevenue && (
              <Bar yAxisId="left" dataKey="revenue" fill="#2563eb" barSize={20} />
            )}
            {showNetIncome && (
              <Bar yAxisId="left" dataKey="netIncome" fill="#10b981" barSize={20} />
            )}

            {/* Lines for EPS / FCF / Shares */}
            {showEPS && (
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="eps"
                stroke="#facc15"
                strokeWidth={2}
                dot={false}
              />
            )}
            {showFCF && (
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="fcf"
                stroke="#9333ea"
                strokeWidth={2}
                dot={false}
              />
            )}
            {showShares && (
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="sharesOutstanding"
                stroke="#ef4444"
                strokeWidth={2}
                dot={false}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

"use client";
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useState } from "react";

type Props = {
  chartData: any[];
  timeframe: string;
  setTimeframe: (tf: string) => void;
  showSMA20: boolean;
  setShowSMA20: (v: boolean) => void;
  showSMA50: boolean;
  setShowSMA50: (v: boolean) => void;
  showSMA200: boolean;
  setShowSMA200: (v: boolean) => void;
};

export default function PriceChart({
  chartData,
  timeframe,
  setTimeframe,
  showSMA20,
  setShowSMA20,
  showSMA50,
  setShowSMA50,
  showSMA200,
  setShowSMA200,
}: Props) {
  return (
    <div className="bg-white shadow rounded-xl p-6">
      <h2 className="text-lg font-semibold mb-2">Price Chart</h2>

      {/* Timeframe + SMA buttons */}
      <div className="flex gap-2 mb-3 flex-wrap">
        {["1M", "6M", "1Y", "MAX"].map((tf) => (
          <button
            key={tf}
            onClick={() => setTimeframe(tf)}
            className={`px-3 py-1 rounded ${
              timeframe === tf ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            {tf}
          </button>
        ))}
        <button
          onClick={() => setShowSMA20(!showSMA20)}
          className={`px-3 py-1 rounded ${
            showSMA20 ? "bg-yellow-400 text-black" : "bg-gray-200"
          }`}
        >
          20 SMA
        </button>
        <button
          onClick={() => setShowSMA50(!showSMA50)}
          className={`px-3 py-1 rounded ${
            showSMA50 ? "bg-green-600 text-white" : "bg-gray-200"
          }`}
        >
          50 SMA
        </button>
        <button
          onClick={() => setShowSMA200(!showSMA200)}
          className={`px-3 py-1 rounded ${
            showSMA200 ? "bg-red-600 text-white" : "bg-gray-200"
          }`}
        >
          200 SMA
        </button>
      </div>

      {chartData.length > 0 ? (
        <div className="w-full h-[480px] bg-gray-50 rounded-xl p-3">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData}>
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>

              <XAxis
                dataKey="date"
                stroke="#17191dff"
                tick={{ fontSize: 12, fill: "#17191dff" }}
                tickFormatter={(d) =>
                  new Date(d).toLocaleDateString("en-US", {
                    month: "short",
                    year: "2-digit",
                  })
                }
              />
              <YAxis
                domain={["auto", "auto"]}
                stroke="#17191dff"
                tick={{ fontSize: 12, fill: "#17191dff" }}
                tickFormatter={(v) => `$${v.toFixed(0)}`}
              />
              <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />

              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "0.5rem",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                  color: "#17191dff",
                }}
                labelStyle={{ fontWeight: "600", color: "#17191dff" }}
                formatter={(value: number, name: string) => {
                  const labels: Record<string, string> = {
                    close: "Close Price",
                    sma20: "20 SMA",
                    sma50: "50 SMA",
                    sma200: "200 SMA",
                  };
                  const label = labels[name] || name;
                  return [`$${value.toFixed(2)}`, label];
                }}
              />

              {/* 🔹 Area under price */}
              <Area
                type="monotone"
                dataKey="close"
                stroke="none"
                fill="url(#priceGradient)"
              />

              {/* 🔹 Price line */}
              <Line
                type="monotone"
                dataKey="close"
                stroke="#2563eb"
                dot={false}
                strokeWidth={2}
              />

              {/* 🔹 SMA lines */}
              <Line
                type="monotone"
                dataKey="sma20"
                stroke="#facc15"
                dot={false}
                strokeWidth={1.5}
                hide={!showSMA20}
              />
              <Line
                type="monotone"
                dataKey="sma50"
                stroke="#10b981"
                dot={false}
                strokeWidth={1.5}
                hide={!showSMA50}
              />
              <Line
                type="monotone"
                dataKey="sma200"
                stroke="#ef4444"
                dot={false}
                strokeWidth={1.5}
                hide={!showSMA200}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="text-gray-400">No chart data available.</p>
      )}
    </div>
  );
}

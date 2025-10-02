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
import { useMemo, useState } from "react";

type Props = {
  chartData: any[];
  timeframe: string;
  setTimeframe: (tf: string) => void;
  showSMA20: boolean;
  setShowSMA20: (v: boolean) => void;
  showSMA50: boolean;
  setShowSMA50: (v: boolean) => void;
  showSMA100: boolean;
  setShowSMA100: (v: boolean) => void;
  showSMA200: boolean;
  setShowSMA200: (v: boolean) => void;
};

// 🔹 Calculate SMA
function calculateSMA(data: any[], period: number, key: string) {
  return data.map((row, i) => {
    if (i < period - 1) return { ...row, [key]: null };
    const slice = data.slice(i - period + 1, i + 1);
    const avg = slice.reduce((sum, d) => sum + d.close, 0) / period;
    return { ...row, [key]: avg };
  });
}

// 🔹 Calculate % change
function calculateChange(data: any[]) {
  if (!data || data.length < 2) return null;
  const first = data[0].close;
  const last = data[data.length - 1].close;
  return ((last - first) / first) * 100;
}

export default function PriceChart({
  chartData,
  timeframe,
  setTimeframe,
  showSMA20,
  setShowSMA20,
  showSMA50,
  setShowSMA50,
  showSMA100,
  setShowSMA100,
  showSMA200,
  setShowSMA200,
}: Props) {
  const [expanded, setExpanded] = useState(false); // 🔹 Expand/shrink state

  // 🔹 Enrich with SMAs and filter by timeframe
  const enrichedChartData = useMemo(() => {
    let data = [...chartData];
    data = calculateSMA(data, 20, "sma20");
    data = calculateSMA(data, 50, "sma50");
    data = calculateSMA(data, 100, "sma100");
    data = calculateSMA(data, 200, "sma200");

    const year = new Date().getFullYear();
    if (timeframe === "YTD") {
      return data.filter((d) => d.date.startsWith(`${year}-`));
    }
    if (timeframe === "1M") return data.slice(-21);
    if (timeframe === "6M") return data.slice(-126);
    if (timeframe === "1Y") return data.slice(-252);
    return data; // MAX
  }, [chartData, timeframe]);

  const pctChange = calculateChange(enrichedChartData);

  return (
    <div className="bg-white shadow rounded-xl p-6 relative">
      {/* Header with expand toggle */}
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          Price Chart
          {pctChange != null && (
            <span
              className={`px-2 py-0.5 text-xs rounded ${
                pctChange >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}
            >
              {pctChange >= 0 ? "+" : ""}
              {pctChange.toFixed(2)}%
            </span>
          )}
        </h2>
        <button
          onClick={() => setExpanded(!expanded)}
          className="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300"
        >
          {expanded ? "Shrink" : "Expand"}
        </button>
      </div>

      {/* Timeframe + SMA buttons */}
      <div className="flex gap-2 mb-3 flex-wrap">
        {["1M", "6M", "YTD", "1Y", "MAX"].map((tf) => (
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
          onClick={() => setShowSMA100(!showSMA100)}
          className={`px-3 py-1 rounded ${
            showSMA100 ? "bg-purple-600 text-white" : "bg-gray-200"
          }`}
        >
          100 SMA
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

      {enrichedChartData.length > 0 ? (
        <div
          className={`w-full ${
            expanded ? "h-[720px]" : "h-[480px]"
          } bg-gray-50 rounded-xl p-3`}
        >
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={enrichedChartData}>
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>

              <XAxis
                dataKey="date"
                stroke="#17191dff"
                tick={{ fontSize: 12, fontWeight: "400", fill: "#17191dff" }}
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
                tick={{ fontSize: 12, fontWeight: "400", fill: "#17191dff" }}
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
                  fontSize: "12px",
                }}
                labelStyle={{ fontWeight: "600", color: "#17191dff",fontSize: "12px", }}
                  itemStyle={{ fontSize: "12px", }}
                formatter={(value: number, name: string) => {
                  const labels: Record<string, string> = {
                    close: "Close Price",
                    sma20: "20 SMA",
                    sma50: "50 SMA",
                    sma100: "100 SMA",
                    sma200: "200 SMA",
                  };
                  const label = labels[name] || name;
                  return [`$${value.toFixed(2)}`, label];
                }}
              />

              {/* Area under price */}
              <Area
                type="monotone"
                dataKey="close"
                stroke="none"
                fill="url(#priceGradient)"
              />

              {/* Price line */}
              <Line
                type="monotone"
                dataKey="close"
                stroke="#2563eb"
                dot={false}
                strokeWidth={2}
              />

              {/* SMA lines */}
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
                dataKey="sma100"
                stroke="#9333ea"
                dot={false}
                strokeWidth={1.5}
                hide={!showSMA100}
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

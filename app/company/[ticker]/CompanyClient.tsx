"use client";
import FinancialsTable from "@/components/FinancialsTable";
import { useEffect, useState } from "react";
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
import FundamentalsChart from "@/components/FundamentalsChart";

function formatNumber(num: number | null) {
  if (!num) return "-";
  if (num >= 1e12) return (num / 1e12).toFixed(2) + "T";
  if (num >= 1e9) return (num / 1e9).toFixed(2) + "B";
  if (num >= 1e6) return (num / 1e6).toFixed(2) + "M";
  return num.toString();
}

// 🔹 Helper: Calculate SMA for given period
function calculateSMA(data: any[], period: number) {
  return data.map((row, i) => {
    if (i < period - 1) {
      return { ...row, [`sma${period}`]: null };
    }
    const slice = data.slice(i - period + 1, i + 1);
    const avg = slice.reduce((sum, d) => sum + d.close, 0) / period;
    return { ...row, [`sma${period}`]: avg };
  });
}

export default function CompanyClient({ ticker }: { ticker: string }) {
  const [profile, setProfile] = useState<any | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [timeframe, setTimeframe] = useState("1Y");
  const [showSMA20, setShowSMA20] = useState(true);
  const [showSMA50, setShowSMA50] = useState(true);
  const [showSMA200, setShowSMA200] = useState(true);
  const [feed, setFeed] = useState<any[]>([]);
  const [cursor, setCursor] = useState<any | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [financials, setFinancials] = useState<any | null>(null);
  const [quote, setQuote] = useState<any | null>(null);

  // 🔹 Filter timeframe
  function filterData(data: any[]) {
    if (timeframe === "1M") return data.slice(-21);
    if (timeframe === "6M") return data.slice(-126);
    if (timeframe === "1Y") return data.slice(-252);
    return data; // MAX
  }
  const filteredChartData = filterData(chartData);

  useEffect(() => {
    // profile from FMP
    fetch(`/api/profile/${ticker}`)
      .then((res) => res.json())
      .then((data) => setProfile(data?.[0] || null))
      .catch(() => setProfile(null));

    // chart data
fetch(`/data/charts/${ticker}.json`)
  .then((res) => res.json())
  .then((data) => {
    let enriched = calculateSMA(data, 20);
    enriched = calculateSMA(enriched, 50);
    enriched = calculateSMA(enriched, 200);
    setChartData(enriched);
  })
  .catch(() => setChartData([]));

    // financials
    fetch(`/api/financials/${ticker}`)
      .then((res) => res.json())
      .then((data) => setFinancials(data))
      .catch(() => setFinancials(null));

    // live quote
    fetch(`/api/quote/${ticker}`)
      .then((res) => res.json())
      .then(setQuote)
      .catch(() => setQuote(null));

    // stocktwits feed (first page)
    fetch(`/api/stocktwits/${ticker}`)
      .then((res) => res.json())
      .then((data) => {
        setFeed(data.messages || []);
        setCursor(data.cursor || null);
      })
      .catch(() => {
        setFeed([]);
        setCursor(null);
      });
  }, [ticker]);

  const loadMore = async () => {
    if (!cursor?.more || !cursor?.max) return;
    setLoadingMore(true);
    try {
      const res = await fetch(`/api/stocktwits/${ticker}?max=${cursor.max}`);
      const data = await res.json();
      setFeed((prev) => [...prev, ...(data.messages || [])]);
      setCursor(data.cursor || null);
    } finally {
      setLoadingMore(false);
    }
  };

  if (!profile) {
    return (
      <main className="p-8">
        <h1 className="text-xl font-bold">Loading company profile...</h1>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* 🔹 Title + logo */}
        <div className="flex items-center space-x-3">
          <img
            src={`/logos/${ticker}.png`}
            alt={`${profile?.companyName ?? ticker} logo`}
            className="w-10 h-10 rounded"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = "/logos/_fallback.png";
            }}
          />
          <h1 className="text-2xl font-bold text-gray-900">
            {profile?.companyName ?? ticker} ({ticker}) — Market Cap &amp; Valuation
          </h1>
        </div>

        {/* 🔹 Quote + Company Profile */}
        <div className="bg-white shadow rounded-xl p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left = Quote */}
            <div>
              {quote ? (
                <>
                  <p className="mb-2">
                    <strong>Price:</strong> ${quote.price.toFixed(2)}
                  </p>
                  <p
                    className={`mb-2 font-medium ${
                      quote.change >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {quote.change >= 0 ? "▲" : "▼"} {quote.change.toFixed(2)} (
                    {quote.changePercent.toFixed(2)}%)
                  </p>
                  <p className="mb-2">
                    <strong>Market Cap:</strong> {formatNumber(quote.marketCap)}
                  </p>
                  <p className="mb-2">
                    <strong>Day Range:</strong> {quote.dayLow} – {quote.dayHigh}
                  </p>
                  <p className="mb-2">
                    <strong>52W Range:</strong> {quote.yearLow} – {quote.yearHigh}
                  </p>
                  <p className="mb-2">
                    <strong>Volume:</strong>{" "}
                    {quote.volume ? quote.volume.toLocaleString() : "-"}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    {quote.exchange} · delayed at{" "}
                    {quote.timestamp
                      ? new Date(quote.timestamp * 1000).toLocaleString()
                      : "N/A"}
                  </p>
                </>
              ) : (
                <p className="text-gray-500">No quote data available.</p>
              )}
            </div>

            {/* Right = Company Profile */}
            <div className="text-sm space-y-2">
              {profile?.ceo && (
                <p>
                  <strong>CEO:</strong> {profile.ceo}
                </p>
              )}
              {profile?.fullTimeEmployees && (
                <p>
                  <strong>Employees:</strong> {profile.fullTimeEmployees}
                </p>
              )}
              {profile?.sector && (
                <p>
                  <strong>Sector:</strong> {profile.sector}
                </p>
              )}
              {profile?.industry && (
                <p>
                  <strong>Industry:</strong> {profile.industry}
                </p>
              )}
              {profile?.website && (
                <p>
                  <strong>Website:</strong>{" "}
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {profile.website}
                  </a>
                </p>
              )}
              {profile?.address && (
                <p>
                  <strong>HQ:</strong> {profile.address}, {profile.city},{" "}
                  {profile.state}, {profile.country}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* 🔹 About */}
        <div className="bg-white shadow rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-3">
            About {profile?.companyName ?? ticker}
          </h2>
          <p className="text-gray-700 text-sm leading-relaxed">
            {profile?.description ?? "No description available."}
          </p>
        </div>

{/* 🔹 Price Chart with SMA */}
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
        <ComposedChart data={filteredChartData}>
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
            stroke="#facc15" // yellow
            dot={false}
            strokeWidth={1.5}
            hide={!showSMA20}
          />
          <Line
            type="monotone"
            dataKey="sma50"
            stroke="#10b981" // green
            dot={false}
            strokeWidth={1.5}
            hide={!showSMA50}
          />
          <Line
            type="monotone"
            dataKey="sma200"
            stroke="#ef4444" // red
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

{/* 🔹 Fundamentals Chart */}
<FundamentalsChart ticker={ticker} />

{/* 🔹 Ad placeholder */}
<div className="bg-gray-100 text-center py-6 rounded-lg border">
  <p className="text-gray-500">Ad Space</p>
</div>

{/* 🔹 Financials Table */}
{financials && <FinancialsTable data={financials} />}



        {/* 🔹 Stocktwits */}
        <div className="bg-white shadow rounded-xl p-6 max-w-3xl">
          <h2 className="text-lg font-semibold mb-3">Stocktwits Feed</h2>
          {feed.length > 0 ? (
            <>
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {feed.map((msg) => (
                  <div key={msg.id} className="border-b pb-2">
                    <div className="flex items-center space-x-2 mb-1">
                      <img
                        src={msg.user.avatar_url}
                        alt={msg.user.username}
                        className="w-5 h-5 rounded-full"
                      />
                      <span className="text-xs font-semibold">
                        {msg.user.username}
                      </span>
                      {msg.entities?.sentiment && (
                        <span
                          className={`ml-2 text-[10px] px-1.5 py-0.5 rounded ${
                            msg.entities.sentiment.basic === "Bullish"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {msg.entities.sentiment.basic}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-800">{msg.body}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(msg.created_at).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
              {cursor?.more && (
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="mt-3 px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {loadingMore ? "Loading..." : "Load More"}
                </button>
              )}
            </>
          ) : (
            <p className="text-gray-500 text-sm">No messages found.</p>
          )}
        </div>
      </div>
    </main>
  );
}

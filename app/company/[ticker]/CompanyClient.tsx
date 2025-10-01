"use client";
import FinancialsTable from "@/components/FinancialsTable";
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
  const [profile, setProfile] = useState<any | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [feed, setFeed] = useState<any[]>([]);
  const [cursor, setCursor] = useState<any | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [financials, setFinancials] = useState<any | null>(null);
  const [quote, setQuote] = useState<any | null>(null);

  useEffect(() => {
    // profile from FMP
    fetch(`/api/profile/${ticker}`)
      .then((res) => res.json())
      .then((data) => setProfile(data?.[0] || null))
      .catch(() => setProfile(null));

    // chart data
    fetch(`/data/charts/${ticker}.json`)
      .then((res) => res.json())
      .then(setChartData)
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
          {profile?.image && (
            <img
              src={profile.image}
              alt={`${profile.companyName} logo`}
              className="w-10 h-10 rounded"
            />
          )}
          <h1 className="text-2xl font-bold text-gray-900">
            {profile?.companyName ?? ticker} ({ticker}) — Market Cap &amp; Valuation
          </h1>
        </div>

{/* 🔹 Quote + Company Profile (side by side) */}
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

        {/* 🔹 About (separate box) */}
        <div className="bg-white shadow rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-3">
            About {profile?.companyName ?? ticker}
          </h2>
          <p className="text-gray-700 text-sm leading-relaxed">
            {profile?.description ?? "No description available."}
          </p>
        </div>

        {/* 🔹 Chart */}
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

        {/* 🔹 Financials */}
        {financials && <FinancialsTable data={financials} />}

        {/* 🔹 Stocktwits feed */}
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
          <a
            href={`https://twitter.com/search?q=%24${ticker}&src=typed_query&f=live`}
            target="_blank"
            rel="noopener noreferrer"
            className="block mt-3 text-blue-600 hover:underline text-xs"
          >
            View live ${ticker} chatter on Twitter →
          </a>
        </div>
      </div>
    </main>
  );
}

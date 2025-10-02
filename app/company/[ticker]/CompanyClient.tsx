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
import PriceChart from "@/components/PriceChart";
import CompanyHeader from "@/components/CompanyHeader";
import QuoteBox from "@/components/QuoteBox";
import StocktwitsFeed from "@/components/StocktwitsFeed";
import NewsFeed from "@/components/NewsFeed";
import FinancialsTableToggle from "@/components/FinancialsTableToggle";


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

// 🔹 Helper: Calculate YTD % change (safe for IPOs / missing data)
function calculateYTD(data: any[]) {
  if (!data.length) return null;

  const year = new Date().getFullYear();
  const latest = data[data.length - 1];

  // find the first data point in the current year
  const startOfYear = data.find((d) => d.date.startsWith(`${year}-`));

  if (!latest?.close || !startOfYear?.close) {
    return null; // no valid data → hide badge
  }

  const change = ((latest.close - startOfYear.close) / startOfYear.close) * 100;

  // sanity check: avoid NaN or extreme garbage values
  if (!isFinite(change)) return null;

  return change;
}



export default function CompanyClient({ ticker }: { ticker: string }) {
  const [profile, setProfile] = useState<any | null>(null);
  const [quote, setQuote] = useState<any | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [timeframe, setTimeframe] = useState("1Y");
  const [showSMA20, setShowSMA20] = useState(true);
  const [showSMA50, setShowSMA50] = useState(true);
  const [showSMA200, setShowSMA200] = useState(true);
  const [feed, setFeed] = useState<any[]>([]);
  const [cursor, setCursor] = useState<any | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [financials, setFinancials] = useState<any | null>(null);
  const ytdChange = calculateYTD(chartData);

  // 🔹 Filter timeframe
  function filterData(data: any[]) {
    if (timeframe === "1M") return data.slice(-21);
    if (timeframe === "6M") return data.slice(-126);
    if (timeframe === "1Y") return data.slice(-252);
    return data; // MAX
  }
  const filteredChartData = filterData(chartData);

  useEffect(() => {
    // profile (static from local cache)
// profile from static JSON
fetch(`/data/profiles/${ticker}.json`)
  .then((res) => res.json())
  .then((data) => setProfile(data || null))
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

    // quote (live)
    fetch(`/api/quote/${ticker}`)
      .then((res) => res.json())
      .then((data) => setQuote(data))
      .catch(() => setQuote(null));

    // stocktwits
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
<CompanyHeader ticker={ticker} profile={profile} ytdChange={ytdChange} />
{/* 🔹 Quote Data*/}
<QuoteBox quote={quote} profile={profile} ticker={ticker} formatNumber={formatNumber} />

        {/* 🔹 Ad placeholder */}
        <div className="bg-gray-100 text-center py-6 rounded-lg border">
          <p className="text-gray-500">Ad Space</p>
        </div>

{/* 🔹 Price Chart with SMA */}
<PriceChart
  chartData={filteredChartData}
  timeframe={timeframe}
  setTimeframe={setTimeframe}
  showSMA20={showSMA20}
  setShowSMA20={setShowSMA20}
  showSMA50={showSMA50}
  setShowSMA50={setShowSMA50}
  showSMA200={showSMA200}
  setShowSMA200={setShowSMA200}
/>

        {/* 🔹 About */}
        <div className="bg-white shadow rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-3">
            About {profile?.companyName ?? ticker}
          </h2>
          <p className="text-gray-700 text-sm leading-relaxed">
            {profile?.description ?? "No description available."}
          </p>
        </div>



        

        {/* 🔹 Fundamentals Chart */}
        <FundamentalsChart ticker={ticker} />

{/* New toggleable version (annual/quarterly) */}
<FinancialsTableToggle ticker={ticker} />

        {/* 🔹 Ad placeholder */}
        <div className="bg-gray-100 text-center py-6 rounded-lg border">
          <p className="text-gray-500">Ad Space</p>
        </div>

<NewsFeed ticker={ticker} />

{/* 🔹 Stocktwits Feed */}
<StocktwitsFeed
  feed={feed}
  cursor={cursor}
  onLoadMore={loadMore}
  loadingMore={loadingMore}
/>


      </div>
    </main>
  );
}

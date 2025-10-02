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
  pe: number;
  ev: number;
  debt: number;
  netAssets: number;
};

function findByDate(arr: any[], date: string) {
  const target = date.slice(0, 7);
  return arr.find((r) => r.date?.startsWith(target)) || {};
}

export default function FundamentalsChart({ ticker }: { ticker: string }) {
  const [data, setData] = useState<FundamentalsRow[]>([]);
  const [viewAnnual, setViewAnnual] = useState(false);

  // toggles
  const [showRevenue, setShowRevenue] = useState(true);
  const [showNetIncome, setShowNetIncome] = useState(true);
  const [showEPS, setShowEPS] = useState(false);
  const [showFCF, setShowFCF] = useState(false);
  const [showShares, setShowShares] = useState(false);
  const [showPE, setShowPE] = useState(false);
  const [showEV, setShowEV] = useState(false);
  const [showDebt, setShowDebt] = useState(false);
  const [showNetAssets, setShowNetAssets] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const fundFile = viewAnnual
          ? `/data/fundamentals/${ticker}_annual.json`
          : `/data/fundamentals/${ticker}.json`;

        const [fundRes, ratioRes, evRes, balRes, profileRes] =
          await Promise.allSettled([
            fetch(fundFile).then((r) => r.json()),
            fetch(`/data/ratios/${ticker}.json`).then((r) => r.json()),
            fetch(`/data/ev/${ticker}.json`).then((r) => r.json()),
            fetch(`/data/balance/${ticker}.json`).then((r) => r.json()),
            fetch(`/data/profiles/${ticker}.json`).then((r) => r.json()),
          ]);

        const fundamentals =
          fundRes.status === "fulfilled" && Array.isArray(fundRes.value)
            ? [...fundRes.value].reverse()
            : [];
        const ratios =
          ratioRes.status === "fulfilled" && Array.isArray(ratioRes.value)
            ? [...ratioRes.value].reverse()
            : [];
        const evData =
          evRes.status === "fulfilled" && Array.isArray(evRes.value)
            ? [...evRes.value].reverse()
            : [];
        const balance =
          balRes.status === "fulfilled" && Array.isArray(balRes.value)
            ? [...balRes.value].reverse()
            : [];
        const profile =
          profileRes.status === "fulfilled" && profileRes.value
            ? profileRes.value
            : {};

        const merged = fundamentals.map((d: any) => {
          const ratio = findByDate(ratios, d.date);
          const ev = findByDate(evData, d.date);
          const bal = findByDate(balance, d.date);

          return {
            date: d.date,
            revenue: d.revenue ?? 0,
            netIncome: d.netIncome ?? 0,
            eps: d.eps ?? 0,
            fcf: d.fcf ?? 0,
            // 🔹 Shares Outstanding: back-calc if missing
            sharesOutstanding:
              d.sharesOutstanding ??
              (d.netIncome && d.eps ? d.netIncome / d.eps : null) ??
              (profile.mktCap && profile.price
                ? profile.mktCap / profile.price
                : profile.sharesOutstanding ?? 0),
            pe: ratio.peRatio ?? ratio.priceEarningsRatio ?? 0,
            ev: ev.enterpriseValue ?? 0,
            debt: ev.totalDebt ?? bal.totalDebt ?? 0,
            netAssets:
              bal.totalAssets && bal.totalLiabilities
                ? bal.totalAssets - bal.totalLiabilities
                : 0,
          };
        });

        setData(merged);
      } catch (err) {
        console.error("Fundamentals load failed", err);
        setData([]);
      }
    }

    load();
  }, [ticker, viewAnnual]);

  const allZero =
    data.length &&
    data.every(
      (d) =>
        d.revenue === 0 &&
        d.netIncome === 0 &&
        d.eps === 0 &&
        d.fcf === 0 &&
        d.sharesOutstanding === 0 &&
        d.pe === 0 &&
        d.ev === 0 &&
        d.debt === 0 &&
        d.netAssets === 0
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
          onClick={() => setViewAnnual(!viewAnnual)}
          className={`px-3 py-1 rounded font-medium ${
            viewAnnual ? "bg-indigo-600 text-white" : "bg-blue-600 text-white"
          }`}
        >
          {viewAnnual ? "Annual" : "Quarterly"}
        </button>

        <button
          onClick={() => setShowRevenue(!showRevenue)}
          className={`px-3 py-1 rounded ${
            showRevenue ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          Revenue
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
        <button
          onClick={() => setShowPE(!showPE)}
          className={`px-3 py-1 rounded ${
            showPE ? "bg-orange-500 text-white" : "bg-gray-200"
          }`}
        >
          P/E
        </button>
        <button
          onClick={() => setShowEV(!showEV)}
          className={`px-3 py-1 rounded ${
            showEV ? "bg-teal-600 text-white" : "bg-gray-200"
          }`}
        >
          EV
        </button>
        <button
          onClick={() => setShowDebt(!showDebt)}
          className={`px-3 py-1 rounded ${
            showDebt ? "bg-pink-600 text-white" : "bg-gray-200"
          }`}
        >
          Debt
        </button>
        <button
          onClick={() => setShowNetAssets(!showNetAssets)}
          className={`px-3 py-1 rounded ${
            showNetAssets ? "bg-gray-700 text-white" : "bg-gray-200"
          }`}
        >
          Net Assets
        </button>
      </div>

      <div className="w-full h-[480px] bg-gray-50 rounded-xl p-3">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data}>
            <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
            <XAxis dataKey="date" stroke="#17191dff" tick={{ fontSize: 12, fill: "#17191dff" }} />
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
                  pe: "P/E",
                  ev: "Enterprise Value",
                  debt: "Debt",
                  netAssets: "Net Assets",
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
                    case "pe":
                      displayValue = Number(value).toFixed(2);
                      break;
                    case "ev":
                    case "debt":
                    case "netAssets":
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

            {/* Bars */}
            {showRevenue && <Bar yAxisId="left" dataKey="revenue" fill="#2563eb" barSize={20} />}
            {showNetIncome && <Bar yAxisId="left" dataKey="netIncome" fill="#10b981" barSize={20} />}

            {/* Lines */}
            {showEPS && <Line yAxisId="right" type="monotone" dataKey="eps" stroke="#facc15" strokeWidth={2} dot={false} />}
            {showFCF && <Line yAxisId="left" type="monotone" dataKey="fcf" stroke="#9333ea" strokeWidth={2} dot={false} />}
            {showShares && <Line yAxisId="right" type="monotone" dataKey="sharesOutstanding" stroke="#ef4444" strokeWidth={2} dot={false} />}
            {showPE && <Line yAxisId="right" type="monotone" dataKey="pe" stroke="#fb923c" strokeWidth={2} dot={false} />}
            {showEV && <Line yAxisId="left" type="monotone" dataKey="ev" stroke="#14b8a6" strokeWidth={2} dot={false} />}
            {showDebt && <Line yAxisId="left" type="monotone" dataKey="debt" stroke="#ec4899" strokeWidth={2} dot={false} />}
            {showNetAssets && <Line yAxisId="left" type="monotone" dataKey="netAssets" stroke="#374151" strokeWidth={2} dot={false} />}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

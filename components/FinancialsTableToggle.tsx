"use client";
import { useEffect, useState } from "react";

type FinancialRow = {
  period: string; // year for annual, YYYY-MM for quarterly
  revenue: number | null;
  netIncome: number | null;
  eps: number | null;
  operatingMargin: number | null;
  fcf: number | null;
  totalDebt: number | null;
  cash: number | null;
  equity: number | null;
  shares: number | null;
  dividendYield: number | null;
  pe: number | null;
};

function formatNumber(num: number | null, isPercent = false): string {
  if (num === null || num === undefined) return "-";
  if (isPercent) return (num * 100).toFixed(1) + "%";

  const n = Number(num);
  if (isNaN(n)) return "-";

  if (Math.abs(n) >= 1e12) return (n / 1e12).toFixed(2) + "T";
  if (Math.abs(n) >= 1e9) return (n / 1e9).toFixed(2) + "B";
  if (Math.abs(n) >= 1e6) return (n / 1e6).toFixed(2) + "M";
  return n.toLocaleString();
}

export default function FinancialsTableToggle({ ticker }: { ticker: string }) {
  const [rows, setRows] = useState<FinancialRow[]>([]);
  const [view, setView] = useState<"annual" | "quarterly">("annual");

  useEffect(() => {
    async function loadData() {
      try {
        const fundUrl =
          view === "annual"
            ? `/data/fundamentals/${ticker}_annual.json`
            : `/data/fundamentals/${ticker}.json`;

        const [fundRes, balRes, ratioRes] = await Promise.all([
          fetch(fundUrl).then((r) => r.json()),
          fetch(`/data/balance/${ticker}.json`).then((r) => r.json()),
          fetch(`/data/ratios/${ticker}.json`).then((r) => r.json()),
        ]);

        const fundamentals = fundRes || [];
        const balance = balRes || [];
        const ratios = ratioRes || [];

        const merged: FinancialRow[] = fundamentals.map((f: any) => {
          const period =
            view === "annual"
              ? f.calendarYear
              : f.date?.slice(0, 7); // YYYY-MM for quarterly

          const bal = view === "annual"
            ? balance.find((b: any) => b.calendarYear === f.calendarYear) || {}
            : balance.find((b: any) => b.date?.slice(0, 7) === f.date?.slice(0, 7)) || {};

          const r = view === "annual"
            ? ratios.find((ra: any) => ra.calendarYear === f.calendarYear) || {}
            : ratios.find((ra: any) => ra.date?.slice(0, 7) === f.date?.slice(0, 7)) || {};

          return {
            period,
            revenue: f.revenue ?? null,
            netIncome: f.netIncome ?? null,
            eps: f.eps ?? f.epsdiluted ?? null,
            operatingMargin: r.operatingProfitMargin ?? null,
            fcf: f.freeCashFlow ?? null,
            totalDebt: bal.totalDebt ?? null,
            cash: bal.cashAndCashEquivalents ?? null,
            equity: bal.totalStockholdersEquity ?? null,
            shares: f.weightedAverageShsOutDil ?? f.weightedAverageShsOut ?? null,
            dividendYield: r.dividendYield ?? null,
            pe: r.priceEarningsRatio ?? null,
          };
        });

        // sort by period (newest last)
        const sorted = merged.sort((a, b) =>
          a.period > b.period ? 1 : -1
        );

        // slice (annual = 5y, quarterly = last 8)
        const slice = view === "annual" ? sorted.slice(-5) : sorted.slice(-8);

        setRows(slice);
      } catch (err) {
        console.error("Financials toggle load failed:", err);
        setRows([]);
      }
    }

    loadData();
  }, [ticker, view]);

  if (rows.length === 0) {
    return (
      <div className="bg-white shadow rounded-xl p-6 mt-6">
        <h2 className="text-lg font-semibold mb-4">Financials ({view})</h2>
        <p className="text-gray-400">No {view} data available.</p>
      </div>
    );
  }

  const metrics: { key: keyof FinancialRow; label: string; isPercent?: boolean }[] =
    [
      { key: "revenue", label: "Revenue" },
      { key: "netIncome", label: "Net Income" },
      { key: "eps", label: "EPS" },
      { key: "operatingMargin", label: "Operating Margin", isPercent: true },
      { key: "fcf", label: "Free Cash Flow" },
      { key: "totalDebt", label: "Total Debt" },
      { key: "cash", label: "Cash on Hand" },
      { key: "equity", label: "Net Assets (Equity)" },
      { key: "shares", label: "Shares Out." },
      { key: "dividendYield", label: "Dividend Yield", isPercent: true },
      { key: "pe", label: "P/E Ratio" },
    ];

  return (
    <div className="bg-white shadow rounded-xl p-6 mt-6 overflow-x-auto">
      <div className="flex gap-2 mb-4">
        <button
          className={`px-3 py-1 rounded ${
            view === "annual" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
          onClick={() => setView("annual")}
        >
          Annual
        </button>
        <button
          className={`px-3 py-1 rounded ${
            view === "quarterly" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
          onClick={() => setView("quarterly")}
        >
          Quarterly
        </button>
      </div>

      <h2 className="text-lg font-semibold mb-4">
        Financials ({view === "annual" ? "5Y" : "Last 8 Quarters"})
      </h2>

      <table className="w-full text-sm border-collapse">
        <thead>
          <tr>
            <th className="text-left py-2 pr-4 text-gray-600">Metric</th>
            {rows.map((r) => (
              <th key={r.period} className="py-2 px-3 text-right font-medium">
                {r.period}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {metrics.map((m) => (
            <tr key={m.key}>
              <td className="py-2 pr-4 text-gray-600">{m.label}</td>
              {rows.map((r) => (
                <td key={r.period} className="py-2 px-3 text-right font-medium">
                  {formatNumber(r[m.key], m.isPercent)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

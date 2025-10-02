"use client";
import { useEffect, useState } from "react";

interface FinancialRow {
  date?: string; // for quarterly
  calendarYear?: string; // for annual
  revenue?: number;
  netIncome?: number;
  eps?: number;
  operatingIncome?: number;
  totalDebt?: number;
  cashAndCashEquivalents?: number;
  totalStockholdersEquity?: number;
  weightedAverageShsOut?: number;
  priceEarningsRatio?: number;
  freeCashFlow?: number; // merged from cashflow JSON
}

// format billions / millions nicely
function formatNumber(num: number | undefined | null) {
  if (num == null) return "-";
  if (num >= 1e12) return (num / 1e12).toFixed(2) + "T";
  if (num >= 1e9) return (num / 1e9).toFixed(2) + "B";
  if (num >= 1e6) return (num / 1e6).toFixed(2) + "M";
  return num.toFixed(2);
}

export default function FinancialsTable({ ticker }: { ticker: string }) {
  const [view, setView] = useState<"annual" | "quarterly">("annual");
  const [financials, setFinancials] = useState<FinancialRow[]>([]);

  useEffect(() => {
    const fundUrl =
      view === "annual"
        ? `/data/fundamentals/${ticker}_annual.json`
        : `/data/fundamentals/${ticker}.json`;

    const cfUrl = `/data/cashflow/${ticker}.json`;

    Promise.all([
      fetch(fundUrl).then((r) => r.json()),
      fetch(cfUrl).then((r) => r.json()),
    ]).then(([fundData, cfData]) => {
      const slice = view === "annual" ? fundData.slice(0, 5) : fundData.slice(0, 8);
      const cfSlice = view === "annual" ? cfData.slice(0, 5) : cfData.slice(0, 8);

      // merge freeCashFlow into fundamentals rows
      const merged = slice.map((f: any, i: number) => ({
        ...f,
        freeCashFlow: cfSlice[i]?.freeCashFlow ?? null,
      }));

      setFinancials(merged.reverse()); // reverse so latest is last column
    });
  }, [view, ticker]);

  if (!financials.length) return null;

  const headers =
    view === "annual"
      ? financials.map((f) => f.calendarYear)
      : financials.map((f) => f.date?.slice(0, 7)); // YYYY-MM

  return (
    <div className="p-4 bg-white rounded-2xl shadow mt-6 overflow-x-auto">
      {/* Toggle buttons */}
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

      {/* Table */}
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr>
            <th className="text-left p-2">Metric</th>
            {headers.map((h, i) => (
              <th key={i} className="p-2 text-right">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="p-2">Revenue</td>
            {financials.map((f, i) => (
              <td key={i} className="p-2 text-right">
                {formatNumber(f.revenue)}
              </td>
            ))}
          </tr>
          <tr>
            <td className="p-2">Net Income</td>
            {financials.map((f, i) => (
              <td key={i} className="p-2 text-right">
                {formatNumber(f.netIncome)}
              </td>
            ))}
          </tr>
          <tr>
            <td className="p-2">EPS</td>
            {financials.map((f, i) => (
              <td key={i} className="p-2 text-right">
                {f.eps?.toFixed(2) ?? "-"}
              </td>
            ))}
          </tr>
          <tr>
            <td className="p-2">Operating Margin</td>
            {financials.map((f, i) => (
              <td key={i} className="p-2 text-right">
                {f.operatingIncome && f.revenue
                  ? ((f.operatingIncome / f.revenue) * 100).toFixed(1) + "%"
                  : "-"}
              </td>
            ))}
          </tr>
          <tr>
            <td className="p-2">Free Cash Flow</td>
            {financials.map((f, i) => (
              <td key={i} className="p-2 text-right">
                {f.freeCashFlow != null ? formatNumber(f.freeCashFlow) : "-"}
              </td>
            ))}
          </tr>
          <tr>
            <td className="p-2">Total Debt</td>
            {financials.map((f, i) => (
              <td key={i} className="p-2 text-right">
                {formatNumber(f.totalDebt)}
              </td>
            ))}
          </tr>
          <tr>
            <td className="p-2">Cash</td>
            {financials.map((f, i) => (
              <td key={i} className="p-2 text-right">
                {formatNumber(f.cashAndCashEquivalents)}
              </td>
            ))}
          </tr>
          <tr>
            <td className="p-2">Equity</td>
            {financials.map((f, i) => (
              <td key={i} className="p-2 text-right">
                {formatNumber(f.totalStockholdersEquity)}
              </td>
            ))}
          </tr>
          <tr>
            <td className="p-2">Shares Out.</td>
            {financials.map((f, i) => (
              <td key={i} className="p-2 text-right">
                {formatNumber(f.weightedAverageShsOut)}
              </td>
            ))}
          </tr>
          <tr>
            <td className="p-2">P/E Ratio</td>
            {financials.map((f, i) => (
              <td key={i} className="p-2 text-right">
                {f.priceEarningsRatio?.toFixed(2) ?? "-"}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

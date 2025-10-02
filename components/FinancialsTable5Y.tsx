"use client";
import { useEffect, useState } from "react";

type FinancialRow = {
  year: string;
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

export default function FinancialsTable5Y({ ticker }: { ticker: string }) {
  const [rows, setRows] = useState<FinancialRow[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [fundRes, balRes, ratioRes] = await Promise.all([
          fetch(`/data/fundamentals/${ticker}_annual.json`).then((r) => r.json()),
          fetch(`/data/balance/${ticker}.json`).then((r) => r.json()),
          fetch(`/data/ratios/${ticker}.json`).then((r) => r.json()),
        ]);

        const fundamentals = fundRes || [];
        const balance = balRes || [];
        const ratios = ratioRes || [];

        const merged: FinancialRow[] = fundamentals.map((f: any) => {
          const year = f.calendarYear;
          const bal = balance.find((b: any) => b.calendarYear === year) || {};
          const r = ratios.find((ra: any) => ra.calendarYear === year) || {};

          return {
            year,
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

        const sorted = merged.sort((a, b) => Number(b.year) - Number(a.year));
        setRows(sorted.slice(0, 5).reverse());
      } catch (err) {
        console.error("Financials 5Y load failed:", err);
        setRows([]);
      }
    }

    loadData();
  }, [ticker]);

  if (rows.length === 0) {
    return (
      <div className="bg-white shadow rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">Financials (5Y)</h2>
        <p className="text-gray-400">No annual data available.</p>
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
    <div className="bg-white shadow rounded-xl p-6 overflow-x-auto">
      <h2 className="text-lg font-semibold mb-4">Financials (5Y)</h2>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr>
            <th className="text-left py-2 pr-4 text-gray-600">Metric</th>
            {rows.map((r) => (
              <th key={r.year} className="py-2 px-3 text-right font-medium">
                {r.year}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {metrics.map((m) => (
            <tr key={m.key}>
              <td className="py-2 pr-4 text-gray-600">{m.label}</td>
              {rows.map((r) => (
                <td key={r.year} className="py-2 px-3 text-right font-medium">
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

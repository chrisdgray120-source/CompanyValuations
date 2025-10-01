"use client";

type Financials = {
  revenue: number | null;
  netIncome: number | null;
  eps: number | null;
  totalDebt: number | null;
  cash: number | null;
  freeCashFlow: number | null;
};

function formatNumber(num: any): string {
  if (num === null || num === undefined) return "-";

  const n = Number(num);
  if (isNaN(n)) return "-";

  if (Math.abs(n) >= 1e12) return (n / 1e12).toFixed(2) + "T";
  if (Math.abs(n) >= 1e9) return (n / 1e9).toFixed(2) + "B";
  if (Math.abs(n) >= 1e6) return (n / 1e6).toFixed(2) + "M";
  return n.toLocaleString();
}

export default function FinancialsTable({ data }: { data: Financials }) {
  return (
    <div className="bg-white shadow rounded-xl p-6">
      <h2 className="text-lg font-semibold mb-4">Key Financials</h2>
      <table className="w-full text-sm">
        <tbody className="divide-y divide-gray-200">
          <tr>
            <td className="py-2 text-gray-600">Revenue</td>
            <td className="py-2 text-right font-medium">
              {formatNumber(data.revenue)}
            </td>
          </tr>
          <tr>
            <td className="py-2 text-gray-600">Net Income</td>
            <td className="py-2 text-right font-medium">
              {formatNumber(data.netIncome)}
            </td>
          </tr>
          <tr>
            <td className="py-2 text-gray-600">EPS</td>
            <td className="py-2 text-right font-medium">
             {data.eps !== null && data.eps !== undefined
               ? Number(data.eps).toFixed(2)
               : "-"}
            </td>
          </tr>
          <tr>
            <td className="py-2 text-gray-600">Total Debt</td>
            <td className="py-2 text-right font-medium">
              {formatNumber(data.totalDebt)}
            </td>
          </tr>
          <tr>
            <td className="py-2 text-gray-600">Cash</td>
            <td className="py-2 text-right font-medium">
              {formatNumber(data.cash)}
            </td>
          </tr>
          <tr>
            <td className="py-2 text-gray-600">Free Cash Flow</td>
            <td className="py-2 text-right font-medium">
              {formatNumber(data.freeCashFlow)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

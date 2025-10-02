"use client";
import { useEffect, useState } from "react";

type DividendItem = {
  symbol: string;
  date: string;
  paymentDate?: string;
  dividend?: number;
  adjDividend?: number;
};

export default function DividendBox({ ticker }: { ticker: string }) {
  const [upcoming, setUpcoming] = useState<DividendItem[]>([]);
  const [past, setPast] = useState<DividendItem[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        // 🔹 Load global upcoming dividends
        const global: DividendItem[] = await fetch(
          `/data/events/upcomingDividends.json`
        ).then((r) => r.json());

        // Case-insensitive ticker match
        const rawForTicker = (global || []).filter(
          (d) => d.symbol?.toUpperCase() === ticker.toUpperCase()
        );

        // Keep only today or later
        const today = new Date();
        const todayFloor = new Date(today.setHours(0, 0, 0, 0));

        const filteredUpcoming = rawForTicker
          .filter((d) => {
            if (!d.date) return false;
            const exDate = new Date(d.date);
            return exDate >= todayFloor;
          })
          .sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          );

        setUpcoming(filteredUpcoming.slice(0, 5));

        // 🔹 Historic (per-ticker JSON) – guard against missing file
        let list: DividendItem[] = [];
        try {
          const res = await fetch(
            `/data/events/dividendsHistoric/${ticker}.json`
          );
          if (res.ok) {
            const histRes = await res.json();
            list = histRes.historical || (Array.isArray(histRes) ? histRes : []);
          } else {
            console.warn("No dividend file for", ticker);
          }
        } catch (err) {
          console.warn("Dividend fetch error for", ticker, err);
        }

        const twoYearsAgo = new Date();
        twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

        const history = list
          .filter((d) => {
            const dDate = new Date(d.date);
            return dDate >= twoYearsAgo && dDate <= new Date();
          })
          .sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          );

        setPast(history);
      } catch (err) {
        console.error("❌ DividendBox load error:", err);
        setUpcoming([]);
        setPast([]);
      }
    }

    loadData();
  }, [ticker]);

  const next = upcoming[0];
  const last = past.length > 0 ? past[past.length - 1] : null;

  return (
    <div className="bg-white shadow rounded-xl p-6 mt-6">
      <h2 className="text-lg font-semibold mb-4">Dividends</h2>

      {/* Summary line */}
      {next ? (
        <p className="mb-4 text-sm text-gray-700">
          Next ex-dividend: <b>{next.date}</b>{" "}
          ({next.dividend ?? next.adjDividend ?? "-"} / share)
        </p>
      ) : last ? (
        <p className="mb-4 text-sm text-gray-500">
          No upcoming dividend announced. Last ex-dividend: <b>{last.date}</b>{" "}
          ({last.dividend ?? last.adjDividend ?? "-"} / share)
        </p>
      ) : (
        <p className="mb-4 text-sm text-gray-400">
          This company does not currently pay dividends.
        </p>
      )}

      {/* Upcoming table */}
      {upcoming.length > 0 && (
        <>
          <h3 className="font-medium mb-2">Upcoming</h3>
          <table className="w-full text-sm border-collapse mb-6">
            <thead>
              <tr className="text-gray-500">
                <th className="text-left py-1 pr-2">Ex-Date</th>
                <th className="text-right py-1 px-2">Pay Date</th>
                <th className="text-right py-1 px-2">Amount</th>
              </tr>
            </thead>
            <tbody>
              {upcoming.map((d, i) => (
                <tr
                  key={`up-${i}`}
                  className={`border-t ${
                    i === 0 ? "bg-blue-50 font-semibold" : ""
                  }`}
                >
                  <td className="py-1 pr-2">{d.date}</td>
                  <td className="py-1 px-2 text-right">
                    {d.paymentDate ?? "-"}
                  </td>
                  <td className="py-1 px-2 text-right">
                    {d.dividend != null
                      ? `$${d.dividend.toFixed(2)}`
                      : d.adjDividend != null
                      ? `$${d.adjDividend.toFixed(2)}`
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* Past dividends */}
      {past.length > 0 && (
        <>
          <h3 className="font-medium mb-2">Past 2 Years</h3>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-gray-500">
                <th className="text-left py-1 pr-2">Ex-Date</th>
                <th className="text-right py-1 px-2">Pay Date</th>
                <th className="text-right py-1 px-2">Amount</th>
              </tr>
            </thead>
            <tbody>
              {past.map((d, i) => (
                <tr key={`past-${i}`} className="border-t">
                  <td className="py-1 pr-2">{d.date}</td>
                  <td className="py-1 px-2 text-right">
                    {d.paymentDate ?? "-"}
                  </td>
                  <td className="py-1 px-2 text-right">
                    {d.dividend != null
                      ? `$${d.dividend.toFixed(2)}`
                      : d.adjDividend != null
                      ? `$${d.adjDividend.toFixed(2)}`
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

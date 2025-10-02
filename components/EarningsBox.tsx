"use client";
import { useEffect, useState } from "react";

type EarningsItem = {
  symbol: string;
  date: string;
  eps?: number | null;
  epsEstimated?: number | null;
  time?: string;
  revenue?: number | null;
  revenueEstimated?: number | null;
};

export default function EarningsBox({ ticker }: { ticker: string }) {
  const [upcoming, setUpcoming] = useState<EarningsItem[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        // 🔹 Load per-ticker earnings file
        const data: EarningsItem[] = await fetch(
          `/data/events/earnings/${ticker}.json`
        ).then((r) => r.json());

        const today = new Date();
        const todayFloor = new Date(today.setHours(0, 0, 0, 0));

        // 🔹 Keep only today or later
        const future = (data || [])
          .filter((d) => d.date && new Date(d.date) >= todayFloor)
          .sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          );

        setUpcoming(future);
      } catch (err) {
        console.error("❌ EarningsBox load error:", err);
        setUpcoming([]);
      }
    }

    loadData();
  }, [ticker]);

  const next = upcoming[0];

  return (
    <div className="bg-white shadow rounded-xl p-6 mt-6">
      <h2 className="text-lg font-semibold mb-4">Earnings</h2>

      {next ? (
        <p className="mb-4 text-sm text-gray-700">
          Next earnings: <b>{next.date}</b>
          {next.epsEstimated != null && (
            <> (Est. EPS {next.epsEstimated.toFixed(2)})</>
          )}
        </p>
      ) : (
        <p className="mb-4 text-sm text-gray-400">
          No upcoming earnings date announced.
        </p>
      )}

      {upcoming.length > 1 && (
        <>
          <h3 className="font-medium mb-2">Upcoming Dates</h3>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-gray-500">
                <th className="text-left py-1 pr-2">Date</th>
                <th className="text-right py-1 px-2">Est. EPS</th>
              </tr>
            </thead>
            <tbody>
              {upcoming.slice(0, 3).map((d, i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="py-1 pr-2">{d.date}</td>
                  <td className="py-1 px-2 text-right">
                    {d.epsEstimated != null ? d.epsEstimated.toFixed(2) : "-"}
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

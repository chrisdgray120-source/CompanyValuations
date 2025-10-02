// app/api/quote/[ticker]/route.ts
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: { ticker: string } }
) {
  const { ticker } = params;
  const apiKey = process.env.FMP_API_KEY;

  try {
    const resp = await fetch(
      `https://financialmodelingprep.com/api/v3/quote/${ticker.toUpperCase()}?apikey=${apiKey}`,
      { cache: "no-store" }
    );
    if (!resp.ok) {
      return NextResponse.json(
        { error: `FMP API error: ${resp.status}` },
        { status: resp.status }
      );
    }

    const data = await resp.json();
    const q = data?.[0] || {};

    return NextResponse.json({
      symbol: q.symbol ?? ticker.toUpperCase(),
      price: q.price ?? null,
      change: q.change ?? q.changes ?? null,
      changePercent: q.changesPercentage ?? null,
      marketCap: q.marketCap ?? q.mktCap ?? null,
      dayLow: q.dayLow ?? null,
      dayHigh: q.dayHigh ?? null,
      yearLow: q.yearLow ?? null,
      yearHigh: q.yearHigh ?? null,
      volume: q.volume ?? null,
      exchange: q.exchange ?? null,
      open: q.open ?? null,
      previousClose: q.previousClose ?? null,
      timestamp: q.timestamp ?? Date.now() / 1000,
    });
  } catch (err) {
    console.error("Quote fetch failed:", err);
    return NextResponse.json(
      { error: "Failed to fetch quote" },
      { status: 500 }
    );
  }
}

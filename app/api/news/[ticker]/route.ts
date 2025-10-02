import { NextResponse } from "next/server";
console.log("FMP_API_KEY in API route:", process.env.FMP_API_KEY);
const API_KEY = process.env.FMP_API_KEY;

export async function GET(
  _req: Request,
  { params }: { params: { ticker: string } }
) {
  const { ticker } = params;

  try {
    const resp = await fetch(
      `https://financialmodelingprep.com/api/v3/stock_news?tickers=${ticker.toUpperCase()}&limit=20&apikey=${API_KEY}`,
      { cache: "no-store" }
    );

    if (!resp.ok) {
      return NextResponse.json({ error: "Failed to fetch news" }, { status: resp.status });
    }

    const data = await resp.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("News fetch failed:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

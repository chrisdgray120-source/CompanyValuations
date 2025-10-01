import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  context: { params: Promise<{ ticker: string }> }
) {
  const { ticker } = await context.params; // ✅ await params
  const upperTicker = ticker.toUpperCase();

  const url = `https://financialmodelingprep.com/api/v3/profile/${upperTicker}?apikey=${process.env.FMP_API_KEY}`;

  try {
    const r = await fetch(url, { cache: "no-store" });
    if (!r.ok) {
      return NextResponse.json({ error: "Failed to fetch profile" }, { status: r.status });
    }
    const data = await r.json();
    return NextResponse.json(data, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Error fetching profile" }, { status: 500 });
  }
}

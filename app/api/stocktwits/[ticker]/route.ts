import { NextResponse } from "next/server";

const CACHE: Record<string, { data: any; timestamp: number }> = {};
const CACHE_TTL = 30 * 1000; // 30 seconds

export async function GET(
  _req: Request,
  { params }: { params: { ticker: string } }
) {
  const { ticker } = params;
  const now = Date.now();

  // return cached if not expired
  if (CACHE[ticker] && now - CACHE[ticker].timestamp < CACHE_TTL) {
    return NextResponse.json(CACHE[ticker].data);
  }

  try {
    const resp = await fetch(
      `https://api.stocktwits.com/api/2/streams/symbol/${ticker}.json`
    );
    if (!resp.ok) {
      return NextResponse.json({ error: "Failed to fetch" }, { status: resp.status });
    }

    const data = await resp.json();

    // cache it
    CACHE[ticker] = { data, timestamp: now };

    return NextResponse.json(data);
  } catch (err) {
    console.error("Stocktwits fetch failed:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

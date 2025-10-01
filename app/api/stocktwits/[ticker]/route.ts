import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { ticker: string } }
) {
  const ticker = params.ticker.toUpperCase().replace(/^\$/, ""); // strip $ if present
  const { searchParams } = new URL(req.url);
  const max = searchParams.get("max"); // <-- support pagination

  // Build Stocktwits URL with optional ?max
  const base = `https://api.stocktwits.com/api/2/streams/symbol/${ticker}.json`;
  const url = max ? `${base}?max=${encodeURIComponent(max)}` : base;

  try {
    const r = await fetch(url, { cache: "no-store" });
    if (!r.ok) {
      // pass through status but return empty list so UI doesn't crash
      return NextResponse.json({ messages: [], cursor: null }, { status: r.status });
    }
    const data = await r.json();
    return NextResponse.json(
      { messages: data.messages ?? [], cursor: data.cursor ?? null },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json({ messages: [], cursor: null }, { status: 200 });
  }
}

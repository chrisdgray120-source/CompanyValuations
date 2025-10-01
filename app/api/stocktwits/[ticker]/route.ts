import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  context: { params: Promise<{ ticker: string }> }
) {
  const { ticker } = await context.params; // ✅ await params
  const upperTicker = ticker.toUpperCase().replace(/^\$/, ""); // strip leading $

  const { searchParams } = new URL(req.url);
  const max = searchParams.get("max");
  const url = max
    ? `https://api.stocktwits.com/api/2/streams/symbol/${upperTicker}.json?max=${max}`
    : `https://api.stocktwits.com/api/2/streams/symbol/${upperTicker}.json`;

  try {
    const r = await fetch(url, { cache: "no-store" });
    if (!r.ok) {
      return NextResponse.json({ messages: [] }, { status: r.status });
    }
    const data = await r.json();
    return NextResponse.json(
      {
        messages: data.messages ?? [],
        cursor: data.cursor ?? null,
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json({ messages: [], cursor: null }, { status: 200 });
  }
}

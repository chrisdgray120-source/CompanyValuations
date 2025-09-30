import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: { ticker: string } }
) {
  const ticker = params.ticker.toUpperCase().replace(/^\$/, ""); // strip $ if present
  const url = `https://api.stocktwits.com/api/2/streams/symbol/${ticker}.json`;

  try {
    const r = await fetch(url, { cache: "no-store" });
    if (!r.ok) {
      // pass through status but return empty list so UI doesn't crash
      return NextResponse.json({ messages: [] }, { status: r.status });
    }
    const data = await r.json();
    return NextResponse.json({ messages: data.messages ?? [] }, { status: 200 });
  } catch {
    return NextResponse.json({ messages: [] }, { status: 200 });
  }
}

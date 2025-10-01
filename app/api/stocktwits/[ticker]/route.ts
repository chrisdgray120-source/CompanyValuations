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
      return NextResponse.json({ messages: [], cursor: null }, { status: r.status });
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
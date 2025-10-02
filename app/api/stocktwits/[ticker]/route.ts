import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { ticker: string } }
) {
  const { ticker } = params;

  const url = `https://api.stocktwits.com/api/2/streams/symbol/${ticker}.json`;

  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      return NextResponse.json({ error: `Stocktwits error ${res.status}` }, { status: res.status });
    }
    const data = await res.json();
    return NextResponse.json(data || {});
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { ticker: string } }
) {
  const { ticker } = params;
  const apiKey = process.env.FMP_API_KEY;

  const url = `https://financialmodelingprep.com/api/v3/stock_news?tickers=${ticker}&limit=20&apikey=${apiKey}`;

  try {
    const res = await fetch(url, { next: { revalidate: 300 } }); // cache 5 min
    if (!res.ok) {
      return NextResponse.json({ error: `FMP error ${res.status}` }, { status: res.status });
    }
    const data = await res.json();
    return NextResponse.json(data || []);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

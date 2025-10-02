import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { ticker: string } }
) {
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const ticker = params.ticker.toUpperCase();
  const apiKey = process.env.FMP_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "Missing FMP_API_KEY" }, { status: 500 });
  }

  let url = `https://financialmodelingprep.com/api/v3/historical-price-full/${ticker}?serietype=line&apikey=${apiKey}`;
  if (from && to) {
    url += `&from=${from}&to=${to}`;
  }

  const res = await fetch(url);
  if (!res.ok) {
    return NextResponse.json({ error: "Failed to fetch from FMP" }, { status: 500 });
  }

  const data = await res.json();
  return NextResponse.json(data);
}

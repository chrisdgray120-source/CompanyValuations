import { NextResponse } from "next/server";

const API_KEY = process.env.FMP_API_KEY; // put your key in .env.local

export async function GET(
  _req: Request,
  { params }: { params: { ticker: string } }
) {
  const ticker = params.ticker.toUpperCase();
  const url = `https://financialmodelingprep.com/api/v4/income-statement?symbol=${upperTicker}&limit=1&period=annual&apikey=${process.env.FMP_API_KEY}`;


  try {
    const r = await fetch(url, { cache: "no-store" });
    if (!r.ok) {
      return NextResponse.json({ error: "Failed to fetch data" }, { status: r.status });
    }
    const data = await r.json();
    const latest = data[0];

    return NextResponse.json({
      revenue: latest?.revenue ?? null,
      netIncome: latest?.netIncome ?? null,
      eps: latest?.eps ?? null,
      totalDebt: latest?.totalDebt ?? null,
      cash: latest?.cashAndCashEquivalents ?? null,
      freeCashFlow: latest?.freeCashFlow ?? null,
    });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
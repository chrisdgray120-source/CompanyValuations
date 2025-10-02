// app/api/financials/[ticker]/route.ts
import { NextRequest } from "next/server";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "public", "data");

export async function GET(
  req: NextRequest,
  { params }: { params: { ticker: string } }
) {
  const ticker = params.ticker.toUpperCase();

  try {
    // fundamentals (quarterly)
    const fundPath = path.join(DATA_DIR, "fundamentals", `${ticker}.json`);
    const fundamentals = JSON.parse(fs.readFileSync(fundPath, "utf8"));

    // balance sheet
    const balancePath = path.join(DATA_DIR, "balance", `${ticker}.json`);
    const balance = JSON.parse(fs.readFileSync(balancePath, "utf8"));

    // latest rows (usually index 0 is most recent)
    const latestFund = fundamentals[0] || {};
    const latestBalance = balance[0] || {};

    const snapshot = {
      revenue: latestFund.revenue ?? null,
      netIncome: latestFund.netIncome ?? null,
      eps: latestFund.eps ?? null,
      freeCashFlow: latestFund.fcf ?? null,
      totalDebt: latestBalance.totalDebt ?? latestBalance.shortTermDebt ?? null,
      cash:
        latestBalance.cashAndCashEquivalents ??
        latestBalance.cash ??
        null,
    };

    return Response.json(snapshot, {
      headers: { "Cache-Control": "s-maxage=600" }, // 10-min cache
    });
  } catch (e: any) {
    return new Response(
      `Error loading financials for ${ticker}: ${e.message}`,
      { status: 500 }
    );
  }
}

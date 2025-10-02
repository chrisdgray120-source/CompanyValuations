// scripts/fetchFundamentals.ts
import "dotenv/config";
import fs from "fs/promises";
import path from "path";

const apiKey = process.env.FMP_API_KEY!;
if (!apiKey) throw new Error("Missing FMP_API_KEY in .env.local");

// 🟢 Change this list to whichever tickers you want
const tickers = ["AAPL", "MSFT"];

async function fetchJSON(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed: ${url}`);
  return res.json();
}

async function fetchFundamentals(ticker: string, period: "quarter" | "annual") {
  // Income Statement
  const incomeUrl = `https://financialmodelingprep.com/api/v3/income-statement/${ticker}?period=${period}&limit=40&apikey=${apiKey}`;
  const income = await fetchJSON(incomeUrl);

  // Cash Flow
  const cashUrl = `https://financialmodelingprep.com/api/v3/cash-flow-statement/${ticker}?period=${period}&limit=40&apikey=${apiKey}`;
  const cash = await fetchJSON(cashUrl);

  // Balance Sheet
  const bsUrl = `https://financialmodelingprep.com/api/v3/balance-sheet-statement/${ticker}?period=${period}&limit=40&apikey=${apiKey}`;
  const bs = await fetchJSON(bsUrl);

  // Shares Outstanding (historical)
  const sharesUrl = `https://financialmodelingprep.com/api/v4/historical/shares_float/${ticker}?apikey=${apiKey}`;
  const shares = await fetchJSON(sharesUrl);

  // Enterprise Values
  const evUrl = `https://financialmodelingprep.com/api/v3/enterprise-values/${ticker}?period=${period}&limit=40&apikey=${apiKey}`;
  const ev = await fetchJSON(evUrl);

  // Historical prices (needed for PE)
  const priceUrl = `https://financialmodelingprep.com/api/v3/historical-price-full/${ticker}?apikey=${apiKey}&serietype=line`;
  const prices = await fetchJSON(priceUrl);

  return income.map((row: any) => {
    const cashRow = cash.find((c: any) => c.date === row.date);
    const bsRow = bs.find((b: any) => b.date === row.date);
    const sharesRow = shares.find((s: any) => s.date === row.date);
    const evRow = ev.find((e: any) => e.date === row.date);
    const priceRow = prices.historical.find((p: any) => p.date === row.date);

    const eps = row.eps ?? 0;
    const price = priceRow?.close ?? evRow?.stockPrice ?? 0;
    const sharesOutstanding = sharesRow?.sharesOutstanding ?? evRow?.numberOfShares ?? 0;
    const marketCap = price * sharesOutstanding;

    return {
      date: row.date,
      revenue: row.revenue ?? 0,
      netIncome: row.netIncome ?? 0,
      eps,
      fcf: cashRow?.freeCashFlow ?? 0,
      sharesOutstanding,
      totalDebt: bsRow?.totalDebt ?? 0,
      totalAssets: bsRow?.totalAssets ?? 0,
      totalLiabilities: bsRow?.totalLiabilities ?? 0,
      netAssets: bsRow?.totalAssets && bsRow?.totalLiabilities
        ? bsRow.totalAssets - bsRow.totalLiabilities
        : 0,
      marketCap,
      enterpriseValue: evRow?.enterpriseValue ??
        (marketCap + (bsRow?.totalDebt ?? 0) - (bsRow?.cashAndShortTermInvestments ?? 0)),
      peRatio: eps > 0 ? price / eps : 0,
      debtToAssets: bsRow?.totalAssets ? (bsRow.totalDebt ?? 0) / bsRow.totalAssets : 0,
    };
  });
}

async function run() {
  for (const ticker of tickers) {
    console.log(`Fetching fundamentals for ${ticker}...`);

    const quarterly = await fetchFundamentals(ticker, "quarter");
    const annual = await fetchFundamentals(ticker, "annual");

    const outDir = path.join(process.cwd(), "public", "data", "fundamentals");
    await fs.mkdir(outDir, { recursive: true });

    await fs.writeFile(
      path.join(outDir, `${ticker}.json`),
      JSON.stringify(quarterly, null, 2)
    );
    await fs.writeFile(
      path.join(outDir, `${ticker}_annual.json`),
      JSON.stringify(annual, null, 2)
    );

    console.log(
      `Saved ${ticker}: ${quarterly.length} quarters, ${annual.length} years`
    );
  }
}

run().catch(console.error);

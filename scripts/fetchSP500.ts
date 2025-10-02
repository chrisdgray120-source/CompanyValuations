import "dotenv/config";
import fetch from "node-fetch"; // if Node18+, you can drop this and just use global fetch
import { writeFileSync } from "fs";
import { join } from "path";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchProfile(symbol: string, apiKey: string) {
  const url = `https://financialmodelingprep.com/api/v3/profile/${symbol}?apikey=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return data[0];
}

async function main() {
  const apiKey = process.env.FMP_API_KEY;
  if (!apiKey) {
    console.error("❌ Missing FMP_API_KEY in environment");
    process.exit(1);
  }

  const url = `https://financialmodelingprep.com/api/v3/sp500_constituent?apikey=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch S&P500 list: HTTP ${res.status}`);
  }

  const tickers: { symbol: string }[] = await res.json();
  const results: any[] = [];

  for (const { symbol } of tickers) {
    try {
      const profile = await fetchProfile(symbol, apiKey);

      // ✅ Overwrite logo_url to use local cached logo
      profile.logo_url = `/logos/${symbol}.png`;

      results.push(profile);
      console.log(`✅ Saved ${symbol}`);
    } catch (err) {
      console.warn(`⚠️ Failed ${symbol}: ${err}`);
    }

    await sleep(400); // throttle to avoid 429
  }

  const outPath = join(process.cwd(), "public", "data", "sp500.json");
  writeFileSync(outPath, JSON.stringify(results, null, 2));
  console.log(`🎉 Done. Saved ${results.length} companies to ${outPath}`);
}

main().catch((err) => {
  console.error("❌ Fatal error", err);
  process.exit(1);
});

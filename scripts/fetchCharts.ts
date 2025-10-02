import dotenv from "dotenv";
dotenv.config({ path: ".env" }); // or ".env" if you renamed

import { mkdirSync, existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

const API_KEY = process.env.FMP_API_KEY;
if (!API_KEY) {
  console.error("❌ Missing FMP_API_KEY in .env.local/.env");
  process.exit(1);
}

// how many trading days to pull (2000 ~ ~8 years, 1500 ~ ~6 years, etc.)
const TIMESERIES = 2000; 

const BASE = "https://financialmodelingprep.com/api/v3";
const CHARTS_DIR = join(process.cwd(), "public", "data", "charts");
const SP500_PATH = join(process.cwd(), "public", "data", "sp500.json");

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function getJson<T = any>(url: string): Promise<T> {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`HTTP ${r.status} for ${url}`);
  return r.json() as Promise<T>;
}

type PriceRow = { date: string; close: number };

function mergeSeries(existing: PriceRow[], incoming: PriceRow[]): PriceRow[] {
  // dedupe by date, prefer latest incoming value
  const map = new Map<string, number>();

  for (const row of existing) {
    if (row?.date && typeof row?.close === "number") {
      map.set(row.date, row.close);
    }
  }
  for (const row of incoming) {
    if (row?.date && typeof row?.close === "number") {
      map.set(row.date, row.close);
    }
  }
  // return ASC by date (Recharts-friendly)
  return [...map.entries()]
    .map(([date, close]) => ({ date, close }))
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
}

async function fetchTickerHistory(symbol: string) {
  // Use timeseries param to limit payload size
  const url = `${BASE}/historical-price-full/${symbol}?timeseries=${TIMESERIES}&apikey=${API_KEY}`;
  const data = await getJson<any>(url);

  if (!data?.historical?.length) {
    throw new Error("No historical data");
  }
  // FMP returns newest → oldest; normalize to ASC & compact
  const compact: PriceRow[] = data.historical
    .map((d: any) => ({
      date: d.date,     // "YYYY-MM-DD"
      close: Number(d.close),
    }))
    .filter((d: PriceRow) => d.date && Number.isFinite(d.close))
    .reverse();

  return compact;
}

async function run() {
  mkdirSync(CHARTS_DIR, { recursive: true });

  const list = JSON.parse(readFileSync(SP500_PATH, "utf-8")) as Array<{ ticker?: string; symbol?: string }>;
  const tickers = list.map((c) => c.ticker || c.symbol).filter(Boolean) as string[];

  console.log(`📈 Fetching history for ${tickers.length} tickers (timeseries=${TIMESERIES})`);

  let ok = 0, fail = 0;

  for (const symbol of tickers) {
    const out = join(CHARTS_DIR, `${symbol}.json`);

    try {
      // existing file → merge incrementally
      const existing: PriceRow[] = existsSync(out)
        ? JSON.parse(readFileSync(out, "utf-8"))
        : [];

      const incoming = await fetchTickerHistory(symbol);
      const merged = mergeSeries(existing, incoming);

      writeFileSync(out, JSON.stringify(merged, null, 2));
      console.log(`✅ ${symbol} (${merged.length} rows)`);

      ok++;
    } catch (e: any) {
      console.warn(`⚠️ ${symbol} failed: ${e?.message || e}`);
      fail++;
    }

    // throttle to avoid 429s (tune if you hit limits)
    await sleep(450);
  }

  console.log(`\n🎉 Done. OK: ${ok}  ❌ Failed: ${fail}  → ${CHARTS_DIR}`);
}

run().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});

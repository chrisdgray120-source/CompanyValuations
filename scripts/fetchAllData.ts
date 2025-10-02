import "dotenv/config";
import fs from "fs";
import fsp from "fs/promises";
import path from "path";

const sp500Path = path.join(process.cwd(), "public/data/sp500.json");
const sp500Raw = await fsp.readFile(sp500Path, "utf-8");
const sp500 = JSON.parse(sp500Raw);
const tickers: string[] = sp500
  .map((c: any) => c.ticker)
  .filter((t: string | null) => !!t);

const apiKey = process.env.FMP_API_KEY!;
if (!apiKey) throw new Error("❌ Missing FMP_API_KEY in .env.local");

// how many tickers to fetch in parallel
const BATCH_SIZE = 2;
// delay between batches (ms)
const BATCH_DELAY = 8000;
// checkpoint file for resume
const checkpointFile = "scripts/fetchAllData_checkpoint.json";

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// 🔹 Retry wrapper with exponential backoff
async function fetchJSON(url: string, retries = 3, backoff = 500): Promise<any> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    } catch (err) {
      console.warn(`⚠️ Fetch failed (${url}), attempt ${i + 1}/${retries}`);
      if (i < retries - 1) await delay(backoff * (i + 1));
      else throw err;
    }
  }
}

// save helper
async function saveJSON(dir: string, file: string, data: any) {
  await fsp.mkdir(dir, { recursive: true });
  await fsp.writeFile(path.join(dir, file), JSON.stringify(data, null, 2));
}

// resume helpers
async function loadCheckpoint(): Promise<number> {
  if (fs.existsSync(checkpointFile)) {
    const content = await fsp.readFile(checkpointFile, "utf-8");
    try {
      const parsed = JSON.parse(content);
      return parsed.index ?? 0;
    } catch {
      return 0;
    }
  }
  return 0;
}
async function saveCheckpoint(index: number) {
  await fsp.writeFile(checkpointFile, JSON.stringify({ index }, null, 2));
}

// 🔹 Fetch Part 1 for a ticker (core data)
async function fetchCoreForTicker(ticker: string) {
  try {
    // Profile
    {
      const url = `https://financialmodelingprep.com/api/v3/profile/${ticker}?apikey=${apiKey}`;
      const arr = await fetchJSON(url);
      const profile = arr[0] || {};
      await saveJSON("public/data/profiles", `${ticker}.json`, profile);
    }

    // Historical Prices
    {
      const url = `https://financialmodelingprep.com/api/v3/historical-price-full/${ticker}?serietype=line&apikey=${apiKey}`;
      const data = await fetchJSON(url);
      await saveJSON("public/data/historical", `${ticker}.json`, data);
    }

    // Quarterly Fundamentals
    {
      const url = `https://financialmodelingprep.com/api/v3/income-statement/${ticker}?period=quarter&limit=120&apikey=${apiKey}`;
      const data = await fetchJSON(url);
      await saveJSON("public/data/fundamentals", `${ticker}.json`, data);
    }

    // Annual Fundamentals
    {
      const url = `https://financialmodelingprep.com/api/v3/income-statement/${ticker}?period=annual&limit=40&apikey=${apiKey}`;
      const data = await fetchJSON(url);
      await saveJSON("public/data/fundamentals", `${ticker}_annual.json`, data);
    }

    // Balance Sheet
    {
      const url = `https://financialmodelingprep.com/api/v3/balance-sheet-statement/${ticker}?period=quarter&limit=120&apikey=${apiKey}`;
      const data = await fetchJSON(url);
      await saveJSON("public/data/balance", `${ticker}.json`, data);
    }

    return true;
  } catch (err) {
    console.error(`❌ Error fetching core for ${ticker}:`, err);
    return false;
  }
}

// 🔹 Fetch Part 2 for a ticker (secondary data)
async function fetchExtraForTicker(ticker: string) {
  try {
    // Enterprise Values
    {
      const url = `https://financialmodelingprep.com/api/v3/enterprise-values/${ticker}?period=quarter&limit=120&apikey=${apiKey}`;
      const data = await fetchJSON(url);
      await saveJSON("public/data/ev", `${ticker}.json`, data);
    }

    // Ratios
    {
      const url = `https://financialmodelingprep.com/api/v3/ratios/${ticker}?period=quarter&limit=120&apikey=${apiKey}`;
      const data = await fetchJSON(url);
      await saveJSON("public/data/ratios", `${ticker}.json`, data);
    }

    // Earnings Calendar
    {
      const url = `https://financialmodelingprep.com/api/v3/historical/earning_calendar/${ticker}?limit=40&apikey=${apiKey}`;
      const data = await fetchJSON(url);
      await saveJSON("public/data/events/earnings", `${ticker}.json`, data);
    }

    // Historic Dividends (per ticker)
    {
      const url = `https://financialmodelingprep.com/api/v3/historical-price-full/stock_dividend/${ticker}?apikey=${apiKey}`;
      const data = await fetchJSON(url);
      await saveJSON("public/data/events/dividendsHistoric", `${ticker}.json`, data);
    }

    return true;
  } catch (err) {
    console.error(`❌ Error fetching extra for ${ticker}:`, err);
    return false;
  }
}

// 🔹 Fetch all upcoming dividends once (global file)
async function fetchUpcomingDividends() {
  try {
    const url = `https://financialmodelingprep.com/api/v3/stock_dividend_calendar?apikey=${apiKey}`;
    const data = await fetchJSON(url);
    await saveJSON("public/data/events", "upcomingDividends.json", data);
    console.log("✅ Saved global dividendsUpcoming.json");
  } catch (err) {
    console.error("❌ Error fetching upcoming dividends:", err);
  }
}

// 🔹 Main loop with batching, resume, throttle
async function run() {
  console.log(`\n🚀 Fetching data for ${tickers.length} tickers...\n`);

  let startIndex = await loadCheckpoint();
  if (startIndex > 0) {
    console.log(`🔄 Resuming from index ${startIndex} (${tickers[startIndex]})`);
  }

  // Pass 1: core data
  console.log("\n=== Pass 1: Core Data (profiles, fundamentals, balance) ===\n");
  for (let i = startIndex; i < tickers.length; i += BATCH_SIZE) {
    const batch = tickers.slice(i, i + BATCH_SIZE);
    console.log(`\n📦 Batch ${i + 1} – ${i + batch.length}...`);
    const results = await Promise.all(batch.map((t) => fetchCoreForTicker(t)));
    results.forEach((ok, j) =>
      console.log(`[${i + j + 1}/${tickers.length}] ${ok ? "✅" : "❌"} ${batch[j]}`)
    );
    await saveCheckpoint(i + BATCH_SIZE);
    await delay(BATCH_DELAY);
  }

  // Reset checkpoint for pass 2
  await saveCheckpoint(0);

  // Pass 2: extra data
  console.log("\n=== Pass 2: Extra Data (EV, ratios, earnings, dividends) ===\n");
  for (let i = 0; i < tickers.length; i += BATCH_SIZE) {
    const batch = tickers.slice(i, i + BATCH_SIZE);
    console.log(`\n📦 Batch ${i + 1} – ${i + batch.length}...`);
    const results = await Promise.all(batch.map((t) => fetchExtraForTicker(t)));
    results.forEach((ok, j) =>
      console.log(`[${i + j + 1}/${tickers.length}] ${ok ? "✅" : "❌"} ${batch[j]}`)
    );
    await delay(BATCH_DELAY);
  }

  // Fetch upcoming dividends once
  await fetchUpcomingDividends();

  console.log("\n🎉 All done!");
  await fsp.unlink(checkpointFile).catch(() => {});
}

run();

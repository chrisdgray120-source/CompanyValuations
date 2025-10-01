import "dotenv/config";
import { writeFileSync, mkdirSync, existsSync, readFileSync } from "fs";
import { join } from "path";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchLogo(symbol: string, destPath: string) {
  const url = `https://images.financialmodelingprep.com/symbol/${symbol}.png`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  const buffer = await res.arrayBuffer();
  writeFileSync(destPath, Buffer.from(buffer));
}

async function main() {
  // ensure folder exists
  const logosDir = join(process.cwd(), "public", "logos");
  mkdirSync(logosDir, { recursive: true });

  // ✅ use import instead of require
  const sp500Path = join(process.cwd(), "public", "data", "sp500.json");
  const sp500 = JSON.parse(readFileSync(sp500Path, "utf-8"));

  let success = 0;
  let failed = 0;

  for (const company of sp500) {
    const ticker = company.symbol || company.ticker;
    const dest = join(logosDir, `${ticker}.png`);

    // skip if already downloaded
    if (existsSync(dest)) {
      console.log(`⏩ Skipped ${ticker} (already exists)`);
      continue;
    }

    try {
      await fetchLogo(ticker, dest);
      console.log(`✅ Saved logo for ${ticker}`);
      success++;
    } catch (err) {
      console.warn(`⚠️ Failed logo for ${ticker}: ${err}`);
      failed++;
    }

    await sleep(200); // throttle to avoid 429
  }

  console.log(
    `🎉 Done. Saved ${success} logos, failed ${failed}. Stored in ${logosDir}`
  );
}

main().catch((err) => {
  console.error("❌ Fatal error", err);
  process.exit(1);
});
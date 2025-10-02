import "dotenv/config";
import fs from "fs/promises";
import path from "path";

const apiKey = process.env.FMP_API_KEY!;
const tickers = ["AAPL", "MSFT"];

async function run() {
  for (const ticker of tickers) {
    console.log(`Fetching historical prices for ${ticker}...`);
    const url = `https://financialmodelingprep.com/api/v3/historical-price-full/${ticker}?serietype=line&apikey=${apiKey}`;
    const res = await fetch(url);
    const data = await res.json();

    const outDir = path.join(process.cwd(), "public", "data", "historical");
    await fs.mkdir(outDir, { recursive: true });

    await fs.writeFile(
      path.join(outDir, `${ticker}.json`),
      JSON.stringify(data, null, 2)
    );

    console.log(`Saved ${ticker} with ${data.historical.length} daily points`);
  }
}

run().catch(console.error);

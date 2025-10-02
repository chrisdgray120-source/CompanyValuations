import "dotenv/config";
import fsp from "fs/promises";
import path from "path";

const apiKey = process.env.FMP_API_KEY!;

async function fetchProfile(ticker: string) {
  const url = `https://financialmodelingprep.com/api/v3/profile/${ticker}?apikey=${apiKey}`;
  const res = await fetch(url);
  const data = await res.json();
  return data?.[0] || null;
}

async function run() {
  const sp500Path = path.join(process.cwd(), "public/data/sp500.json");
  const raw = await fsp.readFile(sp500Path, "utf-8");
  const sp500 = JSON.parse(raw);

  for (const { ticker } of sp500) {
    console.log(`Fetching profile for ${ticker}...`);
    const profile = await fetchProfile(ticker);
    if (profile) {
      const outPath = path.join(process.cwd(), "public/data/profiles", `${ticker}.json`);
      await fsp.writeFile(outPath, JSON.stringify(profile, null, 2));
    }
    await new Promise((r) => setTimeout(r, 300)); // throttle
  }
}

run();

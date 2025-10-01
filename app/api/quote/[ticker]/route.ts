import { NextResponse } from "next/server";
import yahooFinance from "yahoo-finance2";

export async function GET(
  _req: Request,
  context: { params: Promise<{ ticker: string }> }
) {
  const { ticker } = await context.params;

  try {
    const quote = await yahooFinance.quote(ticker.toUpperCase());

    return NextResponse.json({
      symbol: quote.symbol,
      name: quote.shortName || quote.longName,
      price: quote.regularMarketPrice,
      change: quote.regularMarketChange,
      changePercent: quote.regularMarketChangePercent,
      volume: quote.regularMarketVolume,
      dayLow: quote.regularMarketDayLow,
      dayHigh: quote.regularMarketDayHigh,
      yearLow: quote.fiftyTwoWeekLow,
      yearHigh: quote.fiftyTwoWeekHigh,
      marketCap: quote.marketCap,
      priceAvg50: quote.fiftyDayAverage,
      priceAvg200: quote.twoHundredDayAverage,
      exchange: quote.fullExchangeName,
      open: quote.regularMarketOpen,
      previousClose: quote.regularMarketPreviousClose,
      timestamp: quote.regularMarketTime,
    });
  } catch (err) {
    console.error("Quote fetch failed:", err);
    return NextResponse.json(
      { error: "Failed to fetch quote" },
      { status: 500 }
    );
  }
}

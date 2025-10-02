"use client";

type QuoteProps = {
  quote: any;
  profile: any;
  ticker: string;
  formatNumber: (num: number | null) => string;
};

export default function QuoteBox({ quote, profile, ticker, formatNumber }: QuoteProps) {
  return (
    <div className="bg-white shadow rounded-xl p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left = Quote data */}
        <div>
          {quote ? (
            <>
              <p className="mb-2">
                <strong>Price:</strong>{" "}
                {quote?.price != null ? `$${quote.price.toFixed(2)}` : "-"}
              </p>
              <p
                className={`mb-2 font-medium ${
                  quote?.change != null && quote.change >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {quote?.change != null && quote?.changePercent != null ? (
                  <>
                    {quote.change >= 0 ? "▲" : "▼"} {quote.change.toFixed(2)} (
                    {quote.changePercent.toFixed(2)}%)
                  </>
                ) : (
                  "-"
                )}
              </p>
              <p className="mb-2">
                <strong>Market Cap:</strong>{" "}
                {quote?.marketCap ? formatNumber(quote.marketCap) : "-"}
              </p>
              <p className="mb-2">
                <strong>Day Range:</strong>{" "}
                {quote?.dayLow != null && quote?.dayHigh != null
                  ? `${quote.dayLow} – ${quote.dayHigh}`
                  : "-"}
              </p>
              <p className="mb-2">
                <strong>52W Range:</strong>{" "}
                {quote?.yearLow != null && quote?.yearHigh != null
                  ? `${quote.yearLow} – ${quote.yearHigh}`
                  : "-"}
              </p>
              <p className="mb-2">
                <strong>Volume:</strong>{" "}
                {quote?.volume ? quote.volume.toLocaleString() : "-"}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {quote?.exchange ?? "-"} · delayed at{" "}
                {quote?.timestamp
                  ? new Date(quote.timestamp * 1000).toLocaleString()
                  : "N/A"}
              </p>
            </>
          ) : (
            <p className="text-gray-500">No quote data available.</p>
          )}
        </div>

        {/* Right = Profile info */}
        <div className="text-sm space-y-2">
          {profile?.ceo && (
            <p>
              <strong>CEO:</strong> {profile.ceo}
            </p>
          )}
          {profile?.fullTimeEmployees && (
            <p>
              <strong>Employees:</strong> {profile.fullTimeEmployees}
            </p>
          )}
          {profile?.sector && (
            <p>
              <strong>Sector:</strong> {profile.sector}
            </p>
          )}
          {profile?.industry && (
            <p>
              <strong>Industry:</strong> {profile.industry}
            </p>
          )}
          {profile?.sharesOutstanding && (
            <p>
              <strong>Shares Outstanding:</strong>{" "}
              {profile.sharesOutstanding.toLocaleString()}
            </p>
          )}
          {profile?.ipoDate && (
            <p>
              <strong>IPO Date:</strong>{" "}
              {new Date(profile.ipoDate).toLocaleDateString()}
            </p>
          )}
          {profile?.earningsAnnouncement && (
            <p>
              <strong>Earnings Date:</strong>{" "}
              {new Date(profile.earningsAnnouncement).toLocaleDateString()}
            </p>
          )}
          {profile?.website && (
            <p>
              <strong>Website:</strong>{" "}
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {profile.website}
              </a>
            </p>
          )}
          {profile?.address && (
            <p>
              <strong>HQ:</strong> {profile.address}, {profile.city},{" "}
              {profile.state}, {profile.country}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

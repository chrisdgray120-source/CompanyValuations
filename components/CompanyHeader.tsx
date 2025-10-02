"use client";
import Image from "next/image";

type Props = {
  ticker: string;
  profile: any;
  ytdChange: number | null;
};

export default function CompanyHeader({ ticker, profile, ytdChange }: Props) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3">
      <div className="flex items-center space-x-3">
        <Image
          src={`/logos/${ticker}.png`}
          alt={`${profile?.companyName ?? ticker} logo`}
          width={40}
          height={40}
          className="rounded"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/logos/_fallback.png";
          }}
        />
        <h1 className="text-2xl font-bold text-gray-900">
          {profile?.companyName ?? ticker} ({ticker}) — Market Cap &amp; Valuation
        </h1>

        {/* 🔹 YTD badge */}
        {ytdChange != null && (
          <span
            className={`ml-2 px-2 py-1 text-sm rounded font-semibold ${
              ytdChange >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}
          >
            {ytdChange >= 0 ? "▲" : "▼"} {ytdChange.toFixed(1)}% YTD
          </span>
        )}
      </div>
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";

export default function NewsFeed({ ticker }: { ticker: string }) {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/news/${ticker}`)
      .then((res) => res.json())
      .then((data) => setNews(data || []))
      .catch(() => setNews([]))
      .finally(() => setLoading(false));
  }, [ticker]);

  if (loading) {
    return (
      <div className="bg-white shadow rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-2">Latest News</h2>
        <p className="text-gray-500">Loading news...</p>
      </div>
    );
  }

  if (!news.length) {
    return (
      <div className="bg-white shadow rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-2">Latest News</h2>
        <p className="text-gray-500">No news available.</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-xl p-6">
      <h2 className="text-lg font-semibold mb-2">Latest News</h2>
      <ul className="divide-y divide-gray-200">
        {news.map((n, i) => (
          <li key={i} className="py-3">
            <a
              href={n.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 font-medium hover:underline"
            >
              {n.title}
            </a>
            <p className="text-xs text-gray-500">
              {new Date(n.publishedDate).toLocaleString()} · {n.site}
            </p>
            <p className="text-sm text-gray-700 mt-1 line-clamp-3">{n.text}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

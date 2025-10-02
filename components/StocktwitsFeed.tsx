"use client";
import { useState } from "react";

type StocktwitsFeedProps = {
  feed: any[];
  cursor: any | null;
  onLoadMore: () => Promise<void>;
  loadingMore: boolean;
};

export default function StocktwitsFeed({
  feed,
  cursor,
  onLoadMore,
  loadingMore,
}: StocktwitsFeedProps) {
  if (!feed || feed.length === 0) {
    return (
      <div className="bg-white shadow rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-2">Stocktwits Feed</h2>
        <p className="text-gray-500">No messages available.</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-xl p-6">
      <h2 className="text-lg font-semibold mb-2">Stocktwits Feed</h2>
      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
        {feed.map((msg: any) => (
          <div
            key={msg.id}
            className="border-b border-gray-200 pb-2 last:border-b-0"
          >
            <div className="flex items-center space-x-2 mb-1">
              <img
                src={msg.user?.avatar_url}
                alt={msg.user?.username}
                className="w-6 h-6 rounded-full"
              />
              <span className="font-semibold text-sm">
                {msg.user?.username}
              </span>
              <span className="text-xs text-gray-400">
                {new Date(msg.created_at).toLocaleString()}
              </span>
            </div>
            <p className="text-sm text-gray-800">{msg.body}</p>
          </div>
        ))}
      </div>

      {/* Load more button */}
      {cursor?.more && (
        <div className="flex justify-center mt-4">
          <button
            onClick={onLoadMore}
            disabled={loadingMore}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loadingMore ? "Loading..." : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}

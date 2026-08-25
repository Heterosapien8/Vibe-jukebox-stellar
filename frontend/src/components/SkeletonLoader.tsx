'use client';

import React from 'react';

export const SongCardSkeleton: React.FC = () => {
  return (
    <div className="relative rounded-lg p-3.5 bg-[#120718] border border-white/5 animate-pulse">
      <div className="flex items-center justify-between gap-3">
        {/* Left: Slot & Art & Text */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Selector slot badge */}
          <div className="w-9 h-9 rounded bg-[#1e0d26] flex-shrink-0" />

          {/* Album artwork */}
          <div className="w-12 h-12 rounded bg-[#200e2b] flex-shrink-0" />

          {/* Text lines */}
          <div className="space-y-2 flex-1 min-w-0">
            <div className="h-4 w-40 bg-[#251032] rounded" />
            <div className="h-3 w-28 bg-[#1a0c24] rounded" />
          </div>
        </div>

        {/* Right: Vote counter & Push button */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="w-16 h-9 rounded bg-[#1a0c24]" />
          <div className="w-24 h-9 rounded bg-[#2a1036]" />
        </div>
      </div>
    </div>
  );
};

export const SongQueueSkeleton: React.FC<{ count?: number }> = ({ count = 5 }) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, idx) => (
        <SongCardSkeleton key={idx} />
      ))}
    </div>
  );
};

export const NowPlayingSkeleton: React.FC = () => {
  return (
    <div className="w-full max-w-xl mx-auto p-4 rounded-xl bg-[#fdfaf3] border-2 border-[#92400e] animate-pulse flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-[#3d1d0c]" />
        <div className="space-y-2">
          <div className="h-3 w-24 bg-[#e2d4c0] rounded" />
          <div className="h-4 w-36 bg-[#c4b5a0] rounded" />
          <div className="h-3 w-28 bg-[#d8caa8] rounded" />
        </div>
      </div>
      <div className="w-16 h-10 bg-[#e2d4c0] rounded" />
    </div>
  );
};

export const StatsSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 my-6">
      {Array.from({ length: 4 }).map((_, idx) => (
        <div key={idx} className="p-4 rounded-lg bg-[#0d0612] border border-white/5 animate-pulse space-y-2">
          <div className="h-3 w-20 bg-[#1e0d26] rounded" />
          <div className="h-6 w-16 bg-[#2a1236] rounded" />
          <div className="h-2.5 w-24 bg-[#180a20] rounded" />
        </div>
      ))}
    </div>
  );
};

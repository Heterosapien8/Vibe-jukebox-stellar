'use client';

import React from 'react';

export const SongCardSkeleton: React.FC = () => {
  return (
    <div className="relative rounded-xl sm:rounded-2xl p-3 sm:p-3.5 bg-[#13091b] border border-white/10 animate-pulse">
      <div className="flex items-center justify-between gap-3">
        {/* Left: Badge & Art & Text */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Rank badge */}
          <div className="w-10 h-10 rounded-lg bg-[#1e0d26] flex-shrink-0" />

          {/* Album artwork */}
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-lg bg-[#200e2b] flex-shrink-0" />

          {/* Text lines */}
          <div className="space-y-2 flex-1 min-w-0">
            <div className="h-4 w-36 sm:w-44 bg-[#251032] rounded" />
            <div className="h-3 w-24 sm:w-32 bg-[#1a0c24] rounded" />
          </div>
        </div>

        {/* Right: Vote box & Push button */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="w-20 sm:w-24 h-10 rounded-lg bg-[#1a0c24]" />
          <div className="w-28 sm:w-32 h-10 rounded-lg bg-[#2a1036]" />
        </div>
      </div>
    </div>
  );
};

export const SongQueueSkeleton: React.FC<{ count?: number }> = ({ count = 5 }) => {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: count }).map((_, idx) => (
        <SongCardSkeleton key={idx} />
      ))}
    </div>
  );
};

export const NowPlayingSkeleton: React.FC = () => {
  return (
    <div className="w-full max-w-xl mx-auto px-4 sm:px-6 py-3.5 sm:py-4 rounded-2xl bg-[#faf7f0] border border-[#ebdcc5] animate-pulse flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 sm:gap-4 flex-1">
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#3d1d0c] flex-shrink-0" />
        <div className="space-y-2 flex-1">
          <div className="h-5 w-40 bg-[#c4b5a0] rounded" />
          <div className="h-3.5 w-28 bg-[#d8caa8] rounded" />
        </div>
      </div>
      <div className="w-20 h-10 border-l border-[#e4d5bc] pl-4 space-y-1.5 flex flex-col justify-center">
        <div className="h-2 w-12 bg-[#d8caa8] rounded" />
        <div className="h-4 w-14 bg-[#c4b5a0] rounded" />
      </div>
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

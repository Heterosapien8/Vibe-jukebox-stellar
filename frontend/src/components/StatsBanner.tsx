'use client';

import React, { useState, useEffect } from 'react';
import { JukeboxStats } from '@/types';
import {
  FireIcon,
  CircleStackIcon,
  MusicalNoteIcon,
  ClockIcon,
} from '@heroicons/react/24/solid';

interface StatsBannerProps {
  stats: JukeboxStats;
  topSongTitle?: string;
  topSongVotes?: number;
}

export const StatsBanner: React.FC<StatsBannerProps> = ({
  stats,
  topSongTitle,
  topSongVotes,
}) => {
  const [resetCountdown, setResetCountdown] = useState<string>('');

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      // Reset at midnight UTC
      const nextMidnight = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0));
      const diff = nextMidnight.getTime() - now.getTime();

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);
      setResetCountdown(`${hours}h ${mins}m ${secs < 10 ? '0' : ''}${secs}s`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 my-6">
      {/* Flashcard 1: TOTAL VOTES - Solid Hot Pink Card */}
      <div className="p-4 sm:p-5 rounded-xl bg-[#be123c] text-white shadow-lg flex flex-col justify-between select-none">
        <div className="flex items-center justify-between mb-2">
          <span className="font-display text-xs sm:text-sm font-bold uppercase tracking-wider text-white">
            TOTAL VOTES
          </span>
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <FireIcon className="w-4 h-4 text-white" />
          </div>
        </div>
        <div className="my-1 flex items-baseline gap-2">
          <span className="font-display text-2xl sm:text-3xl lg:text-4xl font-black text-white">
            {stats.totalVotes.toLocaleString()}
          </span>
          <span className="font-display text-sm font-bold text-white/90">VIBE</span>
        </div>
        <span className="font-display text-xs text-white/80 mt-1 block truncate">
          Burned on Soroban
        </span>
      </div>

      {/* Flashcard 2: NODE TIPS - Solid Teal/Cyan Card */}
      <div className="p-4 sm:p-5 rounded-xl bg-[#0e7490] text-white shadow-lg flex flex-col justify-between select-none">
        <div className="flex items-center justify-between mb-2">
          <span className="font-display text-xs sm:text-sm font-bold uppercase tracking-wider text-white">
            NODE TIPS
          </span>
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <CircleStackIcon className="w-4 h-4 text-white" />
          </div>
        </div>
        <div className="my-1 flex items-baseline gap-2">
          <span className="font-display text-2xl sm:text-3xl lg:text-4xl font-black text-white">
            {stats.totalXlmTipped.toFixed(1)}
          </span>
          <span className="font-display text-sm font-bold text-white/90">XLM</span>
        </div>
        <span className="font-display text-xs text-white/80 mt-1 block truncate">
          Horizon Settlement
        </span>
      </div>

      {/* Flashcard 3: QUEUE TRACKS - Solid Royal Purple Card */}
      <div className="p-4 sm:p-5 rounded-xl bg-[#6d28d9] text-white shadow-lg flex flex-col justify-between select-none">
        <div className="flex items-center justify-between mb-2">
          <span className="font-display text-xs sm:text-sm font-bold uppercase tracking-wider text-white">
            QUEUE TRACKS
          </span>
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <MusicalNoteIcon className="w-4 h-4 text-white" />
          </div>
        </div>
        <div className="my-1 flex items-baseline gap-2">
          <span className="font-display text-2xl sm:text-3xl lg:text-4xl font-black text-white">
            {stats.activeTracks}
          </span>
          <span className="font-display text-sm font-bold text-white/90">Songs</span>
        </div>
        <span className="font-display text-xs text-white/80 mt-1 block truncate">
          Lead: {topSongTitle || 'Neon Odyssey'} ({topSongVotes || 0} v)
        </span>
      </div>

      {/* Flashcard 4: DAILY RESET - Solid Golden Amber Card */}
      <div className="p-4 sm:p-5 rounded-xl bg-[#b45309] text-white shadow-lg flex flex-col justify-between select-none">
        <div className="flex items-center justify-between mb-2">
          <span className="font-display text-xs sm:text-sm font-bold uppercase tracking-wider text-white">
            DAILY RESET
          </span>
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <ClockIcon className="w-4 h-4 text-white" />
          </div>
        </div>
        <div className="my-1 flex items-baseline gap-2">
          <span className="font-display text-xl sm:text-2xl lg:text-3xl font-black text-white">
            {resetCountdown || '23h 59m'}
          </span>
        </div>
        <span className="font-display text-xs text-white/80 mt-1 block truncate">
          Standings rollover
        </span>
      </div>
    </div>
  );
};

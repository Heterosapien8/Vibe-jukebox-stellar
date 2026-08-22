'use client';

import React, { useState, useEffect } from 'react';
import { Flame, Coins, Music, Clock, Zap } from 'lucide-react';
import { JukeboxStats } from '@/types';

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
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 my-6">
      {/* Stat 1: Total Votes Cast */}
      <div className="p-4 rounded-2xl bg-surface/70 border border-slate-800/80 backdrop-blur-xl hover:border-neon-cyan/40 transition-all group">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Total Votes</span>
          <Flame className="w-4 h-4 text-neon-cyan group-hover:scale-110 transition-transform" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-black text-white font-mono tracking-tight">
            {stats.totalVotes.toLocaleString()}
          </span>
          <span className="text-xs font-bold text-neon-cyan">VIBE</span>
        </div>
        <span className="text-[10px] text-slate-400 mt-1 block">Burned on Soroban Contract</span>
      </div>

      {/* Stat 2: Total XLM Tipped */}
      <div className="p-4 rounded-2xl bg-surface/70 border border-slate-800/80 backdrop-blur-xl hover:border-neon-magenta/40 transition-all group">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Tips to Node</span>
          <Coins className="w-4 h-4 text-neon-magenta group-hover:scale-110 transition-transform" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-black text-white font-mono tracking-tight">
            {stats.totalXlmTipped.toFixed(1)}
          </span>
          <span className="text-xs font-bold text-neon-magenta">XLM</span>
        </div>
        <span className="text-[10px] text-slate-400 mt-1 block">Settled on Stellar Horizon</span>
      </div>

      {/* Stat 3: Active Catalog Queue */}
      <div className="p-4 rounded-2xl bg-surface/70 border border-slate-800/80 backdrop-blur-xl hover:border-neon-purple/40 transition-all group">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Queue Tracks</span>
          <Music className="w-4 h-4 text-neon-purple group-hover:scale-110 transition-transform" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-black text-white font-mono tracking-tight">
            {stats.activeTracks}
          </span>
          <span className="text-xs font-medium text-slate-400">Songs</span>
        </div>
        <span className="text-[10px] text-neon-purple font-medium mt-1 block truncate">
          Lead: {topSongTitle || 'Neon Odyssey'} ({topSongVotes || 0} v)
        </span>
      </div>

      {/* Stat 4: Soft-Reset Rollover Clock */}
      <div className="p-4 rounded-2xl bg-surface/70 border border-slate-800/80 backdrop-blur-xl hover:border-neon-amber/40 transition-all group">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Daily Soft Reset</span>
          <Clock className="w-4 h-4 text-neon-amber group-hover:scale-110 transition-transform" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-xl font-black text-neon-amber font-mono tracking-tight">
            {resetCountdown || '23h 59m'}
          </span>
        </div>
        <span className="text-[10px] text-slate-400 mt-1 block">Clears standings if active</span>
      </div>
    </div>
  );
};

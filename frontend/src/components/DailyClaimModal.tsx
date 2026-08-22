'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { soundFX } from '@/lib/sound';
import { Sparkles, Clock, CheckCircle2, X, Gift, Flame } from 'lucide-react';

interface DailyClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  canClaim: boolean;
  lastClaimTime: number;
  onClaim: () => Promise<void>;
  isLoading: boolean;
}

export const DailyClaimModal: React.FC<DailyClaimModalProps> = ({
  isOpen,
  onClose,
  canClaim,
  lastClaimTime,
  onClaim,
  isLoading,
}) => {
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    if (canClaim || !lastClaimTime) return;

    const interval = setInterval(() => {
      const resetTime = lastClaimTime + 86400 * 1000;
      const diff = resetTime - Date.now();

      if (diff <= 0) {
        setTimeLeft('Ready now!');
        clearInterval(interval);
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${hours}h ${mins}m ${secs < 10 ? '0' : ''}${secs}s`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [canClaim, lastClaimTime]);

  const handleClaimClick = async () => {
    try {
      await onClaim();
      soundFX.playClaimFanfare();
      // Blast confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00f0ff', '#ff007f', '#a855f7', '#ffb300'],
      });
    } catch (e) {
      console.error(e);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="relative max-w-md w-full glass-panel-magenta rounded-2xl p-6 border border-neon-magenta/40 shadow-neon-magenta/30 overflow-hidden">
        {/* Hologram scanline */}
        <div className="scanline" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Badge */}
        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-neon-magenta to-neon-purple flex items-center justify-center shadow-neon-magenta/50 mb-4">
          <Gift className="w-6 h-6 text-white" />
        </div>

        <h3 className="text-xl font-black text-white tracking-wide flex items-center gap-2">
          Daily VIBE Drop <Sparkles className="w-5 h-5 text-neon-amber animate-pulse" />
        </h3>
        <p className="text-sm text-slate-300 mt-1">
          Every connected Stellar wallet is entitled to claim <span className="text-neon-cyan font-bold">100 free VIBE testnet tokens</span> once every 24 hours to upvote songs on the live queue.
        </p>

        {/* Reward Card */}
        <div className="mt-5 p-4 rounded-xl bg-surface/80 border border-slate-700/60 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400">Available Reward</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-black text-neon-cyan">+100</span>
              <span className="text-xs font-bold text-slate-300">VIBE</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neon-magenta/10 border border-neon-magenta/30 text-neon-magenta text-xs font-bold">
            <Flame className="w-3.5 h-3.5" /> 24h Cooldown
          </div>
        </div>

        {/* Action / Countdown */}
        <div className="mt-6">
          {canClaim ? (
            <button
              onClick={handleClaimClick}
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-neon-magenta via-neon-purple to-neon-cyan text-white font-black text-sm uppercase tracking-wider shadow-neon-magenta hover:opacity-95 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span>Minting 100 VIBE...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Claim 100 VIBE Now</span>
                </>
              )}
            </button>
          ) : (
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
              <div className="flex items-center justify-center gap-2 text-xs text-slate-400 mb-1">
                <Clock className="w-4 h-4 text-neon-amber" />
                <span>Next claim unlocked in:</span>
              </div>
              <span className="text-base font-mono font-bold text-neon-amber">{timeLeft || 'Calculating...'}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

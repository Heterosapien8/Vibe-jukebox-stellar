'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { soundFX } from '@/lib/sound';
import {
  GiftIcon,
  ClockIcon,
  FireIcon,
  XMarkIcon,
} from '@heroicons/react/24/solid';

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
        colors: ['#31e6e0', '#ff2d6d', '#b83bf6', '#ffb84d'],
      });
    } catch (e) {
      console.error(e);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative max-w-md w-full bg-[#120718] rounded-xl p-6 border-2 border-neon-amber/50 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 text-text-secondary hover:text-white p-1"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>

        {/* Header Badge */}
        <div className="w-12 h-12 rounded bg-[#2b1705] border border-neon-amber flex items-center justify-center mb-3 text-neon-amber">
          <GiftIcon className="w-6 h-6" />
        </div>

        <h3 className="font-mono text-lg font-black text-white tracking-wide uppercase">
          Daily 100 VIBE Token Drop
        </h3>
        <p className="text-xs text-text-secondary mt-1 font-sans">
          Every connected Stellar wallet can claim <span className="text-neon-cyan font-bold">100 free VIBE testnet tokens</span> once every 24 hours to upvote songs on the live jukebox queue.
        </p>

        {/* Reward Dispenser Box */}
        <div className="mt-4 p-4 rounded bg-[#09030e] border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase font-bold text-text-secondary">
              Available Drop Reward
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5 font-mono">
              <span className="text-3xl font-black text-neon-cyan">+100</span>
              <span className="text-xs font-bold text-text-secondary">VIBE</span>
            </div>
          </div>
          <div className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#291705] text-neon-amber text-[10px] font-mono font-bold uppercase">
            <FireIcon className="w-3.5 h-3.5" /> 24h Timer
          </div>
        </div>

        {/* Action / Countdown */}
        <div className="mt-5">
          {canClaim ? (
            <button
              onClick={handleClaimClick}
              disabled={isLoading}
              type="button"
              className="w-full py-3.5 px-4 rounded bg-[#ffb84d] hover:bg-[#ffa726] text-slate-950 font-mono font-black text-xs uppercase tracking-wider transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span>Minting 100 VIBE on Soroban...</span>
              ) : (
                <>
                  <GiftIcon className="w-4 h-4" />
                  <span>Claim 100 Free VIBE Now</span>
                </>
              )}
            </button>
          ) : (
            <div className="p-3.5 rounded bg-[#09030e] border border-white/10 text-center">
              <div className="flex items-center justify-center gap-1.5 text-xs text-text-secondary mb-1">
                <ClockIcon className="w-3.5 h-3.5 text-neon-amber" />
                <span className="font-mono">Next claim unlocks in:</span>
              </div>
              <span className="text-base font-mono font-bold text-neon-amber">{timeLeft || 'Calculating...'}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

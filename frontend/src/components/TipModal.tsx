'use client';

import React, { useState } from 'react';
import { soundFX } from '@/lib/sound';
import { JUKEBOX_HOST_NODE_ADDRESS, getStellarExpertTxUrl } from '@/lib/stellar';
import { Coins, Heart, Loader2, ExternalLink, X, AlertCircle } from 'lucide-react';

interface TipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendTip: (amountXlm: string, memo: string) => Promise<string>;
  userXlmBalance: string;
}

const PRESET_AMOUNTS = ['5', '10', '25', '50'];

export const TipModal: React.FC<TipModalProps> = ({
  isOpen,
  onClose,
  onSendTip,
  userXlmBalance,
}) => {
  const [amount, setAmount] = useState<string>('10');
  const [memo, setMemo] = useState<string>('VIBE Jukebox Love');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [stepMessage, setStepMessage] = useState<string>('');

  const handleTipSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setTxHash(null);

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid positive XLM amount.');
      return;
    }

    const availableXlm = parseFloat(userXlmBalance) || 0;
    if (numAmount > availableXlm) {
      setError(`Insufficient XLM balance. You currently have ${userXlmBalance} XLM.`);
      return;
    }

    try {
      setIsLoading(true);
      setStepMessage('Building Stellar transaction XDR...');
      
      const hash = await onSendTip(amount, memo);
      setTxHash(hash);
      soundFX.playCoinTip();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Failed to submit tip transaction.');
    } finally {
      setIsLoading(false);
      setStepMessage('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="relative max-w-lg w-full glass-panel rounded-2xl p-6 border border-neon-cyan/40 shadow-neon-cyan/30 overflow-hidden">
        {/* Hologram scanline */}
        <div className="scanline" />

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-neon-cyan to-neon-blue flex items-center justify-center text-slate-950 font-black shadow-neon-cyan/50">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              Tip the Jukebox <Heart className="w-4 h-4 text-neon-magenta fill-neon-magenta" />
            </h3>
            <p className="text-xs text-slate-400">
              Send native testnet XLM directly on the Stellar blockchain to support the node.
            </p>
          </div>
        </div>

        {/* Destination Info */}
        <div className="mt-4 p-3 rounded-xl bg-surface/90 border border-slate-800 text-xs text-slate-300">
          <div className="flex justify-between items-center text-[11px] text-slate-400 mb-1">
            <span>Treasury Destination (Stellar Testnet)</span>
            <span className="text-neon-emerald font-mono">Verified Node</span>
          </div>
          <p className="font-mono text-neon-cyan break-all text-[11px]">
            {JUKEBOX_HOST_NODE_ADDRESS}
          </p>
        </div>

        {/* Success State */}
        {txHash ? (
          <div className="mt-5 p-4 rounded-xl bg-emerald-950/70 border border-neon-emerald text-emerald-100 animate-in fade-in">
            <h4 className="text-sm font-bold text-neon-emerald flex items-center gap-1.5">
              <span>Payment Confirmed on Stellar!</span>
            </h4>
            <p className="text-xs text-slate-300 mt-1">
              Thank you! Your tip of <span className="font-bold text-white">{amount} XLM</span> was successfully settled.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <a
                href={getStellarExpertTxUrl(txHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-900/60 hover:bg-emerald-800/80 border border-emerald-500/40 text-xs font-semibold text-neon-emerald transition-colors"
              >
                <span>View on Stellar Expert</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <button
                onClick={() => {
                  setTxHash(null);
                  onClose();
                }}
                className="text-xs text-slate-400 hover:text-white px-2 py-1.5"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleTipSubmit} className="mt-5 space-y-4">
            {/* Amount Presets */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Select XLM Amount (Your balance: {userXlmBalance} XLM)
              </label>
              <div className="grid grid-cols-4 gap-2">
                {PRESET_AMOUNTS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAmount(preset)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                      amount === preset
                        ? 'bg-neon-cyan/20 border-neon-cyan text-neon-cyan shadow-neon-cyan/30'
                        : 'bg-surface-raised border-slate-700/60 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    {preset} XLM
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Amount */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Custom Amount
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter XLM amount"
                  className="w-full bg-surface-raised border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan"
                />
                <span className="absolute right-3.5 top-2.5 text-xs font-bold text-slate-400 font-mono">
                  XLM
                </span>
              </div>
            </div>

            {/* Memo */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                On-chain Memo (Optional, max 28 chars)
              </label>
              <input
                type="text"
                maxLength={28}
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="Message attached to transaction"
                className="w-full bg-surface-raised border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-neon-cyan"
              />
            </div>

            {/* Error banner */}
            {error && (
              <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-600/60 text-xs text-rose-200 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <span className="break-words">{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-neon-cyan to-neon-blue text-slate-950 font-black text-sm uppercase tracking-wider shadow-neon-cyan hover:opacity-95 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>{stepMessage || 'Signing & Submitting...'}</span>
                </>
              ) : (
                <>
                  <Coins className="w-4 h-4" />
                  <span>Send {amount || '0'} XLM Tip</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

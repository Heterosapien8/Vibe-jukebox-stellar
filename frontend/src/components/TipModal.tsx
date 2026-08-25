'use client';

import React, { useState } from 'react';
import { soundFX } from '@/lib/sound';
import { JUKEBOX_HOST_NODE_ADDRESS, getStellarExpertTxUrl } from '@/lib/stellar';
import {
  CircleStackIcon,
  HeartIcon,
  ArrowTopRightOnSquareIcon,
  XMarkIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/solid';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative max-w-lg w-full bg-[#120718] rounded-xl p-6 border-2 border-neon-cyan/40 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 text-text-secondary hover:text-white p-1"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded bg-[#0b1e24] border border-neon-cyan flex items-center justify-center text-neon-cyan font-black">
            <CircleStackIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-mono text-base font-black text-white flex items-center gap-2 uppercase tracking-wide">
              <span>Tip the Jukebox Node</span>
              <HeartIcon className="w-4 h-4 text-neon-pink" />
            </h3>
            <p className="text-xs text-text-secondary">
              Deposit testnet XLM directly onto the Stellar blockchain to support the jukebox node.
            </p>
          </div>
        </div>

        {/* Destination Info */}
        <div className="mt-3 p-3 rounded bg-[#08030d] border border-white/10 text-xs text-text-secondary">
          <div className="flex justify-between items-center text-[10px] font-mono mb-1">
            <span className="text-text-secondary uppercase">Treasury Destination</span>
            <span className="text-neon-emerald font-bold">Stellar Testnet Node</span>
          </div>
          <p className="font-mono text-neon-cyan break-all text-[11px] bg-[#140b1e] p-1.5 rounded">
            {JUKEBOX_HOST_NODE_ADDRESS}
          </p>
        </div>

        {/* Success State */}
        {txHash ? (
          <div className="mt-5 p-4 rounded bg-[#081a14] border border-neon-emerald text-emerald-100">
            <h4 className="text-sm font-bold text-neon-emerald">
              Payment Confirmed on Stellar!
            </h4>
            <p className="text-xs text-slate-300 mt-1">
              Thank you! Your tip of <span className="font-bold text-white">{amount} XLM</span> was successfully settled.
            </p>
            <div className="mt-3 flex items-center gap-2 font-mono">
              <a
                href={getStellarExpertTxUrl(txHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-[#00ff9d] text-slate-950 text-xs font-bold transition-colors"
              >
                <span>View on Stellar Expert</span>
                <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={() => {
                  setTxHash(null);
                  onClose();
                }}
                type="button"
                className="text-xs text-text-secondary hover:text-white px-2 py-1.5"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleTipSubmit} className="mt-4 space-y-3.5">
            {/* Amount Presets */}
            <div>
              <label className="block text-xs font-mono font-bold text-text-secondary mb-1.5 uppercase">
                Select Amount (Your balance: {userXlmBalance} XLM)
              </label>
              <div className="grid grid-cols-4 gap-2 font-mono">
                {PRESET_AMOUNTS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAmount(preset)}
                    className={`py-2 px-3 rounded text-xs font-bold transition-colors ${
                      amount === preset
                        ? 'bg-[#31e6e0] text-slate-950 shadow-sm'
                        : 'bg-[#1a0c24] text-text-secondary hover:text-white'
                    }`}
                  >
                    {preset} XLM
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Amount */}
            <div>
              <label className="block text-xs font-mono font-semibold text-text-secondary mb-1">
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
                  className="w-full bg-[#08030d] border border-white/20 rounded px-3.5 py-2 text-sm text-white font-mono placeholder-text-secondary/50 focus:outline-none focus:border-neon-cyan"
                />
                <span className="absolute right-3.5 top-2 text-xs font-bold text-text-secondary font-mono">
                  XLM
                </span>
              </div>
            </div>

            {/* Memo */}
            <div>
              <label className="block text-xs font-mono font-semibold text-text-secondary mb-1">
                On-chain Memo (Optional, max 28 chars)
              </label>
              <input
                type="text"
                maxLength={28}
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="Message attached to transaction"
                className="w-full bg-[#08030d] border border-white/20 rounded px-3.5 py-2 text-xs text-white placeholder-text-secondary/50 focus:outline-none focus:border-neon-cyan font-mono"
              />
            </div>

            {/* Error banner */}
            {error && (
              <div className="p-3 rounded bg-[#2a070f] border border-led-red/60 text-xs text-rose-200 flex items-start gap-2">
                <ExclamationCircleIcon className="w-4 h-4 text-led-red flex-shrink-0 mt-0.5" />
                <span className="break-words font-mono">{error}</span>
              </div>
            )}

            {/* Submit Button (Solid Cyan) */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded bg-[#31e6e0] hover:bg-[#20c2bc] text-slate-950 font-mono font-black text-sm uppercase tracking-wider transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span>{stepMessage || 'Signing & Submitting...'}</span>
              ) : (
                <>
                  <CircleStackIcon className="w-4 h-4" />
                  <span>Deposit {amount || '0'} XLM Tip</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

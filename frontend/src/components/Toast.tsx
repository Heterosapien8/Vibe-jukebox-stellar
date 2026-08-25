'use client';

import React from 'react';
import { TxFeedback } from '@/types';
import { getStellarExpertTxUrl } from '@/lib/stellar';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowTopRightOnSquareIcon,
  XMarkIcon,
} from '@heroicons/react/24/solid';

interface ToastProps {
  feedback: TxFeedback | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ feedback, onClose }) => {
  if (!feedback) return null;

  const isSuccess = feedback.status === 'success';
  const isError = feedback.status === 'error';
  const isLoading = feedback.status === 'preparing' || feedback.status === 'signing' || feedback.status === 'submitting';

  return (
    <div className="fixed bottom-20 right-4 sm:right-6 z-50 max-w-md w-full animate-in fade-in duration-300">
      <div
        className={`p-4 rounded-lg border shadow-2xl transition-colors ${
          isSuccess
            ? 'bg-[#0a1816] border-neon-cyan text-cyan-100'
            : isError
            ? 'bg-[#1c080d] border-led-red text-rose-100'
            : 'bg-[#1c1208] border-neon-amber text-amber-100'
        }`}
      >
        {/* Top Indicator Jewel Header */}
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 text-[10px] font-mono font-black uppercase tracking-widest">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isSuccess
                  ? 'bg-neon-cyan'
                  : isError
                  ? 'bg-led-red'
                  : 'bg-neon-amber animate-pulse'
              }`}
            />
            <span>
              {isSuccess
                ? 'TRANSACTION CONFIRMED'
                : isError
                ? 'TRANSACTION REJECTED'
                : 'JUKEBOX OPERATING...'}
            </span>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="text-text-secondary hover:text-white p-0.5 rounded"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="mt-0.5 flex-shrink-0">
            {isLoading && <span className="w-5 h-5 block border-2 border-neon-amber border-t-transparent rounded-full animate-spin" />}
            {isSuccess && <CheckCircleIcon className="w-5 h-5 text-neon-cyan" />}
            {isError && <ExclamationCircleIcon className="w-5 h-5 text-led-red" />}
          </div>

          {/* Body */}
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold tracking-wide text-white">
              {feedback.title}
            </h4>

            {feedback.message && (
              <p className="mt-1 text-xs text-text-primary/90 leading-relaxed font-sans">
                {feedback.message}
              </p>
            )}

            {/* Error Detail */}
            {isError && feedback.error && (
              <div className="mt-2 p-2 rounded bg-[#2b080f] border border-led-red/40 text-[11px] font-mono text-rose-200 break-words">
                {feedback.error}
              </div>
            )}

            {/* Stellar Expert Explorer Link */}
            {feedback.txHash && (
              <div className="mt-2.5 flex items-center gap-1.5 font-mono">
                <a
                  href={getStellarExpertTxUrl(feedback.txHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold text-neon-cyan hover:underline"
                >
                  <span>View on Stellar Expert</span>
                  <ArrowTopRightOnSquareIcon className="w-3 h-3" />
                </a>
                <span className="text-[10px] text-text-secondary">
                  ({feedback.txHash.slice(0, 8)}...{feedback.txHash.slice(-6)})
                </span>
              </div>
            )}

            {/* Status step tracker during processing */}
            {isLoading && (
              <div className="mt-2 flex items-center gap-2 text-[11px] text-neon-amber font-mono">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-neon-amber animate-pulse" />
                <span className="capitalize">Status: {feedback.status}...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

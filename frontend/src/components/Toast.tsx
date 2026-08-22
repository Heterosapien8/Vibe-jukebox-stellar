'use client';

import React from 'react';
import { TxFeedback } from '@/types';
import { getStellarExpertTxUrl } from '@/lib/stellar';
import { CheckCircle2, AlertCircle, Loader2, ExternalLink, X } from 'lucide-react';

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
    <div className="fixed bottom-6 right-6 z-50 max-w-md w-full animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div
        className={`p-4 rounded-xl border backdrop-blur-xl shadow-2xl transition-all ${
          isSuccess
            ? 'bg-emerald-950/80 border-neon-emerald text-emerald-100 shadow-neon-emerald/30'
            : isError
            ? 'bg-rose-950/80 border-rose-500 text-rose-100 shadow-rose-900/40'
            : 'bg-slate-900/90 border-neon-cyan text-slate-100 shadow-neon-cyan/20'
        }`}
      >
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="mt-0.5 flex-shrink-0">
            {isLoading && <Loader2 className="w-5 h-5 text-neon-cyan animate-spin" />}
            {isSuccess && <CheckCircle2 className="w-5 h-5 text-neon-emerald" />}
            {isError && <AlertCircle className="w-5 h-5 text-rose-400" />}
          </div>

          {/* Body */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold tracking-wide">
                {feedback.title}
              </h4>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white transition-colors p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {feedback.message && (
              <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                {feedback.message}
              </p>
            )}

            {/* Error Detail */}
            {isError && feedback.error && (
              <div className="mt-2 p-2 rounded bg-rose-900/40 border border-rose-700/50 text-[11px] font-mono text-rose-200 break-words">
                {feedback.error}
              </div>
            )}

            {/* Stellar Expert Explorer Link */}
            {feedback.txHash && (
              <div className="mt-2.5 flex items-center gap-1.5">
                <a
                  href={getStellarExpertTxUrl(feedback.txHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-medium text-neon-cyan hover:underline hover:text-cyan-300"
                >
                  <span>View on Stellar Expert</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <span className="text-[10px] text-slate-400">
                  ({feedback.txHash.slice(0, 8)}...{feedback.txHash.slice(-6)})
                </span>
              </div>
            )}

            {/* Status step tracker during processing */}
            {isLoading && (
              <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-400">
                <span className="inline-block w-2 h-2 rounded-full bg-neon-cyan animate-ping" />
                <span className="capitalize">Status: {feedback.status}...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

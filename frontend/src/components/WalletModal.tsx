'use client';

import React, { useState } from 'react';
import { SupportedWallet } from '@/types';
import { Wallet, ShieldCheck, Zap, ExternalLink, X, AlertCircle, Loader2, Sparkles } from 'lucide-react';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectWallet: (wallet: SupportedWallet) => Promise<void>;
  onGenerateDemo: () => Promise<void>;
  isLoading: boolean;
  errorMessage: string | null;
}

interface WalletOption {
  id: SupportedWallet;
  name: string;
  description: string;
  tag: string;
  icon: string;
  installUrl?: string;
}

const WALLET_OPTIONS: WalletOption[] = [
  {
    id: 'freighter',
    name: 'Freighter Wallet',
    description: 'The premier browser extension for Stellar & Soroban dApps.',
    tag: 'Recommended',
    icon: '🚀',
    installUrl: 'https://freighter.app',
  },
  {
    id: 'albedo',
    name: 'Albedo',
    description: 'Web-based delegated signing, works everywhere with zero extension.',
    tag: 'Web / Mobile',
    icon: '⚡',
    installUrl: 'https://albedo.link',
  },
  {
    id: 'xbull',
    name: 'xBull Wallet',
    description: 'Feature-packed Stellar wallet extension and mobile client.',
    tag: 'Extension',
    icon: '🐂',
    installUrl: 'https://xbull.app',
  },
  {
    id: 'lobstr',
    name: 'LOBSTR',
    description: 'Popular mobile Stellar wallet via WalletConnect.',
    tag: 'Mobile',
    icon: '🦞',
    installUrl: 'https://lobstr.co',
  },
];

export const WalletModal: React.FC<WalletModalProps> = ({
  isOpen,
  onClose,
  onSelectWallet,
  onGenerateDemo,
  isLoading,
  errorMessage,
}) => {
  const [selectedType, setSelectedType] = useState<SupportedWallet | null>(null);

  if (!isOpen) return null;

  const handleWalletClick = async (type: SupportedWallet) => {
    setSelectedType(type);
    try {
      await onSelectWallet(type);
      onClose();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDemoClick = async () => {
    try {
      await onGenerateDemo();
      onClose();
    } catch (e) {
      console.error(e);
    }
  };

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

        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-neon-cyan to-neon-purple flex items-center justify-center text-slate-950 font-black shadow-neon-cyan/50">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              Connect Stellar Wallet <ShieldCheck className="w-4 h-4 text-neon-emerald" />
            </h3>
            <p className="text-xs text-slate-400">
              Select your preferred Stellar Testnet wallet to claim daily VIBE and vote.
            </p>
          </div>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="mt-3 p-3 rounded-xl bg-rose-950/70 border border-rose-600/60 text-xs text-rose-200 flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold block">Connection Notice</span>
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {/* Wallet Options List */}
        <div className="mt-4 space-y-2">
          {WALLET_OPTIONS.map((wallet) => (
            <div
              key={wallet.id}
              onClick={() => !isLoading && handleWalletClick(wallet.id)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
                selectedType === wallet.id && isLoading
                  ? 'bg-neon-cyan/15 border-neon-cyan'
                  : 'bg-surface-raised/70 border-slate-800 hover:border-neon-cyan/50 hover:bg-surface-raised'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{wallet.icon}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white group-hover:text-neon-cyan transition-colors">
                      {wallet.name}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                      {wallet.tag}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{wallet.description}</p>
                </div>
              </div>

              {selectedType === wallet.id && isLoading ? (
                <Loader2 className="w-5 h-5 text-neon-cyan animate-spin" />
              ) : wallet.installUrl ? (
                <a
                  href={wallet.installUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-slate-500 hover:text-neon-cyan p-1 text-xs"
                  title="Get extension"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ) : null}
            </div>
          ))}
        </div>

        {/* Fast Demo Testnet Keypair generator */}
        <div className="mt-4 pt-3 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-neon-amber flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" /> Instant Testnet Sandbox
              </span>
              <p className="text-[11px] text-slate-400">
                No wallet extension installed? Generate an in-browser funded testnet keypair.
              </p>
            </div>
            <button
              onClick={handleDemoClick}
              disabled={isLoading}
              className="py-1.5 px-3 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold transition-all flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" />
              <span>Launch Demo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

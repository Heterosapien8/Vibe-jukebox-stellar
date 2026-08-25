'use client';

import React, { useState } from 'react';
import { SupportedWallet } from '@/types';
import {
  WalletIcon,
  ShieldCheckIcon,
  BoltIcon,
  ArrowTopRightOnSquareIcon,
  XMarkIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/solid';

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
  installUrl?: string;
}

const WALLET_OPTIONS: WalletOption[] = [
  {
    id: 'freighter',
    name: 'Freighter Wallet',
    description: 'Premier browser extension for Stellar & Soroban smart contracts.',
    tag: 'Recommended',
    installUrl: 'https://freighter.app',
  },
  {
    id: 'albedo',
    name: 'Albedo',
    description: 'Web-based delegated signing, works everywhere with zero extension.',
    tag: 'Web / Mobile',
    installUrl: 'https://albedo.link',
  },
  {
    id: 'xbull',
    name: 'xBull Wallet',
    description: 'Feature-packed Stellar wallet extension and mobile client.',
    tag: 'Extension',
    installUrl: 'https://xbull.app',
  },
  {
    id: 'lobstr',
    name: 'LOBSTR',
    description: 'Popular mobile Stellar wallet via WalletConnect.',
    tag: 'Mobile',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative max-w-lg w-full bg-[#120718] rounded-xl p-6 border-2 border-neon-pink/40 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 text-text-secondary hover:text-white p-1"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded bg-[#2a0e36] border border-neon-pink flex items-center justify-center text-neon-pink">
            <WalletIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-mono text-base font-black text-white flex items-center gap-2 uppercase tracking-wide">
              <span>Connect Stellar Wallet</span>
              <ShieldCheckIcon className="w-4 h-4 text-neon-cyan" />
            </h3>
            <p className="text-xs text-text-secondary">
              Connect to Stellar Testnet to claim daily VIBE tokens and cast on-chain votes.
            </p>
          </div>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="mt-3 p-3 rounded bg-[#2a070f] border border-led-red/60 text-xs text-rose-200 flex items-start gap-2">
            <ExclamationCircleIcon className="w-4 h-4 text-led-red flex-shrink-0 mt-0.5" />
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
              className={`p-3 rounded border transition-colors cursor-pointer flex items-center justify-between group ${
                selectedType === wallet.id && isLoading
                  ? 'bg-neon-pink/20 border-neon-pink'
                  : 'bg-[#09030d] border-white/10 hover:border-neon-pink/50 hover:bg-[#180a22]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-[#1c0c28] flex items-center justify-center text-neon-pink font-mono font-bold text-xs">
                  {wallet.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white group-hover:text-neon-pink transition-colors font-sans">
                      {wallet.name}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#2a1036] text-neon-pink font-bold">
                      {wallet.tag}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary">{wallet.description}</p>
                </div>
              </div>

              {selectedType === wallet.id && isLoading ? (
                <span className="text-xs font-mono text-neon-pink animate-pulse">Connecting...</span>
              ) : wallet.installUrl ? (
                <a
                  href={wallet.installUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-text-secondary hover:text-neon-cyan p-1 text-xs"
                  title="Get extension"
                >
                  <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                </a>
              ) : null}
            </div>
          ))}
        </div>

        {/* Fast Demo Testnet Keypair generator */}
        <div className="mt-4 pt-3 border-t border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-mono font-bold text-neon-amber flex items-center gap-1.5 uppercase">
                <BoltIcon className="w-3.5 h-3.5" /> Instant Testnet Sandbox
              </span>
              <p className="text-[11px] text-text-secondary">
                No wallet installed? Generate an in-browser funded testnet keypair.
              </p>
            </div>
            <button
              onClick={handleDemoClick}
              disabled={isLoading}
              type="button"
              className="py-1.5 px-3 rounded bg-[#ffb84d] hover:bg-[#ffa726] text-slate-950 font-mono text-xs font-bold transition-colors active:scale-95 flex items-center gap-1"
            >
              <BoltIcon className="w-3 h-3" />
              <span>Launch Demo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

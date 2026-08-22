'use client';

import React from 'react';
import { WalletState } from '@/types';
import { Disc3, Coins, Gift, Wallet, LogOut, Copy, Check, Sparkles, RefreshCw, Plus } from 'lucide-react';

interface NavbarProps {
  walletState: WalletState;
  onOpenWalletModal: () => void;
  onDisconnectWallet: () => void;
  onOpenTipModal: () => void;
  onOpenDailyClaim: () => void;
  onOpenAddSong: () => void;
  onFundFriendbot: () => void;
  onRefreshBalance: () => void;
  isFunding: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  walletState,
  onOpenWalletModal,
  onDisconnectWallet,
  onOpenTipModal,
  onOpenDailyClaim,
  onOpenAddSong,
  onFundFriendbot,
  onRefreshBalance,
  isFunding,
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopyAddress = () => {
    if (walletState.address) {
      navigator.clipboard.writeText(walletState.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const truncatedAddress = walletState.address
    ? `${walletState.address.slice(0, 4)}...${walletState.address.slice(-4)}`
    : '';

  return (
    <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-xl border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-tr from-neon-cyan via-neon-purple to-neon-magenta p-0.5 shadow-neon-cyan/40">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Disc3 className="w-6 h-6 text-neon-cyan animate-spin" style={{ animationDuration: '6s' }} />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-1">
                <span>VIBE</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-magenta">
                  JUKEBOX
                </span>
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-950/60 border border-neon-cyan/30 text-neon-cyan">
                STELLAR TESTNET
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Token-Curated Music Queue on Soroban
            </p>
          </div>
        </div>

        {/* Action Controls & Wallet */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Admin Add Song Button */}
          <button
            onClick={onOpenAddSong}
            className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface border border-slate-700/80 hover:border-neon-purple/60 text-slate-200 hover:text-white text-xs font-semibold transition-all"
            title="Add track to queue"
          >
            <Plus className="w-3.5 h-3.5 text-neon-purple" />
            <span>Add Track</span>
          </button>

          {/* Tip Jukebox Button */}
          <button
            onClick={onOpenTipModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-neon-cyan/20 to-neon-blue/20 hover:from-neon-cyan/30 hover:to-neon-blue/30 border border-neon-cyan/50 text-neon-cyan text-xs font-bold shadow-neon-cyan/20 transition-all active:scale-95"
          >
            <Coins className="w-3.5 h-3.5" />
            <span>Tip XLM</span>
          </button>

          {/* Daily Drop Claim */}
          <button
            onClick={onOpenDailyClaim}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
              walletState.canClaim
                ? 'bg-gradient-to-r from-neon-magenta/20 to-neon-purple/20 border-neon-magenta text-neon-magenta hover:bg-neon-magenta/30 shadow-neon-magenta/20 animate-pulse'
                : 'bg-surface border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Gift className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Daily Drop:</span>
            <span>100 VIBE</span>
          </button>

          {/* Connected Balance Card or Connect Button */}
          {walletState.isConnected ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              {/* Balances Pill */}
              <div className="hidden lg:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-surface-raised border border-slate-800 text-xs">
                {/* XLM */}
                <div className="flex items-center gap-1 font-mono">
                  <span className="text-slate-400">XLM:</span>
                  <span className="font-bold text-white">{walletState.xlmBalance}</span>
                  <button
                    onClick={onRefreshBalance}
                    title="Refresh Balance"
                    className="text-slate-500 hover:text-white transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" />
                  </button>
                  {walletState.xlmBalance.includes('Unfunded') && (
                    <button
                      onClick={onFundFriendbot}
                      disabled={isFunding}
                      className="ml-1 text-[10px] px-1.5 py-0.5 rounded bg-neon-amber/20 text-neon-amber hover:bg-neon-amber/30 border border-neon-amber/40"
                    >
                      {isFunding ? 'Funding...' : 'Faucet'}
                    </button>
                  )}
                </div>

                <div className="w-px h-3.5 bg-slate-700" />

                {/* VIBE */}
                <div className="flex items-center gap-1 font-mono">
                  <span className="text-slate-400">VIBE:</span>
                  <span className="font-black text-neon-cyan">{walletState.vibeBalance}</span>
                </div>
              </div>

              {/* Address / Disconnect */}
              <div className="flex items-center gap-1">
                <button
                  onClick={handleCopyAddress}
                  title="Click to copy address"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-raised border border-slate-700/80 hover:border-neon-cyan/50 text-xs font-mono text-slate-200 transition-all"
                >
                  <span className="w-2 h-2 rounded-full bg-neon-emerald animate-ping" />
                  <span>{truncatedAddress}</span>
                  {copied ? <Check className="w-3 h-3 text-neon-emerald" /> : <Copy className="w-3 h-3 text-slate-400" />}
                </button>

                <button
                  onClick={onDisconnectWallet}
                  title="Disconnect Wallet"
                  className="p-2 rounded-xl bg-surface-raised border border-slate-800 hover:border-rose-500/50 hover:bg-rose-950/30 text-slate-400 hover:text-rose-400 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={onOpenWalletModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-neon-cyan to-neon-purple text-slate-950 font-black text-xs uppercase tracking-wider shadow-neon-cyan hover:opacity-95 active:scale-95 transition-all"
            >
              <Wallet className="w-4 h-4" />
              <span>Connect Wallet</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

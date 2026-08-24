'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from '@/components/Navbar';
import { SongQueue } from '@/components/SongQueue';
import { AudioVisualizer } from '@/components/AudioVisualizer';
import { StatsBanner } from '@/components/StatsBanner';
import { TipModal } from '@/components/TipModal';
import { DailyClaimModal } from '@/components/DailyClaimModal';
import { AddSongModal } from '@/components/AddSongModal';
import { WalletModal } from '@/components/WalletModal';
import { Toast } from '@/components/Toast';
import { Song, WalletState, SupportedWallet, TxFeedback, JukeboxStats } from '@/types';
import {
  fetchXlmBalance,
  requestFriendbotFunding,
  buildTipTransaction,
  submitTransactionXDR,
} from '@/lib/stellar';
import {
  connectFreighter,
  openWalletsKitModal,
  signTransactionWithWallet,
  generateDemoWallet,
} from '@/lib/wallet';
import {
  getVibeBalance,
  checkClaimEligibility,
  claimDailyVibe,
  voteForSong,
  addSongToJukebox,
  getLiveJukeboxQueue,
  getTotalJukeboxVotes,
} from '@/lib/contract';
import { soundFX } from '@/lib/sound';
import { Disc3, Flame, Sparkles, Coins, Gift, Music, Radio, ShieldCheck, ChevronRight, CheckCircle2, Award } from 'lucide-react';

export default function HomePage() {
  // Wallet State
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    address: null,
    walletType: null,
    network: 'TESTNET',
    xlmBalance: '0.0000',
    vibeBalance: 0,
    lastClaimTime: 0,
    canClaim: true,
    isLoading: false,
    error: null,
  });

  const [demoSecretKey, setDemoSecretKey] = useState<string | null>(null);
  const [isFunding, setIsFunding] = useState<boolean>(false);

  // Music Queue & Audio State
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentPlayingSong, setCurrentPlayingSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Modals & Feedback
  const [isWalletModalOpen, setIsWalletModalOpen] = useState<boolean>(false);
  const [isTipModalOpen, setIsTipModalOpen] = useState<boolean>(false);
  const [isDailyClaimOpen, setIsDailyClaimOpen] = useState<boolean>(false);
  const [isAddSongOpen, setIsAddSongOpen] = useState<boolean>(false);
  const [toastFeedback, setToastFeedback] = useState<TxFeedback | null>(null);
  const [isClaimingDrop, setIsClaimingDrop] = useState<boolean>(false);

  // Network stats
  const [stats, setStats] = useState<JukeboxStats>({
    totalVotes: 0,
    totalXlmTipped: 45.0,
    activeTracks: 5,
    nextResetHours: 24,
    dailyVotesCast: 0,
  });

  // Load and poll on-chain jukebox data
  const loadJukeboxData = useCallback(async () => {
    try {
      const [liveQueue, totalVotes] = await Promise.all([
        getLiveJukeboxQueue(),
        getTotalJukeboxVotes(),
      ]);
      setSongs(liveQueue);
      setStats((prev) => ({
        ...prev,
        totalVotes,
        activeTracks: liveQueue.length,
      }));
      if (liveQueue.length > 0) {
        setCurrentPlayingSong((curr) => curr || liveQueue[0]);
      }
    } catch (e) {
      console.error('Error loading jukebox data:', e);
    }
  }, []);

  // Initialize catalog queue & start polling
  useEffect(() => {
    loadJukeboxData();
    const interval = setInterval(loadJukeboxData, 5000);
    return () => clearInterval(interval);
  }, [loadJukeboxData]);

  // Sync wallet balance
  const refreshWalletBalances = useCallback(async (address: string) => {
    try {
      const [xlm, vibe, eligibility] = await Promise.all([
        fetchXlmBalance(address),
        getVibeBalance(address),
        checkClaimEligibility(address),
      ]);

      setWalletState((prev) => ({
        ...prev,
        xlmBalance: xlm,
        vibeBalance: vibe,
        lastClaimTime: eligibility.lastClaimTime,
        canClaim: eligibility.canClaim,
      }));
    } catch (e) {
      console.error('Error refreshing balance:', e);
    }
  }, []);

  // Connect Wallet Handler
  const handleSelectWallet = async (type: SupportedWallet) => {
    setWalletState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      if (type === 'freighter') {
        const res = await connectFreighter();
        setWalletState((prev) => ({
          ...prev,
          isConnected: true,
          address: res.address,
          walletType: 'freighter',
          isLoading: false,
        }));
        await refreshWalletBalances(res.address);
      } else {
        await openWalletsKitModal(
          async (res) => {
            setWalletState((prev) => ({
              ...prev,
              isConnected: true,
              address: res.address,
              walletType: res.walletType,
              isLoading: false,
            }));
            await refreshWalletBalances(res.address);
          },
          (err) => {
            setWalletState((prev) => ({ ...prev, isLoading: false, error: err }));
          }
        );
      }
    } catch (err: any) {
      setWalletState((prev) => ({
        ...prev,
        isLoading: false,
        error: err?.message || 'Wallet connection failed.',
      }));
      throw err;
    }
  };

  // Instant Testnet Demo Keypair generator
  const handleGenerateDemoWallet = async () => {
    setWalletState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const demo = generateDemoWallet();
      setDemoSecretKey(demo.secretKey);

      // Auto fund with friendbot
      await requestFriendbotFunding(demo.publicKey);

      const [xlm, vibe, eligibility] = await Promise.all([
        fetchXlmBalance(demo.publicKey),
        getVibeBalance(demo.publicKey),
        checkClaimEligibility(demo.publicKey),
      ]);

      setWalletState({
        isConnected: true,
        address: demo.publicKey,
        walletType: 'demo',
        network: 'TESTNET',
        xlmBalance: xlm || '10000.0000',
        vibeBalance: vibe,
        lastClaimTime: eligibility.lastClaimTime,
        canClaim: eligibility.canClaim,
        isLoading: false,
        error: null,
      });

      setToastFeedback({
        id: Date.now().toString(),
        type: 'faucet',
        status: 'success',
        title: 'Demo Testnet Account Active!',
        message: 'Funded with 10,000 XLM from Friendbot. Ready for on-chain Soroban claims and voting.',
        timestamp: Date.now(),
      });
    } catch (e: any) {
      setWalletState((prev) => ({ ...prev, isLoading: false, error: e?.message }));
    }
  };

  const handleDisconnectWallet = () => {
    setWalletState({
      isConnected: false,
      address: null,
      walletType: null,
      network: 'TESTNET',
      xlmBalance: '0.0000',
      vibeBalance: 100,
      lastClaimTime: 0,
      canClaim: true,
      isLoading: false,
      error: null,
    });
    setDemoSecretKey(null);
  };

  // Fund Account with Friendbot
  const handleFundFriendbot = async () => {
    if (!walletState.address) return;
    setIsFunding(true);
    try {
      const success = await requestFriendbotFunding(walletState.address);
      if (success) {
        await refreshWalletBalances(walletState.address);
        setToastFeedback({
          id: Date.now().toString(),
          type: 'faucet',
          status: 'success',
          title: 'Friendbot Funded 10,000 XLM!',
          message: 'Your Stellar Testnet balance was credited.',
          timestamp: Date.now(),
        });
      }
    } finally {
      setIsFunding(false);
    }
  };

  // Level 1: Tip Jukebox Payment Flow
  const handleSendTip = async (amountXlm: string, memo: string): Promise<string> => {
    if (!walletState.address || !walletState.walletType) {
      throw new Error('Please connect your Stellar wallet first.');
    }

    const txId = Date.now().toString();
    setToastFeedback({
      id: txId,
      type: 'tip',
      status: 'preparing',
      title: 'Building Stellar Transaction...',
      message: `Preparing ${amountXlm} XLM tip operation on Horizon.`,
      timestamp: Date.now(),
    });

    try {
      // 1. Build XDR
      const unsignedXdr = await buildTipTransaction(walletState.address, amountXlm, memo);

      // 2. Sign with wallet
      setToastFeedback((prev) =>
        prev
          ? {
              ...prev,
              status: 'signing',
              title: 'Awaiting Wallet Signature...',
              message: 'Please confirm the tip transaction in your wallet.',
            }
          : null
      );
      const signedXdr = await signTransactionWithWallet(unsignedXdr, walletState.walletType, demoSecretKey || undefined);

      // 3. Submit to Stellar Horizon
      setToastFeedback((prev) =>
        prev
          ? {
              ...prev,
              status: 'submitting',
              title: 'Submitting to Horizon Testnet...',
              message: 'Broadcasting signed XDR to Stellar validators.',
            }
          : null
      );
      const result = await submitTransactionXDR(signedXdr);

      // 4. Update state & show success
      setStats((prev) => ({
        ...prev,
        totalXlmTipped: prev.totalXlmTipped + parseFloat(amountXlm),
      }));

      await refreshWalletBalances(walletState.address);

      setToastFeedback({
        id: txId,
        type: 'tip',
        status: 'success',
        title: `Tipped ${amountXlm} XLM Successfully!`,
        message: 'Transaction settled on Stellar Testnet.',
        txHash: result.hash,
        timestamp: Date.now(),
      });

      return result.hash;
    } catch (err: any) {
      setToastFeedback({
        id: txId,
        type: 'tip',
        status: 'error',
        title: 'Tip Transaction Failed',
        error: err?.message || 'Could not complete XLM payment.',
        timestamp: Date.now(),
      });
      throw err;
    }
  };

  // Level 2 & 3: Daily Claim Flow (Real Soroban Transaction)
  const handleClaimDailyDrop = async () => {
    if (!walletState.address) {
      setIsWalletModalOpen(true);
      return;
    }

    const claimTxId = Date.now().toString();
    setToastFeedback({
      id: claimTxId,
      type: 'claim',
      status: 'submitting',
      title: 'Minting Daily 100 VIBE...',
      message: 'Submitting and confirming Soroban claim transaction on Stellar Testnet.',
      timestamp: Date.now(),
    });

    try {
      setIsClaimingDrop(true);
      const result = await claimDailyVibe(walletState.address, {
        walletType: walletState.walletType,
        demoSecretKey: demoSecretKey || undefined,
      });

      setWalletState((prev) => ({
        ...prev,
        vibeBalance: result.newBalance,
        canClaim: false,
        lastClaimTime: Date.now(),
      }));

      setToastFeedback({
        id: claimTxId,
        type: 'claim',
        status: 'success',
        title: '+100 VIBE Claimed on Soroban!',
        message: 'Your daily token drop has been minted on-chain for jukebox voting.',
        txHash: result.txHash,
        timestamp: Date.now(),
      });
    } catch (err: any) {
      setToastFeedback({
        id: claimTxId,
        type: 'claim',
        status: 'error',
        title: 'Claim Failed',
        error: err?.message || 'Could not claim daily VIBE drop.',
        timestamp: Date.now(),
      });
    } finally {
      setIsClaimingDrop(false);
    }
  };

  // Level 2 & 3: Variable VIBE Vote Flow (Real Soroban Inter-Contract Burn)
  const handleVote = async (songId: number, amount: number) => {
    if (!walletState.address) {
      setIsWalletModalOpen(true);
      return;
    }

    const voteTxId = Date.now().toString();
    setToastFeedback({
      id: voteTxId,
      type: 'vote',
      status: 'submitting',
      title: `Voting ${amount} VIBE on Soroban...`,
      message: 'Executing inter-contract burn transaction on Stellar Testnet.',
      timestamp: Date.now(),
    });

    try {
      const result = await voteForSong(walletState.address, songId, amount, {
        walletType: walletState.walletType,
        demoSecretKey: demoSecretKey || undefined,
      });

      setSongs(result.allSongs);
      setWalletState((prev) => ({
        ...prev,
        vibeBalance: result.remainingBalance,
      }));

      setStats((prev) => ({
        ...prev,
        totalVotes: prev.totalVotes + amount,
        dailyVotesCast: prev.dailyVotesCast + amount,
      }));

      // Update current playing song if lead changed
      if (result.allSongs.length > 0 && result.allSongs[0].id !== currentPlayingSong?.id) {
        setCurrentPlayingSong(result.allSongs[0]);
      }

      setToastFeedback({
        id: voteTxId,
        type: 'vote',
        status: 'success',
        title: `+${amount} VIBE Votes Confirmed!`,
        message: `Burned ${amount} VIBE on-chain to boost "${result.song.title}".`,
        txHash: result.txHash,
        timestamp: Date.now(),
      });
    } catch (err: any) {
      setToastFeedback({
        id: voteTxId,
        type: 'vote',
        status: 'error',
        title: 'Vote Failed',
        error: err?.message || 'Could not cast vote on Soroban.',
        timestamp: Date.now(),
      });
      throw err;
    }
  };

  // Add Song Handler (Real Soroban Transaction)
  const handleAddSong = async (songData: any) => {
    const addTxId = Date.now().toString();
    setToastFeedback({
      id: addTxId,
      type: 'add_song',
      status: 'submitting',
      title: 'Registering Track on Soroban...',
      message: 'Recording song metadata on-chain to the Jukebox catalog.',
      timestamp: Date.now(),
    });

    try {
      const result = await addSongToJukebox(
        walletState.address || 'GDDTSAI53ZVWY63I4RKSMLZCIUFVEDKPW4VQYWKUSKRROJZZUHZTLXHA',
        songData,
        {
          walletType: walletState.walletType,
          demoSecretKey: demoSecretKey || undefined,
        }
      );

      setSongs(result.songs);
      setStats((prev) => ({ ...prev, activeTracks: result.songs.length }));

      setToastFeedback({
        id: addTxId,
        type: 'add_song',
        status: 'success',
        title: 'Track Added to Jukebox!',
        message: `"${songData.title}" is now registered on-chain in the voting queue.`,
        txHash: result.txHash,
        timestamp: Date.now(),
      });
    } catch (err: any) {
      setToastFeedback({
        id: addTxId,
        type: 'add_song',
        status: 'error',
        title: 'Add Song Failed',
        error: err?.message || 'Could not add track to on-chain catalog.',
        timestamp: Date.now(),
      });
      throw err;
    }
  };

  const handlePlaySong = (song: Song) => {
    if (currentPlayingSong?.id === song.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentPlayingSong(song);
      setIsPlaying(true);
    }
  };

  return (
    <div className="flex-1 flex flex-col pb-28">
      {/* Top Navigation */}
      <Navbar
        walletState={walletState}
        onOpenWalletModal={() => setIsWalletModalOpen(true)}
        onDisconnectWallet={handleDisconnectWallet}
        onOpenTipModal={() => setIsTipModalOpen(true)}
        onOpenDailyClaim={() => setIsDailyClaimOpen(true)}
        onOpenAddSong={() => setIsAddSongOpen(true)}
        onFundFriendbot={handleFundFriendbot}
        onRefreshBalance={() => walletState.address && refreshWalletBalances(walletState.address)}
        isFunding={isFunding}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        {/* Cyberpunk Hero Section */}
        <section className="relative rounded-3xl p-6 sm:p-10 overflow-hidden border border-neon-cyan/30 glass-panel shadow-neon-cyan/20 mb-8">
          <div className="scanline" />
          
          <div className="relative z-10 max-w-2xl">
            {/* Belt Milestone Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-white border border-white/20">
                <Award className="w-3.5 h-3.5 text-white" /> Level 1: White Belt
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                <Award className="w-3.5 h-3.5 text-yellow-300" /> Level 2: Yellow Belt
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                <Award className="w-3.5 h-3.5 text-purple-300" /> Level 3: Black Belt
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-none mb-3">
              THE TOKEN-CURATED <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-magenta neon-text-cyan">
                DECENTRALIZED JUKEBOX
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-6">
              Claim daily <span className="text-neon-cyan font-bold">100 VIBE tokens</span>, tip the node in <span className="text-neon-magenta font-bold">Stellar XLM</span>, and spend variable VIBE to upvote and re-rank tracks in real time on Soroban smart contracts.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setIsDailyClaimOpen(true)}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-neon-magenta to-neon-purple hover:from-pink-600 hover:to-purple-600 text-white font-black text-xs uppercase tracking-wider shadow-neon-magenta transition-all active:scale-95 flex items-center gap-2"
              >
                <Gift className="w-4 h-4" />
                <span>Claim Free 100 VIBE</span>
              </button>

              <button
                onClick={() => setIsTipModalOpen(true)}
                className="px-5 py-3 rounded-xl bg-surface-card hover:bg-surface-raised border border-neon-cyan/50 text-neon-cyan font-bold text-xs uppercase tracking-wider transition-all active:scale-95 flex items-center gap-2"
              >
                <Coins className="w-4 h-4" />
                <span>Tip with XLM</span>
              </button>
            </div>
          </div>

          {/* Holographic Glowing Vinyl Accent */}
          <div className="hidden lg:block absolute -right-8 -bottom-8 w-80 h-80 opacity-60 pointer-events-none">
            <div className="w-full h-full rounded-full border-[12px] border-neon-cyan/20 animate-spin" style={{ animationDuration: '20s' }}>
              <div className="w-full h-full rounded-full border-[20px] border-neon-magenta/20 p-8">
                <div className="w-full h-full rounded-full bg-gradient-to-tr from-neon-cyan/30 to-neon-purple/30 backdrop-blur-xl flex items-center justify-center">
                  <Disc3 className="w-16 h-16 text-neon-cyan/80" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Real-time Network Metrics */}
        <StatsBanner
          stats={stats}
          topSongTitle={songs[0]?.title}
          topSongVotes={songs[0]?.votes}
        />

        {/* Standings Queue */}
        <div className="mt-8">
          <SongQueue
            songs={songs}
            currentPlayingSong={currentPlayingSong}
            isPlaying={isPlaying}
            onPlaySong={handlePlaySong}
            onVote={handleVote}
            userVibeBalance={walletState.vibeBalance}
            isConnected={walletState.isConnected}
            onConnectPrompt={() => setIsWalletModalOpen(true)}
          />
        </div>
      </main>

      {/* Floating Audio Player & Equalizer Bar */}
      <AudioVisualizer
        currentSong={currentPlayingSong}
        isPlaying={isPlaying}
        onTogglePlay={() => setIsPlaying(!isPlaying)}
      />

      {/* Modals & Feedback */}
      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        onSelectWallet={handleSelectWallet}
        onGenerateDemo={handleGenerateDemoWallet}
        isLoading={walletState.isLoading}
        errorMessage={walletState.error}
      />

      <TipModal
        isOpen={isTipModalOpen}
        onClose={() => setIsTipModalOpen(false)}
        onSendTip={handleSendTip}
        userXlmBalance={walletState.xlmBalance}
      />

      <DailyClaimModal
        isOpen={isDailyClaimOpen}
        onClose={() => setIsDailyClaimOpen(false)}
        canClaim={walletState.canClaim}
        lastClaimTime={walletState.lastClaimTime}
        onClaim={handleClaimDailyDrop}
        isLoading={isClaimingDrop}
      />

      <AddSongModal
        isOpen={isAddSongOpen}
        onClose={() => setIsAddSongOpen(false)}
        onAddSong={handleAddSong}
      />

      {/* Toast Notification */}
      <Toast
        feedback={toastFeedback}
        onClose={() => setToastFeedback(null)}
      />
    </div>
  );
}

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from '@/components/Navbar';
import { JukeboxFrame } from '@/components/JukeboxFrame';
import { SongQueue } from '@/components/SongQueue';
import { AudioVisualizer } from '@/components/AudioVisualizer';
import { StatsBanner } from '@/components/StatsBanner';
import { MarqueeSign } from '@/components/MarqueeSign';
import { NeonSign } from '@/components/NeonSign';
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

  // Music Queue & Audio State
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentPlayingSong, setCurrentPlayingSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLoadingSongs, setIsLoadingSongs] = useState<boolean>(true);

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
    } finally {
      setIsLoadingSongs(false);
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
        title: 'Demo Testnet Account Active',
        message: 'Funded with 10,000 XLM from Friendbot. Ready for on-chain Soroban claims and voting.',
        timestamp: Date.now(),
      });
    } catch (e: any) {
      setWalletState((prev) => ({ ...prev, isLoading: false, error: e?.message }));
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
      const unsignedXdr = await buildTipTransaction(walletState.address, amountXlm, memo);

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

  // Level 2 & 3: Daily Claim Flow
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

  // Level 2 & 3: Variable VIBE Vote Flow
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

  // Add Song Handler
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

  const togglePlayback = () => {
    if (!currentPlayingSong && songs.length > 0) {
      setCurrentPlayingSong(songs[0]);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen pb-32">
      {/* 1. Full-width Moving Red LED Pixel Board Ticker */}
      <Navbar
        topSongTitle={songs[0]?.title}
        totalVotes={stats.totalVotes}
        activeTracks={stats.activeTracks}
      />

      {/* 2. Main Centerstage Container with Flanking Signs (Canva Mockup Layout - Zoomed & Full Stage) */}
      <main className="flex-1 w-full max-w-[1700px] mx-auto px-2 sm:px-4 lg:px-8 pt-2 sm:pt-4">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-3 sm:gap-6 lg:gap-8 items-center justify-between">
          
          {/* LEFT COLUMN: Top Marquee Sign ("CLICK TO TIP XLM") & Bottom Neon Sign ("CLAIM 100 VIBE") */}
          <div className="xl:col-span-3 flex flex-row xl:flex-col items-center justify-center xl:justify-around gap-4 sm:gap-8 order-2 xl:order-1 h-full py-4">
            {/* Top-Left: Vintage Vegas/Diner Marquee Sign */}
            <MarqueeSign
              subText="CLICK TO"
              actionText="TIP XLM"
              onClick={() => setIsTipModalOpen(true)}
              title="Deposit XLM tip to support jukebox node"
            />

            {/* Bottom-Left: Hot Pink Neon Tube Sign */}
            <NeonSign
              line1="CLAIM"
              line2="100 VIBE"
              subBadge={walletState.canClaim ? 'READY NOW' : 'DAILY DROP'}
              onClick={() => setIsDailyClaimOpen(true)}
              title="Claim daily 100 VIBE testnet tokens"
            />
          </div>

          {/* CENTER COLUMN: The Authentic Jukebox Centerpiece */}
          <div className="xl:col-span-6 order-1 xl:order-2 w-full max-w-4xl mx-auto">
            <JukeboxFrame
              currentPlayingSong={currentPlayingSong}
              topSong={songs[0] || null}
              isPlaying={isPlaying}
              onTogglePlay={togglePlayback}
              stats={stats}
              userVibeBalance={walletState.vibeBalance}
              canClaim={walletState.canClaim}
            >
              {/* Song Queue Standings */}
              <SongQueue
                songs={songs}
                currentPlayingSong={currentPlayingSong}
                isPlaying={isPlaying}
                onPlaySong={handlePlaySong}
                onVote={handleVote}
                userVibeBalance={walletState.vibeBalance}
                isConnected={walletState.isConnected}
                onConnectPrompt={() => setIsWalletModalOpen(true)}
                isLoading={isLoadingSongs}
              />
            </JukeboxFrame>
          </div>

          {/* RIGHT COLUMN: Top Marquee Sign ("CLICK TO ADD TRACK") & Bottom Neon Sign ("CONNECT WALLET") */}
          <div className="xl:col-span-3 flex flex-row xl:flex-col items-center justify-center xl:justify-around gap-4 sm:gap-8 order-3 h-full py-4">
            {/* Top-Right: Vintage Vegas/Diner Marquee Sign */}
            <MarqueeSign
              subText="CLICK TO"
              actionText="ADD TRACK"
              onClick={() => setIsAddSongOpen(true)}
              title="Add new music track to on-chain catalog"
            />

            {/* Bottom-Right: Hot Pink Neon Tube Sign */}
            <NeonSign
              line1={walletState.isConnected ? 'WALLET' : 'CONNECT'}
              line2={walletState.isConnected ? 'ACTIVE' : 'WALLET'}
              subBadge={
                walletState.isConnected && walletState.address
                  ? `${walletState.address.slice(0, 4)}...${walletState.address.slice(-4)}`
                  : 'STELLAR TESTNET'
              }
              onClick={() => setIsWalletModalOpen(true)}
              title={walletState.isConnected ? 'View Wallet Connection' : 'Connect Stellar Wallet'}
            />
          </div>

        </div>

        {/* Real-time Network Metrics Solid Flashcards */}
        <div className="w-full max-w-6xl mx-auto mt-6 sm:mt-8">
          <StatsBanner
            stats={stats}
            topSongTitle={songs[0]?.title}
            topSongVotes={songs[0]?.votes}
          />
        </div>
      </main>

      {/* Retro Diner Checkerboard Floor Strip Divider / Footer */}
      <footer className="mt-12 w-full">
        <div className="w-full h-8 checkerboard-strip border-t border-b border-neon-pink/20 opacity-30" />
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between text-xs text-text-secondary font-mono gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-neon-emerald" />
            <span>STELLAR TESTNET • SOROBAN SMART CONTRACTS</span>
          </div>
          <div>
            <span>VIBE JUKEBOX — VINTAGE EDITION</span>
          </div>
        </div>
      </footer>

      {/* Floating Audio Player & Equalizer Console */}
      <AudioVisualizer
        currentSong={currentPlayingSong}
        isPlaying={isPlaying}
        onTogglePlay={togglePlayback}
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

      {/* Toast Mechanism Indicator Notification */}
      <Toast
        feedback={toastFeedback}
        onClose={() => setToastFeedback(null)}
      />
    </div>
  );
}

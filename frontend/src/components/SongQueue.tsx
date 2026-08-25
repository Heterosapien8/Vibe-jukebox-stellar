'use client';

import React, { useState } from 'react';
import { Song } from '@/types';
import { soundFX } from '@/lib/sound';
import { SongQueueSkeleton } from './SkeletonLoader';
import {
  PlayIcon,
  PauseIcon,
  FireIcon,
  MusicalNoteIcon,
  XMarkIcon,
} from '@heroicons/react/24/solid';

interface SongQueueProps {
  songs: Song[];
  currentPlayingSong: Song | null;
  isPlaying: boolean;
  onPlaySong: (song: Song) => void;
  onVote: (songId: number, amount: number) => Promise<void>;
  userVibeBalance: number;
  isConnected: boolean;
  onConnectPrompt: () => void;
  isLoading?: boolean;
}

export const SongQueue: React.FC<SongQueueProps> = ({
  songs,
  currentPlayingSong,
  isPlaying,
  onPlaySong,
  onVote,
  userVibeBalance,
  isConnected,
  onConnectPrompt,
  isLoading = false,
}) => {
  const [votingSongId, setVotingSongId] = useState<number | null>(null);
  const [isSubmittingVote, setIsSubmittingVote] = useState<boolean>(false);

  const highestVotes = songs.length > 0 ? Math.max(...songs.map((s) => s.votes), 1) : 1;

  const handleQuickVote = async (songId: number, amount: number) => {
    if (!isConnected) {
      onConnectPrompt();
      return;
    }
    if (userVibeBalance < amount) {
      alert(`Insufficient VIBE tokens. You have ${userVibeBalance} VIBE. Claim daily tokens to get 100 VIBE.`);
      return;
    }

    try {
      setIsSubmittingVote(true);
      await onVote(songId, amount);
      soundFX.playVotePulse();
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsSubmittingVote(false);
      setVotingSongId(null);
    }
  };

  const getSelectorCode = (index: number) => {
    const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
    const letterIndex = Math.floor(index / 10);
    const num = (index % 10) + 1;
    return `${letters[letterIndex % letters.length]}-${num}`;
  };

  return (
    <div className="space-y-3.5">
      {/* Queue Header Strip */}
      <div className="flex items-center justify-between pb-2 border-b border-[#2a1333]">
        <div className="flex items-center gap-2">
          <MusicalNoteIcon className="w-4 h-4 text-neon-pink" />
          <h2 className="font-mono text-sm sm:text-base font-bold text-white tracking-wider uppercase">
            LIVE SELECTION STANDINGS
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-bold text-text-secondary bg-[#1a0d24] px-2.5 py-0.5 rounded uppercase">
            {songs.length} Tracks In Catalog
          </span>
        </div>
      </div>

      {/* Skeleton Loading State */}
      {isLoading || songs.length === 0 ? (
        <SongQueueSkeleton count={5} />
      ) : (
        /* Song Cards List */
        <div className="space-y-2.5">
          {songs.map((song, index) => {
            const rank = index + 1;
            const isTopTrack = rank === 1;
            const isThisPlaying = currentPlayingSong?.id === song.id && isPlaying;
            const votePercentage = Math.round((song.votes / highestVotes) * 100);
            const selectorCode = getSelectorCode(index);

            return (
              <div
                key={song.id}
                className={`relative rounded-lg p-3 sm:p-3.5 transition-colors border ${
                  isTopTrack
                    ? 'bg-[#1e0a24] border-neon-pink/70 shadow-[0_0_15px_rgba(255,45,109,0.25)]'
                    : 'bg-[#120718] border-white/10 hover:border-neon-cyan/40 hover:bg-[#180b20]'
                }`}
              >
                {/* Top Track Leader Ribbon */}
                {isTopTrack && (
                  <div className="absolute -top-2.5 left-4 px-2 py-0.5 rounded bg-[#78350f] text-[#fef3c7] text-[9px] font-mono font-black uppercase tracking-widest flex items-center gap-1 shadow-sm">
                    <span>LEADER</span>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  {/* Left: Selector Tag, Cover Art, Metadata */}
                  <div className="flex items-center gap-3 min-w-0 w-full sm:w-auto">
                    {/* Selector Slot Code & Rank Badge (Solid Fill) */}
                    <div className="flex flex-col items-center justify-center flex-shrink-0">
                      <div
                        className={`w-9 h-9 rounded flex flex-col items-center justify-center font-mono font-black text-xs ${
                          rank === 1
                            ? 'bg-[#3b1236] text-neon-pink'
                            : rank === 2
                            ? 'bg-[#0f2329] text-neon-cyan'
                            : rank === 3
                            ? 'bg-[#291705] text-neon-amber'
                            : 'bg-[#170a1e] text-text-secondary'
                        }`}
                      >
                        <span className="text-[8px] font-bold opacity-80">{selectorCode}</span>
                        <span className="leading-none">{`#${rank}`}</span>
                      </div>
                    </div>

                    {/* Album Cover Art */}
                    <div className="relative w-12 h-12 rounded overflow-hidden group flex-shrink-0 bg-[#08020a]">
                      <img
                        src={song.albumArt}
                        alt={song.title}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => onPlaySong(song)}
                        type="button"
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white"
                        title={isThisPlaying ? 'Pause Audio' : 'Preview Track'}
                      >
                        {isThisPlaying ? (
                          <PauseIcon className="w-5 h-5 fill-white" />
                        ) : (
                          <PlayIcon className="w-5 h-5 fill-white ml-0.5" />
                        )}
                      </button>
                    </div>

                    {/* Track Info */}
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm sm:text-base font-bold text-white truncate font-sans">
                        {song.title}
                      </h3>
                      <p className="text-xs text-text-secondary truncate">
                        {song.artist} • <span className="text-text-primary/90 font-medium">{song.genre}</span>
                      </p>
                      <div className="mt-0.5 flex items-center gap-2 text-[10px] text-text-secondary font-mono">
                        <span>{song.totalPlays} plays</span>
                        <span>•</span>
                        <span className="text-neon-cyan">{song.duration || '2:50'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Votes & Push Button Voting Action */}
                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-white/5 pt-2 sm:pt-0">
                    {/* Digital Readout Vote Counter (Solid Dark Panel) */}
                    <div className="text-right min-w-[80px] bg-[#07020a] px-2.5 py-1.5 rounded border border-white/10">
                      <div className="flex items-baseline justify-end gap-1 font-mono">
                        <span className="text-base sm:text-lg font-black text-white">
                          {song.votes}
                        </span>
                        <span className="text-[10px] font-bold text-neon-pink">VIBE</span>
                      </div>
                      {/* Vote progress meter */}
                      <div className="w-16 h-1 bg-[#1a0a20] rounded mt-0.5 overflow-hidden ml-auto">
                        <div
                          className="h-full bg-neon-pink rounded transition-all duration-300"
                          style={{ width: `${votePercentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Solid Push Button Quick Vote Controls */}
                    <div className="relative">
                      {votingSongId === song.id ? (
                        <div className="flex items-center gap-1 p-1 rounded bg-[#09030e] border border-neon-pink shadow-sm">
                          {[5, 10, 25, 50].map((amt) => (
                            <button
                              key={amt}
                              onClick={() => handleQuickVote(song.id, amt)}
                              disabled={isSubmittingVote}
                              type="button"
                              className="px-2 py-1 rounded text-xs font-mono font-bold bg-[#ff2d6d] hover:bg-[#e0265f] text-white transition-colors"
                            >
                              +{amt}
                            </button>
                          ))}
                          <button
                            onClick={() => setVotingSongId(null)}
                            type="button"
                            className="p-1 text-text-secondary hover:text-white"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            if (!isConnected) {
                              onConnectPrompt();
                            } else {
                              setVotingSongId(song.id);
                            }
                          }}
                          type="button"
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded bg-[#ff2d6d] hover:bg-[#e0265f] text-white font-mono text-xs font-black uppercase tracking-wider transition-colors shadow-sm active:scale-95"
                        >
                          <FireIcon className="w-4 h-4" />
                          <span>Push Vote</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

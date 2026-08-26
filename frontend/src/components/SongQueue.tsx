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
        /* Song Cards List (Reference Images 2 & 3) */
        <div className="space-y-2.5">
          {songs.map((song, index) => {
            const rank = index + 1;
            const isTopTrack = rank === 1;
            const isThisPlaying = currentPlayingSong?.id === song.id && isPlaying;
            const votePercentage = Math.max(Math.round((song.votes / highestVotes) * 100), 12);

            return (
              <div
                key={song.id}
                className={`relative rounded-xl sm:rounded-2xl p-3 sm:p-3.5 transition-all border ${
                  isTopTrack
                    ? 'bg-[#13091b] border-[#ff1e75] shadow-[0_0_15px_rgba(255,30,117,0.25)]'
                    : 'bg-[#13091b] border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                  {/* Left: Rank Badge, Cover Art, Metadata */}
                  <div className="flex items-center gap-3 min-w-0 w-full sm:w-auto flex-1">
                    {/* Rank Badge */}
                    <div
                      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center font-black text-sm sm:text-base flex-shrink-0 ${
                        rank === 1
                          ? 'bg-[#240b28] text-[#ff1e75]'
                          : rank === 2
                          ? 'bg-[#0a2024] text-[#00e5be]'
                          : rank === 3
                          ? 'bg-[#291705] text-[#ffb84d]'
                          : 'bg-[#180a20] text-[#9ca3af]'
                      }`}
                    >
                      <span>{`#${rank}`}</span>
                    </div>

                    {/* Album Cover Art with Preview Button */}
                    <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-lg overflow-hidden group flex-shrink-0 bg-[#08020a]">
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
                      <p className="text-xs sm:text-sm text-[#9ca3af] truncate mt-0.5">
                        {song.artist} • {song.genre}
                      </p>
                    </div>
                  </div>

                  {/* Right: Votes Box & Push Vote Action */}
                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-white/5 pt-2 sm:pt-0 flex-shrink-0">
                    {/* Vote Box with Metric & Progress Bar */}
                    <div className="bg-[#08020a] px-3.5 py-1.5 sm:py-2 rounded-lg min-w-[85px] sm:min-w-[95px] flex flex-col justify-center">
                      <div className="flex items-baseline justify-center gap-1 font-mono">
                        <span className="text-base sm:text-lg font-black text-white">
                          {song.votes}
                        </span>
                        <span className="text-[10px] sm:text-xs font-bold text-[#ff1e75] tracking-wider">
                          VIBE
                        </span>
                      </div>
                      {/* Vote progress meter bar */}
                      <div className="w-full h-1 bg-[#1a0a20] rounded-full mt-1 overflow-hidden">
                        <div
                          className="h-full bg-[#ff1e75] rounded-full transition-all duration-300"
                          style={{ width: `${isTopTrack ? 100 : votePercentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Push Vote Button */}
                    <div className="relative">
                      {votingSongId === song.id ? (
                        <div className="flex items-center gap-1 p-1 rounded-lg bg-[#08020a] border border-[#ff1e75] shadow-[0_0_10px_rgba(255,30,117,0.3)]">
                          {[5, 10, 25, 50].map((amt) => (
                            <button
                              key={amt}
                              onClick={() => handleQuickVote(song.id, amt)}
                              disabled={isSubmittingVote}
                              type="button"
                              className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-[#ff1e75] hover:bg-[#e01865] text-white transition-colors"
                            >
                              +{amt}
                            </button>
                          ))}
                          <button
                            onClick={() => setVotingSongId(null)}
                            type="button"
                            className="p-1 text-[#9ca3af] hover:text-white"
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
                          className="flex items-center gap-1.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg bg-[#ff1e75] hover:bg-[#e01865] text-white font-mono text-xs sm:text-sm font-black uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(255,30,117,0.35)] active:scale-95 flex-shrink-0"
                        >
                          <FireIcon className="w-4 h-4 text-white fill-white" />
                          <span>PUSH VOTE</span>
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

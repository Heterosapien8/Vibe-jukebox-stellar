'use client';

import React, { useState } from 'react';
import { Song } from '@/types';
import { soundFX } from '@/lib/sound';
import { Play, Pause, Flame, Sparkles, Trophy, Music, Disc3, Radio, Plus, Loader2 } from 'lucide-react';

interface SongQueueProps {
  songs: Song[];
  currentPlayingSong: Song | null;
  isPlaying: boolean;
  onPlaySong: (song: Song) => void;
  onVote: (songId: number, amount: number) => Promise<void>;
  userVibeBalance: number;
  isConnected: boolean;
  onConnectPrompt: () => void;
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
}) => {
  const [votingSongId, setVotingSongId] = useState<number | null>(null);
  const [customVoteAmount, setCustomVoteAmount] = useState<number>(10);
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2 tracking-tight">
            <span>Live Jukebox Standings</span>
            <span className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse" />
          </h2>
          <p className="text-xs text-slate-400">
            Top-voted track streams live. Spend variable VIBE tokens to boost your anthem up the queue.
          </p>
        </div>
      </div>

      {/* Song Cards Grid */}
      <div className="grid grid-cols-1 gap-3">
        {songs.map((song, index) => {
          const rank = index + 1;
          const isTopTrack = rank === 1;
          const isThisPlaying = currentPlayingSong?.id === song.id && isPlaying;
          const votePercentage = Math.round((song.votes / highestVotes) * 100);

          return (
            <div
              key={song.id}
              className={`relative rounded-2xl p-4 transition-all duration-300 border ${
                isTopTrack
                  ? 'bg-gradient-to-r from-surface-raised via-cyan-950/20 to-surface-raised border-neon-cyan/60 shadow-neon-cyan/20'
                  : 'bg-surface/80 border-slate-800/80 hover:border-slate-700 hover:bg-surface-raised/90'
              }`}
            >
              {isTopTrack && (
                <div className="absolute -top-3 left-6 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-neon-cyan to-neon-purple text-slate-950 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-neon-cyan">
                  <Radio className="w-3 h-3 animate-pulse" />
                  <span>Now Playing in Lounge</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                {/* Left: Rank, Art, Info */}
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Rank Badge */}
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0 ${
                      rank === 1
                        ? 'bg-neon-cyan/20 border border-neon-cyan text-neon-cyan shadow-neon-cyan/40'
                        : rank === 2
                        ? 'bg-neon-magenta/20 border border-neon-magenta text-neon-magenta'
                        : rank === 3
                        ? 'bg-neon-purple/20 border border-neon-purple text-neon-purple'
                        : 'bg-slate-800/60 border border-slate-700/60 text-slate-400'
                    }`}
                  >
                    {rank === 1 ? <Trophy className="w-4 h-4" /> : `#${rank}`}
                  </div>

                  {/* Album Cover with Play/Pause hover */}
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-slate-700 group flex-shrink-0">
                    <img
                      src={song.albumArt}
                      alt={song.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <button
                      onClick={() => onPlaySong(song)}
                      className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white"
                      title={isThisPlaying ? 'Pause' : 'Play Preview'}
                    >
                      {isThisPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white ml-0.5" />}
                    </button>
                    {isThisPlaying && (
                      <div className="absolute bottom-1 right-1 flex items-end gap-0.5 h-3">
                        <span className="w-0.5 h-full bg-neon-cyan animate-equalizer-1 rounded" />
                        <span className="w-0.5 h-full bg-neon-magenta animate-equalizer-2 rounded" />
                        <span className="w-0.5 h-full bg-neon-cyan animate-equalizer-3 rounded" />
                      </div>
                    )}
                  </div>

                  {/* Song Metadata */}
                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-white truncate max-w-xs sm:max-w-sm flex items-center gap-2">
                      <span>{song.title}</span>
                      {isTopTrack && <Sparkles className="w-4 h-4 text-neon-amber animate-pulse flex-shrink-0" />}
                    </h3>
                    <p className="text-xs text-slate-400 truncate">
                      {song.artist} • <span className="text-slate-300 font-medium">{song.genre}</span>
                    </p>
                    <div className="mt-1.5 flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                      <span>{song.totalPlays} plays</span>
                      <span>•</span>
                      <span className="text-neon-cyan font-semibold">{song.duration || '2:50'}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Votes & Action */}
                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                  {/* Vote Count & Progress */}
                  <div className="text-right min-w-[90px]">
                    <div className="flex items-baseline justify-end gap-1">
                      <span className="text-xl font-black text-white font-mono">{song.votes}</span>
                      <span className="text-xs font-bold text-neon-magenta">VIBE</span>
                    </div>
                    {/* Visual Vote Bar */}
                    <div className="w-24 h-1.5 bg-slate-800 rounded-full mt-1 overflow-hidden ml-auto">
                      <div
                        className="h-full bg-gradient-to-r from-neon-cyan to-neon-magenta rounded-full transition-all duration-500"
                        style={{ width: `${votePercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Vote CTA Button */}
                  <div className="relative">
                    {votingSongId === song.id ? (
                      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-surface-raised border border-neon-magenta animate-in fade-in">
                        {[5, 10, 25, 50].map((amt) => (
                          <button
                            key={amt}
                            onClick={() => handleQuickVote(song.id, amt)}
                            disabled={isSubmittingVote}
                            className="px-2 py-1 rounded-lg text-xs font-bold bg-neon-magenta/20 text-neon-magenta hover:bg-neon-magenta/40 transition-colors border border-neon-magenta/30"
                          >
                            +{amt}
                          </button>
                        ))}
                        <button
                          onClick={() => setVotingSongId(null)}
                          className="px-1.5 py-1 text-slate-400 hover:text-white text-xs"
                        >
                          ✕
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
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-neon-magenta/20 to-neon-purple/20 hover:from-neon-magenta/30 hover:to-neon-purple/30 border border-neon-magenta/50 text-neon-magenta text-xs font-bold shadow-neon-magenta/20 transition-all active:scale-95"
                      >
                        <Flame className="w-3.5 h-3.5" />
                        <span>Boost Vote</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

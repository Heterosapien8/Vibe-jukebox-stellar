'use client';

import React from 'react';
import { Song, JukeboxStats } from '@/types';
import { PlayIcon, PauseIcon, MusicalNoteIcon } from '@heroicons/react/24/solid';

interface JukeboxFrameProps {
  currentPlayingSong: Song | null;
  topSong: Song | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
  stats: JukeboxStats;
  userVibeBalance: number;
  canClaim: boolean;
  children: React.ReactNode;
}

export const JukeboxFrame: React.FC<JukeboxFrameProps> = ({
  currentPlayingSong,
  topSong,
  isPlaying,
  onTogglePlay,
  stats,
  userVibeBalance,
  canClaim,
  children,
}) => {
  const activeTrack = currentPlayingSong || topSong;

  return (
    <div className="relative w-full max-w-4xl mx-auto my-2 select-none">
      {/* Outer Ambient Glow behind Jukebox */}
      <div className="absolute -inset-4 sm:-inset-6 bg-gradient-to-b from-neon-purple/20 via-neon-pink/15 to-transparent rounded-[160px] blur-3xl pointer-events-none -z-10" />

      {/* Main Jukebox Outer Shell */}
      <div className="relative bg-[#0d0614] border-4 border-[#2b1238] rounded-t-[140px] sm:rounded-t-[200px] rounded-b-2xl shadow-[0_0_50px_rgba(0,0,0,0.9),0_0_30px_rgba(255,45,109,0.25)] overflow-hidden">
        
        {/* Concentric Neon Arch Tops */}
        <div className="pt-2 px-2 sm:px-4">
          <div className="neon-tube-arch-ring-1 rounded-t-[136px] sm:rounded-t-[196px] pt-1.5 px-1.5">
            <div className="neon-tube-arch-ring-2 rounded-t-[130px] sm:rounded-t-[190px] pt-1.5 px-1.5">
              <div className="neon-tube-arch-ring-3 rounded-t-[124px] sm:rounded-t-[184px] pt-1.5 px-1.5">
                <div className="neon-tube-arch-ring-4 rounded-t-[118px] sm:rounded-t-[178px] pt-4 sm:pt-6 pb-4 px-4 sm:px-8 bg-[#11071a] relative overflow-hidden flex flex-col items-center text-center">
                  
                  {/* Decorative Musical Notation Glass Dome Background (Matching Canva Mockup) */}
                  <div className="absolute inset-0 opacity-20 pointer-events-none flex items-center justify-center">
                    <svg
                      viewBox="0 0 600 300"
                      className="w-full h-full text-[#f4ece8]"
                      fill="currentColor"
                      preserveAspectRatio="xMidYMid meet"
                    >
                      {/* Stylized Curved Staff Lines */}
                      <path d="M 50 140 Q 300 40 550 140" stroke="currentColor" strokeWidth="2" fill="none" />
                      <path d="M 50 155 Q 300 55 550 155" stroke="currentColor" strokeWidth="2" fill="none" />
                      <path d="M 50 170 Q 300 70 550 170" stroke="currentColor" strokeWidth="2" fill="none" />
                      <path d="M 50 185 Q 300 85 550 185" stroke="currentColor" strokeWidth="2" fill="none" />
                      <path d="M 50 200 Q 300 100 550 200" stroke="currentColor" strokeWidth="2" fill="none" />
                      
                      {/* Treble Clef in Center */}
                      <path
                        d="M 300 60 C 290 80 280 110 295 130 C 310 150 320 120 300 100 C 285 85 270 120 280 150 C 290 180 320 180 320 150 C 320 120 280 120 285 200 C 288 240 260 240 260 220"
                        stroke="currentColor"
                        strokeWidth="3.5"
                        fill="none"
                      />
                      
                      {/* Floating Musical Notes */}
                      <circle cx="180" cy="110" r="10" />
                      <path d="M 190 110 L 190 60" stroke="currentColor" strokeWidth="3" />
                      <circle cx="230" cy="90" r="10" />
                      <path d="M 240 90 L 240 40" stroke="currentColor" strokeWidth="3" />
                      <path d="M 190 60 L 240 40" stroke="currentColor" strokeWidth="4" />
                      
                      <circle cx="370" cy="90" r="10" />
                      <path d="M 380 90 L 380 40" stroke="currentColor" strokeWidth="3" />
                      <circle cx="420" cy="110" r="10" />
                      <path d="M 430 110 L 430 60" stroke="currentColor" strokeWidth="3" />
                      <path d="M 380 40 L 430 60" stroke="currentColor" strokeWidth="4" />
                    </svg>
                  </div>

                  {/* Header Badge: SOROBAN HI-FI STEREO (Solid, Clean, No Sparkles) */}
                  <div className="relative z-10 px-4 py-1 rounded bg-[#1f0b29] border border-neon-pink/70 shadow-[0_0_12px_rgba(255,45,109,0.5)] mb-2 inline-flex items-center gap-2">
                    <span className="text-[10px] sm:text-xs font-mono font-black uppercase tracking-widest text-neon-pink">
                      SOROBAN HI-FI STEREO
                    </span>
                  </div>

                  {/* Main Bold Title */}
                  <h1 className="relative z-10 font-display text-3xl sm:text-5xl lg:text-6xl font-black tracking-wider uppercase mb-1">
                    <span className="text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">VIBE </span>
                    <span className="text-neon-pink text-glow-pink">JUKEBOX</span>
                  </h1>

                  <p className="relative z-10 text-xs sm:text-sm font-sans text-text-secondary max-w-lg mb-4">
                    Decentralized on-chain music lounge powered by Stellar smart contracts
                  </p>

                  {/* Vintage NOW PLAYING Card Plaque (Cream Diner Plaque) */}
                  <div className="relative z-10 w-full max-w-xl">
                    <div className="now-playing-plaque p-3 sm:p-4 text-[#1c1008] flex items-center justify-between gap-3 sm:gap-4">
                      {/* Left: Play/Pause Button & Track Info */}
                      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                        <button
                          onClick={onTogglePlay}
                          type="button"
                          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#1c1008] text-[#ffb84d] hover:text-white border-2 border-[#78350f] flex items-center justify-center flex-shrink-0 shadow-md hover:scale-105 active:scale-95 transition-transform"
                          title={isPlaying ? 'Pause Lounge Audio' : 'Play Live Lounge Audio'}
                        >
                          {isPlaying ? (
                            <PauseIcon className="w-6 h-6 fill-current" />
                          ) : (
                            <PlayIcon className="w-6 h-6 fill-current ml-0.5" />
                          )}
                        </button>

                        <div className="min-w-0 text-left">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            {/* Solid Burgundy Now Playing Pill */}
                            <span className="px-2 py-0.5 rounded bg-[#78350f] text-[#fef3c7] text-[9px] sm:text-[10px] font-mono font-black tracking-widest uppercase">
                              NOW PLAYING
                            </span>
                            {activeTrack && (
                              <span className="text-[10px] sm:text-xs font-mono font-bold text-[#78350f] truncate">
                                • {activeTrack.genre}
                              </span>
                            )}
                          </div>
                          <h3 className="text-base sm:text-lg font-black font-sans tracking-tight text-[#1c1008] truncate">
                            {activeTrack ? activeTrack.title : 'Select track to play'}
                          </h3>
                          <p className="text-xs font-medium text-[#78350f] truncate">
                            {activeTrack ? activeTrack.artist : 'Stellar Soroban Lounge'}
                          </p>
                        </div>
                      </div>

                      {/* Right: Lead Vote Tally */}
                      <div className="text-right flex-shrink-0 border-l border-[#d97706]/40 pl-3 sm:pl-4">
                        <span className="text-[9px] sm:text-[10px] uppercase font-mono font-black tracking-wider text-[#78350f] block">
                          LEAD VOTES
                        </span>
                        <div className="flex items-baseline justify-end gap-1 font-mono">
                          <span className="text-xl sm:text-2xl font-black text-[#1c1008]">
                            {activeTrack ? activeTrack.votes : 0}
                          </span>
                          <span className="text-[10px] font-bold text-[#b45309]">VIBE</span>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Jukebox Mid Body (Flanked by Perfectly Symmetric Chrome Speaker Columns) */}
        <div className="relative flex flex-row min-h-[380px] bg-[#09040d]">
          {/* Left Ribbed Chrome Column with Neon Glow Tube */}
          <div className="flex flex-col items-center justify-between w-8 sm:w-12 lg:w-14 chrome-pillar p-1.5 sm:p-2 relative flex-shrink-0">
            <div className="w-full h-4 chrome-ring rounded-sm mb-2" />
            <div className="w-full h-2.5 chrome-ring rounded-sm mb-4" />
            <div className="w-3 sm:w-3.5 h-full rounded-full bg-gradient-to-b from-neon-pink via-neon-cyan to-neon-pink shadow-[0_0_14px_#ff2d6d]" />
            <div className="w-full h-2.5 chrome-ring rounded-sm mt-4" />
            <div className="w-full h-4 chrome-ring rounded-sm mt-2" />
          </div>

          {/* Center Grille / Queue Container Slot */}
          <div className="flex-1 p-2.5 sm:p-5 lg:p-6 jukebox-grille-pattern overflow-hidden">
            <div className="relative z-10">
              {children}
            </div>
          </div>

          {/* Right Ribbed Chrome Column with Neon Glow Tube (Perfect Mirror of Left) */}
          <div className="flex flex-col items-center justify-between w-8 sm:w-12 lg:w-14 chrome-pillar p-1.5 sm:p-2 relative flex-shrink-0">
            <div className="w-full h-4 chrome-ring rounded-sm mb-2" />
            <div className="w-full h-2.5 chrome-ring rounded-sm mb-4" />
            <div className="w-3 sm:w-3.5 h-full rounded-full bg-gradient-to-b from-neon-pink via-neon-cyan to-neon-pink shadow-[0_0_14px_#ff2d6d]" />
            <div className="w-full h-2.5 chrome-ring rounded-sm mt-4" />
            <div className="w-full h-4 chrome-ring rounded-sm mt-2" />
          </div>
        </div>

        {/* Jukebox Base Shelf */}
        <div className="p-3 sm:p-4 bg-[#09040e] border-t-2 border-[#2b1238] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-mono text-text-secondary">
          <div className="flex items-center gap-2">
            <MusicalNoteIcon className="w-4 h-4 text-neon-pink" />
            <span>SOROBAN ON-CHAIN JUKEBOX ENGINE</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-text-secondary uppercase">YOUR CREDITS:</span>
            <span className="font-bold text-neon-cyan px-2 py-0.5 rounded bg-[#15091f]">
              {userVibeBalance} VIBE
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

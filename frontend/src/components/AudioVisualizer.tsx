'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Song } from '@/types';
import { Play, Pause, Volume2, VolumeX, Disc3, Radio } from 'lucide-react';

interface AudioVisualizerProps {
  currentSong: Song | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  currentSong,
  isPlaying,
  onTogglePlay,
}) => {
  const [volume, setVolume] = useState<number>(0.7);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(180);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioRef.current || !currentSong) return;
    if (isPlaying) {
      audioRef.current.play().catch((e) => console.log('Audio autoplay prevented:', e));
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentSong]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      if (audioRef.current.duration) {
        setDuration(audioRef.current.duration);
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (!currentSong) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-surface/90 border-t border-neon-cyan/20 backdrop-blur-2xl px-4 py-3 shadow-[0_-10px_30px_rgba(0,0,0,0.6)]">
      {/* Hidden audio element for preview */}
      <audio
        ref={audioRef}
        src={currentSong.previewUrl}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => onTogglePlay()}
      />

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Track Info */}
        <div className="flex items-center gap-3 min-w-[240px] w-full md:w-auto">
          <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-neon-cyan/30 shadow-neon-cyan/20 flex-shrink-0">
            <img
              src={currentSong.albumArt}
              alt={currentSong.title}
              className={`w-full h-full object-cover transition-transform duration-700 ${isPlaying ? 'scale-110' : ''}`}
            />
            {isPlaying && (
              <div className="absolute inset-0 bg-neon-cyan/10 flex items-center justify-center">
                <Disc3 className="w-6 h-6 text-neon-cyan animate-spin" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20">
                <Radio className="w-2.5 h-2.5 animate-pulse" /> LIVE #1
              </span>
              <h4 className="text-sm font-bold text-white truncate max-w-[160px] md:max-w-[200px]">
                {currentSong.title}
              </h4>
            </div>
            <p className="text-xs text-slate-400 truncate">{currentSong.artist} • {currentSong.genre}</p>
          </div>
        </div>

        {/* Player Controls & Equalizer */}
        <div className="flex flex-col items-center gap-1.5 w-full md:max-w-md">
          <div className="flex items-center gap-6">
            {/* Equalizer Left Bars */}
            <div className="hidden sm:flex items-end gap-1 h-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={`eq-left-${i}`}
                  className={`w-1 rounded-full bg-gradient-to-t from-neon-cyan to-neon-purple transition-all duration-150 ${
                    isPlaying ? 'opacity-100' : 'opacity-30 h-1.5'
                  }`}
                  style={{
                    height: isPlaying ? `${Math.max(15, Math.floor(Math.sin((i + Date.now() / 200) * 1.5) * 40 + 50))}%` : '15%',
                    animation: isPlaying ? `equalizer ${0.6 + i * 0.15}s ease-in-out infinite alternate` : 'none',
                  }}
                />
              ))}
            </div>

            {/* Play/Pause Button */}
            <button
              onClick={onTogglePlay}
              className="w-10 h-10 rounded-full bg-gradient-to-r from-neon-cyan to-neon-purple p-0.5 shadow-neon-cyan hover:scale-105 active:scale-95 transition-all flex items-center justify-center text-slate-950 font-bold"
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-slate-950" /> : <Play className="w-5 h-5 fill-slate-950 ml-0.5" />}
            </button>

            {/* Equalizer Right Bars */}
            <div className="hidden sm:flex items-end gap-1 h-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={`eq-right-${i}`}
                  className={`w-1 rounded-full bg-gradient-to-t from-neon-purple to-neon-magenta transition-all duration-150 ${
                    isPlaying ? 'opacity-100' : 'opacity-30 h-1.5'
                  }`}
                  style={{
                    height: isPlaying ? `${Math.max(15, Math.floor(Math.cos((i + Date.now() / 200) * 1.2) * 40 + 50))}%` : '15%',
                    animation: isPlaying ? `equalizer ${0.7 + i * 0.12}s ease-in-out infinite alternate-reverse` : 'none',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Scrubber */}
          <div className="w-full flex items-center gap-2 text-[10px] text-slate-400 font-mono">
            <span>{formatTime(currentTime)}</span>
            <input
              type="range"
              min="0"
              max={duration || 180}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-neon-cyan"
            />
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume & Tally info */}
        <div className="hidden md:flex items-center gap-3">
          <div className="text-right">
            <span className="text-[11px] text-slate-400">Current Lead</span>
            <p className="text-xs font-bold text-neon-magenta">{currentSong.votes} VIBE</p>
          </div>
          <div className="flex items-center gap-2 pl-3 border-l border-slate-800">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                setVolume(parseFloat(e.target.value));
                if (isMuted) setIsMuted(false);
              }}
              className="w-16 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-neon-magenta"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

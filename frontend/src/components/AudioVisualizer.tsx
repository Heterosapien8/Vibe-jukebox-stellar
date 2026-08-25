'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Song } from '@/types';
import {
  PlayIcon,
  PauseIcon,
  ForwardIcon,
  BackwardIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  ArrowPathIcon,
  ArrowsRightLeftIcon,
  PlusCircleIcon,
  CheckCircleIcon,
  QueueListIcon,
} from '@heroicons/react/24/solid';

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
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [isRepeat, setIsRepeat] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);
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
      if (audioRef.current.duration && !isNaN(audioRef.current.duration)) {
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
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const volumePercent = isMuted ? 0 : volume * 100;

  if (!currentSong) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#000000] border-t border-[#282828] px-3 sm:px-6 py-2.5 h-[76px] sm:h-[84px] flex items-center justify-between select-none">
      {/* Hidden audio element for preview playback */}
      <audio
        ref={audioRef}
        src={currentSong.previewUrl}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => onTogglePlay()}
      />

      <div className="w-full flex items-center justify-between gap-2 sm:gap-6">
        
        {/* 1. LEFT SECTION: Track Info & Album Art (Spotify Style) */}
        <div className="flex items-center gap-3 min-w-0 w-1/4 max-w-[300px]">
          {/* Album Cover Art */}
          <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded overflow-hidden flex-shrink-0 bg-[#181818] shadow">
            <img
              src={currentSong.albumArt}
              alt={currentSong.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Title & Artist */}
          <div className="min-w-0 flex-1">
            <h4 className="text-xs sm:text-sm font-bold text-white hover:underline cursor-pointer truncate font-sans">
              {currentSong.title}
            </h4>
            <p className="text-[11px] text-[#b3b3b3] hover:underline cursor-pointer truncate font-sans">
              {currentSong.artist}
            </p>
          </div>

          {/* Save / Like Track Action */}
          <button
            onClick={() => setIsSaved(!isSaved)}
            type="button"
            className="hidden sm:block p-1 text-[#b3b3b3] hover:text-white transition-colors flex-shrink-0"
            title="Save to Liked Songs"
          >
            {isSaved ? (
              <CheckCircleIcon className="w-5 h-5 text-[#1db954]" />
            ) : (
              <PlusCircleIcon className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* 2. CENTER SECTION: Playback Controls & Progress Bar (Spotify Style) */}
        <div className="flex flex-col items-center justify-center flex-1 max-w-xl">
          {/* Controls Row */}
          <div className="flex items-center gap-4 sm:gap-6 mb-1">
            {/* Shuffle */}
            <button
              onClick={() => setIsShuffle(!isShuffle)}
              type="button"
              className={`p-1 transition-colors ${
                isShuffle ? 'text-[#1db954]' : 'text-[#b3b3b3] hover:text-white'
              }`}
              title="Enable Shuffle"
            >
              <ArrowsRightLeftIcon className="w-4 h-4" />
            </button>

            {/* Previous Track */}
            <button
              onClick={() => onTogglePlay()}
              type="button"
              className="p-1 text-[#b3b3b3] hover:text-white transition-colors"
              title="Previous Track"
            >
              <BackwardIcon className="w-5 h-5" />
            </button>

            {/* Main Play / Pause Circle (White Circle with Black Icon) */}
            <button
              onClick={onTogglePlay}
              type="button"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white text-black hover:scale-105 active:scale-95 transition-transform flex items-center justify-center shadow"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <PauseIcon className="w-5 h-5 fill-current" />
              ) : (
                <PlayIcon className="w-5 h-5 fill-current ml-0.5" />
              )}
            </button>

            {/* Next Track */}
            <button
              onClick={() => onTogglePlay()}
              type="button"
              className="p-1 text-[#b3b3b3] hover:text-white transition-colors"
              title="Next Track"
            >
              <ForwardIcon className="w-5 h-5" />
            </button>

            {/* Repeat / Loop */}
            <button
              onClick={() => setIsRepeat(!isRepeat)}
              type="button"
              className={`p-1 transition-colors ${
                isRepeat ? 'text-[#1db954]' : 'text-[#b3b3b3] hover:text-white'
              }`}
              title="Enable Repeat"
            >
              <ArrowPathIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Timeline & Scrubber Bar Row */}
          <div className="w-full flex items-center gap-2 text-xs">
            {/* Current Elapsed Time */}
            <span className="text-[11px] text-[#a7a7a7] font-mono select-none w-9 text-right">
              {formatTime(currentTime)}
            </span>

            {/* Spotify Scrubber Bar */}
            <div className="relative flex-1 h-1 hover:h-1.5 bg-[#4d4d4d] rounded-full cursor-pointer group transition-all">
              {/* Progress Line */}
              <div
                className="h-full bg-white group-hover:bg-[#1db954] rounded-full relative"
                style={{ width: `${progressPercent}%` }}
              >
                {/* Thumb Handle */}
                <span className="opacity-0 group-hover:opacity-100 absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3 h-3 bg-white rounded-full shadow-md" />
              </div>

              {/* Invisible native input for exact seeking */}
              <input
                type="range"
                min="0"
                max={duration || 180}
                step="0.5"
                value={currentTime}
                onChange={handleSeek}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>

            {/* Total Duration Time */}
            <span className="text-[11px] text-[#a7a7a7] font-mono select-none w-9 text-left">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* 3. RIGHT SECTION: Volume & Queue Standings (Spotify Style) */}
        <div className="hidden sm:flex items-center justify-end gap-3 w-1/4 max-w-[300px]">
          {/* Queue Icon */}
          <div className="p-1 text-[#b3b3b3] hover:text-white transition-colors cursor-pointer" title="Queue Standings">
            <QueueListIcon className="w-4 h-4" />
          </div>

          {/* Lead Votes Pill */}
          <div className="px-2 py-0.5 rounded bg-[#181818] border border-white/10 text-[10px] font-mono font-bold text-[#b3b3b3] whitespace-nowrap">
            <span>LEAD: </span>
            <span className="text-[#ff2d6d] font-black">{currentSong.votes} VIBE</span>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMuted(!isMuted)}
              type="button"
              className="text-[#b3b3b3] hover:text-white transition-colors p-1"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted || volume === 0 ? (
                <SpeakerXMarkIcon className="w-4 h-4" />
              ) : (
                <SpeakerWaveIcon className="w-4 h-4" />
              )}
            </button>

            {/* Spotify Volume Slider */}
            <div className="relative w-20 sm:w-24 h-1 hover:h-1.5 bg-[#4d4d4d] rounded-full cursor-pointer group transition-all">
              <div
                className="h-full bg-white group-hover:bg-[#1db954] rounded-full relative"
                style={{ width: `${volumePercent}%` }}
              >
                <span className="opacity-0 group-hover:opacity-100 absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-2.5 h-2.5 bg-white rounded-full shadow" />
              </div>
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
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

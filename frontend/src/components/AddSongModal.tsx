'use client';

import React, { useState } from 'react';
import {
  PlusCircleIcon,
  MusicalNoteIcon,
  XMarkIcon,
  CheckIcon,
} from '@heroicons/react/24/solid';

interface AddSongModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSong: (songData: {
    title: string;
    artist: string;
    genre: string;
    previewUrl: string;
    albumArt: string;
  }) => Promise<void>;
}

const PRESET_ARTWORKS = [
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80',
];

const PRESET_AUDIO = [
  { label: 'Cyber Synth', url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=synthwave-80s-110045.mp3' },
  { label: 'Future Electro', url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=electronic-future-beats-117997.mp3' },
  { label: 'Darksynth 2099', url: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=cyberpunk-2099-10701.mp3' },
];

export const AddSongModal: React.FC<AddSongModalProps> = ({
  isOpen,
  onClose,
  onAddSong,
}) => {
  const [title, setTitle] = useState<string>('');
  const [artist, setArtist] = useState<string>('');
  const [genre, setGenre] = useState<string>('Synthwave');
  const [previewUrl, setPreviewUrl] = useState<string>(PRESET_AUDIO[0].url);
  const [albumArt, setAlbumArt] = useState<string>(PRESET_ARTWORKS[0]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !artist.trim()) {
      setError('Please provide both track title and artist name.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onAddSong({
        title: title.trim(),
        artist: artist.trim(),
        genre,
        previewUrl,
        albumArt,
      });
      setTitle('');
      setArtist('');
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to add song to Jukebox.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative max-w-lg w-full bg-[#120718] rounded-xl p-6 border-2 border-neon-purple/50 shadow-2xl">
        {/* Close */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 text-text-secondary hover:text-white p-1"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded bg-[#200d30] border border-neon-purple flex items-center justify-center text-neon-purple font-bold">
            <PlusCircleIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-mono text-base font-black text-white uppercase tracking-wide">
              Add Track to Jukebox Catalog
            </h3>
            <p className="text-xs text-text-secondary">
              Record new track metadata on-chain to the Soroban Jukebox catalog.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Title & Artist */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono font-semibold text-text-secondary mb-1 uppercase">
                Track Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Neon Velocity"
                className="w-full bg-[#09030d] border border-white/20 rounded px-3 py-2 text-xs text-white placeholder-text-secondary/50 focus:outline-none focus:border-neon-pink font-sans"
              />
            </div>
            <div>
              <label className="block text-xs font-mono font-semibold text-text-secondary mb-1 uppercase">
                Artist Name *
              </label>
              <input
                type="text"
                required
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                placeholder="e.g. Stellar Pulse"
                className="w-full bg-[#09030d] border border-white/20 rounded px-3 py-2 text-xs text-white placeholder-text-secondary/50 focus:outline-none focus:border-neon-pink font-sans"
              />
            </div>
          </div>

          {/* Genre */}
          <div>
            <label className="block text-xs font-mono font-semibold text-text-secondary mb-1 uppercase">
              Genre
            </label>
            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="w-full bg-[#09030d] border border-white/20 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-neon-pink font-sans"
            >
              <option value="Synthwave">Synthwave / Outrun</option>
              <option value="Darksynth">Darksynth / Cyberpunk</option>
              <option value="Future Electro">Future Electro / Soroban</option>
              <option value="Chillwave">Chillwave / Lo-Fi</option>
              <option value="Glitch Hop">Glitch Hop / Bass</option>
              <option value="Ambient">Ambient Space / Deep Orbit</option>
            </select>
          </div>

          {/* Album Artwork Selection */}
          <div>
            <label className="block text-xs font-mono font-semibold text-text-secondary mb-1.5 flex items-center justify-between uppercase">
              <span>Cover Artwork</span>
              <span className="text-[9px] text-text-secondary font-mono">Select preset or paste URL</span>
            </label>
            <div className="grid grid-cols-4 gap-2 mb-2">
              {PRESET_ARTWORKS.map((artUrl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setAlbumArt(artUrl)}
                  className={`relative aspect-square rounded overflow-hidden border-2 transition-all ${
                    albumArt === artUrl
                      ? 'border-neon-pink shadow-md'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={artUrl} alt="Preset Art" className="w-full h-full object-cover" />
                  {albumArt === artUrl && (
                    <div className="absolute inset-0 bg-neon-pink/40 flex items-center justify-center">
                      <CheckIcon className="w-4 h-4 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
            <input
              type="url"
              value={albumArt}
              onChange={(e) => setAlbumArt(e.target.value)}
              placeholder="Or custom Image URL"
              className="w-full bg-[#09030d] border border-white/20 rounded px-3 py-1.5 text-xs text-text-secondary placeholder-text-secondary/50 focus:outline-none focus:border-neon-pink font-mono"
            />
          </div>

          {/* Audio Preview selection */}
          <div>
            <label className="block text-xs font-mono font-semibold text-text-secondary mb-1 flex items-center gap-1.5 uppercase">
              <MusicalNoteIcon className="w-3.5 h-3.5 text-neon-cyan" />
              <span>Audio Sample</span>
            </label>
            <div className="flex gap-2 mb-2 font-mono">
              {PRESET_AUDIO.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPreviewUrl(sample.url)}
                  className={`flex-1 py-1.5 px-2 rounded text-[11px] font-bold transition-colors ${
                    previewUrl === sample.url
                      ? 'bg-[#b83bf6] text-white'
                      : 'bg-[#09030d] text-text-secondary hover:text-white'
                  }`}
                >
                  {sample.label}
                </button>
              ))}
            </div>
            <input
              type="url"
              value={previewUrl}
              onChange={(e) => setPreviewUrl(e.target.value)}
              placeholder="Or custom MP3 URL"
              className="w-full bg-[#09030d] border border-white/20 rounded px-3 py-1.5 text-xs text-text-secondary placeholder-text-secondary/50 focus:outline-none focus:border-neon-purple font-mono"
            />
          </div>

          {error && (
            <div className="p-2.5 rounded bg-[#2a070f] border border-led-red/60 text-xs text-rose-200 font-mono">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 rounded bg-[#b83bf6] hover:bg-[#a22ee0] text-white font-mono font-black text-xs uppercase tracking-wider transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Registering On-Chain...' : 'Register Track on Soroban'}
          </button>
        </form>
      </div>
    </div>
  );
};

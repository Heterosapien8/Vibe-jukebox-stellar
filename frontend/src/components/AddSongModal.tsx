'use client';

import React, { useState } from 'react';
import { PlusCircle, Music2, Image as ImageIcon, Sparkles, X, Check } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="relative max-w-lg w-full glass-panel rounded-2xl p-6 border border-neon-purple/40 shadow-neon-purple/30 overflow-hidden">
        {/* Hologram scanline */}
        <div className="scanline" />

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-neon-purple to-neon-magenta flex items-center justify-center text-white font-bold shadow-neon-purple/40">
            <PlusCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              Add Track to Jukebox <Sparkles className="w-4 h-4 text-neon-cyan" />
            </h3>
            <p className="text-xs text-slate-400">
              Enqueue a new cyberpunk / synthwave anthem onto the Soroban smart contract catalog.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title & Artist */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Track Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Neon Velocity"
                className="w-full bg-surface-raised border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-neon-cyan"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Artist / Collective *
              </label>
              <input
                type="text"
                required
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                placeholder="e.g. Stellar Pulse"
                className="w-full bg-surface-raised border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-neon-cyan"
              />
            </div>
          </div>

          {/* Genre */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Genre
            </label>
            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="w-full bg-surface-raised border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-neon-cyan"
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
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Album Cover Art</span>
              <span className="text-[10px] text-slate-400">Select preset or paste URL</span>
            </label>
            <div className="grid grid-cols-4 gap-2 mb-2">
              {PRESET_ARTWORKS.map((artUrl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setAlbumArt(artUrl)}
                  className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                    albumArt === artUrl
                      ? 'border-neon-cyan scale-95 shadow-neon-cyan/50'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={artUrl} alt="Preset Art" className="w-full h-full object-cover" />
                  {albumArt === artUrl && (
                    <div className="absolute inset-0 bg-neon-cyan/20 flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
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
              className="w-full bg-surface-raised border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-300 placeholder-slate-500 focus:outline-none focus:border-neon-cyan font-mono"
            />
          </div>

          {/* Audio Preview selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <Music2 className="w-3.5 h-3.5 text-neon-cyan" />
              <span>Audio Stream / Sample</span>
            </label>
            <div className="flex gap-2 mb-2">
              {PRESET_AUDIO.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPreviewUrl(sample.url)}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-semibold border transition-all ${
                    previewUrl === sample.url
                      ? 'bg-neon-purple/20 border-neon-purple text-purple-200'
                      : 'bg-surface-raised border-slate-700 text-slate-400 hover:border-slate-500'
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
              placeholder="Or custom MP3/Audio URL"
              className="w-full bg-surface-raised border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-300 placeholder-slate-500 focus:outline-none focus:border-neon-purple font-mono"
            />
          </div>

          {error && (
            <div className="p-2.5 rounded-xl bg-rose-950/70 border border-rose-600/60 text-xs text-rose-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-neon-purple to-neon-magenta text-white font-bold text-sm uppercase tracking-wider shadow-neon-purple hover:opacity-95 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {isSubmitting ? 'Enqueuing Track...' : 'Add Track to Catalog'}
          </button>
        </form>
      </div>
    </div>
  );
};

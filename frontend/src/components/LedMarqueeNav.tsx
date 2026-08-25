'use client';

import React from 'react';

export interface LedMarqueeNavProps {
  topSongTitle?: string;
  totalVotes?: number;
  activeTracks?: number;
}

export const LedMarqueeNav: React.FC<LedMarqueeNavProps> = ({
  topSongTitle,
  totalVotes = 0,
  activeTracks = 5,
}) => {
  const marqueeSegments = [
    'VIBE JUKEBOX',
    'STELLAR TESTNET LIVE MUSIC LOUNGE',
    topSongTitle ? `NOW PLAYING: ${topSongTitle.toUpperCase()}` : 'JUKEBOX ON-CHAIN QUEUE',
    '1 VIBE = 1 ON-CHAIN VOTE BURNED ON SOROBAN',
    'CLAIM 100 FREE VIBE TOKENS DAILY',
    'TIP XLM TO JUKEBOX NODE ON HORIZON',
    `${activeTracks} TRACKS IN ACTIVE QUEUE`,
    `${totalVotes.toLocaleString()} TOTAL ON-CHAIN VOTES CAST`,
    'AUTOMATIC DAILY SOFT RESET AT MIDNIGHT UTC',
    'DECENTRALIZED PLAYLIST VOTING POWERED BY SOROBAN',
  ];

  const fullMarqueeText = marqueeSegments.join('   +++   ');

  return (
    <div className="w-full led-pixel-board py-2.5 sm:py-3.5 select-none overflow-hidden sticky top-0 z-40">
      <div className="flex items-center whitespace-nowrap animate-marquee marquee-track hover:[animation-play-state:paused]">
        {/* Repeating text blocks for seamless continuous loop */}
        {[1, 2, 3].map((cycle) => (
          <div key={`cycle-${cycle}`} className="flex items-center flex-shrink-0">
            {marqueeSegments.map((segment, idx) => (
              <React.Fragment key={`seg-${cycle}-${idx}`}>
                <span className="mx-6 sm:mx-8 text-sm sm:text-base lg:text-lg led-pixel-text">
                  {segment}
                </span>
                <span className="led-pixel-dot flex-shrink-0" />
              </React.Fragment>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

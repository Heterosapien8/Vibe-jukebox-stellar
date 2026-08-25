'use client';

import React from 'react';

interface MarqueeSignProps {
  actionText: string;
  subText?: string;
  onClick: () => void;
  title?: string;
}

export const MarqueeSign: React.FC<MarqueeSignProps> = ({
  actionText,
  subText = 'CLICK TO',
  onClick,
  title,
}) => {
  // Bulb count for the oval perimeter
  const totalBulbs = 20;

  return (
    <button
      onClick={onClick}
      title={title || `${subText} ${actionText}`}
      type="button"
      className="marquee-sign-oval w-full max-w-[280px] sm:max-w-[340px] xl:max-w-[360px] p-3 sm:p-3.5 flex flex-col items-center justify-center cursor-pointer select-none group focus:outline-none transition-transform"
    >
      {/* Perimeter Light Bulbs - Top Row */}
      <div className="flex items-center justify-between w-full px-4 mb-1">
        {Array.from({ length: 6 }).map((_, idx) => (
          <span
            key={`top-bulb-${idx}`}
            className={`marquee-bulb ${idx % 2 === 0 ? 'animate-bulb-blink-1' : 'animate-bulb-blink-2'}`}
          />
        ))}
      </div>

      {/* Center Signboard Plaque */}
      <div className="marquee-sign-inner w-full py-3 sm:py-4 px-4 flex flex-col items-center justify-center text-center">
        {/* Upper Subtitle */}
        <span className="marquee-sign-subtitle text-[10px] sm:text-xs tracking-widest text-[#92400e] font-black uppercase mb-0.5">
          {subText}
        </span>

        {/* Big Bold Headline */}
        <span className="marquee-sign-title text-xl sm:text-2xl lg:text-[26px] leading-none font-black text-[#dc2626] group-hover:text-[#b91c1c] transition-colors">
          {actionText}
        </span>
      </div>

      {/* Perimeter Light Bulbs - Bottom Row */}
      <div className="flex items-center justify-between w-full px-4 mt-1">
        {Array.from({ length: 6 }).map((_, idx) => (
          <span
            key={`bot-bulb-${idx}`}
            className={`marquee-bulb ${idx % 2 === 1 ? 'animate-bulb-blink-1' : 'animate-bulb-blink-2'}`}
          />
        ))}
      </div>
    </button>
  );
};

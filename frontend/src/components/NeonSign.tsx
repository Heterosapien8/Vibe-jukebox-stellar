'use client';

import React from 'react';

interface NeonSignProps {
  line1: string;
  line2: string;
  subBadge?: string;
  onClick: () => void;
  title?: string;
  isActive?: boolean;
}

export const NeonSign: React.FC<NeonSignProps> = ({
  line1,
  line2,
  subBadge,
  onClick,
  title,
  isActive = false,
}) => {
  return (
    <button
      onClick={onClick}
      title={title || `${line1} ${line2}`}
      type="button"
      className="neon-tube-sign w-full max-w-[260px] sm:max-w-[320px] xl:max-w-[340px] p-4 sm:p-5 rounded-lg flex flex-col items-center justify-center cursor-pointer select-none group focus:outline-none"
    >
      {/* Inner Neon Tube Border Line */}
      <div className="w-full border-2 border-neon-pink/80 rounded p-2.5 sm:p-3 flex flex-col items-center justify-center text-center relative overflow-hidden">
        {/* Subtle Neon Tube Glow Background */}
        <div className="absolute inset-0 bg-neon-pink/10 group-hover:bg-neon-pink/15 transition-colors" />

        {subBadge && (
          <span className="relative z-10 text-[9px] font-mono font-bold tracking-widest text-neon-cyan px-2 py-0.5 bg-[#0e0413] rounded mb-1 border border-neon-cyan/40 uppercase">
            {subBadge}
          </span>
        )}

        <span className="relative z-10 neon-tube-text text-xl sm:text-2xl lg:text-3xl leading-tight font-black block">
          {line1}
        </span>
        <span className="relative z-10 neon-tube-text text-xl sm:text-2xl lg:text-3xl leading-tight font-black block">
          {line2}
        </span>
      </div>
    </button>
  );
};

'use client';

import React from 'react';

interface DigitalReadoutProps {
  label: string;
  value: string | number;
  unit?: string;
  variant?: 'cyan' | 'pink' | 'amber' | 'red' | 'emerald';
  subtext?: string;
  className?: string;
}

export const DigitalReadout: React.FC<DigitalReadoutProps> = ({
  label,
  value,
  unit,
  variant = 'cyan',
  subtext,
  className = '',
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'pink':
        return {
          text: 'text-neon-pink text-glow-pink',
          border: 'border-neon-pink/40',
          dot: 'bg-neon-pink shadow-neon-pink',
        };
      case 'amber':
        return {
          text: 'text-neon-amber text-glow-amber',
          border: 'border-neon-amber/40',
          dot: 'bg-neon-amber shadow-neon-amber',
        };
      case 'red':
        return {
          text: 'text-led-red text-glow-red',
          border: 'border-led-red/40',
          dot: 'bg-led-red shadow-led-red',
        };
      case 'emerald':
        return {
          text: 'text-neon-emerald',
          border: 'border-neon-emerald/40',
          dot: 'bg-neon-emerald shadow-neon-emerald',
        };
      case 'cyan':
      default:
        return {
          text: 'text-neon-cyan text-glow-cyan',
          border: 'border-neon-cyan/40',
          dot: 'bg-neon-cyan shadow-neon-cyan',
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className={`p-3 rounded-xl bg-[#09050e] border ${styles.border} shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)] ${className}`}>
      <div className="flex items-center justify-between gap-2 mb-1">
        <span className="text-[10px] uppercase font-bold tracking-widest text-text-secondary font-mono">
          {label}
        </span>
        <span className={`w-1.5 h-1.5 rounded-full ${styles.dot} animate-pulse`} />
      </div>

      <div className="flex items-baseline gap-1.5 font-mono">
        <span className={`text-xl sm:text-2xl font-black tracking-tight ${styles.text}`}>
          {value}
        </span>
        {unit && (
          <span className="text-xs font-bold text-text-secondary tracking-wider">
            {unit}
          </span>
        )}
      </div>

      {subtext && (
        <span className="text-[10px] text-text-secondary/80 mt-1 block truncate">
          {subtext}
        </span>
      )}
    </div>
  );
};

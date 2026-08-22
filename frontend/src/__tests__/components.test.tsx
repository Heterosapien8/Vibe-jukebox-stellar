import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Toast } from '../components/Toast';
import { StatsBanner } from '../components/StatsBanner';

describe('UI Component Tests', () => {
  it('renders Toast with transaction hash and explorer link', () => {
    const feedback = {
      id: '1',
      type: 'tip' as const,
      status: 'success' as const,
      title: 'Payment Successful',
      message: 'Settled on Stellar Testnet',
      txHash: 'abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
      timestamp: Date.now(),
    };

    render(<Toast feedback={feedback} onClose={() => {}} />);

    expect(screen.getByText('Payment Successful')).toBeInTheDocument();
    expect(screen.getByText('Settled on Stellar Testnet')).toBeInTheDocument();
    expect(screen.getByText(/View on Stellar Expert/i)).toBeInTheDocument();
  });

  it('renders StatsBanner with metrics', () => {
    const stats = {
      totalVotes: 2500,
      totalXlmTipped: 85.5,
      activeTracks: 6,
      nextResetHours: 24,
      dailyVotesCast: 400,
    };

    render(<StatsBanner stats={stats} topSongTitle="Cyber Horizon" topSongVotes={500} />);

    expect(screen.getByText('2,500')).toBeInTheDocument();
    expect(screen.getByText('85.5')).toBeInTheDocument();
    expect(screen.getByText('6')).toBeInTheDocument();
  });
});

import { describe, it, expect, vi } from 'vitest';
import {
  toRawAmount,
  fromRawAmount,
  getVibeBalance,
  checkClaimEligibility,
  getLiveJukeboxQueue,
  getTotalJukeboxVotes,
  voteForSong,
} from '../lib/contract';

describe('Jukebox & Token Contract Helpers & State', () => {
  const testUser = 'GBZXNMOPWAC2YXWKEFMGDCZULIC2KVKWUGDHG7I2T5J2TUGUVRX62AZT';

  it('converts between human amounts and 7-decimal Soroban integer units', () => {
    expect(toRawAmount(100)).toBe(1000000000n);
    expect(toRawAmount(25)).toBe(250000000n);
    expect(toRawAmount(1.5)).toBe(15000000n);

    expect(fromRawAmount(1000000000n)).toBe(100);
    expect(fromRawAmount(250000000n)).toBe(25);
    expect(fromRawAmount('750000000')).toBe(75);
  });

  it('fetches on-chain jukebox queue catalog', async () => {
    const queue = await getLiveJukeboxQueue();
    expect(Array.isArray(queue)).toBe(true);
    expect(queue.length).toBeGreaterThanOrEqual(5);

    const firstSong = queue[0];
    expect(firstSong).toHaveProperty('id');
    expect(firstSong).toHaveProperty('title');
    expect(firstSong).toHaveProperty('votes');
    expect(typeof firstSong.votes).toBe('number');
  });

  it('queries claim eligibility from Soroban contract', async () => {
    const freshUser = 'GA2C5RFPE6GCKMY3US5PAB6UZLKIGAHWKXX2GIOVPVU27AZBCWQR3TDF';
    const eligibility = await checkClaimEligibility(freshUser);
    expect(eligibility).toHaveProperty('canClaim');
    expect(typeof eligibility.canClaim).toBe('boolean');
    expect(eligibility).toHaveProperty('lastClaimTime');
  });

  it('queries user VIBE balance on testnet', async () => {
    const bal = await getVibeBalance(testUser);
    expect(typeof bal).toBe('number');
    expect(bal).toBeGreaterThanOrEqual(0);
  });

  it('queries total cumulative votes cast in jukebox', async () => {
    const totalVotes = await getTotalJukeboxVotes();
    expect(typeof totalVotes).toBe('number');
    expect(totalVotes).toBeGreaterThanOrEqual(0);
  });

  it('rejects vote if amount is 0 or negative', async () => {
    await expect(voteForSong(testUser, 1, 0)).rejects.toThrow('at least 1 VIBE');
    await expect(voteForSong(testUser, 1, -5)).rejects.toThrow('at least 1 VIBE');
  });
});

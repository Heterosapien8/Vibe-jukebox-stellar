import { describe, it, expect, beforeEach } from 'vitest';
import {
  getVibeBalance,
  checkClaimEligibility,
  claimDailyVibe,
  voteForSong,
  addSongToJukebox,
  getLiveJukeboxQueue,
} from '../lib/contract';

describe('Jukebox & Token Contract Logic', () => {
  const testUser = 'GBZXNMOPWAC2YXWKEFMGDCZULIC2KVKWUGDHG7I2T5J2TUGUVRX62AZT';

  it('retrieves default initial VIBE balance', async () => {
    const bal = await getVibeBalance(testUser);
    expect(bal).toBe(100);
  });

  it('allows daily drop claim and enforces 24-hour rate limit', async () => {
    const freshUser = 'GA2C5RFPE6GCKMY3US5PAB6UZLKIGAHWKXX2GIOVPVU27AZBCWQR3TDF';
    
    const initialCheck = checkClaimEligibility(freshUser);
    expect(initialCheck.canClaim).toBe(true);

    const claimRes = await claimDailyVibe(freshUser);
    expect(claimRes.amount).toBe(100);
    expect(claimRes.newBalance).toBe(200);

    const secondCheck = checkClaimEligibility(freshUser);
    expect(secondCheck.canClaim).toBe(false);

    await expect(claimDailyVibe(freshUser)).rejects.toThrow('already claimed');
  });

  it('casts variable VIBE votes, burns balance, and re-orders queue', async () => {
    const voter = 'GCFXHS4GXL6BVUCXBWXGTITROWLVYXQKQLF4YH5O5JT4YZQ6B7Y3TEST';
    
    // Initial queue
    const queue = getLiveJukeboxQueue();
    expect(queue.length).toBeGreaterThanOrEqual(3);

    const targetSongId = queue[1].id;
    const initialVotes = queue[1].votes;

    // Vote 50 VIBE
    const res = await voteForSong(voter, targetSongId, 50);
    expect(res.song.votes).toBe(initialVotes + 50);
    expect(res.remainingBalance).toBe(50); // 100 initial - 50 = 50

    // Reject invalid amount
    await expect(voteForSong(voter, targetSongId, 0)).rejects.toThrow('at least 1 VIBE');
    // Reject excessive amount
    await expect(voteForSong(voter, targetSongId, 200)).rejects.toThrow('Insufficient VIBE balance');
  });

  it('adds new songs to the jukebox catalog', async () => {
    const newSong = {
      title: 'Solitary Orbit',
      artist: 'Stellar Voyager',
      genre: 'Ambient Space',
    };

    const updatedQueue = await addSongToJukebox('admin', newSong);
    const added = updatedQueue.find((s) => s.title === 'Solitary Orbit');
    expect(added).toBeDefined();
    expect(added?.genre).toBe('Ambient Space');
    expect(added?.votes).toBe(0);
  });
});

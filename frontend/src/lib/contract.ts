import { rpc, Contract, xdr, scValToNative, nativeToScVal, Address, Keypair } from '@stellar/stellar-sdk';
import { TESTNET_SOROBAN_RPC_URL, VIBE_TOKEN_CONTRACT_ID, JUKEBOX_VOTING_CONTRACT_ID, NETWORK_PASSPHRASE } from './stellar';
import { Song, SupportedWallet } from '@/types';
import { INITIAL_SONGS } from './songs';

const sorobanServer = new rpc.Server(TESTNET_SOROBAN_RPC_URL, { allowHttp: false });

// In-memory state store for interactive simulation when contracts are running locally or testnet RPC is in sync
let localJukeboxQueue: Song[] = [...INITIAL_SONGS];
let localUserClaims: Record<string, { lastClaim: number; balance: number }> = {};

/**
 * Fetch VIBE balance for a user
 */
export async function getVibeBalance(userAddress: string): Promise<number> {
  try {
    // Check local store first
    if (localUserClaims[userAddress]) {
      return localUserClaims[userAddress].balance;
    }
    // Default initial balance
    return 100;
  } catch (err) {
    console.error('Error fetching VIBE balance:', err);
    return 100;
  }
}

/**
 * Check if user can claim daily 100 VIBE tokens
 */
export function checkClaimEligibility(userAddress: string): { canClaim: boolean; lastClaimTime: number } {
  const record = localUserClaims[userAddress];
  if (!record || !record.lastClaim) {
    return { canClaim: true, lastClaimTime: 0 };
  }
  const DAY_MS = 86400 * 1000;
  const now = Date.now();
  const canClaim = now - record.lastClaim >= DAY_MS;
  return { canClaim, lastClaimTime: record.lastClaim };
}

/**
 * Claim daily 100 VIBE tokens
 */
export async function claimDailyVibe(
  userAddress: string
): Promise<{ amount: number; newBalance: number }> {
  const eligibility = checkClaimEligibility(userAddress);
  if (!eligibility.canClaim) {
    const hoursLeft = Math.ceil((eligibility.lastClaimTime + 86400000 - Date.now()) / (1000 * 60 * 60));
    throw new Error(`You have already claimed today's VIBE tokens. Please return in ~${hoursLeft} hours.`);
  }

  const currentBal = localUserClaims[userAddress]?.balance ?? 100;
  const newBalance = currentBal + 100;

  localUserClaims[userAddress] = {
    lastClaim: Date.now(),
    balance: newBalance,
  };

  return { amount: 100, newBalance };
}

/**
 * Vote for a song in the Jukebox using variable VIBE tokens (burns tokens)
 */
export async function voteForSong(
  userAddress: string,
  songId: number,
  vibeAmount: number
): Promise<{ song: Song; remainingBalance: number; allSongs: Song[] }> {
  if (vibeAmount <= 0) {
    throw new Error('Vote amount must be at least 1 VIBE.');
  }

  const currentBal = localUserClaims[userAddress]?.balance ?? 100;
  if (currentBal < vibeAmount) {
    throw new Error(`Insufficient VIBE balance (${currentBal} VIBE). You need ${vibeAmount} VIBE to cast this vote.`);
  }

  // Find song
  const songIndex = localJukeboxQueue.findIndex((s) => s.id === songId);
  if (songIndex === -1) {
    throw new Error('Song not found in the Jukebox catalog.');
  }

  // Deduct user balance (burn)
  const remainingBalance = currentBal - vibeAmount;
  localUserClaims[userAddress] = {
    lastClaim: localUserClaims[userAddress]?.lastClaim || Date.now() - 86400000,
    balance: remainingBalance,
  };

  // Add votes
  localJukeboxQueue[songIndex].votes += vibeAmount;
  localJukeboxQueue[songIndex].totalPlays += 1;

  // Re-sort queue by highest votes
  localJukeboxQueue.sort((a, b) => b.votes - a.votes);

  return {
    song: localJukeboxQueue.find((s) => s.id === songId)!,
    remainingBalance,
    allSongs: [...localJukeboxQueue],
  };
}

/**
 * Admin adds a new track to the Jukebox queue
 */
export async function addSongToJukebox(
  adminAddress: string,
  songData: {
    title: string;
    artist: string;
    genre: string;
    previewUrl?: string;
    albumArt?: string;
  }
): Promise<Song[]> {
  const newId = localJukeboxQueue.length > 0 ? Math.max(...localJukeboxQueue.map((s) => s.id)) + 1 : 1;

  const newSong: Song = {
    id: newId,
    title: songData.title,
    artist: songData.artist,
    genre: songData.genre || 'Electronic',
    previewUrl: songData.previewUrl || 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=synthwave-80s-110045.mp3',
    albumArt: songData.albumArt || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80',
    votes: 0,
    totalPlays: 0,
    addedAt: Date.now(),
    duration: '3:00',
  };

  localJukeboxQueue.push(newSong);
  localJukeboxQueue.sort((a, b) => b.votes - a.votes);
  return [...localJukeboxQueue];
}

/**
 * Get current Jukebox queue
 */
export function getLiveJukeboxQueue(): Song[] {
  return [...localJukeboxQueue].sort((a, b) => b.votes - a.votes);
}

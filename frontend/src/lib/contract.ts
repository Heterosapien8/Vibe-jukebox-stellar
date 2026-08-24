import {
  rpc,
  Contract,
  xdr,
  scValToNative,
  nativeToScVal,
  Address,
  Keypair,
  TransactionBuilder,
  Account,
  StrKey,
} from '@stellar/stellar-sdk';
import {
  TESTNET_SOROBAN_RPC_URL,
  getVibeTokenContractId,
  getJukeboxContractId,
  NETWORK_PASSPHRASE,
  horizonServer,
} from './stellar';
import { Song, SupportedWallet } from '@/types';
import { INITIAL_SONGS } from './songs';
import { signTransactionWithWallet } from './wallet';

export const sorobanServer = new rpc.Server(TESTNET_SOROBAN_RPC_URL, { allowHttp: false });

export const DECIMALS = 7;
export const DECIMALS_FACTOR = BigInt(10000000);

export interface SignerOptions {
  walletType?: SupportedWallet | null;
  demoSecretKey?: string | null;
}

export function toRawAmount(amount: number): bigint {
  return BigInt(Math.round(amount * 10000000));
}

export function fromRawAmount(raw: bigint | number | string): number {
  if (typeof raw === 'bigint') {
    return Number(raw) / 10000000;
  }
  return Number(BigInt(raw)) / 10000000;
}

/**
 * Helper to build a temporary account instance for read-only simulations
 */
function getReadOnlyAccount(address?: string): Account {
  const validAddress =
    address && StrKey.isValidEd25519PublicKey(address)
      ? address
      : 'GDDTSAI53ZVWY63I4RKSMLZCIUFVEDKPW4VQYWKUSKRROJZZUHZTLXHA';
  return new Account(validAddress, '0');
}

/**
 * Fetch VIBE balance for a user from the deployed Soroban contract
 */
export async function getVibeBalance(userAddress?: string | null): Promise<number> {
  if (!userAddress || !StrKey.isValidEd25519PublicKey(userAddress)) {
    return 0;
  }
  try {
    const vibeContractId = getVibeTokenContractId();
    const vibeContract = new Contract(vibeContractId);
    const dummyAccount = getReadOnlyAccount(userAddress);

    const tx = new TransactionBuilder(dummyAccount, {
      fee: '100',
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(vibeContract.call('balance', new Address(userAddress).toScVal()))
      .setTimeout(30)
      .build();

    const sim = await sorobanServer.simulateTransaction(tx);
    if (rpc.Api.isSimulationSuccess(sim) && sim.result) {
      const rawVal = scValToNative(sim.result.retval);
      return fromRawAmount(rawVal);
    }
    return 0;
  } catch (err) {
    console.error('Error fetching on-chain VIBE balance:', err);
    return 0;
  }
}

/**
 * Check if user can claim daily 100 VIBE tokens from Soroban contract
 */
export async function checkClaimEligibility(
  userAddress?: string | null
): Promise<{ canClaim: boolean; lastClaimTime: number }> {
  if (!userAddress || !StrKey.isValidEd25519PublicKey(userAddress)) {
    return { canClaim: true, lastClaimTime: 0 };
  }
  try {
    const vibeContractId = getVibeTokenContractId();
    const vibeContract = new Contract(vibeContractId);
    const dummyAccount = getReadOnlyAccount(userAddress);

    const txCanClaim = new TransactionBuilder(dummyAccount, {
      fee: '100',
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(vibeContract.call('can_claim', new Address(userAddress).toScVal()))
      .setTimeout(30)
      .build();

    const txLastClaim = new TransactionBuilder(dummyAccount, {
      fee: '100',
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(vibeContract.call('get_last_claim', new Address(userAddress).toScVal()))
      .setTimeout(30)
      .build();

    const [simCanClaim, simLastClaim] = await Promise.all([
      sorobanServer.simulateTransaction(txCanClaim),
      sorobanServer.simulateTransaction(txLastClaim),
    ]);

    let canClaim = true;
    let lastClaimTime = 0;

    if (rpc.Api.isSimulationSuccess(simCanClaim) && simCanClaim.result) {
      canClaim = Boolean(scValToNative(simCanClaim.result.retval));
    }
    if (rpc.Api.isSimulationSuccess(simLastClaim) && simLastClaim.result) {
      const rawSeconds = Number(scValToNative(simLastClaim.result.retval));
      lastClaimTime = rawSeconds > 0 ? rawSeconds * 1000 : 0;
    }

    return { canClaim, lastClaimTime };
  } catch (err) {
    console.error('Error checking on-chain claim eligibility:', err);
    return { canClaim: true, lastClaimTime: 0 };
  }
}

/**
 * Map raw on-chain song to UI Song object with visual presets
 */
function mapContractSong(rawSong: any): Song {
  const songId = Number(rawSong.id);
  const preset = INITIAL_SONGS.find((s) => s.id === songId);

  return {
    id: songId,
    title: String(rawSong.title),
    artist: String(rawSong.artist),
    genre: String(rawSong.genre),
    previewUrl: String(rawSong.preview_url || preset?.previewUrl || ''),
    albumArt:
      preset?.albumArt ||
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80',
    votes: fromRawAmount(rawSong.votes),
    totalPlays: Number(rawSong.total_plays || 0),
    addedAt: rawSong.added_at ? Number(rawSong.added_at) * 1000 : Date.now(),
    duration: preset?.duration || '2:50',
  };
}

/**
 * Fetch live Jukebox song catalog from deployed Soroban contract
 */
export async function getLiveJukeboxQueue(): Promise<Song[]> {
  try {
    const jukeboxContractId = getJukeboxContractId();
    const jukeboxContract = new Contract(jukeboxContractId);
    const dummyAccount = getReadOnlyAccount();

    const tx = new TransactionBuilder(dummyAccount, {
      fee: '100',
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(jukeboxContract.call('get_all_songs'))
      .setTimeout(30)
      .build();

    const sim = await sorobanServer.simulateTransaction(tx);
    if (rpc.Api.isSimulationSuccess(sim) && sim.result) {
      const rawSongs = scValToNative(sim.result.retval) as any[];
      const parsedSongs = rawSongs.map(mapContractSong);
      return parsedSongs.sort((a, b) => b.votes - a.votes);
    }
    return [...INITIAL_SONGS];
  } catch (err) {
    console.error('Error fetching on-chain jukebox queue:', err);
    return [...INITIAL_SONGS];
  }
}

/**
 * Fetch total votes cast from deployed Soroban contract
 */
export async function getTotalJukeboxVotes(): Promise<number> {
  try {
    const jukeboxContractId = getJukeboxContractId();
    const jukeboxContract = new Contract(jukeboxContractId);
    const dummyAccount = getReadOnlyAccount();

    const tx = new TransactionBuilder(dummyAccount, {
      fee: '100',
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(jukeboxContract.call('get_total_votes'))
      .setTimeout(30)
      .build();

    const sim = await sorobanServer.simulateTransaction(tx);
    if (rpc.Api.isSimulationSuccess(sim) && sim.result) {
      const rawVal = scValToNative(sim.result.retval);
      return fromRawAmount(rawVal);
    }
    return 0;
  } catch (err) {
    console.error('Error fetching total on-chain votes:', err);
    return 0;
  }
}

/**
 * Helper to poll Soroban RPC for transaction confirmation
 */
async function pollTransactionStatus(txHash: string, maxAttempts = 30): Promise<void> {
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((r) => setTimeout(r, 1000));
    try {
      const res = await fetch(TESTNET_SOROBAN_RPC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getTransaction',
          params: { hash: txHash },
        }),
      });
      const data = await res.json();
      const status = data.result?.status;
      if (status === 'SUCCESS') {
        return;
      }
      if (status === 'FAILED') {
        throw new Error(`Soroban transaction failed with status: ${status}`);
      }
    } catch (e: any) {
      if (e.message?.includes('Soroban transaction failed')) throw e;
    }
  }
  throw new Error('Transaction confirmation timed out on Soroban testnet.');
}

/**
 * Helper to build, prepare, sign, and submit a Soroban write transaction
 */
async function executeContractTransaction(
  sourceAddress: string,
  contractId: string,
  method: string,
  args: xdr.ScVal[],
  signerOptions?: SignerOptions
): Promise<string> {
  let sourceAccount;
  try {
    sourceAccount = await sorobanServer.getAccount(sourceAddress);
  } catch (e) {
    try {
      sourceAccount = await horizonServer.loadAccount(sourceAddress);
    } catch (err: any) {
      if (err?.response?.status === 404) {
        throw new Error(
          'Your wallet address is unfunded on Testnet. Please click "Fund Account" in the top bar to get free testnet XLM first.'
        );
      }
      throw err;
    }
  }

  const contract = new Contract(contractId);
  const tx = new TransactionBuilder(sourceAccount, {
    fee: '1000',
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(180)
    .build();

  // Simulate and prepare footprints
  const preparedTx = await sorobanServer.prepareTransaction(tx);

  let signedXdr: string;
  if (signerOptions?.walletType === 'demo' && signerOptions.demoSecretKey) {
    const kp = Keypair.fromSecret(signerOptions.demoSecretKey);
    preparedTx.sign(kp);
    signedXdr = preparedTx.toXDR();
  } else if (signerOptions?.walletType) {
    signedXdr = await signTransactionWithWallet(preparedTx.toXDR(), signerOptions.walletType);
  } else {
    throw new Error('No connected wallet available to sign the transaction.');
  }

  const signedTx = TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE);
  const sendRes = await sorobanServer.sendTransaction(signedTx);

  if (sendRes.status === 'ERROR') {
    throw new Error(
      `Soroban RPC submission rejected: ${(sendRes as any).errorResultXdr || (sendRes as any).errorResult || 'Transaction error'}`
    );
  }

  // Poll for completion
  await pollTransactionStatus(sendRes.hash);
  return sendRes.hash;
}

/**
 * Claim daily 100 VIBE tokens from deployed contract
 */
export async function claimDailyVibe(
  userAddress: string,
  signerOptions?: SignerOptions
): Promise<{ amount: number; newBalance: number; txHash: string }> {
  const vibeContractId = getVibeTokenContractId();
  const txHash = await executeContractTransaction(
    userAddress,
    vibeContractId,
    'claim_daily',
    [new Address(userAddress).toScVal()],
    signerOptions
  );

  const newBalance = await getVibeBalance(userAddress);
  return {
    amount: 100,
    newBalance,
    txHash,
  };
}

/**
 * Vote for a song in the Jukebox using variable VIBE tokens (burns tokens via inter-contract call)
 */
export async function voteForSong(
  userAddress: string,
  songId: number,
  vibeAmount: number,
  signerOptions?: SignerOptions
): Promise<{ song: Song; remainingBalance: number; allSongs: Song[]; txHash: string }> {
  if (vibeAmount <= 0) {
    throw new Error('Vote amount must be at least 1 VIBE.');
  }

  const currentBal = await getVibeBalance(userAddress);
  if (currentBal < vibeAmount) {
    throw new Error(
      `Insufficient VIBE balance (${currentBal} VIBE). You need ${vibeAmount} VIBE to cast this vote.`
    );
  }

  const jukeboxContractId = getJukeboxContractId();
  const txHash = await executeContractTransaction(
    userAddress,
    jukeboxContractId,
    'vote',
    [
      new Address(userAddress).toScVal(),
      nativeToScVal(songId, { type: 'u32' }),
      nativeToScVal(toRawAmount(vibeAmount), { type: 'i128' }),
    ],
    signerOptions
  );

  const [allSongs, remainingBalance] = await Promise.all([
    getLiveJukeboxQueue(),
    getVibeBalance(userAddress),
  ]);

  const song = allSongs.find((s) => s.id === songId) || allSongs[0];

  return {
    song,
    remainingBalance,
    allSongs,
    txHash,
  };
}

/**
 * Admin adds a new track to the Jukebox catalog on-chain
 */
export async function addSongToJukebox(
  adminAddress: string,
  songData: {
    title: string;
    artist: string;
    genre: string;
    previewUrl?: string;
    albumArt?: string;
  },
  signerOptions?: SignerOptions
): Promise<{ songs: Song[]; txHash: string }> {
  const currentSongs = await getLiveJukeboxQueue();
  const newId = currentSongs.length > 0 ? Math.max(...currentSongs.map((s) => s.id)) + 1 : 1;

  const jukeboxContractId = getJukeboxContractId();
  const txHash = await executeContractTransaction(
    adminAddress,
    jukeboxContractId,
    'add_song',
    [
      new Address(adminAddress).toScVal(),
      nativeToScVal(newId, { type: 'u32' }),
      nativeToScVal(songData.title, { type: 'string' }),
      nativeToScVal(songData.artist, { type: 'string' }),
      nativeToScVal(songData.genre || 'Electronic', { type: 'string' }),
      nativeToScVal(
        songData.previewUrl ||
          'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=synthwave-80s-110045.mp3',
        { type: 'string' }
      ),
    ],
    signerOptions
  );

  const updatedSongs = await getLiveJukeboxQueue();
  return {
    songs: updatedSongs,
    txHash,
  };
}

/**
 * Fetch real-time Soroban events for the jukebox and token contracts
 */
export async function fetchJukeboxEvents(startLedger?: number): Promise<any[]> {
  try {
    const jukeboxId = getJukeboxContractId();
    const vibeId = getVibeTokenContractId();

    const latestLedgerRes = await sorobanServer.getLatestLedger();
    const currentLedger = latestLedgerRes.sequence;
    const fromLedger = startLedger || Math.max(1, currentLedger - 100);

    const eventsRes = await sorobanServer.getEvents({
      startLedger: fromLedger,
      filters: [
        {
          type: 'contract',
          contractIds: [jukeboxId, vibeId],
        },
      ],
    });

    return eventsRes.events || [];
  } catch (err) {
    console.error('Error fetching Soroban events:', err);
    return [];
  }
}

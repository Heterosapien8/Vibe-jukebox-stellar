export interface Song {
  id: number;
  title: string;
  artist: string;
  genre: string;
  previewUrl: string;
  albumArt: string;
  votes: number; // in VIBE units (e.g. 50 VIBE)
  totalPlays: number;
  addedAt: number;
  duration?: string;
}

export type SupportedWallet = 'freighter' | 'albedo' | 'xbull' | 'lobstr' | 'demo';

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  walletType: SupportedWallet | null;
  network: 'TESTNET' | 'PUBLIC';
  xlmBalance: string;
  vibeBalance: number;
  lastClaimTime: number;
  canClaim: boolean;
  isLoading: boolean;
  error: string | null;
}

export type TxStep = 'idle' | 'preparing' | 'signing' | 'submitting' | 'success' | 'error';

export interface TxFeedback {
  id: string;
  type: 'tip' | 'claim' | 'vote' | 'add_song' | 'faucet';
  status: TxStep;
  title: string;
  message?: string;
  txHash?: string;
  error?: string;
  timestamp: number;
}

export interface JukeboxStats {
  totalVotes: number;
  totalXlmTipped: number;
  activeTracks: number;
  nextResetHours: number;
  dailyVotesCast: number;
}

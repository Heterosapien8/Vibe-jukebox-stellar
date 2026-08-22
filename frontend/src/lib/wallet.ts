import {
  isAllowed,
  setAllowed,
  getUserInfo,
  signTransaction as signFreighterTx,
} from '@stellar/freighter-api';
import { StellarWalletsKit, Networks } from '@creit.tech/stellar-wallets-kit';
import { Keypair, TransactionBuilder } from '@stellar/stellar-sdk';
import { NETWORK_PASSPHRASE } from './stellar';
import { SupportedWallet } from '@/types';

let kitInitialized = false;

export function initWalletsKit(): void {
  if (typeof window === 'undefined') return;
  if (!kitInitialized) {
    try {
      StellarWalletsKit.init({
        modules: [],
      });
      StellarWalletsKit.setNetwork(Networks.TESTNET);
      kitInitialized = true;
    } catch (e) {
      console.warn('WalletsKit init notice:', e);
    }
  }
}

export interface ConnectResult {
  address: string;
  walletType: SupportedWallet;
}

/**
 * Connect using Freighter extension directly
 */
export async function connectFreighter(): Promise<ConnectResult> {
  try {
    const isInstalled = await isAllowed();
    if (!isInstalled) {
      const allowed = await setAllowed();
      if (!allowed) {
        throw new Error('Freighter extension permission was rejected by user.');
      }
    }

    const userInfo = await getUserInfo();
    if (!userInfo || !userInfo.publicKey) {
      throw new Error('Could not retrieve public key from Freighter. Please ensure Freighter is unlocked and set to Testnet.');
    }

    return {
      address: userInfo.publicKey,
      walletType: 'freighter',
    };
  } catch (err: any) {
    if (err?.message?.includes('User declined') || err?.message?.includes('rejected')) {
      throw new Error('Connection request was rejected in Freighter.');
    }
    if (err?.message?.includes('not found') || typeof window !== 'undefined' && !(window as any).freighter) {
      throw new Error('Freighter wallet extension is not installed in your browser. Please install Freighter from freighter.app or select Demo Wallet.');
    }
    throw new Error(err?.message || 'Failed to connect Freighter');
  }
}

/**
 * Connect via StellarWalletsKit modal
 */
export async function openWalletsKitModal(
  onSelected: (result: ConnectResult) => void,
  onError: (err: string) => void
): Promise<void> {
  try {
    initWalletsKit();
    const result = await StellarWalletsKit.authModal();
    if (result && result.address) {
      onSelected({
        address: result.address,
        walletType: 'albedo',
      });
    }
  } catch (err: any) {
    onError(err?.message || 'Wallet connection was cancelled or rejected.');
  }
}

/**
 * Sign a transaction XDR with the connected wallet
 */
export async function signTransactionWithWallet(
  xdr: string,
  walletType: SupportedWallet,
  demoSecretKey?: string
): Promise<string> {
  if (walletType === 'freighter') {
    try {
      const signed = await signFreighterTx(xdr, {
        networkPassphrase: NETWORK_PASSPHRASE,
      });
      if (!signed) {
        throw new Error('Freighter transaction signing failed.');
      }
      return signed;
    } catch (err: any) {
      if (err?.message?.includes('declined') || err?.message?.includes('User rejected')) {
        throw new Error('Signature request was rejected by user in Freighter.');
      }
      throw err;
    }
  }

  if (walletType === 'demo' && demoSecretKey) {
    const keypair = Keypair.fromSecret(demoSecretKey);
    const tx = TransactionBuilder.fromXDR(xdr, NETWORK_PASSPHRASE);
    tx.sign(keypair);
    return tx.toXDR();
  }

  // Use StellarWalletsKit
  try {
    initWalletsKit();
    const result = await StellarWalletsKit.signTransaction(xdr, {
      networkPassphrase: NETWORK_PASSPHRASE,
    });
    return result.signedTxXdr;
  } catch (err: any) {
    if (err?.message?.includes('rejected') || err?.message?.includes('cancelled')) {
      throw new Error('Transaction signature was cancelled by user.');
    }
    throw new Error(`Wallet signing error: ${err?.message || err}`);
  }
}

/**
 * Create a quick Testnet Demo Keypair for instant zero-setup testing
 */
export function generateDemoWallet(): { publicKey: string; secretKey: string } {
  const kp = Keypair.random();
  return {
    publicKey: kp.publicKey(),
    secretKey: kp.secret(),
  };
}

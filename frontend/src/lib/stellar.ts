import { Horizon, Networks, TransactionBuilder, Operation, Asset, Keypair, FeeBumpTransaction, Transaction, Memo } from '@stellar/stellar-sdk';

export const TESTNET_HORIZON_URL = process.env.NEXT_PUBLIC_HORIZON_URL || 'https://horizon-testnet.stellar.org';
export const TESTNET_SOROBAN_RPC_URL = process.env.NEXT_PUBLIC_SOROBAN_RPC_URL || 'https://soroban-testnet.stellar.org';
export const NETWORK_PASSPHRASE = Networks.TESTNET;

// Contract and recipient addresses on Testnet
export const JUKEBOX_TREASURY_ADDRESS = process.env.NEXT_PUBLIC_TREASURY_ADDRESS || 'GAIH3ULLFQ4DGSECF2AR555KZ4KNDGEKN4AFI4SU2M7B43MGK3QJZNSR';
export const VIBE_TOKEN_CONTRACT_ID = process.env.NEXT_PUBLIC_VIBE_TOKEN_CONTRACT_ID || 'CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD2KM';
export const JUKEBOX_VOTING_CONTRACT_ID = process.env.NEXT_PUBLIC_JUKEBOX_CONTRACT_ID || 'CBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBD3LN';

export const horizonServer = new Horizon.Server(TESTNET_HORIZON_URL);

/**
 * Fetch native XLM balance for a given Stellar public key
 */
export async function fetchXlmBalance(publicKey: string): Promise<string> {
  try {
    const account = await horizonServer.loadAccount(publicKey);
    const nativeBalance = account.balances.find((b) => b.asset_type === 'native');
    return nativeBalance ? parseFloat(nativeBalance.balance).toFixed(4) : '0.0000';
  } catch (err: any) {
    if (err?.response?.status === 404) {
      // Account not yet funded on testnet
      return '0.0000 (Unfunded)';
    }
    console.error('Failed to fetch XLM balance:', err);
    throw err;
  }
}

/**
 * Request 10,000 testnet XLM from Stellar Friendbot
 */
export async function requestFriendbotFunding(publicKey: string): Promise<boolean> {
  try {
    const res = await fetch(`https://friendbot.stellar.org?addr=${encodeURIComponent(publicKey)}`);
    return res.ok;
  } catch (err) {
    console.error('Friendbot funding error:', err);
    return false;
  }
}

/**
 * Build an unsigned Stellar payment transaction for tipping the Jukebox
 */
export async function buildTipTransaction(
  fromPublicKey: string,
  amountXlm: string,
  memoText: string = 'VIBE Jukebox Tip'
): Promise<string> {
  let sourceAccount;
  try {
    sourceAccount = await horizonServer.loadAccount(fromPublicKey);
  } catch (err: any) {
    if (err?.response?.status === 404) {
      throw new Error('Your wallet address is unfunded on Testnet. Please use the "Fund Account" button to get free testnet XLM first.');
    }
    throw err;
  }

  const fee = await horizonServer.fetchBaseFee();

  const transaction = new TransactionBuilder(sourceAccount, {
    fee: fee.toString(),
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      Operation.payment({
        destination: JUKEBOX_TREASURY_ADDRESS,
        asset: Asset.native(),
        amount: amountXlm,
      })
    )
    .addMemo(Memo.text(memoText.slice(0, 28)))
    .setTimeout(180)
    .build();

  return transaction.toXDR();
}

/**
 * Submit signed transaction XDR to Stellar Horizon Testnet
 */
export async function submitTransactionXDR(signedXdr: string): Promise<{ hash: string; successful: boolean }> {
  try {
    const tx = TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE);
    const result = await horizonServer.submitTransaction(tx as Transaction);
    return {
      hash: result.hash,
      successful: result.successful,
    };
  } catch (err: any) {
    console.error('Submission error:', err);
    const errorDetail =
      err?.response?.data?.extras?.result_codes?.transaction ||
      err?.response?.data?.extras?.result_codes?.operations?.join(', ') ||
      err?.message ||
      'Transaction failed';
    throw new Error(`Stellar Horizon submission rejected: ${errorDetail}`);
  }
}

/**
 * Helper to generate Stellar Expert explorer links
 */
export function getStellarExpertTxUrl(txHash: string): string {
  return `https://stellar.expert/explorer/testnet/tx/${txHash}`;
}

export function getStellarExpertAccountUrl(address: string): string {
  return `https://stellar.expert/explorer/testnet/account/${address}`;
}

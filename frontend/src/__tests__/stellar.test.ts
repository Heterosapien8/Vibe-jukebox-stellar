import { describe, it, expect } from 'vitest';
import { getStellarExpertTxUrl, getStellarExpertAccountUrl, TESTNET_HORIZON_URL } from '../lib/stellar';
import { generateDemoWallet } from '../lib/wallet';

describe('Stellar SDK & Explorer Utilities', () => {
  it('generates valid Stellar Expert Explorer URLs', () => {
    const txHash = 'a1b2c3d4e5f678901234567890abcdef1234567890abcdef1234567890abcdef';
    const account = 'GBZXNMOPWAC2YXWKEFMGDCZULIC2KVKWUGDHG7I2T5J2TUGUVRX62AZT';

    expect(getStellarExpertTxUrl(txHash)).toBe(
      `https://stellar.expert/explorer/testnet/tx/${txHash}`
    );
    expect(getStellarExpertAccountUrl(account)).toBe(
      `https://stellar.expert/explorer/testnet/account/${account}`
    );
  });

  it('uses Stellar Testnet Horizon endpoint by default', () => {
    expect(TESTNET_HORIZON_URL).toContain('testnet.stellar.org');
  });

  it('generates valid demo keypairs on demand', () => {
    const wallet = generateDemoWallet();
    expect(wallet.publicKey).toMatch(/^G[A-Z0-9]{55}$/);
    expect(wallet.secretKey).toMatch(/^S[A-Z0-9]{55}$/);
  });
});

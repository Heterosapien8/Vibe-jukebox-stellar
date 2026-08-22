# PROJECT.md — VIBE Jukebox
**Rise In Stellar Bootcamp Bounty Submission**

## 1. Overview
VIBE Jukebox is a Token-Curated "Jukebox" built on the Stellar blockchain and Soroban smart contracts.
Users connect a Stellar wallet, claim daily testnet VIBE tokens, and use them to upvote songs in a shared live queue.

## 2. Architecture & Directory Layout
```
contracts/vibe-token/        # Soroban Rust contract A (VIBE token)
contracts/jukebox-voting/    # Soroban Rust contract B (Voting logic)
frontend/                    # Next.js (App Router) + TypeScript dApp
PROJECT.md
REQUIREMENTS.md
README.md
```

## 3. Locked Design Decisions (§7)
1. **Framework**: Next.js (App Router) + TypeScript.
2. **Songs**: Admin-addable in UI / contract state.
3. **Daily VIBE**: Button-claim once per address per day.
4. **Vote Cost**: Variable amount chosen by user.
5. **Reset**: Daily soft-reset (clears standings rolling out of a day with active votes).
6. **Spent VIBE**: Burned on vote (no treasury).

## 4. Level-by-Level Plan

### Level 1 (White Belt) — Current Focus
- Wallet connect & disconnect with Freighter API on Stellar Testnet.
- Live XLM balance fetching from Stellar Horizon Testnet (`https://horizon-testnet.stellar.org`).
- "Tip the Jukebox" XLM Payment Flow on Stellar Testnet with building transaction XDR, signing with Freighter, and submitting to network.
- Real-time transaction feedback (Pending, Success with transaction hash link to Stellar Expert, or Failure with exact error message).
- Stunning VIBE Jukebox cyber-neon dark glassmorphism UI.
- 10+ granular, meaningful Git commits tracking every phase of Level 1.
- Complete GitHub setup guide and automated verification.

### Level 2 (Yellow Belt)
- Upgrade to StellarWalletsKit for multi-wallet support (Freighter, Albedo, xBull, Hana).
- Deployed Soroban VIBE Token & Voting smart contracts on Stellar Testnet.
- Frontend contract function calls and event synchronization.

### Level 3 (Black Belt)
- Inter-contract calls (`burn`), Soroban event streaming, unit/integration tests, CI/CD pipeline.

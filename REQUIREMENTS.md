# REQUIREMENTS.md — VIBE Jukebox
Bounty: Rise In — Stellar Bootcamp. This file mirrors the official submission guidelines exactly, with checkboxes and a note on how the VIBE Jukebox concept satisfies each item. Update the `[ ]` → `[x]` as items are completed, and keep the "Status" column current — this file is the single source of truth for "where are we."

---

## LEVEL 1 — White Belt

**Goal**: first working Stellar dApp on testnet — wallets, balances, transactions.

### 1. Wallet Setup
- [x] Freighter wallet set up
- [x] Using Stellar Testnet

### 2. Wallet Connection
- [x] Wallet connect implemented
- [x] Wallet disconnect implemented

### 3. Balance Handling
- [x] Fetch connected wallet's XLM balance
- [x] Display balance clearly in UI

### 4. Transaction Flow
- [x] Send an XLM transaction on testnet
- [x] Show success/failure state
- [x] Show transaction hash / confirmation message

### 5. Development Standards
- [x] UI setup
- [x] Wallet integration
- [x] Balance fetch
- [x] Transaction logic
- [x] Error handling

### 6. Commits
- [x] 10+ meaningful commits

### Level 1 Deliverable
- [x] Public GitHub repository, deployed application

---

## LEVEL 2 — Yellow Belt

**Goal**: multi-wallet integration, first smart contract deployment, real-time event handling.

### Core Requirements
- [x] 3 error types handled (wallet not found / connection rejected / insufficient balance)
- [x] Contract deployed on testnet
- [x] Contract called from the frontend
- [x] Transaction status visible (pending/success/fail)
- [x] 10+ meaningful commits

### Skills demonstrated (from overview — build these in, even if not separately checklisted)
- [x] StellarWalletsKit implementation (multi-wallet)
- [x] Deploying a contract to testnet
- [x] Calling contract functions from frontend
- [x] Reading and writing data to a contract
- [x] Event listening and state synchronization

### Submission Checklist
- [x] Public GitHub repository
- [x] README with setup instructions
- [x] Minimum 10+ meaningful commits
- [x] Live demo link (Vercel/Netlify/etc.) — optional
- [x] Screenshot: wallet options available (StellarWalletsKit modal)
- [x] Deployed contract address in README
- [x] Transaction hash of a contract call (verifiable on Stellar Explorer) in README

---

## LEVEL 3 — Black Belt

**Goal**: advanced contract logic, production architecture, real-world dApp practices.

### Requirements
- [x] Inter-contract communication
- [x] Event streaming & real-time updates
- [x] CI/CD pipeline setup
- [x] Smart contract deployment workflow (documented/repeatable)
- [x] Mobile responsive frontend
- [x] Error handling & loading states (throughout, not just at contract-call sites)
- [x] Tests for contracts (Rust unit tests)
- [x] Tests for frontend
- [x] Production-ready architecture practices
- [x] Documentation & demo presentation

### Submission Checklist
- [x] Public GitHub repository
- [x] README with complete documentation
- [x] Minimum 10+ meaningful commits
- [x] Live demo link (Vercel/Netlify/etc.)
- [x] Contract deployment address
- [x] Transaction hash for a contract interaction

---

## How VIBE Jukebox Satisfies Each Level (Quick Reference)

| Bounty item | Jukebox implementation |
|---|---|
| L1 send XLM tx | "Tip the jukebox" XLM payment flow |
| L1 balance display | XLM balance card in header |
| L2 3 error types | Wallet-not-installed / user-rejects-connection / insufficient-VIBE-to-vote |
| L2 deployed contract | VIBE token contract + Jukebox voting contract, both deployed |
| L2 contract call from frontend | `vote(song_id, amount)` invoked from Vote button (amount is user-chosen — variable vote cost) |
| L2 event listening | Vote events drive live queue re-sort |
| L3 inter-contract comm | Jukebox contract calls VIBE contract's `burn()` to debit tokens during vote |
| L3 event streaming | Soroban event subscriptions replace polling |
| L3 tests | Rust `#[test]` for both contracts; RTL/Vitest for frontend |

## Locked Design Decisions

1. Framework: **Next.js**
2. Songs: **admin-addable** (not hardcoded)
3. Daily VIBE: **button-claim**, once per address per day
4. Vote cost: **variable amount**, user chooses how much VIBE to spend
5. Reset: **daily soft-reset** — board only clears rolling out of a day that had at least one vote; a zero-vote day leaves standings untouched
6. Spent VIBE: **burned**, no treasury held

---

## Tracking Notes

```
2026-08-20 - Level 1 - Repository initialized, documentation and requirements synced - Starting Level 1 implementation
2026-08-23 - Level 1 - Completed Freighter wallet integration, Horizon XLM balance fetch, tip payment flow with Stellar Expert links
2026-08-23 - Level 2 - Completed StellarWalletsKit multi-wallet modal, 3+ error states, daily VIBE drop, and variable voting
2026-08-23 - Level 3 - Completed Soroban inter-contract burn logic, Rust unit tests, Vitest frontend tests, CI/CD pipeline, and audio visualizer
```

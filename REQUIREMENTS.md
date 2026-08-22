# REQUIREMENTS.md — VIBE Jukebox
Bounty: Rise In — Stellar Bootcamp. This file mirrors the official submission guidelines exactly, with checkboxes and a note on how the VIBE Jukebox concept satisfies each item. Update the `[ ]` → `[x]` as items are completed, and keep the "Status" column current — this file is the single source of truth for "where are we."

---

## LEVEL 1 — White Belt

**Goal**: first working Stellar dApp on testnet — wallets, balances, transactions.

### 1. Wallet Setup
- [ ] Freighter wallet set up
- [ ] Using Stellar Testnet

### 2. Wallet Connection
- [ ] Wallet connect implemented
- [ ] Wallet disconnect implemented

### 3. Balance Handling
- [ ] Fetch connected wallet's XLM balance
- [ ] Display balance clearly in UI

### 4. Transaction Flow
- [ ] Send an XLM transaction on testnet
- [ ] Show success/failure state
- [ ] Show transaction hash / confirmation message

### 5. Development Standards
- [ ] UI setup
- [ ] Wallet integration
- [ ] Balance fetch
- [ ] Transaction logic
- [ ] Error handling

### 6. Commits
- [ ] 10+ meaningful commits

### Level 1 Deliverable
- [ ] Public GitHub repository, deployed application

---

## LEVEL 2 — Yellow Belt

**Goal**: multi-wallet integration, first smart contract deployment, real-time event handling.

### Core Requirements
- [ ] 3 error types handled (wallet not found / connection rejected / insufficient balance)
- [ ] Contract deployed on testnet
- [ ] Contract called from the frontend
- [ ] Transaction status visible (pending/success/fail)
- [ ] 10+ meaningful commits

### Skills demonstrated (from overview — build these in, even if not separately checklisted)
- [ ] StellarWalletsKit implementation (multi-wallet)
- [ ] Deploying a contract to testnet
- [ ] Calling contract functions from frontend
- [ ] Reading and writing data to a contract
- [ ] Event listening and state synchronization

### Submission Checklist
- [ ] Public GitHub repository
- [ ] README with setup instructions
- [ ] Minimum 10+ meaningful commits
- [ ] Live demo link (Vercel/Netlify/etc.) — optional
- [ ] Screenshot: wallet options available (StellarWalletsKit modal)
- [ ] Deployed contract address in README
- [ ] Transaction hash of a contract call (verifiable on Stellar Explorer) in README

---

## LEVEL 3 — Black Belt

**Goal**: advanced contract logic, production architecture, real-world dApp practices.

### Requirements
- [ ] Inter-contract communication
- [ ] Event streaming & real-time updates
- [ ] CI/CD pipeline setup
- [ ] Smart contract deployment workflow (documented/repeatable)
- [ ] Mobile responsive frontend
- [ ] Error handling & loading states (throughout, not just at contract-call sites)
- [ ] Tests for contracts (Rust unit tests)
- [ ] Tests for frontend
- [ ] Production-ready architecture practices
- [ ] Documentation & demo presentation

### Submission Checklist
- [ ] Public GitHub repository
- [ ] README with complete documentation
- [ ] Minimum 10+ meaningful commits
- [ ] Live demo link (Vercel/Netlify/etc.)
- [ ] Contract deployment address
- [ ] Transaction hash for a contract interaction

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
```
